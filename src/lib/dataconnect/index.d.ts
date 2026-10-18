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

export interface AddTagToJournalData {
  journalTag_insert: JournalTag_Key;
}

export interface AddTagToJournalVariables {
  journalId: UUIDString;
  tagId: UUIDString;
}

export interface ArchiveAccountData {
  account_update?: Account_Key | null;
}

export interface ArchiveAccountVariables {
  accountId: UUIDString;
  isArchived: boolean;
}

export interface Budget_Key {
  id: UUIDString;
  __typename?: 'Budget_Key';
}

export interface Category_Key {
  id: UUIDString;
  __typename?: 'Category_Key';
}

export interface CreateAccountData {
  account_insert: Account_Key;
}

export interface CreateAccountVariables {
  householdId: UUIDString;
  name: string;
  type: AccountType;
  ownerType: OwnerType;
  cutDay?: number | null;
  paymentDay?: number | null;
  creditLimit?: number | null;
  color?: string | null;
}

export interface CreateBudgetData {
  budget_insert: Budget_Key;
}

export interface CreateBudgetVariables {
  householdId: UUIDString;
  categoryId: UUIDString;
  ownerType: OwnerType;
  period: DateString;
  assignedAmount: number;
}

export interface CreateCategoryData {
  category_insert: Category_Key;
}

export interface CreateCategoryVariables {
  name: string;
  type: AccountType;
  color?: string | null;
  householdId: UUIDString;
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
  debitEntry: Entry_Key;
  creditEntry: Entry_Key;
}

export interface CreateJournalWithEntriesVariables {
  householdId: UUIDString;
  date: TimestampString;
  description: string;
  amount: number;
  debitAccountId: UUIDString;
  creditAccountId: UUIDString;
  prorataFactor: number;
  ownerUid: string;
  isShared: boolean;
  isInternalTransfer?: boolean | null;
  incomeCategoryType?: string | null;
  isMsi?: boolean | null;
  msiRefId?: string | null;
  msiMonthNumber?: number | null;
  isRecurring?: boolean | null;
  recurringFrequency?: string | null;
  recurringEndDate?: TimestampString | null;
  categoryId?: UUIDString | null;
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
  categoryId?: UUIDString | null;
  msiRefId?: string | null;
  msiMonthNumber?: number | null;
}

export interface CreateSavingsProjectData {
  savingsProject_insert: SavingsProject_Key;
}

export interface CreateSavingsProjectVariables {
  householdId: UUIDString;
  name: string;
  targetAmount: number;
  priority: number;
  monthlyQuota?: number | null;
  targetAccount?: string | null;
}

export interface CreateSettlementData {
  settlement_insert: Settlement_Key;
}

export interface CreateSettlementVariables {
  householdId: UUIDString;
  ownerType: OwnerType;
  amount: number;
  note?: string | null;
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
  ownerUid: string;
  isShared: boolean;
  isMsi?: boolean | null;
  msiRefId?: string | null;
  msiMonthNumber?: number | null;
  isRecurring?: boolean | null;
  recurringFrequency?: string | null;
  recurringEndDate?: TimestampString | null;
  categoryId?: UUIDString | null;
}

export interface CreateTagData {
  tag_insert: Tag_Key;
}

export interface CreateTagVariables {
  name: string;
  householdId: UUIDString;
}

export interface DeleteAccountData {
  account_delete?: Account_Key | null;
}

export interface DeleteAccountVariables {
  accountId: UUIDString;
}

export interface DeleteBudgetData {
  budget_delete?: Budget_Key | null;
}

export interface DeleteBudgetVariables {
  id: UUIDString;
  householdId: UUIDString;
}

export interface DeleteCategoryData {
  category_delete?: Category_Key | null;
}

export interface DeleteCategoryVariables {
  id: UUIDString;
}

export interface DeleteJournalData {
  journalTag_deleteMany: number;
  entry_deleteMany: number;
  journal_delete?: Journal_Key | null;
}

export interface DeleteJournalVariables {
  journalId: UUIDString;
  householdId: UUIDString;
}

export interface DeleteSettlementData {
  settlement_delete?: Settlement_Key | null;
}

export interface DeleteSettlementVariables {
  id: UUIDString;
}

export interface DeleteTagData {
  tag_delete?: Tag_Key | null;
}

export interface DeleteTagVariables {
  id: UUIDString;
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

export interface GetBudgetsByMonthData {
  budgets: ({
    id: UUIDString;
    category: {
      id: UUIDString;
      name: string;
    } & Category_Key;
    ownerType: OwnerType;
    assignedAmount: number;
    period: DateString;
  } & Budget_Key)[];
}

export interface GetBudgetsByMonthVariables {
  householdId: UUIDString;
  period: DateString;
}

export interface GetBudgetsData {
  budgets: ({
    id: UUIDString;
    assignedAmount: number;
    ownerType: OwnerType;
    period: DateString;
    categoryId: UUIDString;
    category: {
      id: UUIDString;
      name: string;
    } & Category_Key;
  } & Budget_Key)[];
}

export interface GetBudgetsVariables {
  householdId: UUIDString;
}

export interface GetCategoriesData {
  categories: ({
    id: UUIDString;
    name: string;
    type: AccountType;
    color?: string | null;
    ownerType: OwnerType;
  } & Category_Key)[];
}

export interface GetCategoriesVariables {
  householdId: UUIDString;
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
    isShared: boolean;
    journal: {
      id: UUIDString;
      description: string;
      date: TimestampString;
      isInternalTransfer: boolean;
      isMsi: boolean;
      msiMonthNumber?: number | null;
      msiRefId?: string | null;
      isRecurring: boolean;
      recurringFrequency?: string | null;
      categoryId?: UUIDString | null;
      category?: {
        name: string;
        color?: string | null;
      };
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
    cutDay?: number | null;
    paymentDay?: number | null;
    systemKey?: string | null;
    creditLimit?: number | null;
    color?: string | null;
    isArchived: boolean;
  } & Account_Key)[];
}

export interface GetHouseholdAccountsVariables {
  householdId: UUIDString;
}

export interface GetHouseholdNetBalancesData {
  entries: ({
    ownerUid: string;
    amount: number;
    entryType: EntryType;
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
    isShared: boolean;
    journal: {
      id: UUIDString;
      description: string;
      date: TimestampString;
      isInternalTransfer: boolean;
      incomeCategoryType?: string | null;
      categoryId?: UUIDString | null;
      category?: {
        name: string;
        color?: string | null;
      };
    } & Journal_Key;
    account: {
      name: string;
    };
  } & Entry_Key)[];
}

export interface GetIncomesByHouseholdVariables {
  householdId: UUIDString;
}

export interface GetJournalBalanceV2Data {
  journalBalanceV2s: ({
    diff?: number | null;
  })[];
}

export interface GetJournalBalanceV2Variables {
  journalId: UUIDString;
  householdId: UUIDString;
}

export interface GetJournalTagsData {
  journalTags: ({
    tag: {
      id: UUIDString;
      name: string;
    } & Tag_Key;
  })[];
}

export interface GetJournalTagsVariables {
  journalId: UUIDString;
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

export interface GetNetWorthData {
  netWorthSnapshotV2s: ({
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
    monthlyQuota?: number | null;
    targetAccount?: string | null;
  } & SavingsProject_Key)[];
}

export interface GetSavingsProjectsVariables {
  householdId: UUIDString;
}

export interface GetSettlementsData {
  settlements: ({
    id: UUIDString;
    ownerType: OwnerType;
    amount: number;
    note?: string | null;
    createdAt: TimestampString;
  } & Settlement_Key)[];
}

export interface GetSettlementsVariables {
  householdId: UUIDString;
}

export interface GetTagsData {
  tags: ({
    id: UUIDString;
    name: string;
  } & Tag_Key)[];
}

export interface GetTagsVariables {
  householdId: UUIDString;
}

export interface GetUnassignedCashData {
  unassignedCashV2s: ({
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

export interface JournalTag_Key {
  journalId: UUIDString;
  tagId: UUIDString;
  __typename?: 'JournalTag_Key';
}

export interface Journal_Key {
  id: UUIDString;
  __typename?: 'Journal_Key';
}

export interface NegativeEntriesData {
  entries: ({
    id: UUIDString;
    amount: number;
    entryType: EntryType;
    journal: {
      id: UUIDString;
      description: string;
    } & Journal_Key;
  } & Entry_Key)[];
}

export interface ReassignEntriesData {
  entry_updateMany: number;
}

export interface ReassignEntriesVariables {
  fromAccountId: UUIDString;
  toAccountId: UUIDString;
}

export interface RecurringTemplate_Key {
  id: UUIDString;
  __typename?: 'RecurringTemplate_Key';
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

export interface SetJournalTagsData {
  journalTag_deleteMany: number;
}

export interface SetJournalTagsVariables {
  journalId: UUIDString;
  tagIds: UUIDString[];
}

export interface Settlement_Key {
  id: UUIDString;
  __typename?: 'Settlement_Key';
}

export interface Tag_Key {
  id: UUIDString;
  __typename?: 'Tag_Key';
}

export interface UnbalancedJournalsData {
  journalBalanceV2s: ({
    journalId?: UUIDString | null;
    diff?: number | null;
  })[];
}

export interface UpdateAccountData {
  account_update?: Account_Key | null;
}

export interface UpdateAccountVariables {
  accountId: UUIDString;
  name: string;
  type: AccountType;
  ownerType: OwnerType;
  cutDay?: number | null;
  paymentDay?: number | null;
  creditLimit?: number | null;
  color?: string | null;
}

export interface UpdateBudgetData {
  budget_update?: Budget_Key | null;
}

export interface UpdateBudgetVariables {
  id: UUIDString;
  householdId: UUIDString;
  assignedAmount: number;
}

export interface UpdateCategoryData {
  category_update?: Category_Key | null;
}

export interface UpdateCategoryVariables {
  id: UUIDString;
  name: string;
  color?: string | null;
}

export interface UpdateExternalAssetData {
  externalAsset_update?: ExternalAsset_Key | null;
}

export interface UpdateExternalAssetVariables {
  assetId: UUIDString;
  estimatedValue: number;
}

export interface UpdateJournalWithEntriesData {
  journal_update?: Journal_Key | null;
  entry_deleteMany: number;
  debitEntry: Entry_Key;
  creditEntry: Entry_Key;
}

export interface UpdateJournalWithEntriesVariables {
  journalId: UUIDString;
  householdId: UUIDString;
  date: TimestampString;
  description: string;
  amount: number;
  debitAccountId: UUIDString;
  creditAccountId: UUIDString;
  prorataFactor: number;
  ownerUid: string;
  isShared: boolean;
  isInternalTransfer?: boolean | null;
  incomeCategoryType?: string | null;
  categoryId?: UUIDString | null;
}

export interface UpdateProjectProgressData {
  savingsProject_update?: SavingsProject_Key | null;
}

export interface UpdateProjectProgressVariables {
  projectId: UUIDString;
  amountToAdd: number;
}

export interface UpdateSavingsProjectData {
  savingsProject_update?: SavingsProject_Key | null;
}

export interface UpdateSavingsProjectVariables {
  projectId: UUIDString;
  name?: string | null;
  targetAmount?: number | null;
  monthlyQuota?: number | null;
  targetAccount?: string | null;
  priority?: number | null;
  isCompleted?: boolean | null;
}

export interface UpdateSharedExpenseWithProrationData {
  journal_update?: Journal_Key | null;
  entry_deleteMany: number;
  payerEntry: Entry_Key;
  user1Entry: Entry_Key;
  user2Entry: Entry_Key;
}

export interface UpdateSharedExpenseWithProrationVariables {
  journalId: UUIDString;
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
  ownerUid: string;
  isShared: boolean;
  isRecurring?: boolean | null;
  recurringFrequency?: string | null;
  recurringEndDate?: TimestampString | null;
  categoryId?: UUIDString | null;
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

interface UpdateBudgetRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateBudgetVariables): MutationRef<UpdateBudgetData, UpdateBudgetVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateBudgetVariables): MutationRef<UpdateBudgetData, UpdateBudgetVariables>;
  operationName: string;
}
export const updateBudgetRef: UpdateBudgetRef;

export function updateBudget(vars: UpdateBudgetVariables): MutationPromise<UpdateBudgetData, UpdateBudgetVariables>;
export function updateBudget(dc: DataConnect, vars: UpdateBudgetVariables): MutationPromise<UpdateBudgetData, UpdateBudgetVariables>;

interface DeleteBudgetRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteBudgetVariables): MutationRef<DeleteBudgetData, DeleteBudgetVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: DeleteBudgetVariables): MutationRef<DeleteBudgetData, DeleteBudgetVariables>;
  operationName: string;
}
export const deleteBudgetRef: DeleteBudgetRef;

export function deleteBudget(vars: DeleteBudgetVariables): MutationPromise<DeleteBudgetData, DeleteBudgetVariables>;
export function deleteBudget(dc: DataConnect, vars: DeleteBudgetVariables): MutationPromise<DeleteBudgetData, DeleteBudgetVariables>;

interface CreateAccountRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateAccountVariables): MutationRef<CreateAccountData, CreateAccountVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateAccountVariables): MutationRef<CreateAccountData, CreateAccountVariables>;
  operationName: string;
}
export const createAccountRef: CreateAccountRef;

export function createAccount(vars: CreateAccountVariables): MutationPromise<CreateAccountData, CreateAccountVariables>;
export function createAccount(dc: DataConnect, vars: CreateAccountVariables): MutationPromise<CreateAccountData, CreateAccountVariables>;

interface UpdateAccountRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateAccountVariables): MutationRef<UpdateAccountData, UpdateAccountVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateAccountVariables): MutationRef<UpdateAccountData, UpdateAccountVariables>;
  operationName: string;
}
export const updateAccountRef: UpdateAccountRef;

export function updateAccount(vars: UpdateAccountVariables): MutationPromise<UpdateAccountData, UpdateAccountVariables>;
export function updateAccount(dc: DataConnect, vars: UpdateAccountVariables): MutationPromise<UpdateAccountData, UpdateAccountVariables>;

interface ArchiveAccountRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: ArchiveAccountVariables): MutationRef<ArchiveAccountData, ArchiveAccountVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: ArchiveAccountVariables): MutationRef<ArchiveAccountData, ArchiveAccountVariables>;
  operationName: string;
}
export const archiveAccountRef: ArchiveAccountRef;

export function archiveAccount(vars: ArchiveAccountVariables): MutationPromise<ArchiveAccountData, ArchiveAccountVariables>;
export function archiveAccount(dc: DataConnect, vars: ArchiveAccountVariables): MutationPromise<ArchiveAccountData, ArchiveAccountVariables>;

interface DeleteAccountRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteAccountVariables): MutationRef<DeleteAccountData, DeleteAccountVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: DeleteAccountVariables): MutationRef<DeleteAccountData, DeleteAccountVariables>;
  operationName: string;
}
export const deleteAccountRef: DeleteAccountRef;

export function deleteAccount(vars: DeleteAccountVariables): MutationPromise<DeleteAccountData, DeleteAccountVariables>;
export function deleteAccount(dc: DataConnect, vars: DeleteAccountVariables): MutationPromise<DeleteAccountData, DeleteAccountVariables>;

interface ReassignEntriesRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: ReassignEntriesVariables): MutationRef<ReassignEntriesData, ReassignEntriesVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: ReassignEntriesVariables): MutationRef<ReassignEntriesData, ReassignEntriesVariables>;
  operationName: string;
}
export const reassignEntriesRef: ReassignEntriesRef;

export function reassignEntries(vars: ReassignEntriesVariables): MutationPromise<ReassignEntriesData, ReassignEntriesVariables>;
export function reassignEntries(dc: DataConnect, vars: ReassignEntriesVariables): MutationPromise<ReassignEntriesData, ReassignEntriesVariables>;

interface CreateSettlementRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateSettlementVariables): MutationRef<CreateSettlementData, CreateSettlementVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateSettlementVariables): MutationRef<CreateSettlementData, CreateSettlementVariables>;
  operationName: string;
}
export const createSettlementRef: CreateSettlementRef;

export function createSettlement(vars: CreateSettlementVariables): MutationPromise<CreateSettlementData, CreateSettlementVariables>;
export function createSettlement(dc: DataConnect, vars: CreateSettlementVariables): MutationPromise<CreateSettlementData, CreateSettlementVariables>;

interface DeleteSettlementRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteSettlementVariables): MutationRef<DeleteSettlementData, DeleteSettlementVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: DeleteSettlementVariables): MutationRef<DeleteSettlementData, DeleteSettlementVariables>;
  operationName: string;
}
export const deleteSettlementRef: DeleteSettlementRef;

export function deleteSettlement(vars: DeleteSettlementVariables): MutationPromise<DeleteSettlementData, DeleteSettlementVariables>;
export function deleteSettlement(dc: DataConnect, vars: DeleteSettlementVariables): MutationPromise<DeleteSettlementData, DeleteSettlementVariables>;

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

interface UpdateSavingsProjectRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateSavingsProjectVariables): MutationRef<UpdateSavingsProjectData, UpdateSavingsProjectVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateSavingsProjectVariables): MutationRef<UpdateSavingsProjectData, UpdateSavingsProjectVariables>;
  operationName: string;
}
export const updateSavingsProjectRef: UpdateSavingsProjectRef;

export function updateSavingsProject(vars: UpdateSavingsProjectVariables): MutationPromise<UpdateSavingsProjectData, UpdateSavingsProjectVariables>;
export function updateSavingsProject(dc: DataConnect, vars: UpdateSavingsProjectVariables): MutationPromise<UpdateSavingsProjectData, UpdateSavingsProjectVariables>;

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

interface UpdateJournalWithEntriesRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateJournalWithEntriesVariables): MutationRef<UpdateJournalWithEntriesData, UpdateJournalWithEntriesVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateJournalWithEntriesVariables): MutationRef<UpdateJournalWithEntriesData, UpdateJournalWithEntriesVariables>;
  operationName: string;
}
export const updateJournalWithEntriesRef: UpdateJournalWithEntriesRef;

export function updateJournalWithEntries(vars: UpdateJournalWithEntriesVariables): MutationPromise<UpdateJournalWithEntriesData, UpdateJournalWithEntriesVariables>;
export function updateJournalWithEntries(dc: DataConnect, vars: UpdateJournalWithEntriesVariables): MutationPromise<UpdateJournalWithEntriesData, UpdateJournalWithEntriesVariables>;

interface UpdateSharedExpenseWithProrationRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateSharedExpenseWithProrationVariables): MutationRef<UpdateSharedExpenseWithProrationData, UpdateSharedExpenseWithProrationVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateSharedExpenseWithProrationVariables): MutationRef<UpdateSharedExpenseWithProrationData, UpdateSharedExpenseWithProrationVariables>;
  operationName: string;
}
export const updateSharedExpenseWithProrationRef: UpdateSharedExpenseWithProrationRef;

export function updateSharedExpenseWithProration(vars: UpdateSharedExpenseWithProrationVariables): MutationPromise<UpdateSharedExpenseWithProrationData, UpdateSharedExpenseWithProrationVariables>;
export function updateSharedExpenseWithProration(dc: DataConnect, vars: UpdateSharedExpenseWithProrationVariables): MutationPromise<UpdateSharedExpenseWithProrationData, UpdateSharedExpenseWithProrationVariables>;

interface CreateCategoryRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateCategoryVariables): MutationRef<CreateCategoryData, CreateCategoryVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateCategoryVariables): MutationRef<CreateCategoryData, CreateCategoryVariables>;
  operationName: string;
}
export const createCategoryRef: CreateCategoryRef;

export function createCategory(vars: CreateCategoryVariables): MutationPromise<CreateCategoryData, CreateCategoryVariables>;
export function createCategory(dc: DataConnect, vars: CreateCategoryVariables): MutationPromise<CreateCategoryData, CreateCategoryVariables>;

interface UpdateCategoryRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateCategoryVariables): MutationRef<UpdateCategoryData, UpdateCategoryVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateCategoryVariables): MutationRef<UpdateCategoryData, UpdateCategoryVariables>;
  operationName: string;
}
export const updateCategoryRef: UpdateCategoryRef;

export function updateCategory(vars: UpdateCategoryVariables): MutationPromise<UpdateCategoryData, UpdateCategoryVariables>;
export function updateCategory(dc: DataConnect, vars: UpdateCategoryVariables): MutationPromise<UpdateCategoryData, UpdateCategoryVariables>;

interface DeleteCategoryRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteCategoryVariables): MutationRef<DeleteCategoryData, DeleteCategoryVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: DeleteCategoryVariables): MutationRef<DeleteCategoryData, DeleteCategoryVariables>;
  operationName: string;
}
export const deleteCategoryRef: DeleteCategoryRef;

export function deleteCategory(vars: DeleteCategoryVariables): MutationPromise<DeleteCategoryData, DeleteCategoryVariables>;
export function deleteCategory(dc: DataConnect, vars: DeleteCategoryVariables): MutationPromise<DeleteCategoryData, DeleteCategoryVariables>;

interface CreateTagRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateTagVariables): MutationRef<CreateTagData, CreateTagVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateTagVariables): MutationRef<CreateTagData, CreateTagVariables>;
  operationName: string;
}
export const createTagRef: CreateTagRef;

export function createTag(vars: CreateTagVariables): MutationPromise<CreateTagData, CreateTagVariables>;
export function createTag(dc: DataConnect, vars: CreateTagVariables): MutationPromise<CreateTagData, CreateTagVariables>;

interface DeleteTagRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteTagVariables): MutationRef<DeleteTagData, DeleteTagVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: DeleteTagVariables): MutationRef<DeleteTagData, DeleteTagVariables>;
  operationName: string;
}
export const deleteTagRef: DeleteTagRef;

export function deleteTag(vars: DeleteTagVariables): MutationPromise<DeleteTagData, DeleteTagVariables>;
export function deleteTag(dc: DataConnect, vars: DeleteTagVariables): MutationPromise<DeleteTagData, DeleteTagVariables>;

interface SetJournalTagsRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: SetJournalTagsVariables): MutationRef<SetJournalTagsData, SetJournalTagsVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: SetJournalTagsVariables): MutationRef<SetJournalTagsData, SetJournalTagsVariables>;
  operationName: string;
}
export const setJournalTagsRef: SetJournalTagsRef;

export function setJournalTags(vars: SetJournalTagsVariables): MutationPromise<SetJournalTagsData, SetJournalTagsVariables>;
export function setJournalTags(dc: DataConnect, vars: SetJournalTagsVariables): MutationPromise<SetJournalTagsData, SetJournalTagsVariables>;

interface AddTagToJournalRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: AddTagToJournalVariables): MutationRef<AddTagToJournalData, AddTagToJournalVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: AddTagToJournalVariables): MutationRef<AddTagToJournalData, AddTagToJournalVariables>;
  operationName: string;
}
export const addTagToJournalRef: AddTagToJournalRef;

export function addTagToJournal(vars: AddTagToJournalVariables): MutationPromise<AddTagToJournalData, AddTagToJournalVariables>;
export function addTagToJournal(dc: DataConnect, vars: AddTagToJournalVariables): MutationPromise<AddTagToJournalData, AddTagToJournalVariables>;

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

interface GetBudgetsRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetBudgetsVariables): QueryRef<GetBudgetsData, GetBudgetsVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetBudgetsVariables): QueryRef<GetBudgetsData, GetBudgetsVariables>;
  operationName: string;
}
export const getBudgetsRef: GetBudgetsRef;

export function getBudgets(vars: GetBudgetsVariables, options?: ExecuteQueryOptions): QueryPromise<GetBudgetsData, GetBudgetsVariables>;
export function getBudgets(dc: DataConnect, vars: GetBudgetsVariables, options?: ExecuteQueryOptions): QueryPromise<GetBudgetsData, GetBudgetsVariables>;

interface GetBudgetsByMonthRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetBudgetsByMonthVariables): QueryRef<GetBudgetsByMonthData, GetBudgetsByMonthVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetBudgetsByMonthVariables): QueryRef<GetBudgetsByMonthData, GetBudgetsByMonthVariables>;
  operationName: string;
}
export const getBudgetsByMonthRef: GetBudgetsByMonthRef;

export function getBudgetsByMonth(vars: GetBudgetsByMonthVariables, options?: ExecuteQueryOptions): QueryPromise<GetBudgetsByMonthData, GetBudgetsByMonthVariables>;
export function getBudgetsByMonth(dc: DataConnect, vars: GetBudgetsByMonthVariables, options?: ExecuteQueryOptions): QueryPromise<GetBudgetsByMonthData, GetBudgetsByMonthVariables>;

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

interface GetCategoriesRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetCategoriesVariables): QueryRef<GetCategoriesData, GetCategoriesVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetCategoriesVariables): QueryRef<GetCategoriesData, GetCategoriesVariables>;
  operationName: string;
}
export const getCategoriesRef: GetCategoriesRef;

export function getCategories(vars: GetCategoriesVariables, options?: ExecuteQueryOptions): QueryPromise<GetCategoriesData, GetCategoriesVariables>;
export function getCategories(dc: DataConnect, vars: GetCategoriesVariables, options?: ExecuteQueryOptions): QueryPromise<GetCategoriesData, GetCategoriesVariables>;

interface GetTagsRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetTagsVariables): QueryRef<GetTagsData, GetTagsVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetTagsVariables): QueryRef<GetTagsData, GetTagsVariables>;
  operationName: string;
}
export const getTagsRef: GetTagsRef;

export function getTags(vars: GetTagsVariables, options?: ExecuteQueryOptions): QueryPromise<GetTagsData, GetTagsVariables>;
export function getTags(dc: DataConnect, vars: GetTagsVariables, options?: ExecuteQueryOptions): QueryPromise<GetTagsData, GetTagsVariables>;

interface GetJournalTagsRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetJournalTagsVariables): QueryRef<GetJournalTagsData, GetJournalTagsVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetJournalTagsVariables): QueryRef<GetJournalTagsData, GetJournalTagsVariables>;
  operationName: string;
}
export const getJournalTagsRef: GetJournalTagsRef;

export function getJournalTags(vars: GetJournalTagsVariables, options?: ExecuteQueryOptions): QueryPromise<GetJournalTagsData, GetJournalTagsVariables>;
export function getJournalTags(dc: DataConnect, vars: GetJournalTagsVariables, options?: ExecuteQueryOptions): QueryPromise<GetJournalTagsData, GetJournalTagsVariables>;

interface GetSettlementsRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetSettlementsVariables): QueryRef<GetSettlementsData, GetSettlementsVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetSettlementsVariables): QueryRef<GetSettlementsData, GetSettlementsVariables>;
  operationName: string;
}
export const getSettlementsRef: GetSettlementsRef;

export function getSettlements(vars: GetSettlementsVariables, options?: ExecuteQueryOptions): QueryPromise<GetSettlementsData, GetSettlementsVariables>;
export function getSettlements(dc: DataConnect, vars: GetSettlementsVariables, options?: ExecuteQueryOptions): QueryPromise<GetSettlementsData, GetSettlementsVariables>;

interface GetJournalBalanceV2Ref {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetJournalBalanceV2Variables): QueryRef<GetJournalBalanceV2Data, GetJournalBalanceV2Variables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetJournalBalanceV2Variables): QueryRef<GetJournalBalanceV2Data, GetJournalBalanceV2Variables>;
  operationName: string;
}
export const getJournalBalanceV2Ref: GetJournalBalanceV2Ref;

export function getJournalBalanceV2(vars: GetJournalBalanceV2Variables, options?: ExecuteQueryOptions): QueryPromise<GetJournalBalanceV2Data, GetJournalBalanceV2Variables>;
export function getJournalBalanceV2(dc: DataConnect, vars: GetJournalBalanceV2Variables, options?: ExecuteQueryOptions): QueryPromise<GetJournalBalanceV2Data, GetJournalBalanceV2Variables>;

interface NegativeEntriesRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<NegativeEntriesData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<NegativeEntriesData, undefined>;
  operationName: string;
}
export const negativeEntriesRef: NegativeEntriesRef;

export function negativeEntries(options?: ExecuteQueryOptions): QueryPromise<NegativeEntriesData, undefined>;
export function negativeEntries(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<NegativeEntriesData, undefined>;

interface UnbalancedJournalsRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<UnbalancedJournalsData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<UnbalancedJournalsData, undefined>;
  operationName: string;
}
export const unbalancedJournalsRef: UnbalancedJournalsRef;

export function unbalancedJournals(options?: ExecuteQueryOptions): QueryPromise<UnbalancedJournalsData, undefined>;
export function unbalancedJournals(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<UnbalancedJournalsData, undefined>;

