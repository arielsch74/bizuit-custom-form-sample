# Bizuit Custom Forms - Runtime App

Este directorio contiene la **Runtime App** del sistema de Custom Forms - una aplicación Next.js que carga formularios React dinámicamente desde múltiples monorepos.

## 🎯 Concepto

La Runtime App es **agnóstica** al origen de los forms:
- Los developers crean **N monorepos** independientes con sus forms
- Publican sus forms a **npm**
- Esta app los **carga dinámicamente** en runtime desde CDN

```
Developer 1 → @empresa-a/forms-monorepo → npm → CDN
Developer 2 → @hr-dept/forms          → npm → CDN
Developer 3 → @finanzas/processes     → npm → CDN
                                              ↓
                                     Runtime App carga todos
```

## 📁 Estructura

```
example/
├── app/
│   ├── form/[formName]/     # Ruta dinámica - carga cualquier form
│   ├── forms/               # Lista todos los forms disponibles
│   └── api/forms/reload/    # Webhook para recargar cache
│
├── lib/
│   ├── form-loader.ts       # Carga forms desde CDN (esm.sh, jsdelivr, unpkg)
│   └── form-registry.ts     # Registry de metadata de forms disponibles
│
└── components/
    ├── FormContainer.tsx    # Layout wrapper para forms
    ├── FormErrorBoundary.tsx # Error handling
    └── FormLoadingState.tsx  # Loading indicator
```

## 🚀 Cómo Funciona

### 1. Developer Publica un Form

El developer tiene su monorepo:

```bash
my-forms-monorepo/
├── forms/
│   ├── aprobacion-gastos/
│   │   ├── index.tsx
│   │   └── package.json  # @my-company/aprobacion-gastos@1.0.0
│   └── solicitud-vacaciones/
└── pnpm-workspace.yaml
```

Publica a npm:
```bash
cd forms/aprobacion-gastos
npm publish
```

### 2. Runtime App Lo Carga

Usuario navega a: `/form/aprobacion-gastos`

La app:
1. Consulta el **Form Registry** para obtener metadata
2. Usa el **Form Loader** para cargar desde CDN
3. Renderiza el form dentro de **FormContainer**

```typescript
// Automático - no requiere configuración
loadDynamicForm('@my-company/aprobacion-gastos', '1.0.0')
```

### 3. Flujo Completo

```
┌─────────────────┐
│  Developer      │
│  Publica form   │
│  a npm          │
└────────┬────────┘
         │
         ├─> GitHub Actions (opcional)
         │   POST /api/forms/reload
         │   (limpia cache)
         │
         v
┌─────────────────┐
│  Runtime App    │
│  /form/[name]   │
└────────┬────────┘
         │
         ├─> 1. Consulta Registry
         │      (metadata del form)
         │
         ├─> 2. Load desde CDN
         │      - Try esm.sh
         │      - Fallback jsdelivr
         │      - Fallback unpkg
         │
         └─> 3. Renderiza form
             (dentro de FormContainer)
```

## 🔌 CDN Fallback

El form loader intenta múltiples CDN para garantizar disponibilidad:

```typescript
const CDN_PROVIDERS = [
  'https://esm.sh',            // Primero
  'https://cdn.jsdelivr.net',  // Fallback
  'https://unpkg.com',         // Último recurso
]
```

Si un CDN falla, automáticamente prueba el siguiente.

## 📦 Form Registry

El registry mantiene metadata de todos los forms disponibles:

```typescript
interface FormMetadata {
  formName: string              // "aprobacion-gastos"
  packageName: string           // "@company/aprobacion-gastos"
  version: string               // "1.0.0"
  processName: string           // "AprobacionGastos"
  description: string
  author: string
  status: 'active' | 'inactive' | 'deprecated'
  createdAt: string
  updatedAt: string
}
```

**Fuentes de metadata:**
1. **API Backend** (cuando esté implementado): `GET /api/custom-forms`
2. **Configuración estática** (por ahora): hardcoded en el código

## 🎨 Componentes

### FormContainer

Wrapper que provee layout consistente a todos los forms:
- Header con nombre del form y versión
- Footer con links
- Badge de "Custom Form"

### FormErrorBoundary

Maneja errores de carga:
- Muestra mensaje de error user-friendly
- Botón de retry
- Troubleshooting tips

### FormLoadingState

Loading indicator mientras se carga el form desde CDN.

## 🔄 Webhook Auto-Reload

Endpoint: `POST /api/forms/reload`

Cuando un developer publica un form nuevo, GitHub Actions puede llamar este endpoint para:
1. Limpiar el cache del form
2. Recargar el registry
3. Actualizar la lista de forms

**Autenticación:**
```bash
curl -X POST https://your-app.com/api/forms/reload \
  -H "x-webhook-secret: your-secret" \
  -H "Content-Type: application/json" \
  -d '{
    "formName": "aprobacion-gastos",
    "packageName": "@company/aprobacion-gastos",
    "version": "1.0.1",
    "action": "published"
  }'
```

## ⚙️ Configuración

### Variables de Entorno

```bash
# .env.local

# URL del backend API (cuando esté implementado)
NEXT_PUBLIC_CUSTOM_FORMS_API_URL=https://api.example.com/api/custom-forms

# Webhook secret para auto-reload
WEBHOOK_SECRET=your-secret-here

# Bizuit BPM API (para que los forms funcionen)
NEXT_PUBLIC_BIZUIT_FORMS_API_URL=/api/bizuit
NEXT_PUBLIC_BIZUIT_DASHBOARD_API_URL=/api/bizuit
```

### Agregar Forms Estáticos (Desarrollo)

Mientras el backend no esté implementado, puedes agregar forms manualmente:

```typescript
// app/forms/page.tsx o app/form/[formName]/page.tsx

await initializeFormRegistry({
  staticForms: [
    {
      formName: 'aprobacion-gastos',
      packageName: '@company/aprobacion-gastos',
      version: '1.0.0',
      processName: 'AprobacionGastos',
      description: 'Form de aprobación de gastos',
      author: 'Tu Nombre',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
})
```

## 🧪 Testing

### Test Manual

1. **Navegar a lista de forms:**
   ```
   http://localhost:3000/forms
   ```

2. **Abrir un form específico:**
   ```
   http://localhost:3000/form/aprobacion-gastos
   ```

3. **Verificar webhook:**
   ```bash
   curl -X POST http://localhost:3000/api/forms/reload?secret=your-secret
   ```

### Simular Carga de Form Externo

```typescript
// En la consola del browser
import { loadDynamicForm } from '@/lib/form-loader'

const FormComponent = await loadDynamicForm(
  '@bizuit-forms/aprobacion-gastos',
  '1.0.0'
)
```

## 📚 Próximos Pasos

1. **Backend API** - Implementar CustomFormsController en .NET Core
2. **Database** - Crear tablas CustomForms, CustomFormVersions, CustomFormUsage
3. **GitHub Actions** - Workflow para auto-publish forms y llamar webhook
4. **Form Monorepo Template** - Template para que developers creen sus monorepos
5. **CLI Tool** - CLI para crear/publicar forms fácilmente

## 🔗 Referencias

- **Plan Completo**: `docs/architecture/DYNAMIC_FORMS_IMPLEMENTATION_PLAN.md`
- **Fase 3 (Esta implementación)**: `docs/architecture/DYNAMIC_FORMS_IMPLEMENTATION_PLAN_PART2.md` - Fase 3
- **Session Handoff**: `docs/SESSION_HANDOFF.md`

## 💡 Tips para Developers

**Para crear un form compatible:**

1. Tu form debe ser un componente React
2. Debe tener un `default export`
3. Debe usar el SDK de Bizuit (`@tyconsa/bizuit-form-sdk`)
4. Debe publicarse a npm como ESM module

```tsx
// forms/my-form/index.tsx
import { useBizuitSDK } from '@tyconsa/bizuit-form-sdk'
import { Card, Button } from '@tyconsa/bizuit-ui-components'

export default function MyForm() {
  const sdk = useBizuitSDK()

  const handleSubmit = async () => {
    await sdk.process.raiseEvent({
      eventName: 'MyProcess',
      parameters: { /* ... */ }
    })
  }

  return (
    <Card>
      <h1>My Custom Form</h1>
      <Button onClick={handleSubmit}>Submit</Button>
    </Card>
  )
}
```

**Publicar:**
```bash
npm run build
npm publish
```

**Usar en Runtime App:**
```
https://your-app.com/form/my-form
```

¡Eso es todo! El sistema es completamente agnóstico a tu monorepo. 🎉
