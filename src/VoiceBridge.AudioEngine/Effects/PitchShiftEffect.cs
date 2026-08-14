namespace VoiceBridge.AudioEngine.Effects;

/// <summary>
/// Simple semitone pitch shift effect using a time-domain OLA (Overlap-Add) approximation.
/// This provides a lightweight pitch shift without the full WSOLA algorithm.
/// WSOLA will replace this in Phase 8 for production quality.
/// Pre-allocates all buffers to maintain zero-allocation in ProcessBufferCore.
/// </summary>
public sealed class PitchShiftEffect : AudioEffectBase
{
    public override string Id => "pitch_shift";
    public override string Name => "Pitch Shift";

    private float _semitones = 0f;    // -12 to +12
    private readonly float[] _grainBuffer;
    private readonly float[] _outputBuffer;

    private readonly int _grainSize;
    private readonly int _hopSize;
    private int _grainPos;
    private int _outputPos;
    private int _outputAvailable;

    public float Semitones
    {
        get => Volatile.Read(ref _semitones);
        set => Volatile.Write(ref _semitones, Math.Clamp(value, -12f, 12f));
    }

    public PitchShiftEffect(int sampleRate = 48000)
    {
        // Grain size: 20ms for decent quality pitch shifting
        _grainSize = (int)(sampleRate * 0.020);
        _hopSize = _grainSize / 2;
        _grainBuffer = new float[_grainSize];
        _outputBuffer = new float[_grainSize * 2];
        _grainPos = 0;
        _outputPos = 0;
        _outputAvailable = 0;
    }

    protected override void ProcessBufferCore(float[] buffer, int offset, int count)
    {
        float semitones = Volatile.Read(ref _semitones);

        // No pitch change — passthrough
        if (Math.Abs(semitones) < 0.01f) return;

        float pitchRatio = MathF.Pow(2f, semitones / 12f);

        int end = offset + count;
        for (int i = offset; i < end; i++)
        {
            // Fill grain buffer
            if (_grainPos < _grainSize)
            {
                _grainBuffer[_grainPos++] = buffer[i];
            }

            // Process grain when full
            if (_grainPos >= _grainSize)
            {
                ProcessGrain(_grainBuffer, pitchRatio);
                _grainPos = 0;
            }

            // Read from output buffer
            if (_outputAvailable > 0)
            {
                buffer[i] = _outputBuffer[_outputPos++ % _outputBuffer.Length];
                _outputAvailable--;
            }
            else
            {
                buffer[i] = 0f;
            }
        }
    }

    private void ProcessGrain(float[] grain, float pitchRatio)
    {
        // Resample grain by pitchRatio using linear interpolation
        int outputLen = Math.Min((int)(_grainSize / pitchRatio), _outputBuffer.Length);
        for (int i = 0; i < outputLen; i++)
        {
            float srcPos = i * pitchRatio;
            int srcIdx = (int)srcPos;
            float frac = srcPos - srcIdx;

            float s0 = srcIdx < _grainSize ? grain[srcIdx] : 0f;
            float s1 = (srcIdx + 1) < _grainSize ? grain[srcIdx + 1] : 0f;

            // Hann window for smooth grain overlap
            float window = 0.5f * (1f - MathF.Cos(2f * MathF.PI * i / outputLen));
            _outputBuffer[(_outputPos + i) % _outputBuffer.Length] = (s0 + frac * (s1 - s0)) * window;
        }
        _outputAvailable = Math.Min(_outputAvailable + outputLen, _outputBuffer.Length);
    }

    public override void Reset()
    {
        Array.Clear(_grainBuffer, 0, _grainBuffer.Length);
        Array.Clear(_outputBuffer, 0, _outputBuffer.Length);
        _grainPos = 0;
        _outputPos = 0;
        _outputAvailable = 0;
    }
}
