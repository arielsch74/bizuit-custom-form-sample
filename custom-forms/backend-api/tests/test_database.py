"""
Unit Tests for Database Module

These tests use mocks for pyodbc to avoid real database connections
"""

import pytest
from unittest.mock import patch, MagicMock
from datetime import datetime, timedelta

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

from database import (
    validate_admin_roles,
    get_user_info,
    validate_security_token,
    delete_security_token
)


class TestValidateAdminRoles:
    """Unit tests for validate_admin_roles function"""

    @patch('database.get_db_connection')
    def test_user_has_admin_role(self, mock_get_conn):
        """Test user with valid admin role"""
        # Arrange: Mock database connection and cursor
        mock_conn = MagicMock()
        mock_cursor = MagicMock()
        mock_conn.cursor.return_value = mock_cursor
        mock_get_conn.return_value = mock_conn

        # Mock query result: user has "Administrators" role
        mock_cursor.fetchall.return_value = [
            ("Administrators",),
            ("Registered Users",)
        ]

        # Act
        result = validate_admin_roles("admin", ["Administrators", "SuperAdmin"])

        # Assert
        assert result["has_access"] is True
        assert "Administrators" in result["user_roles"]
        assert len(result["user_roles"]) == 2

        # Verify query was executed
        mock_cursor.execute.assert_called_once()
        mock_cursor.close.assert_called_once()
        mock_conn.close.assert_called_once()

    @patch('database.get_db_connection')
    def test_user_without_admin_role(self, mock_get_conn):
        """Test user without admin roles"""
        # Arrange
        mock_conn = MagicMock()
        mock_cursor = MagicMock()
        mock_conn.cursor.return_value = mock_cursor
        mock_get_conn.return_value = mock_conn

        # Mock query result: user only has "Registered Users"
        mock_cursor.fetchall.return_value = [
            ("Registered Users",),
        ]

        # Act
        result = validate_admin_roles("regular_user", ["Administrators", "SuperAdmin"])

        # Assert
        assert result["has_access"] is False
        assert "Registered Users" in result["user_roles"]
        assert "Administrators" not in result["user_roles"]

    @patch('database.get_db_connection')
    def test_user_not_found(self, mock_get_conn):
        """Test user that doesn't exist"""
        # Arrange
        mock_conn = MagicMock()
        mock_cursor = MagicMock()
        mock_conn.cursor.return_value = mock_cursor
        mock_get_conn.return_value = mock_conn

        # Mock query result: no roles found
        mock_cursor.fetchall.return_value = []

        # Act
        result = validate_admin_roles("nonexistent_user", ["Administrators"])

        # Assert
        assert result["has_access"] is False
        assert len(result["user_roles"]) == 0

    @patch('database.get_db_connection')
    def test_database_error_handling(self, mock_get_conn):
        """Test database error handling"""
        # Arrange: Mock database exception
        mock_get_conn.side_effect = Exception("Database connection error")

        # Act & Assert: Should raise exception
        with pytest.raises(Exception) as exc_info:
            validate_admin_roles("admin", ["Administrators"])

        assert "Database connection error" in str(exc_info.value)


class TestGetUserInfo:
    """Unit tests for get_user_info function"""

    @patch('database.get_db_connection')
    def test_get_existing_user(self, mock_get_conn):
        """Test getting info for existing user"""
        # Arrange
        mock_conn = MagicMock()
        mock_cursor = MagicMock()
        mock_conn.cursor.return_value = mock_cursor
        mock_get_conn.return_value = mock_conn

        # Mock query result
        mock_cursor.fetchone.return_value = (
            1,  # UserID
            "admin",  # Username
            "admin@test.com",  # Email
            "Administrator Account",  # DisplayName
            "Administrator",  # FirstName
            "Account"  # LastName
        )

        # Act
        result = get_user_info("admin")

        # Assert
        assert result is not None
        assert result["userId"] == 1
        assert result["userName"] == "admin"
        assert result["email"] == "admin@test.com"
        assert result["displayName"] == "Administrator Account"
        assert result["firstName"] == "Administrator"
        assert result["lastName"] == "Account"

    @patch('database.get_db_connection')
    def test_get_nonexistent_user(self, mock_get_conn):
        """Test getting info for user that doesn't exist"""
        # Arrange
        mock_conn = MagicMock()
        mock_cursor = MagicMock()
        mock_conn.cursor.return_value = mock_cursor
        mock_get_conn.return_value = mock_conn

        # Mock query result: no user found
        mock_cursor.fetchone.return_value = None

        # Act
        result = get_user_info("nonexistent_user")

        # Assert
        assert result is None


class TestValidateSecurityToken:
    """Unit tests for validate_security_token function"""

    @patch('database.get_db_connection')
    def test_validate_valid_token(self, mock_get_conn):
        """Test validating a valid, non-expired token"""
        # Arrange
        mock_conn = MagicMock()
        mock_cursor = MagicMock()
        mock_conn.cursor.return_value = mock_cursor
        mock_get_conn.return_value = mock_conn

        # Mock token data (expires in 1 hour)
        future_expiration = datetime.now() + timedelta(hours=1)
        mock_cursor.fetchone.return_value = (
            "141191",  # TokenId (valid integer format)
            "testuser",  # UserName
            1,  # Operation
            "FormEvent",  # EventName
            "192.168.1.1",  # RequesterAddress
            future_expiration,  # ExpirationDate
            "instance-123"  # InstanceId
        )

        # Act
        result = validate_security_token("141191")

        # Assert
        assert result is not None
        assert result["tokenId"] == "141191"
        assert result["userName"] == "testuser"
        assert result["operation"] == 1
        assert result["is_valid"] is True  # Not expired

    @patch('database.get_db_connection')
    def test_validate_expired_token(self, mock_get_conn):
        """Test validating an expired token"""
        # Arrange
        mock_conn = MagicMock()
        mock_cursor = MagicMock()
        mock_conn.cursor.return_value = mock_cursor
        mock_get_conn.return_value = mock_conn

        # Mock expired token (expired 1 hour ago)
        past_expiration = datetime.now() - timedelta(hours=1)
        mock_cursor.fetchone.return_value = (
            "141192",
            "testuser",
            1,
            "FormEvent",
            "192.168.1.1",
            past_expiration,
            "instance-123"
        )

        # Act
        result = validate_security_token("141192")

        # Assert
        assert result is not None
        assert result["is_valid"] is False  # Expired

    @patch('database.get_db_connection')
    def test_validate_nonexistent_token(self, mock_get_conn):
        """Test validating a token that doesn't exist"""
        # Arrange
        mock_conn = MagicMock()
        mock_cursor = MagicMock()
        mock_conn.cursor.return_value = mock_cursor
        mock_get_conn.return_value = mock_conn

        # Mock query result: no token found
        mock_cursor.fetchone.return_value = None

        # Act
        result = validate_security_token("999999")

        # Assert
        assert result is None


class TestDeleteSecurityToken:
    """Unit tests for delete_security_token function"""

    @patch('database.get_db_connection')
    def test_delete_existing_token(self, mock_get_conn):
        """Test deleting an existing token"""
        # Arrange
        mock_conn = MagicMock()
        mock_cursor = MagicMock()
        mock_conn.cursor.return_value = mock_cursor
        mock_get_conn.return_value = mock_conn

        # Mock successful deletion (1 row affected)
        mock_cursor.rowcount = 1

        # Act
        result = delete_security_token("141193")

        # Assert
        assert result is True
        mock_cursor.execute.assert_called_once()
        mock_conn.commit.assert_called_once()

    @patch('database.get_db_connection')
    def test_delete_nonexistent_token(self, mock_get_conn):
        """Test deleting a token that doesn't exist"""
        # Arrange
        mock_conn = MagicMock()
        mock_cursor = MagicMock()
        mock_conn.cursor.return_value = mock_cursor
        mock_get_conn.return_value = mock_conn

        # Mock deletion with no rows affected
        mock_cursor.rowcount = 0

        # Act
        result = delete_security_token("999998")

        # Assert
        assert result is False  # Token not found


# Run with: pytest tests/test_database.py -v
