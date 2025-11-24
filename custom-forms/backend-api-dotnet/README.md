# BIZUIT Custom Forms - .NET Core Backend (WORK IN PROGRESS)

## 🚧 Estado del Proyecto

**Fecha inicio:** 2025-11-24
**Estado:** POC en desarrollo
**Objetivo:** Migrar backend de FastAPI (Python) a ASP.NET Core (C#)

## 📊 Progreso

- [x] Fase 1.1: Estructura de proyecto .NET creada
- [x] Fase 1.2: Dependencias NuGet instaladas
- [x] Fase 1.2: appsettings.json configurado
- [ ] Fase 1.3: POC - TripleDES decryption
- [ ] Fase 1.3: POC - Conexión SQL Server
- [ ] Fase 1.3: POC - JWT authentication
- [ ] Fase 1.3: POC - Endpoints básicos (health + login)
- [ ] Fase 2: Migración completa (15 endpoints)
- [ ] Fase 3: Testing y deployment

## 🏗️ Arquitectura

### Estructura del Proyecto

```
backend-api-dotnet/
├── BizuitCustomForms.sln
├── BizuitCustomForms.WebApi/
│   ├── Controllers/         # API endpoints
│   ├── Services/            # Business logic
│   ├── Models/              # DTOs y request/response models
│   ├── Middleware/          # Auth middleware
│   ├── appsettings.json     # Configuration
│   └── Program.cs           # App startup
└── BizuitCustomForms.Tests/
    └── (xUnit tests)
```

### Stack Tecnológico

- **.NET:** 9.0
- **Framework:** ASP.NET Core Web API
- **Database:** SQL Server (2 connections)
  - Dashboard DB: CustomForms, Users, Roles
  - Persistence DB: SecurityTokens
- **ORM:** Dapper (lightweight)
- **Authentication:** JWT Bearer
- **Logging:** Serilog
- **Rate Limiting:** AspNetCoreRateLimit

### Dependencias NuGet

```xml
<PackageReference Include="Microsoft.AspNetCore.Authentication.JwtBearer" Version="9.0.0" />
<PackageReference Include="System.Data.SqlClient" Version="4.9.0" />
<PackageReference Include="Dapper" Version="2.1.66" />
<PackageReference Include="AspNetCoreRateLimit" Version="5.0.0" />
<PackageReference Include="Serilog.AspNetCore" Version="9.0.0" />
```

## 🎯 Objetivos del POC

El POC debe validar los componentes más críticos antes de la migración completa:

### 1. TripleDES Decryption (CRÍTICO)
**Por qué:** Debe coincidir EXACTAMENTE con implementación del Dashboard (C#)

**Validación:**
- Decrypt token del Dashboard (parámetro 's')
- Comparar resultado con backend Python
- Asegurar misma key, mode, padding

### 2. Conexión SQL Server
**Por qué:** Validar acceso a ambas bases de datos

**Validación:**
- Conectar a Dashboard DB
- Conectar a Persistence DB
- Ejecutar query simple en cada una

### 3. JWT Authentication
**Por qué:** Frontend ya depende del formato de JWT actual

**Validación:**
- Generar JWT con misma estructura que Python
- Mismo secret key
- Mismo payload (username, tenant_id, user_info, exp, iat, type)
- Validar que frontend pueda usar el token

### 4. Endpoints Básicos
**Por qué:** Probar integración end-to-end

**Validación:**
- `GET /` - Health check
- `POST /api/auth/login` - Login completo
- Frontend puede autenticar contra backend .NET

## 🔧 Configuración

### appsettings.json

Todas las configuraciones están en `appsettings.json`:
- Connection strings (Dashboard DB + Persistence DB)
- Bizuit Dashboard API URL
- JWT secret key
- TripleDES encryption key
- Admin allowed roles
- CORS origins
- Rate limiting rules

**IMPORTANTE:** El archivo actual usa credenciales de desarrollo. Para producción, usar User Secrets o Azure Key Vault.

## 🚀 Cómo Ejecutar

```bash
cd custom-forms/backend-api-dotnet/BizuitCustomForms.WebApi
dotnet run
```

**Puerto:** 8001 (diferente del backend Python en 8000)

## 🧪 Testing

```bash
cd custom-forms/backend-api-dotnet
dotnet test
```

## 📝 Notas de Migración

### Diferencias con Backend Python

| Aspecto | Python (Puerto 8000) | .NET (Puerto 8001) |
|---------|---------------------|-------------------|
| Framework | FastAPI | ASP.NET Core |
| ORM | Raw SQL (pyodbc) | Dapper |
| Proceso | PM2 | IIS (nativo) |
| Logs | Custom print() | Serilog |
| Config | .env.local | appsettings.json |

### Compatibilidad con Frontend

El backend .NET debe ser **100% compatible** con el frontend Next.js actual:
- ✅ Mismos endpoints
- ✅ Misma estructura de JSON
- ✅ Mismo formato de JWT
- ✅ Mismos headers CORS
- ✅ Misma validación de tenant_id

## 🔄 Estrategia de Transición

1. **Desarrollo en paralelo** - Ambos backends funcionan simultáneamente
2. **Testing side-by-side** - Comparar comportamiento
3. **Switch gradual** - Frontend puede elegir backend via env var
4. **Rollback fácil** - Python sigue disponible si hay problemas

## 📚 Próximos Pasos

Ver TODO list en el código para pasos detallados de implementación.

---

**Última actualización:** 2025-11-24
**Autor:** Claude Code
**Contacto:** Ver repositorio principal
