# Generated TypeScript README
This README will guide you through the process of using the generated JavaScript SDK package for the connector `orbita2-connector`. It will also provide examples on how to use your generated SDK to call your Data Connect queries and mutations.

***NOTE:** This README is generated alongside the generated SDK. If you make changes to this file, they will be overwritten when the SDK is regenerated.*

# Table of Contents
- [**Overview**](#generated-javascript-readme)
- [**Accessing the connector**](#accessing-the-connector)
  - [*Connecting to the local Emulator*](#connecting-to-the-local-emulator)
- [**Queries**](#queries)
  - [*GetHouseholdBalance*](#gethouseholdbalance)
  - [*GetMyEntries*](#getmyentries)
  - [*ValidateJournalBalance*](#validatejournalbalance)
- [**Mutations**](#mutations)
  - [*CreateJournalWithEntries*](#createjournalwithentries)

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

## GetHouseholdBalance
You can execute the `GetHouseholdBalance` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
getHouseholdBalance(vars: GetHouseholdBalanceVariables, options?: ExecuteQueryOptions): QueryPromise<GetHouseholdBalanceData, GetHouseholdBalanceVariables>;

interface GetHouseholdBalanceRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetHouseholdBalanceVariables): QueryRef<GetHouseholdBalanceData, GetHouseholdBalanceVariables>;
}
export const getHouseholdBalanceRef: GetHouseholdBalanceRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getHouseholdBalance(dc: DataConnect, vars: GetHouseholdBalanceVariables, options?: ExecuteQueryOptions): QueryPromise<GetHouseholdBalanceData, GetHouseholdBalanceVariables>;

interface GetHouseholdBalanceRef {
  ...
  (dc: DataConnect, vars: GetHouseholdBalanceVariables): QueryRef<GetHouseholdBalanceData, GetHouseholdBalanceVariables>;
}
export const getHouseholdBalanceRef: GetHouseholdBalanceRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getHouseholdBalanceRef:
```typescript
const name = getHouseholdBalanceRef.operationName;
console.log(name);
```

### Variables
The `GetHouseholdBalance` query requires an argument of type `GetHouseholdBalanceVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetHouseholdBalanceVariables {
  householdId: UUIDString;
}
```
### Return Type
Recall that executing the `GetHouseholdBalance` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetHouseholdBalanceData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `GetHouseholdBalance`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getHouseholdBalance, GetHouseholdBalanceVariables } from '@pareja-pro/dataconnect';

// The `GetHouseholdBalance` query requires an argument of type `GetHouseholdBalanceVariables`:
const getHouseholdBalanceVars: GetHouseholdBalanceVariables = {
  householdId: ..., 
};

// Call the `getHouseholdBalance()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getHouseholdBalance(getHouseholdBalanceVars);
// Variables can be defined inline as well.
const { data } = await getHouseholdBalance({ householdId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getHouseholdBalance(dataConnect, getHouseholdBalanceVars);

console.log(data.accounts);

// Or, you can use the `Promise` API.
getHouseholdBalance(getHouseholdBalanceVars).then((response) => {
  const data = response.data;
  console.log(data.accounts);
});
```

### Using `GetHouseholdBalance`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getHouseholdBalanceRef, GetHouseholdBalanceVariables } from '@pareja-pro/dataconnect';

// The `GetHouseholdBalance` query requires an argument of type `GetHouseholdBalanceVariables`:
const getHouseholdBalanceVars: GetHouseholdBalanceVariables = {
  householdId: ..., 
};

// Call the `getHouseholdBalanceRef()` function to get a reference to the query.
const ref = getHouseholdBalanceRef(getHouseholdBalanceVars);
// Variables can be defined inline as well.
const ref = getHouseholdBalanceRef({ householdId: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getHouseholdBalanceRef(dataConnect, getHouseholdBalanceVars);

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

## GetMyEntries
You can execute the `GetMyEntries` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
getMyEntries(options?: ExecuteQueryOptions): QueryPromise<GetMyEntriesData, undefined>;

interface GetMyEntriesRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<GetMyEntriesData, undefined>;
}
export const getMyEntriesRef: GetMyEntriesRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getMyEntries(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<GetMyEntriesData, undefined>;

interface GetMyEntriesRef {
  ...
  (dc: DataConnect): QueryRef<GetMyEntriesData, undefined>;
}
export const getMyEntriesRef: GetMyEntriesRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getMyEntriesRef:
```typescript
const name = getMyEntriesRef.operationName;
console.log(name);
```

### Variables
The `GetMyEntries` query has no variables.
### Return Type
Recall that executing the `GetMyEntries` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetMyEntriesData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `GetMyEntries`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getMyEntries } from '@pareja-pro/dataconnect';


// Call the `getMyEntries()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getMyEntries();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getMyEntries(dataConnect);

console.log(data.entries);

// Or, you can use the `Promise` API.
getMyEntries().then((response) => {
  const data = response.data;
  console.log(data.entries);
});
```

### Using `GetMyEntries`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getMyEntriesRef } from '@pareja-pro/dataconnect';


// Call the `getMyEntriesRef()` function to get a reference to the query.
const ref = getMyEntriesRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getMyEntriesRef(dataConnect);

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

## ValidateJournalBalance
You can execute the `ValidateJournalBalance` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect/index.d.ts](./index.d.ts):
```typescript
validateJournalBalance(vars: ValidateJournalBalanceVariables, options?: ExecuteQueryOptions): QueryPromise<ValidateJournalBalanceData, ValidateJournalBalanceVariables>;

interface ValidateJournalBalanceRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: ValidateJournalBalanceVariables): QueryRef<ValidateJournalBalanceData, ValidateJournalBalanceVariables>;
}
export const validateJournalBalanceRef: ValidateJournalBalanceRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
validateJournalBalance(dc: DataConnect, vars: ValidateJournalBalanceVariables, options?: ExecuteQueryOptions): QueryPromise<ValidateJournalBalanceData, ValidateJournalBalanceVariables>;

interface ValidateJournalBalanceRef {
  ...
  (dc: DataConnect, vars: ValidateJournalBalanceVariables): QueryRef<ValidateJournalBalanceData, ValidateJournalBalanceVariables>;
}
export const validateJournalBalanceRef: ValidateJournalBalanceRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the validateJournalBalanceRef:
```typescript
const name = validateJournalBalanceRef.operationName;
console.log(name);
```

### Variables
The `ValidateJournalBalance` query requires an argument of type `ValidateJournalBalanceVariables`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface ValidateJournalBalanceVariables {
  journalId: UUIDString;
}
```
### Return Type
Recall that executing the `ValidateJournalBalance` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ValidateJournalBalanceData`, which is defined in [dataconnect/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ValidateJournalBalanceData {
  journalBalances: ({
    netBalance?: number | null;
  })[];
}
```
### Using `ValidateJournalBalance`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, validateJournalBalance, ValidateJournalBalanceVariables } from '@pareja-pro/dataconnect';

// The `ValidateJournalBalance` query requires an argument of type `ValidateJournalBalanceVariables`:
const validateJournalBalanceVars: ValidateJournalBalanceVariables = {
  journalId: ..., 
};

// Call the `validateJournalBalance()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await validateJournalBalance(validateJournalBalanceVars);
// Variables can be defined inline as well.
const { data } = await validateJournalBalance({ journalId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await validateJournalBalance(dataConnect, validateJournalBalanceVars);

console.log(data.journalBalances);

// Or, you can use the `Promise` API.
validateJournalBalance(validateJournalBalanceVars).then((response) => {
  const data = response.data;
  console.log(data.journalBalances);
});
```

### Using `ValidateJournalBalance`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, validateJournalBalanceRef, ValidateJournalBalanceVariables } from '@pareja-pro/dataconnect';

// The `ValidateJournalBalance` query requires an argument of type `ValidateJournalBalanceVariables`:
const validateJournalBalanceVars: ValidateJournalBalanceVariables = {
  journalId: ..., 
};

// Call the `validateJournalBalanceRef()` function to get a reference to the query.
const ref = validateJournalBalanceRef(validateJournalBalanceVars);
// Variables can be defined inline as well.
const ref = validateJournalBalanceRef({ journalId: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = validateJournalBalanceRef(dataConnect, validateJournalBalanceVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.journalBalances);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.journalBalances);
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

