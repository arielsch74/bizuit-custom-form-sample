import pyodbc
import os
from datetime import datetime
from typing import Optional, List, Dict, Any
from dotenv import load_dotenv
from crypto import decrypt_triple_des

load_dotenv()


# ==============================================================================
# Connection String Builders
# ==============================================================================

def get_connection_string(database_type="dashboard"):
    """
    Construye la connection string desde variables de entorno

    Args:
        database_type: "dashboard" o "persistence"
    """
    if database_type == "persistence":
        server = os.getenv("PERSISTENCE_DB_SERVER")
        database = os.getenv("PERSISTENCE_DB_DATABASE")
        username = os.getenv("PERSISTENCE_DB_USER")
        password = os.getenv("PERSISTENCE_DB_PASSWORD")
    else:  # dashboard (default)
        server = os.getenv("DB_SERVER")
        database = os.getenv("DB_DATABASE")
        username = os.getenv("DB_USER")
        password = os.getenv("DB_PASSWORD")

    return (
        f"DRIVER={{ODBC Driver 17 for SQL Server}};"
        f"SERVER={server};"
        f"DATABASE={database};"
        f"UID={username};"
        f"PWD={password};"
        f"TrustServerCertificate=yes;"
        f"Encrypt=yes;"
    )


def get_db_connection(database_type="dashboard"):
    """
    Crea una conexión a SQL Server

    Args:
        database_type: "dashboard" o "persistence"
    """
    conn_str = get_connection_string(database_type)
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


# ==============================================================================
# Admin Authentication Functions
# ==============================================================================

def validate_admin_roles(username: str, allowed_roles: List[str]) -> Dict[str, Any]:
    """
    Valida que un usuario tenga al menos uno de los roles permitidos

    Args:
        username: Nombre de usuario de Bizuit
        allowed_roles: Lista de nombres de roles permitidos

    Returns:
        dict con 'has_access' (bool) y 'user_roles' (list)
    """
    conn = None
    cursor = None
    try:
        conn = get_db_connection("dashboard")
        cursor = conn.cursor()

        # Query para obtener roles del usuario
        # Asumiendo estructura: Users (UserId, UserName), Roles (RoleId, RoleName),
        # UserRoles (UserId, RoleId)
        query = """
        SELECT r.RoleName
        FROM Users u
        INNER JOIN UserRoles ur ON u.UserId = ur.UserId
        INNER JOIN Roles r ON ur.RoleId = r.RoleId
        WHERE u.UserName = ?
        """

        cursor.execute(query, (username,))
        rows = cursor.fetchall()

        user_roles = [row[0] for row in rows]

        # Verificar si tiene al menos un rol permitido
        has_access = any(role in allowed_roles for role in user_roles)

        print(f"[Database] User '{username}' has roles: {user_roles}")
        print(f"[Database] Allowed roles: {allowed_roles}")
        print(f"[Database] Access granted: {has_access}")

        return {
            "has_access": has_access,
            "user_roles": user_roles
        }

    except Exception as e:
        print(f"[Database] Error validating admin roles: {str(e)}")
        raise

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


def get_user_info(username: str) -> Optional[Dict[str, Any]]:
    """
    Obtiene información básica de un usuario

    Args:
        username: Nombre de usuario

    Returns:
        dict con información del usuario o None si no existe
    """
    conn = None
    cursor = None
    try:
        conn = get_db_connection("dashboard")
        cursor = conn.cursor()

        query = """
        SELECT UserID, Username, Email, DisplayName, FirstName, LastName
        FROM Users
        WHERE Username = ?
        """

        cursor.execute(query, (username,))
        row = cursor.fetchone()

        if not row:
            return None

        return {
            "userId": row[0],
            "userName": row[1],
            "email": row[2] if len(row) > 2 else None,
            "displayName": row[3] if len(row) > 3 else None,
            "firstName": row[4] if len(row) > 4 else None,
            "lastName": row[5] if len(row) > 5 else None
        }

    except Exception as e:
        print(f"[Database] Error getting user info: {str(e)}")
        raise

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


# ==============================================================================
# Security Token Validation Functions (BIZUITPersistenceStore)
# ==============================================================================

def validate_security_token(token_id: str) -> Optional[Dict[str, Any]]:
    """
    Valida un token de seguridad desde BIZUITPersistenceStore.SecurityTokens

    Args:
        token_id: ID del token (columna TokenId)

    Returns:
        dict con información del token o None si no existe o expiró
    """
    conn = None
    cursor = None
    try:
        conn = get_db_connection("persistence")
        cursor = conn.cursor()

        query = """
        SELECT
            TokenId,
            UserName,
            Operation,
            EventName,
            RequesterAddress,
            ExpirationDate,
            InstanceId
        FROM [dbo].[SecurityTokens]
        WHERE TokenId = ?
        """

        cursor.execute(query, (token_id,))
        row = cursor.fetchone()

        if not row:
            print(f"[Database] Token '{token_id}' not found")
            return None

        # Verificar si expiró
        expiration_date = row[5]
        is_valid = True
        if expiration_date and datetime.now() > expiration_date:
            print(f"[Database] Token '{token_id}' expired at {expiration_date}")
            is_valid = False

        token_info = {
            "tokenId": row[0],
            "userName": row[1],
            "operation": row[2],
            "eventName": row[3],
            "requesterAddress": row[4],
            "expirationDate": expiration_date.isoformat() if expiration_date else None,
            "instanceId": row[6],
            "is_valid": is_valid
        }

        status_msg = "validated successfully" if is_valid else "found but expired"
        print(f"[Database] Token '{token_id}' {status_msg}")
        return token_info

    except Exception as e:
        print(f"[Database] Error validating security token: {str(e)}")
        raise

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


def delete_security_token(token_id: str) -> bool:
    """
    Elimina un token de seguridad (cuando se cierra el formulario)

    Args:
        token_id: ID del token a eliminar

    Returns:
        True si se eliminó, False si no existía
    """
    conn = None
    cursor = None
    try:
        conn = get_db_connection("persistence")
        cursor = conn.cursor()

        query = "DELETE FROM [dbo].[SecurityTokens] WHERE TokenId = ?"
        cursor.execute(query, (token_id,))

        rows_affected = cursor.rowcount
        conn.commit()

        if rows_affected > 0:
            print(f"[Database] Token '{token_id}' deleted successfully")
            return True
        else:
            print(f"[Database] Token '{token_id}' not found for deletion")
            return False

    except Exception as e:
        if conn:
            conn.rollback()
        print(f"[Database] Error deleting security token: {str(e)}")
        raise

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


def validate_dashboard_token(encrypted_token: str) -> Optional[Dict[str, Any]]:
    """
    Valida un token encriptado enviado desde Bizuit Dashboard.

    Este es el flujo completo de validación del parámetro 's' del Dashboard:
    1. Desencripta el token TripleDES (parámetro 's')
    2. Obtiene el TokenId desencriptado
    3. Busca el registro en SecurityTokens
    4. Valida que no haya expirado

    Args:
        encrypted_token: Token encriptado (parámetro 's' del query string)
                        Ejemplo: "aAAV/9xqhAE=" -> desencripta a "131138"

    Returns:
        dict con información del token si es válido, None si no existe o expiró
        {
            "tokenId": "131138",
            "userName": "admin",
            "operation": 1,
            "eventName": "customforms",
            "requesterAddress": "127.0.0.1",
            "expirationDate": "2025-12-09T15:01:02.790",
            "instanceId": None,
            "is_valid": True
        }

    Raises:
        ValueError: Si el token encriptado es inválido
        Exception: Si hay error de base de datos

    Example:
        >>> # Dashboard envía: ?InstanceId=&UserName=admin&s=aAAV/9xqhAE=
        >>> token_info = validate_dashboard_token("aAAV/9xqhAE=")
        >>> print(token_info["userName"])  # "admin"
    """
    try:
        # 1. Desencriptar el token para obtener el TokenId
        token_id = decrypt_triple_des(encrypted_token)
        print(f"[Database] Decrypted token: '{encrypted_token}' -> TokenId: '{token_id}'")

        # 2. Validar el token en la base de datos
        token_info = validate_security_token(token_id)

        if not token_info:
            print(f"[Database] Token '{token_id}' not found in SecurityTokens")
            return None

        if not token_info.get("is_valid"):
            print(f"[Database] Token '{token_id}' has expired")
            return None

        print(f"[Database] Dashboard token validated successfully for user '{token_info.get('userName')}'")
        return token_info

    except ValueError as e:
        print(f"[Database] Failed to decrypt dashboard token: {str(e)}")
        raise
    except Exception as e:
        print(f"[Database] Error validating dashboard token: {str(e)}")
        raise
