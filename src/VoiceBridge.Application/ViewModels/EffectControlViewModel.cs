using CommunityToolkit.Mvvm.ComponentModel;

namespace VoiceBridge.Application.ViewModels;

public partial class EffectControlViewModel : ObservableObject
{
    [ObservableProperty]
    private string _id = string.Empty;

    [ObservableProperty]
    private string _name = string.Empty;

    [ObservableProperty]
    private bool _isEnabled = true;

    // Gain
    [ObservableProperty]
    private float _gainFactor = 1.0f;

    // Noise Gate
    [ObservableProperty]
    private float _gateThresholdDb = -45.0f;

    // Pitch Shift
    [ObservableProperty]
    private float _pitchSemitones = 0.0f;

    // Delay
    [ObservableProperty]
    private float _delayMs = 200.0f;

    [ObservableProperty]
    private float _delayFeedback = 0.4f;

    [ObservableProperty]
    private float _delayWetMix = 0.4f;

    // Reverb
    [ObservableProperty]
    private float _reverbRoomSize = 0.5f;

    [ObservableProperty]
    private float _reverbWetMix = 0.3f;
}
