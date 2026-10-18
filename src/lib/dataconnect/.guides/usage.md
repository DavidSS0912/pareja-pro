# Basic Usage

Always prioritize using a supported framework over using the generated SDK
directly. Supported frameworks simplify the developer experience and help ensure
best practices are followed.





## Advanced Usage
If a user is not using a supported framework, they can use the generated SDK directly.

Here's an example of how to use it with the first 5 operations:

```js
import { getHouseholdAccounts, getHouseholdNetBalances, getBudgets, getBudgetsByMonth, getUnassignedCash, getSavingsProjects, getExternalAssets, getNetWorth, getLatestRate, getExpensesByHousehold } from '@pareja-pro/dataconnect';


// Operation GetHouseholdAccounts:  For variables, look at type GetHouseholdAccountsVars in ../index.d.ts
const { data } = await GetHouseholdAccounts(dataConnect, getHouseholdAccountsVars);

// Operation GetHouseholdNetBalances:  For variables, look at type GetHouseholdNetBalancesVars in ../index.d.ts
const { data } = await GetHouseholdNetBalances(dataConnect, getHouseholdNetBalancesVars);

// Operation GetBudgets:  For variables, look at type GetBudgetsVars in ../index.d.ts
const { data } = await GetBudgets(dataConnect, getBudgetsVars);

// Operation GetBudgetsByMonth:  For variables, look at type GetBudgetsByMonthVars in ../index.d.ts
const { data } = await GetBudgetsByMonth(dataConnect, getBudgetsByMonthVars);

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


```