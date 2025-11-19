"""
Authentication Middleware for FastAPI

Protects admin endpoints requiring authentication
"""

from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

from auth_service import verify_session_token, extract_bearer_token


class AuthMiddleware(BaseHTTPMiddleware):
    """
    Middleware que valida autenticación en endpoints protegidos
    """

    # Rutas públicas (no requieren autenticación)
    PUBLIC_PATHS = [
        "/",
        "/health",
        "/docs",
        "/openapi.json",
        "/redoc"
    ]

    # Rutas que requieren autenticación de admin
    ADMIN_PROTECTED_PATHS = [
        "/api/deployment",
        "/api/admin"
    ]

    async def dispatch(self, request: Request, call_next):
        """
        Procesa cada request y valida autenticación si es necesario
        """
        path = request.url.path

        # Permitir rutas públicas
        if self._is_public_path(path):
            return await call_next(request)

        # Validar auth para rutas de admin
        if self._requires_admin_auth(path):
            auth_result = self._validate_auth(request)

            if not auth_result["valid"]:
                return JSONResponse(
                    status_code=401,
                    content={
                        "error": "Unauthorized",
                        "message": auth_result["message"]
                    }
                )

            # Agregar información del usuario al request state
            request.state.user = auth_result["user"]

        # Continuar con el request
        return await call_next(request)

    def _is_public_path(self, path: str) -> bool:
        """Verifica si la ruta es pública"""
        return any(path.startswith(public_path) for public_path in self.PUBLIC_PATHS)

    def _requires_admin_auth(self, path: str) -> bool:
        """Verifica si la ruta requiere autenticación de admin"""
        return any(path.startswith(protected_path) for protected_path in self.ADMIN_PROTECTED_PATHS)

    def _validate_auth(self, request: Request) -> dict:
        """
        Valida el token de autenticación del request

        Returns:
            dict con 'valid' (bool), 'user' (dict o None), 'message' (str)
        """
        # Obtener header Authorization
        auth_header = request.headers.get("Authorization")

        if not auth_header:
            return {
                "valid": False,
                "user": None,
                "message": "Missing Authorization header"
            }

        # Extraer Bearer token
        token = extract_bearer_token(auth_header)

        if not token:
            return {
                "valid": False,
                "user": None,
                "message": "Invalid Authorization header format. Expected: Bearer <token>"
            }

        # Verificar token
        payload = verify_session_token(token)

        if not payload:
            return {
                "valid": False,
                "user": None,
                "message": "Invalid or expired token"
            }

        # Token válido
        return {
            "valid": True,
            "user": {
                "username": payload.get("username"),
                "user_info": payload.get("user_info")
            },
            "message": "Authorized"
        }
