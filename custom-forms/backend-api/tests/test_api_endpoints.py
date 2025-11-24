"""
Unit Tests for FastAPI Endpoints

These tests use httpx.AsyncClient and mock dependencies
"""

import pytest
from unittest.mock import patch, MagicMock
from httpx import AsyncClient
from datetime import datetime, timedelta

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

from main import app


@pytest.fixture
def mock_bizuit_login():
    """Fixture to mock BIZUIT login"""
    with patch('auth_service.login_to_bizuit') as mock:
        mock.return_value = {
            "success": True,
            "token": "mock_bizuit_token",
            "error": None
        }
        yield mock


@pytest.fixture
def mock_admin_validation():
    """Fixture to mock admin user validation"""
    with patch('auth_service.validate_admin_user') as mock:
        mock.return_value = {
            "has_access": True,
            "user_roles": ["Administrators", "BIZUIT Admins"],
            "user_info": {
                "userId": 1,
                "userName": "admin",
                "email": "admin@test.com",
                "displayName": "Administrator"
            }
        }
        yield mock


@pytest.fixture
def mock_jwt_generation():
    """Fixture to mock JWT token generation"""
    with patch('auth_service.generate_session_token') as mock:
        mock.return_value = "mock_jwt_token_eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9"
        yield mock


class TestHealthEndpoints:
    """Tests for health check endpoints"""

    @pytest.mark.asyncio
    async def test_root_endpoint(self):
        """Test GET / returns healthy status"""
        async with AsyncClient(app=app, base_url="http://test") as client:
            response = await client.get("/")

        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert data["service"] == "BIZUIT Custom Forms API"
        assert "timestamp" in data

    @pytest.mark.asyncio
    @patch('main.test_connection')
    async def test_health_endpoint_success(self, mock_test_conn):
        """Test GET /health with successful DB connection"""
        # Arrange: Mock successful DB connection
        mock_test_conn.return_value = {
            "success": True,
            "message": "Connection successful",
            "version": "Test SQL Server"
        }

        # Act
        async with AsyncClient(app=app, base_url="http://test") as client:
            response = await client.get("/health")

        # Assert
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert data["database"]["success"] is True

    @pytest.mark.asyncio
    @patch('main.test_connection')
    async def test_health_endpoint_db_failure(self, mock_test_conn):
        """Test GET /health with DB connection failure"""
        # Arrange: Mock failed DB connection
        mock_test_conn.return_value = {
            "success": False,
            "message": "Connection failed"
        }

        # Act
        async with AsyncClient(app=app, base_url="http://test") as client:
            response = await client.get("/health")

        # Assert
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "degraded"  # Status is degraded when DB fails
        assert data["database"]["success"] is False


class TestAuthenticationEndpoints:
    """Tests for authentication endpoints"""

    @pytest.mark.asyncio
    async def test_login_success(self, mock_bizuit_login, mock_admin_validation, mock_jwt_generation):
        """Test successful admin login"""
        # Act
        async with AsyncClient(app=app, base_url="http://test") as client:
            response = await client.post(
                "/api/auth/login",
                json={"username": "admin", "password": "admin123"}
            )

        # Assert
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "token" in data
        assert data["user"]["username"] == "admin"
        assert len(data["user"]["roles"]) > 0

    @pytest.mark.asyncio
    @patch('auth_service.login_to_bizuit')
    async def test_login_invalid_credentials(self, mock_login):
        """Test login with invalid credentials"""
        # Arrange: Mock failed login
        mock_login.return_value = {
            "success": False,
            "token": None,
            "error": "Invalid credentials"
        }

        # Act
        async with AsyncClient(app=app, base_url="http://test") as client:
            response = await client.post(
                "/api/auth/login",
                json={"username": "admin", "password": "wrong"}
            )

        # Assert
        assert response.status_code == 200  # FastAPI returns 200 with error in body
        data = response.json()
        assert data["success"] is False
        assert "error" in data

    @pytest.mark.asyncio
    @patch('main.validate_admin_user')
    @patch('main.login_to_bizuit')
    async def test_login_no_admin_access(self, mock_login, mock_validate):
        """Test login where user doesn't have admin access"""
        # Arrange
        mock_login.return_value = {
            "success": True,
            "token": "bizuit_token",
            "error": None
        }
        mock_validate.return_value = {
            "has_access": False,
            "user_roles": ["Registered Users"],
            "user_info": None
        }

        # Act
        async with AsyncClient(app=app, base_url="http://test") as client:
            response = await client.post(
                "/api/auth/login",
                json={"username": "user", "password": "password"}
            )

        # Assert
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is False
        assert "administrator" in data["error"].lower()

    @pytest.mark.asyncio
    @patch('main.verify_session_token')
    async def test_validate_token_success(self, mock_verify):
        """Test validating a valid token"""
        # Arrange
        mock_verify.return_value = {
            "username": "admin",
            "user_info": {"userId": 1},
            "exp": (datetime.utcnow() + timedelta(minutes=30)).timestamp()
        }

        # Act
        async with AsyncClient(app=app, base_url="http://test") as client:
            response = await client.post(
                "/api/auth/validate",
                json={"token": "valid_jwt_token"}
            )

        # Assert
        assert response.status_code == 200
        data = response.json()
        assert data["valid"] is True
        assert data["user"]["username"] == "admin"

    @pytest.mark.asyncio
    @patch('main.verify_session_token')
    async def test_validate_token_invalid(self, mock_verify):
        """Test validating an invalid token"""
        # Arrange
        mock_verify.return_value = None  # Invalid token

        # Act
        async with AsyncClient(app=app, base_url="http://test") as client:
            response = await client.post(
                "/api/auth/validate",
                json={"token": "invalid_token"}
            )

        # Assert
        assert response.status_code == 200
        data = response.json()
        assert data["valid"] is False

    @pytest.mark.asyncio
    @patch('main.refresh_session_token')
    async def test_refresh_token_success(self, mock_refresh):
        """Test refreshing a valid token"""
        # Arrange
        mock_refresh.return_value = "new_refreshed_jwt_token"

        # Act
        async with AsyncClient(app=app, base_url="http://test") as client:
            response = await client.post(
                "/api/auth/refresh",
                json={"token": "old_token"}
            )

        # Assert
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["token"] == "new_refreshed_jwt_token"


class TestProtectedEndpoints:
    """Tests for protected endpoints that require authentication"""

    @pytest.mark.asyncio
    async def test_protected_endpoint_no_auth(self):
        """Test accessing protected endpoint without authentication"""
        async with AsyncClient(app=app, base_url="http://test") as client:
            response = await client.post(
                "/api/deployment/upload",
                files={"file": ("test.zip", b"fake content", "application/zip")}
            )

        # Assert: Should return 401 Unauthorized
        assert response.status_code == 401
        data = response.json()
        assert "error" in data["detail"]

    @pytest.mark.asyncio
    async def test_protected_endpoint_invalid_token(self):
        """Test accessing protected endpoint with invalid token"""
        async with AsyncClient(app=app, base_url="http://test") as client:
            response = await client.post(
                "/api/deployment/upload",
                headers={"Authorization": "Bearer invalid_token_here"},
                files={"file": ("test.zip", b"fake content", "application/zip")}
            )

        # Assert: Should return 401 Unauthorized
        assert response.status_code == 401

    @pytest.mark.asyncio
    @patch('dependencies.verify_session_token')
    @patch('main.zipfile.ZipFile')
    async def test_protected_endpoint_with_valid_auth(self, mock_zipfile, mock_verify):
        """Test accessing protected endpoint with valid authentication"""
        # Arrange: Mock valid token
        mock_verify.return_value = {
            "username": "admin",
            "user_info": {"userId": 1},
            "type": "admin_session"
        }

        # Mock zipfile to avoid actual file processing
        mock_zip_instance = MagicMock()
        mock_zipfile.return_value.__enter__.return_value = mock_zip_instance
        mock_zip_instance.namelist.return_value = ["manifest.json"]
        mock_zip_instance.read.return_value = '{"version":"1.0","forms":[]}'

        # Act
        async with AsyncClient(app=app, base_url="http://test") as client:
            response = await client.post(
                "/api/deployment/upload",
                headers={"Authorization": "Bearer valid_jwt_token"},
                files={"file": ("test.zip", b"fake zip content", "application/zip")}
            )

        # Assert: Should NOT return 401
        assert response.status_code != 401


class TestFormTokenEndpoints:
    """Tests for form token validation endpoints"""

    @pytest.mark.asyncio
    @patch('main.validate_security_token')
    async def test_validate_form_token_valid(self, mock_validate):
        """Test validating a valid form token"""
        # Arrange
        mock_validate.return_value = {
            "tokenId": "token123",
            "userName": "testuser",
            "operation": 1,
            "eventName": "FormEvent",
            "requesterAddress": "192.168.1.1",
            "is_valid": True,
            "expirationDate": (datetime.utcnow() + timedelta(hours=1)).isoformat(),
            "instanceId": "instance-123"
        }

        # Act
        async with AsyncClient(app=app, base_url="http://test") as client:
            response = await client.post(
                "/api/forms/validate-token",
                json={"tokenId": "token123"}  # ← Fixed: tokenId not token_id
            )

        # Assert
        assert response.status_code == 200
        data = response.json()
        assert data["valid"] is True
        assert data["token"]["tokenId"] == "token123"

    @pytest.mark.asyncio
    @patch('main.validate_security_token')
    async def test_validate_form_token_expired(self, mock_validate):
        """Test validating an expired form token"""
        # Arrange
        mock_validate.return_value = {
            "tokenId": "token123",
            "userName": "testuser",
            "operation": 1,
            "eventName": "FormEvent",
            "requesterAddress": "192.168.1.1",
            "is_valid": False,  # Expired
            "expirationDate": (datetime.utcnow() - timedelta(hours=1)).isoformat(),
            "instanceId": "instance-123"
        }

        # Act
        async with AsyncClient(app=app, base_url="http://test") as client:
            response = await client.post(
                "/api/forms/validate-token",
                json={"tokenId": "token123"}  # ← Fixed: tokenId not token_id
            )

        # Assert
        assert response.status_code == 200
        data = response.json()
        assert data["valid"] is False

    @pytest.mark.asyncio
    @patch('main.validate_security_token')
    async def test_validate_form_token_not_found(self, mock_validate):
        """Test validating a token that doesn't exist"""
        # Arrange
        mock_validate.return_value = None

        # Act
        async with AsyncClient(app=app, base_url="http://test") as client:
            response = await client.post(
                "/api/forms/validate-token",
                json={"tokenId": "nonexistent"}  # ← Fixed: tokenId not token_id
            )

        # Assert
        assert response.status_code == 200
        data = response.json()
        assert data["valid"] is False

    # NOTE: close-session endpoint not implemented yet, test commented out
    # @pytest.mark.asyncio
    # @patch('main.delete_security_token')
    # async def test_close_form_session_success(self, mock_delete):
    #     """Test closing a form session (deleting token)"""
    #     # Arrange
    #     mock_delete.return_value = True
    #
    #     # Act
    #     async with AsyncClient(app=app, base_url="http://test") as client:
    #         response = await client.post(
    #             "/api/forms/close-session",
    #             json={"token_id": "token123"}
    #         )
    #
    #     # Assert
    #     assert response.status_code == 200
    #     data = response.json()
    #     assert data["success"] is True


class TestTenantIsolation:
    """Tests for tenant-based authentication isolation"""

    @pytest.mark.asyncio
    async def test_login_with_tenant_id(self, mock_bizuit_login, mock_admin_validation):
        """Test login includes tenant_id in JWT"""
        # Arrange
        with patch('auth_service.generate_session_token') as mock_gen_token:
            mock_gen_token.return_value = "mock_jwt_token_with_tenant"

            # Act
            async with AsyncClient(app=app, base_url="http://test") as client:
                response = await client.post(
                    "/api/auth/login",
                    json={
                        "username": "admin",
                        "password": "admin123",
                        "tenant_id": "arielsch"
                    }
                )

            # Assert
            assert response.status_code == 200
            data = response.json()
            assert data["success"] is True
            assert "token" in data

            # Verify generate_session_token was called with tenant_id
            mock_gen_token.assert_called_once()
            call_args = mock_gen_token.call_args
            assert call_args[0][3] == "arielsch"  # tenant_id is 4th argument

    @pytest.mark.asyncio
    async def test_login_without_tenant_defaults_to_default(self, mock_bizuit_login, mock_admin_validation):
        """Test login without tenant_id uses 'default'"""
        # Arrange
        with patch('auth_service.generate_session_token') as mock_gen_token:
            mock_gen_token.return_value = "mock_jwt_token"

            # Act
            async with AsyncClient(app=app, base_url="http://test") as client:
                response = await client.post(
                    "/api/auth/login",
                    json={
                        "username": "admin",
                        "password": "admin123"
                        # No tenant_id provided
                    }
                )

            # Assert
            assert response.status_code == 200

            # Verify generate_session_token was called with default tenant
            call_args = mock_gen_token.call_args
            assert call_args[0][3] == "default"

    @pytest.mark.asyncio
    async def test_validate_token_rejects_wrong_tenant(self):
        """Test token validation rejects tokens from different tenant"""
        # Arrange: Generate token for arielsch
        from auth_service import generate_session_token
        arielsch_token = generate_session_token(
            username="admin",
            bizuit_token="fake_token",
            user_info={"userId": 1},
            tenant_id="arielsch"
        )

        # Act: Try to validate with recubiz tenant_id
        with patch('auth_service.verify_session_token') as mock_verify:
            mock_verify.return_value = None  # Tenant mismatch returns None

            async with AsyncClient(app=app, base_url="http://test") as client:
                response = await client.post(
                    "/api/auth/validate",
                    json={
                        "token": arielsch_token,
                        "tenant_id": "recubiz"
                    }
                )

            # Assert: Should fail validation
            data = response.json()
            assert data["valid"] is False

    @pytest.mark.asyncio
    async def test_validate_token_accepts_correct_tenant(self, mock_bizuit_login, mock_admin_validation):
        """Test token validation accepts token from correct tenant"""
        # Arrange: Generate token for arielsch
        from auth_service import generate_session_token
        arielsch_token = generate_session_token(
            username="admin",
            bizuit_token="fake_token",
            user_info={"userId": 1, "userName": "admin"},
            tenant_id="arielsch"
        )

        # Act: Validate with same tenant_id
        with patch('auth_service.verify_session_token') as mock_verify:
            mock_verify.return_value = {
                "username": "admin",
                "tenant_id": "arielsch",
                "type": "admin_session"
            }

            async with AsyncClient(app=app, base_url="http://test") as client:
                response = await client.post(
                    "/api/auth/validate",
                    json={
                        "token": arielsch_token,
                        "tenant_id": "arielsch"
                    }
                )

            # Assert: Should pass validation
            assert response.status_code == 200
            data = response.json()
            assert data["valid"] is True


# Configuration for pytest
def pytest_configure(config):
    """Configure pytest with asyncio mode"""
    config.addinivalue_line("markers", "asyncio: mark test as async")


# Run with: pytest tests/test_api_endpoints.py -v
