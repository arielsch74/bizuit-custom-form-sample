# 🚀 BIZUIT Custom Forms - Complete Developer Guide

> **Comprehensive guide for junior developers**
> Everything from zero to production deployment

**Last Updated**: 2025-11-23
**Target Audience**: Junior Developers, New Team Members
**Reading Time**: 30-45 minutes

---

## 📚 Table of Contents

1. [Quick Start (5 Minutes)](#-quick-start-5-minutes)
2. [Project Architecture](#-project-architecture)
3. [Understanding Authentication](#-understanding-authentication)
4. [Environment Configuration Deep Dive](#-environment-configuration-deep-dive)
5. [Development Credentials Setup](#-development-credentials-setup)
6. [Development Workflows](#-development-workflows)
7. [Testing Strategies](#-testing-strategies)
8. [Deployment Process](#-deployment-process)
9. [Common Scenarios](#-common-scenarios)
10. [Troubleshooting](#-troubleshooting)
11. [FAQs](#-faqs)

---

## 🎯 Quick Start (5 Minutes)

### Prerequisites

```bash
# Required
node --version    # v18.0.0 or higher
npm --version     # v9.0.0 or higher
python3 --version # v3.10 or higher
git --version     # any recent version

# Optional but recommended
code --version    # VS Code
```

### Initial Setup

```bash
# 1. Clone repository
git clone <repo-url>
cd custom-forms

# 2. Install dependencies
npm install

# 3. Setup forms-examples submodule
git submodule init
git submodule update
cd forms-examples && npm install && cd ..

# 4. Setup environment files
cd runtime-app
cp .env.example .env.local
cp dev-credentials.example.js dev-credentials.js

# 5. Edit dev-credentials.js (IMPORTANT!)
# Update with your test credentials

# 6. Start all services
cd ..
./start-all.sh
```

**Access Points**:
- 🌐 Runtime App: `http://localhost:3001`
- 📊 Showcase: `http://localhost:3000`
- 🔧 Backend API: `http://localhost:8000/docs`

---

## 🏗️ Project Architecture

### High-Level Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      BIZUIT Dashboard                        │
│          (User clicks form → Generates JWT token)           │
└─────────────────────┬───────────────────────────────────────┘
                      │ token
                      ▼
┌─────────────────────────────────────────────────────────────┐
│              Runtime App (Next.js - Port 3001)              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  1. Validates token with Backend API                 │   │
│  │  2. Loads form from database                         │   │
│  │  3. Executes form with user context                  │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│            Backend API (FastAPI - Port 8000)                │
│  • Token validation                                          │
│  • Form storage (SQLite)                                     │
│  • Version management                                        │
│  • Admin authentication                                      │
└─────────────────────────────────────────────────────────────┘
```

### Directory Structure

```
custom-forms/
├── runtime-app/              # Next.js 15 App Router
│   ├── app/
│   │   ├── forms/           # Dynamic form routes
│   │   ├── admin/           # Admin panel
│   │   ├── docs/            # Developer documentation
│   │   └── api/             # Next.js API routes
│   ├── lib/                 # Utilities
│   ├── .env.local           # Environment config (CREATE THIS)
│   └── dev-credentials.js   # Dev credentials (CREATE THIS)
│
├── backend-api/             # FastAPI Python backend
│   ├── main.py             # Entry point
│   ├── requirements.txt    # Python dependencies
│   └── venv/               # Virtual environment
│
├── bizuit-custom-form-sample/  # Git submodule (example forms)
│   ├── form-template/       # Base form template
│   ├── my-form/            # Your custom forms here
│   └── build-form.js       # Shared build script
│
├── start-all.sh            # Start all services
├── stop-all.sh             # Stop all services
└── logs/                   # Runtime logs
```

---

## 🔀 Form Routes & Loaders

### Overview: Two Different Routes

The runtime app has **TWO ways** to load forms, each with different security and use cases:

| Route | URL Pattern | Security | Use Case |
|-------|-------------|----------|----------|
| `/form/[formName]` | `/form/my-form?s=...` | Dashboard token required (prod) | **Standard**: Forms opened from Dashboard |
| `/formsa/[formName]` | `/formsa/my-form` | **iframe only** | **Standalone**: Embedded in external apps |

### Route 1: `/form/[formName]` (Standard Loader)

**File**: `runtime-app/app/form/[formName]/page.tsx`

**Purpose**: Standard form loading from BIZUIT Dashboard

**Security Model**:
```typescript
// Production (ALLOW_DEV_MODE=false):
✅ Requires Dashboard token 's' in URL
❌ Blocks direct browser access without token

// Development (ALLOW_DEV_MODE=true):
✅ Allows direct access with dev credentials
⚠️ Bypasses Dashboard token requirement
```

**URL Examples**:

```bash
# Production (from Dashboard)
https://server.com/form/my-form?s=aAAV/9xqhAE=&InstanceId=123&UserName=john

# Development (local testing)
http://localhost:3001/form/my-form
# Uses dev-credentials.js automatically
```

**Parameters Received by Form**:

```typescript
// Your form component receives:
export default function MyForm({ dashboardParams }) {
  // dashboardParams contains:
  const {
    userName,      // "john.doe" (from Dashboard or dev creds)
    instanceId,    // "12345" (from Dashboard query string)
    eventName,     // "MyProcess" (from Dashboard)
    activityName,  // "Task1" (from Dashboard)
    tokenId,       // Internal token ID (from backend validation)
    operation,     // 1 or 2 (edit or view)
    apiUrl,        // Dashboard API URL (from config)

    // Dev mode only:
    devUsername,   // From dev-credentials.js
    devPassword,   // From dev-credentials.js
    devApiUrl      // From dev-credentials.js
  } = dashboardParams
}
```

**Flow Diagram**:

```
User clicks form in Dashboard
         ↓
Dashboard generates URL:
/form/my-form?s=encrypted&InstanceId=123&UserName=john
         ↓
Runtime validates 's' token with backend
         ↓
Backend decrypts token → returns user context
         ↓
Form loads with dashboardParams:
{ userName, instanceId, tokenId, apiUrl, ... }
         ↓
Form renders with user context
```

---

### Route 2: `/formsa/[formName]` (Standalone Loader)

**File**: `runtime-app/app/formsa/[formName]/page.tsx`

**Purpose**: Standalone forms for iframe embedding in external applications

**Security Model**:
```typescript
// ALWAYS enforced (no dev mode bypass):
✅ MUST be loaded inside an iframe
✅ MUST be from allowed origin
❌ Blocks direct browser access
❌ Blocks unauthorized origins

// Dashboard token 's':
⚠️ Optional (not required)
✅ If provided, validates normally
```

**Configuration**:

```env
# .env.local
# Allowed origins for iframe (comma-separated, supports wildcards)
NEXT_PUBLIC_ALLOWED_IFRAME_ORIGINS=https://<your-server>,https://*.example.com

# Allow localhost iframes (development only)
NEXT_PUBLIC_ALLOW_LOCALHOST_IFRAME=true
```

**URL Examples**:

```html
<!-- Embedding in external app -->
<iframe src="https://server.com/formsa/my-form?version=1.0.5"></iframe>

<!-- With Dashboard token (optional) -->
<iframe src="https://server.com/formsa/my-form?s=aAAV/9xqhAE="></iframe>

<!-- Local development -->
<iframe src="http://localhost:3001/formsa/my-form"></iframe>
```

**Parameters Received by Form**:

```typescript
// Same dashboardParams structure as /form route
// BUT: Can be null if no token provided

export default function MyForm({ dashboardParams }) {
  if (!dashboardParams) {
    // No Dashboard token provided
    // Form must handle anonymous/guest mode
    return <GuestModeUI />
  }

  // Has Dashboard parameters
  const { userName, apiUrl, ... } = dashboardParams
}
```

**Origin Validation**:

```typescript
// lib/iframe-origin-validator.ts
export function validateIframeOrigin() {
  // 1. Check if in iframe
  const isInIframe = window !== window.parent

  // 2. Get parent origin
  const parentOrigin = document.referrer || window.parent.location.origin

  // 3. Check against allowed list
  const allowed = [
    'https://<your-server>',
    'https://*.example.com',  // Wildcard support
    'http://localhost:3000'   // If ALLOW_LOCALHOST_IFRAME=true
  ]

  // 4. Return validation result
  return {
    isInIframe,
    isAllowedOrigin,
    parentOrigin,
    error
  }
}
```

---

### Comparison: `/form` vs `/formsa`

| Feature | `/form` | `/formsa` |
|---------|---------|-----------|
| **Dashboard token 's'** | Required (prod) / Optional (dev) | Optional (always) |
| **ALLOW_DEV_MODE** | ✅ Checked | ❌ Ignored |
| **Iframe requirement** | ❌ Not required | ✅ MUST be iframe |
| **Origin validation** | ❌ Not validated | ✅ Always validated |
| **Dev credentials** | ✅ Yes (if ALLOW_DEV_MODE=true) | ✅ Yes (always available) |
| **Direct browser access** | ✅ Allowed (if dev mode) | ❌ Blocked |
| **External embedding** | ❌ Not designed for | ✅ Designed for |

### When to Use Each Route

**Use `/form/[formName]`** when:
- ✅ Forms opened from BIZUIT Dashboard
- ✅ Standard workflow
- ✅ Dashboard token available
- ✅ Local development with dev credentials

**Use `/formsa/[formName]`** when:
- ✅ Embedding in external applications
- ✅ Third-party integrations
- ✅ Iframe contexts only
- ✅ Optional Dashboard token
- ✅ Need origin restriction

### Query Parameters Reference

Both routes support these query parameters:

```typescript
// Version selection (optional)
?version=1.0.5
// Loads specific version instead of currentVersion

// Dashboard parameters (from Dashboard)
?s=aAAV/9xqhAE=           // Encrypted token (REQUIRED in prod for /form)
&InstanceId=12345          // Process instance ID
&UserName=john.doe         // Authenticated user
&eventName=MyProcess       // Process name
&activityName=Task1        // Activity name
&token=Basic123            // Additional auth token
```

### Examples with Full URLs

**Standard form (from Dashboard)**:
```
https://<your-server>/<tenant>BIZUITCustomForms/form/my-form?s=xJ9kL2mN...&InstanceId=98765&UserName=admin&eventName=MyProcess
```

**Standalone form (iframe)**:
```html
<!-- In external app -->
<iframe
  src="https://<your-server>/<tenant>BIZUITCustomForms/formsa/my-form?version=1.0.20"
  width="100%"
  height="800px"
></iframe>
```

**Development (local)**:
```
http://localhost:3001/form/my-form
# Uses dev-credentials.js automatically
```

---

## 🔐 Understanding Authentication

### Production Authentication Flow

```
┌──────────────┐
│ BIZUIT User  │
└──────┬───────┘
       │ 1. Clicks "Open Form"
       ▼
┌─────────────────────┐
│ BIZUIT Dashboard    │
│ (BPM System)        │
└──────┬──────────────┘
       │ 2. Generates JWT token
       │    { userName, roles, processName, exp }
       ▼
┌────────────────────────────────────────────────────┐
│ Runtime App                                        │
│ URL: /forms/my-form?token=eyJhbGc...              │
└──────┬─────────────────────────────────────────────┘
       │ 3. Validates token
       ▼
┌─────────────────────┐
│ Backend API         │
│ /api/auth/validate  │
└──────┬──────────────┘
       │ 4. Returns user context
       ▼
┌────────────────────────────────────────────────────┐
│ Form Executes with Context                         │
│ - userName: "john.doe"                             │
│ - roles: ["Admin", "Manager"]                      │
│ - processName: "ApprovalProcess"                   │
└────────────────────────────────────────────────────┘
```

### Development Mode Authentication

**Problem**: During development, you don't have access to the Dashboard to generate tokens.

**Solution**: Development credentials system

```javascript
// dev-credentials.js (you create this)
export const DEV_CREDENTIALS = {
  username: 'john.doe@company.com',
  password: 'YourPassword123',
  apiUrl: 'https://<your-server>/<tenant>BizuitDashboardapi/api/'
}
```

**How it works**:

1. **Environment Variable**: `ALLOW_DEV_MODE=true` in `.env.local`
2. **No Token in URL**: Runtime detects missing token
3. **Uses Dev Credentials**: Authenticates with Dashboard using dev credentials
4. **Gets Real Token**: Receives JWT token from Dashboard
5. **Form Runs Normally**: With real user context

**Security Note**:
- ⚠️ `ALLOW_DEV_MODE=true` **ONLY** for local development
- ⚠️ Production **MUST** have `ALLOW_DEV_MODE=false` or undefined
- ✅ Server-side variable (no rebuild needed per environment)

---

## 🔧 Environment Configuration Deep Dive

### Understanding Next.js Environment Variables

Next.js has **TWO types** of environment variables:

#### 1. Build-Time Variables (`NEXT_PUBLIC_*`)

**Characteristics**:
- Prefixed with `NEXT_PUBLIC_`
- Accessible in **client-side** code
- **Baked into JavaScript** during build
- Changing requires **full rebuild**

**Example**:

```env
# .env.local
NEXT_PUBLIC_BASE_PATH=/<tenant>BIZUITCustomForms
NEXT_PUBLIC_BIZUIT_DASHBOARD_API_URL=https://<your-server>/<tenant>BizuitDashboardapi/api
NEXT_PUBLIC_SESSION_TIMEOUT_MINUTES=30
```

```typescript
// Can use in client components
const apiUrl = process.env.NEXT_PUBLIC_BIZUIT_DASHBOARD_API_URL
```

**When to use**:
- Configuration that's the same for all users
- URLs, paths, feature flags
- Timeout values

**Important**:
```bash
# After changing NEXT_PUBLIC_* variables:
npm run build  # MUST rebuild!
npm start      # Then restart
```

#### 2. Server-Side Variables (no prefix)

**Characteristics**:
- No `NEXT_PUBLIC_` prefix
- Accessible **only** in server-side code
- Can be changed without rebuild (restart only)
- More secure (not exposed to client)

**Example**:

```env
# .env.local
FASTAPI_URL=http://127.0.0.1:8000
ALLOW_DEV_MODE=true
DATABASE_URL=postgresql://localhost:5432/db
```

```typescript
// Only in server components / API routes
const backendUrl = process.env.FASTAPI_URL
```

**When to use**:
- Secrets, API keys
- Database URLs
- Internal service URLs
- Environment-specific flags

**Important**:
```bash
# After changing server variables:
# NO rebuild needed!
./stop-all.sh
./start-all.sh  # Just restart
```

### Complete .env.local Reference

Create this file: `runtime-app/.env.local`

```env
# ==============================================================================
# BIZUIT BPM Dashboard API
# ==============================================================================

# Dashboard API base URL
# For development with CORS proxy:
NEXT_PUBLIC_BIZUIT_DASHBOARD_API_URL=/api/bizuit

# For production (direct URL):
# NEXT_PUBLIC_BIZUIT_DASHBOARD_API_URL=https://<your-server>/<tenant>BizuitDashboardapi/api

# HTTP timeout (milliseconds)
NEXT_PUBLIC_BIZUIT_TIMEOUT=30000

# Token expiration (minutes)
NEXT_PUBLIC_BIZUIT_TOKEN_EXPIRATION_MINUTES=60

# ==============================================================================
# Backend FastAPI
# ==============================================================================

# Backend API URL (server-side only)
FASTAPI_URL=http://127.0.0.1:8000

# Webhook secret for GitHub Actions
# Generate: openssl rand -hex 32
WEBHOOK_SECRET=your-webhook-secret-change-me

# ==============================================================================
# Deployment Configuration
# ==============================================================================

# Base path for subdirectory deployment
# Local development: Leave empty or commented out
# Production: Set to your subdirectory (e.g., /BIZUITCustomForms)
# NEXT_PUBLIC_BASE_PATH=/BIZUITCustomForms

# ==============================================================================
# Development Mode - CRITICAL SECURITY SETTING
# ==============================================================================

# Allow forms to load without Dashboard token
# DEVELOPMENT: true  - Allows dev-credentials.js usage
# PRODUCTION:  false - Requires Dashboard token (secure)
#
# ⚠️  This is a SERVER-SIDE variable (no NEXT_PUBLIC_)
# ✅  Can be different per deployment without rebuild
# ⚠️  NEVER set to 'true' in production!
#
ALLOW_DEV_MODE=true

# ==============================================================================
# Admin Panel Security
# ==============================================================================

# Session timeout for admin panel (minutes)
NEXT_PUBLIC_SESSION_TIMEOUT_MINUTES=30

# ==============================================================================
# Iframe Security (Standalone Forms /formsa/*)
# ==============================================================================

# Allowed origins for iframe embedding (comma-separated)
# Supports wildcards: https://*.example.com
NEXT_PUBLIC_ALLOWED_IFRAME_ORIGINS=https://<your-server>

# Allow localhost for iframe testing (development only)
NEXT_PUBLIC_ALLOW_LOCALHOST_IFRAME=true

# ==============================================================================
# Optional: Deployment Environment
# ==============================================================================

# Deployment environment identifier
# Values: production, testing, staging
# DEPLOY_ENV=testing
```

### Environment Variables Matrix

| Variable | Type | Rebuild? | Restart? | Where Used | Purpose |
|----------|------|----------|----------|------------|---------|
| `NEXT_PUBLIC_BIZUIT_DASHBOARD_API_URL` | Build-time | ✅ Yes | ✅ Yes | Client | Dashboard API URL |
| `NEXT_PUBLIC_BASE_PATH` | Build-time | ✅ Yes | ✅ Yes | Client | Deployment subdirectory |
| `NEXT_PUBLIC_BIZUIT_TIMEOUT` | Build-time | ✅ Yes | ✅ Yes | Client | HTTP timeout |
| `FASTAPI_URL` | Server-side | ❌ No | ✅ Yes | Server | Backend API URL |
| `ALLOW_DEV_MODE` | Server-side | ❌ No | ✅ Yes | Server | Dev credentials enabled |
| `WEBHOOK_SECRET` | Server-side | ❌ No | ✅ Yes | Server | GitHub webhook auth |

### Configuration by Environment

Different `.env.local` files for each environment:

#### Local Development Machine

**File**: `runtime-app/.env.local` (on your laptop)

```env
# Dashboard API (proxy for CORS)
NEXT_PUBLIC_BIZUIT_DASHBOARD_API_URL=/api/bizuit

# Backend API (local)
FASTAPI_URL=http://127.0.0.1:8000

# Development mode ENABLED
ALLOW_DEV_MODE=true

# No base path (root deployment)
# NEXT_PUBLIC_BASE_PATH=

# Localhost iframe allowed
NEXT_PUBLIC_ALLOW_LOCALHOST_IFRAME=true

# Session timeout
NEXT_PUBLIC_SESSION_TIMEOUT_MINUTES=30

# Webhook secret (for testing)
WEBHOOK_SECRET=dev-webhook-secret-local
```

#### Test/Staging Server (Tenant A - Dev/Test Environment)

**File**: `<deployment-path>/tenantA/tenantABIZUITCustomForms\.env.local`

```env
# Dashboard API (direct URL - tenant specific)
NEXT_PUBLIC_BIZUIT_DASHBOARD_API_URL=https://<your-server>/tenantABizuitDashboardapi/api

# Backend API (same server, port 8000)
FASTAPI_URL=http://127.0.0.1:8000

# Development mode ENABLED (test environment allows dev testing)
ALLOW_DEV_MODE=true

# Base path (subdirectory deployment)
NEXT_PUBLIC_BASE_PATH=/tenantABIZUITCustomForms

# Production iframe origins
NEXT_PUBLIC_ALLOWED_IFRAME_ORIGINS=https://<your-server>

# Localhost iframe NOT allowed
NEXT_PUBLIC_ALLOW_LOCALHOST_IFRAME=false

# Session timeout
NEXT_PUBLIC_SESSION_TIMEOUT_MINUTES=30

# Webhook secret (production secret)
WEBHOOK_SECRET=<production-secret-from-vault>
```

#### Production Server (Tenant B - Production Environment)

**File**: `<deployment-path>/tenantB/tenantBBIZUITCustomForms\.env.local`

```env
# Dashboard API (direct URL - different tenant)
NEXT_PUBLIC_BIZUIT_DASHBOARD_API_URL=https://<your-server>/tenantBBizuitDashboardapi/api

# Backend API (same server, port 8000)
FASTAPI_URL=http://127.0.0.1:8000

# Development mode DISABLED (production security)
ALLOW_DEV_MODE=false

# Base path (different subdirectory)
NEXT_PUBLIC_BASE_PATH=/tenantBBIZUITCustomForms

# Production iframe origins
NEXT_PUBLIC_ALLOWED_IFRAME_ORIGINS=https://<your-server>

# Localhost iframe NOT allowed
NEXT_PUBLIC_ALLOW_LOCALHOST_IFRAME=false

# Session timeout
NEXT_PUBLIC_SESSION_TIMEOUT_MINUTES=30

# Webhook secret (same as other deployments)
WEBHOOK_SECRET=<production-secret-from-vault>
```

### Key Differences by Environment

| Setting | Local Dev | Test/Staging (Tenant A) | Production (Tenant B) |
|---------|-----------|------------------------|----------------------|
| **NEXT_PUBLIC_BIZUIT_DASHBOARD_API_URL** | `/api/bizuit` (proxy) | `https://<server>/tenantABizuitDashboardapi/api` | `https://<server>/tenantBBizuitDashboardapi/api` |
| **FASTAPI_URL** | `http://127.0.0.1:8000` | `http://127.0.0.1:8000` | `http://127.0.0.1:8000` |
| **ALLOW_DEV_MODE** | `true` | `true` (testing) | `false` (secure) |
| **NEXT_PUBLIC_BASE_PATH** | (empty) | `/tenantABIZUITCustomForms` | `/tenantBBIZUITCustomForms` |
| **NEXT_PUBLIC_ALLOW_LOCALHOST_IFRAME** | `true` | `false` | `false` |

### Multi-Tenant Deployment Strategy

**Same codebase, different configurations**:

```
Single Build Artifact
        ↓
    Deployed to Multiple Tenants
        ↓
┌─────────────────┬─────────────────┐
│  Tenant A       │  Tenant B       │
│  (Test/Staging) │  (Production)   │
├─────────────────┼─────────────────┤
│ ALLOW_DEV_MODE  │ ALLOW_DEV_MODE  │
│ = true          │ = false         │
│                 │                 │
│ BASE_PATH       │ BASE_PATH       │
│ = /tenantA...   │ = /tenantB...   │
│                 │                 │
│ API URL         │ API URL         │
│ = .../tenantA...│ = .../tenantB...│
└─────────────────┴─────────────────┘

Each tenant has different .env.local
NO rebuild needed (server-side vars)
```

### Why Server-Side Variables Matter

**Example**: `ALLOW_DEV_MODE`

```bash
# Without server-side variable (old way):
# Build for Tenant A with ALLOW_DEV_MODE=true
NEXT_PUBLIC_ALLOW_DEV_MODE=true npm run build

# Same build used for Tenant B
# Problem: Tenant B also has ALLOW_DEV_MODE=true (insecure!)

# With server-side variable (new way):
# Single build (no ALLOW_DEV_MODE baked in)
npm run build

# Deploy to Tenant A with .env.local:
ALLOW_DEV_MODE=true  # Test/Staging environment

# Deploy to Tenant B with .env.local:
ALLOW_DEV_MODE=false  # Production secure

# ✅ Same artifact, different security per tenant
```

---

## 🔑 Development Credentials Setup

### Why Dev Credentials?

Without dev credentials:
```
❌ Can't test forms locally
❌ Always need Dashboard access
❌ Can't work offline
❌ Slow development iteration
```

With dev credentials:
```
✅ Test forms instantly
✅ No Dashboard dependency
✅ Work offline
✅ Fast iteration
```

### Step-by-Step Setup

#### Step 1: Enable Dev Mode

Edit `runtime-app/.env.local`:

```env
ALLOW_DEV_MODE=true  # ← Add or uncomment this line
```

#### Step 2: Create Dev Credentials File

```bash
cd runtime-app
cp dev-credentials.example.js dev-credentials.js
```

#### Step 3: Get Your Credentials

**Option A: From your team lead**
```javascript
// dev-credentials.js
export const DEV_CREDENTIALS = {
  username: 'provided-by-team@company.com',
  password: 'ProvidedPassword123',
  apiUrl: 'https://test.bizuit.com/companyBizuitDashboardapi/api/'
}
```

**Option B: Use your own test account**

1. Get your tenant name (e.g., `contoso`, `acme`)
2. Get your test Dashboard credentials
3. Construct API URL:

```javascript
// Pattern: https://<your-server>/{tenant}BizuitDashboardapi/api/
export const DEV_CREDENTIALS = {
  username: 'your.email@company.com',
  password: 'YourDashboardPassword',
  apiUrl: 'https://<your-server>/<tenant>BizuitDashboardapi/api/'
}
```

#### Step 4: Verify Setup

```bash
# Start runtime app
cd runtime-app
npm run dev

# Open browser
open http://localhost:3001/forms/test-form

# Check console (should NOT see token errors)
# Should see: "Authenticated with dev credentials"
```

### Security Checklist

- ✅ `dev-credentials.js` in `.gitignore` (already done)
- ✅ Never commit real credentials
- ✅ Use test/dev accounts only (NOT production accounts)
- ✅ `ALLOW_DEV_MODE=true` only in local `.env.local`
- ✅ Production: `ALLOW_DEV_MODE=false` or undefined

### Troubleshooting Dev Credentials

**Problem**: "Authentication failed"

```bash
# Check credentials file exists
ls runtime-app/dev-credentials.js

# Check ALLOW_DEV_MODE is enabled
grep ALLOW_DEV_MODE runtime-app/.env.local

# Check API URL format (must end with /api/)
cat runtime-app/dev-credentials.js
```

**Problem**: "TypeError: Cannot read property 'username'"

```bash
# File exists but has wrong format
# Must export object with username, password, apiUrl
```

---

## 💻 Development Workflows

### Workflow 1: Full Stack Development

**Use when**: Developing form functionality that needs backend

**Services needed**:
- ✅ Backend API (port 8000)
- ✅ Runtime App (port 3001)

**Setup**:

```bash
# Terminal: Start all services
./start-all.sh

# What starts:
# - Backend API on 8000
# - Showcase on 3000 (optional)
# - Runtime on 3001
```

**Develop your form**:

```bash
# Your form directory
cd forms-examples/my-form

# Hot reload enabled - just edit and save
code src/index.tsx
```

**Test your form**:

```
http://localhost:3001/forms/my-form
```

**Watch logs**:

```bash
# Backend logs
tail -f logs/backend-api.log

# Runtime logs
tail -f logs/runtime-app.log
```

**When to use**:
- Building new forms
- Testing Bizuit SDK integration
- Testing process calls (raiseEvent, initialize)
- Testing with real backend
- Full integration testing

---

### Workflow 2: Fat Bundle Development

**Use when**: Quick UI iterations, styling, component testing

**Services needed**:
- ❌ Backend API (NOT needed)
- ❌ Runtime App (NOT needed)
- ✅ Simple HTTP server

**What is a Fat Bundle?**

A self-contained JavaScript file with **everything**:
- Your form code
- React library
- All dependencies (UI components, SDK, etc.)
- Ready to run standalone

**Setup**:

```bash
# Terminal 1: Build fat bundle
cd forms-examples/my-form
npm run build

# Creates: dist/form.js (fat bundle)
# Also creates: dist/dev.html (test page)
```

```bash
# Terminal 2: Serve via HTTP
cd dist
python3 -m http.server 8080
```

```bash
# Terminal 3: Open dev.html
open http://localhost:8080/dev.html
```

**What you see**:

```html
<!-- dev.html -->
<!DOCTYPE html>
<html>
<head>
  <title>Form Development</title>
</head>
<body>
  <div id="root"></div>
  <script src="./form.js"></script>
  <!-- ^ Fat bundle with everything -->
</body>
</html>
```

**Development loop**:

```bash
# 1. Edit form
code src/index.tsx

# 2. Rebuild (fast - only your code)
npm run build

# 3. Refresh browser (Cmd+R)
# See changes instantly!
```

**Mock data**:

```typescript
// In your form
const mockData = {
  user: { userName: 'dev', roles: ['Admin'] },
  process: { processName: 'TestProcess' }
}

// Use mock data for development
const data = __DEV__ ? mockData : await sdk.process.initialize()
```

**When to use**:
- Styling and layout
- Component behavior
- Form validation
- UI interactions
- No backend needed

**Limitations**:
- ❌ Can't call real Bizuit APIs
- ❌ Can't test process integration
- ✅ Perfect for UI-only work

---

### Workflow 3: Runtime Testing (Port 3001)

**Use when**: Testing form as it will run in production

**⚠️ CRITICAL**: Port 3001 loads forms **from the database**, NOT from your filesystem

**Requirements**:

1. ✅ Form must be **built** (`npm run build`)
2. ✅ Form must be **packaged** as ZIP
3. ✅ ZIP must be **uploaded** via admin panel
4. ✅ Form must exist in `CustomForms` table
5. ✅ Backend API must be **running**

**Full Process**:

```bash
# Step 1: Build your form
cd forms-examples/my-form
npm run build

# Step 2: Get deployment ZIP
# Option A: From upload/ directory (if workflow ran)
ls -lt upload/*.zip | head -1

# Option B: Create manually
cd dist
zip -r ../my-form-deployment.zip .
cd ..

# Step 3: Start backend
cd ../../backend-api
python main.py

# Step 4: Start runtime
cd ../runtime-app
npm run dev

# Step 5: Upload via admin panel
open http://localhost:3001/admin/upload-forms
# Drag and drop your ZIP

# Step 6: Test form
open http://localhost:3001/forms/my-form
```

**Why this workflow?**

- ✅ Tests real production behavior
- ✅ Tests form loading from database
- ✅ Tests version management
- ✅ Tests with real backend APIs
- ✅ Catches issues before deployment

**Common mistake**:

```bash
# ❌ WRONG: Expecting port 3001 to load from filesystem
# Edit src/index.tsx
# Refresh http://localhost:3001/forms/my-form
# See OLD version (from database)

# ✅ CORRECT: Upload new version first
npm run build
# Upload new ZIP via admin
# Refresh http://localhost:3001/forms/my-form
# See NEW version
```

---

## 🧪 Testing Strategies

### Testing Matrix

| Test Type | Workflow | Backend | Speed | Use Case |
|-----------|----------|---------|-------|----------|
| **UI Only** | Fat Bundle | ❌ No | ⚡ Instant | Styling, layout, components |
| **Integration** | Full Stack | ✅ Yes | 🐢 Moderate | SDK calls, process integration |
| **Production-Like** | Runtime (3001) | ✅ Yes | 🐌 Slow | Final validation, deployment prep |

### Test Scenario Examples

#### Scenario 1: Building a New Form Component

```bash
# Use: Fat Bundle (fastest)

# 1. Create component
cd forms-examples/my-form/src
code components/MyComponent.tsx

# 2. Import in form
# src/index.tsx
import { MyComponent } from './components/MyComponent'

# 3. Build and test
npm run build
open http://localhost:8080/dev.html

# 4. Iterate rapidly
# Edit, build, refresh - takes seconds!
```

#### Scenario 2: Testing Bizuit SDK Integration

```bash
# Use: Full Stack (needs backend)

# 1. Start services
./start-all.sh

# 2. Implement SDK call
// src/index.tsx
const result = await sdk.process.raiseEvent({
  processName: 'MyProcess',
  parameters: [...]
})

# 3. Test with dev credentials
open http://localhost:3001/forms/my-form

# 4. Check backend logs
tail -f logs/backend-api.log
```

#### Scenario 3: Pre-Deployment Testing

```bash
# Use: Runtime Testing (production-like)

# 1. Build final version
npm run build

# 2. Upload via admin
open http://localhost:3001/admin/upload-forms

# 3. Test exactly as production
open http://localhost:3001/forms/my-form?token=...

# 4. Verify everything works
# - Form loads
# - API calls succeed
# - Process integration works
# - No console errors
```

### Testing Checklist

Before pushing to production:

- [ ] UI looks correct (Fat Bundle testing)
- [ ] Form validation works (Fat Bundle testing)
- [ ] SDK integration works (Full Stack testing)
- [ ] Process calls succeed (Full Stack testing)
- [ ] Form loads from database (Runtime testing)
- [ ] No console errors (Runtime testing)
- [ ] Mobile responsive (All browsers)
- [ ] Dark mode works (If applicable)

---

## 📦 Deployment Process

### Deployment Overview

```
Local Development
       ↓
  Git Commit
       ↓
  Push to main
       ↓
GitHub Actions Workflow
       ↓
  • Detects changed forms
  • Builds each form
  • Bumps version
  • Creates deployment ZIP
  • Uploads to Artifacts
  • Commits ZIP to repo
  • Creates git tag
       ↓
Download Artifact
       ↓
Upload to Admin Panel
       ↓
  Production! 🎉
```

### Step-by-Step Deployment

#### Step 1: Prepare Your Form

```bash
# Ensure form builds successfully
cd forms-examples/my-form
npm run build

# Check for errors
# Verify dist/form.js exists
ls -lh dist/form.js
```

#### Step 2: Commit Changes

```bash
# Stage changes
git add forms-examples/my-form/src/

# Commit with semantic versioning message
# feat: = minor version bump
# fix: = patch version bump
# BREAKING CHANGE: = major version bump

git commit -m "feat: add new field to my-form

- Added email validation
- Improved error messages"

# Push to main
git push origin main
```

#### Step 3: Monitor GitHub Workflow

```bash
# Watch workflow
open https://github.com/your-org/your-repo/actions

# Or via CLI
gh run list --limit 1
gh run watch
```

**What the workflow does**:

```
✅ Detect changes: Finds my-form was modified
✅ Install deps: npm install
✅ Build form: npm run build in my-form/
✅ Calculate version: Reads last tag, bumps version
   Last: my-form-v1.0.5
   New:  my-form-v1.0.6
✅ Update package.json: Sets version to 1.0.6
✅ Create ZIP: my-form-deployment-1.0.6-abc1234.zip
   Contents:
   - manifest.json (ONLY my-form)
   - forms/my-form/form.js
   - VERSION.txt
✅ Upload artifact: To GitHub Actions
✅ Commit ZIP: To my-form/upload/
✅ Create tag: my-form-v1.0.6
✅ Push changes: Back to repo
```

#### Step 4: Download Artifact

**Option A: From GitHub Actions**

```bash
# Via web
open https://github.com/your-org/your-repo/actions
# Click latest run
# Click "Artifacts"
# Download: my-form-deployment-1.0.6-abc1234.zip

# Via CLI
gh run list --limit 1
gh run download <run-id>
```

**Option B: From Repository**

```bash
# Pull latest
git pull origin main

# ZIP is already committed
ls -lh forms-examples/my-form/upload/*.zip

# Use latest ZIP
cp forms-examples/my-form/upload/my-form-deployment-1.0.6-abc1234.zip ~/Downloads/
```

#### Step 5: Upload to Production

```bash
# Access admin panel
open https://your-prod-server.com/admin/upload-forms

# Or local testing
open http://localhost:3001/admin/upload-forms

# Steps:
# 1. Login with admin credentials
# 2. Drag and drop ZIP
# 3. Click "Upload"
# 4. Wait for success message
# 5. Verify form appears in list
```

#### Step 6: Verify Deployment

```bash
# Test form in production
open https://your-prod-server.com/forms/my-form?token=<prod-token>

# Verify:
# ✅ Form loads without errors
# ✅ New features work
# ✅ No console errors
# ✅ API calls succeed
```

### Versioning System

**Automatic Semantic Versioning**:

```bash
# Commit message format determines version bump
# Pattern: type: description

# Patch bump (1.0.5 → 1.0.6)
git commit -m "fix: correct validation bug"
git commit -m "chore: update dependencies"

# Minor bump (1.0.5 → 1.1.0)
git commit -m "feat: add new export feature"

# Major bump (1.0.5 → 2.0.0)
git commit -m "feat: redesign form layout

BREAKING CHANGE: old API endpoints removed"
```

**Git Tags**:

```bash
# Each form has independent tags
git tag | grep my-form
# my-form-v1.0.0
# my-form-v1.0.1
# my-form-v1.0.2
# ...

# View tag details
git show my-form-v1.0.6

# Tags are source of truth for versioning
# workflow uses last tag to calculate next version
```

### Rollback Process

**If deployment has issues**:

```bash
# Find previous working version
cd forms-examples/my-form/upload
ls -lt *.zip

# Upload previous ZIP
# my-form-deployment-1.0.5-xyz7890.zip

# Or revert git commit
git revert HEAD
git push origin main
# Workflow runs again with old code
```

---

## 📋 Manifest.json & Validation Rules

### Understanding manifest.json

Every deployment ZIP contains a `manifest.json` file with metadata about the forms:

```json
{
  "packageVersion": "1.0.202511231900",
  "buildDate": "2025-11-23T19:00:00.000Z",
  "commitHash": "abc1234...",
  "commitShortHash": "abc1234",
  "repositoryUrl": "https://github.com/org/repo",
  "commitUrl": "https://github.com/org/repo/commit/abc1234",
  "workflowRunUrl": "https://github.com/org/repo/actions/runs/123",
  "forms": [
    {
      "formName": "my-form",
      "processName": "MyForm",
      "version": "1.0.5",
      "gitTag": "my-form-v1.0.5",
      "author": "Tyconsa",
      "description": "My custom form description",
      "releaseNotes": "- Added new feature\n- Fixed bug",
      "sizeBytes": 12345,
      "path": "forms/my-form/form.js"
    }
  ]
}
```

### Field Validation Rules

The backend validates ALL fields with strict regex patterns for security:

#### formName Validation

**Regex**: `^[a-zA-Z0-9_-]+$`

**Allowed**:
- Letters (a-z, A-Z)
- Numbers (0-9)
- Underscore (_)
- Hyphen (-)

**NOT allowed**:
- ❌ Spaces
- ❌ Special characters
- ❌ Dots (except in exceptions)

**Examples**:
```javascript
✅ "my-form"
✅ "form_123"
✅ "my-form-v2"
❌ "my form"         // Space
❌ "my.form"         // Dot (not allowed in formName)
❌ "my-form!"        // Special char
```

#### author Validation

**Regex**: `^[a-zA-Z0-9._@-]+$`

**Allowed**:
- Letters (a-z, A-Z)
- Numbers (0-9)
- Dot (.)
- Underscore (_)
- At sign (@)
- Hyphen (-)

**NOT allowed**:
- ❌ **Spaces** (most common mistake!)
- ❌ Special characters (&, !, $, etc.)

**Examples**:
```javascript
✅ "Tyconsa"
✅ "john.doe@bizuit.com"
✅ "Tycon-SA"
✅ "Tycon_SA"
❌ "Tycon S.A."      // Space AND dot at end
❌ "Tycon SA"        // Space
❌ "Tycon & Co"      // Space and &
```

**Why no spaces?** Security and parsing:
- Prevents SQL injection
- Prevents command injection
- Prevents XSS attacks
- Easier log parsing
- Compatible with legacy systems

#### version Validation

**Regex**: `^\d+\.\d+\.\d+$` (Semantic Versioning)

**Format**: MAJOR.MINOR.PATCH

**Examples**:
```javascript
✅ "1.0.0"
✅ "2.15.3"
✅ "10.0.1"
❌ "1.0"            // Missing patch
❌ "v1.0.0"         // Has 'v' prefix
❌ "1.0.0-beta"     // Has suffix
```

#### processName Validation

**Regex**: `^[a-zA-Z0-9 _-]+$`

**Allowed**:
- Letters, numbers
- **Spaces** (unlike formName and author!)
- Underscore, hyphen

**Examples**:
```javascript
✅ "Expense Approval Process"
✅ "Process-123_v2"
✅ "MyProcess"
❌ "Process'; DROP--"
```

**Note**: processName DOES allow spaces (unlike author).

### Complete Field Reference

| Field | Regex | Allows Spaces? | Max Length | Example |
|-------|-------|----------------|------------|---------|
| **formName** | `^[a-zA-Z0-9_-]+$` | ❌ No | 100 | `my-form` |
| **author** | `^[a-zA-Z0-9._@-]+$` | ❌ No | 100 | `Tyconsa` |
| **version** | `^\d+\.\d+\.\d+$` | ❌ No | - | `1.0.5` |
| **processName** | `^[a-zA-Z0-9 _-]+$` | ✅ Yes | 200 | `My Process` |
| **description** | (no strict validation) | ✅ Yes | - | Any text |
| **tokenId** | GUID or integer | ❌ No | - | `550e8400-...` |
| **commitHash** | `^[a-fA-F0-9]{40}$` | ❌ No | 40 | SHA-1 hash |

### Common Validation Errors

#### Error: "Invalid author format"

```json
// ❌ WRONG
{
  "author": "Tycon S.A."  // Has space and dot
}

// ❌ WRONG
{
  "author": "Tycon SA"  // Has space
}

// ✅ CORRECT
{
  "author": "Tyconsa"  // No spaces
}

// ✅ ALSO CORRECT
{
  "author": "Tycon-SA"     // Hyphen instead of space
  "author": "Tycon_SA"     // Underscore instead of space
  "author": "john.doe"     // Dot allowed
  "author": "admin@bizuit" // @ allowed
}
```

#### Error: "Invalid formName format"

```json
// ❌ WRONG
{
  "formName": "my form"  // Has space
}

// ✅ CORRECT
{
  "formName": "my-form"  // Use hyphen
}
```

#### Error: "Invalid version format"

```json
// ❌ WRONG
{
  "version": "1.0"     // Missing patch number
}

// ❌ WRONG
{
  "version": "v1.0.0"  // Has 'v' prefix
}

// ✅ CORRECT
{
  "version": "1.0.0"  // MAJOR.MINOR.PATCH
}
```

### package.json Best Practices

Your `package.json` becomes the manifest metadata:

```json
{
  "name": "@tyconsa/bizuit-form-my-form",
  "version": "1.0.0",  // ← Managed by workflow, don't change manually
  "description": "My form description (can have spaces)",
  "author": "Tyconsa",  // ← NO SPACES! Only: a-z A-Z 0-9 . _ @ -
  "license": "ISC"
}
```

**Rules**:
- ✅ `name`: Can have scope (@tyconsa/) and hyphens
- ⚠️ `version`: Managed by workflow (git tags are source of truth)
- ✅ `description`: Free text, can have spaces
- ⚠️ `author`: **NO SPACES** - Use `Tyconsa`, `John-Doe`, `admin@bizuit`, etc.

### Why These Validations?

**Security (Defense in Depth)**:
1. **SQL Injection Prevention**: Even with prepared statements, whitelist validation adds security
2. **Command Injection**: If metadata is used in shell commands
3. **XSS Prevention**: Metadata displayed in admin panel HTML
4. **Log Injection**: Clean logs without special characters
5. **Path Traversal**: Prevent `../../../` attacks

**Consistency**:
- Same validation rules across all forms
- Predictable behavior
- Easier debugging

**Compatibility**:
- Works with all databases
- Works with all file systems
- Works with legacy systems

---

## 🎓 Common Scenarios

### Scenario: Starting a New Form

```bash
# 1. Copy example form
cd forms-examples
cp -r dashboard-integration-demo my-new-form

# 2. Update package.json
cd my-new-form
# Edit package.json: name, description

# 3. Start development
npm install
npm run build

# 4. Test with fat bundle
cd dist
python3 -m http.server 8080
open http://localhost:8080/dev.html

# 5. Develop your form
code src/index.tsx

# 6. When ready, test on runtime
cd ../../..
./start-all.sh
# Upload via admin panel
# Test on http://localhost:3001/forms/my-new-form

# 7. Deploy
git add forms-examples/my-new-form
git commit -m "feat: add new form"
git push origin main
```

### Scenario: Debugging Token Issues

```bash
# Enable debug logging
# runtime-app/middleware.ts (check console)

# Check dev mode
cat runtime-app/.env.local | grep ALLOW_DEV_MODE
# Should be: ALLOW_DEV_MODE=true

# Check dev credentials
cat runtime-app/dev-credentials.js
# Should have: username, password, apiUrl

# Test authentication
curl http://localhost:8000/api/auth/validate?token=test

# Check backend logs
tail -f logs/backend-api.log
# Look for: "Token validation failed" or "401"
```

### Scenario: Changing Deployment Environment

```bash
# You have multiple deployments:
# - server.com/tenantABIZUITCustomForms (ALLOW_DEV_MODE=true)
# - server.com/tenantBBIZUITCustomForms (ALLOW_DEV_MODE=false)

# Same codebase, different .env.local per deployment

# Deployment 1 (.env.local):
ALLOW_DEV_MODE=true
NEXT_PUBLIC_BASE_PATH=/tenantABIZUITCustomForms

# Deployment 2 (.env.local):
ALLOW_DEV_MODE=false  # Secure!
NEXT_PUBLIC_BASE_PATH=/tenantBBIZUITCustomForms

# Restart app (NO rebuild needed for ALLOW_DEV_MODE!)
./stop-all.sh && ./start-all.sh
```

---

## 🐛 Troubleshooting

### Problem: Port Already in Use

```bash
# Error: EADDRINUSE: address already in use :::3001

# Solution: Kill processes
lsof -ti:8000 | xargs kill -9  # Backend
lsof -ti:3000 | xargs kill -9  # Showcase
lsof -ti:3001 | xargs kill -9  # Runtime

# Or use stop script
./stop-all.sh
./start-all.sh
```

### Problem: Form Not Loading on Port 3001

```bash
# Error: "Form not found" or blank page

# Checklist:
# ✅ Backend running?
curl http://localhost:8000/docs  # Should load Swagger UI

# ✅ Form in database?
# Via admin panel
open http://localhost:3001/admin
# Check forms list

# ✅ Form uploaded?
# Upload via admin panel first!

# ✅ Using correct form name?
# URL: /forms/my-form (lowercase, hyphens)
# Not: /forms/MyForm or /forms/my_form
```

### Problem: Authentication Failed

```bash
# Error: "Invalid token" or 401

# For dev mode:
# ✅ Check ALLOW_DEV_MODE
grep ALLOW_DEV_MODE runtime-app/.env.local
# Should be: ALLOW_DEV_MODE=true

# ✅ Check dev-credentials.js exists
ls runtime-app/dev-credentials.js

# ✅ Check credentials format
cat runtime-app/dev-credentials.js
# Must have: username, password, apiUrl

# ✅ Test credentials manually
# Try logging into Dashboard with same credentials

# For production mode:
# ✅ Check token in URL
# Should have: ?token=eyJhbGc...

# ✅ Check backend
tail -f logs/backend-api.log
# Look for token validation errors
```

### Problem: Build Errors

```bash
# Error: "Module not found" or TypeScript errors

# Solution: Clean and reinstall
cd forms-examples/my-form
rm -rf node_modules package-lock.json
npm install
npm run build

# For Next.js errors:
cd ../../runtime-app
rm -rf .next node_modules
npm install
npm run build
```

### Problem: Changes Not Reflecting

```bash
# Scenario 1: Changed NEXT_PUBLIC_* variable
# Solution: Rebuild required
npm run build
npm start

# Scenario 2: Changed server variable
# Solution: Restart only
./stop-all.sh && ./start-all.sh

# Scenario 3: Changed form code, testing on 3001
# Solution: Upload new version
npm run build
# Upload new ZIP via admin panel

# Scenario 4: Changed form code, testing fat bundle
# Solution: Rebuild and refresh
npm run build
# Refresh browser (Cmd+R)
```

### Problem: Workflow Not Triggering

```bash
# Check workflow triggers
# Must push to main branch
# Must change files in forms-examples/*/src/**

# Verify
git log --oneline -1
git diff HEAD~1 HEAD --name-only

# Should show changed files like:
# forms-examples/my-form/src/index.tsx

# Check workflow status
gh run list --limit 5
```

---

## ❓ FAQs

### Q: Do I need the Dashboard running locally?

**A**: No! That's the point of dev credentials. The runtime app authenticates with the **test** Dashboard (test.bizuit.com) using your dev credentials.

---

### Q: Can I work offline?

**A**: Partially. You can:
- ✅ Edit form code
- ✅ Build fat bundle
- ✅ Test UI via dev.html
- ❌ Can't test SDK calls (need Dashboard API)
- ❌ Can't test process integration

---

### Q: Which workflow should I use?

| Task | Workflow |
|------|----------|
| Styling/layout | Fat Bundle |
| New components | Fat Bundle |
| Form validation UI | Fat Bundle |
| SDK integration | Full Stack |
| Process testing | Full Stack |
| Final testing | Runtime (3001) |

---

### Q: Why does my form work in dev but not in production?

Common causes:
1. **ALLOW_DEV_MODE**: Production should be `false`
2. **Environment variables**: Check production `.env.local`
3. **Base path**: Production has `/BIZUITCustomForms`, dev doesn't
4. **API URLs**: Different between dev and prod
5. **Secrets**: Missing in production environment

---

### Q: How do I debug in production?

```typescript
// Add console logging in your form
console.log('[MyForm] User context:', user)
console.log('[MyForm] Process data:', processData)

// Check browser console in production
// Use browser DevTools

// Enable verbose SDK logging
const sdk = new BizuitSDK({ debug: true })
```

---

### Q: Can I have multiple forms in one repository?

**A**: Yes! That's the design:

```
forms-examples/
├── form-1/
├── form-2/
├── form-3/
└── ...

# Each form:
# - Independent versioning
# - Independent deployment
# - Own upload/ directory
# - Own git tags
```

---

### Q: What happens if I manually change package.json version?

**A**: The workflow will auto-correct it:
- Reads last git tag (source of truth)
- Calculates next version
- Overwrites package.json
- Commits the correction

**Don't manually change package.json versions!**

---

### Q: How do I test with real Dashboard tokens?

```bash
# Get token from Dashboard
# (Your team will provide this)

# Test with token
open http://localhost:3001/forms/my-form?token=eyJhbGc...

# Disable dev mode to force token requirement
# .env.local
ALLOW_DEV_MODE=false

# Restart
./stop-all.sh && ./start-all.sh
```

---

## 🎓 Learning Path for Junior Developers

### Week 1: Setup and Basics

**Day 1-2**: Environment setup
- [ ] Clone repository
- [ ] Install dependencies
- [ ] Setup `.env.local`
- [ ] Setup `dev-credentials.js`
- [ ] Start all services successfully

**Day 3-4**: Explore examples
- [ ] Browse showcase examples
- [ ] Open forms in browser
- [ ] Inspect with browser DevTools
- [ ] Read form source code

**Day 5**: Create first form
- [ ] Copy example form
- [ ] Modify UI
- [ ] Test with fat bundle
- [ ] Add console.log debugging

### Week 2: Development Skills

**Day 1-3**: Fat bundle workflow
- [ ] Create simple form
- [ ] Style with Tailwind CSS
- [ ] Add form validation
- [ ] Test in dev.html

**Day 4-5**: Full stack workflow
- [ ] Use Bizuit SDK
- [ ] Make API calls
- [ ] Handle responses
- [ ] Test with dev credentials

### Week 3: Integration

**Day 1-2**: Runtime testing
- [ ] Upload form via admin
- [ ] Test on port 3001
- [ ] Verify database loading
- [ ] Test with tokens

**Day 3-5**: Deployment
- [ ] Commit changes
- [ ] Push to main
- [ ] Monitor GitHub Actions
- [ ] Download artifact
- [ ] Upload to admin panel

### Week 4: Advanced Topics

- [ ] Error handling
- [ ] Custom hooks
- [ ] Performance optimization
- [ ] Debugging techniques
- [ ] Security best practices

---

## 📖 Additional Resources

- **Main README**: `custom-forms/README.md`
- **Backend API Docs**: `http://localhost:8000/docs`
- **Showcase Examples**: `http://localhost:3000`
- **Admin Panel**: `http://localhost:3001/admin`
- **SDK Documentation**: `packages/bizuit-form-sdk/README.md`
- **UI Components**: `packages/bizuit-ui-components/README.md`

---

**Need help?** Ask your team lead or senior developer!

**Happy coding!** 🚀
