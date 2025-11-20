# Pasos Finales en el Servidor - BIZUIT Custom Forms

## Estado Actual ✅

**Pipeline de deployment:** ✅ Funcionando correctamente
**PM2 Procesos:** ✅ Ambos servicios corriendo automáticamente
- `arielsch-runtime` en puerto 3001
- `arielsch-backend` en puerto 8000

**Configuración automática del pipeline:**
- ✅ web.config del runtime: Copiado automáticamente
- ✅ web.config del backend: Copiado automáticamente
- ✅ .env.local del backend: Creado automáticamente con configuración de DB
- ✅ .env.local del runtime: Creado automáticamente con URLs correctas
- ✅ PM2 runtime: Reiniciado automáticamente
- ✅ PM2 backend: Reiniciado automáticamente

**Pendiente de configuración MANUAL:**
- ❌ IIS Application para backend: Necesita crearse en IIS Manager (5 minutos)

---

## PASO ÚNICO: Crear aplicación IIS para Backend (5 minutos)

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

### Verificar archivos creados automáticamente:

```powershell
# Verificar web.config (creado por el pipeline)
cd E:\BIZUITSites\arielsch\arielschBIZUITCustomFormsBackEnd
dir web.config

# Verificar .env.local del backend (creado por el pipeline)
dir .env.local

# Verificar .env.local del runtime (creado por el pipeline)
cd E:\BIZUITSites\arielsch\arielschBIZUITCustomForms
dir .env.local
```

**Todos estos archivos son creados automáticamente por el pipeline.** Si no existen, ejecuta el pipeline de deploy nuevamente.

---

## Reciclar Application Pool en IIS (1 minuto)

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

## Verificación Final (Después de reciclar IIS)

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
**Causa:** `.env.local` no fue creado por el pipeline o tiene contenido incorrecto

**Solución:**
1. Verifica que `.env.local` existe y tiene el contenido correcto:
   ```powershell
   cd E:\BIZUITSites\arielsch\arielschBIZUITCustomForms
   type .env.local
   ```
2. Debe mostrar: `NEXT_PUBLIC_BIZUIT_FORMS_API_URL=/arielschBIZUITCustomFormsbackend`
3. Si no existe o está mal, ejecuta el pipeline de deploy de nuevo (lo creará automáticamente)
4. Si existe y está bien, verifica logs de PM2:
   ```powershell
   pm2 logs arielsch-runtime --lines 50
   ```

### ❌ Frontend carga pero requests van a localhost:8000
**Causa:** `.env.local` no fue creado correctamente o PM2 no leyó el archivo

**Solución:**
1. Verifica el contenido de `.env.local`:
   ```powershell
   cd E:\BIZUITSites\arielsch\arielschBIZUITCustomForms
   type .env.local
   ```
2. Debe decir: `NEXT_PUBLIC_BIZUIT_FORMS_API_URL=/arielschBIZUITCustomFormsbackend` (NO `http://localhost:8000`)
3. Si está mal, ejecuta el pipeline de deploy de nuevo
4. Recarga la página en el browser (Ctrl+F5 para hard refresh)

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
