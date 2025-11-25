# Bizuit Custom Forms System - Plan de Implementación Completo

**Versión:** 2.0.0 (Arquitectura Simplificada)
**Fecha:** Noviembre 2024
**Autor:** Bizuit Development Team
**Estado:** Planificación

---

## 📋 Tabla de Contenidos

1. [Executive Summary](#1-executive-summary)
2. [Arquitectura Técnica](#2-arquitectura-técnica)
3. [Estructura de Repositorios](#3-estructura-de-repositorios)
4. [Stack Tecnológico](#4-stack-tecnológico)
5. [Implementación Detallada](#5-implementación-detallada)
6. [Código de Referencia](#6-código-de-referencia)

---

## 1. Executive Summary

### 1.1 Visión General

El **Bizuit Custom Forms System** permite que los desarrolladores creen y desplieguen formularios React personalizados para procesos de BPM **sin recompilar la aplicación principal**. Cada formulario se compila y almacena en la base de datos SQL Server del BPMS, eliminando la necesidad de infraestructura externa.

### 1.2 Problema Actual

- Los cambios en formularios requieren rebuild completo de la app
- Un bug en un form puede afectar a otros
- Deployments lentos y riesgosos
- No hay versionado independiente por form
- Difícil rollback de forms específicos

### 1.3 Solución Propuesta (Arquitectura Simplificada)

```
┌─────────────────────────────────────────────────────────────┐
│ Developer                                                   │
│   ├─ Edita form.tsx en IDE local o Web UI                 │
│   └─ Git push                                              │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ↓
┌─────────────────────────────────────────────────────────────┐
│ GitHub (Monorepo de Forms)                                 │
│   ├─ forms/aprobacion-gastos/index.tsx                    │
│   ├─ forms/solicitud-vacaciones/index.tsx                 │
│   └─ forms/onboarding-empleado/index.tsx                  │
└──────────────────────┬──────────────────────────────────────┘
                       │ Git webhook
                       ↓
┌─────────────────────────────────────────────────────────────┐
│ GitHub Actions CI/CD                                       │
│   ├─ Detecta cambios en forms                             │
│   ├─ Build con esbuild (<50ms)                            │
│   └─ POST /api/forms/publish                              │
│       (código compilado + metadata)                        │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ↓
┌─────────────────────────────────────────────────────────────┐
│ SQL Server Database (BPMS Bizuit)                          │
│   ├─ CustomForms (metadata)                                │
│   └─ CustomFormVersions (código compilado)                │
└──────────────────────┬──────────────────────────────────────┘
                       │ GET /api/custom-forms/{name}/code
                       ↓
┌─────────────────────────────────────────────────────────────┐
│ Runtime App (Next.js)                                      │
│   /form/aprobacion-gastos                                  │
│     ↓                                                       │
│   Fetch código desde API                                   │
│     ↓                                                       │
│   Dynamic import(blob:// URL)                              │
│     ↓                                                       │
│   Render FormComponent                                     │
└─────────────────────────────────────────────────────────────┘
```

### 1.4 Beneficios

| Beneficio | Impacto | ROI |
|-----------|---------|-----|
| **Deployments independientes** | Alta | Deploy de un form en < 2 min vs 15-30 min app completa |
| **Zero downtime** | Alta | No requiere restart del runtime app |
| **Rollback instantáneo** | Alta | UPDATE SQL query < 5 seg |
| **Versionado granular** | Alta | Historial completo en tabla versions |
| **Aislamiento de errores** | Alta | Bug en un form no afecta otros |
| **Developer velocity** | Alta | Edit → Push → Live en < 3 min |
| **100% Privado** | Alta | Sin paquetes públicos ni CDN externo |
| **Zero costos extra** | Alta | Usa BD existente, sin infraestructura adicional |

### 1.5 Arquitectura de 2 Repos (Simplificada)

```
┌─────────────────────────────────┐
│ Repo 1: bizuit-forms-monorepo  │
│   (Source code de forms)        │
└────────────┬────────────────────┘
             │ git push
             ↓
┌─────────────────────────────────┐
│ GitHub Actions                  │
│   (Build + POST a API)          │
└────────────┬────────────────────┘
             │ HTTP POST
             ↓
┌─────────────────────────────────┐
│ Repo 2: bizuit-runtime-app      │
│   ├─ Next.js Frontend           │
│   ├─ .NET Core Backend API      │
│   └─ SQL Server (BPMS)          │
└─────────────────────────────────┘
```

**Diferencias vs plan original:**
- ❌ **Eliminado:** npm registry (público/privado)
- ❌ **Eliminado:** Azure Blob Storage
- ❌ **Eliminado:** CDN públicos (unpkg, esm.sh)
- ❌ **Eliminado:** Versionado semántico automático (npm version)
- ✅ **Agregado:** Storage directo en SQL Server
- ✅ **Simplificado:** 2 repos en vez de 3
- ✅ **Reducido:** Costos de $150/mes a $0/mes

**Nota sobre versionado:**
El versionado de formularios se maneja automáticamente mediante **auto-incremento PATCH** en el pipeline/workflow. El sistema:
1. Lee la versión anterior del `package.json` desde el commit previo (usando `git show HEAD~1`)
2. Incrementa automáticamente el número PATCH (ej: `1.0.5` → `1.0.6`)
3. Si es el primer deployment, inicia en `v1.0.0`
4. Actualiza el `package.json` con la nueva versión
5. Commitea el cambio de vuelta al repositorio con `[skip ci]`

**Importante:**
- NO se usa `npm version` - el pipeline usa `jq` para modificar directamente el JSON
- Cada formulario tiene versionado **independiente** (no hay versión global del paquete)
- El versionado es **simple y predecible**: solo incremento PATCH automático
- Para cambios MINOR o MAJOR, se debe editar manualmente el `package.json` antes del commit

---

## 2. Arquitectura Técnica

### 2.1 Componentes del Sistema

```
┌─────────────────────────────────────────────────────────────┐
│              BIZUIT FORMS ECOSYSTEM (SIMPLIFICADO)          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────────┐    ┌─────────────────┐                │
│  │  Forms Monorepo │────│  GitHub Actions │                │
│  │  (Source Code)  │    │  (CI/CD)        │                │
│  └─────────────────┘    └────────┬────────┘                │
│                                   │                          │
│                                   │ HTTP POST                │
│                                   ↓                          │
│                          ┌─────────────────┐                │
│                          │  Backend API    │                │
│                          │  (.NET Core)    │                │
│                          └────────┬────────┘                │
│                                   │                          │
│                                   ↓                          │
│                          ┌─────────────────┐                │
│                          │  SQL Server     │                │
│                          │  (BPMS DB)      │                │
│                          └────────┬────────┘                │
│                                   │                          │
│                                   │ SELECT compiled_code     │
│                                   ↑                          │
│                          ┌─────────────────┐                │
│                          │  Runtime App    │                │
│                          │  (Next.js)      │                │
│                          └────────┬────────┘                │
│                                   │                          │
│                                   ↓                          │
│                          ┌─────────────────┐                │
│                          │   End Users     │                │
│                          │  (Browsers)     │                │
│                          └─────────────────┘                │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Flujo de Datos Completo

#### Flujo 1: Desarrollo y Publicación

```
┌──────────────┐
│ Developer    │
└──────┬───────┘
       │
       │ 1. Edita forms/mi-form/index.tsx
       │
       ↓
┌──────────────────────┐
│ bizuit-forms-monorepo│
│ /forms/mi-form/      │
│   - index.tsx        │
│   - package.json     │
└──────┬───────────────┘
       │
       │ 2. git push origin main
       │
       ↓
┌──────────────────────┐
│ GitHub Actions       │
│ .github/workflows/   │
│   publish-forms.yml  │
└──────┬───────────────┘
       │
       │ 3. Detect changes (git diff)
       │ 4. npm install
       │ 5. npm run build (esbuild)
       │ 6. Read compiled files:
       │    - index.tsx (source)
       │    - dist/index.mjs (compiled)
       │
       ↓
┌──────────────────────┐
│ HTTP POST Request    │
│ /api/forms/publish   │
│                      │
│ Body:                │
│ {                    │
│   formName,          │
│   version,           │
│   sourceCode,        │
│   compiledCode,      │
│   author,            │
│   commitHash         │
│ }                    │
└──────┬───────────────┘
       │
       │ 8. Backend API recibe
       │
       ↓
┌──────────────────────┐
│ SQL Server           │
│                      │
│ BEGIN TRANSACTION    │
│                      │
│ INSERT/UPDATE        │
│   CustomForms        │
│                      │
│                      │
│ INSERT               │
│   CustomFormVersions │
│                      │
│                      │
│ COMMIT               │
└──────┬───────────────┘
       │
       │ 9. Form listo para usar
       │
       ↓
┌──────────────────────┐
│ Runtime App          │
│ (Puede cargar form   │
│  inmediatamente)     │
└──────────────────────┘
```

#### Flujo 2: Carga y Renderizado

```
┌──────────────┐
│ End User     │
└──────┬───────┘
       │
       │ 1. Navigate to /form/mi-form
       │
       ↓
┌──────────────────────┐
│ Runtime App          │
│ /form/[formName]     │
└──────┬───────────────┘
       │
       │ 2. getFormMetadata(formName)
       │
       ↓
┌──────────────────────┐
│ Backend API          │
│ GET /api/forms/      │
│     mi-form/metadata │
└──────┬───────────────┘
       │
       │ 3. SELECT FROM CustomForms
       │    WHERE FormName = 'mi-form'
       │
       ↓
┌──────────────────────┐
│ SQL Server           │
└──────┬───────────────┘
       │
       │ 4. Returns:
       │    {
       │      formName: "mi-form",
       │      currentVersion: "1.0.5",
       │      processName: "MiProceso",
       │      status: "active"
       │    }
       │
       ↓
┌──────────────────────┐
│ Runtime App          │
│ loadDynamicForm()    │
└──────┬───────────────┘
       │
       │ 5. GET /api/forms/mi-form/code
       │
       ↓
┌──────────────────────┐
│ Backend API          │
└──────┬───────────────┘
       │
       │ 6. SELECT compiled_code
       │    FROM CustomFormVersions fv
       │    JOIN CustomForms f
       │      ON f.id = fv.form_id
       │    WHERE f.form_name = 'mi-form'
       │      AND fv.version = f.current_version
       │
       ↓
┌──────────────────────┐
│ SQL Server           │
└──────┬───────────────┘
       │
       │ 7. Returns compiled ES Module code
       │
       ↓
┌──────────────────────┐
│ Browser              │
│ Dynamic import()     │
└──────┬───────────────┘
       │
       │ 8. Create blob:// URL
       │    import(blobUrl)
       │
       ↓
┌──────────────────────┐
│ FormComponent        │
│ Rendered in browser  │
└──────────────────────┘
```

#### Flujo 3: Submisión de Form

```
┌──────────────┐
│ User fills   │
│ form fields  │
└──────┬───────┘
       │
       ↓
┌──────────────────────┐
│ FormComponent        │
│ handleSubmit()       │
└──────┬───────────────┘
       │
       │ buildParameters(mapping, formData)
       │
       ↓
┌──────────────────────┐
│ @tyconsa/            │
│ bizuit-form-sdk      │
│ raiseEvent()         │
└──────┬───────────────┘
       │
       │ POST /api/instances
       │ { eventName, parameters }
       │
       ↓
┌──────────────────────┐
│ BPMS Backend         │
│ Process Instance     │
│ Created              │
└──────────────────────┘
```

#### Flujo 4: Rollback de Versión

```
┌──────────────┐
│ Admin/DevOps │
└──────┬───────┘
       │
       │ 1. Decide rollback form to v1.0.3
       │
       ↓
┌──────────────────────┐
│ Admin UI / API Call  │
│ POST /api/forms/     │
│   mi-form/rollback   │
│ Body: { version:     │
│   "1.0.3" }          │
└──────┬───────────────┘
       │
       │ 2. Backend API recibe request
       │
       ↓
┌──────────────────────┐
│ SQL Server           │
│                      │
│ UPDATE               │
│   CustomForms        │
│                      │
│ SET                  │
│   CurrentVersion =   │
│   '1.0.3',           │
│   UpdatedAt =        │
│   GETDATE()          │
│ WHERE                │
│   FormName =         │
│   'mi-form'          │
└──────┬───────────────┘
       │
       │ 3. Rollback completado en < 5 segundos
       │
       ↓
┌──────────────────────┐
│ Runtime App          │
│ (Próximo load usa    │
│  version 1.0.3)      │
└──────────────────────┘
```

---

## 3. Estructura de Repositorios

### 3.1 Repo 1: bizuit-forms-monorepo

**URL:** `https://github.com/bizuit/forms-monorepo`

**Propósito:** Desarrollo y source control de formularios dinámicos

```
bizuit-forms-monorepo/
├── .github/
│   └── workflows/
│       ├── publish-forms.yml       # Build + POST a Backend API
│       └── pr-checks.yml           # Tests en PRs
│
├── forms/                          # Todos los forms
│   │
│   ├── aprobacion-gastos/
│   │   ├── index.tsx               # Form component
│   │   ├── package.json            # Metadata (NO se publica a npm)
│   │   ├── tsconfig.json           # TypeScript config
│   │   ├── README.md               # Documentación
│   │   └── __tests__/              # Tests unitarios
│   │       └── index.test.tsx
│   │
│   ├── solicitud-vacaciones/
│   │   ├── index.tsx
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── README.md
│   │   └── __tests__/
│   │       └── index.test.tsx
│   │
│   └── onboarding-empleado/
│       ├── index.tsx
│       ├── package.json
│       ├── tsconfig.json
│       ├── README.md
│       └── __tests__/
│           └── index.test.tsx
│
├── shared/                         # Código compartido
│   ├── validations/
│   │   ├── email.ts
│   │   ├── phone.ts
│   │   └── rut.ts
│   ├── components/
│   │   ├── FormField.tsx
│   │   └── ValidationMessage.tsx
│   └── utils/
│       ├── formatters.ts
│       └── parsers.ts
│
├── scripts/                        # Scripts de automatización
│   ├── create-form.ts              # Crear nuevo form
│   ├── build-all.ts                # Build todos los forms
│   └── test-all.ts                 # Run all tests
│
├── templates/                      # Templates para nuevos forms
│   ├── basic-form/
│   │   ├── index.tsx.template
│   │   ├── package.json.template
│   │   └── README.md.template
│   └── advanced-form/
│       ├── index.tsx.template
│       ├── package.json.template
│       └── README.md.template
│
├── .gitignore
├── package.json                    # Root package (NO se publica)
├── pnpm-workspace.yaml             # pnpm workspaces
├── tsconfig.json                   # Shared TS config
├── README.md                       # Documentación general
└── CONTRIBUTING.md                 # Guía de contribución
```

#### 3.1.1 Archivo: .github/workflows/publish-forms.yml

```yaml
name: Build and Publish Forms to Database

on:
  push:
    branches: [main]
    paths:
      - 'forms/**'

jobs:
  detect-changes:
    runs-on: ubuntu-latest
    outputs:
      changed-forms: ${{ steps.changes.outputs.forms }}
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 2

      - name: Detect changed forms
        id: changes
        run: |
          CHANGED=$(git diff --name-only HEAD~1 HEAD | \
                    grep '^forms/' | \
                    cut -d'/' -f2 | \
                    sort -u | \
                    jq -R -s -c 'split("\n") | map(select(length > 0))')
          echo "forms=$CHANGED" >> $GITHUB_OUTPUT
          echo "Changed forms: $CHANGED"

  publish:
    needs: detect-changes
    if: needs.detect-changes.outputs.changed-forms != '[]'
    runs-on: ubuntu-latest
    strategy:
      matrix:
        form: ${{ fromJson(needs.detect-changes.outputs.changed-forms) }}

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
        run: |
          cd forms/${{ matrix.form }}
          pnpm test

      - name: Build form
        run: |
          cd forms/${{ matrix.form }}
          pnpm build

      - name: Prepare payload
        id: payload
        run: |
          cd forms/${{ matrix.form }}

          # Read version
          VERSION=$(node -p "require('./package.json').version")
          PROCESS_NAME=$(node -p "require('./package.json').processName || '${{ matrix.form }}'")
          DESCRIPTION=$(node -p "require('./package.json').description || ''")

          # Read source code (base64 encoded)
          SOURCE_CODE=$(cat index.tsx | base64 -w 0)

          # Read compiled code (base64 encoded)
          COMPILED_CODE=$(cat dist/index.mjs | base64 -w 0)

          # Set outputs
          echo "version=$VERSION" >> $GITHUB_OUTPUT
          echo "processName=$PROCESS_NAME" >> $GITHUB_OUTPUT
          echo "description=$DESCRIPTION" >> $GITHUB_OUTPUT
          echo "sourceCode=$SOURCE_CODE" >> $GITHUB_OUTPUT
          echo "compiledCode=$COMPILED_CODE" >> $GITHUB_OUTPUT

      - name: Publish to Database via API
        run: |
          curl -X POST ${{ secrets.BIZUIT_API_URL }}/api/forms/publish \
            -H "Authorization: Bearer ${{ secrets.BIZUIT_API_TOKEN }}" \
            -H "Content-Type: application/json" \
            -d '{
              "formName": "${{ matrix.form }}",
              "version": "${{ steps.payload.outputs.version }}",
              "processName": "${{ steps.payload.outputs.processName }}",
              "description": "${{ steps.payload.outputs.description }}",
              "sourceCode": "${{ steps.payload.outputs.sourceCode }}",
              "compiledCode": "${{ steps.payload.outputs.compiledCode }}",
              "author": "${{ github.actor }}",
              "commitHash": "${{ github.sha }}"
            }'

      - name: Create GitHub Release
        uses: actions/create-release@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          tag_name: ${{ matrix.form }}-v${{ steps.payload.outputs.version }}
          release_name: ${{ matrix.form }} v${{ steps.payload.outputs.version }}
          body: |
            Form: ${{ matrix.form }}
            Version: ${{ steps.payload.outputs.version }}
            Commit: ${{ github.sha }}
            Author: ${{ github.actor }}
          draft: false
          prerelease: false
```

#### 3.1.2 Archivo: forms/aprobacion-gastos/package.json

```json
{
  "name": "aprobacion-gastos",
  "version": "1.0.0",
  "description": "Formulario de aprobación de gastos para Bizuit BPM",
  "private": true,
  "processName": "AprobacionGastos",
  "main": "dist/index.js",
  "module": "dist/index.mjs",
  "types": "dist/index.d.ts",
  "files": [
    "dist"
  ],
  "scripts": {
    "build": "tsup index.tsx --format esm,cjs --dts --external react --external react-dom --external @tyconsa/bizuit-form-sdk --external @tyconsa/bizuit-ui-components",
    "dev": "tsup index.tsx --format esm --watch",
    "test": "vitest",
    "test:watch": "vitest --watch",
    "typecheck": "tsc --noEmit"
  },
  "keywords": [
    "bizuit",
    "bpm",
    "form",
    "aprobacion-gastos"
  ],
  "author": "Bizuit Team",
  "license": "UNLICENSED",
  "peerDependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "@tyconsa/bizuit-form-sdk": "^1.0.2",
    "@tyconsa/bizuit-ui-components": "^1.0.1"
  },
  "devDependencies": {
    "@types/react": "^18.3.26",
    "tsup": "^8.0.0",
    "typescript": "^5.3.0",
    "vitest": "^1.0.0"
  }
}
```

**Nota:**
- `"private": true` - No se publica a npm
- `"processName"` - Campo custom para mapear al proceso BPM
- `--external` en build - No bundlear react/sdk (importMap en runtime)

#### 3.1.3 Archivo: forms/aprobacion-gastos/index.tsx

```typescript
import { useState } from 'react'
import { useBizuitSDK, buildParameters } from '@tyconsa/bizuit-form-sdk'
import { Card, Button } from '@tyconsa/bizuit-ui-components'

/**
 * Formulario de Aprobación de Gastos
 *
 * @version 1.0.0
 * @author Bizuit Team
 * @process AprobacionGastos
 */
export default function AprobacionGastosForm() {
  const sdk = useBizuitSDK()

  const [formData, setFormData] = useState({
    empleado: '',
    legajo: '',
    monto: '',
    categoria: 'Viajes',
    descripcion: '',
    aprobadoSupervisor: false
  })

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      // Mapeo selectivo con transformaciones
      const mapping = {
        'empleado': {
          parameterName: 'pEmpleado',
          transform: (val: string) => val.toUpperCase()
        },
        'legajo': { parameterName: 'pLegajo' },
        'monto': {
          parameterName: 'pMonto',
          transform: (val: string) => parseFloat(val).toFixed(2)
        },
        'categoria': { parameterName: 'pCategoria' },
        'descripcion': { parameterName: 'pDescripcion' },
        'aprobadoSupervisor': {
          parameterName: 'vAprobadoSupervisor',
          isVariable: true,
          transform: (val: boolean) => val ? 'SI' : 'NO'
        }
      }

      const parameters = buildParameters(mapping, formData)

      await sdk.process.raiseEvent({
        eventName: 'AprobacionGastos',
        parameters
      })

      // Success: redirect o mostrar mensaje
      alert('Solicitud enviada exitosamente')

    } catch (err: any) {
      setError(err.message || 'Error al enviar solicitud')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Aprobación de Gastos</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Empleado *
          </label>
          <input
            type="text"
            value={formData.empleado}
            onChange={(e) => handleChange('empleado', e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
            placeholder="Nombre completo"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Legajo *
          </label>
          <input
            type="text"
            value={formData.legajo}
            onChange={(e) => handleChange('legajo', e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
            placeholder="12345"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Monto * (ARS)
          </label>
          <input
            type="number"
            step="0.01"
            value={formData.monto}
            onChange={(e) => handleChange('monto', e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
            placeholder="1500.00"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Categoría *
          </label>
          <select
            value={formData.categoria}
            onChange={(e) => handleChange('categoria', e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
          >
            <option value="Viajes">Viajes</option>
            <option value="Comidas">Comidas</option>
            <option value="Alojamiento">Alojamiento</option>
            <option value="Transporte">Transporte</option>
            <option value="Otros">Otros</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Descripción *
          </label>
          <textarea
            value={formData.descripcion}
            onChange={(e) => handleChange('descripcion', e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
            placeholder="Describa el motivo del gasto..."
            rows={4}
            required
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="aprobado"
            checked={formData.aprobadoSupervisor}
            onChange={(e) => handleChange('aprobadoSupervisor', e.target.checked)}
            className="mr-2"
          />
          <label htmlFor="aprobado" className="text-sm">
            Pre-aprobado por supervisor inmediato
          </label>
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-600 rounded-md">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <Button
            type="submit"
            disabled={submitting}
            className="flex-1"
          >
            {submitting ? 'Enviando...' : 'Enviar Solicitud'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => window.history.back()}
          >
            Cancelar
          </Button>
        </div>
      </form>
    </Card>
  )
}
```

---

## 4. Stack Tecnológico

| Componente | Tecnología | Versión | Justificación |
|------------|-----------|---------|---------------|
| **Forms Monorepo** | TypeScript + React | 18.3.1 | Estándar de la industria |
| **Build Tool** | esbuild | latest | Ultra rápido (<50ms), ESM output |
| **Package Manager** | pnpm | 8.x | Workspaces eficientes |
| **CI/CD** | GitHub Actions | - | Gratis, integrado |
| **Storage** | SQL Server | 2019+ | Ya existe en BPMS, transaccional |
| **Backend API** | .NET Core | 8.0+ | Compatible con API existente |
| **Runtime App** | Next.js 15 | 15.x | React Server Components, App Router |
| **Form SDK** | @tyconsa/bizuit-form-sdk | 1.1.2 | Ya existente |
| **UI Components** | @tyconsa/bizuit-ui-components | 1.4.0 | Ya existente |
| **Cache** | In-memory (Node.js) | - | Simple, sin Redis necesario |

**Comparación con plan original:**

| Aspecto | Plan Original | **Plan Simplificado** |
|---------|--------------|----------------------|
| npm Registry | npmjs.com (público) o privado | **❌ No usado** |
| CDN | esm.sh, unpkg, jsdelivr | **❌ No usado** |
| Azure Blob | Azure Storage | **❌ No usado** |
| Storage | CDN + npm packages | **✅ SQL Server (ya existe)** |
| Costo mensual | $150 | **$0** |
| Latencia | CDN → Registry → Cache → App | **DB → App (directo)** |
| Privacidad | Requiere config especial | **Privado por default** |
| Complejidad | 7 sistemas | **3 sistemas** |

---

## 5. Implementación Detallada

### 5.1 Database Schema

```sql
-- Tabla principal de formularios personalizados
CREATE TABLE CustomForms (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    FormName NVARCHAR(100) UNIQUE NOT NULL,
    ProcessName NVARCHAR(100) NOT NULL,
    CurrentVersion NVARCHAR(20) NOT NULL,
    Description NVARCHAR(MAX),
    Author NVARCHAR(100),
    Status NVARCHAR(20) DEFAULT 'active' CHECK (Status IN ('active', 'deprecated', 'beta', 'disabled')),
    Metadata NVARCHAR(MAX),  -- JSON string
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    UpdatedAt DATETIME2 DEFAULT GETDATE()
);

CREATE INDEX IX_CustomForms_FormName ON CustomForms(FormName);
CREATE INDEX IX_CustomForms_ProcessName ON CustomForms(ProcessName);
CREATE INDEX IX_CustomForms_Status ON CustomForms(Status);

-- Tabla de versiones (código fuente y compilado)
CREATE TABLE CustomFormVersions (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    FormId INT NOT NULL,
    Version NVARCHAR(20) NOT NULL,
    SourceCode NVARCHAR(MAX) NOT NULL,              -- Código TypeScript original
    CompiledCode NVARCHAR(MAX) NOT NULL,            -- ES Module compilado (minified)
    SourceMap NVARCHAR(MAX),                        -- Source map para debugging (opcional)
    Metadata NVARCHAR(MAX),                         -- Package info, dependencies, etc. (JSON string)
    Author NVARCHAR(100),
    CommitHash NVARCHAR(40),
    Changelog NVARCHAR(MAX),
    SizeBytes INT,                                  -- Tamaño del CompiledCode
    PublishedAt DATETIME2 DEFAULT GETDATE(),
    CONSTRAINT FK_CustomFormVersions_FormId FOREIGN KEY (FormId) REFERENCES CustomForms(Id) ON DELETE CASCADE,
    CONSTRAINT UQ_CustomFormVersions_FormIdVersion UNIQUE(FormId, Version)
);

CREATE INDEX IX_CustomFormVersions_FormIdVersion ON CustomFormVersions(FormId, Version);
CREATE INDEX IX_CustomFormVersions_PublishedAt ON CustomFormVersions(PublishedAt DESC);

-- Tabla de uso (analytics opcional)
CREATE TABLE CustomFormUsage (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    FormId INT NOT NULL,
    Version NVARCHAR(20),
    LoadedAt DATETIME2 DEFAULT GETDATE(),
    LoadTimeMs INT,
    UserId NVARCHAR(100),
    SessionId NVARCHAR(100),
    Success BIT DEFAULT 1,
    ErrorMessage NVARCHAR(MAX),
    CONSTRAINT FK_CustomFormUsage_FormId FOREIGN KEY (FormId) REFERENCES CustomForms(Id) ON DELETE CASCADE
);

CREATE INDEX IX_CustomFormUsage_FormIdLoadedAt ON CustomFormUsage(FormId, LoadedAt);
CREATE INDEX IX_CustomFormUsage_Success ON CustomFormUsage(Success);

-- Trigger para UpdatedAt
GO
CREATE TRIGGER trg_UpdateCustomForms_UpdatedAt
ON CustomForms
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE CustomForms
    SET UpdatedAt = GETDATE()
    FROM CustomForms f
    INNER JOIN inserted i ON f.Id = i.Id;
END;
GO

-- View para metadata completa (join optimizado)
CREATE VIEW vw_CustomFormsCurrentVersion AS
SELECT
    f.Id,
    f.FormName,
    f.ProcessName,
    f.CurrentVersion,
    f.Description,
    f.Author,
    f.Status,
    f.Metadata,
    f.CreatedAt,
    f.UpdatedAt,
    fv.SizeBytes,
    fv.PublishedAt,
    fv.CommitHash
FROM CustomForms f
INNER JOIN CustomFormVersions fv
    ON fv.FormId = f.Id
    AND fv.Version = f.CurrentVersion
WHERE f.Status = 'active';
GO
```

### 5.2 Datos de Ejemplo (Seeds)

```sql
-- Seed: 3 formularios de ejemplo
INSERT INTO CustomForms (form_name, process_name, current_version, description, author, status)
VALUES
  ('aprobacion-gastos', 'AprobacionGastos', '1.0.0', 'Formulario de aprobación de gastos', 'Bizuit Team', 'active'),
  ('solicitud-vacaciones', 'SolicitudVacaciones', '1.0.0', 'Solicitud de vacaciones', 'Bizuit Team', 'active'),
  ('onboarding-empleado', 'OnboardingEmpleado', '1.0.0', 'Onboarding de nuevos empleados', 'Bizuit Team', 'active');

-- Seed: Versión inicial de aprobacion-gastos (código de ejemplo)
INSERT INTO CustomFormVersions (form_id, version, source_code, compiled_code, author, size_bytes)
VALUES
  (
    1,
    '1.0.0',
    'export default function AprobacionGastosForm() { return <div>Aprobación de Gastos</div> }',
    'export default function(){return React.createElement("div",null,"Aprobación de Gastos")}',
    'Bizuit Team',
    100
  );
```

---

## 6. Código de Referencia

### 6.1 Backend API: .NET Core Controller

**Nota:** Este controller se agregará al proyecto existente **Tycon.Bizuit.WebForms.API** sin reemplazar nada.

```csharp
// Controllers/DynamicFormsController.cs
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System;
using System.Data;
using System.Data.SqlClient;
using System.Text;
using System.Threading.Tasks;
using Tycon.Bizuit.Forms.API.Controllers;
using Tycon.Bizuit.Forms.API.Security;

namespace Tycon.Bizuit.WebForms.API.Controllers
{
    /// <summary>
    /// Controller para Custom Forms System (formularios React personalizados)
    /// NO confundir con FormsController (forms del sistema existente)
    /// </summary>
    [ApiController]
    [Route("api/custom-forms")]
    public class CustomFormsController : BaseController<CustomFormsController>
    {
        private readonly string _connectionString;

        public CustomFormsController(
            BizuitDashboardEntities dbContext,
            ILogger<CustomFormsController> logger,
            IConfiguration configuration)
        {
            _context = dbContext;
            _logger = logger;
            _connectionString = configuration.GetConnectionString("BizuitBPM");
        }

        /// <summary>
        /// GET /api/custom-forms
        /// Lista todos los forms disponibles
        /// </summary>
        [HttpGet]
        [BizuitAuthorize]
        [ResponseCache(Duration = 300)] // 5 minutos
        public async Task<IActionResult> ListForms(
            [FromQuery] string status = null,
            [FromQuery] string processName = null)
        {
            try
            {
                using (var conn = new SqlConnection(_connectionString))
                {
                    await conn.OpenAsync();

                    var query = @"
                        SELECT * FROM vw_CustomFormsCurrentVersion
                        WHERE 1=1
                        {0}
                        ORDER BY FormName ASC";

                    var whereClause = new StringBuilder();
                    var cmd = new SqlCommand();
                    cmd.Connection = conn;

                    if (!string.IsNullOrEmpty(status))
                    {
                        whereClause.Append(" AND Status = @status");
                        cmd.Parameters.AddWithValue("@status", status);
                    }

                    if (!string.IsNullOrEmpty(processName))
                    {
                        whereClause.Append(" AND ProcessName = @processName");
                        cmd.Parameters.AddWithValue("@processName", processName);
                    }

                    cmd.CommandText = string.Format(query, whereClause.ToString());

                    var forms = new List<object>();
                    using (var reader = await cmd.ExecuteReaderAsync())
                    {
                        while (await reader.ReadAsync())
                        {
                            forms.Add(new
                            {
                                id = reader.GetInt32("Id"),
                                formName = reader.GetString("FormName"),
                                processName = reader.GetString("ProcessName"),
                                currentVersion = reader.GetString("CurrentVersion"),
                                description = reader.IsDBNull("Description") ? null : reader.GetString("Description"),
                                author = reader.IsDBNull("Author") ? null : reader.GetString("Author"),
                                status = reader.GetString("Status"),
                                sizeBytes = reader.IsDBNull("SizeBytes") ? 0 : reader.GetInt32("SizeBytes"),
                                publishedAt = reader.GetDateTime("PublishedAt"),
                                updatedAt = reader.GetDateTime("UpdatedAt")
                            });
                        }
                    }

                    return Ok(forms);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error listing custom forms");
                return StatusCode(500, new { error = ex.Message });
            }
        }

        /// <summary>
        /// GET /api/custom-forms/{formName}/metadata
        /// Obtener metadata de un form
        /// </summary>
        [HttpGet("{formName}/metadata")]
        [BizuitAuthorize]
        [ResponseCache(Duration = 300)]
        public async Task<IActionResult> GetFormMetadata(string formName)
        {
            try
            {
                using (var conn = new SqlConnection(_connectionString))
                {
                    await conn.OpenAsync();

                    var cmd = new SqlCommand(@"
                        SELECT * FROM vw_CustomFormsCurrentVersion
                        WHERE FormName = @formName", conn);

                    cmd.Parameters.AddWithValue("@formName", formName);

                    using (var reader = await cmd.ExecuteReaderAsync())
                    {
                        if (!await reader.ReadAsync())
                        {
                            return NotFound(new { error = "Form not found" });
                        }

                        var metadata = new
                        {
                            id = reader.GetInt32("Id"),
                            formName = reader.GetString("FormName"),
                            processName = reader.GetString("ProcessName"),
                            currentVersion = reader.GetString("CurrentVersion"),
                            description = reader.IsDBNull("Description") ? null : reader.GetString("Description"),
                            author = reader.IsDBNull("Author") ? null : reader.GetString("Author"),
                            status = reader.GetString("Status"),
                            sizeBytes = reader.IsDBNull("SizeBytes") ? 0 : reader.GetInt32("SizeBytes"),
                            publishedAt = reader.GetDateTime("PublishedAt"),
                            createdAt = reader.GetDateTime("CreatedAt"),
                            updatedAt = reader.GetDateTime("UpdatedAt"),
                            commitHash = reader.IsDBNull("CommitHash") ? null : reader.GetString("CommitHash")
                        };

                        return Ok(metadata);
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting metadata for form: {formName}");
                return StatusCode(500, new { error = ex.Message });
            }
        }

        /// <summary>
        /// GET /api/dynamic-forms/{formName}/code
        /// Obtener código compilado de un form (usado por Runtime App)
        /// </summary>
        [HttpGet("{formName}/code")]
        [ResponseCache(Duration = 31536000, VaryByQueryKeys = new[] { "version" })] // Cache 1 año
        public async Task<IActionResult> GetFormCode(
            string formName,
            [FromQuery] string version = null)
        {
            try
            {
                using (var conn = new SqlConnection(_connectionString))
                {
                    await conn.OpenAsync();

                    var query = version != null
                        ? @"SELECT fv.CompiledCode, fv.Version, fv.PublishedAt, fv.SizeBytes
                            FROM CustomFormVersions fv
                            INNER JOIN CustomForms f ON f.Id = fv.FormId
                            WHERE f.FormName = @formName AND fv.Version = @version"
                        : @"SELECT fv.CompiledCode, fv.Version, fv.PublishedAt, fv.SizeBytes
                            FROM CustomFormVersions fv
                            INNER JOIN CustomForms f ON f.Id = fv.FormId
                            WHERE f.FormName = @formName AND fv.Version = f.CurrentVersion";

                    var cmd = new SqlCommand(query, conn);
                    cmd.Parameters.AddWithValue("@formName", formName);
                    if (version != null)
                    {
                        cmd.Parameters.AddWithValue("@version", version);
                    }

                    using (var reader = await cmd.ExecuteReaderAsync())
                    {
                        if (!await reader.ReadAsync())
                        {
                            return NotFound(new { error = "Form not found" });
                        }

                        var compiledCode = reader.GetString("CompiledCode");
                        var formVersion = reader.GetString("Version");
                        var publishedAt = reader.GetDateTime("PublishedAt");
                        var sizeBytes = reader.GetInt32("SizeBytes");

                        // Headers para caching y metadata
                        Response.Headers.Add("X-Form-Version", formVersion);
                        Response.Headers.Add("X-Published-At", publishedAt.ToString("o"));
                        Response.Headers.Add("X-Size-Bytes", sizeBytes.ToString());
                        Response.Headers.Add("Cache-Control", "public, max-age=31536000, immutable");

                        // Log usage (fire and forget)
                        _ = LogFormUsageAsync(formName, formVersion, HttpContext);

                        return Content(compiledCode, "application/javascript", Encoding.UTF8);
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting code for form: {formName}");
                return StatusCode(500, new { error = ex.Message });
            }
        }

        /// <summary>
        /// POST /api/dynamic-forms/publish
        /// Publicar nueva versión de form (usado por GitHub Actions)
        /// </summary>
        [HttpPost("publish")]
        [BizuitAuthorize] // O usar un middleware específico de token
        public async Task<IActionResult> PublishForm([FromBody] PublishFormRequest request)
        {
            if (string.IsNullOrEmpty(request.FormName) ||
                string.IsNullOrEmpty(request.Version) ||
                string.IsNullOrEmpty(request.ProcessName) ||
                string.IsNullOrEmpty(request.CompiledCode))
            {
                return BadRequest(new { error = "Missing required fields" });
            }

            using (var conn = new SqlConnection(_connectionString))
            {
                await conn.OpenAsync();
                using (var transaction = conn.BeginTransaction())
                {
                    try
                    {
                        // Decodificar base64
                        var decodedSource = !string.IsNullOrEmpty(request.SourceCode)
                            ? Encoding.UTF8.GetString(Convert.FromBase64String(request.SourceCode))
                            : null;

                        var decodedCompiled = Encoding.UTF8.GetString(
                            Convert.FromBase64String(request.CompiledCode));

                        var sizeBytes = Encoding.UTF8.GetByteCount(decodedCompiled);

                        // 1. Buscar o crear form
                        var checkCmd = new SqlCommand(
                            "SELECT Id FROM CustomForms WHERE FormName = @formName",
                            conn, transaction);
                        checkCmd.Parameters.AddWithValue("@formName", request.FormName);

                        var formId = await checkCmd.ExecuteScalarAsync() as int?;

                        if (formId == null)
                        {
                            // Crear nuevo form
                            var insertFormCmd = new SqlCommand(@"
                                INSERT INTO CustomForms
                                (FormName, ProcessName, CurrentVersion, Description, Author, Status)
                                VALUES (@formName, @processName, @version, @description, @author, 'active');
                                SELECT SCOPE_IDENTITY();", conn, transaction);

                            insertFormCmd.Parameters.AddWithValue("@formName", request.FormName);
                            insertFormCmd.Parameters.AddWithValue("@processName", request.ProcessName);
                            insertFormCmd.Parameters.AddWithValue("@version", request.Version);
                            insertFormCmd.Parameters.AddWithValue("@description", request.Description ?? (object)DBNull.Value);
                            insertFormCmd.Parameters.AddWithValue("@author", request.Author ?? (object)DBNull.Value);

                            formId = Convert.ToInt32(await insertFormCmd.ExecuteScalarAsync());
                            _logger.LogInformation($"Created new form: {request.FormName}");
                        }
                        else
                        {
                            // Actualizar version actual
                            var updateFormCmd = new SqlCommand(@"
                                UPDATE CustomForms
                                SET CurrentVersion = @version,
                                    Description = COALESCE(@description, Description),
                                    Author = COALESCE(@author, Author),
                                    UpdatedAt = GETDATE()
                                WHERE Id = @formId", conn, transaction);

                            updateFormCmd.Parameters.AddWithValue("@version", request.Version);
                            updateFormCmd.Parameters.AddWithValue("@description", request.Description ?? (object)DBNull.Value);
                            updateFormCmd.Parameters.AddWithValue("@author", request.Author ?? (object)DBNull.Value);
                            updateFormCmd.Parameters.AddWithValue("@formId", formId.Value);

                            await updateFormCmd.ExecuteNonQueryAsync();
                            _logger.LogInformation($"Updated form: {request.FormName} to version {request.Version}");
                        }

                        // 2. Guardar versión (MERGE para upsert)
                        var mergeVersionCmd = new SqlCommand(@"
                            MERGE CustomFormVersions AS target
                            USING (SELECT @formId AS FormId, @version AS Version) AS source
                            ON target.FormId = source.FormId AND target.Version = source.Version
                            WHEN MATCHED THEN
                                UPDATE SET
                                    CompiledCode = @compiledCode,
                                    SourceCode = @sourceCode,
                                    SizeBytes = @sizeBytes,
                                    CommitHash = @commitHash
                            WHEN NOT MATCHED THEN
                                INSERT (FormId, Version, SourceCode, CompiledCode, Author, CommitHash, SizeBytes)
                                VALUES (@formId, @version, @sourceCode, @compiledCode, @author, @commitHash, @sizeBytes);",
                            conn, transaction);

                        mergeVersionCmd.Parameters.AddWithValue("@formId", formId.Value);
                        mergeVersionCmd.Parameters.AddWithValue("@version", request.Version);
                        mergeVersionCmd.Parameters.AddWithValue("@sourceCode", decodedSource ?? (object)DBNull.Value);
                        mergeVersionCmd.Parameters.AddWithValue("@compiledCode", decodedCompiled);
                        mergeVersionCmd.Parameters.AddWithValue("@author", request.Author ?? (object)DBNull.Value);
                        mergeVersionCmd.Parameters.AddWithValue("@commitHash", request.CommitHash ?? (object)DBNull.Value);
                        mergeVersionCmd.Parameters.AddWithValue("@sizeBytes", sizeBytes);

                        await mergeVersionCmd.ExecuteNonQueryAsync();

                        transaction.Commit();

                        return Ok(new
                        {
                            success = true,
                            formName = request.FormName,
                            version = request.Version,
                            sizeBytes = sizeBytes,
                            message = "Form published successfully"
                        });
                    }
                    catch (Exception ex)
                    {
                        transaction.Rollback();
                        _logger.LogError(ex, $"Error publishing form: {request.FormName}");
                        return StatusCode(500, new { error = ex.Message });
                    }
                }
            }
        }

        /// <summary>
        /// POST /api/dynamic-forms/{formName}/rollback
        /// Rollback a una versión anterior
        /// </summary>
        [HttpPost("{formName}/rollback")]
        [BizuitAuthorize]
        public async Task<IActionResult> RollbackForm(
            string formName,
            [FromBody] RollbackRequest request)
        {
            if (string.IsNullOrEmpty(request.Version))
            {
                return BadRequest(new { error = "Missing version" });
            }

            using (var conn = new SqlConnection(_connectionString))
            {
                await conn.OpenAsync();
                using (var transaction = conn.BeginTransaction())
                {
                    try
                    {
                        // Verificar que la versión existe
                        var checkCmd = new SqlCommand(@"
                            SELECT fv.Id
                            FROM CustomFormVersions fv
                            INNER JOIN CustomForms f ON f.Id = fv.FormId
                            WHERE f.FormName = @formName AND fv.Version = @version",
                            conn, transaction);

                        checkCmd.Parameters.AddWithValue("@formName", formName);
                        checkCmd.Parameters.AddWithValue("@version", request.Version);

                        var versionExists = await checkCmd.ExecuteScalarAsync();

                        if (versionExists == null)
                        {
                            transaction.Rollback();
                            return NotFound(new { error = "Version not found" });
                        }

                        // Actualizar CurrentVersion
                        var updateCmd = new SqlCommand(@"
                            UPDATE CustomForms
                            SET CurrentVersion = @version, UpdatedAt = GETDATE()
                            WHERE FormName = @formName",
                            conn, transaction);

                        updateCmd.Parameters.AddWithValue("@version", request.Version);
                        updateCmd.Parameters.AddWithValue("@formName", formName);

                        await updateCmd.ExecuteNonQueryAsync();

                        transaction.Commit();

                        _logger.LogInformation($"Rolled back {formName} to version {request.Version}");

                        return Ok(new
                        {
                            success = true,
                            formName = formName,
                            version = request.Version,
                            message = $"Form rolled back to version {request.Version}"
                        });
                    }
                    catch (Exception ex)
                    {
                        transaction.Rollback();
                        _logger.LogError(ex, $"Error rolling back form: {formName}");
                        return StatusCode(500, new { error = ex.Message });
                    }
                }
            }
        }

        // Helper: Log form usage (async, fire and forget)
        private async Task LogFormUsageAsync(string formName, string version, HttpContext context)
        {
            try
            {
                using (var conn = new SqlConnection(_connectionString))
                {
                    await conn.OpenAsync();

                    var cmd = new SqlCommand(@"
                        INSERT INTO CustomFormUsage
                        (FormId, Version, UserId, SessionId, Success)
                        SELECT f.Id, @version, @userId, @sessionId, 1
                        FROM CustomForms f
                        WHERE f.FormName = @formName", conn);

                    cmd.Parameters.AddWithValue("@formName", formName);
                    cmd.Parameters.AddWithValue("@version", version);
                    cmd.Parameters.AddWithValue("@userId", context.User?.Identity?.Name ?? (object)DBNull.Value);
                    cmd.Parameters.AddWithValue("@sessionId", context.Session?.Id ?? (object)DBNull.Value);

                    await cmd.ExecuteNonQueryAsync();
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to log form usage");
                // No throw - logging is not critical
            }
        }
    }

    // DTOs
    public class PublishFormRequest
    {
        public string FormName { get; set; }
        public string Version { get; set; }
        public string ProcessName { get; set; }
        public string Description { get; set; }
        public string SourceCode { get; set; } // Base64
        public string CompiledCode { get; set; } // Base64
        public string Author { get; set; }
        public string CommitHash { get; set; }
    }

    public class RollbackRequest
    {
        public string Version { get; set; }
    }
}
```

```typescript
// src/controllers/forms.controller.ts
import { Request, Response } from 'express'
import sql from 'mssql'
import { pool } from '../server'

/**
 * POST /api/forms/publish
 * GitHub Actions llama este endpoint para guardar nuevas versiones
 */
export async function publishForm(req: Request, res: Response) {
  const {
    formName,
    version,
    processName,
    description,
    sourceCode,
    compiledCode,
    author,
    commitHash
  } = req.body

  // Validaciones
  if (!formName || !version || !processName || !compiledCode) {
    return res.status(400).json({
      error: 'Missing required fields: formName, version, processName, compiledCode'
    })
  }

  const transaction = new sql.Transaction(pool)

  try {
    await transaction.begin()

    // Decodificar base64
    const decodedSource = sourceCode ? Buffer.from(sourceCode, 'base64').toString('utf-8') : null
    const decodedCompiled = Buffer.from(compiledCode, 'base64').toString('utf-8')
    const sizeBytes = Buffer.byteLength(decodedCompiled, 'utf-8')

    // 1. Buscar o crear form
    let result = await transaction.request()
      .input('formName', sql.NVarChar(100), formName)
      .query('SELECT id FROM CustomForms WHERE form_name = @formName')

    let formId: number

    if (result.recordset.length === 0) {
      // Crear nuevo form
      result = await transaction.request()
        .input('formName', sql.NVarChar(100), formName)
        .input('processName', sql.NVarChar(100), processName)
        .input('version', sql.NVarChar(20), version)
        .input('description', sql.NVarChar(sql.MAX), description)
        .input('author', sql.NVarChar(100), author)
        .query(`
          INSERT INTO CustomForms
          (form_name, process_name, current_version, description, author, status)
          VALUES (@formName, @processName, @version, @description, @author, 'active');
          SELECT SCOPE_IDENTITY() AS id;
        `)
      formId = result.recordset[0].id
      console.log(`[Forms] Created new form: ${formName}`)
    } else {
      formId = result.recordset[0].id

      // Actualizar version actual
      await transaction.request()
        .input('version', sql.NVarChar(20), version)
        .input('description', sql.NVarChar(sql.MAX), description)
        .input('author', sql.NVarChar(100), author)
        .input('formId', sql.Int, formId)
        .query(`
          UPDATE CustomForms
          SET current_version = @version,
              description = COALESCE(@description, description),
              author = COALESCE(@author, author),
              updated_at = GETDATE()
          WHERE id = @formId
        `)
      console.log(`[Forms] Updated form: ${formName} to version ${version}`)
    }

    // 2. Guardar versión (MERGE para upsert en SQL Server)
    await transaction.request()
      .input('formId', sql.Int, formId)
      .input('version', sql.NVarChar(20), version)
      .input('sourceCode', sql.NVarChar(sql.MAX), decodedSource)
      .input('compiledCode', sql.NVarChar(sql.MAX), decodedCompiled)
      .input('author', sql.NVarChar(100), author)
      .input('commitHash', sql.NVarChar(40), commitHash)
      .input('sizeBytes', sql.Int, sizeBytes)
      .query(`
        MERGE CustomFormVersions AS target
        USING (SELECT @formId AS form_id, @version AS version) AS source
        ON target.form_id = source.form_id AND target.version = source.version
        WHEN MATCHED THEN
          UPDATE SET
            compiled_code = @compiledCode,
            source_code = @sourceCode,
            size_bytes = @sizeBytes,
            commit_hash = @commitHash
        WHEN NOT MATCHED THEN
          INSERT (form_id, version, source_code, compiled_code, author, commit_hash, size_bytes)
          VALUES (@formId, @version, @sourceCode, @compiledCode, @author, @commitHash, @sizeBytes);
      `)

    await transaction.commit()

    res.json({
      success: true,
      formName,
      version,
      sizeBytes,
      message: 'Form published successfully'
    })

  } catch (err: any) {
    await transaction.rollback()
    console.error('[Forms] Error publishing:', err)
    res.status(500).json({ error: err.message })
  }
}

/**
 * GET /api/forms/:formName/code
 * Runtime app llama esto para obtener el código compilado
 */
export async function getFormCode(req: Request, res: Response) {
  const { formName } = req.params
  const { version } = req.query

  try {
    let result: sql.IResult<any>

    if (version) {
      // Obtener version específica
      result = await pool.request()
        .input('formName', sql.NVarChar(100), formName)
        .input('version', sql.NVarChar(20), version as string)
        .query(`
          SELECT fv.compiled_code, fv.version, fv.published_at, fv.size_bytes
          FROM CustomFormVersions fv
          INNER JOIN CustomForms f ON f.id = fv.form_id
          WHERE f.form_name = @formName AND fv.version = @version
        `)
    } else {
      // Obtener version actual
      result = await pool.request()
        .input('formName', sql.NVarChar(100), formName)
        .query(`
          SELECT fv.compiled_code, fv.version, fv.published_at, fv.size_bytes
          FROM CustomFormVersions fv
          INNER JOIN CustomForms f ON f.id = fv.form_id
          WHERE f.form_name = @formName AND fv.version = f.current_version
        `)
    }

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Form not found' })
    }

    const { compiled_code, version: formVersion, published_at, size_bytes } = result.recordset[0]

    // Servir como ES Module con headers correctos
    res.set({
      'Content-Type': 'application/javascript; charset=utf-8',
      'Cache-Control': 'public, max-age=31536000, immutable', // Cache 1 año (version es inmutable)
      'X-Form-Version': formVersion,
      'X-Published-At': published_at,
      'X-Size-Bytes': size_bytes
    })

    res.send(compiled_code)

    // Log usage (async, no esperar)
    logFormUsage(formName, formVersion, req).catch(err =>
      console.error('[Forms] Error logging usage:', err)
    )

  } catch (err: any) {
    console.error('[Forms] Error getting form code:', err)
    res.status(500).json({ error: err.message })
  }
}

/**
 * GET /api/forms/:formName/metadata
 * Obtener metadata del form
 */
export async function getFormMetadata(req: Request, res: Response) {
  const { formName } = req.params

  try {
    const result = await pool.request()
      .input('formName', sql.NVarChar(100), formName)
      .query(`SELECT * FROM v_forms_current_version WHERE form_name = @formName`)

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Form not found' })
    }

    res.json(result.recordset[0])

  } catch (err: any) {
    console.error('[Forms] Error getting metadata:', err)
    res.status(500).json({ error: err.message })
  }
}

/**
 * GET /api/forms
 * Lista todos los forms disponibles
 */
export async function listForms(req: Request, res: Response) {
  const { status, process } = req.query

  try {
    const request = pool.request()
    let query = 'SELECT * FROM v_forms_current_version WHERE 1=1'

    if (status) {
      request.input('status', sql.NVarChar(20), status as string)
      query += ' AND status = @status'
    }

    if (process) {
      request.input('processName', sql.NVarChar(100), process as string)
      query += ' AND process_name = @processName'
    }

    query += ' ORDER BY form_name ASC'

    const result = await request.query(query)
    res.json(result.recordset)

  } catch (err: any) {
    console.error('[Forms] Error listing forms:', err)
    res.status(500).json({ error: err.message })
  }
}

/**
 * POST /api/forms/:formName/rollback
 * Rollback a una versión anterior
 */
export async function rollbackForm(req: Request, res: Response) {
  const { formName } = req.params
  const { version } = req.body

  if (!version) {
    return res.status(400).json({ error: 'Missing version' })
  }

  const transaction = new sql.Transaction(pool)

  try {
    await transaction.begin()

    // Verificar que la versión existe
    const versionCheck = await transaction.request()
      .input('formName', sql.NVarChar(100), formName)
      .input('version', sql.NVarChar(20), version)
      .query(`
        SELECT fv.id
        FROM CustomFormVersions fv
        INNER JOIN CustomForms f ON f.id = fv.form_id
        WHERE f.form_name = @formName AND fv.version = @version
      `)

    if (versionCheck.recordset.length === 0) {
      await transaction.rollback()
      return res.status(404).json({ error: 'Version not found' })
    }

    // Actualizar current_version
    await transaction.request()
      .input('version', sql.NVarChar(20), version)
      .input('formName', sql.NVarChar(100), formName)
      .query(`
        UPDATE CustomForms
        SET current_version = @version, updated_at = GETDATE()
        WHERE form_name = @formName
      `)

    await transaction.commit()

    console.log(`[Forms] Rolled back ${formName} to version ${version}`)

    res.json({
      success: true,
      formName,
      version,
      message: `Form rolled back to version ${version}`
    })

  } catch (err: any) {
    await transaction.rollback()
    console.error('[Forms] Error rolling back:', err)
    res.status(500).json({ error: err.message })
  }
}

/**
 * Helper: Log form usage (async)
 */
async function logFormUsage(formName: string, version: string, req: Request) {
  // Extraer info del request
  const userId = (req as any).user?.id || null
  const sessionId = req.headers['x-session-id'] || null

  await pool.query(
    `INSERT INTO CustomFormUsage
     (form_id, version, user_id, session_id, success)
     SELECT f.id, $2, $3, $4, true
     FROM CustomForms f
     WHERE f.form_name = $1`,
    [formName, version, userId, sessionId]
  )
}
```

```typescript
// src/middleware/auth.ts
import { Request, Response, NextFunction } from 'express'

/**
 * Middleware de autenticación para endpoints protegidos
 */
export function authenticateAPI(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid authorization header' })
  }

  const token = authHeader.substring(7) // Remove 'Bearer '
  const expectedToken = process.env.BIZUIT_API_TOKEN

  if (!expectedToken) {
    console.error('[Auth] BIZUIT_API_TOKEN not configured')
    return res.status(500).json({ error: 'Server configuration error' })
  }

  if (token !== expectedToken) {
    return res.status(401).json({ error: 'Invalid token' })
  }

  next()
}
```

### 6.2 Runtime App: Form Loader

```typescript
// lib/form-loader.ts
/**
 * Dynamic Form Loader (Simplificado - carga desde BD via API)
 */

const FORMS_API = process.env.NEXT_PUBLIC_FORMS_API_URL || '/api/forms'

interface LoadOptions {
  version?: string
}

/**
 * Carga un form component dinámicamente desde la BD
 */
export async function loadDynamicForm(
  formName: string,
  options: LoadOptions = {}
): Promise<React.ComponentType> {

  try {
    // 1. Fetch código compilado desde Backend API
    const url = `${FORMS_API}/${formName}/code${
      options.version ? `?version=${options.version}` : ''
    }`

    const response = await fetch(url, {
      headers: {
        'Accept': 'application/javascript'
      }
    })

    if (!response.ok) {
      throw new Error(`Failed to load form: ${response.statusText}`)
    }

    const code = await response.text()

    // Log version info
    const version = response.headers.get('X-Form-Version')
    const publishedAt = response.headers.get('X-Published-At')
    console.log(`[FormLoader] Loading ${formName}@${version} (published: ${publishedAt})`)

    // 2. Crear blob URL para dynamic import
    const blob = new Blob([code], { type: 'application/javascript' })
    const blobUrl = URL.createObjectURL(blob)

    // 3. Dynamic import
    const module = await import(/* webpackIgnore: true */ /* @vite-ignore */ blobUrl)

    // 4. Cleanup blob URL
    URL.revokeObjectURL(blobUrl)

    if (!module.default) {
      throw new Error(`Form ${formName} does not export a default component`)
    }

    console.log(`[FormLoader] Successfully loaded ${formName}@${version}`)
    return module.default

  } catch (err: any) {
    console.error(`[FormLoader] Error loading form ${formName}:`, err)
    throw new Error(`Failed to load form: ${err.message}`)
  }
}

/**
 * Cache opcional en el cliente
 */
const formCache = new Map<string, React.ComponentType>()

export async function loadDynamicFormCached(
  formName: string,
  options: LoadOptions = {}
): Promise<React.ComponentType> {
  const cacheKey = `${formName}@${options.version || 'latest'}`

  if (formCache.has(cacheKey)) {
    console.log(`[FormLoader] Cache hit: ${cacheKey}`)
    return formCache.get(cacheKey)!
  }

  const component = await loadDynamicForm(formName, options)
  formCache.set(cacheKey, component)

  return component
}

/**
 * Invalida cache de un form específico
 */
export function invalidateFormCache(formName: string): void {
  const keysToDelete: string[] = []

  for (const key of formCache.keys()) {
    if (key.startsWith(`${formName}@`)) {
      keysToDelete.push(key)
    }
  }

  keysToDelete.forEach(key => formCache.delete(key))
  console.log(`[FormLoader] Cache invalidated for ${formName} (${keysToDelete.length} entries)`)
}
```

```typescript
// lib/form-registry.ts
/**
 * Form Registry (Simplificado - consulta directo a API)
 */

const FORMS_API = process.env.NEXT_PUBLIC_FORMS_API_URL || '/api/forms'

export interface FormMetadata {
  form_name: string
  process_name: string
  current_version: string
  description?: string
  author?: string
  status: 'active' | 'deprecated' | 'beta' | 'disabled'
  size_bytes: number
  published_at: string
  updated_at: string
}

// In-memory cache con TTL
const cache = new Map<string, { data: FormMetadata; expires: number }>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutos

/**
 * Obtiene metadata de un form
 */
export async function getFormMetadata(formName: string): Promise<FormMetadata | null> {
  // Check cache
  const cached = cache.get(formName)
  if (cached && cached.expires > Date.now()) {
    console.log(`[FormRegistry] Cache hit for ${formName}`)
    return cached.data
  }

  try {
    const response = await fetch(`${FORMS_API}/${formName}/metadata`)

    if (response.status === 404) {
      return null
    }

    if (!response.ok) {
      throw new Error(`Failed to fetch form metadata: ${response.statusText}`)
    }

    const metadata: FormMetadata = await response.json()

    // Update cache
    cache.set(formName, {
      data: metadata,
      expires: Date.now() + CACHE_TTL
    })

    return metadata

  } catch (err) {
    console.error(`[FormRegistry] Error fetching metadata for ${formName}:`, err)
    throw err
  }
}

/**
 * Lista todos los forms disponibles
 */
export async function listForms(filters?: {
  status?: string
  process?: string
}): Promise<FormMetadata[]> {
  try {
    const params = new URLSearchParams()
    if (filters?.status) params.set('status', filters.status)
    if (filters?.process) params.set('process', filters.process)

    const url = `${FORMS_API}${params.toString() ? '?' + params.toString() : ''}`
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`Failed to list forms: ${response.statusText}`)
    }

    const forms: FormMetadata[] = await response.json()
    return forms

  } catch (err) {
    console.error('[FormRegistry] Error listing forms:', err)
    throw err
  }
}

/**
 * Invalida cache de un form específico
 */
export function invalidateCache(formName: string): void {
  cache.delete(formName)
  console.log(`[FormRegistry] Cache invalidated for ${formName}`)
}

/**
 * Invalida todo el cache
 */
export function invalidateAllCache(): void {
  cache.clear()
  console.log('[FormRegistry] All cache invalidated')
}
```

### 6.3 Runtime App: Page Component

```typescript
// app/form/[formName]/page.tsx
'use client'

import { useEffect, useState, Suspense } from 'react'
import { BizuitSDKProvider } from '@tyconsa/bizuit-form-sdk'
import { FormContainer } from '@/components/FormContainer'
import { FormErrorBoundary } from '@/components/FormErrorBoundary'
import { FormLoadingState } from '@/components/FormLoadingState'
import { loadDynamicFormCached } from '@/lib/form-loader'
import { getFormMetadata } from '@/lib/form-registry'

interface Props {
  params: { formName: string }
  searchParams: { token?: string; instanceId?: string; version?: string }
}

export default function DynamicFormPage({ params, searchParams }: Props) {
  const [FormComponent, setFormComponent] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadForm()
  }, [params.formName, searchParams.version])

  const loadForm = async () => {
    try {
      setLoading(true)
      setError(null)

      // 1. Get form metadata
      const metadata = await getFormMetadata(params.formName)

      if (!metadata) {
        throw new Error(`Form "${params.formName}" not found`)
      }

      if (metadata.status === 'disabled') {
        throw new Error(`Form "${params.formName}" is currently disabled`)
      }

      // 2. Load form component
      const component = await loadDynamicFormCached(params.formName, {
        version: searchParams.version
      })

      setFormComponent(() => component)

    } catch (err: any) {
      console.error('[DynamicFormPage] Error loading form:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <FormLoadingState />
  if (error) return <FormErrorBoundary error={error} formName={params.formName} />
  if (!FormComponent) return <div>Form not found</div>

  return (
    <BizuitSDKProvider
      config={{
        formsApiUrl: process.env.NEXT_PUBLIC_BPM_API_URL!,
        dashboardApiUrl: process.env.NEXT_PUBLIC_BPM_DASHBOARD_URL!,
        timeout: 120000,
      }}
    >
      <FormContainer formName={params.formName}>
        <Suspense fallback={<FormLoadingState />}>
          <FormComponent />
        </Suspense>
      </FormContainer>
    </BizuitSDKProvider>
  )
}
```

---

**CONTINÚA EN:** [DYNAMIC_FORMS_IMPLEMENTATION_PLAN_PART2.md](./DYNAMIC_FORMS_IMPLEMENTATION_PLAN_PART2.md)

- Fases de Implementación (detalladas)
- Cronograma completo (6 semanas)
- Riesgos y mitigaciones
- Métricas de éxito
- Costos y recursos
