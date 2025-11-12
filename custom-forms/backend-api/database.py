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
