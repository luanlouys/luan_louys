
import React, { useState, useEffect } from 'react';
import { User, Family, Child } from '../types';
import { registerParent, loginParent, loginChild, registerChild, checkUsernameAvailability } from '../services/storageService';
import { Wallet, ShieldCheck, Baby, Lock, LogIn, UserPlus, CheckCircle, XCircle, Users, Star, ArrowRight, BookOpen } from 'lucide-react';

interface AuthScreenProps {
  onLoginSuccess: (user: User, family: Family, children: Child[]) => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onLoginSuccess }) => {
  const [activeTab, setActiveTab] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [role, setRole] = useState<'PARENT' | 'CHILD'>('PARENT');
  
  // Parent Register Mode
  const [parentMode, setParentMode] = useState<'CREATE' | 'JOIN'>('CREATE');

  // Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [familyName, setFamilyName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [pin, setPin] = useState('');
  
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Check username availability on debounce
  useEffect(() => {
    if (activeTab === 'REGISTER' && role === 'CHILD' && username.length > 2) {
      const timer = setTimeout(() => {
        const available = checkUsernameAvailability(username);
        setUsernameAvailable(available);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setUsernameAvailable(null);
    }
  }, [username, activeTab, role]);

  const clearForm = () => {
    setError('');
    setSuccessMsg('');
    setEmail('');
    setPassword('');
    setName('');
    setUsername('');
    setJoinCode('');
    setPin('');
    setUsernameAvailable(null);
    setFamilyName('');
  };

  const handleParentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (activeTab === 'REGISTER') {
      // Pass join code as family name if mode is JOIN
      const familyIdentifier = parentMode === 'CREATE' ? familyName : joinCode;
      
      const result = registerParent(name, email, password, parentMode, familyIdentifier);
      if ('error' in result) setError(result.error);
      else if ('success' in result && 'message' in result) {
        setSuccessMsg(result.message);
        clearForm();
      }
      else if ('user' in result) onLoginSuccess(result.user, result.family, []);
    } else {
      const result = loginParent(email, password);
      if ('error' in result) setError(result.error);
      else onLoginSuccess(result.user, result.family, []);
    }
  };

  const handleChildSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (pin.length !== 4) {
      setError('O PIN deve ter 4 dígitos.');
      return;
    }

    if (activeTab === 'REGISTER') {
      if (!usernameAvailable) {
        setError('Escolha um nome de usuário válido.');
        return;
      }
      const result = registerChild(joinCode, name, username, pin);
      if ('error' in result) setError(result.error);
      else {
        setSuccessMsg('Conta criada! Peça para seu responsável aprovar seu acesso.');
        clearForm();
      }
    } else {
      // Login uses Username + PIN
      const result = loginChild(username, pin);
      if ('error' in result) setError(result.error);
      else onLoginSuccess(result.user, result.family, []);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-brand-50 flex items-center justify-center p-4 lg:p-10">
      
      <div className="max-w-6xl w-full grid lg:grid-cols-2 gap-12 items-center">
        
        {/* Left Side: Info & Steps */}
        {/* Changed order-2 to order-1 to appear first on mobile */}
        <div className="order-1 space-y-8 animate-in slide-in-from-left-4 duration-500">
          <div>
            <div className="inline-flex items-center gap-2 bg-brand-100 text-brand-700 px-4 py-1.5 rounded-full font-bold text-sm mb-4">
               <BookOpen size={16} /> Método Educativo
            </div>
            <h1 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight mb-4">
              Educação Financeira <span className="text-brand-600">Divertida</span> para sua Família
            </h1>
            <p className="text-lg text-slate-600 leading-relaxed">
              Transforme a rotina de casa em um sistema gamificado. Ensine responsabilidade, incentive bons hábitos e recompense conquistas através de um sistema de economia de pontos positivo.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-6">
            <h3 className="font-bold text-slate-800 uppercase text-sm tracking-wider">Como funciona:</h3>
            
            <div className="space-y-4">
              <div className="flex gap-4">
                 <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 font-bold shrink-0">1</div>
                 <div>
                   <h4 className="font-bold text-slate-900">Crie sua Conta e Família</h4>
                   <p className="text-sm text-slate-500">O responsável se cadastra e cria o grupo familiar.</p>
                 </div>
              </div>
              <div className="flex gap-4">
                 <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold shrink-0">2</div>
                 <div>
                   <h4 className="font-bold text-slate-900">Cadastre os Filhos</h4>
                   <p className="text-sm text-slate-500">Use o <strong>Código da Família</strong> para criar o acesso deles.</p>
                 </div>
              </div>
              <div className="flex gap-4">
                 <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600 font-bold shrink-0">3</div>
                 <div>
                   <h4 className="font-bold text-slate-900">Verifique e Aprove</h4>
                   <p className="text-sm text-slate-500">Por segurança, o responsável aprova a entrada de novos membros.</p>
                 </div>
              </div>
              <div className="flex gap-4">
                 <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold shrink-0">4</div>
                 <div>
                   <h4 className="font-bold text-slate-900">Comece a Usar!</h4>
                   <p className="text-sm text-slate-500">Defina tarefas, agende rotinas e troque pontos por recompensas.</p>
                 </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200">
             <p className="text-xs text-slate-400 uppercase font-bold tracking-widest mb-1">Desenvolvido por</p>
             <p className="text-sm font-semibold text-slate-700">Luan Louys Lopes Martins</p>
             <p className="text-xs text-brand-600 font-medium">Neuropsicopedagogia, Coaching Educacional e Psicanálise Cristã</p>
          </div>
        </div>

        {/* Right Side: Auth Card */}
        {/* Changed order-1 to order-2 to appear second on mobile */}
        <div className="order-2 w-full max-w-md mx-auto bg-white rounded-3xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-300 border border-slate-100">
          
          {/* Header */}
          <div className="bg-brand-600 p-6 text-center text-white relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-10 -mt-10"></div>
            <div className="inline-flex bg-white/20 p-3 rounded-full mb-3 backdrop-blur-sm relative z-10">
              <Wallet className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-black tracking-tight relative z-10">Banco Familiar</h2>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-slate-100">
            <button
              onClick={() => { setActiveTab('LOGIN'); clearForm(); }}
              className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${activeTab === 'LOGIN' ? 'text-brand-600 border-b-2 border-brand-600 bg-brand-50/50' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <LogIn size={16} /> Entrar
            </button>
            <button
              onClick={() => { setActiveTab('REGISTER'); clearForm(); }}
              className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${activeTab === 'REGISTER' ? 'text-brand-600 border-b-2 border-brand-600 bg-brand-50/50' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <UserPlus size={16} /> Criar Conta
            </button>
          </div>

          <div className="p-8">
            {/* Role Toggle */}
            <div className="flex bg-slate-100 p-1.5 rounded-xl mb-6">
              <button 
                onClick={() => { setRole('PARENT'); clearForm(); }}
                className={`flex-1 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${role === 'PARENT' ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-500'}`}
              >
                <ShieldCheck size={16} /> Pais
              </button>
              <button 
                onClick={() => { setRole('CHILD'); clearForm(); }}
                className={`flex-1 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${role === 'CHILD' ? 'bg-white text-purple-600 shadow-sm' : 'text-slate-500'}`}
              >
                <Baby size={16} /> Filhos
              </button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-100 text-red-500 text-sm p-3 rounded-lg mb-6 flex items-center gap-2 animate-in slide-in-from-top-2">
                 <span>⚠️</span> {error}
              </div>
            )}

            {successMsg && (
              <div className="bg-green-50 border border-green-100 text-green-600 text-sm p-3 rounded-lg mb-6 flex items-center gap-2 animate-in slide-in-from-top-2">
                 <CheckCircle size={16} /> {successMsg}
              </div>
            )}

            {/* PARENT FORMS */}
            {role === 'PARENT' && (
              <form onSubmit={handleParentSubmit} className="space-y-4">
                {activeTab === 'REGISTER' && (
                  <>
                     {/* Parent Mode Toggle */}
                     <div className="flex gap-4 mb-2">
                       <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                         <input 
                           type="radio" 
                           name="pMode" 
                           checked={parentMode === 'CREATE'} 
                           onChange={() => setParentMode('CREATE')} 
                           className="text-brand-600 focus:ring-brand-500"
                         />
                         Criar Família
                       </label>
                       <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                         <input 
                           type="radio" 
                           name="pMode" 
                           checked={parentMode === 'JOIN'} 
                           onChange={() => setParentMode('JOIN')} 
                           className="text-brand-600 focus:ring-brand-500"
                         />
                         Entrar em Família
                       </label>
                     </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Seu Nome</label>
                      <input 
                        type="text" required value={name} onChange={e => setName(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none transition-all"
                        placeholder="Ex: Carlos Silva"
                      />
                    </div>
                    
                    {parentMode === 'CREATE' ? (
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nome da Nova Família</label>
                        <input 
                          type="text" required value={familyName} onChange={e => setFamilyName(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none transition-all"
                          placeholder="Ex: Família Silva"
                        />
                      </div>
                    ) : (
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Código da Família</label>
                        <input 
                          type="text" required value={joinCode} onChange={e => setJoinCode(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none transition-all font-mono tracking-widest text-center"
                          placeholder="000000"
                          maxLength={6}
                        />
                      </div>
                    )}
                  </>
                )}
                
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email</label>
                  <input 
                    type="email" required value={email} onChange={e => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none transition-all"
                    placeholder="seu@email.com"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Senha</label>
                  <div className="relative">
                    <input 
                      type="password" required value={password} onChange={e => setPassword(e.target.value)}
                      className="w-full pl-4 pr-10 py-3 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none transition-all"
                      placeholder="••••••••"
                    />
                    <Lock className="absolute right-3 top-3.5 text-slate-400" size={18} />
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="w-full bg-brand-600 text-white font-bold py-4 rounded-xl hover:bg-brand-700 transition-transform active:scale-95 shadow-lg shadow-brand-200 mt-4 flex items-center justify-center gap-2"
                >
                  {activeTab === 'LOGIN' ? 'Entrar no Banco' : (parentMode === 'CREATE' ? 'Criar Família' : 'Enviar Solicitação')} <ArrowRight size={18}/>
                </button>
              </form>
            )}

            {/* CHILD FORMS */}
            {role === 'CHILD' && (
              <form onSubmit={handleChildSubmit} className="space-y-4">
                
                {activeTab === 'REGISTER' && (
                  <>
                    <div className="bg-purple-50 p-3 rounded-lg border border-purple-100 mb-2">
                      <p className="text-xs text-purple-700 text-center">
                        Peça o <strong>Código da Família</strong> aos seus pais para criar sua conta.
                      </p>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Código da Família</label>
                      <input 
                        type="text" required value={joinCode} onChange={e => setJoinCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none text-center text-xl font-mono tracking-widest transition-all"
                        placeholder="000000"
                        maxLength={6}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Seu Nome Real</label>
                      <input 
                        type="text" required value={name} onChange={e => setName(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
                        placeholder="Ex: Joãozinho"
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                    Nome de Usuário {activeTab === 'REGISTER' && '(Login)'}
                  </label>
                  <div className="relative">
                    <input 
                      type="text" required value={username} onChange={e => setUsername(e.target.value.replace(/\s+/g, '').toLowerCase())}
                      className={`w-full px-4 py-3 rounded-xl border focus:ring-2 outline-none transition-all ${
                         activeTab === 'REGISTER' && username.length > 2 
                          ? usernameAvailable 
                            ? 'border-green-300 focus:border-green-500 focus:ring-green-200' 
                            : 'border-red-300 focus:border-red-500 focus:ring-red-200'
                          : 'border-slate-200 focus:border-purple-500 focus:ring-purple-200'
                      }`}
                      placeholder="joao123"
                    />
                    {activeTab === 'REGISTER' && username.length > 2 && (
                      <div className="absolute right-3 top-3.5">
                        {usernameAvailable ? <CheckCircle size={18} className="text-green-500"/> : <XCircle size={18} className="text-red-500"/>}
                      </div>
                    )}
                  </div>
                  {activeTab === 'REGISTER' && username.length > 2 && !usernameAvailable && (
                     <p className="text-[10px] text-red-500 mt-1">Nome de usuário já existe.</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">PIN (Senha)</label>
                  <div className="relative">
                    <input 
                      type="password" required value={pin} onChange={e => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none text-center text-xl font-mono tracking-widest transition-all"
                      placeholder="1234"
                      maxLength={4}
                      inputMode="numeric"
                    />
                    <Lock className="absolute right-3 top-3.5 text-slate-400" size={18} />
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="w-full bg-purple-600 text-white font-bold py-4 rounded-xl hover:bg-purple-700 transition-transform active:scale-95 shadow-lg shadow-purple-200 mt-4 flex items-center justify-center gap-2"
                >
                  {activeTab === 'LOGIN' ? 'Entrar' : 'Cadastrar'} <ArrowRight size={18}/>
                </button>
              </form>
            )}

          </div>
        </div>

      </div>
    </div>
  );
};

export default AuthScreen;
