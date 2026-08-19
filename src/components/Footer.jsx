import React from 'react';

export default function Footer({ onOpenStats, latencyMs }) {
  return (
    <footer className="glass-panel border-t border-slate-border fixed bottom-0 left-0 w-full z-50 flex justify-between items-center px-6 h-9 text-xs font-mono-data backdrop-blur-md">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-2.5 py-0.5 rounded bg-signal-green/10 border border-signal-green/30">
          <span className="w-2 h-2 rounded-full bg-signal-green led-active"></span>
          <span className="font-label-caps text-[10px] text-signal-green font-black tracking-wider uppercase">
            LOCAL ZERO-LATENCY DSP
          </span>
        </div>
        <span className="text-on-surface-variant/40 hidden sm:inline">|</span>
        <span className="text-on-surface-variant/70 text-[11px] hidden sm:inline">
          WASAPI Exclusive 48kHz Stereo
        </span>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onOpenStats}
          className="text-on-surface-variant hover:text-electric-cyan transition-colors flex items-center gap-1 font-bold"
        >
          <span className="material-symbols-outlined text-sm">analytics</span>
          DIAGNOSTICS
        </button>
        <span className="text-on-surface-variant/40">|</span>
        <button
          onClick={onOpenStats}
          className="text-electric-cyan font-extrabold hover:underline flex items-center gap-1 bg-deep-charcoal/80 px-2.5 py-0.5 border border-electric-cyan/30 rounded"
        >
          <span className="material-symbols-outlined text-xs text-signal-green">speed</span>
          LATENCY: {latencyMs}ms
        </button>
      </div>
    </footer>
  );
}

