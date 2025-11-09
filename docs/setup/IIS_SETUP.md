# Configuración de IIS para Next.js con Proxy Reverso

Esta guía te ayudará a configurar IIS para servir la aplicación Next.js en un subdirectorio usando proxy reverso.

## Prerrequisitos

### 1. Instalar URL Rewrite Module

IIS necesita este módulo para hacer proxy reverso:

1. Descargar: https://www.iis.net/downloads/microsoft/url-rewrite
2. Ejecutar el instalador
3. Reiniciar IIS Manager

### 2. Instalar Application Request Routing (ARR)

ARR permite que IIS haga proxy a aplicaciones backend:

1. Descargar: https://www.iis.net/downloads/microsoft/application-request-routing
2. Ejecutar el instalador
3. Abrir IIS Manager
4. Seleccionar el servidor (nivel raíz)
5. Doble clic en "Application Request Routing Cache"
6. Clic en "Server Proxy Settings" (panel derecho)
7. Marcar "Enable proxy"
8. Aplicar cambios

## Configuración del Sitio IIS

### Opción A: Aplicación Virtual en Sitio Existente (Recomendado)

1. **Abrir IIS Manager**

2. **Expandir sitio** `test.bizuit.com`

3. **Crear Aplicación Virtual**:
   - Click derecho en el sitio → "Add Application"
   - Alias: `BIZUITCustomForms`
   - Physical path: `E:\DevSites\BIZUITCustomForms`
   - Application pool: Usar el pool del sitio o crear uno nuevo

4. **Verificar web.config**:
   - El archivo `web.config` ya está incluido en el deployment
   - Se copia automáticamente con el pipeline de Azure DevOps

### Opción B: Sitio Completo (Si necesitas dominio dedicado)

1. **Crear nuevo sitio** en IIS:
   - Site name: `BIZUIT Custom Forms`
   - Physical path: `E:\DevSites\BIZUITCustomForms`
   - Binding: `test.bizuit.com` puerto 80/443

2. **Configurar Application Pool**:
   - .NET CLR version: "No Managed Code"
   - Managed pipeline mode: Integrated

## Estructura del web.config

El archivo `web.config` incluye:

```xml
<rewrite>
  <rules>
    <rule name="Next.js App" stopProcessing="true">
      <match url="(.*)" />
      <action type="Rewrite" url="http://localhost:3000/BIZUITCustomForms/{R:1}" />
    </rule>
  </rules>
</rewrite>
```

Esto hace que:
- Todas las peticiones a `/BIZUITCustomForms/*` se redirijan a `http://localhost:3000/BIZUITCustomForms/*`
- PM2 mantiene Next.js corriendo en puerto 3000
- IIS actúa como proxy reverso

## Verificación de Configuración

### 1. Verificar PM2 está corriendo

```powershell
pm2 list
```

Deberías ver `bizuit-custom-forms` con status `online`.

### 2. Verificar Next.js responde localmente

```powershell
curl http://localhost:3000/BIZUITCustomForms/
```

Debería retornar el HTML de la aplicación.

### 3. Verificar IIS Proxy

```powershell
curl http://test.bizuit.com/BIZUITCustomForms/
```

Debería retornar el mismo HTML que el paso anterior.

## URLs de Navegación

Con esta configuración:

| Descripción | URL |
|-------------|-----|
| Home | https://test.bizuit.com/BIZUITCustomForms/ |
| Start Process | https://test.bizuit.com/BIZUITCustomForms/start-process |
| Continue Process | https://test.bizuit.com/BIZUITCustomForms/continue-process |

## Troubleshooting

### Error 500.50 - URL Rewrite Module Error

**Causa**: URL Rewrite Module no instalado

**Solución**: Instalar desde https://www.iis.net/downloads/microsoft/url-rewrite

### Error 502 - Bad Gateway

**Causa**: Next.js no está corriendo en puerto 3000

**Solución**:
```powershell
pm2 restart bizuit-custom-forms
pm2 logs bizuit-custom-forms
```

### Error 404 - Not Found

**Causa**: basePath no configurado correctamente

**Solución**: Verificar que `next.config.js` tenga:
```javascript
basePath: '/BIZUITCustomForms'
```

### Assets no cargan (CSS/JS)

**Causa**: assetPrefix no configurado

**Solución**: Verificar que `next.config.js` tenga:
```javascript
assetPrefix: '/BIZUITCustomForms'
```

### Cambios no se reflejan

**Solución**:
```powershell
# Reiniciar aplicación
pm2 restart bizuit-custom-forms

# Reciclar Application Pool en IIS
iisreset /restart
```

## Configuración HTTPS (Opcional)

Si quieres usar HTTPS:

1. **Obtener certificado SSL** (Let's Encrypt, DigiCert, etc.)

2. **Agregar binding HTTPS** en IIS:
   - Type: https
   - Port: 443
   - SSL certificate: Seleccionar tu certificado

3. **Forzar HTTPS** (opcional) - agregar en web.config:
```xml
<rule name="Redirect to HTTPS" stopProcessing="true">
  <match url="(.*)" />
  <conditions>
    <add input="{HTTPS}" pattern="^OFF$" />
  </conditions>
  <action type="Redirect" url="https://{HTTP_HOST}/BIZUITCustomForms/{R:1}" redirectType="Permanent" />
</rule>
```

## Monitoreo

### Ver logs de PM2

```powershell
pm2 logs bizuit-custom-forms
```

### Ver logs de IIS

- Failed Request Tracing: `C:\inetpub\logs\FailedReqLogFiles`
- HTTP logs: `C:\inetpub\logs\LogFiles\W3SVC*`

## Comandos Útiles

```powershell
# Ver estado de PM2
pm2 status

# Reiniciar aplicación
pm2 restart bizuit-custom-forms

# Ver métricas en tiempo real
pm2 monit

# Guardar configuración de PM2
pm2 save

# IIS - Reciclar application pool
Restart-WebAppPool "DefaultAppPool"

# IIS - Reiniciar sitio
Restart-WebSite "test.bizuit.com"
```
