import { StateCreator } from 'zustand';
import { RecordItem } from '../types';
import { AuthSlice } from './authSlice';
import { DataSlice } from './dataSlice';
import { createJournalWithEntries, seedDefaultAccounts, deleteJournal } from '../../lib/dataconnect';
import { useToastStore } from '../useToastStore';

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

    let incomeAccount = state.accounts?.find((a: any) => a.type === 'INCOME');
    let assetAccount = state.accounts?.find((a: any) => a.type === 'ASSET' || a.type === 'BANK_ACCOUNT');

    // If accounts are missing, try to seed them and reload
    if (!incomeAccount || !assetAccount) {
      try {
        useToastStore.getState().addToast("Configurando cuentas contables...", "info");
        await seedDefaultAccounts({ householdId: houseId });
        if (state.houseId) await state.fetchDashboardData(state.houseId);
        // Re-read accounts from updated state
        const updatedState = get();
        incomeAccount = updatedState.accounts?.find((a: any) => a.type === 'INCOME');
        assetAccount = updatedState.accounts?.find((a: any) => a.type === 'ASSET' || a.type === 'BANK_ACCOUNT');
      } catch (seedError) {
        console.warn("seedDefaultAccounts falló (puede que ya existan):", seedError);
        // Re-read accounts in case they existed but hadn't loaded yet
        const updatedState = get();
        incomeAccount = updatedState.accounts?.find((a: any) => a.type === 'INCOME');
        assetAccount = updatedState.accounts?.find((a: any) => a.type === 'ASSET' || a.type === 'BANK_ACCOUNT');
      }
    }

    if (!incomeAccount || !assetAccount) {
      useToastStore.getState().addToast(
        "No se pudieron crear las cuentas contables. Recarga la app e intenta de nuevo.",
        "error"
      );
      return;
    }

    const optimisticIncome = { ...item, id: `temp-${Date.now()}` };
    set({ incomes: [optimisticIncome, ...state.incomes] });

    try {
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
      useToastStore.getState().addToast("Ingreso agregado correctamente", "success");
      if (state.houseId) await state.fetchDashboardData(state.houseId);
    } catch(error) {
      console.error(error);
      useToastStore.getState().addToast("Error al registrar el ingreso", "error");
      set((s) => ({ incomes: s.incomes.filter((i) => i.id !== optimisticIncome.id) }));
    }
  },
  updateIncome: async (_id, _item) => {
    useToastStore.getState().addToast("Operación 'Actualizar Ingreso' no disponible en DataConnect (PostgreSQL).", "error");
  },
  deleteIncome: async (id) => {
    const state = get();
    // Optimistic delete
    const previousIncomes = [...state.incomes];
    set((s) => ({ incomes: s.incomes.filter(i => i.id !== id) }));
    
    try {
      if (!id.startsWith('temp-')) {
        await deleteJournal({ journalId: id });
        useToastStore.getState().addToast("Ingreso eliminado correctamente", "success");
        if (state.houseId) await state.fetchDashboardData(state.houseId);
      }
    } catch(error) {
      console.error(error);
      useToastStore.getState().addToast("Error al eliminar el ingreso", "error");
      set({ incomes: previousIncomes });
    }
  }
});
