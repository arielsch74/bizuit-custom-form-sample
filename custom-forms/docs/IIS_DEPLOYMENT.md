# IIS Deployment con Reverse Proxy

Guía completa para configurar IIS con reverse proxy para Next.js (3001) y FastAPI (8000).

## 📋 Prerequisitos

### 1. Instalar URL Rewrite Module
```powershell
# Descarga desde:
https://www.iis.net/downloads/microsoft/url-rewrite

# O instala con Web Platform Installer:
# https://www.microsoft.com/web/downloads/platform.aspx
```

### 2. Instalar Application Request Routing (ARR)
```powershell
# Descarga desde:
https://www.iis.net/downloads/microsoft/application-request-routing

# O con Web Platform Installer:
# Buscar "Application Request Routing"
```

### 3. Habilitar ARR Proxy
1. Abre IIS Manager
2. Click en el servidor (nivel superior)
3. Doble click en "Application Request Routing Cache"
4. Click en "Server Proxy Settings" (panel derecho)
5. ✅ Check "Enable proxy"
6. Click "Apply"

### 4. Instalar NSSM (Non-Sucking Service Manager)
```powershell
# Descarga desde:
https://nssm.cc/download

# Extrae nssm.exe a: C:\nssm\nssm.exe
```

## 🚀 Instalación

### Paso 1: Preparar Backend FastAPI

```powershell
cd C:\inetpub\wwwroot\BIZUITCustomForms\backend-api

# Crear virtual environment
python -m venv venv

# Activar venv
.\venv\Scripts\activate

# Instalar dependencias
pip install -r requirements.txt

# Configurar .env
copy .env.example .env
# Editar .env con las credenciales correctas

# Test manual
python main.py
# Debe decir: "Uvicorn running on http://0.0.0.0:8000"
# Ctrl+C para detener
```

### Paso 2: Instalar FastAPI como Windows Service

```powershell
cd C:\inetpub\wwwroot\BIZUITCustomForms\backend-api

# Ejecutar script de instalación
.\install-windows-service.ps1

# Si tienes Python en otra ubicación:
.\install-windows-service.ps1 -PythonPath "C:\Python311\python.exe"

# Verificar servicio
Get-Service BizuitCustomFormsAPI

# Test del API
curl http://localhost:8000/health
```

### Paso 3: Preparar Runtime App (Next.js)

```powershell
cd C:\inetpub\wwwroot\BIZUITCustomForms\runtime-app

# Instalar dependencias
npm install

# Build de producción
npm run build

# Test manual
npm start
# Debe decir: "ready on http://localhost:3001"
# Ctrl+C para detener
```

### Paso 4: Configurar IIS Site

1. **Crear App Pool**:
   ```powershell
   # En IIS Manager:
   # - Application Pools > Add Application Pool
   # - Name: BizuitCustomFormsRuntime
   # - .NET CLR version: No Managed Code
   # - Start immediately: ✅
   ```

2. **Crear/Configurar Site**:
   ```powershell
   # En IIS Manager:
   # - Sites > Add Website (o usa existente)
   # - Site name: BizuitCustomForms
   # - Physical path: C:\inetpub\wwwroot\BIZUITCustomForms\runtime-app
   # - Binding:
   #   - Type: http
   #   - IP: All Unassigned
   #   - Port: 80 (o tu puerto público)
   #   - Host name: test.bizuit.com (opcional)
   # - Application pool: BizuitCustomFormsRuntime
   ```

3. **Verificar web.config**:
   - Debe existir: `C:\inetpub\wwwroot\BIZUITCustomForms\runtime-app\web.config`
   - Contiene reglas para proxy a localhost:3001 y localhost:8000

### Paso 5: Configurar Next.js como Windows Service (Opcional pero recomendado)

```powershell
cd C:\inetpub\wwwroot\BIZUITCustomForms\runtime-app

# Crear script de inicio (start-nextjs.bat)
@echo off
cd C:\inetpub\wwwroot\BIZUITCustomForms\runtime-app
npm start

# Instalar con NSSM
C:\nssm\nssm.exe install BizuitCustomFormsRuntime "C:\inetpub\wwwroot\BIZUITCustomForms\runtime-app\start-nextjs.bat"
C:\nssm\nssm.exe set BizuitCustomFormsRuntime AppDirectory "C:\inetpub\wwwroot\BIZUITCustomForms\runtime-app"
C:\nssm\nssm.exe set BizuitCustomFormsRuntime DisplayName "Bizuit Custom Forms Runtime (Next.js)"
C:\nssm\nssm.exe set BizuitCustomFormsRuntime Description "Next.js runtime app para custom forms dinámicos"

# Iniciar servicio
C:\nssm\nssm.exe start BizuitCustomFormsRuntime
```

## 🧪 Verificación

### 1. Verificar servicios Windows
```powershell
Get-Service BizuitCustomFormsAPI
Get-Service BizuitCustomFormsRuntime

# Ambos deben estar en "Running"
```

### 2. Test endpoints locales
```powershell
# FastAPI
curl http://localhost:8000/health
# Debe retornar: {"status":"healthy"...}

# Next.js
curl http://localhost:3001
# Debe retornar: HTML de la página principal
```

### 3. Test a través de IIS
```powershell
# Página principal
curl http://test.bizuit.com/BIZUITCustomForms

# API Next.js (custom forms)
curl http://test.bizuit.com/BIZUITCustomForms/api/custom-forms/aprobacion-gastos/code

# API FastAPI (deployment)
curl http://test.bizuit.com/BIZUITCustomForms/api/deployment/upload -X POST
# Debe retornar error de "No file uploaded" (es correcto, solo verifica que llega)
```

## 📊 Arquitectura Final

```
Usuario → IIS (Puerto 80/443)
            ↓
         web.config (URL Rewrite)
            ↓
    ┌───────┴────────┐
    ↓                ↓
localhost:3001   localhost:8000
(Next.js)        (FastAPI)
    ↓                ↓
SQL Server ←────────┘
```

## 🔧 Troubleshooting

### Error: "502 Bad Gateway"
**Causa**: IIS no puede conectar a localhost:3001 o localhost:8000
**Solución**:
```powershell
# Verificar que los servicios están corriendo
Get-Service BizuitCustomFormsAPI
Get-Service BizuitCustomFormsRuntime

# Verificar puertos
netstat -ano | findstr "3001"
netstat -ano | findstr "8000"

# Reiniciar servicios
Restart-Service BizuitCustomFormsAPI
Restart-Service BizuitCustomFormsRuntime
```

### Error: "HTTP 413 Request Entity Too Large"
**Causa**: Upload de .zip excede límite de IIS
**Solución**: Ya configurado en web.config (100 MB), pero verificar:
```powershell
# En IIS Manager:
# - Site > Request Filtering > Edit Feature Settings
# - Maximum allowed content length: 104857600 (100 MB)
```

### Error: "Module not found: url_rewrite"
**Causa**: URL Rewrite Module no instalado
**Solución**: Instalar desde https://www.iis.net/downloads/microsoft/url-rewrite

### Logs del FastAPI Service
```powershell
# Ver logs en tiempo real
Get-Content "C:\inetpub\wwwroot\BIZUITCustomForms\backend-api\logs\stdout.log" -Tail 50 -Wait

# Ver errores
Get-Content "C:\inetpub\wwwroot\BIZUITCustomForms\backend-api\logs\stderr.log" -Tail 50
```

### Reiniciar todo
```powershell
# Detener servicios
Stop-Service BizuitCustomFormsAPI
Stop-Service BizuitCustomFormsRuntime

# Reiniciar App Pool de IIS
Restart-WebAppPool BizuitCustomFormsRuntime

# Iniciar servicios
Start-Service BizuitCustomFormsAPI
Start-Service BizuitCustomFormsRuntime

# Verificar
curl http://localhost:8000/health
curl http://localhost:3001
curl http://test.bizuit.com/BIZUITCustomForms
```

## 🔐 Seguridad

### 1. Firewall
Solo permitir acceso externo a IIS (puerto 80/443):
```powershell
# Bloquear acceso externo a puertos internos
New-NetFirewallRule -DisplayName "Block FastAPI External" -Direction Inbound -LocalPort 8000 -Protocol TCP -Action Block -RemoteAddress Any
New-NetFirewallRule -DisplayName "Block Next.js External" -Direction Inbound -LocalPort 3001 -Protocol TCP -Action Block -RemoteAddress Any

# Permitir localhost
New-NetFirewallRule -DisplayName "Allow FastAPI Localhost" -Direction Inbound -LocalPort 8000 -Protocol TCP -Action Allow -RemoteAddress 127.0.0.1
New-NetFirewallRule -DisplayName "Allow Next.js Localhost" -Direction Inbound -LocalPort 3001 -Protocol TCP -Action Allow -RemoteAddress 127.0.0.1
```

### 2. Permisos de archivos
```powershell
# IIS_IUSRS necesita acceso de lectura
$path = "C:\inetpub\wwwroot\BIZUITCustomForms\runtime-app"
icacls $path /grant "IIS_IUSRS:(OI)(CI)R" /T
```

## 📝 Comandos útiles

```powershell
# Ver servicios
Get-Service | Where-Object {$_.Name -like "*Bizuit*"}

# Logs FastAPI
Get-Content "C:\...\backend-api\logs\stdout.log" -Tail 50 -Wait

# Reiniciar App Pool IIS
Restart-WebAppPool BizuitCustomFormsRuntime

# Test endpoints
curl http://localhost:8000/health
curl http://localhost:3001
curl http://test.bizuit.com/BIZUITCustomForms/api/deployment/upload

# Ver puertos en uso
netstat -ano | findstr "3001 8000 80"
```
