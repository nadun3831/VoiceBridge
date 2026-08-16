using System.Text.Json;
using VoiceBridge.Core.Interfaces;
using VoiceBridge.Core.Models;

namespace VoiceBridge.Application.Services;

/// <summary>
/// File-based JSON implementation of IPresetRepository.
/// Manages loading, saving, and factory presets persistence.
/// </summary>
public class JsonPresetRepository : IPresetRepository
{
    private readonly string _filePath;
    private readonly List<Preset> _presets = new();

    public JsonPresetRepository(string? filePath = null)
    {
        _filePath = filePath ?? Path.Combine(
            Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
            "VoiceBridge",
            "presets.json");

        InitializeDefaultPresets();
    }

    public async Task<IEnumerable<Preset>> GetAllPresetsAsync()
    {
        await EnsureLoadedAsync();
        return _presets.AsReadOnly();
    }

    public async Task<Preset?> GetPresetByIdAsync(string id)
    {
        await EnsureLoadedAsync();
        return _presets.FirstOrDefault(p => p.Id == id);
    }

    public async Task SavePresetAsync(Preset preset)
    {
        await EnsureLoadedAsync();
        int existingIndex = _presets.FindIndex(p => p.Id == preset.Id);
        if (existingIndex >= 0)
        {
            _presets[existingIndex] = preset;
        }
        else
        {
            _presets.Add(preset);
        }
        await SaveToFileAsync();
    }

    public async Task DeletePresetAsync(string id)
    {
        await EnsureLoadedAsync();
        _presets.RemoveAll(p => p.Id == id && p.IsCustom);
        await SaveToFileAsync();
    }

    private async Task EnsureLoadedAsync()
    {
        if (File.Exists(_filePath))
        {
            try
            {
                string json = await File.ReadAllTextAsync(_filePath);
                var loaded = JsonSerializer.Deserialize<List<Preset>>(json);
                if (loaded != null && loaded.Count > 0)
                {
                    _presets.Clear();
                    _presets.AddRange(loaded);
                    return;
                }
            }
            catch
            {
                // Fallback to default presets if file is corrupted
            }
        }
    }

    private async Task SaveToFileAsync()
    {
        try
        {
            string? dir = Path.GetDirectoryName(_filePath);
            if (!string.IsNullOrEmpty(dir) && !Directory.Exists(dir))
            {
                Directory.CreateDirectory(dir);
            }
            string json = JsonSerializer.Serialize(_presets, new JsonSerializerOptions { WriteIndented = true });
            await File.WriteAllTextAsync(_filePath, json);
        }
        catch
        {
            // Logging can be added here
        }
    }

    private void InitializeDefaultPresets()
    {
        _presets.Clear();

        // 1. Natural Clean
        _presets.Add(new Preset(
            Id: "clean",
            Name: "Clean / Pass-through",
            Description: "Unprocessed natural microphone audio with light noise gate.",
            Category: "Basic",
            IsCustom: false,
            Effects: new List<EffectConfig>
            {
                new("gain", "Gain", true, new Dictionary<string, float> { { "GainFactor", 1.0f } }),
                new("noise_gate", "Noise Gate", true, new Dictionary<string, float> { { "ThresholdDb", -50.0f }, { "AttackMs", 5.0f }, { "ReleaseMs", 50.0f } })
            }
        ));

        // 2. Realistic Female Voice (Girl)
        _presets.Add(new Preset(
            Id: "realistic_female",
            Name: "Realistic Girl Voice 👩✨",
            Description: "Natural realistic female voice profile tuned with pitch shift (+3.5 st) and acoustic gain.",
            Category: "Voice Transformation",
            IsCustom: false,
            Effects: new List<EffectConfig>
            {
                new("pitch_shift", "Pitch Shift", true, new Dictionary<string, float> { { "Semitones", 3.5f } }),
                new("gain", "Gain", true, new Dictionary<string, float> { { "GainFactor", 1.25f } }),
                new("noise_gate", "Noise Gate", true, new Dictionary<string, float> { { "ThresholdDb", -45.0f }, { "AttackMs", 5.0f }, { "ReleaseMs", 50.0f } })
            }
        ));

        // 3. Anime Girl / Cute Character
        _presets.Add(new Preset(
            Id: "anime_girl",
            Name: "Anime Girl / Cute Voice 🎀",
            Description: "High-pitched vibrant anime character voice (+5.5 semitones).",
            Category: "Creative",
            IsCustom: false,
            Effects: new List<EffectConfig>
            {
                new("pitch_shift", "Pitch Shift", true, new Dictionary<string, float> { { "Semitones", 5.5f } }),
                new("gain", "Gain", true, new Dictionary<string, float> { { "GainFactor", 1.3f } }),
                new("noise_gate", "Noise Gate", true, new Dictionary<string, float> { { "ThresholdDb", -45.0f }, { "AttackMs", 5.0f }, { "ReleaseMs", 50.0f } })
            }
        ));

        // 4. Female Streamer / Warm Clarifier
        _presets.Add(new Preset(
            Id: "female_streamer",
            Name: "Female Streamer 🎙️",
            Description: "Smooth female broadcaster voice with warmth and room ambience.",
            Category: "Voice Transformation",
            IsCustom: false,
            Effects: new List<EffectConfig>
            {
                new("pitch_shift", "Pitch Shift", true, new Dictionary<string, float> { { "Semitones", 2.8f } }),
                new("gain", "Gain", true, new Dictionary<string, float> { { "GainFactor", 1.2f } }),
                new("reverb", "Reverb", true, new Dictionary<string, float> { { "RoomSize", 0.25f }, { "WetMix", 0.12f }, { "Damping", 0.5f } })
            }
        ));

        // 5. Radio Announcer
        _presets.Add(new Preset(
            Id: "radio_broadcaster",
            Name: "Radio Announcer 📻",
            Description: "Warm broadcast radio tone with low-end boost and noise control.",
            Category: "Voice",
            IsCustom: false,
            Effects: new List<EffectConfig>
            {
                new("gain", "Gain", true, new Dictionary<string, float> { { "GainFactor", 1.3f } }),
                new("noise_gate", "Noise Gate", true, new Dictionary<string, float> { { "ThresholdDb", -45.0f }, { "AttackMs", 5.0f }, { "ReleaseMs", 50.0f } }),
                new("pitch_shift", "Pitch Shift", true, new Dictionary<string, float> { { "Semitones", -2.0f } })
            }
        ));

        // 6. Deep Male Voice
        _presets.Add(new Preset(
            Id: "deep_voice",
            Name: "Deep Male Voice 🧔",
            Description: "Pitch-shifted deep voice effect for voice mask.",
            Category: "Voice Transformation",
            IsCustom: false,
            Effects: new List<EffectConfig>
            {
                new("pitch_shift", "Pitch Shift", true, new Dictionary<string, float> { { "Semitones", -4.0f } }),
                new("gain", "Gain", true, new Dictionary<string, float> { { "GainFactor", 1.1f } })
            }
        ));

        // 7. Ethereal Echo
        _presets.Add(new Preset(
            Id: "ethereal_echo",
            Name: "Ethereal Echo 🌌",
            Description: "Atmospheric vocal reverb with soft delay reflections.",
            Category: "Creative",
            IsCustom: false,
            Effects: new List<EffectConfig>
            {
                new("delay", "Delay", true, new Dictionary<string, float> { { "DelayMs", 250.0f }, { "Feedback", 0.4f }, { "WetMix", 0.35f } }),
                new("reverb", "Reverb", true, new Dictionary<string, float> { { "RoomSize", 0.7f }, { "WetMix", 0.4f }, { "Damping", 0.4f } })
            }
        ));
    }
}
