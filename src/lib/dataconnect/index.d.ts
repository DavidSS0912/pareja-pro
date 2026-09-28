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

export enum OwnerType {
  USER_A = "USER_A",
  USER_B = "USER_B",
  SHARED = "SHARED",
};



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

export interface Entry_Key {
  id: UUIDString;
  __typename?: 'Entry_Key';
}

export interface GetHouseholdBalanceData {
  accounts: ({
    id: UUIDString;
    name: string;
    type: AccountType;
    ownerType: OwnerType;
    balance?: {
      balance?: number | null;
    };
  } & Account_Key)[];
}

export interface GetHouseholdBalanceVariables {
  householdId: UUIDString;
}

export interface GetMyEntriesData {
  entries: ({
    id: UUIDString;
    amount: number;
    account: {
      name: string;
    };
    journal: {
      date: TimestampString;
      description: string;
    };
  } & Entry_Key)[];
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

export interface ValidateJournalBalanceData {
  journalBalances: ({
    netBalance?: number | null;
  })[];
}

export interface ValidateJournalBalanceVariables {
  journalId: UUIDString;
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

interface GetHouseholdBalanceRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetHouseholdBalanceVariables): QueryRef<GetHouseholdBalanceData, GetHouseholdBalanceVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetHouseholdBalanceVariables): QueryRef<GetHouseholdBalanceData, GetHouseholdBalanceVariables>;
  operationName: string;
}
export const getHouseholdBalanceRef: GetHouseholdBalanceRef;

export function getHouseholdBalance(vars: GetHouseholdBalanceVariables, options?: ExecuteQueryOptions): QueryPromise<GetHouseholdBalanceData, GetHouseholdBalanceVariables>;
export function getHouseholdBalance(dc: DataConnect, vars: GetHouseholdBalanceVariables, options?: ExecuteQueryOptions): QueryPromise<GetHouseholdBalanceData, GetHouseholdBalanceVariables>;

interface GetMyEntriesRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<GetMyEntriesData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<GetMyEntriesData, undefined>;
  operationName: string;
}
export const getMyEntriesRef: GetMyEntriesRef;

export function getMyEntries(options?: ExecuteQueryOptions): QueryPromise<GetMyEntriesData, undefined>;
export function getMyEntries(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<GetMyEntriesData, undefined>;

interface ValidateJournalBalanceRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: ValidateJournalBalanceVariables): QueryRef<ValidateJournalBalanceData, ValidateJournalBalanceVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: ValidateJournalBalanceVariables): QueryRef<ValidateJournalBalanceData, ValidateJournalBalanceVariables>;
  operationName: string;
}
export const validateJournalBalanceRef: ValidateJournalBalanceRef;

export function validateJournalBalance(vars: ValidateJournalBalanceVariables, options?: ExecuteQueryOptions): QueryPromise<ValidateJournalBalanceData, ValidateJournalBalanceVariables>;
export function validateJournalBalance(dc: DataConnect, vars: ValidateJournalBalanceVariables, options?: ExecuteQueryOptions): QueryPromise<ValidateJournalBalanceData, ValidateJournalBalanceVariables>;

