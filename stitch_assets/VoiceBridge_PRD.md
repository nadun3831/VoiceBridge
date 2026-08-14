# VoiceBridge — Product Requirements Document (PRD)

## 1. Product Overview
VoiceBridge is a Windows 10/11 desktop application that captures audio from a user's physical microphone, applies real-time voice effects (pitch shift, robot/vocoder, echo, reverb, noise reduction), and routes the processed audio into a **virtual microphone device** so that any Windows application (WhatsApp Desktop, Discord, Zoom, Microsoft Teams, OBS, etc.) can use the modified voice as its microphone input, without VoiceBridge needing to integrate with each target application individually.

## 2. Problem Statement
Voice chat and streaming applications only let a user select a physical audio input device. There is no built-in Windows mechanism for a normal application to inject processed audio as a "microphone" that other apps can see. Users who want a modified voice (privacy, fun, accessibility, content creation) currently need separate paid tools (Voicemod) or manually wire up freeware audio cables. VoiceBridge provides an open, inspectable, locally-processed alternative built on transparent architecture.

## 3. Goals
- Real-time, low-latency voice effect processing (target < 50 ms end-to-end where achievable).
- A working virtual microphone that any third-party Windows application can select as input.
- Extensible effect pipeline (new effects added without touching core capture/output code).
- Fully local processing; no audio leaves the device.
- Clean, layered, testable C#/.NET codebase suitable as a reference/educational project.
- Stable operation across device changes (mic plug/unplug, default device changes).

## 4. Non-Goals
- Not a recording/podcast editing suite.
- Not a general-purpose audio router (like VoiceMeeter) — one input, one processed output.
- Not building a certified/signed kernel driver from scratch as a first release (see §16 Technical Constraints).
- No cloud-based voice conversion/AI voice cloning in MVP.
- No mobile or macOS/Linux support.
- No built-in call recording or transcription.

## 5. Target Users
- Gamers and streamers wanting a fun/anonymized voice in Discord/games.
- Privacy-conscious users who want to mask their voice in voice/video calls.
- Developers/students studying real-time audio engineering and Windows audio architecture.
- Accessibility use cases (e.g., pitch normalization) — not a medical/clinical tool.

## 6. User Stories
1. As a user, I want to pick my physical microphone from a list so VoiceBridge captures the right source.
2. As a user, I want to select a voice effect (Deep, High, Robot, Echo, Reverb, Clean) so my voice sounds different in calls.
3. As a user, I want to adjust pitch/echo/reverb/volume with sliders and hear the change live.
4. As a user, I want to select "VoiceBridge Virtual Microphone" inside Discord/Zoom/Teams/WhatsApp as my mic.
5. As a user, I want to monitor the processed voice through headphones without feedback.
6. As a user, I want visual level meters so I know my mic is working and not clipping.
7. As a user, I want the app to keep running safely if I unplug my headset mid-call.
8. As a user, I want to save my favorite settings as a preset and reload it quickly.
9. As a user, I want the app to minimize to the tray and keep running in the background.
10. As a developer/tester, I want clear errors when the virtual microphone driver isn't installed.

## 7. Functional Requirements
| ID | Requirement |
|----|-------------|
| FR-1 | List all active WASAPI capture (input) devices with name, default sample rate, and status. |
| FR-2 | Capture audio in real time from the selected physical device. |
| FR-3 | Provide an extensible effect pipeline (`IAudioEffect`) supporting Deep Voice, High Voice, Robot, Echo, Reverb, Clean Voice (noise reduction). |
| FR-4 | Allow enabling/disabling individual effects and adjusting parameters (pitch, echo amount, reverb amount, dry/wet, gain) live, without restarting the audio stream. |
| FR-5 | Render processed audio to a virtual microphone endpoint that Windows and third-party apps recognize as a standard input device. |
| FR-6 | Optional real-time monitoring of processed audio through a selected output (headphones recommended), with feedback-avoidance guidance. |
| FR-7 | Real-time input and output level meters. |
| FR-8 | Start/Stop control that cleanly initializes and tears down the whole audio graph. |
| FR-9 | Presets: Normal, Deep Voice, High Voice, Robot, Radio, Echo, Custom (save/load user presets to local config). |
| FR-10 | Detect and gracefully handle device connect/disconnect and default-device changes. |
| FR-11 | Persist settings (`appsettings.json` + user preset file) across sessions. |
| FR-12 | System tray integration: Start, Stop, Select Preset, Open, Exit. |
| FR-13 | "Start with Windows" and "minimize to tray" options. |
| FR-14 | Clearly display driver/virtual-microphone install status and guide the user through installation if missing. |

## 8. Non-Functional Requirements
- **Performance:** end-to-end latency target < 50 ms on typical hardware with small buffers (see Implementation Plan for realistic ranges); UI must never block the audio thread.
- **Stability:** must run for hours without leaking memory/handles; audio thread exceptions must not crash the app.
- **Threading:** capture/processing/render run on dedicated audio threads or WASAPI event-driven callbacks; UI updates are marshaled to the UI thread via low-frequency, throttled dispatch (e.g., level meters at ~20–30 Hz, not per-sample).
- **Portability:** Windows 10 (2004+) and Windows 11, x64 first; ARM64 best-effort.
- **Testability:** effect DSP logic and device-selection logic must be unit-testable independent of live hardware (xUnit).
- **Observability:** structured logging (Serilog) for audio pipeline state transitions, device events, and driver errors.

## 9. UI Requirements
Single main WPF window (MVVM) containing:
- Header "VoiceBridge" and status indicator (● Running / ● Stopped).
- Input device selector, virtual microphone status/selector.
- Effect selector (dropdown) + per-effect parameter panel.
- Sliders: Pitch, Echo, Reverb, Volume/Gain, Dry/Wet where applicable.
- Start / Stop buttons.
- Monitoring checkbox with output device selector.
- Input level meter and processed (output) level meter, updating live without freezing the UI.
- Presets dropdown + "Save as new preset."
- Settings dialog (audio devices, sample rate, buffer size/latency mode, startup options).
- System tray icon with context menu (Start, Stop, Select Preset, Open, Exit).
- A visible, permanent privacy notice: "Audio is processed locally on this computer and is not uploaded."

## 10. Audio Requirements
- Capture and render via **WASAPI** (through NAudio wrappers), event-driven or timer-driven shared-mode streams.
- Support common sample rates (44.1 kHz / 48 kHz) with automatic resampling to match the virtual device's format when needed.
- Configurable buffer size / latency mode (Low / Balanced / Stable) trading latency against underrun risk.
- 16-bit or 32-bit float PCM internal processing; convert at the boundaries as required by devices.
- Effect pipeline must operate on fixed-size audio frames/buffers without unbounded queuing (to avoid drift and growing latency).

## 11. Virtual Microphone Requirements
- The processed audio stream must appear in **Windows Settings → Sound → Input** as a normal input device (e.g., "VoiceBridge Virtual Microphone") selectable by any third-party application, including WhatsApp Desktop, Discord, Zoom, and Microsoft Teams.
- This requires a **kernel-mode/user-mode virtual audio driver**; NAudio alone cannot create a new system audio endpoint (see Implementation Plan, "Technical Investigation" and "Technical Risks and Feasibility" for full rationale).
- MVP approach: VoiceBridge integrates with an existing, actively maintained, **MIT-licensed open-source** virtual audio driver — [VirtualDrivers/Virtual-Audio-Driver](https://github.com/VirtualDrivers/Virtual-Audio-Driver) — which installs a virtual speaker + virtual microphone pair via the Windows Driver Kit (WDM/PortCls-based). VoiceBridge renders its processed audio (via WASAPI) into the driver's virtual speaker endpoint; the paired virtual microphone endpoint is what other apps select.
- The app must detect whether the driver is installed, guide the user to install it (with clear consent and admin-elevation prompts), and detect if the driver is missing/unavailable at runtime.
- The app must **not** ship or silently install a kernel driver without explicit user consent, and must explain what is being installed and why.
- Provide a clean uninstall path (either via the driver's own uninstaller or documented steps), and never leave orphaned virtual devices behind.
- Building a fully custom, digitally signed WDK virtual audio driver from scratch is out of scope for MVP; it is documented as a possible future enhancement (see §15).

## 12. Error Handling
| Scenario | Required Behavior |
|---|---|
| No microphone present | Disable Start; show explanatory message; keep UI responsive. |
| Microphone disconnected mid-session | Pause audio pipeline, notify user, allow reselection without app restart. |
| Virtual microphone driver not installed | Detect on startup/Start; show install guidance; do not crash. |
| Virtual microphone device unavailable/removed | Stop rendering safely; surface actionable error. |
| Insufficient permissions (mic privacy setting off, driver install requires admin) | Explain the specific Windows permission/setting to fix. |
| Unsupported audio format | Attempt automatic format negotiation/resampling; else show a clear error naming the mismatch. |
| Audio initialization failure (device busy, exclusive mode conflict) | Retry with shared mode; report failure with the underlying HRESULT/message. |

## 13. Privacy & Security
- All capture, processing, and rendering occur **locally**; no network calls involving audio.
- No audio is persisted to disk unless the user explicitly enables a recording feature (not in MVP).
- The privacy statement is shown in the UI and documented in a README/EULA-style notice.
- Any third-party driver installer is presented transparently (name, publisher, source repository, license) before installation; the user must consent.

## 14. Acceptance Criteria (MVP)
- User can select a real physical microphone from a populated device list.
- User can start VoiceBridge and speak; input and output level meters move in real time.
- At least one pitch-shift effect (Deep or High) audibly changes the voice with < ~50–150 ms perceptible added latency depending on buffer settings.
- "VoiceBridge Virtual Microphone" (backed by the chosen open-source driver) appears in Windows Sound Settings → Input while VoiceBridge is running.
- A third-party app (e.g., Windows Voice Recorder, Discord, or the Windows Sound Control Panel's "Listen" test) can select the virtual microphone and receive the processed voice.
- Start/Stop cleanly opens and releases all audio resources with no leaked WASAPI handles (verified across repeated cycles).
- Unplugging the selected physical mic during a session produces a graceful error, not a crash.
- Unit tests cover device enumeration abstraction and each DSP effect's core transform logic.

## 15. Future Enhancements
- Additional effects (chorus, distortion, whisper, formant shifting, AI-assisted noise suppression).
- Custom, digitally signed VoiceBridge-branded virtual audio driver (removing dependency on a third-party driver).
- Multi-language UI, accessibility passes (screen reader labels, high-contrast theme).
- Per-application routing (different presets triggered automatically per target app).
- Cloud-optional AI voice conversion as an explicit, opt-in, clearly-labeled feature.
- Recording/export of processed audio (opt-in, off by default).

## 16. Technical Constraints
- Windows has no supported user-mode API for an ordinary application to register a brand-new system audio endpoint; new endpoints require a kernel-mode audio driver (WDM/PortCls or AVStream), which in turn requires driver signing (or test-signing/enabling test mode) to install on modern Windows.
- NAudio and WASAPI can capture from and render to *existing* devices, including a virtual device created by a separately installed driver — but cannot themselves create that device.
- Because building, signing, and safely distributing a custom kernel driver is a substantial undertaking (see Technical Risks below), the MVP explicitly depends on an existing, actively maintained, MIT-licensed open-source driver rather than shipping a first-party driver.

---

## Technical Risks and Feasibility
The single biggest technical risk in this project is **the virtual microphone itself**, not the DSP/effects code.

- **Why it's hard:** Creating a new audio input device that Windows and third-party apps recognize requires kernel-mode driver development (WDM/PortCls, using the Windows Driver Kit). This is a fundamentally different discipline from application development — it involves driver signing (Microsoft requires EV-code-signed, WHQL-attested drivers for wide distribution on modern Windows), kernel debugging, and much higher risk of system instability (a bad driver can blue-screen the machine, not just crash an app).
- **Why a from-scratch driver is not realistic for this project's first version:** driver development, signing, and safe installer/uninstaller engineering is itself a multi-month specialist effort, separate from and larger than the WPF/NAudio application work. Attempting it as part of an MVP would jeopardize the whole project's timeline and stability.
- **The pragmatic, honest solution used here:** VoiceBridge integrates with an already-built, open-source (MIT-licensed), actively maintained virtual audio driver (VirtualDrivers/Virtual-Audio-Driver) that already solves the kernel-driver problem and is designed for exactly this "virtual speaker feeds virtual microphone" pattern. VoiceBridge's job is to be an excellent real-time DSP application that renders into that driver's virtual speaker endpoint. This keeps the project's engineering effort focused on what a C#/.NET student/production project can realistically and safely deliver, while still meeting the "real virtual microphone, not a faked one" requirement.
- **Residual risks:** dependency on a third-party driver's continued maintenance and Windows-version compatibility; users must install and trust a second piece of software; driver installation requires administrator rights and (on some Windows configurations) enabling driver installation policies; a fully first-party driver remains a valid, clearly scoped future enhancement once the application layer is proven.
