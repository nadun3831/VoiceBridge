using NAudio.Wave;
using NAudio.CoreAudioApi;
using VoiceBridge.Core.Interfaces;
using VoiceBridge.Core.Models;

namespace VoiceBridge.AudioEngine.Pipeline;

/// <summary>
/// Real-time WASAPI audio capture → effect chain processing → WASAPI render pipeline host.
/// Supports 16-bit PCM, 24-bit PCM, and 32-bit Float formats across hardware microphones.
/// </summary>
public sealed class WasapiPipelineHost : IAudioPipelineHost, IDisposable
{
    // ── Events ──────────────────────────────────────────────────────────────
    public event EventHandler<EngineState>? StateChanged;
    public event EventHandler<AudioMeterEventArgs>? MeterUpdated;

    // ── State ────────────────────────────────────────────────────────────────
    private EngineState _currentState = EngineState.Stopped;
    public EngineState CurrentState => _currentState;

    // ── Effect Chain ─────────────────────────────────────────────────────────
    private volatile List<IAudioEffect> _effects = new();
    private readonly object _effectsLock = new();

    // ── Audio Components ──────────────────────────────────────────────────────
    private WasapiCapture? _capture;
    private WasapiOut? _render;
    private BufferedWaveProvider? _playbackBuffer;

    // ── Hot-path reusable buffers ─────────────────────────────────────────────
    private float[] _processingBuffer = Array.Empty<float>();
    private byte[] _outputByteBuffer = Array.Empty<byte>();

    // ── Metering ──────────────────────────────────────────────────────────────
    private float _peakInputDb = -120f;
    private float _peakOutputDb = -120f;
    private readonly System.Timers.Timer _meterTimer;
    private const float MeterDecayRate = 0.85f;

    // ── Configuration ─────────────────────────────────────────────────────────
    private const int BufferMs = 10;

    public WasapiPipelineHost()
    {
        _meterTimer = new System.Timers.Timer(40); // 25 Hz metering
        _meterTimer.Elapsed += OnMeterTimerElapsed;
    }

    public void AddEffect(IAudioEffect effect)
    {
        lock (_effectsLock)
        {
            var newList = new List<IAudioEffect>(_effects) { effect };
            _effects = newList;
        }
    }

    public void RemoveEffect(string effectId)
    {
        lock (_effectsLock)
        {
            var newList = _effects.Where(e => e.Id != effectId).ToList();
            _effects = newList;
        }
    }

    public async Task StartAsync(string inputDeviceId, string outputDeviceId)
    {
        if (_currentState != EngineState.Stopped)
            throw new InvalidOperationException("Pipeline is already running.");

        SetState(EngineState.Starting);

        await Task.Run(() =>
        {
            try
            {
                InitializeCapture(inputDeviceId);
                InitializeRender(outputDeviceId);

                _capture!.StartRecording();
                _render!.Play();
                _meterTimer.Start();

                SetState(EngineState.Running);
            }
            catch (Exception ex)
            {
                SetState(EngineState.Error);
                throw new InvalidOperationException($"Failed to start audio pipeline: {ex.Message}", ex);
            }
        });
    }

    public async Task StopAsync()
    {
        if (_currentState == EngineState.Stopped) return;

        SetState(EngineState.Stopping);

        await Task.Run(() =>
        {
            _meterTimer.Stop();

            _capture?.StopRecording();
            _capture?.Dispose();
            _capture = null;

            _render?.Stop();
            _render?.Dispose();
            _render = null;

            _playbackBuffer = null;

            var snapshot = _effects;
            foreach (var effect in snapshot)
                effect.Reset();

            SetState(EngineState.Stopped);
        });
    }

    private void InitializeCapture(string inputDeviceId)
    {
        var enumerator = new MMDeviceEnumerator();
        MMDevice device;

        if (string.IsNullOrWhiteSpace(inputDeviceId))
        {
            device = enumerator.GetDefaultAudioEndpoint(DataFlow.Capture, Role.Multimedia);
        }
        else
        {
            device = enumerator.GetDevice(inputDeviceId);
        }

        _capture = new WasapiCapture(device)
        {
            ShareMode = AudioClientShareMode.Shared
        };

        var format = _capture.WaveFormat;
        int bufferSize = (int)(format.SampleRate * format.Channels * (BufferMs / 1000.0) * 4);
        _processingBuffer = new float[bufferSize];

        _playbackBuffer = new BufferedWaveProvider(format)
        {
            BufferLength = bufferSize * 16,
            DiscardOnBufferOverflow = true
        };

        _capture.DataAvailable += OnCaptureDataAvailable;
        _capture.RecordingStopped += OnRecordingStopped;
    }

    private void InitializeRender(string outputDeviceId)
    {
        var enumerator = new MMDeviceEnumerator();
        MMDevice device;

        if (string.IsNullOrWhiteSpace(outputDeviceId))
        {
            device = enumerator.GetDefaultAudioEndpoint(DataFlow.Render, Role.Multimedia);
        }
        else
        {
            device = enumerator.GetDevice(outputDeviceId);
        }

        _render = new WasapiOut(device, AudioClientShareMode.Shared, true, BufferMs);
        _render.Init(_playbackBuffer!);
    }

    private void OnCaptureDataAvailable(object? sender, WaveInEventArgs e)
    {
        if (e.BytesRecorded == 0 || _capture == null) return;

        int bitsPerSample = _capture.WaveFormat.BitsPerSample;
        int sampleCount = 0;

        // 1. Decode byte buffer to floating point samples (-1.0 to +1.0)
        if (bitsPerSample == 16)
        {
            sampleCount = e.BytesRecorded / 2;
            if (_processingBuffer.Length < sampleCount)
                _processingBuffer = new float[sampleCount];

            for (int i = 0; i < sampleCount; i++)
            {
                short sample = BitConverter.ToInt16(e.Buffer, i * 2);
                _processingBuffer[i] = sample / 32768.0f;
            }
        }
        else if (bitsPerSample == 24)
        {
            sampleCount = e.BytesRecorded / 3;
            if (_processingBuffer.Length < sampleCount)
                _processingBuffer = new float[sampleCount];

            for (int i = 0; i < sampleCount; i++)
            {
                int sample = (e.Buffer[i * 3 + 2] << 16) | (e.Buffer[i * 3 + 1] << 8) | e.Buffer[i * 3];
                if ((sample & 0x800000) != 0) sample |= unchecked((int)0xFF000000);
                _processingBuffer[i] = sample / 8388608.0f;
            }
        }
        else // 32-bit Float
        {
            sampleCount = e.BytesRecorded / 4;
            if (_processingBuffer.Length < sampleCount)
                _processingBuffer = new float[sampleCount];

            for (int i = 0; i < sampleCount; i++)
            {
                _processingBuffer[i] = BitConverter.ToSingle(e.Buffer, i * 4);
            }
        }

        // 2. Compute INPUT Peak dB
        float inputPeak = ComputePeakLinear(_processingBuffer, 0, sampleCount);
        Volatile.Write(ref _peakInputDb, LinearToDb(inputPeak));

        // 3. Process DSP Effect Chain
        var effectSnapshot = _effects;
        foreach (var effect in effectSnapshot)
        {
            effect.ProcessBuffer(_processingBuffer, 0, sampleCount);
        }

        // 4. Compute OUTPUT Peak dB
        float outputPeak = ComputePeakLinear(_processingBuffer, 0, sampleCount);
        Volatile.Write(ref _peakOutputDb, LinearToDb(outputPeak));

        // 5. Encode floating point samples back to matching output byte format
        int outputByteCount = e.BytesRecorded;
        if (_outputByteBuffer.Length < outputByteCount)
            _outputByteBuffer = new byte[outputByteCount];

        if (bitsPerSample == 16)
        {
            for (int i = 0; i < sampleCount; i++)
            {
                float clamped = Math.Clamp(_processingBuffer[i], -1.0f, 1.0f);
                short s = (short)(clamped * 32767.0f);
                byte[] bytes = BitConverter.GetBytes(s);
                _outputByteBuffer[i * 2] = bytes[0];
                _outputByteBuffer[i * 2 + 1] = bytes[1];
            }
        }
        else if (bitsPerSample == 32)
        {
            Buffer.BlockCopy(_processingBuffer, 0, _outputByteBuffer, 0, outputByteCount);
        }

        _playbackBuffer?.AddSamples(_outputByteBuffer, 0, outputByteCount);
    }

    private void OnRecordingStopped(object? sender, StoppedEventArgs e)
    {
        if (e.Exception != null && _currentState == EngineState.Running)
        {
            SetState(EngineState.Error);
        }
    }

    private void OnMeterTimerElapsed(object? sender, System.Timers.ElapsedEventArgs e)
    {
        float inputDb = Volatile.Read(ref _peakInputDb);
        float outputDb = Volatile.Read(ref _peakOutputDb);

        Volatile.Write(ref _peakInputDb, Math.Max(inputDb * MeterDecayRate, -120f));
        Volatile.Write(ref _peakOutputDb, Math.Max(outputDb * MeterDecayRate, -120f));

        MeterUpdated?.Invoke(this, new AudioMeterEventArgs(inputDb, outputDb));
    }

    private static float ComputePeakLinear(float[] buffer, int offset, int count)
    {
        float peak = 0f;
        int end = offset + count;
        for (int i = offset; i < end; i++)
        {
            float abs = Math.Abs(buffer[i]);
            if (abs > peak) peak = abs;
        }
        return peak;
    }

    private static float LinearToDb(float linear)
    {
        return linear > 1e-6f ? 20f * MathF.Log10(linear) : -120f;
    }

    private void SetState(EngineState state)
    {
        _currentState = state;
        StateChanged?.Invoke(this, state);
    }

    public void Dispose()
    {
        _meterTimer.Dispose();
        _capture?.Dispose();
        _render?.Dispose();
    }
}
