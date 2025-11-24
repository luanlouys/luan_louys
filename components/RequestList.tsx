
import React from 'react';
import { Transaction } from '../types';
import { Check, X, Clock } from 'lucide-react';

interface RequestListProps {
  transactions: Transaction[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

const RequestList: React.FC<RequestListProps> = ({ transactions, onApprove, onReject }) => {
  const pending = transactions.filter(t => t.status === 'PENDING');

  if (pending.length === 0) return null;

  return (
    <div className="bg-orange-50 border border-orange-100 rounded-xl overflow-hidden mb-6 animate-in slide-in-from-top-4">
      <div className="p-3 bg-orange-100/50 border-b border-orange-100 flex items-center gap-2">
        <Clock className="text-orange-600" size={18} />
        <h4 className="font-bold text-orange-800 text-sm">Solicitações Pendentes ({pending.length})</h4>
      </div>
      <div className="divide-y divide-orange-100/50">
        {pending.map(t => (
          <div key={t.id} className="p-4 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl">{t.type === 'EARN' ? '💪' : '🎁'}</span>
                <p className="font-bold text-slate-800">{t.description}</p>
              </div>
              <p className="text-sm text-slate-500 ml-8">
                {t.type === 'EARN' ? 'Quer ganhar' : 'Quer gastar'} 
                <strong className={`ml-1 ${t.type === 'EARN' ? 'text-green-600' : 'text-blue-600'}`}>
                  {t.amount} pts
                </strong>
              </p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => onReject(t.id)}
                className="p-2 bg-white border border-slate-200 text-slate-400 rounded-lg hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-colors"
                title="Negar"
              >
                <X size={20} />
              </button>
              <button 
                onClick={() => onApprove(t.id)}
                className="p-2 bg-brand-600 text-white rounded-lg shadow-sm hover:bg-brand-700 active:scale-95 transition-all"
                title="Aprovar"
              >
                <Check size={20} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RequestList;
