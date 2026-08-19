import React, { useEffect, useState } from 'react';
import { audioEngine } from '../services/AudioEngine';

export default function InputSelectModal({ isOpen, onClose, selectedDevice, onSelectDevice }) {
  const [devices, setDevices] = useState([
    { deviceId: 'default', name: 'Shure SM7B Studio Mic', driver: 'Focusrite USB Audio (WASAPI Exclusive)' },
    { deviceId: 'webcam', name: 'Logitech C920 Stream Mic', driver: 'USB Audio Driver' },
    { deviceId: 'realtek', name: 'Realtek High Definition Audio', driver: 'Onboard Realtek ALC897' }
  ]);

  useEffect(() => {
    if (isOpen) {
      audioEngine.getAudioInputDevices().then((devList) => {
        if (devList && devList.length > 0) {
          const mapped = devList.map((d, index) => ({
            deviceId: d.deviceId,
            name: d.label || `Audio Input Source ${index + 1}`,
            driver: 'WASAPI Low-Latency'
          }));
          setDevices(mapped);
        }
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="glass-panel border border-electric-cyan/60 p-6 rounded-2xl max-w-lg w-full shadow-2xl space-y-4">
        <div className="flex justify-between items-center pb-3 border-b border-slate-border">
          <h3 className="font-headline-md text-base font-extrabold text-electric-cyan flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-lg bg-electric-cyan/15 border border-electric-cyan/30 flex items-center justify-center text-electric-cyan">
              <span className="material-symbols-outlined text-lg">mic</span>
            </span>
            Select Hardware Capture Device
          </h3>
          <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <p className="font-mono-data text-xs text-on-surface-variant/80">
          CHOOSE PHYSICAL MICROPHONE CAPTURE HARDWARE FOR REAL-TIME VOICE SYNTHESIS
        </p>

        <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1 custom-scrollbar">
          {devices.map((device) => {
            const isSelected = selectedDevice.deviceId === device.deviceId;
            return (
              <div
                key={device.deviceId}
                onClick={() => {
                  onSelectDevice(device);
                  onClose();
                }}
                className={`p-3.5 rounded-xl border cursor-pointer flex justify-between items-center transition-all duration-200 ${
                  isSelected
                    ? 'border-electric-cyan bg-electric-cyan/10 text-electric-cyan shadow-[0_0_15px_rgba(0,240,255,0.15)]'
                    : 'border-slate-border bg-deep-charcoal/80 hover:border-electric-cyan/40 text-on-surface'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center border ${
                      isSelected
                        ? 'bg-electric-cyan text-deep-charcoal border-electric-cyan'
                        : 'bg-slate-surface text-on-surface-variant border-slate-border'
                    }`}
                  >
                    <span className="material-symbols-outlined text-xl">mic</span>
                  </div>
                  <div>
                    <p className="font-mono-data text-xs font-extrabold">{device.name}</p>
                    <p className="font-label-caps text-[10px] text-on-surface-variant/70">{device.driver}</p>
                  </div>
                </div>

                {isSelected ? (
                  <span className="material-symbols-outlined text-signal-green text-xl shadow-[0_0_8px_rgba(16,185,129,0.5)]">
                    check_circle
                  </span>
                ) : (
                  <span className="font-mono-data text-[10px] text-on-surface-variant/50 hover:text-electric-cyan uppercase font-bold">
                    SELECT
                  </span>
                )}
              </div>
            );
          })}
        </div>

        <div className="pt-3 border-t border-slate-border flex justify-end">
          <button
            onClick={onClose}
            className="border border-slate-border px-6 py-2.5 text-xs font-label-caps font-extrabold text-on-surface hover:bg-slate-surface-high hover:border-electric-cyan/40 transition-colors rounded-lg"
          >
            DISMISS
          </button>
        </div>
      </div>
    </div>
  );
}

