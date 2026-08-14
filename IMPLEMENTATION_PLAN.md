# IMPLEMENTATION_PLAN.md — VoiceBridge Implementation Blueprint

## 1. Executive Summary
This document provides the technical roadmap for building **VoiceBridge**, a Windows desktop application built with .NET 8, WPF, NAudio, and WASAPI that captures physical microphone audio, processes it using low-latency voice DSP effects, and routes it into a Virtual Microphone device for use in apps like WhatsApp Desktop, Discord, and Zoom.

---

## 2. UI Component Plan (Part 2 Breakdown)

| Component Name | Purpose | WPF Control | Required Properties | Styling & References | Data Binding | Interaction Behavior |
|---|---|---|---|---|---|---|
| `MainWindow` | Top-level host window | `Window` | `WindowStyle="None"`, `AllowsTransparency="True"`, `MinWidth="1024"`, `MinHeight="640"` | Dark Charcoal (`#0B0C0E`), Border (`#2D3239`) | `MainViewModel` | Custom title bar drag, resize handles |
| `HeaderControl` | Brand header & Engine Start/Stop buttons | `UserControl` | `Height="64"`, Dock top | `display-lg` Logo Cyan (`#00F0FF`), Green/Red Buttons | `StartEngineCommand`, `StopEngineCommand`, `IsEngineRunning` | Click Start/Stop toggles pipeline state |
| `SidebarNavigation` | Status & Navigation Menu | `UserControl` | `Width="280"`, Dock left | Slate Surface (`#1E2126`), Border (`#2D3239`) | `EngineStatus`, `SelectedView`, `SelectInputDeviceCommand` | Nav item click switches main canvas view |
| `InputDeviceSelector` | Select physical input microphone | `UserControl` / `ComboBox` | `ItemsSource`, `SelectedItem` | Card `#1E2126`, Selected Item `#0B0C0E` green dot | `AvailableInputDevices`, `SelectedInputDevice` | Dropdown change updates active capture device |
| `InputGainControl` | Adjust capture input volume gain | `Slider` | `Minimum="0"`, `Maximum="100"`, `Value` | Custom Slider Track (`#2D3239`), Thumb (`#7000FF`) | `InputGain` | Live slider change updates gain without stream restart |
| `PeakMeterControl` | Live stereo peak dB meter | `UserControl` / `Canvas` | Meter segment heights, Peak hold position | Vertical bar gradient Cyan -> Green -> Red | `PeakLevelL`, `PeakLevelR`, `PeakDbText` | Throttled 25Hz UI dispatch update |
| `PitchEffectCard` | Pitch Shift / Deep Voice control rack | `UserControl` / `Border` | Active cyan border, left glow accent strip | Active Cyan (`#00F0FF`), Header (`#282A2D`) | `PitchShiftSt`, `FormantShift`, `IsPitchEnabled` | Toggle switch enables/disables effect |
| `ReverbEffectCard` | Space Reverb control rack | `UserControl` / `Border` | Inactive grey border, toggle switch | Inactive Opacity 60%, Header (`#1E2023`) | `ReverbDecay`, `ReverbSize`, `ReverbMix`, `IsReverbEnabled` | Sliders disabled when toggle is OFF |
| `MonitoringControl` | Headphone monitoring toggle & output select | `UserControl` | `IsChecked`, `SelectedOutputDevice` | CheckBox + ComboBox | `IsMonitoringEnabled`, `SelectedMonitorDevice` | Toggles secondary audio output render |
| `StatusBarControl` | Latency & System status footer | `UserControl` | `Height="32"`, Dock bottom | Surface Lowest (`#0C0E11`), Mono text (`#B9CACB`) | `LatencyMs`, `StatusText` | Displays real-time buffer latency stats |

---

## 3. Phases 1 to 16 Implementation Roadmap

### Phase 1 — Project Setup
* **Objective:** Establish the Visual Studio solution structure, target .NET 8 WPF, configure Dependency Injection, Logging, Configuration, and Version Control.
* **Tasks:**
  1. Create solution `VoiceBridge.sln` with project libraries:
     - `VoiceBridge.Core` (Class Library)
     - `VoiceBridge.AudioEngine` (Class Library)
     - `VoiceBridge.Infrastructure` (Class Library)
     - `VoiceBridge.Application` (Class Library)
     - `VoiceBridge.UI` (WPF Application)
     - `VoiceBridge.Tests` (xUnit Test Project)
  2. Add NuGet packages: `NAudio` (v2.2.1), `Microsoft.Extensions.DependencyInjection`, `Serilog.Sinks.File`, `Serilog.Sinks.Console`, `CommunityToolkit.Mvvm`.
  3. Configure `appsettings.json` for audio default settings (sample rate: 48000 Hz, buffer: 10ms).
  4. Create folder hierarchy and `.gitignore`.
* **Files:** `VoiceBridge.sln`, `App.xaml.cs`, `appsettings.json`, `SerilogLogger.cs`.
* **Testing:** Solution builds cleanly; `Serilog` writes initial startup logs.
* **Completion Criteria:** All 6 projects build without warnings on .NET 8.

---

### Phase 2 — Architecture & Interfaces
* **Objective:** Implement core domain models, enums, contracts, and interfaces.
* **Tasks:**
  1. Define domain entities: `AudioDevice`, `VoicePreset`, `AudioFormat`, `MeterData`.
  2. Define core interfaces: `IAudioEffect`, `IAudioDeviceService`, `IAudioPipelineHost`, `IVirtualAudioDriverService`, `IApplicationStateService`, `IPresetManager`.
  3. Establish clean error hierarchy: `AudioDeviceException`, `DriverNotInstalledException`, `PipelineInitializationException`.
* **Files:** `IAudioEffect.cs`, `IAudioPipelineHost.cs`, `IAudioDeviceService.cs`, `AudioDevice.cs`, `EngineState.cs`.
* **Testing:** Unit tests verifying entity immutability and default properties.
* **Completion Criteria:** Interfaces defined with comprehensive XML doc comments.

---

### Phase 3 — Audio Device Discovery
* **Objective:** Enumerate physical microphones and speakers via NAudio WASAPI (`MMDeviceEnumerator`).
* **Tasks:**
  1. Implement `WasapiDeviceService` implementing `IAudioDeviceService`.
  2. Filter active capture (Microphone) and render (Speaker/Headphone) devices.
  3. Extract device properties: Friendly Name, Device ID, Default Sample Rate, Channels, IsDefault.
  4. Implement `DeviceWatcher` to handle hardware plug/unplug events (`IMMNotificationClient`).
* **Files:** `WasapiDeviceService.cs`, `DeviceWatcher.cs`, `AudioDevice.cs`.
* **Testing:** Unit test enumerating system devices and detecting default microphone.
* **Completion Criteria:** Available microphones and virtual devices are correctly listed with properties.

---

### Phase 4 — Real-Time Audio Capture
* **Objective:** Capture low-latency audio stream from physical mic using WASAPI shared event-driven mode.
* **Tasks:**
  1. Implement `WasapiCaptureService` using `WasapiCapture` or `WasapiIn` (Shared Mode, Event Driven).
  2. Pre-allocate lock-free `RingBuffer` (32-bit Float PCM, 48000 Hz, Stereo/Mono).
  3. Handle buffer conversions (16-bit PCM integer to 32-bit Float normalized `-1.0f` to `+1.0f`).
  4. Monitor latency and buffer underruns.
* **Files:** `WasapiCaptureService.cs`, `LockFreeRingBuffer.cs`, `AudioFrame.cs`.
* **Testing:** Capture audio from mic, verify buffer fill rate and zero memory allocation during stream.
* **Completion Criteria:** Audio thread captures continuous PCM buffers without dropping samples.

---

### Phase 5 — Audio Processing Pipeline
* **Objective:** Build an extensible audio pipeline host that passes buffers through enabled `IAudioEffect` instances sequentially.
* **Tasks:**
  1. Implement `AudioPipelineHost` implementing `IAudioPipelineHost`.
  2. Thread-safe effect chain list execution.
  3. Implement master gain and dry/wet mix stage.
  4. Compute real-time peak dB levels (Left and Right channels) with exponential decay.
* **Files:** `AudioPipelineHost.cs`, `EffectChain.cs`, `PeakMeterCalculator.cs`.
* **Testing:** Unit test verifying buffer flows sequentially through mock effects.
* **Completion Criteria:** Audio passes through empty pipeline host with < 10ms processing overhead.

---

### Phase 6 — Voice Effects Implementation
* **Objective:** Implement core MVP DSP voice effects.
* **Tasks:**
  1. **Normal / Clean:** Pass-through with optional high-pass noise gate.
  2. **Pitch Shift (Deep Voice / High Voice):** Time-domain WSOLA (Waveform Similarity Overlap-Add) or SoundTouch algorithm (-12 to +12 semitones).
  3. **Robot / Vocoder:** Ring modulation with fixed carrier frequency (e.g. 440Hz sinusoid).
  4. **Echo:** Circular delay line with feedback (10ms to 1000ms delay, wet/dry mix).
  5. **Space Reverb:** Freeverb algorithm (comb filters + allpass filters array for spatial decay).
* **Files:** `PitchShiftEffect.cs`, `RobotEffect.cs`, `EchoEffect.cs`, `ReverbEffect.cs`, `NoiseGateEffect.cs`.
* **Testing:** xUnit math tests feeding sine waves into DSP effects and asserting expected frequency/waveform output.
* **Completion Criteria:** Audibly distinct voice modulation for Deep (-12st), High (+12st), Robot, Echo, and Reverb.

---

### Phase 7 — Real-Time Controls
* **Objective:** Enable dynamic parameter tweaking (pitch, reverb decay, mix) live without stopping audio.
* **Tasks:**
  1. Use atomic primitives (`volatile float`, `Interlocked`) for effect parameters.
  2. Implement smooth parameter interpolation (smoothing coefficient) to prevent audio clicks/pops when moving sliders.
* **Files:** `PitchShiftEffect.cs`, `ReverbEffect.cs`, `AudioPipelineHost.cs`.
* **Testing:** Move slider values rapidly while audio is streaming; verify zero clicks or pops.
* **Completion Criteria:** Live slider adjustments respond instantaneously without stream interruption.

---

### Phase 8 — Monitoring
* **Objective:** Provide optional low-latency pass-through to headphones so user can audition their voice.
* **Tasks:**
  1. Implement `WasapiMonitorRenderService` targeting local headphones/speakers.
  2. Add monitoring toggle switch and volume slider.
  3. Add feedback warning indicator if physical mic and output speaker match.
* **Files:** `WasapiMonitorRenderService.cs`, `MonitoringController.cs`.
* **Testing:** Enable monitor toggle, speak into mic, verify processed voice heard in headphones.
* **Completion Criteria:** Clear monitored audio output with < 30ms headphone latency.

---

### Phase 9 — Virtual Microphone Integration
* **Objective:** Integrate with open-source Virtual Audio Driver (Virtual-Audio-Driver / VB-Cable / WASAPI endpoint).
* **Tasks:**
  1. Implement `VirtualAudioDriverService` to detect installed virtual driver endpoints.
  2. Configure WASAPI Render stream targeting "VoiceBridge Virtual Input / Cable Input".
  3. Create driver installation detection and user guidance dialog.
  4. Test audio routing into external target apps (WhatsApp Desktop, Discord, Zoom).
* **Files:** `VirtualAudioDriverService.cs`, `DriverInstallerService.cs`.
* **Testing:** Render processed audio to Virtual Device; select Virtual Microphone in Windows Sound Settings & Discord.
* **Completion Criteria:** External application receives processed voice via Virtual Microphone endpoint.

---

### Phase 10 — Stitch UI Implementation
* **Objective:** Build complete WPF XAML UI strictly matching `DESIGN.md` and Stitch visuals.
* **Tasks:**
  1. Create `App.xaml` ResourceDictionary with Stitch colors, brushes, and fonts.
  2. Implement custom WPF Control Templates: `CustomSlider`, `ToggleButton`, `VuMeterControl`.
  3. Implement Views: `MainWindow.xaml`, `DashboardView.xaml`, `PresetLibraryView.xaml`.
  4. Create MVVM ViewModels: `MainViewModel`, `DashboardViewModel`, `AudioDeviceViewModel`, `PitchEffectViewModel`.
* **Files:** `App.xaml`, `MainWindow.xaml`, `DashboardView.xaml`, `VuMeterControl.xaml`, `CustomSlider.xaml`.
* **Testing:** Run app; visual comparison with `stitch_assets/dashboard.png`.
* **Completion Criteria:** Pixel-perfect dark workstation UI matching Stitch specification.

---

### Phase 11 — Application State Management
* **Objective:** Manage and persist user configuration, presets, active devices, and pipeline states.
* **Tasks:**
  1. Implement `PresetManager` for saving/loading JSON voice presets.
  2. Save active settings (Selected Mic, Selected Output, Gain, Effect parameters) to `appsettings.json`.
  3. Auto-restore last selected configuration on app launch.
* **Files:** `PresetManager.cs`, `JsonPresetRepository.cs`, `ApplicationStateService.cs`.
* **Testing:** Modify sliders, save preset "Monster Voice", restart app; verify settings restored.
* **Completion Criteria:** Persistent user configuration across sessions.

---

### Phase 12 — Error Handling & Recovery
* **Objective:** Protect against hardware failures, driver missing states, and audio device disconnections.
* **Tasks:**
  1. Handle physical microphone disconnect gracefully (pause stream, show UI alert, auto-switch to default mic).
  2. Handle missing virtual driver on launch (show driver setup wizard).
  3. Catch WASAPI exclusive mode conflicts and fall back to shared mode.
* **Files:** `WasapiDeviceService.cs`, `AudioPipelineHost.cs`, `ErrorNotificationService.cs`.
* **Testing:** Unplug USB microphone mid-stream; verify app displays warning without crashing.
* **Completion Criteria:** Zero unhandled crashes during device disconnects.

---

### Phase 13 — Testing Strategy
* **Objective:** Execute automated and manual validation suite.
* **Tasks:**
  1. **Unit Tests (xUnit):** Test `LockFreeRingBuffer`, `WasapiDeviceService` parsing, `PitchShiftEffect` math, `PresetManager` JSON serialization.
  2. **Manual Integration Tests:** Test voice quality in WhatsApp Desktop, Discord, Zoom, OBS Studio.
* **Files:** `VoiceBridge.Tests/` project, `TestPlan.md`.
* **Testing:** Execute `dotnet test` and verify 100% pass rate on core tests.
* **Completion Criteria:** All core unit tests pass; verified voice routing in target desktop apps.

---

### Phase 14 — Performance & Latency Optimization
* **Objective:** Measure and optimize latency, CPU utilization, and memory allocations.
* **Tasks:**
  1. Profile memory using Visual Studio Diagnostic Tools (verify 0 bytes allocated on audio thread).
  2. Benchmark buffer size vs latency (Target: total latency < 50ms).
  3. Optimize DSP loop vectorization (SIMD / System.Numerics.Vectors where applicable).
* **Files:** `AudioPipelineHost.cs`, `PitchShiftEffect.cs`.
* **Testing:** Verify CPU usage < 5% on modern Quad-Core i5/i7; total latency < 45ms.
* **Completion Criteria:** Stable audio stream without stuttering or buffer underruns.

---

### Phase 15 — Packaging & Windows Installer
* **Objective:** Create a standalone Windows Installer package.
* **Tasks:**
  1. Configure WiX Toolset / Inno Setup script for `VoiceBridge`.
  2. Bundle .NET 8 Desktop Runtime (or publish as self-contained `win-x64`).
  3. Include Virtual Audio Driver setup executable with elevation prompt.
  4. Create start menu shortcuts and clean uninstaller.
* **Files:** `installer/VoiceBridgeSetup.iss`.
* **Testing:** Install on clean Windows 11 VM; verify full operational readiness.
* **Completion Criteria:** Standalone `.exe` installer installs app and configures virtual device cleanly.

---

### Phase 16 — Final Validation
* **Objective:** Execute end-to-end user verification flow.
* **Tasks:**
  1. Microphone -> VoiceBridge -> Pitch Shift (-12st) -> Virtual Mic -> Discord Call test.
  2. Verify start/stop engine lifecycle 20 times.
  3. Verify system tray minimize/restore functionality.
* **Files:** Final Verification Report.
* **Completion Criteria:** Full operational sign-off.
