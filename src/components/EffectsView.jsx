import React from 'react';
import InputMeterCard from './InputMeterCard';
import EffectCard from './EffectCard';

export default function EffectsView({
  inputGain,
  setInputGain,
  meterData,
  selectedDevice,
  onOpenDeviceModal,
  effects,
  onUpdateEffect
}) {
  return (
    <div className="space-y-6">
      {/* Top Section: Audio Input & Metering */}
      <InputMeterCard
        inputGain={inputGain}
        setInputGain={setInputGain}
        meterData={meterData}
        selectedDevice={selectedDevice}
        onOpenDeviceModal={onOpenDeviceModal}
      />

      {/* Effects Rack Header */}
      <div className="flex justify-between items-center pb-2 border-b border-slate-border">
        <h2 className="font-headline-md text-base font-bold text-on-surface flex items-center gap-2">
          <span className="material-symbols-outlined text-electric-cyan">tune</span>
          DSP Effect Pipeline Rack
        </h2>
        <span className="font-mono-data text-xs text-on-surface-variant">
          6 REAL-TIME PROCESSORS
        </span>
      </div>

      {/* Rack Stack Grid */}
      <div className="space-y-4">
        {/* 1. Pitch & Formant Shift */}
        <EffectCard
          title="Pitch Shift & Formant Modulator"
          icon="graphic_eq"
          enabled={effects.pitch.enabled}
          onToggle={(val) => onUpdateEffect('pitch', { enabled: val })}
          badgeText="DSP PHASE VOCODER"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <div className="flex justify-between mb-2">
                <label className="font-label-caps text-xs text-on-surface-variant">PITCH SHIFT</label>
                <span className="font-mono-data text-xs text-active-purple font-bold">
                  {effects.pitch.semitones > 0 ? `+${effects.pitch.semitones}` : effects.pitch.semitones} st
                </span>
              </div>
              <input
                type="range"
                min="-24"
                max="24"
                value={effects.pitch.semitones}
                onChange={(e) => onUpdateEffect('pitch', { semitones: parseInt(e.target.value) })}
                className={`custom-slider ${!effects.pitch.enabled ? 'grayscale' : ''}`}
              />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <label className="font-label-caps text-xs text-on-surface-variant">FORMANT SHIFT</label>
                <span className="font-mono-data text-xs text-active-purple font-bold">
                  {effects.pitch.formant > 0 ? `+${effects.pitch.formant}` : effects.pitch.formant}
                </span>
              </div>
              <input
                type="range"
                min="-12"
                max="12"
                value={effects.pitch.formant}
                onChange={(e) => onUpdateEffect('pitch', { formant: parseInt(e.target.value) })}
                className={`custom-slider ${!effects.pitch.enabled ? 'grayscale' : ''}`}
              />
            </div>
          </div>
        </EffectCard>

        {/* 2. Robot Vocoder */}
        <EffectCard
          title="Robot / Ring Modulator"
          icon="smart_toy"
          enabled={effects.robot.enabled}
          onToggle={(val) => onUpdateEffect('robot', { enabled: val })}
          badgeText="VOCODER"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <div className="flex justify-between mb-2">
                <label className="font-label-caps text-xs text-on-surface-variant">CARRIER FREQUENCY</label>
                <span className="font-mono-data text-xs text-electric-cyan font-bold">
                  {effects.robot.carrierFreq} Hz
                </span>
              </div>
              <input
                type="range"
                min="50"
                max="1200"
                step="10"
                value={effects.robot.carrierFreq}
                onChange={(e) => onUpdateEffect('robot', { carrierFreq: parseInt(e.target.value) })}
                className={`custom-slider ${!effects.robot.enabled ? 'grayscale' : ''}`}
              />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <label className="font-label-caps text-xs text-on-surface-variant">CARRIER WAVEFORM</label>
                <span className="font-mono-data text-xs text-electric-cyan uppercase font-bold">
                  {effects.robot.carrierType}
                </span>
              </div>
              <select
                value={effects.robot.carrierType}
                onChange={(e) => onUpdateEffect('robot', { carrierType: e.target.value })}
                className="w-full bg-deep-charcoal border border-slate-border text-on-surface font-mono-data text-xs py-1.5 px-3 rounded focus:border-electric-cyan outline-none"
              >
                <option value="sawtooth">SAWTOOTH (SYNTH)</option>
                <option value="sine">SINE (PURE)</option>
                <option value="square">SQUARE (CYBER)</option>
              </select>
            </div>
          </div>
        </EffectCard>

        {/* 3. Radio / Lo-Fi Distortion */}
        <EffectCard
          title="Radio / Lo-Fi Filter & Drive"
          icon="settings_input_antenna"
          enabled={effects.radio.enabled}
          onToggle={(val) => onUpdateEffect('radio', { enabled: val })}
          badgeText="BANDPASS & DRIVE"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <div className="flex justify-between mb-2">
                <label className="font-label-caps text-xs text-on-surface-variant">LOW CUT (HIGHPASS)</label>
                <span className="font-mono-data text-xs text-electric-cyan font-bold">{effects.radio.lowCut} Hz</span>
              </div>
              <input
                type="range"
                min="100"
                max="1000"
                step="50"
                value={effects.radio.lowCut}
                onChange={(e) => onUpdateEffect('radio', { lowCut: parseInt(e.target.value) })}
                className={`custom-slider ${!effects.radio.enabled ? 'grayscale' : ''}`}
              />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <label className="font-label-caps text-xs text-on-surface-variant">HIGH CUT (LOWPASS)</label>
                <span className="font-mono-data text-xs text-electric-cyan font-bold">{effects.radio.highCut} Hz</span>
              </div>
              <input
                type="range"
                min="1500"
                max="8000"
                step="100"
                value={effects.radio.highCut}
                onChange={(e) => onUpdateEffect('radio', { highCut: parseInt(e.target.value) })}
                className={`custom-slider ${!effects.radio.enabled ? 'grayscale' : ''}`}
              />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <label className="font-label-caps text-xs text-on-surface-variant">DISTORTION DRIVE</label>
                <span className="font-mono-data text-xs text-clipping-red font-bold">{effects.radio.distortion}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={effects.radio.distortion}
                onChange={(e) => onUpdateEffect('radio', { distortion: parseInt(e.target.value) })}
                className={`custom-slider ${!effects.radio.enabled ? 'grayscale' : ''}`}
              />
            </div>
          </div>
        </EffectCard>

        {/* 4. Echo / Delay */}
        <EffectCard
          title="Echo / Feedback Delay"
          icon="graphic_eq"
          enabled={effects.echo.enabled}
          onToggle={(val) => onUpdateEffect('echo', { enabled: val })}
          badgeText="DELAY LINE"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <div className="flex justify-between mb-2">
                <label className="font-label-caps text-xs text-on-surface-variant">DELAY TIME</label>
                <span className="font-mono-data text-xs text-electric-cyan font-bold">
                  {Math.round(effects.echo.delayTime * 1000)} ms
                </span>
              </div>
              <input
                type="range"
                min="0.05"
                max="1.0"
                step="0.01"
                value={effects.echo.delayTime}
                onChange={(e) => onUpdateEffect('echo', { delayTime: parseFloat(e.target.value) })}
                className={`custom-slider ${!effects.echo.enabled ? 'grayscale' : ''}`}
              />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <label className="font-label-caps text-xs text-on-surface-variant">FEEDBACK</label>
                <span className="font-mono-data text-xs text-electric-cyan font-bold">
                  {Math.round(effects.echo.feedback * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="0.9"
                step="0.05"
                value={effects.echo.feedback}
                onChange={(e) => onUpdateEffect('echo', { feedback: parseFloat(e.target.value) })}
                className={`custom-slider ${!effects.echo.enabled ? 'grayscale' : ''}`}
              />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <label className="font-label-caps text-xs text-on-surface-variant">WET MIX</label>
                <span className="font-mono-data text-xs text-electric-cyan font-bold">
                  {Math.round(effects.echo.mix * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={effects.echo.mix}
                onChange={(e) => onUpdateEffect('echo', { mix: parseFloat(e.target.value) })}
                className={`custom-slider ${!effects.echo.enabled ? 'grayscale' : ''}`}
              />
            </div>
          </div>
        </EffectCard>

        {/* 5. Space Reverb */}
        <EffectCard
          title="Space Reverb"
          icon="blur_on"
          enabled={effects.reverb.enabled}
          onToggle={(val) => onUpdateEffect('reverb', { enabled: val })}
          badgeText="CONVOLUTION"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <div className="flex justify-between mb-2">
                <label className="font-label-caps text-xs text-on-surface-variant">DECAY TIME</label>
                <span className="font-mono-data text-xs text-primary-fixed font-bold">
                  {effects.reverb.decay}s
                </span>
              </div>
              <input
                type="range"
                min="0.5"
                max="10.0"
                step="0.1"
                value={effects.reverb.decay}
                onChange={(e) => onUpdateEffect('reverb', { decay: parseFloat(e.target.value) })}
                className={`custom-slider ${!effects.reverb.enabled ? 'grayscale' : ''}`}
              />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <label className="font-label-caps text-xs text-on-surface-variant">WET MIX</label>
                <span className="font-mono-data text-xs text-primary-fixed font-bold">
                  {Math.round(effects.reverb.mix * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={effects.reverb.mix}
                onChange={(e) => onUpdateEffect('reverb', { mix: parseFloat(e.target.value) })}
                className={`custom-slider ${!effects.reverb.enabled ? 'grayscale' : ''}`}
              />
            </div>
          </div>
        </EffectCard>

        {/* 6. Clean Voice / Noise Gate */}
        <EffectCard
          title="Clean Voice / Noise Gate"
          icon="graphic_eq"
          enabled={effects.noiseGate.enabled}
          onToggle={(val) => onUpdateEffect('noiseGate', { enabled: val })}
          badgeText="DYNAMICS"
        >
          <div>
            <div className="flex justify-between mb-2">
              <label className="font-label-caps text-xs text-on-surface-variant">SILENCE THRESHOLD</label>
              <span className="font-mono-data text-xs text-signal-green font-bold">
                {effects.noiseGate.threshold} dB
              </span>
            </div>
            <input
              type="range"
              min="-60"
              max="-10"
              step="1"
              value={effects.noiseGate.threshold}
              onChange={(e) => onUpdateEffect('noiseGate', { threshold: parseInt(e.target.value) })}
              className={`custom-slider ${!effects.noiseGate.enabled ? 'grayscale' : ''}`}
            />
          </div>
        </EffectCard>
      </div>
    </div>
  );
}
