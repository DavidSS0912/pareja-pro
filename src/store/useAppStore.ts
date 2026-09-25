import { create } from 'zustand';
import { AuthSlice, createAuthSlice } from './slices/authSlice';
import { ExpenseSlice, createExpenseSlice } from './slices/expenseSlice';
import { BudgetSlice, createBudgetSlice } from './slices/budgetSlice';
import { CardSlice, createCardSlice } from './slices/cardSlice';
import { AssetSlice, createAssetSlice } from './slices/assetSlice';
import { IncomeSlice, createIncomeSlice } from './slices/incomeSlice';
import { GoalSlice, createGoalSlice } from './slices/goalSlice';
import { UserListSlice, createUserListSlice } from './slices/userListSlice';
import { ListenerSlice, createListenerSlice } from './slices/listenerSlice';

// Export types to be used across the app
export type { UserState } from './slices/authSlice';
export type { RecordItem } from '../services/baseService';

export type AppState = AuthSlice &
  ExpenseSlice &
  BudgetSlice &
  CardSlice &
  AssetSlice &
  IncomeSlice &
  GoalSlice &
  UserListSlice &
  ListenerSlice;

export const useAppStore = create<AppState>()((...a) => ({
  ...createAuthSlice(...a),
  ...createExpenseSlice(...a),
  ...createBudgetSlice(...a),
  ...createCardSlice(...a),
  ...createAssetSlice(...a),
  ...createIncomeSlice(...a),
  ...createGoalSlice(...a),
  ...createUserListSlice(...a),
  ...createListenerSlice(...a),
}));
