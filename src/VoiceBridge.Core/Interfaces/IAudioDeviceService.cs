using VoiceBridge.Core.Models;

namespace VoiceBridge.Core.Interfaces;

/// <summary>
/// Service contract for discovering physical audio devices and virtual endpoints.
/// </summary>
public interface IAudioDeviceService
{
    /// <summary>
    /// Event fired when audio hardware devices are attached or removed.
    /// </summary>
    event EventHandler HardwareDevicesChanged;

    /// <summary>
    /// Enumerates all active physical audio capture (microphone) devices.
    /// </summary>
    IEnumerable<AudioDeviceInfo> GetInputDevices();

    /// <summary>
    /// Enumerates all active audio render (playback/virtual input) devices.
    /// </summary>
    IEnumerable<AudioDeviceInfo> GetOutputDevices();

    /// <summary>
    /// Checks if the VoiceBridge Virtual Audio Driver endpoint is installed and available.
    /// </summary>
    bool IsVirtualDriverInstalled();
}
