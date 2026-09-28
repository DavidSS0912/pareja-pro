import { ConnectorConfig, DataConnect, QueryRef, QueryPromise, ExecuteQueryOptions, MutationRef, MutationPromise } from 'firebase/data-connect';

export const connectorConfig: ConnectorConfig;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;




export interface Account_Key {
  id: UUIDString;
  __typename?: 'Account_Key';
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

export interface Entry_Key {
  id: UUIDString;
  __typename?: 'Entry_Key';
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

export interface Household_Key {
  id: UUIDString;
  __typename?: 'Household_Key';
}

export interface Journal_Key {
  id: UUIDString;
  __typename?: 'Journal_Key';
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

