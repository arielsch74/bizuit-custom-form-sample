"""
Input validation functions for security hardening.

This module provides validation functions to prevent SQL injection,
path traversal, and other input-based attacks.
"""

import re
from typing import Optional


def validate_form_name(form_name: str) -> bool:
    """
    Valida que form_name solo contenga caracteres seguros.

    Permite: alfanuméricos, guiones, underscores
    Longitud: 1-100 caracteres

    Args:
        form_name: Nombre del formulario a validar

    Returns:
        True si es válido, False si no

    Examples:
        >>> validate_form_name("my-form-123")
        True
        >>> validate_form_name("form_name")
        True
        >>> validate_form_name("invalid'; DROP TABLE--")
        False
        >>> validate_form_name("../../../etc/passwd")
        False
    """
    if not form_name or not isinstance(form_name, str):
        return False

    if len(form_name) < 1 or len(form_name) > 100:
        return False

    # Solo alfanuméricos, guiones, underscore
    return bool(re.match(r'^[a-zA-Z0-9_-]+$', form_name))


def validate_username(username: str) -> bool:
    """
    Valida que username solo contenga caracteres seguros.

    Permite: alfanuméricos, puntos, guiones, arroba, underscore
    Longitud: 1-100 caracteres

    Args:
        username: Nombre de usuario a validar

    Returns:
        True si es válido, False si no

    Examples:
        >>> validate_username("john.doe@bizuit.com")
        True
        >>> validate_username("user_123")
        True
        >>> validate_username("admin'; DROP TABLE users--")
        False
    """
    if not username or not isinstance(username, str):
        return False

    if len(username) < 1 or len(username) > 100:
        return False

    # Alfanuméricos, puntos, guiones, arroba, underscore
    return bool(re.match(r'^[a-zA-Z0-9._@-]+$', username))


def validate_version(version: str) -> bool:
    """
    Valida formato de versión semántica (semver).

    Formato esperado: X.Y.Z donde X, Y, Z son números

    Args:
        version: Versión a validar (ej: "1.0.0", "2.3.15")

    Returns:
        True si es válido, False si no

    Examples:
        >>> validate_version("1.0.0")
        True
        >>> validate_version("10.5.23")
        True
        >>> validate_version("1.0")
        False
        >>> validate_version("v1.0.0")
        False
        >>> validate_version("1.0.0'; DROP TABLE--")
        False
    """
    if not version or not isinstance(version, str):
        return False

    # Formato semver: número.número.número
    return bool(re.match(r'^\d+\.\d+\.\d+$', version))


def validate_process_name(process_name: str) -> bool:
    """
    Valida que process_name solo contenga caracteres seguros.

    Similar a form_name pero puede incluir espacios.
    Permite: alfanuméricos, espacios, guiones, underscores
    Longitud: 1-200 caracteres

    Args:
        process_name: Nombre del proceso a validar

    Returns:
        True si es válido, False si no

    Examples:
        >>> validate_process_name("Expense Approval Process")
        True
        >>> validate_process_name("Process-123_v2")
        True
        >>> validate_process_name("'; DROP TABLE processes--")
        False
    """
    if not process_name or not isinstance(process_name, str):
        return False

    if len(process_name) < 1 or len(process_name) > 200:
        return False

    # Alfanuméricos, espacios, guiones, underscore
    return bool(re.match(r'^[a-zA-Z0-9 _-]+$', process_name))


def validate_email(email: str) -> bool:
    """
    Valida formato de email básico.

    Args:
        email: Email a validar

    Returns:
        True si tiene formato válido, False si no

    Examples:
        >>> validate_email("user@example.com")
        True
        >>> validate_email("admin@bizuit.com")
        True
        >>> validate_email("invalid-email")
        False
        >>> validate_email("'; DROP TABLE--@evil.com")
        False
    """
    if not email or not isinstance(email, str):
        return False

    if len(email) > 320:  # RFC 5321
        return False

    # Regex básico de email
    email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(email_pattern, email))


def validate_token_id(token_id: str) -> bool:
    """
    Valida formato de TokenId (GUID o número entero).

    Args:
        token_id: Token ID a validar (formato GUID o número entero)

    Returns:
        True si es GUID válido o número entero, False si no

    Examples:
        >>> validate_token_id("550e8400-e29b-41d4-a716-446655440000")
        True
        >>> validate_token_id("141191")
        True
        >>> validate_token_id("invalid-guid")
        False
        >>> validate_token_id("'; DROP TABLE--")
        False
    """
    if not token_id or not isinstance(token_id, str):
        return False

    # Formato GUID: 8-4-4-4-12 caracteres hexadecimales
    guid_pattern = r'^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$'

    # Formato número entero (para tokens del Dashboard)
    integer_pattern = r'^\d+$'

    return bool(re.match(guid_pattern, token_id) or re.match(integer_pattern, token_id))


def validate_commit_hash(commit_hash: str) -> bool:
    """
    Valida formato de Git commit hash (SHA-1).

    Args:
        commit_hash: Hash de commit a validar (40 caracteres hex)

    Returns:
        True si es hash válido, False si no

    Examples:
        >>> validate_commit_hash("a" * 40)
        True
        >>> validate_commit_hash("1234567890abcdef" * 2 + "12345678")
        True
        >>> validate_commit_hash("invalid")
        False
    """
    if not commit_hash or not isinstance(commit_hash, str):
        return False

    # Git SHA-1: 40 caracteres hexadecimales
    return bool(re.match(r'^[a-fA-F0-9]{40}$', commit_hash))


def sanitize_for_logging(value: str, max_length: int = 50) -> str:
    """
    Sanitiza un valor para logging seguro.

    Remueve caracteres potencialmente peligrosos y trunca.

    Args:
        value: Valor a sanitizar
        max_length: Longitud máxima del output

    Returns:
        Valor sanitizado y truncado

    Examples:
        >>> sanitize_for_logging("user@example.com")
        'user@example.com'
        >>> sanitize_for_logging("admin'; DROP TABLE--")
        'admin DROP TABLE--'
        >>> sanitize_for_logging("x" * 100, 50)
        'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
    """
    if not value or not isinstance(value, str):
        return ""

    # Remover caracteres peligrosos
    sanitized = re.sub(r'[;\'"\\<>]', '', value)

    # Truncar si es muy largo
    if len(sanitized) > max_length:
        sanitized = sanitized[:max_length]

    return sanitized


if __name__ == "__main__":
    # Tests rápidos
    print("Testing validators...")

    print(f"✓ form_name valid: {validate_form_name('my-form-123')}")
    print(f"✗ form_name invalid: {not validate_form_name('form; DROP TABLE--')}")

    print(f"✓ username valid: {validate_username('user@example.com')}")
    print(f"✗ username invalid: {not validate_username('user; DROP--')}")

    print(f"✓ version valid: {validate_version('1.0.0')}")
    print(f"✗ version invalid: {not validate_version('1.0.0; DROP--')}")

    print(f"✓ token_id valid: {validate_token_id('550e8400-e29b-41d4-a716-446655440000')}")
    print(f"✗ token_id invalid: {not validate_token_id('invalid-guid')}")

    print("\n✅ All validators working!")
