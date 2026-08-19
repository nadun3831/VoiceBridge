import React from 'react';

export default function SideNav({
  activeTab,
  setActiveTab,
  isRunning,
  onOpenInputSelect,
  onOpenMaster,
  onOpenMonitor
}) {
  return (
    <nav className="glass-panel border-r border-slate-border fixed left-0 top-16 bottom-8 w-[280px] flex flex-col h-[calc(100vh-6rem)] py-5 z-40 hidden md:flex backdrop-blur-lg">
      {/* Engine Status Card */}
      <div className="px-5 pb-5 border-b border-slate-border/80 mb-5">
        <div className="flex justify-between items-center mb-2">
          <span className="font-label-caps text-[10px] font-extrabold text-on-surface-variant uppercase tracking-widest">
            ENGINE STATUS
          </span>
          <span className="rack-screw"></span>
        </div>

        <div className="bg-deep-charcoal/90 border border-slate-border p-3 rounded-lg mb-3 shadow-inner">
          <div className="flex items-center gap-2.5">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isRunning
                  ? 'bg-signal-green shadow-[0_0_12px_rgba(16,185,129,0.9)] led-active'
                  : 'bg-clipping-red shadow-[0_0_8px_rgba(244,63,94,0.6)]'
              }`}
            ></span>
            <span
              className={`font-mono-data text-xs font-bold tracking-wide ${
                isRunning ? 'text-signal-green' : 'text-clipping-red'
              }`}
            >
              {isRunning ? 'VIRTUAL MIC ACTIVE' : 'ENGINE STOPPED'}
            </span>
          </div>
          <p className="font-mono-data text-[10px] text-on-surface-variant/70 mt-1 pl-5">
            {isRunning ? 'Routing 48kHz Low-Latency PCM' : 'Tap START to initialize DSP'}
          </p>
        </div>

        <button
          onClick={onOpenInputSelect}
          className="w-full bg-slate-surface border border-slate-border/80 hover:border-electric-cyan/60 py-2 px-3 text-left font-label-caps text-xs font-bold text-on-surface hover:text-electric-cyan transition-all duration-200 rounded-lg flex items-center justify-between group shadow-sm"
        >
          <span className="flex items-center gap-2">
            <span className="material-symbols-outlined text-sm text-electric-cyan">mic</span>
            INPUT SELECT
          </span>
          <span className="material-symbols-outlined text-sm text-on-surface-variant group-hover:translate-x-0.5 transition-transform">
            chevron_right
          </span>
        </button>
      </div>

      {/* Main Navigation Links */}
      <div className="flex-1 px-3 flex flex-col gap-1.5 overflow-y-auto">
        <div className="px-3 pb-1 font-label-caps text-[10px] font-extrabold text-on-surface-variant/60 uppercase tracking-widest">
          NAVIGATION
        </div>

        <button
          onClick={() => setActiveTab('effects')}
          className={`flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 w-full text-left font-label-caps text-xs font-bold ${
            activeTab === 'effects'
              ? 'text-electric-cyan bg-electric-cyan/10 border border-electric-cyan/30 shadow-[0_0_15px_rgba(0,240,255,0.1)]'
              : 'text-on-surface-variant hover:text-on-surface hover:bg-slate-surface-high/60 border border-transparent'
          }`}
        >
          <div className="flex items-center gap-3">
            <span className={`material-symbols-outlined text-xl ${activeTab === 'effects' ? 'text-electric-cyan' : ''}`}>
              tune
            </span>
            <span>Effects Pipeline</span>
          </div>
          {activeTab === 'effects' && (
            <span className="w-1.5 h-1.5 rounded-full bg-electric-cyan shadow-[0_0_6px_#00F0FF]"></span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('library')}
          className={`flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 w-full text-left font-label-caps text-xs font-bold ${
            activeTab === 'library'
              ? 'text-electric-cyan bg-electric-cyan/10 border border-electric-cyan/30 shadow-[0_0_15px_rgba(0,240,255,0.1)]'
              : 'text-on-surface-variant hover:text-on-surface hover:bg-slate-surface-high/60 border border-transparent'
          }`}
        >
          <div className="flex items-center gap-3">
            <span className={`material-symbols-outlined text-xl ${activeTab === 'library' ? 'text-electric-cyan' : ''}`}>
              library_music
            </span>
            <span>Presets Library</span>
          </div>
          {activeTab === 'library' && (
            <span className="w-1.5 h-1.5 rounded-full bg-electric-cyan shadow-[0_0_6px_#00F0FF]"></span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 w-full text-left font-label-caps text-xs font-bold ${
            activeTab === 'settings'
              ? 'text-electric-cyan bg-electric-cyan/10 border border-electric-cyan/30 shadow-[0_0_15px_rgba(0,240,255,0.1)]'
              : 'text-on-surface-variant hover:text-on-surface hover:bg-slate-surface-high/60 border border-transparent'
          }`}
        >
          <div className="flex items-center gap-3">
            <span className={`material-symbols-outlined text-xl ${activeTab === 'settings' ? 'text-electric-cyan' : ''}`}>
              settings
            </span>
            <span>Engine Settings</span>
          </div>
          {activeTab === 'settings' && (
            <span className="w-1.5 h-1.5 rounded-full bg-electric-cyan shadow-[0_0_6px_#00F0FF]"></span>
          )}
        </button>
      </div>

      {/* Quick Controls Footer */}
      <div className="px-5 pt-4 border-t border-slate-border/80 mt-auto">
        <div className="flex flex-col gap-2">
          <button
            onClick={onOpenMaster}
            className="flex items-center justify-between p-2.5 rounded-lg bg-deep-charcoal/60 border border-slate-border hover:border-electric-cyan/50 text-on-surface-variant hover:text-electric-cyan transition-all text-left font-label-caps text-xs font-semibold group"
          >
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-base text-electric-cyan">graphic_eq</span>
              <span>Master Volume</span>
            </div>
            <span className="material-symbols-outlined text-sm opacity-50 group-hover:opacity-100">tune</span>
          </button>
          <button
            onClick={onOpenMonitor}
            className="flex items-center justify-between p-2.5 rounded-lg bg-deep-charcoal/60 border border-slate-border hover:border-electric-cyan/50 text-on-surface-variant hover:text-electric-cyan transition-all text-left font-label-caps text-xs font-semibold group"
          >
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-base text-purple-400">headphones</span>
              <span>Monitor Output</span>
            </div>
            <span className="material-symbols-outlined text-sm opacity-50 group-hover:opacity-100">tune</span>
          </button>
        </div>
      </div>
    </nav>
  );
}

