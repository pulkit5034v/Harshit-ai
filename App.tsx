
import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { ImageGallery } from './components/ImageGallery';
import { MoviePlayer } from './components/MoviePlayer';
import { VideoStudio } from './components/VideoStudio';
import { AdminPanel } from './components/AdminPanel';
import { UserProfile } from './components/UserProfile';
import { User, Project, AccessKey, SystemSettings } from './types';
import { DB } from './services/dbService';

const App: React.FC = () => {
  const [session, setSession] = useState<{ user: User; key: AccessKey } | null>(null);
  const [authState, setAuthState] = useState<'key' | 'register' | 'authenticated'>('key');
  const [tempKey, setTempKey] = useState("");
  const [keyError, setKeyError] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [isStudioOpen, setIsStudioOpen] = useState(false);
  const [showMovie, setShowMovie] = useState(false);
  const [view, setView] = useState<'dashboard' | 'admin' | 'profile'>('dashboard');
  const [settings, setSettings] = useState<SystemSettings>(DB.getSettings());

  const fetchProjects = async (uid: string) => {
    const data = await DB.getUserProjects(uid);
    setProjects(data);
  };

  useEffect(() => {
    const savedSession = localStorage.getItem('studio_pro_session_v4');
    if (savedSession) {
      const data = JSON.parse(savedSession);
      const { key: validKey } = DB.validateKey(data.key.key);
      if (validKey && data.user.status === 'active') {
        setSession({ user: data.user, key: validKey });
        setAuthState('authenticated');
        fetchProjects(data.user.uid);
      } else {
        localStorage.removeItem('studio_pro_session_v4');
      }
    }

    const handleDBUpdate = () => {
      setSettings(DB.getSettings());
      if (session) {
        fetchProjects(session.user.uid);
        const updatedUser = DB.getAllUsers().find(u => u.uid === session.user.uid);
        if (updatedUser?.status === 'banned') handleLogout();
      }
    };

    window.addEventListener('db_updated', handleDBUpdate);
    return () => window.removeEventListener('db_updated', handleDBUpdate);
  }, [session?.user?.uid]);

  const handleKeySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setKeyError(null);
    const { key, error } = DB.validateKey(tempKey.trim());
    
    if (key) {
      setAuthState('register');
    } else {
      switch(error) {
        case 'EXPIRED': setKeyError("ACCESS DENIED: NODE VOIDED."); break;
        case 'EXHAUSTED': setKeyError("CAPACITY LIMIT: ALLOCATION DEPLETED."); break;
        default: setKeyError("SECURITY: INVALID IDENTIFIER.");
      }
    }
  };

  const handleRegister = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const user = DB.registerUser(
      formData.get('name') as string,
      formData.get('email') as string,
      tempKey.trim()
    );
    const { key } = DB.validateKey(tempKey.trim());
    if (key) {
      setSession({ user, key });
      setAuthState('authenticated');
      localStorage.setItem('studio_pro_session_v4', JSON.stringify({ user, key }));
      fetchProjects(user.uid);
    }
  };

  const handleLogout = () => {
    setSession(null);
    setAuthState('key');
    setTempKey("");
    setKeyError(null);
    localStorage.removeItem('studio_pro_session_v4');
    setView('dashboard');
  };

  const openStudio = () => {
    setIsStudioOpen(true);
  };

  if (authState === 'key') {
    return (
      <div className="h-screen bg-black flex items-center justify-center p-4 bg-[url('https://images.unsplash.com/photo-1540653364446-4eba4d307aa3?auto=format&fit=crop&q=80&w=1920')] bg-cover bg-center">
        <div className="absolute inset-0 bg-black/95 backdrop-blur-3xl" />
        <form onSubmit={handleKeySubmit} className="relative w-full max-w-lg bg-slate-900/60 p-12 md:p-16 rounded-[4rem] border border-white/10 shadow-[0_0_120px_rgba(99,102,241,0.2)] backdrop-blur-3xl animate-in zoom-in-95 duration-1000">
          <div className="mb-14 text-center">
            <h1 className="text-5xl md:text-6xl font-black italic tracking-tighter mb-4 text-white uppercase">
              {settings.appName.split(' ')[0]} <span className="text-indigo-500">{settings.appName.split(' ').slice(1).join(' ')}</span>
            </h1>
            <p className="text-slate-400 text-[11px] font-black uppercase tracking-[0.6em]">Secure Cinematic Gateway</p>
          </div>
          <div className="space-y-10">
            <input 
              value={tempKey} 
              onChange={e => { setTempKey(e.target.value); setKeyError(null); }}
              placeholder="ENTER SECURE ACCESS CODE" 
              required 
              className={`w-full p-8 bg-black/60 rounded-[2.5rem] border-2 ${keyError ? 'border-red-500/50' : 'border-white/5 focus:border-indigo-500'} text-white text-center font-mono text-xl tracking-[0.4em] outline-none transition-all shadow-inner`} 
            />
            {keyError && <div className="text-red-500 text-[10px] font-black uppercase tracking-widest text-center">{keyError}</div>}
            <button type="submit" className="w-full py-8 bg-indigo-600 rounded-[2.5rem] text-white font-black uppercase tracking-[0.4em] text-sm hover:bg-white hover:text-black transition-all shadow-3xl active:scale-95">Verify Identity</button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden bg-black text-white selection:bg-indigo-500/40 font-sans">
      
      {/* Sidebar - Desktop */}
      <div className="hidden md:flex w-[400px] border-r border-white/5 bg-slate-900/40 backdrop-blur-3xl flex-col p-10 overflow-hidden animate-in slide-in-from-left duration-1000 z-50">
        <header className="mb-16 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-black italic tracking-tighter uppercase whitespace-nowrap text-white">
              {settings.appName.split(' ')[0]} <span className="text-indigo-500">{settings.appName.split(' ').slice(1).join(' ')}</span>
            </h1>
            <div className="flex items-center gap-3 mt-4">
              {session?.user.role === 'admin' && <span className="bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 px-3 py-1 rounded-[10px] text-[8px] font-black tracking-[0.2em]">ADMIN</span>}
              <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest truncate max-w-[150px]">{session?.user.name}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="text-slate-700 hover:text-red-500 transition-all p-3 rounded-full hover:bg-red-500/10 active:scale-90">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 16l4-4m0 0l-4-4m4 4H7" /></svg>
          </button>
        </header>

        <nav className="space-y-6 mb-16">
          <button onClick={() => setView('dashboard')} className={`w-full flex items-center gap-5 p-6 rounded-[2rem] text-[11px] font-black uppercase tracking-[0.3em] transition-all group ${view === 'dashboard' ? 'bg-indigo-600 text-white shadow-3xl' : 'hover:bg-white/5 text-slate-500'}`}>Studio Floor</button>
          <button onClick={() => setView('profile')} className={`w-full flex items-center gap-5 p-6 rounded-[2rem] text-[11px] font-black uppercase tracking-[0.3em] transition-all group ${view === 'profile' ? 'bg-indigo-600 text-white shadow-3xl' : 'hover:bg-white/5 text-slate-500'}`}>Identity</button>
          {session?.user.role === 'admin' && (
            <button onClick={() => setView('admin')} className={`w-full flex items-center gap-5 p-6 rounded-[2rem] text-[11px] font-black uppercase tracking-[0.3em] transition-all group ${view === 'admin' ? 'bg-indigo-600 text-white shadow-3xl' : 'hover:bg-white/5 text-slate-500'}`}>Admin Deck</button>
          )}
        </nav>

        <button 
          onClick={openStudio}
          className="w-full py-7 bg-white text-black font-black uppercase tracking-[0.4em] text-[11px] rounded-[2rem] hover:bg-indigo-600 hover:text-white transition-all shadow-3xl mb-14 flex items-center justify-center gap-3 active:scale-95"
        >
          New Production
        </button>

        <div className="flex-1 overflow-y-auto space-y-6 custom-scrollbar pr-4">
          <label className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.5em] block px-2 mb-6">Master Library</label>
          {projects.map(p => (
            <div 
              key={p.id} 
              onClick={() => { setActiveProject(p); setView('dashboard'); }}
              className={`p-6 rounded-[2rem] border-2 transition-all cursor-pointer group ${activeProject?.id === p.id && view === 'dashboard' ? 'bg-indigo-600/15 border-indigo-500/50 shadow-indigo-500/10' : 'bg-black/30 border-white/5 hover:border-white/10 hover:bg-white/[0.03]'}`}
            >
              <div className="flex justify-between items-start mb-2">
                <p className="font-black text-[11px] uppercase truncate tracking-tight text-white">{p.title}</p>
                <button onClick={(e) => { e.stopPropagation(); DB.deleteProject(session!.user.uid, p.id); }} className="opacity-0 group-hover:opacity-100 p-1 text-slate-700 hover:text-red-500 transition-all">✕</button>
              </div>
              <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest">{p.scenes.length} Scenes</p>
            </div>
          ))}
        </div>
      </div>

      {/* Main Area */}
      <main className="flex-1 overflow-y-auto relative bg-black/40 pb-32 md:pb-0 custom-scrollbar animate-in fade-in duration-1000">
        
        {/* Mobile Header */}
        <div className="md:hidden flex justify-between items-center p-8 border-b border-white/5 bg-slate-900/98 backdrop-blur-3xl sticky top-0 z-50">
           <h1 className="text-2xl font-black italic tracking-tighter uppercase text-white">
            {settings.appName.split(' ')[0]} <span className="text-indigo-500">{settings.appName.split(' ').slice(1).join(' ')}</span>
           </h1>
           <div className="flex items-center gap-5">
             <button onClick={() => setView('profile')} className="p-4 bg-white/5 rounded-full border border-white/10"><svg className="w-6 h-6 text-indigo-500" fill="currentColor" viewBox="0 0 20 20"><path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" /></svg></button>
             <button onClick={openStudio} className="p-4 bg-indigo-600 rounded-full border-2 border-white/10 shadow-3xl"><svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" /></svg></button>
           </div>
        </div>

        <div className="relative min-h-full">
           <div key={view} className="animate-in fade-in slide-in-from-bottom-5 duration-1000">
            {view === 'admin' ? (
              <AdminPanel adminUser={session!.user} />
            ) : view === 'profile' ? (
              <UserProfile user={session!.user} accessKey={session!.key} onLogout={handleLogout} />
            ) : activeProject ? (
              <div className="p-10 md:p-20">
                <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end mb-24 pb-16 border-b border-white/10 gap-12">
                  <div className="w-full">
                    <h2 className="text-5xl md:text-8xl xl:text-9xl font-black italic tracking-tighter uppercase text-white leading-none mb-10">{activeProject.title}</h2>
                    <div className="flex flex-wrap items-center gap-8">
                       <div className="bg-indigo-600/10 text-indigo-400 font-black uppercase text-[12px] px-8 py-3.5 rounded-full border border-indigo-500/20 tracking-[0.4em]">Master Release</div>
                       <span className="text-slate-500 font-black uppercase text-[12px] tracking-[0.5em]">{activeProject.scenes.length} Master Cuts</span>
                    </div>
                  </div>
                  <button onClick={() => setShowMovie(true)} className="w-full xl:w-auto px-20 py-8 bg-white text-black font-black uppercase text-sm rounded-full shadow-3xl hover:bg-indigo-600 hover:text-white transition-all transform hover:-translate-y-3 active:scale-95 border-2 border-white/10">Screen Production</button>
                </div>
                <ImageGallery images={activeProject.scenes} onDelete={(id) => {
                  const updated = { ...activeProject, scenes: activeProject.scenes.filter(s => s.id !== id) };
                  setActiveProject(updated);
                  DB.saveProject(session!.user.uid, updated);
                }} onEdit={() => {}} />
              </div>
            ) : (
              <div className="h-[85vh] flex flex-col items-center justify-center opacity-30 p-16 text-center select-none">
                <div className="w-40 h-40 md:w-64 md:h-64 mb-16 border-4 border-dashed border-white/10 rounded-full flex items-center justify-center animate-spin-slow">
                   <svg className="w-20 h-20 md:w-32 md:h-32 text-indigo-500/40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.5" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                </div>
                <h3 className="text-5xl md:text-8xl font-black italic uppercase tracking-tighter text-white">Production Floor</h3>
                <p className="text-[12px] md:text-base uppercase tracking-[0.8em] font-black mt-12 text-indigo-700">Awaiting Executive Input</p>
              </div>
            )}
           </div>
        </div>
      </main>

      {/* Mobile Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900/98 border-t border-white/10 flex justify-around items-center p-8 backdrop-blur-3xl z-50">
        <button onClick={() => setView('dashboard')} className={`p-5 transition-all flex flex-col items-center gap-3 ${view === 'dashboard' ? 'text-indigo-500 scale-125' : 'text-slate-600'}`}>Floor</button>
        <button onClick={openStudio} className="relative w-20 h-20 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-3xl -mt-20 border-8 border-slate-900 active:scale-90 transition-transform">New</button>
        <button onClick={() => setView('profile')} className={`p-5 transition-all flex flex-col items-center gap-3 ${view === 'profile' ? 'text-indigo-500 scale-125' : 'text-slate-600'}`}>Me</button>
      </div>

      {isStudioOpen && session && (
        <VideoStudio 
          user={session.user}
          accessKey={session.key}
          onClose={() => setIsStudioOpen(false)} 
          onComplete={(project) => {
            DB.saveProject(session.user.uid, project);
            DB.updateUserProduction(session.user.uid, Math.ceil(project.totalDurationSeconds / 60));
            setActiveProject(project);
            setIsStudioOpen(false);
            setView('dashboard');
          }}
        />
      )}

      {showMovie && activeProject && <MoviePlayer images={activeProject.scenes} onClose={() => setShowMovie(false)} />}
    </div>
  );
};

export default App;
