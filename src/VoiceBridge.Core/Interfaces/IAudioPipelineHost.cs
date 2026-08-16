using VoiceBridge.Core.Models;

namespace VoiceBridge.Core.Interfaces;

/// <summary>
/// Contract for controlling the audio capture, processing, and output pipeline.
/// </summary>
public interface IAudioPipelineHost
{
    /// <summary>
    /// Event fired when engine state transitions.
    /// </summary>
    event EventHandler<EngineState> StateChanged;

    /// <summary>
    /// Event fired with real-time peak audio meter levels for UI feedback.
    /// </summary>
    event EventHandler<AudioMeterEventArgs> MeterUpdated;

    /// <summary>
    /// Current state of the audio engine pipeline.
    /// </summary>
    EngineState CurrentState { get; }

    /// <summary>
    /// Gets or sets whether live audio feedback (monitoring back to output speakers) is enabled.
    /// </summary>
    bool IsFeedbackEnabled { get; set; }

    /// <summary>
    /// Starts capturing audio from the designated input device and routing through effects to output.
    /// </summary>
    Task StartAsync(string inputDeviceId, string outputDeviceId);

    /// <summary>
    /// Stops the audio processing pipeline cleanly.
    /// </summary>
    Task StopAsync();

    /// <summary>
    /// Adds an effect to the active processing chain.
    /// </summary>
    void AddEffect(IAudioEffect effect);

    /// <summary>
    /// Removes an effect from the processing chain.
    /// </summary>
    void RemoveEffect(string effectId);
}

public class AudioMeterEventArgs : EventArgs
{
    public float PeakInputDb { get; }
    public float PeakOutputDb { get; }

    public AudioMeterEventArgs(float peakInputDb, float peakOutputDb)
    {
        PeakInputDb = peakInputDb;
        PeakOutputDb = peakOutputDb;
    }
}
