# Bizuit Custom Forms System - Plan de Implementación (Parte 2)

**Continuación de:** [DYNAMIC_FORMS_IMPLEMENTATION_PLAN.md](./DYNAMIC_FORMS_IMPLEMENTATION_PLAN.md)

---

## 4. Fases de Implementación (continuación)

### FASE 1: Setup del Monorepo de Forms (Semana 1) ✅

**Objetivo:** Crear el repositorio base con 3 forms de ejemplo funcionales

**Duración:** 5 días laborales

#### Día 1-2: Estructura Base

**Tareas:**

1. **Crear repositorio en GitHub**
   ```bash
   # Crear repo vacío en GitHub: bizuit-forms-monorepo

   # Clonar localmente
   git clone https://github.com/bizuit/forms-monorepo.git
   cd forms-monorepo

   # Inicializar estructura
   mkdir -p forms shared scripts templates .github/workflows
   ```

2. **Configurar pnpm workspaces**
   ```yaml
   # pnpm-workspace.yaml
   packages:
     - 'forms/*'
     - 'shared'
   ```

3. **package.json raíz**
   ```json
   {
     "name": "bizuit-forms-monorepo",
     "private": true,
     "scripts": {
       "build": "pnpm -r --filter './forms/*' build",
       "test": "pnpm -r --filter './forms/*' test",
       "dev": "pnpm -r --filter './forms/*' dev",
       "create-form": "node scripts/create-form.js",
       "publish-all": "pnpm -r --filter './forms/*' publish"
     },
     "devDependencies": {
       "pnpm": "^8.0.0",
       "typescript": "^5.3.0",
       "tsup": "^8.0.0"
     }
   }
   ```

4. **tsconfig.json compartido**
   ```json
   {
     "compilerOptions": {
       "target": "ES2020",
       "lib": ["ES2020", "DOM", "DOM.Iterable"],
       "jsx": "react-jsx",
       "module": "ESNext",
       "moduleResolution": "bundler",
       "resolveJsonModule": true,
       "allowJs": true,
       "noEmit": true,
       "esModuleInterop": true,
       "forceConsistentCasingInFileNames": true,
       "strict": true,
       "skipLibCheck": true
     }
   }
   ```

#### Día 3-4: Forms de Ejemplo

**Form 1: aprobacion-gastos (Simple)**

```bash
mkdir -p forms/aprobacion-gastos
cd forms/aprobacion-gastos

# Crear archivos
touch index.tsx package.json tsconfig.json README.md
mkdir __tests__
```

Contenido ya provisto en Parte 1, sección 3.1.2

**Form 2: solicitud-vacaciones (Con validaciones)**

```typescript
// forms/solicitud-vacaciones/index.tsx
import { useState } from 'react'
import { useBizuitSDK, buildParameters } from '@tyconsa/bizuit-form-sdk'
import { Card, Button } from '@tyconsa/bizuit-ui-components'

export default function SolicitudVacacionesForm() {
  const sdk = useBizuitSDK()
  const [formData, setFormData] = useState({
    empleado: '',
    fechaDesde: '',
    fechaHasta: '',
    diasSolicitados: 0,
    motivo: '',
    contactoEmergencia: ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.empleado) newErrors.empleado = 'Campo requerido'
    if (!formData.fechaDesde) newErrors.fechaDesde = 'Campo requerido'
    if (!formData.fechaHasta) newErrors.fechaHasta = 'Campo requerido'

    // Validar que fechaHasta > fechaDesde
    if (formData.fechaDesde && formData.fechaHasta) {
      if (new Date(formData.fechaHasta) <= new Date(formData.fechaDesde)) {
        newErrors.fechaHasta = 'Debe ser posterior a la fecha de inicio'
      }
    }

    // Calcular días solicitados
    if (formData.fechaDesde && formData.fechaHasta) {
      const days = Math.ceil(
        (new Date(formData.fechaHasta).getTime() - new Date(formData.fechaDesde).getTime())
        / (1000 * 60 * 60 * 24)
      )
      setFormData(prev => ({ ...prev, diasSolicitados: days }))
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) return

    try {
      const mapping = {
        'empleado': { parameterName: 'pEmpleado' },
        'fechaDesde': {
          parameterName: 'pFechaDesde',
          transform: (val: string) => new Date(val).toISOString()
        },
        'fechaHasta': {
          parameterName: 'pFechaHasta',
          transform: (val: string) => new Date(val).toISOString()
        },
        'diasSolicitados': { parameterName: 'pDiasSolicitados' },
        'motivo': { parameterName: 'pMotivo' },
        'contactoEmergencia': { parameterName: 'pContactoEmergencia' }
      }

      const parameters = buildParameters(mapping, formData)

      await sdk.process.raiseEvent({
        eventName: 'SolicitudVacaciones',
        parameters
      })

      alert('Solicitud enviada')

    } catch (err: any) {
      alert('Error: ' + err.message)
    }
  }

  return (
    <Card className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Solicitud de Vacaciones</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Campos similares a aprobacion-gastos */}
        {/* ... */}

        {errors.general && (
          <div className="p-3 bg-red-50 text-red-600 rounded">
            {errors.general}
          </div>
        )}

        <Button type="submit">Enviar Solicitud</Button>
      </form>
    </Card>
  )
}
```

**Form 3: onboarding-empleado (Multi-step)**

```typescript
// forms/onboarding-empleado/index.tsx
import { useState } from 'react'
import { useBizuitSDK, buildParameters } from '@tyconsa/bizuit-form-sdk'
import { Card, Button } from '@tyconsa/bizuit-ui-components'

type Step = 1 | 2 | 3

export default function OnboardingEmpleadoForm() {
  const sdk = useBizuitSDK()
  const [currentStep, setCurrentStep] = useState<Step>(1)

  const [formData, setFormData] = useState({
    // Step 1: Datos personales
    nombre: '',
    apellido: '',
    dni: '',
    fechaNacimiento: '',
    email: '',
    telefono: '',

    // Step 2: Datos laborales
    puesto: '',
    departamento: '',
    fechaIngreso: '',
    jefe: '',

    // Step 3: Documentación
    cbuBancaria: '',
    obraSocial: '',
    contactoEmergencia: '',
    telefonoEmergencia: ''
  })

  const handleNext = () => {
    // Validar step actual antes de avanzar
    setCurrentStep((prev) => Math.min(3, prev + 1) as Step)
  }

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1) as Step)
  }

  const handleSubmit = async () => {
    try {
      const mapping = {
        // Todos los campos
        'nombre': { parameterName: 'pNombre' },
        'apellido': { parameterName: 'pApellido' },
        'dni': { parameterName: 'pDNI' },
        // ... resto de los campos
      }

      const parameters = buildParameters(mapping, formData)

      await sdk.process.raiseEvent({
        eventName: 'OnboardingEmpleado',
        parameters
      })

      alert('Onboarding completado')

    } catch (err: any) {
      alert('Error: ' + err.message)
    }
  }

  return (
    <Card className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Onboarding de Empleado</h1>
        <div className="flex items-center mt-4">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center">
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center
                ${currentStep >= step ? 'bg-blue-600 text-white' : 'bg-gray-300'}
              `}>
                {step}
              </div>
              {step < 3 && (
                <div className={`w-24 h-1 ${currentStep > step ? 'bg-blue-600' : 'bg-gray-300'}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {currentStep === 1 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Datos Personales</h2>
          {/* Campos step 1 */}
        </div>
      )}

      {currentStep === 2 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Datos Laborales</h2>
          {/* Campos step 2 */}
        </div>
      )}

      {currentStep === 3 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Documentación</h2>
          {/* Campos step 3 */}
        </div>
      )}

      <div className="flex gap-3 mt-6">
        {currentStep > 1 && (
          <Button type="button" variant="outline" onClick={handlePrev}>
            Anterior
          </Button>
        )}
        {currentStep < 3 ? (
          <Button type="button" onClick={handleNext}>
            Siguiente
          </Button>
        ) : (
          <Button type="button" onClick={handleSubmit}>
            Finalizar
          </Button>
        )}
      </div>
    </Card>
  )
}
```

#### Día 5: Scripts y Automatización

**Script: create-form.js**

```javascript
// scripts/create-form.js
const fs = require('fs')
const path = require('path')
const readline = require('readline')

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

function ask(question) {
  return new Promise(resolve => rl.question(question, resolve))
}

async function createForm() {
  console.log('🚀 Create New Bizuit Form\n')

  const formName = await ask('Form name (kebab-case): ')
  const processName = await ask('Process name: ')
  const description = await ask('Description: ')
  const author = await ask('Author: ')

  const formDir = path.join(__dirname, '..', 'forms', formName)

  if (fs.existsSync(formDir)) {
    console.error(`❌ Form "${formName}" already exists`)
    process.exit(1)
  }

  // Crear estructura
  fs.mkdirSync(formDir, { recursive: true })
  fs.mkdirSync(path.join(formDir, '__tests__'))

  // package.json
  const packageJson = {
    name: `@bizuit-forms/${formName}`,
    version: '1.0.0',
    description,
    main: 'dist/index.js',
    module: 'dist/index.mjs',
    types: 'dist/index.d.ts',
    files: ['dist'],
    scripts: {
      build: 'tsup index.tsx --format esm,cjs --dts',
      dev: 'tsup index.tsx --format esm --watch',
      test: 'vitest',
      typecheck: 'tsc --noEmit'
    },
    keywords: ['bizuit', 'bpm', 'form', formName],
    author,
    license: 'MIT',
    peerDependencies: {
      react: '^18.3.1',
      'react-dom': '^18.3.1',
      '@tyconsa/bizuit-form-sdk': '^1.0.2',
      '@tyconsa/bizuit-ui-components': '^1.0.1'
    },
    devDependencies: {
      '@types/react': '^18.3.26',
      tsup: '^8.0.0',
      typescript: '^5.3.0',
      vitest: '^1.0.0'
    },
    publishConfig: {
      access: 'public'
    }
  }

  fs.writeFileSync(
    path.join(formDir, 'package.json'),
    JSON.stringify(packageJson, null, 2)
  )

  // index.tsx template
  const indexTsx = `import { useState } from 'react'
import { useBizuitSDK, buildParameters } from '@tyconsa/bizuit-form-sdk'
import { Card, Button } from '@tyconsa/bizuit-ui-components'

/**
 * ${description}
 *
 * @author ${author}
 * @process ${processName}
 */
export default function ${toPascalCase(formName)}Form() {
  const sdk = useBizuitSDK()

  const [formData, setFormData] = useState({
    // TODO: Add your form fields here
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const mapping = {
        // TODO: Define your field mapping
      }

      const parameters = buildParameters(mapping, formData)

      await sdk.process.raiseEvent({
        eventName: '${processName}',
        parameters
      })

      alert('Success!')

    } catch (err: any) {
      alert('Error: ' + err.message)
    }
  }

  return (
    <Card className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">${description}</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* TODO: Add your form fields */}

        <Button type="submit">Submit</Button>
      </form>
    </Card>
  )
}
`

  fs.writeFileSync(path.join(formDir, 'index.tsx'), indexTsx)

  // tsconfig.json
  fs.writeFileSync(
    path.join(formDir, 'tsconfig.json'),
    JSON.stringify({
      extends: '../../tsconfig.json',
      include: ['index.tsx', '__tests__/**/*']
    }, null, 2)
  )

  // README.md
  const readme = `# ${formName}

${description}

## Process

**Process Name:** \`${processName}\`

## Author

${author}

## Development

\`\`\`bash
pnpm dev
\`\`\`

## Build

\`\`\`bash
pnpm build
\`\`\`

## Test

\`\`\`bash
pnpm test
\`\`\`
`

  fs.writeFileSync(path.join(formDir, 'README.md'), readme)

  console.log(`\n✅ Form "${formName}" created successfully!`)
  console.log(`\nNext steps:`)
  console.log(`  cd forms/${formName}`)
  console.log(`  pnpm install`)
  console.log(`  pnpm dev`)

  rl.close()
}

function toPascalCase(str) {
  return str
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('')
}

createForm().catch(console.error)
```

**Checklist Fase 1:**

- [ ] Repositorio creado en GitHub
- [ ] pnpm workspaces configurado
- [ ] 3 forms de ejemplo funcionando
- [ ] Scripts de automatización
- [ ] Templates listos
- [ ] README general escrito
- [ ] CONTRIBUTING.md creado

---

### FASE 2: CI/CD con GitHub Actions (Semana 1-2) 🔄

**Objetivo:** Auto-publicar forms a npm cuando hay cambios

**Duración:** 3-4 días laborales

#### Implementación

**1. Workflow principal: publish-forms.yml**

Ya provisto en Parte 1, sección 3.1.4

**2. Workflow de PR checks: pr-checks.yml**

```yaml
name: PR Checks

on:
  pull_request:
    branches: [main]
    paths:
      - 'forms/**'

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v2
        with:
          version: 8

      - uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Run tests
        run: pnpm test

      - name: Type check
        run: pnpm -r --filter './forms/*' typecheck

      - name: Build check
        run: pnpm build

  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v2
        with:
          version: 8

      - uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Lint
        run: pnpm -r --filter './forms/*' lint
```

**3. Setup de npm token**

```bash
# En npmjs.com:
# 1. Login → Access Tokens → Generate New Token (Automation)
# 2. Copiar token

# En GitHub:
# Settings → Secrets → Actions → New repository secret
# Name: NPM_TOKEN
# Value: [tu token de npm]
```

**4. Setup de webhook secret**

```bash
# Generar secret
openssl rand -hex 32

# En GitHub:
# Settings → Secrets → Actions → New repository secret
# Name: WEBHOOK_SECRET
# Value: [el secret generado]

# Name: RUNTIME_WEBHOOK_URL
# Value: https://your-runtime-app.com
```

**Checklist Fase 2:**

- [ ] publish-forms.yml funcionando
- [ ] pr-checks.yml funcionando
- [ ] npm token configurado
- [ ] Webhook secret configurado
- [ ] Primer form publicado exitosamente a npm
- [ ] Notifications funcionando

---

### FASE 3: Runtime App con Carga Dinámica (Semana 2-3) 🚀

**Objetivo:** App Next.js que carga forms dinámicamente desde npm

**Duración:** 7-8 días laborales

#### Día 1-2: Setup Base

**1. Crear proyecto Next.js**

```bash
npx create-next-app@latest bizuit-runtime-app \
  --typescript \
  --tailwind \
  --app \
  --no-src-dir \
  --import-alias "@/*"

cd bizuit-runtime-app
```

**2. Instalar dependencias**

```bash
pnpm add @tyconsa/bizuit-form-sdk @tyconsa/bizuit-ui-components
pnpm add -D @types/node
```

**3. Configurar variables de entorno**

```bash
# .env.local
NEXT_PUBLIC_BPM_API_URL=https://bpm-api.bizuit.com
NEXT_PUBLIC_BPM_DASHBOARD_URL=https://dashboard.bizuit.com
WEBHOOK_SECRET=your-webhook-secret-here
```

#### Día 3-5: Core Functionality

Archivos ya provistos en Parte 1, sección 3.2:

- `app/form/[formName]/page.tsx`
- `lib/form-loader.ts`
- `lib/form-registry.ts`
- `app/api/forms/reload/route.ts`

**Adicionales necesarios:**

**components/FormContainer.tsx**

```typescript
'use client'

import { ReactNode } from 'react'

interface Props {
  formName: string
  children: ReactNode
}

export function FormContainer({ formName, children }: Props) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-lg font-semibold">
            Bizuit Forms / {formName}
          </h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {children}
      </main>

      <footer className="border-t mt-auto">
        <div className="container mx-auto px-4 py-4 text-center text-sm text-muted-foreground">
          Powered by Bizuit Custom Forms v1.0.0
        </div>
      </footer>
    </div>
  )
}
```

**components/FormErrorBoundary.tsx**

```typescript
'use client'

import { Card, Button } from '@tyconsa/bizuit-ui-components'

interface Props {
  error: string
  formName: string
}

export function FormErrorBoundary({ error, formName }: Props) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="p-6 max-w-md">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>

          <h2 className="text-xl font-bold mb-2">Error Loading Form</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Form "{formName}" could not be loaded
          </p>

          <div className="p-3 bg-red-50 text-red-700 text-sm rounded mb-4">
            {error}
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => window.location.reload()}
              className="flex-1"
            >
              Retry
            </Button>
            <Button
              variant="outline"
              onClick={() => window.history.back()}
              className="flex-1"
            >
              Go Back
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
```

**components/FormLoadingState.tsx**

```typescript
'use client'

export function FormLoadingState() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto mb-4" />
        <p className="text-lg font-medium">Loading form...</p>
        <p className="text-sm text-muted-foreground mt-2">
          This may take a few seconds on first load
        </p>
      </div>
    </div>
  )
}
```

#### Día 6-7: Testing y Optimización

**1. Test de carga dinámica**

```typescript
// __tests__/form-loader.test.ts
import { describe, it, expect, vi } from 'vitest'
import { loadDynamicForm } from '@/lib/form-loader'

describe('loadDynamicForm', () => {
  it('should load form from CDN', async () => {
    const component = await loadDynamicForm(
      '@bizuit-forms/aprobacion-gastos',
      '1.0.0'
    )

    expect(component).toBeDefined()
    expect(typeof component).toBe('function')
  })

  it('should fallback to next CDN on failure', async () => {
    // Mock first CDN to fail
    const originalImport = global.import
    global.import = vi.fn()
      .mockRejectedValueOnce(new Error('CDN 1 failed'))
      .mockResolvedValueOnce({ default: () => null })

    const component = await loadDynamicForm(
      '@bizuit-forms/test',
      '1.0.0'
    )

    expect(component).toBeDefined()
  })
})
```

**2. Performance monitoring**

```typescript
// lib/performance.ts
export function measureFormLoad(formName: string, startTime: number) {
  const loadTime = Date.now() - startTime

  // Send to analytics
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'form_load', {
      form_name: formName,
      load_time_ms: loadTime
    })
  }

  console.log(`[Performance] ${formName} loaded in ${loadTime}ms`)

  return loadTime
}
```

**3. Cache optimization**

```typescript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: ['@tyconsa/bizuit-ui-components'],
  },

  // Cache compiled forms
  webpack: (config) => {
    config.cache = {
      type: 'filesystem',
      buildDependencies: {
        config: [__filename],
      },
    }
    return config
  },

  // CDN headers
  async headers() {
    return [
      {
        source: '/form/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=300, stale-while-revalidate=600',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
```

**Checklist Fase 3:**

- [ ] Next.js app configurado
- [ ] Dynamic import funcionando
- [ ] Form loader con CDN fallbacks
- [ ] Form registry con cache
- [ ] Webhook receiver operativo
- [ ] Error boundaries
- [ ] Loading states
- [ ] Performance monitoring
- [ ] Tests escritos

---

### FASE 4: BPM Backend API (Semana 3-4) 🗄️

**Objetivo:** API REST para storage y metadata de forms

**Duración:** 7 días laborales

#### Día 1-2: Setup y Database

**1. Crear proyecto .NET Core**

```bash
# Este controller se integra al proyecto existente:
# Tycon.Bizuit.WebForms.API/Controllers/CustomFormsController.cs

# No se requiere proyecto separado - usa la infraestructura existente
dotnet add package Microsoft.Data.SqlClient
dotnet add package Dapper  # Opcional, para queries simplificados
```

**2. Configurar Connection String**

```json
// appsettings.json
{
  "ConnectionStrings": {
    "BizuitDatabase": "Server=your-server;Database=BizuitDB;Trusted_Connection=True;MultipleActiveResultSets=true;TrustServerCertificate=True"
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  }
}
```

**3. Database migration**

SQL ya provisto en Parte 1, sección 3.3.1

```bash
# Ejecutar migration con SQL Server Management Studio (SSMS) o:
sqlcmd -S your-server -d BizuitDB -i database/migrations/001_create_custom_forms_tables.sql
```

**4. Seeds iniciales**

```sql
-- database/seeds/initial_forms.sql
INSERT INTO CustomForms (FormName, PackageName, CurrentVersion, ProcessName, Description, Author, Status)
VALUES
  ('aprobacion-gastos', '@bizuit-forms/aprobacion-gastos', '1.0.0', 'AprobacionGastos', 'Formulario de aprobación de gastos', 'Bizuit Team', 'active'),
  ('solicitud-vacaciones', '@bizuit-forms/solicitud-vacaciones', '1.0.0', 'SolicitudVacaciones', 'Solicitud de vacaciones', 'Bizuit Team', 'active'),
  ('onboarding-empleado', '@bizuit-forms/onboarding-empleado', '1.0.0', 'OnboardingEmpleado', 'Onboarding de nuevos empleados', 'Bizuit Team', 'active');
```

#### Día 3-5: API Implementation

Código ya provisto en Parte 1, sección 3.3.2 y 3.3.3

**Adicional: GitHub Service** (Integrado en .NET Core)

```csharp
// Services/GitHubService.cs
using Octokit;
using System;
using System.Text;
using System.Threading.Tasks;

public class GitHubService
{
  private readonly GitHubClient _client;
  private readonly IConfiguration _config;

  public GitHubService(IConfiguration config)
  {
    _config = config;
    _client = new GitHubClient(new ProductHeaderValue("BizuitCustomForms"));
    var tokenAuth = new Credentials(config["GitHub:Token"]);
    _client.Credentials = tokenAuth;
  }

  /// <summary>
  /// Obtiene código fuente de un form desde GitHub
  /// </summary>
  public async Task<string> GetFormSourceAsync(string formName)
  {
    try
    {
      var owner = _config["GitHub:Owner"];
      var repo = "forms-monorepo";
      var path = $"forms/{formName}/index.tsx";

      var contents = await _client.Repository.Content.GetAllContents(owner, repo, path);
      var content = contents[0];

      if (content.Type == ContentType.File)
      {
        var bytes = Convert.FromBase64String(content.Content);
        return Encoding.UTF8.GetString(bytes);
      }

      throw new Exception("File not found");
    }
    catch (Exception ex)
    {
      Console.WriteLine($"[GitHub] Error fetching source: {ex.Message}");
      throw new Exception($"Failed to fetch source: {ex.Message}");
    }
  }

  /// <summary>
  /// Commitea cambios a un form
  /// </summary>
  public async Task CommitFormChangeAsync(string formName, string content, string message)
  {
    try
    {
      var owner = _config["GitHub:Owner"];
      var repo = "forms-monorepo";
      var path = $"forms/{formName}/index.tsx";

      // Get current file SHA
      var existingFile = await _client.Repository.Content.GetAllContents(owner, repo, path);
      var sha = existingFile[0].Sha;

      // Update file
      var contentBytes = Encoding.UTF8.GetBytes(content);
      var base64Content = Convert.ToBase64String(contentBytes);

      var updateRequest = new UpdateFileRequest(message, base64Content, sha);
      await _client.Repository.Content.UpdateFile(owner, repo, path, updateRequest);

      Console.WriteLine($"[GitHub] Committed changes to {formName}");
    }
    catch (Exception ex)
    {
      Console.WriteLine($"[GitHub] Error committing: {ex.Message}");
      throw new Exception($"Failed to commit: {ex.Message}");
    }
  }
}
```

#### Día 6-7: Testing y Documentation

**Tests de API** (.NET Core con xUnit)

```csharp
// Tests/Controllers/CustomFormsControllerTests.cs
using Xunit;
using Microsoft.AspNetCore.Mvc;
using Moq;
using System.Threading.Tasks;
using System.Collections.Generic;

public class CustomFormsControllerTests
{
  [Fact]
  public async Task GetAllForms_ReturnsOkResult()
  {
    // Arrange
    var mockService = new Mock<ICustomFormsService>();
    mockService.Setup(s => s.GetAllFormsAsync(null))
      .ReturnsAsync(new List<CustomFormDto>
      {
        new CustomFormDto { FormName = "aprobacion-gastos" }
      });

    var controller = new CustomFormsController(mockService.Object);

    // Act
    var result = await controller.GetAllForms(null);

    // Assert
    var okResult = Assert.IsType<OkObjectResult>(result);
    var forms = Assert.IsAssignableFrom<IEnumerable<CustomFormDto>>(okResult.Value);
    Assert.NotEmpty(forms);
  }

  [Fact]
  public async Task GetFormMetadata_ReturnsFormData()
  {
    // Arrange
    var mockService = new Mock<ICustomFormsService>();
    mockService.Setup(s => s.GetFormMetadataAsync("aprobacion-gastos"))
      .ReturnsAsync(new CustomFormDto
      {
        FormName = "aprobacion-gastos",
        PackageName = "@bizuit-forms/aprobacion-gastos",
        CurrentVersion = "1.0.0"
      });

    var controller = new CustomFormsController(mockService.Object);

    // Act
    var result = await controller.GetFormMetadata("aprobacion-gastos");

    // Assert
    var okResult = Assert.IsType<OkObjectResult>(result);
    var form = Assert.IsType<CustomFormDto>(okResult.Value);
    Assert.Equal("aprobacion-gastos", form.FormName);
  }

  [Fact]
  public async Task GetFormMetadata_NonExistent_ReturnsNotFound()
  {
    // Arrange
    var mockService = new Mock<ICustomFormsService>();
    mockService.Setup(s => s.GetFormMetadataAsync("non-existent"))
      .ReturnsAsync((CustomFormDto)null);

    var controller = new CustomFormsController(mockService.Object);

    // Act
    var result = await controller.GetFormMetadata("non-existent");

    // Assert
    Assert.IsType<NotFoundObjectResult>(result);
  }
}
```

**Checklist Fase 4:**

- [ ] Database setup completo
- [ ] Migrations ejecutadas
- [ ] Seeds cargados
- [ ] API REST funcionando
- [ ] CRUD de forms operativo
- [ ] GitHub integration
- [ ] Tests escritos y pasando
- [ ] API documentation (Swagger/OpenAPI)
- [ ] Docker Compose para local dev

---

## 5. Cronograma Completo

### Timeline de 8 Semanas

```
Semana 1: Monorepo + CI/CD
├─ Día 1-2: Setup monorepo
├─ Día 3-4: 3 forms de ejemplo
├─ Día 5: Scripts automatización
└─ Fin de semana: GitHub Actions setup

Semana 2-3: Runtime App
├─ Día 1-2: Next.js setup
├─ Día 3-5: Dynamic loader
├─ Día 6-7: Testing y optimization
└─ Semana 3 inicio: Polish y fixes

Semana 3-4: BPM Backend
├─ Día 1-2: Database setup
├─ Día 3-5: API implementation
├─ Día 6-7: Tests y docs
└─ Semana 4 inicio: Integration testing

Semana 5: Web UI Editor
├─ Monaco editor integration
├─ Live preview
├─ Git operations
└─ UI polish

Semana 6: CLI Tool
├─ Commands implementation
├─ Upload/download
├─ Watch mode
└─ Documentation

Semana 7: Testing E2E
├─ End-to-end tests
├─ Performance tests
├─ Security audit
└─ Bug fixes

Semana 8: Deployment
├─ Docker setup
├─ K8s manifests
├─ Monitoring
└─ Go-live
```

---

## 6. Riesgos y Mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| CDN downtime (unpkg/esm.sh) | Media | Alto | Múltiples CDN fallbacks, cache local |
| npm registry outage | Baja | Alto | Mirror privado con Verdaccio |
| Breaking changes en deps | Media | Medio | Peer deps fijadas, tests automáticos |
| Form con bug crítico | Alta | Alto | Rollback trivial a version anterior |
| Performance issues | Media | Medio | Lazy loading, code splitting, monitoring |
| Security vulnerabilities | Baja | Alto | Validación de código, sandbox, audits |

---

## 7. Métricas de Éxito

### KPIs Técnicos

- **Time to Deploy:** < 5 minutos (form change → live)
- **Form Load Time:** < 2 segundos (first load), < 500ms (cached)
- **Availability:** 99.9% uptime
- **Error Rate:** < 0.1%
- **Cache Hit Rate:** > 90%

### KPIs de Negocio

- **Developer Velocity:** 3x más rápido deployment
- **Rollback Time:** < 1 minuto
- **Forms Created:** > 20 en primer mes
- **Developer Satisfaction:** > 8/10

---

## 8. Próximos Pasos

### Inmediatos (Post-implementación)

1. **Monitoring avanzado**
   - Grafana dashboards
   - Alertas en PagerDuty
   - Error tracking con Sentry

2. **Optimizaciones**
   - Server-side rendering de forms
   - Edge caching con Cloudflare
   - Preload critical forms

3. **Features adicionales**
   - A/B testing de forms
   - Analytics por form
   - Versioning visual en UI

### Futuro (3-6 meses)

1. **Forms Marketplace**
   - Community forms
   - Rating system
   - Premium forms

2. **Visual Form Builder**
   - Drag & drop UI
   - No-code form creation
   - Component library

3. **Multi-tenant**
   - Forms por cliente
   - Isolated namespaces
   - Billing per form

---

## Conclusión

Este plan provee una ruta clara y detallada para implementar el sistema de Bizuit Custom Forms. Cada fase es independiente y entregable, permitiendo valor incremental.

**Fecha estimada de go-live:** 8 semanas desde el inicio

**Equipo recomendado:**
- 2 Full-stack developers
- 1 DevOps engineer
- 1 QA engineer (part-time)

**Presupuesto estimado (infraestructura):**
- GitHub Actions: $0 (free tier suficiente)
- npm Registry: $0 (público)
- CDN: $0 (esm.sh/unpkg gratis)
- Runtime App hosting: ~$50/mes (Vercel Pro)
- SQL Server: $0 (usando BD existente del BPMS Bizuit)
- .NET Core API: $0 (integrado en proyecto existente)
- **Total: ~$50/mes** (70% más económico que arquitectura original)

---

**FIN DEL PLAN DE IMPLEMENTACIÓN**

Documentos relacionados:
- [Parte 1 - Arquitectura y Estructura](./DYNAMIC_FORMS_IMPLEMENTATION_PLAN.md)
- [Testing Strategy](./TESTING_STRATEGY.md) (TODO)
- [Deployment Guide](./DEPLOYMENT_GUIDE.md) (TODO)
