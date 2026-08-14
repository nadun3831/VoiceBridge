using VoiceBridge.Core.Interfaces;

namespace VoiceBridge.AudioEngine.Effects;

/// <summary>
/// Abstract base class for all DSP audio effects.
/// Enforces the zero-allocation contract for ProcessBuffer implementations.
/// Parameter reads/writes use Interlocked or Volatile for thread-safety between
/// the UI thread (setting params) and the real-time audio thread (reading them).
/// </summary>
public abstract class AudioEffectBase : IAudioEffect
{
    private volatile int _isEnabled = 1; // 1 = enabled, 0 = disabled

    public abstract string Id { get; }
    public abstract string Name { get; }

    public bool IsEnabled
    {
        get => _isEnabled == 1;
        set => _isEnabled = value ? 1 : 0;
    }

    /// <summary>
    /// Processes audio samples in-place. Delegates to ProcessBufferCore only if enabled.
    /// Subclasses must NOT allocate heap objects inside ProcessBufferCore.
    /// </summary>
    public void ProcessBuffer(float[] buffer, int offset, int count)
    {
        if (!IsEnabled) return;
        ProcessBufferCore(buffer, offset, count);
    }

    protected abstract void ProcessBufferCore(float[] buffer, int offset, int count);

    public abstract void Reset();
}
