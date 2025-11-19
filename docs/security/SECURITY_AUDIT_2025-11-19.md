# Reporte de Análisis de Seguridad - BizuitFormTemplate

**Fecha:** 2025-11-19
**Versión del Código:** dev/main branch
**Metodología:** OWASP Top 10 2021, Manual Code Review, Threat Modeling
**Analista:** Claude (Anthropic)

---

## Resumen Ejecutivo

Se realizó un análisis exhaustivo de seguridad del proyecto BizuitFormTemplate, que incluye dos aplicaciones Next.js (custom-forms-showcase en puerto 3000 y runtime-app en puerto 3001) y un backend FastAPI (backend-api en puerto 8000). Se identificaron **11 vulnerabilidades** que van desde severidad ALTA a MEDIA, con vectores de ataque concretos en autenticación, validación de inputs, configuración de APIs y manejo de secretos.

**Estadísticas:**
- **Vulnerabilidades de severidad ALTA:** 6
- **Vulnerabilidades de severidad MEDIA:** 5
- **Archivos críticos analizados:** 50+
- **Líneas de código revisadas:** ~5,000+

**Riesgo Actual:** 🔴 **ALTO** - No apto para producción sin remediation
**Riesgo Post-Remediation (P0-P1):** 🟡 **MEDIO-BAJO** - Aceptable para producción con monitoreo

---

## Vulnerabilidades Identificadas

### 1. CREDENCIALES HARDCODEADAS EN .env.example

**Archivo:** `custom-forms/backend-api/.env.example`
**Líneas:** 6-9, 15-17, 35
**Severidad:** 🔴 ALTA
**Categoría:** Information Disclosure / Hardcoded Credentials
**Prioridad:** 🔴 P0

**Descripción Técnica:**

El archivo `.env.example` contiene credenciales reales de base de datos SQL Server y una clave de encriptación hardcodeada:

```bash
# Líneas 6-9
DB_SERVER=test.bizuit.com
DB_DATABASE=arielschBIZUITDashboard
DB_USER=BIZUITarielsch
DB_PASSWORD=Th3Qu33n1sD34d$

# Líneas 15-17
PERSISTENCE_DB_SERVER=test.bizuit.com
PERSISTENCE_DB_DATABASE=arielschBIZUITPersistenceStore
PERSISTENCE_DB_USER=BIZUITarielsch
PERSISTENCE_DB_PASSWORD=Th3Qu33n1sD34d$
```

**Escenario de Explotación:**

1. Atacante clona el repositorio público o accede al código fuente
2. Obtiene credenciales de base de datos de producción desde `.env.example`
3. Conecta directamente a `test.bizuit.com` con las credenciales expuestas
4. Accede a tablas sensibles (Users, Roles, SecurityTokens, CustomForms)
5. Puede exfiltrar datos de usuarios, tokens de sesión, o modificar formularios

**Recomendación de Fix:**

```bash
# .env.example - SEGURO
DB_SERVER=your-sql-server.database.windows.net
DB_DATABASE=YourDatabaseName
DB_USER=YourDatabaseUser
DB_PASSWORD=YourSecurePassword

PERSISTENCE_DB_SERVER=your-sql-server.database.windows.net
PERSISTENCE_DB_DATABASE=YourPersistenceDatabaseName
PERSISTENCE_DB_USER=YourDatabaseUser
PERSISTENCE_DB_PASSWORD=YourSecurePassword
```

**Acciones Requeridas:**
- [ ] Regenerar credenciales de base de datos en test.bizuit.com
- [ ] Actualizar `.env.example` con valores de ejemplo genéricos
- [ ] Rotar passwords actuales si están en uso
- [ ] Auditar repositorio completo con `git-secrets`

---

### 2. CLAVE DE ENCRIPTACIÓN HARDCODEADA (TRIPLEDES)

**Archivo:** `custom-forms/backend-api/crypto.py`
**Línea:** 14
**Severidad:** 🔴 ALTA
**Categoría:** Cryptographic Failure
**Prioridad:** 🔴 P0

**Descripción Técnica:**

La clave TripleDES para desencriptar tokens del Dashboard está hardcodeada en el código fuente:

```python
ENCRYPTION_TOKEN_KEY = "Vq2ixrmV6oUGhQfIPWiCBk0S"
```

Esta clave se usa para desencriptar el parámetro `s` enviado desde Bizuit Dashboard, que contiene el TokenId para validar acceso a formularios.

**Escenario de Explotación:**

1. Atacante obtiene la clave del repositorio
2. Intercepta el parámetro `s` de una URL del Dashboard (ej: `?s=aAAV/9xqhAE=`)
3. Desencripta localmente para obtener el TokenId
4. Puede crear tokens válidos falsificados usando la misma clave
5. Bypass completo de autenticación del Dashboard

**Recomendación de Fix:**

```python
# crypto.py
import os

ENCRYPTION_TOKEN_KEY = os.getenv("ENCRYPTION_TOKEN_KEY")
if not ENCRYPTION_TOKEN_KEY:
    raise ValueError("ENCRYPTION_TOKEN_KEY environment variable is required")

if len(ENCRYPTION_TOKEN_KEY) != 24:
    raise ValueError("ENCRYPTION_TOKEN_KEY must be exactly 24 characters for TripleDES")
```

```bash
# .env
ENCRYPTION_TOKEN_KEY=nueva-clave-secreta-aleatoria-24-chars

# Generar clave aleatoria de 24 caracteres
openssl rand -base64 24 | cut -c1-24
```

**Acciones Requeridas:**
- [ ] Generar nueva clave TripleDES aleatoria
- [ ] Mover clave a variable de entorno
- [ ] Coordinar con equipo de Bizuit Dashboard para actualizar clave en su lado
- [ ] Invalidar tokens generados con clave anterior

---

### 3. SQL INJECTION VÍA PARÁMETROS NO SANITIZADOS

**Archivo:** `custom-forms/backend-api/database.py`
**Líneas:** 82-105, 307-315, 359-365, 411-424, 480-481
**Severidad:** 🔴 ALTA
**Categoría:** SQL Injection
**Prioridad:** 🟠 P1

**Descripción Técnica:**

Aunque se usan queries parametrizadas con `?`, algunos parámetros provienen de inputs de usuario sin validación previa. Específicamente:

1. **`form_name` sin validación** (líneas 235-258):
```python
query = """
SELECT cfv.CompiledCode, cfv.Version, cfv.PublishedAt, cfv.SizeBytes
FROM CustomFormVersions cfv
INNER JOIN CustomForms cf ON cfv.FormId = cf.FormId
WHERE cf.FormName = ? AND cfv.IsCurrent = 1
"""
cursor.execute(query, (form_name,))  # form_name viene directo del request
```

2. **`username` sin validación** (línea 365):
```python
cursor.execute(query, (username,))  # username viene del login form
```

**Escenario de Explotación:**

Si bien pyodbc hace escaping automático, un atacante podría intentar:

1. Enviar `form_name` = `'; DROP TABLE CustomForms; --`
2. Aunque pyodbc escapa, nombres de formularios no se validan contra whitelist
3. Posibles ataques de enumeración o timing attacks
4. Si hay bugs en pyodbc, podría haber bypass

**Recomendación de Fix:**

```python
import re
from typing import Optional

def validate_form_name(form_name: str) -> bool:
    """Valida que form_name solo contenga caracteres seguros"""
    if not form_name or len(form_name) > 100:
        return False
    # Solo alfanuméricos, guiones, underscore
    return bool(re.match(r'^[a-zA-Z0-9_-]+$', form_name))

def validate_username(username: str) -> bool:
    """Valida que username solo contenga caracteres seguros"""
    if not username or len(username) > 100:
        return False
    # Alfanuméricos, puntos, guiones, arroba
    return bool(re.match(r'^[a-zA-Z0-9._@-]+$', username))

def validate_version(version: str) -> bool:
    """Valida formato semver"""
    return bool(re.match(r'^\d+\.\d+\.\d+$', version))

def get_form_compiled_code(form_name: str, version: Optional[str] = None):
    if not validate_form_name(form_name):
        raise ValueError("Invalid form name format")

    if version and not validate_version(version):
        raise ValueError("Invalid version format")

    # Resto del código...

def verify_admin_user(username: str, password_hash: str) -> Optional[dict]:
    if not validate_username(username):
        raise ValueError("Invalid username format")

    # Resto del código...
```

**Acciones Requeridas:**
- [ ] Implementar funciones de validación de inputs
- [ ] Aplicar validación en todos los métodos de database.py
- [ ] Agregar tests unitarios para validación
- [ ] Documentar formatos permitidos en API docs

---

### 4. CORS ABIERTO CON WILDCARD (*)

**Archivo:** `custom-forms/backend-api/main.py`
**Líneas:** 109-117
**Severidad:** 🔴 ALTA
**Categoría:** CORS Misconfiguration
**Prioridad:** 🔴 P0

**Descripción Técnica:**

El backend FastAPI permite CORS con wildcard `*` por defecto si `CORS_ORIGINS` no está configurado:

```python
# Líneas 109-117
cors_origins = os.getenv("CORS_ORIGINS", "*").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins if cors_origins != ["*"] else ["*"],
    allow_credentials=True,  # ❌ PELIGROSO con allow_origins=["*"]
    allow_methods=["*"],
    allow_headers=["*"],
)
```

**El problema crítico:** `allow_credentials=True` + `allow_origins=["*"]` es una configuración inválida y peligrosa según las especificaciones CORS.

**Escenario de Explotación:**

1. Sitio malicioso `evil.com` hace request a `http://127.0.0.1:8000/api/auth/login`
2. Navegador del usuario envía cookies (porque `credentials=True`)
3. Backend responde con `Access-Control-Allow-Origin: *`
4. Atacante obtiene respuesta con tokens/datos sensibles
5. Puede hacer requests autenticados en nombre del usuario

**Recomendación de Fix:**

```python
# main.py
import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

# Validar que CORS_ORIGINS esté configurado
cors_origins_str = os.getenv("CORS_ORIGINS")
if not cors_origins_str:
    raise ValueError(
        "CORS_ORIGINS must be explicitly configured in .env. "
        "Example: CORS_ORIGINS=http://localhost:3000,http://localhost:3001"
    )

cors_origins = [origin.strip() for origin in cors_origins_str.split(",")]

# Validar que no sea wildcard
if "*" in cors_origins:
    raise ValueError(
        "CORS_ORIGINS cannot contain wildcard '*' when allow_credentials=True. "
        "Specify explicit origins."
    )

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,  # Lista explícita, NO wildcard
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],  # Específico
    allow_headers=["Content-Type", "Authorization", "X-Requested-With"],  # Específico
)
```

```bash
# .env
CORS_ORIGINS=http://localhost:3001,http://localhost:3000,https://production.bizuit.com
```

**Acciones Requeridas:**
- [ ] Configurar CORS_ORIGINS explícitamente en .env
- [ ] Remover wildcard y fallback inseguro
- [ ] Restringir métodos y headers permitidos
- [ ] Probar que aplicaciones frontend siguen funcionando

---

### 5. NEXT.JS PROXY SIN VALIDACIÓN DE PATH (SSRF)

**Archivos:**
- `custom-forms-showcase/app/api/bizuit/[...path]/route.ts`
- `custom-forms/runtime-app/app/api/bizuit/[...path]/route.ts`

**Líneas:** 45-48 (showcase), 49-52 (runtime-app)
**Severidad:** 🔴 ALTA
**Categoría:** Server-Side Request Forgery (SSRF)
**Prioridad:** 🟠 P1

**Descripción Técnica:**

El proxy de Next.js construye URLs dinámicamente sin validar el path:

```typescript
// Líneas 45-48 (showcase)
const path = params.path.join('/')
const url = new URL(request.url)
const queryString = url.search
const targetUrl = `${BIZUIT_API_BASE}/${path}${queryString}`  // ❌ No valida path
```

**Escenario de Explotación:**

1. Atacante envía request a `/api/bizuit/../../../etc/passwd`
2. Path traversal concatena con `BIZUIT_API_BASE`
3. Podría acceder a endpoints internos no expuestos
4. O hacer requests a `localhost:8000/admin` bypassing auth

**Recomendación de Fix:**

```typescript
// route.ts
function validatePath(pathSegments: string[]): boolean {
  // NO permitir path traversal
  if (pathSegments.some(seg => seg.includes('..') || seg.includes('~') || seg.includes('\\'))) {
    return false
  }

  // NO permitir paths vacíos
  if (pathSegments.some(seg => !seg || seg.trim() === '')) {
    return false
  }

  // Whitelist de paths permitidos del Bizuit API
  const allowedPrefixes = [
    'forms',
    'dashboard',
    'Login',
    'ProcessDefinition',
    'EventManager',
    'WorkflowDefinition',
    'ProcessInstance',
    'Users'
  ]

  return allowedPrefixes.some(prefix =>
    pathSegments[0]?.toLowerCase().startsWith(prefix.toLowerCase())
  )
}

async function handleRequest(
  request: NextRequest,
  params: { path: string[] },
  method: string
) {
  // Validar path antes de hacer proxy
  if (!validatePath(params.path)) {
    console.warn(`[Bizuit Proxy] Invalid path rejected: ${params.path.join('/')}`)
    return NextResponse.json(
      { error: 'Invalid API path' },
      { status: 400 }
    )
  }

  const path = params.path.join('/')
  const url = new URL(request.url)
  const queryString = url.search
  const targetUrl = `${BIZUIT_API_BASE}/${path}${queryString}`

  // ... resto del código
}
```

**Acciones Requeridas:**
- [ ] Implementar validación de paths en ambos proxies
- [ ] Definir whitelist de endpoints permitidos
- [ ] Agregar logging de intentos de path traversal
- [ ] Probar que rutas válidas siguen funcionando

---

### 6. WEBHOOK SECRET DÉBIL Y VERIFICACIÓN INSEGURA

**Archivo:** `custom-forms/runtime-app/app/api/forms/reload/route.ts`
**Líneas:** 15-25, 120
**Severidad:** 🟡 MEDIA
**Categoría:** Authentication Bypass
**Prioridad:** 🟡 P2

**Descripción Técnica:**

El webhook usa comparación de strings simple y un secret por defecto débil:

```typescript
// Líneas 15-25
function verifyWebhookSecret(request: NextRequest): boolean {
  const secret = request.headers.get('x-webhook-secret')
  const expectedSecret = process.env.WEBHOOK_SECRET

  if (!expectedSecret) {
    console.warn('[Webhook] WEBHOOK_SECRET not configured')
    return false  // ❌ Falla abierto - debería rechazar
  }

  return secret === expectedSecret  // ❌ Vulnerable a timing attacks
}
```

**Problemas:**
1. Comparación vulnerable a timing attacks
2. Secret por defecto es débil en .env.example
3. También acepta secret por query param (línea 120)

**Escenario de Explotación:**

1. Atacante hace timing attack para descubrir el secret
2. O usa secret por defecto si no se cambió
3. Llama `/api/forms/reload` con secret válido
4. Puede limpiar cache de formularios causando degradación de servicio

**Recomendación de Fix:**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { timingSafeEqual } from 'crypto'

function verifyWebhookSecret(request: NextRequest): boolean {
  const secret = request.headers.get('x-webhook-secret')
  const expectedSecret = process.env.WEBHOOK_SECRET

  // Rechazar si no está configurado o es el valor por defecto
  if (!expectedSecret || expectedSecret === 'your-webhook-secret-here-change-in-production') {
    throw new Error('WEBHOOK_SECRET must be configured with a strong random value')
  }

  if (!secret) return false

  // Timing-safe comparison para prevenir timing attacks
  try {
    const secretBuf = Buffer.from(secret, 'utf-8')
    const expectedBuf = Buffer.from(expectedSecret, 'utf-8')

    if (secretBuf.length !== expectedBuf.length) return false

    return timingSafeEqual(secretBuf, expectedBuf)
  } catch (error) {
    return false
  }
}

// ELIMINAR endpoint GET que acepta secret por query param
// export async function GET(request: NextRequest) { // ❌ ELIMINAR ESTO
```

```bash
# .env
# Generar secret fuerte
WEBHOOK_SECRET=$(openssl rand -hex 32)
```

**Acciones Requeridas:**
- [ ] Implementar comparación timing-safe
- [ ] Generar webhook secret fuerte con openssl
- [ ] Eliminar endpoint GET que acepta secret por query
- [ ] Actualizar GitHub Actions workflows con nuevo secret

---

### 7. JWT SECRET POR DEFECTO DÉBIL

**Archivo:** `custom-forms/backend-api/auth_service.py`
**Línea:** 24
**Severidad:** 🔴 ALTA
**Categoría:** Weak Cryptographic Key
**Prioridad:** 🔴 P0

**Descripción Técnica:**

```python
# Línea 24
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "change-this-secret-key")
```

Si `JWT_SECRET_KEY` no está en `.env`, usa un valor por defecto predecible.

**Escenario de Explotación:**

1. Atacante descubre que el secret por defecto está activo
2. Genera tokens JWT válidos con cualquier payload usando PyJWT
3. Puede crear tokens de admin sin autenticarse
4. Bypass completo del sistema de autenticación

**Recomendación de Fix:**

```python
# auth_service.py
import os
import secrets

JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
if not JWT_SECRET_KEY or JWT_SECRET_KEY == "change-this-secret-key":
    raise ValueError(
        "JWT_SECRET_KEY must be set in .env with a cryptographically random value. "
        "Generate with: openssl rand -hex 32"
    )

# Validar longitud mínima (256 bits = 64 caracteres hex)
if len(JWT_SECRET_KEY) < 64:
    raise ValueError(
        "JWT_SECRET_KEY must be at least 64 characters (256 bits). "
        f"Current length: {len(JWT_SECRET_KEY)}"
    )
```

```bash
# .env
# Generar JWT secret de 256 bits
JWT_SECRET_KEY=$(openssl rand -hex 32)
```

**Acciones Requeridas:**
- [ ] Generar nuevo JWT_SECRET_KEY cryptográficamente seguro
- [ ] Forzar validación al startup de la aplicación
- [ ] Invalidar todos los tokens existentes (forzar re-login)
- [ ] Documentar proceso de rotación de secrets

---

### 8. FALTA DE VALIDACIÓN EN FILE UPLOAD

**Archivo:** `custom-forms/backend-api/main.py`
**Líneas:** 644-661, 677-706
**Severidad:** 🟡 MEDIA
**Categoría:** Unrestricted File Upload / Zip Slip
**Prioridad:** 🟠 P1

**Descripción Técnica:**

El endpoint de deployment valida extensión `.zip` pero no valida contenido:

```python
# Líneas 648-649
if not file.filename.endswith('.zip'):
    raise HTTPException(status_code=400, detail="Only .zip files are allowed")

# Líneas 683-686
with zipfile.ZipFile(zip_path, 'r') as zip_ref:
    zip_ref.extractall(extract_dir)  # ❌ Sin validación de paths
```

**Problemas:**
1. No valida contenido del ZIP (puede contener archivos maliciosos)
2. `extractall()` vulnerable a Zip Slip (path traversal)
3. No limita número de archivos en el ZIP
4. No valida estructura del manifest.json

**Escenario de Explotación:**

1. Atacante crea ZIP malicioso con paths como `../../etc/passwd` o `../../../app/main.py`
2. Upload mediante `/api/deployment/upload`
3. `extractall()` escribe archivos fuera del directorio temporal
4. Puede sobrescribir archivos del sistema o código de la aplicación

**Recomendación de Fix:**

```python
import os
import zipfile
from pathlib import Path
from typing import List

# Configuración
MAX_ZIP_FILES = 100
MAX_ZIP_SIZE_MB = 50
ALLOWED_EXTENSIONS = {'.json', '.js', '.js.map'}

def safe_extract(zip_file: zipfile.ZipFile, extract_dir: Path) -> List[str]:
    """
    Extrae ZIP validando que no hay path traversal (Zip Slip)

    Returns:
        Lista de archivos extraídos

    Raises:
        ValueError: Si se detecta path traversal, archivo inválido o límites excedidos
    """
    extract_dir = extract_dir.resolve()
    members = zip_file.namelist()

    # Validar número de archivos
    if len(members) > MAX_ZIP_FILES:
        raise ValueError(f"Zip contains too many files. Max: {MAX_ZIP_FILES}, Found: {len(members)}")

    # Validar tamaño total
    total_size = sum(zinfo.file_size for zinfo in zip_file.filelist)
    max_size_bytes = MAX_ZIP_SIZE_MB * 1024 * 1024
    if total_size > max_size_bytes:
        raise ValueError(f"Zip too large. Max: {MAX_ZIP_SIZE_MB}MB, Found: {total_size / 1024 / 1024:.2f}MB")

    extracted_files = []

    for member in members:
        # Validar que el path no sale del directorio
        member_path = (extract_dir / member).resolve()

        if not str(member_path).startswith(str(extract_dir)):
            raise ValueError(f"Zip Slip attempt detected: {member}")

        # Validar extensiones permitidas
        file_ext = Path(member).suffix
        if file_ext not in ALLOWED_EXTENSIONS:
            raise ValueError(f"Invalid file type in zip: {member} (extension: {file_ext})")

        # Validar nombres de archivo (no caracteres peligrosos)
        if any(char in member for char in ['..', '~', '\\']):
            raise ValueError(f"Invalid characters in filename: {member}")

        extracted_files.append(member)

    # Si todas las validaciones pasaron, extraer
    zip_file.extractall(extract_dir)

    return extracted_files

# En el endpoint de upload, reemplazar extractall() con safe_extract()
@app.post("/api/deployment/upload")
async def upload_deployment_package(
    file: UploadFile = File(...),
    token: str = Depends(verify_admin_token)
):
    # ... código existente ...

    try:
        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
            # Usar safe_extract en vez de extractall
            extracted_files = safe_extract(zip_ref, extract_dir)
            print(f"[Deployment] Extracted {len(extracted_files)} files safely")

            # ... resto del código ...
    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Invalid zip file: {str(e)}")
```

**Acciones Requeridas:**
- [ ] Implementar función safe_extract con validaciones
- [ ] Configurar límites de tamaño y número de archivos
- [ ] Validar estructura esperada del manifest.json
- [ ] Agregar tests con ZIPs maliciosos para verificar protección

---

### 9. FALTA DE RATE LIMITING EN ENDPOINTS SENSIBLES

**Archivos:**
- `custom-forms/backend-api/main.py`
- `custom-forms/runtime-app/app/api/auth/login/route.ts`

**Severidad:** 🟡 MEDIA
**Categoría:** Brute Force / Account Enumeration
**Prioridad:** 🟡 P2

**Descripción Técnica:**

No hay rate limiting en endpoints críticos:
- `/api/auth/login` (main.py línea 198)
- `/api/auth/login` (Next.js route.ts línea 12)
- `/api/forms/validate-token` (main.py línea 359)

**Escenario de Explotación:**

1. Atacante hace brute force de contraseñas en `/api/auth/login`
2. Sin rate limit, puede probar miles de combinaciones/segundo
3. O hacer DoS enviando requests masivas
4. Puede enumerar usuarios válidos por timing differences en respuestas

**Recomendación de Fix:**

```python
# requirements.txt
slowapi==0.1.9

# main.py
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

# Configurar limiter
limiter = Limiter(key_func=get_remote_address, default_limits=["200/hour"])
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Aplicar rate limiting a endpoints sensibles
@app.post("/api/auth/login")
@limiter.limit("5/minute")  # 5 intentos de login por minuto por IP
async def admin_login(request: Request, credentials: AdminLoginRequest):
    # ... código existente ...

@app.post("/api/dashboard/validate-token")
@limiter.limit("20/minute")  # 20 validaciones por minuto por IP
async def validate_dashboard_token_endpoint(request: ValidateDashboardTokenRequest):
    # ... código existente ...

@app.post("/api/forms/validate-token")
@limiter.limit("30/minute")  # 30 validaciones por minuto por IP
async def validate_form_token(request: Request, token_request: ValidateTokenRequest):
    # ... código existente ...
```

**Para Next.js (alternativa con middleware):**

```typescript
// middleware.ts (crear en root de runtime-app)
import { NextRequest, NextResponse } from 'next/server'
import { RateLimiter } from 'limiter'

const limiters = new Map<string, RateLimiter>()

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname === '/api/auth/login') {
    const ip = request.ip ?? 'unknown'

    if (!limiters.has(ip)) {
      // 5 requests por minuto
      limiters.set(ip, new RateLimiter({ tokensPerInterval: 5, interval: 'minute' }))
    }

    const limiter = limiters.get(ip)!

    if (!limiter.tryRemoveTokens(1)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      )
    }
  }

  return NextResponse.next()
}
```

**Acciones Requeridas:**
- [ ] Instalar slowapi en backend FastAPI
- [ ] Configurar rate limits apropiados por endpoint
- [ ] Considerar rate limiting por usuario además de por IP
- [ ] Implementar rate limiting en Next.js para /api/auth/login
- [ ] Monitorear métricas de rate limiting en producción

---

### 10. INFORMACIÓN SENSIBLE EN LOGS

**Archivos:** Múltiples
**Severidad:** 🟡 MEDIA
**Categoría:** Information Disclosure
**Prioridad:** 🟡 P3

**Descripción Técnica:**

Se loguean datos sensibles en consola:

```python
# main.py línea 225
print(f"[Auth API] Login attempt for user '{credentials.username}'")

# custom-forms-showcase/app/api/bizuit/[...path]/route.ts
console.log(`[Bizuit Proxy] Headers being sent:`, {
    authorization: headers['Authorization'] || 'NOT PRESENT',  // ❌ Token visible
})
```

**Escenario de Explotación:**

1. Logs guardados en archivo accesible por atacante (log aggregation, disk access)
2. Tokens de autenticación expuestos en logs
3. Usernames y patrones de acceso revelados
4. Información útil para social engineering

**Recomendación de Fix:**

```python
# utils/logging.py (crear nuevo archivo)
import re

def sanitize_for_logging(data: dict) -> dict:
    """Sanitiza datos sensibles antes de loguear"""
    sanitized = data.copy()

    sensitive_keys = ['password', 'token', 'secret', 'authorization', 'api_key']

    for key in sanitized:
        if any(sensitive in key.lower() for sensitive in sensitive_keys):
            sanitized[key] = '***REDACTED***'

    return sanitized

def redact_auth_header(header: str) -> str:
    """Redacta tokens de authorization header"""
    if not header:
        return 'NOT PRESENT'

    parts = header.split(' ')
    if len(parts) == 2:
        return f"{parts[0]} ***REDACTED***"

    return '***REDACTED***'

# main.py
from utils.logging import sanitize_for_logging

# En vez de loguear username directamente
print(f"[Auth API] Login attempt for user '{credentials.username[:3]}***'")  # Solo primeros 3 chars
```

```typescript
// custom-forms-showcase/app/api/bizuit/[...path]/route.ts
const sanitizeAuthHeader = (header: string | undefined) => {
  if (!header) return 'NOT PRESENT'
  const parts = header.split(' ')
  if (parts.length === 2) {
    return `${parts[0]} ***REDACTED***`
  }
  return '***REDACTED***'
}

console.log(`[Bizuit Proxy] Headers:`, {
  authorization: sanitizeAuthHeader(headers['Authorization']),
  'content-type': headers['Content-Type'],
  // ... otros headers no sensibles
})
```

**Acciones Requeridas:**
- [ ] Crear utilidades de sanitización de logs
- [ ] Redactar todos los tokens en logs
- [ ] Implementar niveles de logging (DEBUG, INFO, WARNING, ERROR)
- [ ] Configurar log rotation en producción
- [ ] Auditar todos los console.log y print existentes

---

### 11. FALTA DE VALIDACIÓN EN DASHBOARD TOKEN PARAMETERS

**Archivo:** `custom-forms/backend-api/main.py`
**Líneas:** 494-553
**Severidad:** 🟡 MEDIA
**Categoría:** Insufficient Input Validation
**Prioridad:** 🟡 P2

**Descripción Técnica:**

El endpoint `/api/dashboard/validate-token` acepta múltiples parámetros del query string sin validación:

```python
# Líneas 514-526
parameters = DashboardParameters(
    # From Dashboard query string - NO VALIDATED
    instanceId=request.instanceId,
    userName=request.userName,
    eventName=request.eventName,
    activityName=request.activityName,
    token=request.token,
    # ...
)
```

**Escenario de Explotación:**

1. Atacante modifica parámetros en URL del Dashboard
2. Envía `instanceId` malicioso o XSS payload en `userName`
3. Backend no valida ni sanitiza estos valores
4. Pueden ser reflejados en logs o UI causando XSS o log injection

**Recomendación de Fix:**

```python
import re
from fastapi import HTTPException

def validate_dashboard_params(request: ValidateDashboardTokenRequest):
    """Valida parámetros del Dashboard antes de procesarlos"""

    # Validar instanceId es numérico
    if request.instanceId:
        if not request.instanceId.isdigit():
            raise HTTPException(400, "Invalid instanceId format")
        if len(request.instanceId) > 20:
            raise HTTPException(400, "instanceId too long")

    # Validar userName no contiene caracteres peligrosos
    if request.userName:
        if not re.match(r'^[a-zA-Z0-9_@.\-]+$', request.userName):
            raise HTTPException(400, "Invalid userName format")
        if len(request.userName) > 100:
            raise HTTPException(400, "userName too long")

    # Validar eventName
    if request.eventName:
        if not re.match(r'^[a-zA-Z0-9_\-\s]+$', request.eventName):
            raise HTTPException(400, "Invalid eventName format")
        if len(request.eventName) > 100:
            raise HTTPException(400, "eventName too long")

    # Validar activityName
    if request.activityName:
        if not re.match(r'^[a-zA-Z0-9_\-\s]+$', request.activityName):
            raise HTTPException(400, "Invalid activityName format")
        if len(request.activityName) > 100:
            raise HTTPException(400, "activityName too long")

    # Validar format de token
    if request.token:
        if not re.match(r'^[a-zA-Z0-9+/=]+$', request.token):  # Base64
            raise HTTPException(400, "Invalid token format")
        if len(request.token) > 500:
            raise HTTPException(400, "token too long")

@app.post("/api/dashboard/validate-token")
async def validate_dashboard_token_endpoint(request: ValidateDashboardTokenRequest):
    # Validar parámetros PRIMERO
    validate_dashboard_params(request)

    # ... resto del código ...
```

**Acciones Requeridas:**
- [ ] Implementar validación de todos los parámetros del Dashboard
- [ ] Definir regex patterns para cada tipo de parámetro
- [ ] Agregar límites de longitud
- [ ] Documentar formatos esperados en OpenAPI docs

---

## Matriz de Riesgo

| # | Vulnerabilidad | Severidad | Explotabilidad | Impacto | Prioridad |
|---|----------------|-----------|----------------|---------|-----------|
| 1 | Credenciales Hardcodeadas | 🔴 ALTA | Fácil | Crítico | 🔴 P0 |
| 2 | Clave TripleDES Hardcodeada | 🔴 ALTA | Media | Alto | 🔴 P0 |
| 3 | SQL Injection (potencial) | 🔴 ALTA | Difícil | Alto | 🟠 P1 |
| 4 | CORS Wildcard + Credentials | 🔴 ALTA | Fácil | Alto | 🔴 P0 |
| 5 | SSRF en Next.js Proxy | 🔴 ALTA | Media | Alto | 🟠 P1 |
| 6 | Webhook Secret Débil | 🟡 MEDIA | Media | Medio | 🟡 P2 |
| 7 | JWT Secret por Defecto | 🔴 ALTA | Fácil | Crítico | 🔴 P0 |
| 8 | File Upload sin Validación | 🟡 MEDIA | Media | Alto | 🟠 P1 |
| 9 | Sin Rate Limiting | 🟡 MEDIA | Fácil | Medio | 🟡 P2 |
| 10 | Info Sensible en Logs | 🟡 MEDIA | Fácil | Bajo | 🟡 P3 |
| 11 | Dashboard Params sin Validar | 🟡 MEDIA | Media | Medio | 🟡 P2 |

---

## Aspectos Positivos de Seguridad Implementados

✅ **HttpOnly Cookies:** Tokens JWT almacenados en cookies HttpOnly (runtime-app)
✅ **SameSite Cookies:** Protección CSRF con `sameSite: 'lax'`
✅ **Queries Parametrizadas:** Uso de pyodbc con parámetros (reduce SQL injection)
✅ **JWT con Expiración:** Tokens con tiempo de vida limitado (30 min)
✅ **Middleware de Autenticación:** Protección de rutas `/api/deployment` y `/api/admin`
✅ **Separación de Concerns:** Auth en backend, no en frontend
✅ **TripleDES para Tokens:** Desencriptación de tokens del Dashboard
✅ **Documentación de Seguridad:** Archivo SECURITY.md con best practices
✅ **HTTPS en Producción:** Variables de entorno configuradas para SSL

---

## Plan de Remediación

### Fase 1: Crítico (P0) - Inmediato (1-2 días)

**Objetivo:** Eliminar vulnerabilidades de severidad crítica que podrían permitir acceso no autorizado.

- [ ] **Issue #1:** Remover credenciales hardcodeadas de `.env.example`
  - Regenerar credenciales de BD en test.bizuit.com
  - Actualizar `.env.example` con valores genéricos
  - Escanear repositorio con `git-secrets`
  - Responsable: DevOps + Backend Lead
  - Tiempo estimado: 4 horas

- [ ] **Issue #2:** Mover clave TripleDES a variable de entorno
  - Generar nueva clave aleatoria de 24 chars
  - Actualizar `crypto.py` para leer de .env
  - Coordinar con equipo Bizuit Dashboard
  - Responsable: Backend Lead
  - Tiempo estimado: 2 horas

- [ ] **Issue #4:** Configurar CORS correctamente
  - Eliminar wildcard, usar lista explícita
  - Probar con frontend en localhost y producción
  - Responsable: Backend Lead + Frontend Lead
  - Tiempo estimado: 1 hora

- [ ] **Issue #7:** Generar JWT secret cryptográficamente seguro
  - Generar con `openssl rand -hex 32`
  - Forzar validación al startup
  - Invalidar tokens existentes
  - Responsable: Backend Lead
  - Tiempo estimado: 1 hora

### Fase 2: Alto (P1) - Corto Plazo (1 semana)

**Objetivo:** Implementar validaciones de inputs y protecciones contra injection attacks.

- [ ] **Issue #3:** Implementar validación de inputs en database.py
  - Crear funciones de validación (validate_form_name, validate_username, etc.)
  - Aplicar en todos los métodos de DB
  - Agregar tests unitarios
  - Responsable: Backend Lead
  - Tiempo estimado: 6 horas

- [ ] **Issue #5:** Validar paths en Next.js proxy
  - Implementar función validatePath con whitelist
  - Aplicar en ambos proxies (showcase y runtime-app)
  - Agregar logging de intentos de path traversal
  - Responsable: Frontend Lead
  - Tiempo estimado: 4 horas

- [ ] **Issue #8:** Protección contra Zip Slip en file upload
  - Implementar función safe_extract
  - Configurar límites de tamaño y número de archivos
  - Tests con ZIPs maliciosos
  - Responsable: Backend Lead
  - Tiempo estimado: 4 horas

### Fase 3: Medio (P2) - Mediano Plazo (2 semanas)

**Objetivo:** Agregar capas de defensa adicionales y mejoras de seguridad.

- [ ] **Issue #6:** Webhook secret timing-safe comparison
  - Implementar con timingSafeEqual
  - Generar secret fuerte
  - Eliminar endpoint GET con secret en query
  - Responsable: Frontend Lead
  - Tiempo estimado: 2 horas

- [ ] **Issue #9:** Implementar rate limiting
  - Instalar slowapi en backend
  - Configurar límites por endpoint
  - Implementar en Next.js para /api/auth/login
  - Responsable: Backend + Frontend Leads
  - Tiempo estimado: 6 horas

- [ ] **Issue #11:** Validar parámetros del Dashboard
  - Implementar función validate_dashboard_params
  - Definir regex patterns
  - Documentar en OpenAPI
  - Responsable: Backend Lead
  - Tiempo estimado: 3 horas

### Fase 4: Bajo (P3) - Largo Plazo (1 mes)

**Objetivo:** Mejoras de logging y observabilidad.

- [ ] **Issue #10:** Sanitizar información sensible en logs
  - Crear utilidades de sanitización
  - Redactar tokens y passwords
  - Implementar niveles de logging
  - Responsable: Todos
  - Tiempo estimado: 4 horas

### Post-Remediación

- [ ] Realizar nuevo security audit completo
- [ ] Penetration testing externo
- [ ] Configurar security headers (CSP, HSTS, X-Frame-Options)
- [ ] Implementar monitoreo de seguridad en producción
- [ ] Documentar proceso de security incident response

---

## Herramientas de Auditoría Recomendadas

### Escaneo de Secretos

```bash
# Instalar git-secrets
brew install git-secrets  # macOS
# o
apt-get install git-secrets  # Linux

# Configurar en el repositorio
cd /path/to/BizuitFormTemplate
git secrets --install
git secrets --register-aws

# Escanear todo el historial
git secrets --scan-history
```

### Análisis de Dependencias

```bash
# Backend (Python)
pip install pip-audit
pip-audit

# Frontend (Node.js)
npm audit --production
npm audit fix

# Actualizar dependencias con vulnerabilidades
npm update
```

### Static Application Security Testing (SAST)

```bash
# Python - Bandit
pip install bandit
bandit -r custom-forms/backend-api/ -f json -o security-report.json

# JavaScript/TypeScript - ESLint Security
npm install -g eslint eslint-plugin-security
eslint --ext .ts,.tsx custom-forms/runtime-app/ custom-forms-showcase/

# SonarQube (opcional, más completo)
docker run -d --name sonarqube -p 9000:9000 sonarqube:latest
```

### Penetration Testing Tools

```bash
# OWASP ZAP
docker run -u zap -p 8080:8080 -i zaproxy/zap-stable zap-webswing.sh

# Burp Suite Community Edition
# Descargar de: https://portswigger.net/burp/communitydownload

# sqlmap (para testing de SQL injection)
pip install sqlmap
sqlmap -u "http://localhost:8000/api/forms?name=test" --batch
```

---

## Checklist de Seguridad para Producción

Antes de deployar a producción, verificar:

### Variables de Entorno

- [ ] `JWT_SECRET_KEY` configurado con valor cryptográficamente aleatorio (>= 64 chars)
- [ ] `ENCRYPTION_TOKEN_KEY` configurado con valor aleatorio de 24 chars
- [ ] `WEBHOOK_SECRET` configurado con valor aleatorio
- [ ] `CORS_ORIGINS` configurado con lista explícita de orígenes (NO wildcard)
- [ ] `DB_PASSWORD` y `PERSISTENCE_DB_PASSWORD` rotados desde valores de ejemplo
- [ ] Ninguna variable de entorno usa valores por defecto de `.env.example`

### Configuración de Seguridad

- [ ] HTTPS habilitado en todos los endpoints
- [ ] Rate limiting activo en endpoints de autenticación
- [ ] CORS configurado restrictivamente (sin wildcard)
- [ ] Security headers configurados (CSP, HSTS, X-Frame-Options, X-Content-Type-Options)
- [ ] Logs sanitizados (no exponen tokens ni passwords)
- [ ] File upload validado (protección Zip Slip)
- [ ] Paths validados en proxies (protección SSRF)

### Monitoreo y Alertas

- [ ] Logging centralizado configurado (ej: ELK Stack, CloudWatch)
- [ ] Alertas configuradas para:
  - Intentos de login fallidos excesivos
  - Rate limiting triggered
  - Errores de validación de paths
  - Upload de archivos rechazados
- [ ] Dashboard de métricas de seguridad
- [ ] Proceso de incident response documentado

### Testing

- [ ] Todos los tests de seguridad pasando
- [ ] Penetration testing realizado y vulnerabilidades remediadas
- [ ] Dependency scan sin vulnerabilidades HIGH/CRITICAL
- [ ] Security headers validados con https://securityheaders.com/
- [ ] SSL/TLS configurado correctamente (A+ en https://www.ssllabs.com/)

---

## Referencias

- **OWASP Top 10 2021:** https://owasp.org/Top10/
- **OWASP API Security Top 10:** https://owasp.org/www-project-api-security/
- **CWE Top 25:** https://cwe.mitre.org/top25/
- **NIST Cybersecurity Framework:** https://www.nist.gov/cyberframework
- **FastAPI Security Best Practices:** https://fastapi.tiangolo.com/tutorial/security/
- **Next.js Security:** https://nextjs.org/docs/app/building-your-application/configuring/security-headers

---

## Contacto

Para preguntas sobre este reporte de seguridad o para reportar nuevas vulnerabilidades:

- **Security Team:** [Agregar email/Slack channel]
- **Proceso de Responsible Disclosure:** Ver `SECURITY.md` en el repositorio

---

**Disclaimer:** Este reporte es confidencial y debe ser tratado como información sensible. No compartir fuera del equipo de desarrollo sin autorización.
