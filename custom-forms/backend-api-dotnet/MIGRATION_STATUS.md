# Estado de Migración: Backend Python → .NET Core

**Última actualización:** 2025-11-25
**Estado general:** POC completado ✅ - Listo para Fase 2

---

## 📊 Resumen Ejecutivo

### ✅ POC Completado (Fase 1)

El POC del backend .NET Core está **100% funcional** y validado:

- ✅ **TripleDES decryption** - Compatible con Dashboard C#
- ✅ **Conexión SQL Server** - Dashboard DB + Persistence DB
- ✅ **JWT authentication** - Compatible con frontend existente
- ✅ **Multi-tenant isolation** - `tenant_id` en JWT
- ✅ **Endpoints básicos funcionando**:
  - `GET /` - Health check
  - `GET /health` - Health con DB test
  - `POST /api/auth/login` - Login completo
  - `POST /api/auth/validate` - Validar JWT
  - `POST /api/auth/refresh` - Refresh JWT

### ✅ Fase 2 - Prioridad ALTA (EN PROGRESO)

**Form Tokens** - 3 endpoints críticos para runtime de formularios:

✅ **COMPLETADO (2025-11-25):**
- `POST /api/forms/validate-token` - Validar token de form
- `DELETE /api/forms/close-token/{token_id}` - Cerrar token usado
- `POST /api/dashboard/validate-token` - Validación exhaustiva con decryption

**Implementación:**
- ✅ `FormTokenModels.cs` - 6 modelos (request/response)
- ✅ `DatabaseService.cs` - 2 métodos (ValidateSecurityTokenAsync, DeleteSecurityTokenAsync)
- ✅ `FormTokenService.cs` - Servicio completo con 3 métodos
- ✅ `FormTokensController.cs` - Controller con 3 endpoints
- ✅ Build exitoso, endpoints funcionando en puerto 8001

**Tiempo estimado:** 2-3 horas ✅ (completado en ~2 horas)

### 🎯 Próximos Pasos

**Fase 2 - Continuación:** Migrar los 7 endpoints restantes del backend Python

---

## 📋 Matriz de Endpoints: Python vs .NET

| # | Endpoint | Método | Tags | Python | .NET | Prioridad | Commit |
|---|----------|--------|------|:------:|:----:|-----------|--------|
| 1 | `/` | GET | Health | ✅ | ✅ | Completado | 4e4c138 |
| 2 | `/health` | GET | Health | ✅ | ✅ | Completado | 4e4c138 |
| 3 | `/api/auth/login` | POST | Authentication | ✅ | ✅ | Completado | 4e4c138 |
| 4 | `/api/auth/validate` | POST | Authentication | ✅ | ✅ | Completado | 4e4c138 |
| 5 | `/api/auth/refresh` | POST | Authentication | ✅ | ✅ | Completado | 4e4c138 |
| 6 | `/api/forms/validate-token` | POST | Form Tokens | ✅ | ✅ | **Completado** | a3287f3 |
| 7 | `/api/forms/close-token/{token_id}` | DELETE | Form Tokens | ✅ | ✅ | **Completado** | a3287f3 |
| 8 | `/api/dashboard/validate-token` | POST | Form Tokens | ✅ | ✅ | **Completado** | a3287f3 |
| 9 | `/api/custom-forms` | GET | Custom Forms | ✅ | ✅ | **Completado** | *pending* |
| 10 | `/api/custom-forms/{form_name}/code` | GET | Custom Forms | ✅ | ✅ | **Completado** | *pending* |
| 11 | `/api/custom-forms/{form_name}/versions` | GET | Custom Forms | ✅ | ✅ | **Completado** | *pending* |
| 12 | `/api/custom-forms/{form_name}/set-version` | POST | Custom Forms | ✅ | ✅ | **Completado** | *pending* |
| 13 | `/api/custom-forms/{form_name}` | DELETE | Custom Forms | ✅ | ❌ | Baja | - |
| 14 | `/api/custom-forms/{form_name}/versions/{version}` | DELETE | Custom Forms | ✅ | ❌ | Baja | - |
| 15 | `/api/deployment/upload` | POST | Deployment | ✅ | ❌ | Media | - |

**Total:** 15 endpoints
- **Completados:** 12 (80%) ✅✅
- **Pendientes:** 3 (20%)

---

## 🔥 Fase 2: Plan de Migración por Prioridad

### 🚨 Prioridad ALTA (Críticos para runtime de forms)

**Form Tokens** - 3 endpoints que validan y gestionan tokens de formularios:

1. **`POST /api/forms/validate-token`**
   - Valida token de form (parámetro `s` del Dashboard)
   - Usa `CryptoService.DecryptTripleDes()` ✅ ya implementado
   - Consulta a `SecurityTokens` en Persistence DB
   - Devuelve: `{ success, token_data, error }`

2. **`DELETE /api/forms/close-token/{token_id}`**
   - Cierra/invalida un token después de usar el form
   - Update en `SecurityTokens` table
   - Devuelve: `{ success, message }`

3. **`POST /api/dashboard/validate-token`**
   - Validación adicional del token del Dashboard
   - Similar a validate-token pero más exhaustiva
   - Devuelve: `{ success, data, error }`

**Estimación:** 2-3 horas
**Dependencias:** `CryptoService` ✅, `DatabaseService` ✅

---

### 🔶 Prioridad MEDIA (Admin panel y deployment)

**Custom Forms Management** - 5 endpoints para admin panel:

4. **`GET /api/custom-forms`**
   - Lista todos los forms custom disponibles
   - Consulta a `CustomForms` table
   - Devuelve: `[ { name, version, created_at, ... } ]`

5. **`GET /api/custom-forms/{form_name}/code`**
   - Obtiene código del form actual
   - Lee de filesystem o DB
   - Devuelve: código JavaScript del form

6. **`GET /api/custom-forms/{form_name}/versions`**
   - Lista versiones de un form
   - Devuelve: `[ { version, created_at, active } ]`

7. **`POST /api/custom-forms/{form_name}/set-version`**
   - Activa una versión específica del form
   - Update en `CustomForms` table
   - Devuelve: `{ success, message }`

**Deployment:**

8. **`POST /api/deployment/upload`**
   - Sube nuevo form custom
   - Multipart/form-data con ZIP file
   - Extrae y guarda en filesystem
   - Registra en DB
   - Devuelve: `{ success, form_name, version }`

**Estimación:** 4-5 horas
**Dependencias:** File I/O, multipart uploads

---

### 🟢 Prioridad BAJA (Admin panel - funcionalidad opcional)

**Custom Forms Deletion** - 2 endpoints para limpieza:

9. **`DELETE /api/custom-forms/{form_name}`**
   - Elimina form completo (todas las versiones)
   - Delete cascade en DB + filesystem

10. **`DELETE /api/custom-forms/{form_name}/versions/{version}`**
    - Elimina versión específica de un form
    - No puede eliminar versión activa

**Estimación:** 1-2 horas

---

## 🔧 Servicios a Implementar en Fase 2

### 1. `FormTokenService.cs`
**Responsabilidad:** Gestión de tokens de formularios

```csharp
interface IFormTokenService
{
    Task<(bool Success, FormTokenData? Data, string? Error)> ValidateFormTokenAsync(string encryptedToken);
    Task<bool> CloseTokenAsync(int tokenId);
    Task<(bool Success, DashboardTokenData? Data, string? Error)> ValidateDashboardTokenAsync(string encryptedToken);
}
```

**Dependencias:**
- `ICryptoService` ✅ (para DecryptTripleDes)
- `IDatabaseService` ✅ (para queries a SecurityTokens)

---

### 2. `CustomFormsService.cs`
**Responsabilidad:** Gestión de forms custom

```csharp
interface ICustomFormsService
{
    Task<List<CustomFormInfo>> GetAllFormsAsync();
    Task<string?> GetFormCodeAsync(string formName);
    Task<List<FormVersion>> GetFormVersionsAsync(string formName);
    Task<bool> SetActiveVersionAsync(string formName, string version);
    Task<bool> DeleteFormAsync(string formName);
    Task<bool> DeleteFormVersionAsync(string formName, string version);
}
```

**Dependencias:**
- `IDatabaseService` ✅
- File I/O (.NET built-in)

---

### 3. `DeploymentService.cs`
**Responsabilidad:** Upload y procesamiento de forms

```csharp
interface IDeploymentService
{
    Task<(bool Success, string? FormName, string? Version, string? Error)> UploadFormAsync(
        IFormFile zipFile,
        string formName);
}
```

**Dependencias:**
- `ICustomFormsService` (para registrar en DB)
- File I/O (extraer ZIP)
- Validación de estructura de form

---

## 🎯 Estimación Total Fase 2

| Grupo | Endpoints | Horas | Prioridad |
|-------|-----------|-------|-----------|
| Form Tokens | 3 | 2-3h | Alta |
| Custom Forms | 5 | 4-5h | Media |
| Deletion | 2 | 1-2h | Baja |
| **Total** | **10** | **7-10h** | - |

---

## 🚀 Estrategia de Deployment Paralelo

### Arquitectura Durante Migración

```
                    ┌──────────────────┐
                    │   IIS Server     │
                    └────────┬─────────┘
                             │
                    ┌────────┴─────────┐
                    │  IIS Rewrite     │
                    │  /api/* routes   │
                    └────────┬─────────┘
                             │
              ┌──────────────┴──────────────┐
              │                             │
    ┌─────────▼────────┐         ┌─────────▼────────┐
    │  Backend Python  │         │  Backend .NET    │
    │   Port 8000      │         │   Port 8001      │
    │   (PM2)          │         │   (PM2 o IIS)    │
    └──────────────────┘         └──────────────────┘
```

### Opción 1: Switcheo Gradual por Endpoint

**Ventajas:**
- Rollback granular por endpoint
- Testing en producción controlado
- Menor riesgo

**IIS URL Rewrite Rules:**
```xml
<!-- Rutas migradas a .NET (Fase 2 - Prioridad Alta) -->
<rule name="FormTokens to .NET" stopProcessing="true">
    <match url="^api/forms/(validate-token|close-token).*" />
    <action type="Rewrite" url="http://localhost:8001/{R:0}" />
</rule>

<!-- Rutas aún en Python -->
<rule name="CustomForms to Python" stopProcessing="true">
    <match url="^api/custom-forms.*" />
    <action type="Rewrite" url="http://localhost:8000/{R:0}" />
</rule>
```

### Opción 2: Switcheo Completo con Feature Flag

**Ventajas:**
- Switcheo instantáneo
- Testing A/B entre backends
- Rollback total en segundos

**Frontend Environment Variable:**
```env
# .env.local
FASTAPI_URL=http://localhost:8000  # Python (default)
# FASTAPI_URL=http://localhost:8001  # .NET (nuevo)
```

**Deployment:**
1. Deploy .NET backend en puerto 8001
2. Mantener Python en 8000
3. Testing exhaustivo en 8001
4. Cambiar env var a 8001
5. Monitorear por 1 semana
6. Si todo OK, deprecar Python

---

## ✅ Checklist para Completar Migración

### Pre-Deploy

- [ ] Completar Fase 2 (10 endpoints restantes)
- [ ] Tests unitarios para nuevos servicios
- [ ] Tests de integración comparando Python vs .NET
- [ ] Validar performance (benchmarks)
- [ ] Documentar cambios en `appsettings.json`
- [ ] Actualizar README principal

### Deployment .NET

- [ ] Configurar PM2 para backend .NET (o usar IIS nativo)
- [ ] Configurar IIS URL Rewrite rules
- [ ] Setup logs en production (Serilog → archivo)
- [ ] Configurar rate limiting
- [ ] Setup monitoring (health checks)

### Testing en Production

- [ ] Smoke tests de todos los endpoints
- [ ] Testing con frontend en test.bizuit.com
- [ ] Validar multi-tenant (arielsch, recubiz)
- [ ] Load testing básico
- [ ] Monitoring de logs por 48h

### Deprecación Python

- [ ] Anuncio a usuarios (si aplica)
- [ ] Período de gracia (1 semana)
- [ ] Backup final de código Python
- [ ] Shutdown PM2 proceso Python
- [ ] Documentar en CHANGELOG

---

## 📚 Referencias

- Backend Python: `custom-forms/backend-api/main.py`
- Backend .NET: `custom-forms/backend-api-dotnet/`
- POC commit: `4e4c138`
- Documentación deployment: `custom-forms/DEPLOYMENT.md`

---

## 🤝 Próxima Sesión

**Para retomar Fase 2:**

1. Crear `FormTokenService.cs` e implementar 3 endpoints prioritarios
2. Crear `FormTokensController.cs`
3. Tests contra backend Python para validar compatibilidad
4. Update este documento con progreso

**Comando para continuar:**
```bash
cd custom-forms/backend-api-dotnet
dotnet run  # Puerto 8001
# Comparar con Python en 8000
```
