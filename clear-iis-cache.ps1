# Script para limpiar COMPLETAMENTE el caché de IIS y forzar archivos frescos
# EJECUTAR EN EL SERVIDOR DE PRODUCCIÓN

Write-Host "=== LIMPIEZA COMPLETA DE CACHÉ IIS ===" -ForegroundColor Cyan
Write-Host ""

# 1. Detener el sitio IIS
Write-Host "1. Deteniendo sitio IIS..." -ForegroundColor Yellow
Import-Module WebAdministration
$site = Get-WebSite | Where-Object { $_.PhysicalPath -like "*arielschBIZUITCustomForms*" }
if ($site) {
    Write-Host "   Sitio encontrado: $($site.Name)" -ForegroundColor Cyan
    Stop-WebSite -Name $site.Name
    Write-Host "   ✅ Sitio detenido" -ForegroundColor Green
} else {
    Write-Host "   ❌ No se encontró el sitio IIS" -ForegroundColor Red
    exit 1
}

# 2. Detener el application pool
Write-Host ""
Write-Host "2. Deteniendo application pool..." -ForegroundColor Yellow
$appPool = $site.applicationPool
if ($appPool) {
    Stop-WebAppPool -Name $appPool
    Write-Host "   ✅ App pool detenido: $appPool" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  No se pudo identificar el app pool" -ForegroundColor Yellow
}

# 3. Limpiar caché de IIS
Write-Host ""
Write-Host "3. Limpiando caché de IIS..." -ForegroundColor Yellow

# Limpiar caché de kernel (http.sys)
Write-Host "   Limpiando caché de kernel (http.sys)..." -ForegroundColor Gray
netsh http flush logbuffer
Write-Host "   ✅ Caché de kernel limpiado" -ForegroundColor Green

# Limpiar archivos temporales de IIS
Write-Host "   Limpiando archivos temporales de IIS..." -ForegroundColor Gray
$iisTemp = "C:\Windows\Temp\IIS Temporary Compressed Files"
if (Test-Path $iisTemp) {
    Remove-Item -Path "$iisTemp\*" -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "   ✅ Archivos temporales limpiados" -ForegroundColor Green
} else {
    Write-Host "   ℹ️  No existe: $iisTemp" -ForegroundColor Gray
}

# Limpiar caché de respuestas de IIS
Write-Host "   Limpiando caché de respuestas HTTP..." -ForegroundColor Gray
$cacheDir = "C:\Windows\System32\inetsrv\MetaBase"
if (Test-Path $cacheDir) {
    Remove-Item -Path "$cacheDir\*.tmp" -Force -ErrorAction SilentlyContinue
    Write-Host "   ✅ Caché de respuestas limpiado" -ForegroundColor Green
}

# 4. Limpiar web.config cache
Write-Host ""
Write-Host "4. Forzando recarga de web.config..." -ForegroundColor Yellow
$webConfigPath = "E:\BIZUITSites\arielsch\arielschBIZUITCustomForms\web.config"
if (Test-Path $webConfigPath) {
    # Tocar el archivo para forzar recarga
    (Get-Item $webConfigPath).LastWriteTime = Get-Date
    Write-Host "   ✅ web.config actualizado" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  No se encontró web.config" -ForegroundColor Yellow
}

# 5. Reiniciar PM2 (para asegurar que Node.js también se reinicie)
Write-Host ""
Write-Host "5. Reiniciando PM2..." -ForegroundColor Yellow
pm2 restart arielsch-runtime
Start-Sleep -Seconds 3

$pm2Status = pm2 show arielsch-runtime 2>&1 | Out-String
if ($pm2Status -match "online") {
    Write-Host "   ✅ PM2 reiniciado y online" -ForegroundColor Green
} else {
    Write-Host "   ❌ PM2 no está online" -ForegroundColor Red
}

# 6. Reiniciar IIS completamente
Write-Host ""
Write-Host "6. Reiniciando IIS..." -ForegroundColor Yellow
iisreset /noforce
Write-Host "   ✅ IIS reiniciado" -ForegroundColor Green

# 7. Iniciar application pool
Write-Host ""
Write-Host "7. Iniciando application pool..." -ForegroundColor Yellow
if ($appPool) {
    Start-WebAppPool -Name $appPool
    Start-Sleep -Seconds 2
    Write-Host "   ✅ App pool iniciado" -ForegroundColor Green
}

# 8. Iniciar sitio IIS
Write-Host ""
Write-Host "8. Iniciando sitio IIS..." -ForegroundColor Yellow
Start-WebSite -Name $site.Name
Start-Sleep -Seconds 2
Write-Host "   ✅ Sitio iniciado" -ForegroundColor Green

# 9. Verificar que todo esté corriendo
Write-Host ""
Write-Host "9. Verificando estado..." -ForegroundColor Yellow

# Verificar IIS
$siteState = (Get-WebSite -Name $site.Name).State
if ($siteState -eq "Started") {
    Write-Host "   ✅ IIS Site: Started" -ForegroundColor Green
} else {
    Write-Host "   ❌ IIS Site: $siteState" -ForegroundColor Red
}

# Verificar PM2
$pm2List = pm2 list 2>&1 | Out-String
if ($pm2List -match "arielsch-runtime.*online") {
    Write-Host "   ✅ PM2: online" -ForegroundColor Green
} else {
    Write-Host "   ❌ PM2: not online" -ForegroundColor Red
}

# Verificar que el puerto responde
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/config" -UseBasicParsing -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        Write-Host "   ✅ API responde en localhost:3001" -ForegroundColor Green
    }
} catch {
    Write-Host "   ❌ API no responde: $($_.Exception.Message)" -ForegroundColor Red
}

# 10. CRÍTICO: Verificar archivos en el file system
Write-Host ""
Write-Host "10. Verificando archivos en disco..." -ForegroundColor Yellow
$cssFile = "E:\BIZUITSites\arielsch\arielschBIZUITCustomForms\.next\static\css\45c37255bbee76e1.css"
if (Test-Path $cssFile) {
    $content = Get-Content $cssFile -Raw
    if ($content -match "__RUNTIME_BASEPATH__") {
        Write-Host "   ❌ PROBLEMA: CSS todavía contiene __RUNTIME_BASEPATH__" -ForegroundColor Red
        Write-Host "   Ejecutar: cd E:\BIZUITSites\arielsch\arielschBIZUITCustomForms" -ForegroundColor Yellow
        Write-Host '   $env:RUNTIME_BASEPATH = "/arielschBIZUITCustomForms"' -ForegroundColor Yellow
        Write-Host "   node scripts\prepare-deployment.js" -ForegroundColor Yellow
    } else {
        Write-Host "   ✅ CSS NO contiene __RUNTIME_BASEPATH__" -ForegroundColor Green
    }
} else {
    Write-Host "   ❌ CSS no existe: $cssFile" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== LIMPIEZA COMPLETA ===`n" -ForegroundColor Cyan
Write-Host "Próximos pasos:" -ForegroundColor Yellow
Write-Host "1. Abrir navegador en MODO INCOGNITO (Ctrl+Shift+N)" -ForegroundColor White
Write-Host "2. O bien, limpiar caché del navegador (Ctrl+Shift+Del)" -ForegroundColor White
Write-Host "3. Navegar a: https://test.bizuit.com/arielschBIZUITCustomForms/" -ForegroundColor White
Write-Host "4. Verificar en DevTools → Network que los archivos se sirven con Cache-Control: no-cache" -ForegroundColor White
Write-Host ""
