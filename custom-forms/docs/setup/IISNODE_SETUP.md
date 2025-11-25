# IISNode Setup Guide for Next.js

This guide explains how to deploy the Next.js application using **IISNode** instead of PM2 + reverse proxy.

## Overview

**IISNode** allows IIS to host Node.js applications directly without needing:
- PM2 process manager
- Application Request Routing (ARR)
- Reverse proxy configuration

IIS manages the Node.js process lifecycle automatically.

## Prerequisites

### 1. Install IISNode

1. **Download IISNode**:
   - Visit: https://github.com/Azure/iisnode/releases
   - Download the appropriate version:
     - `iisnode-full-v0.2.26-x64.msi` (for 64-bit Windows)
     - `iisnode-full-v0.2.26-x86.msi` (for 32-bit Windows)

2. **Run the installer**:
   - Double-click the downloaded `.msi` file
   - Follow the installation wizard
   - Restart IIS Manager after installation

3. **Verify installation**:
   ```powershell
   # Check if iisnode module is installed
   Get-WebGlobalModule | Where-Object { $_.Name -like "*iisnode*" }
   ```

   Should show:
   ```
   Name    : iisnode
   Image   : C:\Program Files\iisnode\iisnode.dll
   ```

### 2. Verify Node.js Installation

IISNode requires Node.js to be installed globally:

```powershell
node --version
npm --version
```

If not installed, download from: https://nodejs.org/

## IIS Configuration

### Option A: Virtual Application (Recommended)

This is the recommended approach for hosting in a subdirectory.

1. **Open IIS Manager**

2. **Expand your site** (e.g., `test.bizuit.com`)

3. **Create Virtual Application**:
   - Right-click on the site → **"Add Application..."**
   - **Alias**: `BIZUITCustomForms`
   - **Physical path**: `E:\DevSites\BIZUITCustomForms`
   - **Application pool**: Select an existing pool or create a new one
   - Click **OK**

4. **Configure Application Pool**:
   - Right-click the application pool → **Advanced Settings**
   - **.NET CLR Version**: **No Managed Code**
   - **Managed Pipeline Mode**: **Integrated**
   - **Identity**: Ensure it has read access to deployment directory
   - Click **OK**

### Option B: Standalone Site

If you want a dedicated domain/subdomain:

1. **Create new site**:
   - Right-click **Sites** → **Add Website**
   - **Site name**: `BIZUIT Custom Forms`
   - **Physical path**: `E:\DevSites\BIZUITCustomForms`
   - **Binding**:
     - Type: http
     - IP address: All Unassigned
     - Port: 80
     - Host name: `bizuit-forms.test.bizuit.com`

2. **Configure Application Pool** (same as Option A)

## Deployment Files

The Azure DevOps pipeline automatically deploys these files:

### 1. `server.js`

Entry point for IISNode. Starts the Next.js server.

### 2. `web.config.iisnode`

IISNode-specific configuration. The pipeline copies this to `web.config` during deployment.

### 3. `.next/` directory

Contains the built Next.js application (standalone mode).

### 4. `node_modules/`

Production dependencies installed during deployment.

## How It Works

1. **Request arrives** at IIS (e.g., `https://test.bizuit.com/BIZUITCustomForms/`)

2. **IIS reads `web.config`**:
   - Identifies `server.js` as the handler via IISNode
   - Rewrites all requests to `server.js`

3. **IISNode executes `server.js`**:
   - Starts Node.js process
   - Runs Next.js server
   - Returns response to IIS

4. **IIS serves response** to the client

5. **Process management**:
   - IISNode keeps Node.js process alive
   - Auto-restarts on crashes
   - Recycles when `web.config` or watched files change

## Testing the Deployment

### 1. Verify Files Are Deployed

```powershell
cd E:\DevSites\BIZUITCustomForms

# Check critical files exist
dir server.js, web.config, package.json

# Check .next build
dir .next

# Check node_modules
dir node_modules
```

### 2. Test Locally

```powershell
# Start server manually to test
node server.js
```

Then open: `http://localhost:3000/BIZUITCustomForms/`

Press `Ctrl+C` to stop when done testing.

### 3. Test via IIS

Navigate to:
- Virtual App: `https://test.bizuit.com/BIZUITCustomForms/`
- Standalone: `http://bizuit-forms.test.bizuit.com/`

Expected: Next.js home page loads

## Monitoring and Logs

### IISNode Logs

IISNode creates logs in: `E:\DevSites\BIZUITCustomForms\iisnode\`

```powershell
# View latest log
cd E:\DevSites\BIZUITCustomForms\iisnode
dir | sort LastWriteTime -Descending | select -First 1 | Get-Content
```

### Application Logs

Check Next.js console output in IISNode logs:

```powershell
# Tail the latest log file
Get-Content "E:\DevSites\BIZUITCustomForms\iisnode\*.log" -Wait -Tail 50
```

### IIS Logs

Standard IIS logs location:
```
C:\inetpub\logs\LogFiles\W3SVC*
```

## Troubleshooting

### Issue: 404.4 - No handler

**Cause**: IISNode not installed or not configured properly

**Solution**:
1. Verify IISNode is installed: `Get-WebGlobalModule | Where {$_.Name -like "*iisnode*"}`
2. Reinstall IISNode if missing
3. Restart IIS: `iisreset`

### Issue: 500 - Internal Server Error

**Cause**: Node.js error or missing dependencies

**Solution**:
1. Check IISNode logs: `E:\DevSites\BIZUITCustomForms\iisnode\`
2. Verify Node.js is installed: `node --version`
3. Verify dependencies: `npm ci --production`

### Issue: Server.js not found

**Cause**: Deployment didn't include server.js

**Solution**:
1. Verify `server.js` exists in repo: `example/server.js`
2. Re-run Azure DevOps pipeline
3. Manually copy `server.js` to deployment directory

### Issue: Application restarts constantly

**Cause**: Error in application code or missing files

**Solution**:
1. Check IISNode logs for error messages
2. Test server manually: `node server.js`
3. Check Next.js build: `npm run build`

### Issue: Changes not reflecting

**Cause**: IISNode cached old version

**Solution**:
```powershell
# Touch web.config to force restart
(Get-Item E:\DevSites\BIZUITCustomForms\web.config).LastWriteTime = Get-Date

# Or recycle app pool
Restart-WebAppPool "DefaultAppPool"

# Or full IIS reset
iisreset
```

### Issue: Cannot find module 'next'

**Cause**: Node modules not installed

**Solution**:
```powershell
cd E:\DevSites\BIZUITCustomForms
npm ci --production
```

## Updating the Application

### Automatic (via Pipeline)

Push to `main` branch → Azure DevOps pipeline automatically:
1. Builds the application
2. Deploys to `E:\DevSites\BIZUITCustomForms`
3. Restarts the application

### Manual Update

```powershell
# 1. Stop application pool
Stop-WebAppPool "DefaultAppPool"

# 2. Update files
cd E:\DevSites\BIZUITCustomForms
# ... copy new files ...

# 3. Install dependencies
npm ci --production

# 4. Start application pool
Start-WebAppPool "DefaultAppPool"
```

## Configuration Options

### Adjusting IISNode Settings

Edit `web.config` section `<iisnode>`:

```xml
<iisnode
  node_env="production"
  loggingEnabled="true"
  debuggingEnabled="false"
  maxConcurrentRequestsPerProcess="1024"
  nodeProcessCountPerApplication="1"
/>
```

Common settings:
- `loggingEnabled`: Enable/disable logging (default: true)
- `debuggingEnabled`: Enable Node.js debugging (default: false)
- `nodeProcessCountPerApplication`: Number of Node.js processes (default: 1)
- `maxLogFiles`: Max number of log files to keep (default: 20)

### Environment Variables

Set via `web.config`:

```xml
<configuration>
  <system.webServer>
    <iisnode>
      <environmentVariables>
        <add name="NODE_ENV" value="production" />
        <add name="CUSTOM_VAR" value="custom value" />
      </environmentVariables>
    </iisnode>
  </system.webServer>
</configuration>
```

## Performance Tips

1. **Use Production Build**:
   ```bash
   npm run build
   ```

2. **Enable Compression** (already in web.config):
   ```xml
   <urlCompression doStaticCompression="true" doDynamicCompression="true" />
   ```

3. **Configure Application Pool**:
   - Regular Time Interval: 1740 (recycle every 29 hours)
   - Idle Time-out: 20 minutes
   - Maximum Worker Processes: 1 (for consistency)

4. **Monitor Memory**:
   ```powershell
   Get-Process -Name "node" | Select-Object ProcessName, WS, PM
   ```

## Comparison: IISNode vs PM2+ARR

| Feature | IISNode | PM2 + ARR |
|---------|---------|-----------|
| **Setup Complexity** | Medium | High |
| **Prerequisites** | IISNode only | ARR + URL Rewrite + PM2 |
| **Process Management** | IIS managed | PM2 managed |
| **Auto-restart** | ✅ Yes | ✅ Yes |
| **Logging** | IISNode logs | PM2 logs |
| **Windows Integration** | ✅ Excellent | ⚠️ Good |
| **Performance** | ✅ Good | ✅ Good |
| **Debugging** | IIS tools | PM2 CLI |

## Useful Commands

```powershell
# Check if IISNode is working
Invoke-WebRequest -Uri "https://test.bizuit.com/BIZUITCustomForms/" -UseBasicParsing

# View application pool status
Get-WebAppPoolState "DefaultAppPool"

# Restart application
Restart-WebAppPool "DefaultAppPool"

# View IISNode logs
Get-ChildItem E:\DevSites\BIZUITCustomForms\iisnode -Filter *.log | Sort LastWriteTime -Desc | Select -First 1 | Get-Content

# Test server.js manually
cd E:\DevSites\BIZUITCustomForms
node server.js

# Reinstall dependencies
npm ci --production --force
```

## Additional Resources

- **IISNode Documentation**: https://github.com/Azure/iisnode
- **IISNode Wiki**: https://github.com/Azure/iisnode/wiki
- **Next.js Deployment**: https://nextjs.org/docs/deployment
- **IIS Web Server**: https://www.iis.net/

## Support

For issues:
1. Check IISNode logs: `E:\DevSites\BIZUITCustomForms\iisnode\`
2. Check IIS logs: `C:\inetpub\logs\LogFiles\`
3. Test manually: `node server.js`
4. Review this documentation

