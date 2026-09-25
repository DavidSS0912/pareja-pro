import { StateCreator } from 'zustand';
import { RecordItem } from '../../services/baseService';
import { incomeService } from '../../services/incomeService';
import { AuthSlice } from './authSlice';

export interface IncomeSlice {
  incomes: RecordItem[];
  setIncomes: (incomes: RecordItem[]) => void;
  addIncome: (income: Omit<RecordItem, 'id'>) => Promise<void>;
  updateIncome: (id: string, income: Partial<Omit<RecordItem, 'id'>>) => Promise<void>;
  deleteIncome: (id: string) => Promise<void>;
}

export const createIncomeSlice: StateCreator<IncomeSlice & AuthSlice, [], [], IncomeSlice> = (set, get) => ({
  incomes: [],
  setIncomes: (incomes) => set({ incomes }),
  addIncome: async (income) => {
    const { houseId } = get();
    if (!houseId) return;
    await incomeService.add(income, houseId);
  },
  updateIncome: async (id, income) => {
    await incomeService.update(id, income);
  },
  deleteIncome: async (id) => {
    await incomeService.delete(id);
  }
});
