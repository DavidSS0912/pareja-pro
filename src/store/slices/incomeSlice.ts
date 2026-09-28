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

export const createIncomeSlice: StateCreator<IncomeSlice & AuthSlice, [], [], IncomeSlice> = (set, get) => ({
  incomes: [],
  setIncomes: (items) => set({ incomes: items }),
  addIncome: async (item) => {},
  updateIncome: async (id, item) => {},
  deleteIncome: async (id) => {}

});
