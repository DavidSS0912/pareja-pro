import { StateCreator } from 'zustand';
import { RecordItem } from '../types';
import { AuthSlice } from './authSlice';
import { DataSlice } from './dataSlice';
import { createSavingsProject, updateProjectProgress, updateSavingsProject } from '../../lib/dataconnect';
import { useToastStore } from '../useToastStore';

export interface ProjectSlice {
  projects: RecordItem[];
  setProjects: (items: RecordItem[]) => void;
  addProject: (item: any) => Promise<void>;
  updateProject: (id: string, item: any) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  contributions: RecordItem[];
  setContributions: (items: RecordItem[]) => void;
  addContribution: (item: any) => Promise<void>;
  addContributionAndUpdateProject: (c: any, p: any) => Promise<void>;
  updateContribution: (id: string, item: any) => Promise<void>;
  deleteContribution: (id: string) => Promise<void>;
}

export const createProjectSlice: StateCreator<ProjectSlice & AuthSlice & DataSlice, [], [], ProjectSlice> = (set, get) => ({
  projects: [],
  setProjects: (items) => set({ projects: items }),
  addProject: async (item) => {
    const state = get();
    const houseId = state.houseId || "00000000-0000-0000-0000-000000000000";
    
    const optimisticProject = { ...item, id: `temp-${Date.now()}` };
    set({ projects: [optimisticProject, ...state.projects] });
    
    try {
      await createSavingsProject({
        householdId: houseId,
        name: item.name,
        targetAmount: item.targetAmount || 0,
        priority: item.priority || 1,
        monthlyQuota: item.monthlyQuota,
        targetAccount: item.targetAccount
      });
      useToastStore.getState().addToast("Proyecto agregado exitosamente", "success");
      if (state.houseId) await state.fetchDashboardData(state.houseId);
    } catch(error) {
      console.error(error);
      useToastStore.getState().addToast("Error al agregar el proyecto", "error");
      set((s) => ({ projects: s.projects.filter((p) => p.id !== optimisticProject.id) }));
    }
  },
  updateProject: async (id, item) => {
    const state = get();
    const houseId = state.houseId;
    if (!houseId) return;
    try {
      if (item.currentAmount !== undefined || item.savedAmount !== undefined) {
        // update progress only
        await updateProjectProgress({
          projectId: id,
          householdId: houseId,
          amountToAdd: item.currentAmount !== undefined ? item.currentAmount : item.savedAmount
        });
      } else {
        // update fields
        const isCompleted = item.status === 'completed' ? true : (item.status === 'pending' || item.status === 'active' ? false : undefined);
        await updateSavingsProject({
          projectId: id,
          householdId: houseId,
          name: item.name,
          targetAmount: item.targetAmount,
          monthlyQuota: item.monthlyQuota,
          targetAccount: item.targetAccount,
          priority: item.priority,
          isCompleted: isCompleted
        });
      }
      useToastStore.getState().addToast("Proyecto actualizado", "success");
      await state.fetchDashboardData(houseId);
    } catch(error) {
      console.error(error);
      useToastStore.getState().addToast("Error al actualizar proyecto", "error");
    }
  },
  deleteProject: async (_id) => { useToastStore.getState().addToast("Operación no disponible", "error"); },
  
  contributions: [],
  setContributions: (items) => set({ contributions: items }),
  addContribution: async (_item) => { useToastStore.getState().addToast("Operación no disponible", "error"); },
  addContributionAndUpdateProject: async (c, p) => {
    const state = get();
    const houseId = state.houseId;
    if (!houseId) return;
    try {
      await updateProjectProgress({
        projectId: p.id,
        householdId: houseId,
        amountToAdd: c.amount
      });
      useToastStore.getState().addToast("Aportación registrada", "success");
      await state.fetchDashboardData(houseId);
    } catch(error) {
      console.error(error);
      useToastStore.getState().addToast("Error al registrar aportación", "error");
    }
  },
  updateContribution: async (_id, _item) => { useToastStore.getState().addToast("Operación no disponible", "error"); },
  deleteContribution: async (_id) => { useToastStore.getState().addToast("Operación no disponible", "error"); }
});
