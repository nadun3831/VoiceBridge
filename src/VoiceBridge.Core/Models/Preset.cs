namespace VoiceBridge.Core.Models;

/// <summary>
/// Domain model for storing configuration parameters of an audio effect.
/// </summary>
public record EffectConfig(
    string EffectId,
    string Name,
    bool IsEnabled,
    Dictionary<string, float> Parameters
);

/// <summary>
/// Domain model representing a named Voice Profile / Preset configuration.
/// </summary>
public record Preset(
    string Id,
    string Name,
    string Description,
    string Category,
    bool IsCustom,
    List<EffectConfig> Effects
);
