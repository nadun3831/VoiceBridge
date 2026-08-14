import React from 'react';

export default function InputMeterCard({
  inputGain,
  setInputGain,
  meterData,
  selectedDevice,
  onOpenDeviceModal
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
      {/* Device Selection & Input Gain Rack */}
      <div className="bg-slate-surface border border-slate-border p-5 rounded col-span-1 lg:col-span-2 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-headline-md text-lg font-bold text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-electric-cyan">settings_input_component</span>
              Input Source & Gain
            </h2>
            <button
              onClick={onOpenDeviceModal}
              className="text-xs font-mono-data text-electric-cyan border border-slate-border px-3 py-1 hover:bg-slate-surface-high transition-colors rounded"
            >
              CHANGE DEVICE
            </button>
          </div>

          {/* Active Input Device Card */}
          <div className="bg-deep-charcoal border border-slate-border p-3.5 rounded flex justify-between items-center hover:border-on-surface-variant cursor-pointer transition-colors" onClick={onOpenDeviceModal}>
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-on-surface-variant text-xl">mic</span>
              <div>
                <p className="font-mono-data text-xs font-bold text-on-surface">{selectedDevice.name}</p>
                <p className="font-label-caps text-[11px] text-on-surface-variant opacity-75">{selectedDevice.driver}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono-data text-[10px] text-signal-green">READY</span>
              <div className="w-3 h-3 rounded-full bg-signal-green shadow-[0_0_8px_rgba(34,197,94,0.7)] led-active"></div>
            </div>
          </div>
        </div>

        {/* Input Gain Control */}
        <div className="mt-6 pt-4 border-t border-slate-border">
          <div className="flex justify-between items-center mb-2">
            <label className="font-label-caps text-xs font-bold text-on-surface-variant uppercase">
              INPUT GAIN
            </label>
            <span className="font-mono-data text-xs font-bold text-electric-cyan">
              {Math.round(inputGain * 100)}%
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-sm text-on-surface-variant">volume_down</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={inputGain}
              onChange={(e) => setInputGain(parseFloat(e.target.value))}
              className="custom-slider flex-1"
            />
            <span className="material-symbols-outlined text-sm text-on-surface-variant">volume_up</span>
          </div>
        </div>
      </div>

      {/* Peak Meter Rack */}
      <div className="bg-slate-surface border border-slate-border p-5 rounded flex flex-col justify-between">
        <div className="w-full flex justify-between items-center mb-3">
          <h2 className="font-label-caps text-xs font-bold text-on-surface-variant uppercase">
            PEAK METER
          </h2>
          <span className="font-mono-data text-xs font-bold text-electric-cyan">
            {meterData.dbValue}
          </span>
        </div>

        {/* Visualizer Tower */}
        <div className="flex gap-3 h-44 items-end bg-deep-charcoal p-3 border border-slate-border w-full relative rounded">
          {/* dB Scale */}
          <div className="absolute left-1 top-0 bottom-0 flex flex-col justify-between text-[9px] font-mono-data text-on-surface-variant opacity-60 py-2">
            <span>0</span>
            <span>-6</span>
            <span>-12</span>
            <span>-24</span>
            <span>-48</span>
          </div>

          {/* Left Channel Bar */}
          <div className="w-1/2 h-full bg-slate-surface flex flex-col justify-end ml-6 relative overflow-hidden rounded-sm">
            <div
              className="w-full bg-gradient-to-t from-electric-cyan via-signal-green to-clipping-red meter-segment"
              style={{ height: `${meterData.leftLevel}%` }}
            ></div>
            <div className="absolute w-full h-[1px] bg-white/30 bottom-[80%]"></div>
          </div>

          {/* Right Channel Bar */}
          <div className="w-1/2 h-full bg-slate-surface flex flex-col justify-end relative overflow-hidden rounded-sm">
            <div
              className="w-full bg-gradient-to-t from-electric-cyan via-signal-green to-clipping-red meter-segment"
              style={{ height: `${meterData.rightLevel}%` }}
            ></div>
            <div className="absolute w-full h-[1px] bg-white/30 bottom-[80%]"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
