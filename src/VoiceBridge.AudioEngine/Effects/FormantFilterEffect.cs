using VoiceBridge.AudioEngine.Effects;

namespace VoiceBridge.AudioEngine.Effects;

/// <summary>
/// Immutable container for Biquad filter coefficients.
/// Allows lock-free, atomic reference swapping on the hot audio path.
/// </summary>
internal sealed class BiquadCoeffs
{
    public float B0 { get; }
    public float B1 { get; }
    public float B2 { get; }
    public float A1 { get; }
    public float A2 { get; }

    public BiquadCoeffs(float b0, float b1, float b2, float a1, float a2)
    {
        B0 = b0; B1 = b1; B2 = b2; A1 = a1; A2 = a2;
    }
}

/// <summary>
/// Professional Formant-Shaping Biquad Equalizer Filter.
/// Specifically engineered to reshape vocal tract characteristics from male to female.
/// Lock-free, zero-allocation, 100% thread-safe real-time processing.
/// </summary>
public sealed class FormantFilterEffect : AudioEffectBase
{
    public override string Id => "formant_filter";
    public override string Name => "Formant & Vocal Tract Shaping";

    private const int SampleRate = 48000;

    private float _highPassCutoff = 175.0f;
    private float _formantPresenceGainDb = 4.0f;
    private float _formantWarmthGainDb = 2.5f;

    private volatile bool _resetRequested = false;

    // Lock-free double-buffered Biquad coefficients
    private BiquadCoeffs _hpfCoeffs = new(1f, 0f, 0f, 0f, 0f);
    private BiquadCoeffs _pk1Coeffs = new(1f, 0f, 0f, 0f, 0f);
    private BiquadCoeffs _pk2Coeffs = new(1f, 0f, 0f, 0f, 0f);

    // Filter memory state (accessed ONLY by audio thread)
    private float _hpf_x1, _hpf_x2, _hpf_y1, _hpf_y2;
    private float _pk1_x1, _pk1_x2, _pk1_y1, _pk1_y2;
    private float _pk2_x1, _pk2_x2, _pk2_y1, _pk2_y2;

    public float HighPassCutoff
    {
        get => Volatile.Read(ref _highPassCutoff);
        set
        {
            float clamped = Math.Clamp(value, 20.0f, 500.0f);
            Volatile.Write(ref _highPassCutoff, clamped);
            RecalculateCoefficients();
        }
    }

    public float FormantPresenceGainDb
    {
        get => Volatile.Read(ref _formantPresenceGainDb);
        set
        {
            float clamped = Math.Clamp(value, -12.0f, 12.0f);
            Volatile.Write(ref _formantPresenceGainDb, clamped);
            RecalculateCoefficients();
        }
    }

    public float FormantWarmthGainDb
    {
        get => Volatile.Read(ref _formantWarmthGainDb);
        set
        {
            float clamped = Math.Clamp(value, -12.0f, 12.0f);
            Volatile.Write(ref _formantWarmthGainDb, clamped);
            RecalculateCoefficients();
        }
    }

    public FormantFilterEffect()
    {
        RecalculateCoefficients();
    }

    private void RecalculateCoefficients()
    {
        // 1. High Pass Filter (RBJ Cookbook)
        float fc = Volatile.Read(ref _highPassCutoff);
        float w0 = 2.0f * MathF.PI * fc / SampleRate;
        float cosW0 = MathF.Cos(w0);
        float sinW0 = MathF.Sin(w0);
        float alpha = sinW0 / (2.0f * 0.707f); // Q = 0.707 (Butterworth)

        float a0 = 1.0f + alpha;
        var newHpf = new BiquadCoeffs(
            b0: ((1.0f + cosW0) / 2.0f) / a0,
            b1: -(1.0f + cosW0) / a0,
            b2: ((1.0f + cosW0) / 2.0f) / a0,
            a1: (-2.0f * cosW0) / a0,
            a2: (1.0f - alpha) / a0
        );

        // 2. High Mid Formant Peaking Filter (3200 Hz, Q = 1.4)
        var newPk1 = ComputePeakingCoefficients(3200.0f, Volatile.Read(ref _formantPresenceGainDb), 1.4f);

        // 3. Low Mid Formant Peaking Filter (1100 Hz, Q = 1.2)
        var newPk2 = ComputePeakingCoefficients(1100.0f, Volatile.Read(ref _formantWarmthGainDb), 1.2f);

        // Atomic swap of coefficient references
        Volatile.Write(ref _hpfCoeffs, newHpf);
        Volatile.Write(ref _pk1Coeffs, newPk1);
        Volatile.Write(ref _pk2Coeffs, newPk2);
    }

    private static BiquadCoeffs ComputePeakingCoefficients(float freq, float gainDb, float q)
    {
        float A = MathF.Pow(10.0f, gainDb / 40.0f);
        float w0 = 2.0f * MathF.PI * freq / SampleRate;
        float alpha = MathF.Sin(w0) / (2.0f * q);
        float cosW0 = MathF.Cos(w0);

        float normA0 = 1.0f + alpha / A;
        return new BiquadCoeffs(
            b0: (1.0f + alpha * A) / normA0,
            b1: (-2.0f * cosW0) / normA0,
            b2: (1.0f - alpha * A) / normA0,
            a1: (-2.0f * cosW0) / normA0,
            a2: (1.0f - alpha / A) / normA0
        );
    }

    protected override void ProcessBufferCore(float[] buffer, int offset, int count)
    {
        if (_resetRequested)
        {
            ResetInternalState();
            _resetRequested = false;
        }

        // Lock-free read of current active coefficient references
        var hpf = Volatile.Read(ref _hpfCoeffs);
        var pk1 = Volatile.Read(ref _pk1Coeffs);
        var pk2 = Volatile.Read(ref _pk2Coeffs);

        int end = offset + count;
        for (int i = offset; i < end; i++)
        {
            float input = buffer[i];
            if (float.IsNaN(input) || float.IsInfinity(input)) input = 0f;

            // Step 1: HPF (Remove male chest rumble below cutoff)
            float hpf_out = hpf.B0 * input + hpf.B1 * _hpf_x1 + hpf.B2 * _hpf_x2
                          - hpf.A1 * _hpf_y1 - hpf.A2 * _hpf_y2;
            if (float.IsNaN(hpf_out) || float.IsInfinity(hpf_out)) { hpf_out = 0f; ResetInternalState(); }

            _hpf_x2 = _hpf_x1;
            _hpf_x1 = input;
            _hpf_y2 = _hpf_y1;
            _hpf_y1 = hpf_out;

            // Step 2: High Mid Formant Peaking Filter (3.2 kHz)
            float pk1_out = pk1.B0 * hpf_out + pk1.B1 * _pk1_x1 + pk1.B2 * _pk1_x2
                          - pk1.A1 * _pk1_y1 - pk1.A2 * _pk1_y2;
            if (float.IsNaN(pk1_out) || float.IsInfinity(pk1_out)) { pk1_out = 0f; ResetInternalState(); }

            _pk1_x2 = _pk1_x1;
            _pk1_x1 = hpf_out;
            _pk1_y2 = _pk1_y1;
            _pk1_y1 = pk1_out;

            // Step 3: Low Mid Formant Peaking Filter (1.1 kHz)
            float pk2_out = pk2.B0 * pk1_out + pk2.B1 * _pk2_x1 + pk2.B2 * _pk2_x2
                          - pk2.A1 * _pk2_y1 - pk2.A2 * _pk2_y2;
            if (float.IsNaN(pk2_out) || float.IsInfinity(pk2_out)) { pk2_out = 0f; ResetInternalState(); }

            _pk2_x2 = _pk2_x1;
            _pk2_x1 = pk1_out;
            _pk2_y2 = _pk2_y1;
            _pk2_y1 = pk2_out;

            buffer[i] = pk2_out;
        }
    }

    private void ResetInternalState()
    {
        _hpf_x1 = _hpf_x2 = _hpf_y1 = _hpf_y2 = 0f;
        _pk1_x1 = _pk1_x2 = _pk1_y1 = _pk1_y2 = 0f;
        _pk2_x1 = _pk2_x2 = _pk2_y1 = _pk2_y2 = 0f;
    }

    public override void Reset()
    {
        _resetRequested = true;
    }
}
