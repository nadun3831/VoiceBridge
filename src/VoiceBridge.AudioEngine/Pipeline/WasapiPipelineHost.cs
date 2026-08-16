using NAudio.Wave;
using NAudio.CoreAudioApi;
using VoiceBridge.Core.Interfaces;
using VoiceBridge.Core.Models;

namespace VoiceBridge.AudioEngine.Pipeline;

/// <summary>
/// Real-time WASAPI audio capture → effect chain processing → WASAPI render pipeline host.
/// Fully handles sample rate, channel count (Mono/Stereo), and bit depth adaptation between capture and render hardware.
/// </summary>
public sealed class WasapiPipelineHost : IAudioPipelineHost, IDisposable
{
    public event EventHandler<EngineState>? StateChanged;
    public event EventHandler<AudioMeterEventArgs>? MeterUpdated;

    private EngineState _currentState = EngineState.Stopped;
    public EngineState CurrentState => _currentState;

    private volatile bool _isFeedbackEnabled = true;
    public bool IsFeedbackEnabled
    {
        get => _isFeedbackEnabled;
        set => _isFeedbackEnabled = value;
    }

    private volatile List<IAudioEffect> _effects = new();
    private readonly object _effectsLock = new();

    private WasapiCapture? _capture;
    private WasapiOut? _render;
    private BufferedWaveProvider? _playbackBuffer;

    private float[] _inputProcessingBuffer = Array.Empty<float>();
    private float[] _outputProcessingBuffer = Array.Empty<float>();
    private byte[] _outputByteBuffer = Array.Empty<byte>();

    private float _peakInputDb = -120f;
    private float _peakOutputDb = -120f;
    private readonly System.Timers.Timer _meterTimer;
    private const float MeterDecayRate = 0.85f;
    private const int BufferMs = 50;

    private int _inChannels = 2;
    private int _outChannels = 2;
    private int _inSampleRate = 48000;
    private int _outSampleRate = 48000;

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
                var enumerator = new MMDeviceEnumerator();
                
                // 1. Get Capture Device
                MMDevice captureDevice;
                if (string.IsNullOrWhiteSpace(inputDeviceId))
                    captureDevice = enumerator.GetDefaultAudioEndpoint(DataFlow.Capture, Role.Multimedia);
                else
                    captureDevice = enumerator.GetDevice(inputDeviceId);

                // 2. Get Render Device
                MMDevice renderDevice;
                if (string.IsNullOrWhiteSpace(outputDeviceId))
                    renderDevice = enumerator.GetDefaultAudioEndpoint(DataFlow.Render, Role.Multimedia);
                else
                    renderDevice = enumerator.GetDevice(outputDeviceId);

                // 3. Initialize WasapiCapture
                _capture = new WasapiCapture(captureDevice)
                {
                    ShareMode = AudioClientShareMode.Shared
                };

                var inFormat = _capture.WaveFormat;
                _inChannels = inFormat.Channels;
                _inSampleRate = inFormat.SampleRate;

                // 4. Initialize WasapiOut using Render Device MixFormat
                WaveFormat outFormat = renderDevice.AudioClient.MixFormat;
                _outChannels = outFormat.Channels;
                _outSampleRate = outFormat.SampleRate;

                int bufferSize = (int)(_inSampleRate * _inChannels * (BufferMs / 1000.0) * 4);
                if (bufferSize < 4096) bufferSize = 4096;

                _inputProcessingBuffer = new float[bufferSize];
                _outputProcessingBuffer = new float[bufferSize * 4];

                _playbackBuffer = new BufferedWaveProvider(outFormat)
                {
                    BufferLength = bufferSize * 32,
                    DiscardOnBufferOverflow = true
                };

                _render = new WasapiOut(renderDevice, AudioClientShareMode.Shared, true, BufferMs);
                _render.Init(_playbackBuffer);

                _capture.DataAvailable += OnCaptureDataAvailable;
                _capture.RecordingStopped += OnRecordingStopped;

                _capture.StartRecording();
                _render.Play();
                _meterTimer.Start();

                SetState(EngineState.Running);
            }
            catch (Exception ex)
            {
                SetState(EngineState.Error);
                throw new InvalidOperationException($"Audio Engine Start Error: {ex.Message}", ex);
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

    private void OnCaptureDataAvailable(object? sender, WaveInEventArgs e)
    {
        if (e.BytesRecorded == 0 || _capture == null) return;

        var waveFormat = _capture.WaveFormat;
        int bitsPerSample = waveFormat.BitsPerSample;
        int frameCount = 0;

        var waveBuffer = new WaveBuffer(e.Buffer);

        // 1. Decode capture bytes to floating point samples
        if (waveFormat.Encoding == WaveFormatEncoding.IeeeFloat || bitsPerSample == 32 && isFloatEncoding(waveFormat))
        {
            int totalFloats = e.BytesRecorded / 4;
            frameCount = totalFloats / _inChannels;
            if (_inputProcessingBuffer.Length < totalFloats)
                _inputProcessingBuffer = new float[totalFloats];

            for (int i = 0; i < totalFloats; i++)
            {
                _inputProcessingBuffer[i] = waveBuffer.FloatBuffer[i];
            }
        }
        else if (bitsPerSample == 16)
        {
            int totalShorts = e.BytesRecorded / 2;
            frameCount = totalShorts / _inChannels;
            if (_inputProcessingBuffer.Length < totalShorts)
                _inputProcessingBuffer = new float[totalShorts];

            for (int i = 0; i < totalShorts; i++)
            {
                _inputProcessingBuffer[i] = waveBuffer.ShortBuffer[i] / 32768.0f;
            }
        }
        else if (bitsPerSample == 24)
        {
            int totalSamples = e.BytesRecorded / 3;
            frameCount = totalSamples / _inChannels;
            if (_inputProcessingBuffer.Length < totalSamples)
                _inputProcessingBuffer = new float[totalSamples];

            for (int i = 0; i < totalSamples; i++)
            {
                int sample = (e.Buffer[i * 3 + 2] << 16) | (e.Buffer[i * 3 + 1] << 8) | e.Buffer[i * 3];
                if ((sample & 0x800000) != 0) sample |= unchecked((int)0xFF000000);
                _inputProcessingBuffer[i] = sample / 8388608.0f;
            }
        }
        else if (bitsPerSample == 32)
        {
            int totalInts = e.BytesRecorded / 4;
            frameCount = totalInts / _inChannels;
            if (_inputProcessingBuffer.Length < totalInts)
                _inputProcessingBuffer = new float[totalInts];

            for (int i = 0; i < totalInts; i++)
            {
                _inputProcessingBuffer[i] = waveBuffer.IntBuffer[i] / 2147483648.0f;
            }
        }

        if (frameCount == 0) return;
        int totalInSamples = frameCount * _inChannels;

        // 1.5 Sanitize input samples against NaN/Infinity
        for (int i = 0; i < totalInSamples; i++)
        {
            float s = _inputProcessingBuffer[i];
            if (float.IsNaN(s) || float.IsInfinity(s))
                _inputProcessingBuffer[i] = 0f;
        }

        // 2. Compute INPUT Peak dB
        float inputPeak = ComputePeakLinear(_inputProcessingBuffer, 0, totalInSamples);
        Volatile.Write(ref _peakInputDb, LinearToDb(inputPeak));

        // 3. Process DSP Effect Chain
        var effectSnapshot = _effects;
        foreach (var effect in effectSnapshot)
        {
            effect.ProcessBuffer(_inputProcessingBuffer, 0, totalInSamples);
        }

        // 3.5 Sanitize output of effect chain against NaN/Infinity
        for (int i = 0; i < totalInSamples; i++)
        {
            float s = _inputProcessingBuffer[i];
            if (float.IsNaN(s) || float.IsInfinity(s))
                _inputProcessingBuffer[i] = 0f;
        }

        // 4. Compute OUTPUT Peak dB
        float outputPeak = ComputePeakLinear(_inputProcessingBuffer, 0, totalInSamples);
        Volatile.Write(ref _peakOutputDb, LinearToDb(outputPeak));

        // 5. Adapt Channel Layout (Mono -> Stereo or Stereo -> Mono)
        int totalOutSamples = frameCount * _outChannels;
        if (_outputProcessingBuffer.Length < totalOutSamples)
            _outputProcessingBuffer = new float[totalOutSamples];

        if (_inChannels == 1 && _outChannels == 2)
        {
            // Mono input -> Stereo output
            for (int f = 0; f < frameCount; f++)
            {
                float monoSample = _inputProcessingBuffer[f];
                _outputProcessingBuffer[f * 2] = monoSample;
                _outputProcessingBuffer[f * 2 + 1] = monoSample;
            }
        }
        else
        {
            Array.Copy(_inputProcessingBuffer, 0, _outputProcessingBuffer, 0, Math.Min(totalInSamples, totalOutSamples));
        }

        // 6. Encode float samples to match render device output buffer (32-bit Float or 16-bit PCM)
        int renderBits = _playbackBuffer?.WaveFormat.BitsPerSample ?? 32;
        int outputByteCount;

        if (renderBits == 16)
        {
            outputByteCount = totalOutSamples * 2;
            if (_outputByteBuffer.Length < outputByteCount)
                _outputByteBuffer = new byte[outputByteCount];

            for (int i = 0; i < totalOutSamples; i++)
            {
                float clamped = Math.Clamp(_outputProcessingBuffer[i], -1.0f, 1.0f);
                short s = (short)(clamped * 32767.0f);
                byte[] bytes = BitConverter.GetBytes(s);
                _outputByteBuffer[i * 2] = bytes[0];
                _outputByteBuffer[i * 2 + 1] = bytes[1];
            }
        }
        else // 32-bit Float
        {
            outputByteCount = totalOutSamples * 4;
            if (_outputByteBuffer.Length < outputByteCount)
                _outputByteBuffer = new byte[outputByteCount];

            Buffer.BlockCopy(_outputProcessingBuffer, 0, _outputByteBuffer, 0, outputByteCount);
        }

        if (_isFeedbackEnabled)
        {
            _playbackBuffer?.AddSamples(_outputByteBuffer, 0, outputByteCount);
        }
        else
        {
            Array.Clear(_outputByteBuffer, 0, outputByteCount);
            _playbackBuffer?.AddSamples(_outputByteBuffer, 0, outputByteCount);
        }
    }

    private static bool isFloatEncoding(WaveFormat format)
    {
        if (format.Encoding == WaveFormatEncoding.IeeeFloat) return true;
        if (format is WaveFormatExtensible ext)
        {
            return ext.SubFormat == new Guid("00000003-0000-0010-8000-00aa00389b71");
        }
        return false;
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
            float s = buffer[i];
            if (float.IsNaN(s) || float.IsInfinity(s)) continue;
            float abs = Math.Abs(s);
            if (abs > peak) peak = abs;
        }
        return peak;
    }

    private static float LinearToDb(float linear)
    {
        if (float.IsNaN(linear) || float.IsInfinity(linear) || linear <= 1e-6f)
            return -120f;
        return 20f * MathF.Log10(linear);
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
