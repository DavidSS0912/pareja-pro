import { StateCreator } from 'zustand';
import { RecordItem } from '../types';
import { AuthSlice } from './authSlice';
import { DataSlice } from './dataSlice';
import { createJournalWithEntries } from '../../lib/dataconnect';

export interface IncomeSlice {
  incomes: RecordItem[];
  setIncomes: (items: RecordItem[]) => void;
  addIncome: (item: any) => Promise<void>;
  updateIncome: (id: string, item: any) => Promise<void>;
  deleteIncome: (id: string) => Promise<void>;
}

export const createIncomeSlice: StateCreator<IncomeSlice & AuthSlice & DataSlice, [], [], IncomeSlice> = (set, get) => ({
  incomes: [],
  setIncomes: (items) => set({ incomes: items }),
  addIncome: async (item) => {
    const state = get();
    const houseId = state.houseId || "00000000-0000-0000-0000-000000000000";
    await createJournalWithEntries({
      householdId: houseId,
      date: new Date(item.date).toISOString(),
      description: item.type + (item.source ? ` - ${item.source}` : ''),
      accountId1: "11111111-1111-1111-1111-111111111111", // Fake Income Account
      amount1: item.amount,
      prorataFactor1: 1.0,
      accountId2: "22222222-2222-2222-2222-222222222222", // Fake Asset Account
      amount2: -item.amount,
      prorataFactor2: 1.0
    });
    if (state.houseId) await state.fetchDashboardData(state.houseId);
  },
  updateIncome: async (_id, _item) => {},
  deleteIncome: async (_id) => {}
});
