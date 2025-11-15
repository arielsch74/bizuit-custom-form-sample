# 🤖 Bizuit Form Generator Agent

Agente especializado de Claude Code para generar formularios de Bizuit BPM de manera conversacional.

## 🎯 ¿Qué es este agente?

Este agente te ayuda a crear **DOS tipos de formularios** para Bizuit BPM simplemente describiendo lo que necesitas en lenguaje natural:

### A) Bizuit SDK Forms (Tradicionales)
Formularios integrados en aplicaciones Next.js que usan `@tyconsa/bizuit-form-sdk`:
- ✅ Integración completa con Bizuit BPM
- ✅ Componentes UI avanzados (DynamicFormField, ProcessSuccessScreen, etc.)
- ✅ Auto-generación desde parámetros de proceso
- ✅ Manejo de locks y sesiones

### B) Custom Forms (Dinámicos/Standalone)
Formularios standalone que se compilan con esbuild y cargan dinámicamente:
- ✅ Deployables independientemente del Next.js app
- ✅ Versionados en SQL Server
- ✅ Carga dinámica sin redeployar la aplicación
- ✅ Compilados con GitHub Actions automáticamente

El agente entiende ambas arquitecturas, los componentes disponibles, y las mejores prácticas para cada tipo.

## 🚀 Cómo usar el agente

### Opción 1: Invocar el agente directamente

En Claude Code, escribe:

**Para Bizuit SDK Form:**
```
@bizuit-form-generator crea un formulario SDK para SolicitudVacaciones con:
- Campo empleado (textbox)
- Campo tipoVacacion (combo: Anuales, Enfermedad, Personales)
- Campo motivo (textarea)
- Botón "Comenzar" color primary
- Botón "Cancelar" color secondary
```

**Para Custom Form:**
```
@bizuit-form-generator crea un Custom Form para solicitud-soporte con:
- Campo categoria (select: software, hardware, red, acceso, otro)
- Campo prioridad (select con colores: baja, media, alta, crítica)
- Campo asunto (textbox)
- Campo descripcion (textarea)
- Campo archivo (file upload)
```

### Opción 2: Conversación natural

```
Tú: Necesito crear un formulario para iniciar un proceso de vacaciones

Agente: Entendido. ¿Qué campos necesitas en el formulario?

Tú: Campo de empleado, tipo de vacación en un combo, y motivo en textarea

Agente: Perfecto. ¿Qué opciones debe tener el combo de tipo de vacación?

Tú: Anuales, Enfermedad, y Personales

Agente: *Genera el código completo del formulario*
```

## 📋 Capacidades del Agente

### ✅ Tipos de Formularios

**1. Inicio de Proceso (Start Process)**
- Formularios con campos fijos
- Formularios dinámicos (auto-genera desde API de Bizuit)
- Con validación
- Con manejo de errores
- Con pantalla de éxito

**2. Continuación de Proceso (Continue Process)**
- Con bloqueo pesimista automático
- Carga de datos existentes
- Formulario editable
- Historial de actividades
- Auto-unlock al salir

**3. Solo Lectura (Readonly Display)**
- Mostrar datos en cards
- Historial completo
- Sin edición

### ✅ Features Incluidas

- ✅ TypeScript completo
- ✅ Validación con Zod
- ✅ Dark mode
- ✅ Responsive design
- ✅ Loading states
- ✅ Error handling
- ✅ Internacionalización (i18n)
- ✅ Tests unitarios (opcional)
- ✅ Accesibilidad (WCAG 2.1 AA)

### ✅ Componentes Disponibles

El agente conoce todos estos componentes y puede usarlos:

- `DynamicFormField` - Genera campos automáticamente
- `BizuitDataGrid` - Tablas con sorting, filtering, pagination
- `BizuitCombo` - Select con búsqueda y multiselect
- `BizuitDateTimePicker` - Selector de fecha/hora
- `BizuitSlider` - Control deslizante
- `BizuitFileUpload` - Carga de archivos con drag & drop
- `ProcessSuccessScreen` - Pantalla de éxito reutilizable
- `Button` - Botones con múltiples variantes

## 💡 Ejemplos de Uso

### Ejemplo 1: Bizuit SDK Form Simple

```
Tú: Crea un formulario SDK para SolicitudCompra con campos:
    - proveedor (textbox)
    - monto (number)
    - fecha (datepicker)
    - urgente (checkbox)
    - Botón "Enviar Solicitud"

Agente: *Genera app/solicitud-compra/page.tsx con todos los campos*
```

### Ejemplo 1B: Custom Form Simple

```
Tú: Crea un Custom Form para orden-compra con:
    - proveedor (textbox)
    - monto (number con formato moneda)
    - fecha (date input)
    - urgente (checkbox)

Agente: *Genera forms/orden-compra/src/index.tsx con export default*
       *Crea package.json con version 1.0.0*

       Para compilar: node build-form.js forms/orden-compra
       Para deployar: git commit && git push (GitHub Actions se encarga)
```

### Ejemplo 2: Formulario Dinámico desde API

```
Tú: Crea un formulario dinámico para el proceso AprobacionGastos

Agente: ¿Quieres que obtenga los parámetros desde la API de Bizuit?

Tú: Sí, API: https://test.bizuit.com/api, Token: xxxxx

Agente: *Llama a getProcessParameters()*
       *Encuentra 5 parámetros*
       *Genera formulario dinámico con DynamicFormField*
```

### Ejemplo 3: Continuar Proceso con Readonly

```
Tú: Crea un form para continuar AprobacionVacaciones que muestre:
    - Card readonly con: empleado, fechas, motivo
    - Combo aprobado (Sí, No)
    - Textarea observaciones
    - Botón "Aprobar" verde, "Rechazar" rojo

Agente: *Genera formulario con:*
       - Lock pesimista automático
       - Card con datos readonly
       - Campos editables
       - Botones personalizados
       - Success screen
```

### Ejemplo 4: Proyecto Completo desde Cero

```
Tú: Crea un proyecto Bizuit completo

Agente: ¿Qué nombre quieres para el proyecto?

Tú: sistema-rrhh

Agente: *Crea:*
       - next.config.js
       - tailwind.config.ts
       - tsconfig.json
       - package.json con dependencias
       - app/layout.tsx con providers
       - lib/config.ts
       - .env.example
       *Instala paquetes npm*

       ✅ Proyecto creado. ¿Quieres que genere un formulario ahora?
```

## 🎨 Personalización

### Estilos y Colores

```
Tú: El botón debe ser color azul #3B82F6 y el card con borde verde

Agente: *Genera código con estilos personalizados inline*
```

### Validación

```
Tú: El campo monto debe ser mayor a 1000 y menor a 100000

Agente: *Genera schema Zod con validaciones:*
       z.number().min(1000).max(100000)
```

### Layouts

```
Tú: Los campos deben estar en 2 columnas en desktop y 1 en mobile

Agente: *Genera grid responsive:*
       className="grid grid-cols-1 md:grid-cols-2 gap-4"
```

## 🛠️ Configuración

### Requisitos Previos

Para usar el agente en un proyecto existente:

1. Next.js 14+ con App Router
2. Node.js 18+
3. npm o yarn

El agente puede:
- ✅ Detectar si tienes proyecto Next.js
- ✅ Instalar paquetes automáticamente
- ✅ Configurar todo lo necesario
- ✅ O crear proyecto desde cero

### Variables de Entorno

El agente te recordará configurar:

```.env
NEXT_PUBLIC_BIZUIT_FORMS_API_URL=https://tu-servidor.com/api
NEXT_PUBLIC_BIZUIT_DASHBOARD_API_URL=https://tu-servidor.com/dashboard
```

## 📚 Conocimiento del Agente

El agente tiene conocimiento completo de:

1. **Documentación de Bizuit**
   - GETTING_STARTED.md completo
   - QUICK_REFERENCE.md
   - Ejemplos de código

2. **Componentes UI**
   - Props completos
   - Ejemplos de uso
   - Cuándo usar cada uno

3. **APIs de Bizuit**
   - Endpoints
   - Estructura de datos
   - Headers requeridos
   - Manejo de errores

4. **Patrones**
   - Estados de formulario
   - Lock/unlock
   - Error handling
   - Loading states

## 🎯 Modos de Operación

### Modo 1: Descriptivo (Manual)

Le dices exactamente qué quieres:
- Nombres de campos
- Tipos de componentes
- Opciones de combos
- Colores de botones
- Validaciones

### Modo 2: Automático (API)

Le das acceso a la API de Bizuit:
- Obtiene parámetros automáticamente
- Genera formulario dinámico
- Infiere tipos de campos
- Configura validaciones

### Modo 3: Híbrido

Combina ambos:
- Usa API para parámetros básicos
- Personalizas campos específicos
- Añades campos custom
- Modificas estilos

## 🐛 Troubleshooting

### El agente no encuentra los componentes

```
Tú: No encuentra BizuitCombo

Agente: Voy a verificar la instalación de paquetes...
       *Detecta que falta @tyconsa/bizuit-ui-components*
       ¿Quieres que lo instale?

Tú: Sí

Agente: *Ejecuta npm install @tyconsa/bizuit-ui-components*
```

### Errores de compilación

El agente puede:
- Leer errores de TypeScript
- Corregir imports
- Ajustar tipos
- Regenerar código

### El formulario no se ve bien

```
Tú: Los campos están muy juntos

Agente: Voy a añadir espaciado...
       *Añade className="space-y-4"*
```

## 📖 Documentación Adicional

- [Documentación Completa Bizuit](../example/docs/GETTING_STARTED.md)
- [Referencia Rápida](../example/docs/QUICK_REFERENCE.md)
- [Ejemplos de Código](../example/docs/examples/)
- [Paquetes npm](https://www.npmjs.com/package/@tyconsa/bizuit-form-sdk)

## 🤝 Contribuir

Si quieres mejorar el agente:

1. Modifica `.claude/agents/bizuit-form-generator.md`
2. Añade/modifica templates en `templates/`
3. Actualiza knowledge base en `knowledge/`

## 📝 Notas

- El agente NO modifica archivos existentes sin tu confirmación
- Siempre explica qué va a hacer antes de hacerlo
- Puedes pedirle que regenere código si no te gusta
- Puede generar tests unitarios si se lo pides

## 💬 Feedback

Si el agente no entiende algo o comete un error:

```
Tú: Esto no es lo que quería

Agente: Discul

pa, ¿puedes explicarme mejor qué necesitas?

Tú: [Explicas más claramente]

Agente: *Regenera con la información correcta*
```

---

## 🔧 Custom Forms - Detalles Técnicos

### Arquitectura

```
┌─────────────────────────────────────────────────┐
│ Developer                                       │
│ Crea form en: forms/mi-form/src/index.tsx       │
└────────┬────────────────────────────────────────┘
         │ git push
         ▼
┌─────────────────────────────────────────────────┐
│ GitHub Actions                                  │
│ - Detecta cambios en forms/                     │
│ - npm install + esbuild (globalReactPlugin)     │
│ - Upload to SQL Server (CustomFormVersions)     │
└────────┬────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────┐
│ SQL Server Database                             │
│ CustomForms + CustomFormVersions tables         │
└────────┬────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────┐
│ Runtime App (Next.js + FastAPI)                 │
│ Browser → Next.js API → FastAPI → SQL Server    │
│         → Compiled JS → Blob URL → import()     │
│         → Renderiza con window.React            │
└─────────────────────────────────────────────────┘
```

### Estructura de Archivos Custom Forms

**Repository de Forms:**
```
bizuit-custom-form-sample/
├── build-form.js              # Script esbuild universal
├── forms/
│   ├── solicitud-vacaciones/
│   │   ├── package.json       # { "name": "solicitud-vacaciones", "version": "1.0.0" }
│   │   └── src/
│   │       └── index.tsx      # export default function SolicitudVacacionesForm() {...}
│   ├── solicitud-soporte/
│   │   ├── package.json
│   │   └── src/
│   │       └── index.tsx
└── .github/
    └── workflows/
        └── deploy-forms.yml   # Auto-deploy on push
```

### ⚠️ Diferencias Clave: SDK vs Custom Forms

| Aspecto | SDK Forms | Custom Forms |
|---------|-----------|--------------|
| **Ubicación** | `app/mi-form/page.tsx` | `forms/mi-form/src/index.tsx` |
| **'use client'** | ✅ Requerido | ❌ No usar |
| **export default** | ✅ Sí | ✅ **CRÍTICO** - Sí |
| **Imports React** | `from 'react'` | `from 'react'` (se externalizan) |
| **Bizuit SDK** | ✅ `useBizuitSDK()` | ❌ No disponible |
| **UI Components** | ✅ `DynamicFormField`, etc. | ❌ Solo HTML/Tailwind |
| **Deployment** | `npm run build` | GitHub Actions + esbuild |
| **Loading** | Route estática | Dinámico via blob URL |
| **Versioning** | Git commits | SQL Server (CustomFormVersions) |
| **Build Tool** | Next.js | esbuild + globalReactPlugin |

### Build Configuration (Custom Forms)

**esbuild con globalReactPlugin:**
```javascript
// build-form.js - Plugin que reemplaza React con window.React
const globalReactPlugin = {
  name: 'global-react',
  setup(build) {
    build.onResolve({ filter: /^react$/ }, args => {
      return { path: args.path, namespace: 'global-react' }
    })
    build.onLoad({ filter: /.*/, namespace: 'global-react' }, args => {
      return { contents: 'module.exports = window.React', loader: 'js' }
    })
  }
}

// Compilación
esbuild.build({
  format: 'esm',              // ⚠️ CRÍTICO: ESM para export default
  plugins: [globalReactPlugin], // ⚠️ CRÍTICO: Externaliza React
  // ...
})
```

**¿Por qué ESM + globalReactPlugin?**
1. **format: 'esm'** - Preserva `export default` para `import()` dinámico
2. **globalReactPlugin** - Evita bundlear React (usa `window.React` del runtime)
3. **No typeof require** - ESM elimina código CommonJS innecesario
4. **Tamaño pequeño** - React no se bundlea, forms son ~5-10 KB

### Cuándo Usar Cada Tipo

**Usa SDK Forms si:**
- ✅ Integración completa con Bizuit BPM (locks, sessions, events)
- ✅ Auto-generación desde process parameters
- ✅ Necesitas ProcessSuccessScreen, DynamicFormField
- ✅ Form es parte de flujo de aplicación compleja

**Usa Custom Forms si:**
- ✅ Deploy independiente del Next.js app
- ✅ Versioning en base de datos (A/B testing)
- ✅ Equipo separado manteniendo forms
- ✅ Necesitas catálogo centralizado en SQL Server
- ✅ Hot reload de forms sin rebuild de Next.js

---

**Creado para:** Proyecto Bizuit Form Template
**Versión:** 2.0.0 (Ahora con Custom Forms!)
**Última actualización:** Noviembre 2025
