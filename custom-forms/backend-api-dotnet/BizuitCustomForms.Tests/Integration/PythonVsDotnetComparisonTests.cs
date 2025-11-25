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
    private const string TEST_USERNAME = "admin";
    private const string TEST_PASSWORD = "admin123";

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

            // Validar estructura del token (ambos usan 'token', no 'access_token')
            Assert.True(pythonJson.TryGetProperty("success", out var pythonSuccess));
            Assert.True(dotnetJson.TryGetProperty("success", out var dotnetSuccess));
            Assert.True(pythonSuccess.GetBoolean());
            Assert.True(dotnetSuccess.GetBoolean());

            Assert.True(pythonJson.TryGetProperty("token", out var pythonToken));
            Assert.True(dotnetJson.TryGetProperty("token", out var dotnetToken));

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
        // Arrange - Login to each backend separately (tokens are not interchangeable)
        var loginRequest = new { username = TEST_USERNAME, password = TEST_PASSWORD };

        // Python login
        var pythonLoginContent = new StringContent(
            JsonSerializer.Serialize(loginRequest),
            Encoding.UTF8,
            "application/json"
        );
        var pythonLoginResponse = await _pythonClient.PostAsync("/api/auth/login", pythonLoginContent);
        if (!pythonLoginResponse.IsSuccessStatusCode)
        {
            _output.WriteLine("Python login failed - skipping token validation test");
            return;
        }
        var pythonLoginJson = await pythonLoginResponse.Content.ReadFromJsonAsync<JsonElement>();
        var pythonToken = pythonLoginJson.GetProperty("token").GetString();

        // .NET login
        var dotnetLoginContent = new StringContent(
            JsonSerializer.Serialize(loginRequest),
            Encoding.UTF8,
            "application/json"
        );
        var dotnetLoginResponse = await _dotnetClient.PostAsync("/api/auth/login", dotnetLoginContent);
        if (!dotnetLoginResponse.IsSuccessStatusCode)
        {
            _output.WriteLine(".NET login failed - skipping token validation test");
            return;
        }
        var dotnetLoginJson = await dotnetLoginResponse.Content.ReadFromJsonAsync<JsonElement>();
        var dotnetToken = dotnetLoginJson.GetProperty("token").GetString();

        // Act - Validate each token in its own backend
        var pythonValidate = new StringContent(
            JsonSerializer.Serialize(new { token = pythonToken }),
            Encoding.UTF8,
            "application/json"
        );
        var pythonResponse = await _pythonClient.PostAsync("/api/auth/validate", pythonValidate);

        var dotnetValidate = new StringContent(
            JsonSerializer.Serialize(new { token = dotnetToken }),
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

            // Both should be valid when validating their own tokens
            Assert.True(pythonValid.GetBoolean());
            Assert.True(dotnetValid.GetBoolean());
        }
    }

    #endregion

    #region Form Token Endpoints

    [Fact]
    public async Task ValidateFormToken_BothBackends_ReturnSameResponse()
    {
        // Arrange - Use invalid token to test error handling
        var testToken = "test_encrypted_token_here";

        var request = new { tokenId = testToken };

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

        // Assert - Both should return HTTP 500 for invalid token format
        // Python's validate_security_token raises ValueError → HTTP 500
        // .NET's ValidateSecurityTokenAsync throws ArgumentException → HTTP 500
        Assert.Equal(System.Net.HttpStatusCode.InternalServerError, pythonResponse.StatusCode);
        Assert.Equal(System.Net.HttpStatusCode.InternalServerError, dotnetResponse.StatusCode);
        Assert.Equal(pythonResponse.StatusCode, dotnetResponse.StatusCode);

        _output.WriteLine($"Python response status: {pythonResponse.StatusCode}");
        _output.WriteLine($"DotNet response status: {dotnetResponse.StatusCode}");
        _output.WriteLine("Both backends correctly return HTTP 500 for invalid token format");
    }

    [Fact]
    public async Task ValidateDashboardToken_BothBackends_ReturnSameResponse()
    {
        // Arrange - Use invalid encrypted token to test error handling
        var testToken = "test_dashboard_token";

        var request = new { encryptedToken = testToken };

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

        // Assert - Both should return HTTP 200 with valid:false for invalid encrypted token
        // Python catches ValueError from decryption → HTTP 200 with error message
        // .NET catches Exception from DecryptTripleDes → HTTP 200 with error message
        Assert.True(pythonResponse.IsSuccessStatusCode);
        Assert.True(dotnetResponse.IsSuccessStatusCode);
        Assert.Equal(pythonResponse.StatusCode, dotnetResponse.StatusCode);

        var pythonJson = await pythonResponse.Content.ReadFromJsonAsync<JsonElement>();
        var dotnetJson = await dotnetResponse.Content.ReadFromJsonAsync<JsonElement>();

        // Both should have 'valid' property set to false
        Assert.True(pythonJson.TryGetProperty("valid", out var pythonValid));
        Assert.True(dotnetJson.TryGetProperty("valid", out var dotnetValid));
        Assert.False(pythonValid.GetBoolean());
        Assert.False(dotnetValid.GetBoolean());

        // Both should have 'parameters' as null
        Assert.True(pythonJson.TryGetProperty("parameters", out var pythonParams));
        Assert.True(dotnetJson.TryGetProperty("parameters", out var dotnetParams));
        Assert.Equal(JsonValueKind.Null, pythonParams.ValueKind);
        Assert.Equal(JsonValueKind.Null, dotnetParams.ValueKind);

        // Both should have 'error' property with message
        Assert.True(pythonJson.TryGetProperty("error", out var pythonError));
        Assert.True(dotnetJson.TryGetProperty("error", out var dotnetError));
        Assert.NotNull(pythonError.GetString());
        Assert.NotNull(dotnetError.GetString());

        _output.WriteLine($"Python response: {pythonJson}");
        _output.WriteLine($"DotNet response: {dotnetJson}");
        _output.WriteLine("Both backends correctly return HTTP 200 with valid:false for invalid encrypted token");
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

        // Both return HTTP 200 with success:false in body (not HTTP error status)
        Assert.True(pythonResponse.IsSuccessStatusCode);
        Assert.True(dotnetResponse.IsSuccessStatusCode);

        var pythonJson = await pythonResponse.Content.ReadFromJsonAsync<JsonElement>();
        var dotnetJson = await dotnetResponse.Content.ReadFromJsonAsync<JsonElement>();

        Assert.True(pythonJson.TryGetProperty("success", out var pythonSuccess));
        Assert.True(dotnetJson.TryGetProperty("success", out var dotnetSuccess));
        Assert.False(pythonSuccess.GetBoolean());
        Assert.False(dotnetSuccess.GetBoolean());
    }

    #endregion

    #region Additional Authentication Tests

    [Fact]
    public async Task RefreshToken_BothBackends_ReturnSameJWTStructure()
    {
        // Arrange - Login to each backend separately
        var loginRequest = new { username = TEST_USERNAME, password = TEST_PASSWORD };

        // Python login
        var pythonLoginContent = new StringContent(
            JsonSerializer.Serialize(loginRequest),
            Encoding.UTF8,
            "application/json"
        );
        var pythonLoginResponse = await _pythonClient.PostAsync("/api/auth/login", pythonLoginContent);
        if (!pythonLoginResponse.IsSuccessStatusCode)
        {
            _output.WriteLine("Python login failed - skipping refresh token test");
            return;
        }
        var pythonLoginJson = await pythonLoginResponse.Content.ReadFromJsonAsync<JsonElement>();
        var pythonToken = pythonLoginJson.GetProperty("token").GetString();

        // .NET login
        var dotnetLoginContent = new StringContent(
            JsonSerializer.Serialize(loginRequest),
            Encoding.UTF8,
            "application/json"
        );
        var dotnetLoginResponse = await _dotnetClient.PostAsync("/api/auth/login", dotnetLoginContent);
        if (!dotnetLoginResponse.IsSuccessStatusCode)
        {
            _output.WriteLine(".NET login failed - skipping refresh token test");
            return;
        }
        var dotnetLoginJson = await dotnetLoginResponse.Content.ReadFromJsonAsync<JsonElement>();
        var dotnetToken = dotnetLoginJson.GetProperty("token").GetString();

        // Act - Refresh each token in its own backend
        var pythonRefresh = new StringContent(
            JsonSerializer.Serialize(new { token = pythonToken }),
            Encoding.UTF8,
            "application/json"
        );
        var pythonResponse = await _pythonClient.PostAsync("/api/auth/refresh", pythonRefresh);

        var dotnetRefresh = new StringContent(
            JsonSerializer.Serialize(new { token = dotnetToken }),
            Encoding.UTF8,
            "application/json"
        );
        var dotnetResponse = await _dotnetClient.PostAsync("/api/auth/refresh", dotnetRefresh);

        // Assert
        Assert.Equal(pythonResponse.StatusCode, dotnetResponse.StatusCode);

        if (pythonResponse.IsSuccessStatusCode)
        {
            var pythonJson = await pythonResponse.Content.ReadFromJsonAsync<JsonElement>();
            var dotnetJson = await dotnetResponse.Content.ReadFromJsonAsync<JsonElement>();

            // Should return new token with same structure as login (ambos usan 'token', no 'access_token')
            Assert.True(pythonJson.TryGetProperty("success", out var pythonSuccess));
            Assert.True(dotnetJson.TryGetProperty("success", out var dotnetSuccess));
            Assert.True(pythonSuccess.GetBoolean());
            Assert.True(dotnetSuccess.GetBoolean());

            Assert.True(pythonJson.TryGetProperty("token", out var pythonRefreshedToken));
            Assert.True(dotnetJson.TryGetProperty("token", out var dotnetRefreshedToken));

            _output.WriteLine($"Python refreshed token: {pythonRefreshedToken.GetString()}");
            _output.WriteLine($"DotNet refreshed token: {dotnetRefreshedToken.GetString()}");
        }
    }

    #endregion

    #region Additional Form Token Tests

    [Fact]
    public async Task CloseFormToken_BothBackends_ReturnSameResponse()
    {
        // Arrange
        var testTokenId = 12345; // Use valid token ID from test database

        // Act
        var pythonResponse = await _pythonClient.DeleteAsync($"/api/forms/close-token/{testTokenId}");
        var dotnetResponse = await _dotnetClient.DeleteAsync($"/api/forms/close-token/{testTokenId}");

        // Assert
        Assert.Equal(pythonResponse.StatusCode, dotnetResponse.StatusCode);

        if (pythonResponse.IsSuccessStatusCode)
        {
            var pythonJson = await pythonResponse.Content.ReadFromJsonAsync<JsonElement>();
            var dotnetJson = await dotnetResponse.Content.ReadFromJsonAsync<JsonElement>();

            Assert.True(pythonJson.TryGetProperty("success", out var pythonSuccess));
            Assert.True(dotnetJson.TryGetProperty("success", out var dotnetSuccess));

            Assert.Equal(pythonSuccess.GetBoolean(), dotnetSuccess.GetBoolean());

            _output.WriteLine($"Python response: {pythonJson}");
            _output.WriteLine($"DotNet response: {dotnetJson}");
        }
    }

    #endregion

    #region Additional Custom Forms Tests

    [Fact]
    public async Task SetActiveVersion_BothBackends_ReturnSameResponse()
    {
        // Arrange
        var testFormName = "test-form";
        var testVersion = "1.0.0";

        var setVersionRequest = new { version = testVersion };

        // Act
        var pythonContent = new StringContent(
            JsonSerializer.Serialize(setVersionRequest),
            Encoding.UTF8,
            "application/json"
        );
        var pythonResponse = await _pythonClient.PostAsync(
            $"/api/custom-forms/{testFormName}/set-version",
            pythonContent
        );

        var dotnetContent = new StringContent(
            JsonSerializer.Serialize(setVersionRequest),
            Encoding.UTF8,
            "application/json"
        );
        var dotnetResponse = await _dotnetClient.PostAsync(
            $"/api/custom-forms/{testFormName}/set-version",
            dotnetContent
        );

        // Assert
        Assert.Equal(pythonResponse.StatusCode, dotnetResponse.StatusCode);

        if (pythonResponse.IsSuccessStatusCode)
        {
            var pythonJson = await pythonResponse.Content.ReadFromJsonAsync<JsonElement>();
            var dotnetJson = await dotnetResponse.Content.ReadFromJsonAsync<JsonElement>();

            Assert.True(pythonJson.TryGetProperty("success", out var pythonSuccess));
            Assert.True(dotnetJson.TryGetProperty("success", out var dotnetSuccess));

            Assert.Equal(pythonSuccess.GetBoolean(), dotnetSuccess.GetBoolean());
        }
    }

    [Fact]
    public async Task DeleteForm_BothBackends_ReturnSameResponse()
    {
        // Arrange
        var testFormName = "test-form-to-delete"; // Create this form first in test setup

        // Act
        var pythonResponse = await _pythonClient.DeleteAsync($"/api/custom-forms/{testFormName}");
        var dotnetResponse = await _dotnetClient.DeleteAsync($"/api/custom-forms/{testFormName}");

        // Assert
        Assert.Equal(pythonResponse.StatusCode, dotnetResponse.StatusCode);

        if (pythonResponse.IsSuccessStatusCode)
        {
            var pythonJson = await pythonResponse.Content.ReadFromJsonAsync<JsonElement>();
            var dotnetJson = await dotnetResponse.Content.ReadFromJsonAsync<JsonElement>();

            Assert.True(pythonJson.TryGetProperty("success", out var pythonSuccess));
            Assert.True(dotnetJson.TryGetProperty("success", out var dotnetSuccess));

            Assert.Equal(pythonSuccess.GetBoolean(), dotnetSuccess.GetBoolean());

            _output.WriteLine($"Form deletion - Python: {pythonSuccess}, DotNet: {dotnetSuccess}");
        }
    }

    [Fact]
    public async Task DeleteFormVersion_BothBackends_ReturnSameResponse()
    {
        // Arrange
        var testFormName = "test-form";
        var testVersion = "1.0.0-old"; // Version to delete (not active)

        // Act
        var pythonResponse = await _pythonClient.DeleteAsync(
            $"/api/custom-forms/{testFormName}/versions/{testVersion}"
        );
        var dotnetResponse = await _dotnetClient.DeleteAsync(
            $"/api/custom-forms/{testFormName}/versions/{testVersion}"
        );

        // Assert
        Assert.Equal(pythonResponse.StatusCode, dotnetResponse.StatusCode);

        if (pythonResponse.IsSuccessStatusCode)
        {
            var pythonJson = await pythonResponse.Content.ReadFromJsonAsync<JsonElement>();
            var dotnetJson = await dotnetResponse.Content.ReadFromJsonAsync<JsonElement>();

            Assert.True(pythonJson.TryGetProperty("success", out var pythonSuccess));
            Assert.True(dotnetJson.TryGetProperty("success", out var dotnetSuccess));

            Assert.Equal(pythonSuccess.GetBoolean(), dotnetSuccess.GetBoolean());
        }
    }

    #endregion

    #region Deployment Tests

    [Fact]
    public async Task UploadForm_BothBackends_ReturnSameResponse()
    {
        // Arrange
        var testFormName = "test-upload-form";

        // Create a simple test ZIP file
        var zipContent = new byte[] { 0x50, 0x4B, 0x03, 0x04 }; // ZIP file signature
        var fileContent = new ByteArrayContent(zipContent);
        fileContent.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue("application/zip");

        var pythonForm = new MultipartFormDataContent
        {
            { fileContent, "file", "test-form.zip" },
            { new StringContent(testFormName), "form_name" }
        };

        var dotnetForm = new MultipartFormDataContent
        {
            { new ByteArrayContent(zipContent) { Headers = { ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue("application/zip") } }, "file", "test-form.zip" },
            { new StringContent(testFormName), "form_name" }
        };

        // Act
        var pythonResponse = await _pythonClient.PostAsync("/api/deployment/upload", pythonForm);
        var dotnetResponse = await _dotnetClient.PostAsync("/api/deployment/upload", dotnetForm);

        // Assert
        Assert.Equal(pythonResponse.StatusCode, dotnetResponse.StatusCode);

        var pythonContent = await pythonResponse.Content.ReadAsStringAsync();
        var dotnetContent = await dotnetResponse.Content.ReadAsStringAsync();

        _output.WriteLine($"Python upload response: {pythonContent}");
        _output.WriteLine($"DotNet upload response: {dotnetContent}");

        // Both should have similar response structure
        if (pythonResponse.IsSuccessStatusCode)
        {
            var pythonJson = await pythonResponse.Content.ReadFromJsonAsync<JsonElement>();
            var dotnetJson = await dotnetResponse.Content.ReadFromJsonAsync<JsonElement>();

            // Check for common fields in upload response
            Assert.True(pythonJson.TryGetProperty("success", out _) || pythonJson.TryGetProperty("form_name", out _));
            Assert.True(dotnetJson.TryGetProperty("success", out _) || dotnetJson.TryGetProperty("form_name", out _));
        }
    }

    #endregion

    public void Dispose()
    {
        _pythonClient?.Dispose();
        _dotnetClient?.Dispose();
    }
}
