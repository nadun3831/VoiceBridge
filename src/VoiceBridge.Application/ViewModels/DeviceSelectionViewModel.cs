using System.Collections.ObjectModel;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using VoiceBridge.Core.Interfaces;
using VoiceBridge.Core.Models;

namespace VoiceBridge.Application.ViewModels;

public partial class DeviceSelectionViewModel : ObservableObject
{
    private readonly IAudioDeviceService _deviceService;

    [ObservableProperty]
    private ObservableCollection<AudioDeviceInfo> _inputDevices = new();

    [ObservableProperty]
    private ObservableCollection<AudioDeviceInfo> _outputDevices = new();

    [ObservableProperty]
    private AudioDeviceInfo? _selectedInputDevice;

    [ObservableProperty]
    private AudioDeviceInfo? _selectedOutputDevice;

    [ObservableProperty]
    private bool _isVirtualDriverDetected;

    public DeviceSelectionViewModel(IAudioDeviceService deviceService)
    {
        _deviceService = deviceService;
        RefreshDevices();
    }

    [RelayCommand]
    public void RefreshDevices()
    {
        InputDevices.Clear();
        var inputs = _deviceService.GetInputDevices().ToList();
        foreach (var dev in inputs)
        {
            InputDevices.Add(dev);
        }

        // Prefer physical hardware microphones over virtual software capture devices (like EaseUS/VoiceWave)
        SelectedInputDevice = inputs.FirstOrDefault(d => !d.IsVirtualDevice && !d.Name.Contains("EaseUS") && !d.Name.Contains("VoiceWave") && d.IsDefault)
            ?? inputs.FirstOrDefault(d => !d.IsVirtualDevice && !d.Name.Contains("EaseUS") && !d.Name.Contains("VoiceWave"))
            ?? inputs.FirstOrDefault();

        OutputDevices.Clear();
        var outputs = _deviceService.GetOutputDevices().ToList();
        foreach (var dev in outputs)
        {
            OutputDevices.Add(dev);
        }

        SelectedOutputDevice = outputs.FirstOrDefault(d => d.IsVirtualDevice) 
            ?? outputs.FirstOrDefault(d => d.IsDefault) 
            ?? outputs.FirstOrDefault();

        IsVirtualDriverDetected = _deviceService.IsVirtualDriverInstalled();
    }
}
