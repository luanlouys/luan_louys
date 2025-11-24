
import React, { useState, useEffect } from 'react';
import { Wallet, ShieldCheck, Users, Trophy, Star, ShoppingBag, Plus, LogOut, Settings, Copy, CalendarRange, MessageCircle, User as UserIcon, HelpCircle, ChevronDown, Check, UserPlus, X } from 'lucide-react';
import { Child, TransactionType, PresetItem, User, Family, AuthState, ScheduleItem, ReminderItem } from './types';
import { 
  getCurrentSession, 
  getFamilyChildren, 
  createTransaction, 
  updateTransactionStatus, 
  logout,
  savePreset,
  deletePreset,
  updateFamilySchedule,
  getUserFamilies,
  switchFamilySession,
  createNewFamilyForUser,
  getPendingMembers,
  handleMemberApproval
} from './services/storageService';
import TransactionForm from './components/TransactionForm';
import GeminiAdvisor from './components/GeminiAdvisor';
import HistoryLog from './components/HistoryLog';
import ActionGrid from './components/ActionGrid';
import RequestList from './components/RequestList';
import AuthScreen from './components/AuthScreen';
import PresetManager from './components/PresetManager';
import AnalyticsChart from './components/AnalyticsChart';
import CalendarPlanner from './components/CalendarPlanner';
import DailyAgenda from './components/DailyAgenda';
import ChatWindow from './components/ChatWindow';
import ProfileEditor from './components/ProfileEditor';
import TourGuide from './components/TourGuide';

// Helper to determine rank
const getRank = (balance: number) => {
  if (balance > 500) return { title: 'Magnata', color: 'text-yellow-500' };
  if (balance > 200) return { title: 'Investidor', color: 'text-purple-500' };
  if (balance > 100) return { title: 'Poupador', color: 'text-blue-500' };
  return { title: 'Iniciante', color: 'text-slate-500' };
};

// Initial Avatar Component
const Avatar = ({ name, size = 'md' }: { name: string, size?: 'sm'|'md'|'lg' }) => {
  const sizeClass = size === 'sm' ? 'w-8 h-8 text-sm' : size === 'lg' ? 'w-16 h-16 text-2xl' : 'w-10 h-10 text-lg';
  return (
    <div className={`${sizeClass} rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold border-2 border-white shadow-sm shrink-0`}>
      {name.charAt(0).toUpperCase()}
    </div>
  );
};

const App: React.FC = () => {
  const [authState, setAuthState] = useState<AuthState>({ user: null, family: null, childrenData: [] });
  const [userFamilies, setUserFamilies] = useState<Family[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [showPresetManager, setShowPresetManager] = useState(false);
  const [showPlanner, setShowPlanner] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showTour, setShowTour] = useState(false);
  const [showFamilySwitcher, setShowFamilySwitcher] = useState(false);
  const [showCreateFamily, setShowCreateFamily] = useState(false);
  const [newFamilyName, setNewFamilyName] = useState('');
  
  const [childTab, setChildTab] = useState<'EARN' | 'SPEND'>('EARN');
  const [isLoading, setIsLoading] = useState(true);
  const [pendingMembers, setPendingMembers] = useState<User[]>([]);

  // Initialize Session
  useEffect(() => {
    const { user, family } = getCurrentSession();
    if (user && family) {
      const childrenData = getFamilyChildren(family.id);
      
      if (user.role === 'CHILD') {
        const myData = childrenData.find(c => c.id === user.id);
        setAuthState({ user, family, childrenData: myData ? [myData] : [] });
        setSelectedChildId(user.id);
      } else {
        setAuthState({ user, family, childrenData });
        setUserFamilies(getUserFamilies(user.id));
        setPendingMembers(getPendingMembers(family.id));
      }
    }
    setIsLoading(false);
  }, []);

  const handleLogout = () => {
    logout();
    setAuthState({ user: null, family: null, childrenData: [] });
    setSelectedChildId(null);
  };

  const refreshData = () => {
    if (!authState.family) return;
    const childrenData = getFamilyChildren(authState.family.id);
    if (authState.user?.role === 'CHILD') {
       const myData = childrenData.find(c => c.id === authState.user.id);
       setAuthState(prev => ({ ...prev, childrenData: myData ? [myData] : [] }));
    } else {
       setAuthState(prev => ({ ...prev, childrenData }));
       setPendingMembers(getPendingMembers(authState.family.id));
    }
  };

  const handleSwitchFamily = (familyId: string) => {
    switchFamilySession(familyId);
    const family = userFamilies.find(f => f.id === familyId);
    if (family && authState.user) {
       const childrenData = getFamilyChildren(family.id);
       setAuthState(prev => ({ ...prev, family, childrenData }));
       setPendingMembers(getPendingMembers(family.id));
       setShowFamilySwitcher(false);
    }
  };

  const handleCreateFamily = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFamilyName.trim() || !authState.user) return;
    
    const newFamily = createNewFamilyForUser(authState.user.id, newFamilyName);
    if (newFamily) {
      setUserFamilies(getUserFamilies(authState.user.id));
      handleSwitchFamily(newFamily.id);
      setShowCreateFamily(false);
      setNewFamilyName('');
    }
  };

  const handleMemberAction = (userId: string, approve: boolean) => {
    handleMemberApproval(userId, approve);
    refreshData();
  };

  // --- ACTIONS ---

  const handleManualTransaction = (amount: number, description: string, type: TransactionType) => {
    if (!selectedChildId) return;
    createTransaction(selectedChildId, amount, description, type, 'COMPLETED');
    refreshData();
  };

  const handleRequestTransaction = (preset: PresetItem) => {
    if (!selectedChildId) return;
    createTransaction(selectedChildId, preset.defaultAmount, preset.label, preset.type, 'PENDING');
    refreshData();
  };

  const handleApprove = (txId: string) => {
    if (!selectedChildId) return;
    updateTransactionStatus(selectedChildId, txId, 'COMPLETED');
    refreshData();
  };

  const handleReject = (txId: string) => {
    if (!selectedChildId) return;
    updateTransactionStatus(selectedChildId, txId, 'REJECTED');
    refreshData();
  };

  const handleAddPreset = (preset: PresetItem) => {
    if (!authState.family) return;
    savePreset(authState.family.id, preset);
    const newPresets = [...authState.family.presets, preset];
    setAuthState(prev => prev.family ? ({ ...prev, family: { ...prev.family, presets: newPresets } }) : prev);
  };

  const handleDeletePreset = (id: string) => {
    if (!authState.family) return;
    deletePreset(authState.family.id, id);
    const newPresets = authState.family.presets.filter(p => p.id !== id);
    setAuthState(prev => prev.family ? ({ ...prev, family: { ...prev.family, presets: newPresets } }) : prev);
  };

  const handleSaveSchedule = (schedules: ScheduleItem[], reminders: ReminderItem[]) => {
    if (!authState.family) return;
    updateFamilySchedule(authState.family.id, schedules, reminders);
    setAuthState(prev => prev.family ? ({ ...prev, family: { ...prev.family, schedules, reminders } }) : prev);
  };

  const handleLoginSuccess = (user: User, family: Family, initialChildren: Child[]) => {
    const childrenData = initialChildren.length > 0 ? initialChildren : getFamilyChildren(family.id);
    
    if (user.role === 'CHILD') {
      const myData = childrenData.find(c => c.id === user.id);
      setAuthState({ user, family, childrenData: myData ? [myData] : [] });
      setSelectedChildId(user.id);
    } else {
      setAuthState({ user, family, childrenData });
      setUserFamilies(getUserFamilies(user.id));
      setPendingMembers(getPendingMembers(family.id));
    }
  };

  // --- RENDER ---

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div></div>;

  if (!authState.user || !authState.family) {
    return <AuthScreen onLoginSuccess={handleLoginSuccess} />;
  }

  const activeChild = authState.childrenData.find(c => c.id === selectedChildId);
  const isAdmin = authState.user.role === 'PARENT';
  const familyPresets = authState.family.presets || [];

  // PARENT DASHBOARD
  if (!selectedChildId && isAdmin) {
    return (
      <div className="min-h-screen bg-slate-50 pb-20">
        
        {/* TOP BAR / FAMILY SWITCHER */}
        <header className="bg-brand-600 text-white p-6 shadow-lg rounded-b-3xl mb-8 relative z-30">
          <div className="flex justify-between items-start mb-6">
            <div className="relative">
              <button 
                 onClick={() => setShowFamilySwitcher(!showFamilySwitcher)}
                 className="flex items-center gap-2 hover:bg-white/10 rounded-lg p-2 -ml-2 transition-colors"
              >
                <div className="p-1.5 bg-brand-500 rounded-lg"><Wallet className="h-5 w-5 text-white" /></div>
                <div className="text-left">
                  <h1 className="text-lg font-bold leading-none">{authState.family.name}</h1>
                  <p className="text-xs text-brand-200 mt-0.5 font-medium">Trocar Família</p>
                </div>
                <ChevronDown size={16} className={`transition-transform ${showFamilySwitcher ? 'rotate-180' : ''}`} />
              </button>
              
              {/* Dropdown Menu */}
              {showFamilySwitcher && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden text-slate-800 animate-in fade-in zoom-in-95 duration-200">
                  <div className="p-2 border-b bg-slate-50 text-xs font-bold text-slate-500 uppercase">Suas Famílias</div>
                  {userFamilies.map(f => (
                    <button
                      key={f.id}
                      onClick={() => handleSwitchFamily(f.id)}
                      className="w-full text-left px-4 py-3 hover:bg-slate-50 flex items-center justify-center justify-between group"
                    >
                      <span className={f.id === authState.family?.id ? 'font-bold text-brand-600' : 'font-medium'}>{f.name}</span>
                      {f.id === authState.family?.id && <Check size={16} className="text-brand-600"/>}
                    </button>
                  ))}
                  <div className="p-2 border-t">
                    <button 
                      onClick={() => { setShowCreateFamily(true); setShowFamilySwitcher(false); }}
                      className="w-full py-2 text-sm font-bold text-brand-600 bg-brand-50 rounded-lg hover:bg-brand-100 flex items-center justify-center gap-2"
                    >
                      <Plus size={16} /> Nova Família
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex gap-2">
               <button onClick={() => setShowProfile(true)} className="p-2 bg-white/10 rounded-full hover:bg-white/20" title="Editar Perfil">
                 <UserIcon size={18} />
               </button>
               <button onClick={handleLogout} className="p-2 bg-white/10 rounded-full hover:bg-white/20" title="Sair">
                 <LogOut size={18} />
               </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="bg-white/10 rounded-xl p-3">
               <p className="text-xs text-brand-200 uppercase font-bold mb-1">Patrimônio</p>
               <p className="text-2xl font-extrabold">{authState.childrenData.reduce((acc, curr) => acc + curr.balance, 0)} <span className="text-sm opacity-70">pts</span></p>
             </div>
             
             {/* INVITE CARD */}
             <div className="bg-brand-800/50 rounded-xl p-3 border border-brand-500/30">
               <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs text-brand-200 uppercase font-bold mb-1">Cód. Convite</p>
                    <p className="text-xl font-mono font-bold tracking-wider">{authState.family.joinCode}</p>
                  </div>
                  <button onClick={() => navigator.clipboard.writeText(authState.family!.joinCode)} className="p-1.5 hover:bg-white/10 rounded-md"><Copy size={14}/></button>
               </div>
               <p className="text-[10px] text-brand-200 mt-1 leading-tight">Compartilhe com filhos ou outro responsável para entrarem na família.</p>
             </div>
          </div>
        </header>

        <main className="max-w-2xl mx-auto px-4 space-y-4">

          {/* Pending Approvals Section */}
          {pendingMembers.length > 0 && (
             <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 animate-in slide-in-from-top-4">
               <h3 className="font-bold text-yellow-800 mb-3 flex items-center gap-2">
                 <UserPlus size={18} /> Aprovações Pendentes
               </h3>
               <div className="space-y-2">
                 {pendingMembers.map(u => (
                   <div key={u.id} className="bg-white p-3 rounded-lg shadow-sm border border-yellow-100 flex justify-between items-center">
                      <div className="flex items-center gap-3">
                         <Avatar name={u.name} size="sm" />
                         <div>
                           <p className="font-bold text-sm text-slate-800">{u.name}</p>
                           <p className="text-xs text-slate-500 uppercase font-bold">{u.role === 'CHILD' ? 'Filho' : 'Responsável'}</p>
                         </div>
                      </div>
                      <div className="flex gap-2">
                         <button onClick={() => handleMemberAction(u.id, false)} className="p-2 text-red-500 bg-red-50 hover:bg-red-100 rounded-lg"><X size={16}/></button>
                         <button onClick={() => handleMemberAction(u.id, true)} className="p-2 text-green-600 bg-green-50 hover:bg-green-100 rounded-lg"><Check size={16}/></button>
                      </div>
                   </div>
                 ))}
               </div>
             </div>
          )}

          {/* ACTIONS GRID */}
          <div className="grid grid-cols-2 gap-3 mb-6">
             <button onClick={() => setShowPlanner(true)} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col items-center justify-center gap-2 hover:border-brand-300 transition-all group">
                <div className="p-3 bg-purple-100 text-purple-600 rounded-full group-hover:scale-110 transition-transform"><CalendarRange size={24} /></div>
                <span className="font-bold text-slate-700 text-sm">Agenda</span>
             </button>
             <button onClick={() => setShowPresetManager(true)} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col items-center justify-center gap-2 hover:border-brand-300 transition-all group">
                <div className="p-3 bg-blue-100 text-blue-600 rounded-full group-hover:scale-110 transition-transform"><Settings size={24} /></div>
                <span className="font-bold text-slate-700 text-sm">Tarefas & Prêmios</span>
             </button>
             <button onClick={() => setShowChat(true)} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col items-center justify-center gap-2 hover:border-brand-300 transition-all group">
                <div className="p-3 bg-green-100 text-green-600 rounded-full group-hover:scale-110 transition-transform"><MessageCircle size={24} /></div>
                <span className="font-bold text-slate-700 text-sm">Chat Família</span>
             </button>
             <button onClick={() => setShowTour(true)} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col items-center justify-center gap-2 hover:border-brand-300 transition-all group">
                <div className="p-3 bg-orange-100 text-orange-600 rounded-full group-hover:scale-110 transition-transform"><HelpCircle size={24} /></div>
                <span className="font-bold text-slate-700 text-sm">Como Usar</span>
             </button>
          </div>

          <h2 className="text-lg font-bold text-slate-700 px-2">Filhos</h2>

          {authState.childrenData.length === 0 ? (
            <div className="text-center py-10 text-slate-400 bg-white rounded-xl border border-dashed border-slate-300">
              <p>Nenhum filho conectado ainda.</p>
              <p className="text-sm mt-2">Peça para eles criarem uma conta usando o código <strong>{authState.family.joinCode}</strong>.</p>
            </div>
          ) : (
            authState.childrenData.map(child => {
              const rank = getRank(child.balance);
              const pendingCount = child.transactions.filter(t => t.status === 'PENDING').length;
              
              return (
                <div 
                  key={child.id}
                  onClick={() => setSelectedChildId(child.id)}
                  className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer relative overflow-hidden group"
                >
                  <Avatar name={child.name} size="lg" />
                  
                  <div className="flex-1 z-10">
                    <h3 className="font-bold text-lg text-slate-800">{child.name}</h3>
                    <p className={`text-xs font-bold uppercase tracking-wide flex items-center gap-1 ${rank.color}`}>
                      <Trophy size={12} /> {rank.title}
                    </p>
                  </div>

                  <div className="text-right z-10">
                    <p className="text-2xl font-black text-slate-900">{child.balance}</p>
                    {pendingCount > 0 && (
                       <div className="mt-1 inline-flex items-center gap-1 bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full text-[10px] font-bold">
                         {pendingCount} solicitações
                       </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </main>

        <GeminiAdvisor />
        
        {/* MODALS */}
        {showPresetManager && (
          <PresetManager 
            presets={familyPresets}
            onAdd={handleAddPreset}
            onDelete={handleDeletePreset}
            onClose={() => setShowPresetManager(false)}
          />
        )}

        {showPlanner && (
          <CalendarPlanner
            presets={familyPresets}
            childrenData={authState.childrenData}
            currentSchedules={authState.family.schedules || []}
            currentReminders={authState.family.reminders || []}
            onSave={handleSaveSchedule}
            onClose={() => setShowPlanner(false)}
          />
        )}

        {showChat && (
          <ChatWindow
            currentUser={authState.user}
            familyId={authState.family.id}
            onClose={() => setShowChat(false)}
          />
        )}

        {showProfile && (
           <ProfileEditor
             user={authState.user}
             onClose={() => setShowProfile(false)}
           />
        )}

        {showTour && <TourGuide onClose={() => setShowTour(false)} />}

        {showCreateFamily && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
             <div className="bg-white rounded-2xl p-6 w-full max-w-sm animate-in zoom-in-95">
                <h3 className="text-lg font-bold mb-4">Criar Nova Família</h3>
                <form onSubmit={handleCreateFamily}>
                   <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nome da Família</label>
                   <input 
                      autoFocus
                      type="text" 
                      value={newFamilyName} 
                      onChange={e => setNewFamilyName(e.target.value)}
                      className="w-full border rounded-lg p-2 mb-4 outline-none focus:ring-2 focus:ring-brand-500"
                      placeholder="Ex: Grupo de Estudos"
                   />
                   <div className="flex gap-2">
                      <button type="button" onClick={() => setShowCreateFamily(false)} className="flex-1 py-2 text-slate-500 font-bold hover:bg-slate-100 rounded-lg">Cancelar</button>
                      <button type="submit" className="flex-1 py-2 bg-brand-600 text-white font-bold rounded-lg hover:bg-brand-700">Criar</button>
                   </div>
                </form>
             </div>
          </div>
        )}

      </div>
    );
  }

  // CHILD DETAIL VIEW (Or Main View for Child User)
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <div className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          {isAdmin ? (
            <button 
              onClick={() => setSelectedChildId(null)}
              className="text-slate-500 hover:text-brand-600 font-medium flex items-center gap-1 text-sm"
            >
              ← Voltar
            </button>
          ) : (
            <div className="flex items-center gap-2">
               <Wallet className="text-brand-600" size={20}/>
               <span className="font-bold text-slate-800">{authState.family.name}</span>
            </div>
          )}
          
          <div className="flex items-center gap-3">
            <span className="font-bold text-slate-800">{activeChild?.name}</span>
            {activeChild && <Avatar name={activeChild.name} size="sm" />}
            {!isAdmin && (
              <>
                <button onClick={() => setShowProfile(true)} className="p-1.5 bg-slate-100 rounded-full hover:bg-slate-200 text-slate-500">
                  <UserIcon size={14} />
                </button>
                <button onClick={handleLogout} className="p-1.5 bg-slate-100 rounded-full hover:bg-slate-200 text-slate-500">
                  <LogOut size={14} />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-6 space-y-6">
        
        {/* Balance Card */}
        <div className="bg-gradient-to-br from-brand-600 to-brand-800 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-20 -mt-20"></div>
          <p className="text-brand-100 font-medium mb-1">Saldo Atual</p>
          <div className="flex items-baseline gap-2">
             <h2 className="text-5xl font-black tracking-tighter">{activeChild?.balance}</h2>
             <span className="text-xl font-medium opacity-80">pontos</span>
          </div>
          
          <div className="mt-6 flex gap-3">
             {isAdmin ? (
               <button 
                onClick={() => setShowTransactionModal(true)}
                className="flex-1 bg-white/10 backdrop-blur-sm text-white border border-white/20 py-3 rounded-xl font-bold text-sm hover:bg-white/20 transition-colors flex items-center justify-center gap-2"
              >
                <Plus size={18} />
                Lançar Manual
              </button>
             ) : (
               <button 
                 onClick={() => setShowChat(true)}
                 className="flex-1 bg-white/10 backdrop-blur-sm text-white border border-white/20 py-3 rounded-xl font-bold text-sm hover:bg-white/20 transition-colors flex items-center justify-center gap-2"
               >
                 <MessageCircle size={18} /> Chat Família
               </button>
             )}
          </div>
        </div>

        {/* Analytics (Parent Only) */}
        {isAdmin && activeChild && <AnalyticsChart transactions={activeChild.transactions} />}

        {/* Approval Queue (Parent Only) */}
        {isAdmin && activeChild && (
          <RequestList 
            transactions={activeChild.transactions} 
            onApprove={handleApprove} 
            onReject={handleReject} 
          />
        )}

        {/* Agenda for Child */}
        {activeChild && (
          <DailyAgenda 
            childId={activeChild.id}
            schedules={authState.family.schedules || []}
            reminders={authState.family.reminders || []}
            presets={familyPresets}
            onCompleteTask={handleRequestTransaction}
          />
        )}

        {/* Action Center (Child View) */}
        {!isAdmin && (
          <div className="space-y-4">
             <div className="flex bg-white p-1 rounded-xl shadow-sm border border-slate-100">
               <button 
                 onClick={() => setChildTab('EARN')}
                 className={`flex-1 py-3 text-sm font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${childTab === 'EARN' ? 'bg-green-100 text-green-700 shadow-sm' : 'text-slate-400 hover:bg-slate-50'}`}
               >
                 <Star size={18} />
                 Tarefas
               </button>
               <button 
                 onClick={() => setChildTab('SPEND')}
                 className={`flex-1 py-3 text-sm font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${childTab === 'SPEND' ? 'bg-blue-100 text-blue-700 shadow-sm' : 'text-slate-400 hover:bg-slate-50'}`}
               >
                 <ShoppingBag size={18} />
                 Prêmios
               </button>
             </div>

             <ActionGrid 
               type={childTab} 
               balance={activeChild?.balance || 0} 
               onSelect={handleRequestTransaction}
               presets={familyPresets}
             />
          </div>
        )}

        {/* History */}
        <HistoryLog transactions={activeChild?.transactions || []} />

      </main>

      {/* MODALS */}
      {showTransactionModal && activeChild && isAdmin && (
        <TransactionForm
          childName={activeChild.name}
          onClose={() => setShowTransactionModal(false)}
          onSubmit={handleManualTransaction}
        />
      )}
      
      {showChat && (
        <ChatWindow
          currentUser={authState.user}
          familyId={authState.family.id}
          onClose={() => setShowChat(false)}
        />
      )}
      
      {showProfile && !isAdmin && (
         <ProfileEditor
           user={authState.user}
           onClose={() => setShowProfile(false)}
         />
      )}
    </div>
  );
};

export default App;
