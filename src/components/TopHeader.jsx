import React from 'react';

export default function TopHeader({ isRunning, onStart, onStop }) {
  return (
    <header className="bg-deep-charcoal border-b border-slate-border flex justify-between items-center px-6 h-16 w-full fixed top-0 z-50">
      <div className="flex items-center gap-4">
        <span className="font-display-lg text-2xl font-extrabold text-electric-cyan uppercase tracking-tighter">
          VoiceBridge
        </span>
        <span className="hidden sm:inline-block font-mono-data text-xs px-2 py-0.5 border border-slate-border text-on-surface-variant rounded">
          v1.0 PRO
        </span>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={onStart}
          className={`font-label-caps text-xs px-4 py-2 border rounded font-bold transition-all duration-150 active:scale-95 ${
            isRunning
              ? 'border-signal-green bg-signal-green/10 text-signal-green shadow-[0_0_12px_rgba(34,197,94,0.3)]'
              : 'border-signal-green text-signal-green hover:bg-signal-green/10'
          }`}
        >
          START ENGINE
        </button>

        <button
          onClick={onStop}
          className={`font-label-caps text-xs px-4 py-2 border rounded font-bold transition-all duration-150 active:scale-95 ${
            !isRunning
              ? 'border-clipping-red bg-clipping-red/10 text-clipping-red opacity-80'
              : 'border-clipping-red text-clipping-red hover:bg-clipping-red/10'
          }`}
        >
          STOP ENGINE
        </button>
      </div>
    </header>
  );
}
