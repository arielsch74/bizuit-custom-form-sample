using BizuitCustomForms.WebApi.Models;
using BizuitCustomForms.WebApi.Services;
using Microsoft.AspNetCore.Mvc;

namespace BizuitCustomForms.WebApi.Controllers;

[ApiController]
[Route("api/custom-forms")]
public class CustomFormsController : ControllerBase
{
    private readonly IDatabaseService _databaseService;
    private readonly ILogger<CustomFormsController> _logger;

    public CustomFormsController(
        IDatabaseService databaseService,
        ILogger<CustomFormsController> logger)
    {
        _databaseService = databaseService;
        _logger = logger;
    }

    /// <summary>
    /// Get list of all custom forms
    /// </summary>
    /// <remarks>
    /// Returns information about all active forms with their current version.
    /// Includes: name, associated process, version, description, author, size, dates.
    /// </remarks>
    [HttpGet]
    public async Task<ActionResult<List<CustomFormInfo>>> GetCustomForms()
    {
        try
        {
            _logger.LogInformation("[Custom Forms API] Getting all forms");

            var forms = await _databaseService.GetAllCustomFormsAsync();

            _logger.LogInformation("[Custom Forms API] Returning {Count} forms", forms.Count);
            return Ok(forms);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[Custom Forms API] Error getting forms");
            return StatusCode(500, new { error = $"Failed to fetch forms: {ex.Message}" });
        }
    }

    /// <summary>
    /// Get compiled code for a specific form
    /// </summary>
    /// <remarks>
    /// Returns the compiled JavaScript for the form.
    /// If version not specified, returns current (most recent) version.
    /// </remarks>
    /// <param name="formName">Name of the form (path parameter)</param>
    /// <param name="version">Optional version string (query parameter, e.g., ?version=1.1.5)</param>
    /// <response code="200">Returns the compiled JavaScript code</response>
    /// <response code="404">Form not found</response>
    [HttpGet("{formName}/code")]
    [Produces("application/javascript")]
    public async Task<IActionResult> GetFormCompiledCode(string formName, [FromQuery] string? version = null)
    {
        try
        {
            _logger.LogInformation("[Form Code API] Request for '{FormName}' version: {Version}",
                formName, version ?? "current");

            var result = await _databaseService.GetFormCompiledCodeAsync(formName, version);

            if (result == null)
            {
                return NotFound(new { error = $"Form '{formName}' not found" });
            }

            _logger.LogInformation("[Form Code API] Serving {FormName}@{Version} ({SizeBytes} bytes)",
                formName, result.Version, result.SizeBytes);

            return Content(result.CompiledCode, "application/javascript", System.Text.Encoding.UTF8);
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning("[Form Code API] Invalid input: {Message}", ex.Message);
            return BadRequest(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[Form Code API] Error getting form code");
            return StatusCode(500, new { error = $"Failed to get form code: {ex.Message}" });
        }
    }

    /// <summary>
    /// Get all versions for a specific form
    /// </summary>
    /// <remarks>
    /// Returns list of all versions with metadata (size, date, isCurrent, etc.)
    /// </remarks>
    /// <param name="formName">Name of the form</param>
    /// <response code="200">Returns list of versions</response>
    /// <response code="404">Form not found or has no versions</response>
    [HttpGet("{formName}/versions")]
    public async Task<ActionResult<List<FormVersion>>> GetFormVersions(string formName)
    {
        try
        {
            _logger.LogInformation("[Form Versions API] Getting versions for '{FormName}'", formName);

            var versions = await _databaseService.GetFormVersionsAsync(formName);

            if (versions == null || versions.Count == 0)
            {
                return NotFound(new { error = $"Form '{formName}' not found or has no versions" });
            }

            _logger.LogInformation("[Form Versions API] Returning {Count} versions for '{FormName}'",
                versions.Count, formName);

            return Ok(versions);
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning("[Form Versions API] Invalid input: {Message}", ex.Message);
            return BadRequest(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[Form Versions API] Error getting form versions");
            return StatusCode(500, new { error = $"Failed to fetch form versions: {ex.Message}" });
        }
    }

    /// <summary>
    /// Set a specific version as the current/active version
    /// </summary>
    /// <param name="formName">Name of the form</param>
    /// <param name="version">Version to set as current (query parameter)</param>
    /// <response code="200">Version set successfully</response>
    /// <response code="400">Invalid format or version not found</response>
    [HttpPost("{formName}/set-version")]
    public async Task<ActionResult<SetVersionResponse>> SetFormVersion(
        string formName,
        [FromQuery] string version)
    {
        try
        {
            _logger.LogInformation("[Set Version API] Setting '{FormName}' to version '{Version}'",
                formName, version);

            var result = await _databaseService.SetCurrentFormVersionAsync(formName, version);

            if (result)
            {
                var response = new SetVersionResponse(
                    Success: true,
                    Message: $"Version '{version}' set as current for form '{formName}'",
                    FormName: formName,
                    NewVersion: version
                );

                _logger.LogInformation("[Set Version API] Successfully set '{FormName}' to version '{Version}'",
                    formName, version);

                return Ok(response);
            }

            return BadRequest(new SetVersionResponse(
                Success: false,
                Message: "Failed to set version"
            ));
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning("[Set Version API] Invalid input: {Message}", ex.Message);
            return BadRequest(new SetVersionResponse(
                Success: false,
                Message: ex.Message
            ));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[Set Version API] Error setting version");
            return StatusCode(500, new SetVersionResponse(
                Success: false,
                Message: $"Failed to set form version: {ex.Message}"
            ));
        }
    }

    /// <summary>
    /// Delete a form and all its versions
    /// </summary>
    /// <remarks>
    /// **⚠️ Requires admin authentication** - This endpoint would require Bearer token in production.
    ///
    /// Deletes the form entry from CustomForms table and all associated versions
    /// from CustomFormVersions table in a single transaction.
    /// </remarks>
    /// <param name="formName">Name of the form to delete</param>
    /// <response code="200">Form deleted successfully</response>
    /// <response code="404">Form not found</response>
    [HttpDelete("{formName}")]
    public async Task<IActionResult> DeleteForm(string formName)
    {
        // Validate admin authentication (matches Python behavior)
        var authHeader = Request.Headers["Authorization"].FirstOrDefault();
        if (string.IsNullOrEmpty(authHeader))
        {
            return Unauthorized(new
            {
                error = "Unauthorized",
                message = "Missing Authorization header"
            });
        }

        try
        {
            _logger.LogInformation("[Delete Form API] Deleting form '{FormName}'", formName);

            var (success, message, versionsDeleted) = await _databaseService.DeleteFormAsync(formName);

            if (success)
            {
                _logger.LogInformation("[Delete Form API] Deleted form '{FormName}' - {Count} version(s)",
                    formName, versionsDeleted);

                return Ok(new
                {
                    success = true,
                    message = message,
                    versionsDeleted = versionsDeleted
                });
            }

            return BadRequest(new { success = false, message = message });
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning("[Delete Form API] Invalid input or not found: {Message}", ex.Message);
            return NotFound(new { success = false, message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[Delete Form API] Error deleting form");
            return StatusCode(500, new
            {
                success = false,
                message = $"Failed to delete form: {ex.Message}"
            });
        }
    }

    /// <summary>
    /// Delete a specific version of a form
    /// </summary>
    /// <remarks>
    /// **⚠️ Requires admin authentication** - This endpoint would require Bearer token in production.
    ///
    /// Cannot delete the current/active version. Set a different version as current first.
    /// </remarks>
    /// <param name="formName">Name of the form</param>
    /// <param name="version">Version number to delete</param>
    /// <response code="200">Version deleted successfully</response>
    /// <response code="400">Cannot delete current version or invalid input</response>
    /// <response code="404">Form or version not found</response>
    [HttpDelete("{formName}/versions/{version}")]
    public async Task<IActionResult> DeleteFormVersion(string formName, string version)
    {
        // Validate admin authentication (matches Python behavior)
        var authHeader = Request.Headers["Authorization"].FirstOrDefault();
        if (string.IsNullOrEmpty(authHeader))
        {
            return Unauthorized(new
            {
                error = "Unauthorized",
                message = "Missing Authorization header"
            });
        }

        try
        {
            _logger.LogInformation("[Delete Version API] Deleting version '{Version}' of form '{FormName}'",
                version, formName);

            var (success, message) = await _databaseService.DeleteFormVersionAsync(formName, version);

            if (success)
            {
                _logger.LogInformation("[Delete Version API] Successfully deleted version '{Version}' of form '{FormName}'",
                    version, formName);

                return Ok(new { success = true, message = message });
            }

            return BadRequest(new { success = false, message = message });
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning("[Delete Version API] Invalid input: {Message}", ex.Message);

            // Check if it's a "not found" error or "cannot delete current version" error
            if (ex.Message.Contains("not found"))
            {
                return NotFound(new { success = false, message = ex.Message });
            }

            return BadRequest(new { success = false, message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[Delete Version API] Error deleting version");
            return StatusCode(500, new
            {
                success = false,
                message = $"Failed to delete version: {ex.Message}"
            });
        }
    }
}
