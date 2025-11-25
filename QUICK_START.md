# 🚀 BIZUIT Custom Forms - Quick Start Guide

> **Get started in 5 minutes** - From zero to your first form

**Last Updated**: 2025-11-24

---

## 📋 Prerequisites

```bash
# Check you have these installed
node --version    # v18.0.0 or higher
npm --version     # v9.0.0 or higher
python3 --version # v3.10 or higher (for backend)
git --version     # any recent version
```

---

## ⚡ 5-Minute Setup

### Step 1: Clone & Install (2 minutes)

```bash
# Clone repository
git clone <your-repo-url>
cd BIZUITCustomForms

# Initialize submodule
git submodule update --init --recursive

# Install submodule dependencies
cd custom-forms/bizuit-custom-form-sample
npm install
cd ../..
```

### Step 2: Configure Environment (1 minute)

```bash
# Backend API
cd custom-forms/backend-api
cp .env.example .env.local

# Edit .env.local with your database credentials
# Required: DB_SERVER, DB_DATABASE, DB_USER, DB_PASSWORD, etc.

# Runtime App
cd ../runtime-app
cp .env.example .env.local

# Edit .env.local - minimum required:
# NEXT_PUBLIC_BIZUIT_DASHBOARD_API_URL=https://<your-server>/<tenant>BizuitDashboardapi/api
# FASTAPI_URL=http://127.0.0.1:8000
# ALLOW_DEV_MODE=true  # For local development only!

# Dev credentials (for local testing without Dashboard)
cp dev-credentials.example.js dev-credentials.js
# Edit dev-credentials.js with your test credentials
```

### Step 3: Start Services (2 minutes)

```bash
# From project root
./start-all.sh

# This starts:
# - Backend API (port 8000)
# - Showcase (port 3000)
# - Runtime App (port 3001)
```

### Step 4: Verify Setup

```bash
# Check all services are running
open http://localhost:8000/docs    # Backend API (Swagger)
open http://localhost:3000         # Showcase
open http://localhost:3001/docs    # Runtime App docs

# View logs
tail -f logs/backend-api.log
tail -f logs/runtime-app.log
```

---

## 🎯 Two Development Workflows

### Workflow 1: Fat Bundle (⚡ Fastest - UI Only)

**Use for:** Styling, layout, components, form validation UI

**No backend needed!** Just a simple HTTP server.

```bash
# 1. Navigate to form
cd custom-forms/bizuit-custom-form-sample/form-template

# 2. Install dependencies (first time only)
npm install

# 3. Build fat bundle
npm run build
# Creates: dist/form.js (self-contained JavaScript with everything)

# 4. Serve with HTTP server
cd dist
python3 -m http.server 8080
# OR: npx http-server -p 8080

# 5. Open dev.html
open http://localhost:8080/dev.html
```

**Development Loop:**
```bash
# 1. Edit form
code src/index.tsx

# 2. Rebuild (fast!)
npm run build

# 3. Refresh browser (Cmd+R or F5)
# See changes instantly!
```

**What is a Fat Bundle?**

A single JavaScript file containing:
- ✅ Your form code
- ✅ React library (~130KB minified)
- ✅ All dependencies (UI components, SDK)
- ✅ Ready to run standalone in any HTML page

**Advantages:**
- ⚡ **Instant iteration** - no backend startup
- 🎨 **Perfect for UI work** - styling, layout, components
- 📦 **Self-contained** - works with any HTTP server
- 🚀 **Production-ready** - exact same bundle is deployed

**Limitations:**
- ❌ Can't call real Bizuit APIs (mock data instead)
- ❌ Can't test process integration
- ❌ No authentication flow

---

### Workflow 2: Full Stack (🔧 Complete - With Backend)

**Use for:** SDK integration, API calls, process testing, authentication

**Requires:** Backend API + Runtime App running

```bash
# 1. Start all services (if not running)
./start-all.sh

# 2. Your form directory
cd custom-forms/bizuit-custom-form-sample/form-template

# 3. Develop with hot reload
code src/index.tsx
# Edit and save - changes reflect automatically

# 4. Test form
open http://localhost:3001/form/form-template
# Uses dev-credentials.js for authentication

# 5. Watch logs
tail -f ../../../logs/backend-api.log
tail -f ../../../logs/runtime-app.log
```

**What you can test:**
- ✅ Real Bizuit API calls
- ✅ Authentication flow
- ✅ Process integration (initialize, raiseEvent)
- ✅ Instance locking
- ✅ File uploads
- ✅ Dashboard parameters

---

## 📊 Workflow Comparison

| Feature | Fat Bundle | Full Stack |
|---------|------------|------------|
| **Startup time** | ⚡ Instant | 🐢 ~30 seconds |
| **Iteration speed** | ⚡ 2-3 seconds | 🔄 5-10 seconds |
| **Backend needed** | ❌ No | ✅ Yes |
| **API testing** | ❌ Mock only | ✅ Real APIs |
| **UI development** | ✅ Perfect | ✅ Good |
| **Process testing** | ❌ No | ✅ Yes |
| **Authentication** | ❌ No | ✅ Yes |
| **Use when** | Building UI | Testing integration |

---

## 🎨 Creating Your First Form

### Option A: Start from Template

```bash
cd custom-forms/bizuit-custom-form-sample
mkdir my-first-form
cd my-first-form

# Copy form-template as starting point
cp -r ../form-template/* .

# Update package.json
code package.json
# Change: name, description, author

# Install and build
npm install
npm run build

# Test with fat bundle
cd dist && python3 -m http.server 8080
open http://localhost:8080/dev.html
```

### Option B: Minimal Example

```typescript
// src/index.tsx
import React, { useState } from 'react'
import ReactDOM from 'react-dom/client'
import { useBizuitSDK } from '@tyconsa/bizuit-form-sdk'
import { Button } from '@tyconsa/bizuit-ui-components'

function MyForm() {
  const sdk = useBizuitSDK()
  const [message, setMessage] = useState('')

  const handleSubmit = async () => {
    try {
      const result = await sdk.process.raiseEvent({
        processName: 'MyProcess',
        eventName: 'Start',
        parameters: []
      })
      setMessage('Process started successfully!')
    } catch (error) {
      setMessage(`Error: ${error.message}`)
    }
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">My First Form</h1>
      <Button onClick={handleSubmit}>Start Process</Button>
      {message && <p className="mt-4">{message}</p>}
    </div>
  )
}

// Mount form
const root = document.getElementById('root')
if (root) {
  ReactDOM.createRoot(root).render(<MyForm />)
}
```

---

## 🧪 Testing Your Form

### 1. Fat Bundle Testing (UI Only)

```bash
cd dist
python3 -m http.server 8080
open http://localhost:8080/dev.html
```

**What to test:**
- Form layout and styling
- Form validation
- Component behavior
- Responsive design

### 2. Runtime Testing (Full Integration)

```bash
# Build and package
npm run build

# Upload via admin panel
open http://localhost:3001/admin/upload-forms
# Drag and drop your form's deployment ZIP

# Test with dev credentials
open http://localhost:3001/form/my-first-form

# Or test with real Dashboard token
open http://localhost:3001/form/my-first-form?s=<dashboard-token>
```

**What to test:**
- Authentication flow
- API integration
- Process calls
- Error handling
- Console for errors

---

## 📦 Deploying Your Form

### Automatic Deployment via GitHub Actions

```bash
# 1. Commit your changes
git add custom-forms/bizuit-custom-form-sample/my-first-form/
git commit -m "feat: add my first form"

# 2. Push to main branch
git push origin main

# 3. GitHub Actions workflow automatically:
#    - Detects changed form
#    - Builds form
#    - Bumps version (semantic versioning)
#    - Creates deployment ZIP
#    - Uploads to GitHub Artifacts
#    - Commits ZIP to repo
#    - Creates git tag

# 4. Download deployment ZIP
#    Option A: From GitHub Actions artifacts
#    Option B: Pull from repo (already committed)

git pull origin main
ls -lh custom-forms/bizuit-custom-form-sample/my-first-form/upload/*.zip

# 5. Upload to production admin panel
# https://<your-server>/<tenant>BIZUITCustomForms/admin/upload-forms
```

### Manual Deployment (Development/Testing)

```bash
# 1. Build form
cd custom-forms/bizuit-custom-form-sample/my-first-form
npm run build

# 2. Create ZIP manually
cd dist
zip -r ../my-form-manual.zip .
cd ..

# 3. Upload via admin panel
# Drag and drop my-form-manual.zip
```

---

## 🔧 Common Tasks

### View Logs

```bash
# Real-time logs
tail -f logs/backend-api.log      # Backend errors, API calls
tail -f logs/runtime-app.log      # Runtime errors, form loading
tail -f logs/showcase.log         # Showcase errors

# Or use pm2 (if running with pm2)
pm2 logs
```

### Restart Services

```bash
# Stop all
./stop-all.sh

# Start all
./start-all.sh

# Or restart specific service
pm2 restart backend-api
pm2 restart runtime-app
```

### Clean Build

```bash
# Clean form build
cd custom-forms/bizuit-custom-form-sample/my-form
rm -rf node_modules dist
npm install
npm run build

# Clean runtime app
cd ../../runtime-app
rm -rf .next node_modules
npm install
npm run build
```

---

## 🐛 Troubleshooting

### Port Already in Use

```bash
# Kill processes on ports 3000, 3001, 8000
lsof -ti:8000 | xargs kill -9
lsof -ti:3000 | xargs kill -9
lsof -ti:3001 | xargs kill -9

# Then restart
./start-all.sh
```

### Form Not Loading

```bash
# Check backend is running
curl http://localhost:8000/docs

# Check form is in database
open http://localhost:3001/admin
# Look for your form in the list

# Check logs
tail -f logs/backend-api.log
tail -f logs/runtime-app.log
```

### Authentication Errors

```bash
# Verify dev mode enabled
grep ALLOW_DEV_MODE custom-forms/runtime-app/.env.local
# Should be: ALLOW_DEV_MODE=true

# Verify dev credentials exist
cat custom-forms/runtime-app/dev-credentials.js
# Should have: username, password, apiUrl

# Test credentials manually
# Try logging into Dashboard with same credentials
```

### Build Errors

```bash
# Clear caches and rebuild
cd custom-forms/bizuit-custom-form-sample/my-form
rm -rf node_modules package-lock.json dist
npm install
npm run build

# If TypeScript errors:
npm run build -- --verbose
# Check for missing types or syntax errors
```

---

## 📚 Next Steps

**After this quick start:**

1. **Read Full Developer Guide** → [DEVELOPER_GUIDE.md](custom-forms/DEVELOPER_GUIDE.md)
   - Complete architecture explanation
   - Environment configuration details
   - Authentication deep dive
   - Advanced workflows

2. **Explore Examples** → `custom-forms/bizuit-custom-form-sample/`
   - See working form implementations
   - Learn best practices
   - Copy patterns for your forms

3. **Review Deployment Guide** → [DEPLOYMENT.md](custom-forms/bizuit-custom-form-sample/DEPLOYMENT_GUIDE.md)
   - Production deployment process
   - Multi-tenant configuration
   - CI/CD pipeline details

4. **Check Submodule Setup** → [SETUP_SUBMODULE.md](custom-forms/docs/setup/SETUP_SUBMODULE.md)
   - Understanding git submodules
   - GitHub Actions integration
   - Versioning strategy

---

## 🎯 Quick Reference

### Essential URLs (Local Dev)

```bash
http://localhost:8000/docs         # Backend API (Swagger)
http://localhost:3000              # Showcase
http://localhost:3001/docs         # Runtime docs
http://localhost:3001/admin        # Admin panel
http://localhost:3001/form/<name>  # Test your form
```

### Essential Commands

```bash
./start-all.sh                     # Start all services
./stop-all.sh                      # Stop all services
npm run build                      # Build form
tail -f logs/*.log                 # View all logs
pm2 list                           # Check PM2 processes
```

### Essential Files

```bash
.env.local                         # Environment config (create from .env.example)
dev-credentials.js                 # Dev credentials (create from example)
package.json                       # Form metadata
src/index.tsx                      # Form entry point
dist/form.js                       # Fat bundle (after build)
```

---

## ✅ Quick Start Checklist

- [ ] Prerequisites installed (Node.js, Python, Git)
- [ ] Repository cloned
- [ ] Submodule initialized
- [ ] Environment files created (`.env.local`)
- [ ] Dev credentials configured
- [ ] Services started successfully
- [ ] Backend API accessible (port 8000)
- [ ] Runtime App accessible (port 3001)
- [ ] Created first form from template
- [ ] Tested with fat bundle workflow
- [ ] Tested with full stack workflow
- [ ] Uploaded form via admin panel
- [ ] Form loads successfully in browser

---

**🎉 Congratulations!** You're ready to build BIZUIT Custom Forms!

**Need help?** Check [DEVELOPER_GUIDE.md](custom-forms/DEVELOPER_GUIDE.md) for detailed documentation.

**Questions?** Contact your team lead or open an issue in the repository.

---

_Last updated: 2025-11-24_
