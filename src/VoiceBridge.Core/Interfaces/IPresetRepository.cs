using VoiceBridge.Core.Models;

namespace VoiceBridge.Core.Interfaces;

/// <summary>
/// Repository contract for loading, saving, and managing voice effect presets.
/// </summary>
public interface IPresetRepository
{
    /// <summary>
    /// Returns all available factory and user-defined presets.
    /// </summary>
    Task<IEnumerable<Preset>> GetAllPresetsAsync();

    /// <summary>
    /// Retrieves a specific preset by ID.
    /// </summary>
    Task<Preset?> GetPresetByIdAsync(string id);

    /// <summary>
    /// Saves or updates a custom user preset.
    /// </summary>
    Task SavePresetAsync(Preset preset);

    /// <summary>
    /// Deletes a custom user preset.
    /// </summary>
    Task DeletePresetAsync(string id);
}
