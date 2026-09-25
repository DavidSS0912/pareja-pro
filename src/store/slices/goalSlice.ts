import { StateCreator } from 'zustand';
import { RecordItem } from '../../services/baseService';
import { goalService } from '../../services/goalService';
import { AuthSlice } from './authSlice';

export interface GoalSlice {
  goals: RecordItem[];
  setGoals: (goals: RecordItem[]) => void;
  addGoal: (goal: Omit<RecordItem, 'id'>) => Promise<void>;
  updateGoal: (id: string, goal: Partial<Omit<RecordItem, 'id'>>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
}

export const createGoalSlice: StateCreator<GoalSlice & AuthSlice, [], [], GoalSlice> = (set, get) => ({
  goals: [],
  setGoals: (goals) => set({ goals }),
  addGoal: async (goal) => {
    const { houseId } = get();
    if (!houseId) return;
    await goalService.add(goal, houseId);
  },
  updateGoal: async (id, goal) => {
    await goalService.update(id, goal);
  },
  deleteGoal: async (id) => {
    await goalService.delete(id);
  }
});
