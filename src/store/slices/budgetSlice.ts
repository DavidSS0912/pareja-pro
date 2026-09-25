import { StateCreator } from 'zustand';
import { RecordItem } from '../../services/baseService';
import { budgetService } from '../../services/budgetService';
import { AuthSlice } from './authSlice';

export interface BudgetSlice {
  budgets: RecordItem[];
  setBudgets: (budgets: RecordItem[]) => void;
  addBudget: (budget: Omit<RecordItem, 'id'>) => Promise<void>;
  updateBudget: (id: string, budget: Partial<Omit<RecordItem, 'id'>>) => Promise<void>;
  deleteBudget: (id: string) => Promise<void>;
}

export const createBudgetSlice: StateCreator<BudgetSlice & AuthSlice, [], [], BudgetSlice> = (set, get) => ({
  budgets: [],
  setBudgets: (budgets) => set({ budgets }),
  addBudget: async (budget) => {
    const { houseId } = get();
    if (!houseId) return;
    await budgetService.add(budget, houseId);
  },
  updateBudget: async (id, budget) => {
    await budgetService.update(id, budget);
  },
  deleteBudget: async (id) => {
    await budgetService.delete(id);
  }
});
