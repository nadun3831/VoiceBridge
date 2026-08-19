import React from 'react';

export default function StatsModal({ isOpen, onClose, latencyMs }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="glass-panel border border-electric-cyan/60 p-6 rounded-2xl max-w-lg w-full shadow-2xl space-y-5">
        <div className="flex justify-between items-center pb-3 border-b border-slate-border">
          <h3 className="font-headline-md text-base font-extrabold text-electric-cyan flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-lg bg-electric-cyan/15 border border-electric-cyan/30 flex items-center justify-center text-electric-cyan">
              <span className="material-symbols-outlined text-lg">analytics</span>
            </span>
            DSP Engine Diagnostics & Performance
          </h3>
          <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-deep-charcoal/90 border border-slate-border p-4 rounded-xl shadow-inner">
            <span className="font-label-caps text-[10px] text-on-surface-variant/80 block font-bold mb-1">
              ROUNDTRIP LATENCY
            </span>
            <span className="font-mono-data text-2xl text-signal-green font-black">{latencyMs} ms</span>
          </div>

          <div className="bg-deep-charcoal/90 border border-slate-border p-4 rounded-xl shadow-inner">
            <span className="font-label-caps text-[10px] text-on-surface-variant/80 block font-bold mb-1">
              SAMPLE RATE
            </span>
            <span className="font-mono-data text-2xl text-electric-cyan font-black">48,000 Hz</span>
          </div>

          <div className="bg-deep-charcoal/90 border border-slate-border p-4 rounded-xl shadow-inner">
            <span className="font-label-caps text-[10px] text-on-surface-variant/80 block font-bold mb-1">
              PCM BUFFER SIZE
            </span>
            <span className="font-mono-data text-2xl text-on-surface font-black">256 Frames</span>
          </div>

          <div className="bg-deep-charcoal/90 border border-slate-border p-4 rounded-xl shadow-inner">
            <span className="font-label-caps text-[10px] text-on-surface-variant/80 block font-bold mb-1">
              DSP THREAD CPU
            </span>
            <span className="font-mono-data text-2xl text-active-purple font-black">1.2 %</span>
          </div>
        </div>

        <div className="bg-deep-charcoal/90 border border-slate-border p-4 rounded-xl space-y-3 shadow-inner">
          <div className="flex justify-between items-center">
            <span className="font-mono-data text-xs text-on-surface font-bold">DRIVER HEALTH & BUFFER BENCHMARK</span>
            <span className="font-mono-data text-[10px] text-signal-green font-black">99.9% HEALTHY</span>
          </div>
          <div className="w-full bg-slate-surface h-2.5 rounded-full overflow-hidden border border-slate-border">
            <div className="bg-gradient-to-r from-electric-cyan to-signal-green h-full w-[98%] shadow-[0_0_10px_#00F0FF]"></div>
          </div>
          <div className="flex justify-between font-mono-data text-[10px] text-on-surface-variant/80 font-semibold">
            <span>Buffer Underruns: 0</span>
            <span>Dropped Frames: 0.00%</span>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="border border-slate-border font-label-caps text-xs px-6 py-2.5 hover:bg-slate-surface-high hover:border-electric-cyan/40 transition-colors rounded-lg text-on-surface font-extrabold"
          >
            CLOSE DIAGNOSTICS
          </button>
        </div>
      </div>
    </div>
  );
}

