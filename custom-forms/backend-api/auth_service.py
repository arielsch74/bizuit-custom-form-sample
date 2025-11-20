"""
Authentication Service for Admin Panel

Handles:
- Login to Bizuit Dashboard API
- Admin role validation
- JWT session token generation and validation
"""

import os
import jwt
import base64
import requests
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from dotenv import load_dotenv

from database import validate_admin_roles, get_user_info

# Load environment variables from .env.local (if exists) or .env
load_dotenv('.env.local', override=True)
load_dotenv('.env')

# Configuration
BIZUIT_DASHBOARD_API_URL = os.getenv("BIZUIT_DASHBOARD_API_URL")
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "change-this-secret-key")
SESSION_TIMEOUT_MINUTES = int(os.getenv("SESSION_TIMEOUT_MINUTES", "30"))
ADMIN_ALLOWED_ROLES = os.getenv("ADMIN_ALLOWED_ROLES", "Administrator").split(",")

# JWT Algorithm
JWT_ALGORITHM = "HS256"


def login_to_bizuit(username: str, password: str) -> Dict[str, Any]:
    """
    Autentica un usuario contra Bizuit Dashboard API

    Args:
        username: Nombre de usuario
        password: Contraseña

    Returns:
        dict con 'success' (bool), 'token' (str o None), 'error' (str o None)
    """
    try:
        # Crear Basic Auth header
        auth_string = f"{username}:{password}"
        base64_auth = base64.b64encode(auth_string.encode()).decode()

        # Call Bizuit Login API (uses GET with Basic Auth header)
        response = requests.get(
            f"{BIZUIT_DASHBOARD_API_URL}/Login",
            headers={
                "Authorization": f"Basic {base64_auth}"
            },
            timeout=30  # Increased from 10 to 30 seconds for slow BIZUIT server responses
        )

        if response.status_code == 200:
            data = response.json()
            # Bizuit API retorna { "token": "..." } o { "Token": "..." }
            bizuit_token = data.get("token") or data.get("Token")

            if bizuit_token:
                print(f"[Auth Service] Login successful for user '{username}'")
                return {
                    "success": True,
                    "token": bizuit_token,
                    "error": None
                }
            else:
                print(f"[Auth Service] Login response missing token: {data}")
                return {
                    "success": False,
                    "token": None,
                    "error": "Invalid response from authentication server"
                }
        else:
            print(f"[Auth Service] Login failed with status {response.status_code}")
            return {
                "success": False,
                "token": None,
                "error": "Invalid credentials"
            }

    except requests.exceptions.Timeout:
        print("[Auth Service] Login request timeout")
        return {
            "success": False,
            "token": None,
            "error": "Authentication server timeout"
        }
    except Exception as e:
        print(f"[Auth Service] Login error: {str(e)}")
        return {
            "success": False,
            "token": None,
            "error": f"Authentication error: {str(e)}"
        }


def validate_admin_user(username: str, bizuit_token: str) -> Dict[str, Any]:
    """
    Valida que el usuario tenga roles de administrador

    Args:
        username: Nombre de usuario
        bizuit_token: Token de Bizuit (no usado actualmente, pero disponible para futuras validaciones)

    Returns:
        dict con 'has_access' (bool), 'user_roles' (list), 'user_info' (dict)
    """
    try:
        # Validar roles
        roles_validation = validate_admin_roles(username, ADMIN_ALLOWED_ROLES)

        if not roles_validation["has_access"]:
            print(f"[Auth Service] User '{username}' does not have admin access")
            return {
                "has_access": False,
                "user_roles": roles_validation["user_roles"],
                "user_info": None
            }

        # Obtener información del usuario
        user_info = get_user_info(username)

        print(f"[Auth Service] User '{username}' validated successfully")
        return {
            "has_access": True,
            "user_roles": roles_validation["user_roles"],
            "user_info": user_info
        }

    except Exception as e:
        print(f"[Auth Service] Validation error: {str(e)}")
        raise


def generate_session_token(username: str, bizuit_token: str, user_info: Dict[str, Any]) -> str:
    """
    Genera un JWT token para la sesión de administrador

    Args:
        username: Nombre de usuario
        bizuit_token: Token de Bizuit original
        user_info: Información del usuario

    Returns:
        JWT token string
    """
    try:
        # Calcular tiempo de expiración
        expiration = datetime.utcnow() + timedelta(minutes=SESSION_TIMEOUT_MINUTES)

        # Payload del JWT
        payload = {
            "username": username,
            "bizuit_token": bizuit_token,
            "user_info": user_info,
            "exp": expiration,
            "iat": datetime.utcnow(),
            "type": "admin_session"
        }

        # Generar JWT
        token = jwt.encode(payload, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)

        print(f"[Auth Service] Generated session token for '{username}' (expires: {expiration})")
        return token

    except Exception as e:
        print(f"[Auth Service] Error generating token: {str(e)}")
        raise


def verify_session_token(token: str) -> Optional[Dict[str, Any]]:
    """
    Verifica y decodifica un JWT session token

    Args:
        token: JWT token string

    Returns:
        dict con payload del token o None si inválido/expirado
    """
    try:
        # Decodificar y verificar JWT
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])

        # Verificar que sea un token de admin session
        if payload.get("type") != "admin_session":
            print("[Auth Service] Invalid token type")
            return None

        print(f"[Auth Service] Token verified for user '{payload.get('username')}'")
        return payload

    except jwt.ExpiredSignatureError:
        print("[Auth Service] Token expired")
        return None
    except jwt.InvalidTokenError as e:
        print(f"[Auth Service] Invalid token: {str(e)}")
        return None
    except Exception as e:
        print(f"[Auth Service] Token verification error: {str(e)}")
        return None


def refresh_session_token(old_token: str) -> Optional[str]:
    """
    Renueva un session token (útil para renovar con actividad)

    Args:
        old_token: Token actual

    Returns:
        Nuevo token o None si el token actual es inválido
    """
    try:
        # Verificar token actual
        payload = verify_session_token(old_token)

        if not payload:
            return None

        # Generar nuevo token con el mismo contenido pero nueva expiración
        username = payload["username"]
        bizuit_token = payload["bizuit_token"]
        user_info = payload["user_info"]

        new_token = generate_session_token(username, bizuit_token, user_info)

        print(f"[Auth Service] Session token refreshed for '{username}'")
        return new_token

    except Exception as e:
        print(f"[Auth Service] Error refreshing token: {str(e)}")
        return None


def extract_bearer_token(authorization_header: Optional[str]) -> Optional[str]:
    """
    Extrae el token del header Authorization: Bearer <token>

    Args:
        authorization_header: Valor del header Authorization

    Returns:
        Token string o None
    """
    if not authorization_header:
        return None

    parts = authorization_header.split()

    if len(parts) != 2 or parts[0].lower() != "bearer":
        return None

    return parts[1]
