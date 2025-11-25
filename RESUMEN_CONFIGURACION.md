# Resumen de Configuración - BIZUIT Custom Forms

## Estado del Proyecto

### ✅ Completado (Pipeline automático)

1. **Build Pipeline** (`azure-pipelines-build.yml`)
   - ✅ Compila Runtime App (Next.js) con configuración de producción
   - ✅ Compila Backend API (FastAPI) con dependencias Python
   - ✅ Genera artifacts con `web.config.production` incluidos
   - ✅ Crea migrations artifacts separados

2. **Deploy Pipeline** (`azure-pipelines-deploy.yml`)
   - ✅ Descarga artifacts de build
   - ✅ Copia archivos a directorios de deployment
   - ✅ Copia `web.config.production` → `web.config` automáticamente
   - ✅ Valida que web.config es XML válido
   - ✅ Instala dependencias Python automáticamente
   - ✅ Verifica/instala PM2 si no está disponible
   - ✅ Reinicia procesos PM2 con ecosystem.config.js
   - ✅ Ejecuta health checks del backend

3. **PM2 Configuration** (`ecosystem.config.js`)
   - ✅ Runtime: `arielsch-runtime` en puerto 3001
   - ✅ Backend: `arielsch-backend` en puerto 8000
   - ✅ Logs automáticos en `logs/` directories
   - ✅ Auto-restart en caso de crash

4. **Archivos de configuración creados**
   - ✅ `custom-forms/runtime-app/web.config.production` - Reverse proxy para Next.js
   - ✅ `custom-forms/backend-api/web.config.production` - Reverse proxy para FastAPI
   - ✅ `custom-forms/runtime-app/.env.production.example` - Template de environment variables
   - ✅ `IIS_CONFIGURATION_GUIDE.md` - Guía técnica completa
   - ✅ `SERVIDOR_PASOS_FINALES.md` - Guía paso a paso en español
   - ✅ `COMANDOS_SERVIDOR.md` - Referencia rápida de comandos

---

### ⚠️ Pendiente (Configuración manual en servidor)

**UN SOLO PASO MANUAL:**

1. **Crear IIS application para Backend** (5 minutos)
   - Abrir IIS Manager
   - Add Application: `arielschBIZUITCustomFormsbackend`
   - Physical path: `E:\BIZUITSites\arielsch\arielschBIZUITCustomFormsBackEnd`
   - Reciclar Application Pool

**NOTA:** El pipeline ahora crea automáticamente:
- ✅ web.config para runtime (copiado de web.config.production)
- ✅ web.config para backend (copiado de web.config.production)
- ✅ .env.local para runtime (con URLs correctas)
- ✅ .env.local para backend (con configuración de DB)
- ✅ Reinicia PM2 processes automáticamente

**Tiempo total estimado: ~5 minutos** (reducido de 10 minutos)

---

## Arquitectura Final

```
Internet (test.bizuit.com)
         ↓
    IIS (Puerto 80/443)
         ↓
    ┌────┴─────────────────────┐
    ↓                          ↓
Frontend                    Backend
/arielschBIZUITCustomForms  /arielschBIZUITCustomFormsbackend
    ↓                          ↓
PM2 (localhost:3001)       PM2 (localhost:8000)
Next.js Runtime            FastAPI
```

### Flujo de requests:

1. **Usuario accede:** `test.bizuit.com/arielschBIZUITCustomForms`
2. **IIS recibe request** y lee `web.config`
3. **IIS proxy → PM2** en `localhost:3001`
4. **Next.js responde** con HTML/JS
5. **Browser ejecuta JS** que hace request a `/arielschBIZUITCustomFormsbackend/api/...`
6. **IIS recibe API request** y proxy → PM2 en `localhost:8000`
7. **FastAPI responde** con JSON
8. **Next.js renderiza** datos en el browser

---

## URLs de Acceso

### ✅ URLs Correctas (vía IIS)

| Servicio | URL | Estado |
|----------|-----|--------|
| Frontend | `http://test.bizuit.com/arielschBIZUITCustomForms` | ⚠️ Pendiente .env.local |
| Backend | `http://test.bizuit.com/arielschBIZUITCustomFormsbackend/health` | ⚠️ Pendiente IIS app |

### ❌ URLs Incorrectas (NO usar en producción)

| Acceso | URL | Problema |
|--------|-----|----------|
| ❌ | `http://localhost:3001` | Busca basePath, archivos 404 |
| ❌ | `http://localhost:8000` | Solo para debugging local |

---

## Verificación después de configuración manual

### 1. Backend Health Check
```bash
curl http://test.bizuit.com/arielschBIZUITCustomFormsbackend/health
```

**Respuesta esperada:**
```json
{
  "status": "healthy",
  "database": {
    "success": true,
    "message": "Connected successfully"
  },
  "timestamp": "2025-11-20T12:00:00"
}
```

### 2. Frontend Load
Abre en browser: `http://test.bizuit.com/arielschBIZUITCustomForms`

**Verificar en Developer Tools:**
- ✅ No hay errores 404 en archivos `_next/static/...`
- ✅ No hay errores de "Missing environment variable"
- ✅ Requests API van a `/arielschBIZUITCustomFormsbackend/api/...`
- ✅ NO van a `localhost:8000`

### 3. PM2 Status
```powershell
pm2 list
```

**Resultado esperado:**
```
┌─────┬────────────────────────┬─────────┬─────────┬───────┐
│ id  │ name                   │ status  │ cpu     │ memory│
├─────┼────────────────────────┼─────────┼─────────┼───────┤
│ 0   │ arielsch-runtime       │ online  │ 0%      │ 150MB │
│ 1   │ arielsch-backend       │ online  │ 0%      │ 80MB  │
└─────┴────────────────────────┴─────────┴─────────┴───────┘
```

---

## Problemas Resueltos en el Pipeline

### 1. ✅ PM2 reinstalando en cada deployment
**Antes:** Cada pipeline ejecutaba `npm install -g pm2` aunque ya estaba instalado
**Después:** Check con `Test-Path` en npm global bin, solo instala si falta

### 2. ✅ ecosystem.config.js not found
**Antes:** Deployment job no tenía acceso al source code
**Después:** Agregado `checkout: self` como primer step

### 3. ✅ HOMEPATH initialization error
**Antes:** PM2 fallaba por falta de HOMEPATH environment variable
**Después:** Set `$env:HOMEPATH = $env:USERPROFILE` antes de cualquier comando PM2

### 4. ✅ ModuleNotFoundError: No module named 'fastapi'
**Antes:** Pipeline no instalaba dependencias Python
**Después:** Agregado step `pip install -r requirements.txt`

### 5. ✅ Health check URL incorrecta
**Antes:** Pipeline verificaba `/api/health` (no existe)
**Después:** Cambiado a `/health`

### 6. ✅ PowerShell boolean syntax error
**Antes:** `$success = true` (invalid PowerShell)
**Después:** `$success = $true`

### 7. ✅ IIS Error 500.19 - ARR module required
**Antes:** `web.config` tenía `<proxy>` section que requiere ARR
**Después:** Comentado `<proxy>` section (opcional para instalar después)

### 8. ✅ Backend .env.local no se cargaba
**Antes:** PM2 ejecutaba `python -m uvicorn main:app`
**Después:** PM2 ejecuta `python main.py` directamente (main.py carga .env.local)

---

## Variables de Entorno

### Runtime App (.env.local)

**Ubicación:** `E:\BIZUITSites\arielsch\arielschBIZUITCustomForms\.env.local`

```env
# Build-time variables (NEXT_PUBLIC_* se embeben en el build)
NEXT_PUBLIC_BASE_PATH=/arielschBIZUITCustomForms
NEXT_PUBLIC_BIZUIT_FORMS_API_URL=/arielschBIZUITCustomFormsbackend
NEXT_PUBLIC_BIZUIT_DASHBOARD_API_URL=/arielschBIZUITCustomFormsbackend
NEXT_PUBLIC_BIZUIT_TIMEOUT=30000
NEXT_PUBLIC_BIZUIT_TOKEN_EXPIRATION_MINUTES=1440

# Environment
NODE_ENV=production
```

**⚠️ IMPORTANTE:**
- Variables `NEXT_PUBLIC_*` se leen **solo durante el build**
- Si cambias estas variables, necesitas **rebuild + redeploy**
- Para cambiar dinámicamente sin rebuild, necesitarían ser server-side (sin `NEXT_PUBLIC_`)

### Backend API (.env.local)

**Ubicación:** `E:\BIZUITSites\arielsch\arielschBIZUITCustomFormsBackEnd\.env.local`

Este archivo debe tener las credenciales de SQL Server (ver `.env.example` en el código).

---

## Mantenimiento

### Deployment nuevo código
```bash
# Ejecutar pipeline de Build en Azure DevOps
# → Automáticamente ejecuta Deploy
# → PM2 se reinicia automáticamente
# → NO necesitas hacer nada en el servidor
```

### Cambiar environment variables del runtime
```powershell
# 1. Editar .env.local
cd E:\BIZUITSites\arielsch\arielschBIZUITCustomForms
notepad .env.local

# 2. Reiniciar PM2 runtime
cd E:\BIZUITSites\arielsch
pm2 restart arielsch-runtime
```

### Ver logs
```powershell
# Todos los logs
pm2 logs

# Solo un servicio
pm2 logs arielsch-runtime
pm2 logs arielsch-backend

# Últimas 100 líneas
pm2 logs --lines 100
```

### Reiniciar todo
```powershell
cd E:\BIZUITSites\arielsch
pm2 restart all
```

---

## Documentación

### Para administradores del servidor:
1. **[SERVIDOR_PASOS_FINALES.md](docs/deployment/SERVIDOR_PASOS_FINALES.md)** - Guía paso a paso para configuración inicial
2. **[COMANDOS_SERVIDOR.md](./COMANDOS_SERVIDOR.md)** - Referencia rápida de comandos PowerShell

### Para developers y DevOps:
1. **[IIS_CONFIGURATION_GUIDE.md](docs/infrastructure/IIS_CONFIGURATION_GUIDE.md)** - Guía técnica completa de arquitectura
2. **[custom-forms/bizuit-custom-form-sample/DEPLOYMENT_GUIDE.md](./custom-forms/bizuit-custom-form-sample/DEPLOYMENT_GUIDE.md)** - Documentación de deployment con PM2
3. **[custom-forms/docs/infrastructure/PM2_WINDOWS_SETUP.md](./custom-forms/docs/infrastructure/PM2_WINDOWS_SETUP.md)** - Setup de PM2 en Windows

### Configuración de ejemplo:
- **[.env.production.example](./custom-forms/runtime-app/.env.production.example)** - Template para .env.local del runtime

---

## Próximos pasos

1. ✅ **Completar configuración manual** (sigue SERVIDOR_PASOS_FINALES.md)
2. ✅ **Verificar que todo funciona** con los health checks
3. ✅ **Probar un formulario** end-to-end (autenticación + submit)
4. ⚠️  **Opcional: Instalar ARR module** en IIS para mejor performance
5. ⚠️  **Opcional: Configurar HTTPS** si no está ya configurado en IIS
6. ⚠️  **Opcional: Setup monitoring** con `pm2 plus` (requiere cuenta PM2+)

---

## Soporte

Si encuentras problemas:

1. **Ver logs de PM2:** `pm2 logs --lines 100`
2. **Consultar troubleshooting** en SERVIDOR_PASOS_FINALES.md
3. **Verificar IIS logs** en `C:\inetpub\logs\LogFiles\`
4. **Revisar eventos de Windows** si PM2 no inicia

**Última actualización:** 2025-11-20
