using System.Diagnostics;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using Xunit;
using Xunit.Abstractions;

namespace BizuitCustomForms.Tests.Performance;

/// <summary>
/// Performance benchmarks comparing Python FastAPI vs .NET Core backends
/// Measures response times, throughput, and resource usage
/// </summary>
public class PerformanceBenchmarks : IDisposable
{
    private readonly HttpClient _pythonClient;
    private readonly HttpClient _dotnetClient;
    private readonly ITestOutputHelper _output;

    private const string PYTHON_BASE_URL = "http://localhost:8000";
    private const string DOTNET_BASE_URL = "http://localhost:8001";

    public PerformanceBenchmarks(ITestOutputHelper output)
    {
        _output = output;

        _pythonClient = new HttpClient
        {
            BaseAddress = new Uri(PYTHON_BASE_URL),
            Timeout = TimeSpan.FromSeconds(30)
        };

        _dotnetClient = new HttpClient
        {
            BaseAddress = new Uri(DOTNET_BASE_URL),
            Timeout = TimeSpan.FromSeconds(30)
        };
    }

    public void Dispose()
    {
        _pythonClient?.Dispose();
        _dotnetClient?.Dispose();
    }

    #region Helper Methods

    private async Task<(long ElapsedMs, HttpResponseMessage Response)> MeasureRequestTime(
        HttpClient client,
        Func<HttpClient, Task<HttpResponseMessage>> requestFunc)
    {
        var stopwatch = Stopwatch.StartNew();
        var response = await requestFunc(client);
        stopwatch.Stop();
        return (stopwatch.ElapsedMilliseconds, response);
    }

    private async Task<BenchmarkResult> RunBenchmark(
        string testName,
        Func<HttpClient, Task<HttpResponseMessage>> requestFunc,
        int iterations = 100)
    {
        _output.WriteLine($"\n{'='*60}");
        _output.WriteLine($"🏁 Benchmark: {testName}");
        _output.WriteLine($"   Iterations: {iterations}");
        _output.WriteLine($"{'='*60}");

        // Warmup (5 requests to each backend)
        _output.WriteLine("🔥 Warming up...");
        for (int i = 0; i < 5; i++)
        {
            await requestFunc(_pythonClient);
            await requestFunc(_dotnetClient);
        }
        _output.WriteLine("✅ Warmup complete\n");

        var pythonTimes = new List<long>();
        var dotnetTimes = new List<long>();

        // Run benchmark
        _output.WriteLine($"⏱️  Running {iterations} iterations...");
        for (int i = 0; i < iterations; i++)
        {
            // Python
            var (pythonMs, pythonResponse) = await MeasureRequestTime(_pythonClient, requestFunc);
            pythonTimes.Add(pythonMs);
            pythonResponse.Dispose();

            // .NET
            var (dotnetMs, dotnetResponse) = await MeasureRequestTime(_dotnetClient, requestFunc);
            dotnetTimes.Add(dotnetMs);
            dotnetResponse.Dispose();

            // Progress indicator every 25 iterations
            if ((i + 1) % 25 == 0)
            {
                _output.WriteLine($"   Progress: {i + 1}/{iterations} iterations complete");
            }
        }

        var result = new BenchmarkResult
        {
            TestName = testName,
            Iterations = iterations,
            PythonAvgMs = pythonTimes.Average(),
            PythonMinMs = pythonTimes.Min(),
            PythonMaxMs = pythonTimes.Max(),
            PythonMedianMs = CalculateMedian(pythonTimes),
            PythonP95Ms = CalculatePercentile(pythonTimes, 95),
            PythonP99Ms = CalculatePercentile(pythonTimes, 99),
            DotnetAvgMs = dotnetTimes.Average(),
            DotnetMinMs = dotnetTimes.Min(),
            DotnetMaxMs = dotnetTimes.Max(),
            DotnetMedianMs = CalculateMedian(dotnetTimes),
            DotnetP95Ms = CalculatePercentile(dotnetTimes, 95),
            DotnetP99Ms = CalculatePercentile(dotnetTimes, 99)
        };

        PrintBenchmarkResult(result);
        return result;
    }

    private double CalculateMedian(List<long> values)
    {
        var sorted = values.OrderBy(x => x).ToList();
        int count = sorted.Count;
        if (count % 2 == 0)
        {
            return (sorted[count / 2 - 1] + sorted[count / 2]) / 2.0;
        }
        return sorted[count / 2];
    }

    private double CalculatePercentile(List<long> values, int percentile)
    {
        var sorted = values.OrderBy(x => x).ToList();
        int index = (int)Math.Ceiling(percentile / 100.0 * sorted.Count) - 1;
        return sorted[Math.Max(0, Math.Min(index, sorted.Count - 1))];
    }

    private void PrintBenchmarkResult(BenchmarkResult result)
    {
        _output.WriteLine("\n📊 RESULTS:");
        _output.WriteLine($"\n   Python FastAPI:");
        _output.WriteLine($"   ├─ Average:  {result.PythonAvgMs:F2} ms");
        _output.WriteLine($"   ├─ Median:   {result.PythonMedianMs:F2} ms");
        _output.WriteLine($"   ├─ Min:      {result.PythonMinMs} ms");
        _output.WriteLine($"   ├─ Max:      {result.PythonMaxMs} ms");
        _output.WriteLine($"   ├─ P95:      {result.PythonP95Ms:F2} ms");
        _output.WriteLine($"   └─ P99:      {result.PythonP99Ms:F2} ms");

        _output.WriteLine($"\n   .NET Core:");
        _output.WriteLine($"   ├─ Average:  {result.DotnetAvgMs:F2} ms");
        _output.WriteLine($"   ├─ Median:   {result.DotnetMedianMs:F2} ms");
        _output.WriteLine($"   ├─ Min:      {result.DotnetMinMs} ms");
        _output.WriteLine($"   ├─ Max:      {result.DotnetMaxMs} ms");
        _output.WriteLine($"   ├─ P95:      {result.DotnetP95Ms:F2} ms");
        _output.WriteLine($"   └─ P99:      {result.DotnetP99Ms:F2} ms");

        var avgDiff = result.DotnetAvgMs - result.PythonAvgMs;
        var avgDiffPercent = (avgDiff / result.PythonAvgMs) * 100;
        var winner = avgDiff < 0 ? ".NET" : "Python";
        var faster = Math.Abs(avgDiffPercent);

        _output.WriteLine($"\n   🏆 Winner: {winner} ({faster:F1}% faster on average)");
        _output.WriteLine($"   📈 Difference: {Math.Abs(avgDiff):F2} ms");

        if (result.DotnetAvgMs < result.PythonAvgMs)
        {
            _output.WriteLine($"   ⚡ .NET is {faster:F1}% faster");
        }
        else
        {
            _output.WriteLine($"   🐍 Python is {faster:F1}% faster");
        }
    }

    #endregion

    #region Benchmark Tests

    [Fact]
    public async Task Benchmark_HealthCheck_Simple()
    {
        var result = await RunBenchmark(
            "Health Check (Simple)",
            client => client.GetAsync("/"),
            iterations: 100
        );

        // Assert - .NET should be faster (compiled vs interpreted)
        Assert.True(result.DotnetAvgMs < result.PythonAvgMs * 1.5,
            ".NET should be competitive with Python on simple health checks");
    }

    [Fact]
    public async Task Benchmark_HealthCheck_WithDatabase()
    {
        var result = await RunBenchmark(
            "Health Check (With Database)",
            client => client.GetAsync("/health"),
            iterations: 100
        );

        // Assert - Both should be reasonably fast (< 100ms average)
        Assert.True(result.PythonAvgMs < 100, "Python health check should be < 100ms avg");
        Assert.True(result.DotnetAvgMs < 100, ".NET health check should be < 100ms avg");
    }

    [Fact]
    public async Task Benchmark_Login_Authentication()
    {
        var credentials = new { username = "admin", password = "admin123" };

        var result = await RunBenchmark(
            "Login (JWT Generation)",
            async client =>
            {
                var content = new StringContent(
                    JsonSerializer.Serialize(credentials),
                    Encoding.UTF8,
                    "application/json"
                );
                return await client.PostAsync("/api/auth/login", content);
            },
            iterations: 100
        );

        // Assert - Login should be reasonably fast
        Assert.True(result.PythonAvgMs < 200, "Python login should be < 200ms avg");
        Assert.True(result.DotnetAvgMs < 200, ".NET login should be < 200ms avg");
    }

    [Fact]
    public async Task Benchmark_ValidateToken_JWT()
    {
        // First, get a valid token
        var credentials = new { username = "admin", password = "admin123" };
        var loginContent = new StringContent(
            JsonSerializer.Serialize(credentials),
            Encoding.UTF8,
            "application/json"
        );
        var loginResponse = await _pythonClient.PostAsync("/api/auth/login", loginContent);
        var loginJson = await loginResponse.Content.ReadFromJsonAsync<JsonElement>();
        var token = loginJson.GetProperty("token").GetString();

        var result = await RunBenchmark(
            "Validate Token (JWT)",
            async client =>
            {
                var content = new StringContent(
                    JsonSerializer.Serialize(new { token }),
                    Encoding.UTF8,
                    "application/json"
                );
                return await client.PostAsync("/api/auth/validate", content);
            },
            iterations: 100
        );

        // Assert - Token validation should be very fast (no DB)
        Assert.True(result.PythonAvgMs < 50, "Python token validation should be < 50ms avg");
        Assert.True(result.DotnetAvgMs < 50, ".NET token validation should be < 50ms avg");
    }

    [Fact]
    public async Task Benchmark_GetAllForms()
    {
        var result = await RunBenchmark(
            "Get All Forms (Database Query)",
            client => client.GetAsync("/api/custom-forms"),
            iterations: 100
        );

        // Assert - Database queries should be fast
        Assert.True(result.PythonAvgMs < 150, "Python GetAllForms should be < 150ms avg");
        Assert.True(result.DotnetAvgMs < 150, ".NET GetAllForms should be < 150ms avg");
    }

    [Fact]
    public async Task Benchmark_ConcurrentRequests()
    {
        _output.WriteLine($"\n{'='*60}");
        _output.WriteLine("🏁 Benchmark: Concurrent Requests (Throughput Test)");
        _output.WriteLine($"{'='*60}");

        const int concurrentRequests = 50;
        const int totalRequests = 500;

        // Python throughput test
        _output.WriteLine($"\n🐍 Testing Python throughput ({totalRequests} requests, {concurrentRequests} concurrent)...");
        var pythonStopwatch = Stopwatch.StartNew();
        var pythonTasks = new List<Task<HttpResponseMessage>>();

        for (int i = 0; i < totalRequests; i++)
        {
            pythonTasks.Add(_pythonClient.GetAsync("/"));

            // Limit concurrent requests
            if (pythonTasks.Count >= concurrentRequests)
            {
                var completed = await Task.WhenAny(pythonTasks);
                pythonTasks.Remove(completed);
                completed.Result.Dispose();
            }
        }
        await Task.WhenAll(pythonTasks);
        pythonTasks.ForEach(t => t.Result.Dispose());
        pythonStopwatch.Stop();

        // .NET throughput test
        _output.WriteLine($"\n⚡ Testing .NET throughput ({totalRequests} requests, {concurrentRequests} concurrent)...");
        var dotnetStopwatch = Stopwatch.StartNew();
        var dotnetTasks = new List<Task<HttpResponseMessage>>();

        for (int i = 0; i < totalRequests; i++)
        {
            dotnetTasks.Add(_dotnetClient.GetAsync("/"));

            // Limit concurrent requests
            if (dotnetTasks.Count >= concurrentRequests)
            {
                var completed = await Task.WhenAny(dotnetTasks);
                dotnetTasks.Remove(completed);
                completed.Result.Dispose();
            }
        }
        await Task.WhenAll(dotnetTasks);
        dotnetTasks.ForEach(t => t.Result.Dispose());
        dotnetStopwatch.Stop();

        // Calculate throughput
        var pythonThroughput = totalRequests / (pythonStopwatch.ElapsedMilliseconds / 1000.0);
        var dotnetThroughput = totalRequests / (dotnetStopwatch.ElapsedMilliseconds / 1000.0);

        _output.WriteLine("\n📊 THROUGHPUT RESULTS:");
        _output.WriteLine($"\n   Python FastAPI:");
        _output.WriteLine($"   ├─ Total time:  {pythonStopwatch.ElapsedMilliseconds} ms");
        _output.WriteLine($"   └─ Throughput:  {pythonThroughput:F2} req/sec");

        _output.WriteLine($"\n   .NET Core:");
        _output.WriteLine($"   ├─ Total time:  {dotnetStopwatch.ElapsedMilliseconds} ms");
        _output.WriteLine($"   └─ Throughput:  {dotnetThroughput:F2} req/sec");

        var throughputDiff = ((dotnetThroughput - pythonThroughput) / pythonThroughput) * 100;
        var winner = dotnetThroughput > pythonThroughput ? ".NET" : "Python";

        _output.WriteLine($"\n   🏆 Winner: {winner} ({Math.Abs(throughputDiff):F1}% higher throughput)");

        // Assert - Both should handle load
        Assert.True(pythonThroughput > 10, "Python should handle > 10 req/sec");
        Assert.True(dotnetThroughput > 10, ".NET should handle > 10 req/sec");
    }

    #endregion
}

public class BenchmarkResult
{
    public string TestName { get; set; } = "";
    public int Iterations { get; set; }

    public double PythonAvgMs { get; set; }
    public long PythonMinMs { get; set; }
    public long PythonMaxMs { get; set; }
    public double PythonMedianMs { get; set; }
    public double PythonP95Ms { get; set; }
    public double PythonP99Ms { get; set; }

    public double DotnetAvgMs { get; set; }
    public long DotnetMinMs { get; set; }
    public long DotnetMaxMs { get; set; }
    public double DotnetMedianMs { get; set; }
    public double DotnetP95Ms { get; set; }
    public double DotnetP99Ms { get; set; }
}
