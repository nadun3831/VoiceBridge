import React, { useEffect, useState } from 'react';
import { audioEngine } from '../services/AudioEngine';

export default function InputSelectModal({ isOpen, onClose, selectedDevice, onSelectDevice }) {
  const [devices, setDevices] = useState([
    { deviceId: 'default', name: 'Shure SM7B', driver: 'Focusrite USB Audio (WASAPI Exclusive)' },
    { deviceId: 'webcam', name: 'Logitech C920 Mic', driver: 'USB Audio Device' },
    { deviceId: 'realtek', name: 'Realtek High Definition Audio', driver: 'Onboard Realtek ALC897' }
  ]);

  useEffect(() => {
    if (isOpen) {
      audioEngine.getAudioInputDevices().then((devList) => {
        if (devList && devList.length > 0) {
          const mapped = devList.map((d, index) => ({
            deviceId: d.deviceId,
            name: d.label || `Audio Input Source ${index + 1}`,
            driver: 'WASAPI / DirectSound'
          }));
          setDevices(mapped);
        }
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-surface border border-electric-cyan p-6 rounded max-w-lg w-full shadow-2xl space-y-4">
        <div className="flex justify-between items-center pb-3 border-b border-slate-border">
          <h3 className="font-headline-md text-base font-bold text-electric-cyan flex items-center gap-2">
            <span className="material-symbols-outlined">mic</span>
            Select Microphone Input Hardware
          </h3>
          <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <p className="font-mono-data text-xs text-on-surface-variant">
          Select physical capture microphone to feed VoiceBridge DSP pipeline.
        </p>

        <div className="space-y-2 max-h-60 overflow-y-auto">
          {devices.map((device) => {
            const isSelected = selectedDevice.deviceId === device.deviceId;
            return (
              <div
                key={device.deviceId}
                onClick={() => {
                  onSelectDevice(device);
                  onClose();
                }}
                className={`p-3 rounded border cursor-pointer flex justify-between items-center transition-all ${
                  isSelected
                    ? 'border-electric-cyan bg-slate-surface-high/80 text-electric-cyan'
                    : 'border-slate-border bg-deep-charcoal hover:border-on-surface-variant text-on-surface'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-lg">mic</span>
                  <div>
                    <p className="font-mono-data text-xs font-bold">{device.name}</p>
                    <p className="font-label-caps text-[10px] opacity-70">{device.driver}</p>
                  </div>
                </div>
                {isSelected && (
                  <span className="material-symbols-outlined text-signal-green">check_circle</span>
                )}
              </div>
            );
          })}
        </div>

        <div className="pt-3 border-t border-slate-border flex justify-end">
          <button
            onClick={onClose}
            className="border border-slate-border px-5 py-2 text-xs font-label-caps font-bold text-on-surface hover:bg-slate-surface-high rounded"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
}
