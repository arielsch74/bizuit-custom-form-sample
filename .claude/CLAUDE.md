# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**BIZUIT Custom Forms** is a monorepo template for building web forms integrated with Bizuit BPMS. The project consists of published npm packages for SDK and UI components, plus example applications demonstrating their usage.

**Published Packages:**
- [@tyconsa/bizuit-form-sdk](https://www.npmjs.com/package/@tyconsa/bizuit-form-sdk) v2.1.1 - Core SDK for Bizuit BPM integration
- [@tyconsa/bizuit-ui-components](https://www.npmjs.com/package/@tyconsa/bizuit-ui-components) v1.7.0 - UI component library

**Testing:** 138 unit tests (100% passing) with Vitest

## Architecture

### Multi-Service Architecture

The project runs three concurrent services:

1. **Backend API** - Port 8000
   - **Python FastAPI** (`custom-forms/backend-api/`) - Currently active backend
     - Handles auth, data encryption, form definitions
     - Has unit tests (pytest)
   - **.NET 9 Alternative** (`custom-forms/backend-api-dotnet/`) - Migration in progress
     - Same API endpoints as Python version
     - Has unit tests (xUnit)

2. **Showcase App (Next.js)** - Port 3000
   - Next.js 15 demonstration application
   - Examples and documentation for developers
   - Located in `custom-forms-showcase/`

3. **Runtime App (Next.js)** - Port 3001
   - Next.js runtime environment for forms
   - Located in `custom-forms/runtime-app/`

### Package Structure

```
packages/
├── bizuit-form-sdk/          # Core SDK (@tyconsa/bizuit-form-sdk)
│   ├── src/
│   │   ├── auth/            # Authentication & authorization
│   │   ├── process/         # Process management (RaiseEvent, Initialize)
│   │   ├── instanceLock/    # Pessimistic locking for process instances
│   │   ├── client/          # HTTP client with custom BZ-* headers
│   │   ├── hooks/           # React hooks (useBizuitSDK, useAuth)
│   │   ├── models/          # XmlParameter class for mutable XML objects
│   │   └── utils/           # Parameter parsers (JSON/XML), XSD parser
│   └── src/__tests__/       # 97 unit tests (including XmlParameter Phase 2)
│
└── bizuit-ui-components/    # UI Components (@tyconsa/bizuit-ui-components)
    ├── src/components/      # React components
    │   ├── BizuitDataGrid/  # TanStack Table v8 grid
    │   ├── BizuitCombo/     # Searchable select with multi-select
    │   ├── BizuitDateTimePicker/  # Date/time/datetime picker
    │   ├── BizuitSlider/    # Slider with custom marks
    │   ├── BizuitFileUpload/  # Drag & drop file upload
    │   ├── DynamicFormField/  # Auto-generated form fields from metadata
    │   └── ProcessSuccessScreen/  # Success confirmation screen
    └── src/__tests__/       # 41 unit tests
```

### Key Architectural Patterns

**SDK Architecture:**
- Zustand for state management
- Axios for HTTP with custom interceptors
- Zod for runtime validation
- Modular services (auth, process, instanceLock)

**UI Components:**
- Built on Radix UI primitives (accessibility)
- Styled with Tailwind CSS (100% customizable)
- Full TypeScript support
- Dark mode support via `class` strategy

**Process Flow:**
1. Authenticate user with token
2. Initialize process → get parameters metadata
3. Build form (manual or dynamic via DynamicFormField)
4. Execute RaiseEvent → create/continue process instance
5. Handle locking for concurrent access (withLock pattern)

## Common Commands

### Start All Services (Recommended)

```bash
# Start backend, showcase, and runtime in one command
./start-all.sh

# Logs are written to:
# - logs/backend-api.log
# - logs/showcase.log
# - logs/runtime-app.log

# View logs in real-time
tail -f logs/backend-api.log
tail -f logs/showcase.log
tail -f logs/runtime-app.log

# Stop all services
./stop-all.sh
```

### Individual Service Commands

**Backend API:**
```bash
cd custom-forms/backend-api
source venv/bin/activate  # Create venv first if needed: python3 -m venv venv
pip install -r requirements.txt  # First time only
python main.py  # Runs on port 8000
```

**Showcase:**
```bash
cd custom-forms-showcase
npm install  # First time only
npm run dev  # Runs on port 3000
```

**Runtime App:**
```bash
cd custom-forms/runtime-app
npm install  # First time only
PORT=3001 npm run dev  # Runs on port 3001
```

### Package Development

**Build packages:**
```bash
cd packages/bizuit-form-sdk
npm install
npm run build

cd ../bizuit-ui-components
npm install
npm run build
```

**Run tests:**
```bash
cd packages/bizuit-form-sdk
npm test              # Run tests once
npm run test:ui       # Run tests with UI

cd ../bizuit-ui-components
npm test
```

**Switch between local/npm packages in showcase:**
```bash
cd custom-forms-showcase
npm run use:local     # Use local packages (for development)
npm run use:npm       # Use npm registry packages (for testing)
```

### Development Workflow Script

```bash
# Convenience script for common tasks
./dev.sh install      # Install all dependencies
./dev.sh build        # Build all packages
./dev.sh clean        # Clean node_modules and build artifacts
./dev.sh rebuild      # Clean + install + build
./dev.sh help         # Show available commands
```

### Deployment

**Showcase App:**
- Pipeline: `azure-pipelines-showcase.yml`
- Triggers on: `custom-forms-showcase/**` or `packages/**`
- Deployment: IIS with IISNode (manages Node.js process)
- Target: `E:\DevSites\BIZUITCustomForms`
- Environment: `test.bizuit.com/BIZUITCustomForms`

**Custom Forms - Multi-Client Deployments:**

1. **Build Pipeline** (`azure-pipelines-build.yml`):
   - Builds runtime app for arielsch tenant
   - Creates artifact with `/arielschBIZUITCustomForms` basepath
   - Triggers on: `custom-forms/runtime-app/**`, `packages/**`

2. **Main Deployment** (`azure-pipelines-deploy.yml`):
   - Deploys to arielsch tenant
   - Uses artifact from build pipeline
   - Target: `E:\BIZUITSites\arielsch\arielschBIZUITCustomForms`

3. **Recubiz Deployment** (`azure-pipelines-deploy-recubiz.yml`):
   - Deploys to recubiz tenant (reuses arielsch build artifact)
   - Runs `prepare-deployment.js` to update basepath to `/recubizBIZUITCustomForms`
   - Target: `E:\BIZUITSites\recubiz\recubizBIZUITCustomForms`

4. **Azure Web Apps Deployment**:
   - **Backend** (`azure-pipelines-backend-webapp.yml`):
     - Deploys Python FastAPI to Azure Web App
     - Triggers on: `custom-forms/backend-api/**`
   - **Frontend** (`azure-pipelines-frontend-webapp.yml`):
     - Deploys Next.js runtime to Azure Web App
     - Triggers on: `custom-forms/runtime-app/**`, `packages/**`

**Documentation:** See [custom-forms/docs/](/Users/arielschwindt/SourceCode/BIZUITCustomForms/custom-forms/docs/) for all deployment guides

## Key Implementation Details

### Authentication Flow

SDK uses JWT tokens passed via URL parameters:
```typescript
// Extract from URL
const token = searchParams.get('token')

// Validate token
const { validateToken } = useAuth()
const isValid = await validateToken(token)

// Check form permissions
const hasAccess = await checkFormAuth({
  processName: 'MyProcess',
  userName: 'user'
})
```

### Process Instance Locking

Use `withLock` for automatic lock/unlock:
```typescript
await sdk.instanceLock.withLock(
  {
    instanceId: 'INST-123',
    activityName: 'MyActivity',
    operation: 1,  // 1 = edit, 2 = view
    processName: 'MyProcess'
  },
  token,
  async (sessionToken) => {
    // Execute operations with locked instance
    return await sdk.process.raiseEvent({...}, [], sessionToken)
  }
)
// Instance automatically unlocked after callback
```

### Dynamic Form Generation

Automatically generate form fields from process metadata:
```typescript
import { DynamicFormField } from '@tyconsa/bizuit-ui-components'

// After process.initialize, use returned parameters
{processData.parameters.map(param => (
  <DynamicFormField
    key={param.name}
    parameter={param}
    value={formData[param.name]}
    onChange={(value) => setFormData({...formData, [param.name]: value})}
  />
))}
```

### Environment Configuration

All services use `.env.local` files (see `.env.example` in each directory).

**Backend API requires:**
- `DB_SERVER` - SQL Server hostname (e.g., `test.bizuit.com`)
- `DB_DATABASE` - Database name for CustomForms tables (e.g., `arielschBIZUITDashboard`)
- `DB_USER` - SQL Server username
- `DB_PASSWORD` - SQL Server password
- `PERSISTENCE_DB_SERVER` - SQL Server for token validation
- `PERSISTENCE_DB_DATABASE` - Database for SecurityTokens table
- `PERSISTENCE_DB_USER` - SQL Server username
- `PERSISTENCE_DB_PASSWORD` - SQL Server password
- `BIZUIT_DASHBOARD_API_URL` - Bizuit BPM Dashboard API URL (e.g., `https://test.bizuit.com/arielschbizuitdashboardapi/api`)
- `JWT_SECRET_KEY` - Secret key for admin session tokens (generate with `openssl rand -hex 32`)
- `ENCRYPTION_TOKEN_KEY` - TripleDES key for Dashboard token encryption (24 chars, must match Dashboard)
- `ADMIN_ALLOWED_ROLES` - Comma-separated roles allowed to access admin panel
- `API_PORT` - Port for FastAPI backend (default: 8000)
- `CORS_ORIGINS` - Comma-separated allowed CORS origins

**Next.js apps require:**
- `NEXT_PUBLIC_BIZUIT_DASHBOARD_API_URL` - Bizuit dashboard endpoint
- `NEXT_PUBLIC_BASE_PATH` - Path prefix for IIS deployment (e.g., `/BIZUITCustomForms`)
- `FASTAPI_URL` - FastAPI backend URL (server-side only, used by Next.js API routes)
- `NEXT_PUBLIC_BIZUIT_TIMEOUT` - Request timeout in ms
- `NEXT_PUBLIC_BIZUIT_TOKEN_EXPIRATION_MINUTES` - Token validity period
- `NEXT_PUBLIC_ALLOW_DEV_MODE` - **CRITICAL SECURITY**: Allow forms to open without Dashboard token
  - **Development**: `true` - Allows testing forms directly without Dashboard token `s`
  - **Production**: `false` or undefined - **REQUIRED** for security (secure by default)
  - ⚠️ **NEVER deploy to production with `true`** - CRITICAL SECURITY RISK!

**Note:** Variables prefixed with `NEXT_PUBLIC_` are build-time only. Server-side variables (without prefix) can be changed at runtime with restart.

## Technology Stack

**Frontend:**
- Next.js 15 (App Router)
- React 18
- TypeScript 5
- Tailwind CSS + Radix UI
- TanStack Table v8
- React Hook Form + Zod validation

**Backend:**
- **Python FastAPI** (active) - Port 8000
  - SQLite database
  - Pydantic models
  - pytest for testing
- **.NET 9 WebAPI** (migration in progress)
  - Entity Framework Core
  - SQLite database
  - xUnit for testing

**Build Tools:**
- tsup (package bundler)
- Vitest (testing)
- npm workspaces pattern

**Deployment:**
- IIS + IISNode (Windows Server)
- Azure DevOps CI/CD

## Documentation Structure

**SDK Documentation** (`packages/docs/`):
- `GETTING_STARTED.md` - Step-by-step guide for SDK usage
- `QUICK_REFERENCE.md` - Quick code snippets
- `examples/` - 6 complete working examples:
  - `example1-simple-start.md` - Basic process start
  - `example2-process-with-params.md` - Process with parameters
  - `example3-continue-process.md` - Continue existing instance
  - `example4-dynamic-form.md` - Auto-generated forms
  - `example5-file-upload.md` - File handling
  - `example6-advanced-locking.md` - Manual lock management

**XmlParameter Documentation** (`packages/bizuit-form-sdk/`):
- `XMLPARAMETER_GUIDE.md` - Complete guide for working with XML parameters as mutable objects
- `EXAMPLES_XMLPARAMETER.md` - 6 real-world XmlParameter usage examples

**Custom Forms Documentation** (`custom-forms/docs/`):
- `README.md` - Documentation index
- `DEVELOPER_GUIDE.md` - Developer guide for custom forms
- `deployment/` - Deployment guides:
  - `MULTI_CLIENT_DEPLOYMENT.md` - Multi-tenant deployment
  - `OFFLINE_DEPLOYMENT.md` - Offline deployment
  - `CHECKLIST_SERVIDOR.md` - Server checklist
  - `COMANDOS_SERVIDOR.md` - Server commands
  - `SERVIDOR_PASOS_FINALES.md` - Final server steps
- `infrastructure/` - Infrastructure setup:
  - `PM2_WINDOWS_SETUP.md` - PM2 setup on Windows
  - `IIS_CONFIGURATION_GUIDE.md` - IIS configuration
  - `RUNTIME_BASEPATH_SETUP.md` - Runtime basepath configuration
- `operations/` - Operations and troubleshooting:
  - `DEPLOYMENT_TROUBLESHOOTING.md` - Deployment issues
  - `DEPLOYMENT_FIX.md` - Deployment fixes
  - `RESUMEN_CONFIGURACION.md` - Configuration summary
- `runtime-app/` - Runtime app documentation:
  - `OVERVIEW.md` - Runtime app overview
  - `SECURITY.md` - Security considerations
  - `EXTERNALS_CONFIG.md` - External dependencies config
- `security/` - Security documentation:
  - `TENANT_ISOLATION_GUIDE.md` - Multi-tenant isolation
- `setup/` - Setup guides:
  - `RUNTIME_CONFIG.md` - Runtime configuration
  - `SETUP_SUBMODULE.md` - Git submodule setup

**Showcase Documentation** (`custom-forms-showcase/docs/`):
- `AUTHENTICATION_FLOW.md` - Authentication flow documentation
- `guides/HOT_RELOAD_DEMO.md` - Hot reload demo guide

## Important Notes

### Port Management

`start-all.sh` automatically kills processes on ports 8000, 3000, 3001 before starting services. Process IDs are saved to `.pids/` directory for clean shutdown.

### Testing Standards

- All SDK functionality has unit test coverage
- Tests use Vitest with jsdom environment
- Mock implementations for HTTP clients
- Run tests before publishing packages

### Package Publishing

Packages are published to npm registry under `@tyconsa` scope:
```bash
cd packages/bizuit-form-sdk
npm version patch|minor|major
npm publish  # Triggers prepublishOnly build

cd packages/bizuit-ui-components
npm version patch|minor|major
npm publish
```

### Browser Compatibility

All components support latest versions of:
- Chrome/Edge
- Safari
- Firefox
- Opera
- Mobile browsers (iOS Safari, Chrome Mobile)

### Code Style

- TypeScript with strict mode
- ESLint configuration in each package
- Prettier for formatting (if configured)
- Component naming: PascalCase
- Hooks: camelCase with `use` prefix
- File naming: kebab-case for components, camelCase for utilities

---

## Session Handoff - Pending Tasks

**Last Updated:** 2025-11-23

### 🔧 Technical Debt

#### 1. React Warnings in bizuit-ui-components
**Priority:** Medium
**Status:** Pending investigation

- **Issue:** React warnings detected during build/runtime of `@tyconsa/bizuit-ui-components`
- **Context:** Warnings appear when using UI components in forms
- **Next Steps:**
  1. Run `cd packages/bizuit-ui-components && npm run build` and capture all warnings
  2. Identify specific components causing warnings
  3. Fix React best practices violations (likely: missing keys, incorrect hooks usage, or deprecated patterns)
  4. Run tests to ensure fixes don't break functionality
  5. Bump patch version and republish to npm

#### 2. forms-examples Cleanup
**Priority:** High
**Status:** Needs planning

- **Issue:** `custom-forms/runtime-app/forms-examples/` has multiple example forms, making it hard for new developers to start
- **Goal:** Create single, clean base example for developers
- **Current State:**
  - Multiple example forms with varying quality
  - No clear "start here" template
  - Some examples may have outdated patterns
- **Next Steps:**
  1. Audit all forms in `forms-examples/`
  2. Identify best example to use as base template
  3. Create `forms-examples/base-template/` with:
     - Minimal, clean code
     - Best practices
     - Comprehensive comments
     - README explaining structure
  4. Archive or remove outdated examples
  5. Update [custom-forms/docs/DEVELOPER_GUIDE.md](custom-forms/docs/DEVELOPER_GUIDE.md) to reference new base template

#### 3. Admin Token Authentication - Multi-Tenant Collision
**Priority:** High
**Status:** Active issue in production

- **Issue:** Admin panel authentication tokens don't differentiate between sites/tenants
- **Impact:** On `test.bizuit.com`, tokens from `arielschBIZUITCustomForms` are valid for `recubizBIZUITCustomForms` and vice versa
- **Security Risk:** High - Cross-tenant access in shared test environment
- **Current Behavior:**
  ```
  User logs into arielsch admin panel → gets token
  Same token works on recubiz admin panel ❌
  ```
- **Root Cause:** Likely JWT secret key is shared or token validation doesn't check tenant/site
- **Next Steps:**
  1. Review `custom-forms/backend-api/` authentication logic
  2. Check if `JWT_SECRET_KEY` is per-deployment or shared
  3. Verify token validation includes tenant/site identifier
  4. Implement tenant isolation in token generation/validation
  5. Test with both arielsch and recubiz deployments
  6. Document deployment-specific `.env.local` requirements

**Files to investigate:**
- `custom-forms/backend-api/main.py` - Token validation
- `custom-forms/runtime-app/.env.local` - JWT configuration
- Backend API authentication middleware

---
