# Basic Usage

Always prioritize using a supported framework over using the generated SDK
directly. Supported frameworks simplify the developer experience and help ensure
best practices are followed.





## Advanced Usage
If a user is not using a supported framework, they can use the generated SDK directly.

Here's an example of how to use it with the first 5 operations:

```js
import { createJournalWithEntries, createSharedExpenseWithProration, createMsiExpense, createBudget, updateBudgetAmount, createSavingsProject, updateProjectProgress, createExternalAsset, updateExternalAsset, getHouseholdNetBalances } from '@pareja-pro/dataconnect';


// Operation CreateJournalWithEntries:  For variables, look at type CreateJournalWithEntriesVars in ../index.d.ts
const { data } = await CreateJournalWithEntries(dataConnect, createJournalWithEntriesVars);

// Operation CreateSharedExpenseWithProration:  For variables, look at type CreateSharedExpenseWithProrationVars in ../index.d.ts
const { data } = await CreateSharedExpenseWithProration(dataConnect, createSharedExpenseWithProrationVars);

// Operation CreateMsiExpense:  For variables, look at type CreateMsiExpenseVars in ../index.d.ts
const { data } = await CreateMsiExpense(dataConnect, createMsiExpenseVars);

// Operation CreateBudget:  For variables, look at type CreateBudgetVars in ../index.d.ts
const { data } = await CreateBudget(dataConnect, createBudgetVars);

// Operation UpdateBudgetAmount:  For variables, look at type UpdateBudgetAmountVars in ../index.d.ts
const { data } = await UpdateBudgetAmount(dataConnect, updateBudgetAmountVars);

// Operation CreateSavingsProject:  For variables, look at type CreateSavingsProjectVars in ../index.d.ts
const { data } = await CreateSavingsProject(dataConnect, createSavingsProjectVars);

// Operation UpdateProjectProgress:  For variables, look at type UpdateProjectProgressVars in ../index.d.ts
const { data } = await UpdateProjectProgress(dataConnect, updateProjectProgressVars);

// Operation CreateExternalAsset:  For variables, look at type CreateExternalAssetVars in ../index.d.ts
const { data } = await CreateExternalAsset(dataConnect, createExternalAssetVars);

// Operation UpdateExternalAsset:  For variables, look at type UpdateExternalAssetVars in ../index.d.ts
const { data } = await UpdateExternalAsset(dataConnect, updateExternalAssetVars);

// Operation GetHouseholdNetBalances:  For variables, look at type GetHouseholdNetBalancesVars in ../index.d.ts
const { data } = await GetHouseholdNetBalances(dataConnect, getHouseholdNetBalancesVars);


```