using System.Data;
using Microsoft.Data.SqlClient;
using Dapper;
using BizuitCustomForms.WebApi.Models;

namespace BizuitCustomForms.WebApi.Services;

/// <summary>
/// Database service for accessing CustomForms and Persistence databases
/// </summary>
public class DatabaseService : IDatabaseService
{
    private readonly string _dashboardConnectionString;
    private readonly string _persistenceConnectionString;
    private readonly ILogger<DatabaseService> _logger;

    public DatabaseService(IConfiguration configuration, ILogger<DatabaseService> logger)
    {
        _dashboardConnectionString = configuration.GetConnectionString("DashboardDb")
            ?? throw new InvalidOperationException("DashboardDb connection string is required");

        _persistenceConnectionString = configuration.GetConnectionString("PersistenceDb")
            ?? throw new InvalidOperationException("PersistenceDb connection string is required");

        _logger = logger;
    }

    /// <summary>
    /// Test Dashboard database connection
    /// </summary>
    public async Task<(bool Success, string? Message)> TestDashboardConnectionAsync()
    {
        try
        {
            using var connection = new SqlConnection(_dashboardConnectionString);
            await connection.OpenAsync();

            // Simple query to test connection
            var result = await connection.QuerySingleAsync<int>("SELECT 1");

            _logger.LogInformation("[Database] Dashboard DB connection successful");
            return (true, "Connected to Dashboard DB");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[Database] Dashboard DB connection failed");
            return (false, $"Connection failed: {ex.Message}");
        }
    }

    /// <summary>
    /// Test Persistence database connection
    /// </summary>
    public async Task<(bool Success, string? Message)> TestPersistenceConnectionAsync()
    {
        try
        {
            using var connection = new SqlConnection(_persistenceConnectionString);
            await connection.OpenAsync();

            // Simple query to test connection
            var result = await connection.QuerySingleAsync<int>("SELECT 1");

            _logger.LogInformation("[Database] Persistence DB connection successful");
            return (true, "Connected to Persistence DB");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[Database] Persistence DB connection failed");
            return (false, $"Connection failed: {ex.Message}");
        }
    }

    /// <summary>
    /// Validate admin user roles from Dashboard database
    /// </summary>
    public async Task<(bool HasAccess, List<string> UserRoles)> ValidateAdminRolesAsync(
        string username,
        string allowedRoles)
    {
        try
        {
            using var connection = new SqlConnection(_dashboardConnectionString);

            // Query to get user roles
            const string query = @"
                SELECT DISTINCT r.Name
                FROM [dbo].[Users] u
                INNER JOIN [dbo].[UserRoles] ur ON u.UserID = ur.UserID
                INNER JOIN [dbo].[Roles] r ON ur.RoleID = r.RoleID
                WHERE u.UserName = @Username";

            var roles = (await connection.QueryAsync<string>(query, new { Username = username }))
                .ToList();

            // Parse allowed roles
            var allowedRolesList = allowedRoles.Split(',', StringSplitOptions.TrimEntries | StringSplitOptions.RemoveEmptyEntries);

            // Check if user has any of the allowed roles
            bool hasAccess = roles.Any(role => allowedRolesList.Contains(role, StringComparer.OrdinalIgnoreCase));

            _logger.LogInformation(
                "[Database] User '{Username}' has roles: [{Roles}]. Access granted: {HasAccess}",
                username, string.Join(", ", roles), hasAccess);

            return (hasAccess, roles);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[Database] Error validating admin roles for '{Username}'", username);
            return (false, new List<string>());
        }
    }

    /// <summary>
    /// Get user information from Dashboard database
    /// </summary>
    public async Task<UserInfo?> GetUserInfoAsync(string username)
    {
        try
        {
            using var connection = new SqlConnection(_dashboardConnectionString);

            const string query = @"
                SELECT
                    UserID as UserId,
                    UserName,
                    Email,
                    DisplayName,
                    FirstName,
                    LastName
                FROM [dbo].[Users]
                WHERE UserName = @Username";

            var userInfo = await connection.QuerySingleOrDefaultAsync<UserInfo>(query, new { Username = username });

            if (userInfo != null)
            {
                _logger.LogInformation("[Database] User info retrieved for '{Username}'", username);
            }

            return userInfo;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[Database] Error getting user info for '{Username}'", username);
            return null;
        }
    }

    // ==============================================================================
    // Security Tokens (Form Tokens)
    // ==============================================================================

    /// <summary>
    /// Validate security token from BIZUITPersistenceStore.SecurityTokens
    /// </summary>
    public async Task<SecurityToken?> ValidateSecurityTokenAsync(string tokenId)
    {
        try
        {
            // SECURITY: Validate token_id format to prevent SQL injection
            if (!IsValidTokenId(tokenId))
            {
                _logger.LogWarning("[Database] Invalid token_id format: {TokenId}", SanitizeForLogging(tokenId));
                throw new ArgumentException($"Invalid token_id format: {SanitizeForLogging(tokenId)}");
            }

            using var connection = new SqlConnection(_persistenceConnectionString);
            await connection.OpenAsync();

            var query = @"
                SELECT
                    TokenId,
                    UserName,
                    Operation,
                    EventName,
                    RequesterAddress,
                    ExpirationDate,
                    InstanceId
                FROM [dbo].[SecurityTokens]
                WHERE TokenId = @TokenId";

            var result = await connection.QuerySingleOrDefaultAsync<dynamic>(query, new { TokenId = tokenId });

            if (result == null)
            {
                _logger.LogInformation("[Database] Token '{TokenId}' not found", tokenId);
                return null;
            }

            // Check if token is expired
            var expirationDate = (DateTime)result.ExpirationDate;
            var isValid = expirationDate > DateTime.Now;

            if (!isValid)
            {
                _logger.LogWarning("[Database] Token '{TokenId}' expired at {ExpirationDate}", tokenId, expirationDate);
            }

            return new SecurityToken(
                TokenId: result.TokenId,
                UserName: result.UserName,
                Operation: result.Operation,
                EventName: result.EventName,
                RequesterAddress: result.RequesterAddress,
                ExpirationDate: expirationDate,
                InstanceId: result.InstanceId,
                IsValid: isValid
            );
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[Database] Error validating token '{TokenId}'", tokenId);
            throw;
        }
    }

    /// <summary>
    /// Delete security token (when form closes)
    /// </summary>
    public async Task<bool> DeleteSecurityTokenAsync(string tokenId)
    {
        try
        {
            // SECURITY: Validate token_id format to prevent SQL injection
            if (!IsValidTokenId(tokenId))
            {
                _logger.LogWarning("[Database] Invalid token_id format: {TokenId}", SanitizeForLogging(tokenId));
                throw new ArgumentException($"Invalid token_id format: {SanitizeForLogging(tokenId)}");
            }

            using var connection = new SqlConnection(_persistenceConnectionString);
            await connection.OpenAsync();

            var query = "DELETE FROM [dbo].[SecurityTokens] WHERE TokenId = @TokenId";
            var rowsAffected = await connection.ExecuteAsync(query, new { TokenId = tokenId });

            if (rowsAffected > 0)
            {
                _logger.LogInformation("[Database] Token '{TokenId}' deleted successfully", tokenId);
                return true;
            }

            _logger.LogWarning("[Database] Token '{TokenId}' not found for deletion", tokenId);
            return false;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[Database] Error deleting token '{TokenId}'", tokenId);
            throw;
        }
    }

    // ==============================================================================
    // Security Helpers
    // ==============================================================================

    /// <summary>
    /// Validate token ID format (must be numeric string)
    /// Prevents SQL injection attacks
    /// </summary>
    private bool IsValidTokenId(string tokenId)
    {
        // Token ID must be numeric (e.g., "141191")
        return !string.IsNullOrWhiteSpace(tokenId) &&
               tokenId.Length <= 20 &&
               tokenId.All(char.IsDigit);
    }

    /// <summary>
    /// Sanitize string for safe logging (show only first 3 chars)
    /// </summary>
    private string SanitizeForLogging(string value)
    {
        if (string.IsNullOrEmpty(value)) return "***";
        return value.Length > 3 ? $"{value[..3]}***" : "***";
    }
}

public interface IDatabaseService
{
    Task<(bool Success, string? Message)> TestDashboardConnectionAsync();
    Task<(bool Success, string? Message)> TestPersistenceConnectionAsync();
    Task<(bool HasAccess, List<string> UserRoles)> ValidateAdminRolesAsync(string username, string allowedRoles);
    Task<UserInfo?> GetUserInfoAsync(string username);

    // Security Tokens
    Task<SecurityToken?> ValidateSecurityTokenAsync(string tokenId);
    Task<bool> DeleteSecurityTokenAsync(string tokenId);
}

public record UserInfo(
    int UserId,
    string UserName,
    string Email,
    string DisplayName,
    string FirstName,
    string LastName
);
