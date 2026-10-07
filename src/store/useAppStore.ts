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
  SettingsSlice;

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
}));

if (typeof window !== 'undefined') { (window as any).useAppStore = useAppStore; }

