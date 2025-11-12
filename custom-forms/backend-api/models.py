from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


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
