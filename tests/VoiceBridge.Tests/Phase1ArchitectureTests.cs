using VoiceBridge.Core.Models;
using Xunit;

namespace VoiceBridge.Tests;

public class Phase1ArchitectureTests
{
    [Fact]
    public void AudioDeviceInfo_PropertiesSetCorrectly()
    {
        // Arrange & Act
        var device = new AudioDeviceInfo(
            Id: "dev-001",
            Name: "Realtek High Definition Audio",
            IsDefault: true,
            IsVirtualDevice: false,
            Channels: 2,
            SampleRate: 48000
        );

        // Assert
        Assert.Equal("dev-001", device.Id);
        Assert.Equal("Realtek High Definition Audio", device.Name);
        Assert.True(device.IsDefault);
        Assert.False(device.IsVirtualDevice);
        Assert.Equal(2, device.Channels);
        Assert.Equal(48000, device.SampleRate);
    }
}
