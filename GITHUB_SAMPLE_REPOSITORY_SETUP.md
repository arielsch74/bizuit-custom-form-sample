# GitHub Sample Repository - Bizuit Custom Forms

## Resumen

Se creó un repositorio de ejemplo completo que muestra cómo los clientes pueden gestionar sus custom forms con compilación y publicación automática a la base de datos.

**Repositorio:** https://github.com/arielsch74/bizuit-custom-form-sample

---

## 🎯 Objetivo

Crear un repositorio "template" que los clientes puedan clonar/fork para gestionar sus propios custom forms con un workflow completamente automatizado:

1. **Desarrollador escribe** un form en TypeScript/JSX
2. **Hace commit** del form al repositorio
3. **GitHub Actions automáticamente**:
   - Compila el form con esbuild
   - Publica el código compilado a la base de datos SQL Server
4. **La aplicación Bizuit** detecta la nueva versión vía hot reload
5. **El form está disponible** sin redeployar la aplicación

---

## 📁 Estructura del Repositorio

```
bizuit-custom-form-sample/
├── .github/
│   └── workflows/
│       └── compile-and-publish.yml   # GitHub Actions workflow (ver abajo)
├── forms/                             # Forms del cliente
│   ├── employee-leave-request.tsx    # Ejemplo 1: Solicitud de licencia
│   └── purchase-order-approval.tsx   # Ejemplo 2: Orden de compra
├── scripts/
│   ├── compile-forms.js              # Compila forms con esbuild
│   └── publish-forms.js              # Publica a API Bizuit
├── dist/                             # Output compilado (gitignored)
├── package.json                      # Dependencies y scripts
├── .gitignore
└── README.md                         # Instrucciones completas
```

---

## 📝 Archivos Creados

### 1. Forms de Ejemplo

#### `forms/employee-leave-request.tsx`
Form completo para solicitud de licencias con:
- Validaciones en tiempo real
- Campos: nombre, ID empleado, tipo de licencia, fechas, motivo, contacto emergencia
- Select dropdown con tipos de licencia
- Validación de fecha (fin > inicio)
- Integración con BizuitCard, Button, Input, Textarea, Select

#### `forms/purchase-order-approval.tsx`
Form de órdenes de compra con:
- Items dinámicos (agregar/quitar)
- Cálculo automático de totales
- Campos: vendor, fecha orden, fecha entrega, departamento, urgencia
- Grid responsive para items
- Total general calculado

### 2. Scripts de Compilación

#### `scripts/compile-forms.js`
```javascript
// Características:
- Escanea carpeta forms/ buscando .tsx, .ts, .jsx
- Compila cada form con esbuild:
  - Output: ESM format
  - External: react, react-dom
  - JSX automatic
  - Minificado
- Modo watch para desarrollo
- Resumen de compilación (éxitos/fallos)
```

#### `scripts/publish-forms.js`
```javascript
// Características:
- Lee archivos compilados de dist/
- Publica a POST /api/custom-forms/versions
- Variables de entorno:
  - BIZUIT_API_URL: URL de la API
  - BIZUIT_API_TOKEN: Token de autenticación
- Auto-genera versión con timestamp
- Resumen de publicación
```

### 3. GitHub Actions Workflow

**Archivo:** `.github/workflows/compile-and-publish.yml`

```yaml
name: Compile and Publish Custom Forms

on:
  push:
    branches:
      - main
      - master
    paths:
      - 'forms/**'
  workflow_dispatch:

jobs:
  compile-and-publish:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Compile forms
        run: npm run build

      - name: Publish forms to API
        env:
          BIZUIT_API_URL: ${{ secrets.BIZUIT_API_URL }}
          BIZUIT_API_TOKEN: ${{ secrets.BIZUIT_API_TOKEN }}
          GITHUB_ACTOR: ${{ github.actor }}
        run: npm run publish:forms

      - name: Upload compiled forms as artifacts
        uses: actions/upload-artifact@v4
        with:
          name: compiled-forms
          path: dist/
          retention-days: 30
```

**Triggers:**
- Push a `main` o `master` que modifique `forms/**`
- Manual via workflow_dispatch

**Secrets requeridos:**
- `BIZUIT_API_URL`: https://api.cliente.com
- `BIZUIT_API_TOKEN`: Token JWT o API key

### 4. Package.json

```json
{
  "name": "bizuit-custom-form-sample",
  "scripts": {
    "build": "node scripts/compile-forms.js",
    "build:watch": "node scripts/compile-forms.js --watch",
    "publish:forms": "node scripts/publish-forms.js"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "esbuild": "^0.19.0",
    "typescript": "^5.3.0"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  }
}
```

### 5. README.md

Documentación completa con:
- Overview del sistema
- Estructura del repositorio
- Getting started paso a paso
- Configuración de GitHub Secrets
- Ejemplo de estructura de form
- UI components disponibles
- Workflow de desarrollo (local y producción)
- Troubleshooting

---

## 🚀 Flujo de Trabajo para Clientes

### Configuración Inicial

1. **Clonar o Fork el repositorio**
```bash
git clone https://github.com/arielsch74/bizuit-custom-form-sample.git
cd bizuit-custom-form-sample
npm install
```

2. **Configurar GitHub Secrets**
   - Settings → Secrets and variables → Actions
   - Agregar:
     - `BIZUIT_API_URL`: https://api.miempresa.com
     - `BIZUIT_API_TOKEN`: su_token_aqui

3. **Crear el workflow manualmente**
   - Copiar [.github/workflows/compile-and-publish.yml](#3-github-actions-workflow) al repo
   - Commit y push

### Desarrollo de Forms

1. **Crear nuevo form**
```bash
# Crear archivo en forms/
touch forms/my-custom-form.tsx
```

2. **Escribir el form** (ver ejemplos en repo)

3. **Compilar localmente**
```bash
npm run build
# Revisa dist/ para ver output
```

4. **Desarrollo con watch**
```bash
npm run build:watch
# Recompila automáticamente al guardar
```

5. **Commit y push**
```bash
git add forms/my-custom-form.tsx
git commit -m "Add my custom form"
git push origin main
```

6. **GitHub Actions automáticamente:**
   - ✅ Compila el form
   - ✅ Publica a la BD
   - ✅ Available via hot reload

### Publicación Manual (opcional)

```bash
# Compilar
npm run build

# Publicar (requiere env vars)
export BIZUIT_API_URL="https://api.miempresa.com"
export BIZUIT_API_TOKEN="token"
npm run publish:forms
```

---

## 🔧 Integración con Backend

El script `publish-forms.js` hace POST a:

```
POST /api/custom-forms/versions
Authorization: Bearer {BIZUIT_API_TOKEN}
Content-Type: application/json

{
  "formName": "employee-leave-request",
  "version": "2025-11-11-1699999999",
  "compiledCode": "import React from 'react'...",
  "publishedBy": "github-actor-name"
}
```

El backend (C# API creado anteriormente) debe:
1. Recibir el request
2. Validar el token
3. Insertar en `CustomFormVersions`
4. Actualizar `CurrentVersion` en `CustomForms`
5. Marcar `IsCurrent = 1` en la nueva versión

---

## 🌊 Hot Reload en la Aplicación

La aplicación frontend (Next.js) usa el hook `useFormHotReload`:

```typescript
// Polling cada 30 segundos
const versions = await fetch('/api/custom-forms/versions', {
  cache: 'no-store'
});

// Compara versiones
if (versions[formName] !== currentVersion) {
  // Recargar form
  reloadForm(formName);
}
```

---

## ⚠️ Nota Importante: GitHub Workflow

**El workflow NO pudo ser pusheado directamente** porque el token de GitHub CLI no tiene scope `workflow`.

**Solución:** El cliente debe crear manualmente el archivo `.github/workflows/compile-and-publish.yml` con el contenido mostrado arriba.

**Alternativa:** Se puede copiar el archivo del directorio temporal:

```bash
# El workflow está guardado aquí:
# /tmp/bizuit-custom-form-sample/.github/workflows/compile-and-publish.yml
```

---

## 📊 Ventajas de este Approach

1. **Separación de concerns**: Forms en repo separado del código principal
2. **Versionamiento**: Git history de todos los cambios a forms
3. **CI/CD automático**: No requiere intervención manual
4. **Hot reload**: Sin downtime ni redeployments
5. **Facilidad para clientes**: Workflow familiar (git push)
6. **Auditoría**: GitHub Actions logs de todas las publicaciones
7. **Rollback fácil**: Git revert + re-push
8. **Multi-developer**: Pull requests, code review, etc.

---

## 🎓 Ejemplo de Uso Real

```bash
# Día 1: Cliente configura repo
git clone https://github.com/arielsch74/bizuit-custom-form-sample.git
cd bizuit-custom-form-sample
npm install

# Configura secrets en GitHub
# BIZUIT_API_URL=https://api.acme.com
# BIZUIT_API_TOKEN=xyz123

# Día 2: Desarrollador crea form
touch forms/equipment-request.tsx
# Escribe el form...
git add forms/equipment-request.tsx
git commit -m "Add equipment request form"
git push origin main

# GitHub Actions:
# ✅ Form compiled
# ✅ Form published to DB
# ✅ Available in production

# Día 3: Usuario final abre Bizuit
# → Hot reload detecta nuevo form
# → Form cargado automáticamente
# → Listo para usar
```

---

## 📦 Archivos de Referencia

Todos los archivos están disponibles en:
- **Repositorio:** https://github.com/arielsch74/bizuit-custom-form-sample
- **Directorio local:** `/tmp/bizuit-custom-form-sample`

### Para copiar el workflow manualmente:

```bash
# Copiar desde el directorio temporal
cp -r /tmp/bizuit-custom-form-sample/.github /path/to/client/repo/
cd /path/to/client/repo
git add .github/
git commit -m "Add GitHub Actions workflow"
git push origin main
```

---

## 🔗 Links Relacionados

- **Database Scripts:** `/Users/arielschwindt/SourceCode/PlayGround/BizuitFormTemplate/database/`
- **Backend API Code:** `/Users/arielschwindt/SourceCode/PlayGround/BizuitFormTemplate/backend-api/`
- **Implementation Summary:** `/Users/arielschwindt/SourceCode/PlayGround/BizuitFormTemplate/IMPLEMENTATION_SUMMARY.md`
- **Hot Reload Demo:** `/Users/arielschwindt/SourceCode/PlayGround/BizuitFormTemplate/example/HOT_RELOAD_DEMO.md`

---

## ✅ Checklist para Clientes

- [ ] Fork/clonar repositorio sample
- [ ] Configurar GitHub Secrets (API_URL, API_TOKEN)
- [ ] Copiar workflow manualmente a `.github/workflows/`
- [ ] Push workflow al repo
- [ ] Verificar que GitHub Actions funciona
- [ ] Crear primer form de prueba
- [ ] Verificar compilación en Actions
- [ ] Verificar form en aplicación Bizuit
- [ ] Verificar hot reload funciona
- [ ] Documentar forms internos

---

**Fecha:** 2025-11-11
**Repositorio:** https://github.com/arielsch74/bizuit-custom-form-sample
**Estado:** ✅ Completado
