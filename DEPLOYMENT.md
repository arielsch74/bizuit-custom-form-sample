# BIZUIT Custom Forms - Deployment Guide

## Azure DevOps Pipeline

Este proyecto utiliza Azure DevOps para CI/CD automático.

### Configuración del Pipeline

**Agent Pool:** `DARPrestamosAgentPool`
**Deploy Path:** `E:\DevSites\BIZUITCustomForms`
**Port:** `3000`
**Node.js Version:** `22.x`

### Proceso de Deployment

El pipeline ejecuta automáticamente cuando se hace push a la rama `main` con cambios en:
- `/example/**`
- `/packages/**`
- `azure-pipelines.yml`

#### Etapas del Pipeline:

**1. Build Stage:**
- Checkout del código
- Instalación de Node.js 22.x
- `npm ci` para instalar dependencias
- `npm run build` para construir Next.js
- Publicación de artefactos

**2. Deploy Stage:**
- Descarga de artefactos del build
- Detención de la aplicación PM2 existente (si existe)
- Limpieza del directorio de deployment
- Copia de archivos al servidor
- Instalación de dependencias de producción
- Inicio de la aplicación con PM2
- Health check de la aplicación

### PM2 Process Manager

La aplicación se ejecuta con PM2 para gestión de procesos:

```bash
# Ver estado de la aplicación
pm2 list

# Ver logs
pm2 logs bizuit-custom-forms

# Reiniciar
pm2 restart bizuit-custom-forms

# Detener
pm2 stop bizuit-custom-forms

# Ver información detallada
pm2 show bizuit-custom-forms
```

### Deployment Manual

Si necesitas deployar manualmente:

```powershell
# En el servidor de destino

# 1. Navegar al directorio
cd E:\DevSites\BIZUITCustomForms

# 2. Pull del código (o copiar archivos)
git pull

# 3. Instalar dependencias
cd example
npm ci --production

# 4. Build de Next.js
npm run build

# 5. Detener PM2 (si está corriendo)
pm2 stop bizuit-custom-forms
pm2 delete bizuit-custom-forms

# 6. Iniciar con PM2
pm2 start npm --name "bizuit-custom-forms" -- start
pm2 save

# 7. Verificar
pm2 list
```

### Variables de Entorno

Si necesitas configurar variables de entorno, crea un archivo `.env.local` en el directorio `example`:

```env
# Ejemplo de variables
NEXT_PUBLIC_API_URL=https://api.bizuit.com
NEXT_PUBLIC_TENANT_ID=your-tenant-id
```

### Troubleshooting

**Error: Puerto 3000 en uso**
```powershell
# Encontrar proceso usando el puerto
netstat -ano | findstr :3000

# Matar el proceso (reemplazar PID)
taskkill /PID <PID> /F

# O usar PM2
pm2 stop bizuit-custom-forms
```

**Error: PM2 no está instalado**
```powershell
npm install -g pm2
pm2 startup
```

**Error: Build falla**
```powershell
# Limpiar cache y reinstalar
cd example
Remove-Item -Recurse -Force node_modules, .next
npm install
npm run build
```

### Logs y Monitoring

**Ver logs de PM2:**
```powershell
# Logs en tiempo real
pm2 logs bizuit-custom-forms

# Últimas 100 líneas
pm2 logs bizuit-custom-forms --lines 100

# Solo errores
pm2 logs bizuit-custom-forms --err
```

**Monitoreo:**
```powershell
# Dashboard de PM2
pm2 monit

# Información de sistema
pm2 info bizuit-custom-forms
```

### Acceso a la Aplicación

Después del deployment exitoso, la aplicación estará disponible en:

- **Local:** `http://localhost:3000`
- **Red interna:** `http://<server-ip>:3000`

### Rollback

Si necesitas hacer rollback a una versión anterior:

```powershell
# 1. Ir al directorio
cd E:\DevSites\BIZUITCustomForms

# 2. Checkout a commit anterior
git log --oneline -10
git checkout <commit-hash>

# 3. Rebuild y restart
cd example
npm ci --production
npm run build
pm2 restart bizuit-custom-forms
```

### Configuración Inicial del Servidor

**Requisitos:**
- Node.js 22.x instalado
- PM2 instalado globalmente: `npm install -g pm2`
- Git instalado
- Permisos de escritura en `E:\DevSites\BIZUITCustomForms`

**Setup inicial:**
```powershell
# Crear directorio si no existe
New-Item -ItemType Directory -Path "E:\DevSites\BIZUITCustomForms" -Force

# Configurar PM2 para auto-start
pm2 startup
pm2 save
```

### Contacto y Soporte

Para problemas con el deployment, contactar al equipo de DevOps o revisar los logs del pipeline en Azure DevOps.
