import os
import json
import zipfile
import shutil
from datetime import datetime
from pathlib import Path
from typing import List
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from models import UploadDeploymentResponse, FormDeploymentResult, DeploymentManifest
from database import upsert_custom_form, test_connection

load_dotenv()

app = FastAPI(
    title="Bizuit Custom Forms Deployment API",
    description="API para cargar deployment packages de forms dinámicos",
    version="1.0.0"
)

# CORS configuration
cors_origins = os.getenv("CORS_ORIGINS", "*").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins if cors_origins != ["*"] else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuration
MAX_UPLOAD_SIZE_MB = int(os.getenv("MAX_UPLOAD_SIZE_MB", "50"))
MAX_UPLOAD_SIZE_BYTES = MAX_UPLOAD_SIZE_MB * 1024 * 1024
TEMP_UPLOAD_PATH = os.getenv("TEMP_UPLOAD_PATH", "./temp-uploads")

# Ensure temp directory exists
Path(TEMP_UPLOAD_PATH).mkdir(parents=True, exist_ok=True)


@app.get("/")
def root():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "Bizuit Custom Forms Deployment API",
        "timestamp": datetime.utcnow().isoformat()
    }


@app.get("/health")
def health_check():
    """Health check with DB connection test"""
    db_status = test_connection()
    return {
        "status": "healthy" if db_status["success"] else "degraded",
        "database": db_status,
        "timestamp": datetime.utcnow().isoformat()
    }


@app.get("/api/custom-forms")
def get_custom_forms():
    """
    Get list of all custom forms from SQL Server

    Returns forms from vw_CustomFormsCurrentVersion view
    """
    from database import get_all_custom_forms

    try:
        forms = get_all_custom_forms()
        print(f"[Forms API] Returning {len(forms)} forms")
        return forms
    except Exception as e:
        print(f"[Forms API] Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch forms: {str(e)}")


@app.get("/api/custom-forms/{form_name}/code")
def get_form_compiled_code(form_name: str, version: str = None):
    """
    Get compiled code for a specific form

    Returns JavaScript code from CustomFormVersions.CompiledCode
    """
    from database import get_form_compiled_code
    from fastapi.responses import Response

    try:
        result = get_form_compiled_code(form_name, version)

        if not result:
            raise HTTPException(status_code=404, detail=f"Form '{form_name}' not found")

        print(f"[Form Code API] Serving {form_name}@{result['version']} ({result['size_bytes']} bytes)")

        return Response(
            content=result['compiled_code'],
            media_type='application/javascript; charset=utf-8',
            headers={
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'X-Form-Version': result['version'],
                'X-Published-At': result['published_at'],
                'X-Size-Bytes': str(result['size_bytes']),
            }
        )
    except HTTPException:
        raise
    except Exception as e:
        print(f"[Form Code API] Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch form code: {str(e)}")


@app.post("/api/deployment/upload", response_model=UploadDeploymentResponse)
async def upload_deployment_package(file: UploadFile = File(...)):
    """
    Upload deployment package (.zip) generado por GitHub Actions

    El .zip debe contener:
    - manifest.json (metadata del package)
    - forms/*.js (código compilado de cada form)
    """

    # Validaciones
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file uploaded")

    if not file.filename.endswith('.zip'):
        raise HTTPException(status_code=400, detail="Only .zip files are allowed")

    # Read file content
    content = await file.read()
    file_size = len(content)

    if file_size > MAX_UPLOAD_SIZE_BYTES:
        raise HTTPException(
            status_code=400,
            detail=f"File size exceeds maximum allowed size of {MAX_UPLOAD_SIZE_MB} MB"
        )

    print(f"[Deployment API] Received upload: {file.filename} ({file_size} bytes)")

    # Crear directorio temporal para este deployment
    temp_dir = Path(TEMP_UPLOAD_PATH) / f"deployment_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
    temp_dir.mkdir(parents=True, exist_ok=True)

    response = UploadDeploymentResponse(
        success=False,
        message="",
        formsProcessed=0,
        formsInserted=0,
        formsUpdated=0,
        errors=[],
        results=[]
    )

    try:
        # Guardar .zip temporalmente
        zip_path = temp_dir / file.filename
        with open(zip_path, "wb") as f:
            f.write(content)

        # Extraer .zip
        extract_dir = temp_dir / "extracted"
        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
            zip_ref.extractall(extract_dir)

        print(f"[Deployment API] Extracted to: {extract_dir}")

        # DEBUG: List all extracted files
        all_files = list(extract_dir.glob('**/*'))
        print(f"[Deployment API] Extracted files ({len(all_files)}):")
        for file_path in all_files:
            rel_path = file_path.relative_to(extract_dir)
            print(f"  - {rel_path} {'[DIR]' if file_path.is_dir() else f'[{file_path.stat().st_size} bytes]'}")

        # Leer manifest.json
        manifest_path = extract_dir / "manifest.json"
        print(f"[Deployment API] Looking for manifest at: {manifest_path}")
        print(f"[Deployment API] Manifest exists: {manifest_path.exists()}")
        if not manifest_path.exists():
            raise Exception("manifest.json not found in deployment package")

        with open(manifest_path, 'r', encoding='utf-8') as f:
            manifest_data = json.load(f)
            manifest = DeploymentManifest(**manifest_data)

        print(f"[Deployment API] Package version: {manifest.packageVersion}")
        print(f"[Deployment API] Forms to process: {len(manifest.forms)}")

        response.formsProcessed = len(manifest.forms)

        # Procesar cada form
        for form_info in manifest.forms:
            result = await process_form(form_info, extract_dir, manifest)
            response.results.append(result)

            if result.success:
                if result.action == "inserted":
                    response.formsInserted += 1
                elif result.action == "updated":
                    response.formsUpdated += 1
            else:
                response.errors.append(f"{form_info.formName}: {result.error}")

        # Resultado final
        response.success = len(response.errors) == 0
        response.message = (
            f"Deployment successful: {response.formsInserted} inserted, {response.formsUpdated} updated"
            if response.success
            else f"Deployment completed with errors: {len(response.errors)} failed"
        )

        print(f"[Deployment API] {response.message}")

    except Exception as e:
        print(f"[Deployment API] Error: {str(e)}")
        response.success = False
        response.message = f"Deployment failed: {str(e)}"
        response.errors.append(str(e))

    finally:
        # Cleanup: eliminar directorio temporal
        try:
            shutil.rmtree(temp_dir)
            print(f"[Deployment API] Cleaned up temp directory: {temp_dir}")
        except Exception as e:
            print(f"[Deployment API] Warning: Failed to cleanup {temp_dir}: {e}")

    print(f"[Deployment API] Returning response: {response.model_dump_json()}")
    return response


async def process_form(form_info, extract_dir: Path, manifest: DeploymentManifest) -> FormDeploymentResult:
    """
    Procesa un form individual del deployment package
    """
    result = FormDeploymentResult(
        formName=form_info.formName,
        success=False,
        action="failed",
        error=None
    )

    try:
        # Leer código compilado
        form_code_path = extract_dir / form_info.path
        if not form_code_path.exists():
            raise Exception(f"Form file not found: {form_info.path}")

        with open(form_code_path, 'r', encoding='utf-8') as f:
            compiled_code = f.read()

        print(f"[Deployment API] Processing form: {form_info.formName} ({len(compiled_code)} bytes)")

        # Guardar en BD usando stored procedure
        db_result = upsert_custom_form(
            form_name=form_info.formName,
            process_name=form_info.processName,
            version=form_info.version,
            description=form_info.description,
            author=form_info.author,
            compiled_code=compiled_code,
            size_bytes=len(compiled_code),
            package_version=manifest.packageVersion,
            commit_hash=manifest.commitHash,
            build_date=manifest.buildDate  # Pass datetime object directly
        )

        result.success = db_result["success"]
        result.action = db_result["action"]

        print(f"[Deployment API] Form {form_info.formName} {result.action} successfully")

    except Exception as e:
        print(f"[Deployment API] Error processing form {form_info.formName}: {str(e)}")
        result.success = False
        result.action = "failed"
        result.error = str(e)

    return result


if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("API_PORT", "8000"))
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=True,
        log_level="info"
    )
