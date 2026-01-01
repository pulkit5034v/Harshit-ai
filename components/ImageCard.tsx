
import React from 'react';
import { GeneratedImage } from '../types';

interface ImageCardProps {
  image: GeneratedImage;
  onDelete: () => void;
  onEdit: () => void;
}

export const ImageCard: React.FC<ImageCardProps> = ({ image, onDelete, onEdit }) => {
  const handleDownload = () => {
    if (image.loading || !image.url) return;
    const link = document.createElement('a');
    link.href = image.url;
    link.download = `cinema_frame_${image.id.slice(0, 8)}.png`;
    link.click();
  };

  const getAspectClass = (ratio: string) => {
    switch (ratio) {
      case "1:1": return "aspect-square";
      case "3:4": return "aspect-[3/4]";
      case "4:3": return "aspect-[4/3]";
      case "9:16": return "aspect-[9/16]";
      case "16:9": return "aspect-[16/9]";
      default: return "aspect-square";
    }
  };

  return (
    <div className={`group relative bg-slate-950 rounded-[2.5rem] overflow-hidden border transition-all duration-500 ${image.loading ? 'border-indigo-500/20 animate-pulse' : 'border-white/5 hover:border-indigo-500/40 hover:shadow-[0_0_40px_rgba(99,102,241,0.1)]'}`}>
      <div className={`w-full overflow-hidden relative ${getAspectClass(image.aspectRatio)}`}>
        {image.loading ? (
          <div className="absolute inset-0 bg-black flex flex-col items-center justify-center p-8 text-center">
            <div className="w-12 h-12 border-2 border-indigo-500/10 border-t-indigo-500 rounded-full animate-spin mb-6"></div>
            <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em]">Processing Frame</p>
          </div>
        ) : image.error ? (
          <div className="absolute inset-0 bg-red-950/10 flex flex-col items-center justify-center p-6 text-center">
            <svg className="w-8 h-8 text-red-500/50 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <p className="text-[10px] text-red-500 font-black uppercase tracking-widest">Transmission Failure</p>
          </div>
        ) : (
          <>
            <img 
              src={image.url} 
              alt=""
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
              loading="lazy"
            />
            {/* Cinematic Frame Indicators */}
            <div className="absolute top-4 left-4 flex gap-2">
              <div className="px-3 py-1 bg-black/60 backdrop-blur-md rounded-full border border-white/10 text-[8px] font-black uppercase tracking-widest text-white/80">REC</div>
            </div>
            <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md rounded-full border border-white/10 px-3 py-1 text-[8px] font-black uppercase tracking-widest text-indigo-400">
              {image.transition?.toUpperCase() || "FADE"}
            </div>
          </>
        )}
      </div>
      
      {/* Overlay Actions */}
      {!image.loading && !image.error && (
        <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-4 p-6 backdrop-blur-[2px]">
          <button onClick={onEdit} className="p-4 bg-white text-black rounded-full hover:bg-indigo-600 hover:text-white transition-all transform hover:-translate-y-1 active:scale-90">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" strokeWidth="2" /></svg>
          </button>
          <button onClick={handleDownload} className="p-4 bg-white text-black rounded-full hover:bg-indigo-600 hover:text-white transition-all transform hover:-translate-y-1 active:scale-90">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" strokeWidth="2" /></svg>
          </button>
          <button onClick={onDelete} className="p-4 bg-red-500/10 text-red-500 rounded-full hover:bg-red-500 hover:text-white transition-all transform hover:-translate-y-1 active:scale-90 border border-red-500/20">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeWidth="2" /></svg>
          </button>
        </div>
      )}

      <div className="p-6 md:p-8">
        <div className="flex items-center gap-3 mb-4">
          <span className={`px-3 py-1 text-[9px] font-black rounded-full uppercase tracking-widest ${image.loading ? 'bg-white/5 text-white/20' : 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20'}`}>
            {image.style}
          </span>
          <span className="px-3 py-1 text-[9px] font-black rounded-full uppercase tracking-widest bg-white/5 text-white/40 border border-white/10">
            {image.aspectRatio}
          </span>
        </div>
        <p className={`text-sm md:text-base font-black leading-tight italic line-clamp-2 mb-3 tracking-tight ${image.loading ? 'text-white/10' : 'text-white'}`}>
          {image.scriptSegment ? `"${image.scriptSegment}"` : image.prompt}
        </p>
        <div className="flex justify-between items-center opacity-40">
           <span className="text-[9px] font-black uppercase tracking-widest">Frame Index #{image.id.slice(-4).toUpperCase()}</span>
           <span className="text-[9px] font-black uppercase tracking-widest">5.0s</span>
        </div>
      </div>
    </div>
  );
};
