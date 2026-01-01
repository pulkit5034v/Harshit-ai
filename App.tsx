
import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { ImageGallery } from './components/ImageGallery';
import { GeneratedImage, GenerationConfig } from './types';
import { IMAGE_STYLES } from './constants';
import { generateSingleImage, extractImagePrompts } from './services/geminiService';

const App: React.FC = () => {
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (config: GenerationConfig) => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      setError("API Key is missing. Please ensure environment variables are set.");
      return;
    }

    if (!config.prompt.trim()) {
      setError("Please enter some text to analyze.");
      return;
    }

    setError(null);
    setIsGenerating(true);
    setIsAnalyzing(true);

    try {
      // Step 1: Use AI to understand how many images/scenes are needed
      const scenes = await extractImagePrompts(config.prompt, apiKey);
      setIsAnalyzing(false);

      if (scenes.length === 0) {
        throw new Error("AI couldn't extract any visual scenes from your text.");
      }

      setProgress({ current: 0, total: scenes.length });
      const selectedStyle = IMAGE_STYLES.find(s => s.id === config.styleId);

      // Step 2: Create placeholders
      const placeholders = scenes.map(scene => ({
        id: crypto.randomUUID(),
        url: '',
        prompt: scene,
        aspectRatio: config.aspectRatio,
        style: selectedStyle?.name || 'None',
        timestamp: Date.now(),
        loading: true,
      }));

      setImages(prev => [...placeholders, ...prev]);

      // Step 3: Parallel Generation with increased concurrency
      const CONCURRENCY_LIMIT = 6; 
      let completedCount = 0;

      const processBatch = async (batch: typeof placeholders) => {
        await Promise.all(batch.map(async (placeholder) => {
          const finalPrompt = `${placeholder.prompt}${selectedStyle?.promptSuffix || ''}`;
          try {
            const imageUrl = await generateSingleImage(finalPrompt, placeholder.aspectRatio, apiKey);
            setImages(prev => prev.map(img => 
              img.id === placeholder.id ? { ...img, url: imageUrl, loading: false } : img
            ));
          } catch (err: any) {
            setImages(prev => prev.map(img => 
              img.id === placeholder.id ? { ...img, loading: false, error: err.message || "Failed" } : img
            ));
          } finally {
            completedCount++;
            setProgress(prev => ({ ...prev, current: completedCount }));
          }
        }));
      };

      for (let i = 0; i < placeholders.length; i += CONCURRENCY_LIMIT) {
        const batch = placeholders.slice(i, i + CONCURRENCY_LIMIT);
        await processBatch(batch);
      }

    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
      setIsAnalyzing(false);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClear = () => {
    if (window.confirm("Clear all images?")) setImages([]);
  };

  const handleDeleteImage = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
  };

  const handleDownloadAll = async () => {
    const finished = images.filter(img => !img.loading && img.url);
    if (finished.length === 0) return;
    // @ts-ignore
    const zip = new JSZip();
    finished.forEach((img, idx) => {
      zip.file(`${idx + 1}_prompt.png`, img.url.split(',')[1], { base64: true });
    });
    const blob = await zip.generateAsync({ type: "blob" });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `bulk_art_${Date.now()}.zip`;
    link.click();
  };

  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden bg-slate-950">
      <Sidebar onGenerate={handleGenerate} isGenerating={isGenerating} progress={progress} />

      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-black text-white bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">
              Bulk Vision AI
            </h1>
            <p className="text-slate-400 mt-1">Intelligent scene extraction and high-speed generation.</p>
          </div>
          
          <div className="flex gap-3">
            {images.length > 0 && (
              <button
                onClick={handleDownloadAll}
                disabled={!images.some(i => !i.loading && i.url)}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg transition-all flex items-center gap-2"
              >
                Download ZIP ({images.filter(i => !i.loading && i.url).length})
              </button>
            )}
            {images.length > 0 && (
              <button onClick={handleClear} className="px-4 py-3 bg-slate-800 text-slate-400 rounded-xl border border-slate-700">Clear</button>
            )}
          </div>
        </header>

        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-500/30 rounded-2xl text-red-400 flex justify-between">
            <span>{error}</span>
            <button onClick={() => setError(null)}>✕</button>
          </div>
        )}

        {isGenerating && (
          <div className="mb-8 p-6 bg-indigo-600/10 border border-indigo-500/20 rounded-3xl flex flex-col items-center">
            <h2 className="text-xl font-bold text-indigo-300 mb-2">
              {isAnalyzing ? "AI is analyzing your text for scenes..." : `Generating Masterpieces: ${progress.current} / ${progress.total}`}
            </h2>
            {!isAnalyzing && (
              <div className="w-full max-w-xl h-4 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-indigo-500 to-cyan-500 transition-all duration-700" 
                  style={{ width: `${(progress.current / progress.total) * 100}%` }}
                />
              </div>
            )}
            {isAnalyzing && <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>}
          </div>
        )}

        <ImageGallery images={images} onDelete={handleDeleteImage} />
        
        {images.length === 0 && !isGenerating && (
          <div className="flex flex-col items-center justify-center py-32 border-4 border-dashed border-slate-900 rounded-[3rem]">
            <div className="w-24 h-24 bg-slate-900 rounded-full flex items-center justify-center mb-6 text-slate-700">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            </div>
            <h3 className="text-2xl font-bold text-slate-400">Ready to visualize?</h3>
            <p className="text-slate-600 mt-2 max-w-sm text-center">Paste a story, description, or list of ideas. Our AI will automatically decide how many images to create.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
