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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-border">
        <div>
          <h1 className="font-display-lg text-2xl font-bold text-on-surface">Presets Library</h1>
          <p className="font-mono-data text-xs text-on-surface-variant">
            SELECT OR CREATE REAL-TIME AUDIO EFFECT PRESETS
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-electric-cyan text-deep-charcoal font-label-caps text-xs font-bold px-5 py-2.5 rounded hover:bg-primary transition-colors flex items-center gap-2 shadow-[0_0_12px_rgba(0,240,255,0.4)]"
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
            placeholder="Search presets..."
            className="w-full bg-deep-charcoal border border-slate-border text-on-surface font-mono-data text-xs py-2.5 pl-10 pr-4 rounded focus:outline-none focus:border-electric-cyan transition-colors placeholder:text-on-surface-variant/50"
          />
        </div>

        {/* Tag Badges */}
        <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          {tags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`font-mono-data text-xs px-3 py-1 rounded transition-colors whitespace-nowrap ${
                selectedTag === tag
                  ? 'bg-electric-cyan text-deep-charcoal font-bold'
                  : 'bg-slate-surface border border-slate-border text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Preset Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredPresets.map((preset) => {
          const isCurrentActive = activeLoadedId === preset.id;
          return (
            <div
              key={preset.id}
              className={`bg-slate-surface border p-5 rounded transition-all duration-200 group flex flex-col justify-between ${
                isCurrentActive
                  ? 'border-electric-cyan bg-slate-surface-high/40 shadow-[0_0_15px_rgba(0,240,255,0.1)]'
                  : 'border-slate-border hover:border-on-surface-variant'
              }`}
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div
                    className={`w-12 h-12 rounded bg-deep-charcoal flex items-center justify-center border border-slate-border ${preset.iconColor}`}
                  >
                    <span className="material-symbols-outlined text-2xl">{preset.icon}</span>
                  </div>
                  <span className="font-mono-data text-[10px] text-on-surface-variant bg-slate-surface-high border border-slate-border px-2 py-1 rounded font-bold">
                    {preset.tag}
                  </span>
                </div>

                <h3 className="font-headline-md text-base font-bold text-on-surface mb-1 group-hover:text-electric-cyan transition-colors">
                  {preset.title}
                </h3>
                <p className="font-mono-data text-xs text-on-surface-variant mb-6 line-clamp-2">
                  {preset.description}
                </p>
              </div>

              <button
                onClick={() => handleLoad(preset)}
                className={`w-full font-label-caps text-xs font-bold py-2.5 rounded transition-all duration-150 ${
                  isCurrentActive
                    ? 'bg-electric-cyan text-deep-charcoal font-black shadow-[0_0_10px_#00F0FF]'
                    : 'border border-slate-border text-electric-cyan hover:bg-electric-cyan hover:text-deep-charcoal'
                }`}
              >
                {isCurrentActive ? 'ACTIVE LOADED' : 'LOAD PRESET'}
              </button>
            </div>
          );
        })}
      </div>

      {/* Create New Preset Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-surface border border-electric-cyan p-6 rounded max-w-md w-full shadow-2xl">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-border">
              <h3 className="font-headline-md text-base font-bold text-electric-cyan">
                Create Custom Preset
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-on-surface-variant hover:text-on-surface"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleCreatePreset} className="space-y-4">
              <div>
                <label className="font-label-caps text-xs text-on-surface-variant block mb-1">
                  PRESET TITLE
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cyber Punk Voice"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-deep-charcoal border border-slate-border text-on-surface font-mono-data text-xs p-2.5 rounded focus:border-electric-cyan outline-none"
                />
              </div>

              <div>
                <label className="font-label-caps text-xs text-on-surface-variant block mb-1">
                  CATEGORY TAG
                </label>
                <input
                  type="text"
                  placeholder="e.g. CUSTOM"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  className="w-full bg-deep-charcoal border border-slate-border text-on-surface font-mono-data text-xs p-2.5 rounded focus:border-electric-cyan outline-none"
                />
              </div>

              <div>
                <label className="font-label-caps text-xs text-on-surface-variant block mb-1">
                  DESCRIPTION
                </label>
                <textarea
                  placeholder="Describe sound characteristics..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  rows="3"
                  className="w-full bg-deep-charcoal border border-slate-border text-on-surface font-mono-data text-xs p-2.5 rounded focus:border-electric-cyan outline-none resize-none"
                ></textarea>
              </div>

              <div className="pt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-1/2 border border-slate-border text-on-surface font-label-caps text-xs py-2 rounded hover:bg-slate-surface-high"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="w-1/2 bg-electric-cyan text-deep-charcoal font-label-caps text-xs font-bold py-2 rounded hover:bg-primary"
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
