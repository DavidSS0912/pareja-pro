import { create } from 'zustand';
import { AuthSlice, createAuthSlice } from './slices/authSlice';
import { ExpenseSlice, createExpenseSlice } from './slices/expenseSlice';
import { BudgetSlice, createBudgetSlice } from './slices/budgetSlice';
import { AccountSlice, createAccountSlice } from './slices/accountSlice';
import { AssetSlice, createAssetSlice } from './slices/assetSlice';
import { IncomeSlice, createIncomeSlice } from './slices/incomeSlice';
import { GoalSlice, createGoalSlice } from './slices/goalSlice';
import { UserListSlice, createUserListSlice } from './slices/userListSlice';
import { DataSlice, createDataSlice } from './slices/dataSlice';
import { ProjectSlice, createProjectSlice } from './slices/projectSlice';
import { SettingsSlice, createSettingsSlice } from './slices/settingsSlice';

// Export types to be used across the app
export type { UserState } from './slices/authSlice';
export type { RecordItem } from './types';

export type AppState = AuthSlice &
  ExpenseSlice &
  BudgetSlice &
  AccountSlice &
  AssetSlice &
  IncomeSlice &
  GoalSlice &
  UserListSlice &
  DataSlice &
  ProjectSlice &
  SettingsSlice & {
    resetAppStore: () => void;
  };

export const getInitialDateRange = () => ({
  start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
  end: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0]
});

export const useAppStore = create<AppState>()((...a) => ({
  ...createAuthSlice(...a),
  ...createExpenseSlice(...a),
  ...createBudgetSlice(...a),
  ...createAccountSlice(...a),
  ...createAssetSlice(...a),
  ...createIncomeSlice(...a),
  ...createGoalSlice(...a),
  ...createUserListSlice(...a),
  ...createDataSlice(...a),
  ...createProjectSlice(...a),
  ...createSettingsSlice(...a),
  resetAppStore: () => {
    resetAppStore();
  }
}));

// Instantánea tomada al crear el store: copia de todos los campos que no sean funciones
const captureNonFunctionState = (state: Record<string, any>) => {
  const snapshot: Record<string, any> = {};
  for (const [key, value] of Object.entries(state)) {
    if (typeof value !== 'function') {
      snapshot[key] = Array.isArray(value)
        ? [...value]
        : value && typeof value === 'object'
          ? { ...value }
          : value;
    }
  }
  return snapshot;
};

// Claves de ciclo de vida excluidas del reseteo para evitar que la UI quede en carga infinita al cerrar sesión
export const LIFECYCLE_KEYS = ['authLoading'] as const;

export const initialAppState = captureNonFunctionState(useAppStore.getState());

export const resetAppStore = () => {
  const restored: Record<string, any> = {};
  for (const [key, value] of Object.entries(initialAppState)) {
    // authLoading se gestiona por el ciclo de vida de autenticación en App.tsx para evitar pantalla de carga infinita al cerrar sesión
    if ((LIFECYCLE_KEYS as readonly string[]).includes(key)) continue;
    restored[key] = Array.isArray(value)
      ? [...value]
      : value && typeof value === 'object'
        ? { ...value }
        : value;
  }
  useAppStore.setState({
    ...restored,
    dateRange: getInitialDateRange()
  });
};

if (typeof window !== 'undefined') { (window as any).useAppStore = useAppStore; }
