# Deployment Troubleshooting Guide

## Current Issue: Permission Denied on IIS App Pool Management

### Error Message
```
⚠ Could not stop app pool 'BizuitCustomFormsSample': Filename: redirection.config
Error: Cannot read configuration file due to insufficient permissions
```

### Root Cause
Azure DevOps agent service account lacks permissions to:
- Access IIS configuration files (`C:\Windows\System32\inetsrv\config\redirection.config`)
- Import PowerShell `WebAdministration` module
- Manage IIS Application Pools

---

## Quick Fixes (Choose One)

### ✅ Option 1: Deploy with Updated Pipeline (RECOMMENDED - Already Done)
The pipeline has been updated to use **two fallback methods**:

1. **Primary**: `appcmd.exe` - Command-line tool that may work without special permissions
2. **Fallback**: PowerShell `WebAdministration` module - Original method

**What Changed**:
- [azure-pipelines.yml](../azure-pipelines.yml:148-238) - Added dual-method app pool stop
- [azure-pipelines.yml](../azure-pipelines.yml:307-351) - Added dual-method app pool start
- Better error handling and graceful degradation

**Action**: Commit and push the updated `azure-pipelines.yml` - the next pipeline run should work better.

---

### Option 2: Fix Server Permissions (If appcmd.exe Still Fails)

#### A. Quick Fix - Auto-detect and Fix
On `test.bizuit.com` server, run as **Administrator**:

```powershell
# Download and run the fix script
cd E:\DevSites\BIZUITCustomForms
.\scripts\fix-deployment-permissions.ps1 -AutoDetect
```

#### B. Manual Fix - Step by Step

**Step 1**: Find Agent Service Account
```powershell
Get-Service -Name "vstsagent*" | ForEach-Object {
    $service = Get-WmiObject Win32_Service -Filter "Name='$($_.Name)'"
    [PSCustomObject]@{
        ServiceName = $_.Name
        Account = $service.StartName
        Status = $_.Status
    }
}
```

**Step 2**: Grant IIS Permissions (Replace account name)
```powershell
# Example: If account is "NT SERVICE\vstsagent.Testbizuitcom.Agent-1"
$agentAccount = "NT SERVICE\vstsagent.Testbizuitcom.Agent-1"

# Add to IIS_IUSRS group
Add-LocalGroupMember -Group "IIS_IUSRS" -Member $agentAccount

# Grant IIS config read permissions
$iisConfigPath = "C:\Windows\System32\inetsrv\config"
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
```

**Step 3**: Restart Agent Service
```powershell
Restart-Service -Name "vstsagent*"
```

**Step 4**: Test
```powershell
# Run as agent account (if possible) or check next deployment
Import-Module WebAdministration
Get-WebAppPoolState -Name "BizuitCustomFormsSample"
```

---

## Verification Checklist

After applying any fix, verify:

- [ ] Pipeline runs without permission errors
- [ ] App pool stops successfully (check logs)
- [ ] Files deploy without "locked file" errors
- [ ] App pool starts successfully
- [ ] Application is accessible at `http://test.bizuit.com/BIZUITCustomForms/`

---

## Understanding the Fix

### Why `appcmd.exe` May Work When PowerShell Doesn't

**PowerShell WebAdministration Module**:
- Requires reading IIS configuration files
- Needs access to `redirection.config`, `applicationHost.config`
- Subject to NTFS and IIS security permissions
- More strict permission requirements

**appcmd.exe**:
- Direct IIS management tool
- May have different permission inheritance
- Often works with lower privileges
- Simpler execution model

### Fallback Strategy in Updated Pipeline

```powershell
# Try Method 1: appcmd.exe
if (appcmd.exe succeeds) {
    ✓ Use it and continue
} else {
    # Try Method 2: PowerShell module
    if (PowerShell succeeds) {
        ✓ Use it and continue
    } else {
        ⚠ Log warning but continue deployment
        # IIS/IISNode will handle file locks through recycling
    }
}
```

---

## Alternative Deployment Strategies

If all permission fixes fail:

### Strategy 1: Deploy Without App Pool Management
- Remove app pool stop/start from pipeline
- Rely on IIS automatic recycling on file changes
- Configure app pool for aggressive recycling

### Strategy 2: Use Robocopy for Locked Files
```powershell
robocopy "$(System.ArtifactsDirectory)\drop\example" "$(deployPath)" /MIR /R:10 /W:5
```
- Robocopy can handle locked files better
- Retries automatically
- Skips locked files and continues

### Strategy 3: Blue-Green Deployment
- Deploy to temporary directory (`E:\DevSites\BIZUITCustomForms_new`)
- Stop app pool
- Swap directories
- Start app pool
- Keeps previous version accessible for rollback

---

## Production Deployment Best Practices

### Current Setup (IISNode)
- ✅ Standalone Next.js build
- ✅ IISNode handles Node.js process
- ✅ Auto-restarts on file changes
- ⚠ Requires IIS App Pool permissions

### Recommended Improvements
1. **Use Windows Service** instead of IISNode
   - More control over Node.js process
   - Better logging
   - Easier troubleshooting

2. **Add Health Checks** to pipeline
   - Verify app responds after deployment
   - Automatic rollback on failure

3. **Implement Blue-Green Deployment**
   - Zero-downtime deployments
   - Easy rollback
   - Test before switching

---

## Quick Reference

### Check Agent Service Status
```powershell
Get-Service -Name "vstsagent*" | Format-Table Name, Status, StartType
```

### Check App Pool Status (Requires Permissions)
```powershell
Import-Module WebAdministration
Get-WebAppPoolState -Name "BizuitCustomFormsSample"
```

### Check App Pool Status (Using appcmd)
```powershell
C:\Windows\System32\inetsrv\appcmd.exe list apppool "BizuitCustomFormsSample"
```

### Manually Restart App Pool (appcmd)
```powershell
C:\Windows\System32\inetsrv\appcmd.exe stop apppool /apppool.name:"BizuitCustomFormsSample"
C:\Windows\System32\inetsrv\appcmd.exe start apppool /apppool.name:"BizuitCustomFormsSample"
```

### Check IISNode Logs
```powershell
Get-ChildItem E:\DevSites\BIZUITCustomForms\iisnode -Filter "*.log" |
    Sort-Object LastWriteTime -Descending |
    Select-Object -First 3 |
    ForEach-Object {
        Write-Host "`n--- $($_.Name) ---"
        Get-Content $_.FullName -Tail 50
    }
```

---

## Support

- **Pipeline Config**: [azure-pipelines.yml](../azure-pipelines.yml)
- **Permission Fix Script**: [scripts/fix-deployment-permissions.ps1](../scripts/fix-deployment-permissions.ps1)
- **Detailed Fix Guide**: [docs/DEPLOYMENT_FIX.md](./DEPLOYMENT_FIX.md)
