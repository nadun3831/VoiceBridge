using NAudio.CoreAudioApi;
using NAudio.Wave;
using Xunit;
using Xunit.Abstractions;

namespace VoiceBridge.Tests;

public class AudioDiagnostic
{
    private readonly ITestOutputHelper _output;

    public AudioDiagnostic(ITestOutputHelper output)
    {
        _output = output;
    }

    [Fact]
    public void DiagnoseAllCaptureDevices()
    {
        var enumerator = new MMDeviceEnumerator();
        var captureDevices = enumerator.EnumerateAudioEndPoints(DataFlow.Capture, DeviceState.Active);

        _output.WriteLine($"Found {captureDevices.Count} active capture device(s):");

        foreach (var dev in captureDevices)
        {
            _output.WriteLine($"--------------------------------------------------");
            _output.WriteLine($"Device ID: {dev.ID}");
            _output.WriteLine($"Name: {dev.FriendlyName}");
            _output.WriteLine($"State: {dev.State}");

            WaveFormat mixFormat;
            try
            {
                mixFormat = dev.AudioClient.MixFormat;
                _output.WriteLine($"MixFormat: {mixFormat.SampleRate}Hz, {mixFormat.BitsPerSample}bit, {mixFormat.Channels}ch, Encoding={mixFormat.Encoding}");
                if (mixFormat is WaveFormatExtensible ext)
                {
                    _output.WriteLine($"Extensible SubFormat: {ext.SubFormat}");
                }
            }
            catch (Exception ex)
            {
                _output.WriteLine($"Failed to get MixFormat: {ex.Message}");
                continue;
            }

            // Test 1-second capture on this device
            try
            {
                using var capture = new WasapiCapture(dev)
                {
                    ShareMode = AudioClientShareMode.Shared
                };

                int eventCount = 0;
                long totalBytes = 0;
                float maxPeak = 0f;

                capture.DataAvailable += (s, e) =>
                {
                    eventCount++;
                    totalBytes += e.BytesRecorded;

                    var waveBuffer = new WaveBuffer(e.Buffer);
                    int bits = capture.WaveFormat.BitsPerSample;

                    if (bits == 16)
                    {
                        int shorts = e.BytesRecorded / 2;
                        for (int i = 0; i < shorts; i++)
                        {
                            float abs = Math.Abs(waveBuffer.ShortBuffer[i] / 32768.0f);
                            if (abs > maxPeak) maxPeak = abs;
                        }
                    }
                    else if (bits == 32)
                    {
                        int floats = e.BytesRecorded / 4;
                        for (int i = 0; i < floats; i++)
                        {
                            float abs = Math.Abs(waveBuffer.FloatBuffer[i]);
                            if (abs > maxPeak) maxPeak = abs;
                        }
                    }
                };

                capture.StartRecording();
                Thread.Sleep(1000);
                capture.StopRecording();

                _output.WriteLine($"Test Recording Result:");
                _output.WriteLine($"  DataAvailable Events Fired: {eventCount}");
                _output.WriteLine($"  Total Bytes Captured: {totalBytes}");
                _output.WriteLine($"  Max Peak Linear Amplitude: {maxPeak}");
                _output.WriteLine($"  Max Peak dB: {(maxPeak > 1e-6f ? 20f * MathF.Log10(maxPeak) : -120f):F1} dB");
            }
            catch (Exception ex)
            {
                _output.WriteLine($"Test Recording Exception: {ex.Message}");
            }
        }
    }
}
