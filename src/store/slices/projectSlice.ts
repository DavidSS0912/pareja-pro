import { StateCreator } from 'zustand';
import { RecordItem } from '../types';
import { AuthSlice } from './authSlice';

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

export const createProjectSlice: StateCreator<ProjectSlice & AuthSlice, [], [], ProjectSlice> = (set, get) => ({
  projects: [],
  setProjects: (items) => set({ projects: items }),
  addProject: async (item) => {},
  updateProject: async (id, item) => {},
  deleteProject: async (id) => {}
,
  contributions: [],
  setContributions: (items) => set({ contributions: items }),
  addContribution: async (item) => {},
  addContributionAndUpdateProject: async (c, p) => {},
  updateContribution: async (id, item) => {},
  deleteContribution: async (id) => {}
});
