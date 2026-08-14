import React from 'react';

export default function StatsModal({ isOpen, onClose, latencyMs }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-surface border border-electric-cyan p-6 rounded max-w-lg w-full shadow-2xl space-y-5">
        <div className="flex justify-between items-center pb-3 border-b border-slate-border">
          <h3 className="font-headline-md text-base font-bold text-electric-cyan flex items-center gap-2">
            <span className="material-symbols-outlined">analytics</span>
            System DSP Diagnostics & Latency Stats
          </h3>
          <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-deep-charcoal border border-slate-border p-3.5 rounded">
            <span className="font-label-caps text-[10px] text-on-surface-variant block">DSP ROUNDTRIP LATENCY</span>
            <span className="font-mono-data text-xl text-signal-green font-bold">{latencyMs} ms</span>
          </div>

          <div className="bg-deep-charcoal border border-slate-border p-3.5 rounded">
            <span className="font-label-caps text-[10px] text-on-surface-variant block">SAMPLE RATE</span>
            <span className="font-mono-data text-xl text-electric-cyan font-bold">48,000 Hz</span>
          </div>

          <div className="bg-deep-charcoal border border-slate-border p-3.5 rounded">
            <span className="font-label-caps text-[10px] text-on-surface-variant block">BUFFER SIZE</span>
            <span className="font-mono-data text-xl text-on-surface font-bold">256 Frames</span>
          </div>

          <div className="bg-deep-charcoal border border-slate-border p-3.5 rounded">
            <span className="font-label-caps text-[10px] text-on-surface-variant block">CPU DSP THREAD</span>
            <span className="font-mono-data text-xl text-active-purple font-bold">1.2 %</span>
          </div>
        </div>

        <div className="bg-deep-charcoal border border-slate-border p-4 rounded space-y-2">
          <span className="font-mono-data text-xs text-on-surface font-bold">VIRTUAL DRIVER BENCHMARK</span>
          <div className="w-full bg-slate-surface h-2 rounded overflow-hidden">
            <div className="bg-signal-green h-full w-[95%]"></div>
          </div>
          <div className="flex justify-between font-mono-data text-[10px] text-on-surface-variant">
            <span>Buffer Underruns: 0</span>
            <span>Dropped Frames: 0.00%</span>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="border border-slate-border font-label-caps text-xs px-5 py-2 hover:bg-slate-surface-high rounded text-on-surface font-bold"
          >
            CLOSE DIAGNOSTICS
          </button>
        </div>
      </div>
    </div>
  );
}
