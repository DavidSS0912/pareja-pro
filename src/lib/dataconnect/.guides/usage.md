# Basic Usage

Always prioritize using a supported framework over using the generated SDK
directly. Supported frameworks simplify the developer experience and help ensure
best practices are followed.





## Advanced Usage
If a user is not using a supported framework, they can use the generated SDK directly.

Here's an example of how to use it with the first 5 operations:

```js
import { createJournalWithEntries, getHouseholdBalance, getMyEntries, validateJournalBalance } from '@pareja-pro/dataconnect';


// Operation CreateJournalWithEntries:  For variables, look at type CreateJournalWithEntriesVars in ../index.d.ts
const { data } = await CreateJournalWithEntries(dataConnect, createJournalWithEntriesVars);

// Operation GetHouseholdBalance:  For variables, look at type GetHouseholdBalanceVars in ../index.d.ts
const { data } = await GetHouseholdBalance(dataConnect, getHouseholdBalanceVars);

// Operation GetMyEntries: 
const { data } = await GetMyEntries(dataConnect);

// Operation ValidateJournalBalance:  For variables, look at type ValidateJournalBalanceVars in ../index.d.ts
const { data } = await ValidateJournalBalance(dataConnect, validateJournalBalanceVars);


```