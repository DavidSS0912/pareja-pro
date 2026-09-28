# Generated TypeScript README
This README will guide you through the process of using the generated JavaScript SDK package for the connector `orbita2-connector`. It will also provide examples on how to use your generated SDK to call your Data Connect queries and mutations.

***NOTE:** This README is generated alongside the generated SDK. If you make changes to this file, they will be overwritten when the SDK is regenerated.*

# Table of Contents
- [**Overview**](#generated-javascript-readme)
- [**Accessing the connector**](#accessing-the-connector)
  - [*Connecting to the local Emulator*](#connecting-to-the-local-emulator)
- [**Queries**](#queries)
  - [*GetHouseholdNetBalances*](#gethouseholdnetbalances)
  - [*GetMonthBudgets*](#getmonthbudgets)
  - [*GetUnassignedCash*](#getunassignedcash)
  - [*GetSavingsProjects*](#getsavingsprojects)
  - [*GetExternalAssets*](#getexternalassets)
  - [*GetNetWorth*](#getnetworth)
- [**Mutations**](#mutations)
  - [*CreateJournalWithEntries*](#createjournalwithentries)
  - [*CreateSharedExpenseWithProration*](#createsharedexpensewithproration)
  - [*CreateMsiExpense*](#createmsiexpense)
  - [*CreateBudget*](#createbudget)
  - [*UpdateBudgetAmount*](#updatebudgetamount)
  - [*CreateSavingsProject*](#createsavingsproject)
  - [*UpdateProjectProgress*](#updateprojectprogress)
  - [*CreateExternalAsset*](#createexternalasset)
  - [*UpdateExternalAsset*](#updateexternalasset)

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

## GetMonthBudgets
You can execute the `GetMonthBudgets` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
getMonthBudgets(vars: GetMonthBudgetsVariables, options?: ExecuteQueryOptions): QueryPromise<GetMonthBudgetsData, GetMonthBudgetsVariables>;

interface GetMonthBudgetsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetMonthBudgetsVariables): QueryRef<GetMonthBudgetsData, GetMonthBudgetsVariables>;
}
export const getMonthBudgetsRef: GetMonthBudgetsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getMonthBudgets(dc: DataConnect, vars: GetMonthBudgetsVariables, options?: ExecuteQueryOptions): QueryPromise<GetMonthBudgetsData, GetMonthBudgetsVariables>;

interface GetMonthBudgetsRef {
  ...
  (dc: DataConnect, vars: GetMonthBudgetsVariables): QueryRef<GetMonthBudgetsData, GetMonthBudgetsVariables>;
}
export const getMonthBudgetsRef: GetMonthBudgetsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getMonthBudgetsRef:
```typescript
const name = getMonthBudgetsRef.operationName;
console.log(name);
```

### Variables
The `GetMonthBudgets` query requires an argument of type `GetMonthBudgetsVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetMonthBudgetsVariables {
  householdId: UUIDString;
  period: DateString;
}
```
### Return Type
Recall that executing the `GetMonthBudgets` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetMonthBudgetsData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetMonthBudgetsData {
  budgets: ({
    id: UUIDString;
    categoryName: string;
    assignedAmount: number;
    period: DateString;
    ownerType: OwnerType;
  } & Budget_Key)[];
}
```
### Using `GetMonthBudgets`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getMonthBudgets, GetMonthBudgetsVariables } from '@pareja-pro/dataconnect';

// The `GetMonthBudgets` query requires an argument of type `GetMonthBudgetsVariables`:
const getMonthBudgetsVars: GetMonthBudgetsVariables = {
  householdId: ..., 
  period: ..., 
};

// Call the `getMonthBudgets()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getMonthBudgets(getMonthBudgetsVars);
// Variables can be defined inline as well.
const { data } = await getMonthBudgets({ householdId: ..., period: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getMonthBudgets(dataConnect, getMonthBudgetsVars);

console.log(data.budgets);

// Or, you can use the `Promise` API.
getMonthBudgets(getMonthBudgetsVars).then((response) => {
  const data = response.data;
  console.log(data.budgets);
});
```

### Using `GetMonthBudgets`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getMonthBudgetsRef, GetMonthBudgetsVariables } from '@pareja-pro/dataconnect';

// The `GetMonthBudgets` query requires an argument of type `GetMonthBudgetsVariables`:
const getMonthBudgetsVars: GetMonthBudgetsVariables = {
  householdId: ..., 
  period: ..., 
};

// Call the `getMonthBudgetsRef()` function to get a reference to the query.
const ref = getMonthBudgetsRef(getMonthBudgetsVars);
// Variables can be defined inline as well.
const ref = getMonthBudgetsRef({ householdId: ..., period: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getMonthBudgetsRef(dataConnect, getMonthBudgetsVars);

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
  unassignedCashes: ({
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

console.log(data.unassignedCashes);

// Or, you can use the `Promise` API.
getUnassignedCash(getUnassignedCashVars).then((response) => {
  const data = response.data;
  console.log(data.unassignedCashes);
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

console.log(data.unassignedCashes);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.unassignedCashes);
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
  netWorthSnapshots: ({
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

console.log(data.netWorthSnapshots);

// Or, you can use the `Promise` API.
getNetWorth(getNetWorthVars).then((response) => {
  const data = response.data;
  console.log(data.netWorthSnapshots);
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

console.log(data.netWorthSnapshots);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.netWorthSnapshots);
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
  accountId1: UUIDString;
  amount1: number;
  prorataFactor1: number;
  accountId2: UUIDString;
  amount2: number;
  prorataFactor2: number;
}
```
### Return Type
Recall that executing the `CreateJournalWithEntries` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateJournalWithEntriesData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateJournalWithEntriesData {
  journal_insert: Journal_Key;
  entry1: Entry_Key;
  entry2: Entry_Key;
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
  accountId1: ..., 
  amount1: ..., 
  prorataFactor1: ..., 
  accountId2: ..., 
  amount2: ..., 
  prorataFactor2: ..., 
};

// Call the `createJournalWithEntries()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createJournalWithEntries(createJournalWithEntriesVars);
// Variables can be defined inline as well.
const { data } = await createJournalWithEntries({ householdId: ..., date: ..., description: ..., accountId1: ..., amount1: ..., prorataFactor1: ..., accountId2: ..., amount2: ..., prorataFactor2: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createJournalWithEntries(dataConnect, createJournalWithEntriesVars);

console.log(data.journal_insert);
console.log(data.entry1);
console.log(data.entry2);

// Or, you can use the `Promise` API.
createJournalWithEntries(createJournalWithEntriesVars).then((response) => {
  const data = response.data;
  console.log(data.journal_insert);
  console.log(data.entry1);
  console.log(data.entry2);
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
  accountId1: ..., 
  amount1: ..., 
  prorataFactor1: ..., 
  accountId2: ..., 
  amount2: ..., 
  prorataFactor2: ..., 
};

// Call the `createJournalWithEntriesRef()` function to get a reference to the mutation.
const ref = createJournalWithEntriesRef(createJournalWithEntriesVars);
// Variables can be defined inline as well.
const ref = createJournalWithEntriesRef({ householdId: ..., date: ..., description: ..., accountId1: ..., amount1: ..., prorataFactor1: ..., accountId2: ..., amount2: ..., prorataFactor2: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createJournalWithEntriesRef(dataConnect, createJournalWithEntriesVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.journal_insert);
console.log(data.entry1);
console.log(data.entry2);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.journal_insert);
  console.log(data.entry1);
  console.log(data.entry2);
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
  payerAmount: number;
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
  payerAmount: ..., 
};

// Call the `createSharedExpenseWithProration()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createSharedExpenseWithProration(createSharedExpenseWithProrationVars);
// Variables can be defined inline as well.
const { data } = await createSharedExpenseWithProration({ householdId: ..., date: ..., description: ..., totalAmount: ..., prorataFactor: ..., payerAccountId: ..., user1ExpenseAccountId: ..., user2ExpenseAccountId: ..., user1Amount: ..., user2Amount: ..., payerAmount: ..., });

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
  payerAmount: ..., 
};

// Call the `createSharedExpenseWithProrationRef()` function to get a reference to the mutation.
const ref = createSharedExpenseWithProrationRef(createSharedExpenseWithProrationVars);
// Variables can be defined inline as well.
const ref = createSharedExpenseWithProrationRef({ householdId: ..., date: ..., description: ..., totalAmount: ..., prorataFactor: ..., payerAccountId: ..., user1ExpenseAccountId: ..., user2ExpenseAccountId: ..., user1Amount: ..., user2Amount: ..., payerAmount: ..., });

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

## CreateMsiExpense
You can execute the `CreateMsiExpense` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
createMsiExpense(vars: CreateMsiExpenseVariables): MutationPromise<CreateMsiExpenseData, CreateMsiExpenseVariables>;

interface CreateMsiExpenseRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateMsiExpenseVariables): MutationRef<CreateMsiExpenseData, CreateMsiExpenseVariables>;
}
export const createMsiExpenseRef: CreateMsiExpenseRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createMsiExpense(dc: DataConnect, vars: CreateMsiExpenseVariables): MutationPromise<CreateMsiExpenseData, CreateMsiExpenseVariables>;

interface CreateMsiExpenseRef {
  ...
  (dc: DataConnect, vars: CreateMsiExpenseVariables): MutationRef<CreateMsiExpenseData, CreateMsiExpenseVariables>;
}
export const createMsiExpenseRef: CreateMsiExpenseRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createMsiExpenseRef:
```typescript
const name = createMsiExpenseRef.operationName;
console.log(name);
```

### Variables
The `CreateMsiExpense` mutation requires an argument of type `CreateMsiExpenseVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
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
```
### Return Type
Recall that executing the `CreateMsiExpense` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateMsiExpenseData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateMsiExpenseData {
  journal_insert: Journal_Key;
  entry_insert: Entry_Key;
}
```
### Using `CreateMsiExpense`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createMsiExpense, CreateMsiExpenseVariables } from '@pareja-pro/dataconnect';

// The `CreateMsiExpense` mutation requires an argument of type `CreateMsiExpenseVariables`:
const createMsiExpenseVars: CreateMsiExpenseVariables = {
  householdId: ..., 
  date: ..., 
  description: ..., 
  totalAmount: ..., 
  months: ..., 
  creditCardAccountId: ..., 
  expenseAccountId: ..., 
  prorataFactor: ..., 
  monthlyAmount: ..., 
};

// Call the `createMsiExpense()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createMsiExpense(createMsiExpenseVars);
// Variables can be defined inline as well.
const { data } = await createMsiExpense({ householdId: ..., date: ..., description: ..., totalAmount: ..., months: ..., creditCardAccountId: ..., expenseAccountId: ..., prorataFactor: ..., monthlyAmount: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createMsiExpense(dataConnect, createMsiExpenseVars);

console.log(data.journal_insert);
console.log(data.entry_insert);

// Or, you can use the `Promise` API.
createMsiExpense(createMsiExpenseVars).then((response) => {
  const data = response.data;
  console.log(data.journal_insert);
  console.log(data.entry_insert);
});
```

### Using `CreateMsiExpense`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createMsiExpenseRef, CreateMsiExpenseVariables } from '@pareja-pro/dataconnect';

// The `CreateMsiExpense` mutation requires an argument of type `CreateMsiExpenseVariables`:
const createMsiExpenseVars: CreateMsiExpenseVariables = {
  householdId: ..., 
  date: ..., 
  description: ..., 
  totalAmount: ..., 
  months: ..., 
  creditCardAccountId: ..., 
  expenseAccountId: ..., 
  prorataFactor: ..., 
  monthlyAmount: ..., 
};

// Call the `createMsiExpenseRef()` function to get a reference to the mutation.
const ref = createMsiExpenseRef(createMsiExpenseVars);
// Variables can be defined inline as well.
const ref = createMsiExpenseRef({ householdId: ..., date: ..., description: ..., totalAmount: ..., months: ..., creditCardAccountId: ..., expenseAccountId: ..., prorataFactor: ..., monthlyAmount: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createMsiExpenseRef(dataConnect, createMsiExpenseVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.journal_insert);
console.log(data.entry_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.journal_insert);
  console.log(data.entry_insert);
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
  categoryName: string;
  assignedAmount: number;
  period: DateString;
  ownerType: OwnerType;
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
  categoryName: ..., 
  assignedAmount: ..., 
  period: ..., 
  ownerType: ..., 
};

// Call the `createBudget()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createBudget(createBudgetVars);
// Variables can be defined inline as well.
const { data } = await createBudget({ householdId: ..., categoryName: ..., assignedAmount: ..., period: ..., ownerType: ..., });

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
  categoryName: ..., 
  assignedAmount: ..., 
  period: ..., 
  ownerType: ..., 
};

// Call the `createBudgetRef()` function to get a reference to the mutation.
const ref = createBudgetRef(createBudgetVars);
// Variables can be defined inline as well.
const ref = createBudgetRef({ householdId: ..., categoryName: ..., assignedAmount: ..., period: ..., ownerType: ..., });

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

## UpdateBudgetAmount
You can execute the `UpdateBudgetAmount` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
updateBudgetAmount(vars: UpdateBudgetAmountVariables): MutationPromise<UpdateBudgetAmountData, UpdateBudgetAmountVariables>;

interface UpdateBudgetAmountRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateBudgetAmountVariables): MutationRef<UpdateBudgetAmountData, UpdateBudgetAmountVariables>;
}
export const updateBudgetAmountRef: UpdateBudgetAmountRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updateBudgetAmount(dc: DataConnect, vars: UpdateBudgetAmountVariables): MutationPromise<UpdateBudgetAmountData, UpdateBudgetAmountVariables>;

interface UpdateBudgetAmountRef {
  ...
  (dc: DataConnect, vars: UpdateBudgetAmountVariables): MutationRef<UpdateBudgetAmountData, UpdateBudgetAmountVariables>;
}
export const updateBudgetAmountRef: UpdateBudgetAmountRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updateBudgetAmountRef:
```typescript
const name = updateBudgetAmountRef.operationName;
console.log(name);
```

### Variables
The `UpdateBudgetAmount` mutation requires an argument of type `UpdateBudgetAmountVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpdateBudgetAmountVariables {
  budgetId: UUIDString;
  assignedAmount: number;
}
```
### Return Type
Recall that executing the `UpdateBudgetAmount` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdateBudgetAmountData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdateBudgetAmountData {
  budget_update?: Budget_Key | null;
}
```
### Using `UpdateBudgetAmount`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updateBudgetAmount, UpdateBudgetAmountVariables } from '@pareja-pro/dataconnect';

// The `UpdateBudgetAmount` mutation requires an argument of type `UpdateBudgetAmountVariables`:
const updateBudgetAmountVars: UpdateBudgetAmountVariables = {
  budgetId: ..., 
  assignedAmount: ..., 
};

// Call the `updateBudgetAmount()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updateBudgetAmount(updateBudgetAmountVars);
// Variables can be defined inline as well.
const { data } = await updateBudgetAmount({ budgetId: ..., assignedAmount: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updateBudgetAmount(dataConnect, updateBudgetAmountVars);

console.log(data.budget_update);

// Or, you can use the `Promise` API.
updateBudgetAmount(updateBudgetAmountVars).then((response) => {
  const data = response.data;
  console.log(data.budget_update);
});
```

### Using `UpdateBudgetAmount`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updateBudgetAmountRef, UpdateBudgetAmountVariables } from '@pareja-pro/dataconnect';

// The `UpdateBudgetAmount` mutation requires an argument of type `UpdateBudgetAmountVariables`:
const updateBudgetAmountVars: UpdateBudgetAmountVariables = {
  budgetId: ..., 
  assignedAmount: ..., 
};

// Call the `updateBudgetAmountRef()` function to get a reference to the mutation.
const ref = updateBudgetAmountRef(updateBudgetAmountVars);
// Variables can be defined inline as well.
const ref = updateBudgetAmountRef({ budgetId: ..., assignedAmount: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updateBudgetAmountRef(dataConnect, updateBudgetAmountVars);

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
};

// Call the `createSavingsProject()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createSavingsProject(createSavingsProjectVars);
// Variables can be defined inline as well.
const { data } = await createSavingsProject({ householdId: ..., name: ..., targetAmount: ..., priority: ..., });

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
};

// Call the `createSavingsProjectRef()` function to get a reference to the mutation.
const ref = createSavingsProjectRef(createSavingsProjectVars);
// Variables can be defined inline as well.
const ref = createSavingsProjectRef({ householdId: ..., name: ..., targetAmount: ..., priority: ..., });

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
  amountToAdd: ..., 
};

// Call the `updateProjectProgress()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updateProjectProgress(updateProjectProgressVars);
// Variables can be defined inline as well.
const { data } = await updateProjectProgress({ projectId: ..., amountToAdd: ..., });

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
  amountToAdd: ..., 
};

// Call the `updateProjectProgressRef()` function to get a reference to the mutation.
const ref = updateProjectProgressRef(updateProjectProgressVars);
// Variables can be defined inline as well.
const ref = updateProjectProgressRef({ projectId: ..., amountToAdd: ..., });

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
  estimatedValue: ..., 
};

// Call the `updateExternalAsset()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updateExternalAsset(updateExternalAssetVars);
// Variables can be defined inline as well.
const { data } = await updateExternalAsset({ assetId: ..., estimatedValue: ..., });

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
  estimatedValue: ..., 
};

// Call the `updateExternalAssetRef()` function to get a reference to the mutation.
const ref = updateExternalAssetRef(updateExternalAssetVars);
// Variables can be defined inline as well.
const ref = updateExternalAssetRef({ assetId: ..., estimatedValue: ..., });

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

