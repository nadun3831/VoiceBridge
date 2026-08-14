using System.IO;
using System.Windows;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Serilog;
using VoiceBridge.Application.Services;
using VoiceBridge.Application.ViewModels;
using VoiceBridge.AudioEngine.Pipeline;
using VoiceBridge.AudioEngine.Services;
using VoiceBridge.Core.Interfaces;
using VoiceBridge.Infrastructure.Logging;

namespace VoiceBridge.UI;

/// <summary>
/// Application entry point and DI host setup.
/// </summary>
public partial class App : System.Windows.Application
{
    public static IServiceProvider ServiceProvider { get; private set; } = null!;
    public static IConfiguration Configuration { get; private set; } = null!;

    protected override void OnStartup(StartupEventArgs e)
    {
        base.OnStartup(e);

        // 1. Initialize Serilog
        Log.Logger = SerilogLogger.CreateLogger();
        Log.Information("VoiceBridge Desktop Application Starting Up...");

        // 2. Build Configuration
        var builder = new ConfigurationBuilder()
            .SetBasePath(Directory.GetCurrentDirectory())
            .AddJsonFile("appsettings.json", optional: true, reloadOnChange: true);

        Configuration = builder.Build();

        // 3. Configure DI Container
        var serviceCollection = new ServiceCollection();
        ConfigureServices(serviceCollection);

        ServiceProvider = serviceCollection.BuildServiceProvider();

        Log.Information("VoiceBridge DI Container built successfully.");

        // 4. Launch MainWindow
        var mainWindow = ServiceProvider.GetRequiredService<MainWindow>();
        mainWindow.Show();
    }

    private void ConfigureServices(IServiceCollection services)
    {
        services.AddSingleton(Configuration);
        services.AddSingleton(Log.Logger);

        // Core & Audio Engine Services
        services.AddSingleton<IAudioDeviceService, WasapiDeviceService>();
        services.AddSingleton<IAudioPipelineHost, WasapiPipelineHost>();
        services.AddSingleton<IPresetRepository, JsonPresetRepository>();

        // ViewModels
        services.AddSingleton<DeviceSelectionViewModel>();
        services.AddSingleton<PresetViewModel>();
        services.AddSingleton<MainViewModel>();

        // Views
        services.AddSingleton<MainWindow>();
    }

    protected override void OnExit(ExitEventArgs e)
    {
        Log.Information("VoiceBridge Application Exiting cleanly.");
        Log.CloseAndFlush();
        base.OnExit(e);
    }
}
