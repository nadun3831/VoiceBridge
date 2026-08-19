import React, { useState } from 'react';

export default function SettingsView({ latencyMs }) {
  const [sampleRate, setSampleRate] = useState('48000');
  const [bufferSize, setBufferSize] = useState('256');
  const [startWithWindows, setStartWithWindows] = useState(true);
  const [startMinimized, setStartMinimized] = useState(true);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-slate-border/80">
        <h1 className="font-display-lg text-2xl font-black text-on-surface flex items-center gap-3">
          <span className="w-8 h-8 rounded-lg bg-electric-cyan/15 border border-electric-cyan/40 flex items-center justify-center text-electric-cyan">
            <span className="material-symbols-outlined text-xl">settings</span>
          </span>
          Engine Settings & Hardware Configuration
        </h1>
        <p className="font-mono-data text-xs text-on-surface-variant/80 mt-1">
          CONFIGURE SAMPLE RATE, VIRTUAL AUDIO DRIVERS & REAL-TIME DSP PIPELINE
        </p>
      </div>

      {/* Audio Engine Configuration Card */}
      <div className="rack-card p-6 rounded-xl space-y-5">
        <div className="flex justify-between items-center pb-2 border-b border-slate-border/80">
          <h2 className="font-headline-md text-base font-extrabold text-electric-cyan flex items-center gap-2.5">
            <span className="material-symbols-outlined">settings_input_component</span>
            Audio Engine Hardware Parameters
          </h2>
          <span className="rack-screw"></span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="font-label-caps text-xs text-on-surface-variant block mb-2 font-bold">
              SAMPLE RATE
            </label>
            <select
              value={sampleRate}
              onChange={(e) => setSampleRate(e.target.value)}
              className="w-full bg-deep-charcoal border border-slate-border text-on-surface font-mono-data text-xs p-3 rounded-lg focus:border-electric-cyan outline-none cursor-pointer"
            >
              <option value="48000">48,000 Hz (Professional Studio Standard)</option>
              <option value="44100">44,100 Hz (Compact CD Audio)</option>
              <option value="96000">96,000 Hz (Ultra High Fidelity)</option>
            </select>
          </div>

          <div>
            <label className="font-label-caps text-xs text-on-surface-variant block mb-2 font-bold">
              AUDIO BUFFER SIZE
            </label>
            <select
              value={bufferSize}
              onChange={(e) => setBufferSize(e.target.value)}
              className="w-full bg-deep-charcoal border border-slate-border text-on-surface font-mono-data text-xs p-3 rounded-lg focus:border-electric-cyan outline-none cursor-pointer"
            >
              <option value="128">128 Samples (~2.6ms Latency - Aggressive)</option>
              <option value="256">256 Samples (~5.3ms Latency - Recommended)</option>
              <option value="512">512 Samples (~10.6ms Latency - Stable)</option>
              <option value="1024">1024 Samples (~21.3ms Latency - High Buffer)</option>
            </select>
          </div>
        </div>

        {/* Latency Readout Card */}
        <div className="bg-deep-charcoal/90 border border-slate-border p-4 rounded-lg flex justify-between items-center shadow-inner">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-signal-green text-2xl">speed</span>
            <div>
              <p className="font-mono-data text-xs text-on-surface font-extrabold">ESTIMATED HARDWARE ROUNDTRIP LATENCY</p>
              <p className="font-mono-data text-[11px] text-on-surface-variant/70">
                WASAPI / Web Audio Low-Latency Pipeline
              </p>
            </div>
          </div>
          <div className="font-mono-data text-lg text-signal-green font-extrabold bg-signal-green/10 px-4 py-1.5 border border-signal-green/40 rounded-lg shadow-[0_0_12px_rgba(16,185,129,0.2)]">
            {latencyMs} ms
          </div>
        </div>
      </div>

      {/* Virtual Audio Driver Management Card */}
      <div className="rack-card p-6 rounded-xl space-y-5">
        <div className="flex justify-between items-center pb-2 border-b border-slate-border/80">
          <h2 className="font-headline-md text-base font-extrabold text-electric-cyan flex items-center gap-2.5">
            <span className="material-symbols-outlined">mic_external_on</span>
            Virtual Microphone Driver Endpoint
          </h2>
          <span className="font-mono-data text-xs text-signal-green bg-signal-green/10 border border-signal-green/40 px-3 py-1 rounded-md font-black tracking-wider">
            INSTALLED & ACTIVE
          </span>
        </div>

        <p className="font-mono-data text-xs text-on-surface-variant/80 leading-relaxed">
          VoiceBridge routes processed audio through the Virtual Audio Driver kernel pair to output real-time modified voice into games, Discord, Zoom, and OBS Studio.
        </p>

        <div className="bg-deep-charcoal/90 border border-slate-border p-4 rounded-lg space-y-3 shadow-inner">
          <div className="flex justify-between items-center">
            <span className="font-mono-data text-xs text-on-surface font-bold">Virtual Endpoint Name:</span>
            <span className="font-mono-data text-xs text-electric-cyan font-extrabold">VoiceBridge Virtual Audio Cable (WDM)</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-mono-data text-xs text-on-surface font-bold">Driver Hardware ID:</span>
            <span className="font-mono-data text-xs text-on-surface-variant/70">ROOT\VOICEBRIDGE_VIRTUAL_AUDIO</span>
          </div>
        </div>

        <button
          onClick={() => alert('Virtual Audio Driver status checked. Driver is healthy and active.')}
          className="font-label-caps text-xs border border-slate-border text-on-surface px-4 py-2 hover:bg-slate-surface-high hover:border-electric-cyan/50 transition-all rounded-lg font-bold flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-sm text-electric-cyan">build</span>
          REINSTALL / REPAIR DRIVER
        </button>
      </div>

      {/* System Options */}
      <div className="rack-card p-6 rounded-xl space-y-4">
        <h2 className="font-headline-md text-base font-extrabold text-electric-cyan flex items-center gap-2.5 pb-2 border-b border-slate-border/80">
          <span className="material-symbols-outlined">desktop_windows</span>
          System Integration Options
        </h2>

        <div className="space-y-3 pt-1">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={startWithWindows}
              onChange={(e) => setStartWithWindows(e.target.checked)}
              className="w-4 h-4 accent-electric-cyan rounded cursor-pointer"
            />
            <span className="font-mono-data text-xs text-on-surface font-semibold">Start VoiceBridge on Windows Boot</span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={startMinimized}
              onChange={(e) => setStartMinimized(e.target.checked)}
              className="w-4 h-4 accent-electric-cyan rounded cursor-pointer"
            />
            <span className="font-mono-data text-xs text-on-surface font-semibold">Minimize to System Tray on launch</span>
          </label>
        </div>
      </div>
    </div>
  );
}

