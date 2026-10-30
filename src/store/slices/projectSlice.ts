import { StateCreator } from 'zustand';
import { RecordItem, ProjectContribution, ProjectMilestone } from '../types';
import { AuthSlice } from './authSlice';
import { DataSlice } from './dataSlice';
import {
  createProjectContribution,
  createSavingsProject,
  updateProjectProgress,
  updateSavingsProject,
  createProjectMilestone,
  updateProjectMilestone,
  deleteProjectMilestone,
  toggleProjectMilestone
} from '../../lib/dataconnect';
import { useToastStore } from '../useToastStore';

export interface ProjectSlice {
  projects: RecordItem[];
  setProjects: (items: RecordItem[]) => void;
  addProject: (item: any) => Promise<void>;
  updateProject: (id: string, item: any) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  reorderProjects: (updates: Array<{ id: string; priority: number }>) => Promise<void>;
  contributions: ProjectContribution[];
  setContributions: (items: ProjectContribution[]) => void;
  addContribution: (item: any) => Promise<void>;
  addContributionAndUpdateProject: (c: any, p: any, maybeNewAmount?: any) => Promise<void>;
  updateContribution: (id: string, item: any) => Promise<void>;
  deleteContribution: (id: string) => Promise<void>;
  addMilestone: (projectId: string, milestoneData: any) => Promise<void>;
  toggleMilestone: (milestoneId: string, isCompleted: boolean) => Promise<void>;
  deleteMilestone: (milestoneId: string) => Promise<void>;
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
  addContribution: async (item) => {
    const projId = item.projectId || item.savingsProjectId;
    if (projId) {
      await get().addContributionAndUpdateProject(projId, item);
    }
  },
  addContributionAndUpdateProject: async (c, p, _maybeNewAmount) => {
    const state = get();
    const houseId = state.houseId;
    if (!houseId) return;

    const projectId = typeof c === 'string' ? c : (c?.projectId || p?.id || p?.projectId);
    if (!projectId) return;

    const contribData = typeof c === 'string' ? p : c;
    const contributionAmount = Number(contribData?.amount || 0);

    const project = (state.projects || []).find((pr: any) => pr.id === projectId);
    const existingContributionsSum = (state.contributions || [])
      .filter((con: any) => (con.projectId === projectId || con.savingsProjectId === projectId) && !String(con.id).startsWith('temp-'))
      .reduce((sum: number, con: any) => sum + Number(con.amount || 0), 0);
    const currentAmount = existingContributionsSum > 0 ? existingContributionsSum : Number(project?.currentAmount ?? project?.savedAmount ?? 0);
    const newAccumulated = existingContributionsSum + contributionAmount;

    const optimisticContribution: ProjectContribution = {
      id: `temp-${Date.now()}`,
      projectId,
      savingsProjectId: projectId,
      userId: contribData?.userId || state.user?.uid || '',
      amount: contributionAmount,
      date: contribData?.date || new Date().toISOString().split('T')[0],
      notes: contribData?.notes || null,
      sourceAccountId: contribData?.sourceAccountId || null,
      targetAccountId: contribData?.targetAccountId || null,
      isInternalPiggyBank: !!contribData?.isInternalPiggyBank,
      createdAt: new Date().toISOString()
    };

    set((s) => ({
      contributions: [optimisticContribution, ...(s.contributions || [])],
      projects: (s.projects || []).map((pr: any) =>
        pr.id === projectId
          ? {
              ...pr,
              currentAmount: newAccumulated,
              savedAmount: newAccumulated,
              isCompleted: pr.targetAmount ? newAccumulated >= pr.targetAmount : pr.isCompleted,
              status: pr.targetAmount && newAccumulated >= pr.targetAmount ? 'completed' : pr.status
            }
          : pr
      )
    }));

    try {
      if (typeof createProjectContribution === 'function') {
        await createProjectContribution({
          projectId,
          householdId: houseId,
          amount: contributionAmount,
          date: contribData?.date || new Date().toISOString().split('T')[0],
          notes: contribData?.notes || null,
          sourceAccountId: contribData?.sourceAccountId || null,
          targetAccountId: contribData?.targetAccountId || null,
          userId: contribData?.userId || state.user?.uid || null
        });
      }

      await updateProjectProgress({
        projectId,
        householdId: houseId,
        amountToAdd: newAccumulated
      });

      useToastStore.getState().addToast("Aportación registrada", "success");
      await get().fetchDashboardData(houseId);
    } catch(error) {
      console.error(error);
      useToastStore.getState().addToast("Error al registrar aportación", "error");
      set((s) => ({
        contributions: (s.contributions || []).filter((con: any) => con.id !== optimisticContribution.id),
        projects: (s.projects || []).map((pr: any) =>
          pr.id === projectId
            ? {
                ...pr,
                currentAmount,
                savedAmount: currentAmount,
                isCompleted: project?.isCompleted ?? pr.isCompleted,
                status: project?.status ?? pr.status
              }
            : pr
        )
      }));
    }
  },
  updateContribution: async (_id, _item) => { useToastStore.getState().addToast("Operación no disponible", "error"); },
  deleteContribution: async (_id) => { useToastStore.getState().addToast("Operación no disponible", "error"); },

  addMilestone: async (projectId: string, milestoneData: any) => {
    const state = get();
    const houseId = state.houseId;
    if (!houseId) return;

    const tempId = `temp-${Date.now()}`;
    const optimisticMilestone: ProjectMilestone = {
      id: tempId,
      projectId,
      title: milestoneData.title?.trim() || '',
      amountThreshold: milestoneData.amountThreshold ? Number(milestoneData.amountThreshold) : undefined,
      dateThreshold: milestoneData.dateThreshold || undefined,
      isCompleted: false,
      createdAt: new Date().toISOString()
    };

    const updatedProjects = (state.projects || []).map((p: any) => {
      if (p.id === projectId) {
        return {
          ...p,
          milestones: [...(p.milestones || []), optimisticMilestone]
        };
      }
      return p;
    });
    set({ projects: updatedProjects });

    try {
      await createProjectMilestone({
        projectId,
        householdId: houseId,
        title: milestoneData.title?.trim() || '',
        amountThreshold: milestoneData.amountThreshold ? Number(milestoneData.amountThreshold) : null,
        dateThreshold: milestoneData.dateThreshold || null
      });
      useToastStore.getState().addToast("Hito agregado exitosamente", "success");
      await get().fetchDashboardData(houseId);
    } catch (error) {
      console.error("Error al agregar hito:", error);
      useToastStore.getState().addToast("Error al agregar hito", "error");
      await get().fetchDashboardData(houseId);
    }
  },

  toggleMilestone: async (milestoneId: string, isCompleted: boolean) => {
    const state = get();
    const houseId = state.houseId;
    if (!houseId) return;

    const updatedProjects = (state.projects || []).map((p: any) => {
      const hasMilestone = (p.milestones || []).some((m: any) => m.id === milestoneId);
      if (!hasMilestone) return p;
      return {
        ...p,
        milestones: (p.milestones || []).map((m: any) =>
          m.id === milestoneId ? { ...m, isCompleted } : m
        )
      };
    });
    set({ projects: updatedProjects });

    try {
      await toggleProjectMilestone({
        milestoneId,
        householdId: houseId,
        isCompleted
      });
      useToastStore.getState().addToast(isCompleted ? "Hito completado" : "Hito marcado como pendiente", "success");
      await get().fetchDashboardData(houseId);
    } catch (error) {
      console.error("Error al actualizar hito:", error);
      useToastStore.getState().addToast("Error al actualizar hito", "error");
      await get().fetchDashboardData(houseId);
    }
  },

  deleteMilestone: async (milestoneId: string) => {
    const state = get();
    const houseId = state.houseId;
    if (!houseId) return;

    const updatedProjects = (state.projects || []).map((p: any) => {
      const hasMilestone = (p.milestones || []).some((m: any) => m.id === milestoneId);
      if (!hasMilestone) return p;
      return {
        ...p,
        milestones: (p.milestones || []).filter((m: any) => m.id !== milestoneId)
      };
    });
    set({ projects: updatedProjects });

    try {
      await deleteProjectMilestone({
        milestoneId,
        householdId: houseId
      });
      useToastStore.getState().addToast("Hito eliminado", "success");
      await get().fetchDashboardData(houseId);
    } catch (error) {
      console.error("Error al eliminar hito:", error);
      useToastStore.getState().addToast("Error al eliminar hito", "error");
      await get().fetchDashboardData(houseId);
    }
  }
});
