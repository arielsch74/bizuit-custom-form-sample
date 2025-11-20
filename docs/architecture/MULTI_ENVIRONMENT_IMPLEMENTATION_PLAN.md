# Plan de Implementación: Sistema Multi-Entorno para Custom Forms

## Resumen Ejecutivo

Implementar un sistema multi-entorno (dev, qa, prod, etc.) que permita:
- **Separación lógica** en la misma base de datos SQL Server (campo `environment`)
- **Rutas específicas por entorno**: `/form/{formName}?env=dev` o `/dev/form/{formName}`
- **Consola admin mejorada** con vista comparativa entre entornos
- **Promoción de versiones** entre entornos (dev → qa → prod)
- **Backend único** con configuraciones de BIZUIT por entorno
- **Roles y permisos** preparados para futura expansión

---

## Fase 1: Migración de Base de Datos (Backend)

### 1.1 Crear script de migración SQL
**Archivo**: `custom-forms/backend-api/migrations/004_add_multi_environment.sql`

```sql
-- Agregar columna Environment a CustomForms
ALTER TABLE CustomForms
  ADD Environment NVARCHAR(50) NOT NULL DEFAULT 'production';

-- Agregar columna Environment a CustomFormVersions
ALTER TABLE CustomFormVersions
  ADD Environment NVARCHAR(50) NOT NULL DEFAULT 'production';

-- Modificar constraint único: ahora FormName + Environment
ALTER TABLE CustomForms
  DROP CONSTRAINT UQ_CustomForms_FormName;

ALTER TABLE CustomForms
  ADD CONSTRAINT UQ_CustomForms_FormName_Environment
  UNIQUE (FormName, Environment);

-- Crear tabla de configuración de entornos
CREATE TABLE EnvironmentConfig (
    EnvironmentId INT IDENTITY(1,1) PRIMARY KEY,
    EnvironmentName NVARCHAR(50) NOT NULL UNIQUE,
    DisplayName NVARCHAR(100) NOT NULL,
    BizuitApiUrl NVARCHAR(500) NOT NULL,
    BizuitDashboardApiUrl NVARCHAR(500) NOT NULL,
    IsActive BIT NOT NULL DEFAULT 1,
    SortOrder INT NOT NULL DEFAULT 0,
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME NOT NULL DEFAULT GETDATE()
);

-- Insertar entornos iniciales
INSERT INTO EnvironmentConfig (EnvironmentName, DisplayName, BizuitApiUrl, BizuitDashboardApiUrl, SortOrder)
VALUES
  ('development', 'Development', 'https://dev.bizuit.com/api', 'https://dev.bizuit.com/dashboard/api', 1),
  ('qa', 'QA/Testing', 'https://qa.bizuit.com/api', 'https://qa.bizuit.com/dashboard/api', 2),
  ('production', 'Production', 'https://test.bizuit.com/arielschBIZUITDashboardapi/api', 'https://test.bizuit.com/arielschBIZUITDashboardapi/api', 3);

-- Actualizar stored procedure sp_UpsertCustomForm para incluir Environment
-- (Se modificará en el siguiente paso)
```

### 1.2 Actualizar Stored Procedure
**Modificar**: `custom-forms/backend-api/database.py` → función `execute_upsert_form()`

Agregar parámetro `environment` a todas las operaciones de insert/update.

### 1.3 Actualizar funciones de base de datos
**Modificar**: `custom-forms/backend-api/database.py`

Actualizar todas las funciones para incluir filtro de `environment`:
- `get_all_custom_forms(environment: str)`
- `get_form_compiled_code(form_name: str, environment: str, version: Optional[str])`
- `get_form_versions(form_name: str, environment: str)`
- `set_current_version(form_name: str, environment: str, version: str)`

---

## Fase 2: Backend API - Endpoints Multi-Entorno

### 2.1 Modificar endpoints existentes
**Archivo**: `custom-forms/backend-api/main.py`

```python
# Agregar parámetro environment (default='production' para backward compatibility)
@app.get("/api/custom-forms")
async def list_forms(environment: str = "production"):
    return get_all_custom_forms(environment)

@app.get("/api/custom-forms/{form_name}/code")
async def get_form_code(form_name: str, environment: str = "production", version: Optional[str] = None):
    return get_form_compiled_code(form_name, environment, version)

@app.get("/api/custom-forms/{form_name}/versions")
async def get_versions(form_name: str, environment: str = "production"):
    return get_form_versions(form_name, environment)

@app.post("/api/custom-forms/{form_name}/set-version")
async def set_version(form_name: str, environment: str = "production", version: str = Query(...)):
    return set_current_version(form_name, environment, version)
```

### 2.2 Nuevos endpoints para gestión de entornos

```python
# Listar entornos disponibles
@app.get("/api/environments")
async def list_environments():
    return get_active_environments()

# Obtener configuración de un entorno
@app.get("/api/environments/{environment_name}")
async def get_environment(environment_name: str):
    return get_environment_config(environment_name)

# Vista comparativa de versiones entre entornos
@app.get("/api/custom-forms/{form_name}/environment-status")
async def get_form_environment_status(form_name: str):
    """
    Retorna:
    {
      "formName": "MyForm",
      "environments": {
        "development": { "currentVersion": "1.2.0", "publishedAt": "...", ... },
        "qa": { "currentVersion": "1.1.0", "publishedAt": "...", ... },
        "production": { "currentVersion": "1.0.0", "publishedAt": "...", ... }
      }
    }
    """
```

### 2.3 Endpoint de promoción entre entornos

```python
@app.post("/api/custom-forms/{form_name}/promote")
async def promote_form_version(
    form_name: str,
    source_env: str = Query(...),
    target_env: str = Query(...),
    version: str = Query(...),
    current_user: dict = Depends(require_admin)  # Solo admins
):
    """
    Copia una versión específica de un entorno a otro.
    Ejemplo: promover MyForm v1.2.0 de dev → qa
    """
    # Validar que source_env tenga esa versión
    # Copiar datos de CustomFormVersions con nuevo Environment
    # Opcional: validaciones/aprobaciones
```

---

## Fase 3: Runtime App - Soporte Multi-Entorno

### 3.1 Modificar carga de forms
**Archivo**: `custom-forms/runtime-app/app/form/[formName]/page.tsx`

```typescript
// Detectar environment desde URL
const searchParams = useSearchParams()
const environment = searchParams.get('env') || 'production'

// O desde ruta dinámica: /dev/form/{formName}
// Se decide en routing (opción más limpia)

// Pasar environment al cargar form
const metadataResponse = await fetch(
  `/api/custom-forms/${formName}/metadata?environment=${environment}`
)

const component = await loadDynamicFormCached(formName, {
  version: metadata.currentVersion,
  environment: environment
})
```

### 3.2 Opción A: Query Parameter (Recomendado para empezar)
**Ruta**: `/form/{formName}?env=dev`

**Pros**:
- Fácil implementación
- Backward compatible (default='production')
- BIZUIT puede especificar fácilmente en URL

**Contras**:
- URLs más largas

### 3.3 Opción B: Prefijo de Ruta (Futuro)
**Rutas**: `/dev/form/{formName}`, `/qa/form/{formName}`, `/form/{formName}` (prod)

**Estructura de archivos**:
```
app/
├── [env]/
│   └── form/
│       └── [formName]/
│           └── page.tsx  (dynamic env)
└── form/
    └── [formName]/
        └── page.tsx  (default prod)
```

**Recomendación**: Empezar con Opción A, migrar a Opción B en v2.

---

## Fase 4: Admin Console - Vista Multi-Entorno

### 4.1 Dashboard Comparativo (Nueva página)
**Archivo**: `custom-forms/runtime-app/app/admin/environments/page.tsx`

**Layout**:
```
┌─────────────────────────────────────────────────────────┐
│  Environment Overview                                    │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Form Name       │  Development  │   QA     │ Production│
│  ──────────────────────────────────────────────────────│
│  CustomerForm    │  v1.3.0 ✓    │  v1.2.0  │  v1.0.0   │
│  OrderForm       │  v2.1.0 ✓    │  v2.1.0 ✓│  v2.0.0   │
│  InvoiceForm     │  v1.5.0 ✓    │  v1.5.0 ✓│  v1.5.0 ✓ │
│                                                          │
│  ✓ = En sync con dev   [Promote →] buttons              │
└─────────────────────────────────────────────────────────┘
```

**Funcionalidades**:
- Ver todas las versiones activas por entorno
- Indicador visual de "sync status"
- Botón "Promote to QA" / "Promote to Prod"
- Confirmación modal antes de promover

### 4.2 Modificar Forms Management Page
**Archivo**: `custom-forms/runtime-app/app/admin/forms/page.tsx`

**Agregar**:
1. **Selector de entorno** (tabs o dropdown):
   ```tsx
   <Tabs>
     <Tab>Development</Tab>
     <Tab>QA</Tab>
     <Tab>Production</Tab>
   </Tabs>
   ```

2. **Filtrar forms por entorno seleccionado**:
   ```tsx
   const [selectedEnv, setSelectedEnv] = useState('production')

   useEffect(() => {
     loadForms(selectedEnv)
   }, [selectedEnv])
   ```

3. **Botón de promoción en modal de versiones**:
   ```tsx
   // En el modal de Version History
   {!version.isCurrent && (
     <>
       <button onClick={() => handleSetVersion(version.version)}>
         Activate
       </button>
       <button onClick={() => handlePromote(version.version, 'qa')}>
         Promote to QA
       </button>
     </>
   )}
   ```

### 4.3 Upload Forms Page
**Archivo**: `custom-forms/runtime-app/app/admin/upload/page.tsx`

**Agregar selector de entorno destino**:
```tsx
<select value={targetEnv} onChange={(e) => setTargetEnv(e.target.value)}>
  <option value="development">Development</option>
  <option value="qa">QA</option>
  <option value="production">Production</option>
</select>

// Al hacer upload
const formData = new FormData()
formData.append('file', file)
formData.append('environment', targetEnv)  // ← NUEVO

await fetch('/api/deployment/upload', {
  method: 'POST',
  body: formData
})
```

---

## Fase 5: Deployment Pipeline - Multi-Entorno

### 5.1 Modificar procesamiento de deployment
**Archivo**: `custom-forms/backend-api/main.py` → endpoint `/api/deployment/upload`

```python
@app.post("/api/deployment/upload")
async def upload_deployment(
    file: UploadFile,
    environment: str = Form("production"),  # ← NUEVO
    current_user: dict = Depends(require_admin)
):
    # Procesar .zip
    # Al insertar en DB, incluir environment
    result = process_deployment_package(file, environment)
    return result
```

### 5.2 Azure Pipeline - Agregar variable de entorno
**Archivo**: `azure-pipelines-deploy.yml`

**Opción A**: Mismo pipeline, variable manual
```yaml
parameters:
  - name: targetEnvironment
    displayName: 'Target Environment'
    type: string
    default: 'production'
    values:
      - development
      - qa
      - production

# Usar ${{ parameters.targetEnvironment }} en deployment
```

**Opción B**: Pipelines separados (futuro)
- `azure-pipelines-deploy-dev.yml`
- `azure-pipelines-deploy-qa.yml`
- `azure-pipelines-deploy-prod.yml`

**Recomendación**: Empezar con Opción A.

---

## Fase 6: Seguridad y Permisos (Preparado para futuro)

### 6.1 Crear tabla de permisos (opcional, para v2)
```sql
CREATE TABLE EnvironmentPermissions (
    PermissionId INT IDENTITY(1,1) PRIMARY KEY,
    UserId INT NOT NULL,  -- FK a tabla de usuarios
    EnvironmentName NVARCHAR(50) NOT NULL,
    CanView BIT NOT NULL DEFAULT 1,
    CanDeploy BIT NOT NULL DEFAULT 0,
    CanPromote BIT NOT NULL DEFAULT 0,
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE()
);
```

### 6.2 Validación en endpoints (futuro)
```python
@app.post("/api/custom-forms/{form_name}/promote")
async def promote_form_version(...):
    # Validar que el usuario puede promover a target_env
    if target_env == 'production' and not user_can_promote_to_prod(current_user):
        raise HTTPException(403, "No tienes permisos para promover a Production")
```

**Para v1**: Solo validar `role == Administrator`

---

## Fase 7: Traducción i18n

### 7.1 Agregar keys de traducción
**Archivo**: `custom-forms/runtime-app/lib/translations.ts`

```typescript
// Environment Management
'env.development': 'Development',
'env.qa': 'QA / Testing',
'env.production': 'Production',
'env.selectEnvironment': 'Select Environment',
'env.compareTitle': 'Environment Comparison',
'env.promoteButton': 'Promote to {env}',
'env.promoteConfirm': 'Are you sure you want to promote {formName} v{version} to {targetEnv}?',
'env.promoteSuccess': 'Successfully promoted to {targetEnv}',
'env.promoteError': 'Error promoting to {targetEnv}',
'env.syncStatus': 'Sync Status',
'env.inSync': 'In sync',
'env.outOfSync': 'Out of sync',
```

---

## Plan de Implementación por Fases

### ✅ Fase 1: Database Migration (1-2 días)
1. Crear migration script
2. Ejecutar en SQL Server de test
3. Actualizar stored procedures
4. Actualizar funciones de database.py
5. Testing de queries

### ✅ Fase 2: Backend API (2-3 días)
1. Modificar endpoints existentes (con default='production')
2. Agregar nuevos endpoints (environments, promote)
3. Testing con Postman/Thunder Client
4. Documentación de API

### ✅ Fase 3: Runtime App (2 días)
1. Modificar form loader con parámetro environment
2. Testing de carga de forms por entorno
3. Validación de URLs

### ✅ Fase 4: Admin Console (3-4 días)
1. Agregar selector de entorno en Forms Management
2. Crear página Environment Overview
3. Implementar lógica de promoción
4. Testing de UI/UX

### ✅ Fase 5: Deployment (1-2 días)
1. Modificar upload endpoint
2. Actualizar pipeline (variable de entorno)
3. Testing de deployment

### ✅ Fase 6: Testing Integración (2 días)
1. Testing end-to-end: dev → qa → prod
2. Validar con BIZUIT BPM
3. Ajustes de bugs

### ✅ Fase 7: Traducción y Documentación (1 día)
1. Agregar traducciones en/es
2. Actualizar documentación de usuario
3. Guía de uso de multi-entorno

**Total estimado**: 12-15 días de desarrollo

---

## Decisiones Técnicas Clave

1. **Routing**: Query parameter `/form/{formName}?env=dev` (v1), migrar a prefijo de ruta (v2)
2. **Database**: Separación lógica con campo `Environment` (no bases separadas)
3. **Default environment**: `production` (backward compatible)
4. **Promoción**: Copiar versión completa entre entornos (no move)
5. **Permisos**: Solo `Administrator` role (v1), tabla de permisos (v2)
6. **UI**: Vista comparativa + tabs por entorno
7. **Pipeline**: Variable manual (v1), pipelines separados (v2)

---

## Riesgos y Mitigaciones

| Riesgo | Impacto | Mitigación |
|--------|---------|------------|
| Migración DB falla | Alto | Testing en DB de desarrollo primero, backup antes de migración |
| Breaking changes en API | Medio | Usar defaults para backward compatibility |
| Confusion de usuarios | Medio | UI clara, indicadores visuales de entorno activo |
| Promoción accidental a prod | Alto | Modal de confirmación, futuro: aprobaciones |

---

## Arquitectura Actual (Pre-Multi-Entorno)

### Database Schema (SQL Server)

**CustomForms Table:**
```sql
- FormId (INT, PK, Identity)
- FormName (NVARCHAR(255), UNIQUE) ← Se modifica a UNIQUE(FormName, Environment)
- ProcessName (NVARCHAR(255))
- Status (NVARCHAR(50)) - 'active', 'inactive', 'deprecated'
- CurrentVersion (NVARCHAR(50))
- Description (NVARCHAR(MAX))
- Author (NVARCHAR(255))
- CreatedAt (DATETIME)
- UpdatedAt (DATETIME)
```

**CustomFormVersions Table:**
```sql
- VersionId (INT, PK, Identity)
- FormId (INT, FK → CustomForms.FormId)
- Version (NVARCHAR(50))
- CompiledCode (NVARCHAR(MAX)) - JavaScript compilado
- SizeBytes (INT)
- PublishedAt (DATETIME)
- IsCurrent (BIT) - Solo una versión actual por form
- ReleaseNotes (NVARCHAR(MAX))
- PackageVersion (NVARCHAR(50))
- CommitHash (NVARCHAR(50))
- BuildDate (DATETIME)
- Metadata (NVARCHAR(MAX)) - JSON
```

### Backend API Endpoints (Puerto 8000)

**Authentication:**
- `POST /api/auth/login` - Login admin
- `POST /api/auth/validate` - Validar session token
- `POST /api/auth/refresh` - Refresh session token

**Custom Forms:**
- `GET /api/custom-forms` - Listar forms activos
- `GET /api/custom-forms/{form_name}/code` - Obtener código compilado
- `GET /api/custom-forms/{form_name}/versions` - Listar versiones
- `POST /api/custom-forms/{form_name}/set-version` - Activar versión

**Deployment:**
- `POST /api/deployment/upload` - Subir deployment package (.zip)

### Runtime App (Puerto 3001)

**Form Loading:**
```typescript
// 1. Validar token de Dashboard (si aplica)
// 2. Fetch metadata del form
// 3. Verificar que status === 'active'
// 4. Cargar componente dinámicamente con versión actual
// 5. Renderizar con parámetros de Dashboard
```

### Deployment Architecture

```
Windows Server + IIS + PM2:

IIS (Reverse Proxy):
└── Site: arielschBIZUITCustomForms
    ├── /api/* → http://localhost:8000 (Backend FastAPI)
    └── /* → http://localhost:3001 (Runtime Next.js)

PM2 (Process Manager):
├── arielsch-runtime (port 3001)
└── arielsch-backend (port 8000)

Directories:
E:\BIZUITSites\arielsch\
├── arielschBIZUITCustomForms\ (Runtime)
├── arielschBIZUITCustomFormsBackEnd\ (Backend)
└── ecosystem.config.js (PM2 config)
```

---

## Próximos Pasos

1. ✅ Aprobar este plan
2. Crear branch `feature/multi-environment` desde `dev`
3. Comenzar con Fase 1 (Database Migration)
4. Testing incremental en cada fase
5. Merge a `dev` para testing completo
6. Merge a `main` cuando esté validado

---

**Fecha de creación**: 2025-01-19
**Última actualización**: 2025-01-19
**Estado**: Pendiente de aprobación
**Versión**: 1.0
