import { StateCreator } from 'zustand';
import { ExpenseSlice } from './expenseSlice';
import { BudgetSlice } from './budgetSlice';
import { CardSlice } from './cardSlice';
import { AssetSlice } from './assetSlice';
import { IncomeSlice } from './incomeSlice';
import { GoalSlice } from './goalSlice';
import { UserListSlice } from './userListSlice';
import { ProjectSlice } from './projectSlice';
import { getHouseholdNetBalances, getMonthBudgets, getSavingsProjects, getExternalAssets, getExpensesByHousehold, getHouseholdAccounts, getIncomesByHousehold } from '../../lib/dataconnect';

export interface DataSlice {
  accounts: any[];
  setAccounts: (accounts: any[]) => void;
  fetchDashboardData: (houseId: string) => Promise<void>;
}
type CombinedSlices = ExpenseSlice & BudgetSlice & CardSlice & AssetSlice & IncomeSlice & GoalSlice & UserListSlice & ProjectSlice;

export const createDataSlice: StateCreator<DataSlice & CombinedSlices, [], [], DataSlice> = (set, get) => ({
  accounts: [],
  setAccounts: (accounts) => set({ accounts }),
  fetchDashboardData: async (houseId: string) => {
    try {
      const [balances, budgets, projects, assets, expensesData, incomesData] = await Promise.all([
        getHouseholdNetBalances({ householdId: houseId }),
        getMonthBudgets({ householdId: houseId, period: new Date().toISOString().slice(0,7) + '-01' }),
        getSavingsProjects({ householdId: houseId }),
        getExternalAssets({ householdId: houseId }),
        getExpensesByHousehold({ householdId: houseId }),
        getIncomesByHousehold({ householdId: houseId })
      ]);
      // Load accounts directly (not via entries, so they appear even without transactions)
      const accountsResult = await getHouseholdAccounts({ householdId: houseId });
      if (accountsResult.data?.accounts) {
        get().setAccounts(accountsResult.data.accounts as any);
      } else if (balances.data?.entries) {
        // Fallback: derive accounts from entries (legacy)
        const uniqueAccounts = Array.from(new Map(balances.data.entries.map((e: any) => [e.account.id, e.account])).values());
        get().setAccounts(uniqueAccounts);
      }
      if (budgets.data?.budgets) get().setBudgets(budgets.data.budgets as any);
      if (projects.data?.savingsProjects) get().setProjects(projects.data.savingsProjects as any);
      if (assets.data?.externalAssets) get().setAssets(assets.data.externalAssets as any);
      if (expensesData.data?.entries) {
        const mappedExpenses = expensesData.data.entries.map((e: any) => ({
          id: e.journal.id, // Use journal ID for deletion
          amount: e.amount,
          type: e.entryType,
          date: e.journal.date,
          description: e.journal.description,
          category: e.account.name
        }));
        get().setExpenses(mappedExpenses);
      }
      if (incomesData.data?.entries) {
        const mappedIncomes = incomesData.data.entries.map((e: any) => ({
          id: e.journal.id, // Use journal ID for deletion
          amount: Math.abs(e.amount),
          type: e.journal.description,
          date: e.journal.date,
          userId: e.ownerUid
        }));
        get().setIncomes(mappedIncomes);
      }
    } catch (error) {
      console.error("Error fetching dashboard data from DataConnect", error);
    }
  }
});
