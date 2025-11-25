using BizuitCustomForms.WebApi.Models;
using BizuitCustomForms.WebApi.Services;
using Microsoft.AspNetCore.Mvc;

namespace BizuitCustomForms.WebApi.Controllers;

[ApiController]
[Route("")]
public class HealthController : ControllerBase
{
    private readonly IDatabaseService _databaseService;
    private readonly ILogger<HealthController> _logger;

    public HealthController(IDatabaseService databaseService, ILogger<HealthController> logger)
    {
        _databaseService = databaseService;
        _logger = logger;
    }

    /// <summary>
    /// Basic health check endpoint
    /// </summary>
    [HttpGet]
    public IActionResult Get()
    {
        _logger.LogInformation("[Health] Basic health check");
        return Ok(new
        {
            status = "healthy",
            service = "BIZUIT Custom Forms API (.NET Core)",
            version = "1.0.0",
            timestamp = DateTime.UtcNow.ToString("o")
        });
    }

    /// <summary>
    /// Health check with database connection test
    /// </summary>
    [HttpGet("health")]
    public async Task<IActionResult> GetHealth()
    {
        _logger.LogInformation("[Health] Detailed health check with database");

        var (dbSuccess, dbMessage) = await _databaseService.TestDashboardConnectionAsync();

        var response = new HealthResponse(
            Status: dbSuccess ? "healthy" : "degraded",
            Database: new DatabaseStatus(dbSuccess, dbMessage),
            Timestamp: DateTime.UtcNow.ToString("o")
        );

        return Ok(response);
    }
}
