# DESIGN.md — VoiceBridge Visual Design System & UI Specification

## 1. Overview
VoiceBridge features a futuristic, dark-mode audio workstation design directly derived from the **Stitch Desktop Software Blueprint** (Project ID: `7975210265601885564`). The UI conveys professional digital audio processing capabilities with neon accent colors, high-contrast dark surfaces, technical typography, and clear visual feedback for audio metering and engine states.

This document serves as the **Visual Source of Truth** for WPF XAML styling, color palettes, custom control templates, typography, and layout structure.

---

## 2. Color Palette & Design Tokens

### 2.1 Core Palette
| Token Name | Hex Code | Purpose | Stitch Usage |
|---|---|---|---|
| `deep-charcoal` | `#0B0C0E` | App Background, Low Surfaces | Window background, input fields background |
| `slate-surface` | `#1E2126` | Card / Rack Container | Sidebar background, rack panel background |
| `slate-border` | `#2D3239` | Borders & Dividers | Card outlines, header border, slider track |
| `electric-cyan` | `#00F0FF` | Primary Accent / Active Highlight | App logo, active nav indicator, peak values |
| `active-purple` | `#7000FF` | Secondary Accent | Active slider thumbs, pitch values |
| `signal-green` | `#22C55E` | Status Active / Signal Normal | Start Engine button, Active Mic status, VU meter body |
| `clipping-red` | `#EF4444` | Warning / Clipping / Stop | Stop Engine button, VU meter peak red |
| `on-surface` | `#E2E2E6` | Primary Text | Headings, active values, button labels |
| `on-surface-variant` | `#B9CACB` | Secondary / Muted Text | Slider labels, device descriptions, status caps |

### 2.2 Surface Elevation Hierarchy
- **Level 0 (`surface-container-lowest` / `#0C0E11`):** Footer background, deep recessed slots.
- **Level 1 (`deep-charcoal` / `#0B0C0E`):** Main window canvas, meter recessed container, input text field background.
- **Level 2 (`surface-container` / `#1E2023`):** Inactive card header background.
- **Level 3 (`slate-surface` / `#1E2126`):** Card panels, sidebar navigation container.
- **Level 4 (`surface-container-high` / `#282A2D`):** Active card headers, button hover state.
- **Level 5 (`surface-container-highest` / `#333538`):** Active navigation item background, tag badges.

---

## 3. Typography System

The interface uses two primary Google Fonts:
1. **Inter:** UI labels, headings, body text, and status indicators.
2. **JetBrains Mono:** Numerical readout values, technical caps labels, dB meter scale, and system stats.

| Style Token | Font Family | Size | Weight | Line Height | Letter Spacing | Case |
|---|---|---|---|---|---|---|
| `display-lg` | Inter | 32px | 700 (Bold) | 1.2 | -0.02em | Uppercase (Logo) |
| `headline-md` | Inter | 20px | 600 (SemiBold) | 1.4 | Normal | Title Case |
| `body-base` | Inter | 14px | 400 (Regular) | 1.5 | Normal | Standard |
| `label-caps` | JetBrains Mono | 11px | 700 (Bold) | 1.0 | +0.08em | UPPERCASE |
| `mono-data` | JetBrains Mono | 12px | 500 (Medium) | 1.0 | Normal | Monospace |
| `status-indicator` | Inter | 10px | 800 (ExtraBold) | 1.0 | Normal | UPPERCASE |

---

## 4. Layout & Grid Architecture

- **Window Dimensions:** Optimized for desktop (Default: `1280x800px`, Min: `1024x640px`).
- **Header:** Fixed height `64px` (`h-16`), full-width docked at top.
- **Footer:** Fixed height `32px` (`h-8`), full-width docked at bottom.
- **Sidebar:** Fixed width `280px`, left-docked beneath Header, spanning to Footer.
- **Main Canvas:** Fills remaining space (`Margin-Left: 280px`, `Margin-Top: 64px`, `Margin-Bottom: 32px`), scrollable vertical rack layout.
- **Spacing Units:**
  - `unit` (`4px`): Base spacing step.
  - `control-stack` (`8px`): Space between input elements within a group.
  - `rack-gap` (`16px`): Gap between major rack cards and columns.
  - `container-padding` (`24px`): Inner padding for main canvas, header, and sidebar.

---

## 5. Control & Component Specifications

### 5.1 Top Header
- **Logo:** `VOICEBRIDGE` in `electric-cyan` (`#00F0FF`), font `display-lg` (32px bold uppercase).
- **Engine Controls:** Right-aligned button group.
  - **Start Engine Button:** `1px` border `signal-green` (`#22C55E`), text `signal-green`, padding `8px 16px`, font `label-caps`. Hover: `#282A2D`.
  - **Stop Engine Button:** `1px` border `clipping-red` (`#EF4444`), text `clipping-red`, padding `8px 16px`, font `label-caps`. Hover: `#282A2D`.

### 5.2 Sidebar Navigation
- **Engine Status Panel:** Top section displaying status badge:
  - Active Mic text: `VIRTUAL MIC ACTIVE` in `signal-green` (`#22C55E`) with check icon.
  - Mic Icon Box: `48x48px` `#0B0C0E` square box with `#2D3239` border.
  - Input Select Button: Full width button with `label-caps` typography and `#2D3239` border.
- **Navigation Links:** Vertical list with icon + text (`11px` bold caps):
  - Active Link (`Effects` / `Library`): Background `#333538`, left accent border `2px` `#00F0FF`, text color `#00F0FF`.
  - Inactive Link: Text `#B9CACB`, hover background `#333538`, hover text `#DBFCFF`.
- **Bottom Quick Controls:** Fixed bottom items for `Master` EQ and `Monitor` setup.

### 5.3 Input Source Rack Card
- **Header:** "Input Source" in `headline-md` (`20px`), right icon `settings_input_component` in `#00F0FF`.
- **Device List Item (Selected):**
  - Background `#0B0C0E`, border `#2D3239`, hover border `#3B494B`.
  - Icon `mic` in `#B9CACB`.
  - Title: Device Name (e.g. "Shure SM7B") in `mono-data` (`12px` `#E2E2E6`).
  - Subtitle: Sub-driver / Interface (e.g. "Focusrite USB Audio") in `label-caps` (`11px` `#B9CACB` 70% opacity).
  - Status Indicator: `12x12px` circular green dot (`#22C55E`) with green glow shadow (`rgba(34,197,94,0.6)`).
- **Device List Item (Disabled / Secondary):** Opacity `50%`, no green dot.
- **Input Gain Slider:** Label `INPUT GAIN` (`11px` `#B9CACB`), volume icons on left and right, horizontal custom range slider.

### 5.4 Peak VU Meter Card
- **Header:** "PEAK METER" label (`11px`), right readout value (e.g., `-12.4 dB`) in `#00F0FF` `mono-data`.
- **Meter Box:** Recessed container `#0B0C0E` with `#2D3239` border, `160px` height (`h-40`).
- **dB Scale Labels:** Vertical labels (`0`, `-6`, `-12`, `-24`, `-48`) in 8px `JetBrains Mono` muted.
- **Meter Bars (Stereo Left / Right):**
  - Width `24px` (`w-6`), background `#111316`.
  - Dynamic segment fill with vertical linear gradient:
    - Bottom (Low): Electric Cyan (`#00F0FF`)
    - Middle (Mid): Signal Green (`#22C55E`)
    - Top (Peak): Clipping Red (`#EF4444`)
  - Peak hold indicator line: `1px` white line (`opacity-20`) at highest peak position.

### 5.5 Effect Pipeline Cards
- **Active Card Structure (e.g. Deep Voice / Pitch Shift):**
  - Border: `1px` Electric Cyan (`#00F0FF`) with left glow accent strip (`4px` width `#00F0FF`).
  - Header Bar: Background `#282A2D`, icon `graphic_eq` (filled, cyan), title "Deep Voice", right toggle switch.
  - Controls Grid: 2-column or 3-column parameters grid.
    - Parameter Label: e.g., `PITCH SHIFT`, `FORMANT`.
    - Value Readout: `JetBrains Mono` `12px` in Active Purple (`#7000FF`).
    - Slider: Custom purple thumb slider.
- **Inactive Card Structure (e.g. Space Reverb):**
  - Opacity `60%` (hover `100%`), border `#2D3239`.
  - Header Bar: Background `#1E2023`, icon `waves` (`#B9CACB`), title "Space Reverb", toggle OFF.
  - Sliders: Grayscale styling, `pointer-events-none`.

### 5.6 Custom Controls & UI Elements
- **Custom Range Slider (WPF Slider Template):**
  - Track height: `2px`, background `#2D3239`.
  - Thumb: Width `12px`, height `20px`, corner radius `2px`, background `#7000FF` (`active-purple`) for active cards, or `#00F0FF` for gain.
- **Toggle Switch (WPF CheckBox / ToggleButton):**
  - Width `40px`, height `20px`, track background `#2D3239` (Inactive) / `#00F0FF` (Active).
  - Thumb: `20x20px` square thumb `#0B0C0E` with `#2D3239` border.
- **Status Footer:**
  - Left: `LOCAL PROCESSING ONLY` (`11px` caps `#FFE179`).
  - Right: `SYSTEM STATS` link, `LATENCY: 2.4ms` readout in `JetBrains Mono` (`#B9CACB`).

---

## 6. WPF XAML Color & Resource Dictionary Mapping

To implement this design in WPF, the following `ResourceDictionary` will be declared in `App.xaml`:

```xml
<ResourceDictionary xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
                    xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml">

    <!-- Color Brushes -->
    <SolidColorBrush x:Key="DeepCharcoalBrush" Color="#0B0C0E"/>
    <SolidColorBrush x:Key="SlateSurfaceBrush" Color="#1E2126"/>
    <SolidColorBrush x:Key="SlateBorderBrush" Color="#2D3239"/>
    <SolidColorBrush x:Key="ElectricCyanBrush" Color="#00F0FF"/>
    <SolidColorBrush x:Key="ActivePurpleBrush" Color="#7000FF"/>
    <SolidColorBrush x:Key="SignalGreenBrush" Color="#22C55E"/>
    <SolidColorBrush x:Key="ClippingRedBrush" Color="#EF4444"/>
    <SolidColorBrush x:Key="OnSurfaceBrush" Color="#E2E2E6"/>
    <SolidColorBrush x:Key="OnSurfaceVariantBrush" Color="#B9CACB"/>
    <SolidColorBrush x:Key="SurfaceContainerHighBrush" Color="#282A2D"/>
    <SolidColorBrush x:Key="SurfaceContainerHighestBrush" Color="#333538"/>
    <SolidColorBrush x:Key="SurfaceContainerLowestBrush" Color="#0C0E11"/>

    <!-- Meter Gradient -->
    <LinearGradientBrush x:Key="VuMeterGradient" StartPoint="0,1" EndPoint="0,0">
        <GradientStop Color="#00F0FF" Offset="0.0"/>
        <GradientStop Color="#22C55E" Offset="0.65"/>
        <GradientStop Color="#EF4444" Offset="0.95"/>
    </LinearGradientBrush>

    <!-- Typography Fonts -->
    <FontFamily x:Key="InterFont">pack://application:,,,/Resources/Fonts/#Inter</FontFamily>
    <FontFamily x:Key="JetBrainsMonoFont">pack://application:,,,/Resources/Fonts/#JetBrains Mono</FontFamily>

</ResourceDictionary>
```
