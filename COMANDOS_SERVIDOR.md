# Comandos del Servidor - Quick Reference

## 1. Crear .env.local para Runtime

```powershell
# Navegar al directorio del runtime
cd E:\BIZUITSites\arielsch\arielschBIZUITCustomForms

# Crear archivo .env.local (abrirá Notepad)
notepad .env.local
```

**Pegar este contenido y guardar:**
```env
NEXT_PUBLIC_BASE_PATH=/arielschBIZUITCustomForms
NEXT_PUBLIC_BIZUIT_FORMS_API_URL=/arielschBIZUITCustomFormsbackend
NEXT_PUBLIC_BIZUIT_DASHBOARD_API_URL=/arielschBIZUITCustomFormsbackend
NEXT_PUBLIC_BIZUIT_TIMEOUT=30000
NEXT_PUBLIC_BIZUIT_TOKEN_EXPIRATION_MINUTES=1440
NODE_ENV=production
```

---

## 2. Reiniciar PM2 Runtime

```powershell
# Navegar al directorio base
cd E:\BIZUITSites\arielsch

# Reiniciar runtime para cargar nuevo .env.local
pm2 restart arielsch-runtime

# Verificar estado
pm2 list

# Ver logs (busca "Ready in XXms" sin errores)
pm2 logs arielsch-runtime --lines 30
```

---

## 3. Reciclar IIS Application Pool

```powershell
# Importar módulo de IIS
Import-Module WebAdministration

# Reciclar pool
Restart-WebAppPool -Name "DefaultAppPool"
```

---

## 4. Verificación

### Backend health check:
```powershell
# Debe devolver JSON con "status": "healthy"
curl http://test.bizuit.com/arielschBIZUITCustomFormsbackend/health
```

### Abrir en browser:
- Frontend: `http://test.bizuit.com/arielschBIZUITCustomForms`
- Backend: `http://test.bizuit.com/arielschBIZUITCustomFormsbackend/health`

---

## Comandos útiles de PM2

```powershell
# Ver estado de todos los procesos
pm2 list

# Ver logs en tiempo real
pm2 logs

# Ver logs de un proceso específico
pm2 logs arielsch-runtime
pm2 logs arielsch-backend

# Ver últimas 50 líneas de logs
pm2 logs arielsch-runtime --lines 50

# Reiniciar un proceso
pm2 restart arielsch-runtime
pm2 restart arielsch-backend

# Reiniciar todos
pm2 restart all

# Detener un proceso (NO recomendado - deployment lo maneja)
pm2 stop arielsch-runtime
pm2 stop arielsch-backend

# Ver información detallada de un proceso
pm2 describe arielsch-runtime

# Ver monitoreo en tiempo real (CPU, memoria)
pm2 monit

# Guardar configuración actual (importante después de cambios)
pm2 save
```

---

## Verificar archivos de configuración

```powershell
# Runtime web.config
cd E:\BIZUITSites\arielsch\arielschBIZUITCustomForms
type web.config

# Runtime .env.local
type .env.local

# Backend web.config
cd E:\BIZUITSites\arielsch\arielschBIZUITCustomFormsBackEnd
type web.config

# Backend .env.local (si existe)
type .env.local
```

---

## Estructura de directorios esperada

```
E:\BIZUITSites\arielsch\
├── arielschBIZUITCustomForms\           ← Runtime App (Next.js)
│   ├── .next\                           ← Build output
│   ├── public\                          ← Static files
│   ├── .env.local                       ← ⚠️ DEBES CREAR ESTE ARCHIVO
│   ├── web.config                       ← Copiado automáticamente por pipeline
│   ├── server.js                        ← Next.js server
│   ├── package.json
│   └── logs\
│       ├── runtime-out.log
│       └── runtime-error.log
│
├── arielschBIZUITCustomFormsBackEnd\    ← Backend API (FastAPI)
│   ├── main.py                          ← FastAPI app
│   ├── database.py
│   ├── crypto.py
│   ├── web.config                       ← Copiado automáticamente por pipeline
│   ├── .env.local                       ← Creado manualmente con DB credentials
│   ├── requirements.txt
│   ├── libs\                            ← Python dependencies
│   └── logs\
│       ├── backend-out.log
│       └── backend-error.log
│
└── ecosystem.config.js                   ← PM2 configuration
```

---

## Troubleshooting rápido

### Backend 404:
```powershell
# 1. Verificar PM2 corriendo
pm2 list
# Busca: arielsch-backend - status: online

# 2. Ver logs del backend
pm2 logs arielsch-backend --lines 50

# 3. Test directo a PM2
curl http://localhost:8000/health

# 4. Verificar IIS application existe
# Abrir IIS Manager → Default Web Site → debe existir "arielschBIZUITCustomFormsbackend"
```

### Frontend con errores de environment variables:
```powershell
# 1. Verificar que .env.local existe
cd E:\BIZUITSites\arielsch\arielschBIZUITCustomForms
dir .env.local
type .env.local

# 2. Verificar contenido correcto
# Debe tener: NEXT_PUBLIC_BIZUIT_FORMS_API_URL=/arielschBIZUITCustomFormsbackend

# 3. Reiniciar PM2 runtime
cd E:\BIZUITSites\arielsch
pm2 restart arielsch-runtime

# 4. Ver logs para confirmar startup
pm2 logs arielsch-runtime --lines 30
```

### PM2 no responde:
```powershell
# Matar todos los procesos PM2 y reiniciar
pm2 kill

# Verificar ecosystem.config.js existe
cd E:\BIZUITSites\arielsch
dir ecosystem.config.js

# Iniciar procesos de nuevo
pm2 start ecosystem.config.js

# Guardar configuración
pm2 save
```

---

## Después del deployment pipeline

Cada vez que corre el pipeline de Azure DevOps:

1. ✅ **Build** crea artifacts con código actualizado
2. ✅ **Deploy** descarga artifacts y copia a los directorios
3. ✅ **PM2** reinicia automáticamente los procesos
4. ⚠️  **IMPORTANTE:** Si cambiaste `.env.local`, NO se sobrescribe (es manual)

**No necesitas hacer nada** después del pipeline, excepto:
- Si agregaste nuevas environment variables → actualizar `.env.local` manualmente
- Si cambió la configuración de PM2 → verificar con `pm2 list`

---

## Logs de deployment

Los logs del pipeline están en Azure DevOps, pero puedes ver los logs de PM2 después del deployment:

```powershell
# Ver todos los logs recientes
pm2 logs --lines 100

# Filtrar solo errores
pm2 logs --err --lines 50

# Ver timestamp específico
pm2 logs --timestamp
```

---

**Guía completa:** Ver [SERVIDOR_PASOS_FINALES.md](./SERVIDOR_PASOS_FINALES.md)
