
import { Child, PresetItem } from './types';

export const INITIAL_CHILDREN: Child[] = [
  {
    id: '1',
    name: 'Sofia',
    familyId: 'default',
    balance: 150,
    avatar: '', // Deprecated in UI
    transactions: [
      { id: 't1', amount: 50, description: 'Arrumou o quarto', type: 'EARN', timestamp: Date.now() - 86400000, category: 'Tarefas', status: 'COMPLETED' },
      { id: 't2', amount: 20, description: 'Comprou Sorvete', type: 'SPEND', timestamp: Date.now() - 43200000, category: 'Lazer', status: 'COMPLETED' }
    ]
  },
  {
    id: '2',
    name: 'Lucas',
    familyId: 'default',
    balance: 85,
    avatar: '', // Deprecated in UI
    transactions: [
       { id: 't3', amount: 30, description: 'Lição de casa', type: 'EARN', timestamp: Date.now() - 100000, category: 'Estudos', status: 'COMPLETED' }
    ]
  }
];

export const PRESETS: PresetItem[] = [
  { id: 'p1', label: 'Arrumar o Quarto', defaultAmount: 50, type: 'EARN', emoji: '🛏️' },
  { id: 'p2', label: 'Lavar Louça', defaultAmount: 30, type: 'EARN', emoji: '🍽️' },
  { id: 'p3', label: 'Lição de Casa', defaultAmount: 40, type: 'EARN', emoji: '📚' },
  { id: 'p4', label: 'Passear com o Cachorro', defaultAmount: 25, type: 'EARN', emoji: '🐕' },
  { id: 'p5', label: 'Ler um Livro', defaultAmount: 30, type: 'EARN', emoji: '📖' },
  { id: 'p6', label: '1 Hora de Tela', defaultAmount: 60, type: 'SPEND', emoji: '📱' },
  { id: 'p7', label: 'Saída com Amigos', defaultAmount: 100, type: 'SPEND', emoji: '🍕' },
  { id: 'p8', label: 'Sorvete', defaultAmount: 20, type: 'SPEND', emoji: '🍦' },
  { id: 'p9', label: 'Nota Baixa', defaultAmount: 50, type: 'PENALTY', emoji: '📉' },
  { id: 'p10', label: 'Mau Comportamento', defaultAmount: 30, type: 'PENALTY', emoji: '😠' },
];