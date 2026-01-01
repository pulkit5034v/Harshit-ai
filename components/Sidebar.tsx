
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
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("1:1");
  const [styleId, setStyleId] = useState("none");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isGenerating) return;
    onGenerate({ prompt, count: 0, aspectRatio, styleId });
  };

  return (
    <aside className="w-full md:w-[380px] bg-slate-900 border-r border-slate-800 flex flex-col h-full z-10">
      <div className="p-6 overflow-y-auto flex-1 custom-scrollbar space-y-8">
        <section>
          <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3">
            The Story / Input
          </label>
          <div className="relative group">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Tell a story or list your ideas... AI will analyze and generate images for each key scene automatically."
              className="w-full h-48 bg-slate-950 text-white border-2 border-slate-800 rounded-2xl p-5 focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-700 resize-none font-medium text-sm leading-relaxed"
            />
          </div>
        </section>

        <section>
          <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3">
            Art Direction
          </label>
          <div className="grid grid-cols-2 gap-3">
            {IMAGE_STYLES.map((style) => (
              <button
                key={style.id}
                type="button"
                onClick={() => setStyleId(style.id)}
                className={`relative h-20 rounded-xl overflow-hidden border-2 transition-all group ${
                  styleId === style.id ? 'border-indigo-500 scale-95 ring-4 ring-indigo-500/10' : 'border-slate-800 grayscale opacity-40 hover:opacity-100 hover:grayscale-0'
                }`}
              >
                <img src={style.preview} className="absolute inset-0 w-full h-full object-cover" alt={style.name} />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center p-2 text-center">
                  <span className="text-[10px] font-black text-white uppercase tracking-tighter drop-shadow-lg">{style.name}</span>
                </div>
              </button>
            ))}
          </div>
        </section>

        <section>
          <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3">
            Dimension
          </label>
          <div className="flex flex-wrap gap-2">
            {ASPECT_RATIOS.map((ratio) => (
              <button
                key={ratio.value}
                type="button"
                onClick={() => setAspectRatio(ratio.value)}
                className={`flex-1 min-w-[60px] p-3 rounded-xl border-2 transition-all flex flex-col items-center ${
                  aspectRatio === ratio.value ? 'bg-indigo-600/10 border-indigo-500 text-indigo-400' : 'bg-slate-950 border-slate-800 text-slate-600'
                }`}
              >
                <span className="text-xl mb-1">{ratio.icon}</span>
                <span className="text-[9px] font-bold uppercase">{ratio.label}</span>
              </button>
            ))}
          </div>
        </section>
      </div>

      <div className="p-6 bg-slate-900 border-t border-slate-800">
        <button
          onClick={handleSubmit}
          disabled={isGenerating || !prompt.trim()}
          className="w-full py-5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-cyan-500 text-white rounded-[1.25rem] font-black uppercase tracking-widest text-sm shadow-2xl shadow-indigo-500/30 transition-all transform active:scale-95 disabled:opacity-30 flex items-center justify-center gap-3"
        >
          {isGenerating ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1a1 1 0 112 0v1a1 1 0 11-2 0zM13 16v-1a1 1 0 112 0v1a1 1 0 11-2 0zM14.95 14.95a1 1 0 010-1.414l.707-.707a1 1 0 011.414 1.414l-.707.707a1 1 0 01-1.414 0zM6.464 14.95l.707-.707a1 1 0 011.414 1.414l-.707.707a1 1 0 01-1.414-1.414z" /></svg>
              AI Extract & Gen
            </>
          )}
        </button>
        <p className="text-[10px] text-center text-slate-500 mt-4 font-bold uppercase tracking-tighter">Powered by Gemini 2.5 & 3 Pro</p>
      </div>
    </aside>
  );
};
