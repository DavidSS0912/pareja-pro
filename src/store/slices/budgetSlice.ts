import { StateCreator } from 'zustand';
import { RecordItem } from '../types';
import { AuthSlice } from './authSlice';
import { QueryFetchPolicy } from 'firebase/data-connect';
import { createBudget, updateBudget, deleteBudget as deleteBudgetMutation, OwnerType } from '../../lib/dataconnect';
import { DataSlice } from './dataSlice';
import { useToastStore } from '../useToastStore';

export interface BudgetSlice {
  budgets: RecordItem[];
  setBudgets: (items: RecordItem[]) => void;
  addBudget: (item: any) => Promise<void>;
  updateBudget: (id: string, item: any) => Promise<void>;
  deleteBudget: (id: string) => Promise<void>;
  copyBudgetsFromPreviousMonth: (currentPeriod: string) => Promise<void>;
}

export const createBudgetSlice: StateCreator<BudgetSlice & AuthSlice & DataSlice, [], [], BudgetSlice> = (set, get) => ({
  budgets: [],
  setBudgets: (items) => set({ budgets: items }),
  addBudget: async (item) => {
    const state = get();
    const houseId = state.houseId || "00000000-0000-0000-0000-000000000000";
    
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

    const optimisticOwnerType = (item.shared || item.type === 'SHARED' || item.ownerType === 'SHARED') 
      ? OwnerType.SHARED 
      : (item.ownerType || userSlot);

    const optimisticBudget = { 
      ...item, 
      ownerType: optimisticOwnerType,
      icon: item.icon || '🛒',
      splitType: item.splitType || 'PROPORTIONAL',
      customUserId: item.customUserId || null,
      customUserAmount: item.customUserAmount || null,
      id: `temp-${Date.now()}` 
    };
    set({ budgets: [optimisticBudget, ...state.budgets] });
    
    try {
      await createBudget({
        householdId: houseId,
        categoryId: item.categoryId,
        period: item.period,
        assignedAmount: item.base || 0,
        ownerType: optimisticOwnerType,
        icon: item.icon || '🛒',
        splitType: item.splitType || null,
        customUserId: item.customUserId || null,
        customUserAmount: item.customUserAmount !== undefined && item.customUserAmount !== null ? Number(item.customUserAmount) : null
      });
      useToastStore.getState().addToast("Presupuesto agregado", "success");
      await get().fetchBudgetsForMonth(item.period);
    } catch(error) {
      console.error(error);
      useToastStore.getState().addToast("Error al agregar presupuesto", "error");
      set((s) => ({ budgets: s.budgets.filter((b) => b.id !== optimisticBudget.id) }));
    }
  },
  updateBudget: async (id, item) => {
    if (id.startsWith('temp-')) {
      useToastStore.getState().addToast("Espera a que se guarde para editarlo", "warning");
      return;
    }
    const state = get();
    const houseId = state.houseId;
    if (!houseId) return;
    const originalBudgets = state.budgets;
    
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

    const updatedOwnerType = (item.shared || item.type === 'SHARED' || item.ownerType === 'SHARED')
      ? OwnerType.SHARED
      : (item.ownerType || userSlot);

    // Optimistic update
    const updatedBudgets = state.budgets.map(b => b.id === id ? { 
      ...b, 
      ...item, 
      category: item.category?.name || item.category || b.category, 
      base: item.base !== undefined ? item.base : (item.assignedAmount !== undefined ? item.assignedAmount : b.base),
      ownerType: updatedOwnerType,
      icon: item.icon || b.icon || '🛒',
      splitType: item.splitType !== undefined ? item.splitType : b.splitType,
      customUserId: item.customUserId !== undefined ? item.customUserId : b.customUserId,
      customUserAmount: item.customUserAmount !== undefined ? item.customUserAmount : b.customUserAmount
    } : b);
    set({ budgets: updatedBudgets });

    try {
      await updateBudget({
        id: id,
        householdId: houseId,
        assignedAmount: item.base !== undefined ? item.base : (item.assignedAmount || 0),
        icon: item.icon !== undefined ? item.icon : undefined,
        splitType: item.splitType !== undefined ? item.splitType : undefined,
        customUserId: item.customUserId !== undefined ? item.customUserId : undefined,
        customUserAmount: item.customUserAmount !== undefined && item.customUserAmount !== null ? Number(item.customUserAmount) : undefined
      });
      useToastStore.getState().addToast("Presupuesto actualizado", "success");
      const targetPeriod = item.period || updatedBudgets.find(b => b.id === id)?.period;
      if (targetPeriod) await get().fetchBudgetsForMonth(targetPeriod);
    } catch(error) {
      console.error(error);
      useToastStore.getState().addToast("Error al actualizar presupuesto", "error");
      set({ budgets: originalBudgets });
    }
  },
  deleteBudget: async (id) => {
    if (id.startsWith('temp-')) {
      useToastStore.getState().addToast("Espera a que se guarde para eliminarlo", "warning");
      return;
    }
    const state = get();
    const houseId = state.houseId;
    if (!houseId) return;
    const originalBudgets = state.budgets;
    const budgetToDelete = state.budgets.find((b) => b.id === id);
    // Actualización optimista
    set({ budgets: state.budgets.filter((b) => b.id !== id) });

    try {
      await deleteBudgetMutation({ id: id, householdId: houseId });
      useToastStore.getState().addToast("Presupuesto eliminado", "success");
      if (budgetToDelete?.period) await get().fetchBudgetsForMonth(budgetToDelete.period);
    } catch(error) {
      console.error(error);
      useToastStore.getState().addToast("Error al eliminar presupuesto", "error");
      // Rollback en caso de error
      set({ budgets: originalBudgets });
    }
  },
  copyBudgetsFromPreviousMonth: async (currentPeriod: string) => {
    const state = get();
    const houseId = state.houseId;
    if (!houseId) return;

    try {
      // Calculate previous month
      const [year, month] = currentPeriod.split('-');
      const d = new Date(parseInt(year), parseInt(month) - 1, 1);
      d.setMonth(d.getMonth() - 1);
      const prevPeriod = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;

      const { getBudgetsByMonth } = await import('../../lib/dataconnect');
      const prevBudgetsRes = await getBudgetsByMonth(
        { householdId: houseId, period: prevPeriod },
        { fetchPolicy: QueryFetchPolicy.SERVER_ONLY }
      );
      const prevBudgets = prevBudgetsRes.data?.budgets || [];
      
      if (prevBudgets.length === 0) {
        useToastStore.getState().addToast("No hay presupuestos en el mes anterior", "warning");
        return;
      }

      // get current budgets to avoid duplicates
      const currentBudgets = get().budgets;
      
      let copied = 0;
      for (const pb of prevBudgets) {
        if (!currentBudgets.find((cb) => (cb.categoryId || cb.category?.id) === pb.category?.id && cb.ownerType === pb.ownerType)) {
          await createBudget({
            householdId: houseId,
            categoryId: pb.category.id,
            period: currentPeriod,
            assignedAmount: pb.assignedAmount,
            ownerType: pb.ownerType,
            icon: pb.icon || '🛒',
            splitType: pb.splitType || null,
            customUserId: pb.customUserId || null,
            customUserAmount: pb.customUserAmount || null
          });
          copied++;
        }
      }
      
      useToastStore.getState().addToast(copied > 0 ? `Se copiaron ${copied} presupuestos` : "Todos los presupuestos ya existen en este mes", "success");
      await get().fetchBudgetsForMonth(currentPeriod);
    } catch(error) {
      console.error(error);
      useToastStore.getState().addToast("Error al copiar presupuestos", "error");
    }
  }
});
