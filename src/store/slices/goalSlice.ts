import { StateCreator } from 'zustand';
import { RecordItem } from '../types';
import { AuthSlice } from './authSlice';

export interface GoalSlice {
  goals: RecordItem[];
  setGoals: (items: RecordItem[]) => void;
  addGoal: (item: any) => Promise<void>;
  updateGoal: (id: string, item: any) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;

}

export const createGoalSlice: StateCreator<GoalSlice & AuthSlice, [], [], GoalSlice> = (set, get) => ({
  goals: [],
  setGoals: (items) => set({ goals: items }),
  addGoal: async (item) => {},
  updateGoal: async (id, item) => {},
  deleteGoal: async (id) => {}

});
