using BizuitCustomForms.WebApi.Services;
using Microsoft.Extensions.Configuration;
using Xunit;

namespace BizuitCustomForms.Tests.Services;

public class CryptoServiceTests
{
    private readonly ICryptoService _cryptoService;

    public CryptoServiceTests()
    {
        // Setup configuration with test key
        var configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["BizuitSettings:EncryptionTokenKey"] = "Vq2ixrmV6oUGhQfIPWiCBk0S"  // Test key (24 chars)
            })
            .Build();

        _cryptoService = new CryptoService(configuration);
    }

    [Fact]
    public void DecryptTripleDes_WithValidToken_ShouldDecrypt()
    {
        // Arrange
        string testToken = "aAAV/9xqhAE=";  // Example token from Python tests

        // Act
        var result = _cryptoService.DecryptTripleDes(testToken);

        // Assert
        Assert.NotNull(result);
        Assert.NotEmpty(result);
    }

    [Fact]
    public void DecryptTripleDes_WithInvalidBase64_ShouldThrow()
    {
        // Arrange
        string invalidToken = "not-valid-base64!@#";

        // Act & Assert
        Assert.Throws<ArgumentException>(() => _cryptoService.DecryptTripleDes(invalidToken));
    }

    [Fact]
    public void ValidateDashboardToken_WithValidToken_ShouldParse()
    {
        // Arrange
        string testToken = "aAAV/9xqhAE=";

        // Act
        var result = _cryptoService.ValidateDashboardToken(testToken);

        // Assert
        Assert.NotNull(result);
        Assert.True(result.ContainsKey("raw"));
        Assert.True(result.ContainsKey("parts_count"));
    }

    [Fact]
    public void Constructor_WithInvalidKeyLength_ShouldThrow()
    {
        // Arrange
        var configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["BizuitSettings:EncryptionTokenKey"] = "TooShort"  // Only 8 chars, needs 24
            })
            .Build();

        // Act & Assert
        var exception = Assert.Throws<InvalidOperationException>(() => new CryptoService(configuration));
        Assert.Contains("24 characters", exception.Message);
    }

    [Fact]
    public void Constructor_WithMissingKey_ShouldThrow()
    {
        // Arrange
        var configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>())
            .Build();

        // Act & Assert
        Assert.Throws<InvalidOperationException>(() => new CryptoService(configuration));
    }
}
