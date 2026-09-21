import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { SEED_DATA } from '../data';

export interface RecordItem {
  id: string;
  [key: string]: any;
}

export interface AppState {
  expenses: RecordItem[];
  budgets: RecordItem[];
  cards: RecordItem[];
  assets: RecordItem[];
  incomes: RecordItem[];
  
  addExpense: (expense: Omit<RecordItem, 'id'>) => void;
  updateExpense: (id: string, expense: Partial<Omit<RecordItem, 'id'>>) => void;
  deleteExpense: (id: string) => void;

  addBudget: (budget: Omit<RecordItem, 'id'>) => void;
  updateBudget: (id: string, budget: Partial<Omit<RecordItem, 'id'>>) => void;
  deleteBudget: (id: string) => void;

  addCard: (card: Omit<RecordItem, 'id'>) => void;
  updateCard: (id: string, card: Partial<Omit<RecordItem, 'id'>>) => void;
  deleteCard: (id: string) => void;

  addAsset: (asset: Omit<RecordItem, 'id'>) => void;
  updateAsset: (id: string, asset: Partial<Omit<RecordItem, 'id'>>) => void;
  deleteAsset: (id: string) => void;

  addIncome: (income: Omit<RecordItem, 'id'>) => void;
  updateIncome: (id: string, income: Partial<Omit<RecordItem, 'id'>>) => void;
  deleteIncome: (id: string) => void;
}

const generateId = (prefix: string) => `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      ...SEED_DATA, // Assuming SEED_DATA has initial arrays for all collections

      addExpense: (expense) => set((state) => ({ expenses: [...state.expenses, { ...expense, id: generateId('e') }] })),
      updateExpense: (id, expense) => set((state) => ({ expenses: state.expenses.map(e => e.id === id ? { ...e, ...expense } : e) })),
      deleteExpense: (id) => set((state) => ({ expenses: state.expenses.filter(e => e.id !== id) })),

      addBudget: (budget) => set((state) => ({ budgets: [...state.budgets, { ...budget, id: generateId('b') }] })),
      updateBudget: (id, budget) => set((state) => ({ budgets: state.budgets.map(b => b.id === id ? { ...b, ...budget } : b) })),
      deleteBudget: (id) => set((state) => ({ budgets: state.budgets.filter(b => b.id !== id) })),

      addCard: (card) => set((state) => ({ cards: [...state.cards, { ...card, id: generateId('c') }] })),
      updateCard: (id, card) => set((state) => ({ cards: state.cards.map(c => c.id === id ? { ...c, ...card } : c) })),
      deleteCard: (id) => set((state) => ({ cards: state.cards.filter(c => c.id !== id) })),

      addAsset: (asset) => set((state) => ({ assets: [...state.assets, { ...asset, id: generateId('a') }] })),
      updateAsset: (id, asset) => set((state) => ({ assets: state.assets.map(a => a.id === id ? { ...a, ...asset } : a) })),
      deleteAsset: (id) => set((state) => ({ assets: state.assets.filter(a => a.id !== id) })),

      addIncome: (income) => set((state) => ({ incomes: [...state.incomes, { ...income, id: generateId('i') }] })),
      updateIncome: (id, income) => set((state) => ({ incomes: state.incomes.map(i => i.id === id ? { ...i, ...income } : i) })),
      deleteIncome: (id) => set((state) => ({ incomes: state.incomes.filter(i => i.id !== id) })),
    }),
    {
      name: 'orbita2_data',
    }
  )
);
