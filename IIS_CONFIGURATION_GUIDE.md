# Guía de Configuración IIS para BIZUIT Custom Forms

## Arquitectura de deployment

```
Internet → IIS (puerto 80/443)
              ↓
         ┌────┴────┐
         ↓         ↓
     Frontend  Backend
    (PM2:3001) (PM2:8000)
```

## Estructura de IIS requerida

Necesitas **2 aplicaciones virtuales** bajo el sitio Default:

### 1. Frontend (Runtime App)
- **Nombre IIS:** `arielschBIZUITCustomForms`
- **URL pública:** `http://test.bizuit.com/arielschBIZUITCustomForms`
- **Physical Path:** `E:\BIZUITSites\arielsch\arielschBIZUITCustomForms`
- **Proxy destino:** `http://localhost:3001`
- **web.config:** Ya existe (reverse proxy a PM2)

### 2. Backend (FastAPI)
- **Nombre IIS:** `arielschBIZUITCustomFormsbackend`
- **URL pública:** `http://test.bizuit.com/arielschBIZUITCustomFormsbackend`
- **Physical Path:** `E:\BIZUITSites\arielsch\arielschBIZUITCustomFormsBackEnd`
- **Proxy destino:** `http://localhost:8000`
- **web.config:** Necesita crearse

## Pasos de configuración

### PASO 1: Verificar/Crear aplicaciones en IIS

Abre **IIS Manager** en el servidor:

1. Expande el servidor → Sites → Default Web Site
2. Verifica que existan ambas aplicaciones:
   - `arielschBIZUITCustomForms`
   - `arielschBIZUITCustomFormsbackend`

#### Si NO existe `arielschBIZUITCustomFormsbackend`:

1. Click derecho en "Default Web Site" → Add Application
2. Configurar:
   - **Alias:** `arielschBIZUITCustomFormsbackend`
   - **Physical path:** `E:\BIZUITSites\arielsch\arielschBIZUITCustomFormsBackEnd`
   - **Application pool:** DefaultAppPool (o crear uno dedicado)
3. Click OK

### PASO 2: Configurar .env.local del Runtime (Frontend)

Archivo: `E:\BIZUITSites\arielsch\arielschBIZUITCustomForms\.env.local`

```env
# URLs públicas (accesibles desde el browser)
NEXT_PUBLIC_BASE_PATH=/arielschBIZUITCustomForms
NEXT_PUBLIC_BIZUIT_FORMS_API_URL=/arielschBIZUITCustomFormsbackend
NEXT_PUBLIC_BIZUIT_DASHBOARD_API_URL=/arielschBIZUITCustomFormsbackend

# Timeouts
NEXT_PUBLIC_BIZUIT_TIMEOUT=30000
NEXT_PUBLIC_BIZUIT_TOKEN_EXPIRATION_MINUTES=1440

# Environment
NODE_ENV=production
```

**Explicación de rutas:**
- Frontend está en `/arielschBIZUITCustomForms`
- Backend API en `/arielschBIZUITCustomFormsbackend`
- Ambas rutas son relativas → el browser las resuelve como `test.bizuit.com/ruta`

### PASO 3: Crear web.config para Backend

Archivo: `E:\BIZUITSites\arielsch\arielschBIZUITCustomFormsBackEnd\web.config`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
  <system.webServer>

    <!-- URL Rewrite: Proxy a PM2 (FastAPI en puerto 8000) -->
    <rewrite>
      <rules>
        <rule name="Proxy to FastAPI" stopProcessing="true">
          <match url="(.*)" />
          <conditions logicalGrouping="MatchAll" trackAllCaptures="false">
            <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true" />
            <add input="{REQUEST_FILENAME}" matchType="IsDirectory" negate="true" />
          </conditions>
          <action type="Rewrite" url="http://localhost:8000/{R:1}" />
          <serverVariables>
            <set name="HTTP_X_ORIGINAL_HOST" value="{HTTP_HOST}" />
            <set name="HTTP_X_FORWARDED_FOR" value="{REMOTE_ADDR}" />
            <set name="HTTP_X_FORWARDED_PROTO" value="https" />
          </serverVariables>
        </rule>
      </rules>
    </rewrite>

    <!-- Security Settings -->
    <security>
      <requestFiltering>
        <verbs allowUnlisted="true" />
        <requestLimits maxAllowedContentLength="104857600" />
        <hiddenSegments>
          <add segment=".env.local" />
          <add segment="logs" />
        </hiddenSegments>
      </requestFiltering>
    </security>

    <!-- HTTP Headers -->
    <httpProtocol>
      <customHeaders>
        <remove name="X-Powered-By" />
        <add name="X-Powered-By" value="BIZUIT Backend API" />
        <add name="X-Content-Type-Options" value="nosniff" />
      </customHeaders>
    </httpProtocol>

    <!-- Error Pages -->
    <httpErrors errorMode="DetailedLocalOnly" />

  </system.webServer>
</configuration>
```

### PASO 4: Reiniciar PM2 Runtime para cargar nuevo .env.local

En PowerShell en el servidor:

```powershell
# Navegar al directorio
cd E:\BIZUITSites\arielsch

# Reiniciar el proceso runtime para que cargue el nuevo .env.local
pm2 restart arielsch-runtime

# Verificar estado
pm2 list
pm2 logs arielsch-runtime --lines 20
```

### PASO 5: Reciclar Application Pools en IIS

En IIS Manager:
1. Application Pools → DefaultAppPool (o el pool que uses)
2. Click derecho → Recycle

O por PowerShell:
```powershell
Import-Module WebAdministration
Restart-WebAppPool -Name "DefaultAppPool"
```

## Verificación

### 1. Backend vía IIS:
```
http://test.bizuit.com/arielschBIZUITCustomFormsbackend/health
```
Debe mostrar: `{"status":"healthy",...}`

### 2. Frontend vía IIS:
```
http://test.bizuit.com/arielschBIZUITCustomForms
```
Debe cargar sin errores en la consola del browser.

### 3. Verificar en browser console que las URLs sean correctas:
Las requests deben ir a:
- `/arielschBIZUITCustomFormsbackend/api/...` (NO `localhost:8000`)
- Archivos estáticos: `/arielschBIZUITCustomForms/_next/static/...`

## Troubleshooting

### Error: 404 en backend
- Verificar que la aplicación IIS existe
- Verificar que PM2 está corriendo: `pm2 list`
- Ver logs: `pm2 logs arielsch-backend`

### Error: Variables de entorno no definidas
- Verificar que `.env.local` existe en `E:\BIZUITSites\arielsch\arielschBIZUITCustomForms`
- Reiniciar PM2 runtime: `pm2 restart arielsch-runtime`
- Next.js solo lee `.env.local` al iniciar el proceso

### Error: 404 en archivos estáticos (_next/static)
- Verificar que `web.config` existe en el directorio del runtime
- El `basePath` debe estar configurado en `next.config.js` (ya está)
- Acceder SIEMPRE vía IIS, nunca `localhost:3001` directamente
