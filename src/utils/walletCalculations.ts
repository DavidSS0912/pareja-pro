/**
 * Motor de cálculos puro para la gestión de Billetera y Cuentas.
 * Libre de efectos secundarios, determinista y seguro contra nulos y divisiones por cero.
 */

export interface AccountBalanceMetrics {
  ledgerBalance: number;     // Saldo contable
  allocatedBalance: number;  // Saldo en apartados (proyectos activos vinculados)
  availableBalance: number;  // Saldo disponible (contable - apartados)
}

export interface CreditCardMetrics {
  currentDebt: number;            // Deuda actual
  positiveBalance: number;        // Saldo a favor (|balance| cuando balance < 0)
  creditAvailable: number;        // Crédito disponible (max(0, límite - deuda))
  utilizationPercentage: number;  // Porcentaje de utilización clamp(0..100)
}

export interface LiquidWealthMetrics {
  totalLiquidAssets: number; // Total en Débito/Efectivo ASSET (Disponible + Apartados)
  totalCreditDebt: number;   // Total Deuda en Tarjetas LIABILITY (balance > 0)
  liquidWealth: number;      // Patrimonio Líquido (Activos Líquidos - Deuda en Tarjetas)
}

/**
 * Calcula el saldo disponible de una cuenta de débito/efectivo descontando los apartados
 * de proyectos activos vinculados a ella.
 */
export function calculateAccountAvailableBalance(
  account: { id?: string; name?: string; balance?: number; [key: string]: any } | null | undefined,
  activeProjects?: Array<{ targetAccount?: string; targetAccountId?: string; savedAmount?: number; currentAmount?: number; status?: string; isCompleted?: boolean; [key: string]: any }> | null
): AccountBalanceMetrics {
  const ledgerBalance = Number(account?.balance) || 0;

  if (!account || !activeProjects || !Array.isArray(activeProjects)) {
    return {
      ledgerBalance,
      allocatedBalance: 0,
      availableBalance: ledgerBalance
    };
  }

  const accountId = account.id;
  const accountName = account.name;

  const allocatedBalance = activeProjects.reduce((total, p) => {
    if (!p) return total;

    // Solo se consideran proyectos no completados / activos
    const isCompleted = p.isCompleted === true || p.status === 'completed';
    if (isCompleted) return total;

    // Vinculación por ID o por nombre de cuenta
    const isLinked =
      (accountId && (p.targetAccountId === accountId || p.targetAccount === accountId)) ||
      (accountName && p.targetAccount === accountName);

    if (isLinked) {
      const amount = Number(p.savedAmount ?? p.currentAmount ?? 0);
      return total + (amount > 0 ? amount : 0);
    }
    return total;
  }, 0);

  const availableBalance = ledgerBalance - allocatedBalance;

  return {
    ledgerBalance,
    allocatedBalance,
    availableBalance
  };
}

/**
 * Calcula métricas contables y de riesgo para tarjetas de crédito (LIABILITY / CREDIT_CARD).
 * Distingue deuda real de saldos a favor por pagos anticipados o reembolsos.
 */
export function calculateCreditCardMetrics(
  account: { balance?: number; creditLimit?: number; [key: string]: any } | null | undefined
): CreditCardMetrics {
  if (!account) {
    return {
      currentDebt: 0,
      positiveBalance: 0,
      creditAvailable: 0,
      utilizationPercentage: 0
    };
  }

  const rawBalance = Number(account.balance) || 0;
  const rawLimit = Number(account.creditLimit) || 0;
  const creditLimit = Math.max(0, rawLimit);

  // Si balance > 0 (deuda): Deuda Actual = balance, Saldo a favor = 0.
  // Si balance < 0 (saldo a favor): Deuda Actual = 0, Saldo a favor = |balance|.
  const currentDebt = rawBalance > 0 ? rawBalance : 0;
  const positiveBalance = rawBalance < 0 ? Math.abs(rawBalance) : 0;

  // Crédito Disponible = max(0, creditLimit - max(0, balance)).
  const creditAvailable = Math.max(0, creditLimit - Math.max(0, rawBalance));

  // Porcentaje de utilización = (max(0, balance) / creditLimit) * 100 (clamp 0..100). Manejar límite 0 de forma segura.
  let utilizationPercentage = 0;
  if (creditLimit > 0) {
    const rawPct = (Math.max(0, rawBalance) / creditLimit) * 100;
    utilizationPercentage = Math.min(100, Math.max(0, rawPct));
  } else {
    utilizationPercentage = 0;
  }

  return {
    currentDebt,
    positiveBalance,
    creditAvailable,
    utilizationPercentage
  };
}

/**
 * Calcula el Patrimonio Líquido consolidado de la Billetera:
 * Patrimonio Líquido = (Total en Débito/Efectivo ASSET: Disponible + Apartados) - (Total Deuda en Tarjetas LIABILITY: balance > 0).
 * Tarjetas con saldo a favor (balance < 0) no aumentan deuda ni generan distorsión contable.
 */
export function calculateLiquidWealth(
  accounts?: Array<{ type?: string; balance?: number; [key: string]: any }> | null,
  _activeProjects?: Array<{ targetAccount?: string; targetAccountId?: string; savedAmount?: number; currentAmount?: number; status?: string; isCompleted?: boolean; [key: string]: any }> | null
): LiquidWealthMetrics {
  if (!accounts || !Array.isArray(accounts)) {
    return {
      totalLiquidAssets: 0,
      totalCreditDebt: 0,
      liquidWealth: 0
    };
  }

  const isAssetType = (type?: string) => {
    if (!type) return false;
    const t = type.toUpperCase();
    return t === 'ASSET' || t === 'BANK_ACCOUNT' || t === 'CASH' || t === 'DEBIT';
  };

  const isLiabilityType = (type?: string) => {
    if (!type) return false;
    const t = type.toUpperCase();
    return t === 'LIABILITY' || t === 'CREDIT_CARD';
  };

  // Total en Débito/Efectivo ASSET: Disponible + Apartados (equivale a la suma de saldos contables)
  const totalLiquidAssets = accounts
    .filter(a => isAssetType(a.type))
    .reduce((sum, a) => sum + (Number(a.balance) || 0), 0);

  // Total Deuda en Tarjetas LIABILITY: balance > 0
  const totalCreditDebt = accounts
    .filter(a => isLiabilityType(a.type))
    .reduce((sum, a) => {
      const balance = Number(a.balance) || 0;
      return sum + (balance > 0 ? balance : 0);
    }, 0);

  const liquidWealth = totalLiquidAssets - totalCreditDebt;

  return {
    totalLiquidAssets,
    totalCreditDebt,
    liquidWealth
  };
}
