# Generated TypeScript README
This README will guide you through the process of using the generated JavaScript SDK package for the connector `orbita2-connector`. It will also provide examples on how to use your generated SDK to call your Data Connect queries and mutations.

***NOTE:** This README is generated alongside the generated SDK. If you make changes to this file, they will be overwritten when the SDK is regenerated.*

# Table of Contents
- [**Overview**](#generated-javascript-readme)
- [**Accessing the connector**](#accessing-the-connector)
  - [*Connecting to the local Emulator*](#connecting-to-the-local-emulator)
- [**Queries**](#queries)
  - [*GetHouseholdNetBalances*](#gethouseholdnetbalances)
- [**Mutations**](#mutations)
  - [*CreateJournalWithEntries*](#createjournalwithentries)
  - [*CreateSharedExpenseWithProration*](#createsharedexpensewithproration)
  - [*CreateMsiExpense*](#createmsiexpense)

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

