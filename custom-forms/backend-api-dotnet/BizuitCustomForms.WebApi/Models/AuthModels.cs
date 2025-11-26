namespace BizuitCustomForms.WebApi.Models;

// ==============================================================================
// Admin Authentication Models
// ==============================================================================

public record AdminLoginRequest(
    string Username,
    string Password,
    string TenantId = "default"  // Tenant identifier for multi-tenant isolation
);

public record AdminLoginResponse(
    bool Success,
    string? Token = null,
    UserData? User = null,
    string? Error = null
);

public record UserData(
    List<string> Roles,
    int UserId,
    string UserName,
    string Email,
    string DisplayName,
    string FirstName,
    string LastName
);

public record ValidateSessionRequest(
    string Token,
    string TenantId = "default"
);

public record ValidateSessionResponse(
    bool Valid,
    UserData? User = null,
    string? Error = null
);

// ==============================================================================
// Health Check Models
// ==============================================================================

public record HealthResponse(
    string Status,
    DatabaseStatus Database,
    string Timestamp
);

public record DatabaseStatus(
    bool Success,
    string? Message = null
);
