
import React, { useState, useEffect, useRef } from 'react';
import { GeneratedImage, TransitionType } from '../types';

interface MoviePlayerProps {
  images: GeneratedImage[];
  onClose: () => void;
}

export const MoviePlayer: React.FC<MoviePlayerProps> = ({ images, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [transitionProgress, setTransitionProgress] = useState(1);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const prevIndexRef = useRef(0);
  
  const currentScene = images[currentIndex];
  const isVideo = currentScene.style === 'AI Motion';

  useEffect(() => {
    if (!hasStarted || isPaused || isExporting) return;

    setTransitionProgress(0);
    const transitionStart = Date.now();
    const duration = 1500;
    
    const animate = () => {
      const elapsed = Date.now() - transitionStart;
      const progress = Math.min(elapsed / duration, 1);
      setTransitionProgress(progress);
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);

    if (currentScene.audioUrl) {
      const audio = new Audio(currentScene.audioUrl);
      audioRef.current = audio;
      
      const onEnded = () => {
        if (!isPaused) {
          prevIndexRef.current = currentIndex;
          setCurrentIndex((prev) => (prev + 1) % images.length);
        }
      };

      audio.addEventListener('ended', onEnded);
      audio.play().catch(() => setTimeout(onEnded, 6000));

      if (isVideo && videoRef.current) {
        videoRef.current.currentTime = 0;
        videoRef.current.play().catch(() => {});
      }

      return () => {
        audio.pause();
        audio.removeEventListener('ended', onEnded);
      };
    } else {
      const timer = setTimeout(() => {
        prevIndexRef.current = currentIndex;
        setCurrentIndex((prev) => (prev + 1) % images.length);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, isPaused, images.length, isExporting, hasStarted]);

  const togglePause = () => {
    setIsPaused(!isPaused);
    if (audioRef.current) isPaused ? audioRef.current.play() : audioRef.current.pause();
    if (videoRef.current) isPaused ? videoRef.current.play() : videoRef.current.pause();
  };

  const getTransitionStyles = (idx: number): React.CSSProperties => {
    const isCurrent = idx === currentIndex;
    const isPrev = idx === prevIndexRef.current;
    const type: TransitionType = images[currentIndex].transition || "fade";
    if (!isCurrent && !isPrev) return { opacity: 0, pointerEvents: 'none' };
    const p = transitionProgress;
    if (isCurrent) {
      switch (type) {
        case "fade": return { opacity: p };
        case "zoom": return { opacity: p, transform: `scale(${0.9 + 0.1 * p})` };
        case "slide": return { opacity: 1, transform: `translateX(${(1 - p) * 100}%)` };
        case "blur": return { opacity: p, filter: `blur(${(1 - p) * 40}px)` };
        case "glitch": return { opacity: p, filter: `hue-rotate(${p * 720}deg) saturate(${1 + p})` };
        default: return { opacity: p };
      }
    } else {
      switch (type) {
        case "fade": return { opacity: 1 - p };
        case "zoom": return { opacity: 1 - p, transform: `scale(${1 + 0.2 * p})` };
        case "slide": return { opacity: 1, transform: `translateX(${-p * 100}%)` };
        case "blur": return { opacity: 1 - p, filter: `blur(${p * 40}px)` };
        case "glitch": return { opacity: 1 - p, filter: `brightness(${1 + p * 2})` };
        default: return { opacity: 1 - p };
      }
    }
  };

  if (!hasStarted) {
    return (
      <div className="fixed inset-0 z-[200] bg-black flex flex-col items-center justify-center p-10 text-center animate-in fade-in duration-1000">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <img src={images[0].url} className="w-full h-full object-cover blur-3xl" alt="" />
        </div>
        <h2 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase mb-8">Ready for <span className="text-indigo-500">Screening</span></h2>
        <button 
          onClick={() => setHasStarted(true)}
          className="px-20 py-8 bg-white text-black font-black uppercase text-xl rounded-full shadow-[0_0_80px_rgba(255,255,255,0.2)] hover:scale-105 active:scale-95 transition-all flex items-center gap-6"
        >
          <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20"><path d="M4.555 14.832A1 1 0 006 14V6a1 1 0 00-1.445-.832l-4 3a1 1 0 000 1.664l4 3.168z" /></svg>
          Begin Feature
        </button>
        <p className="mt-12 text-slate-500 font-black uppercase tracking-[0.4em] text-[10px]">Session Autoplay Protection Enabled</p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[150] bg-black flex flex-col items-center justify-center p-4 md:p-14 backdrop-blur-3xl overflow-hidden select-none animate-in fade-in duration-1000">
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        {isVideo ? <video src={currentScene.url} className="w-full h-full object-cover blur-3xl" muted loop /> : <img src={currentScene.url} className="w-full h-full object-cover blur-3xl" alt="" />}
      </div>
      <div className="absolute top-0 left-0 right-0 p-8 md:p-16 flex justify-between items-center bg-gradient-to-b from-black/90 to-transparent z-50">
        <div className="flex items-center gap-6">
          <div className="w-14 h-14 bg-white text-black rounded-2xl flex items-center justify-center font-black italic text-2xl">A</div>
          <div>
            <span className="text-indigo-400 font-black uppercase text-[10px] tracking-[0.5em] block">Cinema Engine V4</span>
            <h4 className="text-white font-black italic uppercase tracking-tighter text-xl md:text-3xl">Scene {currentIndex + 1} / {images.length}</h4>
          </div>
        </div>
        <button onClick={onClose} className="p-5 bg-white/5 hover:bg-red-600 rounded-full transition-all border border-white/10">✕</button>
      </div>

      <div className="relative w-full max-w-7xl aspect-video rounded-[3rem] md:rounded-[4rem] overflow-hidden shadow-3xl border border-white/10 bg-slate-900">
        {images.map((img, idx) => (
          <div key={img.id} className="absolute inset-0" style={getTransitionStyles(idx)}>
            {img.style === 'AI Motion' ? <video ref={idx === currentIndex ? videoRef : null} src={img.url} className="w-full h-full object-cover" muted loop playsInline /> : <img src={img.url} className="w-full h-full object-cover" alt="" />}
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-transparent to-transparent opacity-90"></div>
          </div>
        ))}
        <div className="absolute bottom-12 md:bottom-20 left-10 right-10 z-50 text-center pointer-events-none">
          <div className="inline-block px-10 py-6 md:px-16 md:py-8 rounded-[3rem] bg-black/60 backdrop-blur-xl border border-white/10 shadow-2xl">
            <p className="text-white text-2xl md:text-5xl font-black italic tracking-tighter uppercase leading-none">
              {currentScene.scriptSegment ? `"${currentScene.scriptSegment}"` : "..."}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-12 md:mt-16 flex items-center gap-10 md:gap-14 z-50">
        <button onClick={() => setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)} className="p-6 bg-white/5 rounded-full hover:bg-white hover:text-black transition-all border border-white/10">PREV</button>
        <button onClick={togglePause} className="p-10 md:p-14 bg-white rounded-full text-black hover:bg-indigo-600 hover:text-white transition-all transform hover:scale-105 shadow-2xl active:scale-95">
          {isPaused ? "PLAY" : "PAUSE"}
        </button>
        <button onClick={() => setCurrentIndex((prev) => (prev + 1) % images.length)} className="p-6 bg-white/5 rounded-full hover:bg-white hover:text-black transition-all border border-white/10">NEXT</button>
      </div>
    </div>
  );
};
