namespace VoiceBridge.Core.Models;

/// <summary>
/// Status states of the VoiceBridge Audio Processing Engine.
/// </summary>
public enum EngineState
{
    Stopped,
    Starting,
    Running,
    Stopping,
    Error
}
