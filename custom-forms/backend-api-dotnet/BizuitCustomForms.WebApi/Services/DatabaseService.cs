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

    /// <summary>
    /// Validate form name format (alphanumeric, dash, underscore)
    /// </summary>
    private bool IsValidFormName(string formName)
    {
        return !string.IsNullOrWhiteSpace(formName) &&
               formName.Length <= 100 &&
               formName.All(c => char.IsLetterOrDigit(c) || c == '-' || c == '_');
    }

    /// <summary>
    /// Validate version format (semantic versioning: 1.0.0)
    /// </summary>
    private bool IsValidVersion(string version)
    {
        return !string.IsNullOrWhiteSpace(version) &&
               version.Length <= 20 &&
               System.Text.RegularExpressions.Regex.IsMatch(version, @"^\d+\.\d+\.\d+(-[\w.]+)?$");
    }

    // ==============================================================================
    // Custom Forms Management
    // ==============================================================================

    /// <summary>
    /// Get all custom forms with their current version
    /// </summary>
    public async Task<List<CustomFormInfo>> GetAllCustomFormsAsync()
    {
        try
        {
            using var connection = new SqlConnection(_dashboardConnectionString);
            await connection.OpenAsync();

            var query = @"
                SELECT
                    cf.FormId,
                    cf.FormName,
                    cf.ProcessName,
                    cf.Status,
                    cf.CurrentVersion,
                    cf.Description,
                    cf.Author,
                    cfv.SizeBytes,
                    cf.CreatedAt,
                    cf.UpdatedAt
                FROM CustomForms cf
                LEFT JOIN CustomFormVersions cfv ON cf.FormId = cfv.FormId AND cfv.IsCurrent = 1
                WHERE cf.Status = 'active'
                ORDER BY cf.FormName";

            var results = await connection.QueryAsync<dynamic>(query);

            var forms = results.Select(row => new CustomFormInfo(
                Id: row.FormId,
                FormName: row.FormName,
                ProcessName: row.ProcessName,
                Status: row.Status,
                CurrentVersion: row.CurrentVersion,
                Description: row.Description,
                Author: row.Author,
                SizeBytes: row.SizeBytes,
                PublishedAt: row.CreatedAt != null ? ((DateTime)row.CreatedAt).ToString("o") : null,
                UpdatedAt: row.UpdatedAt != null ? ((DateTime)row.UpdatedAt).ToString("o") : null
            )).ToList();

            _logger.LogInformation("[Database] Retrieved {Count} custom forms", forms.Count);
            return forms;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[Database] Error retrieving custom forms");
            throw;
        }
    }

    /// <summary>
    /// Get compiled code for a specific form
    /// </summary>
    public async Task<FormCodeResponse?> GetFormCompiledCodeAsync(string formName, string? version = null)
    {
        try
        {
            // SECURITY: Validate inputs
            if (!IsValidFormName(formName))
            {
                throw new ArgumentException($"Invalid form name format: {SanitizeForLogging(formName)}");
            }

            if (version != null && !IsValidVersion(version))
            {
                throw new ArgumentException($"Invalid version format: {SanitizeForLogging(version)}");
            }

            using var connection = new SqlConnection(_dashboardConnectionString);
            await connection.OpenAsync();

            string query;
            object parameters;

            if (version != null)
            {
                // Get specific version
                query = @"
                    SELECT
                        cfv.CompiledCode,
                        cfv.Version,
                        cfv.PublishedAt,
                        cfv.SizeBytes
                    FROM CustomFormVersions cfv
                    INNER JOIN CustomForms cf ON cfv.FormId = cf.FormId
                    WHERE cf.FormName = @FormName AND cfv.Version = @Version";
                parameters = new { FormName = formName, Version = version };
            }
            else
            {
                // Get current version
                query = @"
                    SELECT
                        cfv.CompiledCode,
                        cfv.Version,
                        cfv.PublishedAt,
                        cfv.SizeBytes
                    FROM CustomFormVersions cfv
                    INNER JOIN CustomForms cf ON cfv.FormId = cf.FormId
                    WHERE cf.FormName = @FormName AND cfv.IsCurrent = 1";
                parameters = new { FormName = formName };
            }

            var result = await connection.QuerySingleOrDefaultAsync<dynamic>(query, parameters);

            if (result == null)
            {
                _logger.LogWarning("[Database] Form '{FormName}' version '{Version}' not found",
                    formName, version ?? "current");
                return null;
            }

            return new FormCodeResponse(
                CompiledCode: result.CompiledCode,
                Version: result.Version,
                PublishedAt: ((DateTime)result.PublishedAt).ToString("o"),
                SizeBytes: result.SizeBytes
            );
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[Database] Error getting form code for '{FormName}'", formName);
            throw;
        }
    }

    /// <summary>
    /// Get all versions for a specific form
    /// </summary>
    public async Task<List<FormVersion>> GetFormVersionsAsync(string formName)
    {
        try
        {
            if (!IsValidFormName(formName))
            {
                throw new ArgumentException($"Invalid form name format: {SanitizeForLogging(formName)}");
            }

            using var connection = new SqlConnection(_dashboardConnectionString);
            await connection.OpenAsync();

            var query = @"
                SELECT
                    cfv.Version,
                    cfv.SizeBytes,
                    cfv.PublishedAt,
                    cfv.IsCurrent
                FROM CustomFormVersions cfv
                INNER JOIN CustomForms cf ON cfv.FormId = cf.FormId
                WHERE cf.FormName = @FormName
                ORDER BY cfv.PublishedAt DESC";

            var results = await connection.QueryAsync<dynamic>(query, new { FormName = formName });

            var versions = results.Select(row => new FormVersion(
                Version: row.Version,
                SizeBytes: row.SizeBytes,
                PublishedAt: ((DateTime)row.PublishedAt).ToString("o"),
                IsCurrent: row.IsCurrent,
                GitCommit: null,  // TODO: Add GitCommit column to CustomFormVersions table
                GitBranch: null   // TODO: Add GitBranch column to CustomFormVersions table
            )).ToList();

            _logger.LogInformation("[Database] Retrieved {Count} versions for form '{FormName}'",
                versions.Count, formName);

            return versions;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[Database] Error getting versions for form '{FormName}'", formName);
            throw;
        }
    }

    /// <summary>
    /// Set a specific version as current/active
    /// </summary>
    public async Task<bool> SetCurrentFormVersionAsync(string formName, string version)
    {
        try
        {
            if (!IsValidFormName(formName))
            {
                throw new ArgumentException($"Invalid form name format: {SanitizeForLogging(formName)}");
            }

            if (!IsValidVersion(version))
            {
                throw new ArgumentException($"Invalid version format: {SanitizeForLogging(version)}");
            }

            using var connection = new SqlConnection(_dashboardConnectionString);
            await connection.OpenAsync();

            using var transaction = connection.BeginTransaction();

            try
            {
                // 1. Get FormId
                var formId = await connection.QuerySingleOrDefaultAsync<int?>(
                    "SELECT FormId FROM CustomForms WHERE FormName = @FormName",
                    new { FormName = formName },
                    transaction);

                if (formId == null)
                {
                    throw new ArgumentException($"Form '{formName}' not found");
                }

                // 2. Verify version exists
                var versionExists = await connection.QuerySingleOrDefaultAsync<int?>(
                    "SELECT 1 FROM CustomFormVersions WHERE FormId = @FormId AND Version = @Version",
                    new { FormId = formId, Version = version },
                    transaction);

                if (versionExists == null)
                {
                    throw new ArgumentException($"Version '{version}' not found for form '{formName}'");
                }

                // 3. Unset all IsCurrent flags
                await connection.ExecuteAsync(
                    "UPDATE CustomFormVersions SET IsCurrent = 0 WHERE FormId = @FormId",
                    new { FormId = formId },
                    transaction);

                // 4. Set new current version
                await connection.ExecuteAsync(
                    "UPDATE CustomFormVersions SET IsCurrent = 1 WHERE FormId = @FormId AND Version = @Version",
                    new { FormId = formId, Version = version },
                    transaction);

                // 5. Update CustomForms.CurrentVersion
                await connection.ExecuteAsync(
                    "UPDATE CustomForms SET CurrentVersion = @Version, UpdatedAt = GETDATE() WHERE FormId = @FormId",
                    new { FormId = formId, Version = version },
                    transaction);

                transaction.Commit();

                _logger.LogInformation("[Database] Set form '{FormName}' to version '{Version}'",
                    formName, version);

                return true;
            }
            catch
            {
                transaction.Rollback();
                throw;
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[Database] Error setting version for form '{FormName}'", formName);
            throw;
        }
    }

    /// <summary>
    /// Delete a form and all its versions
    /// </summary>
    public async Task<(bool Success, string Message, int VersionsDeleted)> DeleteFormAsync(string formName)
    {
        try
        {
            if (!IsValidFormName(formName))
            {
                throw new ArgumentException($"Invalid form name format: {SanitizeForLogging(formName)}");
            }

            using var connection = new SqlConnection(_dashboardConnectionString);
            await connection.OpenAsync();

            using var transaction = connection.BeginTransaction();

            try
            {
                // 1. Get FormId and verify form exists
                var formId = await connection.QuerySingleOrDefaultAsync<int?>(
                    "SELECT FormId FROM CustomForms WHERE FormName = @FormName",
                    new { FormName = formName },
                    transaction);

                if (formId == null)
                {
                    throw new ArgumentException($"Form '{formName}' not found");
                }

                // 2. Count versions that will be deleted
                var versionsCount = await connection.QuerySingleAsync<int>(
                    "SELECT COUNT(*) FROM CustomFormVersions WHERE FormId = @FormId",
                    new { FormId = formId },
                    transaction);

                // 3. Delete all versions
                await connection.ExecuteAsync(
                    "DELETE FROM CustomFormVersions WHERE FormId = @FormId",
                    new { FormId = formId },
                    transaction);

                // 4. Delete form
                await connection.ExecuteAsync(
                    "DELETE FROM CustomForms WHERE FormId = @FormId",
                    new { FormId = formId },
                    transaction);

                transaction.Commit();

                _logger.LogInformation("[Database] Deleted form '{FormName}' and {Count} version(s)",
                    formName, versionsCount);

                return (true, $"Form '{formName}' deleted successfully", versionsCount);
            }
            catch
            {
                transaction.Rollback();
                throw;
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[Database] Error deleting form '{FormName}'", formName);
            throw;
        }
    }

    /// <summary>
    /// Delete a specific version of a form
    /// Cannot delete the current/active version
    /// </summary>
    public async Task<(bool Success, string Message)> DeleteFormVersionAsync(string formName, string version)
    {
        try
        {
            if (!IsValidFormName(formName))
            {
                throw new ArgumentException($"Invalid form name format: {SanitizeForLogging(formName)}");
            }

            if (!IsValidVersion(version))
            {
                throw new ArgumentException($"Invalid version format: {SanitizeForLogging(version)}");
            }

            using var connection = new SqlConnection(_dashboardConnectionString);
            await connection.OpenAsync();

            using var transaction = connection.BeginTransaction();

            try
            {
                // 1. Get FormId
                var formId = await connection.QuerySingleOrDefaultAsync<int?>(
                    "SELECT FormId FROM CustomForms WHERE FormName = @FormName",
                    new { FormName = formName },
                    transaction);

                if (formId == null)
                {
                    throw new ArgumentException($"Form '{formName}' not found");
                }

                // 2. Check if version exists and is current
                var versionInfo = await connection.QuerySingleOrDefaultAsync<dynamic>(
                    "SELECT IsCurrent FROM CustomFormVersions WHERE FormId = @FormId AND Version = @Version",
                    new { FormId = formId, Version = version },
                    transaction);

                if (versionInfo == null)
                {
                    throw new ArgumentException($"Version '{version}' not found for form '{formName}'");
                }

                if (versionInfo.IsCurrent)
                {
                    throw new ArgumentException(
                        $"Cannot delete version '{version}' because it is the current active version. " +
                        "Set a different version as current before deleting this one.");
                }

                // 3. Delete version
                await connection.ExecuteAsync(
                    "DELETE FROM CustomFormVersions WHERE FormId = @FormId AND Version = @Version",
                    new { FormId = formId, Version = version },
                    transaction);

                transaction.Commit();

                _logger.LogInformation("[Database] Deleted version '{Version}' of form '{FormName}'",
                    version, formName);

                return (true, $"Version '{version}' of form '{formName}' deleted successfully");
            }
            catch
            {
                transaction.Rollback();
                throw;
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[Database] Error deleting version '{Version}' of form '{FormName}'",
                version, formName);
            throw;
        }
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

    // Custom Forms
    Task<List<CustomFormInfo>> GetAllCustomFormsAsync();
    Task<FormCodeResponse?> GetFormCompiledCodeAsync(string formName, string? version = null);
    Task<List<FormVersion>> GetFormVersionsAsync(string formName);
    Task<bool> SetCurrentFormVersionAsync(string formName, string version);
    Task<(bool Success, string Message, int VersionsDeleted)> DeleteFormAsync(string formName);
    Task<(bool Success, string Message)> DeleteFormVersionAsync(string formName, string version);
}

public record UserInfo(
    int UserId,
    string UserName,
    string Email,
    string DisplayName,
    string FirstName,
    string LastName
);
