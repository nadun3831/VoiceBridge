# VoiceBridge — Implementation Plan

## Technical Investigation Summary

**What can be implemented directly in C#:**
- Device enumeration, capture, and rendering via NAudio's WASAPI wrappers (`MMDeviceEnumerator`, `WasapiCapture`, `WasapiOut`).
- All DSP: pitch shifting (e.g., a phase-vocoder or simple resampling/overlap-add technique), robot/vocoder effect, delay-based echo, convolution or Schroeder-style reverb, gain/volume, basic noise gating/spectral-subtraction-style "clean voice."
- The entire WPF UI, MVVM view models, presets, settings persistence, tray icon, level metering, threading/dispatcher marshaling.
- Detecting installed audio devices, including a virtual driver's endpoints once installed.

**What requires native Windows functionality (not pure C#, but reachable via existing OS/driver services — no custom native code needed):**
- WASAPI itself (accessed through NAudio's COM interop) for low-latency, shared-mode capture/render.
- Reading/writing default communication device roles, listening for `IMMNotificationClient` device-change events (also wrapped by NAudio).

**What requires a third-party/open-source virtual audio driver (cannot be done in C# alone):**
- Creating a brand-new system-level audio *endpoint* ("VoiceBridge Virtual Microphone") that shows up in Windows Sound Settings and in third-party apps' device pickers. This requires a kernel-mode WDM/PortCls (or AVStream) driver. VoiceBridge will depend on the open-source, MIT-licensed **VirtualDrivers/Virtual-Audio-Driver** project, which already provides a virtual speaker + virtual microphone pair built with the Windows Driver Kit. VoiceBridge's C# app renders processed audio (via WASAPI) into the driver's virtual speaker endpoint; the paired virtual microphone endpoint is what Discord/Zoom/Teams/WhatsApp select as input.

**What is not realistic for this project (documented, not attempted in MVP):**
- Writing, signing, and distributing a brand-new first-party kernel-mode audio driver from scratch. This is a specialist, multi-month effort involving WDK development, driver signing (EV certificate / attestation signing), and kernel-level QA — categorically different work from the C#/WPF application, and out of scope for an educational/MVP timeline.

---

## Folder Structure

```
VoiceBridge/
│
├── VoiceBridge.App/                 # WPF UI (MVVM)
│   ├── Views/
│   ├── ViewModels/
│   ├── Services/                    # UI-facing services (tray, dialogs, navigation)
│   └── Resources/
│
├── VoiceBridge.Core/                # Pure domain logic, no Windows/NAudio dependency
│   ├── Audio/                       # Pipeline orchestration abstractions
│   ├── Effects/                     # IAudioEffect implementations (pure DSP, testable)
│   ├── Models/                      # DeviceInfo, PresetModel, EffectSettings, etc.
│   └── Interfaces/                  # IAudioCaptureService, IAudioRenderService, IDeviceProvider...
│
├── VoiceBridge.Infrastructure/      # NAudio/WASAPI + driver integration
│   ├── Audio/                       # WasapiCaptureService, WasapiRenderService
│   ├── Devices/                     # Device enumeration, change notifications
│   ├── VirtualMicrophone/           # Detection/setup helpers for the virtual driver
│   └── Configuration/               # appsettings.json, preset file I/O
│
└── VoiceBridge.Tests/                # xUnit tests (Core DSP + device-selection logic)
```

---

## Phase 1 — Project Setup
**Objective:** Stand up the solution skeleton with clean architecture boundaries and DI.
**Tasks:** Create solution + 4 projects; wire `Microsoft.Extensions.DependencyInjection` and `Microsoft.Extensions.Hosting`/generic host in the WPF app; add Serilog; add NAudio and NAudio.Wasapi packages; set up `appsettings.json` loading.
**Files/classes:** `VoiceBridge.sln`, `App.xaml(.cs)` with `Host.CreateDefaultBuilder`, `appsettings.json`, `LoggingConfig`.
**Technologies/APIs:** .NET 8, WPF, Microsoft.Extensions.*, Serilog, NAudio.
**Expected result:** App launches to an empty main window; DI container resolves a placeholder service; logs write to file/console.
**Testing:** Manual smoke test (app starts/stops cleanly); one xUnit test verifying DI container builds successfully.
**Dependencies:** None.

## Phase 2 — Audio Device Discovery
**Objective:** Enumerate physical input (and later output/virtual) devices.
**Tasks:** Implement `IDeviceProvider` (Core) and `WasapiDeviceProvider` (Infrastructure) using `MMDeviceEnumerator`; map to `DeviceInfo` (name, id, default sample rate, is-default flag); subscribe to device add/remove/default-changed notifications.
**Files/classes:** `IDeviceProvider`, `DeviceInfo`, `WasapiDeviceProvider`, `DeviceChangeNotifier`.
**Technologies/APIs:** NAudio `MMDeviceEnumerator`, `IMMNotificationClient`.
**Expected result:** A bindable list of input devices refreshes automatically on hardware changes.
**Testing:** Unit tests against a fake `IDeviceProvider`; manual test plugging/unplugging a USB mic.
**Dependencies:** Phase 1.

## Phase 3 — Microphone Capture
**Objective:** Capture low-latency audio from the selected device without blocking the UI.
**Tasks:** Implement `IAudioCaptureService`/`WasapiCaptureService` wrapping `WasapiCapture` (event-driven, shared mode); expose a buffered/event-based frame stream; handle format negotiation (resample if needed).
**Files/classes:** `IAudioCaptureService`, `WasapiCaptureService`, `AudioFrame`, `RingBuffer` (fixed-size, non-growing).
**Technologies/APIs:** NAudio `WasapiCapture`, `BufferedWaveProvider` or a custom lock-free ring buffer.
**Expected result:** Raw microphone audio is captured continuously with a stable, small buffer and exposed to the processing layer.
**Testing:** Unit test ring buffer read/write correctness under load; manual test verifying no growing latency over a 10-minute run.
**Dependencies:** Phase 2.

## Phase 4 — Audio Pipeline
**Objective:** Build the extensible, ordered effect chain.
**Tasks:** Define `IAudioEffect` (Process(float[] buffer, AudioFormat format)); implement `EffectPipeline` that runs an ordered, enable/disable-aware list of effects; ensure thread-safe live reconfiguration (swap parameters without stopping the stream).
**Files/classes:** `IAudioEffect`, `EffectPipeline`, `EffectSettings`, `PipelineStage` enum/order.
**Technologies/APIs:** Plain C#/.NET (no Windows dependency — lives in Core, fully unit-testable).
**Expected result:** A no-op pipeline runs capture straight through to a null sink with measurable per-buffer processing time.
**Testing:** Unit tests for pipeline ordering, enable/disable toggling, and thread-safety under concurrent parameter updates.
**Dependencies:** Phase 3.

## Phase 5 — Basic Voice Effects
**Objective:** Implement MVP effects.
**Tasks:** Implement `DeepVoiceEffect`/`HighVoiceEffect` (resampling-based pitch shift or simple time-domain overlap-add pitch shifter), `RobotEffect` (ring modulation/vocoder-style), `EchoEffect` (delay line + feedback), `ReverbEffect` (Schroeder/comb+allpass network), `CleanVoiceEffect` (noise gate / simple spectral noise reduction).
**Files/classes:** One class per effect in `VoiceBridge.Core/Effects/`, each implementing `IAudioEffect`.
**Technologies/APIs:** Pure DSP math (delay lines, comb/allpass filters, simple PSOLA or resample-based pitch shift).
**Expected result:** Each effect audibly and correctly modifies a test tone/voice sample in isolation.
**Testing:** Unit tests with synthetic signals (e.g., verify echo effect introduces a delayed, attenuated copy; verify pitch shift changes fundamental frequency by the expected ratio via FFT check).
**Dependencies:** Phase 4.

## Phase 6 — Real-Time Controls
**Objective:** Bind UI sliders/toggles to live pipeline parameters.
**Tasks:** MVVM view models exposing bindable properties (Pitch, Echo, Reverb, Volume, Dry/Wet) that push updates into `EffectPipeline` via thread-safe setters; debounce/throttle UI-to-audio updates.
**Files/classes:** `MainViewModel`, `EffectControlViewModel`, `RelayCommand`.
**Technologies/APIs:** WPF data binding, `INotifyPropertyChanged`.
**Expected result:** Moving a slider changes the processed sound within one buffer cycle, with no audio glitches or UI freezing.
**Testing:** Manual A/B listening tests; unit tests on view model property change propagation.
**Dependencies:** Phase 5.

## Phase 7 — Audio Monitoring
**Objective:** Let the user hear processed audio locally, safely.
**Tasks:** Implement `WasapiRenderService` for a monitoring output (headphones/speakers), tee'd off the same processed buffer used for the virtual mic; add UI warning about feedback risk when speakers are selected instead of headphones.
**Files/classes:** `IMonitoringService`, `WasapiMonitorRenderService`.
**Technologies/APIs:** NAudio `WasapiOut`.
**Expected result:** Enabling monitoring plays the processed voice through the chosen output with minimal added delay.
**Testing:** Manual test for feedback behavior with speakers vs. headphones; verify toggling monitoring on/off doesn't disrupt the virtual mic stream.
**Dependencies:** Phase 4.

## Phase 8 — Virtual Microphone Integration
**Objective:** Route processed audio into the installed open-source virtual audio driver so external apps see "VoiceBridge Virtual Microphone."
**Tasks:** Implement `VirtualMicrophoneRenderService` that renders the processed buffer via WASAPI into the driver's virtual speaker endpoint (the paired virtual microphone endpoint is then selectable by other apps); implement `VirtualDriverDetector` to check whether the driver's devices are present; document the expected endpoint names.
**Files/classes:** `IVirtualMicrophoneService`, `VirtualMicrophoneRenderService`, `VirtualDriverDetector` (all in `VoiceBridge.Infrastructure/VirtualMicrophone/`).
**Technologies/APIs:** NAudio WASAPI render against the driver's virtual speaker device id; VirtualDrivers/Virtual-Audio-Driver (external dependency).
**Expected result:** With the driver installed, starting VoiceBridge makes "VoiceBridge Virtual Microphone" (backed by the driver) selectable and live in another application (e.g., the Windows Sound Control Panel's "Listen" test, or Discord's mic test).
**Testing:** Manual end-to-end test selecting the virtual mic in a real target app; automated test only for the detection/enumeration logic (rendering itself needs a live device, so it's excluded from unit tests and covered by a documented manual test script).
**Dependencies:** Phase 7; requires the driver installed (Phase 9).

## Phase 9 — Device/Driver Installation
**Objective:** Get the virtual audio driver onto the user's machine safely and transparently.
**Tasks:** On first run (or on-demand from Settings), detect whether the driver is installed; if not, show a consent dialog explaining what will be installed (name, publisher, source repo, license — MIT) and link to/launch the official driver installer (requires admin elevation); after install, re-enumerate devices; document manual uninstall steps (Device Manager / driver's own uninstaller) and add an in-app "Open driver uninstall instructions" link.
**Files/classes:** `DriverInstallViewModel`, `DriverInstallerLauncher`.
**Technologies/APIs:** Process launch with elevation (`ProcessStartInfo.Verb = "runas"`), Windows Device Manager APIs (read-only enumeration via WMI/SetupAPI if needed for status display).
**Expected result:** A user with no driver installed is guided, with explicit consent, to install it; a user who already has it installed skips straight to normal operation.
**Testing:** Manual test on a clean VM: fresh Windows install → first run → guided install → virtual mic appears; manual uninstall test confirming devices disappear cleanly.
**Dependencies:** Phase 2 (device enumeration), independent of Phases 3–8 but required before Phase 8 works end-to-end.

## Phase 10 — UI Completion
**Objective:** Finish the full main window, settings dialog, presets UI, level meters, and tray integration.
**Tasks:** Level meter control (throttled, e.g. 20–30 Hz updates from a background timer, not per-sample); presets dropdown + save dialog; Settings window (devices, sample rate, buffer/latency mode, startup options); tray icon + context menu; apply the app's visual theme.
**Files/classes:** `LevelMeterControl` (custom WPF control or simple progress bars), `PresetsViewModel`, `SettingsViewModel`, `TrayIconService`.
**Technologies/APIs:** WPF custom controls, `System.Windows.Forms.NotifyIcon` (or a WPF-native tray library), `Hardcodet.NotifyIcon.Wpf` if desired.
**Expected result:** The UI matches the PRD's described layout and is fully navigable without freezing during audio processing.
**Testing:** Manual UI walkthrough against the PRD's UI requirements checklist.
**Dependencies:** Phases 2–9 for the data each control displays.

## Phase 11 — Testing
**Objective:** Solidify automated coverage and run structured manual/integration passes.
**Tasks:** Expand xUnit coverage for Core (effects, pipeline, presets, device abstraction with fakes); write an integration test checklist for audio-dependent behavior that can't be unit tested (capture/render/virtual mic); run a 2+ hour soak test for leaks; test device hot-plug/unplug scenarios; test with each target app (Discord, Zoom, Teams, WhatsApp Desktop) selecting the virtual mic.
**Files/classes:** Test projects under `VoiceBridge.Tests/`; a `MANUAL_TEST_PLAN.md` doc.
**Technologies/APIs:** xUnit, (optionally) FluentAssertions, Moq for fakes.
**Expected result:** High confidence in DSP correctness and documented, repeatable manual verification for the audio-hardware-dependent parts.
**Testing:** This phase *is* the testing; exit criteria = all unit tests green + manual test plan fully executed with results recorded.
**Dependencies:** All prior phases.

## Phase 12 — Performance Optimization
**Objective:** Hit the latency and stability targets.
**Tasks:** Profile buffer sizes vs. latency/underrun tradeoffs; minimize allocations in the hot audio path (pre-allocated buffers, avoid LINQ/boxing in the pipeline); tune thread priorities for capture/render threads; verify UI dispatcher calls are throttled and never occur per-sample.
**Files/classes:** Adjustments across `VoiceBridge.Infrastructure/Audio` and `VoiceBridge.Core/Effects` for allocation reduction.
**Technologies/APIs:** .NET performance profiling (dotnet-trace, Visual Studio Profiler), NAudio buffer/latency configuration.
**Expected result:** Documented, measured end-to-end latency numbers per buffer/latency setting (realistic range likely ~20–100 ms depending on hardware and settings; sub-10 ms is not realistic with this architecture — see Risks).
**Testing:** Repeatable latency measurement method (e.g., loopback click-to-click timing) documented and re-run after each optimization.
**Dependencies:** Phase 11.

## Phase 13 — Packaging
**Objective:** Produce an installable build.
**Tasks:** Configure self-contained or framework-dependent publish profile; bundle app settings/defaults; decide whether the virtual driver installer is bundled or downloaded/launched on demand (recommendation: launch the official installer rather than bundling, to always get the latest signed driver and respect its own license/distribution terms); write install/uninstall docs.
**Files/classes:** `publish profile (.pubxml)`, packaging scripts.
**Technologies/APIs:** `dotnet publish`, optionally MSIX or a simple installer (Inno Setup/WiX) for the app itself.
**Expected result:** A single installer/zip that installs VoiceBridge and guides the user through the separate driver install.
**Testing:** Clean-VM install/uninstall test.
**Dependencies:** Phase 12.

## Phase 14 — Deployment/Distribution
**Objective:** Make the app available and documented for real use.
**Tasks:** Write end-user README (what VoiceBridge does, privacy statement, driver dependency and its license, how to install/uninstall, troubleshooting); decide on distribution channel (GitHub Releases, etc.); tag a versioned release.
**Files/classes:** `README.md`, `CHANGELOG.md`, `LICENSE`.
**Technologies/APIs:** GitHub Releases or equivalent.
**Expected result:** A documented, versioned, installable release.
**Testing:** Fresh-machine install from the published artifact, following only the published docs.
**Dependencies:** Phase 13.

---

## Development Milestones
1. **M1 (Phases 1–4):** App skeleton + working capture pipeline (no effects, no UI polish, no virtual mic yet).
2. **M2 (Phases 5–7):** Effects audible + real-time controls + monitoring working end-to-end in a bare-bones UI.
3. **M3 (Phases 8–9):** Virtual microphone working end-to-end with the open-source driver — this is the MVP-defining milestone.
4. **M4 (Phase 10):** Full UI per PRD.
5. **M5 (Phases 11–12):** Test coverage + performance targets met and documented.
6. **M6 (Phases 13–14):** Packaged, documented, released MVP.

---

## Technical Risks and Feasibility
The dominant risk in this project remains **the virtual microphone layer**, exactly as flagged in the PRD:

- **Core risk:** No pure-C#/user-mode technique can create a new Windows audio *device*; it requires a kernel-mode WDM/PortCls driver, which is a different engineering discipline (kernel debugging, driver signing, higher blast radius for bugs). Building one from scratch is realistically a separate, multi-month specialist project — not appropriate to attempt inside this MVP's timeline.
- **Mitigation chosen:** Depend on the actively maintained, MIT-licensed, open-source **VirtualDrivers/Virtual-Audio-Driver**, which already solves the kernel-driver problem with a "virtual speaker → virtual microphone" pattern well suited to VoiceBridge's needs. This keeps VoiceBridge's own scope honestly limited to what a WPF/NAudio application can and should do: excellent real-time capture, DSP, and rendering into an already-provided device — while still delivering a genuine, real-time, OS-level virtual microphone (not a faked file-based one).
- **Secondary risks:**
  - *Driver trust/maintenance:* VoiceBridge takes a runtime dependency on a third-party open-source project; if it stops being maintained or breaks on a future Windows update, VoiceBridge's virtual-mic feature breaks until the dependency is updated or replaced.
  - *Installation friction:* installing any kernel driver requires administrator rights and user trust; some managed/corporate machines may block driver installation entirely via policy — this must be clearly communicated as a known limitation, not hidden.
  - *Latency realism:* sub-10 ms end-to-end latency is not realistic with a WASAPI-capture → C# DSP → WASAPI-render → virtual-driver → WASAPI-capture (by the target app) chain; a defensible, honestly-communicated target is roughly 20–100 ms depending on buffer settings and hardware, and this should be measured and disclosed rather than promised as sub-50 ms unconditionally.
  - *Effect quality:* simple resampling-based pitch shifting is cheap and low-latency but introduces some timbre/formant artifacts; higher-quality pitch shifting (PSOLA, phase vocoder) costs more CPU and latency — this is a deliberate, documented quality/latency tradeoff, not an oversight.
- **What would change this plan:** if a future Windows API allows user-mode registration of virtual audio endpoints (none currently exists as of this writing), or if VoiceBridge later invests in its own signed driver (documented as a Future Enhancement), the dependency on a third-party driver could be removed.
