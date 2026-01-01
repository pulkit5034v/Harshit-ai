
import React, { useState, useEffect } from 'react';
import { User, AccessKey, SystemSettings } from '../types';
import { DB } from '../services/dbService';

interface AdminPanelProps {
  adminUser: User;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ adminUser }) => {
  const [users, setUsers] = useState(DB.getAllUsers());
  const [keys, setKeys] = useState(DB.getAllKeys());
  const [settings, setSettings] = useState<SystemSettings>(DB.getSettings());
  const [newKeyLimit, setNewKeyLimit] = useState(150); 

  useEffect(() => {
    const handleSync = () => {
      setUsers(DB.getAllUsers());
      setKeys(DB.getAllKeys());
      setSettings(DB.getSettings());
    };
    window.addEventListener('db_updated', handleSync);
    return () => window.removeEventListener('db_updated', handleSync);
  }, []);

  const handleGenerate = () => {
    DB.generateKey(adminUser.uid, newKeyLimit);
    setKeys(DB.getAllKeys());
  };

  const handleBan = (key: string) => {
    if (confirm(`Revoke production rights for ${key}? Talent will be locked out immediately.`)) {
      DB.banKey(key);
      setKeys(DB.getAllKeys());
      setUsers(DB.getAllUsers());
    }
  };

  const handlePromote = (uid: string) => {
    if (confirm("Promote this talent to Administrative Level?")) {
      DB.promoteToAdmin(uid);
      setUsers(DB.getAllUsers());
    }
  };

  const handleSettingsUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    DB.updateSettings(settings);
    alert("Global system identity updated across all nodes.");
  };

  return (
    <div className="p-6 md:p-12 max-w-7xl mx-auto space-y-12 animate-in fade-in duration-700 pb-32 md:pb-12">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-white/5 pb-10 gap-8">
        <div>
          <h2 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase text-white leading-none">Admin <span className="text-indigo-500">Center</span></h2>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] mt-4">Security Level: Root Privilege / Node {adminUser.uid}</p>
        </div>
        <div className="w-full md:w-auto flex flex-col md:flex-row gap-4 bg-slate-900 p-8 rounded-[3rem] border border-white/5 items-end shadow-2xl backdrop-blur-xl">
           <div className="flex flex-col w-full md:w-auto">
            <label className="text-[9px] font-black uppercase text-indigo-500 mb-2 tracking-widest">Key Quota (Mins)</label>
            <input 
              type="number" 
              value={newKeyLimit} 
              onChange={e => setNewKeyLimit(parseInt(e.target.value))}
              className="bg-black text-white px-5 py-4 rounded-xl text-sm font-bold outline-none border border-white/10 focus:border-indigo-500 shadow-inner w-full md:w-36"
            />
           </div>
           <button 
             onClick={handleGenerate}
             className="w-full md:w-auto px-10 py-5 bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase text-[10px] rounded-xl transition-all shadow-xl shadow-indigo-600/30 active:scale-95 active:shadow-none"
           >
             Generate Key
           </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
        {/* Global Control */}
        <div className="lg:col-span-1 space-y-8">
          <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-500 flex items-center gap-4">
            System Identity <div className="h-px flex-1 bg-white/5" />
          </h3>
          <form onSubmit={handleSettingsUpdate} className="bg-slate-900 p-8 rounded-[3rem] border border-white/5 space-y-8 shadow-2xl">
            <div className="space-y-3">
              <label className="text-[9px] font-black uppercase text-indigo-500 tracking-[0.2em] ml-2">Studio Title</label>
              <input 
                type="text" 
                value={settings.appName} 
                onChange={e => setSettings({...settings, appName: e.target.value})}
                className="w-full bg-black text-white px-6 py-5 rounded-2xl text-xs font-black outline-none border border-white/10 focus:border-indigo-500 shadow-inner"
              />
            </div>
            <button type="submit" className="w-full py-5 bg-white text-black font-black uppercase text-[10px] tracking-[0.2em] rounded-2xl hover:bg-indigo-500 hover:text-white transition-all shadow-xl">Push Identity</button>
          </form>
        </div>

        {/* Access Layer */}
        <div className="lg:col-span-3 space-y-8">
          <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-500 flex items-center gap-4">
            Encrypted Keys <div className="h-px flex-1 bg-white/5" />
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {keys.map(k => (
              <div key={k.key} className={`p-8 rounded-[2.5rem] border transition-all ${k.isBanned ? 'bg-red-950/20 border-red-500/40 opacity-40 grayscale' : 'bg-slate-900 border-white/5 shadow-xl hover:border-white/10'}`}>
                <div className="flex justify-between items-center mb-8">
                  <span className="font-mono font-black text-lg tracking-widest text-white">{k.key}</span>
                  <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${k.isBanned ? 'bg-red-500 text-white' : 'bg-indigo-600/20 text-indigo-400 border border-indigo-600/20'}`}>
                    {k.isBanned ? 'VOID' : 'SECURE'}
                  </span>
                </div>
                <div className="space-y-5">
                  <div className="flex justify-between text-[10px] font-black">
                    <span className="text-slate-500 uppercase tracking-widest">Production Quota</span>
                    <span className="text-white">{Math.floor(k.usedMinutes)} / {k.maxProductionMinutes}m</span>
                  </div>
                  <div className="w-full bg-black h-2 rounded-full overflow-hidden shadow-inner">
                    <div className="h-full bg-gradient-to-r from-indigo-700 to-indigo-500 transition-all duration-1000" style={{ width: `${Math.min((k.usedMinutes / k.maxProductionMinutes) * 100, 100)}%` }} />
                  </div>
                </div>
                {!k.isBanned && k.key !== 'ADMIN-MASTER-2025' && (
                  <button onClick={() => handleBan(k.key)} className="mt-8 w-full py-4 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all border border-red-500/10 active:scale-95">Revoke Access</button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Talent Base */}
      <section className="space-y-8">
        <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-500 flex items-center gap-4">
          Production Talent Database <div className="h-px flex-1 bg-white/5" />
        </h3>
        <div className="bg-slate-900 border border-white/5 rounded-[3rem] overflow-x-auto shadow-3xl">
          <table className="w-full text-left min-w-[900px]">
            <thead>
              <tr className="border-b border-white/5 bg-black/40">
                <th className="p-8 text-[10px] font-black uppercase tracking-widest text-slate-500">Identity</th>
                <th className="p-8 text-[10px] font-black uppercase tracking-widest text-slate-500">Status</th>
                <th className="p-8 text-[10px] font-black uppercase tracking-widest text-slate-500">Role</th>
                <th className="p-8 text-[10px] font-black uppercase tracking-widest text-slate-500">Produced</th>
                <th className="p-8 text-[10px] font-black uppercase tracking-widest text-slate-500">Command</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {users.map(u => (
                <tr key={u.uid} className={`hover:bg-white/[0.02] transition-colors ${u.status === 'banned' ? 'opacity-30' : ''}`}>
                  <td className="p-8">
                    <div className="flex flex-col">
                      <span className="text-base font-black text-white uppercase italic tracking-tight">{u.name}</span>
                      <span className="text-xs text-slate-500 lowercase mt-1">{u.email}</span>
                      <span className="text-[8px] text-indigo-500 font-black tracking-[0.3em] mt-3 uppercase">UID: {u.uid}</span>
                    </div>
                  </td>
                  <td className="p-8">
                    <span className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest ${u.status === 'active' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="p-8">
                    <span className={`text-[10px] font-black uppercase tracking-widest ${u.role === 'admin' ? 'text-indigo-400' : 'text-slate-400'}`}>{u.role}</span>
                  </td>
                  <td className="p-8">
                    <span className="text-sm font-black text-white">{u.totalProductionMinutes} <span className="text-[10px] text-slate-500 uppercase tracking-widest ml-1">Mins</span></span>
                  </td>
                  <td className="p-8 space-x-3">
                    {u.role !== 'admin' && (
                      <button onClick={() => handlePromote(u.uid)} className="px-5 py-3 bg-indigo-600/10 hover:bg-indigo-600 text-indigo-400 hover:text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all active:scale-95">Promote</button>
                    )}
                    {u.status !== 'banned' && (
                      <button onClick={() => handleBan(u.accessKeyId)} className="px-5 py-3 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all active:scale-95">Ban User</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
