import { StateCreator } from 'zustand';
import { RecordItem } from '../types';
import { AuthSlice } from './authSlice';

export interface BudgetSlice {
  budgets: RecordItem[];
  setBudgets: (items: RecordItem[]) => void;
  addBudget: (item: any) => Promise<void>;
  updateBudget: (id: string, item: any) => Promise<void>;
  deleteBudget: (id: string) => Promise<void>;

}

export const createBudgetSlice: StateCreator<BudgetSlice & AuthSlice, [], [], BudgetSlice> = (set, get) => ({
  budgets: [],
  setBudgets: (items) => set({ budgets: items }),
  addBudget: async (item) => {},
  updateBudget: async (id, item) => {},
  deleteBudget: async (id) => {}

});
