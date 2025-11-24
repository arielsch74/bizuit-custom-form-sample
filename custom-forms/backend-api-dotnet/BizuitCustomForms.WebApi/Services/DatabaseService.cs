using System.Data;
using Microsoft.Data.SqlClient;
using Dapper;

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
}

public interface IDatabaseService
{
    Task<(bool Success, string? Message)> TestDashboardConnectionAsync();
    Task<(bool Success, string? Message)> TestPersistenceConnectionAsync();
    Task<(bool HasAccess, List<string> UserRoles)> ValidateAdminRolesAsync(string username, string allowedRoles);
    Task<UserInfo?> GetUserInfoAsync(string username);
}

public record UserInfo(
    int UserId,
    string UserName,
    string Email,
    string DisplayName,
    string FirstName,
    string LastName
);
