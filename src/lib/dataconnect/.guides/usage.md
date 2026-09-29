# Basic Usage

Always prioritize using a supported framework over using the generated SDK
directly. Supported frameworks simplify the developer experience and help ensure
best practices are followed.





## Advanced Usage
If a user is not using a supported framework, they can use the generated SDK directly.

Here's an example of how to use it with the first 5 operations:

```js
import { getHouseholdNetBalances, getMonthBudgets, getUnassignedCash, getSavingsProjects, getExternalAssets, getNetWorth, getLatestRate, getExpensesByHousehold, getCurrentUser, createJournalWithEntries } from '@pareja-pro/dataconnect';


// Operation GetHouseholdNetBalances:  For variables, look at type GetHouseholdNetBalancesVars in ../index.d.ts
const { data } = await GetHouseholdNetBalances(dataConnect, getHouseholdNetBalancesVars);

// Operation GetMonthBudgets:  For variables, look at type GetMonthBudgetsVars in ../index.d.ts
const { data } = await GetMonthBudgets(dataConnect, getMonthBudgetsVars);

// Operation GetUnassignedCash:  For variables, look at type GetUnassignedCashVars in ../index.d.ts
const { data } = await GetUnassignedCash(dataConnect, getUnassignedCashVars);

// Operation GetSavingsProjects:  For variables, look at type GetSavingsProjectsVars in ../index.d.ts
const { data } = await GetSavingsProjects(dataConnect, getSavingsProjectsVars);

// Operation GetExternalAssets:  For variables, look at type GetExternalAssetsVars in ../index.d.ts
const { data } = await GetExternalAssets(dataConnect, getExternalAssetsVars);

// Operation GetNetWorth:  For variables, look at type GetNetWorthVars in ../index.d.ts
const { data } = await GetNetWorth(dataConnect, getNetWorthVars);

// Operation GetLatestRate:  For variables, look at type GetLatestRateVars in ../index.d.ts
const { data } = await GetLatestRate(dataConnect, getLatestRateVars);

// Operation GetExpensesByHousehold:  For variables, look at type GetExpensesByHouseholdVars in ../index.d.ts
const { data } = await GetExpensesByHousehold(dataConnect, getExpensesByHouseholdVars);

// Operation GetCurrentUser: 
const { data } = await GetCurrentUser(dataConnect);

// Operation CreateJournalWithEntries:  For variables, look at type CreateJournalWithEntriesVars in ../index.d.ts
const { data } = await CreateJournalWithEntries(dataConnect, createJournalWithEntriesVars);


```