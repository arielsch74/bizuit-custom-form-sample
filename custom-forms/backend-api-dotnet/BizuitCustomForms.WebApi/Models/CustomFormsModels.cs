namespace BizuitCustomForms.WebApi.Models;

// ==============================================================================
// Custom Forms Models
// ==============================================================================

/// <summary>
/// Custom form information from CustomForms table
/// </summary>
public record CustomFormInfo(
    int Id,
    string FormName,
    string ProcessName,
    string Status,
    string CurrentVersion,
    string? Description = null,
    string? Author = null,
    int? SizeBytes = null,
    string? PublishedAt = null,
    string? UpdatedAt = null
);

/// <summary>
/// Form compiled code response
/// </summary>
public record FormCodeResponse(
    string CompiledCode,
    string Version,
    string PublishedAt,
    int SizeBytes
);

/// <summary>
/// Form version information from CustomFormVersions table
/// </summary>
public record FormVersion(
    string Version,
    int SizeBytes,
    string PublishedAt,
    bool IsCurrent,
    string? GitCommit = null,
    string? GitBranch = null
);

/// <summary>
/// Request to set a specific version as current
/// </summary>
public record SetVersionRequest(
    string Version
);

/// <summary>
/// Response from set-version operation
/// </summary>
public record SetVersionResponse(
    bool Success,
    string Message,
    string? FormName = null,
    string? NewVersion = null
);

// ==============================================================================
// Deployment Models
// ==============================================================================

/// <summary>
/// Deployment manifest from ZIP package
/// </summary>
public record DeploymentManifest(
    string Version,
    string GitCommit,
    string GitBranch,
    string BuildDate,
    Dictionary<string, FormDeploymentInfo> Forms
);

/// <summary>
/// Individual form deployment info from manifest
/// </summary>
public record FormDeploymentInfo(
    string FormName,
    string ProcessName,
    string Version,
    string? Description = null,
    string? Author = null,
    int SizeBytes = 0
);

/// <summary>
/// Result of deploying a single form
/// </summary>
public record FormDeploymentResult(
    string FormName,
    bool Success,
    string Action,  // "inserted", "updated", "skipped", "error"
    string? Error = null,
    int? FormId = null
);

/// <summary>
/// Response from deployment upload
/// </summary>
public record UploadDeploymentResponse(
    int FormsProcessed,
    int FormsInserted,
    int FormsUpdated,
    List<string>? Errors = null,
    List<FormDeploymentResult>? Results = null
);
