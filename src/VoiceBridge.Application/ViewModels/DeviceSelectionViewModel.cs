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
        var inputs = _deviceService.GetInputDevices();
        foreach (var dev in inputs)
        {
            InputDevices.Add(dev);
        }
        SelectedInputDevice = InputDevices.FirstOrDefault(d => d.IsDefault) ?? InputDevices.FirstOrDefault();

        OutputDevices.Clear();
        var outputs = _deviceService.GetOutputDevices();
        foreach (var dev in outputs)
        {
            OutputDevices.Add(dev);
        }
        SelectedOutputDevice = OutputDevices.FirstOrDefault(d => d.IsVirtualDevice) 
            ?? OutputDevices.FirstOrDefault(d => d.IsDefault) 
            ?? OutputDevices.FirstOrDefault();

        IsVirtualDriverDetected = _deviceService.IsVirtualDriverInstalled();
    }
}
