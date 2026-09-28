import { StateCreator } from 'zustand';
import { ExpenseSlice } from './expenseSlice';
import { BudgetSlice } from './budgetSlice';
import { CardSlice } from './cardSlice';
import { AssetSlice } from './assetSlice';
import { IncomeSlice } from './incomeSlice';
import { GoalSlice } from './goalSlice';
import { UserListSlice } from './userListSlice';
import { ProjectSlice } from './projectSlice';
import { getHouseholdNetBalances, getMonthBudgets, getSavingsProjects, getExternalAssets } from '../../lib/dataconnect';

export interface DataSlice {
  fetchDashboardData: (houseId: string) => Promise<void>;
}
type CombinedSlices = ExpenseSlice & BudgetSlice & CardSlice & AssetSlice & IncomeSlice & GoalSlice & UserListSlice & ProjectSlice;

export const createDataSlice: StateCreator<DataSlice & CombinedSlices, [], [], DataSlice> = (set, get) => ({
  fetchDashboardData: async (houseId: string) => {
    try {
      const [balances, budgets, projects, assets] = await Promise.all([
        getHouseholdNetBalances({ householdId: houseId }),
        getMonthBudgets({ householdId: houseId, period: new Date().toISOString().slice(0,7) + '-01' }),
        getSavingsProjects({ householdId: houseId }),
        getExternalAssets({ householdId: houseId })
      ]);
      if (budgets.data?.budgets) get().setBudgets(budgets.data.budgets as any);
      if (projects.data?.savingsProjects) get().setProjects(projects.data.savingsProjects as any);
      if (assets.data?.externalAssets) get().setAssets(assets.data.externalAssets as any);
    } catch (error) {
      console.error("Error fetching dashboard data from DataConnect", error);
    }
  }
});
