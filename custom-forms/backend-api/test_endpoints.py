#!/usr/bin/env python3
"""
Simple test script for BIZUIT Custom Forms API endpoints

Tests basic functionality without needing pytest.
Run with: python3 test_endpoints.py
"""

import requests
import json
from typing import Dict, Any

BASE_URL = "http://localhost:8000"

def print_test(name: str, success: bool, details: str = ""):
    """Print test result"""
    status = "✅ PASS" if success else "❌ FAIL"
    print(f"{status} - {name}")
    if details:
        print(f"    {details}")
    print()

def test_health_check():
    """Test basic health check endpoint"""
    print("=" * 60)
    print("TEST 1: Health Check")
    print("=" * 60)

    try:
        response = requests.get(f"{BASE_URL}/")
        success = response.status_code == 200 and "status" in response.json()
        details = f"Status: {response.status_code}, Response: {response.json()}"
        print_test("GET /", success, details)
        return success
    except Exception as e:
        print_test("GET /", False, str(e))
        return False

def test_health_with_db():
    """Test health check with database connection"""
    print("=" * 60)
    print("TEST 2: Health Check with Database")
    print("=" * 60)

    try:
        response = requests.get(f"{BASE_URL}/health")
        data = response.json()
        success = response.status_code == 200 and "database" in data
        details = f"Status: {response.status_code}, DB Status: {data.get('database', {}).get('success')}"
        print_test("GET /health", success, details)
        return success
    except Exception as e:
        print_test("GET /health", False, str(e))
        return False

def test_admin_login(username: str = "admin", password: str = "admin123"):
    """Test admin login endpoint"""
    print("=" * 60)
    print("TEST 3: Admin Login")
    print("=" * 60)

    try:
        payload = {
            "username": username,
            "password": password
        }

        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json=payload,
            headers={"Content-Type": "application/json"}
        )

        data = response.json()
        success = response.status_code == 200

        if success and data.get("success"):
            details = f"✓ Login successful! Token received (length: {len(data.get('token', ''))})"
            print_test("POST /api/auth/login", True, details)
            print(f"    User: {data.get('user', {}).get('username')}")
            print(f"    Roles: {data.get('user', {}).get('roles')}")
            return data.get("token")
        else:
            error = data.get("error", "Unknown error")
            print_test("POST /api/auth/login", False, f"Error: {error}")
            return None

    except Exception as e:
        print_test("POST /api/auth/login", False, str(e))
        return None

def test_validate_token(token: str):
    """Test token validation endpoint"""
    print("=" * 60)
    print("TEST 4: Validate Session Token")
    print("=" * 60)

    if not token:
        print_test("POST /api/auth/validate", False, "No token available (login failed)")
        return False

    try:
        payload = {"token": token}
        response = requests.post(
            f"{BASE_URL}/api/auth/validate",
            json=payload,
            headers={"Content-Type": "application/json"}
        )

        data = response.json()
        success = response.status_code == 200 and data.get("valid")
        details = f"Valid: {data.get('valid')}, User: {data.get('user', {}).get('username')}"
        print_test("POST /api/auth/validate", success, details)
        return success

    except Exception as e:
        print_test("POST /api/auth/validate", False, str(e))
        return False

def test_protected_endpoint_without_auth():
    """Test that protected endpoints reject requests without auth"""
    print("=" * 60)
    print("TEST 5: Protected Endpoint (No Auth)")
    print("=" * 60)

    try:
        # Try to upload without authorization
        response = requests.post(f"{BASE_URL}/api/deployment/upload")

        # Should return 401 Unauthorized
        success = response.status_code == 401
        details = f"Status: {response.status_code} (expected 401)"
        print_test("POST /api/deployment/upload (no auth)", success, details)
        return success

    except Exception as e:
        print_test("POST /api/deployment/upload (no auth)", False, str(e))
        return False

def test_protected_endpoint_with_auth(token: str):
    """Test that protected endpoints accept valid auth"""
    print("=" * 60)
    print("TEST 6: Protected Endpoint (With Auth)")
    print("=" * 60)

    if not token:
        print_test("GET /api/deployment/list (with auth)", False, "No token available (login failed)")
        return False

    try:
        # Try to access a protected endpoint with authorization
        response = requests.get(
            f"{BASE_URL}/api/deployment/list",
            headers={"Authorization": f"Bearer {token}"}
        )

        # Should return 200 OK or 404 if endpoint doesn't exist yet
        # But NOT 401 Unauthorized
        success = response.status_code != 401
        details = f"Status: {response.status_code} (expected NOT 401)"

        print_test("GET /api/deployment/list (with auth)", success, details)
        return success

    except Exception as e:
        print_test("GET /api/deployment/list (with auth)", False, str(e))
        return False

def test_get_custom_forms():
    """Test getting list of custom forms"""
    print("=" * 60)
    print("TEST 7: Get Custom Forms")
    print("=" * 60)

    try:
        response = requests.get(f"{BASE_URL}/api/custom-forms")
        data = response.json()

        success = response.status_code == 200 and isinstance(data, list)
        details = f"Status: {response.status_code}, Forms count: {len(data) if isinstance(data, list) else 0}"
        print_test("GET /api/custom-forms", success, details)

        if success and len(data) > 0:
            print(f"    Sample form: {data[0].get('formName')}")

        return success

    except Exception as e:
        print_test("GET /api/custom-forms", False, str(e))
        return False

def main():
    """Run all tests"""
    print("\n")
    print("╔═══════════════════════════════════════════════════════════╗")
    print("║       BIZUIT CUSTOM FORMS API - TEST SUITE               ║")
    print("╚═══════════════════════════════════════════════════════════╝")
    print()

    results = []

    # Test 1: Basic health check
    results.append(test_health_check())

    # Test 2: Health with DB
    results.append(test_health_with_db())

    # Test 3: Admin login
    token = test_admin_login()
    results.append(token is not None)

    # Test 4: Validate token
    results.append(test_validate_token(token))

    # Test 5: Protected endpoint without auth
    results.append(test_protected_endpoint_without_auth())

    # Test 6: Protected endpoint with auth
    results.append(test_protected_endpoint_with_auth(token))

    # Test 7: Get custom forms
    results.append(test_get_custom_forms())

    # Summary
    print("=" * 60)
    print("SUMMARY")
    print("=" * 60)
    passed = sum(results)
    total = len(results)
    percentage = (passed / total * 100) if total > 0 else 0

    print(f"Tests passed: {passed}/{total} ({percentage:.1f}%)")
    print()

    if passed == total:
        print("🎉 All tests passed!")
    else:
        print("⚠️  Some tests failed. Check output above for details.")

    print()

if __name__ == "__main__":
    main()
