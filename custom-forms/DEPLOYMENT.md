# BIZUIT Custom Forms - Deployment Guide

Complete guide for deploying custom-forms (runtime-app + backend-api) to Windows Server using PM2 + IIS Reverse Proxy.

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Prerequisites](#prerequisites)
- [Initial Server Setup](#initial-server-setup)
- [Manual Configuration](#manual-configuration)
- [Azure DevOps Pipeline](#azure-devops-pipeline)
- [Deployment Process](#deployment-process)
- [Post-Deployment](#post-deployment)
- [Monitoring](#monitoring)
- [Troubleshooting](#troubleshooting)
- [Scaling for Multiple Clients](#scaling-for-multiple-clients)

---

## Architecture Overview

### Components

```
Internet → IIS (Reverse Proxy) → PM2 (Process Manager) → Applications

IIS:
└─ Application Pool: arielschBIZUITCustomForms
   └─ Site: arielschBIZUITCustomForms
      └─ web.config:
         ├─ /api/* → http://localhost:8000 (Backend FastAPI)
         └─ /* → http://localhost:3001 (Runtime Next.js)

PM2:
├─ arielsch-runtime (port 3001) - Next.js standalone
└─ arielsch-backend (port 8000) - FastAPI/uvicorn
```

### Directory Structure on Server

```
E:\BIZUITSites\arielsch\
├── arielschBIZUITCustomForms\           # Runtime-app (Next.js)
│   ├── .next\                           # Next.js build
│   ├── public\                          # Static files
│   ├── node_modules\                    # Production dependencies
│   ├── server.js                        # PM2 entry point
│   ├── web.config                       # IIS reverse proxy config
│   ├── .env.local                       # Production env vars (manual)
│   └── logs\                            # PM2 logs
│
├── arielschBIZUITCustomFormsBackEnd\    # Backend-api (FastAPI)
│   ├── *.py                             # Python source files
│   ├── libs\                            # Python dependencies
│   ├── migrations\                      # SQL migration scripts
│   ├── .env.local                       # Production env vars (manual)
│   ├── logs\                            # PM2 logs
│   └── temp-uploads\                    # Temporary file uploads
│
└── ecosystem.config.js                  # PM2 configuration (both apps)
```

### Why PM2 + IIS Reverse Proxy?

**PM2 manages the processes:**
- Keeps apps running (auto-restart on crash)
- Manages logs
- Handles graceful shutdowns
- Starts automatically on Windows boot

**IIS acts as reverse proxy:**
- SSL/HTTPS termination
- URL routing
- Load balancing (if needed)
- Corporate infrastructure integration

**Benefits:**
- ✅ Easy deployment automation
- ✅ Zero-downtime updates (`pm2 reload`)
- ✅ Centralized monitoring (`pm2 monit`)
- ✅ Automatic recovery

---

## Prerequisites

### Server Requirements

- **Windows Server 2016 or later**
- **IIS 10 or later** with:
  - URL Rewrite Module installed
  - Application Request Routing (ARR) installed
- **Node.js 22.x or later**
- **Python 3.12 or later**
- **SQL Server** (for database)
- **Permissions**: Administrator access for initial setup

### Software Installation

#### 1. IIS Modules

**URL Rewrite Module:**
- Download: https://www.iis.net/downloads/microsoft/url-rewrite
- Or via Web Platform Installer

**Application Request Routing (ARR):**
- Download: https://www.iis.net/downloads/microsoft/application-request-routing
- Or via Web Platform Installer

**Verification:**
```powershell
# Check if modules are installed
Get-WindowsFeature -Name Web-Http-Redirect
Get-WindowsFeature -Name Web-Arr
```

#### 2. PM2 and pm2-windows-startup

See [PM2_WINDOWS_SETUP.md](./PM2_WINDOWS_SETUP.md) for complete installation guide.

**Quick install:**
```cmd
npm install -g pm2
npm install -g pm2-windows-startup
pm2-startup install
pm2-startup status
```

---

## Initial Server Setup

### Step 1: Create Directories

```powershell
# Create deployment directories
New-Item -ItemType Directory -Path "E:\BIZUITSites\arielsch\arielschBIZUITCustomForms" -Force
New-Item -ItemType Directory -Path "E:\BIZUITSites\arielsch\arielschBIZUITCustomFormsBackEnd" -Force

# Create logs and temp directories
New-Item -ItemType Directory -Path "E:\BIZUITSites\arielsch\arielschBIZUITCustomForms\logs" -Force
New-Item -ItemType Directory -Path "E:\BIZUITSites\arielsch\arielschBIZUITCustomFormsBackEnd\logs" -Force
New-Item -ItemType Directory -Path "E:\BIZUITSites\arielsch\arielschBIZUITCustomFormsBackEnd\temp-uploads" -Force
```

### Step 2: Configure IIS

#### Create Application Pool

```powershell
# Open IIS Manager or use PowerShell
Import-Module WebAdministration

# Create Application Pool
New-WebAppPool -Name "arielschBIZUITCustomForms"

# Configure Application Pool
Set-ItemProperty IIS:\AppPools\arielschBIZUITCustomForms -Name "managedRuntimeVersion" -Value ""
Set-ItemProperty IIS:\AppPools\arielschBIZUITCustomForms -Name "startMode" -Value "AlwaysRunning"
```

#### Create IIS Site

```powershell
# Create site
New-Website -Name "arielschBIZUITCustomForms" `
  -PhysicalPath "E:\BIZUITSites\arielsch\arielschBIZUITCustomForms" `
  -ApplicationPool "arielschBIZUITCustomForms" `
  -Port 80

# Add HTTPS binding
New-WebBinding -Name "arielschBIZUITCustomForms" `
  -Protocol "https" `
  -Port 443 `
  -HostHeader "test.bizuit.com" `
  -SslFlags 0

# Set site path
Set-ItemProperty IIS:\Sites\arielschBIZUITCustomForms -Name "physicalPath" `
  -Value "E:\BIZUITSites\arielsch\arielschBIZUITCustomForms"
```

#### Configure URL Rewrite (if not using web.config)

The `web.config.production` file contains all necessary URL rewrite rules. The Azure DevOps pipeline will copy it as `web.config` during deployment.

### Step 3: Set File Permissions

```powershell
# Grant IIS_IUSRS read access to deployment directories
icacls "E:\BIZUITSites\arielsch" /grant "IIS_IUSRS:(OI)(CI)R" /T

# Grant write access to logs and temp directories
icacls "E:\BIZUITSites\arielsch\arielschBIZUITCustomForms\logs" /grant "IIS_IUSRS:(OI)(CI)M" /T
icacls "E:\BIZUITSites\arielsch\arielschBIZUITCustomFormsBackEnd\logs" /grant "IIS_IUSRS:(OI)(CI)M" /T
icacls "E:\BIZUITSites\arielsch\arielschBIZUITCustomFormsBackEnd\temp-uploads" /grant "IIS_IUSRS:(OI)(CI)M" /T
```

---

## Manual Configuration

### 1. Create ecosystem.config.js

Copy the `ecosystem.config.js` file to the server:

```powershell
# Copy from repository to server
Copy-Item "ecosystem.config.js" "E:\BIZUITSites\arielsch\ecosystem.config.js"
```

**Verify paths in ecosystem.config.js:**
- `cwd` paths point to correct directories
- Python path is correct (`C:\Python312\python.exe`)
- Ports are correct (3001 for runtime, 8000 for backend)

### 2. Create .env.local Files

#### Runtime-app (.env.local)

```powershell
# Create from template
notepad E:\BIZUITSites\arielsch\arielschBIZUITCustomForms\.env.local
```

**Content** (based on `.env.production.example`):
```env
# Build-time (these are baked into the build by pipeline)
NEXT_PUBLIC_BASE_PATH=/arielschBIZUITCustomForms
NEXT_PUBLIC_BIZUIT_FORMS_API_URL=/api/bizuit
NEXT_PUBLIC_BIZUIT_DASHBOARD_API_URL=/api/bizuit
NEXT_PUBLIC_SESSION_TIMEOUT_MINUTES=30

# Runtime (can be changed without rebuild)
FASTAPI_URL=http://localhost:8000
WEBHOOK_SECRET=<generate-with-openssl-rand-hex-32>
```

#### Backend-api (.env.local)

```powershell
# Create from template
notepad E:\BIZUITSites\arielsch\arielschBIZUITCustomFormsBackEnd\.env.local
```

**Content** (based on `.env.production.example`):
```env
# SQL Server - Dashboard Database
DB_SERVER=your-sql-server.database.windows.net
DB_DATABASE=BizuitDashboard
DB_USER=your_database_user
DB_PASSWORD=your_secure_password

# SQL Server - Persistence Store
PERSISTENCE_DB_SERVER=your-sql-server.database.windows.net
PERSISTENCE_DB_DATABASE=BizuitPersistence
PERSISTENCE_DB_USER=your_database_user
PERSISTENCE_DB_PASSWORD=your_secure_password

# Bizuit Dashboard API
BIZUIT_DASHBOARD_API_URL=https://test.bizuit.com/arielschbizuitdashboardapi/api

# Admin Security
ADMIN_ALLOWED_ROLES=Administrators,BIZUIT Admins,SuperAdmin
SESSION_TIMEOUT_MINUTES=30
JWT_SECRET_KEY=<generate-with-openssl-rand-hex-32>
ENCRYPTION_TOKEN_KEY=<24-char-key-from-bizuit-dashboard>

# API Configuration
API_PORT=8000
MAX_UPLOAD_SIZE_MB=50
TEMP_UPLOAD_PATH=./temp-uploads

# CORS
CORS_ORIGINS=https://test.bizuit.com

# Production Mode
PYTHON_ENV=production
```

**Important:**
- `JWT_SECRET_KEY`: Generate with `openssl rand -hex 32`
- `ENCRYPTION_TOKEN_KEY`: Must match Bizuit Dashboard (exactly 24 characters)
- Passwords and secrets should NEVER be committed to repository

### 3. Test PM2 Configuration

```cmd
# Navigate to ecosystem directory
cd E:\BIZUITSites\arielsch

# Start apps with PM2
pm2 start ecosystem.config.js

# Verify apps are running
pm2 list

# Check logs
pm2 logs arielsch-runtime --lines 20
pm2 logs arielsch-backend --lines 20

# Save configuration for auto-startup
pm2 save

# Verify startup is configured
pm2-startup status
```

**Expected output:**
```
┌─────┬──────────────────┬─────────┬─────────┬─────────┬──────────┬────────┬──────┐
│ id  │ name             │ mode    │ ↺       │ status  │ cpu      │ memory │ port │
├─────┼──────────────────┼─────────┼─────────┼─────────┼──────────┼────────┼──────┤
│ 0   │ arielsch-runtime │ fork    │ 0       │ online  │ 0.1%     │ 85 MB  │ 3001 │
│ 1   │ arielsch-backend │ fork    │ 0       │ online  │ 0.3%     │ 120 MB │ 8000 │
└─────┴──────────────────┴─────────┴─────────┴─────────┴──────────┴────────┴──────┘
```

### 4. Test Applications

```powershell
# Test runtime-app
Invoke-WebRequest -Uri "http://localhost:3001" -UseBasicParsing

# Test backend-api health endpoint
Invoke-WebRequest -Uri "http://localhost:8000/api/health" -UseBasicParsing

# Test through IIS (replace with your domain)
Invoke-WebRequest -Uri "https://test.bizuit.com/arielschBIZUITCustomForms" -UseBasicParsing
```

---

## Azure DevOps Pipeline

### Pipeline Configuration

The pipeline is defined in `azure-pipelines-customforms.yml` at the repository root.

**Trigger:**
- Branch: `main`
- Paths: `custom-forms/**` or `azure-pipelines-customforms.yml`

**Stages:**
1. **BuildRuntime**: Build Next.js standalone
2. **BuildBackend**: Prepare FastAPI with dependencies
3. **RunMigrations**: Execute SQL migrations (idempotent)
4. **DeployRuntime**: Deploy to PM2 and restart
5. **DeployBackend**: Deploy to PM2 and restart

### Setting Up the Pipeline

1. **Navigate to Azure DevOps:**
   - Go to Pipelines → New Pipeline
   - Select your repository
   - Choose "Existing Azure Pipelines YAML file"
   - Select `azure-pipelines-customforms.yml`

2. **Configure Variables** (if needed):
   - Most variables are in the YAML file
   - Secrets should be in Azure Key Vault or Variable Groups

3. **Configure Self-Hosted Agent:**
   - Pool name: `Testbizuitcom`
   - Agent must be running on the Windows Server
   - Agent must have:
     - PM2 installed
     - Access to deployment directories
     - SQL Server access (for migrations)

4. **Run Pipeline:**
   - Manually trigger or push to `main` branch
   - Monitor stages for errors

---

## Deployment Process

### Automatic Deployment (via Pipeline)

1. **Push changes to `main` branch** affecting `custom-forms/`:
   ```bash
   git add custom-forms/
   git commit -m "feat: update custom forms"
   git push origin main
   ```

2. **Pipeline automatically triggers:**
   - Builds runtime-app and backend-api
   - Runs SQL migrations
   - Deploys to server
   - Restarts PM2 processes
   - Performs health checks

3. **Monitor pipeline:**
   - Check Azure DevOps for pipeline status
   - Review logs for each stage
   - Verify health checks pass

### Manual Deployment (via PM2)

If you need to deploy manually:

```powershell
# 1. Stop PM2 processes
pm2 stop arielsch-runtime arielsch-backend

# 2. Copy new files to deployment directories
# (copy .next, *.py files, etc.)

# 3. Install dependencies if needed
cd E:\BIZUITSites\arielsch\arielschBIZUITCustomForms
npm ci --production

# 4. Restart PM2 processes
pm2 restart arielsch-runtime arielsch-backend

# 5. Save PM2 configuration
pm2 save

# 6. Verify
pm2 list
pm2 logs --lines 50
```

---

## Post-Deployment

### Verification Steps

1. **Check PM2 status:**
   ```cmd
   pm2 list
   pm2 logs --lines 50
   ```

2. **Test endpoints:**
   ```powershell
   # Runtime app
   Invoke-WebRequest -Uri "http://localhost:3001" -UseBasicParsing

   # Backend API
   Invoke-WebRequest -Uri "http://localhost:8000/api/health" -UseBasicParsing

   # Through IIS
   Invoke-WebRequest -Uri "https://test.bizuit.com/arielschBIZUITCustomForms" -UseBasicParsing
   ```

3. **Check IIS logs:**
   - Location: `C:\inetpub\logs\LogFiles\W3SVC<site-id>\`
   - Look for 502/503 errors (backend not responding)

4. **Check PM2 logs:**
   ```cmd
   # View logs
   pm2 logs

   # View specific app logs
   pm2 logs arielsch-runtime
   pm2 logs arielsch-backend

   # View last N lines
   pm2 logs --lines 100
   ```

### Rollback Procedure

If deployment fails:

1. **Check PM2 logs** for errors:
   ```cmd
   pm2 logs --lines 100 --err
   ```

2. **Restart processes:**
   ```cmd
   pm2 restart all
   ```

3. **Rollback to previous build** (if available):
   - Re-run previous successful pipeline
   - Or manually restore previous files

4. **Check .env.local** configuration:
   - Verify all required variables are set
   - Check for typos in connection strings

---

## Monitoring

### PM2 Monitoring

**Real-time monitoring:**
```cmd
pm2 monit
```

**Dashboard:**
```cmd
pm2 ls
pm2 show arielsch-runtime
pm2 show arielsch-backend
```

**Memory usage:**
```cmd
pm2 ls
# Look at "memory" column
```

### Log Management

**View logs:**
```cmd
# All logs
pm2 logs

# Specific app
pm2 logs arielsch-runtime --lines 50

# Errors only
pm2 logs --err

# Clear logs
pm2 flush
```

**Log files location:**
- Runtime: `E:\BIZUITSites\arielsch\arielschBIZUITCustomForms\logs\`
- Backend: `E:\BIZUITSites\arielsch\arielschBIZUITCustomFormsBackEnd\logs\`

**Log rotation** (recommended):
- Use Windows Task Scheduler
- Or PM2 log rotation module: `pm2 install pm2-logrotate`

### Performance Monitoring

**Check resource usage:**
```cmd
pm2 list
# CPU and Memory columns show current usage
```

**Restart if memory leak:**
```cmd
pm2 restart <app-name>
```

**Configure max memory restart** (in ecosystem.config.js):
```javascript
max_memory_restart: '500M'  // Restart if exceeds 500MB
```

---

## Troubleshooting

### Common Issues

#### 1. PM2 process not starting

**Symptoms:**
- `pm2 list` shows status "errored" or "stopped"

**Diagnosis:**
```cmd
pm2 logs <app-name> --lines 50 --err
```

**Common causes:**
- Missing `.env.local` file
- Incorrect Python/Node.js path in ecosystem.config.js
- Port already in use
- Missing dependencies

**Solutions:**
```cmd
# Check if port is in use
netstat -ano | findstr :3001
netstat -ano | findstr :8000

# Verify Python path
where python

# Verify Node.js
where node

# Check .env.local exists
dir E:\BIZUITSites\arielsch\arielschBIZUITCustomForms\.env.local
dir E:\BIZUITSites\arielsch\arielschBIZUITCustomFormsBackEnd\.env.local
```

#### 2. IIS returns 502 Bad Gateway

**Symptoms:**
- Browser shows "502 Bad Gateway"
- IIS logs show 502 errors

**Diagnosis:**
- PM2 processes are not running or not responding

**Solutions:**
```cmd
# Check PM2 status
pm2 list

# Restart processes
pm2 restart all

# Check if apps are listening on correct ports
netstat -ano | findstr :3001
netstat -ano | findstr :8000

# Test locally
curl http://localhost:3001
curl http://localhost:8000/api/health
```

#### 3. Backend database connection errors

**Symptoms:**
- Backend logs show SQL Server connection errors
- "Login failed" errors

**Diagnosis:**
```cmd
pm2 logs arielsch-backend --lines 50
```

**Solutions:**
- Verify `.env.local` has correct database credentials
- Test connection from server:
  ```cmd
  sqlcmd -S <server> -d <database> -U <user> -P <password>
  ```
- Check firewall rules
- Verify SQL Server allows remote connections

#### 4. Migrations fail during deployment

**Symptoms:**
- Pipeline fails at "RunMigrations" stage
- SQL syntax errors

**Diagnosis:**
- Check pipeline logs for SQL errors
- Review migration scripts for syntax

**Solutions:**
- Migrations are idempotent (safe to re-run)
- Verify `.env.local` exists on server
- Test migration manually:
  ```powershell
  sqlcmd -S <server> -d <database> -U <user> -P <password> -i migration.sql
  ```

#### 5. Next.js build errors

**Symptoms:**
- Pipeline fails at "BuildRuntime" stage
- TypeScript errors or missing dependencies

**Solutions:**
- Fix errors locally first
- Ensure `npm ci` runs successfully locally
- Check Node.js version matches (22.x)
- Verify all dependencies in package.json

---

## Scaling for Multiple Clients

To deploy custom-forms for additional clients on the same server:

### 1. Update ecosystem.config.js

Add new app configurations:

```javascript
{
  name: 'cliente2-runtime',
  cwd: 'E:\\BIZUITSites\\cliente2\\cliente2BIZUITCustomForms',
  script: 'node_modules/next/dist/bin/next',
  args: 'start -p 3002',  // Different port
  // ... rest of config
},
{
  name: 'cliente2-backend',
  cwd: 'E:\\BIZUITSites\\cliente2\\cliente2BIZUITCustomFormsBackEnd',
  script: 'C:\\Python312\\python.exe',
  args: '-m uvicorn main:app --host 0.0.0.0 --port 8001',  // Different port
  interpreter: 'none',
  // ... rest of config
}
```

### 2. Create new IIS site

```powershell
# Create new Application Pool
New-WebAppPool -Name "cliente2BIZUITCustomForms"

# Create new site
New-Website -Name "cliente2BIZUITCustomForms" `
  -PhysicalPath "E:\BIZUITSites\cliente2\cliente2BIZUITCustomForms" `
  -ApplicationPool "cliente2BIZUITCustomForms"
```

### 3. Create directories and .env.local

```powershell
# Create directories
New-Item -ItemType Directory -Path "E:\BIZUITSites\cliente2\cliente2BIZUITCustomForms" -Force
New-Item -ItemType Directory -Path "E:\BIZUITSites\cliente2\cliente2BIZUITCustomFormsBackEnd" -Force

# Create .env.local files with client-specific configuration
```

### 4. Update web.config

Copy `web.config.production` and update proxy ports:
- Backend: `http://localhost:8001` (instead of 8000)
- Runtime: `http://localhost:3002` (instead of 3001)

### 5. Restart PM2

```cmd
pm2 restart all
pm2 save
pm2 list
```

---

## Additional Resources

- [PM2 Windows Setup Guide](./PM2_WINDOWS_SETUP.md)
- [Azure DevOps Pipeline Documentation](https://docs.microsoft.com/en-us/azure/devops/pipelines/)
- [PM2 Documentation](https://pm2.keymetrics.io/)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [FastAPI Deployment](https://fastapi.tiangolo.com/deployment/)

---

**Last Updated:** 19 November 2025
**Version:** 1.0
