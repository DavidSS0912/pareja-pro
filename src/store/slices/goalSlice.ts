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
  addGoal: async (_item) => {
    alert("Operación 'Agregar Meta' no disponible en DataConnect (PostgreSQL).");
  },
  updateGoal: async (_id, _item) => {
    alert("Operación 'Actualizar Meta' no disponible en DataConnect (PostgreSQL).");
  },
  deleteGoal: async (_id) => {
    alert("Operación 'Eliminar Meta' no disponible en DataConnect (PostgreSQL).");
  }

});
