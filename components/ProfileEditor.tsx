
import React, { useState } from 'react';
import { User } from '../types';
import { updateUser } from '../services/storageService';
import { X, Save, User as UserIcon } from 'lucide-react';

interface ProfileEditorProps {
  user: User;
  onClose: () => void;
}

const ProfileEditor: React.FC<ProfileEditorProps> = ({ user, onClose }) => {
  const [name, setName] = useState(user.name);
  
  const handleSave = () => {
    if (!name.trim()) return;
    updateUser(user.id, {
      name,
    });
    // Force reload to reflect changes in App state (since we rely on basic localstorage)
    window.location.reload(); 
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
        
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
            <UserIcon size={20} className="text-brand-600"/> Editar Perfil
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-full text-slate-500">
            <X size={20} />
          </button>
        </div>

        <div className="flex flex-col items-center mb-6">
          <div className="w-24 h-24 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-4xl border-4 border-white shadow-lg">
             {name.charAt(0).toUpperCase()}
          </div>
          <p className="text-xs text-slate-400 mt-2">Sua inicial será usada como avatar</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nome</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
            />
          </div>

          <div className="pt-2">
            <button
              onClick={handleSave}
              className="w-full py-3 bg-brand-600 text-white font-bold rounded-xl hover:bg-brand-700 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Save size={18} /> Salvar Alterações
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ProfileEditor;
