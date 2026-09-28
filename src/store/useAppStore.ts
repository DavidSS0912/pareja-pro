import { create } from 'zustand';
import { AuthSlice, createAuthSlice } from './slices/authSlice';
import { ExpenseSlice, createExpenseSlice } from './slices/expenseSlice';
import { BudgetSlice, createBudgetSlice } from './slices/budgetSlice';
import { CardSlice, createCardSlice } from './slices/cardSlice';
import { AssetSlice, createAssetSlice } from './slices/assetSlice';
import { IncomeSlice, createIncomeSlice } from './slices/incomeSlice';
import { GoalSlice, createGoalSlice } from './slices/goalSlice';
import { UserListSlice, createUserListSlice } from './slices/userListSlice';
import { DataSlice, createDataSlice } from './slices/dataSlice';
import { ProjectSlice, createProjectSlice } from './slices/projectSlice';

// Export types to be used across the app
export type { UserState } from './slices/authSlice';
export type { RecordItem } from './types';

export type AppState = AuthSlice &
  ExpenseSlice &
  BudgetSlice &
  CardSlice &
  AssetSlice &
  IncomeSlice &
  GoalSlice &
  UserListSlice &
  DataSlice &
  ProjectSlice;

export const useAppStore = create<AppState>()((...a) => ({
  ...createAuthSlice(...a),
  ...createExpenseSlice(...a),
  ...createBudgetSlice(...a),
  ...createCardSlice(...a),
  ...createAssetSlice(...a),
  ...createIncomeSlice(...a),
  ...createGoalSlice(...a),
  ...createUserListSlice(...a),
  ...createDataSlice(...a),
  ...createProjectSlice(...a),
}));

if (typeof window !== 'undefined') { (window as any).useAppStore = useAppStore; }

