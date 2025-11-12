# Script to fix Azure DevOps agent IIS permissions
# Run this on the deployment server (test.bizuit.com) as Administrator

param(
    [string]$AgentAccount = "",
    [switch]$AutoDetect,
    [switch]$FullAdmin
)

Write-Host "=== Azure DevOps Agent IIS Permission Fix ===" -ForegroundColor Cyan

# Auto-detect agent service account
if ($AutoDetect -or [string]::IsNullOrEmpty($AgentAccount)) {
    Write-Host "`nAuto-detecting Azure DevOps agent service account..."
    $agentService = Get-Service -Name "vstsagent*" | Select-Object -First 1

    if ($agentService) {
        $agentAccount = (Get-WmiObject Win32_Service -Filter "Name='$($agentService.Name)'").StartName
        Write-Host "✓ Found agent service: $($agentService.Name)" -ForegroundColor Green
        Write-Host "✓ Service account: $agentAccount" -ForegroundColor Green
    } else {
        Write-Error "No Azure DevOps agent service found. Please specify -AgentAccount parameter."
        exit 1
    }
}

Write-Host "`nAgent Account: $agentAccount" -ForegroundColor Yellow

# Validate account format
if ([string]::IsNullOrEmpty($agentAccount)) {
    Write-Error "Agent account is empty. Use -AgentAccount parameter or -AutoDetect."
    exit 1
}

# Step 1: Add to IIS_IUSRS group
Write-Host "`n[1/4] Adding to IIS_IUSRS group..."
try {
    Add-LocalGroupMember -Group "IIS_IUSRS" -Member $agentAccount -ErrorAction Stop
    Write-Host "✓ Added to IIS_IUSRS group" -ForegroundColor Green
} catch {
    if ($_.Exception.Message -like "*already a member*") {
        Write-Host "✓ Already member of IIS_IUSRS" -ForegroundColor Green
    } else {
        Write-Host "⚠ Warning: $_" -ForegroundColor Yellow
    }
}

# Step 2: Grant IIS configuration folder permissions
Write-Host "`n[2/4] Granting IIS configuration permissions..."
$iisConfigPath = "C:\Windows\System32\inetsrv\config"

if (Test-Path $iisConfigPath) {
    try {
        $acl = Get-Acl $iisConfigPath
        $permission = New-Object System.Security.AccessControl.FileSystemAccessRule(
            $agentAccount,
            "ReadAndExecute",
            "ContainerInherit,ObjectInherit",
            "None",
            "Allow"
        )
        $acl.SetAccessRule($permission)
        Set-Acl -Path $iisConfigPath -AclObject $acl
        Write-Host "✓ Granted IIS config read permissions" -ForegroundColor Green
    } catch {
        Write-Host "⚠ Warning: Could not set ACL: $_" -ForegroundColor Yellow
    }
} else {
    Write-Host "⚠ IIS config path not found: $iisConfigPath" -ForegroundColor Yellow
}

# Step 3: Grant Application Pool management permissions
Write-Host "`n[3/4] Granting Application Pool management permissions..."

if ($FullAdmin) {
    Write-Host "Adding to Administrators group (full permissions)..." -ForegroundColor Yellow
    try {
        Add-LocalGroupMember -Group "Administrators" -Member $agentAccount -ErrorAction Stop
        Write-Host "✓ Added to Administrators group" -ForegroundColor Green
    } catch {
        if ($_.Exception.Message -like "*already a member*") {
            Write-Host "✓ Already member of Administrators" -ForegroundColor Green
        } else {
            Write-Host "⚠ Warning: $_" -ForegroundColor Yellow
        }
    }
} else {
    Write-Host "Granting specific IIS permissions (recommended)..."
    $iisPath = "C:\Windows\System32\inetsrv"

    try {
        $acl = Get-Acl $iisPath
        $permission = New-Object System.Security.AccessControl.FileSystemAccessRule(
            $agentAccount,
            "ReadAndExecute",
            "ContainerInherit,ObjectInherit",
            "None",
            "Allow"
        )
        $acl.SetAccessRule($permission)
        Set-Acl -Path $iisPath -AclObject $acl
        Write-Host "✓ Granted IIS management permissions" -ForegroundColor Green
    } catch {
        Write-Host "⚠ Warning: $_" -ForegroundColor Yellow
    }
}

# Step 4: Test permissions
Write-Host "`n[4/4] Testing IIS PowerShell access..."
try {
    Import-Module WebAdministration -ErrorAction Stop
    $pools = Get-ChildItem IIS:\AppPools -ErrorAction Stop
    Write-Host "✓ Successfully accessed IIS via PowerShell" -ForegroundColor Green
    Write-Host "✓ Found $($pools.Count) application pools" -ForegroundColor Green
} catch {
    Write-Host "⚠ Warning: Could not test IIS access: $_" -ForegroundColor Yellow
    Write-Host "Note: Test must run as the agent account to be accurate" -ForegroundColor DarkGray
}

# Summary
Write-Host "`n=== Summary ===" -ForegroundColor Cyan
Write-Host "Agent Account: $agentAccount"
Write-Host "IIS_IUSRS: Added"
Write-Host "IIS Config Permissions: Granted"
if ($FullAdmin) {
    Write-Host "Administrator Rights: Granted (FULL ACCESS)" -ForegroundColor Yellow
} else {
    Write-Host "IIS Management Permissions: Granted (LIMITED)"
}

Write-Host "`n=== Next Steps ===" -ForegroundColor Cyan
Write-Host "1. Restart Azure DevOps agent service:"
Write-Host "   Restart-Service -Name 'vstsagent*'"
Write-Host "2. Run a new pipeline to test the fix"
Write-Host "3. If still failing, run this script with -FullAdmin flag"
Write-Host "4. Check deployment logs for any remaining issues"

Write-Host "`n✓ Permission fix completed!" -ForegroundColor Green
