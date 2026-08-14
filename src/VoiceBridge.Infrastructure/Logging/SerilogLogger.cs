using Serilog;

namespace VoiceBridge.Infrastructure.Logging;

/// <summary>
/// Infrastructure helper to configure Serilog logger sinks for console and file output.
/// </summary>
public static class SerilogLogger
{
    public static ILogger CreateLogger()
    {
        return new LoggerConfiguration()
            .MinimumLevel.Information()
            .WriteTo.Console()
            .WriteTo.File(
                path: "logs/voicebridge-.log",
                rollingInterval: RollingInterval.Day,
                outputTemplate: "{Timestamp:yyyy-MM-dd HH:mm:ss.fff zzz} [{Level:u3}] {Message:lj}{NewLine}{Exception}")
            .CreateLogger();
    }
}
