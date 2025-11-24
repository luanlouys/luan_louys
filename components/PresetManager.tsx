
import React, { useState } from 'react';
import { PresetItem, TransactionType } from '../types';
import { Trash2, Plus, Repeat, X } from 'lucide-react';
import { PRESETS } from '../constants'; // Fallback emojis

interface PresetManagerProps {
  presets: PresetItem[];
  onAdd: (preset: PresetItem) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

const PresetManager: React.FC<PresetManagerProps> = ({ presets, onAdd, onDelete, onClose }) => {
  const [activeTab, setActiveTab] = useState<TransactionType>('EARN');
  const [label, setLabel] = useState('');
  const [amount, setAmount] = useState('');
  const [emoji, setEmoji] = useState('⭐');
  const [isRecurring, setIsRecurring] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!label || !amount) return;

    const newPreset: PresetItem = {
      id: crypto.randomUUID(),
      label,
      defaultAmount: parseInt(amount),
      type: activeTab,
      emoji,
      isRecurring
    };

    onAdd(newPreset);
    setLabel('');
    setAmount('');
    setIsRecurring(false);
  };

  const filteredPresets = presets.filter(p => p.type === activeTab);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-4 border-b flex justify-between items-center bg-slate-50">
          <h3 className="font-bold text-lg text-slate-800">Gerenciar Tarefas e Recompensas</h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-200 rounded-full">
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          {(['EARN', 'SPEND', 'PENALTY'] as TransactionType[]).map(t => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${
                activeTab === t 
                  ? t === 'EARN' ? 'border-green-500 text-green-600 bg-green-50'
                  : t === 'SPEND' ? 'border-blue-500 text-blue-600 bg-blue-50'
                  : 'border-red-500 text-red-600 bg-red-50'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              {t === 'EARN' ? 'Tarefas' : t === 'SPEND' ? 'Recompensas' : 'Punições'}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {filteredPresets.map(p => (
            <div key={p.id} className="flex items-center justify-between p-3 border rounded-lg hover:border-brand-200 transition-colors bg-white">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{p.emoji}</span>
                <div>
                  <p className="font-bold text-slate-800">{p.label}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">{p.defaultAmount} pts</span>
                    {p.isRecurring && (
                      <span className="text-xs font-bold text-brand-600 bg-brand-50 px-1.5 py-0.5 rounded flex items-center gap-1">
                        <Repeat size={10} /> Diário
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <button 
                onClick={() => onDelete(p.id)}
                className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
          {filteredPresets.length === 0 && (
            <p className="text-center text-slate-400 py-4 italic">Nenhum item cadastrado.</p>
          )}
        </div>

        {/* Add Form */}
        <div className="p-4 bg-slate-50 border-t">
          <form onSubmit={handleSubmit} className="space-y-3">
            <h4 className="font-bold text-xs text-slate-500 uppercase">Adicionar Novo</h4>
            <div className="flex gap-2">
              <input
                type="text"
                value={emoji}
                onChange={e => setEmoji(e.target.value)}
                className="w-12 text-center text-xl p-2 border rounded-lg"
                placeholder="Icon"
                maxLength={2}
              />
              <input
                type="text"
                value={label}
                onChange={e => setLabel(e.target.value)}
                className="flex-1 p-2 border rounded-lg text-sm"
                placeholder="Descrição (ex: Arrumar Cama)"
                required
              />
              <input
                type="number"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="w-20 p-2 border rounded-lg text-sm"
                placeholder="Pts"
                required
              />
            </div>
            
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={isRecurring}
                  onChange={e => setIsRecurring(e.target.checked)}
                  className="rounded text-brand-600 focus:ring-brand-500"
                />
                Renova Diariamente
              </label>
              
              <button 
                type="submit"
                className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-800 flex items-center gap-2"
              >
                <Plus size={16} /> Adicionar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PresetManager;
