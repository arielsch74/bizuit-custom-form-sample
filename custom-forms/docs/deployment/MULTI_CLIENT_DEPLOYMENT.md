# Deployment de Múltiples Clientes - BIZUIT Custom Forms

**Última actualización:** 2025-11-20
**Propósito:** Guía para instalar BIZUIT Custom Forms para múltiples clientes en el mismo servidor Windows con IIS + PM2

---

## 📋 Arquitectura Multi-Cliente

Cada cliente tiene:
- **Frontend (Runtime App)**: Next.js en PM2 con puerto único
- **Backend API**: FastAPI en PM2 con puerto único
- **IIS Applications**: Dos aplicaciones IIS apuntando a los directorios del cliente
- **Application Pool**: Compartido o dedicado (opcional)

```
test.bizuit.com
├── /arielschBIZUITCustomForms     → PM2 (localhost:3001) → Next.js
├── /arielschBIZUITCustomFormsbackend → PM2 (localhost:8000) → FastAPI
├── /cliente2BIZUITCustomForms     → PM2 (localhost:3002) → Next.js
├── /cliente2BIZUITCustomFormsbackend → PM2 (localhost:8001) → FastAPI
└── /cliente3BIZUITCustomForms     → PM2 (localhost:3003) → Next.js
    └── /cliente3BIZUITCustomFormsbackend → PM2 (localhost:8002) → FastAPI
```

---

## ⚙️ Asignación de Puertos

**Regla:** Cada cliente necesita 2 puertos únicos (frontend + backend)

| Cliente | Frontend (PM2) | Backend (PM2) | IIS Frontend | IIS Backend |
|---------|---------------|---------------|--------------|-------------|
| arielsch | 3001 | 8000 | /arielschBIZUITCustomForms | /arielschBIZUITCustomFormsbackend |
| cliente2 | 3002 | 8001 | /cliente2BIZUITCustomForms | /cliente2BIZUITCustomFormsbackend |
| cliente3 | 3003 | 8002 | /cliente3BIZUITCustomForms | /cliente3BIZUITCustomFormsbackend |

**IMPORTANTE:** Documenta los puertos asignados para evitar conflictos.

---

## 🚀 Pasos para Deploy de Nuevo Cliente

### 1. Preparar Directorios

```powershell
# Crear directorios para el nuevo cliente
$cliente = "cliente2"  # Cambiar por el nombre del cliente

# Crear estructura de directorios
New-Item -ItemType Directory -Force -Path "E:\BIZUITSites\$cliente\${cliente}BIZUITCustomForms"
New-Item -ItemType Directory -Force -Path "E:\BIZUITSites\$cliente\${cliente}BIZUITCustomFormsBackEnd"
```

---

### 2. Ejecutar Pipeline de Azure DevOps

El pipeline de deployment debe estar configurado para:
1. Usar variables para el nombre del cliente
2. Desplegar artifacts a los directorios correctos
3. Crear archivos `.env.local` con configuración específica del cliente

**Variables del pipeline:**
```yaml
variables:
  clientName: 'cliente2'
  frontendPort: '3002'
  backendPort: '8001'
  deployPath: 'E:\BIZUITSites\$(clientName)'
```

El pipeline automáticamente:
- ✅ Copia archivos de runtime y backend
- ✅ Crea `web.config` desde `web.config.production`
- ✅ Crea `.env.local` para runtime
- ✅ Crea `.env.local` para backend
- ✅ Configura PM2 processes

---

### 3. Actualizar web.config con Puertos Correctos

**⚠️ CRÍTICO:** Después del deploy, actualizar los puertos en los archivos `web.config`

#### Frontend web.config

```powershell
cd E:\BIZUITSites\$cliente\${cliente}BIZUITCustomForms
notepad web.config
```

**Buscar y reemplazar:**
```xml
<!-- ANTES (template por defecto) -->
<action type="Rewrite" url="http://localhost:3001/{R:1}" />

<!-- DESPUÉS (con puerto del cliente) -->
<action type="Rewrite" url="http://localhost:3002/{R:1}" />
```

#### Backend web.config

```powershell
cd E:\BIZUITSites\$cliente\${cliente}BIZUITCustomFormsBackEnd
notepad web.config
```

**Buscar y reemplazar:**
```xml
<!-- ANTES (template por defecto) -->
<action type="Rewrite" url="http://localhost:8000/{R:1}" />

<!-- DESPUÉS (con puerto del cliente) -->
<action type="Rewrite" url="http://localhost:8001/{R:1}" />
```

---

### 4. Crear Application Pool (Opcional)

**Opción A: Crear AppPool dedicado por cliente**

```powershell
# Crear AppPool dedicado
New-WebAppPool -Name "${cliente}CustomFormsPool"

# Configurar (opcional)
Set-ItemProperty IIS:\AppPools\${cliente}CustomFormsPool -Name managedRuntimeVersion -Value ""
Set-ItemProperty IIS:\AppPools\${cliente}CustomFormsPool -Name enable32BitAppOnWin64 -Value $false
```

**Opción B: Usar AppPool existente (DefaultAppPool)**

No requiere crear nuevo AppPool. Todas las aplicaciones comparten `DefaultAppPool`.

---

### 5. Crear Aplicaciones IIS

```powershell
Import-Module WebAdministration

# Variables
$cliente = "cliente2"
$appPool = "${cliente}CustomFormsPool"  # O "DefaultAppPool" si usas el compartido

# Crear aplicación Frontend
New-WebApplication `
  -Name "${cliente}BIZUITCustomForms" `
  -Site "Default Web Site" `
  -PhysicalPath "E:\BIZUITSites\$cliente\${cliente}BIZUITCustomForms" `
  -ApplicationPool $appPool

# Crear aplicación Backend
New-WebApplication `
  -Name "${cliente}BIZUITCustomFormsbackend" `
  -Site "Default Web Site" `
  -PhysicalPath "E:\BIZUITSites\$cliente\${cliente}BIZUITCustomFormsBackEnd" `
  -ApplicationPool $appPool

# Verificar que se crearon
Get-WebApplication -Site "Default Web Site" | Where-Object { $_.Path -like "*$cliente*" }
```

---

### 6. Configurar PM2 para el Nuevo Cliente

#### Opción A: Usar ecosystem.config.js centralizado

```powershell
# Ir al directorio de PM2 config (crear si no existe)
cd E:\BIZUITSites
notepad ecosystem.config.js
```

**Agregar nuevos servicios al archivo:**

```javascript
module.exports = {
  apps: [
    // Cliente arielsch (existente)
    {
      name: 'arielsch-runtime',
      script: 'npm',
      args: 'start',
      cwd: 'E:\\BIZUITSites\\arielsch\\arielschBIZUITCustomForms',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      }
    },
    {
      name: 'arielsch-backend',
      script: 'python',
      args: '-m uvicorn main:app --host 0.0.0.0 --port 8000',
      cwd: 'E:\\BIZUITSites\\arielsch\\arielschBIZUITCustomFormsBackEnd',
      interpreter: 'python'
    },

    // NUEVO: Cliente2
    {
      name: 'cliente2-runtime',
      script: 'npm',
      args: 'start',
      cwd: 'E:\\BIZUITSites\\cliente2\\cliente2BIZUITCustomForms',
      env: {
        NODE_ENV: 'production',
        PORT: 3002  // Puerto único
      }
    },
    {
      name: 'cliente2-backend',
      script: 'python',
      args: '-m uvicorn main:app --host 0.0.0.0 --port 8001',  // Puerto único
      cwd: 'E:\\BIZUITSites\\cliente2\\cliente2BIZUITCustomFormsBackEnd',
      interpreter: 'python'
    }
  ]
}
```

#### Opción B: Usar ecosystem.config.js por cliente

Crear archivo en el directorio del cliente y cargar individualmente.

---

### 7. Iniciar Servicios PM2

```powershell
# Si usas ecosystem.config.js centralizado
cd E:\BIZUITSites
pm2 start ecosystem.config.js --update-env

# O iniciar servicios individuales
pm2 start "E:\BIZUITSites\cliente2\cliente2BIZUITCustomForms\ecosystem.config.js"

# Guardar configuración PM2
pm2 save

# Verificar que están corriendo
pm2 list
pm2 logs cliente2-runtime --lines 20
pm2 logs cliente2-backend --lines 20
```

---

### 8. Reciclar Application Pool

```powershell
# Si creaste AppPool dedicado
Restart-WebAppPool -Name "${cliente}CustomFormsPool"

# Si usas DefaultAppPool
Restart-WebAppPool -Name "DefaultAppPool"

# O hacer iisreset completo
iisreset
```

---

### 9. Verificación Final

```powershell
# Variables
$cliente = "cliente2"

# Test 1: Verificar PM2 está corriendo
pm2 list | Select-String "$cliente"

# Test 2: Probar localhost directamente
curl http://localhost:3002  # Frontend debe responder HTML
curl http://localhost:8001/health  # Backend debe responder JSON

# Test 3: Probar vía IIS
curl http://test.bizuit.com/${cliente}BIZUITCustomForms/
curl http://test.bizuit.com/${cliente}BIZUITCustomFormsbackend/health

# Test 4: Verificar IIS applications
Get-WebApplication -Site "Default Web Site" | Where-Object { $_.Path -like "*$cliente*" }
```

**✅ Checklist de verificación:**
- [ ] PM2 muestra ambos procesos como `online`
- [ ] `curl localhost:3002` retorna HTML de Next.js
- [ ] `curl localhost:8001/health` retorna JSON de FastAPI
- [ ] `curl http://test.bizuit.com/${cliente}BIZUITCustomForms/` retorna HTML (no 403/404)
- [ ] `curl http://test.bizuit.com/${cliente}BIZUITCustomFormsbackend/health` retorna JSON
- [ ] No hay errores en logs de PM2: `pm2 logs ${cliente}-runtime --lines 50`

---

## 🔧 Troubleshooting

### Error: PM2 proceso no inicia

```powershell
# Ver logs detallados
pm2 logs cliente2-runtime --err --lines 100

# Verificar que el puerto no está ocupado
netstat -ano | findstr "3002"

# Reiniciar proceso
pm2 restart cliente2-runtime
pm2 logs cliente2-runtime --lines 20
```

### Error: IIS devuelve 403.14 o 404.4

**Causa:** web.config no se está procesando o ARR no está habilitado.

**Solución:**

```powershell
# Verificar que ARR está habilitado globalmente
cd "%ProgramFiles%\IIS\Application Request Routing"
appcmd.exe set config -section:system.webServer/proxy /enabled:"True" /commit:apphost

# Verificar que web.config existe
dir E:\BIZUITSites\cliente2\cliente2BIZUITCustomForms\web.config
dir E:\BIZUITSites\cliente2\cliente2BIZUITCustomFormsBackEnd\web.config

# Reciclar IIS
iisreset
```

### Error: Puerto ya está en uso

```powershell
# Ver qué proceso está usando el puerto
netstat -ano | findstr "3002"

# Matar proceso por PID (si es necesario)
taskkill /PID <PID> /F

# Reasignar puerto en ecosystem.config.js y web.config
# Luego reiniciar PM2 e IIS
```

### Error: Backend no conecta a base de datos

Verificar `.env.local` del backend tiene la configuración correcta:

```powershell
cd E:\BIZUITSites\cliente2\cliente2BIZUITCustomFormsBackEnd
type .env.local
```

Debe contener:
```env
DATABASE_URL=sqlite:///./path/to/database.db
SECRET_KEY=your-secret-key
BIZUIT_API_BASE_URL=https://bpm-server.com/api
```

---

## 📊 Mantenimiento

### Ver todos los procesos PM2

```powershell
pm2 list
pm2 monit  # Vista interactiva
```

### Reiniciar todos los servicios de un cliente

```powershell
pm2 restart cliente2-runtime
pm2 restart cliente2-backend
```

### Detener servicios de un cliente

```powershell
pm2 stop cliente2-runtime
pm2 stop cliente2-backend
```

### Eliminar servicios de un cliente

```powershell
pm2 delete cliente2-runtime
pm2 delete cliente2-backend
pm2 save  # Guardar configuración
```

### Ver logs en tiempo real

```powershell
pm2 logs cliente2-runtime --lines 50 --raw
pm2 logs cliente2-backend --lines 50 --raw
```

---

## 🔐 Seguridad

### Aislar clientes con AppPools dedicados

**Ventajas:**
- Aislamiento de memoria
- Si un cliente causa crash, no afecta a otros
- Límites de CPU/memoria por cliente

**Desventajas:**
- Mayor consumo de recursos
- Más complejidad administrativa

### Uso de AppPool compartido (DefaultAppPool)

**Ventajas:**
- Menor consumo de recursos
- Configuración más simple

**Desventajas:**
- Sin aislamiento entre clientes
- Crash afecta a todos

**Recomendación:** Usar AppPool dedicado para clientes grandes/críticos, compartido para clientes pequeños.

---

## 📝 Checklist de Deploy Completo

- [ ] **Paso 1:** Preparar directorios del cliente
- [ ] **Paso 2:** Ejecutar pipeline de Azure DevOps
- [ ] **Paso 3:** Actualizar puertos en web.config (frontend y backend)
- [ ] **Paso 4:** Crear Application Pool (si es dedicado)
- [ ] **Paso 5:** Crear IIS Applications (frontend y backend)
- [ ] **Paso 6:** Actualizar ecosystem.config.js con nuevos servicios
- [ ] **Paso 7:** Iniciar servicios PM2 (`pm2 start` + `pm2 save`)
- [ ] **Paso 8:** Reciclar Application Pool
- [ ] **Paso 9:** Verificar acceso vía localhost
- [ ] **Paso 10:** Verificar acceso vía IIS (test.bizuit.com)
- [ ] **Paso 11:** Probar funcionalidad end-to-end
- [ ] **Paso 12:** Documentar puertos asignados

**Tiempo estimado total:** ~15-20 minutos por cliente

---

## 🎯 Script de Automatización (Opcional)

Crear script PowerShell para automatizar el proceso:

```powershell
# new-client-deploy.ps1
param(
    [string]$clientName,
    [int]$frontendPort,
    [int]$backendPort,
    [string]$appPool = "DefaultAppPool"
)

# Validar parámetros
if (-not $clientName -or -not $frontendPort -or -not $backendPort) {
    Write-Error "Uso: .\new-client-deploy.ps1 -clientName cliente2 -frontendPort 3002 -backendPort 8001"
    exit 1
}

# 1. Crear directorios
Write-Host "Creando directorios para $clientName..."
New-Item -ItemType Directory -Force -Path "E:\BIZUITSites\$clientName\${clientName}BIZUITCustomForms"
New-Item -ItemType Directory -Force -Path "E:\BIZUITSites\$clientName\${clientName}BIZUITCustomFormsBackEnd"

# 2. Copiar web.config template (después de que pipeline copie archivos)
Write-Host "Recordatorio: Ejecutar pipeline de Azure DevOps primero"

# 3. Crear IIS Applications
Write-Host "Creando IIS Applications..."
Import-Module WebAdministration

New-WebApplication `
  -Name "${clientName}BIZUITCustomForms" `
  -Site "Default Web Site" `
  -PhysicalPath "E:\BIZUITSites\$clientName\${clientName}BIZUITCustomForms" `
  -ApplicationPool $appPool

New-WebApplication `
  -Name "${clientName}BIZUITCustomFormsbackend" `
  -Site "Default Web Site" `
  -PhysicalPath "E:\BIZUITSites\$clientName\${clientName}BIZUITCustomFormsBackEnd" `
  -ApplicationPool $appPool

# 4. Actualizar ecosystem.config.js
Write-Host "Recordatorio: Actualizar ecosystem.config.js manualmente con puertos $frontendPort y $backendPort"

# 5. Reciclar IIS
Write-Host "Reciclando Application Pool..."
Restart-WebAppPool -Name $appPool

Write-Host @"

✅ Deploy preparado para: $clientName

PRÓXIMOS PASOS MANUALES:
1. Actualizar web.config frontend con puerto $frontendPort
2. Actualizar web.config backend con puerto $backendPort
3. Actualizar ecosystem.config.js con servicios de $clientName
4. Ejecutar: pm2 start ecosystem.config.js --update-env
5. Ejecutar: pm2 save
6. Verificar: curl http://test.bizuit.com/${clientName}BIZUITCustomForms/

"@
```

**Uso:**
```powershell
.\new-client-deploy.ps1 -clientName cliente2 -frontendPort 3002 -backendPort 8001
```

---

## 📖 Referencias

- [IIS_CONFIGURATION_GUIDE.md](../infrastructure/IIS_CONFIGURATION_GUIDE.md) - Arquitectura IIS + PM2
- [SERVIDOR_PASOS_FINALES.md](./SERVIDOR_PASOS_FINALES.md) - Configuración inicial
- [PM2_WINDOWS_SETUP.md](../infrastructure/PM2_WINDOWS_SETUP.md) - Setup de PM2
- [DEPLOYMENT_GUIDE.md](../../bizuit-custom-form-sample/DEPLOYMENT_GUIDE.md) - Deployment detallado

---

**Creado:** 2025-11-20
**Mantenido por:** DevOps Team
**Última actualización:** 2025-11-20
