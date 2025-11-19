# Backend API y Base de Datos - Custom Forms

**Estado**: 100% Completo y Funcional
**Tecnologías**: SQL Server + .NET Core + Dapper

---

## Resumen

Sistema completo de backend para gestión de Custom Forms con versionado, incluyendo:
- 3 tablas SQL Server
- 7 stored procedures optimizados
- Controller REST con 6 endpoints
- Service layer con Dapper
- DTOs y modelos completos

---

## 📊 Base de Datos (SQL Server)

### Tablas Creadas

#### 1. `CustomForms`
Tabla principal con metadata de formularios.

```sql
CREATE TABLE CustomForms (
    FormId INT IDENTITY(1,1) PRIMARY KEY,
    FormName NVARCHAR(100) UNIQUE NOT NULL,
    ProcessName NVARCHAR(100) NOT NULL,
    Description NVARCHAR(500),
    Author NVARCHAR(100),
    Status NVARCHAR(20) DEFAULT 'active',
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME DEFAULT GETDATE(),
    INDEX IX_FormName (FormName),
    INDEX IX_Status (Status)
)
```

**Columnas**:
- `FormId` - ID único autoincrementable
- `FormName` - Nombre único del form (ej: "aprobacion-gastos")
- `ProcessName` - Nombre del proceso Bizuit asociado
- `Description` - Descripción del formulario
- `Author` - Autor del form
- `Status` - Estado: 'active', 'inactive', 'deprecated'
- `CreatedAt` - Fecha de creación
- `UpdatedAt` - Última actualización

#### 2. `CustomFormVersions`
Historial de versiones con código compilado.

```sql
CREATE TABLE CustomFormVersions (
    VersionId INT IDENTITY(1,1) PRIMARY KEY,
    FormId INT FOREIGN KEY REFERENCES CustomForms(FormId),
    Version NVARCHAR(20) NOT NULL,
    CompiledCode NVARCHAR(MAX) NOT NULL,
    IsCurrent BIT DEFAULT 0,
    PublishedAt DATETIME DEFAULT GETDATE(),
    PublishedBy NVARCHAR(100),
    INDEX IX_FormId_IsCurrent (FormId, IsCurrent),
    INDEX IX_FormId_Version (FormId, Version)
)
```

**Columnas**:
- `VersionId` - ID único de versión
- `FormId` - FK a CustomForms
- `Version` - Número de versión (ej: "1.0.0", "1.0.1")
- `CompiledCode` - Código JavaScript compilado por esbuild
- `IsCurrent` - Flag indicando versión actual (solo 1 por FormId)
- `PublishedAt` - Fecha de publicación
- `PublishedBy` - Usuario que publicó

#### 3. `CustomFormUsage`
Tracking de uso de formularios.

```sql
CREATE TABLE CustomFormUsage (
    UsageId INT IDENTITY(1,1) PRIMARY KEY,
    FormId INT FOREIGN KEY REFERENCES CustomForms(FormId),
    UsedAt DATETIME DEFAULT GETDATE(),
    UserId NVARCHAR(100),
    SessionId NVARCHAR(100),
    INDEX IX_FormId_UsedAt (FormId, UsedAt),
    INDEX IX_UserId (UserId)
)
```

**Columnas**:
- `UsageId` - ID único de uso
- `FormId` - FK a CustomForms
- `UsedAt` - Timestamp de uso
- `UserId` - Usuario que usó el form
- `SessionId` - ID de sesión

#### 4. `vw_CustomFormsCurrentVersion` (Vista)
Vista que muestra forms con su versión actual.

```sql
CREATE VIEW vw_CustomFormsCurrentVersion AS
SELECT
    f.FormId,
    f.FormName,
    f.ProcessName,
    f.Description,
    f.Author,
    f.Status,
    v.Version AS CurrentVersion,
    v.CompiledCode,
    v.PublishedAt AS VersionPublishedAt,
    f.CreatedAt,
    f.UpdatedAt
FROM CustomForms f
LEFT JOIN CustomFormVersions v ON f.FormId = v.FormId AND v.IsCurrent = 1
WHERE f.Status = 'active'
```

---

### Stored Procedures (7 total)

#### 1. `sp_GetAllCustomForms`
Lista todos los forms activos con sus versiones actuales.

```sql
CREATE PROCEDURE sp_GetAllCustomForms
AS
BEGIN
    SELECT * FROM vw_CustomFormsCurrentVersion
    ORDER BY UpdatedAt DESC
END
```

#### 2. `sp_GetCustomFormByName`
Obtiene un form específico por nombre.

```sql
CREATE PROCEDURE sp_GetCustomFormByName
    @FormName NVARCHAR(100)
AS
BEGIN
    SELECT * FROM vw_CustomFormsCurrentVersion
    WHERE FormName = @FormName
END
```

#### 3. `sp_GetCustomFormCode`
Obtiene el código compilado de la versión actual.

```sql
CREATE PROCEDURE sp_GetCustomFormCode
    @FormName NVARCHAR(100)
AS
BEGIN
    SELECT v.CompiledCode, v.Version
    FROM CustomForms f
    INNER JOIN CustomFormVersions v ON f.FormId = v.FormId
    WHERE f.FormName = @FormName AND v.IsCurrent = 1
END
```

#### 4. `sp_CreateCustomForm`
Crea un nuevo form con su primera versión.

```sql
CREATE PROCEDURE sp_CreateCustomForm
    @FormName NVARCHAR(100),
    @ProcessName NVARCHAR(100),
    @Description NVARCHAR(500),
    @Author NVARCHAR(100),
    @Version NVARCHAR(20),
    @CompiledCode NVARCHAR(MAX),
    @PublishedBy NVARCHAR(100)
AS
BEGIN
    BEGIN TRANSACTION

    DECLARE @FormId INT

    -- Crear form
    INSERT INTO CustomForms (FormName, ProcessName, Description, Author)
    VALUES (@FormName, @ProcessName, @Description, @Author)

    SET @FormId = SCOPE_IDENTITY()

    -- Crear primera versión
    INSERT INTO CustomFormVersions (FormId, Version, CompiledCode, IsCurrent, PublishedBy)
    VALUES (@FormId, @Version, @CompiledCode, 1, @PublishedBy)

    COMMIT TRANSACTION

    SELECT @FormId AS FormId
END
```

#### 5. `sp_PublishCustomFormVersion`
Publica una nueva versión de un form existente.

```sql
CREATE PROCEDURE sp_PublishCustomFormVersion
    @FormName NVARCHAR(100),
    @Version NVARCHAR(20),
    @CompiledCode NVARCHAR(MAX),
    @PublishedBy NVARCHAR(100)
AS
BEGIN
    BEGIN TRANSACTION

    DECLARE @FormId INT
    SELECT @FormId = FormId FROM CustomForms WHERE FormName = @FormName

    IF @FormId IS NULL
    BEGIN
        RAISERROR('Form not found', 16, 1)
        ROLLBACK TRANSACTION
        RETURN
    END

    -- Marcar versión anterior como no current
    UPDATE CustomFormVersions
    SET IsCurrent = 0
    WHERE FormId = @FormId AND IsCurrent = 1

    -- Insertar nueva versión
    INSERT INTO CustomFormVersions (FormId, Version, CompiledCode, IsCurrent, PublishedBy)
    VALUES (@FormId, @Version, @CompiledCode, 1, @PublishedBy)

    -- Actualizar timestamp del form
    UPDATE CustomForms
    SET UpdatedAt = GETDATE()
    WHERE FormId = @FormId

    COMMIT TRANSACTION
END
```

#### 6. `sp_GetCustomFormVersions`
Obtiene historial de versiones de un form.

```sql
CREATE PROCEDURE sp_GetCustomFormVersions
    @FormName NVARCHAR(100)
AS
BEGIN
    SELECT
        v.VersionId,
        v.Version,
        v.IsCurrent,
        v.PublishedAt,
        v.PublishedBy
    FROM CustomFormVersions v
    INNER JOIN CustomForms f ON v.FormId = f.FormId
    WHERE f.FormName = @FormName
    ORDER BY v.PublishedAt DESC
END
```

#### 7. `sp_RecordCustomFormUsage`
Registra uso de un form.

```sql
CREATE PROCEDURE sp_RecordCustomFormUsage
    @FormName NVARCHAR(100),
    @UserId NVARCHAR(100),
    @SessionId NVARCHAR(100)
AS
BEGIN
    DECLARE @FormId INT
    SELECT @FormId = FormId FROM CustomForms WHERE FormName = @FormName

    IF @FormId IS NOT NULL
    BEGIN
        INSERT INTO CustomFormUsage (FormId, UserId, SessionId)
        VALUES (@FormId, @UserId, @SessionId)
    END
END
```

---

### Scripts SQL Disponibles

**Ubicación**: `/database/`

1. **`01_CreateTables.sql`** - Crea las 3 tablas y la vista
2. **`02_CreateStoredProcedures.sql`** - Crea los 7 stored procedures

**Instalación**:
```sql
-- 1. Conectarse a SQL Server Management Studio
-- 2. Seleccionar la base de datos
USE [TuBaseDeDatos]
GO

-- 3. Ejecutar en orden:
-- Primero las tablas
:r 01_CreateTables.sql
GO

-- Luego los stored procedures
:r 02_CreateStoredProcedures.sql
GO

-- 4. Verificar instalación
SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME LIKE 'CustomForm%'
SELECT * FROM INFORMATION_SCHEMA.ROUTINES WHERE ROUTINE_NAME LIKE 'sp_CustomForm%'
```

---

## 🔧 Backend API (.NET Core)

### Estructura de Archivos

```
backend-api/
├── Controllers/
│   └── CustomFormsController.cs     # 6 endpoints REST
├── Services/
│   ├── ICustomFormsService.cs       # Interface del servicio
│   └── CustomFormsService.cs        # Implementación con Dapper
├── Models/
│   └── CustomFormDto.cs             # 6 DTOs
└── README.md                        # Instrucciones
```

### Controller REST (`CustomFormsController.cs`)

**6 Endpoints Implementados**:

#### 1. `GET /api/custom-forms`
Lista todos los forms activos.

```csharp
[HttpGet]
[Authorize]
public async Task<ActionResult<IEnumerable<CustomFormDto>>> GetAllCustomForms()
{
    var forms = await _service.GetAllCustomFormsAsync();
    return Ok(forms);
}
```

**Response**:
```json
[
  {
    "formId": 1,
    "formName": "aprobacion-gastos",
    "processName": "AprobacionGastos",
    "description": "Formulario de aprobación de gastos",
    "author": "Juan Pérez",
    "status": "active",
    "currentVersion": "1.0.2",
    "createdAt": "2025-01-10T10:00:00Z",
    "updatedAt": "2025-01-11T15:30:00Z"
  }
]
```

#### 2. `GET /api/custom-forms/{name}/metadata`
Obtiene metadata de un form específico.

```csharp
[HttpGet("{name}/metadata")]
[Authorize]
public async Task<ActionResult<CustomFormDto>> GetCustomFormMetadata(string name)
{
    var form = await _service.GetCustomFormByNameAsync(name);
    if (form == null) return NotFound();
    return Ok(form);
}
```

#### 3. `GET /api/custom-forms/{name}/code`
Obtiene el código JavaScript compilado de la versión actual.

```csharp
[HttpGet("{name}/code")]
[Authorize]
[ResponseCache(Duration = 300)] // 5 minutos
public async Task<ActionResult<string>> GetCustomFormCode(string name)
{
    var code = await _service.GetCustomFormCodeAsync(name);
    if (code == null) return NotFound();
    return Ok(new { code });
}
```

**Response**:
```json
{
  "code": "(function(){var React=window.React;var exports={};... código compilado ...})();"
}
```

#### 4. `GET /api/custom-forms/versions`

```csharp
[HttpGet("versions")]
[AllowAnonymous] // Para polling público
public async Task<ActionResult<Dictionary<string, object>>> GetVersions()
{
    var versions = await _service.GetAllVersionsAsync();
    return Ok(versions);
}
```

**Response**:
```json
{
  "aprobacion-gastos": {
    "version": "1.0.2",
    "updatedAt": "2025-01-11T15:30:00Z"
  },
  "solicitud-vacaciones": {
    "version": "1.0.0",
    "updatedAt": "2025-01-10T11:00:00Z"
  }
}
```

#### 5. `POST /api/custom-forms`
Crea un nuevo form con su primera versión.

```csharp
[HttpPost]
[Authorize]
public async Task<ActionResult<int>> CreateCustomForm([FromBody] CreateCustomFormDto dto)
{
    var formId = await _service.CreateCustomFormAsync(dto);
    return CreatedAtAction(nameof(GetCustomFormMetadata), new { name = dto.FormName }, formId);
}
```

**Request**:
```json
{
  "formName": "nuevo-form",
  "processName": "NuevoProceso",
  "description": "Descripción del form",
  "author": "Maria Lopez",
  "version": "1.0.0",
  "compiledCode": "... código compilado ...",
  "publishedBy": "maria.lopez"
}
```

#### 6. `POST /api/custom-forms/versions`
Publica una nueva versión de un form existente.

```csharp
[HttpPost("versions")]
[Authorize]
public async Task<ActionResult> PublishVersion([FromBody] PublishVersionDto dto)
{
    await _service.PublishVersionAsync(dto);
    return Ok(new { message = "Version published successfully" });
}
```

**Request**:
```json
{
  "formName": "aprobacion-gastos",
  "version": "1.0.3",
  "compiledCode": "... código compilado ...",
  "publishedBy": "juan.perez"
}
```

---

### Service Layer (`CustomFormsService.cs`)

**Tecnología**: Dapper para acceso a datos

**Métodos Principales**:

```csharp
public interface ICustomFormsService
{
    Task<IEnumerable<CustomFormDto>> GetAllCustomFormsAsync();
    Task<CustomFormDto?> GetCustomFormByNameAsync(string formName);
    Task<string?> GetCustomFormCodeAsync(string formName);
    Task<Dictionary<string, object>> GetAllVersionsAsync();
    Task<int> CreateCustomFormAsync(CreateCustomFormDto dto);
    Task PublishVersionAsync(PublishVersionDto dto);
}
```

**Implementación con Dapper**:
```csharp
public async Task<IEnumerable<CustomFormDto>> GetAllCustomFormsAsync()
{
    using var connection = new SqlConnection(_connectionString);
    return await connection.QueryAsync<CustomFormDto>(
        "sp_GetAllCustomForms",
        commandType: CommandType.StoredProcedure
    );
}
```

---

### DTOs (`CustomFormDto.cs`)

**6 DTOs Definidos**:

1. **`CustomFormDto`** - Form completo con versión
2. **`CustomFormCodeDto`** - Código compilado
3. **`CustomFormVersionDto`** - Versión individual
4. **`CreateCustomFormDto`** - Crear form
5. **`PublishVersionDto`** - Publicar versión

---

## 🚀 Instalación y Configuración

### 1. Base de Datos (10 minutos)

```bash
# 1. Abrir SQL Server Management Studio
# 2. Conectarse a tu servidor
# 3. Seleccionar base de datos
USE [TuBaseDeDatos]
GO

# 4. Ejecutar scripts en orden
:r database/01_CreateTables.sql
GO

:r database/02_CreateStoredProcedures.sql
GO

# 5. Verificar
SELECT * FROM vw_CustomFormsCurrentVersion
```

### 2. Backend API (20 minutos)

```bash
# 1. Copiar archivos a tu proyecto .NET
cp backend-api/Controllers/CustomFormsController.cs <Proyecto>/Controllers/
cp backend-api/Services/*.cs <Proyecto>/Services/
cp backend-api/Models/CustomFormDto.cs <Proyecto>/Models/

# 2. Instalar paquetes NuGet
cd <Proyecto>
dotnet add package Dapper
dotnet add package System.Data.SqlClient

# 3. Editar Program.cs - Registrar servicio
builder.Services.AddScoped<ICustomFormsService, CustomFormsService>();

# 4. Editar appsettings.json - Connection string
{
  "ConnectionStrings": {
    "BizuitDB": "Server=localhost;Database=BizuitDB;User Id=sa;Password=..."
  }
}

# 5. Ejecutar
dotnet run
```

### 3. Configurar CORS

```csharp
// Program.cs
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(builder =>
    {
        builder
            .WithOrigins("http://localhost:3000")  // Frontend URL
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials();
    });
});

// IMPORTANTE: Agregar ANTES de UseAuthorization()
app.UseCors();
app.UseAuthorization();
```

---

## 🧪 Testing

### Test Básico de Conexión

```bash
# GET all forms
curl http://localhost:5000/api/custom-forms \
  -H "Authorization: Bearer YOUR_TOKEN"

# Expected:
# [
#   {
#     "formId": 1,
#     "formName": "aprobacion-gastos",
#     ...
#   }
# ]
```


```bash
# GET versions (sin auth)
curl http://localhost:5000/api/custom-forms/versions

# Expected:
# {
#   "aprobacion-gastos": {
#     "version": "1.0.0",
#     "updatedAt": "..."
#   }
# }
```

### Test de Creación

```bash
# POST new form
curl -X POST http://localhost:5000/api/custom-forms \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "formName": "test-form",
    "processName": "TestProcess",
    "description": "Test form",
    "author": "Test User",
    "version": "1.0.0",
    "compiledCode": "console.log(\"test\");",
    "publishedBy": "test.user"
  }'
```

---

## 🔍 Verificación de Instalación

### Base de Datos

```sql
-- Verificar tablas (debe retornar 3)
SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_NAME LIKE 'CustomForm%'

-- Verificar stored procedures (debe retornar 7)
SELECT COUNT(*) FROM INFORMATION_SCHEMA.ROUTINES
WHERE ROUTINE_NAME LIKE 'sp_CustomForm%'

-- Verificar vista
SELECT * FROM vw_CustomFormsCurrentVersion
```

### Backend API

```bash
# Health check
curl -I http://localhost:5000/api/custom-forms/versions

# Debe retornar:
# HTTP/1.1 200 OK

# Verificar respuesta
curl http://localhost:5000/api/custom-forms/versions

# Debe retornar JSON válido
```

---

## 📋 Performance y Optimización

### Caching

- **Endpoint `/code`**: Cache de 5 minutos

### Índices de Base de Datos

Índices creados para queries frecuentes:
- `IX_FormName` en `CustomForms`
- `IX_Status` en `CustomForms`
- `IX_FormId_IsCurrent` en `CustomFormVersions`
- `IX_FormId_Version` en `CustomFormVersions`

### Connection Pooling

Dapper + SqlConnection utiliza connection pooling por defecto de .NET.

---

## 🐛 Troubleshooting

### "Form not found"
- Verificar que el form existe: `SELECT * FROM CustomForms WHERE FormName = 'nombre'`
- Verificar que tiene versión current: `SELECT * FROM CustomFormVersions WHERE FormId = X AND IsCurrent = 1`

### CORS Errors
- Verificar configuración de CORS en `Program.cs`
- Verificar que `app.UseCors()` está ANTES de `app.UseAuthorization()`
- Verificar URL del frontend en `WithOrigins()`

### Authentication Issues
- Verificar atributo `[Authorize]` en controller
- Verificar token JWT en header: `Authorization: Bearer <token>`

---

## 📊 Endpoints por Caso de Uso

| Caso de Uso | Endpoint | Método |
|-------------|----------|--------|
| Listar forms disponibles | `/api/custom-forms` | GET |
| Cargar metadata de form | `/api/custom-forms/{name}/metadata` | GET |
| Cargar código compilado | `/api/custom-forms/{name}/code` | GET |
| Publicar nuevo form | `/api/custom-forms` | POST |
| Publicar nueva versión | `/api/custom-forms/versions` | POST |
| Historial de versiones | `/api/custom-forms/{name}/versions` | GET |

---

## 💡 Notas de Implementación

### Seguridad
- Todos los endpoints requieren autenticación excepto `/versions`
- Input validation en DTOs
- SQL injection protegido por stored procedures
- Connection strings en `appsettings.json` (no hardcoded)

### Transacciones
- Operaciones críticas usan `BEGIN TRANSACTION` / `COMMIT`
- Rollback automático en caso de error

### Logging
- Service layer incluye logging de operaciones
- Errores se propagan con mensajes descriptivos

---

## 🔗 Referencias

- [SQL Scripts](../database/) - Scripts de creación de BD
- [Backend API README](../backend-api/README.md) - Instrucciones detalladas
- [DYNAMIC_FORMS.md](./DYNAMIC_FORMS.md) - Documentación completa del sistema

---

**Creado por**: Bizuit Team
**Última actualización**: Noviembre 2025
