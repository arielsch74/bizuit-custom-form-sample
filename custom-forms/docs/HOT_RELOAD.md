# 🔥 Hot Reload Demo - Custom Forms Runtime

Este documento explica cómo probar el mecanismo de **hot reload** para forms dinámicos.

## 🎯 ¿Qué es Hot Reload?

Hot reload permite que cuando se publique una nueva versión de un form en la base de datos, el frontend lo detecte automáticamente y lo recargue **sin necesidad de refresh manual del navegador**.

## 🏗️ Arquitectura

```
┌─────────────────┐
│ GitHub Actions  │
│ (Future)        │
│                 │
│ 1. Compilar TSX │
│    con esbuild  │
│ 2. INSERT INTO  │
│    CustomForms  │
└────────┬────────┘
         │
         ▼
┌──────────────────────┐
│  SQL Server (Mock)   │
│                      │
│  CustomFormVersions  │
│  - FormName          │
│  - CurrentVersion    │
│  - CompiledCode      │
│  - UpdatedAt         │
└──────────┬───────────┘
           │
           ▼
  ┌────────────────────┐
  │  Frontend Polling  │
  │                    │
  │  Every 10s:        │
  │  GET /versions     │
  │                    │
  │  Detect change?    │
  │  → Invalidate      │
  │  → Reload form     │
  └────────────────────┘
```

## 🧪 Cómo Probar

### 1. Abrir el form en el navegador

```bash
# Asegurarse que el dev server esté corriendo
npm run dev
```

Navegar a: [http://localhost:3000/form/aprobacion-gastos](http://localhost:3000/form/aprobacion-gastos)

### 2. Abrir la consola del navegador

En la consola deberías ver logs como:

```
[Hot Reload] 🚀 Monitoring aprobacion-gastos for updates (checking every 10000ms)
[Hot Reload] ✅ aprobacion-gastos is up to date: 1.0.0
```

Esto confirma que el polling está activo.

### 3. Simular publicación de nueva versión

En otra terminal (mientras el form está abierto en el navegador), ejecutar:

```bash
curl -X POST http://localhost:3000/api/custom-forms/versions \
  -H "Content-Type: application/json" \
  -d '{"formName":"aprobacion-gastos","version":"1.0.1"}'
```

### 4. Observar el hot reload en acción

**En la consola del navegador** deberías ver:

```
[Hot Reload] 🔥 New version detected for aprobacion-gastos: 1.0.0 → 1.0.1
[Hot Reload] Invalidando cache y recargando form...
[Form Loader] 🗑️  Invalidated cache for: aprobacion-gastos (1 entries)
[Dynamic Form Page] Loading form: aprobacion-gastos
[Form Loader] Loading form: aprobacion-gastos
[Form Loader] ✅ Fetched aprobacion-gastos@1.0.1 (...)
```

**En la UI** deberías ver:

- Una notificación verde en la esquina superior derecha: "🔥 Nueva versión cargada: 1.0.1"
- El form se recarga automáticamente con la nueva versión

## 📊 Endpoints del Mock API

### GET /api/custom-forms/versions

Retorna las versiones actuales de todos los forms (usado por polling):

```bash
curl http://localhost:3000/api/custom-forms/versions
```

Respuesta:
```json
{
  "aprobacion-gastos": {
    "version": "1.0.0",
    "updatedAt": "2025-01-10T10:00:00Z"
  },
  "solicitud-vacaciones": {
    "version": "1.0.0",
    "updatedAt": "2025-01-10T11:00:00Z"
  },
  "onboarding-empleado": {
    "version": "1.0.0",
    "updatedAt": "2025-01-10T12:00:00Z"
  }
}
```

### POST /api/custom-forms/versions

Simula la publicación de una nueva versión (en producción esto lo haría GitHub Actions):

```bash
curl -X POST http://localhost:3000/api/custom-forms/versions \
  -H "Content-Type: application/json" \
  -d '{
    "formName": "aprobacion-gastos",
    "version": "2.0.0"
  }'
```

Respuesta:
```json
{
  "success": true,
  "formName": "aprobacion-gastos",
  "version": "2.0.0",
  "message": "Form aprobacion-gastos published with version 2.0.0"
}
```

## ⚙️ Configuración

El hook de hot reload acepta las siguientes opciones:

```typescript
useFormHotReload({
  formName: 'aprobacion-gastos',
  currentVersion: '1.0.0',
  pollingInterval: 10000, // 10 segundos (ajustable)
  enabled: true,           // activar/desactivar
  onVersionChange: (newVersion) => {
    // Callback cuando detecta cambio
  }
})
```

## 🔍 Debugging

Para ver los logs del polling en la consola:

1. Filtrar por `[Hot Reload]`
2. Verificar que el interval esté corriendo cada 10 segundos
3. Cuando publiques una nueva versión, deberías ver el log de detección

## 🚀 Producción

En producción, el flujo sería:

1. **Developer** hace commit de un nuevo form en TypeScript/JSX
2. **GitHub Actions** detecta el cambio
3. **GitHub Actions** compila el form con esbuild
4. **GitHub Actions** inserta el código compilado en `CustomFormVersions`
5. **Todos los frontends activos** detectan la nueva versión via polling
6. **Forms se recargan automáticamente** sin intervención del usuario

## 🎨 Personalización

Para cambiar la frecuencia del polling, editar:

[custom-forms-showcase/app/form/[formName]/page.tsx:72](custom-forms-showcase/app/form/[formName]/page.tsx#L72)

```typescript
pollingInterval: 5000, // 5 segundos en lugar de 10
```

Para desactivar el hot reload temporalmente:

```typescript
enabled: false,
```

## ✅ Validación Completa

Hemos validado:

- ✅ Mock API que simula SQL Server
- ✅ Dynamic form loading con blob URLs
- ✅ esbuild compilation del código
- ✅ Forms completamente interactivos
- ✅ **Hot reload funcionando** - detecta cambios y recarga automáticamente

**El frontend está 100% completo y validado!** 🎉
