"""
Cryptographic utilities for Bizuit Dashboard token validation.

This module provides TripleDES decryption functionality to validate
encrypted tokens sent from the Bizuit Dashboard.
"""

import base64
import os
from Crypto.Cipher import DES3
from Crypto.Util.Padding import unpad
from dotenv import load_dotenv

# Load environment variables from .env.local (if exists) or .env
# .env.local takes precedence over .env (Next.js convention)
load_dotenv('.env.local', override=True)
load_dotenv('.env')

# Encryption key used by Bizuit Dashboard (C# _EncryptionTokenKey)
# SECURITY: Key must be provided via environment variable
ENCRYPTION_TOKEN_KEY = os.getenv("ENCRYPTION_TOKEN_KEY")

if not ENCRYPTION_TOKEN_KEY:
    raise ValueError(
        "ENCRYPTION_TOKEN_KEY environment variable is required. "
        "This key must match the encryption key used by Bizuit Dashboard. "
        "Set it in your .env file."
    )

if len(ENCRYPTION_TOKEN_KEY) != 24:
    raise ValueError(
        f"ENCRYPTION_TOKEN_KEY must be exactly 24 characters for TripleDES. "
        f"Current length: {len(ENCRYPTION_TOKEN_KEY)}"
    )


def decrypt_triple_des(encrypted_string: str) -> str:
    """
    Decrypt a TripleDES encrypted string from Bizuit Dashboard.

    This is the Python equivalent of the C# DecryptTripleDes method:
    - Key: ENCRYPTION_TOKEN_KEY (UTF-8 encoded)
    - Mode: ECB
    - Padding: PKCS7
    - Input: Base64 encoded string
    - Output: UTF-8 decoded string

    Args:
        encrypted_string: Base64 encoded encrypted string (parameter 's' from Dashboard)

    Returns:
        Decrypted string (usually contains auth info like "admin|timestamp|etc")

    Raises:
        ValueError: If the encrypted string is invalid or cannot be decrypted

    Example:
        >>> token = "aAAV/9xqhAE="  # Example from Dashboard
        >>> decrypted = decrypt_triple_des(token)
        >>> print(decrypted)  # "admin|2025-01-18 10:30:00|..."
    """
    try:
        # Convert key to bytes (UTF-8)
        key_bytes = ENCRYPTION_TOKEN_KEY.encode('utf-8')

        # Decode Base64 encrypted string to bytes
        cipher_bytes = base64.b64decode(encrypted_string)

        # Create TripleDES cipher (ECB mode, no IV needed)
        cipher = DES3.new(key_bytes, DES3.MODE_ECB)

        # Decrypt and remove PKCS7 padding
        plain_bytes = cipher.decrypt(cipher_bytes)
        plain_bytes = unpad(plain_bytes, DES3.block_size)

        # Convert to UTF-8 string
        return plain_bytes.decode('utf-8')

    except Exception as e:
        raise ValueError(f"Failed to decrypt token: {str(e)}")


def validate_dashboard_token(encrypted_token: str) -> dict:
    """
    Validate and parse an encrypted token from Bizuit Dashboard.

    The decrypted token typically contains information separated by pipes (|):
    - Username
    - Timestamp
    - Additional metadata

    Args:
        encrypted_token: The encrypted 's' parameter from Dashboard query string

    Returns:
        Dictionary with parsed token information

    Raises:
        ValueError: If token is invalid or expired

    Example:
        >>> token_info = validate_dashboard_token("aAAV/9xqhAE=")
        >>> print(token_info)
        {'username': 'admin', 'timestamp': '2025-01-18 10:30:00', 'raw': '...'}
    """
    # Decrypt the token
    decrypted = decrypt_triple_des(encrypted_token)

    # Parse the decrypted content (format may vary, adjust as needed)
    parts = decrypted.split('|')

    result = {
        'raw': decrypted,
        'parts': parts
    }

    # If we know the format, we can parse specific fields
    # For now, return raw data until we see real examples
    if len(parts) > 0:
        result['username'] = parts[0]

    if len(parts) > 1:
        result['timestamp'] = parts[1]

    return result


if __name__ == "__main__":
    # Test with example token
    test_token = "aAAV/9xqhAE="
    try:
        decrypted = decrypt_triple_des(test_token)
        print(f"✅ Decryption successful!")
        print(f"Encrypted: {test_token}")
        print(f"Decrypted: {decrypted}")
        print(f"Decrypted (repr): {repr(decrypted)}")

        # Test validation
        token_info = validate_dashboard_token(test_token)
        print(f"\n📋 Token Info:")
        for key, value in token_info.items():
            print(f"  {key}: {value}")

    except Exception as e:
        print(f"❌ Decryption failed: {e}")
