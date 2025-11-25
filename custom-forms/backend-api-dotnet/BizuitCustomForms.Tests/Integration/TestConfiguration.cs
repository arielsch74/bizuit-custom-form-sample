using System.Text.Json;

namespace BizuitCustomForms.Tests.Integration;

/// <summary>
/// Configuración centralizada para tests de integración
/// </summary>
public static class TestConfiguration
{
    // URLs de los backends
    public const string PythonBaseUrl = "http://localhost:8000";
    public const string DotNetBaseUrl = "http://localhost:8001";

    // Credenciales de test (deben existir en la BD de test)
    public const string TestUsername = "test_user";
    public const string TestPassword = "test_password";
    public const string TestTenantId = "arielsch";

    // Tokens de test válidos (generar con scripts de Python)
    public static class TestTokens
    {
        // Token de form válido para testing
        public const string ValidFormToken = "REPLACE_WITH_VALID_TOKEN";

        // Token de Dashboard válido para testing
        public const string ValidDashboardToken = "REPLACE_WITH_VALID_DASHBOARD_TOKEN";
    }

    // Nombres de forms para testing
    public static class TestForms
    {
        public const string ExistingForm = "test-form";
        public const string NonExistentForm = "non-existent-form";
    }

    /// <summary>
    /// Compara dos objetos JSON y verifica que tengan la misma estructura
    /// </summary>
    public static bool CompareJsonStructure(JsonElement python, JsonElement dotnet, List<string> ignoredFields = null)
    {
        ignoredFields ??= new List<string>();

        if (python.ValueKind != dotnet.ValueKind)
            return false;

        switch (python.ValueKind)
        {
            case JsonValueKind.Object:
                var pythonProps = python.EnumerateObject().Where(p => !ignoredFields.Contains(p.Name)).ToList();
                var dotnetProps = dotnet.EnumerateObject().Where(p => !ignoredFields.Contains(p.Name)).ToList();

                if (pythonProps.Count != dotnetProps.Count)
                    return false;

                foreach (var pythonProp in pythonProps)
                {
                    if (!dotnet.TryGetProperty(pythonProp.Name, out var dotnetValue))
                        return false;

                    if (!CompareJsonStructure(pythonProp.Value, dotnetValue, ignoredFields))
                        return false;
                }
                break;

            case JsonValueKind.Array:
                if (python.GetArrayLength() != dotnet.GetArrayLength())
                    return false;

                var pythonArray = python.EnumerateArray().ToList();
                var dotnetArray = dotnet.EnumerateArray().ToList();

                for (int i = 0; i < pythonArray.Count; i++)
                {
                    if (!CompareJsonStructure(pythonArray[i], dotnetArray[i], ignoredFields))
                        return false;
                }
                break;
        }

        return true;
    }

    /// <summary>
    /// Extrae el payload de un JWT sin validarlo (solo para testing)
    /// </summary>
    public static JsonElement? DecodeJwtPayload(string jwt)
    {
        try
        {
            var parts = jwt.Split('.');
            if (parts.Length != 3)
                return null;

            var payload = parts[1];
            // Ajustar padding
            payload = payload.PadRight(payload.Length + (4 - payload.Length % 4) % 4, '=');

            var bytes = Convert.FromBase64String(payload);
            var json = System.Text.Encoding.UTF8.GetString(bytes);

            return JsonSerializer.Deserialize<JsonElement>(json);
        }
        catch
        {
            return null;
        }
    }

    /// <summary>
    /// Valida que un JWT tenga los campos requeridos por el frontend
    /// </summary>
    public static bool ValidateJwtStructure(JsonElement payload)
    {
        // Campos requeridos según el frontend actual
        var requiredFields = new[] { "username", "tenant_id", "exp", "iat", "type" };

        foreach (var field in requiredFields)
        {
            if (!payload.TryGetProperty(field, out _))
                return false;
        }

        return true;
    }
}
