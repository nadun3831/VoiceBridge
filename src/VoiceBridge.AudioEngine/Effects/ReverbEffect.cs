namespace VoiceBridge.AudioEngine.Effects;

/// <summary>
/// Simple Schroeder-style reverb using four parallel comb filters + two allpass filters.
/// All delay lines are pre-allocated. Zero allocations in ProcessBufferCore.
/// </summary>
public sealed class ReverbEffect : AudioEffectBase
{
    public override string Id => "reverb";
    public override string Name => "Reverb";

    // Schroeder comb filter delay lengths in samples (tuned for 48kHz)
    private static readonly int[] CombDelays = [1557, 1617, 1491, 1422];
    // Allpass delay lengths in samples
    private static readonly int[] AllpassDelays = [225, 556];

    private readonly float[][] _combBuffers;
    private readonly int[] _combWritePos;
    private readonly float[] _combFeedback;

    private readonly float[][] _allpassBuffers;
    private readonly int[] _allpassWritePos;

    private float _roomSize = 0.5f;
    private float _wetMix = 0.3f;
    private float _damping = 0.5f;

    // Comb filter state for damping
    private readonly float[] _combDampState;

    public float RoomSize
    {
        get => Volatile.Read(ref _roomSize);
        set => Volatile.Write(ref _roomSize, Math.Clamp(value, 0f, 1f));
    }

    public float WetMix
    {
        get => Volatile.Read(ref _wetMix);
        set => Volatile.Write(ref _wetMix, Math.Clamp(value, 0f, 1f));
    }

    public float Damping
    {
        get => Volatile.Read(ref _damping);
        set => Volatile.Write(ref _damping, Math.Clamp(value, 0f, 1f));
    }

    public ReverbEffect()
    {
        _combBuffers = new float[CombDelays.Length][];
        _combWritePos = new int[CombDelays.Length];
        _combFeedback = new float[CombDelays.Length];
        _combDampState = new float[CombDelays.Length];
        for (int i = 0; i < CombDelays.Length; i++)
        {
            _combBuffers[i] = new float[CombDelays[i]];
            _combFeedback[i] = 0.84f;
        }

        _allpassBuffers = new float[AllpassDelays.Length][];
        _allpassWritePos = new int[AllpassDelays.Length];
        for (int i = 0; i < AllpassDelays.Length; i++)
        {
            _allpassBuffers[i] = new float[AllpassDelays[i]];
        }
    }

    protected override void ProcessBufferCore(float[] buffer, int offset, int count)
    {
        float room = Volatile.Read(ref _roomSize);
        float wet = Volatile.Read(ref _wetMix);
        float dry = 1f - wet;
        float damp = Volatile.Read(ref _damping);

        int end = offset + count;
        for (int i = offset; i < end; i++)
        {
            float input = buffer[i];
            float reverbOut = 0f;

            // Parallel comb filters
            for (int c = 0; c < CombDelays.Length; c++)
            {
                int rPos = (_combWritePos[c] + 1) % CombDelays[c];
                float delayed = _combBuffers[c][rPos];

                // Low-pass damping inside comb feedback
                _combDampState[c] = delayed * (1f - damp) + _combDampState[c] * damp;
                _combBuffers[c][_combWritePos[c]] = input + _combDampState[c] * (_combFeedback[c] + room * 0.14f);
                _combWritePos[c] = (_combWritePos[c] + 1) % CombDelays[c];
                reverbOut += delayed;
            }

            // Series allpass filters
            for (int a = 0; a < AllpassDelays.Length; a++)
            {
                int rPos = (_allpassWritePos[a] + 1) % AllpassDelays[a];
                float delayed = _allpassBuffers[a][rPos];
                _allpassBuffers[a][_allpassWritePos[a]] = reverbOut + delayed * 0.5f;
                _allpassWritePos[a] = (_allpassWritePos[a] + 1) % AllpassDelays[a];
                reverbOut = delayed - reverbOut;
            }

            buffer[i] = input * dry + (reverbOut / CombDelays.Length) * wet;
        }
    }

    public override void Reset()
    {
        for (int i = 0; i < CombDelays.Length; i++)
        {
            Array.Clear(_combBuffers[i], 0, _combBuffers[i].Length);
            _combWritePos[i] = 0;
            _combDampState[i] = 0f;
        }
        for (int i = 0; i < AllpassDelays.Length; i++)
        {
            Array.Clear(_allpassBuffers[i], 0, _allpassBuffers[i].Length);
            _allpassWritePos[i] = 0;
        }
    }
}
