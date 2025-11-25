using BizuitCustomForms.WebApi.Models;
using BizuitCustomForms.WebApi.Services;
using Microsoft.AspNetCore.Mvc;

namespace BizuitCustomForms.WebApi.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthenticationController : ControllerBase
{
    private readonly IAuthenticationService _authService;
    private readonly IDatabaseService _databaseService;
    private readonly IConfiguration _configuration;
    private readonly ILogger<AuthenticationController> _logger;

    public AuthenticationController(
        IAuthenticationService authService,
        IDatabaseService databaseService,
        IConfiguration configuration,
        ILogger<AuthenticationController> logger)
    {
        _authService = authService;
        _databaseService = databaseService;
        _configuration = configuration;
        _logger = logger;
    }

    /// <summary>
    /// Administrator login
    /// Authenticates user against BIZUIT Dashboard API and validates admin roles.
    /// </summary>
    [HttpPost("login")]
    public async Task<ActionResult<AdminLoginResponse>> Login([FromBody] AdminLoginRequest request)
    {
        try
        {
            // Sanitize username in logs (only show first 3 chars)
            var sanitizedUsername = request.Username.Length > 3
                ? $"{request.Username[..3]}***"
                : "***";

            _logger.LogInformation("[Auth API] Login attempt for user '{SanitizedUsername}'", sanitizedUsername);

            // 1. Login to Bizuit API
            var (success, bizuitToken, error) = await _authService.LoginToBizuitAsync(
                request.Username, request.Password);

            if (!success)
            {
                _logger.LogWarning("[Auth API] Bizuit login failed: {Error}", error);
                return Ok(new AdminLoginResponse(false, null, null, error));
            }

            // 2. Validate admin roles
            var allowedRoles = _configuration["BizuitSettings:AdminAllowedRoles"] ?? "Administrators";
            var (hasAccess, userRoles) = await _databaseService.ValidateAdminRolesAsync(
                request.Username, allowedRoles);

            if (!hasAccess)
            {
                _logger.LogWarning("[Auth API] User '{SanitizedUsername}' lacks admin permissions", sanitizedUsername);
                return Ok(new AdminLoginResponse(
                    false, null, null, "Access denied. User does not have administrator privileges."));
            }

            // 3. Get user info
            var userInfo = await _databaseService.GetUserInfoAsync(request.Username);
            if (userInfo == null)
            {
                return Ok(new AdminLoginResponse(false, null, null, "User info not found"));
            }

            // 4. Generate session token (with tenant_id for multi-tenant isolation)
            var sessionToken = _authService.GenerateSessionToken(
                request.Username,
                bizuitToken,
                userInfo,
                request.TenantId  // SECURITY: Include tenant in JWT
            );

            // 5. Return success response
            var userData = new UserData(
                Username: request.Username,
                Roles: userRoles,
                UserId: userInfo.UserId,
                UserName: userInfo.UserName,
                Email: userInfo.Email,
                DisplayName: userInfo.DisplayName,
                FirstName: userInfo.FirstName,
                LastName: userInfo.LastName
            );

            _logger.LogInformation("[Auth API] Login successful for '{SanitizedUsername}' in tenant '{TenantId}'",
                sanitizedUsername, request.TenantId);

            return Ok(new AdminLoginResponse(true, sessionToken, userData, null));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[Auth API] Login error");
            return StatusCode(500, new AdminLoginResponse(false, null, null, "Internal server error"));
        }
    }

    /// <summary>
    /// Validate JWT session token
    /// </summary>
    [HttpPost("validate")]
    public IActionResult ValidateToken([FromBody] ValidateSessionRequest request)
    {
        try
        {
            var (valid, payload) = _authService.VerifySessionToken(request.Token, request.TenantId);

            if (valid && payload != null)
            {
                return Ok(new ValidateSessionResponse(true, null, null));
            }

            return Ok(new ValidateSessionResponse(false, null, "Invalid or expired token"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[Auth API] Token validation error");
            return Ok(new ValidateSessionResponse(false, null, "Validation error"));
        }
    }

    /// <summary>
    /// Refresh JWT session token
    /// </summary>
    [HttpPost("refresh")]
    public IActionResult RefreshToken([FromBody] ValidateSessionRequest request)
    {
        try
        {
            var (valid, payload) = _authService.VerifySessionToken(request.Token, request.TenantId);

            if (!valid || payload == null)
            {
                return Ok(new { success = false, token = (string?)null, error = "Invalid token" });
            }

            // Extract user info from token and regenerate
            var username = payload["username"].ToString() ?? "";
            var bizuitToken = payload["bizuit_token"].ToString() ?? "";
            var tenantId = payload.GetValueOrDefault("tenant_id", "default").ToString() ?? "default";

            // Parse user_info from JSON string in payload
            var userInfoJson = payload["user_info"].ToString() ?? "{}";
            var userInfo = System.Text.Json.JsonSerializer.Deserialize<UserInfo>(userInfoJson);

            if (userInfo == null)
            {
                return Ok(new { success = false, token = (string?)null, error = "Invalid user info" });
            }

            // Generate new token
            var newToken = _authService.GenerateSessionToken(username, bizuitToken, userInfo, tenantId);

            _logger.LogInformation("[Auth API] Token refreshed for user '{Username}' in tenant '{TenantId}'",
                username, tenantId);

            return Ok(new { success = true, token = newToken, error = (string?)null });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[Auth API] Token refresh error");
            return Ok(new { success = false, token = (string?)null, error = "Refresh error" });
        }
    }
}
