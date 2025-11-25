namespace BizuitCustomForms.WebApi.Models;

// ==============================================================================
// Form Token Validation Models
// ==============================================================================

/// <summary>
/// Request to validate a form security token
/// </summary>
public record ValidateFormTokenRequest(
    string TokenId
);

/// <summary>
/// Response from form token validation
/// </summary>
public record ValidateFormTokenResponse(
    bool Valid,
    SecurityToken? Token = null,
    string? Error = null
);

/// <summary>
/// Security token information from BIZUITPersistenceStore.SecurityTokens
/// </summary>
public record SecurityToken(
    string TokenId,
    string UserName,
    int Operation,
    string EventName,
    string RequesterAddress,
    DateTime ExpirationDate,
    string? InstanceId = null,
    bool IsValid = true
);

// ==============================================================================
// Dashboard Token Validation Models
// ==============================================================================

/// <summary>
/// Request to validate encrypted Dashboard token (parameter 's')
/// Includes all query string parameters from Dashboard
/// </summary>
public record ValidateDashboardTokenRequest(
    string EncryptedToken,     // The 's' parameter (encrypted with TripleDES)
    string? InstanceId = null,
    string? UserName = null,
    string? EventName = null,
    string? ActivityName = null,
    string? Token = null,
    Dictionary<string, string>? AdditionalParams = null  // Any other query params
);

/// <summary>
/// Response from Dashboard token validation
/// Merges SecurityTokens data with query string parameters
/// </summary>
public record ValidateDashboardTokenResponse(
    bool Success,
    DashboardTokenData? Data = null,
    string? Error = null
);

/// <summary>
/// Complete dashboard token data (merged from multiple sources)
/// </summary>
public record DashboardTokenData(
    // From SecurityTokens table
    string TokenId,
    string UserName,
    int Operation,
    string EventName,
    string RequesterAddress,
    DateTime ExpirationDate,
    string? InstanceId = null,

    // From query string parameters
    string? ActivityName = null,
    string? Token = null,
    Dictionary<string, string>? AdditionalParams = null
);

// ==============================================================================
// Close Token Models
// ==============================================================================

/// <summary>
/// Response from closing/deleting a token
/// </summary>
public record CloseTokenResponse(
    bool Success,
    string Message
);
