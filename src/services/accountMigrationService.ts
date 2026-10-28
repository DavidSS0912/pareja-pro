import { QueryFetchPolicy } from 'firebase/data-connect';
import { getHouseholdAccounts, reassignEntries, deleteAccount, seedDefaultAccounts } from '../lib/dataconnect';

export const runAccountMigration = async (householdId: string) => {
  const MIGRATION_KEY = `account_migration_done_${householdId}`;
  
  if (localStorage.getItem(MIGRATION_KEY)) {
    return; // Ya se migró en este dispositivo
  }

  try {
    console.log("Iniciando migración de cuentas (deduplicación)...");
    const { data } = await getHouseholdAccounts({ householdId }, { fetchPolicy: QueryFetchPolicy.SERVER_ONLY });
    
    if (!data || !data.accounts) return;

    const accounts = data.accounts;
    const grouped = new Map<string, any[]>();

    // Agrupar por nombre, tipo y ownerType
    for (const acc of accounts) {
      const key = `${acc.name}-${acc.type}-${acc.ownerType}`;
      if (!grouped.has(key)) {
        grouped.set(key, []);
      }
      grouped.get(key)!.push(acc);
    }

    let accountsDeleted = 0;
    let accountsMigrated = 0;

    for (const [key, group] of grouped.entries()) {
      if (group.length > 1) {
        // Sort by createdAt ASC so we keep the oldest one
        // If createdAt is missing, sorting is stable
        group.sort((a, b) => {
           const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
           const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
           return timeA - timeB;
        });

        const canonicalAccount = group[0];
        const duplicates = group.slice(1);

        console.log(`Fusionando ${duplicates.length} duplicados para: ${key}`);

        for (const duplicate of duplicates) {
          // Reasignar entries de la cuenta duplicada a la cuenta canónica
          await reassignEntries({
            householdId,
            fromAccountId: duplicate.id,
            toAccountId: canonicalAccount.id,
            accountType: canonicalAccount.type
          });
          
          // Borrar cuenta duplicada
          await deleteAccount({ accountId: duplicate.id, householdId });
          accountsDeleted++;
        }
        accountsMigrated++;
      }
    }

    console.log(`Migración finalizada. Grupos unificados: ${accountsMigrated}, Cuentas eliminadas: ${accountsDeleted}`);
    
    // Si no había cuentas, sembramos las iniciales
    if (accounts.length === 0) {
       console.log("No se encontraron cuentas, sembrando iniciales...");
       await seedDefaultAccounts({ householdId });
    }

    // Marcar como completada en localStorage
    localStorage.setItem(MIGRATION_KEY, "true");

  } catch (error) {
    console.error("Error en migración de cuentas:", error);
  }
};
