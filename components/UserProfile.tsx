
import React from 'react';
import { User, AccessKey } from '../types';

interface UserProfileProps {
  user: User;
  accessKey: AccessKey;
  onLogout: () => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({ user, accessKey, onLogout }) => {
  return (
    <div className="p-6 md:p-10 flex flex-col items-center justify-center min-h-full animate-in zoom-in-95 duration-700">
      <div className="w-full max-w-3xl bg-slate-900/60 border border-white/10 rounded-[4rem] p-10 md:p-20 shadow-[0_40px_100px_rgba(0,0,0,0.5)] relative overflow-hidden backdrop-blur-3xl">
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-indigo-600/20 blur-[120px] -z-10 rounded-full animate-pulse" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-purple-600/10 blur-[120px] -z-10 rounded-full animate-pulse" />
        
        <header className="text-center mb-16">
          <div className="relative inline-block group">
            <div className="absolute inset-0 bg-indigo-500 blur-2xl opacity-20 group-hover:opacity-40 transition-opacity" />
            <div className="relative w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-indigo-500 to-indigo-800 rounded-[2.5rem] mx-auto mb-8 flex items-center justify-center text-4xl font-black text-white italic shadow-2xl transform hover:rotate-3 transition-transform cursor-default">
              {user.name.charAt(0).toUpperCase()}
            </div>
          </div>
          <h2 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase mb-3 text-white leading-none">{user.name}</h2>
          <div className="inline-block px-4 py-1.5 bg-white/5 rounded-full border border-white/10 text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">{user.email}</div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <div className="bg-black/40 p-10 rounded-[3rem] border border-white/5 shadow-inner group hover:border-indigo-500/30 transition-all">
            <label className="text-[9px] font-black text-indigo-500 uppercase tracking-[0.3em] mb-3 block">Network UID</label>
            <p className="text-xl md:text-2xl font-mono font-black text-white tracking-widest overflow-hidden text-ellipsis">{user.uid}</p>
          </div>
          <div className="bg-black/40 p-10 rounded-[3rem] border border-white/5 shadow-inner group hover:border-indigo-500/30 transition-all">
            <label className="text-[9px] font-black text-indigo-500 uppercase tracking-[0.3em] mb-3 block">Activation Date</label>
            <p className="text-xl md:text-2xl font-black text-white uppercase tracking-tight">{new Date(user.joinedAt).toLocaleDateString()}</p>
          </div>
        </div>

        <section className="bg-black/40 p-10 rounded-[3.5rem] border border-white/5 mb-16 shadow-inner relative group">
          <div className="flex justify-between items-center mb-6">
             <label className="text-[11px] font-black text-indigo-500 uppercase tracking-[0.4em]">Strategic Production Quota</label>
             <span className="text-[11px] font-black text-white uppercase tracking-widest">{accessKey.usedMinutes} / {accessKey.maxProductionMinutes}m</span>
          </div>
          <div className="w-full bg-slate-800/50 h-4 rounded-full overflow-hidden shadow-inner border border-white/5">
            <div 
              className="h-full bg-gradient-to-r from-indigo-700 to-indigo-400 transition-all duration-2000 shadow-[0_0_30px_rgba(99,102,241,0.6)]" 
              style={{ width: `${Math.min((accessKey.usedMinutes / accessKey.maxProductionMinutes) * 100, 100)}%` }}
            />
          </div>
          <div className="flex justify-between mt-6">
             <p className="text-[9px] text-slate-600 uppercase font-black tracking-widest">Available Resource Allocation</p>
             <p className="text-[9px] text-indigo-400 uppercase font-black tracking-widest">{Math.max(0, accessKey.maxProductionMinutes - accessKey.usedMinutes)} Production Minutes Remaining</p>
          </div>
        </section>

        <button 
          onClick={onLogout}
          className="w-full py-8 bg-red-500/5 hover:bg-red-600 text-slate-500 hover:text-white border border-red-500/20 hover:border-transparent rounded-[2.5rem] font-black uppercase text-xs tracking-[0.5em] transition-all active:scale-95 group overflow-hidden relative"
        >
          <span className="relative z-10">Deactivate Current Connection</span>
          <div className="absolute inset-0 bg-red-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
        </button>
      </div>
      
      <p className="mt-12 text-[9px] text-slate-700 uppercase font-black tracking-[0.6em] text-center px-8 animate-pulse">Root Node Protocol • Anytime Studio Pro 2025 • Session ID: {user.uid.slice(0,8)}</p>
    </div>
  );
};
