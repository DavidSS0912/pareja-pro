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

export const createProjectSlice: StateCreator<ProjectSlice & AuthSlice, [], [], ProjectSlice> = (set) => ({
  projects: [],
  setProjects: (items) => set({ projects: items }),
  addProject: async (_item) => {},
  updateProject: async (_id, _item) => {},
  deleteProject: async (_id) => {}
,
  contributions: [],
  setContributions: (items) => set({ contributions: items }),
  addContribution: async (_item) => {},
  addContributionAndUpdateProject: async (_c, _p) => {},
  updateContribution: async (_id, _item) => {},
  deleteContribution: async (_id) => {}
});
