import { StateCreator } from 'zustand';
import { RecordItem } from '../types';
import { AuthSlice } from './authSlice';

export interface ExpenseSlice {
  expenses: RecordItem[];
  setExpenses: (items: RecordItem[]) => void;
  addExpense: (item: any) => Promise<void>;
  updateExpense: (id: string, item: any) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;

}

export const createExpenseSlice: StateCreator<ExpenseSlice & AuthSlice, [], [], ExpenseSlice> = (set) => ({
  expenses: [],
  setExpenses: (items) => set({ expenses: items }),
  addExpense: async (_item) => {},
  updateExpense: async (_id, _item) => {},
  deleteExpense: async (_id) => {}

});
