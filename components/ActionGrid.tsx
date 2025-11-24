
import React, { useState } from 'react';
import { PresetItem, TransactionType } from '../types';
import { Repeat, CheckCircle2 } from 'lucide-react';

interface ActionGridProps {
  type: TransactionType;
  onSelect: (preset: PresetItem) => void;
  balance: number;
  presets: PresetItem[];
}

const ActionGrid: React.FC<ActionGridProps> = ({ type, onSelect, balance, presets }) => {
  const [selectedItem, setSelectedItem] = useState<PresetItem | null>(null);

  const items = presets.filter(p => p.type === type);

  const handleConfirm = () => {
    if (selectedItem) {
      onSelect(selectedItem);
      setSelectedItem(null);
    }
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-8 text-slate-400 border-2 border-dashed border-slate-200 rounded-xl">
        Nenhum item disponível nesta categoria.
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        {items.map(item => {
          const canAfford = type === 'SPEND' ? balance >= item.defaultAmount : true;
          
          return (
            <button
              key={item.id}
              onClick={() => canAfford && setSelectedItem(item)}
              disabled={!canAfford}
              className={`
                relative p-4 rounded-xl border text-left transition-all active:scale-95 flex flex-col items-center justify-center gap-2
                ${!canAfford 
                  ? 'opacity-50 grayscale border-slate-200 bg-slate-50 cursor-not-allowed' 
                  : 'bg-white border-slate-200 shadow-sm hover:shadow-md hover:border-brand-300'
                }
              `}
            >
              {item.isRecurring && (
                <div className="absolute top-2 right-2 text-brand-500" title="Renova Diariamente">
                  <Repeat size={14} />
                </div>
              )}
              <span className="text-4xl mb-1">{item.emoji}</span>
              <span className="font-bold text-slate-700 text-center leading-tight text-sm">{item.label}</span>
              <span className={`
                text-sm font-black px-2 py-0.5 rounded-full
                ${type === 'EARN' ? 'text-green-600 bg-green-50' : type === 'SPEND' ? 'text-blue-600 bg-blue-50' : 'text-red-600 bg-red-50'}
              `}>
                {item.defaultAmount} pts
              </span>
            </button>
          );
        })}
      </div>

      {/* Confirmation Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm text-center shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-4xl mx-auto mb-4">
              {selectedItem.emoji}
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">{selectedItem.label}</h3>
            <p className="text-slate-500 text-sm mb-6">
              {type === 'EARN' 
                ? 'Você completou esta tarefa?' 
                : 'Deseja resgatar esta recompensa?'}
            </p>

            <div className="flex gap-3">
              <button 
                onClick={() => setSelectedItem(null)}
                className="flex-1 py-3 font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={handleConfirm}
                className={`flex-1 py-3 font-bold text-white rounded-xl shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2
                  ${type === 'EARN' ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}
                `}
              >
                <CheckCircle2 size={18} />
                {type === 'EARN' ? 'Eu Fiz!' : 'Eu Quero!'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ActionGrid;
