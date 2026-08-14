using Moq;
using Serilog;
using VoiceBridge.Application.Services;
using VoiceBridge.Application.ViewModels;
using VoiceBridge.Core.Interfaces;
using VoiceBridge.Core.Models;
using Xunit;

namespace VoiceBridge.Tests;

public class ApplicationLayerTests
{
    [Fact]
    public async Task JsonPresetRepository_GetAllPresets_ReturnsDefaultFactoryPresets()
    {
        // Arrange
        string tempPath = Path.Combine(Path.GetTempPath(), $"presets_test_{Guid.NewGuid()}.json");
        try
        {
            var repo = new JsonPresetRepository(tempPath);

            // Act
            var presets = (await repo.GetAllPresetsAsync()).ToList();

            // Assert
            Assert.NotEmpty(presets);
            Assert.Contains(presets, p => p.Id == "clean");
            Assert.Contains(presets, p => p.Id == "radio_broadcaster");
            Assert.Contains(presets, p => p.Id == "ethereal_echo");
            Assert.Contains(presets, p => p.Id == "deep_voice");
        }
        finally
        {
            if (File.Exists(tempPath)) File.Delete(tempPath);
        }
    }

    [Fact]
    public void DeviceSelectionViewModel_RefreshDevices_PopulatesCollections()
    {
        // Arrange
        var mockDeviceService = new Mock<IAudioDeviceService>();
        mockDeviceService.Setup(s => s.GetInputDevices()).Returns(new[]
        {
            new AudioDeviceInfo("mic1", "USB Microphone", true, false, 2, 48000)
        });
        mockDeviceService.Setup(s => s.GetOutputDevices()).Returns(new[]
        {
            new AudioDeviceInfo("spk1", "Speakers", true, false, 2, 48000)
        });

        // Act
        var vm = new DeviceSelectionViewModel(mockDeviceService.Object);

        // Assert
        Assert.Single(vm.InputDevices);
        Assert.Single(vm.OutputDevices);
        Assert.Equal("mic1", vm.SelectedInputDevice?.Id);
        Assert.Equal("spk1", vm.SelectedOutputDevice?.Id);
    }

    [Fact]
    public void MainViewModel_ToggleBypass_TogglesState()
    {
        // Arrange
        var mockPipeline = new Mock<IAudioPipelineHost>();
        var mockDeviceService = new Mock<IAudioDeviceService>();
        var mockPresetRepo = new Mock<IPresetRepository>();
        var mockLogger = new Mock<ILogger>();

        var devVm = new DeviceSelectionViewModel(mockDeviceService.Object);
        var presetVm = new PresetViewModel(mockPresetRepo.Object);

        var mainVm = new MainViewModel(mockPipeline.Object, devVm, presetVm, mockLogger.Object);

        // Act & Assert
        Assert.False(mainVm.IsBypassed);
        mainVm.ToggleBypass();
        Assert.True(mainVm.IsBypassed);
        mainVm.ToggleBypass();
        Assert.False(mainVm.IsBypassed);
    }
}
