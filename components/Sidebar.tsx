
import React, { useState } from 'react';
import { AspectRatio, GenerationConfig } from '../types';
import { IMAGE_STYLES, ASPECT_RATIOS } from '../constants';

interface SidebarProps {
  onGenerate: (config: GenerationConfig) => void;
  isGenerating: boolean;
  progress: { current: number; total: number };
}

export const Sidebar: React.FC<SidebarProps> = ({ onGenerate, isGenerating, progress }) => {
  const [prompt, setPrompt] = useState("");
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("16:9");
  const [styleId, setStyleId] = useState("realistic");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isGenerating) return;
    onGenerate({ prompt, count: 0, aspectRatio, styleId });
  };

  return (
    <aside className="w-full md:w-[400px] bg-slate-900 border-r border-white/5 flex flex-col h-full z-10">
      <div className="p-8 overflow-y-auto flex-1 space-y-10 custom-scrollbar">
        <section>
          <div className="flex justify-between items-center mb-4">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Script / Storyboard</label>
            <span className="text-[9px] px-2 py-1 bg-white/5 text-white/40 rounded-full font-bold uppercase">Auto-Analyze</span>
          </div>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Paste your voiceover script here. Gemini will identify scenes, write visual prompts, and generate a cinematic storyboard."
            className="w-full h-64 bg-black text-white border-2 border-white/5 rounded-[2rem] p-6 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-700 font-medium text-sm leading-relaxed shadow-inner"
          />
        </section>

        <section>
          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Art Direction</label>
          <div className="grid grid-cols-2 gap-3">
            {IMAGE_STYLES.map((style) => (
              <button
                key={style.id}
                type="button"
                onClick={() => setStyleId(style.id)}
                className={`relative h-24 rounded-2xl overflow-hidden border-2 transition-all group ${
                  styleId === style.id ? 'border-indigo-500 scale-95 ring-8 ring-indigo-500/5 shadow-xl' : 'border-white/5 opacity-40 hover:opacity-100'
                }`}
              >
                <img src={style.preview} className="absolute inset-0 w-full h-full object-cover grayscale-[50%] group-hover:grayscale-0 transition-all" alt={style.name} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-black/20 flex items-end justify-center p-3">
                  <span className="text-[9px] font-black text-white uppercase tracking-widest">{style.name}</span>
                </div>
              </button>
            ))}
          </div>
        </section>

        <section>
          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Film Format</label>
          <div className="flex flex-wrap gap-2">
            {ASPECT_RATIOS.map((ratio) => (
              <button
                key={ratio.value}
                type="button"
                onClick={() => setAspectRatio(ratio.value)}
                className={`flex-1 min-w-[60px] p-4 rounded-2xl border-2 transition-all flex flex-col items-center ${
                  aspectRatio === ratio.value ? 'bg-indigo-600/10 border-indigo-500 text-indigo-400' : 'bg-black border-white/5 text-slate-600'
                }`}
              >
                <span className="text-xl mb-1">{ratio.icon}</span>
                <span className="text-[8px] font-black uppercase">{ratio.label}</span>
              </button>
            ))}
          </div>
        </section>
      </div>

      <div className="p-8 bg-slate-900 border-t border-white/5">
        <button
          onClick={handleSubmit}
          disabled={isGenerating || !prompt.trim()}
          className="w-full py-6 bg-white text-black hover:bg-indigo-500 hover:text-white rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs shadow-2xl transition-all transform active:scale-95 disabled:opacity-20 flex items-center justify-center gap-3"
        >
          {isGenerating ? (
            <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <>Start Production</>
          )}
        </button>
      </div>
    </aside>
  );
};
