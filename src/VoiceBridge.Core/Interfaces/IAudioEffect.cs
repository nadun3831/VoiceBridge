namespace VoiceBridge.Core.Interfaces;

/// <summary>
/// Core contract for real-time DSP audio effects.
/// Implementations MUST be lock-free and zero-allocation in ProcessBuffer to ensure sub-50ms latency.
/// </summary>
public interface IAudioEffect
{
    /// <summary>
    /// Unique identifier for the audio effect.
    /// </summary>
    string Id { get; }

    /// <summary>
    /// Display name of the effect.
    /// </summary>
    string Name { get; }

    /// <summary>
    /// Enables or disables processing for this effect.
    /// </summary>
    bool IsEnabled { get; set; }

    /// <summary>
    /// Processes IEEE 32-bit float PCM audio samples in-place.
    /// MUST be zero-allocation (no new float[] or object instantiations).
    /// </summary>
    /// <param name="buffer">Float buffer containing interleaved audio samples.</param>
    /// <param name="offset">Starting sample index.</param>
    /// <param name="count">Number of samples to process.</param>
    void ProcessBuffer(float[] buffer, int offset, int count);

    /// <summary>
    /// Resets internal effect buffers and DSP filter states (e.g. delay lines, filter history).
    /// </summary>
    void Reset();
}
