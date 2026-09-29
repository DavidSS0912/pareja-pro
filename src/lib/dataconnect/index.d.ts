import { ConnectorConfig, DataConnect, QueryRef, QueryPromise, ExecuteQueryOptions, MutationRef, MutationPromise } from 'firebase/data-connect';

export const connectorConfig: ConnectorConfig;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;


export enum AccountType {
  ASSET = "ASSET",
  LIABILITY = "LIABILITY",
  INCOME = "INCOME",
  EXPENSE = "EXPENSE",
  EQUITY = "EQUITY",
};

export enum EntryType {
  DEBIT = "DEBIT",
  CREDIT = "CREDIT",
};

export enum OwnerType {
  USER_A = "USER_A",
  USER_B = "USER_B",
  SHARED = "SHARED",
};



export interface Account_Key {
  id: UUIDString;
  __typename?: 'Account_Key';
}

export interface Budget_Key {
  id: UUIDString;
  __typename?: 'Budget_Key';
}

export interface CreateBudgetData {
  budget_insert: Budget_Key;
}

export interface CreateBudgetVariables {
  householdId: UUIDString;
  categoryName: string;
  assignedAmount: number;
  period: DateString;
  ownerType: OwnerType;
}

export interface CreateExternalAssetData {
  externalAsset_insert: ExternalAsset_Key;
}

export interface CreateExternalAssetVariables {
  householdId: UUIDString;
  name: string;
  estimatedValue: number;
  assetType: string;
}

export interface CreateHouseholdAndUserData {
  household_insert: Household_Key;
  user_insert: User_Key;
  assetAccount: Account_Key;
  incomeAccount: Account_Key;
  expenseAccount: Account_Key;
  liabilityAccount: Account_Key;
}

export interface CreateHouseholdAndUserVariables {
  email: string;
  displayName: string;
}

export interface CreateJournalWithEntriesData {
  journal_insert: Journal_Key;
  entry1: Entry_Key;
  entry2: Entry_Key;
}

export interface CreateJournalWithEntriesVariables {
  householdId: UUIDString;
  date: TimestampString;
  description: string;
  accountId1: UUIDString;
  amount1: number;
  prorataFactor1: number;
  accountId2: UUIDString;
  amount2: number;
  prorataFactor2: number;
}

export interface CreateMsiExpenseData {
  journal_insert: Journal_Key;
  entry_insert: Entry_Key;
}

export interface CreateMsiExpenseVariables {
  householdId: UUIDString;
  date: TimestampString;
  description: string;
  totalAmount: number;
  months: number;
  creditCardAccountId: UUIDString;
  expenseAccountId: UUIDString;
  prorataFactor: number;
  monthlyAmount: number;
}

export interface CreateSavingsProjectData {
  savingsProject_insert: SavingsProject_Key;
}

export interface CreateSavingsProjectVariables {
  householdId: UUIDString;
  name: string;
  targetAmount: number;
  priority: number;
}

export interface CreateSharedExpenseWithProrationData {
  journal_insert: Journal_Key;
  payerEntry: Entry_Key;
  user1Entry: Entry_Key;
  user2Entry: Entry_Key;
}

export interface CreateSharedExpenseWithProrationVariables {
  householdId: UUIDString;
  date: TimestampString;
  description: string;
  totalAmount: number;
  prorataFactor: number;
  payerAccountId: UUIDString;
  user1ExpenseAccountId: UUIDString;
  user2ExpenseAccountId: UUIDString;
  user1Amount: number;
  user2Amount: number;
  payerAmount: number;
}

export interface DeleteJournalData {
  entry_deleteMany: number;
  journal_delete?: Journal_Key | null;
}

export interface DeleteJournalVariables {
  journalId: UUIDString;
}

export interface Entry_Key {
  id: UUIDString;
  __typename?: 'Entry_Key';
}

export interface ExchangeRate_Key {
  currency: string;
  date: DateString;
  __typename?: 'ExchangeRate_Key';
}

export interface ExternalAsset_Key {
  id: UUIDString;
  __typename?: 'ExternalAsset_Key';
}

export interface GetCurrentUserData {
  user?: {
    uid: string;
    email: string;
    displayName?: string | null;
    householdId: UUIDString;
  } & User_Key;
}

export interface GetExpensesByHouseholdData {
  entries: ({
    id: UUIDString;
    amount: number;
    entryType: EntryType;
    createdAt: TimestampString;
    ownerUid: string;
    journal: {
      id: UUIDString;
      description: string;
      date: TimestampString;
    } & Journal_Key;
    account: {
      name: string;
    };
  } & Entry_Key)[];
}

export interface GetExpensesByHouseholdVariables {
  householdId: UUIDString;
}

export interface GetExternalAssetsData {
  externalAssets: ({
    id: UUIDString;
    name: string;
    estimatedValue: number;
    assetType: string;
  } & ExternalAsset_Key)[];
}

export interface GetExternalAssetsVariables {
  householdId: UUIDString;
}

export interface GetHouseholdAccountsData {
  accounts: ({
    id: UUIDString;
    name: string;
    type: AccountType;
    ownerType: OwnerType;
  } & Account_Key)[];
}

export interface GetHouseholdAccountsVariables {
  householdId: UUIDString;
}

export interface GetHouseholdNetBalancesData {
  entries: ({
    ownerUid: string;
    amount: number;
    account: {
      id: UUIDString;
      type: AccountType;
    } & Account_Key;
  })[];
}

export interface GetHouseholdNetBalancesVariables {
  householdId: UUIDString;
}

export interface GetIncomesByHouseholdData {
  entries: ({
    id: UUIDString;
    amount: number;
    entryType: EntryType;
    createdAt: TimestampString;
    ownerUid: string;
    journal: {
      id: UUIDString;
      description: string;
      date: TimestampString;
    } & Journal_Key;
    account: {
      name: string;
    };
  } & Entry_Key)[];
}

export interface GetIncomesByHouseholdVariables {
  householdId: UUIDString;
}

export interface GetLatestRateData {
  exchangeRates: ({
    rate: number;
    date: DateString;
  })[];
}

export interface GetLatestRateVariables {
  currency: string;
}

export interface GetMonthBudgetsData {
  budgets: ({
    id: UUIDString;
    categoryName: string;
    assignedAmount: number;
    period: DateString;
    ownerType: OwnerType;
  } & Budget_Key)[];
}

export interface GetMonthBudgetsVariables {
  householdId: UUIDString;
  period: DateString;
}

export interface GetNetWorthData {
  netWorthSnapshots: ({
    netWorth?: number | null;
  })[];
}

export interface GetNetWorthVariables {
  householdId: UUIDString;
}

export interface GetSavingsProjectsData {
  savingsProjects: ({
    id: UUIDString;
    name: string;
    targetAmount: number;
    currentAmount: number;
    priority: number;
    isCompleted: boolean;
  } & SavingsProject_Key)[];
}

export interface GetSavingsProjectsVariables {
  householdId: UUIDString;
}

export interface GetUnassignedCashData {
  unassignedCashes: ({
    unassigned?: number | null;
  })[];
}

export interface GetUnassignedCashVariables {
  householdId: UUIDString;
}

export interface Household_Key {
  id: UUIDString;
  __typename?: 'Household_Key';
}

export interface Journal_Key {
  id: UUIDString;
  __typename?: 'Journal_Key';
}

export interface SavingsProject_Key {
  id: UUIDString;
  __typename?: 'SavingsProject_Key';
}

export interface SeedDefaultAccountsData {
  assetAccount: Account_Key;
  incomeAccount: Account_Key;
  expenseAccount: Account_Key;
  liabilityAccount: Account_Key;
}

export interface SeedDefaultAccountsVariables {
  householdId: UUIDString;
}

export interface UpdateBudgetAmountData {
  budget_update?: Budget_Key | null;
}

export interface UpdateBudgetAmountVariables {
  budgetId: UUIDString;
  assignedAmount: number;
}

export interface UpdateExternalAssetData {
  externalAsset_update?: ExternalAsset_Key | null;
}

export interface UpdateExternalAssetVariables {
  assetId: UUIDString;
  estimatedValue: number;
}

export interface UpdateProjectProgressData {
  savingsProject_update?: SavingsProject_Key | null;
}

export interface UpdateProjectProgressVariables {
  projectId: UUIDString;
  amountToAdd: number;
}

export interface UpsertExchangeRateData {
  exchangeRate_upsert: ExchangeRate_Key;
}

export interface UpsertExchangeRateVariables {
  currency: string;
  rate: number;
  date: DateString;
}

export interface User_Key {
  uid: string;
  __typename?: 'User_Key';
}

interface CreateJournalWithEntriesRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateJournalWithEntriesVariables): MutationRef<CreateJournalWithEntriesData, CreateJournalWithEntriesVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateJournalWithEntriesVariables): MutationRef<CreateJournalWithEntriesData, CreateJournalWithEntriesVariables>;
  operationName: string;
}
export const createJournalWithEntriesRef: CreateJournalWithEntriesRef;

export function createJournalWithEntries(vars: CreateJournalWithEntriesVariables): MutationPromise<CreateJournalWithEntriesData, CreateJournalWithEntriesVariables>;
export function createJournalWithEntries(dc: DataConnect, vars: CreateJournalWithEntriesVariables): MutationPromise<CreateJournalWithEntriesData, CreateJournalWithEntriesVariables>;

interface CreateSharedExpenseWithProrationRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateSharedExpenseWithProrationVariables): MutationRef<CreateSharedExpenseWithProrationData, CreateSharedExpenseWithProrationVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateSharedExpenseWithProrationVariables): MutationRef<CreateSharedExpenseWithProrationData, CreateSharedExpenseWithProrationVariables>;
  operationName: string;
}
export const createSharedExpenseWithProrationRef: CreateSharedExpenseWithProrationRef;

export function createSharedExpenseWithProration(vars: CreateSharedExpenseWithProrationVariables): MutationPromise<CreateSharedExpenseWithProrationData, CreateSharedExpenseWithProrationVariables>;
export function createSharedExpenseWithProration(dc: DataConnect, vars: CreateSharedExpenseWithProrationVariables): MutationPromise<CreateSharedExpenseWithProrationData, CreateSharedExpenseWithProrationVariables>;

interface CreateMsiExpenseRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateMsiExpenseVariables): MutationRef<CreateMsiExpenseData, CreateMsiExpenseVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateMsiExpenseVariables): MutationRef<CreateMsiExpenseData, CreateMsiExpenseVariables>;
  operationName: string;
}
export const createMsiExpenseRef: CreateMsiExpenseRef;

export function createMsiExpense(vars: CreateMsiExpenseVariables): MutationPromise<CreateMsiExpenseData, CreateMsiExpenseVariables>;
export function createMsiExpense(dc: DataConnect, vars: CreateMsiExpenseVariables): MutationPromise<CreateMsiExpenseData, CreateMsiExpenseVariables>;

interface CreateBudgetRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateBudgetVariables): MutationRef<CreateBudgetData, CreateBudgetVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateBudgetVariables): MutationRef<CreateBudgetData, CreateBudgetVariables>;
  operationName: string;
}
export const createBudgetRef: CreateBudgetRef;

export function createBudget(vars: CreateBudgetVariables): MutationPromise<CreateBudgetData, CreateBudgetVariables>;
export function createBudget(dc: DataConnect, vars: CreateBudgetVariables): MutationPromise<CreateBudgetData, CreateBudgetVariables>;

interface UpdateBudgetAmountRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateBudgetAmountVariables): MutationRef<UpdateBudgetAmountData, UpdateBudgetAmountVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateBudgetAmountVariables): MutationRef<UpdateBudgetAmountData, UpdateBudgetAmountVariables>;
  operationName: string;
}
export const updateBudgetAmountRef: UpdateBudgetAmountRef;

export function updateBudgetAmount(vars: UpdateBudgetAmountVariables): MutationPromise<UpdateBudgetAmountData, UpdateBudgetAmountVariables>;
export function updateBudgetAmount(dc: DataConnect, vars: UpdateBudgetAmountVariables): MutationPromise<UpdateBudgetAmountData, UpdateBudgetAmountVariables>;

interface CreateSavingsProjectRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateSavingsProjectVariables): MutationRef<CreateSavingsProjectData, CreateSavingsProjectVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateSavingsProjectVariables): MutationRef<CreateSavingsProjectData, CreateSavingsProjectVariables>;
  operationName: string;
}
export const createSavingsProjectRef: CreateSavingsProjectRef;

export function createSavingsProject(vars: CreateSavingsProjectVariables): MutationPromise<CreateSavingsProjectData, CreateSavingsProjectVariables>;
export function createSavingsProject(dc: DataConnect, vars: CreateSavingsProjectVariables): MutationPromise<CreateSavingsProjectData, CreateSavingsProjectVariables>;

interface UpdateProjectProgressRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateProjectProgressVariables): MutationRef<UpdateProjectProgressData, UpdateProjectProgressVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateProjectProgressVariables): MutationRef<UpdateProjectProgressData, UpdateProjectProgressVariables>;
  operationName: string;
}
export const updateProjectProgressRef: UpdateProjectProgressRef;

export function updateProjectProgress(vars: UpdateProjectProgressVariables): MutationPromise<UpdateProjectProgressData, UpdateProjectProgressVariables>;
export function updateProjectProgress(dc: DataConnect, vars: UpdateProjectProgressVariables): MutationPromise<UpdateProjectProgressData, UpdateProjectProgressVariables>;

interface CreateExternalAssetRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateExternalAssetVariables): MutationRef<CreateExternalAssetData, CreateExternalAssetVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateExternalAssetVariables): MutationRef<CreateExternalAssetData, CreateExternalAssetVariables>;
  operationName: string;
}
export const createExternalAssetRef: CreateExternalAssetRef;

export function createExternalAsset(vars: CreateExternalAssetVariables): MutationPromise<CreateExternalAssetData, CreateExternalAssetVariables>;
export function createExternalAsset(dc: DataConnect, vars: CreateExternalAssetVariables): MutationPromise<CreateExternalAssetData, CreateExternalAssetVariables>;

interface UpdateExternalAssetRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateExternalAssetVariables): MutationRef<UpdateExternalAssetData, UpdateExternalAssetVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateExternalAssetVariables): MutationRef<UpdateExternalAssetData, UpdateExternalAssetVariables>;
  operationName: string;
}
export const updateExternalAssetRef: UpdateExternalAssetRef;

export function updateExternalAsset(vars: UpdateExternalAssetVariables): MutationPromise<UpdateExternalAssetData, UpdateExternalAssetVariables>;
export function updateExternalAsset(dc: DataConnect, vars: UpdateExternalAssetVariables): MutationPromise<UpdateExternalAssetData, UpdateExternalAssetVariables>;

interface UpsertExchangeRateRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpsertExchangeRateVariables): MutationRef<UpsertExchangeRateData, UpsertExchangeRateVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpsertExchangeRateVariables): MutationRef<UpsertExchangeRateData, UpsertExchangeRateVariables>;
  operationName: string;
}
export const upsertExchangeRateRef: UpsertExchangeRateRef;

export function upsertExchangeRate(vars: UpsertExchangeRateVariables): MutationPromise<UpsertExchangeRateData, UpsertExchangeRateVariables>;
export function upsertExchangeRate(dc: DataConnect, vars: UpsertExchangeRateVariables): MutationPromise<UpsertExchangeRateData, UpsertExchangeRateVariables>;

interface CreateHouseholdAndUserRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateHouseholdAndUserVariables): MutationRef<CreateHouseholdAndUserData, CreateHouseholdAndUserVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateHouseholdAndUserVariables): MutationRef<CreateHouseholdAndUserData, CreateHouseholdAndUserVariables>;
  operationName: string;
}
export const createHouseholdAndUserRef: CreateHouseholdAndUserRef;

export function createHouseholdAndUser(vars: CreateHouseholdAndUserVariables): MutationPromise<CreateHouseholdAndUserData, CreateHouseholdAndUserVariables>;
export function createHouseholdAndUser(dc: DataConnect, vars: CreateHouseholdAndUserVariables): MutationPromise<CreateHouseholdAndUserData, CreateHouseholdAndUserVariables>;

interface SeedDefaultAccountsRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: SeedDefaultAccountsVariables): MutationRef<SeedDefaultAccountsData, SeedDefaultAccountsVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: SeedDefaultAccountsVariables): MutationRef<SeedDefaultAccountsData, SeedDefaultAccountsVariables>;
  operationName: string;
}
export const seedDefaultAccountsRef: SeedDefaultAccountsRef;

export function seedDefaultAccounts(vars: SeedDefaultAccountsVariables): MutationPromise<SeedDefaultAccountsData, SeedDefaultAccountsVariables>;
export function seedDefaultAccounts(dc: DataConnect, vars: SeedDefaultAccountsVariables): MutationPromise<SeedDefaultAccountsData, SeedDefaultAccountsVariables>;

interface DeleteJournalRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteJournalVariables): MutationRef<DeleteJournalData, DeleteJournalVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: DeleteJournalVariables): MutationRef<DeleteJournalData, DeleteJournalVariables>;
  operationName: string;
}
export const deleteJournalRef: DeleteJournalRef;

export function deleteJournal(vars: DeleteJournalVariables): MutationPromise<DeleteJournalData, DeleteJournalVariables>;
export function deleteJournal(dc: DataConnect, vars: DeleteJournalVariables): MutationPromise<DeleteJournalData, DeleteJournalVariables>;

interface GetHouseholdAccountsRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetHouseholdAccountsVariables): QueryRef<GetHouseholdAccountsData, GetHouseholdAccountsVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetHouseholdAccountsVariables): QueryRef<GetHouseholdAccountsData, GetHouseholdAccountsVariables>;
  operationName: string;
}
export const getHouseholdAccountsRef: GetHouseholdAccountsRef;

export function getHouseholdAccounts(vars: GetHouseholdAccountsVariables, options?: ExecuteQueryOptions): QueryPromise<GetHouseholdAccountsData, GetHouseholdAccountsVariables>;
export function getHouseholdAccounts(dc: DataConnect, vars: GetHouseholdAccountsVariables, options?: ExecuteQueryOptions): QueryPromise<GetHouseholdAccountsData, GetHouseholdAccountsVariables>;

interface GetHouseholdNetBalancesRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetHouseholdNetBalancesVariables): QueryRef<GetHouseholdNetBalancesData, GetHouseholdNetBalancesVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetHouseholdNetBalancesVariables): QueryRef<GetHouseholdNetBalancesData, GetHouseholdNetBalancesVariables>;
  operationName: string;
}
export const getHouseholdNetBalancesRef: GetHouseholdNetBalancesRef;

export function getHouseholdNetBalances(vars: GetHouseholdNetBalancesVariables, options?: ExecuteQueryOptions): QueryPromise<GetHouseholdNetBalancesData, GetHouseholdNetBalancesVariables>;
export function getHouseholdNetBalances(dc: DataConnect, vars: GetHouseholdNetBalancesVariables, options?: ExecuteQueryOptions): QueryPromise<GetHouseholdNetBalancesData, GetHouseholdNetBalancesVariables>;

interface GetMonthBudgetsRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetMonthBudgetsVariables): QueryRef<GetMonthBudgetsData, GetMonthBudgetsVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetMonthBudgetsVariables): QueryRef<GetMonthBudgetsData, GetMonthBudgetsVariables>;
  operationName: string;
}
export const getMonthBudgetsRef: GetMonthBudgetsRef;

export function getMonthBudgets(vars: GetMonthBudgetsVariables, options?: ExecuteQueryOptions): QueryPromise<GetMonthBudgetsData, GetMonthBudgetsVariables>;
export function getMonthBudgets(dc: DataConnect, vars: GetMonthBudgetsVariables, options?: ExecuteQueryOptions): QueryPromise<GetMonthBudgetsData, GetMonthBudgetsVariables>;

interface GetUnassignedCashRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetUnassignedCashVariables): QueryRef<GetUnassignedCashData, GetUnassignedCashVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetUnassignedCashVariables): QueryRef<GetUnassignedCashData, GetUnassignedCashVariables>;
  operationName: string;
}
export const getUnassignedCashRef: GetUnassignedCashRef;

export function getUnassignedCash(vars: GetUnassignedCashVariables, options?: ExecuteQueryOptions): QueryPromise<GetUnassignedCashData, GetUnassignedCashVariables>;
export function getUnassignedCash(dc: DataConnect, vars: GetUnassignedCashVariables, options?: ExecuteQueryOptions): QueryPromise<GetUnassignedCashData, GetUnassignedCashVariables>;

interface GetSavingsProjectsRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetSavingsProjectsVariables): QueryRef<GetSavingsProjectsData, GetSavingsProjectsVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetSavingsProjectsVariables): QueryRef<GetSavingsProjectsData, GetSavingsProjectsVariables>;
  operationName: string;
}
export const getSavingsProjectsRef: GetSavingsProjectsRef;

export function getSavingsProjects(vars: GetSavingsProjectsVariables, options?: ExecuteQueryOptions): QueryPromise<GetSavingsProjectsData, GetSavingsProjectsVariables>;
export function getSavingsProjects(dc: DataConnect, vars: GetSavingsProjectsVariables, options?: ExecuteQueryOptions): QueryPromise<GetSavingsProjectsData, GetSavingsProjectsVariables>;

interface GetExternalAssetsRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetExternalAssetsVariables): QueryRef<GetExternalAssetsData, GetExternalAssetsVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetExternalAssetsVariables): QueryRef<GetExternalAssetsData, GetExternalAssetsVariables>;
  operationName: string;
}
export const getExternalAssetsRef: GetExternalAssetsRef;

export function getExternalAssets(vars: GetExternalAssetsVariables, options?: ExecuteQueryOptions): QueryPromise<GetExternalAssetsData, GetExternalAssetsVariables>;
export function getExternalAssets(dc: DataConnect, vars: GetExternalAssetsVariables, options?: ExecuteQueryOptions): QueryPromise<GetExternalAssetsData, GetExternalAssetsVariables>;

interface GetNetWorthRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetNetWorthVariables): QueryRef<GetNetWorthData, GetNetWorthVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetNetWorthVariables): QueryRef<GetNetWorthData, GetNetWorthVariables>;
  operationName: string;
}
export const getNetWorthRef: GetNetWorthRef;

export function getNetWorth(vars: GetNetWorthVariables, options?: ExecuteQueryOptions): QueryPromise<GetNetWorthData, GetNetWorthVariables>;
export function getNetWorth(dc: DataConnect, vars: GetNetWorthVariables, options?: ExecuteQueryOptions): QueryPromise<GetNetWorthData, GetNetWorthVariables>;

interface GetLatestRateRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetLatestRateVariables): QueryRef<GetLatestRateData, GetLatestRateVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetLatestRateVariables): QueryRef<GetLatestRateData, GetLatestRateVariables>;
  operationName: string;
}
export const getLatestRateRef: GetLatestRateRef;

export function getLatestRate(vars: GetLatestRateVariables, options?: ExecuteQueryOptions): QueryPromise<GetLatestRateData, GetLatestRateVariables>;
export function getLatestRate(dc: DataConnect, vars: GetLatestRateVariables, options?: ExecuteQueryOptions): QueryPromise<GetLatestRateData, GetLatestRateVariables>;

interface GetExpensesByHouseholdRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetExpensesByHouseholdVariables): QueryRef<GetExpensesByHouseholdData, GetExpensesByHouseholdVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetExpensesByHouseholdVariables): QueryRef<GetExpensesByHouseholdData, GetExpensesByHouseholdVariables>;
  operationName: string;
}
export const getExpensesByHouseholdRef: GetExpensesByHouseholdRef;

export function getExpensesByHousehold(vars: GetExpensesByHouseholdVariables, options?: ExecuteQueryOptions): QueryPromise<GetExpensesByHouseholdData, GetExpensesByHouseholdVariables>;
export function getExpensesByHousehold(dc: DataConnect, vars: GetExpensesByHouseholdVariables, options?: ExecuteQueryOptions): QueryPromise<GetExpensesByHouseholdData, GetExpensesByHouseholdVariables>;

interface GetIncomesByHouseholdRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetIncomesByHouseholdVariables): QueryRef<GetIncomesByHouseholdData, GetIncomesByHouseholdVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetIncomesByHouseholdVariables): QueryRef<GetIncomesByHouseholdData, GetIncomesByHouseholdVariables>;
  operationName: string;
}
export const getIncomesByHouseholdRef: GetIncomesByHouseholdRef;

export function getIncomesByHousehold(vars: GetIncomesByHouseholdVariables, options?: ExecuteQueryOptions): QueryPromise<GetIncomesByHouseholdData, GetIncomesByHouseholdVariables>;
export function getIncomesByHousehold(dc: DataConnect, vars: GetIncomesByHouseholdVariables, options?: ExecuteQueryOptions): QueryPromise<GetIncomesByHouseholdData, GetIncomesByHouseholdVariables>;

interface GetCurrentUserRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<GetCurrentUserData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<GetCurrentUserData, undefined>;
  operationName: string;
}
export const getCurrentUserRef: GetCurrentUserRef;

export function getCurrentUser(options?: ExecuteQueryOptions): QueryPromise<GetCurrentUserData, undefined>;
export function getCurrentUser(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<GetCurrentUserData, undefined>;

