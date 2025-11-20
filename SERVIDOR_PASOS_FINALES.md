# Pasos Finales en el Servidor - BIZUIT Custom Forms

## Estado Actual ✅

**Pipeline de deployment:** ✅ Funcionando correctamente
**PM2 Procesos:** ✅ Ambos servicios corriendo
- `arielsch-runtime` en puerto 3001
- `arielsch-backend` en puerto 8000

**Verificado directamente:**
- ✅ Backend: `http://localhost:8000/health` → OK
- ✅ Frontend: `http://localhost:3001` → Corre pero busca basePath

**Pendiente de configuración:**
- ❌ Backend vía IIS: `test.bizuit.com/arielschBIZUITCustomFormsbackend` → 404
- ⚠️  Frontend vía IIS: `test.bizuit.com/arielschBIZUITCustomForms` → Carga pero API incorrecta

---

## PASO 1: Crear aplicación IIS para Backend

Abre **IIS Manager** en el servidor:

1. Navega a: **Server → Sites → Default Web Site**
2. Click derecho en "Default Web Site" → **Add Application**
3. Configurar:
   ```
   Alias: arielschBIZUITCustomFormsbackend
   Physical path: E:\BIZUITSites\arielsch\arielschBIZUITCustomFormsBackEnd
   Application pool: DefaultAppPool
   ```
4. Click **OK**

### Verificar que web.config existe:
```powershell
cd E:\BIZUITSites\arielsch\arielschBIZUITCustomFormsBackEnd
dir web.config
```

Si NO existe, el deployment debería haberlo creado. Si no está, ejecuta el pipeline de deploy nuevamente.

---

## PASO 2: Crear .env.local para Runtime App

### Ubicación:
```
E:\BIZUITSites\arielsch\arielschBIZUITCustomForms\.env.local
```

### Contenido:
```env
# Base path para IIS deployment
NEXT_PUBLIC_BASE_PATH=/arielschBIZUITCustomForms

# Backend API URL (ruta relativa, el browser la resuelve a test.bizuit.com/arielschBIZUITCustomFormsbackend)
NEXT_PUBLIC_BIZUIT_FORMS_API_URL=/arielschBIZUITCustomFormsbackend
NEXT_PUBLIC_BIZUIT_DASHBOARD_API_URL=/arielschBIZUITCustomFormsbackend

# Timeouts y configuración
NEXT_PUBLIC_BIZUIT_TIMEOUT=30000
NEXT_PUBLIC_BIZUIT_TOKEN_EXPIRATION_MINUTES=1440

# Environment
NODE_ENV=production
```

### Crear el archivo:
```powershell
cd E:\BIZUITSites\arielsch\arielschBIZUITCustomForms

# Crear .env.local con el contenido de arriba
notepad .env.local
```

**⚠️ IMPORTANTE:** Pega el contenido exacto de arriba y guarda el archivo.

---

## PASO 3: Reiniciar PM2 Runtime

El proceso de Next.js necesita reiniciar para leer el nuevo `.env.local`:

```powershell
cd E:\BIZUITSites\arielsch

# Reiniciar solo el runtime (frontend)
pm2 restart arielsch-runtime

# Verificar que arrancó correctamente
pm2 list
pm2 logs arielsch-runtime --lines 30
```

**Busca en los logs que diga:**
- `✓ Ready in XXms`
- Sin errores de "Missing environment variable"

---

## PASO 4: Reciclar Application Pool en IIS

Para que IIS reconozca la nueva aplicación backend:

### Opción A: Desde IIS Manager
1. Navega a **Application Pools**
2. Click derecho en **DefaultAppPool** (o el pool que uses)
3. Click **Recycle**

### Opción B: Desde PowerShell
```powershell
Import-Module WebAdministration
Restart-WebAppPool -Name "DefaultAppPool"
```

---

## PASO 5: Verificación Final

### 1. Backend vía IIS:
Abre en el browser:
```
http://test.bizuit.com/arielschBIZUITCustomFormsbackend/health
```

**Debe mostrar:**
```json
{
  "status": "healthy",
  "database": {...},
  "timestamp": "..."
}
```

### 2. Frontend vía IIS:
Abre en el browser:
```
http://test.bizuit.com/arielschBIZUITCustomForms
```

**Verificar:**
- ✅ La página carga sin errores
- ✅ Abre **Developer Tools → Network** y verifica que las requests van a `/arielschBIZUITCustomFormsbackend/api/...`
- ✅ NO debe haber errores de "Missing environment variable" en la consola

### 3. Test de integración:
Si tienes acceso a un formulario, prueba:
- Autenticación funciona
- Formulario carga datos del backend
- Envío de formulario funciona

---

## Troubleshooting

### ❌ Backend devuelve 404
**Causa:** Aplicación IIS no está creada o mal configurada

**Solución:**
1. Verifica que existe en IIS Manager:
   - Default Web Site → arielschBIZUITCustomFormsbackend
2. Verifica el physical path: `E:\BIZUITSites\arielsch\arielschBIZUITCustomFormsBackEnd`
3. Verifica que PM2 está corriendo: `pm2 list` → `arielsch-backend` debe estar `online`

### ❌ Frontend sigue mostrando errores de environment variables
**Causa:** PM2 no reinició o `.env.local` no está bien creado

**Solución:**
1. Verifica que `.env.local` existe:
   ```powershell
   cd E:\BIZUITSites\arielsch\arielschBIZUITCustomForms
   type .env.local
   ```
2. Verifica el contenido (debe tener `NEXT_PUBLIC_BIZUIT_FORMS_API_URL=/arielschBIZUITCustomFormsbackend`)
3. Reinicia PM2 de nuevo:
   ```powershell
   pm2 restart arielsch-runtime
   pm2 logs arielsch-runtime --lines 50
   ```

### ❌ Frontend carga pero requests van a localhost:8000
**Causa:** `.env.local` no tiene la configuración correcta o PM2 no reinició

**Solución:**
1. Verifica que en `.env.local` dice:
   ```
   NEXT_PUBLIC_BIZUIT_FORMS_API_URL=/arielschBIZUITCustomFormsbackend
   ```
   NO debe decir `http://localhost:8000`
2. Reinicia PM2: `pm2 restart arielsch-runtime`
3. Recarga la página en el browser (Ctrl+F5 para hard refresh)

### ❌ Error 500.19 en IIS (Configuration error)
**Causa:** `web.config` tiene errores de XML o requiere módulos no instalados

**Solución:**
1. Verifica que el `web.config` del backend es válido:
   ```powershell
   cd E:\BIZUITSites\arielsch\arielschBIZUITCustomFormsBackEnd
   type web.config
   ```
2. Si tiene `<proxy>` uncommented, comenta esa sección (requiere ARR module)
3. Si el error persiste, verifica que URL Rewrite Module está instalado en IIS

---

## ¿Qué hace cada componente?

### PM2 (Process Manager)
- Mantiene corriendo los procesos de Node.js (port 3001) y Python (port 8000)
- Se ejecutan en **localhost** (no accesibles desde internet directamente)
- Logs en: `E:\BIZUITSites\arielsch\arielschBIZUITCustomForms\logs\`

### IIS (Reverse Proxy)
- Recibe requests desde internet (puerto 80/443)
- Usa `web.config` para hacer proxy a PM2:
  - `/arielschBIZUITCustomForms/*` → `localhost:3001`
  - `/arielschBIZUITCustomFormsbackend/*` → `localhost:8000`
- Maneja HTTPS/SSL
- Añade headers de seguridad

### .env.local (Runtime configuration)
- Next.js lo lee **al iniciar** el proceso
- Define URLs que el **browser** usa (NEXT_PUBLIC_*)
- Si cambias este archivo, **debes reiniciar PM2**

---

## Resumen de rutas

| Acceso | URL | Destino Real |
|--------|-----|--------------|
| ❌ NO usar | `http://localhost:3001` | PM2 Next.js directo |
| ❌ NO usar | `http://localhost:8000` | PM2 FastAPI directo |
| ✅ Usar | `http://test.bizuit.com/arielschBIZUITCustomForms` | IIS → PM2 (3001) |
| ✅ Usar | `http://test.bizuit.com/arielschBIZUITCustomFormsbackend` | IIS → PM2 (8000) |

**Importante:** Siempre accede vía IIS (test.bizuit.com), no directamente a localhost.

---

## Siguientes pasos después de verificar

Una vez que todo funcione correctamente:

1. ✅ Documenta las credenciales de base de datos en `.env.local` del backend (si no están)
2. ✅ Verifica que los logs de PM2 no muestren errores:
   ```powershell
   pm2 logs --lines 100
   ```
3. ✅ Configura monitoreo (opcional): `pm2 monit`
4. ✅ Guarda la configuración PM2: `pm2 save`

---

**Documentación completa:** Ver [IIS_CONFIGURATION_GUIDE.md](./IIS_CONFIGURATION_GUIDE.md)
