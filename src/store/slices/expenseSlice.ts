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

    const expenseAccounts = state.accounts?.filter((a: any) => a.type === 'EXPENSE') || [];
    const assetAccounts = state.accounts?.filter((a: any) => a.type === 'ASSET' || a.type === 'BANK_ACCOUNT') || [];

    if (expenseAccounts.length === 0 || assetAccounts.length === 0) {
      alert("No se encontraron cuentas de EXPENSE o ASSET/BANK_ACCOUNT.");
      return;
    }

    const payerAccountId = assetAccounts[0].id;
    const user1ExpenseAccountId = expenseAccounts[0].id;
    const user2ExpenseAccountId = expenseAccounts.length > 1 ? expenseAccounts[1].id : expenseAccounts[0].id;

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
      payerAccountId: payerAccountId,
      user1ExpenseAccountId: user1ExpenseAccountId,
      user2ExpenseAccountId: user2ExpenseAccountId,
      user1Amount: user1Amount,
      user2Amount: user2Amount,
      payerAmount: item.amount
    });
    if (state.houseId) await state.fetchDashboardData(state.houseId);
  },
  updateExpense: async (_id, _item) => { alert("Operación 'Actualizar Gasto' no disponible en DataConnect (PostgreSQL)."); },
  deleteExpense: async (_id) => { alert("Operación 'Eliminar Gasto' no disponible en DataConnect (PostgreSQL)."); }
});
