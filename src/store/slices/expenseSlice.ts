import { StateCreator } from 'zustand';
import { RecordItem } from '../types';
import { AuthSlice } from './authSlice';
import { DataSlice } from './dataSlice';
import { AccountSlice } from './accountSlice';
import { createSharedExpenseWithProration, deleteJournal } from '../../lib/dataconnect';
import { useToastStore } from '../useToastStore';

export interface ExpenseSlice {
  expenses: RecordItem[];
  setExpenses: (items: RecordItem[]) => void;
  addExpense: (item: any) => Promise<void>;
  updateExpense: (id: string, item: any) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
}

export const createExpenseSlice: StateCreator<ExpenseSlice & AuthSlice & DataSlice & AccountSlice, [], [], ExpenseSlice> = (set, get) => ({
  expenses: [],
  setExpenses: (items) => set({ expenses: items }),
  addExpense: async (item) => {
    const state = get();
    const houseId = state.houseId || "00000000-0000-0000-0000-000000000000";

    const expenseAccounts = state.accounts?.filter((a: any) => a.type === 'EXPENSE') || [];
    const assetAccounts = state.accounts?.filter((a: any) => a.type === 'ASSET' || a.type === 'BANK_ACCOUNT' || a.type === 'LIABILITY') || [];

    if (expenseAccounts.length === 0 || assetAccounts.length === 0) {
      useToastStore.getState().addToast("No se encontraron cuentas de EXPENSE o ASSET.", "error");
      return;
    }

    const payerAccountId = item.sourceAccountId || assetAccounts[0].id;
    const user1ExpenseAccountId = expenseAccounts[0].id;
    const user2ExpenseAccountId = expenseAccounts.length > 1 ? expenseAccounts[1].id : expenseAccounts[0].id;

    // Lógica para MSI
    const isMsi = item.isMsi;
    const msiCount = isMsi && item.msiCount && item.msiCount > 0 ? item.msiCount : 1;
    const amountPerMonth = item.amount / msiCount;

    const totalCents = Math.round(amountPerMonth * 100);
    let user1Cents = totalCents;
    
    if (item.splitType === '50/50' || item.splitType === 'proporcional') {
      user1Cents = Math.round(totalCents / 2);
    }
    
    const baseUser1Amount = user1Cents / 100;
    const baseUser2Amount = (totalCents - user1Cents) / 100;

    const optimisticExpenses = [];
    const msiRefId = isMsi ? Date.now().toString() : null;
    
    for (let i = 0; i < msiCount; i++) {
      let expenseDate = new Date(item.date);
      if (i > 0) {
        expenseDate.setMonth(expenseDate.getMonth() + i);
      }
      optimisticExpenses.push({
        ...item,
        id: `temp-${Date.now()}-${i}`,
        amount: amountPerMonth,
        date: expenseDate.toISOString(),
        isMsi,
        msiRefId,
        msiMonthNumber: i + 1,
      });
    }

    set({ expenses: [...optimisticExpenses, ...state.expenses] });

    try {
      useToastStore.getState().addToast("Agregando gasto...", "info");
      const { createSharedExpenseWithProration, addTagToJournal } = await import('../../lib/dataconnect');

      for (let i = 0; i < msiCount; i++) {
        let expenseDate = new Date(item.date);
        if (i > 0) {
          expenseDate.setMonth(expenseDate.getMonth() + i);
        }

        const response = await createSharedExpenseWithProration({
          householdId: houseId,
          date: expenseDate.toISOString(),
          description: item.desc || item.category || 'Gasto',
          totalAmount: amountPerMonth,
          prorataFactor: 1.0,
          payerAccountId: payerAccountId,
          user1ExpenseAccountId: user1ExpenseAccountId,
          user2ExpenseAccountId: user2ExpenseAccountId,
          user1Amount: baseUser1Amount,
          user2Amount: baseUser2Amount,
          ownerUid: item.paidBy || item.userId || state.user?.uid || "unknown",
          isShared: !item.isPrivate,
          isMsi: isMsi,
          msiRefId: msiRefId,
          msiMonthNumber: isMsi ? i + 1 : null,
          isRecurring: item.isRecurring || false,
          recurringFrequency: item.recurringFrequency || null,
          recurringEndDate: item.recurringEndDate ? new Date(item.recurringEndDate).toISOString() : null,
          categoryId: item.categoryId || null
        });

        const realId = response.data?.journal_insert?.id;
        
        if (realId) {
          const tempId = optimisticExpenses[i].id;
          set((s) => ({
            expenses: s.expenses.map((e) => e.id === tempId ? { ...e, id: realId } : e)
          }));
          
          if (item.tags && item.tags.length > 0) {
            for (const tagId of item.tags) {
              try {
                await addTagToJournal({ journalId: realId, tagId });
              } catch (tagErr) {
                console.error("Error al asignar tag", tagErr);
              }
            }
          }
        }
      }

      useToastStore.getState().addToast("Gasto(s) agregado(s) correctamente", "success");
    } catch (error: any) {
      console.error(error);
      useToastStore.getState().addToast(`Error: ${error.message || 'Desconocido'}`, "error");
      alert("Error al agregar gasto: " + (error.message || JSON.stringify(error)));
      set((s) => ({ expenses: s.expenses.filter((e) => !e.id.startsWith('temp-')) }));
    }
  },
  updateExpense: async (id, item) => {
    const state = get();
    
    const expenseAccounts = state.accounts?.filter((a: any) => a.type === 'EXPENSE') || [];
    const assetAccounts = state.accounts?.filter((a: any) => a.type === 'ASSET' || a.type === 'BANK_ACCOUNT' || a.type === 'LIABILITY') || [];

    if (expenseAccounts.length === 0 || assetAccounts.length === 0) {
      useToastStore.getState().addToast("No se encontraron cuentas de EXPENSE o ASSET/BANK_ACCOUNT.", "error");
      return;
    }

    const payerAccountId = item.sourceAccountId || assetAccounts[0].id;
    const user1ExpenseAccountId = expenseAccounts[0].id;
    const user2ExpenseAccountId = expenseAccounts.length > 1 ? expenseAccounts[1].id : expenseAccounts[0].id;

    const houseId = state.houseId || "00000000-0000-0000-0000-000000000000";
    const totalCents = Math.round(item.amount * 100);
    let user1Cents = totalCents;
    
    if (item.splitType === '50/50' || item.splitType === 'proporcional') {
      user1Cents = Math.round(totalCents / 2);
    }
    
    const user1Amount = user1Cents / 100;
    const user2Amount = (totalCents - user1Cents) / 100;

    // Optimistic update
    const previousExpenses = [...state.expenses];
    set((s) => ({
      expenses: s.expenses.map((e) => e.id === id ? { ...e, ...item } : e)
    }));

    try {
      useToastStore.getState().addToast("Actualizando gasto...", "info");
      
      const { updateSharedExpenseWithProration, setJournalTags, addTagToJournal } = await import('../../lib/dataconnect');
      
      await updateSharedExpenseWithProration({
        journalId: id,
        householdId: houseId,
        date: new Date(item.date).toISOString(),
        description: item.desc || item.category || 'Gasto',
        totalAmount: item.amount,
        prorataFactor: 1.0,
        payerAccountId: payerAccountId,
        user1ExpenseAccountId: user1ExpenseAccountId,
        user2ExpenseAccountId: user2ExpenseAccountId,
        user1Amount: user1Amount,
        user2Amount: user2Amount,
        ownerUid: item.paidBy || item.userId || state.user?.uid || "unknown",
        isShared: !item.isPrivate,
        isRecurring: item.isRecurring || false,
        recurringFrequency: item.recurringFrequency || null,
        recurringEndDate: item.recurringEndDate ? new Date(item.recurringEndDate).toISOString() : null,
        categoryId: item.categoryId || null
      });

      if (item.tags !== undefined) {
        // Eliminar existentes
        await setJournalTags({ journalId: id, tagIds: [] });
        // Agregar nuevos
        for (const tagId of item.tags) {
           await addTagToJournal({ journalId: id, tagId });
        }
      }

      useToastStore.getState().addToast("Gasto actualizado correctamente", "success");
      
    } catch (error: any) {
      console.error(error);
      const errorMsg = error?.message || error?.toString() || JSON.stringify(error);
      useToastStore.getState().addToast("Hubo un error al actualizar el gasto: " + errorMsg, "error");
      set({ expenses: previousExpenses });
    }
  },
  deleteExpense: async (id) => {
    const state = get();
    // Optimistic delete
    const previousExpenses = [...state.expenses];
    set((s) => ({ expenses: s.expenses.filter(e => e.id !== id) }));
    
    try {
      if (!id.startsWith('temp-')) {
        const houseId = state.houseId || "00000000-0000-0000-0000-000000000000";
        await deleteJournal({ journalId: id, householdId: houseId });
        await get().refreshExpenses();
        useToastStore.getState().addToast("Gasto eliminado correctamente", "success");
        }
    } catch(error) {
      console.error(error);
      useToastStore.getState().addToast("Error al eliminar el gasto", "error");
      set({ expenses: previousExpenses });
    }
  }
});
