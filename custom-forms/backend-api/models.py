from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime


# ==============================================================================
# Admin Authentication Models
# ==============================================================================

class AdminLoginRequest(BaseModel):
    """Request model for admin login"""
    username: str
    password: str


class AdminLoginResponse(BaseModel):
    """Response model for admin login"""
    success: bool
    token: Optional[str] = None
    user: Optional[Dict[str, Any]] = None
    error: Optional[str] = None


class ValidateSessionRequest(BaseModel):
    """Request model for session validation"""
    token: str


class ValidateSessionResponse(BaseModel):
    """Response model for session validation"""
    valid: bool
    user: Optional[Dict[str, Any]] = None
    error: Optional[str] = None


# ==============================================================================
# Form Token Validation Models
# ==============================================================================

class SecurityToken(BaseModel):
    """Security token from BIZUITPersistenceStore.SecurityTokens table"""
    tokenId: str
    userName: str
    operation: int
    eventName: str
    requesterAddress: str
    expirationDate: datetime
    instanceId: Optional[str] = None


class ValidateFormTokenRequest(BaseModel):
    """Request model for form token validation"""
    tokenId: str


class ValidateFormTokenResponse(BaseModel):
    """Response model for form token validation"""
    valid: bool
    token: Optional[SecurityToken] = None
    error: Optional[str] = None


# ==============================================================================
# Dashboard Token Validation Models
# ==============================================================================

class ValidateDashboardTokenRequest(BaseModel):
    """
    Request model for Dashboard token validation.

    The Dashboard sends these parameters in the query string:
    ?InstanceId=123&UserName=admin&s=aAAV/9xqhAE=&eventName=MyProcess&activityName=Task1&token=xyz

    All parameters are optional except 's' (encrypted token).
    """
    # Required: encrypted security token
    encryptedToken: str  # The 's' parameter - TripleDES encrypted TokenId

    # Optional: additional Dashboard parameters to pass to the form
    instanceId: Optional[str] = None
    userName: Optional[str] = None
    eventName: Optional[str] = None
    activityName: Optional[str] = None
    token: Optional[str] = None  # Auth token (different from 's')


class DashboardParameters(BaseModel):
    """
    Parameters to pass to the loaded form.
    These come from both the Dashboard query string and the SecurityTokens table.
    """
    # From Dashboard query string
    instanceId: Optional[str] = None
    userName: Optional[str] = None
    eventName: Optional[str] = None
    activityName: Optional[str] = None
    token: Optional[str] = None

    # From SecurityTokens table (after decrypting 's')
    tokenId: Optional[str] = None
    operation: Optional[int] = None
    requesterAddress: Optional[str] = None
    expirationDate: Optional[str] = None


class ValidateDashboardTokenResponse(BaseModel):
    """
    Response model for Dashboard token validation.

    Returns:
    - Validation result (valid/invalid)
    - All parameters needed by the form (from both query string and SecurityTokens)
    - Error message if validation failed
    """
    valid: bool
    parameters: Optional[DashboardParameters] = None
    error: Optional[str] = None


# ==============================================================================
# Form Deployment Models
# ==============================================================================

class FormDeployment(BaseModel):
    """Representa un form dentro del deployment package"""
    formName: str
    processName: str
    version: str
    author: str
    description: str
    sizeBytes: int
    path: str


class DeploymentManifest(BaseModel):
    """Manifest.json del deployment package"""
    packageVersion: str
    buildDate: datetime
    commitHash: str
    forms: List[FormDeployment]


class FormDeploymentResult(BaseModel):
    """Resultado del procesamiento de un form individual"""
    formName: str
    success: bool
    action: str  # "inserted", "updated", "failed"
    error: Optional[str] = None


class UploadDeploymentResponse(BaseModel):
    """Response del upload endpoint"""
    success: bool
    message: str
    formsProcessed: int
    formsInserted: int
    formsUpdated: int
    errors: List[str]
    results: List[FormDeploymentResult]
