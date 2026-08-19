import React from 'react';

export default function InputMeterCard({
  inputGain,
  setInputGain,
  meterData,
  selectedDevice,
  onOpenDeviceModal
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
      {/* Device Selection & Input Gain Rack */}
      <div className="rack-card p-5 col-span-1 lg:col-span-2 flex flex-col justify-between relative overflow-hidden">
        <div>
          <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-border/80">
            <h2 className="font-headline-md text-base font-bold text-on-surface flex items-center gap-2.5">
              <span className="material-symbols-outlined text-electric-cyan">settings_input_component</span>
              Audio Input Device & Gain Staging
            </h2>
            <button
              onClick={onOpenDeviceModal}
              className="text-xs font-mono-data text-electric-cyan border border-electric-cyan/40 px-3 py-1 hover:bg-electric-cyan/10 transition-all duration-200 rounded-md font-bold flex items-center gap-1 shadow-[0_0_10px_rgba(0,240,255,0.15)]"
            >
              <span className="material-symbols-outlined text-sm">tune</span>
              CHANGE DEVICE
            </button>
          </div>

          {/* Active Input Device Card */}
          <div
            onClick={onOpenDeviceModal}
            className="bg-deep-charcoal/90 border border-slate-border p-4 rounded-lg flex justify-between items-center hover:border-electric-cyan/60 cursor-pointer transition-all duration-200 group shadow-inner"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-lg bg-electric-cyan/10 border border-electric-cyan/30 flex items-center justify-center text-electric-cyan group-hover:scale-105 transition-transform">
                <span className="material-symbols-outlined text-xl">mic</span>
              </div>
              <div>
                <p className="font-mono-data text-xs font-extrabold text-on-surface group-hover:text-electric-cyan transition-colors">
                  {selectedDevice.name}
                </p>
                <p className="font-label-caps text-[11px] text-on-surface-variant/80">
                  {selectedDevice.driver}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="font-mono-data text-[10px] text-signal-green font-black tracking-widest bg-signal-green/10 border border-signal-green/30 px-2 py-0.5 rounded">
                CONNECTED
              </span>
              <div className="w-3 h-3 rounded-full bg-signal-green shadow-[0_0_10px_rgba(16,185,129,0.9)] led-active"></div>
            </div>
          </div>
        </div>

        {/* Input Gain Control */}
        <div className="mt-5 pt-4 border-t border-slate-border/80">
          <div className="flex justify-between items-center mb-2">
            <label className="font-label-caps text-xs font-bold text-on-surface-variant uppercase flex items-center gap-1.5">
              <span>INPUT GAIN STAGE</span>
              <span className="font-mono-data text-[10px] text-on-surface-variant/60">(PRE-DSP)</span>
            </label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setInputGain(inputGain === 0 ? 0.75 : 0)}
                className={`font-mono-data text-[10px] px-2 py-0.5 rounded font-bold transition-colors ${
                  inputGain === 0 ? 'bg-clipping-red text-white' : 'bg-slate-surface border border-slate-border text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {inputGain === 0 ? 'MUTED' : 'MUTE'}
              </button>
              <span className="font-mono-data text-xs font-extrabold text-electric-cyan bg-deep-charcoal px-2.5 py-0.5 border border-slate-border rounded">
                {Math.round(inputGain * 100)}%
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-sm text-on-surface-variant">volume_down</span>
            <input
              type="range"
              min="0"
              max="1.5"
              step="0.01"
              value={inputGain}
              onChange={(e) => setInputGain(parseFloat(e.target.value))}
              className="custom-slider flex-1"
            />
            <span className="material-symbols-outlined text-sm text-electric-cyan">volume_up</span>
          </div>
        </div>
      </div>

      {/* Peak Meter Rack */}
      <div className="rack-card p-5 rounded flex flex-col justify-between relative overflow-hidden">
        <div className="w-full flex justify-between items-center mb-3 pb-2 border-b border-slate-border/80">
          <h2 className="font-label-caps text-xs font-extrabold text-on-surface uppercase tracking-wider flex items-center gap-1.5">
            <span className="material-symbols-outlined text-sm text-electric-cyan">graphic_eq</span>
            LIVE PEAK METER
          </h2>
          <span className="font-mono-data text-xs font-black text-electric-cyan bg-deep-charcoal px-2 py-0.5 border border-electric-cyan/30 rounded shadow-[0_0_8px_rgba(0,240,255,0.15)]">
            {meterData.dbValue}
          </span>
        </div>

        {/* Visualizer Tower */}
        <div className="flex gap-4 h-44 items-end bg-deep-charcoal/90 p-3.5 border border-slate-border w-full relative rounded-lg shadow-inner">
          {/* dB Grid Tick Scale */}
          <div className="absolute left-2 top-0 bottom-0 flex flex-col justify-between text-[9px] font-mono-data text-on-surface-variant/50 py-2.5">
            <span className="text-clipping-red font-bold">0dB</span>
            <span>-6dB</span>
            <span>-12dB</span>
            <span>-24dB</span>
            <span>-48dB</span>
          </div>

          {/* Left Channel Bar */}
          <div className="w-1/2 h-full bg-slate-surface/90 flex flex-col justify-end ml-8 relative overflow-hidden rounded-sm border border-slate-border/50">
            {/* Grid overlay lines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
              <div className="border-b border-white w-full"></div>
              <div className="border-b border-white w-full"></div>
              <div className="border-b border-white w-full"></div>
              <div className="border-b border-white w-full"></div>
            </div>

            <div
              className="w-full bg-gradient-to-t from-electric-cyan via-signal-green to-clipping-red meter-segment rounded-t-sm shadow-[0_0_10px_rgba(0,240,255,0.4)]"
              style={{ height: `${meterData.leftLevel}%` }}
            ></div>
            <div className="absolute w-full h-[2px] bg-white/60 bottom-[80%]"></div>
          </div>

          {/* Right Channel Bar */}
          <div className="w-1/2 h-full bg-slate-surface/90 flex flex-col justify-end relative overflow-hidden rounded-sm border border-slate-border/50">
            {/* Grid overlay lines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
              <div className="border-b border-white w-full"></div>
              <div className="border-b border-white w-full"></div>
              <div className="border-b border-white w-full"></div>
              <div className="border-b border-white w-full"></div>
            </div>

            <div
              className="w-full bg-gradient-to-t from-electric-cyan via-signal-green to-clipping-red meter-segment rounded-t-sm shadow-[0_0_10px_rgba(0,240,255,0.4)]"
              style={{ height: `${meterData.rightLevel}%` }}
            ></div>
            <div className="absolute w-full h-[2px] bg-white/60 bottom-[80%]"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

