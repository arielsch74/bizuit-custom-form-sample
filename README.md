# Bizuit Form Template

Template completo para desarrollo de formularios web integrados con Bizuit BPMS.

**🎉 Paquetes publicados en npm:**
- [@tyconsa/bizuit-form-sdk](https://www.npmjs.com/package/@tyconsa/bizuit-form-sdk) - SDK para integración con Bizuit BPM (v2.0.0+)
- [@tyconsa/bizuit-ui-components](https://www.npmjs.com/package/@tyconsa/bizuit-ui-components) - Componentes UI personalizables (v1.7.0+)

**✅ Testing:** 77 tests unitarios (100% passing) con Vitest

## 📦 Estructura del Proyecto

```
BizuitFormTemplate/
├── packages/                    # Paquetes NPM publicados
│   ├── bizuit-form-sdk/        # SDK core (@tyconsa/bizuit-form-sdk)
│   │   └── src/__tests__/      # 36 tests unitarios
│   └── bizuit-ui-components/   # Componentes UI (@tyconsa/bizuit-ui-components)
│       └── src/__tests__/      # 41 tests unitarios
├── custom-forms-showcase/                     # Proyecto de ejemplo Next.js 15
│   └── docs/                    # Documentación completa para desarrolladores
└── README.md                    # Este archivo
```

## 🚀 Inicio Rápido

### Opción 1: Iniciar Todos los Servicios (Recomendado)

```bash
# Iniciar todos los servicios en un solo comando
./start-all.sh
```

Esto iniciará:
- **Backend API** (FastAPI): [http://localhost:8000](http://localhost:8000)
- **Showcase** (Next.js): [http://localhost:3000](http://localhost:3000)
- **Runtime App** (Next.js): [http://localhost:3001](http://localhost:3001)

Para detener todos los servicios:
```bash
./stop-all.sh
```

**Ver logs en tiempo real:**
```bash
tail -f logs/backend-api.log
tail -f logs/showcase.log
tail -f logs/runtime-app.log
```

### Opción 2: Instalación Manual

#### 1. Instalar Dependencias de los Paquetes

```bash
# SDK
cd packages/bizuit-form-sdk
npm install
npm run build

# UI Components
cd ../bizuit-ui-components
npm install
npm run build

# Volver a la raíz
cd ../..
```

#### 2. Ejecutar Servicios Individuales

**Backend API:**
```bash
cd custom-forms/backend-api
source venv/bin/activate
python main.py  # Corre en puerto 8000
```

**Showcase:**
```bash
cd custom-forms-showcase
npm install
npm run dev  # Corre en puerto 3000
```

**Runtime App:**
```bash
cd custom-forms/runtime-app
npm install
PORT=3001 npm run dev  # Corre en puerto 3001
```

## 📚 Paquetes

### @tyconsa/bizuit-form-sdk

**Instalación desde npm:**
```bash
npm install @tyconsa/bizuit-form-sdk
```

### Características

SDK completo para integración con Bizuit BPM que incluye:

- **Autenticación y Autorización**: Validación de tokens, verificación de permisos
- **Gestión de Procesos**: Inicialización, ejecución de eventos (RaiseEvent)
- **Bloqueo de Instancias**: Implementación de bloqueo pesimista
- **Cliente HTTP**: Con headers personalizados BZ-*
- **React Hooks**: `useBizuitSDK`, `useAuth`
- **Utilidades**: Parser de parámetros complejos (JSON/XML)

[Ver documentación completa →](packages/bizuit-form-sdk/README.md)

**Testing:** 36 tests unitarios (100% passing)

### @tyconsa/bizuit-ui-components

**Instalación desde npm:**
```bash
npm install @tyconsa/bizuit-ui-components
```

### Componentes Incluidos

Biblioteca de componentes React altamente personalizables:

- **BizuitDataGrid**: Tabla con ordenamiento, filtrado, paginación (TanStack Table v8)
- **BizuitCombo**: Select con búsqueda incremental y multiselección
- **BizuitDateTimePicker**: Selector de fecha, hora y datetime
- **BizuitSlider**: Control deslizante con marcas personalizadas
- **BizuitFileUpload**: Carga de archivos con drag & drop
- **Button**: Componente de botón con múltiples variantes

**Características**:
- ✅ 100% personalizables con Tailwind CSS
- ✅ Soporte para modo oscuro
- ✅ Responsive y mobile-friendly
- ✅ Basados en Radix UI (accesibles)
- ✅ TypeScript completo

[Ver documentación completa →](packages/bizuit-ui-components/README.md)

**Testing:** 41 tests unitarios (100% passing)

**Componentes nuevos:**
- **DynamicFormField**: Genera automáticamente campos de formulario basados en metadatos de parámetros
- **ProcessSuccessScreen**: Pantalla de éxito con información del proceso completado

## 📱 Proyecto de Ejemplo

El directorio [custom-forms-showcase/](custom-forms-showcase/) contiene una aplicación Next.js 15 completa que demuestra:

### Página: Iniciar Proceso ([/start-process](custom-forms-showcase/app/start-process/page.tsx))

1. Autenticación con token JWT
2. Validación de permisos
3. Inicialización de proceso
4. Formulario con todos los componentes UI
5. Ejecución de RaiseEvent para crear instancia

### Página: Continuar Proceso ([/continue-process](custom-forms-showcase/app/continue-process/page.tsx))

1. Autenticación con token JWT
2. Verificación de estado de bloqueo
3. Bloqueo pesimista de instancia
4. Carga de datos existentes
5. Edición con desbloqueo automático
6. Historial de actividades (solo lectura)

[Ver documentación del ejemplo →](custom-forms-showcase/README.md)

**📚 Documentación para desarrolladores:**
- [GETTING_STARTED.md](custom-forms-showcase/docs/GETTING_STARTED.md) - Guía completa paso a paso (600+ líneas)
- [QUICK_REFERENCE.md](custom-forms-showcase/docs/QUICK_REFERENCE.md) - Referencia rápida de código
- [examples/](custom-forms-showcase/docs/examples/) - 6 ejemplos completos con código funcional

## 🛠️ Stack Tecnológico

- **Framework**: Next.js 15 (App Router)
- **UI Library**: React 18
- **Lenguaje**: TypeScript 5
- **Estilos**: Tailwind CSS
- **Componentes Base**: Radix UI
- **Tabla de Datos**: TanStack Table v8
- **Gestión de Formularios**: React Hook Form
- **Validación**: Zod
- **HTTP Client**: Axios
- **Bundler**: tsup (para paquetes)

## 🎯 Funcionalidades Principales

### 1. Autenticación y Autorización

```typescript
const { validateToken, checkFormAuth, getUserInfo } = useAuth()

// Validar token
const isValid = await validateToken(token)

// Verificar permisos
const hasAccess = await checkFormAuth({
  processName: 'MiProceso',
  userName: 'usuario'
})
```

### 2. Iniciar Proceso

```typescript
const sdk = useBizuitSDK()

// Inicializar proceso
const processData = await sdk.process.initialize({
  processName: 'MiProceso',
  token
})

// Ejecutar proceso
const result = await sdk.process.raiseEvent(
  {
    eventName: 'StartProcess',
    parameters: []
  },
  [] // files
)
```

### 3. Continuar Proceso con Bloqueo

```typescript
// Con desbloqueo automático
await sdk.instanceLock.withLock(
  {
    instanceId: 'INST-123',
    activityName: 'MiActividad',
    operation: 1,
    processName: 'MiProceso'
  },
  token,
  async (sessionToken) => {
    // Ejecutar operaciones con la instancia bloqueada
    return await sdk.process.raiseEvent(
      {
        eventName: 'ContinueProcess',
        instanceId,
        parameters: []
      },
      [],
      sessionToken
    )
  }
)
// La instancia se desbloquea automáticamente
```

### 4. Usar Componentes UI

```typescript
import {
  BizuitDataGrid,
  BizuitCombo,
  BizuitDateTimePicker,
  BizuitSlider,
  BizuitFileUpload
} from '@tyconsa/bizuit-ui-components'

// Combo con búsqueda
<BizuitCombo
  options={[
    { value: '1', label: 'Opción 1' },
    { value: '2', label: 'Opción 2' }
  ]}
  value={value}
  onChange={setValue}
  searchable
  multiSelect
/>

// Data Grid
<BizuitDataGrid
  columns={columns}
  data={data}
  selectable="multiple"
  sortable
  filterable
  paginated
/>
```

## 🌙 Modo Oscuro

Todos los componentes soportan modo oscuro automáticamente usando la estrategia `class` de Tailwind CSS.

```typescript
// En tu app/layout.tsx
<html className="dark">
  {/* ... */}
</html>
```

## 🌍 Internacionalización

Los componentes de fecha soportan múltiples idiomas:

```typescript
<BizuitDateTimePicker
  value={date}
  onChange={setDate}
  locale="es" // o "en"
/>
```

## 📦 Paquetes Publicados en npm

Los paquetes ya están publicados y disponibles en npm:

```bash
# Instalar desde npm
npm install @tyconsa/bizuit-form-sdk
npm install @tyconsa/bizuit-ui-components
```

**Enlaces:**
- [@tyconsa/bizuit-form-sdk en npm](https://www.npmjs.com/package/@tyconsa/bizuit-form-sdk)
- [@tyconsa/bizuit-ui-components en npm](https://www.npmjs.com/package/@tyconsa/bizuit-ui-components)

## 🔧 Desarrollo

### Estructura de Desarrollo

1. Haz cambios en los paquetes (`packages/`)
2. Reconstruye los paquetes: `npm run build`
3. Los cambios se reflejan automáticamente en el ejemplo

### Scripts Disponibles

Cada paquete tiene:
- `npm run build` - Compilar paquete
- `npm run dev` - Modo desarrollo con watch (algunos paquetes)
- `npm run lint` - Verificar código

El ejemplo tiene:
- `npm run dev` - Servidor de desarrollo
- `npm run build` - Build de producción
- `npm run start` - Servidor de producción
- `npm run lint` - Linter

## 📝 Variables de Entorno

Crea un archivo `.env.local` en el directorio `custom-forms-showcase/`:

```env
NEXT_PUBLIC_BIZUIT_FORMS_API_URL=https://tu-api.com/forms
NEXT_PUBLIC_BIZUIT_DASHBOARD_API_URL=https://tu-api.com/dashboard
```

Ver [custom-forms-showcase/.env.example](custom-forms-showcase/.env.example) para más detalles.

## 🎨 Personalización

### Temas y Colores

Los componentes usan variables CSS que puedes personalizar en tu `globals.css`:

```css
:root {
  --primary: 222.2 47.4% 11.2%;
  --primary-foreground: 210 40% 98%;
  /* ... más variables */
}
```

### Tailwind Config

Personaliza los estilos en tu `tailwind.config.ts`:

```typescript
export default {
  theme: {
    extend: {
      colors: {
        primary: 'hsl(var(--primary))',
        // ...
      }
    }
  }
}
```

## 🌐 Compatibilidad de Navegadores

- Chrome/Edge (última versión)
- Safari (última versión)
- Opera (última versión)
- Firefox (última versión)
- Navegadores móviles (iOS Safari, Chrome Mobile)

## 🚀 Deployment en Producción

Este proyecto incluye pipelines de Azure DevOps completamente configurados para deployment automático en Windows Server con IIS + PM2.

### Arquitectura de Deployment

```
Internet (test.bizuit.com)
         ↓
    IIS (Puerto 80/443)
         ↓
    ┌────┴─────────────────────┐
    ↓                          ↓
Frontend                    Backend
PM2 (localhost:3001)       PM2 (localhost:8000)
Next.js Runtime            FastAPI
```

### Pipelines Disponibles

1. **Build Pipeline** (`azure-pipelines-build.yml`)
   - Compila Runtime App (Next.js) y Backend API (FastAPI)
   - Genera artifacts optimizados para producción
   - Triggers: Cambios en `custom-forms/**`

2. **Deploy Pipeline** (`azure-pipelines-deploy.yml`)
   - Despliega a Windows Server con PM2
   - Configura IIS como reverse proxy
   - Ejecuta health checks automáticos
   - Triggers: Completación exitosa del Build

3. **Showcase Pipeline** (`azure-pipelines.yml`)
   - Despliega app de showcase con IISNode
   - Triggers: Cambios en `custom-forms-showcase/**` o `packages/**`

### Documentación de Deployment

**📋 Para administradores del servidor:**
- **[CHECKLIST_SERVIDOR.md](./CHECKLIST_SERVIDOR.md)** ⭐ - Checklist imprimible con pasos de configuración (~10 min)
- **[SERVIDOR_PASOS_FINALES.md](./SERVIDOR_PASOS_FINALES.md)** - Guía paso a paso en español
- **[COMANDOS_SERVIDOR.md](./COMANDOS_SERVIDOR.md)** - Referencia rápida de comandos PowerShell

**🔧 Para DevOps y desarrolladores:**
- **[RESUMEN_CONFIGURACION.md](./RESUMEN_CONFIGURACION.md)** - Estado completo del proyecto y problemas resueltos
- **[IIS_CONFIGURATION_GUIDE.md](./IIS_CONFIGURATION_GUIDE.md)** - Guía técnica de arquitectura IIS + PM2
- **[MULTI_CLIENT_DEPLOYMENT.md](./MULTI_CLIENT_DEPLOYMENT.md)** ⭐ - Deploy de múltiples clientes en el mismo servidor
- **[custom-forms/DEPLOYMENT.md](./custom-forms/DEPLOYMENT.md)** - Documentación detallada de deployment
- **[custom-forms/PM2_WINDOWS_SETUP.md](./custom-forms/PM2_WINDOWS_SETUP.md)** - Setup de PM2 en Windows

### Inicio Rápido - Configuración del Servidor

**El pipeline automatiza TODO excepto:**

**UN SOLO PASO MANUAL** después de que el pipeline complete (~5 minutos):

1. **Crear IIS application para backend** en IIS Manager
2. **Reciclar IIS application pool**

**El pipeline configura automáticamente:**
- ✅ web.config files (runtime y backend)
- ✅ .env.local files (runtime y backend)
- ✅ PM2 processes (restart automático)

**Ver:** [CHECKLIST_SERVIDOR.md](./CHECKLIST_SERVIDOR.md) para instrucciones paso a paso.

### Deployments Futuros

Después de la configuración inicial, los deployments futuros son **completamente automáticos**:

1. Hacer push a `main` branch
2. Azure DevOps ejecuta build y deploy automáticamente
3. PM2 reinicia los procesos
4. ✅ Deployment completo

No se requiere intervención manual.

### URLs de Producción

- **Showcase:** `http://test.bizuit.com/BIZUITCustomForms`
- **Runtime App:** `http://test.bizuit.com/arielschBIZUITCustomForms`
- **Backend API:** `http://test.bizuit.com/arielschBIZUITCustomFormsbackend`

### Verificación de Deployment

```powershell
# Backend health check
curl http://test.bizuit.com/arielschBIZUITCustomFormsbackend/health

# PM2 status
pm2 list

# Ver logs
pm2 logs --lines 50
```

## 📄 Licencia

MIT

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📧 Soporte

Para preguntas o problemas, abre un issue en el repositorio.

---

**Creado con ❤️ para el ecosistema Bizuit BPM**

_Última actualización: 2025-11-19_
