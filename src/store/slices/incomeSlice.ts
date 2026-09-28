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

    const incomeAccount = state.accounts?.find((a: any) => a.type === 'INCOME');
    const assetAccount = state.accounts?.find((a: any) => a.type === 'ASSET' || a.type === 'BANK_ACCOUNT');

    if (!incomeAccount || !assetAccount) {
      alert("No se encontraron las cuentas necesarias (INCOME/ASSET) para registrar el ingreso.");
      return;
    }

    await createJournalWithEntries({
      householdId: houseId,
      date: new Date(item.date).toISOString(),
      description: item.type + (item.source ? ` - ${item.source}` : ''),
      accountId1: incomeAccount.id,
      amount1: item.amount,
      prorataFactor1: 1.0,
      accountId2: assetAccount.id,
      amount2: -item.amount,
      prorataFactor2: 1.0
    });
    if (state.houseId) await state.fetchDashboardData(state.houseId);
  },
  updateIncome: async (_id, _item) => {
    alert("Operación 'Actualizar Ingreso' no disponible en DataConnect (PostgreSQL).");
  },
  deleteIncome: async (_id) => {
    alert("Operación 'Eliminar Ingreso' no disponible en DataConnect (PostgreSQL).");
  }
});
