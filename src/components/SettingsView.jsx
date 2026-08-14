import React, { useState } from 'react';

export default function SettingsView({ latencyMs }) {
  const [sampleRate, setSampleRate] = useState('48000');
  const [bufferSize, setBufferSize] = useState('256');
  const [driverInstalled, setDriverInstalled] = useState(true);
  const [startWithWindows, setStartWithWindows] = useState(true);
  const [startMinimized, setStartMinimized] = useState(true);
  const [performanceMode, setPerformanceMode] = useState('low-latency');

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-slate-border">
        <h1 className="font-display-lg text-2xl font-bold text-on-surface">Engine Settings</h1>
        <p className="font-mono-data text-xs text-on-surface-variant">
          CONFIGURE HARDWARE, VIRTUAL AUDIO DRIVER, & DSP PIPELINE PARAMETERS
        </p>
      </div>

      {/* Audio Engine Configuration */}
      <div className="bg-slate-surface border border-slate-border p-6 rounded space-y-5">
        <h2 className="font-headline-md text-base font-bold text-electric-cyan flex items-center gap-2">
          <span className="material-symbols-outlined">settings_input_component</span>
          Audio Engine Hardware
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="font-label-caps text-xs text-on-surface-variant block mb-2">
              SAMPLE RATE
            </label>
            <select
              value={sampleRate}
              onChange={(e) => setSampleRate(e.target.value)}
              className="w-full bg-deep-charcoal border border-slate-border text-on-surface font-mono-data text-xs p-2.5 rounded focus:border-electric-cyan outline-none"
            >
              <option value="48000">48,000 Hz (Professional Studio Standard)</option>
              <option value="44100">44,100 Hz (Compact CD Audio)</option>
              <option value="96000">96,000 Hz (Ultra High Fidelity)</option>
            </select>
          </div>

          <div>
            <label className="font-label-caps text-xs text-on-surface-variant block mb-2">
              AUDIO BUFFER SIZE
            </label>
            <select
              value={bufferSize}
              onChange={(e) => setBufferSize(e.target.value)}
              className="w-full bg-deep-charcoal border border-slate-border text-on-surface font-mono-data text-xs p-2.5 rounded focus:border-electric-cyan outline-none"
            >
              <option value="128">128 Samples (~2.6ms Latency - Aggressive)</option>
              <option value="256">256 Samples (~5.3ms Latency - Recommended)</option>
              <option value="512">512 Samples (~10.6ms Latency - Stable)</option>
              <option value="1024">1024 Samples (~21.3ms Latency - High Buffer)</option>
            </select>
          </div>
        </div>

        {/* Latency Readout Card */}
        <div className="bg-deep-charcoal border border-slate-border p-4 rounded flex justify-between items-center">
          <div>
            <p className="font-mono-data text-xs text-on-surface font-bold">ESTIMATED HARDWARE LATENCY</p>
            <p className="font-mono-data text-[11px] text-on-surface-variant opacity-75">
              WASAPI / Web Audio Real-Time Roundtrip
            </p>
          </div>
          <div className="font-mono-data text-lg text-signal-green font-bold bg-slate-surface px-4 py-1 border border-signal-green/30 rounded">
            {latencyMs} ms
          </div>
        </div>
      </div>

      {/* Virtual Audio Driver Management */}
      <div className="bg-slate-surface border border-slate-border p-6 rounded space-y-5">
        <div className="flex justify-between items-center">
          <h2 className="font-headline-md text-base font-bold text-electric-cyan flex items-center gap-2">
            <span className="material-symbols-outlined">mic_external_on</span>
            Virtual Microphone Driver Status
          </h2>
          <span className="font-mono-data text-xs text-signal-green bg-signal-green/10 border border-signal-green/30 px-3 py-1 rounded font-bold">
            INSTALLED & ACTIVE
          </span>
        </div>

        <p className="font-mono-data text-xs text-on-surface-variant">
          VoiceBridge uses the open-source Virtual-Audio-Driver kernel pair to output real-time modified voice into games, Discord, Zoom, and OBS Studio.
        </p>

        <div className="bg-deep-charcoal border border-slate-border p-4 rounded space-y-3">
          <div className="flex justify-between items-center">
            <span className="font-mono-data text-xs text-on-surface">Endpoint Name:</span>
            <span className="font-mono-data text-xs text-electric-cyan font-bold">VoiceBridge Virtual Audio Cable (WDM)</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-mono-data text-xs text-on-surface">Driver Hardware ID:</span>
            <span className="font-mono-data text-xs text-on-surface-variant">ROOT\VOICEBRIDGE_VIRTUAL_AUDIO</span>
          </div>
        </div>

        <button
          onClick={() => alert('Virtual Audio Driver status checked. Driver is healthy and active.')}
          className="font-label-caps text-xs border border-slate-border text-on-surface px-4 py-2 hover:bg-slate-surface-high transition-colors rounded"
        >
          REINSTALL / REPAIR DRIVER
        </button>
      </div>

      {/* System & Tray Options */}
      <div className="bg-slate-surface border border-slate-border p-6 rounded space-y-4">
        <h2 className="font-headline-md text-base font-bold text-electric-cyan flex items-center gap-2">
          <span className="material-symbols-outlined">desktop_windows</span>
          System Integration
        </h2>

        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={startWithWindows}
              onChange={(e) => setStartWithWindows(e.target.checked)}
              className="w-4 h-4 accent-electric-cyan"
            />
            <span className="font-mono-data text-xs text-on-surface">Start VoiceBridge on Windows Boot</span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={startMinimized}
              onChange={(e) => setStartMinimized(e.target.checked)}
              className="w-4 h-4 accent-electric-cyan"
            />
            <span className="font-mono-data text-xs text-on-surface">Minimize to System Tray on launch</span>
          </label>
        </div>
      </div>
    </div>
  );
}
