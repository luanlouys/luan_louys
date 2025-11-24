import React, { useState } from 'react';
import { Sparkles, Send, Loader2 } from 'lucide-react';
import { getParentalAdvice } from '../services/geminiService';

const GeminiAdvisor: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAsk = async () => {
    if (!query.trim()) return;
    setIsLoading(true);
    setResponse('');
    
    const result = await getParentalAdvice(query);
    setResponse(result);
    setIsLoading(false);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all z-40 flex items-center gap-2 group"
      >
        <Sparkles className="animate-pulse" />
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 ease-in-out whitespace-nowrap">
          Assistente AI
        </span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-purple-100 z-40 flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-300">
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4 flex justify-between items-center text-white">
        <div className="flex items-center gap-2">
          <Sparkles size={18} />
          <h3 className="font-bold">Conselheiro Familiar AI</h3>
        </div>
        <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 rounded-full p-1">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>
      
      <div className="p-4 h-64 overflow-y-auto bg-slate-50 text-sm">
        {!response && !isLoading && (
          <p className="text-slate-500 text-center mt-10">
            Pergunte-me sobre sugestões de tarefas, valores justos de pontos ou como lidar com situações difíceis.
          </p>
        )}
        {isLoading && (
          <div className="flex justify-center items-center h-full text-purple-600">
            <Loader2 className="animate-spin" size={32} />
          </div>
        )}
        {response && (
          <div className="prose prose-sm prose-purple">
            <div className="whitespace-pre-wrap">{response}</div>
          </div>
        )}
      </div>

      <div className="p-3 border-t bg-white flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
          placeholder="Ex: Tarefas para criança de 8 anos..."
          className="flex-1 px-3 py-2 bg-slate-100 rounded-lg text-sm outline-none focus:ring-2 focus:ring-purple-500"
        />
        <button
          onClick={handleAsk}
          disabled={isLoading || !query.trim()}
          className="bg-purple-600 text-white p-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
};

export default GeminiAdvisor;