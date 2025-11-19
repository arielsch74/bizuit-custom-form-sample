"""
FastAPI Dependencies for Authentication

Provides reusable authentication dependencies for protected endpoints
"""

from fastapi import Header, HTTPException, Depends
from typing import Optional, Dict, Any

from auth_service import verify_session_token, extract_bearer_token


async def get_current_admin_user(
    authorization: Optional[str] = Header(None)
) -> Dict[str, Any]:
    """
    Dependency para validar que el usuario tiene autenticación de admin

    Args:
        authorization: Header Authorization con formato "Bearer <token>"

    Returns:
        dict con información del usuario autenticado

    Raises:
        HTTPException 401 si no está autenticado o el token es inválido
    """
    if not authorization:
        raise HTTPException(
            status_code=401,
            detail={
                "error": "Unauthorized",
                "message": "Missing Authorization header"
            }
        )

    # Extraer Bearer token
    token = extract_bearer_token(authorization)

    if not token:
        raise HTTPException(
            status_code=401,
            detail={
                "error": "Unauthorized",
                "message": "Invalid Authorization header format. Expected: Bearer <token>"
            }
        )

    # Verificar token
    payload = verify_session_token(token)

    if not payload:
        raise HTTPException(
            status_code=401,
            detail={
                "error": "Unauthorized",
                "message": "Invalid or expired token"
            }
        )

    # Token válido - retornar info del usuario
    return {
        "username": payload.get("username"),
        "user_info": payload.get("user_info"),
        "bizuit_token": payload.get("bizuit_token")
    }
