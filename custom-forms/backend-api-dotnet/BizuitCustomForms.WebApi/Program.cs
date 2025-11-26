using BizuitCustomForms.WebApi.Services;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

// Configure Serilog
Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .Enrich.FromLogContext()
    .WriteTo.Console()
    .WriteTo.File("logs/api-.log", rollingInterval: RollingInterval.Day)
    .CreateLogger();

builder.Host.UseSerilog();

// Add services to the container
builder.Services.AddControllers()
    .ConfigureApiBehaviorOptions(options =>
    {
        // Change automatic model validation response from 400 BadRequest to 422 UnprocessableEntity
        // This matches Python FastAPI behavior for validation errors
        options.InvalidModelStateResponseFactory = context =>
        {
            return new Microsoft.AspNetCore.Mvc.UnprocessableEntityObjectResult(context.ModelState);
        };
    });

// Add Swagger/OpenAPI
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo
    {
        Title = "BIZUIT Custom Forms API",
        Version = "v1",
        Description = "Backend API for BIZUIT Custom Forms (.NET implementation)"
    });
});

// Register application services
builder.Services.AddScoped<ICryptoService, CryptoService>();
builder.Services.AddScoped<IDatabaseService, DatabaseService>();
builder.Services.AddScoped<IAuthenticationService, AuthenticationService>();
builder.Services.AddScoped<IFormTokenService, FormTokenService>();

// Add HttpClient factory
builder.Services.AddHttpClient();

// Configure CORS
var corsOrigins = builder.Configuration["Cors:AllowedOrigins"];
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        if (corsOrigins == "*")
        {
            policy.AllowAnyOrigin()
                  .AllowAnyMethod()
                  .AllowAnyHeader();
        }
        else
        {
            var origins = corsOrigins?.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
                ?? Array.Empty<string>();

            policy.WithOrigins(origins)
                  .AllowAnyMethod()
                  .AllowAnyHeader()
                  .AllowCredentials();
        }
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    Log.Warning("⚠️  WARNING: CORS is allowing ALL origins (*) - Use only for development!");
}

// Enable Swagger in all environments (useful for testing/documentation)
app.UseSwagger(options =>
{
    options.PreSerializeFilters.Add((swagger, httpReq) =>
    {
        swagger.Servers = new List<Microsoft.OpenApi.Models.OpenApiServer>
        {
            new Microsoft.OpenApi.Models.OpenApiServer { Url = $"{httpReq.Scheme}://{httpReq.Host.Value}{httpReq.PathBase.Value}" }
        };
    });
});

app.UseSwaggerUI(options =>
{
    // Use relative path - works with IIS virtual applications
    options.SwaggerEndpoint("./v1/swagger.json", "BIZUIT Custom Forms API v1");
    options.RoutePrefix = "swagger";  // Access at /swagger
});

app.UseCors();

app.UseAuthorization();

app.MapControllers();

Log.Information("==================================================");
Log.Information("Starting ASP.NET Core API");
Log.Information("Hosting Model: IIS In-Process");
Log.Information("Environment: {Environment}", app.Environment.EnvironmentName);
Log.Information("==================================================");

app.Run();
