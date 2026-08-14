import React, { useEffect, useState } from 'react';
import TopHeader from './components/TopHeader';
import SideNav from './components/SideNav';
import EffectsView from './components/EffectsView';
import PresetsView from './components/PresetsView';
import SettingsView from './components/SettingsView';
import Footer from './components/Footer';
import InputSelectModal from './components/InputSelectModal';
import MasterMonitorModal from './components/MasterMonitorModal';
import StatsModal from './components/StatsModal';
import { audioEngine } from './services/AudioEngine';

export default function App() {
  const [isRunning, setIsRunning] = useState(false);
  const [activeTab, setActiveTab] = useState('effects');
  const [inputGain, setInputGain] = useState(0.75);
  const [masterVolume, setMasterVolume] = useState(1.0);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [latencyMs, setLatencyMs] = useState('2.4');

  const [meterData, setMeterData] = useState({
    leftLevel: 0,
    rightLevel: 0,
    dbValue: '-INF dB'
  });

  const [selectedDevice, setSelectedDevice] = useState({
    deviceId: 'default',
    name: 'Shure SM7B',
    driver: 'Focusrite USB Audio (WASAPI Exclusive)'
  });

  const [effects, setEffects] = useState(audioEngine.effects);

  // Modals
  const [isInputModalOpen, setIsInputModalOpen] = useState(false);
  const [isMasterModalOpen, setIsMasterModalOpen] = useState(false);
  const [masterModalType, setMasterModalType] = useState('master'); // 'master' or 'monitor'
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);

  useEffect(() => {
    audioEngine.onMeterUpdate = (data) => {
      setMeterData(data);
      setLatencyMs(audioEngine.getLatencyMs());
    };

    audioEngine.onStateChange = (running) => {
      setIsRunning(running);
    };

    // Auto start synthetic/live engine on first load
    audioEngine.startEngine();
  }, []);

  const handleStartEngine = async () => {
    await audioEngine.startEngine();
  };

  const handleStopEngine = () => {
    audioEngine.stopEngine();
  };

  const handleInputGainChange = (val) => {
    setInputGain(val);
    audioEngine.setInputGain(val);
  };

  const handleUpdateEffect = (effectKey, settings) => {
    audioEngine.updateEffect(effectKey, settings);
    setEffects({ ...audioEngine.effects });
  };

  const handleApplyPresetConfig = (presetConfig) => {
    Object.keys(presetConfig).forEach((key) => {
      audioEngine.updateEffect(key, presetConfig[key]);
    });
    setEffects({ ...audioEngine.effects });
  };

  const handleSelectDevice = (device) => {
    setSelectedDevice(device);
    audioEngine.selectedDeviceId = device.deviceId;
    if (isRunning) {
      audioEngine.rebuildPipeline();
    }
  };

  const handleToggleMonitoring = (enabled) => {
    setIsMonitoring(enabled);
    audioEngine.setMonitoring(enabled);
  };

  return (
    <div className="bg-deep-charcoal text-on-surface min-h-screen flex flex-col font-body-base overflow-hidden">
      {/* Top Header */}
      <TopHeader
        isRunning={isRunning}
        onStart={handleStartEngine}
        onStop={handleStopEngine}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 pt-16 pb-8 h-screen w-full relative">
        {/* Left Side Navigation */}
        <SideNav
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isRunning={isRunning}
          onOpenInputSelect={() => setIsInputModalOpen(true)}
          onOpenMaster={() => {
            setMasterModalType('master');
            setIsMasterModalOpen(true);
          }}
          onOpenMonitor={() => {
            setMasterModalType('monitor');
            setIsMasterModalOpen(true);
          }}
        />

        {/* Center Main Canvas */}
        <main className="md:ml-[280px] flex-1 overflow-y-auto p-6 bg-background w-full h-[calc(100vh-6rem)] custom-scrollbar">
          {activeTab === 'effects' && (
            <EffectsView
              inputGain={inputGain}
              setInputGain={handleInputGainChange}
              meterData={meterData}
              selectedDevice={selectedDevice}
              onOpenDeviceModal={() => setIsInputModalOpen(true)}
              effects={effects}
              onUpdateEffect={handleUpdateEffect}
            />
          )}

          {activeTab === 'library' && (
            <PresetsView onApplyPreset={handleApplyPresetConfig} />
          )}

          {activeTab === 'settings' && (
            <SettingsView latencyMs={latencyMs} />
          )}
        </main>
      </div>

      {/* Footer */}
      <Footer
        onOpenStats={() => setIsStatsModalOpen(true)}
        latencyMs={latencyMs}
      />

      {/* Modals */}
      <InputSelectModal
        isOpen={isInputModalOpen}
        onClose={() => setIsInputModalOpen(false)}
        selectedDevice={selectedDevice}
        onSelectDevice={handleSelectDevice}
      />

      <MasterMonitorModal
        isOpen={isMasterModalOpen}
        onClose={() => setIsMasterModalOpen(false)}
        type={masterModalType}
        masterVolume={masterVolume}
        setMasterVolume={setMasterVolume}
        isMonitoring={isMonitoring}
        setIsMonitoring={handleToggleMonitoring}
      />

      <StatsModal
        isOpen={isStatsModalOpen}
        onClose={() => setIsStatsModalOpen(false)}
        latencyMs={latencyMs}
      />
    </div>
  );
}
