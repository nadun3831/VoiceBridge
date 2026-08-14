import React from 'react';

export default function Footer({ onOpenStats, latencyMs }) {
  return (
    <footer className="bg-deep-charcoal border-t border-slate-border fixed bottom-0 left-0 w-full z-50 flex justify-between items-center px-4 h-8 text-xs font-mono-data">
      <div className="flex items-center gap-4">
        <span className="font-label-caps text-[10px] text-tertiary-fixed font-bold text-yellow-400/90 tracking-wider">
          ● LOCAL PROCESSING ONLY
        </span>
      </div>

      <div className="flex gap-4">
        <button
          onClick={onOpenStats}
          className="text-on-surface-variant hover:text-electric-cyan transition-colors"
        >
          SYSTEM STATS
        </button>
        <span className="text-on-surface-variant">|</span>
        <button
          onClick={onOpenStats}
          className="text-electric-cyan font-bold hover:underline"
        >
          LATENCY: {latencyMs}ms
        </button>
      </div>
    </footer>
  );
}
