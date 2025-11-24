
import React from 'react';
import { Transaction } from '../types';
import { ArrowUpRight, ArrowDownLeft, AlertCircle, Clock, CheckCircle2, XCircle } from 'lucide-react';

interface HistoryLogProps {
  transactions: Transaction[];
}

const HistoryLog: React.FC<HistoryLogProps> = ({ transactions }) => {
  if (transactions.length === 0) {
    return (
      <div className="text-center py-8 text-slate-400 italic bg-white rounded-xl border border-slate-100">
        Nenhuma atividade registrada ainda.
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return <Clock size={14} className="text-orange-500" />;
      case 'REJECTED': return <XCircle size={14} className="text-red-400" />;
      default: return null;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-4 border-b border-slate-100 bg-slate-50/50">
        <h4 className="font-semibold text-slate-700">Histórico de Atividades</h4>
      </div>
      <div className="divide-y divide-slate-100">
        {transactions.map((t) => (
          <div key={t.id} className={`p-4 flex items-center justify-between transition-colors ${t.status === 'REJECTED' ? 'opacity-50 bg-slate-50' : 'hover:bg-slate-50'}`}>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full relative ${
                t.type === 'EARN' ? 'bg-green-100 text-green-600' : 
                t.type === 'SPEND' ? 'bg-blue-100 text-blue-600' : 'bg-red-100 text-red-600'
              }`}>
                {t.type === 'EARN' && <ArrowUpRight size={18} />}
                {t.type === 'SPEND' && <ArrowDownLeft size={18} />}
                {t.type === 'PENALTY' && <AlertCircle size={18} />}
                
                {t.status === 'PENDING' && (
                  <div className="absolute -top-1 -right-1 bg-orange-500 rounded-full p-0.5 border-2 border-white">
                    <Clock size={8} className="text-white" />
                  </div>
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium text-slate-800">{t.description}</p>
                  {t.status === 'PENDING' && <span className="text-[10px] font-bold uppercase tracking-wider text-orange-500 bg-orange-50 px-1.5 py-0.5 rounded-full border border-orange-200">Em Análise</span>}
                  {t.status === 'REJECTED' && <span className="text-[10px] font-bold uppercase tracking-wider text-red-500 bg-red-50 px-1.5 py-0.5 rounded-full border border-red-200">Negado</span>}
                </div>
                <p className="text-xs text-slate-400">
                  {new Date(t.timestamp).toLocaleDateString('pt-BR', { 
                    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' 
                  })}
                </p>
              </div>
            </div>
            <div className={`font-bold ${
               t.status === 'REJECTED' || t.status === 'PENDING' ? 'text-slate-400' :
               t.type === 'EARN' ? 'text-green-600' : 
               t.type === 'SPEND' ? 'text-blue-600' : 'text-red-600'
            }`}>
              {t.type === 'EARN' ? '+' : '-'}{t.amount}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HistoryLog;
