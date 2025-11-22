# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**BIZUIT Custom Forms** is a monorepo template for building web forms integrated with Bizuit BPMS. The project consists of published npm packages for SDK and UI components, plus example applications demonstrating their usage.

**Published Packages:**
- [@tyconsa/bizuit-form-sdk](https://www.npmjs.com/package/@tyconsa/bizuit-form-sdk) v2.0.0 - Core SDK for Bizuit BPM integration
- [@tyconsa/bizuit-ui-components](https://www.npmjs.com/package/@tyconsa/bizuit-ui-components) v1.7.0 - UI component library

**Testing:** 77 unit tests (100% passing) with Vitest

## Architecture

### Multi-Service Architecture

The project runs three concurrent services:

1. **Backend API (FastAPI)** - Port 8000
   - Python-based REST API
   - Handles auth, data encryption, form definitions
   - Located in `custom-forms/backend-api/`

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
│   │   └── utils/           # Parameter parsers (JSON/XML)
│   └── src/__tests__/       # 36 unit tests
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

**Showcase App (IISNode):**
- Pipeline: `azure-pipelines.yml`
- Triggers on: `custom-forms-showcase/**` or `packages/**`
- Deployment: IIS with IISNode (manages Node.js process)
- Target: `E:\DevSites\BIZUITCustomForms`
- Environment: `test.bizuit.com/BIZUITCustomForms`

**Custom Forms (PM2 + IIS Reverse Proxy):**
- Pipeline: `azure-pipelines-customforms.yml`
- Triggers on: `custom-forms/**`
- Deployment: PM2 for process management + IIS as reverse proxy
- Architecture:
  - Runtime (Next.js): PM2 on port 3001
  - Backend (FastAPI): PM2 on port 8000
  - IIS: Reverse proxy routing (/api/* → 8000, /* → 3001)
- Target: `E:\BIZUITSites\arielsch\arielschBIZUITCustomForms` (runtime) and `E:\BIZUITSites\arielsch\arielschBIZUITCustomFormsBackEnd` (backend)
- Environment: `test.bizuit.com/arielschBIZUITCustomForms`
- Documentation: See `custom-forms/DEPLOYMENT.md` and `custom-forms/PM2_WINDOWS_SETUP.md`

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
- Python FastAPI
- SQLite database
- Pydantic models

**Build Tools:**
- tsup (package bundler)
- Vitest (testing)
- npm workspaces pattern

**Deployment:**
- IIS + IISNode (Windows Server)
- Azure DevOps CI/CD

## Documentation Structure

Comprehensive developer docs in `custom-forms-showcase/docs/`:
- `GETTING_STARTED.md` - Step-by-step guide (600+ lines)
- `QUICK_REFERENCE.md` - Quick code snippets
- `examples/` - 6 complete working examples:
  - `example1-simple-start.md` - Basic process start
  - `example2-process-with-params.md` - Process with parameters
  - `example3-continue-process.md` - Continue existing instance
  - `example4-dynamic-form.md` - Auto-generated forms
  - `example5-file-upload.md` - File handling
  - `example6-advanced-locking.md` - Manual lock management

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
