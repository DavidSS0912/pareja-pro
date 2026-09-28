import { StateCreator } from 'zustand';
import { RecordItem } from '../types';
import { AuthSlice } from './authSlice';
import { createBudget, updateBudgetAmount, OwnerType } from '../../lib/dataconnect';
import { DataSlice } from './dataSlice';

export interface BudgetSlice {
  budgets: RecordItem[];
  setBudgets: (items: RecordItem[]) => void;
  addBudget: (item: any) => Promise<void>;
  updateBudget: (id: string, item: any) => Promise<void>;
  deleteBudget: (id: string) => Promise<void>;
}

export const createBudgetSlice: StateCreator<BudgetSlice & AuthSlice & DataSlice, [], [], BudgetSlice> = (set, get) => ({
  budgets: [],
  setBudgets: (items) => set({ budgets: items }),
  addBudget: async (item) => {
    const state = get();
    const houseId = state.houseId || "00000000-0000-0000-0000-000000000000";
    await createBudget({
      householdId: houseId,
      categoryName: item.category || 'General',
      assignedAmount: item.base || 0,
      period: new Date().toISOString().slice(0, 7) + '-01',
      ownerType: (item.shared || item.type === 'SHARED') ? OwnerType.SHARED : OwnerType.USER_A
    });
    if (state.houseId) await state.fetchDashboardData(state.houseId);
  },
  updateBudget: async (id, item) => {
    const state = get();
    await updateBudgetAmount({
      budgetId: id,
      assignedAmount: item.base !== undefined ? item.base : (item.assignedAmount || 0)
    });
    if (state.houseId) await state.fetchDashboardData(state.houseId);
  },
  deleteBudget: async (_id) => {}
});
