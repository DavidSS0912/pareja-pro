import { StateCreator } from 'zustand';
import { ExpenseSlice } from './expenseSlice';
import { BudgetSlice } from './budgetSlice';
import { AccountSlice } from './accountSlice';
import { AssetSlice } from './assetSlice';
import { IncomeSlice } from './incomeSlice';
import { GoalSlice } from './goalSlice';
import { UserListSlice } from './userListSlice';
import { ProjectSlice } from './projectSlice';
import { AuthSlice } from './authSlice';
import { getHouseholdNetBalances, getBudgetsByMonth, getSavingsProjects, getExternalAssets, getExpensesByHousehold, getHouseholdAccounts, getIncomesByHousehold } from '../../lib/dataconnect';

export interface DataSlice {
  fetchDashboardData: (houseId: string, month?: string) => Promise<void>;
  fetchBudgetsForMonth: (month: string) => Promise<void>;
  refreshExpenses: () => Promise<void>;
  refreshIncomes: () => Promise<void>;
}
type CombinedSlices = ExpenseSlice & BudgetSlice & AccountSlice & AssetSlice & IncomeSlice & GoalSlice & UserListSlice & ProjectSlice & AuthSlice;

export const createDataSlice: StateCreator<DataSlice & CombinedSlices, [], [], DataSlice> = (set, get) => ({
  fetchDashboardData: async (houseId: string, month?: string) => {
    try {
      const currentMonth = month || `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-01`;
      const [balances, budgets, projects, assets, expensesData, incomesData] = await Promise.all([
        getHouseholdNetBalances({ householdId: houseId }),
        getBudgetsByMonth({ householdId: houseId, period: currentMonth }),
        getSavingsProjects({ householdId: houseId }),
        getExternalAssets({ householdId: houseId }),
        getExpensesByHousehold({ householdId: houseId }),
        getIncomesByHousehold({ householdId: houseId })
      ]);
      const isDebitNature = (t: string) => t === 'ASSET' || t === 'EXPENSE';
      const signed = (e: any) => (e.entryType === 'DEBIT') === isDebitNature(e.account.type) ? +e.amount : -e.amount;

      // Load accounts directly (not via entries, so they appear even without transactions)
      const accountsResult = await getHouseholdAccounts({ householdId: houseId });
      const mappedAccounts = accountsResult.data?.accounts || [];
      const legacyAccounts = balances.data?.entries 
        ? Array.from(new Map(balances.data.entries.map((e: any) => [e.account.id, e.account])).values()) 
        : [];
      
      const balancesMap = new Map<string, number>();
      if (balances.data?.entries) {
        balances.data.entries.forEach((e: any) => {
          const accId = e.account.id;
          balancesMap.set(accId, (balancesMap.get(accId) || 0) + signed(e));
        });
      }

      const allFetchedAccounts = Array.from(new Map([...mappedAccounts, ...legacyAccounts].map((a: any) => {
        return [a.id, { ...a, balance: balancesMap.get(a.id) || 0 }];
      })).values());

      const currentAccounts = get().accounts || [];
      const tempAccounts = currentAccounts.filter(a => a.id && typeof a.id === 'string' && a.id.startsWith('temp-'));
      const unmergedTemps = tempAccounts.filter(ta => !allFetchedAccounts.find((fa: any) => fa.name === ta.name && fa.type === ta.type));
      const mergedAccounts = [...allFetchedAccounts, ...unmergedTemps];
      get().setAccounts(mergedAccounts as any);
      if (budgets.data?.budgets) {
        const mappedBudgets = budgets.data.budgets.map((b: any) => ({
          ...b,
          category: b.categoryName,
          base: b.assignedAmount,
          icon: '🛒' // default icon for now, ideally store in category or local state
        }));
        const currentBudgets = get().budgets || [];
        const tempBudgets = currentBudgets.filter(b => b.id && typeof b.id === 'string' && b.id.startsWith('temp-'));
        const unmergedTempBudgets = tempBudgets.filter(tb => !mappedBudgets.find((mb: any) => mb.category === tb.category));
        const mergedBudgets = [...mappedBudgets, ...unmergedTempBudgets];
        get().setBudgets(mergedBudgets as any);
      }
      if (projects.data?.savingsProjects) {
        const mappedProjects = projects.data.savingsProjects.map((p: any) => ({
          ...p,
          savedAmount: p.currentAmount || 0,
          status: p.isCompleted ? 'completed' : 'pending',
          monthlyQuota: p.monthlyQuota || 0,
          targetAccount: p.targetAccount || '',
          milestones: []
        })).sort((a: any, b: any) => a.priority - b.priority);
        
        let hasActive = false;
        mappedProjects.forEach((p: any) => {
          if (p.status === 'pending' && !hasActive) {
            p.status = 'active';
            hasActive = true;
          }
        });
        
        get().setProjects(mappedProjects);
      }
      if (assets.data?.externalAssets) get().setAssets(assets.data.externalAssets as any);
      if (expensesData.data?.entries) {
        const mappedExpenses = Array.from(expensesData.data.entries.reduce((map: Map<string, any>, e: any) => {
          if (map.has(e.journal.id)) {
            map.get(e.journal.id).amount += signed(e);
          } else {
            map.set(e.journal.id, {
              id: e.journal.id, // Use journal ID for deletion
              amount: signed(e),
              type: e.entryType,
              date: e.journal.date,
              description: e.journal.description,
              category: e.account.name,
              userId: e.ownerUid,
              ownerUid: e.ownerUid,
              paidBy: e.ownerUid,
              isPrivate: !e.isShared,
              isMsi: e.journal.isMsi,
              msiMonthNumber: e.journal.msiMonthNumber,
              msiRefId: e.journal.msiRefId,
              isRecurring: e.journal.isRecurring,
              recurringFrequency: e.journal.recurringFrequency,
              recurringEndDate: e.journal.recurringEndDate
            });
          }
          return map;
        }, new Map()).values());
        // Preserve optimistic temporary items
        const currentExpenses = get().expenses;
        const tempExpenses = currentExpenses.filter(e => e.id.startsWith('temp-'));
        const mergedExpenses = [...tempExpenses, ...mappedExpenses.filter((me: any) => !tempExpenses.find(te => te.id === me.id))];
        get().setExpenses(mergedExpenses);
      }
      if (incomesData.data?.entries) {
        const mappedIncomes = Array.from(incomesData.data.entries.reduce((map: Map<string, any>, e: any) => {
          if (map.has(e.journal.id)) {
            map.get(e.journal.id).amount += signed(e);
          } else {
            map.set(e.journal.id, {
              id: e.journal.id, // Use journal ID for deletion
              amount: signed(e),
              type: e.journal.description,
              date: e.journal.date,
              userId: e.ownerUid,
              ownerUid: e.ownerUid,
              isPrivate: !e.isShared
            });
          }
          return map;
        }, new Map()).values());
        // Preserve optimistic temporary items
        const currentIncomes = get().incomes;
        const tempIncomes = currentIncomes.filter(i => i.id.startsWith('temp-'));
        const mergedIncomes = [...tempIncomes, ...mappedIncomes.filter((mi: any) => !tempIncomes.find(ti => ti.id === mi.id))];
        get().setIncomes(mergedIncomes);
      }
    } catch (error) {
      console.error("Error fetching dashboard data from DataConnect", error);
    }
  },
  fetchBudgetsForMonth: async (month: string) => {
    const state = get();
    const houseId = state.houseId;
    if (!houseId) return;
    try {
      const budgets = await getBudgetsByMonth({ householdId: houseId, period: month });
      if (budgets.data?.budgets) {
        const mappedBudgets = budgets.data.budgets.map((b: any) => ({
          ...b,
          category: b.categoryName,
          base: b.assignedAmount,
          icon: '🛒'
        }));
        get().setBudgets(mappedBudgets as any);
      }
    } catch(e) {
      console.error(e);
    }
  },
  refreshExpenses: async () => {
    const state = get();
    const houseId = state.houseId;
    if (!houseId) return;
    try {
      const expensesData = await getExpensesByHousehold({ householdId: houseId });
      if (expensesData.data?.entries) {
        const isDebitNature = (t: string) => t === 'ASSET' || t === 'EXPENSE';
        const signed = (e: any) => (e.entryType === 'DEBIT') === isDebitNature(e.account.type) ? +e.amount : -e.amount;
        
        const mappedExpenses = Array.from(expensesData.data.entries.reduce((map: Map<string, any>, e: any) => {
          if (map.has(e.journal.id)) {
            map.get(e.journal.id).amount += signed(e);
          } else {
            map.set(e.journal.id, {
              id: e.journal.id,
              amount: signed(e),
              type: e.entryType,
              date: e.journal.date,
              description: e.journal.description,
              category: e.account.name,
              userId: e.ownerUid,
              ownerUid: e.ownerUid,
              paidBy: e.ownerUid,
              isPrivate: !e.isShared,
              isMsi: e.journal.isMsi,
              msiMonthNumber: e.journal.msiMonthNumber,
              msiRefId: e.journal.msiRefId,
              isRecurring: e.journal.isRecurring,
              recurringFrequency: e.journal.recurringFrequency,
              recurringEndDate: e.journal.recurringEndDate
            });
          }
          return map;
        }, new Map()).values());
        // Preserve optimistic temporary items
        const currentExpenses = get().expenses;
        const tempExpenses = currentExpenses.filter(e => e.id.startsWith('temp-'));
        const mergedExpenses = [...tempExpenses, ...mappedExpenses.filter((me: any) => !tempExpenses.find(te => te.id === me.id))];
        get().setExpenses(mergedExpenses);
      }
    } catch (error) {
      console.error('Error refreshing expenses', error);
    }
  },
  refreshIncomes: async () => {
    const state = get();
    const houseId = state.houseId;
    if (!houseId) return;
    try {
      const incomesData = await getIncomesByHousehold({ householdId: houseId });
      if (incomesData.data?.entries) {
        const isDebitNature = (t: string) => t === 'ASSET' || t === 'EXPENSE';
        const signed = (e: any) => (e.entryType === 'DEBIT') === isDebitNature(e.account.type) ? +e.amount : -e.amount;

        const mappedIncomes = Array.from(incomesData.data.entries.reduce((map: Map<string, any>, e: any) => {
          if (map.has(e.journal.id)) {
            map.get(e.journal.id).amount += signed(e);
          } else {
            map.set(e.journal.id, {
              id: e.journal.id,
              amount: signed(e),
              type: e.journal.description,
              date: e.journal.date,
              userId: e.ownerUid,
              ownerUid: e.ownerUid,
              isPrivate: !e.isShared,
            });
          }
          return map;
        }, new Map()).values());
        // Preserve optimistic temporary items
        const currentIncomes = get().incomes;
        const tempIncomes = currentIncomes.filter(i => i.id.startsWith('temp-'));
        const mergedIncomes = [...tempIncomes, ...mappedIncomes.filter((mi: any) => !tempIncomes.find(ti => ti.id === mi.id))];
        get().setIncomes(mergedIncomes);
      }
    } catch (error) {
      console.error('Error refreshing incomes', error);
    }
  },
});
