using VoiceBridge.AudioEngine.Services;
using VoiceBridge.Core.Models;
using Xunit;

namespace VoiceBridge.Tests;

public class DeviceServiceTests
{
    [Fact]
    public void WasapiDeviceService_CanBeInstantiated()
    {
        // Act
        var service = new WasapiDeviceService();

        // Assert
        Assert.NotNull(service);
    }

    [Fact]
    public void WasapiDeviceService_GetInputDevices_DoesNotThrow()
    {
        // Arrange
        var service = new WasapiDeviceService();

        // Act
        var devices = service.GetInputDevices();

        // Assert
        Assert.NotNull(devices);
    }

    [Fact]
    public void WasapiDeviceService_GetOutputDevices_DoesNotThrow()
    {
        // Arrange
        var service = new WasapiDeviceService();

        // Act
        var devices = service.GetOutputDevices();

        // Assert
        Assert.NotNull(devices);
    }
}
