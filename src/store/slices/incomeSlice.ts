import { StateCreator } from 'zustand';
import { RecordItem } from '../types';
import { AuthSlice } from './authSlice';

export interface IncomeSlice {
  incomes: RecordItem[];
  setIncomes: (items: RecordItem[]) => void;
  addIncome: (item: any) => Promise<void>;
  updateIncome: (id: string, item: any) => Promise<void>;
  deleteIncome: (id: string) => Promise<void>;

}

export const createIncomeSlice: StateCreator<IncomeSlice & AuthSlice, [], [], IncomeSlice> = (set) => ({
  incomes: [],
  setIncomes: (items) => set({ incomes: items }),
  addIncome: async (_item) => {},
  updateIncome: async (_id, _item) => {},
  deleteIncome: async (_id) => {}

});
