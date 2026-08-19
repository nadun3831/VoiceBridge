import React, { useState } from 'react';
import { PresetManager } from '../services/PresetManager';

export default function PresetsView({ onApplyPreset }) {
  const [presets, setPresets] = useState(PresetManager.getPresets());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeLoadedId, setActiveLoadedId] = useState('deep-voice');

  // Custom Preset Form State
  const [newTitle, setNewTitle] = useState('');
  const [newTag, setNewTag] = useState('CUSTOM');
  const [newDesc, setNewDesc] = useState('');

  const tags = ['ALL', 'BASS', 'TREBLE', 'FX', 'LO-FI', 'DELAY', 'REVERB', 'ALIEN', 'MONSTER'];

  const filteredPresets = presets.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = selectedTag === 'ALL' || p.tag === selectedTag;
    return matchesSearch && matchesTag;
  });

  const handleLoad = (preset) => {
    setActiveLoadedId(preset.id);
    onApplyPreset(preset.config);
  };

  const handleCreatePreset = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newPreset = {
      title: newTitle,
      tag: newTag.toUpperCase(),
      icon: 'tune',
      iconColor: 'text-electric-cyan',
      description: newDesc || 'User Custom Sound Preset',
      config: {
        pitch: { enabled: true, semitones: -6, formant: -2 },
        robot: { enabled: false },
        radio: { enabled: false },
        echo: { enabled: false },
        reverb: { enabled: true, decay: 3.0, mix: 0.3 },
        noiseGate: { enabled: true, threshold: -45 }
      }
    };

    PresetManager.saveCustomPreset(newPreset);
    setPresets(PresetManager.getPresets());
    setIsModalOpen(false);
    setNewTitle('');
    setNewDesc('');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-border/80">
        <div>
          <h1 className="font-display-lg text-2xl font-black text-on-surface flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-electric-cyan/15 border border-electric-cyan/40 flex items-center justify-center text-electric-cyan">
              <span className="material-symbols-outlined text-xl">library_music</span>
            </span>
            Voice Profiles Library
          </h1>
          <p className="font-mono-data text-xs text-on-surface-variant/80 mt-1">
            SELECT A REAL-TIME DSP PRESET OR CREATE CUSTOM VOICE ARCHITECTURES
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-gradient-to-r from-electric-cyan to-blue-500 text-deep-charcoal font-label-caps text-xs font-black px-5 py-2.5 rounded-lg hover:brightness-110 transition-all duration-200 flex items-center gap-2 shadow-[0_0_15px_rgba(0,240,255,0.4)] scale-100 hover:scale-[1.02]"
        >
          <span className="material-symbols-outlined text-base">add</span>
          CREATE NEW PRESET
        </button>
      </div>

      {/* Search & Category Filter */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search preset sound profiles..."
            className="w-full bg-deep-charcoal/90 border border-slate-border text-on-surface font-mono-data text-xs py-2.5 pl-10 pr-4 rounded-lg focus:outline-none focus:border-electric-cyan transition-colors placeholder:text-on-surface-variant/50 shadow-inner"
          />
        </div>

        {/* Category Tag Pills */}
        <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 custom-scrollbar">
          {tags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`font-mono-data text-xs px-3.5 py-1.5 rounded-md transition-all duration-200 whitespace-nowrap font-bold ${
                selectedTag === tag
                  ? 'bg-electric-cyan text-deep-charcoal shadow-[0_0_12px_rgba(0,240,255,0.4)]'
                  : 'bg-slate-surface border border-slate-border text-on-surface-variant hover:text-on-surface hover:border-slate-border/80'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Preset Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredPresets.map((preset) => {
          const isCurrentActive = activeLoadedId === preset.id;
          return (
            <div
              key={preset.id}
              className={`rack-card p-5 rounded-xl transition-all duration-300 group flex flex-col justify-between relative overflow-hidden ${
                isCurrentActive
                  ? 'active border-electric-cyan bg-slate-surface-high/60 shadow-[0_0_20px_rgba(0,240,255,0.15)]'
                  : 'hover:border-electric-cyan/50'
              }`}
            >
              {isCurrentActive && (
                <div className="absolute top-0 right-0 w-16 h-16 pointer-events-none">
                  <div className="bg-electric-cyan text-deep-charcoal text-[9px] font-black font-mono-data py-0.5 text-center rotate-45 translate-x-4 translate-y-3 shadow-md">
                    ACTIVE
                  </div>
                </div>
              )}

              <div>
                <div className="flex justify-between items-start mb-4">
                  <div
                    className={`w-12 h-12 rounded-xl bg-deep-charcoal flex items-center justify-center border border-slate-border shadow-inner group-hover:border-electric-cyan/50 transition-colors ${preset.iconColor}`}
                  >
                    <span className="material-symbols-outlined text-2xl">{preset.icon}</span>
                  </div>
                  <span className="font-mono-data text-[10px] glow-badge-purple px-2.5 py-1 rounded-md font-black tracking-wider">
                    {preset.tag}
                  </span>
                </div>

                <h3 className="font-headline-md text-base font-extrabold text-on-surface mb-1.5 group-hover:text-electric-cyan transition-colors">
                  {preset.title}
                </h3>
                <p className="font-mono-data text-xs text-on-surface-variant/80 mb-6 line-clamp-2 leading-relaxed">
                  {preset.description}
                </p>
              </div>

              <button
                onClick={() => handleLoad(preset)}
                className={`w-full font-label-caps text-xs font-black py-2.5 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 ${
                  isCurrentActive
                    ? 'bg-electric-cyan text-deep-charcoal shadow-[0_0_12px_#00F0FF]'
                    : 'bg-deep-charcoal/80 border border-electric-cyan/40 text-electric-cyan hover:bg-electric-cyan hover:text-deep-charcoal shadow-sm'
                }`}
              >
                <span className="material-symbols-outlined text-base">
                  {isCurrentActive ? 'check_circle' : 'download'}
                </span>
                {isCurrentActive ? 'PRESET LOADED' : 'LOAD PRESET'}
              </button>
            </div>
          );
        })}
      </div>

      {/* Modal Form for Creating Preset */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="glass-panel border border-electric-cyan/60 p-6 rounded-2xl max-w-md w-full shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-border">
              <h3 className="font-headline-md text-base font-extrabold text-electric-cyan flex items-center gap-2">
                <span className="material-symbols-outlined">add_circle</span>
                Create Custom Preset
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-on-surface-variant hover:text-on-surface transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleCreatePreset} className="space-y-4">
              <div>
                <label className="font-label-caps text-xs text-on-surface-variant block mb-1 font-bold">
                  PRESET TITLE
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cyberpunk Demon"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-deep-charcoal border border-slate-border text-on-surface font-mono-data text-xs p-2.5 rounded-lg focus:border-electric-cyan outline-none"
                />
              </div>

              <div>
                <label className="font-label-caps text-xs text-on-surface-variant block mb-1 font-bold">
                  CATEGORY TAG
                </label>
                <input
                  type="text"
                  placeholder="e.g. CUSTOM"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  className="w-full bg-deep-charcoal border border-slate-border text-on-surface font-mono-data text-xs p-2.5 rounded-lg focus:border-electric-cyan outline-none"
                />
              </div>

              <div>
                <label className="font-label-caps text-xs text-on-surface-variant block mb-1 font-bold">
                  DESCRIPTION
                </label>
                <textarea
                  placeholder="Describe sound characteristics..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  rows="3"
                  className="w-full bg-deep-charcoal border border-slate-border text-on-surface font-mono-data text-xs p-2.5 rounded-lg focus:border-electric-cyan outline-none resize-none"
                ></textarea>
              </div>

              <div className="pt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-1/2 border border-slate-border text-on-surface font-label-caps text-xs font-bold py-2.5 rounded-lg hover:bg-slate-surface-high"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="w-1/2 bg-electric-cyan text-deep-charcoal font-label-caps text-xs font-black py-2.5 rounded-lg hover:brightness-110 shadow-[0_0_12px_rgba(0,240,255,0.4)]"
                >
                  SAVE PRESET
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

