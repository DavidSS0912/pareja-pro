# Basic Usage

Always prioritize using a supported framework over using the generated SDK
directly. Supported frameworks simplify the developer experience and help ensure
best practices are followed.





## Advanced Usage
If a user is not using a supported framework, they can use the generated SDK directly.

Here's an example of how to use it with the first 5 operations:

```js
import { createJournalWithEntries, createSharedExpenseWithProration, createBudget, updateBudget, deleteBudget, createAccount, updateAccount, archiveAccount, deleteAccount, reassignEntries } from '@pareja-pro/dataconnect';


// Operation CreateJournalWithEntries:  For variables, look at type CreateJournalWithEntriesVars in ../index.d.ts
const { data } = await CreateJournalWithEntries(dataConnect, createJournalWithEntriesVars);

// Operation CreateSharedExpenseWithProration:  For variables, look at type CreateSharedExpenseWithProrationVars in ../index.d.ts
const { data } = await CreateSharedExpenseWithProration(dataConnect, createSharedExpenseWithProrationVars);

// Operation CreateBudget:  For variables, look at type CreateBudgetVars in ../index.d.ts
const { data } = await CreateBudget(dataConnect, createBudgetVars);

// Operation UpdateBudget:  For variables, look at type UpdateBudgetVars in ../index.d.ts
const { data } = await UpdateBudget(dataConnect, updateBudgetVars);

// Operation DeleteBudget:  For variables, look at type DeleteBudgetVars in ../index.d.ts
const { data } = await DeleteBudget(dataConnect, deleteBudgetVars);

// Operation CreateAccount:  For variables, look at type CreateAccountVars in ../index.d.ts
const { data } = await CreateAccount(dataConnect, createAccountVars);

// Operation UpdateAccount:  For variables, look at type UpdateAccountVars in ../index.d.ts
const { data } = await UpdateAccount(dataConnect, updateAccountVars);

// Operation ArchiveAccount:  For variables, look at type ArchiveAccountVars in ../index.d.ts
const { data } = await ArchiveAccount(dataConnect, archiveAccountVars);

// Operation DeleteAccount:  For variables, look at type DeleteAccountVars in ../index.d.ts
const { data } = await DeleteAccount(dataConnect, deleteAccountVars);

// Operation ReassignEntries:  For variables, look at type ReassignEntriesVars in ../index.d.ts
const { data } = await ReassignEntries(dataConnect, reassignEntriesVars);


```