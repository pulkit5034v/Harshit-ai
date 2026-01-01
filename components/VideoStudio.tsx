
import React, { useState } from 'react';
import { generateScriptFromTitle, suggestVoiceConfig, extractScenesFromScript, generateSingleImage, generateSingleVideo, generateTTS } from '../services/geminiService';
import { Project, VoiceConfig, User, AccessKey, TransitionType } from '../types';

interface VideoStudioProps {
  user: User;
  accessKey: AccessKey;
  onClose: () => void;
  onComplete: (project: Project) => void;
}

const VOICES = [
  { name: 'Kore', label: 'Energetic Female' },
  { name: 'Puck', label: 'Warm Male' },
  { name: 'Charon', label: 'Grave Male' },
  { name: 'Zephyr', label: 'Smooth Neutral' },
  { name: 'Fenrir', label: 'Strong Male' }
];

const TRANSITIONS: TransitionType[] = ["fade", "slide", "zoom", "blur", "glitch"];

export const VideoStudio: React.FC<VideoStudioProps> = ({ user, accessKey, onClose, onComplete }) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [inputMode, setInputMode] = useState<'title' | 'script'>('title');
  const [productionMode, setProductionMode] = useState<'image' | 'video'>('image');
  const [inputValue, setInputValue] = useState("");
  const [script, setScript] = useState("");
  const [voiceConfig, setVoiceConfig] = useState<VoiceConfig>({ voiceName: 'Puck', gender: 'Male', tone: 'Friendly' });
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [progress, setProgress] = useState(0);

  const checkVeoKey = async () => {
    if (productionMode === 'video') {
      const hasKey = await (window as any).aistudio.hasSelectedApiKey();
      if (!hasKey) {
        alert("Veo Video Generation requires a paid API key.");
        await (window as any).aistudio.openSelectKey();
      }
    }
    return true;
  };

  const startAnalysis = async () => {
    if (!inputValue.trim() || isProcessing) return;
    setIsProcessing(true);
    setStatusMessage("Synthesizing Narrative Structure...");
    const apiKey = process.env.API_KEY || "";
    try {
      let finalScript = inputValue;
      if (inputMode === 'title') {
        finalScript = await generateScriptFromTitle(inputValue, apiKey);
      }
      setScript(finalScript);
      const suggested = await suggestVoiceConfig(finalScript, apiKey);
      setVoiceConfig(suggested);
      setStep(2);
    } catch (e) {
      console.error(e);
      alert("Creative node failed. Retrying...");
    } finally {
      setIsProcessing(false);
      setStatusMessage("");
    }
  };

  const startProduction = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    setStatusMessage("Connecting to Production Cloud...");
    
    try {
      await checkVeoKey();
      const apiKey = process.env.API_KEY || "";
      
      setStatusMessage("Extracting Scenes...");
      const scenesData = await extractScenesFromScript(script, apiKey);
      
      const multiplier = productionMode === 'video' ? 15 : 8;
      const estimatedMinutes = Math.ceil((scenesData.length * multiplier) / 60);
      
      if (user.role !== 'admin' && (accessKey.usedMinutes + estimatedMinutes > accessKey.maxProductionMinutes)) {
        alert("Resource allocation exhausted.");
        setIsProcessing(false);
        return;
      }

      const producedScenes: any[] = [];
      const total = scenesData.length;

      for (let i = 0; i < total; i++) {
        setStatusMessage(`Rendering Scene ${i + 1}/${total}...`);
        const scene = scenesData[i];
        
        const [visualUrl, audioUrl] = await Promise.all([
          productionMode === 'video' 
            ? generateSingleVideo(scene.visualPrompt, '16:9', apiKey)
            : generateSingleImage(scene.visualPrompt, '16:9', apiKey),
          generateTTS(scene.scriptText, voiceConfig.voiceName, apiKey)
        ]).catch(e => {
          console.error("Batch failure, retrying scene...", e);
          return Promise.all([
            productionMode === 'video' 
              ? generateSingleVideo(scene.visualPrompt, '16:9', apiKey)
              : generateSingleImage(scene.visualPrompt, '16:9', apiKey),
            generateTTS(scene.scriptText, voiceConfig.voiceName, apiKey)
          ]);
        });

        producedScenes.push({
          id: crypto.randomUUID(),
          url: visualUrl,
          audioUrl,
          prompt: scene.visualPrompt,
          scriptSegment: scene.scriptText,
          aspectRatio: '16:9' as const,
          style: productionMode === 'video' ? 'AI Motion' : 'Cinematic Still',
          timestamp: Date.now(),
          duration: 5,
          transition: TRANSITIONS[i % TRANSITIONS.length]
        });
        
        setProgress(Math.floor(((i + 1) / total) * 100));
      }

      const project: Project = {
        id: crypto.randomUUID(),
        title: inputMode === 'title' ? inputValue : (script.slice(0, 30) + "..."),
        scenes: producedScenes,
        voiceConfig,
        createdAt: Date.now(),
        totalDurationSeconds: producedScenes.length * 5,
        defaultTransition: "fade"
      };
      onComplete(project);
    } catch (e) {
      console.error(e);
      alert("Critical pipeline stall.");
    } finally {
      setIsProcessing(false);
      setStatusMessage("");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-3xl flex items-center justify-center p-6 md:p-12 overflow-hidden animate-in fade-in duration-500">
      <div className="w-full max-w-5xl bg-slate-900 border border-white/5 rounded-[4rem] p-12 md:p-20 shadow-3xl relative max-h-[92vh] overflow-y-auto custom-scrollbar">
        <button onClick={onClose} className="absolute top-12 right-12 text-white/20 hover:text-white p-4 bg-white/5 rounded-full transition-all">✕</button>
        {step === 1 ? (
          <div className="space-y-16 animate-in slide-in-from-bottom-10 duration-700">
            <header className="text-center space-y-6">
              <h2 className="text-6xl md:text-8xl font-black italic tracking-tighter uppercase text-white">Feature <span className="text-indigo-500">Forge</span></h2>
              <p className="text-[12px] font-black text-slate-500 uppercase tracking-[0.8em]">Initializing Script Engine 3.1</p>
            </header>
            <div className="flex bg-black/60 p-2 rounded-[3rem] border border-white/5 max-w-lg mx-auto">
              <button onClick={() => setInputMode('title')} className={`flex-1 py-5 rounded-[2.5rem] text-[11px] font-black uppercase tracking-widest transition-all ${inputMode === 'title' ? 'bg-indigo-600 text-white' : 'text-slate-500'}`}>Title Flow</button>
              <button onClick={() => setInputMode('script')} className={`flex-1 py-5 rounded-[2.5rem] text-[11px] font-black uppercase tracking-widest transition-all ${inputMode === 'script' ? 'bg-indigo-600 text-white' : 'text-slate-500'}`}>Direct Script</button>
            </div>
            <textarea value={inputValue} onChange={(e) => setInputValue(e.target.value)} placeholder={inputMode === 'title' ? "Describe your cinematic vision..." : "Paste your production screenplay..."} className="w-full h-80 bg-black/40 border-2 border-white/5 rounded-[4rem] p-12 text-xl text-white outline-none focus:border-indigo-500 transition-all resize-none shadow-inner" />
            <button onClick={startAnalysis} disabled={!inputValue.trim() || isProcessing} className="w-full py-8 bg-white text-black hover:bg-indigo-600 hover:text-white rounded-[3.5rem] font-black uppercase text-base tracking-[0.5em] transition-all flex items-center justify-center gap-6 active:scale-95 shadow-3xl">
              {isProcessing ? statusMessage : "Analyze Production Strategy"}
            </button>
          </div>
        ) : (
          <div className="space-y-16 animate-in zoom-in-95 duration-700">
             <header className="text-center space-y-6">
              <h2 className="text-6xl md:text-8xl font-black italic tracking-tighter uppercase text-white leading-none">Studio <span className="text-indigo-500">Floor</span></h2>
              <p className="text-[12px] font-black text-slate-500 uppercase tracking-[0.8em]">Final Casting & Model Selection</p>
            </header>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="space-y-10">
                <div className="bg-black/40 p-12 rounded-[4rem] border border-white/5">
                  <label className="text-[11px] font-black text-indigo-500 uppercase mb-6 block tracking-widest">Vocal Asset Casting</label>
                  <div className="grid grid-cols-1 gap-4">
                    {VOICES.map(v => (
                      <button key={v.name} onClick={() => setVoiceConfig({...voiceConfig, voiceName: v.name as any})} className={`p-6 rounded-[2rem] border-2 text-left transition-all flex justify-between items-center ${voiceConfig.voiceName === v.name ? 'bg-indigo-600/20 border-indigo-500 text-white' : 'bg-black/40 border-white/5 text-slate-500'}`}>
                        <span className="text-[13px] font-black uppercase tracking-widest">{v.label}</span>
                        {voiceConfig.voiceName === v.name && <div className="w-3 h-3 bg-indigo-500 rounded-full animate-pulse" />}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="bg-black/40 p-12 rounded-[4rem] border border-white/5 space-y-8">
                  <label className="text-[11px] font-black text-indigo-500 uppercase block tracking-widest">Motion Engine</label>
                  <div className="flex bg-black/60 p-2 rounded-[2.5rem] border border-white/5">
                    <button onClick={() => setProductionMode('image')} className={`flex-1 py-4 rounded-3xl text-[10px] font-black uppercase tracking-widest transition-all ${productionMode === 'image' ? 'bg-indigo-600 text-white' : 'text-slate-500'}`}>Still Frame</button>
                    <button onClick={() => setProductionMode('video')} className={`flex-1 py-4 rounded-3xl text-[10px] font-black uppercase tracking-widest transition-all ${productionMode === 'video' ? 'bg-indigo-600 text-white' : 'text-slate-500'}`}>Veo AI Motion</button>
                  </div>
                </div>
              </div>
              <textarea value={script} onChange={(e) => setScript(e.target.value)} className="bg-black/40 p-12 rounded-[4rem] border border-white/5 text-slate-300 text-xl leading-relaxed italic outline-none resize-none font-medium custom-scrollbar" />
            </div>
            <div className="space-y-8">
              {isProcessing && (
                <div className="w-full bg-white/5 h-3 rounded-full overflow-hidden border border-white/5">
                  <div className="h-full bg-indigo-500 transition-all duration-700" style={{ width: `${progress}%` }} />
                </div>
              )}
              <button onClick={startProduction} disabled={isProcessing} className="w-full py-9 bg-indigo-600 hover:bg-indigo-500 text-white rounded-[3.5rem] font-black uppercase text-lg tracking-[0.6em] transition-all shadow-3xl active:scale-95">
                {isProcessing ? statusMessage : "Execute Multi-Modality Production"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
