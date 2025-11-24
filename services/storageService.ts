
import { Child, Family, PresetItem, Transaction, TransactionStatus, User, TransactionType, ScheduleItem, ReminderItem, ChatMessage } from '../types';
import { PRESETS } from '../constants';

const DB_KEY = 'family_bank_db_v9'; 
const CURRENT_USER_KEY = 'family_bank_session_v9';

interface Database {
  users: User[];
  families: Family[];
  childrenData: Child[]; 
  messages: ChatMessage[];
}

// Inicializa ou recupera o banco de dados local
const getDB = (): Database => {
  const data = localStorage.getItem(DB_KEY);
  if (data) return JSON.parse(data);
  return { users: [], families: [], childrenData: [], messages: [] };
};

const saveDB = (db: Database) => {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
};

// --- AUTH SERVICES ---

export const getCurrentSession = (): { user: User | null, family: Family | null } => {
  const session = localStorage.getItem(CURRENT_USER_KEY);
  if (!session) return { user: null, family: null };
  
  try {
    const { userId, activeFamilyId } = JSON.parse(session);
    const db = getDB();
    const user = db.users.find(u => u.id === userId) || null;
    
    // Check approval
    if (user && !user.approved) {
      logout();
      return { user: null, family: null };
    }
    
    let family = null;
    if (user) {
      // Tenta carregar a família ativa da sessão, ou a primeira da lista do usuário
      const targetFamilyId = activeFamilyId || (user.familyIds && user.familyIds.length > 0 ? user.familyIds[0] : null);
      if (targetFamilyId) {
        family = db.families.find(f => f.id === targetFamilyId) || null;
      }
    }
    
    return { user, family };
  } catch (e) {
    return { user: null, family: null };
  }
};

export const switchFamilySession = (familyId: string) => {
  const session = localStorage.getItem(CURRENT_USER_KEY);
  if (session) {
    const data = JSON.parse(session);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify({ ...data, activeFamilyId: familyId }));
  }
};

export const logout = () => {
  localStorage.removeItem(CURRENT_USER_KEY);
};

export const checkUsernameAvailability = (username: string): boolean => {
  const db = getDB();
  return !db.users.some(u => u.username?.toLowerCase() === username.toLowerCase());
};

export const loginParent = (email: string, password: string): { user: User, family: Family } | { error: string } => {
  const db = getDB();
  const user = db.users.find(u => u.email === email && u.password === password && u.role === 'PARENT');
  
  if (!user) return { error: 'Email ou senha inválidos.' };
  if (!user.approved) return { error: 'Sua conta aguarda aprovação do administrador da família.' };
  
  // Get first family or create empty session
  const familyId = user.familyIds?.[0];
  const family = familyId ? db.families.find(f => f.id === familyId) : undefined;
  
  if (user.familyIds.length > 0 && !family) return { error: 'Erro ao carregar dados da família.' };

  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify({ userId: user.id, activeFamilyId: family?.id }));
  // @ts-ignore
  return { user, family };
};

export const loginChild = (username: string, pin: string): { user: User, family: Family } | { error: string } => {
  const db = getDB();
  
  const user = db.users.find(u => u.username?.toLowerCase() === username.toLowerCase() && u.role === 'CHILD');

  if (!user) return { error: 'Usuário não encontrado.' };
  if (user.pin !== pin) return { error: 'PIN incorreto.' };
  if (!user.approved) return { error: 'Sua conta aguarda aprovação do seu responsável.' };
  
  // Child usually has only one family
  const familyId = user.familyIds?.[0];
  if (!familyId) return { error: 'Usuário sem família vinculada.' };

  const family = db.families.find(f => f.id === familyId);
  if (!family) return { error: 'Família não encontrada.' };

  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify({ userId: user.id, activeFamilyId: family.id }));
  return { user, family };
};

export const registerChild = (joinCode: string, name: string, username: string, pin: string): { success: boolean } | { error: string } => {
  const db = getDB();
  
  const family = db.families.find(f => f.joinCode === joinCode);
  if (!family) return { error: 'Código da família inválido.' };

  if (!checkUsernameAvailability(username)) {
    return { error: 'Este nome de usuário já está em uso.' };
  }

  const userId = crypto.randomUUID();
  const newUser: User = {
    id: userId,
    name, 
    username,
    role: 'CHILD',
    familyIds: [family.id],
    pin: pin,
    avatar: '', // Deprecated visual
    approved: false // Requires approval
  };

  const newChildData: Child = {
    id: userId,
    name,
    familyId: family.id,
    balance: 0,
    avatar: '',
    transactions: []
  };

  db.users.push(newUser);
  db.childrenData.push(newChildData);
  saveDB(db);

  return { success: true };
};

// Parent registration now supports creating NEW or JOINING existing
export const registerParent = (
  name: string, 
  email: string, 
  password: string, 
  mode: 'CREATE' | 'JOIN',
  familyNameOrCode: string
): { user: User, family: Family } | { error: string } | { success: boolean, message: string } => {
  const db = getDB();
  
  if (db.users.some(u => u.email === email)) {
    return { error: 'Este email já está cadastrado.' };
  }

  let family: Family;
  let isApproved = true;

  if (mode === 'CREATE') {
    const familyId = crypto.randomUUID();
    const joinCode = Math.floor(100000 + Math.random() * 900000).toString(); 
    
    family = {
      id: familyId,
      name: familyNameOrCode,
      joinCode,
      parentIds: [],
      presets: [...PRESETS.map(p => ({...p, familyId}))],
      schedules: [],
      reminders: []
    };
    db.families.push(family);
  } else {
    // JOIN MODE
    const existingFamily = db.families.find(f => f.joinCode === familyNameOrCode);
    if (!existingFamily) return { error: 'Código de família inválido.' };
    family = existingFamily;
    isApproved = false; // Joiners need approval
  }

  const userId = crypto.randomUUID();
  const newUser: User = {
    id: userId,
    name,
    email,
    password,
    role: 'PARENT',
    familyIds: [family.id],
    avatar: '', // Deprecated visual
    approved: isApproved
  };

  // Add parent to family
  const familyIndex = db.families.findIndex(f => f.id === family.id);
  if (!db.families[familyIndex].parentIds.includes(userId)) {
     db.families[familyIndex].parentIds.push(userId);
  }

  db.users.push(newUser);
  saveDB(db);

  if (!isApproved) {
    return { success: true, message: 'Cadastro realizado! Aguarde a aprovação do administrador da família.' };
  }

  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify({ userId, activeFamilyId: family.id }));
  return { user: newUser, family: db.families[familyIndex] };
};

export const createNewFamilyForUser = (userId: string, familyName: string): Family | null => {
  const db = getDB();
  const userIndex = db.users.findIndex(u => u.id === userId);
  if (userIndex === -1) return null;

  const familyId = crypto.randomUUID();
  const joinCode = Math.floor(100000 + Math.random() * 900000).toString(); 
  
  const newFamily: Family = {
    id: familyId,
    name: familyName,
    joinCode,
    parentIds: [userId],
    presets: [...PRESETS.map(p => ({...p, familyId}))],
    schedules: [],
    reminders: []
  };

  db.families.push(newFamily);
  db.users[userIndex].familyIds.push(familyId);
  
  saveDB(db);
  return newFamily;
};

export const getUserFamilies = (userId: string): Family[] => {
  const db = getDB();
  const user = db.users.find(u => u.id === userId);
  if (!user) return [];
  return db.families.filter(f => user.familyIds.includes(f.id));
};

// --- DATA SERVICES ---

export const getFamilyChildren = (familyId: string): Child[] => {
  const db = getDB();
  // Only return approved children in data fetching usually, 
  // but for dashboard we might want all. Let's filter by approved for general use
  // but we need a separate call for pending.
  const approvedUserIds = db.users.filter(u => u.familyIds.includes(familyId) && u.approved).map(u => u.id);
  return db.childrenData.filter(c => c.familyId === familyId && approvedUserIds.includes(c.id));
};

export const getPendingMembers = (familyId: string): User[] => {
  const db = getDB();
  return db.users.filter(u => u.familyIds.includes(familyId) && u.approved === false);
};

export const handleMemberApproval = (userId: string, approve: boolean) => {
  const db = getDB();
  const userIndex = db.users.findIndex(u => u.id === userId);
  
  if (userIndex === -1) return;

  if (approve) {
    db.users[userIndex].approved = true;
  } else {
    // Reject: Remove user and related data
    const user = db.users[userIndex];
    
    // Remove from families
    user.familyIds.forEach(famId => {
       const fIndex = db.families.findIndex(f => f.id === famId);
       if (fIndex > -1) {
         db.families[fIndex].parentIds = db.families[fIndex].parentIds.filter(id => id !== userId);
       }
    });

    // Remove child data if exists
    if (user.role === 'CHILD') {
       db.childrenData = db.childrenData.filter(c => c.id !== userId);
    }

    // Remove user
    db.users.splice(userIndex, 1);
  }
  
  saveDB(db);
};

export const getFamilyPresets = (familyId: string): PresetItem[] => {
  const db = getDB();
  const family = db.families.find(f => f.id === familyId);
  return family ? family.presets : [];
};

export const savePreset = (familyId: string, preset: PresetItem) => {
  const db = getDB();
  const familyIndex = db.families.findIndex(f => f.id === familyId);
  if (familyIndex === -1) return;

  const presets = db.families[familyIndex].presets;
  const existingIndex = presets.findIndex(p => p.id === preset.id);

  if (existingIndex >= 0) {
    presets[existingIndex] = preset;
  } else {
    presets.push({ ...preset, familyId });
  }

  db.families[familyIndex].presets = presets;
  saveDB(db);
};

export const deletePreset = (familyId: string, presetId: string) => {
  const db = getDB();
  const familyIndex = db.families.findIndex(f => f.id === familyId);
  if (familyIndex === -1) return;

  db.families[familyIndex].presets = db.families[familyIndex].presets.filter(p => p.id !== presetId);
  saveDB(db);
};

export const updateUser = (userId: string, updates: Partial<User>) => {
  const db = getDB();
  const idx = db.users.findIndex(u => u.id === userId);
  if (idx !== -1) {
    db.users[idx] = { ...db.users[idx], ...updates };
    
    // Also update Child data if applicable
    const childIdx = db.childrenData.findIndex(c => c.id === userId);
    if (childIdx !== -1) {
      if (updates.name) db.childrenData[childIdx].name = updates.name;
    }
    
    saveDB(db);
  }
};

// --- SCHEDULE SERVICES ---

export const updateFamilySchedule = (familyId: string, schedules: ScheduleItem[], reminders: ReminderItem[]) => {
  const db = getDB();
  const familyIndex = db.families.findIndex(f => f.id === familyId);
  if (familyIndex === -1) return;

  db.families[familyIndex].schedules = schedules;
  db.families[familyIndex].reminders = reminders;
  saveDB(db);
};

// --- TRANSACTION SERVICES ---

export const createTransaction = (
  childId: string,
  amount: number,
  description: string,
  type: TransactionType,
  status: TransactionStatus
): Child[] => {
  const db = getDB();
  const childIndex = db.childrenData.findIndex(c => c.id === childId);
  
  if (childIndex === -1) return [];

  const child = db.childrenData[childIndex];
  
  const transaction: Transaction = {
    id: crypto.randomUUID(),
    amount: Math.abs(amount),
    description,
    type,
    timestamp: Date.now(),
    status
  };

  let newBalance = child.balance;
  if (status === 'COMPLETED') {
    if (type === 'EARN') {
      newBalance += amount;
    } else {
      newBalance -= amount;
    }
  }

  db.childrenData[childIndex] = {
    ...child,
    balance: newBalance,
    transactions: [transaction, ...child.transactions]
  };

  saveDB(db);
  return db.childrenData.filter(c => c.familyId === child.familyId);
};

export const updateTransactionStatus = (
  childId: string,
  transactionId: string,
  newStatus: TransactionStatus
): Child[] => {
  const db = getDB();
  const childIndex = db.childrenData.findIndex(c => c.id === childId);
  
  if (childIndex === -1) return [];

  const child = db.childrenData[childIndex];
  const txIndex = child.transactions.findIndex(t => t.id === transactionId);
  
  if (txIndex === -1) return [];

  const tx = child.transactions[txIndex];
  
  let newBalance = child.balance;
  if (tx.status === 'PENDING' && newStatus === 'COMPLETED') {
    if (tx.type === 'EARN') {
      newBalance += tx.amount;
    } else {
      newBalance -= tx.amount;
    }
  }

  child.transactions[txIndex] = { ...tx, status: newStatus };
  child.balance = newBalance;

  db.childrenData[childIndex] = child;
  saveDB(db);
  
  return db.childrenData.filter(c => c.familyId === child.familyId);
};

// --- CHAT SERVICES ---

export const getMessages = (familyId: string): ChatMessage[] => {
  const db = getDB();
  return db.messages.filter(m => m.familyId === familyId).sort((a,b) => a.timestamp - b.timestamp);
};

export const sendMessage = (familyId: string, senderId: string, text: string, isSystem = false) => {
  const db = getDB();
  const msg: ChatMessage = {
    id: crypto.randomUUID(),
    familyId,
    senderId,
    text,
    timestamp: Date.now(),
    isSystem
  };
  db.messages.push(msg);
  saveDB(db);
  return msg;
};
