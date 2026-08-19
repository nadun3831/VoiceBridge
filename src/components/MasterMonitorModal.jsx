import React from 'react';

export default function MasterMonitorModal({
  isOpen,
  onClose,
  type, // 'master' or 'monitor'
  masterVolume,
  setMasterVolume,
  isMonitoring,
  setIsMonitoring
}) {
  if (!isOpen) return null;

  const isMaster = type === 'master';

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="glass-panel border border-electric-cyan/60 p-6 rounded-2xl max-w-md w-full shadow-2xl space-y-5">
        <div className="flex justify-between items-center pb-3 border-b border-slate-border">
          <h3 className="font-headline-md text-base font-extrabold text-electric-cyan flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-lg bg-electric-cyan/15 border border-electric-cyan/30 flex items-center justify-center text-electric-cyan">
              <span className="material-symbols-outlined text-lg">
                {isMaster ? 'graphic_eq' : 'headphones'}
              </span>
            </span>
            {isMaster ? 'Master Output Volume' : 'Headphone Audio Monitoring'}
          </h3>
          <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {isMaster ? (
          <div className="space-y-4">
            <p className="font-mono-data text-xs text-on-surface-variant/80">
              ADJUST GLOBAL OUTPUT GAIN SENT TO VIRTUAL AUDIO DRIVER ENDPOINT.
            </p>

            <div className="bg-deep-charcoal/90 border border-slate-border p-4 rounded-xl space-y-3 shadow-inner">
              <div className="flex justify-between font-mono-data text-xs">
                <span className="font-bold text-on-surface-variant">MASTER GAIN LEVEL</span>
                <span className="text-electric-cyan font-black bg-electric-cyan/10 border border-electric-cyan/30 px-2 py-0.5 rounded">
                  {Math.round(masterVolume * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1.5"
                step="0.05"
                value={masterVolume}
                onChange={(e) => setMasterVolume(parseFloat(e.target.value))}
                className="custom-slider"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="font-mono-data text-xs text-on-surface-variant/80">
              LISTEN TO PROCESSED VOICE LIVE IN HEADPHONES. (WEAR HEADPHONES TO PREVENT ACOUSTIC FEEDBACK LOOP).
            </p>

            <div className="bg-deep-charcoal/90 border border-slate-border p-4 rounded-xl flex justify-between items-center shadow-inner">
              <div className="flex items-center gap-3.5">
                <div className="w-9 h-9 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                  <span className="material-symbols-outlined text-xl">headphones</span>
                </div>
                <div>
                  <p className="font-mono-data text-xs font-extrabold text-on-surface">Monitor Headphones</p>
                  <p className="font-label-caps text-[10px] text-on-surface-variant/70">Direct Hardware Pass-Through</p>
                </div>
              </div>

              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={isMonitoring}
                  onChange={(e) => setIsMonitoring(e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            {isMonitoring && (
              <div className="bg-signal-green/10 border border-signal-green/30 p-3 rounded-lg text-signal-green font-mono-data text-xs flex items-center gap-2.5">
                <span className="material-symbols-outlined text-sm text-signal-green">info</span>
                Live headphone audio monitoring is active.
              </div>
            )}
          </div>
        )}

        <div className="pt-3 border-t border-slate-border flex justify-end">
          <button
            onClick={onClose}
            className="bg-electric-cyan text-deep-charcoal font-label-caps text-xs font-black px-6 py-2.5 hover:brightness-110 rounded-lg shadow-[0_0_12px_rgba(0,240,255,0.4)] transition-all"
          >
            SAVE & CLOSE
          </button>
        </div>
      </div>
    </div>
  );
}

