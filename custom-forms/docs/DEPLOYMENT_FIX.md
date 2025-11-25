# Deployment Permission Fix

## Problem
Azure Pipeline fails with: `Cannot read configuration file due to insufficient permissions` when trying to stop IIS Application Pool.

## Root Cause
The Azure DevOps agent service account lacks permissions to:
- Access IIS configuration files (redirection.config)
- Manage IIS Application Pools
- Import WebAdministration PowerShell module

## Solution: Grant IIS Permissions to Agent Account

### Step 1: Identify Agent Service Account
On the deployment server (test.bizuit.com):

```powershell
# Find the Azure DevOps agent service
Get-Service -Name "vstsagent*" | Select-Object Name, StartType, Status, @{Name="ServiceAccount";Expression={(Get-WmiObject Win32_Service -Filter "Name='$($_.Name)'").StartName}}
```

The service account is likely one of:
- `NT SERVICE\vstsagent.Testbizuitcom.*`
- A custom domain account
- `NETWORK SERVICE`

### Step 2: Grant IIS_IUSRS Group Membership

```powershell
# Add agent account to IIS_IUSRS group (replace with actual account)
$agentAccount = "NT SERVICE\vstsagent.Testbizuitcom.Agent-1"  # Adjust based on Step 1
Add-LocalGroupMember -Group "IIS_IUSRS" -Member $agentAccount
```

### Step 3: Grant IIS Administrator Permissions

```powershell
# Import IIS management module
Import-Module WebAdministration

# Grant Full Control on IIS configuration
$agentAccount = "NT SERVICE\vstsagent.Testbizuitcom.Agent-1"  # Adjust
$iisConfigPath = "C:\Windows\System32\inetsrv\config"

$acl = Get-Acl $iisConfigPath
$permission = New-Object System.Security.AccessControl.FileSystemAccessRule(
    $agentAccount,
    "FullControl",
    "ContainerInherit,ObjectInherit",
    "None",
    "Allow"
)
$acl.SetAccessRule($permission)
Set-Acl -Path $iisConfigPath -AclObject $acl

Write-Host "✓ Granted IIS config permissions to: $agentAccount"
```

### Step 4: Grant Application Pool Management Rights

```powershell
# Add to Administrators group (most permissive, for CI/CD)
Add-LocalGroupMember -Group "Administrators" -Member $agentAccount

# OR less permissive: Grant specific IIS permissions
icacls "C:\Windows\System32\inetsrv" /grant "${agentAccount}:(OI)(CI)F" /T
```

### Step 5: Restart Agent Service

```powershell
# Restart Azure DevOps agent to apply permissions
Restart-Service -Name "vstsagent*"
```

## Alternative: Use appcmd.exe Instead of PowerShell Module

If permissions can't be granted, modify the pipeline to use `appcmd.exe` which may have different permission requirements:

```powershell
# Stop app pool using appcmd
& "$env:SystemRoot\System32\inetsrv\appcmd.exe" stop apppool /apppool.name:"BizuitCustomFormsSample"

# Start app pool using appcmd
& "$env:SystemRoot\System32\inetsrv\appcmd.exe" start apppool /apppool.name:"BizuitCustomFormsSample"
```

## Alternative: Deploy Without Stopping App Pool

Remove app pool management from pipeline and use one of these approaches:

### A) Manual Recycling
- Let IIS handle file locks through Application Pool recycling
- Configure app pool to recycle on file changes

### B) Use Robocopy with Retry
```powershell
# Robocopy can handle locked files better
robocopy "$(System.ArtifactsDirectory)\drop\example" "$(deployPath)" /MIR /R:5 /W:5 /NFL /NDL
```

### C) Deploy to Temporary Directory and Swap
```powershell
# Deploy to temp location
$tempDir = "$(deployPath)_new"
# Copy files to temp
# Stop app pool (if possible)
# Swap directories
# Start app pool
```

## Verification

After applying permissions, test manually on the server:

```powershell
# Test as agent account (if using runas)
Import-Module WebAdministration
Get-WebAppPoolState -Name "BizuitCustomFormsSample"
Stop-WebAppPool -Name "BizuitCustomFormsSample"
Start-WebAppPool -Name "BizuitCustomFormsSample"
```

## Risk Assessment
- **High permission approach** (Administrators group): Simplest, works immediately, security concern
- **Moderate permission approach** (IIS_IUSRS + config permissions): Balanced security
- **Low permission approach** (appcmd.exe or no app pool management): Most secure, may have deployment challenges

## Recommended Action
1. Try appcmd.exe approach first (lowest risk, no permission changes)
2. If that fails, grant IIS_IUSRS membership + config folder permissions
3. Only use Administrators group as last resort for development environments
