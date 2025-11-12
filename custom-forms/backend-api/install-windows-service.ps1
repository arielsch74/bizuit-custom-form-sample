# =============================================
# Script: Install FastAPI as Windows Service
# Requiere: NSSM (Non-Sucking Service Manager)
# Descarga: https://nssm.cc/download
# =============================================

param(
    [string]$ServiceName = "BizuitCustomFormsAPI",
    [string]$PythonPath = "C:\Python310\python.exe",  # Ajustar según instalación
    [string]$WorkingDir = $PSScriptRoot,
    [int]$Port = 8000
)

# Verificar que NSSM está instalado
$nssmPath = "C:\nssm\nssm.exe"  # Ajustar si está en otro lugar
if (-not (Test-Path $nssmPath)) {
    Write-Error "NSSM no encontrado en: $nssmPath"
    Write-Host "Descarga NSSM de: https://nssm.cc/download"
    Write-Host "Extrae nssm.exe a C:\nssm\"
    exit 1
}

Write-Host "=== Instalando FastAPI como Windows Service ===" -ForegroundColor Green
Write-Host "Service Name: $ServiceName"
Write-Host "Working Dir: $WorkingDir"
Write-Host "Port: $Port"

# Verificar que existe el virtual environment
$venvPython = Join-Path $WorkingDir "venv\Scripts\python.exe"
if (-not (Test-Path $venvPython)) {
    Write-Error "Virtual environment no encontrado: $venvPython"
    Write-Host "Ejecuta primero: python -m venv venv"
    exit 1
}

# Detener y eliminar servicio si ya existe
$existingService = Get-Service -Name $ServiceName -ErrorAction SilentlyContinue
if ($existingService) {
    Write-Host "Deteniendo servicio existente..." -ForegroundColor Yellow
    & $nssmPath stop $ServiceName
    Start-Sleep -Seconds 2

    Write-Host "Eliminando servicio existente..." -ForegroundColor Yellow
    & $nssmPath remove $ServiceName confirm
}

# Instalar servicio
Write-Host "Instalando servicio..." -ForegroundColor Green
& $nssmPath install $ServiceName $venvPython

# Configurar parámetros del servicio
& $nssmPath set $ServiceName AppParameters "-m uvicorn main:app --host 0.0.0.0 --port $Port --workers 2"
& $nssmPath set $ServiceName AppDirectory $WorkingDir
& $nssmPath set $ServiceName DisplayName "Bizuit Custom Forms Deployment API"
& $nssmPath set $ServiceName Description "FastAPI backend para deployment de custom forms dinámicos"

# Configurar logs
$logsDir = Join-Path $WorkingDir "logs"
if (-not (Test-Path $logsDir)) {
    New-Item -ItemType Directory -Path $logsDir | Out-Null
}

$stdoutLog = Join-Path $logsDir "stdout.log"
$stderrLog = Join-Path $logsDir "stderr.log"

& $nssmPath set $ServiceName AppStdout $stdoutLog
& $nssmPath set $ServiceName AppStderr $stderrLog

# Configurar rotación de logs (10 MB por archivo)
& $nssmPath set $ServiceName AppRotateFiles 1
& $nssmPath set $ServiceName AppRotateBytes 10485760

# Configurar reinicio automático
& $nssmPath set $ServiceName AppExit Default Restart
& $nssmPath set $ServiceName AppRestartDelay 5000

# Configurar variables de entorno desde .env
Write-Host "Configurando variables de entorno..." -ForegroundColor Green
$envFile = Join-Path $WorkingDir ".env"
if (Test-Path $envFile) {
    Get-Content $envFile | ForEach-Object {
        if ($_ -match '^([^#][^=]+)=(.+)$') {
            $key = $matches[1].Trim()
            $value = $matches[2].Trim()
            & $nssmPath set $ServiceName AppEnvironmentExtra "$key=$value"
        }
    }
}

# Iniciar servicio
Write-Host "Iniciando servicio..." -ForegroundColor Green
& $nssmPath start $ServiceName

Start-Sleep -Seconds 3

# Verificar estado
$service = Get-Service -Name $ServiceName -ErrorAction SilentlyContinue
if ($service -and $service.Status -eq 'Running') {
    Write-Host "`n✅ Servicio instalado e iniciado exitosamente!" -ForegroundColor Green
    Write-Host "`nInformación del servicio:"
    Write-Host "  Nombre: $ServiceName"
    Write-Host "  Estado: $($service.Status)"
    Write-Host "  Puerto: $Port"
    Write-Host "  Logs: $logsDir"
    Write-Host "`nComandos útiles:"
    Write-Host "  Ver status: Get-Service $ServiceName"
    Write-Host "  Reiniciar: Restart-Service $ServiceName"
    Write-Host "  Detener: Stop-Service $ServiceName"
    Write-Host "  Logs: Get-Content '$stdoutLog' -Tail 50"
    Write-Host "`nTest del API:"
    Write-Host "  curl http://localhost:$Port/health"
} else {
    Write-Error "❌ Error al iniciar el servicio"
    Write-Host "Revisa los logs en: $stderrLog"
}
