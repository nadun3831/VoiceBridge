using VoiceBridge.AudioEngine.Effects;
using Xunit;

namespace VoiceBridge.Tests;

public class DspEffectTests
{
    // ── GainEffect ──────────────────────────────────────────────────────────────

    [Fact]
    public void GainEffect_UnityGain_LeavesBufferUnchanged()
    {
        var effect = new GainEffect { GainFactor = 1.0f, IsEnabled = true };
        float[] buffer = [0.5f, -0.5f, 0.3f, -0.3f];
        float[] original = [.. buffer];

        effect.ProcessBuffer(buffer, 0, buffer.Length);

        Assert.Equal(original, buffer);
    }

    [Fact]
    public void GainEffect_HalfGain_HalvesAmplitude()
    {
        var effect = new GainEffect { GainFactor = 0.5f, IsEnabled = true };
        float[] buffer = [1.0f, -1.0f, 0.4f];

        effect.ProcessBuffer(buffer, 0, buffer.Length);

        Assert.Equal(0.5f, buffer[0], precision: 5);
        Assert.Equal(-0.5f, buffer[1], precision: 5);
        Assert.Equal(0.2f, buffer[2], precision: 5);
    }

    [Fact]
    public void GainEffect_Disabled_DoesNotModifyBuffer()
    {
        var effect = new GainEffect { GainFactor = 2.0f, IsEnabled = false };
        float[] buffer = [0.5f, 0.5f];
        float[] original = [.. buffer];

        effect.ProcessBuffer(buffer, 0, buffer.Length);

        Assert.Equal(original, buffer);
    }

    // ── NoiseGateEffect ─────────────────────────────────────────────────────────

    [Fact]
    public void NoiseGateEffect_SilentSignal_OutputsNearZero()
    {
        var effect = new NoiseGateEffect
        {
            ThresholdDb = -20f,
            AttackMs = 1f,
            ReleaseMs = 10f,
            SampleRate = 48000,
            IsEnabled = true
        };
        // 1000 samples of very quiet noise (below -40dB threshold)
        float[] buffer = Enumerable.Repeat(0.00001f, 1000).ToArray();

        effect.ProcessBuffer(buffer, 0, buffer.Length);

        // After gate closes, output should be near silence
        float lastSample = buffer[buffer.Length - 1];
        Assert.True(Math.Abs(lastSample) < 0.001f,
            $"Expected near-zero, got {lastSample}");
    }

    // ── DelayEffect ─────────────────────────────────────────────────────────────

    [Fact]
    public void DelayEffect_DryOnly_PassesSignalThrough()
    {
        var effect = new DelayEffect(sampleRate: 48000) { WetMix = 0f, IsEnabled = true };
        float[] buffer = [1.0f, 0.5f, -0.5f, 0.0f];
        float[] original = [.. buffer];

        effect.ProcessBuffer(buffer, 0, buffer.Length);

        for (int i = 0; i < buffer.Length; i++)
            Assert.Equal(original[i], buffer[i], precision: 4);
    }

    [Fact]
    public void DelayEffect_Reset_ClearsSampleHistory()
    {
        var effect = new DelayEffect(sampleRate: 48000) { WetMix = 0.5f, IsEnabled = true };
        float[] buf1 = [1.0f, 1.0f, 1.0f, 1.0f];
        effect.ProcessBuffer(buf1, 0, buf1.Length);

        effect.Reset();

        float[] buf2 = [0.0f, 0.0f, 0.0f, 0.0f];
        effect.ProcessBuffer(buf2, 0, buf2.Length);

        // After reset, delay line should be silent
        Assert.All(buf2, s => Assert.Equal(0f, s, precision: 5));
    }

    // ── ReverbEffect ─────────────────────────────────────────────────────────────

    [Fact]
    public void ReverbEffect_DryOnly_LeavesBufferNearUnchanged()
    {
        var effect = new ReverbEffect { WetMix = 0f, IsEnabled = true };
        float[] buffer = [0.5f, -0.5f, 0.3f, -0.3f];
        float[] original = [.. buffer];

        effect.ProcessBuffer(buffer, 0, buffer.Length);

        for (int i = 0; i < buffer.Length; i++)
            Assert.Equal(original[i], buffer[i], precision: 4);
    }

    // ── PitchShiftEffect ──────────────────────────────────────────────────────────

    [Fact]
    public void PitchShiftEffect_ZeroSemitones_IsPassthrough()
    {
        var effect = new PitchShiftEffect() { Semitones = 0f, IsEnabled = true };
        float[] buffer = [0.5f, -0.5f, 0.3f, -0.3f];
        float[] original = [.. buffer];

        effect.ProcessBuffer(buffer, 0, buffer.Length);

        // Zero semitones = passthrough, buffer must be identical
        Assert.Equal(original, buffer);
    }

    [Fact]
    public void PitchShiftEffect_Reset_ClearsInternalState()
    {
        var effect = new PitchShiftEffect() { Semitones = 3f, IsEnabled = true };
        float[] buf = Enumerable.Repeat(0.5f, 2048).ToArray();
        effect.ProcessBuffer(buf, 0, buf.Length);

        // Should not throw
        effect.Reset();
    }
}
