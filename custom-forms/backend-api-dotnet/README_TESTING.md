# Guía Rápida: Testing Backend .NET

## ⚡ Quick Start

```bash
# 1. Iniciar ambos backends (en terminales separadas)
cd custom-forms/backend-api && source venv/bin/activate && python main.py
cd custom-forms/backend-api-dotnet/BizuitCustomForms.WebApi && dotnet run

# 2. Ejecutar tests de integración
cd custom-forms/backend-api-dotnet
./run-integration-tests.sh
```

## 📊 Tipos de Tests

### 1. Tests Unitarios

Tests de servicios individuales (CryptoService, DatabaseService, etc.):

```bash
cd custom-forms/backend-api-dotnet
dotnet test --filter "FullyQualifiedName!~Integration"
```

**Archivos:**
- `Services/CryptoServiceTests.cs` - Tests de encriptación/decriptación

### 2. Tests de Integración

Tests que comparan Python vs .NET (requieren ambos backends corriendo):

```bash
cd custom-forms/backend-api-dotnet
dotnet test --filter "FullyQualifiedName~Integration"
```

**Archivos:**
- `Integration/PythonVsDotnetComparisonTests.cs` - 12 tests comparativos
- `Integration/TestConfiguration.cs` - Configuración y helpers

## 🎯 Coverage de Tests

### Endpoints Testeados

| Categoría | Endpoint | Test |
|-----------|----------|------|
| **Health** | GET / | ✅ |
| **Health** | GET /health | ✅ |
| **Auth** | POST /api/auth/login | ✅ |
| **Auth** | POST /api/auth/validate | ✅ |
| **Auth** | POST /api/auth/refresh | ⚠️ Pendiente |
| **Form Tokens** | POST /api/forms/validate-token | ✅ |
| **Form Tokens** | DELETE /api/forms/close-token/:id | ⚠️ Pendiente |
| **Form Tokens** | POST /api/dashboard/validate-token | ✅ |
| **Custom Forms** | GET /api/custom-forms | ✅ |
| **Custom Forms** | GET /api/custom-forms/:name/code | ✅ |
| **Custom Forms** | GET /api/custom-forms/:name/versions | ✅ |
| **Custom Forms** | POST /api/custom-forms/:name/set-version | ⚠️ Pendiente |
| **Custom Forms** | DELETE /api/custom-forms/:name | ⚠️ Pendiente |
| **Deployment** | POST /api/deployment/upload | ⚠️ Pendiente |

**Total:** 7/15 endpoints testeados (47%)

### Próximos Tests a Implementar

1. **Refresh Token** - Validar renovación de JWT
2. **Close Token** - Validar cierre de form tokens
3. **Set Active Version** - Validar cambio de versión de forms
4. **Delete Form** - Validar eliminación de forms
5. **Upload Form** - Validar subida de nuevos forms

## 🔧 Configuración de Tests

### 1. Variables de Entorno

Editar `Integration/TestConfiguration.cs`:

```csharp
public const string TestUsername = "TU_USUARIO_TEST";
public const string TestPassword = "TU_PASSWORD_TEST";
public const string TestTenantId = "arielsch"; // o tu tenant
```

### 2. Tokens de Test

Para tests de form tokens, necesitas tokens válidos. Opciones:

**Opción A:** Generar con Dashboard
1. Ir al Dashboard en test.bizuit.com
2. Abrir un formulario
3. Capturar el parámetro `s` de la URL
4. Copiar a `TestConfiguration.ValidFormToken`

**Opción B:** Generar con script Python
```bash
cd custom-forms/backend-api
python scripts/generate-test-token.py
```

### 3. Forms de Test

Asegurar que existe un form llamado `test-form` en la BD:

```sql
INSERT INTO CustomForms (name, version, active, created_at)
VALUES ('test-form', '1.0.0', 1, GETDATE());
```

## 📈 Interpretando Resultados

### Output Exitoso

```
Test Run Successful.
Total tests: 12
     Passed: 12
 ✅ Backend .NET es compatible con Python!
```

### Output con Fallos

```
Test Run Failed.
Total tests: 12
     Passed: 9
     Failed: 3

Failed:
  - Login_BothBackends_ReturnSameJWTStructure
    Assert.Equal() Failure
    Expected: True
    Actual:   False
```

**Qué hacer:**
1. Revisar el test que falló en detalle
2. Comparar las respuestas exactas de Python vs .NET
3. Ajustar código .NET para que coincida
4. Re-ejecutar test específico:
   ```bash
   dotnet test --filter "Login_BothBackends_ReturnSameJWTStructure"
   ```

## 🐛 Debugging Tests

### Ver output detallado

```bash
dotnet test --logger "console;verbosity=detailed"
```

### Ejecutar un test específico

```bash
dotnet test --filter "MethodName~Login"
```

### Ejecutar tests con debugger

En Visual Studio / Rider:
1. Poner breakpoint en el test
2. Click derecho → Debug Test

### Ver requests HTTP

Los tests imprimen los requests/responses:

```csharp
_output.WriteLine($"Python response: {pythonJson}");
_output.WriteLine($"DotNet response: {dotnetJson}");
```

Ver en output del test.

## 📝 Agregar Nuevos Tests

### Template para nuevo test comparativo

```csharp
[Fact]
public async Task NuevoEndpoint_BothBackends_ReturnSameResponse()
{
    // Arrange
    var request = new { /* tu request */ };
    var content = new StringContent(
        JsonSerializer.Serialize(request),
        Encoding.UTF8,
        "application/json"
    );

    // Act
    var pythonResponse = await _pythonClient.PostAsync("/api/tu-endpoint", content);
    var dotnetResponse = await _dotnetClient.PostAsync("/api/tu-endpoint", content);

    // Assert
    Assert.Equal(pythonResponse.StatusCode, dotnetResponse.StatusCode);

    var pythonJson = await pythonResponse.Content.ReadFromJsonAsync<JsonElement>();
    var dotnetJson = await dotnetResponse.Content.ReadFromJsonAsync<JsonElement>();

    // Validar estructura específica
    Assert.True(pythonJson.TryGetProperty("expected_field", out _));
    Assert.True(dotnetJson.TryGetProperty("expected_field", out _));
}
```

### Helpers disponibles

En `TestConfiguration.cs`:

```csharp
// Comparar estructura JSON completa
bool equal = TestConfiguration.CompareJsonStructure(pythonJson, dotnetJson);

// Decodificar JWT payload
var payload = TestConfiguration.DecodeJwtPayload(jwtToken);

// Validar estructura de JWT
bool valid = TestConfiguration.ValidateJwtStructure(payload);
```

## 🚀 CI/CD Integration

### Azure Pipelines

Agregar step de testing:

```yaml
- task: DotNetCoreCLI@2
  displayName: 'Run Integration Tests'
  inputs:
    command: 'test'
    projects: '**/BizuitCustomForms.Tests.csproj'
    arguments: '--filter "FullyQualifiedName~Integration" --logger trx'
  condition: and(succeeded(), eq(variables['RunIntegrationTests'], 'true'))
```

### GitHub Actions

```yaml
- name: Run Integration Tests
  run: |
    cd custom-forms/backend-api-dotnet
    dotnet test --filter "FullyQualifiedName~Integration" --logger "console;verbosity=detailed"
```

## 📚 Referencias

- **Documentación completa:** [INTEGRATION_TESTING.md](INTEGRATION_TESTING.md)
- **Migration Status:** [MIGRATION_STATUS.md](MIGRATION_STATUS.md)
- **Backend Python:** `custom-forms/backend-api/`
- **Backend .NET:** `custom-forms/backend-api-dotnet/`

---

**Última actualización:** 2025-11-25
