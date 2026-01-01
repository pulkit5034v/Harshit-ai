
import React, { useState } from 'react';
import { GeneratedImage } from '../types';

interface EditModalProps {
  image: GeneratedImage;
  onClose: () => void;
  onEdit: (id: string, instruction: string) => void;
}

export const EditModal: React.FC<EditModalProps> = ({ image, onClose, onEdit }) => {
  const [instruction, setInstruction] = useState("");

  return (
    <div className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-xl flex items-center justify-center p-6">
      <div className="bg-slate-900 border border-white/10 w-full max-w-xl rounded-[2.5rem] p-8 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-black uppercase tracking-tighter">Edit Scene with AI</h2>
          <button onClick={onClose} className="p-2 bg-white/5 rounded-full">✕</button>
        </div>

        <div className="aspect-video w-full rounded-2xl overflow-hidden mb-6 border border-white/5">
          <img src={image.url} className="w-full h-full object-cover opacity-50" alt="" />
        </div>

        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Instructions</label>
        <textarea 
          value={instruction}
          onChange={(e) => setInstruction(e.target.value)}
          placeholder="e.g. 'Make the sky more red', 'Add a robotic dog', 'Change the character's hair color'..."
          className="w-full h-32 bg-black border border-white/10 rounded-2xl p-4 text-sm focus:border-indigo-500 outline-none transition-all resize-none mb-6"
        />

        <button 
          onClick={() => onEdit(image.id, instruction)}
          disabled={!instruction.trim()}
          className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase text-xs rounded-2xl transition-all disabled:opacity-30"
        >
          Refine with Gemini
        </button>
      </div>
    </div>
  );
};
