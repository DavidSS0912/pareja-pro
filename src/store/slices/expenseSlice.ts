import { StateCreator } from 'zustand';
import { RecordItem } from '../../services/baseService';
import { expenseService } from '../../services/expenseService';
import { AuthSlice } from './authSlice';

export interface ExpenseSlice {
  expenses: RecordItem[];
  setExpenses: (expenses: RecordItem[]) => void;
  addExpense: (expense: Omit<RecordItem, 'id'>) => Promise<void>;
  updateExpense: (id: string, expense: Partial<Omit<RecordItem, 'id'>>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
}

export const createExpenseSlice: StateCreator<ExpenseSlice & AuthSlice, [], [], ExpenseSlice> = (set, get) => ({
  expenses: [],
  setExpenses: (expenses) => set({ expenses }),
  addExpense: async (expense) => {
    const { houseId } = get();
    if (!houseId) return;
    await expenseService.add(expense, houseId);
  },
  updateExpense: async (id, expense) => {
    await expenseService.update(id, expense);
  },
  deleteExpense: async (id) => {
    await expenseService.delete(id);
  }
});
