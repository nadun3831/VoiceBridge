namespace VoiceBridge.AudioEngine.Effects;

/// <summary>
/// High-quality pitch shift effect using WSOLA (Waveform Similarity Overlap-Add).
/// WSOLA finds the best-matching overlap position between grains, dramatically reducing
/// the robotic artifacts of basic OLA. Result: natural, human-sounding pitch transformation.
///
/// Algorithm Overview:
///   1. Divide input into overlapping analysis frames.
///   2. For each frame, find the synthesis position that maximises cross-correlation
///      (i.e., the position in the output buffer that looks most like the start of the frame).
///   3. Apply a Hann window and overlap-add into the output ring buffer.
///   4. Read back at a rate determined by the pitch ratio.
/// </summary>
public sealed class PitchShiftEffect : AudioEffectBase
{
    public override string Id   => "pitch_shift";
    public override string Name => "Pitch Shift (WSOLA)";

    // ── Tunable constants ────────────────────────────────────────────────────
    private const int    SampleRate       = 48_000;
    private const int    FrameMs          = 40;                          // analysis frame length
    private const int    HopMs            = 10;                          // synthesis hop
    private const int    MaxSearchMs      = 14;                          // WSOLA search range (±)
    private const float  MinDb            = -120f;

    private static readonly int FrameSize  = (int)(SampleRate * FrameMs  / 1000.0);  // 1920
    private static readonly int HopSize    = (int)(SampleRate * HopMs    / 1000.0);  // 480
    private static readonly int SearchWin  = (int)(SampleRate * MaxSearchMs / 1000.0); // 672

    // ── Pre-computed Hann window ─────────────────────────────────────────────
    private static readonly float[] HannWindow = BuildHann(FrameSize);

    // ── Per-instance state ───────────────────────────────────────────────────
    private float _semitones;

    // Input ring buffer (stores recent raw samples for analysis framing)
    private readonly float[] _inRing;
    private int  _inWritePos;
    private long _inTotalWritten;

    // Output ring buffer (stores WSOLA-synthesised samples)
    private readonly float[] _outRing;
    private int  _outWritePos;
    private long _outReadPos;
    private long _outTotalWritten;

    // Scratch buffers – pre-allocated, zero-alloc on hot path
    private readonly float[] _frame          = new float[FrameSize];
    private readonly float[] _prevFrame      = new float[FrameSize];
    private bool _hasPrevFrame;

    // How many output samples still owed since the last ProcessBuffer call
    private double _synthPhase;   // fractional position in input ring (samples)
    private double _readPhase;    // fractional position in output ring for consumer reads

    // ── Constructor / helpers ────────────────────────────────────────────────
    public PitchShiftEffect()
    {
        // Ring buffer = 3 × FrameSize gives plenty of headroom
        _inRing  = new float[FrameSize * 3];
        _outRing = new float[FrameSize * 3];
    }

    public float Semitones
    {
        get => Volatile.Read(ref _semitones);
        set => Volatile.Write(ref _semitones, Math.Clamp(value, -12f, 12f));
    }

    private volatile bool _resetRequested = false;

    // ── Core DSP ─────────────────────────────────────────────────────────────
    protected override void ProcessBufferCore(float[] buffer, int offset, int count)
    {
        if (_resetRequested)
        {
            ResetInternalState();
            _resetRequested = false;
        }

        float semitones = Volatile.Read(ref _semitones);
        if (Math.Abs(semitones) < 0.03f) return;   // passthrough

        double pitchRatio = Math.Pow(2.0, semitones / 12.0);

        // 1. Write incoming samples into input ring
        for (int i = 0; i < count; i++)
        {
            float val = buffer[offset + i];
            if (float.IsNaN(val) || float.IsInfinity(val)) val = 0f;
            _inRing[_inWritePos] = val;
            _inWritePos          = (_inWritePos + 1) % _inRing.Length;
            _inTotalWritten++;
        }

        // 2. WSOLA synthesis loop – produce output samples proportional to input
        double inputHop = HopSize / pitchRatio;   // how far to advance in input per output hop

        // Synthesise as long as we have enough input (limit max 16 iterations per buffer to prevent hanging)
        int iterations = 0;
        while ((_synthPhase + FrameSize / 2 + SearchWin) <= _inTotalWritten && iterations < 16)
        {
            iterations++;
            long analysisCenter = (long)_synthPhase;
            long analysisStart  = analysisCenter - FrameSize / 2;

            ReadFromInRing(analysisStart, _frame, FrameSize);

            // --- WSOLA: find best overlap position (cross-correlation) ---
            int bestOffset = 0;
            if (_hasPrevFrame)
            {
                bestOffset = FindBestOverlap(_prevFrame, _frame);
            }

            // Shift analysis frame by bestOffset so it overlaps well with previous
            if (bestOffset != 0)
            {
                long shifted = analysisStart + bestOffset;
                if (shifted >= 0 && shifted + FrameSize <= _inTotalWritten)
                {
                    ReadFromInRing(shifted, _frame, FrameSize);
                    _synthPhase += bestOffset;
                }
            }

            // --- Apply Hann window and overlap-add into output ring ---
            OverlapAdd(_frame, _outRing, _outWritePos, FrameSize);
            Array.Copy(_frame, _prevFrame, FrameSize);
            _hasPrevFrame = true;

            // Advance output write pointer by HopSize
            _outWritePos     = (int)((_outWritePos + HopSize) % _outRing.Length);
            _outTotalWritten += HopSize;

            // Advance input analysis pointer by inputHop
            _synthPhase += inputHop;
        }

        // 3. Read `count` samples from output ring into buffer
        for (int i = 0; i < count; i++)
        {
            if (_readPhase < _outTotalWritten)
            {
                long ringIdx = (long)_readPhase % _outRing.Length;
                if (ringIdx < 0) ringIdx += _outRing.Length;
                float val = _outRing[ringIdx];
                if (float.IsNaN(val) || float.IsInfinity(val)) val = 0f;
                buffer[offset + i] = val;
                _outRing[ringIdx] = 0f; // CRITICAL: Clear sample for next overlap-add cycle
                _readPhase++;
            }
            else
            {
                buffer[offset + i] = 0f; // Silence if output buffer starved (algorithmic latency)
            }
        }
    }

    // ── WSOLA: cross-correlation search ─────────────────────────────────────
    /// <summary>
    /// Finds offset in [-SearchWin, +SearchWin] that maximises overlap similarity
    /// between the tail of the previous frame and the head of the candidate frame.
    /// Uses simplified normalised cross-correlation over the overlap region.
    /// </summary>
    private int FindBestOverlap(float[] prevFrame, float[] candidateFrame)
    {
        // The overlap region length is FrameSize - HopSize (e.g. 1920 - 480 = 1440)
        int cmpLen = FrameSize - HopSize;

        double bestCorr   = double.MinValue;
        int    bestOffset = 0;

        for (int delta = -SearchWin; delta <= SearchWin; delta += 4)   // step=4 for speed/accuracy balance
        {
            double corr = 0.0;
            double norm = 1e-9;

            for (int k = 0; k < cmpLen; k += 2) // skip every other sample for performance
            {
                int idxCandidate = k + delta;
                if (idxCandidate < 0 || idxCandidate >= FrameSize) continue;

                // Compare the overlap region of the previous frame with the candidate frame
                float a = prevFrame[HopSize + k];
                float b = candidateFrame[idxCandidate];
                corr += a * b;
                norm += b * b;
            }

            double normCorr = corr / Math.Sqrt(norm);
            if (normCorr > bestCorr)
            {
                bestCorr   = normCorr;
                bestOffset = delta;
            }
        }
        return bestOffset;
    }

    // ── Ring-buffer helpers ──────────────────────────────────────────────────
    private void ReadFromInRing(long startSample, float[] dest, int len)
    {
        for (int i = 0; i < len; i++)
        {
            long idx = (startSample + i) % _inRing.Length;
            if (idx < 0) idx += _inRing.Length;
            dest[i] = _inRing[idx];
        }
    }

    private static void OverlapAdd(float[] frame, float[] ring, int ringStart, int len)
    {
        for (int i = 0; i < len; i++)
        {
            int idx = (ringStart + i) % ring.Length;
            ring[idx] += frame[i] * HannWindow[i];
        }
    }

    // ── Hann window ──────────────────────────────────────────────────────────
    private static float[] BuildHann(int size)
    {
        var w = new float[size];
        // For a 75% overlap (HopSize = FrameSize / 4), standard Hann windows sum to 2.0.
        // We multiply by 0.5f to normalize the overlap sum to 1.0, preventing clipping/volume doubling!
        float overlapScale = 0.5f; 
        for (int i = 0; i < size; i++)
            w[i] = overlapScale * 0.5f * (1f - MathF.Cos(2f * MathF.PI * i / (size - 1)));
        return w;
    }

    private void ResetInternalState()
    {
        Array.Clear(_inRing,    0, _inRing.Length);
        Array.Clear(_outRing,   0, _outRing.Length);
        Array.Clear(_frame,     0, _frame.Length);
        Array.Clear(_prevFrame, 0, _prevFrame.Length);
        _inWritePos      = 0;
        _inTotalWritten  = 0;
        _outWritePos     = 0;
        _outReadPos      = 0;
        _outTotalWritten = 0;
        _synthPhase      = FrameSize / 2.0;
        _readPhase       = 0;
        _hasPrevFrame    = false;
    }

    // ── IAudioEffect ─────────────────────────────────────────────────────────
    public override void Reset()
    {
        _resetRequested = true;
    }
}
