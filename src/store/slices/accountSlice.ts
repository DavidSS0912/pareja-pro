import { StateCreator } from 'zustand';
import { RecordItem } from '../types';
import { AuthSlice } from './authSlice';
import { createAccount, updateAccount, deleteAccount, archiveAccount, createJournalWithEntries, OwnerType } from '../../lib/dataconnect';
import { useToastStore } from '../useToastStore';

export interface AccountSlice {
  accounts: any[];
  setAccounts: (items: any[]) => void;
  addAccount: (item: any) => Promise<void>;
  updateAccount: (id: string, item: any) => Promise<void>;
  deleteAccount: (id: string) => Promise<void>;
  archiveAccount: (id: string, isArchived: boolean) => Promise<void>;
  payCreditCard: (sourceAccountId: string, targetAccountId: string, amount: number, date: string, ownerUid: string, isShared: boolean) => Promise<void>;
}

export const createAccountSlice: StateCreator<AccountSlice & AuthSlice, [], [], AccountSlice> = (set, get) => ({
  accounts: [],
  setAccounts: (items) => set({ accounts: items }),
  addAccount: async (item) => {
    const houseId = (get() as any).houseId;
    if (!houseId) return;
    
    const state = get();
    const isUserA = !(state as any).users || (state as any).users.length === 0 || (state as any).users[0].id === state.user?.uid;
    const optimisticOwnerType = item.shared ? OwnerType.SHARED : (isUserA ? OwnerType.USER_A : OwnerType.USER_B);
    const optimisticAccount = { ...item, ownerType: optimisticOwnerType, id: `temp-${Date.now()}` };
    set({ accounts: [optimisticAccount, ...state.accounts] });

    try {
      await createAccount({
        householdId: houseId,
        name: item.name,
        type: item.type,
        ownerType: optimisticOwnerType,
        cutDay: item.cutDay,
        paymentDay: item.paymentDay,
        creditLimit: item.creditLimit,
        color: item.color || 'bg-slate-800'
      });
      await (get() as any).fetchDashboardData?.(houseId);
    } catch (e) {
      console.error(e);
      set((s) => ({ accounts: s.accounts.filter((a) => a.id !== optimisticAccount.id) }));
      useToastStore.getState().addToast("Error al crear la cuenta", "error");
    }
  },
  updateAccount: async (id, item) => {
    if (id.startsWith('temp-')) {
      // useToastStore not imported here but we can just return
      return;
    }
    const state = get();
    const originalAccounts = state.accounts;
    const isUserA = !(state as any).users || (state as any).users.length === 0 || (state as any).users[0].id === state.user?.uid;
    const updatedOwnerType = item.shared ? OwnerType.SHARED : (isUserA ? OwnerType.USER_A : OwnerType.USER_B);
    
    const updatedAccounts = state.accounts.map(a => a.id === id ? { 
      ...a, 
      ...item,
      ownerType: updatedOwnerType
    } : a);
    set({ accounts: updatedAccounts });

    const houseId = (get() as any).houseId;
    if (!houseId) return;

    try {
      await updateAccount({
        accountId: id,
        householdId: houseId,
        name: item.name,
        ownerType: updatedOwnerType,
        cutDay: item.cutDay,
        paymentDay: item.paymentDay,
        creditLimit: item.creditLimit,
        color: item.color || 'bg-slate-800'
      });
      await (get() as any).fetchDashboardData?.(houseId);
    } catch (e) {
      console.error(e);
      set({ accounts: originalAccounts });
    }
  },
  archiveAccount: async (id, isArchived) => {
    const houseId = (get() as any).houseId;
    if (!houseId) return;
    try {
      await archiveAccount({ accountId: id, householdId: houseId, isArchived });
      await (get() as any).fetchDashboardData?.(houseId);
    } catch (e) {
      console.error(e);
    }
  },
  deleteAccount: async (id) => {
    if (id.startsWith('temp-')) return;
    const state = get();
    const houseId = (state as any).houseId;
    if (!houseId) return;
    const originalAccounts = state.accounts;
    
    set({ accounts: state.accounts.filter((a) => a.id !== id) });

    try {
      await deleteAccount({ accountId: id, householdId: houseId });
      await (get() as any).fetchDashboardData?.(houseId);
    } catch (e) {
      console.error(e);
      set({ accounts: originalAccounts });
    }
  },
  payCreditCard: async (sourceAccountId, targetAccountId, amount, date, ownerUid, isShared) => {
    const houseId = (get() as any).houseId;
    if (!houseId) return;
    try {
      await createJournalWithEntries({
        householdId: houseId,
        date: new Date(date).toISOString(),
        description: "Pago de Tarjeta",
        amount: amount,
        debitAccountId: targetAccountId,
        creditAccountId: sourceAccountId,
        prorataFactor: 1.0,
        ownerUid: ownerUid,
        isShared: isShared,
        isInternalTransfer: true
      });
      await (get() as any).fetchDashboardData?.(houseId);
    } catch (e) {
      console.error(e);
      throw e;
    }
  }
});
