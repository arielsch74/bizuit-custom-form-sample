# Script de diagnóstico para verificar el estado del deployment
Write-Host "=== DIAGNÓSTICO DE PRODUCCIÓN ===" -ForegroundColor Cyan
Write-Host ""

# 1. Verificar que los archivos están reemplazados
Write-Host "1. Verificando reemplazos en archivos CSS..." -ForegroundColor Yellow
$cssFile = "E:\BIZUITSites\arielsch\arielschBIZUITCustomForms\.next\static\css\45c37255bbee76e1.css"
if (Test-Path $cssFile) {
    $content = Get-Content $cssFile -Raw
    if ($content -match "__RUNTIME_BASEPATH__") {
        Write-Host "   ❌ PROBLEMA: El archivo CSS todavía contiene __RUNTIME_BASEPATH__" -ForegroundColor Red
        $matches = [regex]::Matches($content, "__RUNTIME_BASEPATH__")
        Write-Host "   Encontradas $($matches.Count) ocurrencias" -ForegroundColor Red
    } else {
        Write-Host "   ✅ OK: El archivo CSS NO contiene __RUNTIME_BASEPATH__" -ForegroundColor Green
    }

    # Verificar si contiene el basePath correcto
    if ($content -match "/arielschBIZUITCustomForms") {
        Write-Host "   ✅ OK: El archivo CSS contiene /arielschBIZUITCustomForms" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  El archivo CSS NO contiene /arielschBIZUITCustomForms" -ForegroundColor Yellow
    }
} else {
    Write-Host "   ❌ El archivo CSS no existe en: $cssFile" -ForegroundColor Red
}

Write-Host ""
Write-Host "2. Verificando archivo de configuración API..." -ForegroundColor Yellow
$configFile = "E:\BIZUITSites\arielsch\arielschBIZUITCustomForms\.next\server\app\api\config\route.js"
if (Test-Path $configFile) {
    Write-Host "   ✅ El archivo route.js existe" -ForegroundColor Green
    $content = Get-Content $configFile -Raw
    if ($content -match "__RUNTIME_BASEPATH__") {
        Write-Host "   ❌ PROBLEMA: route.js todavía contiene __RUNTIME_BASEPATH__" -ForegroundColor Red
    } else {
        Write-Host "   ✅ OK: route.js NO contiene __RUNTIME_BASEPATH__" -ForegroundColor Green
    }
} else {
    Write-Host "   ❌ El archivo route.js no existe" -ForegroundColor Red
}

Write-Host ""
Write-Host "3. Verificando proceso PM2..." -ForegroundColor Yellow
try {
    $pm2List = pm2 list 2>&1
    if ($pm2List -match "arielsch-runtime") {
        Write-Host "   ✅ El proceso arielsch-runtime está en PM2" -ForegroundColor Green

        # Verificar estado
        $pm2Status = pm2 show arielsch-runtime 2>&1 | Out-String
        if ($pm2Status -match "online") {
            Write-Host "   ✅ El proceso está ONLINE" -ForegroundColor Green
        } else {
            Write-Host "   ❌ El proceso NO está online" -ForegroundColor Red
        }
    } else {
        Write-Host "   ❌ El proceso arielsch-runtime NO está en PM2" -ForegroundColor Red
    }
} catch {
    Write-Host "   ❌ Error al verificar PM2: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "4. Verificando acceso local al puerto 3001..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/config" -UseBasicParsing -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        Write-Host "   ✅ /api/config responde correctamente en localhost:3001" -ForegroundColor Green
        $content = $response.Content | ConvertFrom-Json
        Write-Host "   BasePath devuelto: $($content.basePath)" -ForegroundColor Cyan
    }
} catch {
    Write-Host "   ❌ Error al acceder a localhost:3001/api/config: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "5. Verificando IIS..." -ForegroundColor Yellow
Import-Module WebAdministration
$site = Get-WebSite | Where-Object { $_.PhysicalPath -like "*arielschBIZUITCustomForms*" }
if ($site) {
    Write-Host "   ✅ Sitio IIS encontrado: $($site.Name)" -ForegroundColor Green
    Write-Host "   Estado: $($site.State)" -ForegroundColor Cyan
    Write-Host "   Path: $($site.PhysicalPath)" -ForegroundColor Cyan
} else {
    Write-Host "   ❌ No se encontró el sitio IIS" -ForegroundColor Red
}

Write-Host ""
Write-Host "6. Verificando caché de IIS..." -ForegroundColor Yellow
Write-Host "   Ejecutando iisreset para limpiar caché..." -ForegroundColor Gray
iisreset /noforce

Write-Host ""
Write-Host "=== FIN DEL DIAGNÓSTICO ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "RESUMEN:" -ForegroundColor Yellow
Write-Host "Si los archivos CSS contienen __RUNTIME_BASEPATH__, ejecutar:" -ForegroundColor White
Write-Host '   cd E:\BIZUITSites\arielsch\arielschBIZUITCustomForms' -ForegroundColor Green
Write-Host '   $env:RUNTIME_BASEPATH = "/arielschBIZUITCustomForms"' -ForegroundColor Green
Write-Host '   node scripts\prepare-deployment.js' -ForegroundColor Green
Write-Host ""
Write-Host "Luego reiniciar PM2:" -ForegroundColor White
Write-Host '   pm2 restart arielsch-runtime' -ForegroundColor Green