export const DEFAULT_PRESETS = [
  {
    id: 'deep-voice',
    title: 'Deep Voice',
    tag: 'BASS',
    icon: 'water_drop',
    iconColor: 'text-active-purple',
    description: 'Pitch: -12st, Formant: -4, EQ: Low Boost',
    config: {
      pitch: { enabled: true, semitones: -12, formant: -4 },
      robot: { enabled: false },
      radio: { enabled: false },
      echo: { enabled: false },
      reverb: { enabled: false },
      noiseGate: { enabled: true, threshold: -45 }
    }
  },
  {
    id: 'high-voice',
    title: 'High Voice',
    tag: 'TREBLE',
    icon: 'air',
    iconColor: 'text-tertiary-fixed-dim',
    description: 'Pitch: +12st, Formant: +4, EQ: High Boost',
    config: {
      pitch: { enabled: true, semitones: 12, formant: 4 },
      robot: { enabled: false },
      radio: { enabled: false },
      echo: { enabled: false },
      reverb: { enabled: false },
      noiseGate: { enabled: true, threshold: -45 }
    }
  },
  {
    id: 'robot',
    title: 'Robot',
    tag: 'FX',
    icon: 'smart_toy',
    iconColor: 'text-clipping-red',
    description: 'Vocoder: On, Carrier: Sawtooth, Bands: 16',
    config: {
      pitch: { enabled: false },
      robot: { enabled: true, carrierFreq: 120, carrierType: 'sawtooth' },
      radio: { enabled: false },
      echo: { enabled: false },
      reverb: { enabled: false },
      noiseGate: { enabled: true, threshold: -40 }
    }
  },
  {
    id: 'radio',
    title: 'Radio',
    tag: 'LO-FI',
    icon: 'settings_input_antenna',
    iconColor: 'text-on-surface',
    description: 'Filter: Bandpass, Distortion: 40%, Noise: 10%',
    config: {
      pitch: { enabled: false },
      robot: { enabled: false },
      radio: { enabled: true, lowCut: 400, highCut: 3200, distortion: 40 },
      echo: { enabled: false },
      reverb: { enabled: false },
      noiseGate: { enabled: true, threshold: -45 }
    }
  },
  {
    id: 'echo',
    title: 'Echo',
    tag: 'DELAY',
    icon: 'graphic_eq',
    iconColor: 'text-secondary-fixed',
    description: 'Delay: 400ms, Feedback: 60%, Mix: 40%',
    config: {
      pitch: { enabled: false },
      robot: { enabled: false },
      radio: { enabled: false },
      echo: { enabled: true, delayTime: 0.4, feedback: 0.6, mix: 0.4 },
      reverb: { enabled: false },
      noiseGate: { enabled: true, threshold: -45 }
    }
  },
  {
    id: 'space-reverb',
    title: 'Space Reverb',
    tag: 'REVERB',
    icon: 'blur_on',
    iconColor: 'text-primary-fixed',
    description: 'Size: 100%, Decay: 8.5s, Pre-delay: 20ms',
    config: {
      pitch: { enabled: false },
      robot: { enabled: false },
      radio: { enabled: false },
      echo: { enabled: false },
      reverb: { enabled: true, decay: 8.5, mix: 0.45 },
      noiseGate: { enabled: true, threshold: -45 }
    }
  },
  {
    id: 'cyber-alien',
    title: 'Cyber Alien',
    tag: 'ALIEN',
    icon: 'adb',
    iconColor: 'text-electric-cyan',
    description: 'Pitch: +7st, Ring Mod: 180Hz, Reverb: 2.0s',
    config: {
      pitch: { enabled: true, semitones: 7, formant: 2 },
      robot: { enabled: true, carrierFreq: 180, carrierType: 'sine' },
      radio: { enabled: false },
      echo: { enabled: false },
      reverb: { enabled: true, decay: 2.0, mix: 0.3 },
      noiseGate: { enabled: true, threshold: -45 }
    }
  },
  {
    id: 'demon-lord',
    title: 'Demon Lord',
    tag: 'MONSTER',
    icon: 'local_fire_department',
    iconColor: 'text-clipping-red',
    description: 'Pitch: -16st, Formant: -8, Drive: 25%, Reverb: 5.0s',
    config: {
      pitch: { enabled: true, semitones: -16, formant: -8 },
      robot: { enabled: false },
      radio: { enabled: true, lowCut: 200, highCut: 4000, distortion: 25 },
      echo: { enabled: false },
      reverb: { enabled: true, decay: 5.0, mix: 0.4 },
      noiseGate: { enabled: true, threshold: -40 }
    }
  }
];

export class PresetManager {
  static getPresets() {
    const saved = localStorage.getItem('voicebridge_custom_presets');
    if (saved) {
      try {
        const custom = JSON.parse(saved);
        return [...DEFAULT_PRESETS, ...custom];
      } catch (e) {
        return DEFAULT_PRESETS;
      }
    }
    return DEFAULT_PRESETS;
  }

  static saveCustomPreset(preset) {
    const saved = localStorage.getItem('voicebridge_custom_presets');
    let custom = [];
    if (saved) {
      try { custom = JSON.parse(saved); } catch (e) {}
    }
    custom.push({
      ...preset,
      id: `custom-${Date.now()}`
    });
    localStorage.setItem('voicebridge_custom_presets', JSON.stringify(custom));
  }
}
