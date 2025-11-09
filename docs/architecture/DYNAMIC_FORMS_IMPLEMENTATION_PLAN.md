# Bizuit Dynamic Forms System - Plan de Implementación Completo

**Versión:** 1.0.0
**Fecha:** Noviembre 2024
**Autor:** Bizuit Development Team
**Estado:** Planificación

---

## 📋 Tabla de Contenidos

1. [Executive Summary](#1-executive-summary)
2. [Arquitectura Técnica](#2-arquitectura-técnica)
3. [Estructura de Repositorios](#3-estructura-de-repositorios)
4. [Fases de Implementación](#4-fases-de-implementación)
5. [Código de Referencia](#5-código-de-referencia)
6. [Guías de Desarrollo](#6-guías-de-desarrollo)
7. [Seguridad y Performance](#7-seguridad-y-performance)
8. [Deployment](#8-deployment)
9. [Cronograma](#9-cronograma)
10. [Riesgos y Mitigaciones](#10-riesgos-y-mitigaciones)
11. [Métricas de Éxito](#11-métricas-de-éxito)

---

## 1. Executive Summary

### 1.1 Visión General

El **Bizuit Dynamic Forms System** permite que los desarrolladores creen y desplieguen formularios React personalizados para procesos de BPM sin necesidad de recompilar o redesplegar la aplicación principal. Cada formulario se publica como un paquete npm independiente que se carga dinámicamente en el runtime.

### 1.2 Problema Actual

- Los cambios en formularios requieren rebuild completo
- Un bug en un form puede afectar a otros
- Deployments lentos y riesgosos
- No hay versionado independiente por form
- Difícil rollback de forms específicos

### 1.3 Solución Propuesta

```
┌─────────────────────────────────────────────────────────────┐
│ Developer                                                   │
│   ├─ Edita form.tsx en Web UI o IDE local                 │
│   └─ Git push o click "Publicar"                          │
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
│   ├─ Detecta cambios                                       │
│   ├─ Build con esbuild (<50ms)                            │
│   ├─ Auto version bump (patch/minor/major)                │
│   └─ npm publish @bizuit-forms/form-name@x.y.z            │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ↓
┌─────────────────────────────────────────────────────────────┐
│ npm Registry (cdn.jsdelivr.net o unpkg.com)               │
│   ├─ @bizuit-forms/aprobacion-gastos@1.0.5               │
│   ├─ @bizuit-forms/solicitud-vacaciones@2.1.0            │
│   └─ @bizuit-forms/onboarding-empleado@1.3.2             │
└──────────────────────┬──────────────────────────────────────┘
                       │ Dynamic import
                       ↓
┌─────────────────────────────────────────────────────────────┐
│ Runtime App (Next.js)                                      │
│   /form/aprobacion-gastos                                  │
│     ↓                                                       │
│   import('@bizuit-forms/aprobacion-gastos')               │
│     ↓                                                       │
│   Render FormComponent                                     │
└─────────────────────────────────────────────────────────────┘
```

### 1.4 Beneficios

| Beneficio | Impacto | ROI |
|-----------|---------|-----|
| **Deployments independientes** | Alta | Deploy de un form en < 2 min vs 15-30 min app completa |
| **Zero downtime** | Alta | No requiere restart del runtime app |
| **Rollback rápido** | Alta | Cambiar version en < 30 seg |
| **Versionado granular** | Media | Historial completo por form en git |
| **Aislamiento de errores** | Alta | Bug en un form no afecta otros |
| **Developer velocity** | Alta | Edit → Push → Live en < 5 min |
| **A/B Testing** | Media | Probar diferentes versiones fácilmente |

### 1.5 Arquitectura de 3 Repos

```
Repo 1: bizuit-forms-monorepo (GitHub)
  ↓ push
GitHub Actions (Auto-publish)
  ↓ npm publish
npm Registry (CDN global)
  ↑ import
Repo 2: bizuit-runtime-app (Next.js)
  ↑ API calls
Repo 3: bizuit-bpm-backend (Storage + APIs)
```

---

## 2. Arquitectura Técnica

### 2.1 Componentes del Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                    BIZUIT FORMS ECOSYSTEM                   │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────────┐    ┌─────────────────┐                │
│  │  Forms Monorepo │────│  GitHub Actions │                │
│  │  (Source Code)  │    │  (CI/CD)        │                │
│  └─────────────────┘    └─────────────────┘                │
│           │                      │                          │
│           │                      │ npm publish              │
│           │                      ↓                          │
│           │              ┌─────────────────┐                │
│           │              │  npm Registry   │                │
│           │              │  (CDN: unpkg)   │                │
│           │              └─────────────────┘                │
│           │                      ↑                          │
│           │ Web Editor           │ Dynamic import           │
│           │                      │                          │
│           ↓                      │                          │
│  ┌─────────────────┐    ┌─────────────────┐                │
│  │   BPM Backend   │←───│  Runtime App    │                │
│  │  (Storage+API)  │    │  (Next.js)      │                │
│  └─────────────────┘    └─────────────────┘                │
│           ↑                      ↑                          │
│           │                      │                          │
│           │              ┌─────────────────┐                │
│           │              │   End Users     │                │
│           │              │  (Browsers)     │                │
│           └──────────────┴─────────────────┘                │
│                     (Form submission)                        │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Flujo de Datos Completo

#### Flujo 1: Desarrollo y Publicación

```
┌──────────────┐
│ Developer    │
└──────┬───────┘
       │
       │ 1. Edita FormComponent.tsx
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
       │ 3. Detect changes
       │ 4. Build (esbuild)
       │ 5. Version bump
       │ 6. npm publish
       │
       ↓
┌──────────────────────┐
│ npm Registry         │
│ @bizuit-forms/       │
│   mi-form@1.0.5      │
└──────┬───────────────┘
       │
       │ 7. CDN caches
       │
       ↓
┌──────────────────────┐
│ Runtime App          │
│ (Notified via        │
│  webhook)            │
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
       │ 2. Check form registry
       │    (BPM Backend API)
       │
       ↓
┌──────────────────────┐
│ BPM Backend          │
│ GET /api/forms/      │
│     mi-form/metadata │
└──────┬───────────────┘
       │
       │ 3. Returns:
       │    {
       │      packageName: "@bizuit-forms/mi-form",
       │      version: "1.0.5",
       │      cdnUrl: "https://esm.sh/..."
       │    }
       │
       ↓
┌──────────────────────┐
│ Runtime App          │
│ Dynamic import       │
└──────┬───────────────┘
       │
       │ 4. import('@bizuit-forms/mi-form@1.0.5')
       │
       ↓
┌──────────────────────┐
│ CDN (unpkg/esm.sh)   │
│ Serves compiled JS   │
└──────┬───────────────┘
       │
       │ 5. Returns ES Module
       │
       ↓
┌──────────────────────┐
│ Browser              │
│ Renders FormComponent│
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
│ @bizuit-form-sdk     │
│ raiseEvent()         │
└──────┬───────────────┘
       │
       │ POST /api/instances
       │ { eventName, parameters }
       │
       ↓
┌──────────────────────┐
│ BPM Backend          │
│ Process Instance     │
│ Created              │
└──────────────────────┘
```

### 2.3 Stack Tecnológico

| Componente | Tecnología | Versión | Justificación |
|------------|-----------|---------|---------------|
| **Forms Monorepo** | TypeScript + React | 18.3.1 | Estándar de la industria |
| **Build Tool** | esbuild | latest | Ultra rápido (<50ms) |
| **Package Manager** | pnpm | 8.x | Workspaces eficientes |
| **CI/CD** | GitHub Actions | - | Gratis, integrado con GitHub |
| **npm Registry** | npmjs.com | - | Infraestructura probada |
| **CDN** | esm.sh / unpkg | - | CDN global gratuito |
| **Runtime App** | Next.js 15 | 15.x | React Server Components |
| **BPM Backend** | Node.js + Express | 20.x | Compatible con stack actual |
| **Storage** | PostgreSQL | 14+ | Transaccional, confiable |
| **Cache** | Redis | 7.x | Performance en lookups |

---

## 3. Estructura de Repositorios

### 3.1 Repo 1: bizuit-forms-monorepo

**URL:** `https://github.com/bizuit/forms-monorepo`

```
bizuit-forms-monorepo/
├── .github/
│   └── workflows/
│       ├── publish-forms.yml       # Auto-publish en push
│       ├── pr-checks.yml           # Tests en PRs
│       └── version-check.yml       # Validar versions
│
├── forms/                          # Todos los forms
│   │
│   ├── aprobacion-gastos/
│   │   ├── index.tsx               # Form component
│   │   ├── package.json            # npm package config
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
│   ├── version-bump.ts             # Bump version
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
├── .npmrc                          # npm registry config
├── package.json                    # Root package
├── pnpm-workspace.yaml             # pnpm workspaces
├── tsconfig.json                   # Shared TS config
├── README.md                       # Documentación general
└── CONTRIBUTING.md                 # Guía de contribución
```

#### 3.1.1 Archivo de Ejemplo: forms/aprobacion-gastos/package.json

```json
{
  "name": "@bizuit-forms/aprobacion-gastos",
  "version": "1.0.0",
  "description": "Formulario de aprobación de gastos para Bizuit BPM",
  "main": "dist/index.js",
  "module": "dist/index.mjs",
  "types": "dist/index.d.ts",
  "files": [
    "dist"
  ],
  "scripts": {
    "build": "tsup index.tsx --format esm,cjs --dts",
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
  "license": "MIT",
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
  },
  "publishConfig": {
    "access": "public"
  },
  "repository": {
    "type": "git",
    "url": "https://github.com/bizuit/forms-monorepo.git",
    "directory": "forms/aprobacion-gastos"
  }
}
```

#### 3.1.2 Archivo de Ejemplo: forms/aprobacion-gastos/index.tsx

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

#### 3.1.3 Archivo: pnpm-workspace.yaml

```yaml
packages:
  - 'forms/*'
  - 'shared'
```

#### 3.1.4 Archivo: .github/workflows/publish-forms.yml

```yaml
name: Auto-publish Forms

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
          registry-url: 'https://registry.npmjs.org'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Run tests
        run: |
          cd forms/${{ matrix.form }}
          pnpm test

      - name: Build
        run: |
          cd forms/${{ matrix.form }}
          pnpm build

      - name: Version bump (patch)
        run: |
          cd forms/${{ matrix.form }}
          npm version patch --no-git-tag-version

      - name: Publish to npm
        run: |
          cd forms/${{ matrix.form }}
          npm publish
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}

      - name: Commit version bump
        run: |
          git config user.name "GitHub Actions"
          git config user.email "actions@github.com"
          git add forms/${{ matrix.form }}/package.json
          git commit -m "chore: bump ${{ matrix.form }} version [skip ci]"
          git push

      - name: Notify runtime app
        run: |
          curl -X POST ${{ secrets.RUNTIME_WEBHOOK_URL }}/api/forms/reload \
            -H "Authorization: Bearer ${{ secrets.WEBHOOK_SECRET }}" \
            -H "Content-Type: application/json" \
            -d '{
              "formName": "${{ matrix.form }}",
              "action": "published",
              "timestamp": "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'"
            }'
```

---

### 3.2 Repo 2: bizuit-runtime-app

**URL:** `https://github.com/bizuit/runtime-app`

```
bizuit-runtime-app/
├── .github/
│   └── workflows/
│       └── deploy.yml
│
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   │
│   ├── form/
│   │   └── [formName]/
│   │       ├── page.tsx              # Dynamic form loader
│   │       └── loading.tsx
│   │
│   ├── api/
│   │   ├── forms/
│   │   │   ├── reload/
│   │   │   │   └── route.ts          # Webhook receiver
│   │   │   └── registry/
│   │   │       └── route.ts          # Form registry API
│   │   └── health/
│   │       └── route.ts
│   │
│   └── admin/
│       └── forms/
│           ├── page.tsx              # Lista de forms
│           └── [formName]/
│               └── page.tsx          # Admin panel por form
│
├── lib/
│   ├── form-loader.ts                # Core dynamic import logic
│   ├── form-registry.ts              # Cache y registry
│   ├── cdn-resolver.ts               # CDN fallbacks
│   └── error-handlers.ts
│
├── components/
│   ├── FormContainer.tsx             # Wrapper para forms
│   ├── FormErrorBoundary.tsx         # Error handling
│   └── FormLoadingState.tsx
│
├── config/
│   ├── forms.ts                      # Form configurations
│   └── cdn.ts                        # CDN configs
│
├── public/
│   └── form-fallbacks/               # Fallback forms
│
├── .env.example
├── .env.local
├── next.config.js
├── package.json
├── tsconfig.json
└── README.md
```

#### 3.2.1 Archivo: app/form/[formName]/page.tsx

```typescript
'use client'

import { useEffect, useState, Suspense } from 'react'
import { BizuitSDKProvider } from '@tyconsa/bizuit-form-sdk'
import { FormContainer } from '@/components/FormContainer'
import { FormErrorBoundary } from '@/components/FormErrorBoundary'
import { FormLoadingState } from '@/components/FormLoadingState'
import { loadDynamicForm } from '@/lib/form-loader'
import { getFormMetadata } from '@/lib/form-registry'

interface Props {
  params: { formName: string }
  searchParams: { token?: string; instanceId?: string }
}

export default function DynamicFormPage({ params, searchParams }: Props) {
  const [FormComponent, setFormComponent] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadForm()
  }, [params.formName])

  const loadForm = async () => {
    try {
      setLoading(true)
      setError(null)

      // 1. Get form metadata from registry
      const metadata = await getFormMetadata(params.formName)

      if (!metadata) {
        throw new Error(`Form "${params.formName}" not found in registry`)
      }

      // 2. Load form component dynamically
      const component = await loadDynamicForm(
        metadata.packageName,
        metadata.version
      )

      setFormComponent(() => component)

    } catch (err: any) {
      console.error('Error loading form:', err)
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

#### 3.2.2 Archivo: lib/form-loader.ts

```typescript
/**
 * Dynamic Form Loader
 * Carga forms dinámicamente desde npm registry via CDN
 */

import { FormMetadata } from './form-registry'

// CDN providers (fallback chain)
const CDN_PROVIDERS = [
  'https://esm.sh',           // Primary
  'https://cdn.skypack.dev',  // Fallback 1
  'https://unpkg.com',        // Fallback 2
]

interface LoadOptions {
  cdnIndex?: number
  retries?: number
}

/**
 * Carga un form component dinámicamente
 */
export async function loadDynamicForm(
  packageName: string,
  version: string,
  options: LoadOptions = {}
): Promise<React.ComponentType> {
  const { cdnIndex = 0, retries = 3 } = options

  if (cdnIndex >= CDN_PROVIDERS.length) {
    throw new Error('All CDN providers failed')
  }

  const cdn = CDN_PROVIDERS[cdnIndex]
  const url = buildCDNUrl(cdn, packageName, version)

  try {
    console.log(`[FormLoader] Loading ${packageName}@${version} from ${cdn}`)

    // Dynamic import con webpackIgnore para evitar bundling
    const module = await import(
      /* webpackIgnore: true */
      /* @vite-ignore */
      url
    )

    if (!module.default) {
      throw new Error('Form module does not export a default component')
    }

    console.log(`[FormLoader] Successfully loaded ${packageName}@${version}`)
    return module.default

  } catch (err: any) {
    console.error(`[FormLoader] Failed to load from ${cdn}:`, err)

    // Retry con mismo CDN
    if (retries > 0) {
      await sleep(1000)
      return loadDynamicForm(packageName, version, {
        cdnIndex,
        retries: retries - 1
      })
    }

    // Try next CDN
    return loadDynamicForm(packageName, version, {
      cdnIndex: cdnIndex + 1,
      retries: 3
    })
  }
}

/**
 * Construye URL del CDN según el provider
 */
function buildCDNUrl(cdn: string, packageName: string, version: string): string {
  const encodedPackage = encodeURIComponent(packageName)

  switch (cdn) {
    case 'https://esm.sh':
      // esm.sh con deps fijadas
      return `${cdn}/${encodedPackage}@${version}?deps=react@18.3.1,react-dom@18.3.1`

    case 'https://cdn.skypack.dev':
      return `${cdn}/${encodedPackage}@${version}?min`

    case 'https://unpkg.com':
      return `${cdn}/${encodedPackage}@${version}/dist/index.mjs`

    default:
      return `${cdn}/${encodedPackage}@${version}`
  }
}

/**
 * Precarga un form en background
 */
export async function preloadForm(packageName: string, version: string): Promise<void> {
  try {
    await loadDynamicForm(packageName, version)
  } catch (err) {
    console.warn(`[FormLoader] Preload failed for ${packageName}:`, err)
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}
```

#### 3.2.3 Archivo: lib/form-registry.ts

```typescript
/**
 * Form Registry
 * Cache y lookup de forms disponibles
 */

export interface FormMetadata {
  formName: string
  packageName: string
  version: string
  processName: string
  description?: string
  author?: string
  lastModified: string
  status: 'active' | 'deprecated' | 'beta'
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
    // Fetch from BPM Backend
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BPM_API_URL}/api/forms/${formName}/metadata`,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )

    if (!response.ok) {
      if (response.status === 404) {
        return null
      }
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
export async function listForms(): Promise<FormMetadata[]> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BPM_API_URL}/api/forms`,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )

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

#### 3.2.4 Archivo: app/api/forms/reload/route.ts

```typescript
/**
 * Webhook receiver para notificaciones de GitHub Actions
 * Invalida cache cuando un form se publica
 */

import { NextRequest, NextResponse } from 'next/server'
import { invalidateCache } from '@/lib/form-registry'

export async function POST(request: NextRequest) {
  try {
    // Verify webhook secret
    const authHeader = request.headers.get('authorization')
    const expectedAuth = `Bearer ${process.env.WEBHOOK_SECRET}`

    if (authHeader !== expectedAuth) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { formName, action, timestamp } = body

    if (!formName || !action) {
      return NextResponse.json(
        { error: 'Missing required fields: formName, action' },
        { status: 400 }
      )
    }

    console.log(`[Webhook] Received ${action} for form: ${formName}`)

    // Invalidate cache
    invalidateCache(formName)

    // Optionally: Preload new version
    // await preloadForm(...)

    return NextResponse.json({
      success: true,
      message: `Cache invalidated for ${formName}`,
      timestamp: new Date().toISOString()
    })

  } catch (err: any) {
    console.error('[Webhook] Error processing request:', err)
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    )
  }
}
```

---

### 3.3 Repo 3: bizuit-bpm-backend

**URL:** `https://github.com/bizuit/bpm-backend`

```
bizuit-bpm-backend/
├── src/
│   ├── controllers/
│   │   ├── forms.controller.ts       # CRUD de forms
│   │   └── processes.controller.ts
│   │
│   ├── services/
│   │   ├── form-storage.service.ts   # Storage de forms
│   │   ├── github.service.ts         # GitHub API integration
│   │   └── npm.service.ts            # npm registry queries
│   │
│   ├── models/
│   │   ├── Form.model.ts             # Sequelize/TypeORM model
│   │   └── FormVersion.model.ts
│   │
│   ├── routes/
│   │   ├── forms.routes.ts
│   │   └── processes.routes.ts
│   │
│   ├── middleware/
│   │   ├── auth.middleware.ts
│   │   └── validation.middleware.ts
│   │
│   └── utils/
│       ├── errors.ts
│       └── logger.ts
│
├── database/
│   ├── migrations/
│   │   └── 001_create_forms_table.sql
│   └── seeds/
│       └── initial_forms.sql
│
├── config/
│   ├── database.ts
│   └── app.ts
│
├── tests/
│   ├── controllers/
│   └── services/
│
├── .env.example
├── docker-compose.yml
├── Dockerfile
├── package.json
├── tsconfig.json
└── README.md
```

#### 3.3.1 Archivo: database/migrations/001_create_forms_table.sql

```sql
-- Forms table
CREATE TABLE bizuit_forms (
    id SERIAL PRIMARY KEY,
    form_name VARCHAR(100) UNIQUE NOT NULL,
    package_name VARCHAR(200) UNIQUE NOT NULL,
    current_version VARCHAR(20) NOT NULL,
    process_name VARCHAR(100) NOT NULL,
    description TEXT,
    author VARCHAR(100),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'deprecated', 'beta')),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_form_name (form_name),
    INDEX idx_process_name (process_name),
    INDEX idx_status (status)
);

-- Form versions table (historial)
CREATE TABLE bizuit_form_versions (
    id SERIAL PRIMARY KEY,
    form_id INTEGER REFERENCES bizuit_forms(id) ON DELETE CASCADE,
    version VARCHAR(20) NOT NULL,
    source_code TEXT,
    compiled_url TEXT,
    npm_url TEXT,
    author VARCHAR(100),
    commit_hash VARCHAR(40),
    changelog TEXT,
    published_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(form_id, version),
    INDEX idx_form_version (form_id, version)
);

-- Form usage stats
CREATE TABLE bizuit_form_usage (
    id SERIAL PRIMARY KEY,
    form_id INTEGER REFERENCES bizuit_forms(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    load_count INTEGER DEFAULT 0,
    submit_count INTEGER DEFAULT 0,
    error_count INTEGER DEFAULT 0,
    avg_load_time_ms INTEGER,
    UNIQUE(form_id, date)
);

-- Triggers para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_bizuit_forms_updated_at
    BEFORE UPDATE ON bizuit_forms
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

#### 3.3.2 Archivo: src/controllers/forms.controller.ts

```typescript
import { Request, Response } from 'express'
import { FormStorageService } from '../services/form-storage.service'
import { GitHubService } from '../services/github.service'

const formStorage = new FormStorageService()
const github = new GitHubService()

/**
 * GET /api/forms
 * Lista todos los forms disponibles
 */
export async function listForms(req: Request, res: Response) {
  try {
    const { status, process } = req.query

    const filters: any = {}
    if (status) filters.status = status
    if (process) filters.processName = process

    const forms = await formStorage.list(filters)

    res.json(forms)

  } catch (err: any) {
    console.error('[FormsController] Error listing forms:', err)
    res.status(500).json({ error: err.message })
  }
}

/**
 * GET /api/forms/:formName
 * Obtiene un form específico
 */
export async function getForm(req: Request, res: Response) {
  try {
    const { formName } = req.params

    const form = await formStorage.findByName(formName)

    if (!form) {
      return res.status(404).json({ error: 'Form not found' })
    }

    res.json(form)

  } catch (err: any) {
    console.error('[FormsController] Error getting form:', err)
    res.status(500).json({ error: err.message })
  }
}

/**
 * GET /api/forms/:formName/metadata
 * Obtiene metadata de un form (usado por runtime app)
 */
export async function getFormMetadata(req: Request, res: Response) {
  try {
    const { formName } = req.params

    const form = await formStorage.findByName(formName)

    if (!form) {
      return res.status(404).json({ error: 'Form not found' })
    }

    // Return solo lo necesario para el runtime
    const metadata = {
      formName: form.formName,
      packageName: form.packageName,
      version: form.currentVersion,
      processName: form.processName,
      description: form.description,
      author: form.author,
      lastModified: form.updatedAt,
      status: form.status
    }

    res.json(metadata)

  } catch (err: any) {
    console.error('[FormsController] Error getting metadata:', err)
    res.status(500).json({ error: err.message })
  }
}

/**
 * POST /api/forms
 * Crea o actualiza un form
 */
export async function createOrUpdateForm(req: Request, res: Response) {
  try {
    const { formName, packageName, version, processName, sourceCode, description, author } = req.body

    // Validaciones
    if (!formName || !packageName || !version || !processName) {
      return res.status(400).json({
        error: 'Missing required fields: formName, packageName, version, processName'
      })
    }

    // Check if exists
    let form = await formStorage.findByName(formName)

    if (form) {
      // Update existing
      form = await formStorage.update(formName, {
        packageName,
        currentVersion: version,
        processName,
        description,
        author
      })
    } else {
      // Create new
      form = await formStorage.create({
        formName,
        packageName,
        currentVersion: version,
        processName,
        description,
        author,
        status: 'active'
      })
    }

    // Save version history
    if (sourceCode) {
      await formStorage.createVersion({
        formId: form.id,
        version,
        sourceCode,
        author,
        npmUrl: `https://www.npmjs.com/package/${packageName}/v/${version}`
      })
    }

    res.json(form)

  } catch (err: any) {
    console.error('[FormsController] Error creating/updating form:', err)
    res.status(500).json({ error: err.message })
  }
}

/**
 * GET /api/forms/:formName/source
 * Obtiene el código fuente de un form (desde GitHub)
 */
export async function getFormSource(req: Request, res: Response) {
  try {
    const { formName } = req.params

    const form = await formStorage.findByName(formName)

    if (!form) {
      return res.status(404).json({ error: 'Form not found' })
    }

    // Fetch from GitHub
    const sourceCode = await github.getFormSource(formName)

    res.type('text/plain').send(sourceCode)

  } catch (err: any) {
    console.error('[FormsController] Error getting source:', err)
    res.status(500).json({ error: err.message })
  }
}

/**
 * POST /api/forms/:formName/publish
 * Trigger manual de publicación (sin pasar por GitHub)
 */
export async function publishForm(req: Request, res: Response) {
  try {
    const { formName } = req.params
    const { sourceCode, version, commitMessage } = req.body

    if (!sourceCode) {
      return res.status(400).json({ error: 'Missing sourceCode' })
    }

    // Push to GitHub
    await github.commitFormChange(formName, sourceCode, commitMessage || `Update ${formName}`)

    // GitHub Actions se encargará del resto

    res.json({
      success: true,
      message: 'Form published. GitHub Actions will build and deploy.',
      formName,
      version
    })

  } catch (err: any) {
    console.error('[FormsController] Error publishing form:', err)
    res.status(500).json({ error: err.message })
  }
}

/**
 * DELETE /api/forms/:formName
 * Marca un form como deprecated (no lo elimina)
 */
export async function deprecateForm(req: Request, res: Response) {
  try {
    const { formName } = req.params

    await formStorage.update(formName, { status: 'deprecated' })

    res.json({
      success: true,
      message: `Form "${formName}" marked as deprecated`
    })

  } catch (err: any) {
    console.error('[FormsController] Error deprecating form:', err)
    res.status(500).json({ error: err.message })
  }
}
```

#### 3.3.3 Archivo: src/services/form-storage.service.ts

```typescript
import { Pool } from 'pg'

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD
})

export interface Form {
  id: number
  formName: string
  packageName: string
  currentVersion: string
  processName: string
  description?: string
  author?: string
  status: 'active' | 'deprecated' | 'beta'
  metadata: any
  createdAt: Date
  updatedAt: Date
}

export interface FormVersion {
  id: number
  formId: number
  version: string
  sourceCode?: string
  compiledUrl?: string
  npmUrl?: string
  author?: string
  commitHash?: string
  changelog?: string
  publishedAt: Date
}

export class FormStorageService {

  /**
   * Lista forms con filtros opcionales
   */
  async list(filters: any = {}): Promise<Form[]> {
    const conditions: string[] = []
    const values: any[] = []

    if (filters.status) {
      conditions.push(`status = $${values.length + 1}`)
      values.push(filters.status)
    }

    if (filters.processName) {
      conditions.push(`process_name = $${values.length + 1}`)
      values.push(filters.processName)
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

    const query = `
      SELECT * FROM bizuit_forms
      ${whereClause}
      ORDER BY form_name ASC
    `

    const result = await pool.query(query, values)
    return result.rows.map(row => this.mapRow(row))
  }

  /**
   * Busca un form por nombre
   */
  async findByName(formName: string): Promise<Form | null> {
    const query = `
      SELECT * FROM bizuit_forms
      WHERE form_name = $1
    `

    const result = await pool.query(query, [formName])

    if (result.rows.length === 0) {
      return null
    }

    return this.mapRow(result.rows[0])
  }

  /**
   * Crea un nuevo form
   */
  async create(data: Partial<Form>): Promise<Form> {
    const query = `
      INSERT INTO bizuit_forms (
        form_name, package_name, current_version, process_name,
        description, author, status, metadata
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `

    const values = [
      data.formName,
      data.packageName,
      data.currentVersion,
      data.processName,
      data.description || null,
      data.author || null,
      data.status || 'active',
      JSON.stringify(data.metadata || {})
    ]

    const result = await pool.query(query, values)
    return this.mapRow(result.rows[0])
  }

  /**
   * Actualiza un form existente
   */
  async update(formName: string, data: Partial<Form>): Promise<Form> {
    const updates: string[] = []
    const values: any[] = []

    if (data.packageName) {
      updates.push(`package_name = $${values.length + 1}`)
      values.push(data.packageName)
    }

    if (data.currentVersion) {
      updates.push(`current_version = $${values.length + 1}`)
      values.push(data.currentVersion)
    }

    if (data.processName) {
      updates.push(`process_name = $${values.length + 1}`)
      values.push(data.processName)
    }

    if (data.description !== undefined) {
      updates.push(`description = $${values.length + 1}`)
      values.push(data.description)
    }

    if (data.author) {
      updates.push(`author = $${values.length + 1}`)
      values.push(data.author)
    }

    if (data.status) {
      updates.push(`status = $${values.length + 1}`)
      values.push(data.status)
    }

    values.push(formName)

    const query = `
      UPDATE bizuit_forms
      SET ${updates.join(', ')}
      WHERE form_name = $${values.length}
      RETURNING *
    `

    const result = await pool.query(query, values)
    return this.mapRow(result.rows[0])
  }

  /**
   * Crea una entrada en el historial de versiones
   */
  async createVersion(data: Partial<FormVersion>): Promise<FormVersion> {
    const query = `
      INSERT INTO bizuit_form_versions (
        form_id, version, source_code, compiled_url, npm_url,
        author, commit_hash, changelog
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `

    const values = [
      data.formId,
      data.version,
      data.sourceCode || null,
      data.compiledUrl || null,
      data.npmUrl || null,
      data.author || null,
      data.commitHash || null,
      data.changelog || null
    ]

    const result = await pool.query(query, values)
    return result.rows[0]
  }

  /**
   * Obtiene historial de versiones de un form
   */
  async getVersionHistory(formId: number): Promise<FormVersion[]> {
    const query = `
      SELECT * FROM bizuit_form_versions
      WHERE form_id = $1
      ORDER BY published_at DESC
    `

    const result = await pool.query(query, [formId])
    return result.rows
  }

  /**
   * Map database row to Form object
   */
  private mapRow(row: any): Form {
    return {
      id: row.id,
      formName: row.form_name,
      packageName: row.package_name,
      currentVersion: row.current_version,
      processName: row.process_name,
      description: row.description,
      author: row.author,
      status: row.status,
      metadata: row.metadata,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }
  }
}
```

---

## 4. Fases de Implementación

Debido a la extensión del documento, voy a continuar en un segundo archivo con las fases restantes.

---

**CONTINÚA EN PARTE 2...**

> Este documento es la Parte 1 de 2. La Parte 2 incluirá:
> - Fases 4-8 detalladas
> - Código de referencia completo
> - Guías de desarrollo
> - Cronograma
> - Riesgos y métricas

**Ubicación Parte 2:** `docs/architecture/DYNAMIC_FORMS_IMPLEMENTATION_PLAN_PART2.md`
