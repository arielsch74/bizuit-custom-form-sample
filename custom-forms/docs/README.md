# 📚 BIZUIT Custom Forms - Documentación

Índice centralizado de toda la documentación del proyecto.

---

## 📖 Guías Principales

### 🚀 Setup y Deployment

| Documento | Descripción | Ubicación |
|-----------|-------------|-----------|
| **[Checklist de Servidor](deployment/CHECKLIST_SERVIDOR.md)** | Lista de verificación post-deployment (1 paso manual) | `docs/deployment/` |
| **[Servidor - Pasos Finales](deployment/SERVIDOR_PASOS_FINALES.md)** | Guía detallada de configuración servidor | `docs/deployment/` |
| **[Multi-Client Deployment](deployment/MULTI_CLIENT_DEPLOYMENT.md)** | Setup multi-cliente (arielsch, recubiz, etc.) | `docs/deployment/` |
| **[PM2 Windows Setup](infrastructure/PM2_WINDOWS_SETUP.md)** | Instalación y configuración de PM2 en Windows Server | `docs/infrastructure/` |
| **[IIS Configuration Guide](infrastructure/IIS_CONFIGURATION_GUIDE.md)** | Guía técnica de IIS + PM2 | `docs/infrastructure/` |
| **[Runtime basePath Setup](infrastructure/RUNTIME_BASEPATH_SETUP.md)** | Configuración de basePath dinámico para Next.js | `docs/infrastructure/` |
| **[Setup Submodule](setup/SETUP_SUBMODULE.md)** | Configuración de `bizuit-custom-form-sample` como git submodule | `docs/setup/` |
| **[Deployment Guide](../bizuit-custom-form-sample/DEPLOYMENT_GUIDE.md)** | Guía completa de deployment de forms a entornos (arielsch, recubiz) | `bizuit-custom-form-sample/` |

### 👨‍💻 Desarrollo

| Documento | Descripción | Ubicación |
|-----------|-------------|-----------|
| **[Developer Guide](DEVELOPER_GUIDE.md)** | Guía general para developers del proyecto | `custom-forms/docs/` |
| **[Runtime App Overview](runtime-app/OVERVIEW.md)** | Overview de la Runtime App (carga dinámica de forms desde CDN/npm) | `docs/runtime-app/` |
| **[Externals Config](runtime-app/EXTERNALS_CONFIG.md)** | Configuración de externals (React, SDK, UI Components) en runtime | `docs/runtime-app/` |
| **[Runtime App Security](runtime-app/SECURITY.md)** | Medidas de seguridad implementadas en runtime-app | `docs/runtime-app/` |
| **[Development Guide (Forms)](../bizuit-custom-form-sample/DEVELOPMENT.md)** | Desarrollo local de custom forms, testing, debugging | `bizuit-custom-form-sample/` |

### 🏗️ Arquitectura

| Documento | Descripción | Ubicación |
|-----------|-------------|-----------|
| **[Authentication Flow](architecture/AUTHENTICATION_FLOW.md)** | Flujo de autenticación HTTP Basic con tokens | `docs/architecture/` |
| **[Backend Implementation](architecture/BACKEND_IMPLEMENTATION.md)** | Arquitectura completa del backend (.NET + SQL Server) | `docs/architecture/` |
| **[Dynamic Forms Implementation Plan](architecture/DYNAMIC_FORMS_IMPLEMENTATION_PLAN.md)** | Plan completo de arquitectura del sistema | `docs/architecture/` |
| **[Multi-Environment Implementation](architecture/MULTI_ENVIRONMENT_IMPLEMENTATION_PLAN.md)** | Plan multi-ambiente (dev/test/prod) | `docs/architecture/` |
| **[IIS Deployment](deployment/IIS_DEPLOYMENT.md)** | Deployment con IIS + reverse proxy | `docs/deployment/` |
| **[Offline Deployment](deployment/OFFLINE_DEPLOYMENT.md)** | Deployment offline en entornos sin internet | `docs/deployment/` |

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

### 🔒 Security

| Documento | Descripción | Ubicación |
|-----------|-------------|-----------|
| **[Tenant Isolation Guide](security/TENANT_ISOLATION_GUIDE.md)** | Guía de aislamiento multi-tenant | `docs/security/` |

### 📊 Operations

| Documento | Descripción | Ubicación |
|-----------|-------------|-----------|
| **[Resumen de Configuración](operations/RESUMEN_CONFIGURACION.md)** | Estado completo del sistema | `docs/operations/` |
| **[Deployment Troubleshooting](operations/DEPLOYMENT_TROUBLESHOOTING.md)** | Troubleshooting común de deployment | `docs/operations/` |
| **[Deployment Fix](operations/DEPLOYMENT_FIX.md)** | Fixes aplicados a deployments | `docs/operations/` |
| **[Comandos del Servidor](deployment/COMANDOS_SERVIDOR.md)** | Quick reference de PowerShell commands | `docs/deployment/` |

---

## 🗂️ Estructura de Directorios

```
custom-forms/
├── README.md                          # Overview del proyecto
├── QUICK_START.md                     # Quick start guide (5 min)
│
├── docs/                              # Documentación técnica
│   ├── README.md                      # ← Este archivo
│   │
│   ├── architecture/                  # Arquitectura y diseño
│   │   ├── AUTHENTICATION_FLOW.md
│   │   ├── BACKEND_IMPLEMENTATION.md
│   │   ├── DYNAMIC_FORMS_IMPLEMENTATION_PLAN.md
│   │   ├── DYNAMIC_FORMS_IMPLEMENTATION_PLAN_PART2.md
│   │   ├── IMPLEMENTATION_SUMMARY.md
│   │   └── MULTI_ENVIRONMENT_IMPLEMENTATION_PLAN.md
│   │
│   ├── deployment/                    # Deployment y configuración
│   │   ├── CHECKLIST_SERVIDOR.md
│   │   ├── COMANDOS_SERVIDOR.md
│   │   ├── IIS_DEPLOYMENT.md
│   │   ├── MULTI_CLIENT_DEPLOYMENT.md
│   │   ├── OFFLINE_DEPLOYMENT.md
│   │   └── SERVIDOR_PASOS_FINALES.md
│   │
│   ├── infrastructure/                # Infraestructura (PM2, IIS, basePath)
│   │   ├── IIS_CONFIGURATION_GUIDE.md
│   │   ├── PM2_WINDOWS_SETUP.md
│   │   └── RUNTIME_BASEPATH_SETUP.md
│   │
│   ├── security/                      # Seguridad y aislamiento
│   │   └── TENANT_ISOLATION_GUIDE.md
│   │
│   ├── operations/                    # Operaciones y troubleshooting
│   │   ├── DEPLOYMENT_FIX.md
│   │   ├── DEPLOYMENT_TROUBLESHOOTING.md
│   │   └── RESUMEN_CONFIGURACION.md
│   │
│   ├── setup/                         # Setup y configuración inicial
│   │   ├── AZURE_WEBAPP_DEPLOYMENT.md
│   │   ├── DEPLOYMENT.md
│   │   ├── GITHUB_WORKFLOW_SETUP_INSTRUCTIONS.md
│   │   ├── IIS_SETUP.md
│   │   ├── IISNODE_SETUP.md
│   │   └── SETUP_SUBMODULE.md
│   │
│   ├── runtime-app/                   # Runtime App específico
│   │   ├── OVERVIEW.md                # Arquitectura de runtime-app
│   │   ├── EXTERNALS_CONFIG.md        # React externals config
│   │   └── SECURITY.md                # Security guidelines
│   │
│   ├── README.md                      # Índice de documentación
│   └── DEVELOPER_GUIDE.md             # Guía completa para developers
│
├── runtime-app/                       # Código fuente runtime-app
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

### Inicio Rápido
- [Quick Start](../QUICK_START.md) - Guía de 5 minutos
- [Developer Guide](DEVELOPER_GUIDE.md) - Guía completa para developers

### Setup y Configuración
- [Checklist de Servidor](deployment/CHECKLIST_SERVIDOR.md) - Post-deployment checklist
- [PM2 Windows Setup](infrastructure/PM2_WINDOWS_SETUP.md) - Instalar PM2 en Windows
- [IIS Configuration](infrastructure/IIS_CONFIGURATION_GUIDE.md) - IIS + PM2 setup
- [Runtime basePath Setup](infrastructure/RUNTIME_BASEPATH_SETUP.md) - Configurar basePath dinámico
- [Setup Submodule](setup/SETUP_SUBMODULE.md) - Git submodule setup

### Deployment
- [Multi-Client Deployment](deployment/MULTI_CLIENT_DEPLOYMENT.md) - Múltiples clientes
- [Servidor - Pasos Finales](deployment/SERVIDOR_PASOS_FINALES.md) - Guía detallada
- [Comandos del Servidor](deployment/COMANDOS_SERVIDOR.md) - PowerShell reference
- [IIS Deployment](deployment/IIS_DEPLOYMENT.md) - IIS + reverse proxy
- [Offline Deployment](deployment/OFFLINE_DEPLOYMENT.md) - Entornos sin internet
- [Deployment Guide](../bizuit-custom-form-sample/DEPLOYMENT_GUIDE.md) - Deploy de forms

### Arquitectura
- [Authentication Flow](architecture/AUTHENTICATION_FLOW.md) - Flujo de auth
- [Backend Implementation](architecture/BACKEND_IMPLEMENTATION.md) - Arquitectura backend
- [Dynamic Forms Implementation](architecture/DYNAMIC_FORMS_IMPLEMENTATION_PLAN.md) - Plan de arquitectura

### Security
- [Tenant Isolation](security/TENANT_ISOLATION_GUIDE.md) - Aislamiento multi-tenant

### Desarrollo de Forms
- [Runtime App Overview](runtime-app/OVERVIEW.md) - Arquitectura de carga dinámica de forms
- [Externals Config](runtime-app/EXTERNALS_CONFIG.md) - React externals
- [Runtime App Security](runtime-app/SECURITY.md) - Seguridad en runtime-app
- [Development Guide](../bizuit-custom-form-sample/DEVELOPMENT.md) - Desarrollo local
- [Forms Sample README](../bizuit-custom-form-sample/README.md) - Estructura y workflow

### Backend
- [Backend Implementation](architecture/BACKEND_IMPLEMENTATION.md) - Arquitectura backend
- [Migration Status](../backend-api-dotnet/MIGRATION_STATUS.md) - Status Python → .NET
- [Backend Tests](../backend-api/tests/README.md) - Testing

### Operations
- [Resumen de Configuración](operations/RESUMEN_CONFIGURACION.md) - Estado completo
- [Deployment Troubleshooting](operations/DEPLOYMENT_TROUBLESHOOTING.md) - Troubleshooting
- [Deployment Fix](operations/DEPLOYMENT_FIX.md) - Fixes aplicados

### CI/CD
- [Azure DevOps Setup](../bizuit-custom-form-sample/AZURE_DEVOPS_SETUP.md) - Pipelines
- [Forms Sample README](../bizuit-custom-form-sample/README.md) - GitHub Actions

---

## 📝 Convenciones

- **custom-forms/**: README.md + QUICK_START.md (overview y getting started)
- **docs/**: Documentación técnica organizada por categorías
- **docs/architecture/**: Planes de arquitectura y diseño
- **docs/deployment/**: Deployment y configuración de servidores
- **docs/infrastructure/**: Infraestructura (PM2, IIS, basePath)
- **docs/security/**: Seguridad y aislamiento multi-tenant
- **docs/operations/**: Operaciones, troubleshooting, estado
- **docs/setup/**: Configuración inicial y setup guides
- **runtime-app/** y **backend-*/**: Docs específicos de cada componente
- **bizuit-custom-form-sample/**: Docs del git submodule (forms)

---

**Última actualización:** 2025-11-25
