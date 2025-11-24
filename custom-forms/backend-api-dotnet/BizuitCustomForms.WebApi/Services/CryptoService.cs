using System.Security.Cryptography;
using System.Text;

namespace BizuitCustomForms.WebApi.Services;

/// <summary>
/// Cryptographic utilities for Bizuit Dashboard token validation.
/// Provides TripleDES decryption functionality to validate encrypted tokens sent from the Bizuit Dashboard.
/// </summary>
public class CryptoService : ICryptoService
{
    private readonly string _encryptionKey;

    public CryptoService(IConfiguration configuration)
    {
        _encryptionKey = configuration["BizuitSettings:EncryptionTokenKey"]
            ?? throw new InvalidOperationException("EncryptionTokenKey is required in configuration");

        if (_encryptionKey.Length != 24)
        {
            throw new InvalidOperationException(
                $"ENCRYPTION_TOKEN_KEY must be exactly 24 characters for TripleDES. Current length: {_encryptionKey.Length}");
        }
    }

    /// <summary>
    /// Decrypt a TripleDES encrypted string from Bizuit Dashboard.
    ///
    /// This is the C# equivalent of the Python decrypt_triple_des method:
    /// - Key: ENCRYPTION_TOKEN_KEY (UTF-8 encoded)
    /// - Mode: ECB
    /// - Padding: PKCS7
    /// - Input: Base64 encoded string
    /// - Output: UTF-8 decoded string
    /// </summary>
    /// <param name="encryptedString">Base64 encoded encrypted string (parameter 's' from Dashboard)</param>
    /// <returns>Decrypted string (usually contains auth info like "admin|timestamp|etc")</returns>
    /// <exception cref="ArgumentException">If the encrypted string is invalid or cannot be decrypted</exception>
    public string DecryptTripleDes(string encryptedString)
    {
        try
        {
            // Convert key to bytes (UTF-8)
            byte[] keyBytes = Encoding.UTF8.GetBytes(_encryptionKey);

            // Decode Base64 encrypted string to bytes
            byte[] cipherBytes = Convert.FromBase64String(encryptedString);

            // Create TripleDES cipher
            using var tdes = TripleDES.Create();
            tdes.Key = keyBytes;
            tdes.Mode = CipherMode.ECB;  // IMPORTANT: Must match Python (ECB mode)
            tdes.Padding = PaddingMode.PKCS7;  // PKCS7 padding

            // Decrypt
            using var decryptor = tdes.CreateDecryptor();
            byte[] plainBytes = decryptor.TransformFinalBlock(cipherBytes, 0, cipherBytes.Length);

            // Convert to UTF-8 string
            return Encoding.UTF8.GetString(plainBytes);
        }
        catch (Exception ex)
        {
            throw new ArgumentException($"Failed to decrypt token: {ex.Message}", ex);
        }
    }

    /// <summary>
    /// Validate and parse an encrypted token from Bizuit Dashboard.
    ///
    /// The decrypted token typically contains information separated by pipes (|):
    /// - Username
    /// - Timestamp
    /// - Additional metadata
    /// </summary>
    /// <param name="encryptedToken">The encrypted 's' parameter from Dashboard query string</param>
    /// <returns>Dictionary with parsed token information</returns>
    public Dictionary<string, string> ValidateDashboardToken(string encryptedToken)
    {
        // Decrypt the token
        string decrypted = DecryptTripleDes(encryptedToken);

        // Parse the decrypted content (format may vary, adjust as needed)
        string[] parts = decrypted.Split('|');

        var result = new Dictionary<string, string>
        {
            ["raw"] = decrypted,
            ["parts_count"] = parts.Length.ToString()
        };

        // If we know the format, we can parse specific fields
        if (parts.Length > 0)
            result["username"] = parts[0];

        if (parts.Length > 1)
            result["timestamp"] = parts[1];

        return result;
    }
}

public interface ICryptoService
{
    string DecryptTripleDes(string encryptedString);
    Dictionary<string, string> ValidateDashboardToken(string encryptedToken);
}
