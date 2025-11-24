
export type TransactionType = 'EARN' | 'SPEND' | 'PENALTY';
export type TransactionStatus = 'COMPLETED' | 'PENDING' | 'REJECTED';
export type UserRole = 'PARENT' | 'CHILD';

export interface ChatMessage {
  id: string;
  familyId: string;
  senderId: string;
  text: string;
  timestamp: number;
  isSystem?: boolean;
}

export interface Transaction {
  id: string;
  amount: number;
  description: string;
  type: TransactionType;
  timestamp: number;
  category?: string;
  status: TransactionStatus;
}

export interface PresetItem {
  id: string;
  label: string;
  defaultAmount: number;
  type: TransactionType;
  emoji: string;
  isRecurring?: boolean; 
  familyId?: string; 
}

export interface ScheduleItem {
  id: string;
  childId?: string; 
  frequency: 'ONCE' | 'WEEKLY';
  date?: string; // YYYY-MM-DD (Para ONCE)
  dayOfWeek?: number; // 0-6 (Para WEEKLY)
  presetId: string; 
}

export interface ReminderItem {
  id: string;
  childId?: string;
  frequency: 'ONCE' | 'WEEKLY';
  date?: string; // YYYY-MM-DD
  dayOfWeek?: number; // 0-6
  text: string;
}

export interface Child {
  id: string; // User ID
  name: string;
  balance: number;
  avatar: string;
  transactions: Transaction[];
  familyId: string;
}

export interface Family {
  id: string;
  name: string;
  joinCode: string; // Código de 6 dígitos
  parentIds: string[];
  presets: PresetItem[]; 
  schedules: ScheduleItem[]; 
  reminders: ReminderItem[]; 
}

export interface User {
  id: string;
  name: string;
  username?: string; 
  email?: string; 
  password?: string; 
  pin?: string; 
  role: UserRole;
  familyIds: string[]; // List of families user belongs to
  avatar: string;
  approved: boolean;
}

export interface AuthState {
  user: User | null;
  family: Family | null; // Current active family
  childrenData: Child[]; 
}