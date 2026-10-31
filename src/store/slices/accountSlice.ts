import { StateCreator } from 'zustand';
import { RecordItem } from '../types';
import { AuthSlice } from './authSlice';
import { createAccount, updateAccount, deleteAccount, archiveAccount, createJournalWithEntries, createInternalTransfer, updateInternalTransfer, seedDefaultAccounts, OwnerType } from '../../lib/dataconnect';
import { useToastStore } from '../useToastStore';

export interface AccountSlice {
  accounts: any[];
  setAccounts: (items: any[]) => void;
  addAccount: (item: any) => Promise<void>;
  updateAccount: (id: string, item: any) => Promise<void>;
  deleteAccount: (id: string) => Promise<void>;
  archiveAccount: (id: string, isArchived: boolean) => Promise<void>;
  payCreditCard: (sourceAccountId: string, targetAccountId: string, amount: number, date: string, ownerUid?: string, isShared?: boolean) => Promise<void>;
  createTransfer: (
    sourceAccountId: string,
    targetAccountId: string,
    amount: number,
    date: string,
    ownerUid: string,
    isShared: boolean,
    description?: string,
    sourceOwnerUid?: string,
    targetOwnerUid?: string
  ) => Promise<void>;
  updateTransfer: (
    journalId: string,
    sourceAccountId: string,
    targetAccountId: string,
    amount: number,
    date: string,
    ownerUid: string,
    isShared: boolean,
    description?: string,
    sourceOwnerUid?: string,
    targetOwnerUid?: string
  ) => Promise<void>;
}

export const createAccountSlice: StateCreator<AccountSlice & AuthSlice, [], [], AccountSlice> = (set, get) => ({
  accounts: [],
  setAccounts: (items) => set({ accounts: items }),
  addAccount: async (item) => {
    const houseId = (get() as any).houseId;
    if (!houseId) return;
    
    const state = get();
    let userSlot: OwnerType = OwnerType.USER_A;
    const explicitSlot = (state as any).memberSlot || state.user?.memberSlot;
    if (explicitSlot === 'USER_B') {
      userSlot = OwnerType.USER_B;
    } else if (explicitSlot === 'USER_A') {
      userSlot = OwnerType.USER_A;
    } else {
      const currentMember = (state as any).users?.find((u: any) => u.id === state.user?.uid);
      if (currentMember?.memberSlot === 'USER_B') {
        userSlot = OwnerType.USER_B;
      }
    }

    const optimisticOwnerType = item.shared ? OwnerType.SHARED : (item.ownerType || userSlot);
    const initialBalanceNum = Math.round((Number(item.initialBalance) || 0) * 100) / 100;
    const optimisticAccount = {
      ...item,
      balance: initialBalanceNum,
      ownerType: optimisticOwnerType,
      id: `temp-${Date.now()}`
    };
    set({ accounts: [optimisticAccount, ...state.accounts] });

    try {
      const createRes = await createAccount({
        householdId: houseId,
        name: item.name,
        type: item.type,
        ownerType: optimisticOwnerType,
        cutDay: item.cutDay,
        paymentDay: item.paymentDay,
        creditLimit: item.creditLimit,
        color: item.color || 'bg-slate-800'
      });

      const createdAccountId = (createRes as any)?.data?.account_insert?.id;

      if (createdAccountId && initialBalanceNum > 0) {
        let incomeAccount = state.accounts?.find((a: any) => a.type === 'INCOME');
        let expenseAccount = state.accounts?.find((a: any) => a.type === 'EXPENSE');

        if (!incomeAccount || !expenseAccount) {
          try {
            const seedRes = await seedDefaultAccounts({ householdId: houseId });
            incomeAccount = (seedRes as any)?.data?.incomeAccount;
            expenseAccount = (seedRes as any)?.data?.expenseAccount;
            if (!incomeAccount || !expenseAccount) {
              await (get() as any).fetchDashboardData?.(houseId);
              const refreshedState = get();
              incomeAccount = incomeAccount || refreshedState.accounts?.find((a: any) => a.type === 'INCOME');
              expenseAccount = expenseAccount || refreshedState.accounts?.find((a: any) => a.type === 'EXPENSE');
            }
          } catch (seedErr) {
            console.warn("seedDefaultAccounts al crear cuenta:", seedErr);
          }
        }

        const isLiability = item.type === 'LIABILITY' || item.type === 'CREDIT_CARD';
        // Para ASSET (naturaleza deudora): DEBIT suma saldo al activo, CREDIT a contrapartida (INCOME/Capital)
        // Para LIABILITY (naturaleza acreedora): CREDIT suma saldo/deuda a la tarjeta, DEBIT a EXPENSE
        const debitAccountId = isLiability ? (expenseAccount?.id || incomeAccount?.id) : createdAccountId;
        const creditAccountId = isLiability ? createdAccountId : (incomeAccount?.id || expenseAccount?.id);

        const userA = (state as any).users?.find((u: any) => u.memberSlot === 'USER_A');
        const userB = (state as any).users?.find((u: any) => u.memberSlot === 'USER_B');
        let ownerUid = state.user?.uid || "unknown";
        if (optimisticOwnerType === OwnerType.USER_B && (userB?.id || userB?.uid)) {
          ownerUid = userB.id || userB.uid;
        } else if (optimisticOwnerType === OwnerType.USER_A && (userA?.id || userA?.uid)) {
          ownerUid = userA.id || userA.uid;
        }

        if (debitAccountId && creditAccountId && debitAccountId !== creditAccountId) {
          await createJournalWithEntries({
            householdId: houseId,
            date: new Date().toISOString(),
            description: "Saldo inicial",
            amount: initialBalanceNum,
            debitAccountId,
            creditAccountId,
            prorataFactor: 1.0,
            ownerUid,
            isShared: optimisticOwnerType === OwnerType.SHARED,
          });
        }
      }

      await (get() as any).fetchDashboardData?.(houseId);
    } catch (e) {
      console.error(e);
      set((s) => ({ accounts: s.accounts.filter((a) => a.id !== optimisticAccount.id) }));
      useToastStore.getState().addToast("Error al crear la cuenta", "error");
    }
  },
  updateAccount: async (id, item) => {
    if (id.startsWith('temp-')) {
      return;
    }
    const state = get();
    const originalAccounts = state.accounts;
    let userSlot: OwnerType = OwnerType.USER_A;
    const explicitSlot = (state as any).memberSlot || state.user?.memberSlot;
    if (explicitSlot === 'USER_B') {
      userSlot = OwnerType.USER_B;
    } else if (explicitSlot === 'USER_A') {
      userSlot = OwnerType.USER_A;
    } else {
      const currentMember = (state as any).users?.find((u: any) => u.id === state.user?.uid);
      if (currentMember?.memberSlot === 'USER_B') {
        userSlot = OwnerType.USER_B;
      }
    }

    const updatedOwnerType = item.shared ? OwnerType.SHARED : (item.ownerType || userSlot);
    
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
    const state = get();
    const houseId = (state as any).houseId;
    if (!houseId) return;
    const resolvedOwnerUid = ownerUid || state.user?.uid || "unknown";
    const resolvedIsShared = isShared !== undefined ? isShared : true;
    try {
      await createJournalWithEntries({
        householdId: houseId,
        date: new Date(date).toISOString(),
        description: "Pago de Tarjeta",
        amount: amount,
        debitAccountId: targetAccountId,
        creditAccountId: sourceAccountId,
        prorataFactor: 1.0,
        ownerUid: resolvedOwnerUid,
        isShared: resolvedIsShared,
        isInternalTransfer: true
      });
      await (get() as any).fetchDashboardData?.(houseId);
    } catch (e) {
      console.error(e);
      throw e;
    }
  },
  createTransfer: async (
    sourceAccountId,
    targetAccountId,
    amount,
    date,
    ownerUid,
    isShared,
    description,
    sourceOwnerUid,
    targetOwnerUid
  ) => {
    const houseId = (get() as any).houseId;
    if (!houseId) return;
    const resolvedDescription = description?.trim() || "Transferencia entre cuentas";

    const state = get() as any;
    const accounts = state.accounts || [];
    const users = state.users || [];
    const userA = users.find((u: any) => u.memberSlot === 'USER_A');
    const userB = users.find((u: any) => u.memberSlot === 'USER_B');

    let resolvedSourceOwnerUid = sourceOwnerUid;
    let resolvedTargetOwnerUid = targetOwnerUid;

    if (!resolvedSourceOwnerUid) {
      const srcAcc = accounts.find((a: any) => a.id === sourceAccountId);
      if (srcAcc?.ownerType === 'USER_A') {
        resolvedSourceOwnerUid = userA?.id || userA?.uid || ownerUid;
      } else if (srcAcc?.ownerType === 'USER_B') {
        resolvedSourceOwnerUid = userB?.id || userB?.uid || ownerUid;
      } else {
        resolvedSourceOwnerUid = ownerUid;
      }
    }

    if (!resolvedTargetOwnerUid) {
      const tgtAcc = accounts.find((a: any) => a.id === targetAccountId);
      if (tgtAcc?.ownerType === 'USER_A') {
        resolvedTargetOwnerUid = userA?.id || userA?.uid || ownerUid;
      } else if (tgtAcc?.ownerType === 'USER_B') {
        resolvedTargetOwnerUid = userB?.id || userB?.uid || ownerUid;
      } else {
        resolvedTargetOwnerUid = ownerUid;
      }
    }

    try {
      await createInternalTransfer({
        householdId: houseId,
        date: new Date(date).toISOString(),
        description: resolvedDescription,
        amount: amount,
        sourceAccountId: sourceAccountId,
        targetAccountId: targetAccountId,
        sourceOwnerUid: resolvedSourceOwnerUid,
        targetOwnerUid: resolvedTargetOwnerUid,
        isShared: isShared
      });
      await (get() as any).fetchDashboardData?.(houseId);
    } catch (e) {
      console.error(e);
      throw e;
    }
  },
  updateTransfer: async (
    journalId,
    sourceAccountId,
    targetAccountId,
    amount,
    date,
    ownerUid,
    isShared,
    description,
    sourceOwnerUid,
    targetOwnerUid
  ) => {
    const houseId = (get() as any).houseId;
    if (!houseId) return;
    const resolvedDescription = description?.trim() || "Transferencia entre cuentas";

    const state = get() as any;
    const accounts = state.accounts || [];
    const users = state.users || [];
    const userA = users.find((u: any) => u.memberSlot === 'USER_A');
    const userB = users.find((u: any) => u.memberSlot === 'USER_B');

    let resolvedSourceOwnerUid = sourceOwnerUid;
    let resolvedTargetOwnerUid = targetOwnerUid;

    const srcAcc = accounts.find((a: any) => a.id === sourceAccountId);
    const tgtAcc = accounts.find((a: any) => a.id === targetAccountId);

    if (!resolvedSourceOwnerUid) {
      if (srcAcc?.ownerType === 'USER_A') {
        resolvedSourceOwnerUid = userA?.id || userA?.uid || ownerUid;
      } else if (srcAcc?.ownerType === 'USER_B') {
        resolvedSourceOwnerUid = userB?.id || userB?.uid || ownerUid;
      } else {
        resolvedSourceOwnerUid = ownerUid;
      }
    }

    if (!resolvedTargetOwnerUid) {
      if (tgtAcc?.ownerType === 'USER_A') {
        resolvedTargetOwnerUid = userA?.id || userA?.uid || ownerUid;
      } else if (tgtAcc?.ownerType === 'USER_B') {
        resolvedTargetOwnerUid = userB?.id || userB?.uid || ownerUid;
      } else {
        resolvedTargetOwnerUid = ownerUid;
      }
    }

    // Actualización optimista de transfers en memoria
    const originalTransfers = state.transfers || [];
    if (typeof state.setTransfers === 'function') {
      const isTargetLiability = tgtAcc?.type === 'LIABILITY' || tgtAcc?.type === 'CREDIT_CARD';
      const updatedTransfers = originalTransfers.map((t: any) => {
        if (t.id === journalId) {
          return {
            ...t,
            date,
            amount,
            description: resolvedDescription,
            sourceAccountId,
            sourceAccountName: srcAcc?.name || t.sourceAccountName || '',
            sourceOwnerType: srcAcc?.ownerType || t.sourceOwnerType,
            sourceOwnerUid: resolvedSourceOwnerUid,
            targetAccountId,
            targetAccountName: tgtAcc?.name || t.targetAccountName || '',
            targetOwnerType: tgtAcc?.ownerType || t.targetOwnerType,
            targetOwnerUid: resolvedTargetOwnerUid,
            senderUid: resolvedSourceOwnerUid,
            receiverUid: resolvedTargetOwnerUid,
            transferKind: isTargetLiability
              ? 'CARD_PAYMENT'
              : (srcAcc?.ownerType && tgtAcc?.ownerType && srcAcc.ownerType !== 'SHARED' && tgtAcc.ownerType !== 'SHARED' && srcAcc.ownerType !== tgtAcc.ownerType) || (resolvedSourceOwnerUid !== resolvedTargetOwnerUid)
                ? 'CROSS_USERS'
                : 'SAME_USER',
            type: isTargetLiability ? 'CARD_PAYMENT' : 'TRANSFER',
            isShared: isShared,
            isPrivate: !isShared,
            ownerUid: resolvedSourceOwnerUid,
            userId: resolvedSourceOwnerUid,
          };
        }
        return t;
      });
      state.setTransfers(updatedTransfers);
    }

    try {
      await updateInternalTransfer({
        journalId,
        householdId: houseId,
        date: new Date(date).toISOString(),
        description: resolvedDescription,
        amount: amount,
        sourceAccountId: sourceAccountId,
        targetAccountId: targetAccountId,
        sourceOwnerUid: resolvedSourceOwnerUid,
        targetOwnerUid: resolvedTargetOwnerUid,
        isShared: isShared
      });
      await (get() as any).fetchDashboardData?.(houseId);
    } catch (e) {
      console.error(e);
      if (typeof state.setTransfers === 'function') {
        state.setTransfers(originalTransfers);
      }
      throw e;
    }
  }
});
