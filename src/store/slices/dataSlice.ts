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
import { QueryFetchPolicy } from 'firebase/data-connect';
import {
  getHouseholdNetBalances,
  getBudgetsByMonth,
  getSavingsProjects,
  getExternalAssets,
  getExpensesByHousehold,
  getHouseholdAccounts,
  getIncomesByHousehold,
  getInternalTransfersByHousehold
} from '../../lib/dataconnect';
import { mergeAccountsWithBalances } from '../../services/accountService';
import { Transfer, RecordItem } from '../types';

export type { Transfer };

const SERVER_ONLY = { fetchPolicy: QueryFetchPolicy.SERVER_ONLY };

const resolveSplitType = (factor: any): '50/50' | 'proporcional' | 'individual' => {
  if (factor === undefined || factor === null) return '50/50';
  const num = Number(factor);
  if (num === 0) return 'proporcional';
  if (num === 1 || num === 1.0) return 'individual';
  return '50/50';
};

export interface DataSlice {
  selectedBudgetMonth?: string;
  transfers: Transfer[];
  setTransfers: (transfers: Transfer[]) => void;
  setUsers?: (users: RecordItem[]) => void;
  fetchDashboardData: (houseId: string, month?: string) => Promise<void>;
  fetchBudgetsForMonth: (month: string) => Promise<void>;
  refreshExpenses: () => Promise<void>;
  refreshIncomes: () => Promise<void>;
}
type CombinedSlices = ExpenseSlice & BudgetSlice & AccountSlice & AssetSlice & IncomeSlice & GoalSlice & UserListSlice & ProjectSlice & AuthSlice;

export const createDataSlice: StateCreator<DataSlice & CombinedSlices, [], [], DataSlice> = (set, get) => ({
  selectedBudgetMonth: undefined,
  transfers: [],
  setTransfers: (transfers) => set({ transfers }),
  setUsers: (users: RecordItem[]) => {
    const existingUsers = get().users || [];
    const currentUser = get().user;
    const sanitized = users.map((u: any) => {
      const existing = existingUsers.find((eu: any) => eu.id === u.id);
      const photo = u.photoURL || u.photoUrl || existing?.photoURL || (currentUser?.uid === u.id ? currentUser?.photoURL : undefined);
      const userItem: RecordItem = {
        ...u
      };
      if (photo) {
        userItem.photoURL = photo;
        userItem.photoUrl = photo;
      }
      return userItem;
    }).sort((a: any, b: any) => {
      if (a.memberSlot === 'USER_A') return -1;
      if (b.memberSlot === 'USER_A') return 1;
      if (a.memberSlot === 'USER_B') return -1;
      if (b.memberSlot === 'USER_B') return 1;
      return 0;
    });
    set({ users: sanitized } as any);
  },
  fetchDashboardData: async (houseId: string, month?: string) => {
    try {
      const currentMonth = month || get().selectedBudgetMonth || `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-01`;
      const [balances, budgets, projects, assets, expensesData, incomesData, transfersData] = await Promise.all([
        getHouseholdNetBalances({ householdId: houseId }, SERVER_ONLY),
        getBudgetsByMonth({ householdId: houseId, period: currentMonth }, SERVER_ONLY),
        getSavingsProjects({ householdId: houseId }, SERVER_ONLY),
        getExternalAssets({ householdId: houseId }, SERVER_ONLY),
        getExpensesByHousehold({ householdId: houseId }, SERVER_ONLY),
        getIncomesByHousehold({ householdId: houseId }, SERVER_ONLY),
        getInternalTransfersByHousehold({ householdId: houseId }, SERVER_ONLY)
      ]);
      const isDebitNature = (t: string) => t === 'ASSET' || t === 'EXPENSE' || t === 'BANK_ACCOUNT';
      const signed = (e: any, fallbackType = 'EXPENSE') => (e.entryType === 'DEBIT') === isDebitNature(e.account?.type || fallbackType) ? +e.amount : -e.amount;

      // Load accounts directly (not via entries, so they appear even without transactions)
      const accountsResult = await getHouseholdAccounts({ householdId: houseId }, SERVER_ONLY);
      const serverAccounts = accountsResult.data?.accounts || [];
      const balanceEntries = balances.data?.entries || [];
      const currentAccounts = get().accounts || [];

      const mergedAccounts = mergeAccountsWithBalances(serverAccounts, balanceEntries, currentAccounts);
      get().setAccounts(mergedAccounts as any);
      if (accountsResult.data?.householdUsers) {
        const existingUsers = get().users || [];
        const currentUser = get().user;
        const mappedUsers = accountsResult.data.householdUsers.map((u: any) => {
          const existing = existingUsers.find((eu: any) => eu.id === u.uid);
          const photoURL = u.photoUrl || existing?.photoURL || (currentUser?.uid === u.uid ? currentUser?.photoURL : undefined);
          const userItem: RecordItem = {
            id: u.uid,
            name: u.displayName || u.email,
            email: u.email
          };
          if (photoURL) {
            userItem.photoURL = photoURL;
            userItem.photoUrl = photoURL;
          }
          if (u.memberSlot) {
            userItem.memberSlot = u.memberSlot;
          }
          return userItem;
        });

        mappedUsers.sort((a: any, b: any) => {
          if (a.memberSlot === 'USER_A') return -1;
          if (b.memberSlot === 'USER_A') return 1;
          if (a.memberSlot === 'USER_B') return -1;
          if (b.memberSlot === 'USER_B') return 1;
          return 0;
        });

        get().setUsers(mappedUsers);
      }
      if (budgets.data?.budgets) {
        const currentBudgets = get().budgets || [];
        const mappedBudgets = budgets.data.budgets.map((b: any) => {
          const existing = currentBudgets.find((eb: any) => eb.id === b.id);
          return {
            ...b,
            categoryId: b.category?.id || b.categoryId,
            category: b.category?.name,
            base: b.assignedAmount,
            icon: b.icon || existing?.icon || '🛒',
            splitType: b.splitType || existing?.splitType || 'PROPORTIONAL',
            customUserId: b.customUserId || existing?.customUserId || null,
            customUserAmount: b.customUserAmount ?? existing?.customUserAmount ?? null
          };
        });
        const tempBudgets = currentBudgets.filter(b => b.id && typeof b.id === 'string' && b.id.startsWith('temp-'));
        const unmergedTempBudgets = tempBudgets.filter(tb => !mappedBudgets.find((mb: any) => mb.categoryId === tb.categoryId && mb.ownerType === tb.ownerType));
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
      if (assets.data?.externalAssets) {
        const mappedAssets = assets.data.externalAssets.map((a: any) => ({
          ...a,
          value: a.estimatedValue ?? a.value ?? 0,
          type: a.assetType || a.type || 'Liquidez',
          owner: a.owner || 'Ambos'
        }));
        get().setAssets(mappedAssets as any);
      }
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
              desc: e.journal.description,
              categoryId: e.journal.categoryId,
              category: e.journal.category?.name || e.account.name,
              userId: e.ownerUid,
              ownerUid: e.ownerUid,
              paidBy: e.ownerUid,
              isPrivate: !e.isShared,
              prorataFactor: e.prorataFactor !== undefined && e.prorataFactor !== null ? Number(e.prorataFactor) : 0.5,
              splitType: resolveSplitType(e.prorataFactor),
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
            map.get(e.journal.id).amount += signed(e, 'INCOME');
          } else {
            map.set(e.journal.id, {
              id: e.journal.id, // Use journal ID for deletion
              amount: signed(e, 'INCOME'),
              type: e.journal.description,
              description: e.journal.description,
              categoryId: e.journal.categoryId,
              category: e.journal.category?.name || e.account?.name,
              incomeCategoryType: e.journal.incomeCategoryType || 'Ordinario',
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
      if (transfersData.data?.journals) {
        const mappedTransfers: Transfer[] = transfersData.data.journals.map((j: any) => {
          const creditEntry = j.entries_on_journal?.find((e: any) => e.entryType === 'CREDIT');
          const debitEntry = j.entries_on_journal?.find((e: any) => e.entryType === 'DEBIT');
          const isCardPayment = debitEntry?.account?.type === 'LIABILITY';
          const primaryEntry = creditEntry || debitEntry;
          const ownerUid = primaryEntry?.ownerUid;
          const isPrivate = primaryEntry ? !primaryEntry.isShared : false;

          const transferItem: Transfer = {
            id: j.id,
            date: j.date,
            amount: debitEntry?.amount ?? creditEntry?.amount ?? 0,
            description: j.description,
            sourceAccountId: creditEntry?.account?.id || '',
            sourceAccountName: creditEntry?.account?.name || '',
            targetAccountId: debitEntry?.account?.id || '',
            targetAccountName: debitEntry?.account?.name || '',
            type: isCardPayment ? 'CARD_PAYMENT' : 'TRANSFER'
          };

          Object.defineProperties(transferItem, {
            ownerUid: { value: ownerUid, enumerable: false, writable: true, configurable: true },
            userId: { value: ownerUid, enumerable: false, writable: true, configurable: true },
            isPrivate: { value: isPrivate, enumerable: false, writable: true, configurable: true }
          });

          return transferItem;
        });
        get().setTransfers(mappedTransfers);
      }
    } catch (error) {
      console.error("Error fetching dashboard data from DataConnect", error);
    }
  },
  fetchBudgetsForMonth: async (month: string) => {
    set({ selectedBudgetMonth: month });
    const state = get();
    const houseId = state.houseId;
    if (!houseId) return;
    try {
      const budgets = await getBudgetsByMonth({ householdId: houseId, period: month }, SERVER_ONLY);
      if (budgets.data?.budgets) {
        const currentBudgets = get().budgets || [];
        const mappedBudgets = budgets.data.budgets.map((b: any) => {
          const existing = currentBudgets.find((eb: any) => eb.id === b.id);
          return {
            ...b,
            categoryId: b.category?.id || b.categoryId,
            category: b.category?.name,
            base: b.assignedAmount,
            icon: b.icon || existing?.icon || '🛒',
            splitType: b.splitType || existing?.splitType || 'PROPORTIONAL',
            customUserId: b.customUserId || existing?.customUserId || null,
            customUserAmount: b.customUserAmount ?? existing?.customUserAmount ?? null
          };
        });
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
      const expensesData = await getExpensesByHousehold({ householdId: houseId }, SERVER_ONLY);
      if (expensesData.data?.entries) {
        const isDebitNature = (t: string) => t === 'ASSET' || t === 'EXPENSE' || t === 'BANK_ACCOUNT';
        const signed = (e: any) => (e.entryType === 'DEBIT') === isDebitNature(e.account?.type || 'EXPENSE') ? +e.amount : -e.amount;
        
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
              desc: e.journal.description,
              categoryId: e.journal.categoryId,
              category: e.journal.category?.name || e.account.name,
              userId: e.ownerUid,
              ownerUid: e.ownerUid,
              paidBy: e.ownerUid,
              isPrivate: !e.isShared,
              prorataFactor: e.prorataFactor !== undefined && e.prorataFactor !== null ? Number(e.prorataFactor) : 0.5,
              splitType: resolveSplitType(e.prorataFactor),
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
      const incomesData = await getIncomesByHousehold({ householdId: houseId }, SERVER_ONLY);
      if (incomesData.data?.entries) {
        const isDebitNature = (t: string) => t === 'ASSET' || t === 'EXPENSE' || t === 'BANK_ACCOUNT';
        const signed = (e: any) => (e.entryType === 'DEBIT') === isDebitNature(e.account?.type || 'INCOME') ? +e.amount : -e.amount;

        const mappedIncomes = Array.from(incomesData.data.entries.reduce((map: Map<string, any>, e: any) => {
          if (map.has(e.journal.id)) {
            map.get(e.journal.id).amount += signed(e);
          } else {
            map.set(e.journal.id, {
              id: e.journal.id,
              amount: signed(e),
              type: e.journal.description,
              description: e.journal.description,
              categoryId: e.journal.categoryId,
              category: e.journal.category?.name || e.account?.name,
              incomeCategoryType: e.journal.incomeCategoryType || 'Ordinario',
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
