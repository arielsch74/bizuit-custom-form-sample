using BizuitCustomForms.WebApi.Models;
using BizuitCustomForms.WebApi.Services;
using Microsoft.AspNetCore.Mvc;

namespace BizuitCustomForms.WebApi.Controllers;

[ApiController]
[Route("api/forms")]
public class FormTokensController : ControllerBase
{
    private readonly IFormTokenService _formTokenService;
    private readonly ILogger<FormTokensController> _logger;

    public FormTokensController(
        IFormTokenService formTokenService,
        ILogger<FormTokensController> logger)
    {
        _formTokenService = formTokenService;
        _logger = logger;
    }

    /// <summary>
    /// Validate security token for form access
    /// Verifies token exists in BIZUITPersistenceStore.SecurityTokens and hasn't expired.
    /// This endpoint does NOT require admin authentication (used by public forms).
    /// </summary>
    /// <remarks>
    /// Rate limit: 30 requests per minute per IP
    /// </remarks>
    [HttpPost("validate-token")]
    public async Task<ActionResult<ValidateFormTokenResponse>> ValidateFormToken(
        [FromBody] ValidateFormTokenRequest request)
    {
        try
        {
            _logger.LogInformation("[Form Tokens API] Validating token '{TokenId}'", request.TokenId);

            var (valid, token, error) = await _formTokenService.ValidateFormTokenAsync(request.TokenId);

            var response = new ValidateFormTokenResponse(valid, token, error);
            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[Form Tokens API] Error validating token");
            return Ok(new ValidateFormTokenResponse(false, null, "Internal server error"));
        }
    }

    /// <summary>
    /// Close/delete a security token (when form closes)
    /// Removes token from BIZUITPersistenceStore.SecurityTokens.
    /// Called automatically when user closes or completes a form.
    /// </summary>
    [HttpDelete("close-token/{tokenId}")]
    public async Task<ActionResult<CloseTokenResponse>> CloseFormToken(string tokenId)
    {
        try
        {
            _logger.LogInformation("[Form Tokens API] Closing token '{TokenId}'", tokenId);

            var (success, message) = await _formTokenService.CloseFormTokenAsync(tokenId);

            var response = new CloseTokenResponse(success, message);
            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[Form Tokens API] Error closing token");
            return Ok(new CloseTokenResponse(false, "Internal server error"));
        }
    }

    /// <summary>
    /// Validate encrypted token from Bizuit Dashboard and return all parameters for the form
    /// </summary>
    /// <remarks>
    /// <para><strong>Flow:</strong></para>
    /// <list type="number">
    /// <item>Dashboard sends query string with all parameters:
    /// <c>?InstanceId=123&amp;UserName=admin&amp;s=aAAV/9xqhAE=&amp;eventName=MyProcess&amp;activityName=Task1&amp;token=xyz</c></item>
    /// <item>Runtime-app extracts ALL parameters and calls this endpoint</item>
    /// <item>Backend decrypts the 's' parameter (TripleDES → TokenId)</item>
    /// <item>Validates TokenId against SecurityTokens table</item>
    /// <item>Merges query string parameters + SecurityTokens data</item>
    /// <item>Returns complete parameter set for the form to use</item>
    /// </list>
    ///
    /// <para><strong>Parameters from Dashboard:</strong></para>
    /// <list type="bullet">
    /// <item><c>s</c> (required): Encrypted TokenId</item>
    /// <item><c>InstanceId</c>: Process instance ID</item>
    /// <item><c>UserName</c>: Current user</item>
    /// <item><c>eventName</c>: Process/event name (e.g., "[[PROCESS_NAME]]")</item>
    /// <item><c>activityName</c>: Activity name (e.g., "[[ACTIVITY_NAME]]")</item>
    /// <item><c>token</c>: Auth token (e.g., "[[TOKEN]]")</item>
    /// </list>
    ///
    /// <para>Rate limit: 20 requests per minute per IP</para>
    /// </remarks>
    /// <example>
    /// Request:
    /// <code>
    /// {
    ///   "encryptedToken": "aAAV/9xqhAE=",
    ///   "instanceId": "12345",
    ///   "userName": "admin",
    ///   "eventName": "VacationRequest",
    ///   "activityName": "ApproveRequest",
    ///   "token": "Bearer xyz..."
    /// }
    /// </code>
    ///
    /// Response:
    /// <code>
    /// {
    ///   "success": true,
    ///   "data": {
    ///     "tokenId": "141191",
    ///     "userName": "admin",
    ///     "operation": 1,
    ///     "eventName": "VacationRequest",
    ///     "requesterAddress": "192.168.1.1",
    ///     "expirationDate": "2025-11-25T15:30:00",
    ///     "instanceId": "12345",
    ///     "activityName": "ApproveRequest",
    ///     "token": "Bearer xyz..."
    ///   },
    ///   "error": null
    /// }
    /// </code>
    /// </example>
    [HttpPost("/api/dashboard/validate-token")]
    public async Task<ActionResult<ValidateDashboardTokenResponse>> ValidateDashboardToken(
        [FromBody] ValidateDashboardTokenRequest request)
    {
        try
        {
            _logger.LogInformation("[Form Tokens API] Validating Dashboard token");

            var (success, data, error) = await _formTokenService.ValidateDashboardTokenAsync(request);

            var response = new ValidateDashboardTokenResponse(success, data, error);
            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "[Form Tokens API] Error validating Dashboard token");
            return Ok(new ValidateDashboardTokenResponse(false, null, "Internal server error"));
        }
    }
}
