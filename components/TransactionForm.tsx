import React, { useState } from 'react';
import { TransactionType, PresetItem } from '../types';
import { PRESETS } from '../constants';
import { Plus, Minus, AlertTriangle, X } from 'lucide-react';

interface TransactionFormProps {
  childName: string;
  onClose: () => void;
  onSubmit: (amount: number, description: string, type: TransactionType) => void;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ childName, onClose, onSubmit }) => {
  const [type, setType] = useState<TransactionType>('EARN');
  const [amount, setAmount] = useState<string>('');
  const [description, setDescription] = useState('');

  const handlePresetClick = (preset: PresetItem) => {
    setType(preset.type);
    setAmount(preset.defaultAmount.toString());
    setDescription(preset.label);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !description) return;
    onSubmit(parseInt(amount), description, type);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-4 border-b flex justify-between items-center bg-slate-50">
          <h3 className="font-bold text-lg text-slate-800">Nova Transação para {childName}</h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-200 rounded-full">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Type Selector */}
          <div className="flex bg-slate-100 p-1 rounded-lg">
            {(['EARN', 'SPEND', 'PENALTY'] as TransactionType[]).map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                  type === t
                    ? t === 'EARN'
                      ? 'bg-green-500 text-white shadow-sm'
                      : t === 'SPEND'
                      ? 'bg-blue-500 text-white shadow-sm'
                      : 'bg-red-500 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {t === 'EARN' ? 'Ganhar' : t === 'SPEND' ? 'Gastar' : 'Punição'}
              </button>
            ))}
          </div>

          {/* Presets */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Sugestões Rápidas</p>
            <div className="flex flex-wrap gap-2">
              {PRESETS.filter(p => p.type === type).map(preset => (
                <button
                  key={preset.id}
                  onClick={() => handlePresetClick(preset)}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-full text-xs font-medium hover:bg-slate-100 hover:border-brand-500 transition-colors flex items-center gap-1"
                >
                  <span>{preset.emoji}</span>
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Descrição</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ex: Lavou a louça"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-shadow"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Valor (Pontos)</label>
              <div className="relative">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0"
                  min="1"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-shadow pl-10"
                  required
                />
                <div className="absolute left-3 top-2.5 text-slate-400">
                  {type === 'EARN' ? <Plus size={18} /> : type === 'SPEND' ? <Minus size={18} /> : <AlertTriangle size={18} />}
                </div>
              </div>
            </div>

            <button
              type="submit"
              className={`w-full py-3 rounded-xl font-bold text-white shadow-md transition-transform active:scale-95 ${
                type === 'EARN'
                  ? 'bg-green-600 hover:bg-green-700'
                  : type === 'SPEND'
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              Confirmar Transação
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TransactionForm;