namespace VoiceBridge.AudioEngine.Effects;

/// <summary>
/// Simple stereo delay / echo effect with configurable delay time and wet/dry mix.
/// Uses a pre-allocated circular delay line — zero allocations in ProcessBufferCore.
/// </summary>
public sealed class DelayEffect : AudioEffectBase
{
    public override string Id => "delay";
    public override string Name => "Delay";

    private readonly float[] _delayLine;
    private readonly int _maxDelaySamples;
    private int _writePos;

    private float _delayMs = 200f;
    private float _feedback = 0.4f;
    private float _wetMix = 0.5f;
    private int _sampleRate = 48000;

    public float DelayMs
    {
        get => Volatile.Read(ref _delayMs);
        set => Volatile.Write(ref _delayMs, Math.Clamp(value, 10f, 1000f));
    }

    public float Feedback
    {
        get => Volatile.Read(ref _feedback);
        set => Volatile.Write(ref _feedback, Math.Clamp(value, 0f, 0.95f));
    }

    public float WetMix
    {
        get => Volatile.Read(ref _wetMix);
        set => Volatile.Write(ref _wetMix, Math.Clamp(value, 0f, 1f));
    }

    public int SampleRate
    {
        get => _sampleRate;
        set => _sampleRate = value;
    }

    public DelayEffect(int maxDelayMs = 1000, int sampleRate = 48000)
    {
        _sampleRate = sampleRate;
        _maxDelaySamples = (int)(sampleRate * maxDelayMs / 1000f) + 1;
        _delayLine = new float[_maxDelaySamples];
        _writePos = 0;
    }

    protected override void ProcessBufferCore(float[] buffer, int offset, int count)
    {
        int delaySamples = (int)(_sampleRate * Volatile.Read(ref _delayMs) / 1000f);
        delaySamples = Math.Clamp(delaySamples, 1, _maxDelaySamples - 1);

        float fb = Volatile.Read(ref _feedback);
        float wet = Volatile.Read(ref _wetMix);
        float dry = 1f - wet;

        int end = offset + count;
        for (int i = offset; i < end; i++)
        {
            int readPos = (_writePos - delaySamples + _maxDelaySamples) % _maxDelaySamples;
            float delayedSample = _delayLine[readPos];

            float inputSample = buffer[i];
            _delayLine[_writePos] = inputSample + delayedSample * fb;
            _writePos = (_writePos + 1) % _maxDelaySamples;

            buffer[i] = inputSample * dry + delayedSample * wet;
        }
    }

    public override void Reset()
    {
        Array.Clear(_delayLine, 0, _delayLine.Length);
        _writePos = 0;
    }
}
