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
public class DeploymentManifest
{
    public required string PackageVersion { get; set; }
    public required string CommitHash { get; set; }
    // Optional for backwards compatibility with existing deployment packages
    public string? CommitBranch { get; set; }
    public required string BuildDate { get; set; }
    public required List<FormDeploymentInfo> Forms { get; set; }
}

/// <summary>
/// Individual form deployment info from manifest
/// </summary>
public class FormDeploymentInfo
{
    public required string FormName { get; set; }
    public required string ProcessName { get; set; }
    public required string Version { get; set; }
    public required string Path { get; set; }
    public string? Description { get; set; }
    public string? Author { get; set; }
    public int SizeBytes { get; set; }
    public string? ReleaseNotes { get; set; }
}

/// <summary>
/// Result of deploying a single form
/// </summary>
public record FormDeploymentResult(
    string FormName,
    bool Success,
    string Action,  // "inserted", "updated", "skipped", "error"
    string? Error = null
);

/// <summary>
/// Response from deployment upload
/// </summary>
public record UploadDeploymentResponse(
    bool Success,
    string Message,
    int FormsProcessed,
    int FormsInserted,
    int FormsUpdated,
    List<string>? Errors = null,
    List<FormDeploymentResult>? Results = null
);
