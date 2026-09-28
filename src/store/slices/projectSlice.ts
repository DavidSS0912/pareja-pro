import { StateCreator } from 'zustand';
import { RecordItem } from '../types';
import { AuthSlice } from './authSlice';
import { DataSlice } from './dataSlice';
import { createSavingsProject, updateProjectProgress } from '../../lib/dataconnect';

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
    await createSavingsProject({
      householdId: houseId,
      name: item.name,
      targetAmount: item.targetAmount || 0,
      priority: item.priority || 1
    });
    if (state.houseId) await state.fetchDashboardData(state.houseId);
  },
  updateProject: async (id, item) => {
    const state = get();
    if (item.currentAmount !== undefined || item.savedAmount !== undefined) {
      await updateProjectProgress({
        projectId: id,
        amountToAdd: item.currentAmount !== undefined ? item.currentAmount : item.savedAmount
      });
      if (state.houseId) await state.fetchDashboardData(state.houseId);
    }
  },
  deleteProject: async (_id) => {},
  
  contributions: [],
  setContributions: (items) => set({ contributions: items }),
  addContribution: async (_item) => {},
  addContributionAndUpdateProject: async (c, p) => {
    const state = get();
    await updateProjectProgress({
      projectId: p.id,
      amountToAdd: (p.currentAmount || p.savedAmount || 0) + c.amount
    });
    if (state.houseId) await state.fetchDashboardData(state.houseId);
  },
  updateContribution: async (_id, _item) => {},
  deleteContribution: async (_id) => {}
});
