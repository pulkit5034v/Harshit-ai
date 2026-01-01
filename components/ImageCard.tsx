
import React from 'react';
import { GeneratedImage } from '../types';

interface ImageCardProps {
  image: GeneratedImage;
  onDelete: () => void;
}

export const ImageCard: React.FC<ImageCardProps> = ({ image, onDelete }) => {
  const handleDownload = () => {
    if (image.loading || !image.url) return;
    const link = document.createElement('a');
    link.href = image.url;
    link.download = `gemini_${image.id.slice(0, 8)}.png`;
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
    <div className={`group relative bg-slate-800 rounded-2xl overflow-hidden border transition-all ${image.loading ? 'border-indigo-500/30' : 'border-slate-700 hover:scale-[1.02] hover:shadow-2xl hover:border-indigo-500/50'}`}>
      <div className={`w-full overflow-hidden relative ${getAspectClass(image.aspectRatio)}`}>
        {image.loading ? (
          <div className="absolute inset-0 bg-slate-800 flex flex-col items-center justify-center p-6 text-center">
            <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mb-4"></div>
            <p className="text-xs font-medium text-slate-400 animate-pulse uppercase tracking-widest">Generating...</p>
          </div>
        ) : image.error ? (
          <div className="absolute inset-0 bg-slate-900 flex flex-col items-center justify-center p-4 text-center">
            <svg className="w-8 h-8 text-red-500/50 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-xs text-red-400 font-medium">Failed to generate</p>
          </div>
        ) : (
          <img 
            src={image.url} 
            alt={image.prompt}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />
        )}
      </div>
      
      {/* Overlay Actions - only show if not loading/error */}
      {!image.loading && !image.error && (
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
          <div className="flex gap-2">
            <button 
              onClick={handleDownload}
              className="flex-1 bg-white hover:bg-slate-100 text-slate-900 font-bold py-2 rounded-lg text-sm flex items-center justify-center gap-2"
            >
              <DownloadSmall />
              Download
            </button>
            <button 
              onClick={onDelete}
              className="w-10 h-10 bg-red-500 hover:bg-red-400 text-white rounded-lg flex items-center justify-center transition-colors"
            >
              <TrashIcon />
            </button>
          </div>
        </div>
      )}

      {/* Delete button for loading/error states */}
      {(image.loading || image.error) && (
        <button 
          onClick={onDelete}
          className="absolute top-2 right-2 p-1.5 bg-slate-900/80 hover:bg-red-500 text-slate-400 hover:text-white rounded-lg transition-all opacity-0 group-hover:opacity-100"
        >
          <TrashIcon />
        </button>
      )}

      <div className="p-4 border-t border-slate-700/50">
        <div className="flex items-center gap-2 mb-2">
          <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase tracking-wider ${image.loading ? 'bg-indigo-500/10 text-indigo-400/50' : 'bg-indigo-500/20 text-indigo-400'}`}>
            {image.style}
          </span>
          <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase tracking-wider ${image.loading ? 'bg-slate-700/50 text-slate-500' : 'bg-slate-700 text-slate-400'}`}>
            {image.aspectRatio}
          </span>
        </div>
        <p className={`text-sm line-clamp-2 italic ${image.loading ? 'text-slate-600' : 'text-slate-300'}`}>
          "{image.prompt}"
        </p>
      </div>
    </div>
  );
};

const TrashIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const DownloadSmall = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
  </svg>
);
