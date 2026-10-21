export const isDebitNature = (t: string) => t === 'ASSET' || t === 'EXPENSE' || t === 'BANK_ACCOUNT';

export const calculateEntrySignedAmount = (e: any, fallbackType = 'EXPENSE') => {
  const isDebit = e.entryType === 'DEBIT';
  const debitNature = isDebitNature(e.account?.type || fallbackType);
  const amount = Number(e.amount || 0);
  return isDebit === debitNature ? amount : -amount;
};

export interface AccountItem {
  id: string;
  name?: string;
  type?: string;
  ownerType?: string;
  balance?: number;
  [key: string]: any;
}

export interface BalanceEntry {
  entryType: 'DEBIT' | 'CREDIT' | string;
  amount: number | string;
  account: {
    id: string;
    type?: string;
    [key: string]: any;
  };
  [key: string]: any;
}

/**
 * Función pura que calcula los saldos a partir de las entradas de balances y
 * combina las cuentas del servidor (única fuente de verdad para la lista de cuentas)
 * con las cuentas temporales optimistas (temp-) que aún no han sido confirmadas por el servidor.
 * 
 * Elimina legacyAccounts: los saldos provienen únicamente de balancesMap y
 * la lista de cuentas proviene exclusivamente de GetHouseholdAccounts.
 */
export function mergeAccountsWithBalances(
  serverAccounts: AccountItem[] = [],
  balanceEntries: BalanceEntry[] = [],
  currentAccounts: AccountItem[] = []
): AccountItem[] {
  const balancesMap = new Map<string, number>();

  if (balanceEntries) {
    balanceEntries.forEach((e) => {
      if (!e?.account?.id) return;
      const accId = e.account.id;
      const current = balancesMap.get(accId) || 0;
      balancesMap.set(accId, current + calculateEntrySignedAmount(e));
    });
  }

  // Cuentas del servidor con sus saldos calculados (sin legacyAccounts)
  const accountsWithBalances = (serverAccounts || []).map((account) => ({
    ...account,
    balance: balancesMap.get(account.id) ?? 0,
  }));

  // Filtrar cuentas temporales optimistas actuales
  const tempAccounts = (currentAccounts || []).filter(
    (a) => a?.id && typeof a.id === 'string' && a.id.startsWith('temp-')
  );

  // Descartar las que ya tienen equivalente en el servidor (mismo nombre y tipo)
  const unmergedTemps = tempAccounts.filter(
    (ta) => !accountsWithBalances.some((sa) => sa.name === ta.name && sa.type === ta.type)
  );

  return [...accountsWithBalances, ...unmergedTemps];
}
