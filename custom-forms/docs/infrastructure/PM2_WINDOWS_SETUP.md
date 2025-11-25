# PM2 Setup en Windows Server

Este documento describe el proceso completo de instalación y configuración de PM2 en Windows Server para gestionar las aplicaciones custom-forms (runtime-app + backend-api).

## Resumen

PM2 es un gestor de procesos que mantiene las aplicaciones Node.js y Python corriendo en background, con auto-restart y arranque automático en Windows.

## Requisitos Previos

- Windows Server 2016 o superior
- Node.js instalado (versión 22.x o superior)
- npm disponible en PATH
- Permisos de Administrador

## Proceso de Instalación

### 1. Verificar Node.js y npm

```cmd
node --version
npm --version
```

**Output esperado:**
```
v22.11.0 (o superior)
10.x.x (o superior)
```

### 2. Verificar npm global prefix

El npm global prefix es donde se instalan los paquetes globales como PM2.

```cmd
npm config get prefix
```

**Output esperado:**
```
C:\Users\aschwindt\AppData\Roaming\npm
```

**Importante:** Este directorio debe estar en el PATH del sistema para que PM2 sea ejecutable desde cualquier ubicación.

### 3. Instalar PM2 globalmente

```cmd
npm install -g pm2
```

**Output esperado:**
```
added 133 packages in 17s
13 packages are looking for funding
  run `npm fund` for details
```

### 4. Verificar instalación de PM2

```cmd
npm list -g --depth=0 | findstr pm2
```

**Output esperado:**
```
`-- pm2@6.0.13
```

Verificar que el archivo ejecutable existe:

```cmd
dir "C:\Users\aschwindt\AppData\Roaming\npm\pm2.cmd"
```

**Output esperado:**
```
19/11/2025  18:43               326 pm2.cmd
               1 File(s)            326 bytes
```

### 5. Instalar pm2-windows-startup

Este paquete permite que PM2 inicie automáticamente cuando Windows se inicia.

```cmd
npm install -g pm2-windows-startup
```

**Output esperado:**
```
added 19 packages in 3s
```

### 6. Configurar arranque automático

```cmd
pm2-startup install
```

**Output esperado:**
```
Successfully added PM2 startup registry entry.
```

Este comando crea un servicio de Windows que ejecuta PM2 automáticamente al iniciar el sistema.

### 7. Agregar npm global prefix al PATH (si es necesario)

Si PM2 no es reconocido como comando después de la instalación, necesitas agregar el npm prefix al PATH del sistema.

**Opción A: PowerShell (como Administrador)**

```powershell
$npmPrefix = npm config get prefix
$currentPath = [System.Environment]::GetEnvironmentVariable("Path", "Machine")
[System.Environment]::SetEnvironmentVariable("Path", "$currentPath;$npmPrefix", "Machine")
```

**Opción B: CMD (como Administrador)**

```cmd
setx PATH "%PATH%;C:\Users\aschwindt\AppData\Roaming\npm" /M
```

**Importante:** Después de modificar el PATH, debes **cerrar y reabrir** el terminal para que los cambios surtan efecto.

### 8. Verificar que PM2 funciona

**Cerrar y reabrir CMD/PowerShell como Administrador**, luego ejecutar:

```cmd
pm2 --version
```

**Output esperado:**
```
6.0.13 (o la versión instalada)
```

```cmd
pm2-startup status
```

**Output esperado:**
```
PM2 Windows Startup - Installed
```

```cmd
pm2 list
```

**Output esperado (sin aplicaciones todavía):**
```
┌─────┬──────┬─────────┬─────────┬─────────┬──────────┬────────┬──────┬──────────┐
│ id  │ name │ mode    │ ↺       │ status  │ cpu      │ memory │ port │
└─────┴──────┴─────────┴─────────┴─────────┴──────────┴────────┴──────┴──────────┘
```

## Problemas Comunes

### Error: "PM2 is not recognized"

**Causa:** PM2 no está en el PATH del sistema o la sesión del terminal no ha recargado el PATH.

**Solución:**
1. Verificar que npm prefix está en PATH:
   ```cmd
   echo %PATH% | findstr "Roaming\npm"
   ```
2. Si no está, agregar al PATH (ver paso 7)
3. Cerrar y reabrir el terminal

### Error: "Init system not found" al ejecutar `pm2 startup`

**Causa:** Este error es **esperado en Windows**. El comando `pm2 startup` (sin parámetros) busca sistemas de init de Linux/Unix que no existen en Windows.

**Solución:** Usar `pm2-windows-startup install` en lugar de `pm2 startup`.

### PM2 instalado pero no ejecutable

**Causa:** El archivo `pm2.cmd` existe pero no está en PATH.

**Solución temporal:** Usar ruta completa:
```cmd
C:\Users\aschwindt\AppData\Roaming\npm\pm2.cmd --version
```

**Solución permanente:** Agregar al PATH (ver paso 7) y reiniciar terminal.

### pm2-windows-startup se instaló pero PM2 no

**Causa:** Se instaló `pm2-windows-startup` antes de instalar `pm2`.

**Solución:** Instalar PM2 primero:
```cmd
npm install -g pm2
npm install -g pm2-windows-startup
pm2-startup install
```

## Verificación Final

Después de completar todos los pasos, ejecutar:

```cmd
:: 1. Versión de PM2
pm2 --version

:: 2. Estado de arranque automático
pm2-startup status

:: 3. Lista de procesos (debería estar vacía)
pm2 list

:: 4. Información del sistema
pm2 info
```

## Próximos Pasos

Una vez que PM2 está instalado y funcionando:

1. Crear `ecosystem.config.js` con la configuración de tus aplicaciones
2. Iniciar aplicaciones: `pm2 start ecosystem.config.js`
3. Guardar configuración: `pm2 save`
4. Verificar arranque automático reiniciando el servidor

Ver [DEPLOYMENT.md](./DEPLOYMENT.md) para el proceso completo de deployment.

## Comandos Útiles de PM2

```cmd
:: Ver todas las aplicaciones
pm2 list

:: Ver logs de todas las apps
pm2 logs

:: Ver logs de una app específica
pm2 logs app-name --lines 50

:: Reiniciar una app
pm2 restart app-name

:: Reiniciar todas las apps
pm2 restart all

:: Detener una app
pm2 stop app-name

:: Eliminar una app
pm2 delete app-name

:: Ver info detallada de una app
pm2 show app-name

:: Monitor en tiempo real
pm2 monit

:: Guardar configuración actual para arranque automático
pm2 save

:: Restaurar apps guardadas
pm2 resurrect
```

## Desinstalación (si es necesario)

```cmd
:: 1. Eliminar todas las apps de PM2
pm2 delete all

:: 2. Desinstalar arranque automático
pm2-startup uninstall

:: 3. Desinstalar paquetes npm
npm uninstall -g pm2-windows-startup
npm uninstall -g pm2
```

## Referencias

- PM2 Documentation: https://pm2.keymetrics.io/docs/usage/quick-start/
- pm2-windows-startup: https://www.npmjs.com/package/pm2-windows-startup
- PM2 on Windows: https://pm2.keymetrics.io/docs/usage/pm2-on-windows/

---

**Última actualización:** 19 noviembre 2025
**Versión de PM2:** 6.0.13
**Versión de pm2-windows-startup:** 1.0.3
