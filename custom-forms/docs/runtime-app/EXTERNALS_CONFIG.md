# BIZUIT Custom Forms - Externals Configuration

## 📦 **Global Dependencies Exposed**

Los siguientes packages están expuestos globalmente por el `ReactGlobalExposer` component y **NO deben ser bundleados** en el código compilado de los formularios.

---

## 🌐 **Packages Disponibles**

### **1. React Core**
```typescript
// window.React
import React from 'react'
import { useState, useEffect, useMemo } from 'react'
```

### **2. ReactDOM**
```typescript
// window.ReactDOM
import ReactDOM from 'react-dom'
```

### **3. BIZUIT Form SDK**
```typescript
// window.BizuitFormSDK
import { useBizuitForm, FormProvider, ... } from '@tyconsa/bizuit-form-sdk'
```

### **4. BIZUIT UI Components**
```typescript
// window.BizuitUIComponents
import { Button, Input, DataGrid, ... } from '@tyconsa/bizuit-ui-components'
```

---

## ⚙️ **Configuración del Compilador**

### **Webpack Configuration**

```javascript
// webpack.config.js
module.exports = {
  // ... otras configuraciones

  externals: {
    // React Core
    'react': 'React',
    'react-dom': 'ReactDOM',

    // BIZUIT Packages
    '@tyconsa/bizuit-form-sdk': 'BizuitFormSDK',
    '@tyconsa/bizuit-ui-components': 'BizuitUIComponents',
  },

  output: {
    // Importante: debe ser ES Module
    library: {
      type: 'module',
    },
    environment: {
      module: true,
    },
  },

  experiments: {
    outputModule: true,
  },
}
```

### **ESBuild Configuration**

```javascript
// esbuild.config.js
import esbuild from 'esbuild'

await esbuild.build({
  entryPoints: ['src/index.tsx'],
  bundle: true,
  format: 'esm', // ES Module format

  external: [
    'react',
    'react-dom',
    '@tyconsa/bizuit-form-sdk',
    '@tyconsa/bizuit-ui-components',
  ],

  // Mapeo de globals
  define: {
    'process.env.NODE_ENV': '"production"',
  },

  // Output banner para mapear imports
  banner: {
    js: `
      const React = window.React;
      const ReactDOM = window.ReactDOM;
      const BizuitFormSDK = window.BizuitFormSDK;
      const BizuitUIComponents = window.BizuitUIComponents;
    `,
  },
})
```

### **Vite Configuration**

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

  build: {
    lib: {
      entry: 'src/index.tsx',
      formats: ['es'],
      fileName: 'form',
    },

    rollupOptions: {
      external: [
        'react',
        'react-dom',
        '@tyconsa/bizuit-form-sdk',
        '@tyconsa/bizuit-ui-components',
      ],

      output: {
        globals: {
          'react': 'React',
          'react-dom': 'ReactDOM',
          '@tyconsa/bizuit-form-sdk': 'BizuitFormSDK',
          '@tyconsa/bizuit-ui-components': 'BizuitUIComponents',
        },
      },
    },
  },
})
```

---

## 📝 **Ejemplo de Código Compilado Correcto**

### **Código Fuente del Form:**
```typescript
// src/VacationRequestForm.tsx
import React, { useState } from 'react'
import { Button, Input, DatePicker } from '@tyconsa/bizuit-ui-components'
import { useBizuitForm } from '@tyconsa/bizuit-form-sdk'

export default function VacationRequestForm() {
  const { submitForm } = useBizuitForm()
  const [startDate, setStartDate] = useState('')

  return (
    <div>
      <Input
        label="Fecha de inicio"
        value={startDate}
        onChange={(e) => setStartDate(e.target.value)}
      />
      <Button onClick={() => submitForm({ startDate })}>
        Enviar Solicitud
      </Button>
    </div>
  )
}
```

### **Código Compilado (resultado esperado):**
```javascript
// dist/VacationRequestForm.js

// ✅ CORRECTO: Usa las variables globales
const React = window.React;
const { useState } = window.React;
const { Button, Input, DatePicker } = window.BizuitUIComponents;
const { useBizuitForm } = window.BizuitFormSDK;

export default function VacationRequestForm() {
  const { submitForm } = useBizuitForm()
  const [startDate, setStartDate] = useState('')

  return React.createElement(
    'div',
    null,
    React.createElement(Input, {
      label: 'Fecha de inicio',
      value: startDate,
      onChange: (e) => setStartDate(e.target.value)
    }),
    React.createElement(Button, {
      onClick: () => submitForm({ startDate })
    }, 'Enviar Solicitud')
  )
}
```

### **❌ INCORRECTO (si NO se configuran los externals):**
```javascript
// dist/VacationRequestForm.js

// ❌ MAL: Bundlea todo React (~130KB)
var React = /* ... código completo de React ... */

// ❌ MAL: Bundlea todos los componentes UI (~500KB)
var BizuitUIComponents = /* ... código completo de todos los componentes ... */

// Resultado: archivo gigante de ~1MB+ en vez de ~10KB
```

---

## 🔍 **Verificación**

### **Verificar que los globals están disponibles:**

Abre la consola del navegador en `http://localhost:3001` y ejecuta:

```javascript
// Debe devolver el objeto React
console.log(window.React)

// Debe devolver el objeto ReactDOM
console.log(window.ReactDOM)

// Debe devolver el SDK de BIZUIT
console.log(window.BizuitFormSDK)

// Debe devolver los componentes UI
console.log(window.BizuitUIComponents)

// Debe mostrar true
console.log(window.__REACT_READY__)
```

### **Salida esperada:**

```
[ReactGlobalExposer] ✅ React exposed globally
[ReactGlobalExposer] React version: 18.3.1
[ReactGlobalExposer] ✅ BIZUIT packages exposed globally
[ReactGlobalExposer] - BizuitFormSDK: 15 exports
[ReactGlobalExposer] - BizuitUIComponents: 42 exports
```

---

## 📊 **Beneficios de Usar Externals**

| Aspecto | Sin Externals | Con Externals | Mejora |
|---------|---------------|---------------|--------|
| **Tamaño del form** | ~1.2 MB | ~15 KB | **-99%** |
| **Tiempo de carga** | 800ms | 50ms | **-94%** |
| **Singleton React** | ❌ Múltiples instancias | ✅ Una instancia | ✅ |
| **Cache browser** | ❌ No reutilizable | ✅ Compartido | ✅ |
| **Tiempo de compilación** | 45s | 5s | **-89%** |

---

## 🚨 **Problemas Comunes**

### **1. "React is not defined"**

**Causa:** El form se cargó antes que el `ReactGlobalExposer`

**Solución:** Asegurar que `ReactGlobalExposer` está en el root layout:
```typescript
// app/layout.tsx
import { ReactGlobalExposer } from '@/components/ReactGlobalExposer'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ReactGlobalExposer /> {/* ← Debe estar ANTES de children */}
        {children}
      </body>
    </html>
  )
}
```

### **2. "Hooks can only be called inside a function component"**

**Causa:** Múltiples instancias de React (no se configuraron los externals)

**Solución:** Verificar que el webpack/esbuild config tiene los externals correctos

### **3. "Cannot find module 'react'"**

**Causa:** El compilador está intentando resolver React en vez de dejarlo como external

**Solución:** Verificar que `external: ['react']` está en la config

---

## 📚 **Referencias**

- [Webpack Externals](https://webpack.js.org/configuration/externals/)
- [ESBuild External](https://esbuild.github.io/api/#external)
- [Vite Build Library Mode](https://vitejs.dev/guide/build.html#library-mode)
- [React Rules of Hooks](https://react.dev/warnings/invalid-hook-call-warning)

---

*Última actualización: 2025-11-18*
*Versión: 1.0*
