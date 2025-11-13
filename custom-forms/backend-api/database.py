import pyodbc
import os
from dotenv import load_dotenv

load_dotenv()


def get_connection_string():
    """Construye la connection string desde variables de entorno"""
    server = os.getenv("DB_SERVER")
    database = os.getenv("DB_DATABASE")
    username = os.getenv("DB_USER")
    password = os.getenv("DB_PASSWORD")

    return (
        f"DRIVER={{ODBC Driver 18 for SQL Server}};"
        f"SERVER={server};"
        f"DATABASE={database};"
        f"UID={username};"
        f"PWD={password};"
        f"TrustServerCertificate=yes;"
        f"Encrypt=yes;"
    )


def get_db_connection():
    """Crea una conexión a SQL Server"""
    conn_str = get_connection_string()
    return pyodbc.connect(conn_str)


def upsert_custom_form(
    form_name: str,
    process_name: str,
    version: str,
    description: str,
    author: str,
    compiled_code: str,
    size_bytes: int,
    package_version: str,
    commit_hash: str,
    build_date  # datetime object
) -> dict:
    """
    Ejecuta el stored procedure para insertar/actualizar un form

    Returns:
        dict con 'success' y 'action' ('inserted' o 'updated')
    """
    conn = None
    cursor = None

    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # Ejecutar stored procedure
        # NOTA: El SP debe retornar un resultado indicando si fue INSERT o UPDATE
        cursor.execute("""
            EXEC sp_UpsertCustomForm
                @FormName = ?,
                @ProcessName = ?,
                @Version = ?,
                @Description = ?,
                @Author = ?,
                @CompiledCode = ?,
                @SizeBytes = ?,
                @PackageVersion = ?,
                @CommitHash = ?,
                @BuildDate = ?
        """, (
            form_name,
            process_name,
            version,
            description,
            author,
            compiled_code,
            size_bytes,
            package_version,
            commit_hash,
            build_date
        ))

        # Obtener resultado del SP (asumiendo que retorna un recordset)
        row = cursor.fetchone()
        action = row[0] if row else "unknown"  # 'inserted' o 'updated'

        conn.commit()

        return {
            "success": True,
            "action": action
        }

    except Exception as e:
        if conn:
            conn.rollback()
        raise e

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


def test_connection():
    """Test de conexión a BD"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT @@VERSION")
        version = cursor.fetchone()[0]
        cursor.close()
        conn.close()
        return {
            "success": True,
            "message": "Connection successful",
            "version": version
        }
    except Exception as e:
        return {
            "success": False,
            "message": str(e)
        }


def get_all_custom_forms():
    """
    Get all custom forms from SQL Server

    Returns list of forms with their most recent version info
    """
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # Query to get all forms with their current version
        # CustomForms already has CurrentVersion, so we join with CustomFormVersions where IsCurrent = 1
        query = """
        SELECT
            cf.FormId,
            cf.FormName,
            cf.ProcessName,
            cf.Status,
            cf.CurrentVersion,
            cf.Description,
            cf.Author,
            cfv.SizeBytes,
            cf.CreatedAt,
            cf.UpdatedAt
        FROM CustomForms cf
        LEFT JOIN CustomFormVersions cfv ON cf.FormId = cfv.FormId AND cfv.IsCurrent = 1
        WHERE cf.Status = 'active'
        ORDER BY cf.FormName
        """

        cursor.execute(query)
        rows = cursor.fetchall()

        forms = []
        for row in rows:
            forms.append({
                "id": row[0],
                "formName": row[1],
                "processName": row[2],
                "status": row[3],
                "currentVersion": row[4],
                "description": row[5],
                "author": row[6],
                "sizeBytes": row[7],
                "publishedAt": row[8].isoformat() if row[8] else None,
                "updatedAt": row[9].isoformat() if row[9] else None
            })

        print(f"[Database] Retrieved {len(forms)} forms from SQL Server")
        return forms

    except Exception as e:
        print(f"[Database] Error fetching forms: {str(e)}")
        raise

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


def get_form_compiled_code(form_name: str, version: str = None):
    """
    Get compiled code for a specific form

    Args:
        form_name: Name of the form
        version: Optional specific version (defaults to current/latest)

    Returns:
        dict with 'compiled_code', 'version', 'published_at', 'size_bytes'
        or None if form not found
    """
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        if version:
            # Get specific version
            query = """
            SELECT
                cfv.CompiledCode,
                cfv.Version,
                cfv.PublishedAt,
                cfv.SizeBytes
            FROM CustomFormVersions cfv
            INNER JOIN CustomForms cf ON cfv.FormId = cf.FormId
            WHERE cf.FormName = ? AND cfv.Version = ?
            """
            cursor.execute(query, (form_name, version))
        else:
            # Get current version
            query = """
            SELECT
                cfv.CompiledCode,
                cfv.Version,
                cfv.PublishedAt,
                cfv.SizeBytes
            FROM CustomFormVersions cfv
            INNER JOIN CustomForms cf ON cfv.FormId = cf.FormId
            WHERE cf.FormName = ? AND cfv.IsCurrent = 1
            """
            cursor.execute(query, (form_name,))

        row = cursor.fetchone()

        if not row:
            return None

        return {
            'compiled_code': row[0],
            'version': row[1],
            'published_at': row[2].isoformat() if row[2] else None,
            'size_bytes': row[3] or 0
        }

    except Exception as e:
        print(f"[Database] Error fetching form code: {str(e)}")
        raise

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()
