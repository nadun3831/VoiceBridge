import React from 'react';

export default function EffectCard({
  title,
  icon,
  enabled,
  onToggle,
  children,
  badgeText
}) {
  return (
    <div
      className={`rack-card relative overflow-hidden transition-all duration-300 ${
        enabled ? 'active opacity-100' : 'opacity-65 hover:opacity-100'
      }`}
    >
      {/* Active Cyan Glow Edge Accent Strip */}
      {enabled && (
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-electric-cyan via-active-purple to-electric-cyan shadow-[0_0_12px_#00F0FF]"></div>
      )}

      {/* Card Header with Hardware Rack Screw Details */}
      <div className="p-3.5 px-4 border-b border-slate-border/80 flex justify-between items-center bg-slate-surface-high/40">
        <div className="flex items-center gap-3">
          <div className="rack-screw hidden sm:block"></div>
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
              enabled
                ? 'bg-electric-cyan/15 text-electric-cyan border border-electric-cyan/40 shadow-[0_0_10px_rgba(0,240,255,0.2)]'
                : 'bg-deep-charcoal text-on-surface-variant border border-slate-border'
            }`}
          >
            <span className="material-symbols-outlined text-lg">{icon}</span>
          </div>

          <div className="flex items-center gap-2">
            <h3 className="font-headline-md text-sm font-bold text-on-surface tracking-wide">
              {title}
            </h3>
            {badgeText && (
              <span className="font-mono-data text-[9px] glow-badge-cyan px-2 py-0.5 rounded font-extrabold uppercase">
                {badgeText}
              </span>
            )}
          </div>
        </div>

        {/* Toggle Switch */}
        <div className="flex items-center gap-3">
          <span className={`font-mono-data text-[10px] font-bold ${enabled ? 'text-electric-cyan' : 'text-on-surface-variant/50'}`}>
            {enabled ? 'BYPASS OFF' : 'BYPASS ON'}
          </span>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) => onToggle(e.target.checked)}
            />
            <span className="toggle-slider"></span>
          </label>
          <div className="rack-screw hidden sm:block"></div>
        </div>
      </div>

      {/* Card Controls Grid */}
      <div className={`p-4 transition-opacity duration-200 ${enabled ? '' : 'pointer-events-none opacity-60'}`}>
        {children}
      </div>
    </div>
  );
}

