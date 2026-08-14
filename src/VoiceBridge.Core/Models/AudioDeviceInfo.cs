namespace VoiceBridge.Core.Models;

/// <summary>
/// Domain representation of an audio input (capture) or output (render) device.
/// </summary>
public record AudioDeviceInfo(
    string Id,
    string Name,
    bool IsDefault,
    bool IsVirtualDevice,
    int Channels,
    int SampleRate
);
