/**
 * Motor de cálculos puro para Presupuestos Híbridos y Reparto Equitativo de Ingresos Variables.
 * Funciones matemáticas puras, deterministas y libres de efectos secundarios.
 */

export interface UserIncomeShare {
  userId: string;
  userName: string;
  income: number;
  ratio: number;       // 0..1 (ej. 0.6 para 60%)
  percentage: number;  // 0..100 (ej. 60)
}

export interface HouseholdIncomeSharesResult {
  totalIncome: number;
  userShares: UserIncomeShare[];
  isDefaultRatio: boolean;
}

export type BudgetCalculationMode = 'PERCENTAGE' | 'FIXED';

export interface BudgetInput {
  id?: string;
  name?: string;
  mode?: BudgetCalculationMode | string;
  percentage?: number;
  fixedAmount?: number;
  base?: number;
  assignedAmount?: number;
  [key: string]: any;
}

export interface BudgetAssignedAmountResult {
  assignedAmount: number;
  fundingProgress: number;  // 0..100
  isFullyFunded: boolean;
  deficit: number;
  coveredAmount: number;
  mode: BudgetCalculationMode;
}

export interface ManualContributionInput {
  userId: string;
  amount: number;
}

export interface UserBudgetSplit {
  userId: string;
  userName?: string;
  contribution: number;
  ratio: number;
  percentage: number;
  isManual: boolean;
}

export interface BudgetSplitResult {
  assignedAmount: number;
  totalSplit: number;
  splits: UserBudgetSplit[];
  hasManualContribution: boolean;
}

/**
 * 1. calculateHouseholdIncomeShares(incomes, users, defaultRatio)
 * Calcula la suma total de ingresos del periodo y la proporción exacta de aportación de cada usuario (p_u = I_u / I_total).
 * Si I_total === 0, aplica el defaultRatio configurado o reparto equitativo.
 */
export function calculateHouseholdIncomeShares(
  incomes: Array<{ userId?: string; ownerUid?: string; amount?: number; [key: string]: any }> | null | undefined,
  users: Array<{ id: string; name?: string; displayName?: string; email?: string; [key: string]: any }> | null | undefined,
  defaultRatio?: Record<string, number> | null
): HouseholdIncomeSharesResult {
  const safeUsers = Array.isArray(users) ? users : [];
  const safeIncomes = Array.isArray(incomes) ? incomes : [];

  // Mapear ingresos válidos por usuario
  const incomeByUser: Record<string, number> = {};
  for (const u of safeUsers) {
    if (u && u.id) {
      incomeByUser[u.id] = 0;
    }
  }

  let calculatedTotalIncome = 0;

  for (const inc of safeIncomes) {
    if (!inc) continue;
    const rawAmt = Number(inc.amount);
    if (isNaN(rawAmt) || rawAmt <= 0) continue;

    const uId = inc.userId || inc.ownerUid;
    if (uId && incomeByUser[uId] !== undefined) {
      incomeByUser[uId] += rawAmt;
      calculatedTotalIncome += rawAmt;
    } else if (uId) {
      incomeByUser[uId] = (incomeByUser[uId] || 0) + rawAmt;
      calculatedTotalIncome += rawAmt;
    }
  }

  const isDefaultRatio = calculatedTotalIncome === 0;
  const userCount = safeUsers.length;

  const userShares: UserIncomeShare[] = safeUsers.map((u) => {
    const uId = u.id;
    const userName = u.name || u.displayName || u.email || uId;
    const userInc = incomeByUser[uId] || 0;

    let ratio = 0;

    if (calculatedTotalIncome > 0) {
      ratio = userInc / calculatedTotalIncome;
    } else {
      // Aplicar defaultRatio si se especificó
      if (defaultRatio && typeof defaultRatio === 'object') {
        const rawRatio = defaultRatio[uId];
        if (typeof rawRatio === 'number' && !isNaN(rawRatio) && rawRatio >= 0) {
          ratio = rawRatio > 1 ? rawRatio / 100 : rawRatio;
        } else {
          ratio = userCount > 0 ? 1 / userCount : 0;
        }
      } else {
        ratio = userCount > 0 ? 1 / userCount : 0;
      }
    }

    const clampedRatio = Math.max(0, Math.min(1, isNaN(ratio) ? 0 : ratio));
    const percentage = Number((clampedRatio * 100).toFixed(4));

    return {
      userId: uId,
      userName,
      income: userInc,
      ratio: clampedRatio,
      percentage
    };
  });

  return {
    totalIncome: calculatedTotalIncome,
    userShares,
    isDefaultRatio
  };
}

/**
 * 2. calculateBudgetAssignedAmount(budget, totalIncome, totalFixedBudgets)
 * - Modo PERCENTAGE: Asignado = (budget.percentage / 100) * totalIncome.
 * - Modo FIXED: Asignado = budget.fixedAmount.
 *   Calcula también fundingProgress = min(100, (totalIncome / totalFixedBudgets) * 100) y déficit de liquidez.
 */
export function calculateBudgetAssignedAmount(
  budget: BudgetInput | null | undefined,
  totalIncome: number,
  totalFixedBudgets?: number | null
): BudgetAssignedAmountResult {
  const safeTotalIncome = Math.max(0, Number(totalIncome) || 0);
  const rawMode = (budget?.mode || 'FIXED').toUpperCase();
  const mode: BudgetCalculationMode = rawMode === 'PERCENTAGE' ? 'PERCENTAGE' : 'FIXED';

  if (mode === 'PERCENTAGE') {
    const rawPct = Number(budget?.percentage) || 0;
    const clampedPct = Math.max(0, Math.min(100, rawPct));
    const assignedAmount = Math.round((clampedPct / 100) * safeTotalIncome * 100) / 100;

    const isFullyFunded = true;
    const fundingProgress = safeTotalIncome > 0 || clampedPct === 0 ? 100 : 0;

    return {
      assignedAmount,
      fundingProgress,
      isFullyFunded,
      deficit: 0,
      coveredAmount: assignedAmount,
      mode
    };
  }

  // Modo FIXED
  const fixedTarget = Math.max(
    0,
    Number(budget?.fixedAmount ?? budget?.base ?? budget?.assignedAmount ?? 0)
  );

  const safeTotalFixed = totalFixedBudgets !== undefined && totalFixedBudgets !== null
    ? Math.max(0, Number(totalFixedBudgets) || 0)
    : 0;

  let fundingProgress = 100;
  let coveredAmount = fixedTarget;
  let deficit = 0;

  if (safeTotalFixed > 0) {
    const coverageRatio = safeTotalIncome / safeTotalFixed;
    fundingProgress = Math.min(100, Math.max(0, coverageRatio * 100));
    coveredAmount = Math.min(fixedTarget, Math.round(coverageRatio * fixedTarget * 100) / 100);
    deficit = Math.max(0, Math.round((fixedTarget - coveredAmount) * 100) / 100);
  } else if (safeTotalIncome === 0 && fixedTarget > 0) {
    fundingProgress = 0;
    coveredAmount = 0;
    deficit = fixedTarget;
  }

  const isFullyFunded = fundingProgress >= 100 || fixedTarget === 0;

  return {
    assignedAmount: fixedTarget,
    fundingProgress: Number(fundingProgress.toFixed(2)),
    isFullyFunded,
    deficit,
    coveredAmount,
    mode
  };
}

/**
 * 3. calculateBudgetSplit(assignedAmount, userShares, manualFixedContribution)
 * - Reparto proporcional estándar: Aportación_u = assignedAmount * p_u.
 * - Ajuste por Aportación Fija Manual: Si el usuario A fija F_A, los demás usuarios cubren max(0, assignedAmount - F_A).
 * - Garantiza que la suma de aportaciones cuadre siempre al centavo con assignedAmount sin fugas por redondeo.
 */
export function calculateBudgetSplit(
  assignedAmount: number,
  userShares: UserIncomeShare[] | null | undefined,
  manualFixedContribution?: ManualContributionInput | null
): BudgetSplitResult {
  const safeAssigned = Math.max(0, Number(assignedAmount) || 0);
  const shares = Array.isArray(userShares) ? userShares : [];

  if (shares.length === 0) {
    return {
      assignedAmount: safeAssigned,
      totalSplit: 0,
      splits: [],
      hasManualContribution: false
    };
  }

  const hasManual = !!(
    manualFixedContribution &&
    manualFixedContribution.userId &&
    typeof manualFixedContribution.amount === 'number' &&
    !isNaN(manualFixedContribution.amount)
  );

  let splits: UserBudgetSplit[] = [];

  if (hasManual) {
    const manualUserId = manualFixedContribution!.userId;
    const requestedManualAmount = Math.max(0, manualFixedContribution!.amount);

    const manualContribution = Math.min(safeAssigned, requestedManualAmount);
    const remainingToCover = Math.max(0, safeAssigned - manualContribution);

    const otherUsers = shares.filter((u) => u.userId !== manualUserId);
    const sumOtherRatios = otherUsers.reduce((sum, u) => sum + (u.ratio || 0), 0);

    splits = shares.map((u) => {
      if (u.userId === manualUserId) {
        return {
          userId: u.userId,
          userName: u.userName,
          contribution: manualContribution,
          ratio: safeAssigned > 0 ? manualContribution / safeAssigned : 0,
          percentage: safeAssigned > 0 ? (manualContribution / safeAssigned) * 100 : 0,
          isManual: true
        };
      }

      let userContrib = 0;
      if (remainingToCover > 0) {
        if (sumOtherRatios > 0) {
          userContrib = (u.ratio / sumOtherRatios) * remainingToCover;
        } else if (otherUsers.length > 0) {
          userContrib = remainingToCover / otherUsers.length;
        }
      }

      userContrib = Math.round(userContrib * 100) / 100;

      return {
        userId: u.userId,
        userName: u.userName,
        contribution: userContrib,
        ratio: safeAssigned > 0 ? userContrib / safeAssigned : 0,
        percentage: safeAssigned > 0 ? (userContrib / safeAssigned) * 100 : 0,
        isManual: false
      };
    });

    // Ajuste de centavos para cuadrar exactamente con assignedAmount
    const currentSum = splits.reduce((acc, s) => acc + s.contribution, 0);
    const diff = Math.round((safeAssigned - currentSum) * 100) / 100;

    if (diff !== 0 && otherUsers.length > 0) {
      const targetNonManual = splits.find((s) => !s.isManual);
      if (targetNonManual) {
        targetNonManual.contribution = Math.round((targetNonManual.contribution + diff) * 100) / 100;
        targetNonManual.ratio = safeAssigned > 0 ? targetNonManual.contribution / safeAssigned : 0;
        targetNonManual.percentage = safeAssigned > 0 ? (targetNonManual.contribution / safeAssigned) * 100 : 0;
      }
    }
  } else {
    let allocatedSum = 0;
    splits = shares.map((u, index) => {
      let userContrib = 0;
      if (index === shares.length - 1) {
        userContrib = Math.round((safeAssigned - allocatedSum) * 100) / 100;
      } else {
        userContrib = Math.round(safeAssigned * u.ratio * 100) / 100;
        allocatedSum += userContrib;
      }

      return {
        userId: u.userId,
        userName: u.userName,
        contribution: Math.max(0, userContrib),
        ratio: u.ratio,
        percentage: u.percentage,
        isManual: false
      };
    });
  }

  const totalSplit = Math.round(splits.reduce((acc, s) => acc + s.contribution, 0) * 100) / 100;

  return {
    assignedAmount: safeAssigned,
    totalSplit,
    splits,
    hasManualContribution: hasManual
  };
}
