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
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-surface border border-electric-cyan p-6 rounded max-w-md w-full shadow-2xl space-y-4">
        <div className="flex justify-between items-center pb-3 border-b border-slate-border">
          <h3 className="font-headline-md text-base font-bold text-electric-cyan flex items-center gap-2">
            <span className="material-symbols-outlined">
              {isMaster ? 'graphic_eq' : 'headphones'}
            </span>
            {isMaster ? 'Master Output Volume' : 'Headphone Audio Monitoring'}
          </h3>
          <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {isMaster ? (
          <div className="space-y-4">
            <p className="font-mono-data text-xs text-on-surface-variant">
              Adjust global output gain sent to Virtual Audio Driver endpoint.
            </p>

            <div className="space-y-2">
              <div className="flex justify-between font-mono-data text-xs">
                <span>GAIN LEVEL</span>
                <span className="text-electric-cyan font-bold">{Math.round(masterVolume * 100)}%</span>
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
            <p className="font-mono-data text-xs text-on-surface-variant">
              Listen to processed voice live in headphones. (Wear headphones to prevent acoustic feedback loop!).
            </p>

            <div className="bg-deep-charcoal border border-slate-border p-4 rounded flex justify-between items-center">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-electric-cyan text-xl">headphones</span>
                <div>
                  <p className="font-mono-data text-xs font-bold text-on-surface">Monitor Headphones</p>
                  <p className="font-label-caps text-[10px] text-on-surface-variant">System Output Playback</p>
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
              <div className="bg-signal-green/10 border border-signal-green/30 p-3 rounded text-signal-green font-mono-data text-xs flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">info</span>
                Live headphone monitoring enabled.
              </div>
            )}
          </div>
        )}

        <div className="pt-3 border-t border-slate-border flex justify-end">
          <button
            onClick={onClose}
            className="bg-electric-cyan text-deep-charcoal font-label-caps text-xs font-bold px-5 py-2 hover:bg-primary rounded"
          >
            DONE
          </button>
        </div>
      </div>
    </div>
  );
}
