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
      className={`rack-card relative overflow-hidden transition-all duration-200 ${
        enabled ? 'active opacity-100' : 'opacity-60 hover:opacity-100'
      }`}
    >
      {/* Active Cyan Glow Edge Accent */}
      {enabled && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-electric-cyan shadow-[0_0_8px_#00F0FF]"></div>
      )}

      {/* Card Header */}
      <div className="p-4 border-b border-slate-border flex justify-between items-center bg-slate-surface-high/50">
        <div className="flex items-center gap-3">
          <span
            className={`material-symbols-outlined text-xl ${
              enabled ? 'text-electric-cyan' : 'text-on-surface-variant'
            }`}
          >
            {icon}
          </span>
          <h3 className="font-headline-md text-sm font-bold text-on-surface">
            {title}
          </h3>
          {badgeText && (
            <span className="font-mono-data text-[10px] bg-deep-charcoal border border-slate-border px-2 py-0.5 rounded text-on-surface-variant">
              {badgeText}
            </span>
          )}
        </div>

        {/* Toggle Switch */}
        <label className="toggle-switch">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => onToggle(e.target.checked)}
          />
          <span className="toggle-slider"></span>
        </label>
      </div>

      {/* Card Controls Grid */}
      <div className={`p-4 ${enabled ? '' : 'pointer-events-none opacity-75'}`}>
        {children}
      </div>
    </div>
  );
}
