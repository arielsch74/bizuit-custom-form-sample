# Azure Web App Linux - Deployment Guide

## 📋 Overview

This guide covers deploying the BIZUIT Custom Forms to two separate Azure Web Apps on Linux:

1. **Frontend (Next.js)** → `bizuit-custom-forms` (existing Web App)
2. **Backend (FastAPI)** → `bizuit-custom-forms-api` (new Web App to be created)

## 🚀 Architecture

```
┌─────────────────────────────────────────────────┐
│   Azure Resource Group: BIZUIT                  │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌─────────────────────────────────┐           │
│  │ App Service Plan                │           │
│  │ AppServiceBIZUITLinux (B1)      │           │
│  │ - OS: Linux                     │           │
│  │ - Tier: Basic                   │           │
│  └─────────────────────────────────┘           │
│           │                                     │
│           ├─► Web App 1: bizuit-custom-forms   │
│           │    - Runtime: Node.js 22 LTS       │
│           │    - Port: 8080 (auto)             │
│           │    - URL: /bizuitforms             │
│           │                                     │
│           └─► Web App 2: bizuit-custom-forms-api│
│                - Runtime: Python 3.10           │
│                - Port: 8080 (auto)             │
│                - URL: /                        │
│                                                 │
└─────────────────────────────────────────────────┘
```

## ✅ Prerequisites

### 1. Create Second Web App for Backend

```bash
# Set subscription
az account set --subscription c8538779-b0ee-48be-ba9e-d0c4f883c811

# Create Web App for backend (Python)
az webapp create \
  --name bizuit-custom-forms-api \
  --resource-group BIZUIT \
  --plan AppServiceBIZUITLinux \
  --runtime "PYTHON:3.10"

# Enable HTTPS only
az webapp update \
  --name bizuit-custom-forms-api \
  --resource-group BIZUIT \
  --https-only true

# Enable Always On
az webapp config set \
  --name bizuit-custom-forms-api \
  --resource-group BIZUIT \
  --always-on true
```

### 2. Create Azure DevOps Service Connection

If you don't have a service connection to Azure:

1. Go to **Azure DevOps** → **Project Settings** → **Service Connections**
2. Click **New service connection** → **Azure Resource Manager**
3. Select **Service principal (automatic)**
4. Choose subscription: `c8538779-b0ee-48be-ba9e-d0c4f883c811`
5. Resource group: `BIZUIT`
6. Name: `Azure subscription 1` (or update pipeline YAML if different)
7. Grant access to all pipelines

## 🔧 Frontend Configuration

### Environment Variables (Azure Web App Settings)

Set these via Azure Portal or CLI:

```bash
az webapp config appsettings set \
  --name bizuit-custom-forms \
  --resource-group BIZUIT \
  --settings \
    RUNTIME_BASEPATH="/bizuitforms" \
    NODE_ENV="production" \
    WEBSITE_NODE_DEFAULT_VERSION="~22" \
    SCM_DO_BUILD_DURING_DEPLOYMENT="false" \
    WEBSITES_ENABLE_APP_SERVICE_STORAGE="false"
```

**Build-time variables** (baked into Next.js build):
- `NEXT_PUBLIC_BASE_PATH` - Set in pipeline: `/bizuitforms`
- `NEXT_PUBLIC_BIZUIT_DASHBOARD_API_URL` - BPM API: `https://test.bizuit.com/arielschbizuitdashboardapi/api`
- `NEXT_PUBLIC_BIZUIT_FORMS_API_URL` - Backend API: `https://bizuit-custom-forms-api.azurewebsites.net`
- `NEXT_PUBLIC_BIZUIT_TIMEOUT` - Timeout: `30000`
- `NEXT_PUBLIC_BIZUIT_TOKEN_EXPIRATION_MINUTES` - Token expiration: `1440`
- `NEXT_PUBLIC_SESSION_TIMEOUT_MINUTES` - Session timeout: `30`
- `NEXT_PUBLIC_ALLOW_DEV_MODE` - Security: `false`

**Runtime variables** (can be changed without rebuild):
- `RUNTIME_BASEPATH` - Used by startup script to replace placeholders
- `NODE_ENV` - `production`

### Startup Command

```bash
az webapp config set \
  --name bizuit-custom-forms \
  --resource-group BIZUIT \
  --startup-file "startup.sh"
```

The `startup.sh` script:
1. Applies `RUNTIME_BASEPATH` replacements (if needed)
2. Starts Next.js server on Azure's `PORT` (auto-assigned, usually 8080)

## 🔧 Backend Configuration

### Environment Variables (Azure Web App Settings)

**⚠️ IMPORTANT:** Backend needs database credentials. Set these via Azure Portal or CLI:

```bash
az webapp config appsettings set \
  --name bizuit-custom-forms-api \
  --resource-group BIZUIT \
  --settings \
    # SQL Server Connection - Dashboard Database
    DB_SERVER="test.bizuit.com" \
    DB_DATABASE="arielschBIZUITDashboard" \
    DB_USER="BIZUITarielsch" \
    DB_PASSWORD="YOUR_PASSWORD_HERE" \
    \
    # SQL Server Connection - Persistence Store
    PERSISTENCE_DB_SERVER="test.bizuit.com" \
    PERSISTENCE_DB_DATABASE="arielschBizuitPersistenceStore" \
    PERSISTENCE_DB_USER="BIZUITarielsch" \
    PERSISTENCE_DB_PASSWORD="YOUR_PASSWORD_HERE" \
    \
    # Bizuit Dashboard API
    BIZUIT_DASHBOARD_API_URL="https://test.bizuit.com/arielschbizuitdashboardapi/api" \
    \
    # Security Configuration
    ADMIN_ALLOWED_ROLES="Administrators,BIZUIT Admins,SuperAdmin,FormManager" \
    SESSION_TIMEOUT_MINUTES="30" \
    JWT_SECRET_KEY="GENERATE_RANDOM_32_CHARS" \
    ENCRYPTION_TOKEN_KEY="Vq2ixrmV6oUGhQfIPWiCBk0S" \
    \
    # API Configuration
    API_PORT="8080" \
    MAX_UPLOAD_SIZE_MB="50" \
    TEMP_UPLOAD_PATH="./temp-uploads" \
    \
    # CORS Configuration
    CORS_ORIGINS="https://bizuit-custom-forms-gtg7g8b9gdb8egbh.eastus-01.azurewebsites.net,https://test.bizuit.com" \
    \
    # Python Environment
    PYTHONUNBUFFERED="1" \
    ENVIRONMENT="production"
```

**🔐 Security Notes:**
- Generate `JWT_SECRET_KEY` with: `openssl rand -hex 32`
- `ENCRYPTION_TOKEN_KEY` must match Dashboard's TripleDES key (24 chars)
- Update `CORS_ORIGINS` to match your frontend URL

### Startup Command

```bash
az webapp config set \
  --name bizuit-custom-forms-api \
  --resource-group BIZUIT \
  --startup-file "gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app --bind 0.0.0.0:8080"
```

Or create `startup.sh` in backend:
```bash
#!/bin/bash
# Azure Web App startup for FastAPI

pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port ${PORT:-8080}
```

## 📦 Deployment Pipelines

### Frontend Pipeline

File: `azure-pipelines-frontend-webapp.yml`

**Triggers:**
- Branch: `main` or `dev`
- Paths: `custom-forms/runtime-app/**`, `packages/**`

**Stages:**
1. **Build** (Ubuntu agent)
   - Build SDK + UI packages
   - Build Next.js with standalone output
   - Create deployment ZIP
2. **Deploy** (Ubuntu agent)
   - Configure Web App settings
   - Deploy ZIP to Azure Web App
   - Health check

**To activate:**
```bash
# In Azure DevOps
1. Pipelines → New Pipeline
2. Select Azure Repos Git
3. Choose repository
4. Select existing YAML: azure-pipelines-frontend-webapp.yml
5. Run pipeline
```

### Backend Pipeline

File: `azure-pipelines-backend-webapp.yml` ✅

**Triggers:**
- Branch: `main` or `dev`
- Paths: `custom-forms/backend-api/**`

**Stages:**
1. **Build** (Ubuntu agent)
   - Copy Python source code
   - Create startup script with Gunicorn + Uvicorn workers
   - Add gunicorn to requirements.txt
   - Create deployment ZIP
2. **Deploy** (Ubuntu agent)
   - Configure Web App settings
   - Deploy ZIP to Azure Web App
   - Health check (`/health` endpoint)
   - Database connection test (optional)

**To activate:**
```bash
# In Azure DevOps
1. Pipelines → New Pipeline
2. Select Azure Repos Git
3. Choose repository
4. Select existing YAML: azure-pipelines-backend-webapp.yml
5. Configure database secrets in Azure Portal FIRST (see below)
6. Run pipeline
```

## 🔍 Monitoring & Troubleshooting

### View Logs (Real-time)

**Frontend:**
```bash
az webapp log tail \
  --name bizuit-custom-forms \
  --resource-group BIZUIT
```

**Backend:**
```bash
az webapp log tail \
  --name bizuit-custom-forms-api \
  --resource-group BIZUIT
```

### Enable Application Logging

```bash
# Frontend
az webapp log config \
  --name bizuit-custom-forms \
  --resource-group BIZUIT \
  --application-logging filesystem \
  --level information

# Backend
az webapp log config \
  --name bizuit-custom-forms-api \
  --resource-group BIZUIT \
  --application-logging filesystem \
  --level information
```

### SSH into Container

```bash
# Frontend
az webapp ssh \
  --name bizuit-custom-forms \
  --resource-group BIZUIT

# Backend
az webapp ssh \
  --name bizuit-custom-forms-api \
  --resource-group BIZUIT
```

### Common Issues

**1. Application won't start**
- Check logs: `az webapp log tail`
- Verify startup command: `az webapp config show --query "linuxFxVersion,appCommandLine"`
- Check app settings: `az webapp config appsettings list`

**2. 502 Bad Gateway**
- Application crashed or not listening on correct port
- Check that app uses `process.env.PORT` (Azure assigns port dynamically)
- View logs for error messages

**3. Static files not loading**
- Verify `.next/static` was copied to deployment package
- Check `NEXT_PUBLIC_BASE_PATH` matches actual URL path

**4. Database connection fails (backend)**
- Verify SQL Server allows Azure IP ranges
- Check credentials in app settings
- Test connection from SSH session

## 📊 Cost Comparison

| Configuration | Monthly Cost | Notes |
|---------------|--------------|-------|
| **Current: IIS Windows** | ~$13/month | B1 Windows (single server) |
| **Option 1: Two B1 Linux** | ~$13/month | Shared App Service Plan |
| **Option 2: P1V2 Linux** | ~$73/month | Premium plan for better performance |

**Recommendation:** Start with two B1 apps on shared plan (no extra cost), upgrade to P1V2 if needed for:
- Docker Compose (single container for both apps)
- Deployment slots (staging/production)
- Auto-scaling

## 🔄 Migration from IIS

### Step 1: Test in Parallel
1. Deploy to Azure Web Apps
2. Test with different URL path (e.g., `/bizuitforms` vs `/arielschBIZUITCustomForms`)
3. Validate all functionality

### Step 2: Switch DNS/URL
1. Update Bizuit Dashboard to use new URL
2. Monitor for errors
3. Keep IIS deployment as backup

### Step 3: Decommission IIS
1. After 1-2 weeks of stable Azure deployment
2. Stop PM2 processes on IIS server
3. Archive IIS deployment

## 📝 Deployment Checklist

### 1. ✅ Pipelines Created
- [x] Frontend pipeline: `azure-pipelines-frontend-webapp.yml`
- [x] Backend pipeline: `azure-pipelines-backend-webapp.yml`

### 2. ⏳ Create Backend Web App

```bash
# Set subscription
az account set --subscription c8538779-b0ee-48be-ba9e-d0c4f883c811

# Create Web App for backend
az webapp create \
  --name bizuit-custom-forms-api \
  --resource-group BIZUIT \
  --plan AppServiceBIZUITLinux \
  --runtime "PYTHON:3.10"

# Enable HTTPS only
az webapp update \
  --name bizuit-custom-forms-api \
  --resource-group BIZUIT \
  --https-only true

# Enable Always On
az webapp config set \
  --name bizuit-custom-forms-api \
  --resource-group BIZUIT \
  --always-on true
```

### 3. ⏳ Configure Backend Secrets (CRITICAL!)

**⚠️ Do this BEFORE running the backend pipeline!**

```bash
# Generate JWT secret
JWT_SECRET=$(openssl rand -hex 32)

# Configure all settings at once
az webapp config appsettings set \
  --name bizuit-custom-forms-api \
  --resource-group BIZUIT \
  --settings \
    DB_SERVER="test.bizuit.com" \
    DB_DATABASE="arielschBIZUITDashboard" \
    DB_USER="BIZUITarielsch" \
    DB_PASSWORD="YOUR_PASSWORD_HERE" \
    PERSISTENCE_DB_SERVER="test.bizuit.com" \
    PERSISTENCE_DB_DATABASE="arielschBizuitPersistenceStore" \
    PERSISTENCE_DB_USER="BIZUITarielsch" \
    PERSISTENCE_DB_PASSWORD="YOUR_PASSWORD_HERE" \
    BIZUIT_DASHBOARD_API_URL="https://test.bizuit.com/arielschbizuitdashboardapi/api" \
    ADMIN_ALLOWED_ROLES="Administrators,BIZUIT Admins,SuperAdmin,FormManager" \
    SESSION_TIMEOUT_MINUTES="30" \
    JWT_SECRET_KEY="$JWT_SECRET" \
    ENCRYPTION_TOKEN_KEY="Vq2ixrmV6oUGhQfIPWiCBk0S" \
    API_PORT="8080" \
    MAX_UPLOAD_SIZE_MB="50" \
    TEMP_UPLOAD_PATH="./temp-uploads" \
    CORS_ORIGINS="https://bizuit-custom-forms-gtg7g8b9gdb8egbh.eastus-01.azurewebsites.net,https://test.bizuit.com" \
    PYTHONUNBUFFERED="1" \
    ENVIRONMENT="production"
```

### 4. ⏳ Configure Azure DevOps Service Connection

1. Azure DevOps → Project Settings → Service Connections
2. New service connection → Azure Resource Manager
3. Service principal (automatic)
4. Subscription: `c8538779-b0ee-48be-ba9e-d0c4f883c811`
5. Resource group: `BIZUIT`
6. Connection name: `Azure subscription 1`
7. Grant access to all pipelines

### 5. ⏳ Create Pipelines in Azure DevOps

**Frontend:**
1. Pipelines → New Pipeline → Azure Repos Git
2. Select repository
3. Existing Azure Pipelines YAML file
4. Path: `/azure-pipelines-frontend-webapp.yml`
5. Save and Run

**Backend:**
1. Pipelines → New Pipeline → Azure Repos Git
2. Select repository
3. Existing Azure Pipelines YAML file
4. Path: `/azure-pipelines-backend-webapp.yml`
5. Save and Run

### 6. ⏳ Update Frontend to Use New Backend URL

After backend is deployed, update frontend environment variables:

```bash
az webapp config appsettings set \
  --name bizuit-custom-forms \
  --resource-group BIZUIT \
  --settings \
    NEXT_PUBLIC_BIZUIT_FORMS_API_URL="https://bizuit-custom-forms-api.azurewebsites.net"
```

Then trigger frontend pipeline to rebuild with new backend URL.

### 7. ⏳ Test Deployment

**Backend API:**
```bash
# Health check
curl https://bizuit-custom-forms-api.azurewebsites.net/health

# Database connection test
curl https://bizuit-custom-forms-api.azurewebsites.net/admin/db-test
```

**Frontend:**
```bash
# Access form runtime
curl https://bizuit-custom-forms-gtg7g8b9gdb8egbh.eastus-01.azurewebsites.net/bizuitforms
```

### 8. ⏳ Configure Bizuit Dashboard

Update Bizuit Dashboard to use new form URLs:
- Old: `https://test.bizuit.com/arielschBIZUITCustomForms`
- New: `https://bizuit-custom-forms-gtg7g8b9gdb8egbh.eastus-01.azurewebsites.net/bizuitforms`

---

**Questions?** Check Azure DevOps pipeline logs or Web App logs for errors.
