using VoiceBridge.AudioEngine.Services;
using Xunit;

namespace VoiceBridge.Tests;

public class VirtualDriverTests
{
    [Fact]
    public void VirtualDriverService_AuditVirtualDriver_DoesNotThrow()
    {
        // Arrange
        var service = new VirtualDriverService();

        // Act
        var status = service.AuditVirtualDriver();

        // Assert
        Assert.NotNull(status);
        Assert.NotNull(status.DriverName);
        Assert.NotNull(status.RecommendedAction);
    }
}
