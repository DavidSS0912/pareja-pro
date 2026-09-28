import { StateCreator } from 'zustand';
import { RecordItem } from '../types';
import { AuthSlice } from './authSlice';
import { DataSlice } from './dataSlice';
import { createSavingsProject, updateProjectProgress } from '../../lib/dataconnect';
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
        priority: item.priority || 1
      });
      useToastStore.getState().addToast("Proyecto agregado exitosamente", "success");
      if (state.houseId) await state.fetchDashboardData(state.houseId);
    } catch(error) {
      console.error(error);
      useToastStore.getState().addToast("Error al agregar el proyecto", "error");
      set({ projects: state.projects });
    }
  },
  updateProject: async (id, item) => {
    const state = get();
    if (item.currentAmount !== undefined || item.savedAmount !== undefined) {
      try {
        await updateProjectProgress({
          projectId: id,
          amountToAdd: item.currentAmount !== undefined ? item.currentAmount : item.savedAmount
        });
        useToastStore.getState().addToast("Progreso actualizado", "success");
        if (state.houseId) await state.fetchDashboardData(state.houseId);
      } catch(error) {
        console.error(error);
        useToastStore.getState().addToast("Error al actualizar progreso", "error");
      }
    }
  },
  deleteProject: async (_id) => { useToastStore.getState().addToast("Operación no disponible", "error"); },
  
  contributions: [],
  setContributions: (items) => set({ contributions: items }),
  addContribution: async (_item) => { useToastStore.getState().addToast("Operación no disponible", "error"); },
  addContributionAndUpdateProject: async (c, p) => {
    const state = get();
    try {
      await updateProjectProgress({
        projectId: p.id,
        amountToAdd: c.amount
      });
      useToastStore.getState().addToast("Aportación registrada", "success");
      if (state.houseId) await state.fetchDashboardData(state.houseId);
    } catch(error) {
      console.error(error);
      useToastStore.getState().addToast("Error al registrar aportación", "error");
    }
  },
  updateContribution: async (_id, _item) => { useToastStore.getState().addToast("Operación no disponible", "error"); },
  deleteContribution: async (_id) => { useToastStore.getState().addToast("Operación no disponible", "error"); }
});
