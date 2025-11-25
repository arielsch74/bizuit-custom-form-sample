# 📚 BIZUIT Custom Forms - Documentación

Índice centralizado de toda la documentación del proyecto.

---

## 📖 Guías Principales

### 🚀 Setup y Deployment

| Documento | Descripción | Ubicación |
|-----------|-------------|-----------|
| **[PM2 Windows Setup](infrastructure/PM2_WINDOWS_SETUP.md)** | Instalación y configuración de PM2 en Windows Server | `docs/infrastructure/` |
| **[Runtime basePath Setup](infrastructure/RUNTIME_BASEPATH_SETUP.md)** | Configuración de basePath dinámico para Next.js | `docs/infrastructure/` |
| **[Setup Submodule](setup/SETUP_SUBMODULE.md)** | Configuración de `bizuit-custom-form-sample` como git submodule | `docs/setup/` |
| **[Deployment Guide](../bizuit-custom-form-sample/DEPLOYMENT_GUIDE.md)** | Guía completa de deployment de forms a entornos (arielsch, recubiz) | `bizuit-custom-form-sample/` |

### 👨‍💻 Desarrollo

| Documento | Descripción | Ubicación |
|-----------|-------------|-----------|
| **[Developer Guide](DEVELOPER_GUIDE.md)** | Guía general para developers del proyecto | `custom-forms/docs/` |
| **[Development Guide (Forms)](../bizuit-custom-form-sample/DEVELOPMENT.md)** | Desarrollo local de custom forms, testing, debugging | `bizuit-custom-form-sample/` |
| **[Externals Config](../runtime-app/EXTERNALS_CONFIG.md)** | Configuración de externals (React, SDK, UI Components) en runtime | `runtime-app/` |

### 🏗️ Arquitectura

| Documento | Descripción | Ubicación |
|-----------|-------------|-----------|
| **[Backend Implementation](./BACKEND_IMPLEMENTATION.md)** | Arquitectura completa del backend (.NET + SQL Server) | `docs/` |
| **[IIS Deployment](./IIS_DEPLOYMENT.md)** | Deployment con IIS + reverse proxy | `docs/` |
| **[Offline Deployment](./OFFLINE_DEPLOYMENT.md)** | Deployment offline en entornos sin internet | `docs/` |

### ⚙️ CI/CD

| Documento | Descripción | Ubicación |
|-----------|-------------|-----------|
| **[Azure DevOps Setup](../bizuit-custom-form-sample/AZURE_DEVOPS_SETUP.md)** | Configuración de pipelines de Azure DevOps para builds automáticos | `bizuit-custom-form-sample/` |
| **[Forms Sample README](../bizuit-custom-form-sample/README.md)** | README del repositorio de forms (GitHub Actions, estructura) | `bizuit-custom-form-sample/` |

### 🧪 Testing

| Documento | Descripción | Ubicación |
|-----------|-------------|-----------|
| **[Backend Tests README](../backend-api/tests/README.md)** | Documentación de tests del backend Python | `backend-api/tests/` |
| **[Test Results](../backend-api/TEST_RESULTS.md)** | Resultados de ejecución de tests | `backend-api/` |

### 🔧 Backend .NET

| Documento | Descripción | Ubicación |
|-----------|-------------|-----------|
| **[Migration Status](../backend-api-dotnet/MIGRATION_STATUS.md)** | Estado de migración Python → .NET | `backend-api-dotnet/` |
| **[Backend .NET README](../backend-api-dotnet/README.md)** | README del backend .NET | `backend-api-dotnet/` |

---

## 🗂️ Estructura de Directorios

```
custom-forms/
├── README.md                          # Overview del proyecto
│
├── docs/                              # Documentación técnica
│   ├── README.md                      # ← Este archivo
│   │
│   ├── setup/                         # Setup y configuración inicial
│   │   └── SETUP_SUBMODULE.md
│   │
│   ├── infrastructure/                # Infraestructura (PM2, IIS, basePath)
│   │   ├── PM2_WINDOWS_SETUP.md
│   │   └── RUNTIME_BASEPATH_SETUP.md
│   │
│   ├── DEVELOPER_GUIDE.md             # Guía completa para developers
│   ├── BACKEND_IMPLEMENTATION.md      # Arquitectura backend
│   ├── IIS_DEPLOYMENT.md              # IIS deployment
│   └── OFFLINE_DEPLOYMENT.md          # Offline deployment
│
├── runtime-app/
│   ├── EXTERNALS_CONFIG.md            # React externals config
│   └── SECURITY.md                    # Security guidelines
│
├── backend-api/
│   ├── TEST_RESULTS.md
│   └── tests/
│       └── README.md
│
├── backend-api-dotnet/
│   ├── MIGRATION_STATUS.md
│   └── README.md
│
└── bizuit-custom-form-sample/         # Git submodule - Sample forms
    ├── README.md
    ├── DEVELOPMENT.md                 # Desarrollo de forms
    ├── DEPLOYMENT_GUIDE.md            # Deployment de forms
    └── AZURE_DEVOPS_SETUP.md          # CI/CD setup
```

---

## 🔍 Buscar por Tema

### Setup y Configuración
- [PM2 Windows Setup](infrastructure/PM2_WINDOWS_SETUP.md) - Instalar PM2 en Windows
- [Runtime basePath Setup](infrastructure/RUNTIME_BASEPATH_SETUP.md) - Configurar basePath dinámico
- [Setup Submodule](setup/SETUP_SUBMODULE.md) - Git submodule setup

### Deployment
- [Deployment Guide](../bizuit-custom-form-sample/DEPLOYMENT_GUIDE.md) - Deploy completo de forms
- [IIS Deployment](./IIS_DEPLOYMENT.md) - IIS + reverse proxy
- [Offline Deployment](./OFFLINE_DEPLOYMENT.md) - Entornos sin internet

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
- [Forms Sample README](../bizuit-custom-form-sample/README.md) - GitHub Actions

---

## 📝 Convenciones

- **custom-forms/**: Solo README.md (overview general)
- **docs/**: Documentación técnica organizada por categorías
- **docs/setup/**: Configuración inicial y setup
- **docs/infrastructure/**: Infraestructura (PM2, IIS, basePath)
- **runtime-app/** y **backend-*/**: Docs específicos de cada componente
- **bizuit-custom-form-sample/**: Docs del git submodule (forms)

---

**Última actualización:** 2025-11-25
