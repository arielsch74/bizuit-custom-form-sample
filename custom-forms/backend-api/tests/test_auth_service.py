"""
Unit Tests for Authentication Service

These are TRUE unit tests - they use mocks and don't require external services
"""

import pytest
from unittest.mock import patch, MagicMock
from datetime import datetime, timedelta
import jwt

# Add parent directory to path to import modules
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

from auth_service import (
    login_to_bizuit,
    validate_admin_user,
    generate_session_token,
    verify_session_token,
    refresh_session_token,
    extract_bearer_token
)


class TestLoginToBizuit:
    """Unit tests for login_to_bizuit function"""

    @patch('auth_service.requests.get')
    def test_login_success(self, mock_get):
        """Test successful login to BIZUIT API"""
        # Arrange: Mock successful API response
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "token": "mock_bizuit_token_12345",
            "user": {"username": "admin", "userID": 1}
        }
        mock_get.return_value = mock_response

        # Act: Call the function
        result = login_to_bizuit("admin", "password123")

        # Assert: Verify results
        assert result["success"] is True
        assert result["token"] == "mock_bizuit_token_12345"
        assert result["error"] is None

        # Verify API was called with correct params
        mock_get.assert_called_once()
        call_args = mock_get.call_args
        assert "Authorization" in call_args[1]["headers"]
        assert call_args[1]["headers"]["Authorization"].startswith("Basic ")

    @patch('auth_service.requests.get')
    def test_login_invalid_credentials(self, mock_get):
        """Test login with invalid credentials (401/500 response)"""
        # Arrange: Mock failed API response
        mock_response = MagicMock()
        mock_response.status_code = 500
        mock_get.return_value = mock_response

        # Act
        result = login_to_bizuit("admin", "wrong_password")

        # Assert
        assert result["success"] is False
        assert result["token"] is None
        assert result["error"] == "Invalid credentials"

    @patch('auth_service.requests.get')
    def test_login_missing_token_in_response(self, mock_get):
        """Test when API returns 200 but no token in response"""
        # Arrange: Mock response without token
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {"user": {"username": "admin"}}  # No token
        mock_get.return_value = mock_response

        # Act
        result = login_to_bizuit("admin", "password123")

        # Assert
        assert result["success"] is False
        assert result["token"] is None
        assert "Invalid response" in result["error"]

    @patch('auth_service.requests.get')
    def test_login_timeout(self, mock_get):
        """Test login timeout handling"""
        # Arrange: Mock timeout exception
        import requests
        mock_get.side_effect = requests.exceptions.Timeout()

        # Act
        result = login_to_bizuit("admin", "password123")

        # Assert
        assert result["success"] is False
        assert result["token"] is None
        assert "timeout" in result["error"].lower()

    @patch('auth_service.requests.get')
    def test_login_network_error(self, mock_get):
        """Test login with network error"""
        # Arrange: Mock network exception
        import requests
        mock_get.side_effect = requests.exceptions.ConnectionError("Network error")

        # Act
        result = login_to_bizuit("admin", "password123")

        # Assert
        assert result["success"] is False
        assert result["token"] is None
        assert "error" in result["error"].lower()


class TestValidateAdminUser:
    """Unit tests for validate_admin_user function"""

    @patch('auth_service.get_user_info')
    @patch('auth_service.validate_admin_roles')
    def test_validate_admin_success(self, mock_validate_roles, mock_get_user):
        """Test successful admin validation"""
        # Arrange: Mock successful role validation
        mock_validate_roles.return_value = {
            "has_access": True,
            "user_roles": ["Administrators", "BIZUIT Admins"]
        }
        mock_get_user.return_value = {
            "userId": 1,
            "userName": "admin",
            "email": "admin@test.com",
            "displayName": "Administrator"
        }

        # Act
        result = validate_admin_user("admin", "fake_bizuit_token")

        # Assert
        assert result["has_access"] is True
        assert len(result["user_roles"]) == 2
        assert "Administrators" in result["user_roles"]
        assert result["user_info"]["userName"] == "admin"

    @patch('auth_service.validate_admin_roles')
    def test_validate_admin_no_access(self, mock_validate_roles):
        """Test user without admin roles"""
        # Arrange: Mock failed role validation
        mock_validate_roles.return_value = {
            "has_access": False,
            "user_roles": ["Registered Users"]
        }

        # Act
        result = validate_admin_user("regular_user", "fake_bizuit_token")

        # Assert
        assert result["has_access"] is False
        assert result["user_info"] is None
        assert "Registered Users" in result["user_roles"]


class TestJWTTokenOperations:
    """Unit tests for JWT token generation and validation"""

    def test_generate_session_token(self):
        """Test JWT session token generation"""
        # Arrange
        username = "test_user"
        bizuit_token = "fake_bizuit_token"
        user_info = {
            "userId": 1,
            "userName": "test_user",
            "email": "test@example.com"
        }

        # Act
        token = generate_session_token(username, bizuit_token, user_info)

        # Assert
        assert isinstance(token, str)
        assert len(token) > 100  # JWT tokens are long
        assert token.count('.') == 2  # JWT has 3 parts separated by dots

        # Decode and verify content (without validation)
        import os
        from dotenv import load_dotenv
        load_dotenv()

        jwt_secret = os.getenv("JWT_SECRET_KEY", "change-this-secret-key")
        decoded = jwt.decode(token, jwt_secret, algorithms=["HS256"])

        assert decoded["username"] == username
        assert decoded["bizuit_token"] == bizuit_token
        assert decoded["user_info"]["userId"] == 1
        assert decoded["type"] == "admin_session"
        assert "exp" in decoded  # Has expiration

    def test_verify_valid_token(self):
        """Test verification of valid token"""
        # Arrange: Generate a valid token
        username = "test_user"
        bizuit_token = "fake_token"
        user_info = {"userId": 1, "userName": "test_user"}

        token = generate_session_token(username, bizuit_token, user_info)

        # Act: Verify the token
        payload = verify_session_token(token)

        # Assert
        assert payload is not None
        assert payload["username"] == username
        assert payload["bizuit_token"] == bizuit_token
        assert payload["type"] == "admin_session"

    def test_verify_expired_token(self):
        """Test verification of expired token"""
        # Arrange: Generate token with immediate expiration
        import os
        from dotenv import load_dotenv
        load_dotenv()

        jwt_secret = os.getenv("JWT_SECRET_KEY", "change-this-secret-key")

        # Create expired token (expired 1 hour ago)
        expiration = datetime.utcnow() - timedelta(hours=1)
        payload = {
            "username": "test_user",
            "bizuit_token": "fake_token",
            "user_info": {},
            "exp": expiration,
            "type": "admin_session"
        }
        expired_token = jwt.encode(payload, jwt_secret, algorithm="HS256")

        # Act: Try to verify expired token
        result = verify_session_token(expired_token)

        # Assert
        assert result is None  # Expired tokens return None

    def test_verify_invalid_signature(self):
        """Test verification of token with invalid signature"""
        # Arrange: Create token with wrong secret
        wrong_secret = "wrong_secret_key_12345"
        payload = {
            "username": "test_user",
            "exp": datetime.utcnow() + timedelta(minutes=30),
            "type": "admin_session"
        }
        invalid_token = jwt.encode(payload, wrong_secret, algorithm="HS256")

        # Act: Try to verify with correct secret
        result = verify_session_token(invalid_token)

        # Assert
        assert result is None  # Invalid signature returns None

    def test_verify_wrong_token_type(self):
        """Test verification of token with wrong type"""
        # Arrange: Generate token with wrong type
        import os
        from dotenv import load_dotenv
        load_dotenv()

        jwt_secret = os.getenv("JWT_SECRET_KEY", "change-this-secret-key")

        payload = {
            "username": "test_user",
            "exp": datetime.utcnow() + timedelta(minutes=30),
            "type": "wrong_type"  # Not "admin_session"
        }
        wrong_type_token = jwt.encode(payload, jwt_secret, algorithm="HS256")

        # Act
        result = verify_session_token(wrong_type_token)

        # Assert
        assert result is None  # Wrong type returns None


class TestRefreshSessionToken:
    """Unit tests for token refresh functionality"""

    def test_refresh_valid_token(self):
        """Test refreshing a valid token"""
        # Arrange: Generate initial token
        username = "test_user"
        bizuit_token = "fake_token"
        user_info = {"userId": 1, "userName": "test_user"}

        old_token = generate_session_token(username, bizuit_token, user_info)

        # Wait 1 second to ensure different timestamp
        import time
        time.sleep(1)

        # Act: Refresh the token
        new_token = refresh_session_token(old_token)

        # Assert
        assert new_token is not None
        assert new_token != old_token  # Should be a new token (different exp and iat)

        # Verify new token is valid
        payload = verify_session_token(new_token)
        assert payload is not None
        assert payload["username"] == username

    def test_refresh_invalid_token(self):
        """Test refreshing an invalid token"""
        # Arrange: Invalid token
        invalid_token = "invalid.token.here"

        # Act
        new_token = refresh_session_token(invalid_token)

        # Assert
        assert new_token is None  # Can't refresh invalid token


class TestExtractBearerToken:
    """Unit tests for Bearer token extraction"""

    def test_extract_valid_bearer_token(self):
        """Test extracting valid Bearer token from header"""
        # Arrange
        auth_header = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.fake.token"

        # Act
        token = extract_bearer_token(auth_header)

        # Assert
        assert token == "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.fake.token"

    def test_extract_bearer_case_insensitive(self):
        """Test that 'bearer' works (lowercase)"""
        # Arrange
        auth_header = "bearer test.token.here"

        # Act
        token = extract_bearer_token(auth_header)

        # Assert
        assert token == "test.token.here"

    def test_extract_missing_bearer_prefix(self):
        """Test header without Bearer prefix"""
        # Arrange
        auth_header = "JustAToken"

        # Act
        token = extract_bearer_token(auth_header)

        # Assert
        assert token is None

    def test_extract_empty_header(self):
        """Test empty authorization header"""
        # Act
        token = extract_bearer_token(None)

        # Assert
        assert token is None

    def test_extract_malformed_header(self):
        """Test malformed authorization header"""
        # Arrange
        auth_header = "Bearer"  # Missing token

        # Act
        token = extract_bearer_token(auth_header)

        # Assert
        assert token is None


class TestTenantValidation:
    """Unit tests for tenant-based JWT token validation"""

    def test_generate_token_with_tenant_id(self):
        """Test JWT token generation with tenant_id"""
        # Arrange
        username = "test_user"
        bizuit_token = "fake_bizuit_token"
        user_info = {
            "userId": 1,
            "userName": "test_user",
            "email": "test@example.com"
        }
        tenant_id = "arielsch"

        # Act
        token = generate_session_token(username, bizuit_token, user_info, tenant_id)

        # Assert
        assert isinstance(token, str)
        assert len(token) > 100

        # Decode and verify tenant_id is in payload
        import os
        from dotenv import load_dotenv
        load_dotenv()

        jwt_secret = os.getenv("JWT_SECRET_KEY", "change-this-secret-key")
        decoded = jwt.decode(token, jwt_secret, algorithms=["HS256"])

        assert decoded["username"] == username
        assert decoded["tenant_id"] == tenant_id
        assert decoded["type"] == "admin_session"

    def test_verify_token_with_correct_tenant(self):
        """Test token verification with correct tenant_id"""
        # Arrange: Generate token with tenant_id
        username = "test_user"
        bizuit_token = "fake_token"
        user_info = {"userId": 1, "userName": "test_user"}
        tenant_id = "arielsch"

        token = generate_session_token(username, bizuit_token, user_info, tenant_id)

        # Act: Verify with matching tenant_id
        payload = verify_session_token(token, tenant_id)

        # Assert
        assert payload is not None
        assert payload["username"] == username
        assert payload["tenant_id"] == tenant_id

    def test_verify_token_with_incorrect_tenant(self):
        """Test token verification with incorrect tenant_id"""
        # Arrange: Generate token for arielsch
        username = "test_user"
        bizuit_token = "fake_token"
        user_info = {"userId": 1, "userName": "test_user"}
        tenant_id = "arielsch"

        token = generate_session_token(username, bizuit_token, user_info, tenant_id)

        # Act: Try to verify with different tenant_id (recubiz)
        payload = verify_session_token(token, "recubiz")

        # Assert: Should fail validation
        assert payload is None

    def test_verify_token_without_tenant_id_in_payload(self):
        """Test token verification when payload doesn't have tenant_id"""
        # Arrange: Create token WITHOUT tenant_id (legacy token)
        import os
        from dotenv import load_dotenv
        load_dotenv()

        jwt_secret = os.getenv("JWT_SECRET_KEY", "change-this-secret-key")

        payload = {
            "username": "test_user",
            "bizuit_token": "fake_token",
            "user_info": {},
            "exp": datetime.utcnow() + timedelta(minutes=30),
            "type": "admin_session"
            # NO tenant_id
        }
        legacy_token = jwt.encode(payload, jwt_secret, algorithm="HS256")

        # Act: Try to verify with expected tenant_id
        result = verify_session_token(legacy_token, "arielsch")

        # Assert: Should fail (missing tenant_id)
        assert result is None

    def test_generate_token_without_tenant_defaults_to_default(self):
        """Test token generation without tenant_id uses 'default'"""
        # Arrange
        username = "test_user"
        bizuit_token = "fake_token"
        user_info = {"userId": 1}

        # Act: Generate token without tenant_id (backward compatibility)
        token = generate_session_token(username, bizuit_token, user_info)

        # Assert
        import os
        from dotenv import load_dotenv
        load_dotenv()

        jwt_secret = os.getenv("JWT_SECRET_KEY", "change-this-secret-key")
        decoded = jwt.decode(token, jwt_secret, algorithms=["HS256"])

        # Should have default tenant_id
        assert decoded.get("tenant_id") == "default"


# Run with: pytest tests/test_auth_service.py -v
