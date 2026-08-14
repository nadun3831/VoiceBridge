using NAudio.CoreAudioApi;
using VoiceBridge.Core.Models;

namespace VoiceBridge.AudioEngine.Services;

public record VirtualDriverStatus(
    bool IsInstalled,
    string DriverName,
    string EndpointId,
    string RecommendedAction
);

/// <summary>
/// Diagnostic service for detecting, verifying, and routing audio through Virtual Audio Cable / VoiceBridge Virtual Driver endpoints.
/// </summary>
public class VirtualDriverService
{
    private readonly MMDeviceEnumerator _enumerator;

    public VirtualDriverService()
    {
        _enumerator = new MMDeviceEnumerator();
    }

    /// <summary>
    /// Audits the host system for virtual microphone driver endpoints.
    /// </summary>
    public VirtualDriverStatus AuditVirtualDriver()
    {
        try
        {
            var renderDevices = _enumerator.EnumerateAudioEndPoints(DataFlow.Render, DeviceState.Active);
            foreach (var dev in renderDevices)
            {
                string name = dev.FriendlyName.ToLowerInvariant();
                if (name.Contains("voicebridge") || name.Contains("cable input") || name.Contains("vb-audio") || name.Contains("virtual cable"))
                {
                    return new VirtualDriverStatus(
                        IsInstalled: true,
                        DriverName: dev.FriendlyName,
                        EndpointId: dev.ID,
                        RecommendedAction: "Virtual Audio Driver is ready for output routing."
                    );
                }
            }
        }
        catch
        {
            // Headless / fallback
        }

        return new VirtualDriverStatus(
            IsInstalled: false,
            DriverName: "None Detected",
            EndpointId: string.Empty,
            RecommendedAction: "Install VB-Audio Virtual Cable or VoiceBridge Driver to route real-time processed audio to Discord/Zoom/OBS."
        );
    }
}
