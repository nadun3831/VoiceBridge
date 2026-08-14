using VoiceBridge.AudioEngine.Effects;

namespace VoiceBridge.AudioEngine.Effects;

/// <summary>
/// Linear gain (volume) adjustment effect.
/// Multiplies each PCM sample by a gain factor.
/// The GainFactor is accessed via Volatile for thread-safe reads on the audio thread.
/// </summary>
public sealed class GainEffect : AudioEffectBase
{
    public override string Id => "gain";
    public override string Name => "Gain";

    // Stored as a float bit pattern in a long for Interlocked compatibility
    private float _gainFactor = 1.0f;

    /// <summary>
    /// Gain multiplier (0.0 = mute, 1.0 = unity, 2.0 = +6dB). Safe to set from UI thread.
    /// </summary>
    public float GainFactor
    {
        get => Volatile.Read(ref _gainFactor);
        set => Volatile.Write(ref _gainFactor, Math.Clamp(value, 0f, 4f));
    }

    protected override void ProcessBufferCore(float[] buffer, int offset, int count)
    {
        float gain = Volatile.Read(ref _gainFactor);
        if (Math.Abs(gain - 1.0f) < 0.0001f) return; // Unity gain — skip multiplication

        int end = offset + count;
        for (int i = offset; i < end; i++)
        {
            buffer[i] *= gain;
        }
    }

    public override void Reset() { /* No state to reset */ }
}
