# Generated TypeScript README
This README will guide you through the process of using the generated JavaScript SDK package for the connector `orbita2-connector`. It will also provide examples on how to use your generated SDK to call your Data Connect queries and mutations.

***NOTE:** This README is generated alongside the generated SDK. If you make changes to this file, they will be overwritten when the SDK is regenerated.*

# Table of Contents
- [**Overview**](#generated-javascript-readme)
- [**Accessing the connector**](#accessing-the-connector)
  - [*Connecting to the local Emulator*](#connecting-to-the-local-emulator)
- [**Queries**](#queries)
  - [*GetHouseholdAccounts*](#gethouseholdaccounts)
  - [*GetHouseholdNetBalances*](#gethouseholdnetbalances)
  - [*GetBudgets*](#getbudgets)
  - [*GetBudgetsByMonth*](#getbudgetsbymonth)
  - [*GetUnassignedCash*](#getunassignedcash)
  - [*GetSavingsProjects*](#getsavingsprojects)
  - [*GetExternalAssets*](#getexternalassets)
  - [*GetNetWorth*](#getnetworth)
  - [*GetLatestRate*](#getlatestrate)
  - [*GetExpensesByHousehold*](#getexpensesbyhousehold)
  - [*GetIncomesByHousehold*](#getincomesbyhousehold)
  - [*GetCurrentUser*](#getcurrentuser)
  - [*GetCategories*](#getcategories)
  - [*GetTags*](#gettags)
  - [*GetJournalTags*](#getjournaltags)
  - [*GetSettlements*](#getsettlements)
  - [*GetJournalBalanceV2*](#getjournalbalancev2)
  - [*NegativeEntries*](#negativeentries)
  - [*UnbalancedJournals*](#unbalancedjournals)
- [**Mutations**](#mutations)
  - [*CreateJournalWithEntries*](#createjournalwithentries)
  - [*CreateSharedExpenseWithProration*](#createsharedexpensewithproration)
  - [*CreateBudget*](#createbudget)
  - [*UpdateBudget*](#updatebudget)
  - [*DeleteBudget*](#deletebudget)
  - [*CreateAccount*](#createaccount)
  - [*UpdateAccount*](#updateaccount)
  - [*ArchiveAccount*](#archiveaccount)
  - [*DeleteAccount*](#deleteaccount)
  - [*ReassignEntries*](#reassignentries)
  - [*CreateSettlement*](#createsettlement)
  - [*DeleteSettlement*](#deletesettlement)
  - [*CreateSavingsProject*](#createsavingsproject)
  - [*UpdateProjectProgress*](#updateprojectprogress)
  - [*UpdateSavingsProject*](#updatesavingsproject)
  - [*CreateExternalAsset*](#createexternalasset)
  - [*UpdateExternalAsset*](#updateexternalasset)
  - [*UpsertExchangeRate*](#upsertexchangerate)
  - [*CreateHouseholdAndUser*](#createhouseholdanduser)
  - [*SeedDefaultAccounts*](#seeddefaultaccounts)
  - [*DeleteJournal*](#deletejournal)
  - [*UpdateJournalWithEntries*](#updatejournalwithentries)
  - [*UpdateSharedExpenseWithProration*](#updatesharedexpensewithproration)
  - [*CreateCategory*](#createcategory)
  - [*UpdateCategory*](#updatecategory)
  - [*DeleteCategory*](#deletecategory)
  - [*CreateTag*](#createtag)
  - [*DeleteTag*](#deletetag)
  - [*SetJournalTags*](#setjournaltags)
  - [*AddTagToJournal*](#addtagtojournal)

# Accessing the connector
A connector is a collection of Queries and Mutations. One SDK is generated for each connector - this SDK is generated for the connector `orbita2-connector`. You can find more information about connectors in the [Data Connect documentation](https://firebase.google.com/docs/data-connect#how-does).

You can use this generated SDK by importing from the package `@pareja-pro/dataconnect` as shown below. Both CommonJS and ESM imports are supported.

You can also follow the instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#set-client).

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@pareja-pro/dataconnect';

const dataConnect = getDataConnect(connectorConfig);
```

## Connecting to the local Emulator
By default, the connector will connect to the production service.

To connect to the emulator, you can use the following code.
You can also follow the emulator instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#instrument-clients).

```typescript
import { connectDataConnectEmulator, getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@pareja-pro/dataconnect';

const dataConnect = getDataConnect(connectorConfig);
connectDataConnectEmulator(dataConnect, 'localhost', 9399);
```

After it's initialized, you can call your Data Connect [queries](#queries) and [mutations](#mutations) from your generated SDK.

# Queries

There are two ways to execute a Data Connect Query using the generated Web SDK:
- Using a Query Reference function, which returns a `QueryRef`
  - The `QueryRef` can be used as an argument to `executeQuery()`, which will execute the Query and return a `QueryPromise`
- Using an action shortcut function, which returns a `QueryPromise`
  - Calling the action shortcut function will execute the Query and return a `QueryPromise`

The following is true for both the action shortcut function and the `QueryRef` function:
- The `QueryPromise` returned will resolve to the result of the Query once it has finished executing
- If the Query accepts arguments, both the action shortcut function and the `QueryRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Query
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `orbita2-connector` connector's generated functions to execute each query. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-queries).

## GetHouseholdAccounts
You can execute the `GetHouseholdAccounts` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
getHouseholdAccounts(vars: GetHouseholdAccountsVariables, options?: ExecuteQueryOptions): QueryPromise<GetHouseholdAccountsData, GetHouseholdAccountsVariables>;

interface GetHouseholdAccountsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetHouseholdAccountsVariables): QueryRef<GetHouseholdAccountsData, GetHouseholdAccountsVariables>;
}
export const getHouseholdAccountsRef: GetHouseholdAccountsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getHouseholdAccounts(dc: DataConnect, vars: GetHouseholdAccountsVariables, options?: ExecuteQueryOptions): QueryPromise<GetHouseholdAccountsData, GetHouseholdAccountsVariables>;

interface GetHouseholdAccountsRef {
  ...
  (dc: DataConnect, vars: GetHouseholdAccountsVariables): QueryRef<GetHouseholdAccountsData, GetHouseholdAccountsVariables>;
}
export const getHouseholdAccountsRef: GetHouseholdAccountsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getHouseholdAccountsRef:
```typescript
const name = getHouseholdAccountsRef.operationName;
console.log(name);
```

### Variables
The `GetHouseholdAccounts` query requires an argument of type `GetHouseholdAccountsVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetHouseholdAccountsVariables {
  householdId: UUIDString;
}
```
### Return Type
Recall that executing the `GetHouseholdAccounts` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetHouseholdAccountsData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `GetHouseholdAccounts`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getHouseholdAccounts, GetHouseholdAccountsVariables } from '@pareja-pro/dataconnect';

// The `GetHouseholdAccounts` query requires an argument of type `GetHouseholdAccountsVariables`:
const getHouseholdAccountsVars: GetHouseholdAccountsVariables = {
  householdId: ..., 
};

// Call the `getHouseholdAccounts()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getHouseholdAccounts(getHouseholdAccountsVars);
// Variables can be defined inline as well.
const { data } = await getHouseholdAccounts({ householdId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getHouseholdAccounts(dataConnect, getHouseholdAccountsVars);

console.log(data.accounts);

// Or, you can use the `Promise` API.
getHouseholdAccounts(getHouseholdAccountsVars).then((response) => {
  const data = response.data;
  console.log(data.accounts);
});
```

### Using `GetHouseholdAccounts`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getHouseholdAccountsRef, GetHouseholdAccountsVariables } from '@pareja-pro/dataconnect';

// The `GetHouseholdAccounts` query requires an argument of type `GetHouseholdAccountsVariables`:
const getHouseholdAccountsVars: GetHouseholdAccountsVariables = {
  householdId: ..., 
};

// Call the `getHouseholdAccountsRef()` function to get a reference to the query.
const ref = getHouseholdAccountsRef(getHouseholdAccountsVars);
// Variables can be defined inline as well.
const ref = getHouseholdAccountsRef({ householdId: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getHouseholdAccountsRef(dataConnect, getHouseholdAccountsVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.accounts);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.accounts);
});
```

## GetHouseholdNetBalances
You can execute the `GetHouseholdNetBalances` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
getHouseholdNetBalances(vars: GetHouseholdNetBalancesVariables, options?: ExecuteQueryOptions): QueryPromise<GetHouseholdNetBalancesData, GetHouseholdNetBalancesVariables>;

interface GetHouseholdNetBalancesRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetHouseholdNetBalancesVariables): QueryRef<GetHouseholdNetBalancesData, GetHouseholdNetBalancesVariables>;
}
export const getHouseholdNetBalancesRef: GetHouseholdNetBalancesRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getHouseholdNetBalances(dc: DataConnect, vars: GetHouseholdNetBalancesVariables, options?: ExecuteQueryOptions): QueryPromise<GetHouseholdNetBalancesData, GetHouseholdNetBalancesVariables>;

interface GetHouseholdNetBalancesRef {
  ...
  (dc: DataConnect, vars: GetHouseholdNetBalancesVariables): QueryRef<GetHouseholdNetBalancesData, GetHouseholdNetBalancesVariables>;
}
export const getHouseholdNetBalancesRef: GetHouseholdNetBalancesRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getHouseholdNetBalancesRef:
```typescript
const name = getHouseholdNetBalancesRef.operationName;
console.log(name);
```

### Variables
The `GetHouseholdNetBalances` query requires an argument of type `GetHouseholdNetBalancesVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetHouseholdNetBalancesVariables {
  householdId: UUIDString;
}
```
### Return Type
Recall that executing the `GetHouseholdNetBalances` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetHouseholdNetBalancesData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `GetHouseholdNetBalances`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getHouseholdNetBalances, GetHouseholdNetBalancesVariables } from '@pareja-pro/dataconnect';

// The `GetHouseholdNetBalances` query requires an argument of type `GetHouseholdNetBalancesVariables`:
const getHouseholdNetBalancesVars: GetHouseholdNetBalancesVariables = {
  householdId: ..., 
};

// Call the `getHouseholdNetBalances()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getHouseholdNetBalances(getHouseholdNetBalancesVars);
// Variables can be defined inline as well.
const { data } = await getHouseholdNetBalances({ householdId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getHouseholdNetBalances(dataConnect, getHouseholdNetBalancesVars);

console.log(data.entries);

// Or, you can use the `Promise` API.
getHouseholdNetBalances(getHouseholdNetBalancesVars).then((response) => {
  const data = response.data;
  console.log(data.entries);
});
```

### Using `GetHouseholdNetBalances`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getHouseholdNetBalancesRef, GetHouseholdNetBalancesVariables } from '@pareja-pro/dataconnect';

// The `GetHouseholdNetBalances` query requires an argument of type `GetHouseholdNetBalancesVariables`:
const getHouseholdNetBalancesVars: GetHouseholdNetBalancesVariables = {
  householdId: ..., 
};

// Call the `getHouseholdNetBalancesRef()` function to get a reference to the query.
const ref = getHouseholdNetBalancesRef(getHouseholdNetBalancesVars);
// Variables can be defined inline as well.
const ref = getHouseholdNetBalancesRef({ householdId: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getHouseholdNetBalancesRef(dataConnect, getHouseholdNetBalancesVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.entries);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.entries);
});
```

## GetBudgets
You can execute the `GetBudgets` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
getBudgets(vars: GetBudgetsVariables, options?: ExecuteQueryOptions): QueryPromise<GetBudgetsData, GetBudgetsVariables>;

interface GetBudgetsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetBudgetsVariables): QueryRef<GetBudgetsData, GetBudgetsVariables>;
}
export const getBudgetsRef: GetBudgetsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getBudgets(dc: DataConnect, vars: GetBudgetsVariables, options?: ExecuteQueryOptions): QueryPromise<GetBudgetsData, GetBudgetsVariables>;

interface GetBudgetsRef {
  ...
  (dc: DataConnect, vars: GetBudgetsVariables): QueryRef<GetBudgetsData, GetBudgetsVariables>;
}
export const getBudgetsRef: GetBudgetsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getBudgetsRef:
```typescript
const name = getBudgetsRef.operationName;
console.log(name);
```

### Variables
The `GetBudgets` query requires an argument of type `GetBudgetsVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetBudgetsVariables {
  householdId: UUIDString;
}
```
### Return Type
Recall that executing the `GetBudgets` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetBudgetsData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `GetBudgets`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getBudgets, GetBudgetsVariables } from '@pareja-pro/dataconnect';

// The `GetBudgets` query requires an argument of type `GetBudgetsVariables`:
const getBudgetsVars: GetBudgetsVariables = {
  householdId: ..., 
};

// Call the `getBudgets()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getBudgets(getBudgetsVars);
// Variables can be defined inline as well.
const { data } = await getBudgets({ householdId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getBudgets(dataConnect, getBudgetsVars);

console.log(data.budgets);

// Or, you can use the `Promise` API.
getBudgets(getBudgetsVars).then((response) => {
  const data = response.data;
  console.log(data.budgets);
});
```

### Using `GetBudgets`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getBudgetsRef, GetBudgetsVariables } from '@pareja-pro/dataconnect';

// The `GetBudgets` query requires an argument of type `GetBudgetsVariables`:
const getBudgetsVars: GetBudgetsVariables = {
  householdId: ..., 
};

// Call the `getBudgetsRef()` function to get a reference to the query.
const ref = getBudgetsRef(getBudgetsVars);
// Variables can be defined inline as well.
const ref = getBudgetsRef({ householdId: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getBudgetsRef(dataConnect, getBudgetsVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.budgets);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.budgets);
});
```

## GetBudgetsByMonth
You can execute the `GetBudgetsByMonth` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
getBudgetsByMonth(vars: GetBudgetsByMonthVariables, options?: ExecuteQueryOptions): QueryPromise<GetBudgetsByMonthData, GetBudgetsByMonthVariables>;

interface GetBudgetsByMonthRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetBudgetsByMonthVariables): QueryRef<GetBudgetsByMonthData, GetBudgetsByMonthVariables>;
}
export const getBudgetsByMonthRef: GetBudgetsByMonthRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getBudgetsByMonth(dc: DataConnect, vars: GetBudgetsByMonthVariables, options?: ExecuteQueryOptions): QueryPromise<GetBudgetsByMonthData, GetBudgetsByMonthVariables>;

interface GetBudgetsByMonthRef {
  ...
  (dc: DataConnect, vars: GetBudgetsByMonthVariables): QueryRef<GetBudgetsByMonthData, GetBudgetsByMonthVariables>;
}
export const getBudgetsByMonthRef: GetBudgetsByMonthRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getBudgetsByMonthRef:
```typescript
const name = getBudgetsByMonthRef.operationName;
console.log(name);
```

### Variables
The `GetBudgetsByMonth` query requires an argument of type `GetBudgetsByMonthVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetBudgetsByMonthVariables {
  householdId: UUIDString;
  period: DateString;
}
```
### Return Type
Recall that executing the `GetBudgetsByMonth` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetBudgetsByMonthData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `GetBudgetsByMonth`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getBudgetsByMonth, GetBudgetsByMonthVariables } from '@pareja-pro/dataconnect';

// The `GetBudgetsByMonth` query requires an argument of type `GetBudgetsByMonthVariables`:
const getBudgetsByMonthVars: GetBudgetsByMonthVariables = {
  householdId: ..., 
  period: ..., 
};

// Call the `getBudgetsByMonth()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getBudgetsByMonth(getBudgetsByMonthVars);
// Variables can be defined inline as well.
const { data } = await getBudgetsByMonth({ householdId: ..., period: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getBudgetsByMonth(dataConnect, getBudgetsByMonthVars);

console.log(data.budgets);

// Or, you can use the `Promise` API.
getBudgetsByMonth(getBudgetsByMonthVars).then((response) => {
  const data = response.data;
  console.log(data.budgets);
});
```

### Using `GetBudgetsByMonth`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getBudgetsByMonthRef, GetBudgetsByMonthVariables } from '@pareja-pro/dataconnect';

// The `GetBudgetsByMonth` query requires an argument of type `GetBudgetsByMonthVariables`:
const getBudgetsByMonthVars: GetBudgetsByMonthVariables = {
  householdId: ..., 
  period: ..., 
};

// Call the `getBudgetsByMonthRef()` function to get a reference to the query.
const ref = getBudgetsByMonthRef(getBudgetsByMonthVars);
// Variables can be defined inline as well.
const ref = getBudgetsByMonthRef({ householdId: ..., period: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getBudgetsByMonthRef(dataConnect, getBudgetsByMonthVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.budgets);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.budgets);
});
```

## GetUnassignedCash
You can execute the `GetUnassignedCash` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
getUnassignedCash(vars: GetUnassignedCashVariables, options?: ExecuteQueryOptions): QueryPromise<GetUnassignedCashData, GetUnassignedCashVariables>;

interface GetUnassignedCashRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetUnassignedCashVariables): QueryRef<GetUnassignedCashData, GetUnassignedCashVariables>;
}
export const getUnassignedCashRef: GetUnassignedCashRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getUnassignedCash(dc: DataConnect, vars: GetUnassignedCashVariables, options?: ExecuteQueryOptions): QueryPromise<GetUnassignedCashData, GetUnassignedCashVariables>;

interface GetUnassignedCashRef {
  ...
  (dc: DataConnect, vars: GetUnassignedCashVariables): QueryRef<GetUnassignedCashData, GetUnassignedCashVariables>;
}
export const getUnassignedCashRef: GetUnassignedCashRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getUnassignedCashRef:
```typescript
const name = getUnassignedCashRef.operationName;
console.log(name);
```

### Variables
The `GetUnassignedCash` query requires an argument of type `GetUnassignedCashVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetUnassignedCashVariables {
  householdId: UUIDString;
}
```
### Return Type
Recall that executing the `GetUnassignedCash` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetUnassignedCashData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetUnassignedCashData {
  unassignedCashV2s: ({
    unassigned?: number | null;
  })[];
}
```
### Using `GetUnassignedCash`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getUnassignedCash, GetUnassignedCashVariables } from '@pareja-pro/dataconnect';

// The `GetUnassignedCash` query requires an argument of type `GetUnassignedCashVariables`:
const getUnassignedCashVars: GetUnassignedCashVariables = {
  householdId: ..., 
};

// Call the `getUnassignedCash()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getUnassignedCash(getUnassignedCashVars);
// Variables can be defined inline as well.
const { data } = await getUnassignedCash({ householdId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getUnassignedCash(dataConnect, getUnassignedCashVars);

console.log(data.unassignedCashV2s);

// Or, you can use the `Promise` API.
getUnassignedCash(getUnassignedCashVars).then((response) => {
  const data = response.data;
  console.log(data.unassignedCashV2s);
});
```

### Using `GetUnassignedCash`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getUnassignedCashRef, GetUnassignedCashVariables } from '@pareja-pro/dataconnect';

// The `GetUnassignedCash` query requires an argument of type `GetUnassignedCashVariables`:
const getUnassignedCashVars: GetUnassignedCashVariables = {
  householdId: ..., 
};

// Call the `getUnassignedCashRef()` function to get a reference to the query.
const ref = getUnassignedCashRef(getUnassignedCashVars);
// Variables can be defined inline as well.
const ref = getUnassignedCashRef({ householdId: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getUnassignedCashRef(dataConnect, getUnassignedCashVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.unassignedCashV2s);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.unassignedCashV2s);
});
```

## GetSavingsProjects
You can execute the `GetSavingsProjects` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
getSavingsProjects(vars: GetSavingsProjectsVariables, options?: ExecuteQueryOptions): QueryPromise<GetSavingsProjectsData, GetSavingsProjectsVariables>;

interface GetSavingsProjectsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetSavingsProjectsVariables): QueryRef<GetSavingsProjectsData, GetSavingsProjectsVariables>;
}
export const getSavingsProjectsRef: GetSavingsProjectsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getSavingsProjects(dc: DataConnect, vars: GetSavingsProjectsVariables, options?: ExecuteQueryOptions): QueryPromise<GetSavingsProjectsData, GetSavingsProjectsVariables>;

interface GetSavingsProjectsRef {
  ...
  (dc: DataConnect, vars: GetSavingsProjectsVariables): QueryRef<GetSavingsProjectsData, GetSavingsProjectsVariables>;
}
export const getSavingsProjectsRef: GetSavingsProjectsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getSavingsProjectsRef:
```typescript
const name = getSavingsProjectsRef.operationName;
console.log(name);
```

### Variables
The `GetSavingsProjects` query requires an argument of type `GetSavingsProjectsVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetSavingsProjectsVariables {
  householdId: UUIDString;
}
```
### Return Type
Recall that executing the `GetSavingsProjects` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetSavingsProjectsData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `GetSavingsProjects`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getSavingsProjects, GetSavingsProjectsVariables } from '@pareja-pro/dataconnect';

// The `GetSavingsProjects` query requires an argument of type `GetSavingsProjectsVariables`:
const getSavingsProjectsVars: GetSavingsProjectsVariables = {
  householdId: ..., 
};

// Call the `getSavingsProjects()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getSavingsProjects(getSavingsProjectsVars);
// Variables can be defined inline as well.
const { data } = await getSavingsProjects({ householdId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getSavingsProjects(dataConnect, getSavingsProjectsVars);

console.log(data.savingsProjects);

// Or, you can use the `Promise` API.
getSavingsProjects(getSavingsProjectsVars).then((response) => {
  const data = response.data;
  console.log(data.savingsProjects);
});
```

### Using `GetSavingsProjects`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getSavingsProjectsRef, GetSavingsProjectsVariables } from '@pareja-pro/dataconnect';

// The `GetSavingsProjects` query requires an argument of type `GetSavingsProjectsVariables`:
const getSavingsProjectsVars: GetSavingsProjectsVariables = {
  householdId: ..., 
};

// Call the `getSavingsProjectsRef()` function to get a reference to the query.
const ref = getSavingsProjectsRef(getSavingsProjectsVars);
// Variables can be defined inline as well.
const ref = getSavingsProjectsRef({ householdId: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getSavingsProjectsRef(dataConnect, getSavingsProjectsVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.savingsProjects);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.savingsProjects);
});
```

## GetExternalAssets
You can execute the `GetExternalAssets` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
getExternalAssets(vars: GetExternalAssetsVariables, options?: ExecuteQueryOptions): QueryPromise<GetExternalAssetsData, GetExternalAssetsVariables>;

interface GetExternalAssetsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetExternalAssetsVariables): QueryRef<GetExternalAssetsData, GetExternalAssetsVariables>;
}
export const getExternalAssetsRef: GetExternalAssetsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getExternalAssets(dc: DataConnect, vars: GetExternalAssetsVariables, options?: ExecuteQueryOptions): QueryPromise<GetExternalAssetsData, GetExternalAssetsVariables>;

interface GetExternalAssetsRef {
  ...
  (dc: DataConnect, vars: GetExternalAssetsVariables): QueryRef<GetExternalAssetsData, GetExternalAssetsVariables>;
}
export const getExternalAssetsRef: GetExternalAssetsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getExternalAssetsRef:
```typescript
const name = getExternalAssetsRef.operationName;
console.log(name);
```

### Variables
The `GetExternalAssets` query requires an argument of type `GetExternalAssetsVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetExternalAssetsVariables {
  householdId: UUIDString;
}
```
### Return Type
Recall that executing the `GetExternalAssets` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetExternalAssetsData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetExternalAssetsData {
  externalAssets: ({
    id: UUIDString;
    name: string;
    estimatedValue: number;
    assetType: string;
  } & ExternalAsset_Key)[];
}
```
### Using `GetExternalAssets`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getExternalAssets, GetExternalAssetsVariables } from '@pareja-pro/dataconnect';

// The `GetExternalAssets` query requires an argument of type `GetExternalAssetsVariables`:
const getExternalAssetsVars: GetExternalAssetsVariables = {
  householdId: ..., 
};

// Call the `getExternalAssets()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getExternalAssets(getExternalAssetsVars);
// Variables can be defined inline as well.
const { data } = await getExternalAssets({ householdId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getExternalAssets(dataConnect, getExternalAssetsVars);

console.log(data.externalAssets);

// Or, you can use the `Promise` API.
getExternalAssets(getExternalAssetsVars).then((response) => {
  const data = response.data;
  console.log(data.externalAssets);
});
```

### Using `GetExternalAssets`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getExternalAssetsRef, GetExternalAssetsVariables } from '@pareja-pro/dataconnect';

// The `GetExternalAssets` query requires an argument of type `GetExternalAssetsVariables`:
const getExternalAssetsVars: GetExternalAssetsVariables = {
  householdId: ..., 
};

// Call the `getExternalAssetsRef()` function to get a reference to the query.
const ref = getExternalAssetsRef(getExternalAssetsVars);
// Variables can be defined inline as well.
const ref = getExternalAssetsRef({ householdId: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getExternalAssetsRef(dataConnect, getExternalAssetsVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.externalAssets);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.externalAssets);
});
```

## GetNetWorth
You can execute the `GetNetWorth` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
getNetWorth(vars: GetNetWorthVariables, options?: ExecuteQueryOptions): QueryPromise<GetNetWorthData, GetNetWorthVariables>;

interface GetNetWorthRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetNetWorthVariables): QueryRef<GetNetWorthData, GetNetWorthVariables>;
}
export const getNetWorthRef: GetNetWorthRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getNetWorth(dc: DataConnect, vars: GetNetWorthVariables, options?: ExecuteQueryOptions): QueryPromise<GetNetWorthData, GetNetWorthVariables>;

interface GetNetWorthRef {
  ...
  (dc: DataConnect, vars: GetNetWorthVariables): QueryRef<GetNetWorthData, GetNetWorthVariables>;
}
export const getNetWorthRef: GetNetWorthRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getNetWorthRef:
```typescript
const name = getNetWorthRef.operationName;
console.log(name);
```

### Variables
The `GetNetWorth` query requires an argument of type `GetNetWorthVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetNetWorthVariables {
  householdId: UUIDString;
}
```
### Return Type
Recall that executing the `GetNetWorth` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetNetWorthData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetNetWorthData {
  netWorthSnapshotV2s: ({
    netWorth?: number | null;
  })[];
}
```
### Using `GetNetWorth`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getNetWorth, GetNetWorthVariables } from '@pareja-pro/dataconnect';

// The `GetNetWorth` query requires an argument of type `GetNetWorthVariables`:
const getNetWorthVars: GetNetWorthVariables = {
  householdId: ..., 
};

// Call the `getNetWorth()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getNetWorth(getNetWorthVars);
// Variables can be defined inline as well.
const { data } = await getNetWorth({ householdId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getNetWorth(dataConnect, getNetWorthVars);

console.log(data.netWorthSnapshotV2s);

// Or, you can use the `Promise` API.
getNetWorth(getNetWorthVars).then((response) => {
  const data = response.data;
  console.log(data.netWorthSnapshotV2s);
});
```

### Using `GetNetWorth`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getNetWorthRef, GetNetWorthVariables } from '@pareja-pro/dataconnect';

// The `GetNetWorth` query requires an argument of type `GetNetWorthVariables`:
const getNetWorthVars: GetNetWorthVariables = {
  householdId: ..., 
};

// Call the `getNetWorthRef()` function to get a reference to the query.
const ref = getNetWorthRef(getNetWorthVars);
// Variables can be defined inline as well.
const ref = getNetWorthRef({ householdId: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getNetWorthRef(dataConnect, getNetWorthVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.netWorthSnapshotV2s);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.netWorthSnapshotV2s);
});
```

## GetLatestRate
You can execute the `GetLatestRate` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
getLatestRate(vars: GetLatestRateVariables, options?: ExecuteQueryOptions): QueryPromise<GetLatestRateData, GetLatestRateVariables>;

interface GetLatestRateRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetLatestRateVariables): QueryRef<GetLatestRateData, GetLatestRateVariables>;
}
export const getLatestRateRef: GetLatestRateRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getLatestRate(dc: DataConnect, vars: GetLatestRateVariables, options?: ExecuteQueryOptions): QueryPromise<GetLatestRateData, GetLatestRateVariables>;

interface GetLatestRateRef {
  ...
  (dc: DataConnect, vars: GetLatestRateVariables): QueryRef<GetLatestRateData, GetLatestRateVariables>;
}
export const getLatestRateRef: GetLatestRateRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getLatestRateRef:
```typescript
const name = getLatestRateRef.operationName;
console.log(name);
```

### Variables
The `GetLatestRate` query requires an argument of type `GetLatestRateVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetLatestRateVariables {
  currency: string;
}
```
### Return Type
Recall that executing the `GetLatestRate` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetLatestRateData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetLatestRateData {
  exchangeRates: ({
    rate: number;
    date: DateString;
  })[];
}
```
### Using `GetLatestRate`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getLatestRate, GetLatestRateVariables } from '@pareja-pro/dataconnect';

// The `GetLatestRate` query requires an argument of type `GetLatestRateVariables`:
const getLatestRateVars: GetLatestRateVariables = {
  currency: ..., 
};

// Call the `getLatestRate()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getLatestRate(getLatestRateVars);
// Variables can be defined inline as well.
const { data } = await getLatestRate({ currency: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getLatestRate(dataConnect, getLatestRateVars);

console.log(data.exchangeRates);

// Or, you can use the `Promise` API.
getLatestRate(getLatestRateVars).then((response) => {
  const data = response.data;
  console.log(data.exchangeRates);
});
```

### Using `GetLatestRate`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getLatestRateRef, GetLatestRateVariables } from '@pareja-pro/dataconnect';

// The `GetLatestRate` query requires an argument of type `GetLatestRateVariables`:
const getLatestRateVars: GetLatestRateVariables = {
  currency: ..., 
};

// Call the `getLatestRateRef()` function to get a reference to the query.
const ref = getLatestRateRef(getLatestRateVars);
// Variables can be defined inline as well.
const ref = getLatestRateRef({ currency: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getLatestRateRef(dataConnect, getLatestRateVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.exchangeRates);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.exchangeRates);
});
```

## GetExpensesByHousehold
You can execute the `GetExpensesByHousehold` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
getExpensesByHousehold(vars: GetExpensesByHouseholdVariables, options?: ExecuteQueryOptions): QueryPromise<GetExpensesByHouseholdData, GetExpensesByHouseholdVariables>;

interface GetExpensesByHouseholdRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetExpensesByHouseholdVariables): QueryRef<GetExpensesByHouseholdData, GetExpensesByHouseholdVariables>;
}
export const getExpensesByHouseholdRef: GetExpensesByHouseholdRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getExpensesByHousehold(dc: DataConnect, vars: GetExpensesByHouseholdVariables, options?: ExecuteQueryOptions): QueryPromise<GetExpensesByHouseholdData, GetExpensesByHouseholdVariables>;

interface GetExpensesByHouseholdRef {
  ...
  (dc: DataConnect, vars: GetExpensesByHouseholdVariables): QueryRef<GetExpensesByHouseholdData, GetExpensesByHouseholdVariables>;
}
export const getExpensesByHouseholdRef: GetExpensesByHouseholdRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getExpensesByHouseholdRef:
```typescript
const name = getExpensesByHouseholdRef.operationName;
console.log(name);
```

### Variables
The `GetExpensesByHousehold` query requires an argument of type `GetExpensesByHouseholdVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetExpensesByHouseholdVariables {
  householdId: UUIDString;
}
```
### Return Type
Recall that executing the `GetExpensesByHousehold` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetExpensesByHouseholdData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `GetExpensesByHousehold`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getExpensesByHousehold, GetExpensesByHouseholdVariables } from '@pareja-pro/dataconnect';

// The `GetExpensesByHousehold` query requires an argument of type `GetExpensesByHouseholdVariables`:
const getExpensesByHouseholdVars: GetExpensesByHouseholdVariables = {
  householdId: ..., 
};

// Call the `getExpensesByHousehold()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getExpensesByHousehold(getExpensesByHouseholdVars);
// Variables can be defined inline as well.
const { data } = await getExpensesByHousehold({ householdId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getExpensesByHousehold(dataConnect, getExpensesByHouseholdVars);

console.log(data.entries);

// Or, you can use the `Promise` API.
getExpensesByHousehold(getExpensesByHouseholdVars).then((response) => {
  const data = response.data;
  console.log(data.entries);
});
```

### Using `GetExpensesByHousehold`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getExpensesByHouseholdRef, GetExpensesByHouseholdVariables } from '@pareja-pro/dataconnect';

// The `GetExpensesByHousehold` query requires an argument of type `GetExpensesByHouseholdVariables`:
const getExpensesByHouseholdVars: GetExpensesByHouseholdVariables = {
  householdId: ..., 
};

// Call the `getExpensesByHouseholdRef()` function to get a reference to the query.
const ref = getExpensesByHouseholdRef(getExpensesByHouseholdVars);
// Variables can be defined inline as well.
const ref = getExpensesByHouseholdRef({ householdId: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getExpensesByHouseholdRef(dataConnect, getExpensesByHouseholdVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.entries);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.entries);
});
```

## GetIncomesByHousehold
You can execute the `GetIncomesByHousehold` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
getIncomesByHousehold(vars: GetIncomesByHouseholdVariables, options?: ExecuteQueryOptions): QueryPromise<GetIncomesByHouseholdData, GetIncomesByHouseholdVariables>;

interface GetIncomesByHouseholdRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetIncomesByHouseholdVariables): QueryRef<GetIncomesByHouseholdData, GetIncomesByHouseholdVariables>;
}
export const getIncomesByHouseholdRef: GetIncomesByHouseholdRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getIncomesByHousehold(dc: DataConnect, vars: GetIncomesByHouseholdVariables, options?: ExecuteQueryOptions): QueryPromise<GetIncomesByHouseholdData, GetIncomesByHouseholdVariables>;

interface GetIncomesByHouseholdRef {
  ...
  (dc: DataConnect, vars: GetIncomesByHouseholdVariables): QueryRef<GetIncomesByHouseholdData, GetIncomesByHouseholdVariables>;
}
export const getIncomesByHouseholdRef: GetIncomesByHouseholdRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getIncomesByHouseholdRef:
```typescript
const name = getIncomesByHouseholdRef.operationName;
console.log(name);
```

### Variables
The `GetIncomesByHousehold` query requires an argument of type `GetIncomesByHouseholdVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetIncomesByHouseholdVariables {
  householdId: UUIDString;
}
```
### Return Type
Recall that executing the `GetIncomesByHousehold` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetIncomesByHouseholdData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `GetIncomesByHousehold`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getIncomesByHousehold, GetIncomesByHouseholdVariables } from '@pareja-pro/dataconnect';

// The `GetIncomesByHousehold` query requires an argument of type `GetIncomesByHouseholdVariables`:
const getIncomesByHouseholdVars: GetIncomesByHouseholdVariables = {
  householdId: ..., 
};

// Call the `getIncomesByHousehold()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getIncomesByHousehold(getIncomesByHouseholdVars);
// Variables can be defined inline as well.
const { data } = await getIncomesByHousehold({ householdId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getIncomesByHousehold(dataConnect, getIncomesByHouseholdVars);

console.log(data.entries);

// Or, you can use the `Promise` API.
getIncomesByHousehold(getIncomesByHouseholdVars).then((response) => {
  const data = response.data;
  console.log(data.entries);
});
```

### Using `GetIncomesByHousehold`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getIncomesByHouseholdRef, GetIncomesByHouseholdVariables } from '@pareja-pro/dataconnect';

// The `GetIncomesByHousehold` query requires an argument of type `GetIncomesByHouseholdVariables`:
const getIncomesByHouseholdVars: GetIncomesByHouseholdVariables = {
  householdId: ..., 
};

// Call the `getIncomesByHouseholdRef()` function to get a reference to the query.
const ref = getIncomesByHouseholdRef(getIncomesByHouseholdVars);
// Variables can be defined inline as well.
const ref = getIncomesByHouseholdRef({ householdId: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getIncomesByHouseholdRef(dataConnect, getIncomesByHouseholdVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.entries);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.entries);
});
```

## GetCurrentUser
You can execute the `GetCurrentUser` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
getCurrentUser(options?: ExecuteQueryOptions): QueryPromise<GetCurrentUserData, undefined>;

interface GetCurrentUserRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<GetCurrentUserData, undefined>;
}
export const getCurrentUserRef: GetCurrentUserRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getCurrentUser(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<GetCurrentUserData, undefined>;

interface GetCurrentUserRef {
  ...
  (dc: DataConnect): QueryRef<GetCurrentUserData, undefined>;
}
export const getCurrentUserRef: GetCurrentUserRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getCurrentUserRef:
```typescript
const name = getCurrentUserRef.operationName;
console.log(name);
```

### Variables
The `GetCurrentUser` query has no variables.
### Return Type
Recall that executing the `GetCurrentUser` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetCurrentUserData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetCurrentUserData {
  user?: {
    uid: string;
    email: string;
    displayName?: string | null;
    householdId: UUIDString;
  } & User_Key;
}
```
### Using `GetCurrentUser`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getCurrentUser } from '@pareja-pro/dataconnect';


// Call the `getCurrentUser()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getCurrentUser();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getCurrentUser(dataConnect);

console.log(data.user);

// Or, you can use the `Promise` API.
getCurrentUser().then((response) => {
  const data = response.data;
  console.log(data.user);
});
```

### Using `GetCurrentUser`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getCurrentUserRef } from '@pareja-pro/dataconnect';


// Call the `getCurrentUserRef()` function to get a reference to the query.
const ref = getCurrentUserRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getCurrentUserRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.user);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.user);
});
```

## GetCategories
You can execute the `GetCategories` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
getCategories(vars: GetCategoriesVariables, options?: ExecuteQueryOptions): QueryPromise<GetCategoriesData, GetCategoriesVariables>;

interface GetCategoriesRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetCategoriesVariables): QueryRef<GetCategoriesData, GetCategoriesVariables>;
}
export const getCategoriesRef: GetCategoriesRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getCategories(dc: DataConnect, vars: GetCategoriesVariables, options?: ExecuteQueryOptions): QueryPromise<GetCategoriesData, GetCategoriesVariables>;

interface GetCategoriesRef {
  ...
  (dc: DataConnect, vars: GetCategoriesVariables): QueryRef<GetCategoriesData, GetCategoriesVariables>;
}
export const getCategoriesRef: GetCategoriesRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getCategoriesRef:
```typescript
const name = getCategoriesRef.operationName;
console.log(name);
```

### Variables
The `GetCategories` query requires an argument of type `GetCategoriesVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetCategoriesVariables {
  householdId: UUIDString;
}
```
### Return Type
Recall that executing the `GetCategories` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetCategoriesData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetCategoriesData {
  categories: ({
    id: UUIDString;
    name: string;
    type: AccountType;
    color?: string | null;
    ownerType: OwnerType;
  } & Category_Key)[];
}
```
### Using `GetCategories`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getCategories, GetCategoriesVariables } from '@pareja-pro/dataconnect';

// The `GetCategories` query requires an argument of type `GetCategoriesVariables`:
const getCategoriesVars: GetCategoriesVariables = {
  householdId: ..., 
};

// Call the `getCategories()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getCategories(getCategoriesVars);
// Variables can be defined inline as well.
const { data } = await getCategories({ householdId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getCategories(dataConnect, getCategoriesVars);

console.log(data.categories);

// Or, you can use the `Promise` API.
getCategories(getCategoriesVars).then((response) => {
  const data = response.data;
  console.log(data.categories);
});
```

### Using `GetCategories`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getCategoriesRef, GetCategoriesVariables } from '@pareja-pro/dataconnect';

// The `GetCategories` query requires an argument of type `GetCategoriesVariables`:
const getCategoriesVars: GetCategoriesVariables = {
  householdId: ..., 
};

// Call the `getCategoriesRef()` function to get a reference to the query.
const ref = getCategoriesRef(getCategoriesVars);
// Variables can be defined inline as well.
const ref = getCategoriesRef({ householdId: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getCategoriesRef(dataConnect, getCategoriesVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.categories);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.categories);
});
```

## GetTags
You can execute the `GetTags` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
getTags(vars: GetTagsVariables, options?: ExecuteQueryOptions): QueryPromise<GetTagsData, GetTagsVariables>;

interface GetTagsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetTagsVariables): QueryRef<GetTagsData, GetTagsVariables>;
}
export const getTagsRef: GetTagsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getTags(dc: DataConnect, vars: GetTagsVariables, options?: ExecuteQueryOptions): QueryPromise<GetTagsData, GetTagsVariables>;

interface GetTagsRef {
  ...
  (dc: DataConnect, vars: GetTagsVariables): QueryRef<GetTagsData, GetTagsVariables>;
}
export const getTagsRef: GetTagsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getTagsRef:
```typescript
const name = getTagsRef.operationName;
console.log(name);
```

### Variables
The `GetTags` query requires an argument of type `GetTagsVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetTagsVariables {
  householdId: UUIDString;
}
```
### Return Type
Recall that executing the `GetTags` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetTagsData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetTagsData {
  tags: ({
    id: UUIDString;
    name: string;
  } & Tag_Key)[];
}
```
### Using `GetTags`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getTags, GetTagsVariables } from '@pareja-pro/dataconnect';

// The `GetTags` query requires an argument of type `GetTagsVariables`:
const getTagsVars: GetTagsVariables = {
  householdId: ..., 
};

// Call the `getTags()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getTags(getTagsVars);
// Variables can be defined inline as well.
const { data } = await getTags({ householdId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getTags(dataConnect, getTagsVars);

console.log(data.tags);

// Or, you can use the `Promise` API.
getTags(getTagsVars).then((response) => {
  const data = response.data;
  console.log(data.tags);
});
```

### Using `GetTags`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getTagsRef, GetTagsVariables } from '@pareja-pro/dataconnect';

// The `GetTags` query requires an argument of type `GetTagsVariables`:
const getTagsVars: GetTagsVariables = {
  householdId: ..., 
};

// Call the `getTagsRef()` function to get a reference to the query.
const ref = getTagsRef(getTagsVars);
// Variables can be defined inline as well.
const ref = getTagsRef({ householdId: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getTagsRef(dataConnect, getTagsVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.tags);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.tags);
});
```

## GetJournalTags
You can execute the `GetJournalTags` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
getJournalTags(vars: GetJournalTagsVariables, options?: ExecuteQueryOptions): QueryPromise<GetJournalTagsData, GetJournalTagsVariables>;

interface GetJournalTagsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetJournalTagsVariables): QueryRef<GetJournalTagsData, GetJournalTagsVariables>;
}
export const getJournalTagsRef: GetJournalTagsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getJournalTags(dc: DataConnect, vars: GetJournalTagsVariables, options?: ExecuteQueryOptions): QueryPromise<GetJournalTagsData, GetJournalTagsVariables>;

interface GetJournalTagsRef {
  ...
  (dc: DataConnect, vars: GetJournalTagsVariables): QueryRef<GetJournalTagsData, GetJournalTagsVariables>;
}
export const getJournalTagsRef: GetJournalTagsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getJournalTagsRef:
```typescript
const name = getJournalTagsRef.operationName;
console.log(name);
```

### Variables
The `GetJournalTags` query requires an argument of type `GetJournalTagsVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetJournalTagsVariables {
  journalId: UUIDString;
  householdId: UUIDString;
}
```
### Return Type
Recall that executing the `GetJournalTags` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetJournalTagsData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetJournalTagsData {
  journalTags: ({
    tag: {
      id: UUIDString;
      name: string;
    } & Tag_Key;
  })[];
}
```
### Using `GetJournalTags`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getJournalTags, GetJournalTagsVariables } from '@pareja-pro/dataconnect';

// The `GetJournalTags` query requires an argument of type `GetJournalTagsVariables`:
const getJournalTagsVars: GetJournalTagsVariables = {
  journalId: ..., 
  householdId: ..., 
};

// Call the `getJournalTags()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getJournalTags(getJournalTagsVars);
// Variables can be defined inline as well.
const { data } = await getJournalTags({ journalId: ..., householdId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getJournalTags(dataConnect, getJournalTagsVars);

console.log(data.journalTags);

// Or, you can use the `Promise` API.
getJournalTags(getJournalTagsVars).then((response) => {
  const data = response.data;
  console.log(data.journalTags);
});
```

### Using `GetJournalTags`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getJournalTagsRef, GetJournalTagsVariables } from '@pareja-pro/dataconnect';

// The `GetJournalTags` query requires an argument of type `GetJournalTagsVariables`:
const getJournalTagsVars: GetJournalTagsVariables = {
  journalId: ..., 
  householdId: ..., 
};

// Call the `getJournalTagsRef()` function to get a reference to the query.
const ref = getJournalTagsRef(getJournalTagsVars);
// Variables can be defined inline as well.
const ref = getJournalTagsRef({ journalId: ..., householdId: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getJournalTagsRef(dataConnect, getJournalTagsVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.journalTags);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.journalTags);
});
```

## GetSettlements
You can execute the `GetSettlements` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
getSettlements(vars: GetSettlementsVariables, options?: ExecuteQueryOptions): QueryPromise<GetSettlementsData, GetSettlementsVariables>;

interface GetSettlementsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetSettlementsVariables): QueryRef<GetSettlementsData, GetSettlementsVariables>;
}
export const getSettlementsRef: GetSettlementsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getSettlements(dc: DataConnect, vars: GetSettlementsVariables, options?: ExecuteQueryOptions): QueryPromise<GetSettlementsData, GetSettlementsVariables>;

interface GetSettlementsRef {
  ...
  (dc: DataConnect, vars: GetSettlementsVariables): QueryRef<GetSettlementsData, GetSettlementsVariables>;
}
export const getSettlementsRef: GetSettlementsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getSettlementsRef:
```typescript
const name = getSettlementsRef.operationName;
console.log(name);
```

### Variables
The `GetSettlements` query requires an argument of type `GetSettlementsVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetSettlementsVariables {
  householdId: UUIDString;
}
```
### Return Type
Recall that executing the `GetSettlements` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetSettlementsData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetSettlementsData {
  settlements: ({
    id: UUIDString;
    ownerType: OwnerType;
    amount: number;
    note?: string | null;
    createdAt: TimestampString;
  } & Settlement_Key)[];
}
```
### Using `GetSettlements`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getSettlements, GetSettlementsVariables } from '@pareja-pro/dataconnect';

// The `GetSettlements` query requires an argument of type `GetSettlementsVariables`:
const getSettlementsVars: GetSettlementsVariables = {
  householdId: ..., 
};

// Call the `getSettlements()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getSettlements(getSettlementsVars);
// Variables can be defined inline as well.
const { data } = await getSettlements({ householdId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getSettlements(dataConnect, getSettlementsVars);

console.log(data.settlements);

// Or, you can use the `Promise` API.
getSettlements(getSettlementsVars).then((response) => {
  const data = response.data;
  console.log(data.settlements);
});
```

### Using `GetSettlements`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getSettlementsRef, GetSettlementsVariables } from '@pareja-pro/dataconnect';

// The `GetSettlements` query requires an argument of type `GetSettlementsVariables`:
const getSettlementsVars: GetSettlementsVariables = {
  householdId: ..., 
};

// Call the `getSettlementsRef()` function to get a reference to the query.
const ref = getSettlementsRef(getSettlementsVars);
// Variables can be defined inline as well.
const ref = getSettlementsRef({ householdId: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getSettlementsRef(dataConnect, getSettlementsVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.settlements);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.settlements);
});
```

## GetJournalBalanceV2
You can execute the `GetJournalBalanceV2` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
getJournalBalanceV2(vars: GetJournalBalanceV2Variables, options?: ExecuteQueryOptions): QueryPromise<GetJournalBalanceV2Data, GetJournalBalanceV2Variables>;

interface GetJournalBalanceV2Ref {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetJournalBalanceV2Variables): QueryRef<GetJournalBalanceV2Data, GetJournalBalanceV2Variables>;
}
export const getJournalBalanceV2Ref: GetJournalBalanceV2Ref;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getJournalBalanceV2(dc: DataConnect, vars: GetJournalBalanceV2Variables, options?: ExecuteQueryOptions): QueryPromise<GetJournalBalanceV2Data, GetJournalBalanceV2Variables>;

interface GetJournalBalanceV2Ref {
  ...
  (dc: DataConnect, vars: GetJournalBalanceV2Variables): QueryRef<GetJournalBalanceV2Data, GetJournalBalanceV2Variables>;
}
export const getJournalBalanceV2Ref: GetJournalBalanceV2Ref;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getJournalBalanceV2Ref:
```typescript
const name = getJournalBalanceV2Ref.operationName;
console.log(name);
```

### Variables
The `GetJournalBalanceV2` query requires an argument of type `GetJournalBalanceV2Variables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetJournalBalanceV2Variables {
  journalId: UUIDString;
  householdId: UUIDString;
}
```
### Return Type
Recall that executing the `GetJournalBalanceV2` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetJournalBalanceV2Data`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetJournalBalanceV2Data {
  journalBalanceV2s: ({
    diff?: number | null;
  })[];
}
```
### Using `GetJournalBalanceV2`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getJournalBalanceV2, GetJournalBalanceV2Variables } from '@pareja-pro/dataconnect';

// The `GetJournalBalanceV2` query requires an argument of type `GetJournalBalanceV2Variables`:
const getJournalBalanceV2Vars: GetJournalBalanceV2Variables = {
  journalId: ..., 
  householdId: ..., 
};

// Call the `getJournalBalanceV2()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getJournalBalanceV2(getJournalBalanceV2Vars);
// Variables can be defined inline as well.
const { data } = await getJournalBalanceV2({ journalId: ..., householdId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getJournalBalanceV2(dataConnect, getJournalBalanceV2Vars);

console.log(data.journalBalanceV2s);

// Or, you can use the `Promise` API.
getJournalBalanceV2(getJournalBalanceV2Vars).then((response) => {
  const data = response.data;
  console.log(data.journalBalanceV2s);
});
```

### Using `GetJournalBalanceV2`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getJournalBalanceV2Ref, GetJournalBalanceV2Variables } from '@pareja-pro/dataconnect';

// The `GetJournalBalanceV2` query requires an argument of type `GetJournalBalanceV2Variables`:
const getJournalBalanceV2Vars: GetJournalBalanceV2Variables = {
  journalId: ..., 
  householdId: ..., 
};

// Call the `getJournalBalanceV2Ref()` function to get a reference to the query.
const ref = getJournalBalanceV2Ref(getJournalBalanceV2Vars);
// Variables can be defined inline as well.
const ref = getJournalBalanceV2Ref({ journalId: ..., householdId: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getJournalBalanceV2Ref(dataConnect, getJournalBalanceV2Vars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.journalBalanceV2s);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.journalBalanceV2s);
});
```

## NegativeEntries
You can execute the `NegativeEntries` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
negativeEntries(options?: ExecuteQueryOptions): QueryPromise<NegativeEntriesData, undefined>;

interface NegativeEntriesRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<NegativeEntriesData, undefined>;
}
export const negativeEntriesRef: NegativeEntriesRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
negativeEntries(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<NegativeEntriesData, undefined>;

interface NegativeEntriesRef {
  ...
  (dc: DataConnect): QueryRef<NegativeEntriesData, undefined>;
}
export const negativeEntriesRef: NegativeEntriesRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the negativeEntriesRef:
```typescript
const name = negativeEntriesRef.operationName;
console.log(name);
```

### Variables
The `NegativeEntries` query has no variables.
### Return Type
Recall that executing the `NegativeEntries` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `NegativeEntriesData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `NegativeEntries`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, negativeEntries } from '@pareja-pro/dataconnect';


// Call the `negativeEntries()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await negativeEntries();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await negativeEntries(dataConnect);

console.log(data.entries);

// Or, you can use the `Promise` API.
negativeEntries().then((response) => {
  const data = response.data;
  console.log(data.entries);
});
```

### Using `NegativeEntries`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, negativeEntriesRef } from '@pareja-pro/dataconnect';


// Call the `negativeEntriesRef()` function to get a reference to the query.
const ref = negativeEntriesRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = negativeEntriesRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.entries);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.entries);
});
```

## UnbalancedJournals
You can execute the `UnbalancedJournals` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
unbalancedJournals(options?: ExecuteQueryOptions): QueryPromise<UnbalancedJournalsData, undefined>;

interface UnbalancedJournalsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<UnbalancedJournalsData, undefined>;
}
export const unbalancedJournalsRef: UnbalancedJournalsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
unbalancedJournals(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<UnbalancedJournalsData, undefined>;

interface UnbalancedJournalsRef {
  ...
  (dc: DataConnect): QueryRef<UnbalancedJournalsData, undefined>;
}
export const unbalancedJournalsRef: UnbalancedJournalsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the unbalancedJournalsRef:
```typescript
const name = unbalancedJournalsRef.operationName;
console.log(name);
```

### Variables
The `UnbalancedJournals` query has no variables.
### Return Type
Recall that executing the `UnbalancedJournals` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UnbalancedJournalsData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UnbalancedJournalsData {
  journalBalanceV2s: ({
    journalId?: UUIDString | null;
    diff?: number | null;
  })[];
}
```
### Using `UnbalancedJournals`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, unbalancedJournals } from '@pareja-pro/dataconnect';


// Call the `unbalancedJournals()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await unbalancedJournals();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await unbalancedJournals(dataConnect);

console.log(data.journalBalanceV2s);

// Or, you can use the `Promise` API.
unbalancedJournals().then((response) => {
  const data = response.data;
  console.log(data.journalBalanceV2s);
});
```

### Using `UnbalancedJournals`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, unbalancedJournalsRef } from '@pareja-pro/dataconnect';


// Call the `unbalancedJournalsRef()` function to get a reference to the query.
const ref = unbalancedJournalsRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = unbalancedJournalsRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.journalBalanceV2s);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.journalBalanceV2s);
});
```

# Mutations

There are two ways to execute a Data Connect Mutation using the generated Web SDK:
- Using a Mutation Reference function, which returns a `MutationRef`
  - The `MutationRef` can be used as an argument to `executeMutation()`, which will execute the Mutation and return a `MutationPromise`
- Using an action shortcut function, which returns a `MutationPromise`
  - Calling the action shortcut function will execute the Mutation and return a `MutationPromise`

The following is true for both the action shortcut function and the `MutationRef` function:
- The `MutationPromise` returned will resolve to the result of the Mutation once it has finished executing
- If the Mutation accepts arguments, both the action shortcut function and the `MutationRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Mutation
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `orbita2-connector` connector's generated functions to execute each mutation. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-mutations).

## CreateJournalWithEntries
You can execute the `CreateJournalWithEntries` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
createJournalWithEntries(vars: CreateJournalWithEntriesVariables): MutationPromise<CreateJournalWithEntriesData, CreateJournalWithEntriesVariables>;

interface CreateJournalWithEntriesRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateJournalWithEntriesVariables): MutationRef<CreateJournalWithEntriesData, CreateJournalWithEntriesVariables>;
}
export const createJournalWithEntriesRef: CreateJournalWithEntriesRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createJournalWithEntries(dc: DataConnect, vars: CreateJournalWithEntriesVariables): MutationPromise<CreateJournalWithEntriesData, CreateJournalWithEntriesVariables>;

interface CreateJournalWithEntriesRef {
  ...
  (dc: DataConnect, vars: CreateJournalWithEntriesVariables): MutationRef<CreateJournalWithEntriesData, CreateJournalWithEntriesVariables>;
}
export const createJournalWithEntriesRef: CreateJournalWithEntriesRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createJournalWithEntriesRef:
```typescript
const name = createJournalWithEntriesRef.operationName;
console.log(name);
```

### Variables
The `CreateJournalWithEntries` mutation requires an argument of type `CreateJournalWithEntriesVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
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
```
### Return Type
Recall that executing the `CreateJournalWithEntries` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateJournalWithEntriesData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateJournalWithEntriesData {
  journal_insert: Journal_Key;
  debitEntry: Entry_Key;
  creditEntry: Entry_Key;
}
```
### Using `CreateJournalWithEntries`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createJournalWithEntries, CreateJournalWithEntriesVariables } from '@pareja-pro/dataconnect';

// The `CreateJournalWithEntries` mutation requires an argument of type `CreateJournalWithEntriesVariables`:
const createJournalWithEntriesVars: CreateJournalWithEntriesVariables = {
  householdId: ..., 
  date: ..., 
  description: ..., 
  amount: ..., 
  debitAccountId: ..., 
  creditAccountId: ..., 
  prorataFactor: ..., 
  ownerUid: ..., 
  isShared: ..., 
  isInternalTransfer: ..., // optional
  incomeCategoryType: ..., // optional
  isMsi: ..., // optional
  msiRefId: ..., // optional
  msiMonthNumber: ..., // optional
  isRecurring: ..., // optional
  recurringFrequency: ..., // optional
  recurringEndDate: ..., // optional
  categoryId: ..., // optional
};

// Call the `createJournalWithEntries()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createJournalWithEntries(createJournalWithEntriesVars);
// Variables can be defined inline as well.
const { data } = await createJournalWithEntries({ householdId: ..., date: ..., description: ..., amount: ..., debitAccountId: ..., creditAccountId: ..., prorataFactor: ..., ownerUid: ..., isShared: ..., isInternalTransfer: ..., incomeCategoryType: ..., isMsi: ..., msiRefId: ..., msiMonthNumber: ..., isRecurring: ..., recurringFrequency: ..., recurringEndDate: ..., categoryId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createJournalWithEntries(dataConnect, createJournalWithEntriesVars);

console.log(data.journal_insert);
console.log(data.debitEntry);
console.log(data.creditEntry);

// Or, you can use the `Promise` API.
createJournalWithEntries(createJournalWithEntriesVars).then((response) => {
  const data = response.data;
  console.log(data.journal_insert);
  console.log(data.debitEntry);
  console.log(data.creditEntry);
});
```

### Using `CreateJournalWithEntries`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createJournalWithEntriesRef, CreateJournalWithEntriesVariables } from '@pareja-pro/dataconnect';

// The `CreateJournalWithEntries` mutation requires an argument of type `CreateJournalWithEntriesVariables`:
const createJournalWithEntriesVars: CreateJournalWithEntriesVariables = {
  householdId: ..., 
  date: ..., 
  description: ..., 
  amount: ..., 
  debitAccountId: ..., 
  creditAccountId: ..., 
  prorataFactor: ..., 
  ownerUid: ..., 
  isShared: ..., 
  isInternalTransfer: ..., // optional
  incomeCategoryType: ..., // optional
  isMsi: ..., // optional
  msiRefId: ..., // optional
  msiMonthNumber: ..., // optional
  isRecurring: ..., // optional
  recurringFrequency: ..., // optional
  recurringEndDate: ..., // optional
  categoryId: ..., // optional
};

// Call the `createJournalWithEntriesRef()` function to get a reference to the mutation.
const ref = createJournalWithEntriesRef(createJournalWithEntriesVars);
// Variables can be defined inline as well.
const ref = createJournalWithEntriesRef({ householdId: ..., date: ..., description: ..., amount: ..., debitAccountId: ..., creditAccountId: ..., prorataFactor: ..., ownerUid: ..., isShared: ..., isInternalTransfer: ..., incomeCategoryType: ..., isMsi: ..., msiRefId: ..., msiMonthNumber: ..., isRecurring: ..., recurringFrequency: ..., recurringEndDate: ..., categoryId: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createJournalWithEntriesRef(dataConnect, createJournalWithEntriesVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.journal_insert);
console.log(data.debitEntry);
console.log(data.creditEntry);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.journal_insert);
  console.log(data.debitEntry);
  console.log(data.creditEntry);
});
```

## CreateSharedExpenseWithProration
You can execute the `CreateSharedExpenseWithProration` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
createSharedExpenseWithProration(vars: CreateSharedExpenseWithProrationVariables): MutationPromise<CreateSharedExpenseWithProrationData, CreateSharedExpenseWithProrationVariables>;

interface CreateSharedExpenseWithProrationRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateSharedExpenseWithProrationVariables): MutationRef<CreateSharedExpenseWithProrationData, CreateSharedExpenseWithProrationVariables>;
}
export const createSharedExpenseWithProrationRef: CreateSharedExpenseWithProrationRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createSharedExpenseWithProration(dc: DataConnect, vars: CreateSharedExpenseWithProrationVariables): MutationPromise<CreateSharedExpenseWithProrationData, CreateSharedExpenseWithProrationVariables>;

interface CreateSharedExpenseWithProrationRef {
  ...
  (dc: DataConnect, vars: CreateSharedExpenseWithProrationVariables): MutationRef<CreateSharedExpenseWithProrationData, CreateSharedExpenseWithProrationVariables>;
}
export const createSharedExpenseWithProrationRef: CreateSharedExpenseWithProrationRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createSharedExpenseWithProrationRef:
```typescript
const name = createSharedExpenseWithProrationRef.operationName;
console.log(name);
```

### Variables
The `CreateSharedExpenseWithProration` mutation requires an argument of type `CreateSharedExpenseWithProrationVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
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
```
### Return Type
Recall that executing the `CreateSharedExpenseWithProration` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateSharedExpenseWithProrationData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateSharedExpenseWithProrationData {
  journal_insert: Journal_Key;
  payerEntry: Entry_Key;
  user1Entry: Entry_Key;
  user2Entry: Entry_Key;
}
```
### Using `CreateSharedExpenseWithProration`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createSharedExpenseWithProration, CreateSharedExpenseWithProrationVariables } from '@pareja-pro/dataconnect';

// The `CreateSharedExpenseWithProration` mutation requires an argument of type `CreateSharedExpenseWithProrationVariables`:
const createSharedExpenseWithProrationVars: CreateSharedExpenseWithProrationVariables = {
  householdId: ..., 
  date: ..., 
  description: ..., 
  totalAmount: ..., 
  prorataFactor: ..., 
  payerAccountId: ..., 
  user1ExpenseAccountId: ..., 
  user2ExpenseAccountId: ..., 
  user1Amount: ..., 
  user2Amount: ..., 
  ownerUid: ..., 
  isShared: ..., 
  isMsi: ..., // optional
  msiRefId: ..., // optional
  msiMonthNumber: ..., // optional
  isRecurring: ..., // optional
  recurringFrequency: ..., // optional
  recurringEndDate: ..., // optional
  categoryId: ..., // optional
};

// Call the `createSharedExpenseWithProration()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createSharedExpenseWithProration(createSharedExpenseWithProrationVars);
// Variables can be defined inline as well.
const { data } = await createSharedExpenseWithProration({ householdId: ..., date: ..., description: ..., totalAmount: ..., prorataFactor: ..., payerAccountId: ..., user1ExpenseAccountId: ..., user2ExpenseAccountId: ..., user1Amount: ..., user2Amount: ..., ownerUid: ..., isShared: ..., isMsi: ..., msiRefId: ..., msiMonthNumber: ..., isRecurring: ..., recurringFrequency: ..., recurringEndDate: ..., categoryId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createSharedExpenseWithProration(dataConnect, createSharedExpenseWithProrationVars);

console.log(data.journal_insert);
console.log(data.payerEntry);
console.log(data.user1Entry);
console.log(data.user2Entry);

// Or, you can use the `Promise` API.
createSharedExpenseWithProration(createSharedExpenseWithProrationVars).then((response) => {
  const data = response.data;
  console.log(data.journal_insert);
  console.log(data.payerEntry);
  console.log(data.user1Entry);
  console.log(data.user2Entry);
});
```

### Using `CreateSharedExpenseWithProration`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createSharedExpenseWithProrationRef, CreateSharedExpenseWithProrationVariables } from '@pareja-pro/dataconnect';

// The `CreateSharedExpenseWithProration` mutation requires an argument of type `CreateSharedExpenseWithProrationVariables`:
const createSharedExpenseWithProrationVars: CreateSharedExpenseWithProrationVariables = {
  householdId: ..., 
  date: ..., 
  description: ..., 
  totalAmount: ..., 
  prorataFactor: ..., 
  payerAccountId: ..., 
  user1ExpenseAccountId: ..., 
  user2ExpenseAccountId: ..., 
  user1Amount: ..., 
  user2Amount: ..., 
  ownerUid: ..., 
  isShared: ..., 
  isMsi: ..., // optional
  msiRefId: ..., // optional
  msiMonthNumber: ..., // optional
  isRecurring: ..., // optional
  recurringFrequency: ..., // optional
  recurringEndDate: ..., // optional
  categoryId: ..., // optional
};

// Call the `createSharedExpenseWithProrationRef()` function to get a reference to the mutation.
const ref = createSharedExpenseWithProrationRef(createSharedExpenseWithProrationVars);
// Variables can be defined inline as well.
const ref = createSharedExpenseWithProrationRef({ householdId: ..., date: ..., description: ..., totalAmount: ..., prorataFactor: ..., payerAccountId: ..., user1ExpenseAccountId: ..., user2ExpenseAccountId: ..., user1Amount: ..., user2Amount: ..., ownerUid: ..., isShared: ..., isMsi: ..., msiRefId: ..., msiMonthNumber: ..., isRecurring: ..., recurringFrequency: ..., recurringEndDate: ..., categoryId: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createSharedExpenseWithProrationRef(dataConnect, createSharedExpenseWithProrationVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.journal_insert);
console.log(data.payerEntry);
console.log(data.user1Entry);
console.log(data.user2Entry);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.journal_insert);
  console.log(data.payerEntry);
  console.log(data.user1Entry);
  console.log(data.user2Entry);
});
```

## CreateBudget
You can execute the `CreateBudget` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
createBudget(vars: CreateBudgetVariables): MutationPromise<CreateBudgetData, CreateBudgetVariables>;

interface CreateBudgetRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateBudgetVariables): MutationRef<CreateBudgetData, CreateBudgetVariables>;
}
export const createBudgetRef: CreateBudgetRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createBudget(dc: DataConnect, vars: CreateBudgetVariables): MutationPromise<CreateBudgetData, CreateBudgetVariables>;

interface CreateBudgetRef {
  ...
  (dc: DataConnect, vars: CreateBudgetVariables): MutationRef<CreateBudgetData, CreateBudgetVariables>;
}
export const createBudgetRef: CreateBudgetRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createBudgetRef:
```typescript
const name = createBudgetRef.operationName;
console.log(name);
```

### Variables
The `CreateBudget` mutation requires an argument of type `CreateBudgetVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreateBudgetVariables {
  householdId: UUIDString;
  categoryId: UUIDString;
  ownerType: OwnerType;
  period: DateString;
  assignedAmount: number;
}
```
### Return Type
Recall that executing the `CreateBudget` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateBudgetData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateBudgetData {
  budget_insert: Budget_Key;
}
```
### Using `CreateBudget`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createBudget, CreateBudgetVariables } from '@pareja-pro/dataconnect';

// The `CreateBudget` mutation requires an argument of type `CreateBudgetVariables`:
const createBudgetVars: CreateBudgetVariables = {
  householdId: ..., 
  categoryId: ..., 
  ownerType: ..., 
  period: ..., 
  assignedAmount: ..., 
};

// Call the `createBudget()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createBudget(createBudgetVars);
// Variables can be defined inline as well.
const { data } = await createBudget({ householdId: ..., categoryId: ..., ownerType: ..., period: ..., assignedAmount: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createBudget(dataConnect, createBudgetVars);

console.log(data.budget_insert);

// Or, you can use the `Promise` API.
createBudget(createBudgetVars).then((response) => {
  const data = response.data;
  console.log(data.budget_insert);
});
```

### Using `CreateBudget`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createBudgetRef, CreateBudgetVariables } from '@pareja-pro/dataconnect';

// The `CreateBudget` mutation requires an argument of type `CreateBudgetVariables`:
const createBudgetVars: CreateBudgetVariables = {
  householdId: ..., 
  categoryId: ..., 
  ownerType: ..., 
  period: ..., 
  assignedAmount: ..., 
};

// Call the `createBudgetRef()` function to get a reference to the mutation.
const ref = createBudgetRef(createBudgetVars);
// Variables can be defined inline as well.
const ref = createBudgetRef({ householdId: ..., categoryId: ..., ownerType: ..., period: ..., assignedAmount: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createBudgetRef(dataConnect, createBudgetVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.budget_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.budget_insert);
});
```

## UpdateBudget
You can execute the `UpdateBudget` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
updateBudget(vars: UpdateBudgetVariables): MutationPromise<UpdateBudgetData, UpdateBudgetVariables>;

interface UpdateBudgetRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateBudgetVariables): MutationRef<UpdateBudgetData, UpdateBudgetVariables>;
}
export const updateBudgetRef: UpdateBudgetRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updateBudget(dc: DataConnect, vars: UpdateBudgetVariables): MutationPromise<UpdateBudgetData, UpdateBudgetVariables>;

interface UpdateBudgetRef {
  ...
  (dc: DataConnect, vars: UpdateBudgetVariables): MutationRef<UpdateBudgetData, UpdateBudgetVariables>;
}
export const updateBudgetRef: UpdateBudgetRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updateBudgetRef:
```typescript
const name = updateBudgetRef.operationName;
console.log(name);
```

### Variables
The `UpdateBudget` mutation requires an argument of type `UpdateBudgetVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpdateBudgetVariables {
  id: UUIDString;
  householdId: UUIDString;
  assignedAmount: number;
}
```
### Return Type
Recall that executing the `UpdateBudget` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdateBudgetData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdateBudgetData {
  budget_update?: Budget_Key | null;
}
```
### Using `UpdateBudget`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updateBudget, UpdateBudgetVariables } from '@pareja-pro/dataconnect';

// The `UpdateBudget` mutation requires an argument of type `UpdateBudgetVariables`:
const updateBudgetVars: UpdateBudgetVariables = {
  id: ..., 
  householdId: ..., 
  assignedAmount: ..., 
};

// Call the `updateBudget()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updateBudget(updateBudgetVars);
// Variables can be defined inline as well.
const { data } = await updateBudget({ id: ..., householdId: ..., assignedAmount: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updateBudget(dataConnect, updateBudgetVars);

console.log(data.budget_update);

// Or, you can use the `Promise` API.
updateBudget(updateBudgetVars).then((response) => {
  const data = response.data;
  console.log(data.budget_update);
});
```

### Using `UpdateBudget`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updateBudgetRef, UpdateBudgetVariables } from '@pareja-pro/dataconnect';

// The `UpdateBudget` mutation requires an argument of type `UpdateBudgetVariables`:
const updateBudgetVars: UpdateBudgetVariables = {
  id: ..., 
  householdId: ..., 
  assignedAmount: ..., 
};

// Call the `updateBudgetRef()` function to get a reference to the mutation.
const ref = updateBudgetRef(updateBudgetVars);
// Variables can be defined inline as well.
const ref = updateBudgetRef({ id: ..., householdId: ..., assignedAmount: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updateBudgetRef(dataConnect, updateBudgetVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.budget_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.budget_update);
});
```

## DeleteBudget
You can execute the `DeleteBudget` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
deleteBudget(vars: DeleteBudgetVariables): MutationPromise<DeleteBudgetData, DeleteBudgetVariables>;

interface DeleteBudgetRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteBudgetVariables): MutationRef<DeleteBudgetData, DeleteBudgetVariables>;
}
export const deleteBudgetRef: DeleteBudgetRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
deleteBudget(dc: DataConnect, vars: DeleteBudgetVariables): MutationPromise<DeleteBudgetData, DeleteBudgetVariables>;

interface DeleteBudgetRef {
  ...
  (dc: DataConnect, vars: DeleteBudgetVariables): MutationRef<DeleteBudgetData, DeleteBudgetVariables>;
}
export const deleteBudgetRef: DeleteBudgetRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the deleteBudgetRef:
```typescript
const name = deleteBudgetRef.operationName;
console.log(name);
```

### Variables
The `DeleteBudget` mutation requires an argument of type `DeleteBudgetVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface DeleteBudgetVariables {
  id: UUIDString;
  householdId: UUIDString;
}
```
### Return Type
Recall that executing the `DeleteBudget` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `DeleteBudgetData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface DeleteBudgetData {
  budget_delete?: Budget_Key | null;
}
```
### Using `DeleteBudget`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, deleteBudget, DeleteBudgetVariables } from '@pareja-pro/dataconnect';

// The `DeleteBudget` mutation requires an argument of type `DeleteBudgetVariables`:
const deleteBudgetVars: DeleteBudgetVariables = {
  id: ..., 
  householdId: ..., 
};

// Call the `deleteBudget()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await deleteBudget(deleteBudgetVars);
// Variables can be defined inline as well.
const { data } = await deleteBudget({ id: ..., householdId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await deleteBudget(dataConnect, deleteBudgetVars);

console.log(data.budget_delete);

// Or, you can use the `Promise` API.
deleteBudget(deleteBudgetVars).then((response) => {
  const data = response.data;
  console.log(data.budget_delete);
});
```

### Using `DeleteBudget`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, deleteBudgetRef, DeleteBudgetVariables } from '@pareja-pro/dataconnect';

// The `DeleteBudget` mutation requires an argument of type `DeleteBudgetVariables`:
const deleteBudgetVars: DeleteBudgetVariables = {
  id: ..., 
  householdId: ..., 
};

// Call the `deleteBudgetRef()` function to get a reference to the mutation.
const ref = deleteBudgetRef(deleteBudgetVars);
// Variables can be defined inline as well.
const ref = deleteBudgetRef({ id: ..., householdId: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = deleteBudgetRef(dataConnect, deleteBudgetVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.budget_delete);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.budget_delete);
});
```

## CreateAccount
You can execute the `CreateAccount` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
createAccount(vars: CreateAccountVariables): MutationPromise<CreateAccountData, CreateAccountVariables>;

interface CreateAccountRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateAccountVariables): MutationRef<CreateAccountData, CreateAccountVariables>;
}
export const createAccountRef: CreateAccountRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createAccount(dc: DataConnect, vars: CreateAccountVariables): MutationPromise<CreateAccountData, CreateAccountVariables>;

interface CreateAccountRef {
  ...
  (dc: DataConnect, vars: CreateAccountVariables): MutationRef<CreateAccountData, CreateAccountVariables>;
}
export const createAccountRef: CreateAccountRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createAccountRef:
```typescript
const name = createAccountRef.operationName;
console.log(name);
```

### Variables
The `CreateAccount` mutation requires an argument of type `CreateAccountVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
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
```
### Return Type
Recall that executing the `CreateAccount` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateAccountData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateAccountData {
  account_insert: Account_Key;
}
```
### Using `CreateAccount`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createAccount, CreateAccountVariables } from '@pareja-pro/dataconnect';

// The `CreateAccount` mutation requires an argument of type `CreateAccountVariables`:
const createAccountVars: CreateAccountVariables = {
  householdId: ..., 
  name: ..., 
  type: ..., 
  ownerType: ..., 
  cutDay: ..., // optional
  paymentDay: ..., // optional
  creditLimit: ..., // optional
  color: ..., // optional
};

// Call the `createAccount()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createAccount(createAccountVars);
// Variables can be defined inline as well.
const { data } = await createAccount({ householdId: ..., name: ..., type: ..., ownerType: ..., cutDay: ..., paymentDay: ..., creditLimit: ..., color: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createAccount(dataConnect, createAccountVars);

console.log(data.account_insert);

// Or, you can use the `Promise` API.
createAccount(createAccountVars).then((response) => {
  const data = response.data;
  console.log(data.account_insert);
});
```

### Using `CreateAccount`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createAccountRef, CreateAccountVariables } from '@pareja-pro/dataconnect';

// The `CreateAccount` mutation requires an argument of type `CreateAccountVariables`:
const createAccountVars: CreateAccountVariables = {
  householdId: ..., 
  name: ..., 
  type: ..., 
  ownerType: ..., 
  cutDay: ..., // optional
  paymentDay: ..., // optional
  creditLimit: ..., // optional
  color: ..., // optional
};

// Call the `createAccountRef()` function to get a reference to the mutation.
const ref = createAccountRef(createAccountVars);
// Variables can be defined inline as well.
const ref = createAccountRef({ householdId: ..., name: ..., type: ..., ownerType: ..., cutDay: ..., paymentDay: ..., creditLimit: ..., color: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createAccountRef(dataConnect, createAccountVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.account_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.account_insert);
});
```

## UpdateAccount
You can execute the `UpdateAccount` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
updateAccount(vars: UpdateAccountVariables): MutationPromise<UpdateAccountData, UpdateAccountVariables>;

interface UpdateAccountRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateAccountVariables): MutationRef<UpdateAccountData, UpdateAccountVariables>;
}
export const updateAccountRef: UpdateAccountRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updateAccount(dc: DataConnect, vars: UpdateAccountVariables): MutationPromise<UpdateAccountData, UpdateAccountVariables>;

interface UpdateAccountRef {
  ...
  (dc: DataConnect, vars: UpdateAccountVariables): MutationRef<UpdateAccountData, UpdateAccountVariables>;
}
export const updateAccountRef: UpdateAccountRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updateAccountRef:
```typescript
const name = updateAccountRef.operationName;
console.log(name);
```

### Variables
The `UpdateAccount` mutation requires an argument of type `UpdateAccountVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpdateAccountVariables {
  accountId: UUIDString;
  householdId: UUIDString;
  name: string;
  ownerType: OwnerType;
  cutDay?: number | null;
  paymentDay?: number | null;
  creditLimit?: number | null;
  color?: string | null;
}
```
### Return Type
Recall that executing the `UpdateAccount` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdateAccountData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdateAccountData {
  account_update?: Account_Key | null;
}
```
### Using `UpdateAccount`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updateAccount, UpdateAccountVariables } from '@pareja-pro/dataconnect';

// The `UpdateAccount` mutation requires an argument of type `UpdateAccountVariables`:
const updateAccountVars: UpdateAccountVariables = {
  accountId: ..., 
  householdId: ..., 
  name: ..., 
  ownerType: ..., 
  cutDay: ..., // optional
  paymentDay: ..., // optional
  creditLimit: ..., // optional
  color: ..., // optional
};

// Call the `updateAccount()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updateAccount(updateAccountVars);
// Variables can be defined inline as well.
const { data } = await updateAccount({ accountId: ..., householdId: ..., name: ..., ownerType: ..., cutDay: ..., paymentDay: ..., creditLimit: ..., color: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updateAccount(dataConnect, updateAccountVars);

console.log(data.account_update);

// Or, you can use the `Promise` API.
updateAccount(updateAccountVars).then((response) => {
  const data = response.data;
  console.log(data.account_update);
});
```

### Using `UpdateAccount`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updateAccountRef, UpdateAccountVariables } from '@pareja-pro/dataconnect';

// The `UpdateAccount` mutation requires an argument of type `UpdateAccountVariables`:
const updateAccountVars: UpdateAccountVariables = {
  accountId: ..., 
  householdId: ..., 
  name: ..., 
  ownerType: ..., 
  cutDay: ..., // optional
  paymentDay: ..., // optional
  creditLimit: ..., // optional
  color: ..., // optional
};

// Call the `updateAccountRef()` function to get a reference to the mutation.
const ref = updateAccountRef(updateAccountVars);
// Variables can be defined inline as well.
const ref = updateAccountRef({ accountId: ..., householdId: ..., name: ..., ownerType: ..., cutDay: ..., paymentDay: ..., creditLimit: ..., color: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updateAccountRef(dataConnect, updateAccountVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.account_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.account_update);
});
```

## ArchiveAccount
You can execute the `ArchiveAccount` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
archiveAccount(vars: ArchiveAccountVariables): MutationPromise<ArchiveAccountData, ArchiveAccountVariables>;

interface ArchiveAccountRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: ArchiveAccountVariables): MutationRef<ArchiveAccountData, ArchiveAccountVariables>;
}
export const archiveAccountRef: ArchiveAccountRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
archiveAccount(dc: DataConnect, vars: ArchiveAccountVariables): MutationPromise<ArchiveAccountData, ArchiveAccountVariables>;

interface ArchiveAccountRef {
  ...
  (dc: DataConnect, vars: ArchiveAccountVariables): MutationRef<ArchiveAccountData, ArchiveAccountVariables>;
}
export const archiveAccountRef: ArchiveAccountRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the archiveAccountRef:
```typescript
const name = archiveAccountRef.operationName;
console.log(name);
```

### Variables
The `ArchiveAccount` mutation requires an argument of type `ArchiveAccountVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface ArchiveAccountVariables {
  accountId: UUIDString;
  householdId: UUIDString;
  isArchived: boolean;
}
```
### Return Type
Recall that executing the `ArchiveAccount` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ArchiveAccountData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ArchiveAccountData {
  account_update?: Account_Key | null;
}
```
### Using `ArchiveAccount`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, archiveAccount, ArchiveAccountVariables } from '@pareja-pro/dataconnect';

// The `ArchiveAccount` mutation requires an argument of type `ArchiveAccountVariables`:
const archiveAccountVars: ArchiveAccountVariables = {
  accountId: ..., 
  householdId: ..., 
  isArchived: ..., 
};

// Call the `archiveAccount()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await archiveAccount(archiveAccountVars);
// Variables can be defined inline as well.
const { data } = await archiveAccount({ accountId: ..., householdId: ..., isArchived: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await archiveAccount(dataConnect, archiveAccountVars);

console.log(data.account_update);

// Or, you can use the `Promise` API.
archiveAccount(archiveAccountVars).then((response) => {
  const data = response.data;
  console.log(data.account_update);
});
```

### Using `ArchiveAccount`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, archiveAccountRef, ArchiveAccountVariables } from '@pareja-pro/dataconnect';

// The `ArchiveAccount` mutation requires an argument of type `ArchiveAccountVariables`:
const archiveAccountVars: ArchiveAccountVariables = {
  accountId: ..., 
  householdId: ..., 
  isArchived: ..., 
};

// Call the `archiveAccountRef()` function to get a reference to the mutation.
const ref = archiveAccountRef(archiveAccountVars);
// Variables can be defined inline as well.
const ref = archiveAccountRef({ accountId: ..., householdId: ..., isArchived: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = archiveAccountRef(dataConnect, archiveAccountVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.account_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.account_update);
});
```

## DeleteAccount
You can execute the `DeleteAccount` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
deleteAccount(vars: DeleteAccountVariables): MutationPromise<DeleteAccountData, DeleteAccountVariables>;

interface DeleteAccountRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteAccountVariables): MutationRef<DeleteAccountData, DeleteAccountVariables>;
}
export const deleteAccountRef: DeleteAccountRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
deleteAccount(dc: DataConnect, vars: DeleteAccountVariables): MutationPromise<DeleteAccountData, DeleteAccountVariables>;

interface DeleteAccountRef {
  ...
  (dc: DataConnect, vars: DeleteAccountVariables): MutationRef<DeleteAccountData, DeleteAccountVariables>;
}
export const deleteAccountRef: DeleteAccountRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the deleteAccountRef:
```typescript
const name = deleteAccountRef.operationName;
console.log(name);
```

### Variables
The `DeleteAccount` mutation requires an argument of type `DeleteAccountVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface DeleteAccountVariables {
  accountId: UUIDString;
  householdId: UUIDString;
}
```
### Return Type
Recall that executing the `DeleteAccount` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `DeleteAccountData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface DeleteAccountData {
  account_delete?: Account_Key | null;
}
```
### Using `DeleteAccount`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, deleteAccount, DeleteAccountVariables } from '@pareja-pro/dataconnect';

// The `DeleteAccount` mutation requires an argument of type `DeleteAccountVariables`:
const deleteAccountVars: DeleteAccountVariables = {
  accountId: ..., 
  householdId: ..., 
};

// Call the `deleteAccount()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await deleteAccount(deleteAccountVars);
// Variables can be defined inline as well.
const { data } = await deleteAccount({ accountId: ..., householdId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await deleteAccount(dataConnect, deleteAccountVars);

console.log(data.account_delete);

// Or, you can use the `Promise` API.
deleteAccount(deleteAccountVars).then((response) => {
  const data = response.data;
  console.log(data.account_delete);
});
```

### Using `DeleteAccount`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, deleteAccountRef, DeleteAccountVariables } from '@pareja-pro/dataconnect';

// The `DeleteAccount` mutation requires an argument of type `DeleteAccountVariables`:
const deleteAccountVars: DeleteAccountVariables = {
  accountId: ..., 
  householdId: ..., 
};

// Call the `deleteAccountRef()` function to get a reference to the mutation.
const ref = deleteAccountRef(deleteAccountVars);
// Variables can be defined inline as well.
const ref = deleteAccountRef({ accountId: ..., householdId: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = deleteAccountRef(dataConnect, deleteAccountVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.account_delete);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.account_delete);
});
```

## ReassignEntries
You can execute the `ReassignEntries` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
reassignEntries(vars: ReassignEntriesVariables): MutationPromise<ReassignEntriesData, ReassignEntriesVariables>;

interface ReassignEntriesRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: ReassignEntriesVariables): MutationRef<ReassignEntriesData, ReassignEntriesVariables>;
}
export const reassignEntriesRef: ReassignEntriesRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
reassignEntries(dc: DataConnect, vars: ReassignEntriesVariables): MutationPromise<ReassignEntriesData, ReassignEntriesVariables>;

interface ReassignEntriesRef {
  ...
  (dc: DataConnect, vars: ReassignEntriesVariables): MutationRef<ReassignEntriesData, ReassignEntriesVariables>;
}
export const reassignEntriesRef: ReassignEntriesRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the reassignEntriesRef:
```typescript
const name = reassignEntriesRef.operationName;
console.log(name);
```

### Variables
The `ReassignEntries` mutation requires an argument of type `ReassignEntriesVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface ReassignEntriesVariables {
  householdId: UUIDString;
  fromAccountId: UUIDString;
  toAccountId: UUIDString;
  accountType: AccountType;
}
```
### Return Type
Recall that executing the `ReassignEntries` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ReassignEntriesData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ReassignEntriesData {
  entry_updateMany: number;
}
```
### Using `ReassignEntries`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, reassignEntries, ReassignEntriesVariables } from '@pareja-pro/dataconnect';

// The `ReassignEntries` mutation requires an argument of type `ReassignEntriesVariables`:
const reassignEntriesVars: ReassignEntriesVariables = {
  householdId: ..., 
  fromAccountId: ..., 
  toAccountId: ..., 
  accountType: ..., 
};

// Call the `reassignEntries()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await reassignEntries(reassignEntriesVars);
// Variables can be defined inline as well.
const { data } = await reassignEntries({ householdId: ..., fromAccountId: ..., toAccountId: ..., accountType: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await reassignEntries(dataConnect, reassignEntriesVars);

console.log(data.entry_updateMany);

// Or, you can use the `Promise` API.
reassignEntries(reassignEntriesVars).then((response) => {
  const data = response.data;
  console.log(data.entry_updateMany);
});
```

### Using `ReassignEntries`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, reassignEntriesRef, ReassignEntriesVariables } from '@pareja-pro/dataconnect';

// The `ReassignEntries` mutation requires an argument of type `ReassignEntriesVariables`:
const reassignEntriesVars: ReassignEntriesVariables = {
  householdId: ..., 
  fromAccountId: ..., 
  toAccountId: ..., 
  accountType: ..., 
};

// Call the `reassignEntriesRef()` function to get a reference to the mutation.
const ref = reassignEntriesRef(reassignEntriesVars);
// Variables can be defined inline as well.
const ref = reassignEntriesRef({ householdId: ..., fromAccountId: ..., toAccountId: ..., accountType: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = reassignEntriesRef(dataConnect, reassignEntriesVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.entry_updateMany);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.entry_updateMany);
});
```

## CreateSettlement
You can execute the `CreateSettlement` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
createSettlement(vars: CreateSettlementVariables): MutationPromise<CreateSettlementData, CreateSettlementVariables>;

interface CreateSettlementRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateSettlementVariables): MutationRef<CreateSettlementData, CreateSettlementVariables>;
}
export const createSettlementRef: CreateSettlementRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createSettlement(dc: DataConnect, vars: CreateSettlementVariables): MutationPromise<CreateSettlementData, CreateSettlementVariables>;

interface CreateSettlementRef {
  ...
  (dc: DataConnect, vars: CreateSettlementVariables): MutationRef<CreateSettlementData, CreateSettlementVariables>;
}
export const createSettlementRef: CreateSettlementRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createSettlementRef:
```typescript
const name = createSettlementRef.operationName;
console.log(name);
```

### Variables
The `CreateSettlement` mutation requires an argument of type `CreateSettlementVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreateSettlementVariables {
  householdId: UUIDString;
  ownerType: OwnerType;
  amount: number;
  note?: string | null;
}
```
### Return Type
Recall that executing the `CreateSettlement` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateSettlementData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateSettlementData {
  settlement_insert: Settlement_Key;
}
```
### Using `CreateSettlement`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createSettlement, CreateSettlementVariables } from '@pareja-pro/dataconnect';

// The `CreateSettlement` mutation requires an argument of type `CreateSettlementVariables`:
const createSettlementVars: CreateSettlementVariables = {
  householdId: ..., 
  ownerType: ..., 
  amount: ..., 
  note: ..., // optional
};

// Call the `createSettlement()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createSettlement(createSettlementVars);
// Variables can be defined inline as well.
const { data } = await createSettlement({ householdId: ..., ownerType: ..., amount: ..., note: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createSettlement(dataConnect, createSettlementVars);

console.log(data.settlement_insert);

// Or, you can use the `Promise` API.
createSettlement(createSettlementVars).then((response) => {
  const data = response.data;
  console.log(data.settlement_insert);
});
```

### Using `CreateSettlement`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createSettlementRef, CreateSettlementVariables } from '@pareja-pro/dataconnect';

// The `CreateSettlement` mutation requires an argument of type `CreateSettlementVariables`:
const createSettlementVars: CreateSettlementVariables = {
  householdId: ..., 
  ownerType: ..., 
  amount: ..., 
  note: ..., // optional
};

// Call the `createSettlementRef()` function to get a reference to the mutation.
const ref = createSettlementRef(createSettlementVars);
// Variables can be defined inline as well.
const ref = createSettlementRef({ householdId: ..., ownerType: ..., amount: ..., note: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createSettlementRef(dataConnect, createSettlementVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.settlement_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.settlement_insert);
});
```

## DeleteSettlement
You can execute the `DeleteSettlement` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
deleteSettlement(vars: DeleteSettlementVariables): MutationPromise<DeleteSettlementData, DeleteSettlementVariables>;

interface DeleteSettlementRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteSettlementVariables): MutationRef<DeleteSettlementData, DeleteSettlementVariables>;
}
export const deleteSettlementRef: DeleteSettlementRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
deleteSettlement(dc: DataConnect, vars: DeleteSettlementVariables): MutationPromise<DeleteSettlementData, DeleteSettlementVariables>;

interface DeleteSettlementRef {
  ...
  (dc: DataConnect, vars: DeleteSettlementVariables): MutationRef<DeleteSettlementData, DeleteSettlementVariables>;
}
export const deleteSettlementRef: DeleteSettlementRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the deleteSettlementRef:
```typescript
const name = deleteSettlementRef.operationName;
console.log(name);
```

### Variables
The `DeleteSettlement` mutation requires an argument of type `DeleteSettlementVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface DeleteSettlementVariables {
  id: UUIDString;
}
```
### Return Type
Recall that executing the `DeleteSettlement` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `DeleteSettlementData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface DeleteSettlementData {
  settlement_delete?: Settlement_Key | null;
}
```
### Using `DeleteSettlement`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, deleteSettlement, DeleteSettlementVariables } from '@pareja-pro/dataconnect';

// The `DeleteSettlement` mutation requires an argument of type `DeleteSettlementVariables`:
const deleteSettlementVars: DeleteSettlementVariables = {
  id: ..., 
};

// Call the `deleteSettlement()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await deleteSettlement(deleteSettlementVars);
// Variables can be defined inline as well.
const { data } = await deleteSettlement({ id: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await deleteSettlement(dataConnect, deleteSettlementVars);

console.log(data.settlement_delete);

// Or, you can use the `Promise` API.
deleteSettlement(deleteSettlementVars).then((response) => {
  const data = response.data;
  console.log(data.settlement_delete);
});
```

### Using `DeleteSettlement`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, deleteSettlementRef, DeleteSettlementVariables } from '@pareja-pro/dataconnect';

// The `DeleteSettlement` mutation requires an argument of type `DeleteSettlementVariables`:
const deleteSettlementVars: DeleteSettlementVariables = {
  id: ..., 
};

// Call the `deleteSettlementRef()` function to get a reference to the mutation.
const ref = deleteSettlementRef(deleteSettlementVars);
// Variables can be defined inline as well.
const ref = deleteSettlementRef({ id: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = deleteSettlementRef(dataConnect, deleteSettlementVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.settlement_delete);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.settlement_delete);
});
```

## CreateSavingsProject
You can execute the `CreateSavingsProject` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
createSavingsProject(vars: CreateSavingsProjectVariables): MutationPromise<CreateSavingsProjectData, CreateSavingsProjectVariables>;

interface CreateSavingsProjectRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateSavingsProjectVariables): MutationRef<CreateSavingsProjectData, CreateSavingsProjectVariables>;
}
export const createSavingsProjectRef: CreateSavingsProjectRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createSavingsProject(dc: DataConnect, vars: CreateSavingsProjectVariables): MutationPromise<CreateSavingsProjectData, CreateSavingsProjectVariables>;

interface CreateSavingsProjectRef {
  ...
  (dc: DataConnect, vars: CreateSavingsProjectVariables): MutationRef<CreateSavingsProjectData, CreateSavingsProjectVariables>;
}
export const createSavingsProjectRef: CreateSavingsProjectRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createSavingsProjectRef:
```typescript
const name = createSavingsProjectRef.operationName;
console.log(name);
```

### Variables
The `CreateSavingsProject` mutation requires an argument of type `CreateSavingsProjectVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreateSavingsProjectVariables {
  householdId: UUIDString;
  name: string;
  targetAmount: number;
  priority: number;
  monthlyQuota?: number | null;
  targetAccount?: string | null;
}
```
### Return Type
Recall that executing the `CreateSavingsProject` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateSavingsProjectData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateSavingsProjectData {
  savingsProject_insert: SavingsProject_Key;
}
```
### Using `CreateSavingsProject`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createSavingsProject, CreateSavingsProjectVariables } from '@pareja-pro/dataconnect';

// The `CreateSavingsProject` mutation requires an argument of type `CreateSavingsProjectVariables`:
const createSavingsProjectVars: CreateSavingsProjectVariables = {
  householdId: ..., 
  name: ..., 
  targetAmount: ..., 
  priority: ..., 
  monthlyQuota: ..., // optional
  targetAccount: ..., // optional
};

// Call the `createSavingsProject()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createSavingsProject(createSavingsProjectVars);
// Variables can be defined inline as well.
const { data } = await createSavingsProject({ householdId: ..., name: ..., targetAmount: ..., priority: ..., monthlyQuota: ..., targetAccount: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createSavingsProject(dataConnect, createSavingsProjectVars);

console.log(data.savingsProject_insert);

// Or, you can use the `Promise` API.
createSavingsProject(createSavingsProjectVars).then((response) => {
  const data = response.data;
  console.log(data.savingsProject_insert);
});
```

### Using `CreateSavingsProject`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createSavingsProjectRef, CreateSavingsProjectVariables } from '@pareja-pro/dataconnect';

// The `CreateSavingsProject` mutation requires an argument of type `CreateSavingsProjectVariables`:
const createSavingsProjectVars: CreateSavingsProjectVariables = {
  householdId: ..., 
  name: ..., 
  targetAmount: ..., 
  priority: ..., 
  monthlyQuota: ..., // optional
  targetAccount: ..., // optional
};

// Call the `createSavingsProjectRef()` function to get a reference to the mutation.
const ref = createSavingsProjectRef(createSavingsProjectVars);
// Variables can be defined inline as well.
const ref = createSavingsProjectRef({ householdId: ..., name: ..., targetAmount: ..., priority: ..., monthlyQuota: ..., targetAccount: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createSavingsProjectRef(dataConnect, createSavingsProjectVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.savingsProject_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.savingsProject_insert);
});
```

## UpdateProjectProgress
You can execute the `UpdateProjectProgress` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
updateProjectProgress(vars: UpdateProjectProgressVariables): MutationPromise<UpdateProjectProgressData, UpdateProjectProgressVariables>;

interface UpdateProjectProgressRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateProjectProgressVariables): MutationRef<UpdateProjectProgressData, UpdateProjectProgressVariables>;
}
export const updateProjectProgressRef: UpdateProjectProgressRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updateProjectProgress(dc: DataConnect, vars: UpdateProjectProgressVariables): MutationPromise<UpdateProjectProgressData, UpdateProjectProgressVariables>;

interface UpdateProjectProgressRef {
  ...
  (dc: DataConnect, vars: UpdateProjectProgressVariables): MutationRef<UpdateProjectProgressData, UpdateProjectProgressVariables>;
}
export const updateProjectProgressRef: UpdateProjectProgressRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updateProjectProgressRef:
```typescript
const name = updateProjectProgressRef.operationName;
console.log(name);
```

### Variables
The `UpdateProjectProgress` mutation requires an argument of type `UpdateProjectProgressVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpdateProjectProgressVariables {
  projectId: UUIDString;
  householdId: UUIDString;
  amountToAdd: number;
}
```
### Return Type
Recall that executing the `UpdateProjectProgress` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdateProjectProgressData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdateProjectProgressData {
  savingsProject_update?: SavingsProject_Key | null;
}
```
### Using `UpdateProjectProgress`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updateProjectProgress, UpdateProjectProgressVariables } from '@pareja-pro/dataconnect';

// The `UpdateProjectProgress` mutation requires an argument of type `UpdateProjectProgressVariables`:
const updateProjectProgressVars: UpdateProjectProgressVariables = {
  projectId: ..., 
  householdId: ..., 
  amountToAdd: ..., 
};

// Call the `updateProjectProgress()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updateProjectProgress(updateProjectProgressVars);
// Variables can be defined inline as well.
const { data } = await updateProjectProgress({ projectId: ..., householdId: ..., amountToAdd: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updateProjectProgress(dataConnect, updateProjectProgressVars);

console.log(data.savingsProject_update);

// Or, you can use the `Promise` API.
updateProjectProgress(updateProjectProgressVars).then((response) => {
  const data = response.data;
  console.log(data.savingsProject_update);
});
```

### Using `UpdateProjectProgress`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updateProjectProgressRef, UpdateProjectProgressVariables } from '@pareja-pro/dataconnect';

// The `UpdateProjectProgress` mutation requires an argument of type `UpdateProjectProgressVariables`:
const updateProjectProgressVars: UpdateProjectProgressVariables = {
  projectId: ..., 
  householdId: ..., 
  amountToAdd: ..., 
};

// Call the `updateProjectProgressRef()` function to get a reference to the mutation.
const ref = updateProjectProgressRef(updateProjectProgressVars);
// Variables can be defined inline as well.
const ref = updateProjectProgressRef({ projectId: ..., householdId: ..., amountToAdd: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updateProjectProgressRef(dataConnect, updateProjectProgressVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.savingsProject_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.savingsProject_update);
});
```

## UpdateSavingsProject
You can execute the `UpdateSavingsProject` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
updateSavingsProject(vars: UpdateSavingsProjectVariables): MutationPromise<UpdateSavingsProjectData, UpdateSavingsProjectVariables>;

interface UpdateSavingsProjectRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateSavingsProjectVariables): MutationRef<UpdateSavingsProjectData, UpdateSavingsProjectVariables>;
}
export const updateSavingsProjectRef: UpdateSavingsProjectRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updateSavingsProject(dc: DataConnect, vars: UpdateSavingsProjectVariables): MutationPromise<UpdateSavingsProjectData, UpdateSavingsProjectVariables>;

interface UpdateSavingsProjectRef {
  ...
  (dc: DataConnect, vars: UpdateSavingsProjectVariables): MutationRef<UpdateSavingsProjectData, UpdateSavingsProjectVariables>;
}
export const updateSavingsProjectRef: UpdateSavingsProjectRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updateSavingsProjectRef:
```typescript
const name = updateSavingsProjectRef.operationName;
console.log(name);
```

### Variables
The `UpdateSavingsProject` mutation requires an argument of type `UpdateSavingsProjectVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpdateSavingsProjectVariables {
  projectId: UUIDString;
  householdId: UUIDString;
  name?: string | null;
  targetAmount?: number | null;
  monthlyQuota?: number | null;
  targetAccount?: string | null;
  priority?: number | null;
  isCompleted?: boolean | null;
}
```
### Return Type
Recall that executing the `UpdateSavingsProject` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdateSavingsProjectData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdateSavingsProjectData {
  savingsProject_update?: SavingsProject_Key | null;
}
```
### Using `UpdateSavingsProject`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updateSavingsProject, UpdateSavingsProjectVariables } from '@pareja-pro/dataconnect';

// The `UpdateSavingsProject` mutation requires an argument of type `UpdateSavingsProjectVariables`:
const updateSavingsProjectVars: UpdateSavingsProjectVariables = {
  projectId: ..., 
  householdId: ..., 
  name: ..., // optional
  targetAmount: ..., // optional
  monthlyQuota: ..., // optional
  targetAccount: ..., // optional
  priority: ..., // optional
  isCompleted: ..., // optional
};

// Call the `updateSavingsProject()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updateSavingsProject(updateSavingsProjectVars);
// Variables can be defined inline as well.
const { data } = await updateSavingsProject({ projectId: ..., householdId: ..., name: ..., targetAmount: ..., monthlyQuota: ..., targetAccount: ..., priority: ..., isCompleted: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updateSavingsProject(dataConnect, updateSavingsProjectVars);

console.log(data.savingsProject_update);

// Or, you can use the `Promise` API.
updateSavingsProject(updateSavingsProjectVars).then((response) => {
  const data = response.data;
  console.log(data.savingsProject_update);
});
```

### Using `UpdateSavingsProject`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updateSavingsProjectRef, UpdateSavingsProjectVariables } from '@pareja-pro/dataconnect';

// The `UpdateSavingsProject` mutation requires an argument of type `UpdateSavingsProjectVariables`:
const updateSavingsProjectVars: UpdateSavingsProjectVariables = {
  projectId: ..., 
  householdId: ..., 
  name: ..., // optional
  targetAmount: ..., // optional
  monthlyQuota: ..., // optional
  targetAccount: ..., // optional
  priority: ..., // optional
  isCompleted: ..., // optional
};

// Call the `updateSavingsProjectRef()` function to get a reference to the mutation.
const ref = updateSavingsProjectRef(updateSavingsProjectVars);
// Variables can be defined inline as well.
const ref = updateSavingsProjectRef({ projectId: ..., householdId: ..., name: ..., targetAmount: ..., monthlyQuota: ..., targetAccount: ..., priority: ..., isCompleted: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updateSavingsProjectRef(dataConnect, updateSavingsProjectVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.savingsProject_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.savingsProject_update);
});
```

## CreateExternalAsset
You can execute the `CreateExternalAsset` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
createExternalAsset(vars: CreateExternalAssetVariables): MutationPromise<CreateExternalAssetData, CreateExternalAssetVariables>;

interface CreateExternalAssetRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateExternalAssetVariables): MutationRef<CreateExternalAssetData, CreateExternalAssetVariables>;
}
export const createExternalAssetRef: CreateExternalAssetRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createExternalAsset(dc: DataConnect, vars: CreateExternalAssetVariables): MutationPromise<CreateExternalAssetData, CreateExternalAssetVariables>;

interface CreateExternalAssetRef {
  ...
  (dc: DataConnect, vars: CreateExternalAssetVariables): MutationRef<CreateExternalAssetData, CreateExternalAssetVariables>;
}
export const createExternalAssetRef: CreateExternalAssetRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createExternalAssetRef:
```typescript
const name = createExternalAssetRef.operationName;
console.log(name);
```

### Variables
The `CreateExternalAsset` mutation requires an argument of type `CreateExternalAssetVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreateExternalAssetVariables {
  householdId: UUIDString;
  name: string;
  estimatedValue: number;
  assetType: string;
}
```
### Return Type
Recall that executing the `CreateExternalAsset` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateExternalAssetData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateExternalAssetData {
  externalAsset_insert: ExternalAsset_Key;
}
```
### Using `CreateExternalAsset`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createExternalAsset, CreateExternalAssetVariables } from '@pareja-pro/dataconnect';

// The `CreateExternalAsset` mutation requires an argument of type `CreateExternalAssetVariables`:
const createExternalAssetVars: CreateExternalAssetVariables = {
  householdId: ..., 
  name: ..., 
  estimatedValue: ..., 
  assetType: ..., 
};

// Call the `createExternalAsset()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createExternalAsset(createExternalAssetVars);
// Variables can be defined inline as well.
const { data } = await createExternalAsset({ householdId: ..., name: ..., estimatedValue: ..., assetType: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createExternalAsset(dataConnect, createExternalAssetVars);

console.log(data.externalAsset_insert);

// Or, you can use the `Promise` API.
createExternalAsset(createExternalAssetVars).then((response) => {
  const data = response.data;
  console.log(data.externalAsset_insert);
});
```

### Using `CreateExternalAsset`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createExternalAssetRef, CreateExternalAssetVariables } from '@pareja-pro/dataconnect';

// The `CreateExternalAsset` mutation requires an argument of type `CreateExternalAssetVariables`:
const createExternalAssetVars: CreateExternalAssetVariables = {
  householdId: ..., 
  name: ..., 
  estimatedValue: ..., 
  assetType: ..., 
};

// Call the `createExternalAssetRef()` function to get a reference to the mutation.
const ref = createExternalAssetRef(createExternalAssetVars);
// Variables can be defined inline as well.
const ref = createExternalAssetRef({ householdId: ..., name: ..., estimatedValue: ..., assetType: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createExternalAssetRef(dataConnect, createExternalAssetVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.externalAsset_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.externalAsset_insert);
});
```

## UpdateExternalAsset
You can execute the `UpdateExternalAsset` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
updateExternalAsset(vars: UpdateExternalAssetVariables): MutationPromise<UpdateExternalAssetData, UpdateExternalAssetVariables>;

interface UpdateExternalAssetRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateExternalAssetVariables): MutationRef<UpdateExternalAssetData, UpdateExternalAssetVariables>;
}
export const updateExternalAssetRef: UpdateExternalAssetRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updateExternalAsset(dc: DataConnect, vars: UpdateExternalAssetVariables): MutationPromise<UpdateExternalAssetData, UpdateExternalAssetVariables>;

interface UpdateExternalAssetRef {
  ...
  (dc: DataConnect, vars: UpdateExternalAssetVariables): MutationRef<UpdateExternalAssetData, UpdateExternalAssetVariables>;
}
export const updateExternalAssetRef: UpdateExternalAssetRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updateExternalAssetRef:
```typescript
const name = updateExternalAssetRef.operationName;
console.log(name);
```

### Variables
The `UpdateExternalAsset` mutation requires an argument of type `UpdateExternalAssetVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpdateExternalAssetVariables {
  assetId: UUIDString;
  householdId: UUIDString;
  estimatedValue: number;
}
```
### Return Type
Recall that executing the `UpdateExternalAsset` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdateExternalAssetData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdateExternalAssetData {
  externalAsset_update?: ExternalAsset_Key | null;
}
```
### Using `UpdateExternalAsset`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updateExternalAsset, UpdateExternalAssetVariables } from '@pareja-pro/dataconnect';

// The `UpdateExternalAsset` mutation requires an argument of type `UpdateExternalAssetVariables`:
const updateExternalAssetVars: UpdateExternalAssetVariables = {
  assetId: ..., 
  householdId: ..., 
  estimatedValue: ..., 
};

// Call the `updateExternalAsset()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updateExternalAsset(updateExternalAssetVars);
// Variables can be defined inline as well.
const { data } = await updateExternalAsset({ assetId: ..., householdId: ..., estimatedValue: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updateExternalAsset(dataConnect, updateExternalAssetVars);

console.log(data.externalAsset_update);

// Or, you can use the `Promise` API.
updateExternalAsset(updateExternalAssetVars).then((response) => {
  const data = response.data;
  console.log(data.externalAsset_update);
});
```

### Using `UpdateExternalAsset`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updateExternalAssetRef, UpdateExternalAssetVariables } from '@pareja-pro/dataconnect';

// The `UpdateExternalAsset` mutation requires an argument of type `UpdateExternalAssetVariables`:
const updateExternalAssetVars: UpdateExternalAssetVariables = {
  assetId: ..., 
  householdId: ..., 
  estimatedValue: ..., 
};

// Call the `updateExternalAssetRef()` function to get a reference to the mutation.
const ref = updateExternalAssetRef(updateExternalAssetVars);
// Variables can be defined inline as well.
const ref = updateExternalAssetRef({ assetId: ..., householdId: ..., estimatedValue: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updateExternalAssetRef(dataConnect, updateExternalAssetVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.externalAsset_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.externalAsset_update);
});
```

## UpsertExchangeRate
You can execute the `UpsertExchangeRate` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
upsertExchangeRate(vars: UpsertExchangeRateVariables): MutationPromise<UpsertExchangeRateData, UpsertExchangeRateVariables>;

interface UpsertExchangeRateRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpsertExchangeRateVariables): MutationRef<UpsertExchangeRateData, UpsertExchangeRateVariables>;
}
export const upsertExchangeRateRef: UpsertExchangeRateRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
upsertExchangeRate(dc: DataConnect, vars: UpsertExchangeRateVariables): MutationPromise<UpsertExchangeRateData, UpsertExchangeRateVariables>;

interface UpsertExchangeRateRef {
  ...
  (dc: DataConnect, vars: UpsertExchangeRateVariables): MutationRef<UpsertExchangeRateData, UpsertExchangeRateVariables>;
}
export const upsertExchangeRateRef: UpsertExchangeRateRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the upsertExchangeRateRef:
```typescript
const name = upsertExchangeRateRef.operationName;
console.log(name);
```

### Variables
The `UpsertExchangeRate` mutation requires an argument of type `UpsertExchangeRateVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpsertExchangeRateVariables {
  currency: string;
  rate: number;
  date: DateString;
}
```
### Return Type
Recall that executing the `UpsertExchangeRate` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpsertExchangeRateData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpsertExchangeRateData {
  exchangeRate_upsert: ExchangeRate_Key;
}
```
### Using `UpsertExchangeRate`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, upsertExchangeRate, UpsertExchangeRateVariables } from '@pareja-pro/dataconnect';

// The `UpsertExchangeRate` mutation requires an argument of type `UpsertExchangeRateVariables`:
const upsertExchangeRateVars: UpsertExchangeRateVariables = {
  currency: ..., 
  rate: ..., 
  date: ..., 
};

// Call the `upsertExchangeRate()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await upsertExchangeRate(upsertExchangeRateVars);
// Variables can be defined inline as well.
const { data } = await upsertExchangeRate({ currency: ..., rate: ..., date: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await upsertExchangeRate(dataConnect, upsertExchangeRateVars);

console.log(data.exchangeRate_upsert);

// Or, you can use the `Promise` API.
upsertExchangeRate(upsertExchangeRateVars).then((response) => {
  const data = response.data;
  console.log(data.exchangeRate_upsert);
});
```

### Using `UpsertExchangeRate`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, upsertExchangeRateRef, UpsertExchangeRateVariables } from '@pareja-pro/dataconnect';

// The `UpsertExchangeRate` mutation requires an argument of type `UpsertExchangeRateVariables`:
const upsertExchangeRateVars: UpsertExchangeRateVariables = {
  currency: ..., 
  rate: ..., 
  date: ..., 
};

// Call the `upsertExchangeRateRef()` function to get a reference to the mutation.
const ref = upsertExchangeRateRef(upsertExchangeRateVars);
// Variables can be defined inline as well.
const ref = upsertExchangeRateRef({ currency: ..., rate: ..., date: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = upsertExchangeRateRef(dataConnect, upsertExchangeRateVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.exchangeRate_upsert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.exchangeRate_upsert);
});
```

## CreateHouseholdAndUser
You can execute the `CreateHouseholdAndUser` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
createHouseholdAndUser(vars: CreateHouseholdAndUserVariables): MutationPromise<CreateHouseholdAndUserData, CreateHouseholdAndUserVariables>;

interface CreateHouseholdAndUserRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateHouseholdAndUserVariables): MutationRef<CreateHouseholdAndUserData, CreateHouseholdAndUserVariables>;
}
export const createHouseholdAndUserRef: CreateHouseholdAndUserRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createHouseholdAndUser(dc: DataConnect, vars: CreateHouseholdAndUserVariables): MutationPromise<CreateHouseholdAndUserData, CreateHouseholdAndUserVariables>;

interface CreateHouseholdAndUserRef {
  ...
  (dc: DataConnect, vars: CreateHouseholdAndUserVariables): MutationRef<CreateHouseholdAndUserData, CreateHouseholdAndUserVariables>;
}
export const createHouseholdAndUserRef: CreateHouseholdAndUserRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createHouseholdAndUserRef:
```typescript
const name = createHouseholdAndUserRef.operationName;
console.log(name);
```

### Variables
The `CreateHouseholdAndUser` mutation requires an argument of type `CreateHouseholdAndUserVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreateHouseholdAndUserVariables {
  email: string;
  displayName: string;
}
```
### Return Type
Recall that executing the `CreateHouseholdAndUser` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateHouseholdAndUserData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateHouseholdAndUserData {
  household_insert: Household_Key;
  user_insert: User_Key;
  assetAccount: Account_Key;
  incomeAccount: Account_Key;
  expenseAccount: Account_Key;
  liabilityAccount: Account_Key;
}
```
### Using `CreateHouseholdAndUser`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createHouseholdAndUser, CreateHouseholdAndUserVariables } from '@pareja-pro/dataconnect';

// The `CreateHouseholdAndUser` mutation requires an argument of type `CreateHouseholdAndUserVariables`:
const createHouseholdAndUserVars: CreateHouseholdAndUserVariables = {
  email: ..., 
  displayName: ..., 
};

// Call the `createHouseholdAndUser()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createHouseholdAndUser(createHouseholdAndUserVars);
// Variables can be defined inline as well.
const { data } = await createHouseholdAndUser({ email: ..., displayName: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createHouseholdAndUser(dataConnect, createHouseholdAndUserVars);

console.log(data.household_insert);
console.log(data.user_insert);
console.log(data.assetAccount);
console.log(data.incomeAccount);
console.log(data.expenseAccount);
console.log(data.liabilityAccount);

// Or, you can use the `Promise` API.
createHouseholdAndUser(createHouseholdAndUserVars).then((response) => {
  const data = response.data;
  console.log(data.household_insert);
  console.log(data.user_insert);
  console.log(data.assetAccount);
  console.log(data.incomeAccount);
  console.log(data.expenseAccount);
  console.log(data.liabilityAccount);
});
```

### Using `CreateHouseholdAndUser`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createHouseholdAndUserRef, CreateHouseholdAndUserVariables } from '@pareja-pro/dataconnect';

// The `CreateHouseholdAndUser` mutation requires an argument of type `CreateHouseholdAndUserVariables`:
const createHouseholdAndUserVars: CreateHouseholdAndUserVariables = {
  email: ..., 
  displayName: ..., 
};

// Call the `createHouseholdAndUserRef()` function to get a reference to the mutation.
const ref = createHouseholdAndUserRef(createHouseholdAndUserVars);
// Variables can be defined inline as well.
const ref = createHouseholdAndUserRef({ email: ..., displayName: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createHouseholdAndUserRef(dataConnect, createHouseholdAndUserVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.household_insert);
console.log(data.user_insert);
console.log(data.assetAccount);
console.log(data.incomeAccount);
console.log(data.expenseAccount);
console.log(data.liabilityAccount);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.household_insert);
  console.log(data.user_insert);
  console.log(data.assetAccount);
  console.log(data.incomeAccount);
  console.log(data.expenseAccount);
  console.log(data.liabilityAccount);
});
```

## SeedDefaultAccounts
You can execute the `SeedDefaultAccounts` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
seedDefaultAccounts(vars: SeedDefaultAccountsVariables): MutationPromise<SeedDefaultAccountsData, SeedDefaultAccountsVariables>;

interface SeedDefaultAccountsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: SeedDefaultAccountsVariables): MutationRef<SeedDefaultAccountsData, SeedDefaultAccountsVariables>;
}
export const seedDefaultAccountsRef: SeedDefaultAccountsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
seedDefaultAccounts(dc: DataConnect, vars: SeedDefaultAccountsVariables): MutationPromise<SeedDefaultAccountsData, SeedDefaultAccountsVariables>;

interface SeedDefaultAccountsRef {
  ...
  (dc: DataConnect, vars: SeedDefaultAccountsVariables): MutationRef<SeedDefaultAccountsData, SeedDefaultAccountsVariables>;
}
export const seedDefaultAccountsRef: SeedDefaultAccountsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the seedDefaultAccountsRef:
```typescript
const name = seedDefaultAccountsRef.operationName;
console.log(name);
```

### Variables
The `SeedDefaultAccounts` mutation requires an argument of type `SeedDefaultAccountsVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface SeedDefaultAccountsVariables {
  householdId: UUIDString;
}
```
### Return Type
Recall that executing the `SeedDefaultAccounts` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `SeedDefaultAccountsData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface SeedDefaultAccountsData {
  assetAccount: Account_Key;
  incomeAccount: Account_Key;
  expenseAccount: Account_Key;
  liabilityAccount: Account_Key;
}
```
### Using `SeedDefaultAccounts`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, seedDefaultAccounts, SeedDefaultAccountsVariables } from '@pareja-pro/dataconnect';

// The `SeedDefaultAccounts` mutation requires an argument of type `SeedDefaultAccountsVariables`:
const seedDefaultAccountsVars: SeedDefaultAccountsVariables = {
  householdId: ..., 
};

// Call the `seedDefaultAccounts()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await seedDefaultAccounts(seedDefaultAccountsVars);
// Variables can be defined inline as well.
const { data } = await seedDefaultAccounts({ householdId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await seedDefaultAccounts(dataConnect, seedDefaultAccountsVars);

console.log(data.assetAccount);
console.log(data.incomeAccount);
console.log(data.expenseAccount);
console.log(data.liabilityAccount);

// Or, you can use the `Promise` API.
seedDefaultAccounts(seedDefaultAccountsVars).then((response) => {
  const data = response.data;
  console.log(data.assetAccount);
  console.log(data.incomeAccount);
  console.log(data.expenseAccount);
  console.log(data.liabilityAccount);
});
```

### Using `SeedDefaultAccounts`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, seedDefaultAccountsRef, SeedDefaultAccountsVariables } from '@pareja-pro/dataconnect';

// The `SeedDefaultAccounts` mutation requires an argument of type `SeedDefaultAccountsVariables`:
const seedDefaultAccountsVars: SeedDefaultAccountsVariables = {
  householdId: ..., 
};

// Call the `seedDefaultAccountsRef()` function to get a reference to the mutation.
const ref = seedDefaultAccountsRef(seedDefaultAccountsVars);
// Variables can be defined inline as well.
const ref = seedDefaultAccountsRef({ householdId: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = seedDefaultAccountsRef(dataConnect, seedDefaultAccountsVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.assetAccount);
console.log(data.incomeAccount);
console.log(data.expenseAccount);
console.log(data.liabilityAccount);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.assetAccount);
  console.log(data.incomeAccount);
  console.log(data.expenseAccount);
  console.log(data.liabilityAccount);
});
```

## DeleteJournal
You can execute the `DeleteJournal` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
deleteJournal(vars: DeleteJournalVariables): MutationPromise<DeleteJournalData, DeleteJournalVariables>;

interface DeleteJournalRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteJournalVariables): MutationRef<DeleteJournalData, DeleteJournalVariables>;
}
export const deleteJournalRef: DeleteJournalRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
deleteJournal(dc: DataConnect, vars: DeleteJournalVariables): MutationPromise<DeleteJournalData, DeleteJournalVariables>;

interface DeleteJournalRef {
  ...
  (dc: DataConnect, vars: DeleteJournalVariables): MutationRef<DeleteJournalData, DeleteJournalVariables>;
}
export const deleteJournalRef: DeleteJournalRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the deleteJournalRef:
```typescript
const name = deleteJournalRef.operationName;
console.log(name);
```

### Variables
The `DeleteJournal` mutation requires an argument of type `DeleteJournalVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface DeleteJournalVariables {
  journalId: UUIDString;
  householdId: UUIDString;
}
```
### Return Type
Recall that executing the `DeleteJournal` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `DeleteJournalData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface DeleteJournalData {
  journalTag_deleteMany: number;
  entry_deleteMany: number;
  journal_delete?: Journal_Key | null;
}
```
### Using `DeleteJournal`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, deleteJournal, DeleteJournalVariables } from '@pareja-pro/dataconnect';

// The `DeleteJournal` mutation requires an argument of type `DeleteJournalVariables`:
const deleteJournalVars: DeleteJournalVariables = {
  journalId: ..., 
  householdId: ..., 
};

// Call the `deleteJournal()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await deleteJournal(deleteJournalVars);
// Variables can be defined inline as well.
const { data } = await deleteJournal({ journalId: ..., householdId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await deleteJournal(dataConnect, deleteJournalVars);

console.log(data.journalTag_deleteMany);
console.log(data.entry_deleteMany);
console.log(data.journal_delete);

// Or, you can use the `Promise` API.
deleteJournal(deleteJournalVars).then((response) => {
  const data = response.data;
  console.log(data.journalTag_deleteMany);
  console.log(data.entry_deleteMany);
  console.log(data.journal_delete);
});
```

### Using `DeleteJournal`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, deleteJournalRef, DeleteJournalVariables } from '@pareja-pro/dataconnect';

// The `DeleteJournal` mutation requires an argument of type `DeleteJournalVariables`:
const deleteJournalVars: DeleteJournalVariables = {
  journalId: ..., 
  householdId: ..., 
};

// Call the `deleteJournalRef()` function to get a reference to the mutation.
const ref = deleteJournalRef(deleteJournalVars);
// Variables can be defined inline as well.
const ref = deleteJournalRef({ journalId: ..., householdId: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = deleteJournalRef(dataConnect, deleteJournalVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.journalTag_deleteMany);
console.log(data.entry_deleteMany);
console.log(data.journal_delete);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.journalTag_deleteMany);
  console.log(data.entry_deleteMany);
  console.log(data.journal_delete);
});
```

## UpdateJournalWithEntries
You can execute the `UpdateJournalWithEntries` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
updateJournalWithEntries(vars: UpdateJournalWithEntriesVariables): MutationPromise<UpdateJournalWithEntriesData, UpdateJournalWithEntriesVariables>;

interface UpdateJournalWithEntriesRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateJournalWithEntriesVariables): MutationRef<UpdateJournalWithEntriesData, UpdateJournalWithEntriesVariables>;
}
export const updateJournalWithEntriesRef: UpdateJournalWithEntriesRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updateJournalWithEntries(dc: DataConnect, vars: UpdateJournalWithEntriesVariables): MutationPromise<UpdateJournalWithEntriesData, UpdateJournalWithEntriesVariables>;

interface UpdateJournalWithEntriesRef {
  ...
  (dc: DataConnect, vars: UpdateJournalWithEntriesVariables): MutationRef<UpdateJournalWithEntriesData, UpdateJournalWithEntriesVariables>;
}
export const updateJournalWithEntriesRef: UpdateJournalWithEntriesRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updateJournalWithEntriesRef:
```typescript
const name = updateJournalWithEntriesRef.operationName;
console.log(name);
```

### Variables
The `UpdateJournalWithEntries` mutation requires an argument of type `UpdateJournalWithEntriesVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
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
```
### Return Type
Recall that executing the `UpdateJournalWithEntries` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdateJournalWithEntriesData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdateJournalWithEntriesData {
  journal_update?: Journal_Key | null;
  entry_deleteMany: number;
  debitEntry: Entry_Key;
  creditEntry: Entry_Key;
}
```
### Using `UpdateJournalWithEntries`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updateJournalWithEntries, UpdateJournalWithEntriesVariables } from '@pareja-pro/dataconnect';

// The `UpdateJournalWithEntries` mutation requires an argument of type `UpdateJournalWithEntriesVariables`:
const updateJournalWithEntriesVars: UpdateJournalWithEntriesVariables = {
  journalId: ..., 
  householdId: ..., 
  date: ..., 
  description: ..., 
  amount: ..., 
  debitAccountId: ..., 
  creditAccountId: ..., 
  prorataFactor: ..., 
  ownerUid: ..., 
  isShared: ..., 
  isInternalTransfer: ..., // optional
  incomeCategoryType: ..., // optional
  categoryId: ..., // optional
};

// Call the `updateJournalWithEntries()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updateJournalWithEntries(updateJournalWithEntriesVars);
// Variables can be defined inline as well.
const { data } = await updateJournalWithEntries({ journalId: ..., householdId: ..., date: ..., description: ..., amount: ..., debitAccountId: ..., creditAccountId: ..., prorataFactor: ..., ownerUid: ..., isShared: ..., isInternalTransfer: ..., incomeCategoryType: ..., categoryId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updateJournalWithEntries(dataConnect, updateJournalWithEntriesVars);

console.log(data.journal_update);
console.log(data.entry_deleteMany);
console.log(data.debitEntry);
console.log(data.creditEntry);

// Or, you can use the `Promise` API.
updateJournalWithEntries(updateJournalWithEntriesVars).then((response) => {
  const data = response.data;
  console.log(data.journal_update);
  console.log(data.entry_deleteMany);
  console.log(data.debitEntry);
  console.log(data.creditEntry);
});
```

### Using `UpdateJournalWithEntries`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updateJournalWithEntriesRef, UpdateJournalWithEntriesVariables } from '@pareja-pro/dataconnect';

// The `UpdateJournalWithEntries` mutation requires an argument of type `UpdateJournalWithEntriesVariables`:
const updateJournalWithEntriesVars: UpdateJournalWithEntriesVariables = {
  journalId: ..., 
  householdId: ..., 
  date: ..., 
  description: ..., 
  amount: ..., 
  debitAccountId: ..., 
  creditAccountId: ..., 
  prorataFactor: ..., 
  ownerUid: ..., 
  isShared: ..., 
  isInternalTransfer: ..., // optional
  incomeCategoryType: ..., // optional
  categoryId: ..., // optional
};

// Call the `updateJournalWithEntriesRef()` function to get a reference to the mutation.
const ref = updateJournalWithEntriesRef(updateJournalWithEntriesVars);
// Variables can be defined inline as well.
const ref = updateJournalWithEntriesRef({ journalId: ..., householdId: ..., date: ..., description: ..., amount: ..., debitAccountId: ..., creditAccountId: ..., prorataFactor: ..., ownerUid: ..., isShared: ..., isInternalTransfer: ..., incomeCategoryType: ..., categoryId: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updateJournalWithEntriesRef(dataConnect, updateJournalWithEntriesVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.journal_update);
console.log(data.entry_deleteMany);
console.log(data.debitEntry);
console.log(data.creditEntry);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.journal_update);
  console.log(data.entry_deleteMany);
  console.log(data.debitEntry);
  console.log(data.creditEntry);
});
```

## UpdateSharedExpenseWithProration
You can execute the `UpdateSharedExpenseWithProration` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
updateSharedExpenseWithProration(vars: UpdateSharedExpenseWithProrationVariables): MutationPromise<UpdateSharedExpenseWithProrationData, UpdateSharedExpenseWithProrationVariables>;

interface UpdateSharedExpenseWithProrationRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateSharedExpenseWithProrationVariables): MutationRef<UpdateSharedExpenseWithProrationData, UpdateSharedExpenseWithProrationVariables>;
}
export const updateSharedExpenseWithProrationRef: UpdateSharedExpenseWithProrationRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updateSharedExpenseWithProration(dc: DataConnect, vars: UpdateSharedExpenseWithProrationVariables): MutationPromise<UpdateSharedExpenseWithProrationData, UpdateSharedExpenseWithProrationVariables>;

interface UpdateSharedExpenseWithProrationRef {
  ...
  (dc: DataConnect, vars: UpdateSharedExpenseWithProrationVariables): MutationRef<UpdateSharedExpenseWithProrationData, UpdateSharedExpenseWithProrationVariables>;
}
export const updateSharedExpenseWithProrationRef: UpdateSharedExpenseWithProrationRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updateSharedExpenseWithProrationRef:
```typescript
const name = updateSharedExpenseWithProrationRef.operationName;
console.log(name);
```

### Variables
The `UpdateSharedExpenseWithProration` mutation requires an argument of type `UpdateSharedExpenseWithProrationVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
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
```
### Return Type
Recall that executing the `UpdateSharedExpenseWithProration` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdateSharedExpenseWithProrationData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdateSharedExpenseWithProrationData {
  journal_update?: Journal_Key | null;
  entry_deleteMany: number;
  payerEntry: Entry_Key;
  user1Entry: Entry_Key;
  user2Entry: Entry_Key;
}
```
### Using `UpdateSharedExpenseWithProration`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updateSharedExpenseWithProration, UpdateSharedExpenseWithProrationVariables } from '@pareja-pro/dataconnect';

// The `UpdateSharedExpenseWithProration` mutation requires an argument of type `UpdateSharedExpenseWithProrationVariables`:
const updateSharedExpenseWithProrationVars: UpdateSharedExpenseWithProrationVariables = {
  journalId: ..., 
  householdId: ..., 
  date: ..., 
  description: ..., 
  totalAmount: ..., 
  prorataFactor: ..., 
  payerAccountId: ..., 
  user1ExpenseAccountId: ..., 
  user2ExpenseAccountId: ..., 
  user1Amount: ..., 
  user2Amount: ..., 
  ownerUid: ..., 
  isShared: ..., 
  isRecurring: ..., // optional
  recurringFrequency: ..., // optional
  recurringEndDate: ..., // optional
  categoryId: ..., // optional
};

// Call the `updateSharedExpenseWithProration()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updateSharedExpenseWithProration(updateSharedExpenseWithProrationVars);
// Variables can be defined inline as well.
const { data } = await updateSharedExpenseWithProration({ journalId: ..., householdId: ..., date: ..., description: ..., totalAmount: ..., prorataFactor: ..., payerAccountId: ..., user1ExpenseAccountId: ..., user2ExpenseAccountId: ..., user1Amount: ..., user2Amount: ..., ownerUid: ..., isShared: ..., isRecurring: ..., recurringFrequency: ..., recurringEndDate: ..., categoryId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updateSharedExpenseWithProration(dataConnect, updateSharedExpenseWithProrationVars);

console.log(data.journal_update);
console.log(data.entry_deleteMany);
console.log(data.payerEntry);
console.log(data.user1Entry);
console.log(data.user2Entry);

// Or, you can use the `Promise` API.
updateSharedExpenseWithProration(updateSharedExpenseWithProrationVars).then((response) => {
  const data = response.data;
  console.log(data.journal_update);
  console.log(data.entry_deleteMany);
  console.log(data.payerEntry);
  console.log(data.user1Entry);
  console.log(data.user2Entry);
});
```

### Using `UpdateSharedExpenseWithProration`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updateSharedExpenseWithProrationRef, UpdateSharedExpenseWithProrationVariables } from '@pareja-pro/dataconnect';

// The `UpdateSharedExpenseWithProration` mutation requires an argument of type `UpdateSharedExpenseWithProrationVariables`:
const updateSharedExpenseWithProrationVars: UpdateSharedExpenseWithProrationVariables = {
  journalId: ..., 
  householdId: ..., 
  date: ..., 
  description: ..., 
  totalAmount: ..., 
  prorataFactor: ..., 
  payerAccountId: ..., 
  user1ExpenseAccountId: ..., 
  user2ExpenseAccountId: ..., 
  user1Amount: ..., 
  user2Amount: ..., 
  ownerUid: ..., 
  isShared: ..., 
  isRecurring: ..., // optional
  recurringFrequency: ..., // optional
  recurringEndDate: ..., // optional
  categoryId: ..., // optional
};

// Call the `updateSharedExpenseWithProrationRef()` function to get a reference to the mutation.
const ref = updateSharedExpenseWithProrationRef(updateSharedExpenseWithProrationVars);
// Variables can be defined inline as well.
const ref = updateSharedExpenseWithProrationRef({ journalId: ..., householdId: ..., date: ..., description: ..., totalAmount: ..., prorataFactor: ..., payerAccountId: ..., user1ExpenseAccountId: ..., user2ExpenseAccountId: ..., user1Amount: ..., user2Amount: ..., ownerUid: ..., isShared: ..., isRecurring: ..., recurringFrequency: ..., recurringEndDate: ..., categoryId: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updateSharedExpenseWithProrationRef(dataConnect, updateSharedExpenseWithProrationVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.journal_update);
console.log(data.entry_deleteMany);
console.log(data.payerEntry);
console.log(data.user1Entry);
console.log(data.user2Entry);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.journal_update);
  console.log(data.entry_deleteMany);
  console.log(data.payerEntry);
  console.log(data.user1Entry);
  console.log(data.user2Entry);
});
```

## CreateCategory
You can execute the `CreateCategory` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
createCategory(vars: CreateCategoryVariables): MutationPromise<CreateCategoryData, CreateCategoryVariables>;

interface CreateCategoryRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateCategoryVariables): MutationRef<CreateCategoryData, CreateCategoryVariables>;
}
export const createCategoryRef: CreateCategoryRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createCategory(dc: DataConnect, vars: CreateCategoryVariables): MutationPromise<CreateCategoryData, CreateCategoryVariables>;

interface CreateCategoryRef {
  ...
  (dc: DataConnect, vars: CreateCategoryVariables): MutationRef<CreateCategoryData, CreateCategoryVariables>;
}
export const createCategoryRef: CreateCategoryRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createCategoryRef:
```typescript
const name = createCategoryRef.operationName;
console.log(name);
```

### Variables
The `CreateCategory` mutation requires an argument of type `CreateCategoryVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreateCategoryVariables {
  name: string;
  type: AccountType;
  color?: string | null;
  householdId: UUIDString;
  ownerType: OwnerType;
}
```
### Return Type
Recall that executing the `CreateCategory` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateCategoryData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateCategoryData {
  category_insert: Category_Key;
}
```
### Using `CreateCategory`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createCategory, CreateCategoryVariables } from '@pareja-pro/dataconnect';

// The `CreateCategory` mutation requires an argument of type `CreateCategoryVariables`:
const createCategoryVars: CreateCategoryVariables = {
  name: ..., 
  type: ..., 
  color: ..., // optional
  householdId: ..., 
  ownerType: ..., 
};

// Call the `createCategory()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createCategory(createCategoryVars);
// Variables can be defined inline as well.
const { data } = await createCategory({ name: ..., type: ..., color: ..., householdId: ..., ownerType: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createCategory(dataConnect, createCategoryVars);

console.log(data.category_insert);

// Or, you can use the `Promise` API.
createCategory(createCategoryVars).then((response) => {
  const data = response.data;
  console.log(data.category_insert);
});
```

### Using `CreateCategory`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createCategoryRef, CreateCategoryVariables } from '@pareja-pro/dataconnect';

// The `CreateCategory` mutation requires an argument of type `CreateCategoryVariables`:
const createCategoryVars: CreateCategoryVariables = {
  name: ..., 
  type: ..., 
  color: ..., // optional
  householdId: ..., 
  ownerType: ..., 
};

// Call the `createCategoryRef()` function to get a reference to the mutation.
const ref = createCategoryRef(createCategoryVars);
// Variables can be defined inline as well.
const ref = createCategoryRef({ name: ..., type: ..., color: ..., householdId: ..., ownerType: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createCategoryRef(dataConnect, createCategoryVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.category_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.category_insert);
});
```

## UpdateCategory
You can execute the `UpdateCategory` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
updateCategory(vars: UpdateCategoryVariables): MutationPromise<UpdateCategoryData, UpdateCategoryVariables>;

interface UpdateCategoryRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateCategoryVariables): MutationRef<UpdateCategoryData, UpdateCategoryVariables>;
}
export const updateCategoryRef: UpdateCategoryRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updateCategory(dc: DataConnect, vars: UpdateCategoryVariables): MutationPromise<UpdateCategoryData, UpdateCategoryVariables>;

interface UpdateCategoryRef {
  ...
  (dc: DataConnect, vars: UpdateCategoryVariables): MutationRef<UpdateCategoryData, UpdateCategoryVariables>;
}
export const updateCategoryRef: UpdateCategoryRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updateCategoryRef:
```typescript
const name = updateCategoryRef.operationName;
console.log(name);
```

### Variables
The `UpdateCategory` mutation requires an argument of type `UpdateCategoryVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpdateCategoryVariables {
  id: UUIDString;
  householdId: UUIDString;
  name: string;
  color?: string | null;
}
```
### Return Type
Recall that executing the `UpdateCategory` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdateCategoryData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdateCategoryData {
  category_update?: Category_Key | null;
}
```
### Using `UpdateCategory`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updateCategory, UpdateCategoryVariables } from '@pareja-pro/dataconnect';

// The `UpdateCategory` mutation requires an argument of type `UpdateCategoryVariables`:
const updateCategoryVars: UpdateCategoryVariables = {
  id: ..., 
  householdId: ..., 
  name: ..., 
  color: ..., // optional
};

// Call the `updateCategory()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updateCategory(updateCategoryVars);
// Variables can be defined inline as well.
const { data } = await updateCategory({ id: ..., householdId: ..., name: ..., color: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updateCategory(dataConnect, updateCategoryVars);

console.log(data.category_update);

// Or, you can use the `Promise` API.
updateCategory(updateCategoryVars).then((response) => {
  const data = response.data;
  console.log(data.category_update);
});
```

### Using `UpdateCategory`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updateCategoryRef, UpdateCategoryVariables } from '@pareja-pro/dataconnect';

// The `UpdateCategory` mutation requires an argument of type `UpdateCategoryVariables`:
const updateCategoryVars: UpdateCategoryVariables = {
  id: ..., 
  householdId: ..., 
  name: ..., 
  color: ..., // optional
};

// Call the `updateCategoryRef()` function to get a reference to the mutation.
const ref = updateCategoryRef(updateCategoryVars);
// Variables can be defined inline as well.
const ref = updateCategoryRef({ id: ..., householdId: ..., name: ..., color: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updateCategoryRef(dataConnect, updateCategoryVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.category_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.category_update);
});
```

## DeleteCategory
You can execute the `DeleteCategory` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
deleteCategory(vars: DeleteCategoryVariables): MutationPromise<DeleteCategoryData, DeleteCategoryVariables>;

interface DeleteCategoryRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteCategoryVariables): MutationRef<DeleteCategoryData, DeleteCategoryVariables>;
}
export const deleteCategoryRef: DeleteCategoryRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
deleteCategory(dc: DataConnect, vars: DeleteCategoryVariables): MutationPromise<DeleteCategoryData, DeleteCategoryVariables>;

interface DeleteCategoryRef {
  ...
  (dc: DataConnect, vars: DeleteCategoryVariables): MutationRef<DeleteCategoryData, DeleteCategoryVariables>;
}
export const deleteCategoryRef: DeleteCategoryRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the deleteCategoryRef:
```typescript
const name = deleteCategoryRef.operationName;
console.log(name);
```

### Variables
The `DeleteCategory` mutation requires an argument of type `DeleteCategoryVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface DeleteCategoryVariables {
  id: UUIDString;
  householdId: UUIDString;
}
```
### Return Type
Recall that executing the `DeleteCategory` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `DeleteCategoryData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface DeleteCategoryData {
  category_delete?: Category_Key | null;
}
```
### Using `DeleteCategory`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, deleteCategory, DeleteCategoryVariables } from '@pareja-pro/dataconnect';

// The `DeleteCategory` mutation requires an argument of type `DeleteCategoryVariables`:
const deleteCategoryVars: DeleteCategoryVariables = {
  id: ..., 
  householdId: ..., 
};

// Call the `deleteCategory()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await deleteCategory(deleteCategoryVars);
// Variables can be defined inline as well.
const { data } = await deleteCategory({ id: ..., householdId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await deleteCategory(dataConnect, deleteCategoryVars);

console.log(data.category_delete);

// Or, you can use the `Promise` API.
deleteCategory(deleteCategoryVars).then((response) => {
  const data = response.data;
  console.log(data.category_delete);
});
```

### Using `DeleteCategory`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, deleteCategoryRef, DeleteCategoryVariables } from '@pareja-pro/dataconnect';

// The `DeleteCategory` mutation requires an argument of type `DeleteCategoryVariables`:
const deleteCategoryVars: DeleteCategoryVariables = {
  id: ..., 
  householdId: ..., 
};

// Call the `deleteCategoryRef()` function to get a reference to the mutation.
const ref = deleteCategoryRef(deleteCategoryVars);
// Variables can be defined inline as well.
const ref = deleteCategoryRef({ id: ..., householdId: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = deleteCategoryRef(dataConnect, deleteCategoryVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.category_delete);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.category_delete);
});
```

## CreateTag
You can execute the `CreateTag` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
createTag(vars: CreateTagVariables): MutationPromise<CreateTagData, CreateTagVariables>;

interface CreateTagRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateTagVariables): MutationRef<CreateTagData, CreateTagVariables>;
}
export const createTagRef: CreateTagRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createTag(dc: DataConnect, vars: CreateTagVariables): MutationPromise<CreateTagData, CreateTagVariables>;

interface CreateTagRef {
  ...
  (dc: DataConnect, vars: CreateTagVariables): MutationRef<CreateTagData, CreateTagVariables>;
}
export const createTagRef: CreateTagRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createTagRef:
```typescript
const name = createTagRef.operationName;
console.log(name);
```

### Variables
The `CreateTag` mutation requires an argument of type `CreateTagVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreateTagVariables {
  name: string;
  householdId: UUIDString;
}
```
### Return Type
Recall that executing the `CreateTag` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateTagData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateTagData {
  tag_insert: Tag_Key;
}
```
### Using `CreateTag`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createTag, CreateTagVariables } from '@pareja-pro/dataconnect';

// The `CreateTag` mutation requires an argument of type `CreateTagVariables`:
const createTagVars: CreateTagVariables = {
  name: ..., 
  householdId: ..., 
};

// Call the `createTag()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createTag(createTagVars);
// Variables can be defined inline as well.
const { data } = await createTag({ name: ..., householdId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createTag(dataConnect, createTagVars);

console.log(data.tag_insert);

// Or, you can use the `Promise` API.
createTag(createTagVars).then((response) => {
  const data = response.data;
  console.log(data.tag_insert);
});
```

### Using `CreateTag`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createTagRef, CreateTagVariables } from '@pareja-pro/dataconnect';

// The `CreateTag` mutation requires an argument of type `CreateTagVariables`:
const createTagVars: CreateTagVariables = {
  name: ..., 
  householdId: ..., 
};

// Call the `createTagRef()` function to get a reference to the mutation.
const ref = createTagRef(createTagVars);
// Variables can be defined inline as well.
const ref = createTagRef({ name: ..., householdId: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createTagRef(dataConnect, createTagVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.tag_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.tag_insert);
});
```

## DeleteTag
You can execute the `DeleteTag` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
deleteTag(vars: DeleteTagVariables): MutationPromise<DeleteTagData, DeleteTagVariables>;

interface DeleteTagRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteTagVariables): MutationRef<DeleteTagData, DeleteTagVariables>;
}
export const deleteTagRef: DeleteTagRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
deleteTag(dc: DataConnect, vars: DeleteTagVariables): MutationPromise<DeleteTagData, DeleteTagVariables>;

interface DeleteTagRef {
  ...
  (dc: DataConnect, vars: DeleteTagVariables): MutationRef<DeleteTagData, DeleteTagVariables>;
}
export const deleteTagRef: DeleteTagRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the deleteTagRef:
```typescript
const name = deleteTagRef.operationName;
console.log(name);
```

### Variables
The `DeleteTag` mutation requires an argument of type `DeleteTagVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface DeleteTagVariables {
  id: UUIDString;
  householdId: UUIDString;
}
```
### Return Type
Recall that executing the `DeleteTag` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `DeleteTagData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface DeleteTagData {
  tag_delete?: Tag_Key | null;
}
```
### Using `DeleteTag`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, deleteTag, DeleteTagVariables } from '@pareja-pro/dataconnect';

// The `DeleteTag` mutation requires an argument of type `DeleteTagVariables`:
const deleteTagVars: DeleteTagVariables = {
  id: ..., 
  householdId: ..., 
};

// Call the `deleteTag()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await deleteTag(deleteTagVars);
// Variables can be defined inline as well.
const { data } = await deleteTag({ id: ..., householdId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await deleteTag(dataConnect, deleteTagVars);

console.log(data.tag_delete);

// Or, you can use the `Promise` API.
deleteTag(deleteTagVars).then((response) => {
  const data = response.data;
  console.log(data.tag_delete);
});
```

### Using `DeleteTag`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, deleteTagRef, DeleteTagVariables } from '@pareja-pro/dataconnect';

// The `DeleteTag` mutation requires an argument of type `DeleteTagVariables`:
const deleteTagVars: DeleteTagVariables = {
  id: ..., 
  householdId: ..., 
};

// Call the `deleteTagRef()` function to get a reference to the mutation.
const ref = deleteTagRef(deleteTagVars);
// Variables can be defined inline as well.
const ref = deleteTagRef({ id: ..., householdId: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = deleteTagRef(dataConnect, deleteTagVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.tag_delete);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.tag_delete);
});
```

## SetJournalTags
You can execute the `SetJournalTags` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
setJournalTags(vars: SetJournalTagsVariables): MutationPromise<SetJournalTagsData, SetJournalTagsVariables>;

interface SetJournalTagsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: SetJournalTagsVariables): MutationRef<SetJournalTagsData, SetJournalTagsVariables>;
}
export const setJournalTagsRef: SetJournalTagsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
setJournalTags(dc: DataConnect, vars: SetJournalTagsVariables): MutationPromise<SetJournalTagsData, SetJournalTagsVariables>;

interface SetJournalTagsRef {
  ...
  (dc: DataConnect, vars: SetJournalTagsVariables): MutationRef<SetJournalTagsData, SetJournalTagsVariables>;
}
export const setJournalTagsRef: SetJournalTagsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the setJournalTagsRef:
```typescript
const name = setJournalTagsRef.operationName;
console.log(name);
```

### Variables
The `SetJournalTags` mutation requires an argument of type `SetJournalTagsVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface SetJournalTagsVariables {
  journalId: UUIDString;
  householdId: UUIDString;
  tagIds: UUIDString[];
}
```
### Return Type
Recall that executing the `SetJournalTags` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `SetJournalTagsData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface SetJournalTagsData {
  journalTag_deleteMany: number;
}
```
### Using `SetJournalTags`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, setJournalTags, SetJournalTagsVariables } from '@pareja-pro/dataconnect';

// The `SetJournalTags` mutation requires an argument of type `SetJournalTagsVariables`:
const setJournalTagsVars: SetJournalTagsVariables = {
  journalId: ..., 
  householdId: ..., 
  tagIds: ..., 
};

// Call the `setJournalTags()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await setJournalTags(setJournalTagsVars);
// Variables can be defined inline as well.
const { data } = await setJournalTags({ journalId: ..., householdId: ..., tagIds: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await setJournalTags(dataConnect, setJournalTagsVars);

console.log(data.journalTag_deleteMany);

// Or, you can use the `Promise` API.
setJournalTags(setJournalTagsVars).then((response) => {
  const data = response.data;
  console.log(data.journalTag_deleteMany);
});
```

### Using `SetJournalTags`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, setJournalTagsRef, SetJournalTagsVariables } from '@pareja-pro/dataconnect';

// The `SetJournalTags` mutation requires an argument of type `SetJournalTagsVariables`:
const setJournalTagsVars: SetJournalTagsVariables = {
  journalId: ..., 
  householdId: ..., 
  tagIds: ..., 
};

// Call the `setJournalTagsRef()` function to get a reference to the mutation.
const ref = setJournalTagsRef(setJournalTagsVars);
// Variables can be defined inline as well.
const ref = setJournalTagsRef({ journalId: ..., householdId: ..., tagIds: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = setJournalTagsRef(dataConnect, setJournalTagsVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.journalTag_deleteMany);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.journalTag_deleteMany);
});
```

## AddTagToJournal
You can execute the `AddTagToJournal` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
addTagToJournal(vars: AddTagToJournalVariables): MutationPromise<AddTagToJournalData, AddTagToJournalVariables>;

interface AddTagToJournalRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: AddTagToJournalVariables): MutationRef<AddTagToJournalData, AddTagToJournalVariables>;
}
export const addTagToJournalRef: AddTagToJournalRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
addTagToJournal(dc: DataConnect, vars: AddTagToJournalVariables): MutationPromise<AddTagToJournalData, AddTagToJournalVariables>;

interface AddTagToJournalRef {
  ...
  (dc: DataConnect, vars: AddTagToJournalVariables): MutationRef<AddTagToJournalData, AddTagToJournalVariables>;
}
export const addTagToJournalRef: AddTagToJournalRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the addTagToJournalRef:
```typescript
const name = addTagToJournalRef.operationName;
console.log(name);
```

### Variables
The `AddTagToJournal` mutation requires an argument of type `AddTagToJournalVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface AddTagToJournalVariables {
  journalId: UUIDString;
  householdId: UUIDString;
  tagId: UUIDString;
}
```
### Return Type
Recall that executing the `AddTagToJournal` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `AddTagToJournalData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface AddTagToJournalData {
  journalTag_insert: JournalTag_Key;
}
```
### Using `AddTagToJournal`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, addTagToJournal, AddTagToJournalVariables } from '@pareja-pro/dataconnect';

// The `AddTagToJournal` mutation requires an argument of type `AddTagToJournalVariables`:
const addTagToJournalVars: AddTagToJournalVariables = {
  journalId: ..., 
  householdId: ..., 
  tagId: ..., 
};

// Call the `addTagToJournal()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await addTagToJournal(addTagToJournalVars);
// Variables can be defined inline as well.
const { data } = await addTagToJournal({ journalId: ..., householdId: ..., tagId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await addTagToJournal(dataConnect, addTagToJournalVars);

console.log(data.journalTag_insert);

// Or, you can use the `Promise` API.
addTagToJournal(addTagToJournalVars).then((response) => {
  const data = response.data;
  console.log(data.journalTag_insert);
});
```

### Using `AddTagToJournal`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, addTagToJournalRef, AddTagToJournalVariables } from '@pareja-pro/dataconnect';

// The `AddTagToJournal` mutation requires an argument of type `AddTagToJournalVariables`:
const addTagToJournalVars: AddTagToJournalVariables = {
  journalId: ..., 
  householdId: ..., 
  tagId: ..., 
};

// Call the `addTagToJournalRef()` function to get a reference to the mutation.
const ref = addTagToJournalRef(addTagToJournalVars);
// Variables can be defined inline as well.
const ref = addTagToJournalRef({ journalId: ..., householdId: ..., tagId: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = addTagToJournalRef(dataConnect, addTagToJournalVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.journalTag_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.journalTag_insert);
});
```

