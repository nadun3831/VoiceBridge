using System.Collections.ObjectModel;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using VoiceBridge.Core.Interfaces;
using VoiceBridge.Core.Models;

namespace VoiceBridge.Application.ViewModels;

public partial class PresetViewModel : ObservableObject
{
    private readonly IPresetRepository _presetRepository;

    [ObservableProperty]
    private ObservableCollection<Preset> _presets = new();

    [ObservableProperty]
    private Preset? _selectedPreset;

    public event EventHandler<Preset>? PresetApplied;

    public PresetViewModel(IPresetRepository presetRepository)
    {
        _presetRepository = presetRepository;
        _ = LoadPresetsAsync();
    }

    [RelayCommand]
    public async Task LoadPresetsAsync()
    {
        Presets.Clear();
        var list = await _presetRepository.GetAllPresetsAsync();
        foreach (var p in list)
        {
            Presets.Add(p);
        }
        SelectedPreset = Presets.FirstOrDefault();
    }

    partial void OnSelectedPresetChanged(Preset? value)
    {
        if (value != null)
        {
            PresetApplied?.Invoke(this, value);
        }
    }
}
