# Bizuit Custom Forms

**Estado**: 95% completo - Migraciones SQL y deployment funcionales

**Última actualización**: 2024-11-20 - Migraciones SQL corregidas, PM2 configurado

---

## 📋 Descripción

Sistema que permite crear, publicar y cargar formularios customizados para procesos Bizuit de forma dinámica, con soporte para:

- ✅ **Versionado**: Control de versiones con historial completo en base de datos
- ✅ **Form Registry**: Registro centralizado con metadata de forms
- ✅ **Backend API REST**: FastAPI (Python) con endpoints completos
- ✅ **Base de Datos**: SQL Server con stored procedures optimizados
- ✅ **Deployment Pipeline**: Azure DevOps CI/CD con PM2
- ⚠️ **Carga Dinámica**: Implementación parcial (ver sección de Arquitectura)

---

## 🏗️ Arquitectura del Proyecto

```
bizuit-custom-forms/
├── runtime-app/                # Runtime Next.js para ejecutar forms
│   ├── app/                    # Next.js 15 App Router
│   ├── components/             # Componentes UI (FormContainer, ErrorBoundary, etc)
│   ├── lib/                    # Utilities (form-loader, form-registry)
│   ├── hooks/                  # React hooks (useFormHotReload)
│   └── package.json
├── backend-api/                # Backend API .NET Core (documentado)
│   ├── Controllers/            # CustomFormsController
│   ├── Services/               # Service layer con Dapper
│   └── Models/                 # DTOs
├── database/                   # Scripts SQL (documentados)
├── docs/                       # Documentación completa
│   ├── DYNAMIC_FORMS.md        # 🎯 DOCUMENTO PRINCIPAL - Estado y arquitectura
│   ├── BACKEND_IMPLEMENTATION.md  # Backend y base de datos
│   └── RUNTIME_CONFIG.md       # Configuración runtime
├── forms-examples/             # Forms de ejemplo (placeholder)
└── README.md                   # Este archivo
```

---

## ⚠️ Estado Actual y Decisión Pendiente

### Lo que está completo y funciona:

✅ **Frontend Infrastructure** (80%)
- Form Registry con cache y metadata
- Dynamic routing (`/form/[formName]`)
- API endpoints con fallbacks CDN
- Error handling y loading states
- Mock API para desarrollo

✅ **Backend API** (100% documentado)
- Controller REST con 6 endpoints
- Service layer con Dapper
- DTOs y modelos completos

✅ **Base de Datos** (100% documentado)
- 3 tablas + 1 vista
- 7 stored procedures
- Scripts DDL completos

### ⚠️ Problema Crítico: Carga Dinámica desde CDN

**El approach original de cargar React components desde CDN público (jsdelivr/unpkg) NO funciona** debido a problemas de singleton de React. Ver detalles completos en [`docs/DYNAMIC_FORMS.md`](docs/DYNAMIC_FORMS.md).

### 🎯 Opciones de Solución

Según la documentación detallada en [`docs/DYNAMIC_FORMS.md`](docs/DYNAMIC_FORMS.md), hay 4 opciones:

**Opción A (⭐ Recomendado para MVP)**: **Pre-bundle Forms**
- Forms se instalan como dependencies npm
- Se bundlean con el runtime app
- Requiere rebuild para agregar forms
- React compartido garantizado
- ✅ Implementación inmediata

**Opción B (Futuro)**: **Module Federation** (Webpack 5)
- Verdaderamente dinámico
- React compartido via Module Federation
- Requiere infraestructura compleja
- ⚠️ Evaluar compatibilidad con Next.js 15

**Opción C**: **iframes** (No recomendado - UX deficiente)

**Opción D**: **SSR** (No viable - falta interactividad)

**➡️ Ver análisis completo en [`docs/DYNAMIC_FORMS.md`](docs/DYNAMIC_FORMS.md#-opciones-de-soluci%C3%B3n-recomendadas)**

---

---

## 📚 Developer Documentation

**Complete guides for building and deploying custom forms:**

### Interactive Documentation (Recommended)

Access comprehensive developer documentation with interactive UI:

- **English**: `http://localhost:3001/docs`
- **Español**: `http://localhost:3001/docs/es`

Features:
- ✅ Interactive navigation with sidebar
- ✅ Syntax-highlighted code examples
- ✅ Step-by-step guides
- ✅ Environment configuration examples
- ✅ Troubleshooting solutions
- ✅ Learning path for junior developers

### Markdown Guide

For offline reading: [`DEVELOPER_GUIDE.md`](DEVELOPER_GUIDE.md)

**Topics covered:**
- Quick Start (5 minutes)
- Project Architecture
- Form Routes & Loaders (`/form` vs `/formsa`)
- Authentication (JWT + dev credentials)
- Environment Configuration (build-time vs server-side)
- Development Workflows (Fat Bundle, Full Stack, Runtime Testing)
- Testing Strategies
- Deployment Process (GitHub Actions)
- Troubleshooting
- FAQs

---

## 🚀 Quick Start

### 1. Instalar Runtime App

```bash
cd runtime-app
npm install
```

### 2. Configurar Variables de Entorno

Copiar `.env.example` a `.env.local` y configurar:

```env
NEXT_PUBLIC_BIZUIT_FORMS_API_URL=https://tu-api.com/api
NEXT_PUBLIC_BIZUIT_DASHBOARD_API_URL=https://tu-api.com/dashboard
```

### 3. Ejecutar en Desarrollo

```bash
npm run dev
```

Abrir [http://localhost:3001/forms](http://localhost:3001/forms) para ver la lista de forms disponibles.

> **Nota**: El runtime app está configurado para correr en el puerto **3001** para no conflictuar con el proyecto de ejemplo que corre en el puerto 3000.

---

## 📚 Documentación

La documentación completa está en el directorio [`/docs/`](docs/):

### 📖 Documentos Principales

- **[DYNAMIC_FORMS.md](docs/DYNAMIC_FORMS.md)** - 🎯 **LEER PRIMERO**: Estado actual completo, opciones arquitectónicas, y decisiones pendientes
- **[BACKEND_IMPLEMENTATION.md](docs/BACKEND_IMPLEMENTATION.md)** - Backend API (.NET Core) y base de datos (SQL Server) con stored procedures
- **[RUNTIME_CONFIG.md](docs/RUNTIME_CONFIG.md)** - Configuración runtime vs build-time

### 🎯 Puntos de Entrada de Lectura

**Para entender el proyecto**:
1. Empezar por este README
2. Leer [`docs/DYNAMIC_FORMS.md`](docs/DYNAMIC_FORMS.md) - Estado actual y opciones
3. Leer [`docs/BACKEND_IMPLEMENTATION.md`](docs/BACKEND_IMPLEMENTATION.md) - API y DB

**Para implementar**:
1. Decidir entre Opción A (pre-bundle) u Opción B (Module Federation)
2. Seguir instrucciones en [`docs/DYNAMIC_FORMS.md`](docs/DYNAMIC_FORMS.md#-lo-que-queda-pendiente)
3. Implementar backend según [`docs/BACKEND_IMPLEMENTATION.md`](docs/BACKEND_IMPLEMENTATION.md#-instalaci%C3%B3n-y-configuraci%C3%B3n)

---

## 🔧 Stack Tecnológico

### Frontend (Runtime App)
- **Framework**: Next.js 15 (App Router)
- **UI**: React 18
- **Lenguaje**: TypeScript 5
- **Estilos**: Tailwind CSS
- **Componentes**: [@tyconsa/bizuit-ui-components](https://www.npmjs.com/package/@tyconsa/bizuit-ui-components)
- **SDK**: [@tyconsa/bizuit-form-sdk](https://www.npmjs.com/package/@tyconsa/bizuit-form-sdk)

### Backend (Documentado)
- **Framework**: .NET Core
- **ORM**: Dapper
- **Base de Datos**: SQL Server
- **API**: REST con 6 endpoints

---

## 📋 Lo que Queda Pendiente

Ver lista completa y priorizada en [`docs/DYNAMIC_FORMS.md - Lo que Queda Pendiente`](docs/DYNAMIC_FORMS.md#-lo-que-queda-pendiente).

### Corto Plazo (1-2 días)
1. **Decisión crítica**: ¿Opción A (pre-bundle) o B (Module Federation)?
2. Implementar approach elegido
3. Testing con 2-3 forms reales

### Mediano Plazo (1-2 semanas)
1. Integrar backend API real
2. CI/CD para compilación y publicación
3. Forms de producción

### Largo Plazo (1-2 meses)
1. Optimizaciones de performance
2. CLI tool para developers
3. Analytics de uso

---

## 🎯 Próximos Pasos Recomendados

### Para MVP Rápido (Opción A - Pre-bundle):

1. **Actualizar `runtime-app/app/form/[formName]/page.tsx`**:
   ```typescript
   import FormA from '@tyconsa/bizuit-form-a'
   import FormB from '@tyconsa/bizuit-form-b'

   const FORMS_MAP = {
     'form-a': FormA,
     'form-b': FormB,
   }

   export default function FormPage({ params }) {
     const FormComponent = FORMS_MAP[params.formName]
     return <FormComponent />
   }
   ```

2. **Instalar forms como dependencies**:
   ```bash
   npm install @tyconsa/bizuit-form-a@latest
   npm install @tyconsa/bizuit-form-b@latest
   ```

3. **Rebuild y deploy**

### Para Dinamicidad Real (Opción B - Module Federation):

1. Evaluar compatibilidad Next.js 15 con Module Federation
2. POC de form remoto compartiendo React
3. Infraestructura de hosting para forms remotos

**➡️ Ver detalles completos en [`docs/DYNAMIC_FORMS.md`](docs/DYNAMIC_FORMS.md)**

---

## 📞 Soporte

Para preguntas o problemas:
1. Revisar documentación en [`/docs/`](docs/)
2. Verificar logs del runtime app
3. Consultar [`docs/DYNAMIC_FORMS.md`](docs/DYNAMIC_FORMS.md) para troubleshooting

---

## 📄 Licencia

MIT

---

## 🤝 Contribuciones

Contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/NuevaFuncionalidad`)
3. Commit tus cambios (`git commit -m 'feat: agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/NuevaFuncionalidad`)
5. Abre un Pull Request

---

**Creado con ❤️ para el ecosistema Bizuit BPM**
