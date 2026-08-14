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
    <nav className="bg-slate-surface border-r border-slate-border fixed left-0 top-16 bottom-8 w-[280px] flex flex-col h-[calc(100vh-6rem)] py-4 z-40 hidden md:flex">
      {/* Engine Status */}
      <div className="px-6 pb-6 border-b border-slate-border mb-4">
        <div className="font-label-caps text-[11px] font-bold text-on-surface-variant mb-1 uppercase tracking-wider">
          ENGINE STATUS
        </div>
        <div className="flex items-center gap-2 mb-3">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              isRunning
                ? 'bg-signal-green shadow-[0_0_10px_rgba(34,197,94,0.9)] led-active'
                : 'bg-clipping-red'
            }`}
          ></span>
          <span
            className={`font-mono-data text-xs font-bold ${
              isRunning ? 'text-signal-green' : 'text-clipping-red'
            }`}
          >
            {isRunning ? 'VIRTUAL MIC ACTIVE' : 'ENGINE STOPPED'}
          </span>
        </div>

        <button
          onClick={onOpenInputSelect}
          className="w-full border border-slate-border py-2 text-center font-label-caps text-xs font-bold text-on-surface hover:bg-slate-surface-high transition-colors rounded"
        >
          INPUT SELECT
        </button>
      </div>

      {/* Main Navigation Links */}
      <div className="flex-1 px-4 flex flex-col gap-1 overflow-y-auto">
        <button
          onClick={() => setActiveTab('effects')}
          className={`flex items-center gap-3 px-4 py-3 rounded transition-all duration-150 ease-in-out w-full text-left font-label-caps text-xs font-bold ${
            activeTab === 'effects'
              ? 'text-electric-cyan border-l-2 border-electric-cyan bg-slate-surface-high'
              : 'text-on-surface-variant hover:text-on-surface hover:bg-slate-surface-high/50'
          }`}
        >
          <span className="material-symbols-outlined text-lg">tune</span>
          <span>Effects Pipeline</span>
        </button>

        <button
          onClick={() => setActiveTab('library')}
          className={`flex items-center gap-3 px-4 py-3 rounded transition-all duration-150 ease-in-out w-full text-left font-label-caps text-xs font-bold ${
            activeTab === 'library'
              ? 'text-electric-cyan border-l-2 border-electric-cyan bg-slate-surface-high'
              : 'text-on-surface-variant hover:text-on-surface hover:bg-slate-surface-high/50'
          }`}
        >
          <span className="material-symbols-outlined text-lg">library_music</span>
          <span>Presets Library</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-3 px-4 py-3 rounded transition-all duration-150 ease-in-out w-full text-left font-label-caps text-xs font-bold ${
            activeTab === 'settings'
              ? 'text-electric-cyan border-l-2 border-electric-cyan bg-slate-surface-high'
              : 'text-on-surface-variant hover:text-on-surface hover:bg-slate-surface-high/50'
          }`}
        >
          <span className="material-symbols-outlined text-lg">settings</span>
          <span>Engine Settings</span>
        </button>
      </div>

      {/* Bottom Controls */}
      <div className="px-6 pt-4 border-t border-slate-border mt-auto">
        <div className="flex flex-col gap-2">
          <button
            onClick={onOpenMaster}
            className="flex items-center gap-3 text-on-surface-variant hover:text-electric-cyan transition-colors text-left font-label-caps text-xs py-1"
          >
            <span className="material-symbols-outlined text-sm">graphic_eq</span>
            <span>Master Volume</span>
          </button>
          <button
            onClick={onOpenMonitor}
            className="flex items-center gap-3 text-on-surface-variant hover:text-electric-cyan transition-colors text-left font-label-caps text-xs py-1"
          >
            <span className="material-symbols-outlined text-sm">headphones</span>
            <span>Monitor Output</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
