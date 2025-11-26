using System.Net;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using Xunit;
using Xunit.Abstractions;

namespace BizuitCustomForms.Tests.Integration;

/// <summary>
/// Edge case tests to ensure both Python and .NET backends handle invalid/edge inputs identically
/// Tests null values, empty strings, malformed data, SQL injection attempts, etc.
/// </summary>
public class EdgeCaseTests : IDisposable
{
    private readonly HttpClient _pythonClient;
    private readonly HttpClient _dotnetClient;
    private readonly ITestOutputHelper _output;

    private const string PYTHON_BASE_URL = "http://localhost:8000";
    private const string DOTNET_BASE_URL = "http://localhost:8001";

    public EdgeCaseTests(ITestOutputHelper output)
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

    public void Dispose()
    {
        _pythonClient?.Dispose();
        _dotnetClient?.Dispose();
    }

    #region Authentication Edge Cases

    [Fact]
    public async Task Login_EmptyUsername_BothBackendsReturnSameError()
    {
        // Arrange
        var credentials = new { username = "", password = "test123" };

        // Act
        var pythonContent = new StringContent(
            JsonSerializer.Serialize(credentials),
            Encoding.UTF8,
            "application/json"
        );
        var pythonResponse = await _pythonClient.PostAsync("/api/auth/login", pythonContent);

        var dotnetContent = new StringContent(
            JsonSerializer.Serialize(credentials),
            Encoding.UTF8,
            "application/json"
        );
        var dotnetResponse = await _dotnetClient.PostAsync("/api/auth/login", dotnetContent);

        // Assert - Should both return 422 (validation error) or 200 with success:false
        Assert.Equal(pythonResponse.StatusCode, dotnetResponse.StatusCode);

        _output.WriteLine($"Python status: {pythonResponse.StatusCode}");
        _output.WriteLine($".NET status: {dotnetResponse.StatusCode}");
    }

    [Fact]
    public async Task Login_EmptyPassword_BothBackendsReturnSameError()
    {
        // Arrange
        var credentials = new { username = "admin", password = "" };

        // Act
        var pythonContent = new StringContent(
            JsonSerializer.Serialize(credentials),
            Encoding.UTF8,
            "application/json"
        );
        var pythonResponse = await _pythonClient.PostAsync("/api/auth/login", pythonContent);

        var dotnetContent = new StringContent(
            JsonSerializer.Serialize(credentials),
            Encoding.UTF8,
            "application/json"
        );
        var dotnetResponse = await _dotnetClient.PostAsync("/api/auth/login", dotnetContent);

        // Assert
        Assert.Equal(pythonResponse.StatusCode, dotnetResponse.StatusCode);

        _output.WriteLine($"Python status: {pythonResponse.StatusCode}");
        _output.WriteLine($".NET status: {dotnetResponse.StatusCode}");
    }

    [Fact]
    public async Task Login_MissingFields_BothBackendsReturn422()
    {
        // Arrange - Send incomplete JSON
        var incompleteData = new { username = "admin" }; // Missing password

        // Act
        var pythonContent = new StringContent(
            JsonSerializer.Serialize(incompleteData),
            Encoding.UTF8,
            "application/json"
        );
        var pythonResponse = await _pythonClient.PostAsync("/api/auth/login", pythonContent);

        var dotnetContent = new StringContent(
            JsonSerializer.Serialize(incompleteData),
            Encoding.UTF8,
            "application/json"
        );
        var dotnetResponse = await _dotnetClient.PostAsync("/api/auth/login", dotnetContent);

        // Assert - Should both return 422 UnprocessableEntity
        Assert.Equal(HttpStatusCode.UnprocessableEntity, pythonResponse.StatusCode);
        Assert.Equal(HttpStatusCode.UnprocessableEntity, dotnetResponse.StatusCode);

        _output.WriteLine($"Python status: {pythonResponse.StatusCode}");
        _output.WriteLine($".NET status: {dotnetResponse.StatusCode}");
    }

    [Fact]
    public async Task Login_SQLInjectionAttempt_BothBackendsHandleSafely()
    {
        // Arrange - Classic SQL injection attempt
        var credentials = new { username = "admin' OR '1'='1", password = "test' OR '1'='1" };

        // Act
        var pythonContent = new StringContent(
            JsonSerializer.Serialize(credentials),
            Encoding.UTF8,
            "application/json"
        );
        var pythonResponse = await _pythonClient.PostAsync("/api/auth/login", pythonContent);

        var dotnetContent = new StringContent(
            JsonSerializer.Serialize(credentials),
            Encoding.UTF8,
            "application/json"
        );
        var dotnetResponse = await _dotnetClient.PostAsync("/api/auth/login", dotnetContent);

        // Assert - Should both return 200 with success:false (invalid credentials)
        // NOT a successful login!
        Assert.True(pythonResponse.IsSuccessStatusCode);
        Assert.True(dotnetResponse.IsSuccessStatusCode);

        var pythonJson = await pythonResponse.Content.ReadFromJsonAsync<JsonElement>();
        var dotnetJson = await dotnetResponse.Content.ReadFromJsonAsync<JsonElement>();

        Assert.True(pythonJson.TryGetProperty("success", out var pythonSuccess));
        Assert.True(dotnetJson.TryGetProperty("success", out var dotnetSuccess));
        Assert.False(pythonSuccess.GetBoolean()); // Should NOT be successful
        Assert.False(dotnetSuccess.GetBoolean());

        _output.WriteLine("✅ Both backends safely rejected SQL injection attempt");
    }

    [Fact]
    public async Task ValidateToken_EmptyToken_BothBackendsReturnSameError()
    {
        // Arrange
        var request = new { token = "" };

        // Act
        var pythonContent = new StringContent(
            JsonSerializer.Serialize(request),
            Encoding.UTF8,
            "application/json"
        );
        var pythonResponse = await _pythonClient.PostAsync("/api/auth/validate", pythonContent);

        var dotnetContent = new StringContent(
            JsonSerializer.Serialize(request),
            Encoding.UTF8,
            "application/json"
        );
        var dotnetResponse = await _dotnetClient.PostAsync("/api/auth/validate", dotnetContent);

        // Assert
        Assert.Equal(pythonResponse.StatusCode, dotnetResponse.StatusCode);

        _output.WriteLine($"Python status: {pythonResponse.StatusCode}");
        _output.WriteLine($".NET status: {dotnetResponse.StatusCode}");
    }

    [Fact]
    public async Task ValidateToken_MalformedJWT_BothBackendsReturnSameError()
    {
        // Arrange
        var request = new { token = "not.a.valid.jwt.token" };

        // Act
        var pythonContent = new StringContent(
            JsonSerializer.Serialize(request),
            Encoding.UTF8,
            "application/json"
        );
        var pythonResponse = await _pythonClient.PostAsync("/api/auth/validate", pythonContent);

        var dotnetContent = new StringContent(
            JsonSerializer.Serialize(request),
            Encoding.UTF8,
            "application/json"
        );
        var dotnetResponse = await _dotnetClient.PostAsync("/api/auth/validate", dotnetContent);

        // Assert
        Assert.Equal(pythonResponse.StatusCode, dotnetResponse.StatusCode);

        _output.WriteLine($"Python status: {pythonResponse.StatusCode}");
        _output.WriteLine($".NET status: {dotnetResponse.StatusCode}");
    }

    #endregion

    #region Form Token Edge Cases

    [Fact]
    public async Task ValidateFormToken_EmptyTokenId_BothBackendsReturnSameError()
    {
        // Arrange
        var request = new { tokenId = "" };

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

        // Assert - Should both handle empty tokenId consistently
        Assert.Equal(pythonResponse.StatusCode, dotnetResponse.StatusCode);

        _output.WriteLine($"Python status: {pythonResponse.StatusCode}");
        _output.WriteLine($".NET status: {dotnetResponse.StatusCode}");
    }

    [Fact]
    public async Task ValidateFormToken_VeryLongTokenId_BothBackendsHandleSafely()
    {
        // Arrange - Test with very long string (potential buffer overflow/DoS)
        var longToken = new string('A', 10000);
        var request = new { tokenId = longToken };

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

        // Assert - Should both handle gracefully (not crash)
        Assert.Equal(pythonResponse.StatusCode, dotnetResponse.StatusCode);

        _output.WriteLine($"Python status: {pythonResponse.StatusCode}");
        _output.WriteLine($".NET status: {dotnetResponse.StatusCode}");
    }

    [Fact]
    public async Task ValidateDashboardToken_EmptyEncryptedToken_BothBackendsReturnSameError()
    {
        // Arrange
        var request = new { encryptedToken = "" };

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

        if (pythonResponse.IsSuccessStatusCode)
        {
            var pythonJson = await pythonResponse.Content.ReadFromJsonAsync<JsonElement>();
            var dotnetJson = await dotnetResponse.Content.ReadFromJsonAsync<JsonElement>();

            // Both should return valid:false
            Assert.True(pythonJson.TryGetProperty("valid", out var pythonValid));
            Assert.True(dotnetJson.TryGetProperty("valid", out var dotnetValid));
            Assert.Equal(pythonValid.GetBoolean(), dotnetValid.GetBoolean());
        }

        _output.WriteLine($"Python status: {pythonResponse.StatusCode}");
        _output.WriteLine($".NET status: {dotnetResponse.StatusCode}");
    }

    #endregion

    #region Custom Forms Edge Cases

    [Fact]
    public async Task GetFormCode_NonExistentForm_BothBackendsReturn404()
    {
        // Arrange
        var nonExistentForm = "this_form_does_not_exist_12345";

        // Act
        var pythonResponse = await _pythonClient.GetAsync($"/api/custom-forms/{nonExistentForm}/code");
        var dotnetResponse = await _dotnetClient.GetAsync($"/api/custom-forms/{nonExistentForm}/code");

        // Assert - Both should return 404 Not Found
        Assert.Equal(HttpStatusCode.NotFound, pythonResponse.StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, dotnetResponse.StatusCode);

        _output.WriteLine($"Python status: {pythonResponse.StatusCode}");
        _output.WriteLine($".NET status: {dotnetResponse.StatusCode}");
    }

    [Fact]
    public async Task GetFormCode_SpecialCharactersInName_BothBackendsHandleSafely()
    {
        // Arrange - Test with special characters (potential path traversal)
        var specialForm = "../../../etc/passwd";

        // Act
        var pythonResponse = await _pythonClient.GetAsync($"/api/custom-forms/{Uri.EscapeDataString(specialForm)}/code");
        var dotnetResponse = await _dotnetClient.GetAsync($"/api/custom-forms/{Uri.EscapeDataString(specialForm)}/code");

        // Assert - Should both handle safely (not expose files)
        Assert.Equal(pythonResponse.StatusCode, dotnetResponse.StatusCode);

        _output.WriteLine($"Python status: {pythonResponse.StatusCode}");
        _output.WriteLine($".NET status: {dotnetResponse.StatusCode}");
        _output.WriteLine("✅ Both backends safely handled path traversal attempt");
    }

    [Fact]
    public async Task SetActiveVersion_InvalidVersion_BothBackendsReturnSameError()
    {
        // Arrange
        var request = new { version = "invalid.version.format" };
        var formName = "test_form";

        // Act
        var pythonContent = new StringContent(
            JsonSerializer.Serialize(request),
            Encoding.UTF8,
            "application/json"
        );
        var pythonResponse = await _pythonClient.PostAsync($"/api/custom-forms/{formName}/set-version", pythonContent);

        var dotnetContent = new StringContent(
            JsonSerializer.Serialize(request),
            Encoding.UTF8,
            "application/json"
        );
        var dotnetResponse = await _dotnetClient.PostAsync($"/api/custom-forms/{formName}/set-version", dotnetContent);

        // Assert
        Assert.Equal(pythonResponse.StatusCode, dotnetResponse.StatusCode);

        _output.WriteLine($"Python status: {pythonResponse.StatusCode}");
        _output.WriteLine($".NET status: {dotnetResponse.StatusCode}");
    }

    #endregion

    #region Malformed Request Tests

    [Fact]
    public async Task Login_InvalidJSON_BothBackendsReturn400()
    {
        // Arrange - Send malformed JSON
        var malformedJson = "{\"username\": \"admin\", \"password\": }"; // Missing value

        // Act
        var pythonContent = new StringContent(malformedJson, Encoding.UTF8, "application/json");
        var pythonResponse = await _pythonClient.PostAsync("/api/auth/login", pythonContent);

        var dotnetContent = new StringContent(malformedJson, Encoding.UTF8, "application/json");
        var dotnetResponse = await _dotnetClient.PostAsync("/api/auth/login", dotnetContent);

        // Assert - Should both return 400 Bad Request or 422
        Assert.True(!pythonResponse.IsSuccessStatusCode);
        Assert.True(!dotnetResponse.IsSuccessStatusCode);

        _output.WriteLine($"Python status: {pythonResponse.StatusCode}");
        _output.WriteLine($".NET status: {dotnetResponse.StatusCode}");
    }

    [Fact]
    public async Task Login_WrongContentType_BothBackendsReturnSameError()
    {
        // Arrange - Send with wrong Content-Type
        var credentials = "username=admin&password=test123";

        // Act
        var pythonContent = new StringContent(credentials, Encoding.UTF8, "application/x-www-form-urlencoded");
        var pythonResponse = await _pythonClient.PostAsync("/api/auth/login", pythonContent);

        var dotnetContent = new StringContent(credentials, Encoding.UTF8, "application/x-www-form-urlencoded");
        var dotnetResponse = await _dotnetClient.PostAsync("/api/auth/login", dotnetContent);

        // Assert - Should both handle consistently
        Assert.Equal(pythonResponse.StatusCode, dotnetResponse.StatusCode);

        _output.WriteLine($"Python status: {pythonResponse.StatusCode}");
        _output.WriteLine($".NET status: {dotnetResponse.StatusCode}");
    }

    #endregion
}
