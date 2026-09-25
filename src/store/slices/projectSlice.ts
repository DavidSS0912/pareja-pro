import { StateCreator } from 'zustand';
import { RecordItem } from '../../services/baseService';
import { projectService } from '../../services/projectService';
import { contributionService } from '../../services/contributionService';
import { AuthSlice } from './authSlice';

export interface ProjectSlice {
  projects: RecordItem[];
  contributions: RecordItem[];
  setProjects: (projects: RecordItem[]) => void;
  setContributions: (contributions: RecordItem[]) => void;
  addProject: (project: Omit<RecordItem, 'id'>) => Promise<void>;
  updateProject: (id: string, project: Partial<Omit<RecordItem, 'id'>>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  addContribution: (contribution: Omit<RecordItem, 'id'>) => Promise<void>;
  deleteContribution: (id: string) => Promise<void>;
  addContributionAndUpdateProject: (projectId: string, contribution: Omit<RecordItem, 'id'>, newSavedAmount: number) => Promise<void>;
}

export const createProjectSlice: StateCreator<ProjectSlice & AuthSlice, [], [], ProjectSlice> = (set, get) => ({
  projects: [],
  contributions: [],
  setProjects: (projects) => set({ projects }),
  setContributions: (contributions) => set({ contributions }),
  addProject: async (project) => {
    const { houseId } = get();
    if (!houseId) return;
    await projectService.add(project, houseId);
  },
  updateProject: async (id, project) => {
    await projectService.update(id, project);
  },
  deleteProject: async (id) => {
    await projectService.delete(id);
  },
  addContribution: async (contribution) => {
    const { houseId } = get();
    if (!houseId) return;
    await contributionService.add(contribution, houseId);
  },
  deleteContribution: async (id) => {
    await contributionService.delete(id);
  },
  addContributionAndUpdateProject: async (projectId, contribution, newSavedAmount) => {
    const { houseId } = get();
    if (!houseId) return;
    await projectService.addContributionAndUpdateProject(houseId, projectId, contribution, newSavedAmount);
  }
});
