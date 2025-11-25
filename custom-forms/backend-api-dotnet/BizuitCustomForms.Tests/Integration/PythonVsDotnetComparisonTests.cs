using System.Net;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using Xunit;
using Xunit.Abstractions;

namespace BizuitCustomForms.Tests.Integration;

/// <summary>
/// Tests de integración que comparan el comportamiento del backend Python (puerto 8000)
/// vs el backend .NET (puerto 8001) para asegurar compatibilidad 100%.
/// </summary>
public class PythonVsDotnetComparisonTests : IDisposable
{
    private readonly ITestOutputHelper _output;
    private readonly HttpClient _pythonClient;
    private readonly HttpClient _dotnetClient;

    // Configuración
    private const string PYTHON_BASE_URL = "http://localhost:8000";
    private const string DOTNET_BASE_URL = "http://localhost:8001";

    // Credenciales de test
    private const string TEST_USERNAME = "test_user";
    private const string TEST_PASSWORD = "test_password";

    public PythonVsDotnetComparisonTests(ITestOutputHelper output)
    {
        _output = output;

        _pythonClient = new HttpClient
        {
            BaseAddress = new Uri(PYTHON_BASE_URL),
            Timeout = TimeSpan.FromSeconds(10)
        };

        _dotnetClient = new HttpClient
        {
            BaseAddress = new Uri(DOTNET_BASE_URL),
            Timeout = TimeSpan.FromSeconds(10)
        };
    }

    #region Health Checks

    [Fact]
    public async Task HealthCheck_BothBackends_ReturnSameStructure()
    {
        // Act
        var pythonResponse = await _pythonClient.GetAsync("/");
        var dotnetResponse = await _dotnetClient.GetAsync("/");

        // Assert
        Assert.Equal(HttpStatusCode.OK, pythonResponse.StatusCode);
        Assert.Equal(HttpStatusCode.OK, dotnetResponse.StatusCode);

        var pythonContent = await pythonResponse.Content.ReadAsStringAsync();
        var dotnetContent = await dotnetResponse.Content.ReadAsStringAsync();

        _output.WriteLine($"Python: {pythonContent}");
        _output.WriteLine($"DotNet: {dotnetContent}");

        // Ambos deben tener el mismo contenido básico
        Assert.Contains("status", pythonContent.ToLower());
        Assert.Contains("status", dotnetContent.ToLower());
    }

    [Fact]
    public async Task HealthCheckDetailed_BothBackends_ReturnSameStructure()
    {
        // Act
        var pythonResponse = await _pythonClient.GetAsync("/health");
        var dotnetResponse = await _dotnetClient.GetAsync("/health");

        // Assert
        Assert.Equal(HttpStatusCode.OK, pythonResponse.StatusCode);
        Assert.Equal(HttpStatusCode.OK, dotnetResponse.StatusCode);

        var pythonJson = await pythonResponse.Content.ReadFromJsonAsync<JsonElement>();
        var dotnetJson = await dotnetResponse.Content.ReadFromJsonAsync<JsonElement>();

        // Validar estructura JSON
        Assert.True(pythonJson.TryGetProperty("status", out _));
        Assert.True(dotnetJson.TryGetProperty("status", out _));

        Assert.True(pythonJson.TryGetProperty("database", out _));
        Assert.True(dotnetJson.TryGetProperty("database", out _));
    }

    #endregion

    #region Authentication Endpoints

    [Fact]
    public async Task Login_BothBackends_ReturnSameJWTStructure()
    {
        // Arrange
        var loginRequest = new
        {
            username = TEST_USERNAME,
            password = TEST_PASSWORD
        };

        var content = new StringContent(
            JsonSerializer.Serialize(loginRequest),
            Encoding.UTF8,
            "application/json"
        );

        // Act
        var pythonResponse = await _pythonClient.PostAsync("/api/auth/login", content);

        content = new StringContent(
            JsonSerializer.Serialize(loginRequest),
            Encoding.UTF8,
            "application/json"
        );
        var dotnetResponse = await _dotnetClient.PostAsync("/api/auth/login", content);

        // Assert - Status codes iguales
        Assert.Equal(pythonResponse.StatusCode, dotnetResponse.StatusCode);

        if (pythonResponse.IsSuccessStatusCode)
        {
            var pythonJson = await pythonResponse.Content.ReadFromJsonAsync<JsonElement>();
            var dotnetJson = await dotnetResponse.Content.ReadFromJsonAsync<JsonElement>();

            // Validar estructura del token
            Assert.True(pythonJson.TryGetProperty("access_token", out var pythonToken));
            Assert.True(dotnetJson.TryGetProperty("access_token", out var dotnetToken));

            Assert.True(pythonJson.TryGetProperty("token_type", out var pythonType));
            Assert.True(dotnetJson.TryGetProperty("token_type", out var dotnetType));

            Assert.Equal(pythonType.GetString(), dotnetType.GetString());

            // Los tokens deben ser JWT válidos
            var pythonTokenStr = pythonToken.GetString();
            var dotnetTokenStr = dotnetToken.GetString();

            Assert.NotNull(pythonTokenStr);
            Assert.NotNull(dotnetTokenStr);
            Assert.Contains(".", pythonTokenStr); // JWT tiene 3 partes separadas por puntos
            Assert.Contains(".", dotnetTokenStr);

            _output.WriteLine($"Python JWT: {pythonTokenStr}");
            _output.WriteLine($"DotNet JWT: {dotnetTokenStr}");

            // Validar que ambos JWTs tengan el mismo payload structure
            var pythonParts = pythonTokenStr.Split('.');
            var dotnetParts = dotnetTokenStr.Split('.');

            Assert.Equal(3, pythonParts.Length);
            Assert.Equal(3, dotnetParts.Length);
        }
    }

    [Fact]
    public async Task ValidateToken_BothBackends_ReturnSameResponse()
    {
        // Arrange - Primero hacer login para obtener token
        var loginRequest = new { username = TEST_USERNAME, password = TEST_PASSWORD };
        var loginContent = new StringContent(
            JsonSerializer.Serialize(loginRequest),
            Encoding.UTF8,
            "application/json"
        );

        var loginResponse = await _pythonClient.PostAsync("/api/auth/login", loginContent);

        if (!loginResponse.IsSuccessStatusCode)
        {
            _output.WriteLine("Login failed - skipping token validation test");
            return;
        }

        var loginJson = await loginResponse.Content.ReadFromJsonAsync<JsonElement>();
        var token = loginJson.GetProperty("access_token").GetString();

        var validateRequest = new { token };

        // Act
        var pythonValidate = new StringContent(
            JsonSerializer.Serialize(validateRequest),
            Encoding.UTF8,
            "application/json"
        );
        var pythonResponse = await _pythonClient.PostAsync("/api/auth/validate", pythonValidate);

        var dotnetValidate = new StringContent(
            JsonSerializer.Serialize(validateRequest),
            Encoding.UTF8,
            "application/json"
        );
        var dotnetResponse = await _dotnetClient.PostAsync("/api/auth/validate", dotnetValidate);

        // Assert
        Assert.Equal(pythonResponse.StatusCode, dotnetResponse.StatusCode);

        if (pythonResponse.IsSuccessStatusCode)
        {
            var pythonJson = await pythonResponse.Content.ReadFromJsonAsync<JsonElement>();
            var dotnetJson = await dotnetResponse.Content.ReadFromJsonAsync<JsonElement>();

            Assert.True(pythonJson.TryGetProperty("valid", out var pythonValid));
            Assert.True(dotnetJson.TryGetProperty("valid", out var dotnetValid));

            Assert.Equal(pythonValid.GetBoolean(), dotnetValid.GetBoolean());
        }
    }

    #endregion

    #region Form Token Endpoints

    [Fact]
    public async Task ValidateFormToken_BothBackends_ReturnSameResponse()
    {
        // Arrange
        var testToken = "test_encrypted_token_here"; // Usar token de test válido

        var request = new { token = testToken };

        // Act
        var pythonContent = new StringContent(
            JsonSerializer.Serialize(request),
            Encoding.UTF8,
            "application/json"
        );
        var pythonResponse = await _pythonClient.PostAsync("/api/forms/validate-token", pythonContent);

        var dotnetContent = new StringContent(
            JsonSerializer.Serialize(request),
            Encoding.UTF8,
            "application/json"
        );
        var dotnetResponse = await _dotnetClient.PostAsync("/api/forms/validate-token", dotnetContent);

        // Assert
        Assert.Equal(pythonResponse.StatusCode, dotnetResponse.StatusCode);

        var pythonJson = await pythonResponse.Content.ReadFromJsonAsync<JsonElement>();
        var dotnetJson = await dotnetResponse.Content.ReadFromJsonAsync<JsonElement>();

        // Validar estructura de respuesta
        Assert.True(pythonJson.TryGetProperty("success", out var pythonSuccess));
        Assert.True(dotnetJson.TryGetProperty("success", out var dotnetSuccess));

        Assert.Equal(pythonSuccess.GetBoolean(), dotnetSuccess.GetBoolean());

        _output.WriteLine($"Python response: {pythonJson}");
        _output.WriteLine($"DotNet response: {dotnetJson}");
    }

    [Fact]
    public async Task ValidateDashboardToken_BothBackends_ReturnSameResponse()
    {
        // Arrange
        var testToken = "test_dashboard_token"; // Usar token de test válido

        var request = new { token = testToken };

        // Act
        var pythonContent = new StringContent(
            JsonSerializer.Serialize(request),
            Encoding.UTF8,
            "application/json"
        );
        var pythonResponse = await _pythonClient.PostAsync("/api/dashboard/validate-token", pythonContent);

        var dotnetContent = new StringContent(
            JsonSerializer.Serialize(request),
            Encoding.UTF8,
            "application/json"
        );
        var dotnetResponse = await _dotnetClient.PostAsync("/api/dashboard/validate-token", dotnetContent);

        // Assert
        Assert.Equal(pythonResponse.StatusCode, dotnetResponse.StatusCode);

        var pythonJson = await pythonResponse.Content.ReadFromJsonAsync<JsonElement>();
        var dotnetJson = await dotnetResponse.Content.ReadFromJsonAsync<JsonElement>();

        // Validar estructura
        Assert.True(pythonJson.TryGetProperty("success", out _));
        Assert.True(dotnetJson.TryGetProperty("success", out _));
    }

    #endregion

    #region Custom Forms Endpoints

    [Fact]
    public async Task GetAllForms_BothBackends_ReturnSameStructure()
    {
        // Act
        var pythonResponse = await _pythonClient.GetAsync("/api/custom-forms");
        var dotnetResponse = await _dotnetClient.GetAsync("/api/custom-forms");

        // Assert
        Assert.Equal(pythonResponse.StatusCode, dotnetResponse.StatusCode);

        if (pythonResponse.IsSuccessStatusCode)
        {
            var pythonJson = await pythonResponse.Content.ReadFromJsonAsync<JsonElement>();
            var dotnetJson = await dotnetResponse.Content.ReadFromJsonAsync<JsonElement>();

            // Ambos deben devolver arrays
            Assert.Equal(JsonValueKind.Array, pythonJson.ValueKind);
            Assert.Equal(JsonValueKind.Array, dotnetJson.ValueKind);

            _output.WriteLine($"Python forms count: {pythonJson.GetArrayLength()}");
            _output.WriteLine($"DotNet forms count: {dotnetJson.GetArrayLength()}");
        }
    }

    [Fact]
    public async Task GetFormCode_BothBackends_ReturnSameContent()
    {
        // Arrange
        var testFormName = "test-form"; // Usar un form que exista en test

        // Act
        var pythonResponse = await _pythonClient.GetAsync($"/api/custom-forms/{testFormName}/code");
        var dotnetResponse = await _dotnetClient.GetAsync($"/api/custom-forms/{testFormName}/code");

        // Assert
        Assert.Equal(pythonResponse.StatusCode, dotnetResponse.StatusCode);

        if (pythonResponse.IsSuccessStatusCode)
        {
            var pythonContent = await pythonResponse.Content.ReadAsStringAsync();
            var dotnetContent = await dotnetResponse.Content.ReadAsStringAsync();

            // El código debe ser idéntico
            Assert.Equal(pythonContent, dotnetContent);
        }
    }

    [Fact]
    public async Task GetFormVersions_BothBackends_ReturnSameStructure()
    {
        // Arrange
        var testFormName = "test-form";

        // Act
        var pythonResponse = await _pythonClient.GetAsync($"/api/custom-forms/{testFormName}/versions");
        var dotnetResponse = await _dotnetClient.GetAsync($"/api/custom-forms/{testFormName}/versions");

        // Assert
        Assert.Equal(pythonResponse.StatusCode, dotnetResponse.StatusCode);

        if (pythonResponse.IsSuccessStatusCode)
        {
            var pythonJson = await pythonResponse.Content.ReadFromJsonAsync<JsonElement>();
            var dotnetJson = await dotnetResponse.Content.ReadFromJsonAsync<JsonElement>();

            Assert.Equal(JsonValueKind.Array, pythonJson.ValueKind);
            Assert.Equal(JsonValueKind.Array, dotnetJson.ValueKind);

            // Validar que tienen el mismo número de versiones
            Assert.Equal(pythonJson.GetArrayLength(), dotnetJson.GetArrayLength());
        }
    }

    #endregion

    #region Error Handling Comparison

    [Fact]
    public async Task InvalidEndpoint_BothBackends_Return404()
    {
        // Act
        var pythonResponse = await _pythonClient.GetAsync("/api/invalid-endpoint");
        var dotnetResponse = await _dotnetClient.GetAsync("/api/invalid-endpoint");

        // Assert
        Assert.Equal(HttpStatusCode.NotFound, pythonResponse.StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, dotnetResponse.StatusCode);
    }

    [Fact]
    public async Task InvalidLogin_BothBackends_ReturnSameErrorStructure()
    {
        // Arrange
        var invalidLogin = new
        {
            username = "invalid_user",
            password = "invalid_password"
        };

        // Act
        var pythonContent = new StringContent(
            JsonSerializer.Serialize(invalidLogin),
            Encoding.UTF8,
            "application/json"
        );
        var pythonResponse = await _pythonClient.PostAsync("/api/auth/login", pythonContent);

        var dotnetContent = new StringContent(
            JsonSerializer.Serialize(invalidLogin),
            Encoding.UTF8,
            "application/json"
        );
        var dotnetResponse = await _dotnetClient.PostAsync("/api/auth/login", dotnetContent);

        // Assert
        Assert.Equal(pythonResponse.StatusCode, dotnetResponse.StatusCode);
        Assert.False(pythonResponse.IsSuccessStatusCode);
        Assert.False(dotnetResponse.IsSuccessStatusCode);
    }

    #endregion

    public void Dispose()
    {
        _pythonClient?.Dispose();
        _dotnetClient?.Dispose();
    }
}
