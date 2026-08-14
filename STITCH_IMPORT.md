# STITCH_IMPORT.md — Stitch Asset Import & UI Audit Log

## 1. Executive Summary
This document logs the inspection, extraction, download, and translation of assets from the official Stitch project **Desktop Software Blueprint** for VoiceBridge.

- **Stitch Project Title:** Desktop Software Blueprint
- **Stitch Project ID:** `7975210265601885564`
- **Primary Source of Truth:** Stitch MCP Server & Downloaded HTML/CSS/Image Artifacts

---

## 2. Inventory of Extracted Stitch Screens & Assets

| Asset Name | Asset Type | Stitch ID / File Name | Downloaded Local File | Format | Width/Height |
|---|---|---|---|---|---|
| VoiceBridge Dashboard | UI Screen | `22de9199358e499f9342f626814c5832` | `stitch_assets/dashboard.html` | HTML5/CSS | `2560 x 2048` |
| Dashboard Screenshot | Image Preview | `1198729777739291406` | `stitch_assets/dashboard.png` | PNG | `2560 x 2048` |
| Presets Library | UI Screen | `598a9c65a3e44fcf98e675dbc0f4e3ea` | `stitch_assets/presets.html` | HTML5/CSS | `2560 x 2048` |
| Presets Screenshot | Image Preview | `fileEntries/screenshot` | `stitch_assets/presets.png` | PNG | `2560 x 2048` |
| VoiceBridge PRD | Requirements Doc | `17954683645231588516` | `stitch_assets/VoiceBridge_PRD.md` | Markdown | Document |

---

## 3. Stitch Hosted Asset Download Log

The hosted assets were retrieved using `curl.exe` with direct download URLs provided by the Stitch MCP server:

```powershell
# Dashboard HTML
curl.exe -L "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzAwMDY1OTAyYTNkMmFjY2IwNTRjYzM5ZDI1MjUxNmZjEgsSBxDqnfel6QQYAZIBIwoKcHJvamVjdF9pZBIVQhM3OTc1MjEwMjY1NjAxODg1NTY0&filename=&opi=89354086" -o stitch_assets/dashboard.html

# Dashboard PNG
curl.exe -L "https://lh3.googleusercontent.com/aida/AP1WRLuL_oyrVMOVscCRSzMFHiqQY9CKbDbYqbSpYHYAMbo3O3is-t5s1Ful7i02J_6HcWQpJAyK5V4IJHtoLTv_sqZd9ubJeBQmiLtIn4m6q-HLeRTtCZO8UlmsCueqNcKHaqcFUJC4NHZ0EFrMlIuAm1M7Sw2XHP4d8APRvIzftH_GqbvLEXxtLIXFPHs6VF6yLWMAB7Z_YumZvnTEMI1l-4BRSMgyzbZrjp04fyv1GQIn4N-Me7s43OLFTqs" -o stitch_assets/dashboard.png

# Presets Library HTML
curl.exe -L "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzAwMDY1OTAyYmQ0OGNkNTEwNzkyZjNjMzkyMDFlMjBmEgsSBxDqnfel6QQYAZIBIwoKcHJvamVjdF9pZBIVQhM3OTc1MjEwMjY1NjAxODg1NTY0&filename=&opi=89354086" -o stitch_assets/presets.html

# Presets Library PNG
curl.exe -L "https://lh3.googleusercontent.com/aida/AP1WRLuf--eCwBM-wqCLVm2xN-9dM39Mrg-ThkeV_LLtPreKTyBVPF-CoAgXI1qjySyngzFa4d4EDhi5HfVmo7osG2gtlELKhXi4dRoUzIfi3cpdJFf9Mn2jHGbXLJg84Zkv6n42fGFR5y-dGQCuEIO5sFbC3MnsDEIlfrE5KeryZZTJyreOF2tv6lESMP89ryhQoaV1Pgp56BxjIyHLAJrp_FRhtux0eth6ZJs0MHI7tHGJDo1zWr-7zZPqJ4g" -o stitch_assets/presets.png

# VoiceBridge PRD
curl.exe -L "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBKNARIhYXBwX2NvbXBhbmlvbl91c2VyX3VwbG9hZGVkX2ZpbGVzGmgKM3VzZXJfdXBsb2FkZWRfaHRtbF8wMDA2NTkwMjk4YzEzZTFiMDM5MmM2YTdmNjAxOGJlZBILEgcQ6p33pekEGAGSASMKCnByb2plY3RfaWQSFUITNzk3NTIxMDI2NTYwMTg4NTU2NA&filename=&opi=89354086" -o stitch_assets/VoiceBridge_PRD.md
```

---

## 4. Stitch Structure to WPF Architecture Mapping

| Stitch Component (HTML/CSS) | Visual Role | Target WPF Control / View | Data Binding Source |
|---|---|---|---|
| `<header class="bg-deep-charcoal ...">` | Window Header & Global Controls | `HeaderControl.xaml` | `MainViewModel.StartEngineCommand`, `StopEngineCommand` |
| `<nav class="bg-slate-surface ...">` | Left Sidebar Navigation | `SidebarNavigation.xaml` | `MainViewModel.EngineStatus`, `SelectedView` |
| `input_source_card` | Input Device Selection Card | `InputDeviceSelectorView.xaml` | `AudioDeviceViewModel.AvailableInputDevices`, `SelectedDevice` |
| `input_gain_slider` | Physical Input Gain Slider | `CustomSlider` control template | `AudioDeviceViewModel.InputGain` |
| `peak_meter` | Stereo VU Meter Display | `VuMeterControl.xaml` | `AudioEngine.PeakLevelL`, `PeakLevelR` |
| `pitch_effect_card` | Deep Voice Pitch Shift Module | `PitchEffectCard.xaml` | `PitchEffectViewModel.PitchShift`, `Formant`, `IsEnabled` |
| `reverb_effect_card` | Space Reverb DSP Module | `ReverbEffectCard.xaml` | `ReverbEffectViewModel.Decay`, `Size`, `Mix`, `IsEnabled` |
| `<footer class="bg-surface-container-lowest ...">` | App Status & Latency Footer | `StatusBarControl.xaml` | `AudioEngine.LatencyMs`, `SystemStatus` |
| `preset_grid_card` | Preset Card Item | `PresetCardControl.xaml` | `PresetLibraryViewModel.PresetsList` |

---

## 5. Visual Icon & Asset Catalog

The Stitch layout relies on **Google Material Symbols Outlined** (Weights: `400`, Fill: `0` / `1`). In WPF, these will be rendered via Path Geometry or bundled TrueType Font (`MaterialSymbolsOutlined.ttf`):

| Icon Name | Context in Stitch | WPF Geometry / Glyph Code |
|---|---|---|
| `mic` | Input device icon | `\xE029` |
| `mic_external_on` | Sidebar virtual mic icon | `\xEF66` |
| `check_circle` | Virtual mic active status | `\xE86C` |
| `settings_input_component` | Hardware routing header icon | `\xE8C7` |
| `tune` | Effects navigation icon | `\xE429` |
| `library_music` | Presets Library navigation icon | `\xE030` |
| `settings` | Settings navigation icon | `\xE8B8` |
| `graphic_eq` | Pitch effect header & Master link | `\xE1B8` |
| `waves` | Reverb effect header icon | `\xE176` |
| `headphones` | Monitor output setup icon | `\xE310` |
| `volume_down` / `volume_up` | Gain slider min/max icons | `\xE04D` / `\xE04E` |
| `add` | Create preset button | `\xE145` |
| `search` | Search presets input field | `\xE8B6` |

---

## 6. Audit Summary & Compliance Affirmation

- **Visual Source of Truth Verification:** 100% of hex color codes, font sizes, line heights, radii, and component proportions have been parsed directly from `stitch_assets/dashboard.html` and cataloged into `DESIGN.md`.
- **Zero Redesign Principle:** The WPF application layout will mirror the 2-column rack grid, sidebar navigation, top header engine buttons, and bottom latency indicator without visual deviation.
