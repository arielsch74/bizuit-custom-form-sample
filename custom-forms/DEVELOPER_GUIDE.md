# 🚀 BIZUIT Custom Forms - Developer Guide

> **Quick Start Guide for Junior Developers**
> Everything you need to know to develop, test, and deploy custom forms

---

## 📚 Table of Contents

1. [Quick Start](#-quick-start)
2. [Understanding Authentication](#-understanding-authentication)
3. [Environment Configuration](#-environment-configuration)
4. [Development Workflow](#-development-workflow)
5. [Testing Your Form](#-testing-your-form)
6. [Deployment Process](#-deployment-process)
7. [Troubleshooting](#-troubleshooting)

---

## 🎯 Quick Start

### Prerequisites

- **Node.js 18+** and npm
- **Python 3.10+** (for backend API)
- **Git** and **GitHub account**

### Clone and Setup

```bash
# Clone the repository
git clone <repo-url>
cd custom-forms

# Install dependencies
npm install

# Setup forms-examples submodule
git submodule init
git submodule update

# Start all services (automated)
./start-all.sh
```

**That's it!** You now have:
- ✅ Backend API running on `http://localhost:8000`
- ✅ Showcase app on `http://localhost:3000`
- ✅ Runtime app on `http://localhost:3001`

---

## 🔐 Understanding Authentication

### How Forms Get Loaded

BIZUIT Custom Forms uses a **token-based authentication** system:

```
User in Dashboard → Clicks "Open Form" → URL with token → Form loads
```

### Token Flow

1. **Dashboard generates JWT token** with:
   - User info (username, email, roles)
   - Process info (processName, activityName)
   - Expiration time

2. **Token passed via URL**:
   ```
   http://localhost:3001/forms/my-form?token=eyJhbGc...
   ```

3. **Runtime validates token** with backend API:
   ```
   GET /api/auth/validate?token=eyJhbGc...
   ```

4. **Form receives authenticated context**:
   ```typescript
   const { user, process } = useAuth()
   // user = { userName: "john.doe", roles: ["Admin"] }
   ```

### Security by Environment

| Environment | Security | Token Required |
|------------|----------|----------------|
| **Production** | ✅ Strict | ✅ YES - Dashboard only |
| **Development** | ⚠️ Relaxed | ❌ NO - Dev credentials |

---

## 🔧 Environment Configuration

### Two Types of Variables

#### 1. Build-Time Variables (`NEXT_PUBLIC_*`)

These are "baked" into the JavaScript during `npm run build`:

```env
# .env.local
NEXT_PUBLIC_BASE_PATH=/BIZUITCustomForms
NEXT_PUBLIC_BIZUIT_DASHBOARD_API_URL=https://test.bizuit.com/api
```

⚠️ **Important**: Changing these after build requires **rebuilding**!

```bash
npm run build  # Re-bake the new values
```

#### 2. Server-Side Variables (no prefix)

These can be changed at runtime (restart required):

```env
# .env.local
FASTAPI_URL=http://localhost:8000
DATABASE_URL=postgresql://user:pass@localhost:5432/db
```

✅ **Flexible**: Just restart the app!

### Development Credentials

For **local development without Dashboard**, use dev credentials:

**File**: `custom-forms/runtime-app/dev-credentials.js`

```javascript
export const DEV_CREDENTIALS = {
  token: 'dev-token-12345',
  user: {
    userName: 'developer',
    email: 'dev@bizuit.com',
    roles: ['Admin', 'Developer']
  },
  process: {
    processName: 'TestProcess',
    instanceId: 'test-instance-001'
  }
}
```

**Enable dev mode**:

```env
# .env.local
NEXT_PUBLIC_ALLOW_DEV_MODE=true  # ⚠️ NEVER in production!
```

**How it works**:

```typescript
// In your form
const { user } = useAuth()

// Development: uses dev-credentials.js
// Production: requires Dashboard token
console.log(user.userName) // "developer" (dev) or "john.doe" (prod)
```

---

## 💻 Development Workflow

### Option 1: Full Stack Development (Recommended)

Use this when developing **form functionality** that needs backend:

```bash
# Terminal 1: Start all services
./start-all.sh

# View logs
tail -f logs/backend-api.log
tail -f logs/runtime-app.log
```

**Test your form**:
```
http://localhost:3001/forms/my-form
```

### Option 2: Fast Development (Fat Bundle)

Use this for **UI-only development** (faster reload):

```bash
# Terminal 1: Build your form as a fat bundle
cd forms-examples/my-form
npm run build

# Terminal 2: Serve via HTTP
cd forms-examples/my-form/dist
python3 -m http.server 8080

# Terminal 3: Open dev.html
open http://localhost:8080/dev.html
```

**What's a "Fat Bundle"?**

A self-contained JavaScript file with **everything included**:
- ✅ Your form code
- ✅ All dependencies (React, UI libs, etc.)
- ✅ Ready to run standalone

**Perfect for**:
- Quick UI iterations
- Styling changes
- Component testing
- No backend needed!

---

## 🧪 Testing Your Form

### Local Testing (Development Mode)

**1. Start runtime server**:
```bash
cd custom-forms/runtime-app
PORT=3001 npm run dev
```

**2. Access your form**:
```
http://localhost:3001/forms/my-form
```

**What happens**:
- ❌ No token? → Dev credentials used
- ✅ Form loads instantly
- ✅ Hot reload on code changes

### Testing with Real Backend

**1. Ensure backend is running**:
```bash
cd custom-forms/backend-api
python main.py  # Port 8000
```

**2. Test form with API calls**:
```typescript
// Your form
import { BizuitSDK } from '@tyconsa/bizuit-form-sdk'

const sdk = new BizuitSDK()
const result = await sdk.process.raiseEvent({
  processName: 'MyProcess',
  // ... parameters
})
```

### Testing on Runtime Server (Port 3001)

⚠️ **Important**: Port 3001 loads forms **from the database**

**Requirements**:
1. ✅ Form must be **uploaded** to backend
2. ✅ Form must exist in `CustomForms` table
3. ✅ Backend API must be running

**Upload your form**:

```bash
# Option A: Via Admin Panel
# 1. Build your form
cd forms-examples/my-form
npm run build

# 2. Create deployment ZIP
cd upload
# Use the latest ZIP

# 3. Go to http://localhost:3001/admin
# 4. Upload ZIP

# Option B: Via API (advanced)
curl -X POST http://localhost:8000/api/forms/upload \
  -F "file=@my-form-deployment-1.0.0.zip"
```

**Then test**:
```
http://localhost:3001/forms/my-form?token=<your-token>
```

---

## 📦 Deployment Process

### GitHub Workflow (Automatic)

**Triggers**: Push to `main` branch with changes in `forms-examples/*/src/**`

**What it does**:
1. ✅ Detects changed forms
2. ✅ Builds each form
3. ✅ Bumps version (semantic versioning)
4. ✅ Creates deployment ZIP with:
   - `manifest.json` (metadata)
   - `forms/my-form/form.js` (bundle)
   - `VERSION.txt` (git info)
5. ✅ Uploads to GitHub Actions artifacts
6. ✅ Commits ZIP to `my-form/upload/`
7. ✅ Creates git tag `my-form-v1.0.5`

**Download artifact**:
- Go to **Actions** → Latest run → **Artifacts**
- Download `my-form-deployment-1.0.5-abc1234.zip`
- Ready to upload to admin panel!

### Azure DevOps Pipeline (Alternative)

Same process, but on Azure DevOps. Artifacts available in pipeline runs.

### Manual Deployment

**Build and package**:

```bash
cd forms-examples/my-form
npm run build

# Create ZIP manually
cd dist
zip -r ../my-form-deployment.zip .
```

**Upload**:
1. Go to `/admin/upload-forms`
2. Select ZIP
3. Upload
4. Done!

---

## 🐛 Troubleshooting

### Port Already in Use

```bash
# Kill processes on ports
lsof -ti:8000 | xargs kill -9  # Backend
lsof -ti:3000 | xargs kill -9  # Showcase
lsof -ti:3001 | xargs kill -9  # Runtime

# Or use the automated script
./stop-all.sh && ./start-all.sh
```

### Form Not Loading on Port 3001

**Error**: "Form not found" or blank page

**Cause**: Form not in database

**Solution**:
1. Check backend is running (`http://localhost:8000/docs`)
2. Upload form via admin panel
3. Verify in database:
   ```sql
   SELECT FormName, Version FROM CustomForms
   ```

### Token Validation Failed

**Error**: "Invalid token" or 401 Unauthorized

**Solutions**:

1. **Development mode**: Enable dev credentials
   ```env
   NEXT_PUBLIC_ALLOW_DEV_MODE=true
   ```

2. **Production mode**: Use real Dashboard token
   ```
   http://localhost:3001/forms/my-form?token=<valid-jwt>
   ```

3. **Backend not responding**: Check backend logs
   ```bash
   tail -f logs/backend-api.log
   ```

### Build Errors in Forms

**Error**: Module not found or TypeScript errors

**Solution**:

```bash
# Clean and reinstall
cd forms-examples/my-form
rm -rf node_modules package-lock.json
npm install

# Clean Next.js cache (if using runtime-app)
cd ../../runtime-app
rm -rf .next
npm run build
```

### Environment Variables Not Working

**Problem**: Changed `.env.local` but no effect

**Solution**:

1. **For `NEXT_PUBLIC_*` variables**: Rebuild required
   ```bash
   npm run build
   ```

2. **For server variables**: Restart required
   ```bash
   # Kill and restart
   ./stop-all.sh && ./start-all.sh
   ```

---

## 📖 Additional Resources

- **Main README**: `custom-forms/README.md`
- **Showcase Examples**: `http://localhost:3000`
- **Backend API Docs**: `http://localhost:8000/docs`
- **SDK Documentation**: `packages/bizuit-form-sdk/README.md`
- **UI Components**: `packages/bizuit-ui-components/README.md`

---

## 🎓 Learning Path for Junior Developers

### Week 1: Understanding the Basics
1. ✅ Clone and run `./start-all.sh`
2. ✅ Explore showcase examples
3. ✅ Understand authentication flow
4. ✅ Create a simple form with dev credentials

### Week 2: Building Your First Form
1. ✅ Use fat bundle for quick iterations
2. ✅ Add Bizuit UI components
3. ✅ Connect to Bizuit SDK
4. ✅ Test locally on port 3001

### Week 3: Deployment
1. ✅ Understand GitHub workflow
2. ✅ Push to main and get artifact
3. ✅ Upload via admin panel
4. ✅ Test in production environment

### Week 4: Advanced Topics
1. ✅ Custom hooks and state management
2. ✅ Error handling and logging
3. ✅ Performance optimization
4. ✅ Testing strategies

---

**Need help?** Check the troubleshooting section or ask the team!

**Happy coding!** 🚀
