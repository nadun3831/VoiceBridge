using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using Serilog;
using VoiceBridge.AudioEngine.Effects;
using VoiceBridge.Core.Interfaces;
using VoiceBridge.Core.Models;

namespace VoiceBridge.Application.ViewModels;

public partial class MainViewModel : ObservableObject
{
    private readonly IAudioPipelineHost _pipelineHost;
    private readonly ILogger _logger;

    public DeviceSelectionViewModel Devices { get; }
    public PresetViewModel Presets { get; }
    public EffectControlViewModel Effects { get; }

    [ObservableProperty]
    private EngineState _engineState = EngineState.Stopped;

    [ObservableProperty]
    private string _engineButtonText = "Start Audio Engine";

    [ObservableProperty]
    private string _statusText = "Ready to start engine";

    [ObservableProperty]
    private float _inputPeakDb = -120f;

    [ObservableProperty]
    private float _outputPeakDb = -120f;

    [ObservableProperty]
    private bool _isBypassed = false;

    // Concrete effect instances attached to pipeline
    private readonly GainEffect _gainEffect = new();
    private readonly NoiseGateEffect _noiseGateEffect = new();
    private readonly PitchShiftEffect _pitchShiftEffect = new();
    private readonly DelayEffect _delayEffect = new();
    private readonly ReverbEffect _reverbEffect = new();

    public MainViewModel(
        IAudioPipelineHost pipelineHost,
        DeviceSelectionViewModel devicesViewModel,
        PresetViewModel presetViewModel,
        ILogger logger)
    {
        _pipelineHost = pipelineHost;
        Devices = devicesViewModel;
        Presets = presetViewModel;
        Effects = new EffectControlViewModel();
        _logger = logger;

        _pipelineHost.StateChanged += OnPipelineHostStateChanged;
        _pipelineHost.MeterUpdated += OnPipelineHostMeterUpdated;

        Presets.PresetApplied += OnPresetApplied;

        // Register default effects with pipeline
        _pipelineHost.AddEffect(_gainEffect);
        _pipelineHost.AddEffect(_noiseGateEffect);
        _pipelineHost.AddEffect(_pitchShiftEffect);
        _pipelineHost.AddEffect(_delayEffect);
        _pipelineHost.AddEffect(_reverbEffect);
    }

    [RelayCommand]
    public async Task ToggleEngineAsync()
    {
        if (EngineState == EngineState.Stopped)
        {
            string inId = Devices.SelectedInputDevice?.Id ?? string.Empty;
            string outId = Devices.SelectedOutputDevice?.Id ?? string.Empty;

            try
            {
                StatusText = "Starting audio engine...";
                await _pipelineHost.StartAsync(inId, outId);
                StatusText = "Engine running - Processing live audio";
            }
            catch (Exception ex)
            {
                _logger.Error(ex, "Error starting pipeline host");
                StatusText = $"Engine Error: {ex.Message}";
            }
        }
        else if (EngineState == EngineState.Running)
        {
            try
            {
                StatusText = "Stopping audio engine...";
                await _pipelineHost.StopAsync();
                StatusText = "Engine stopped";
            }
            catch (Exception ex)
            {
                _logger.Error(ex, "Error stopping pipeline host");
                StatusText = $"Stop Error: {ex.Message}";
            }
        }
    }

    [RelayCommand]
    public void ToggleBypass()
    {
        IsBypassed = !IsBypassed;
        _gainEffect.IsEnabled = !IsBypassed;
        _noiseGateEffect.IsEnabled = !IsBypassed;
        _pitchShiftEffect.IsEnabled = !IsBypassed;
        _delayEffect.IsEnabled = !IsBypassed;
        _reverbEffect.IsEnabled = !IsBypassed;

        StatusText = IsBypassed ? "All Effects Bypassed (Passthrough Mode)" : "Effects Active";
    }

    private void OnPresetApplied(object? sender, Preset preset)
    {
        _logger.Information("Applying Preset: {PresetName}", preset.Name);
        foreach (var effectCfg in preset.Effects)
        {
            switch (effectCfg.EffectId)
            {
                case "gain":
                    if (effectCfg.Parameters.TryGetValue("GainFactor", out float g)) _gainEffect.GainFactor = g;
                    _gainEffect.IsEnabled = effectCfg.IsEnabled;
                    break;
                case "noise_gate":
                    if (effectCfg.Parameters.TryGetValue("ThresholdDb", out float th)) _noiseGateEffect.ThresholdDb = th;
                    _noiseGateEffect.IsEnabled = effectCfg.IsEnabled;
                    break;
                case "pitch_shift":
                    if (effectCfg.Parameters.TryGetValue("Semitones", out float st)) _pitchShiftEffect.Semitones = st;
                    _pitchShiftEffect.IsEnabled = effectCfg.IsEnabled;
                    break;
                case "delay":
                    if (effectCfg.Parameters.TryGetValue("DelayMs", out float dMs)) _delayEffect.DelayMs = dMs;
                    if (effectCfg.Parameters.TryGetValue("Feedback", out float dFb)) _delayEffect.Feedback = dFb;
                    if (effectCfg.Parameters.TryGetValue("WetMix", out float dWet)) _delayEffect.WetMix = dWet;
                    _delayEffect.IsEnabled = effectCfg.IsEnabled;
                    break;
                case "reverb":
                    if (effectCfg.Parameters.TryGetValue("RoomSize", out float rSize)) _reverbEffect.RoomSize = rSize;
                    if (effectCfg.Parameters.TryGetValue("WetMix", out float rWet)) _reverbEffect.WetMix = rWet;
                    _reverbEffect.IsEnabled = effectCfg.IsEnabled;
                    break;
            }
        }
    }

    private void OnPipelineHostStateChanged(object? sender, EngineState state)
    {
        EngineState = state;
        EngineButtonText = state switch
        {
            EngineState.Running => "Stop Audio Engine",
            EngineState.Starting => "Starting...",
            EngineState.Stopping => "Stopping...",
            _ => "Start Audio Engine"
        };
    }

    private void OnPipelineHostMeterUpdated(object? sender, AudioMeterEventArgs e)
    {
        InputPeakDb = e.PeakInputDb;
        OutputPeakDb = e.PeakOutputDb;
    }
}
