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

export const createGoalSlice: StateCreator<GoalSlice & AuthSlice, [], [], GoalSlice> = (set) => ({
  goals: [],
  setGoals: (items) => set({ goals: items }),
  addGoal: async (_item) => {},
  updateGoal: async (_id, _item) => {},
  deleteGoal: async (_id) => {}

});
