import { StateCreator } from 'zustand';
import { RecordItem } from '../types';
import { AuthSlice } from './authSlice';
import { DataSlice } from './dataSlice';
import { createSharedExpenseWithProration } from '../../lib/dataconnect';

export interface ExpenseSlice {
  expenses: RecordItem[];
  setExpenses: (items: RecordItem[]) => void;
  addExpense: (item: any) => Promise<void>;
  updateExpense: (id: string, item: any) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
}

export const createExpenseSlice: StateCreator<ExpenseSlice & AuthSlice & DataSlice, [], [], ExpenseSlice> = (set, get) => ({
  expenses: [],
  setExpenses: (items) => set({ expenses: items }),
  addExpense: async (item) => {
    const state = get();
    const houseId = state.houseId || "00000000-0000-0000-0000-000000000000";
    let user1Amount = item.amount;
    let user2Amount = 0;
    if (item.splitType === '50/50') {
      user1Amount = item.amount / 2;
      user2Amount = item.amount / 2;
    }
    
    await createSharedExpenseWithProration({
      householdId: houseId,
      date: new Date(item.date).toISOString(),
      description: item.description || item.category || 'Gasto',
      totalAmount: item.amount,
      prorataFactor: 1.0,
      payerAccountId: "11111111-1111-1111-1111-111111111111",
      user1ExpenseAccountId: "22222222-2222-2222-2222-222222222222",
      user2ExpenseAccountId: "33333333-3333-3333-3333-333333333333",
      user1Amount: user1Amount,
      user2Amount: user2Amount,
      payerAmount: item.amount
    });
    if (state.houseId) await state.fetchDashboardData(state.houseId);
  },
  updateExpense: async (_id, _item) => {},
  deleteExpense: async (_id) => {}
});
