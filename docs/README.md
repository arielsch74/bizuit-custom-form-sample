# 📚 BIZUIT Custom Forms - Documentación

Índice completo de documentación del proyecto.

---

## 🚀 **Inicio Rápido**

### Para Developers
- **[Quick Start Guide](../QUICK_START.md)** - Comienza en 5 minutos con fat bundle workflow
  - Setup inicial
  - Fat bundle vs full stack workflow
  - Tu primer formulario

### Para Administradores
- **[Checklist de Servidor](../CHECKLIST_SERVIDOR.md)** - Lista de verificación post-deployment (1 paso manual)
- **[Comandos del Servidor](../COMANDOS_SERVIDOR.md)** - Referencia rápida de comandos PowerShell
- **[Resumen de Configuración](../RESUMEN_CONFIGURACION.md)** - Estado completo del sistema

---

## 📁 **Estructura de Documentación**

```
docs/
├── README.md                          # ← Este archivo
│
├── deployment/                        # Deployment y configuración
│   ├── MULTI_CLIENT_DEPLOYMENT.md     # Setup multi-cliente (arielsch, recubiz, etc.)
│   └── SERVIDOR_PASOS_FINALES.md      # Guía detallada de configuración servidor
│
└── infrastructure/                    # Infraestructura y arquitectura
    └── IIS_CONFIGURATION_GUIDE.md     # Guía técnica de IIS + PM2
```

---

## 📖 **Guías por Categoría**

### 🎯 **Deployment**

| Documento | Descripción | Audiencia |
|-----------|-------------|-----------|
| **[Checklist de Servidor](../CHECKLIST_SERVIDOR.md)** | Lista de verificación post-deployment (5 min) | Admin |
| **[Comandos del Servidor](../COMANDOS_SERVIDOR.md)** | Quick reference de PowerShell commands | Admin / DevOps |
| **[Resumen de Configuración](../RESUMEN_CONFIGURACION.md)** | Estado del sistema, URLs, troubleshooting | Todos |
| **[Servidor - Pasos Finales](deployment/SERVIDOR_PASOS_FINALES.md)** | Guía detallada paso a paso | Admin |
| **[Multi-Client Deployment](deployment/MULTI_CLIENT_DEPLOYMENT.md)** | Setup para múltiples clientes en mismo servidor | DevOps |

### 🏗️ **Infraestructura**

| Documento | Descripción | Audiencia |
|-----------|-------------|-----------|
| **[IIS Configuration Guide](infrastructure/IIS_CONFIGURATION_GUIDE.md)** | Arquitectura IIS + PM2, reverse proxy | DevOps |

### 👨‍💻 **Desarrollo**

| Documento | Descripción | Audiencia |
|-----------|-------------|-----------|
| **[Quick Start](../QUICK_START.md)** | Inicio rápido para developers (5 min setup) | Developer |

### 📦 **Custom Forms (Submodule)**

Ver documentación en: **[custom-forms/docs/README.md](../custom-forms/docs/README.md)**

Incluye:
- Guía de desarrollo de forms
- Backend implementation
- Deployment de forms
- CI/CD con GitHub Actions/Azure DevOps

---

## 🔍 **Buscar por Tema**

### Setup Inicial
- [Quick Start](../QUICK_START.md) - Para developers
- [Checklist de Servidor](../CHECKLIST_SERVIDOR.md) - Para admins

### Deployment
- [Resumen de Configuración](../RESUMEN_CONFIGURACION.md) - Estado completo
- [Servidor - Pasos Finales](deployment/SERVIDOR_PASOS_FINALES.md) - Guía detallada
- [Multi-Client](deployment/MULTI_CLIENT_DEPLOYMENT.md) - Múltiples clientes

### Infraestructura
- [IIS Configuration](infrastructure/IIS_CONFIGURATION_GUIDE.md) - Arquitectura IIS + PM2

### Comandos Rápidos
- [Comandos del Servidor](../COMANDOS_SERVIDOR.md) - PowerShell reference

### Forms Development
- [custom-forms/docs/](../custom-forms/docs/) - Documentación de forms

---

## 🗂️ **Archivos Eliminados**

Los siguientes archivos fueron consolidados o eliminados en esta reorganización:

- ❌ `DEPLOYMENT.md` (root) - Eliminado (duplicado, ver `custom-forms/bizuit-custom-form-sample/DEPLOYMENT_GUIDE.md`)
- ❌ `custom-forms/docs/DYNAMIC_FORMS.md` - Eliminado (approach CDN descartado, obsoleto)

---

## 📝 **Convenciones**

- **Root (/)**: Documentos de acceso rápido (Quick Start, Checklists, Referencias)
- **docs/deployment/**: Deployment y configuración de servidores
- **docs/infrastructure/**: Arquitectura e infraestructura
- **custom-forms/docs/**: Documentación específica de custom forms (submodule)

---

## ✅ **Checklist de Documentación**

### Para New Developer
- [ ] Leer [Quick Start](../QUICK_START.md)
- [ ] Setup environment (5 min)
- [ ] Crear primer form con fat bundle
- [ ] Explorar [custom-forms examples](../custom-forms/bizuit-custom-form-sample/)

### Para Admin de Servidor
- [ ] Leer [Resumen de Configuración](../RESUMEN_CONFIGURACION.md)
- [ ] Completar [Checklist de Servidor](../CHECKLIST_SERVIDOR.md)
- [ ] Bookmark [Comandos del Servidor](../COMANDOS_SERVIDOR.md)
- [ ] Revisar [Pasos Finales](deployment/SERVIDOR_PASOS_FINALES.md) si hay problemas

### Para DevOps
- [ ] Entender [IIS Architecture](infrastructure/IIS_CONFIGURATION_GUIDE.md)
- [ ] Setup [Multi-Client](deployment/MULTI_CLIENT_DEPLOYMENT.md) si es necesario
- [ ] Configurar Azure Pipelines (ver `azure-pipelines.yml`)

---

**Última actualización:** 2025-11-25
**Mantenido por:** Development Team
