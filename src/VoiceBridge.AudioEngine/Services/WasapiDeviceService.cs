using NAudio.CoreAudioApi;
using VoiceBridge.Core.Interfaces;
using VoiceBridge.Core.Models;

namespace VoiceBridge.AudioEngine.Services;

/// <summary>
/// WASAPI implementation of IAudioDeviceService using NAudio CoreAudioApi MMDeviceEnumerator.
/// Handles physical microphone discovery, speaker output enumeration, and Virtual Audio Driver detection.
/// </summary>
public class WasapiDeviceService : IAudioDeviceService
{
    private readonly MMDeviceEnumerator _deviceEnumerator;

    public event EventHandler? HardwareDevicesChanged;

    protected virtual void OnHardwareDevicesChanged()
    {
        HardwareDevicesChanged?.Invoke(this, EventArgs.Empty);
    }

    public WasapiDeviceService()
    {
        _deviceEnumerator = new MMDeviceEnumerator();
        // Hardware insertion/removal notifications can be registered via IMMNotificationClient in production
    }

    /// <summary>
    /// Enumerates active physical microphone audio capture devices.
    /// </summary>
    public IEnumerable<AudioDeviceInfo> GetInputDevices()
    {
        var devices = new List<AudioDeviceInfo>();
        try
        {
            MMDevice defaultDevice = null!;
            try
            {
                defaultDevice = _deviceEnumerator.GetDefaultAudioEndpoint(DataFlow.Capture, Role.Multimedia);
            }
            catch
            {
                // Default endpoint might be unavailable if no mic is plugged in
            }

            var collection = _deviceEnumerator.EnumerateAudioEndPoints(DataFlow.Capture, DeviceState.Active);
            foreach (var dev in collection)
            {
                bool isDefault = defaultDevice != null && dev.ID == defaultDevice.ID;
                bool isVirtual = IsDeviceVirtualName(dev.FriendlyName);

                int channels = dev.AudioEndpointVolume?.Channels?.Count ?? 2;
                int sampleRate = 48000; // Standard WASAPI default

                try
                {
                    var waveFormat = dev.AudioClient?.MixFormat;
                    if (waveFormat != null)
                    {
                        channels = waveFormat.Channels;
                        sampleRate = waveFormat.SampleRate;
                    }
                }
                catch
                {
                    // Fallback to defaults if device format cannot be queried
                }

                devices.Add(new AudioDeviceInfo(
                    Id: dev.ID,
                    Name: dev.FriendlyName,
                    IsDefault: isDefault,
                    IsVirtualDevice: isVirtual,
                    Channels: channels,
                    SampleRate: sampleRate
                ));
            }
        }
        catch
        {
            // Suppress hardware query exceptions in headless environments
        }

        return devices;
    }

    /// <summary>
    /// Enumerates active playback/output audio render devices (including Virtual Audio Driver inputs).
    /// </summary>
    public IEnumerable<AudioDeviceInfo> GetOutputDevices()
    {
        var devices = new List<AudioDeviceInfo>();
        try
        {
            MMDevice defaultDevice = null!;
            try
            {
                defaultDevice = _deviceEnumerator.GetDefaultAudioEndpoint(DataFlow.Render, Role.Multimedia);
            }
            catch
            {
                // Suppress if no default render device exists
            }

            var collection = _deviceEnumerator.EnumerateAudioEndPoints(DataFlow.Render, DeviceState.Active);
            foreach (var dev in collection)
            {
                bool isDefault = defaultDevice != null && dev.ID == defaultDevice.ID;
                bool isVirtual = IsDeviceVirtualName(dev.FriendlyName);

                int channels = dev.AudioEndpointVolume?.Channels?.Count ?? 2;
                int sampleRate = 48000;

                try
                {
                    var waveFormat = dev.AudioClient?.MixFormat;
                    if (waveFormat != null)
                    {
                        channels = waveFormat.Channels;
                        sampleRate = waveFormat.SampleRate;
                    }
                }
                catch
                {
                }

                devices.Add(new AudioDeviceInfo(
                    Id: dev.ID,
                    Name: dev.FriendlyName,
                    IsDefault: isDefault,
                    IsVirtualDevice: isVirtual,
                    Channels: channels,
                    SampleRate: sampleRate
                ));
            }
        }
        catch
        {
        }

        return devices;
    }

    /// <summary>
    /// Checks if a Virtual Audio Cable / VoiceBridge Driver endpoint is detected on the system.
    /// </summary>
    public bool IsVirtualDriverInstalled()
    {
        var outputs = GetOutputDevices();
        return outputs.Any(d => d.IsVirtualDevice);
    }

    private static bool IsDeviceVirtualName(string name)
    {
        if (string.IsNullOrWhiteSpace(name)) return false;
        string lower = name.ToLowerInvariant();
        return lower.Contains("voicebridge") ||
               lower.Contains("cable input") ||
               lower.Contains("vb-audio") ||
               lower.Contains("virtual audio") ||
               lower.Contains("line in") && lower.Contains("virtual");
    }
}
