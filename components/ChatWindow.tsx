
import React, { useState, useEffect, useRef } from 'react';
import { Send, X, MessageCircle } from 'lucide-react';
import { ChatMessage, User } from '../types';
import { getMessages, sendMessage, getFamilyChildren } from '../services/storageService';

interface ChatWindowProps {
  currentUser: User;
  familyId: string;
  onClose: () => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ currentUser, familyId, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load messages and poll for new ones
  useEffect(() => {
    const loadMessages = () => {
      const msgs = getMessages(familyId);
      setMessages(msgs);
    };

    loadMessages();
    const interval = setInterval(loadMessages, 3000); // Simple polling for local storage changes

    return () => clearInterval(interval);
  }, [familyId]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    sendMessage(familyId, currentUser.id, inputText.trim());
    setInputText('');
    
    // Immediate refresh
    setMessages(getMessages(familyId));
  };

  // Helper to get sender info
  const getSenderInfo = (senderId: string) => {
    if (senderId === currentUser.id) return { name: 'Você', initial: currentUser.name.charAt(0) };
    
    // Check children first
    const children = getFamilyChildren(familyId);
    const child = children.find(c => c.id === senderId);
    if (child) return { name: child.name, initial: child.name.charAt(0) };
    
    return { name: 'Responsável', initial: 'R' }; 
  };

  return (
    <div className="fixed bottom-20 right-4 w-80 md:w-96 h-[500px] max-h-[70vh] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col z-40 animate-in slide-in-from-bottom-5 fade-in duration-300">
      
      {/* Header */}
      <div className="p-4 bg-brand-600 text-white rounded-t-2xl flex justify-between items-center shadow-md">
        <div className="flex items-center gap-2">
          <MessageCircle size={20} />
          <h3 className="font-bold">Chat da Família</h3>
        </div>
        <button onClick={onClose} className="hover:bg-brand-700 p-1 rounded-full transition-colors">
          <X size={18} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
        {messages.length === 0 && (
          <div className="text-center text-slate-400 text-sm mt-10 italic">
            Nenhuma mensagem ainda.<br/>Comece a conversa!
          </div>
        )}
        
        {messages.map((msg) => {
          const isMe = msg.senderId === currentUser.id;
          const sender = getSenderInfo(msg.senderId);

          return (
            <div key={msg.id} className={`flex gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-sm shrink-0 ${isMe ? 'bg-brand-100 text-brand-700' : 'bg-white text-slate-700 border border-slate-200'}`}>
                {sender.initial}
              </div>
              
              <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[80%]`}>
                 {!isMe && <span className="text-[10px] font-bold text-slate-500 mb-0.5 ml-1">{sender.name}</span>}
                 <div 
                  className={`px-3 py-2 rounded-xl text-sm shadow-sm ${
                    isMe 
                      ? 'bg-brand-600 text-white rounded-tr-none' 
                      : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'
                  }`}
                >
                  {msg.text}
                </div>
                <span className="text-[10px] text-slate-400 mt-1 px-1 opacity-70">
                  {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-3 bg-white border-t rounded-b-2xl flex gap-2">
        <input
          type="text"
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          placeholder="Digite uma mensagem..."
          className="flex-1 px-3 py-2 bg-slate-100 rounded-full text-sm outline-none focus:ring-2 focus:ring-brand-500 transition-all"
        />
        <button 
          type="submit"
          disabled={!inputText.trim()}
          className="p-2 bg-brand-600 text-white rounded-full hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
};

export default ChatWindow;
