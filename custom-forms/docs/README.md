# 📚 BIZUIT Custom Forms - Documentación

Índice centralizado de toda la documentación del proyecto.

---

## 📖 Guías Principales

### 🚀 Setup y Deployment

| Documento | Descripción | Ubicación |
|-----------|-------------|-----------|
| **[PM2 Windows Setup](../PM2_WINDOWS_SETUP.md)** | Instalación y configuración de PM2 en Windows Server | `custom-forms/` |
| **[Runtime basePath Setup](../RUNTIME_BASEPATH_SETUP.md)** | Configuración de basePath dinámico para Next.js | `custom-forms/` |
| **[Setup Submodule](../SETUP_SUBMODULE.md)** | Configuración de `bizuit-custom-form-sample` como git submodule | `custom-forms/` |
| **[Deployment Guide](../bizuit-custom-form-sample/DEPLOYMENT_GUIDE.md)** | Guía completa de deployment de forms a entornos (arielsch, recubiz) | `custom-forms/bizuit-custom-form-sample/` |

### 👨‍💻 Desarrollo

| Documento | Descripción | Ubicación |
|-----------|-------------|-----------|
| **[Developer Guide](../DEVELOPER_GUIDE.md)** | Guía general para developers del proyecto | `custom-forms/` |
| **[Development Guide (Forms)](../bizuit-custom-form-sample/DEVELOPMENT.md)** | Desarrollo local de custom forms, testing, debugging | `custom-forms/bizuit-custom-form-sample/` |
| **[Externals Config](../runtime-app/EXTERNALS_CONFIG.md)** | Configuración de externals (React, SDK, UI Components) en runtime | `custom-forms/runtime-app/` |

### 🏗️ Arquitectura

| Documento | Descripción | Ubicación |
|-----------|-------------|-----------|
| **[Backend Implementation](./BACKEND_IMPLEMENTATION.md)** | Arquitectura completa del backend (.NET + SQL Server) | `custom-forms/docs/` |
| **[Dynamic Forms Implementation Plan](./DYNAMIC_FORMS_IMPLEMENTATION_PLAN.md)** | Plan de implementación de formularios dinámicos | `custom-forms/docs/` |

### ⚙️ CI/CD

| Documento | Descripción | Ubicación |
|-----------|-------------|-----------|
| **[Azure DevOps Setup](../bizuit-custom-form-sample/AZURE_DEVOPS_SETUP.md)** | Configuración de pipelines de Azure DevOps para builds automáticos | `custom-forms/bizuit-custom-form-sample/` |
| **[Forms Sample README](../bizuit-custom-form-sample/README.md)** | README del repositorio de forms (GitHub Actions, estructura) | `custom-forms/bizuit-custom-form-sample/` |

### 🧪 Testing

| Documento | Descripción | Ubicación |
|-----------|-------------|-----------|
| **[Backend Tests README](../backend-api/tests/README.md)** | Documentación de tests del backend Python | `custom-forms/backend-api/tests/` |
| **[Test Results](../backend-api/TEST_RESULTS.md)** | Resultados de ejecución de tests | `custom-forms/backend-api/` |

### 🔧 Backend .NET

| Documento | Descripción | Ubicación |
|-----------|-------------|-----------|
| **[Migration Status](../backend-api-dotnet/MIGRATION_STATUS.md)** | Estado de migración Python → .NET | `custom-forms/backend-api-dotnet/` |
| **[Backend .NET README](../backend-api-dotnet/README.md)** | README del backend .NET | `custom-forms/backend-api-dotnet/` |

---

## 🗂️ Estructura de Directorios

```
custom-forms/
├── docs/                              # Documentación de arquitectura
│   ├── README.md                      # ← Este archivo
│   ├── BACKEND_IMPLEMENTATION.md
│   └── DYNAMIC_FORMS_IMPLEMENTATION_PLAN.md
│
├── PM2_WINDOWS_SETUP.md               # Setup de PM2
├── RUNTIME_BASEPATH_SETUP.md          # basePath dinámico
├── SETUP_SUBMODULE.md                 # Git submodule setup
├── DEVELOPER_GUIDE.md                 # Guía general de desarrollo
│
├── runtime-app/
│   └── EXTERNALS_CONFIG.md            # Configuración de externals
│
├── backend-api/
│   ├── TEST_RESULTS.md                # Resultados de tests
│   └── tests/
│       └── README.md                  # Docs de tests
│
├── backend-api-dotnet/
│   ├── MIGRATION_STATUS.md            # Status de migración
│   └── README.md                      # README del backend .NET
│
└── bizuit-custom-form-sample/         # Git submodule - Sample forms
    ├── README.md                      # README del repo de forms
    ├── DEVELOPMENT.md                 # Guía de desarrollo de forms
    ├── DEPLOYMENT_GUIDE.md            # Deployment de forms a entornos
    └── AZURE_DEVOPS_SETUP.md          # Setup de Azure DevOps
```

---

## 🔍 Buscar por Tema

### Deployment
- [PM2 Windows Setup](../PM2_WINDOWS_SETUP.md) - Instalar PM2
- [Runtime basePath Setup](../RUNTIME_BASEPATH_SETUP.md) - Configurar basePath
- [Deployment Guide](../bizuit-custom-form-sample/DEPLOYMENT_GUIDE.md) - Deploy completo

### Desarrollo de Forms
- [Development Guide](../bizuit-custom-form-sample/DEVELOPMENT.md) - Desarrollo local
- [Externals Config](../runtime-app/EXTERNALS_CONFIG.md) - React externals
- [Forms Sample README](../bizuit-custom-form-sample/README.md) - Estructura y workflow

### Backend
- [Backend Implementation](./BACKEND_IMPLEMENTATION.md) - Arquitectura backend
- [Migration Status](../backend-api-dotnet/MIGRATION_STATUS.md) - Status Python → .NET
- [Backend Tests](../backend-api/tests/README.md) - Testing

### CI/CD
- [Azure DevOps Setup](../bizuit-custom-form-sample/AZURE_DEVOPS_SETUP.md) - Pipelines

---

## 📝 Convenciones

- **Documentos en inglés**: Arquitectura, implementación técnica
- **Documentos en español**: Guías de deployment, desarrollo
- **README.md**: Overview del componente/directorio
- **docs/**: Documentación de arquitectura y diseño

---

**Última actualización:** 2025-11-25
