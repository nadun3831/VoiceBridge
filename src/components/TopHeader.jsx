import React from 'react';

export default function TopHeader({ isRunning, onStart, onStop }) {
  return (
    <header className="glass-panel border-b border-slate-border flex justify-between items-center px-6 h-16 w-full fixed top-0 z-50 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-electric-cyan/20 to-active-purple/20 border border-electric-cyan/40 flex items-center justify-center shadow-[0_0_12px_rgba(0,240,255,0.2)]">
          <span className="material-symbols-outlined text-electric-cyan text-xl">graphic_eq</span>
        </div>
        <div className="flex items-center gap-2.5">
          <span className="font-display-lg text-2xl font-black gradient-text-cyan uppercase tracking-wider">
            VoiceBridge
          </span>
          <span className="font-mono-data text-[10px] px-2 py-0.5 glow-badge-cyan rounded-md font-bold uppercase tracking-widest">
            v1.0 PRO
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Engine Status Pill */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-deep-charcoal/80 border border-slate-border rounded-full font-mono-data text-xs">
          <span className={`w-2 h-2 rounded-full ${isRunning ? 'bg-signal-green led-active' : 'bg-clipping-red'}`}></span>
          <span className={isRunning ? 'text-signal-green font-bold' : 'text-on-surface-variant'}>
            {isRunning ? 'DSP ONLINE' : 'DSP IDLE'}
          </span>
        </div>

        {/* Start / Stop Toggle Buttons */}
        <div className="flex items-center gap-2 bg-deep-charcoal/60 p-1 border border-slate-border rounded-lg">
          <button
            onClick={onStart}
            className={`font-label-caps text-xs px-4 py-1.5 rounded-md font-bold transition-all duration-200 flex items-center gap-1.5 ${
              isRunning
                ? 'bg-signal-green text-deep-charcoal shadow-[0_0_15px_rgba(16,185,129,0.5)] font-black scale-[1.02]'
                : 'text-signal-green hover:bg-signal-green/10 border border-signal-green/40'
            }`}
          >
            <span className="material-symbols-outlined text-sm">play_arrow</span>
            START
          </button>

          <button
            onClick={onStop}
            className={`font-label-caps text-xs px-4 py-1.5 rounded-md font-bold transition-all duration-200 flex items-center gap-1.5 ${
              !isRunning
                ? 'bg-clipping-red/20 text-clipping-red border border-clipping-red/40 opacity-90'
                : 'text-on-surface-variant hover:text-clipping-red hover:bg-clipping-red/10'
            }`}
          >
            <span className="material-symbols-outlined text-sm">stop</span>
            STOP
          </button>
        </div>
      </div>
    </header>
  );
}

