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
  reorderProjects: (updates: Array<{ id: string; priority: number }>) => Promise<void>;
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
    const maxPriority = (state.projects || []).reduce(
      (max: number, p: any) => Math.max(max, Number(p.priority) || 0),
      0
    );
    const resolvedPriority = item.priority !== undefined ? Number(item.priority) : (maxPriority + 1);

    const optimisticProject = { ...item, priority: resolvedPriority, id: `temp-${Date.now()}` };
    set((s) => ({ projects: [optimisticProject, ...s.projects] }));
    
    try {
      await createSavingsProject({
        householdId: houseId,
        name: item.name,
        targetAmount: item.targetAmount || 0,
        priority: resolvedPriority,
        monthlyQuota: item.monthlyQuota,
        targetAccount: item.targetAccount
      });
      useToastStore.getState().addToast("Proyecto agregado exitosamente", "success");
      const currentHouseId = get().houseId;
      if (currentHouseId) await get().fetchDashboardData(currentHouseId);
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
      await get().fetchDashboardData(houseId);
    } catch(error) {
      console.error(error);
      useToastStore.getState().addToast("Error al actualizar proyecto", "error");
    }
  },
  deleteProject: async (_id) => { useToastStore.getState().addToast("Operación no disponible", "error"); },
  reorderProjects: async (updates: Array<{ id: string; priority: number }>) => {
    const state = get();
    const houseId = state.houseId;
    if (!houseId || !updates.length) return;
    const previousProjects = [...state.projects];
    const updateMap = new Map(updates.map((u) => [u.id, u.priority]));
    const updatedProjects = state.projects
      .map((p) => (updateMap.has(p.id) ? { ...p, priority: updateMap.get(p.id) } : p))
      .sort((a: any, b: any) =>
        (a.priority || 0) !== (b.priority || 0)
          ? (a.priority || 0) - (b.priority || 0)
          : (a.createdAt || '').localeCompare(b.createdAt || '')
      );
    let hasActive = false;
    updatedProjects.forEach((p: any) => {
      if (!p.isCompleted && !hasActive) {
        p.status = 'active';
        hasActive = true;
      } else if (!p.isCompleted) {
        p.status = 'pending';
      }
    });
    set({ projects: updatedProjects });

    try {
      await Promise.all(
        updates.map((u) =>
          updateSavingsProject({
            projectId: u.id,
            householdId: houseId,
            priority: u.priority
          })
        )
      );
      useToastStore.getState().addToast("Prioridad actualizada", "success");
      await get().fetchDashboardData(houseId);
    } catch (error) {
      console.error("Error al reordenar proyectos:", error);
      useToastStore.getState().addToast("Error al actualizar prioridades", "error");
      set({ projects: previousProjects });
    }
  },
  
  contributions: [],
  setContributions: (items) => set({ contributions: items }),
  addContribution: async (_item) => { useToastStore.getState().addToast("Operación no disponible", "error"); },
  addContributionAndUpdateProject: async (c, p) => {
    const state = get();
    const houseId = state.houseId;
    if (!houseId) return;
    const projectId = typeof c === 'string' ? c : p?.id;
    const amountToAdd = typeof c === 'string' ? Number(p?.amount || 0) : Number(c?.amount || 0);
    if (!projectId) return;
    try {
      await updateProjectProgress({
        projectId,
        householdId: houseId,
        amountToAdd
      });
      useToastStore.getState().addToast("Aportación registrada", "success");
      await get().fetchDashboardData(houseId);
    } catch(error) {
      console.error(error);
      useToastStore.getState().addToast("Error al registrar aportación", "error");
    }
  },
  updateContribution: async (_id, _item) => { useToastStore.getState().addToast("Operación no disponible", "error"); },
  deleteContribution: async (_id) => { useToastStore.getState().addToast("Operación no disponible", "error"); }
});
