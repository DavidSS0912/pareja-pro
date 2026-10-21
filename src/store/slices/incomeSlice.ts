import { StateCreator } from 'zustand';
import { RecordItem } from '../types';
import { AuthSlice } from './authSlice';
import { DataSlice } from './dataSlice';
import { AccountSlice } from './accountSlice';
import { createJournalWithEntries, updateJournalWithEntries, seedDefaultAccounts, deleteJournal } from '../../lib/dataconnect';
import { useToastStore } from '../useToastStore';

export interface IncomeSlice {
  incomes: RecordItem[];
  setIncomes: (items: RecordItem[]) => void;
  addIncome: (item: any) => Promise<void>;
  updateIncome: (id: string, item: any) => Promise<void>;
  deleteIncome: (id: string) => Promise<void>;
}

export const createIncomeSlice: StateCreator<IncomeSlice & AuthSlice & DataSlice & AccountSlice, [], [], IncomeSlice> = (set, get) => ({
  incomes: [],
  setIncomes: (items) => set({ incomes: items }),
  addIncome: async (item) => {
    const state = get();
    const houseId = state.houseId || "00000000-0000-0000-0000-000000000000";

    let incomeAccount = state.accounts?.find((a: any) => a.type === 'INCOME');
    let assetAccount = item.accountId ? state.accounts?.find((a: any) => a.id === item.accountId) : state.accounts?.find((a: any) => a.type === 'ASSET' || a.type === 'BANK_ACCOUNT');

    // If accounts are missing, try to seed them and reload
    if (!incomeAccount || !assetAccount) {
      try {
        useToastStore.getState().addToast("Configurando cuentas contables...", "info");
        await seedDefaultAccounts({ householdId: houseId });
        if (state.houseId) await get().fetchDashboardData(state.houseId);
        // Re-read accounts from updated state
        const updatedState = get();
        incomeAccount = updatedState.accounts?.find((a: any) => a.type === 'INCOME');
        assetAccount = item.accountId ? updatedState.accounts?.find((a: any) => a.id === item.accountId) : updatedState.accounts?.find((a: any) => a.type === 'ASSET' || a.type === 'BANK_ACCOUNT');
      } catch (seedError) {
        console.warn("seedDefaultAccounts falló (puede que ya existan):", seedError);
        // Re-read accounts in case they existed but hadn't loaded yet
        const updatedState = get();
        incomeAccount = updatedState.accounts?.find((a: any) => a.type === 'INCOME');
        assetAccount = item.accountId ? updatedState.accounts?.find((a: any) => a.id === item.accountId) : updatedState.accounts?.find((a: any) => a.type === 'ASSET' || a.type === 'BANK_ACCOUNT');
      }
    }

    if (!incomeAccount || !assetAccount) {
      useToastStore.getState().addToast(
        "No se pudieron crear las cuentas contables. Recarga la app e intenta de nuevo.",
        "error"
      );
      return;
    }

    const desc = "Ingreso" + (item.source ? ` - ${item.source}` : '');
    const resolvedOwner = item.userId || state.user?.uid || "unknown";
    const optimisticIncome = { ...item, description: desc, type: desc, userId: resolvedOwner, ownerUid: resolvedOwner, id: `temp-${Date.now()}` };
    set((s) => ({ incomes: [optimisticIncome, ...s.incomes] }));

    try {
      const response = await createJournalWithEntries({
        householdId: houseId,
        date: new Date(item.date).toISOString(),
        description: desc,
        amount: item.amount,
        debitAccountId: assetAccount.id,
        creditAccountId: incomeAccount.id,
        prorataFactor: 1.0,
        ownerUid: resolvedOwner,
        isShared: !item.isPrivate,
        incomeCategoryType: item.incomeCategoryType,
        categoryId: item.categoryId || null
      });
      const realId = response.data?.journal_insert?.id;
      if (realId) {
        set((s) => ({
          incomes: s.incomes.map((i) => i.id === optimisticIncome.id ? { ...i, id: realId } : i)
        }));
      }
      // Sync with real Firebase data so all fields (ownerUid, isPrivate, etc.) are accurate
      useToastStore.getState().addToast("Ingreso agregado correctamente", "success");
      const currentHouseId = get().houseId;
      if (currentHouseId) await get().fetchDashboardData(currentHouseId);
    } catch(error: any) {
      console.error(error);
      useToastStore.getState().addToast(`Error: ${error.message || 'Desconocido'}`, "error");
      alert("Error al registrar el ingreso: " + (error.message || JSON.stringify(error)));
      set((s) => ({ incomes: s.incomes.filter((i) => i.id !== optimisticIncome.id) }));
    }
  },
  updateIncome: async (id, item) => {
    const state = get();
    const desc = "Ingreso" + (item.source ? ` - ${item.source}` : '');
    const resolvedOwner = item.userId || state.user?.uid || "unknown";
    // Optimistic update
    const previousIncomes = [...state.incomes];
    set((s) => ({
      incomes: s.incomes.map((i) => i.id === id ? { ...i, ...item, description: desc, type: desc, userId: resolvedOwner, ownerUid: resolvedOwner } : i)
    }));

    try {
      useToastStore.getState().addToast("Actualizando ingreso...", "info");

      // Note: unused houseId removed to pass linter
      const incomeAccount = state.accounts?.find((a: any) => a.type === 'INCOME');
      const assetAccount = item.accountId ? state.accounts?.find((a: any) => a.id === item.accountId) : state.accounts?.find((a: any) => a.type === 'ASSET' || a.type === 'BANK_ACCOUNT');

      if (!incomeAccount || !assetAccount) {
        throw new Error("Cuentas contables no encontradas.");
      }

      const houseId = state.houseId || "00000000-0000-0000-0000-000000000000";
      await updateJournalWithEntries({
        journalId: id,
        householdId: houseId,
        date: new Date(item.date).toISOString(),
        description: desc,
        amount: item.amount,
        debitAccountId: assetAccount.id,
        creditAccountId: incomeAccount.id,
        prorataFactor: 1.0,
        ownerUid: resolvedOwner,
        isShared: !item.isPrivate,
        incomeCategoryType: item.incomeCategoryType,
        categoryId: item.categoryId || null
      });
      useToastStore.getState().addToast("Ingreso actualizado correctamente", "success");
      const currentHouseId = get().houseId;
      if (currentHouseId) await get().fetchDashboardData(currentHouseId);
    } catch (error: any) {
      console.error(error);
      const errorMsg = error?.message || error?.toString() || JSON.stringify(error);
      useToastStore.getState().addToast("Error al actualizar el ingreso: " + errorMsg, "error");
      set({ incomes: previousIncomes });
    }
  },
  deleteIncome: async (id) => {
    const state = get();
    // Optimistic delete
    const previousIncomes = [...state.incomes];
    set((s) => ({ incomes: s.incomes.filter(i => i.id !== id) }));
    
    try {
      if (!id.startsWith('temp-')) {
        const houseId = state.houseId || "00000000-0000-0000-0000-000000000000";
        await deleteJournal({ journalId: id, householdId: houseId });
        await get().refreshIncomes();
        useToastStore.getState().addToast("Ingreso eliminado correctamente", "success");
        const currentHouseId = get().houseId;
        if (currentHouseId) await get().fetchDashboardData(currentHouseId);
      }
    } catch(error) {
      console.error(error);
      useToastStore.getState().addToast("Error al eliminar el ingreso", "error");
      set({ incomes: previousIncomes });
    }
  }
});
