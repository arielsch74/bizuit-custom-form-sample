using BizuitCustomForms.WebApi.Models;

namespace BizuitCustomForms.WebApi.Services;

/// <summary>
/// Service for managing form security tokens
/// Handles validation, decryption, and lifecycle of SecurityTokens
/// </summary>
public class FormTokenService : IFormTokenService
{
    private readonly IDatabaseService _databaseService;
    private readonly ICryptoService _cryptoService;
    private readonly ILogger<FormTokenService> _logger;

    public FormTokenService(
        IDatabaseService databaseService,
        ICryptoService cryptoService,
        ILogger<FormTokenService> logger)
    {
        _databaseService = databaseService;
        _cryptoService = cryptoService;
        _logger = logger;
    }

    /// <summary>
    /// Validate form security token
    /// Checks if token exists and hasn't expired
    /// </summary>
    public async Task<(bool Valid, SecurityToken? Token, string? Error)> ValidateFormTokenAsync(string tokenId)
    {
        try
        {
            _logger.LogInformation("[Form Token Service] Validating token '{TokenId}'", tokenId);

            var token = await _databaseService.ValidateSecurityTokenAsync(tokenId);

            if (token == null)
            {
                return (false, null, "Token not found");
            }

            if (!token.IsValid)
            {
                return (false, token, "Token expired");
            }

            _logger.LogInformation("[Form Token Service] Token '{TokenId}' is valid", tokenId);
            return (true, token, null);
        }
        catch (ArgumentException ex)
        {
            // Invalid token format
            _logger.LogWarning("[Form Token Service] Invalid token format: {Message}", ex.Message);
            return (false, null, "Invalid token format");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[Form Token Service] Error validating token");
            return (false, null, "Validation error");
        }
    }

    /// <summary>
    /// Close/delete security token (when form closes)
    /// </summary>
    public async Task<(bool Success, string Message)> CloseFormTokenAsync(string tokenId)
    {
        try
        {
            _logger.LogInformation("[Form Token Service] Closing token '{TokenId}'", tokenId);

            var deleted = await _databaseService.DeleteSecurityTokenAsync(tokenId);

            if (deleted)
            {
                return (true, $"Token '{tokenId}' closed successfully");
            }

            return (false, $"Token '{tokenId}' not found");
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning("[Form Token Service] Invalid token format: {Message}", ex.Message);
            return (false, "Invalid token format");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[Form Token Service] Error closing token");
            return (false, "Error closing token");
        }
    }

    /// <summary>
    /// Validate Dashboard token (encrypted 's' parameter)
    /// Decrypts token, validates against SecurityTokens, merges with query params
    /// </summary>
    public async Task<(bool Success, DashboardTokenData? Data, string? Error)> ValidateDashboardTokenAsync(
        ValidateDashboardTokenRequest request)
    {
        try
        {
            _logger.LogInformation("[Form Token Service] Validating Dashboard token");

            // 1. Decrypt the 's' parameter (TripleDES)
            string decryptedToken;
            try
            {
                decryptedToken = _cryptoService.DecryptTripleDes(request.EncryptedToken);
                _logger.LogInformation("[Form Token Service] Token decrypted successfully");
            }
            catch (Exception ex)
            {
                _logger.LogWarning("[Form Token Service] Failed to decrypt token: {Message}", ex.Message);
                return (false, null, "Invalid or corrupted token");
            }

            // 2. Parse decrypted token to get TokenId
            // Format is typically: "TokenId|OtherData" or just "TokenId"
            var tokenId = decryptedToken.Split('|')[0].Trim();

            if (string.IsNullOrWhiteSpace(tokenId))
            {
                return (false, null, "Invalid token format after decryption");
            }

            _logger.LogInformation("[Form Token Service] Extracted TokenId: '{TokenId}'", tokenId);

            // 3. Validate token against SecurityTokens table
            var securityToken = await _databaseService.ValidateSecurityTokenAsync(tokenId);

            if (securityToken == null)
            {
                return (false, null, "Token not found in database");
            }

            if (!securityToken.IsValid)
            {
                return (false, null, $"Token expired at {securityToken.ExpirationDate}");
            }

            // 4. Merge SecurityTokens data with query string parameters
            var dashboardData = new DashboardTokenData(
                // From SecurityTokens table
                TokenId: securityToken.TokenId,
                UserName: securityToken.UserName,
                Operation: securityToken.Operation,
                EventName: securityToken.EventName,
                RequesterAddress: securityToken.RequesterAddress,
                ExpirationDate: securityToken.ExpirationDate,
                InstanceId: securityToken.InstanceId ?? request.InstanceId,

                // From query string
                ActivityName: request.ActivityName,
                Token: request.Token,
                AdditionalParams: request.AdditionalParams
            );

            _logger.LogInformation(
                "[Form Token Service] Dashboard token validated for user '{UserName}', event '{EventName}'",
                dashboardData.UserName, dashboardData.EventName);

            return (true, dashboardData, null);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[Form Token Service] Error validating Dashboard token");
            return (false, null, "Validation error");
        }
    }
}

public interface IFormTokenService
{
    Task<(bool Valid, SecurityToken? Token, string? Error)> ValidateFormTokenAsync(string tokenId);
    Task<(bool Success, string Message)> CloseFormTokenAsync(string tokenId);
    Task<(bool Success, DashboardTokenData? Data, string? Error)> ValidateDashboardTokenAsync(
        ValidateDashboardTokenRequest request);
}
