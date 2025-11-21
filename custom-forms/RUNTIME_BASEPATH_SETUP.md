# Runtime basePath Configuration for Next.js

This document explains how the runtime basePath configuration works for deploying the Next.js runtime app to different paths without rebuilding.

## Overview

The system uses a **string replacement approach** to configure the basePath at deployment time rather than build time. This allows a single build artifact to be deployed to multiple environments with different base paths.

## How It Works

1. **Build Phase**: Next.js builds with a placeholder `/__RUNTIME_BASEPATH__` as the basePath
2. **Deployment Phase**: A script replaces the placeholder with the actual basePath
3. **Runtime**: Next.js serves the application with the correct basePath

## Implementation Components

### 1. Next.js Configuration (`next.config.js`)

```javascript
const basePath = isProduction ? '/__RUNTIME_BASEPATH__' : ''

module.exports = {
  ...(basePath && { basePath }),
  ...(basePath && { assetPrefix: basePath }),
  // ... rest of config
}
```

### 2. Replacement Scripts

#### Node.js Script (`scripts/prepare-deployment.js`)
- Cross-platform Node.js script
- Searches for all .js and .html files in `.next/`
- Replaces `/__RUNTIME_BASEPATH__` with actual value from `RUNTIME_BASEPATH` environment variable

#### PowerShell Script (`scripts/prepare-deployment.ps1`)
- Windows-specific implementation
- Same functionality as Node.js script
- Optimized for Windows Server environments

### 3. PM2 Configuration (`ecosystem.config.js`)

```javascript
{
  name: 'arielsch-runtime',
  script: 'node',
  args: 'scripts/prepare-deployment.js && node server.js',
  env: {
    RUNTIME_BASEPATH: '/arielschBIZUITCustomForms',
    PORT: 3001
  }
}
```

## Deployment Process

### 1. Build (Azure DevOps Pipeline)

```bash
# Build with production flag (uses placeholder)
NODE_ENV=production npm run build
```

### 2. Deploy to Server

Files copied to server:
- `.next/` (build output with placeholder)
- `scripts/prepare-deployment.js`
- `scripts/prepare-deployment.ps1`
- `server.js`
- `package.json`

### 3. Configure basePath

Set the `RUNTIME_BASEPATH` environment variable in PM2:

```bash
# For /arielschBIZUITCustomForms
RUNTIME_BASEPATH=/arielschBIZUITCustomForms

# For root deployment
RUNTIME_BASEPATH=

# For another client
RUNTIME_BASEPATH=/cliente2Forms
```

### 4. Start Application

PM2 automatically:
1. Runs `prepare-deployment.js` (replaces placeholder)
2. Starts `server.js` (Next.js server)

```bash
pm2 start ecosystem.config.js
```

## Testing Locally

### 1. Build with Placeholder

```bash
cd custom-forms/runtime-app
NODE_ENV=production npm run build
```

### 2. Run Replacement Script

```bash
# Test with specific basePath
RUNTIME_BASEPATH=/testpath node scripts/prepare-deployment.js

# Test with root path
RUNTIME_BASEPATH= node scripts/prepare-deployment.js
```

### 3. Start Server

```bash
node server.js
```

## Changing basePath in Production

To change the basePath for an existing deployment:

1. **Update PM2 Configuration**:
   ```bash
   # Edit ecosystem.config.js
   env: {
     RUNTIME_BASEPATH: '/newBasePath'
   }
   ```

2. **Restart PM2 Process**:
   ```bash
   pm2 restart arielsch-runtime
   ```

The script will automatically:
- Run the replacement script with new basePath
- Start the server with updated configuration

## IIS Configuration

The `web.config` remains simple - it just proxies requests:

```xml
<rule name="Next.js App" stopProcessing="true">
  <match url="^arielschBIZUITCustomForms/(.*)" />
  <action type="Rewrite" url="http://localhost:3001/{R:0}" />
</rule>
```

No complex URL rewriting needed because Next.js handles all routing with the correct basePath.

## Benefits

✅ **Single Build**: One build works for all environments
✅ **No Rebuild Required**: Change basePath by updating environment variable
✅ **Fast Deployment**: Only configuration change needed
✅ **Consistent Assets**: All static files served with correct paths
✅ **Simple IIS Config**: No complex URL rewriting rules

## Limitations

⚠️ **Not Official**: This is a workaround, not officially supported by Next.js
⚠️ **Processing Time**: Adds ~30 seconds to startup for replacement
⚠️ **Placeholder Risk**: If `/__RUNTIME_BASEPATH__` appears in content, it will be replaced

## Troubleshooting

### Issue: Assets not loading (404 errors)

**Cause**: Replacement script didn't run
**Solution**: Check PM2 logs, ensure script executes before server starts

### Issue: Wrong basePath after deployment

**Cause**: Old build files cached
**Solution**:
1. Stop PM2: `pm2 stop arielsch-runtime`
2. Clear `.next` folder
3. Redeploy and restart

### Issue: Script fails on Windows

**Cause**: PowerShell execution policy
**Solution**: Run with bypass flag:
```powershell
powershell -ExecutionPolicy Bypass -File scripts/prepare-deployment.ps1
```

## Alternative Approaches

If string replacement proves problematic:

1. **Multiple Builds**: Build separately for each environment (increases CI/CD time)
2. **CDN for Assets**: Use external CDN with runtime configuration
3. **Container-based**: Use Docker with build args

## References

- [Next.js GitHub Discussion #16059](https://github.com/vercel/next.js/discussions/16059) - Runtime basePath feature request
- [Next.js GitHub Discussion #41769](https://github.com/vercel/next.js/discussions/41769) - Dynamic basePath approaches
- [Docker solution example](https://gist.github.com/kevcoxe/4e8030fb5c2c1a580137d5e2e202812b)