# ✅ Checklist de Configuración del Servidor

**Tiempo estimado total:** ~10 minutos
**Servidor:** Windows Server con IIS
**Usuario:** Administrador del servidor

---

## Pre-requisitos ✅

Antes de empezar, verificar que estos componentes están instalados:

- [ ] IIS con URL Rewrite Module instalado
- [ ] Node.js instalado (verificar: `node --version`)
- [ ] Python 3.12 instalado (verificar: `python --version`)
- [ ] PM2 instalado globalmente (verificar: `pm2 --version`)
- [ ] Pipeline de deployment completado exitosamente en Azure DevOps

---

## Paso 1: Crear IIS Application para Backend (3 min)

- [ ] Abrir **IIS Manager**
- [ ] Expandir: Server → Sites → Default Web Site
- [ ] Click derecho en "Default Web Site" → **Add Application**
- [ ] Configurar:
  - [ ] **Alias:** `arielschBIZUITCustomFormsbackend`
  - [ ] **Physical path:** `E:\BIZUITSites\arielsch\arielschBIZUITCustomFormsBackEnd`
  - [ ] **Application pool:** DefaultAppPool
- [ ] Click **OK**
- [ ] Verificar que aparece en la lista de aplicaciones

**Verificación:**
```powershell
# Verificar que web.config existe en el directorio
cd E:\BIZUITSites\arielsch\arielschBIZUITCustomFormsBackEnd
dir web.config
# Debe mostrar el archivo (creado automáticamente por el pipeline)
```

---

## Paso 2: Crear .env.local para Runtime (3 min)

- [ ] Abrir PowerShell como administrador
- [ ] Ejecutar:
```powershell
cd E:\BIZUITSites\arielsch\arielschBIZUITCustomForms
notepad .env.local
```
- [ ] Pegar el siguiente contenido **exacto** en Notepad:

```env
NEXT_PUBLIC_BASE_PATH=/arielschBIZUITCustomForms
NEXT_PUBLIC_BIZUIT_FORMS_API_URL=/arielschBIZUITCustomFormsbackend
NEXT_PUBLIC_BIZUIT_DASHBOARD_API_URL=/arielschBIZUITCustomFormsbackend
NEXT_PUBLIC_BIZUIT_TIMEOUT=30000
NEXT_PUBLIC_BIZUIT_TOKEN_EXPIRATION_MINUTES=1440
NODE_ENV=production
```

- [ ] Guardar archivo (File → Save)
- [ ] Cerrar Notepad

**Verificación:**
```powershell
# Verificar que el archivo se creó correctamente
type .env.local
# Debe mostrar el contenido que pegaste
```

---

## Paso 3: Reiniciar PM2 Runtime (2 min)

- [ ] En PowerShell, ejecutar:
```powershell
cd E:\BIZUITSites\arielsch
pm2 restart arielsch-runtime
```

- [ ] Esperar ~5 segundos
- [ ] Verificar que arrancó correctamente:
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

- [ ] Ambos procesos deben estar en estado **online**

**Ver logs para confirmar:**
```powershell
pm2 logs arielsch-runtime --lines 20
```

- [ ] Buscar línea que diga: `✓ Ready in XXXXms` (sin errores)

---

## Paso 4: Reciclar IIS Application Pool (1 min)

- [ ] En PowerShell, ejecutar:
```powershell
Import-Module WebAdministration
Restart-WebAppPool -Name "DefaultAppPool"
```

- [ ] Esperar mensaje de confirmación

**Alternativa desde IIS Manager:**
- [ ] Abrir IIS Manager
- [ ] Ir a **Application Pools**
- [ ] Click derecho en **DefaultAppPool**
- [ ] Click **Recycle**

---

## Paso 5: Verificación Final (5 min)

### Test 1: Backend Health Check

- [ ] Abrir PowerShell
- [ ] Ejecutar:
```powershell
curl http://test.bizuit.com/arielschBIZUITCustomFormsbackend/health
```

**Resultado esperado:**
```json
{
  "status": "healthy",
  "database": {...},
  "timestamp": "..."
}
```

- [ ] ✅ Status debe ser "healthy"

### Test 2: Frontend en Browser

- [ ] Abrir browser (Chrome/Edge)
- [ ] Navegar a: `http://test.bizuit.com/arielschBIZUITCustomForms`
- [ ] Presionar **F12** para abrir Developer Tools
- [ ] Ir a pestaña **Console**
- [ ] Verificar:
  - [ ] ✅ NO hay errores rojos
  - [ ] ✅ NO hay mensaje "Missing required environment variable"

- [ ] Ir a pestaña **Network**
- [ ] Recargar la página (F5)
- [ ] Verificar:
  - [ ] ✅ Archivos `_next/static/...` devuelven **200** (no 404)
  - [ ] ✅ Requests a API van a `/arielschBIZUITCustomFormsbackend/api/...`
  - [ ] ✅ NO hay requests a `localhost:8000`

### Test 3: PM2 Status

- [ ] En PowerShell:
```powershell
pm2 list
```

- [ ] Verificar:
  - [ ] ✅ `arielsch-runtime` → status: **online**
  - [ ] ✅ `arielsch-backend` → status: **online**
  - [ ] ✅ Restarts: 0 o 1 (no más de 3)

### Test 4: Logs sin errores

- [ ] Ver logs de runtime:
```powershell
pm2 logs arielsch-runtime --lines 50
```

- [ ] Verificar:
  - [ ] ✅ NO hay errores de "Missing environment variable"
  - [ ] ✅ Mensaje "Ready in XXXXms" presente
  - [ ] ✅ NO hay stack traces de errores

- [ ] Ver logs de backend:
```powershell
pm2 logs arielsch-backend --lines 50
```

- [ ] Verificar:
  - [ ] ✅ Mensaje "Application startup complete"
  - [ ] ✅ NO hay errores de módulos no encontrados

---

## ✅ Configuración Completada

Si todos los checks anteriores pasaron:

- [ ] ✅ IIS Application para backend creada
- [ ] ✅ .env.local para runtime configurado
- [ ] ✅ PM2 procesos corriendo correctamente
- [ ] ✅ Backend responde vía IIS
- [ ] ✅ Frontend carga sin errores
- [ ] ✅ Environment variables correctas

**¡Configuración exitosa!** 🎉

---

## 🔧 Troubleshooting

### ❌ Backend devuelve 404

**Problema:** La aplicación IIS no está creada o configurada correctamente

**Solución:**
1. Verificar en IIS Manager que existe "arielschBIZUITCustomFormsbackend"
2. Verificar physical path: `E:\BIZUITSites\arielsch\arielschBIZUITCustomFormsBackEnd`
3. Verificar PM2: `pm2 list` → backend debe estar "online"
4. Test directo a PM2: `curl http://localhost:8000/health`

### ❌ Frontend muestra "Missing environment variable"

**Problema:** .env.local no existe o no tiene el contenido correcto

**Solución:**
1. Verificar archivo existe:
   ```powershell
   cd E:\BIZUITSites\arielsch\arielschBIZUITCustomForms
   type .env.local
   ```
2. Verificar que contiene: `NEXT_PUBLIC_BIZUIT_FORMS_API_URL=/arielschBIZUITCustomFormsbackend`
3. Si falta o está mal, recrear el archivo (Paso 2)
4. Reiniciar PM2: `pm2 restart arielsch-runtime`

### ❌ Frontend muestra 404 en archivos _next/static

**Problema:** Accediendo directamente a localhost:3001 en vez de vía IIS

**Solución:**
- NO usar: `http://localhost:3001`
- SÍ usar: `http://test.bizuit.com/arielschBIZUITCustomForms`
- Next.js está compilado con basePath, solo funciona vía IIS

### ❌ PM2 proceso en estado "errored" o "stopped"

**Problema:** El proceso crasheó al iniciar

**Solución:**
1. Ver logs: `pm2 logs arielsch-runtime --err --lines 50`
2. Identificar el error en los logs
3. Corregir según el error (usualmente .env.local o dependencias)
4. Reiniciar: `pm2 restart arielsch-runtime`

### ❌ IIS Error 500.19

**Problema:** web.config tiene errores o requiere módulos no instalados

**Solución:**
1. Verificar URL Rewrite Module está instalado en IIS
2. Si el error menciona `<proxy>`:
   - Editar `web.config` en el directorio del backend
   - Comentar la sección `<proxy>...</proxy>`
3. Reciclar application pool: `Restart-WebAppPool -Name "DefaultAppPool"`

---

## 📚 Documentación Adicional

Para más información, consultar:

- **[SERVIDOR_PASOS_FINALES.md](./SERVIDOR_PASOS_FINALES.md)** - Guía detallada con explicaciones
- **[COMANDOS_SERVIDOR.md](./COMANDOS_SERVIDOR.md)** - Referencia de comandos PowerShell
- **[RESUMEN_CONFIGURACION.md](./RESUMEN_CONFIGURACION.md)** - Estado completo del proyecto
- **[IIS_CONFIGURATION_GUIDE.md](./IIS_CONFIGURATION_GUIDE.md)** - Guía técnica de arquitectura

---

## 📝 Notas

- **Deployment futuro:** El pipeline de Azure DevOps maneja todo automáticamente. No necesitas repetir estos pasos.
- **Cambiar .env.local:** Si cambias `.env.local` en el futuro, recuerda ejecutar `pm2 restart arielsch-runtime`
- **Monitoreo:** Puedes usar `pm2 monit` para ver CPU/memoria en tiempo real
- **Logs persistentes:** Los logs de PM2 se guardan en `logs/` dentro de cada directorio

---

**Fecha:** _______________
**Completado por:** _______________
**Firma:** _______________
