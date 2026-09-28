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

export const createBudgetSlice: StateCreator<BudgetSlice & AuthSlice, [], [], BudgetSlice> = (set) => ({
  budgets: [],
  setBudgets: (items) => set({ budgets: items }),
  addBudget: async (_item) => {},
  updateBudget: async (_id, _item) => {},
  deleteBudget: async (_id) => {}

});
