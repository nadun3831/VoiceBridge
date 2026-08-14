namespace VoiceBridge.AudioEngine.Effects;

/// <summary>
/// Noise Gate effect. Attenuates audio when signal level falls below a dB threshold.
/// Uses a simple ballistic attack/release envelope follower — all state is on the stack.
/// Zero-allocation in ProcessBufferCore.
/// </summary>
public sealed class NoiseGateEffect : AudioEffectBase
{
    public override string Id => "noise_gate";
    public override string Name => "Noise Gate";

    private float _thresholdDb = -40f;
    private float _attackMs = 5f;
    private float _releaseMs = 50f;
    private int _sampleRate = 48000;

    // Envelope follower state — only accessed on the audio thread, no volatile needed
    private float _envelopeDb = -120f;
    private float _gainDb = 0f;

    public float ThresholdDb
    {
        get => Volatile.Read(ref _thresholdDb);
        set => Volatile.Write(ref _thresholdDb, Math.Clamp(value, -80f, 0f));
    }

    public float AttackMs
    {
        get => Volatile.Read(ref _attackMs);
        set => Volatile.Write(ref _attackMs, Math.Max(0.1f, value));
    }

    public float ReleaseMs
    {
        get => Volatile.Read(ref _releaseMs);
        set => Volatile.Write(ref _releaseMs, Math.Max(1f, value));
    }

    public int SampleRate
    {
        get => _sampleRate;
        set => _sampleRate = value;
    }

    protected override void ProcessBufferCore(float[] buffer, int offset, int count)
    {
        float threshold = Volatile.Read(ref _thresholdDb);
        float attack = Volatile.Read(ref _attackMs);
        float release = Volatile.Read(ref _releaseMs);

        float attackCoeff = (float)Math.Exp(-1.0 / (_sampleRate * attack / 1000.0));
        float releaseCoeff = (float)Math.Exp(-1.0 / (_sampleRate * release / 1000.0));

        int end = offset + count;
        for (int i = offset; i < end; i++)
        {
            float sample = buffer[i];
            float absSample = Math.Abs(sample);

            // Convert to dB (clamp at -120 dB floor to avoid -infinity)
            float sampleDb = absSample > 1e-6f
                ? 20f * MathF.Log10(absSample)
                : -120f;

            // Envelope follower
            if (sampleDb > _envelopeDb)
                _envelopeDb = attackCoeff * _envelopeDb + (1f - attackCoeff) * sampleDb;
            else
                _envelopeDb = releaseCoeff * _envelopeDb + (1f - releaseCoeff) * sampleDb;

            // Gate open/close
            float targetGainDb = _envelopeDb >= threshold ? 0f : -120f;
            _gainDb = _gainDb + (targetGainDb - _gainDb) * (targetGainDb > _gainDb ? (1f - attackCoeff) : (1f - releaseCoeff));

            // Apply gate gain
            float gainLinear = _gainDb <= -119f ? 0f : (float)Math.Pow(10.0, _gainDb / 20.0);
            buffer[i] = sample * gainLinear;
        }
    }

    public override void Reset()
    {
        _envelopeDb = -120f;
        _gainDb = 0f;
    }
}
