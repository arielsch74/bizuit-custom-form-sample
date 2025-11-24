using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Text.Json;
using Microsoft.IdentityModel.Tokens;

namespace BizuitCustomForms.WebApi.Services;

/// <summary>
/// Authentication service for admin login and JWT token management
/// </summary>
public class AuthenticationService : IAuthenticationService
{
    private readonly IConfiguration _configuration;
    private readonly IDatabaseService _databaseService;
    private readonly ILogger<AuthenticationService> _logger;
    private readonly HttpClient _httpClient;
    private readonly string _jwtSecretKey;
    private readonly int _sessionTimeoutMinutes;

    public AuthenticationService(
        IConfiguration configuration,
        IDatabaseService databaseService,
        ILogger<AuthenticationService> logger,
        IHttpClientFactory httpClientFactory)
    {
        _configuration = configuration;
        _databaseService = databaseService;
        _logger = logger;
        _httpClient = httpClientFactory.CreateClient();

        _jwtSecretKey = configuration["BizuitSettings:JwtSecretKey"]
            ?? throw new InvalidOperationException("JwtSecretKey is required");

        _sessionTimeoutMinutes = int.Parse(
            configuration["BizuitSettings:SessionTimeoutMinutes"] ?? "30");
    }

    /// <summary>
    /// Login to Bizuit Dashboard API
    /// </summary>
    public async Task<(bool Success, string? Token, string? Error)> LoginToBizuitAsync(
        string username, string password)
    {
        try
        {
            var dashboardApiUrl = _configuration["BizuitSettings:DashboardApiUrl"]
                ?? throw new InvalidOperationException("DashboardApiUrl is required");

            // Create Basic Auth header
            var authString = $"{username}:{password}";
            var authBytes = Encoding.UTF8.GetBytes(authString);
            var base64Auth = Convert.ToBase64String(authBytes);

            // Call Bizuit Login API (uses GET with Basic Auth header)
            _httpClient.DefaultRequestHeaders.Clear();
            _httpClient.DefaultRequestHeaders.Add("Authorization", $"Basic {base64Auth}");
            _httpClient.Timeout = TimeSpan.FromSeconds(30);

            var response = await _httpClient.GetAsync($"{dashboardApiUrl}/Login");

            if (response.IsSuccessStatusCode)
            {
                var content = await response.Content.ReadAsStringAsync();
                var data = JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(content);

                // Bizuit API returns { "token": "..." } or { "Token": "..." }
                string? bizuitToken = null;
                if (data?.TryGetValue("token", out var tokenLower) == true)
                    bizuitToken = tokenLower.GetString();
                else if (data?.TryGetValue("Token", out var tokenUpper) == true)
                    bizuitToken = tokenUpper.GetString();

                if (!string.IsNullOrEmpty(bizuitToken))
                {
                    _logger.LogInformation("[Auth Service] Login successful for user '{Username}'", username);
                    return (true, bizuitToken, null);
                }

                _logger.LogWarning("[Auth Service] Login response missing token");
                return (false, null, "Invalid response from authentication server");
            }

            _logger.LogWarning("[Auth Service] Login failed with status {StatusCode}", response.StatusCode);
            return (false, null, "Invalid credentials");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[Auth Service] Login error");
            return (false, null, $"Login error: {ex.Message}");
        }
    }

    /// <summary>
    /// Generate JWT session token for admin
    /// </summary>
    public string GenerateSessionToken(
        string username,
        string bizuitToken,
        UserInfo userInfo,
        string tenantId = "default")
    {
        try
        {
            var expiration = DateTime.UtcNow.AddMinutes(_sessionTimeoutMinutes);

            // Create claims matching Python implementation
            var claims = new List<Claim>
            {
                new Claim("username", username),
                new Claim("bizuit_token", bizuitToken),
                new Claim("tenant_id", tenantId),  // SECURITY: Tenant isolation
                new Claim("type", "admin_session"),
                new Claim("user_info", JsonSerializer.Serialize(new {
                    userId = userInfo.UserId,
                    userName = userInfo.UserName,
                    email = userInfo.Email,
                    displayName = userInfo.DisplayName,
                    firstName = userInfo.FirstName,
                    lastName = userInfo.LastName
                }))
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtSecretKey));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                claims: claims,
                expires: expiration,
                signingCredentials: creds
            );

            var tokenString = new JwtSecurityTokenHandler().WriteToken(token);

            _logger.LogInformation(
                "[Auth Service] Generated session token for '{Username}' in tenant '{TenantId}' (expires: {Expiration})",
                username, tenantId, expiration);

            return tokenString;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[Auth Service] Error generating token");
            throw;
        }
    }

    /// <summary>
    /// Verify JWT session token
    /// </summary>
    public (bool Valid, Dictionary<string, object>? Payload) VerifySessionToken(
        string token,
        string expectedTenantId = "default")
    {
        try
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.UTF8.GetBytes(_jwtSecretKey);

            var validationParameters = new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(key),
                ValidateIssuer = false,
                ValidateAudience = false,
                ClockSkew = TimeSpan.Zero
            };

            var principal = tokenHandler.ValidateToken(token, validationParameters, out var validatedToken);

            // Extract claims
            var claims = principal.Claims.ToDictionary(c => c.Type, c => c.Value);

            // Verify token type
            if (!claims.TryGetValue("type", out var tokenType) || tokenType != "admin_session")
            {
                _logger.LogWarning("[Auth Service] Invalid token type");
                return (false, null);
            }

            // SECURITY: Verify tenant_id matches
            var tokenTenantId = claims.GetValueOrDefault("tenant_id", "default");
            if (tokenTenantId != expectedTenantId)
            {
                _logger.LogWarning(
                    "[Auth Service] Tenant mismatch: token has '{TokenTenant}' but expected '{ExpectedTenant}'",
                    tokenTenantId, expectedTenantId);
                return (false, null);
            }

            _logger.LogInformation(
                "[Auth Service] Token verified for user '{Username}' in tenant '{TenantId}'",
                claims.GetValueOrDefault("username"), tokenTenantId);

            return (true, claims.ToDictionary(kvp => kvp.Key, kvp => (object)kvp.Value));
        }
        catch (SecurityTokenExpiredException)
        {
            _logger.LogWarning("[Auth Service] Token expired");
            return (false, null);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[Auth Service] Token verification error");
            return (false, null);
        }
    }
}

public interface IAuthenticationService
{
    Task<(bool Success, string? Token, string? Error)> LoginToBizuitAsync(string username, string password);
    string GenerateSessionToken(string username, string bizuitToken, UserInfo userInfo, string tenantId = "default");
    (bool Valid, Dictionary<string, object>? Payload) VerifySessionToken(string token, string expectedTenantId = "default");
}
