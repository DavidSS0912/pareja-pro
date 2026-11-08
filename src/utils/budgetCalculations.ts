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

/**
 * 4. resolveBudgetPeriodFromDateRange(dateRange)
 * Deriva deterministamente el mes de plantilla (formato 'YYYY-MM-01') a partir del filtro global dateRange.
 * Prioridad: dateRange.end -> dateRange.start -> fecha actual.
 */
export function resolveBudgetPeriodFromDateRange(
  dateRange?: { start?: string; end?: string } | null
): string {
  const targetDateStr = dateRange?.end || dateRange?.start;
  if (targetDateStr && typeof targetDateStr === 'string' && /^\d{4}-\d{2}/.test(targetDateStr)) {
    const yearMonth = targetDateStr.slice(0, 7);
    return `${yearMonth}-01`;
  }
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}-01`;
}

/**
 * 5. resolveContextUsers(users, currentUser, memberSlot, appContext)
 * Retorna los integrantes relevantes según el contexto de visualización:
 * - En 'personal': retorna exclusivamente al usuario activo (longitud 1).
 * - En 'household' (o cualquier otro): retorna la lista de integrantes del hogar.
 */
export function resolveContextUsers(
  users: any[] | null | undefined,
  currentUser: any | null | undefined,
  memberSlot?: string | null,
  appContext?: string | null
): any[] {
  const safeUsers = Array.isArray(users) ? users : [];
  if (appContext === 'personal') {
    const activeUid = currentUser?.uid || currentUser?.id;
    const activeSlot = memberSlot || currentUser?.memberSlot;

    const matched = safeUsers.find(
      (u) =>
        (activeUid && (u.id === activeUid || u.uid === activeUid)) ||
        (activeSlot && u.memberSlot === activeSlot)
    );

    if (matched) {
      return [matched];
    }

    if (currentUser) {
      return [
        {
          id: activeUid || 'me',
          name: currentUser.displayName || currentUser.name || currentUser.email?.split('@')[0] || 'Usuario',
          displayName: currentUser.displayName || currentUser.name || currentUser.email?.split('@')[0] || 'Usuario',
          email: currentUser.email,
          photoURL: currentUser.photoURL || currentUser.photoUrl || null,
          memberSlot: activeSlot
        }
      ];
    }

    return safeUsers.slice(0, 1);
  }

  return safeUsers;
}

/**
 * 6. calculateCutoffDateRange(cutoffDay, referenceDate)
 * Calcula el rango de fechas [start, end] en formato ISO 'YYYY-MM-DD' según el día de corte:
 * - Si cutoffDay <= 1: mes natural (día 1 al último día del mes).
 * - Si cutoffDay > 1:
 *   * Si el día de referenceDate <= cutoffDay: del (corte + 1) del mes anterior al corte del mes actual.
 *   * Si el día de referenceDate > cutoffDay: del (corte + 1) del mes actual al corte del mes siguiente.
 * Aplica clamp seguro para meses cortos (febrero, meses de 30 días) sin saltar al mes siguiente.
 */
export function calculateCutoffDateRange(
  cutoffDay: number,
  referenceDate?: Date | string
): { start: string; end: string } {
  let year: number;
  let month: number;
  let day: number;

  if (typeof referenceDate === 'string') {
    const match = referenceDate.trim().match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
      year = parseInt(match[1], 10);
      month = parseInt(match[2], 10);
      day = parseInt(match[3], 10);
    } else {
      const d = new Date(referenceDate);
      year = d.getFullYear();
      month = d.getMonth() + 1;
      day = d.getDate();
    }
  } else if (referenceDate instanceof Date) {
    year = referenceDate.getFullYear();
    month = referenceDate.getMonth() + 1;
    day = referenceDate.getDate();
  } else {
    const now = new Date();
    year = now.getFullYear();
    month = now.getMonth() + 1;
    day = now.getDate();
  }

  const pad = (n: number) => String(n).padStart(2, '0');
  const getDaysInMonth = (y: number, m: number) => new Date(Date.UTC(y, m, 0)).getUTCDate();

  // Caso 1: Periodo natural de mes calendario
  if (!cutoffDay || cutoffDay <= 1) {
    const daysInCurrentMonth = getDaysInMonth(year, month);
    return {
      start: `${year}-${pad(month)}-01`,
      end: `${year}-${pad(month)}-${pad(daysInCurrentMonth)}`
    };
  }

  // Caso 2: cutoffDay > 1
  let endYear = year;
  let endMonth = month;
  let startYear = year;
  let startMonth = month;

  if (day <= cutoffDay) {
    // Ciclo termina en el mes actual
    endYear = year;
    endMonth = month;
    if (month === 1) {
      startYear = year - 1;
      startMonth = 12;
    } else {
      startYear = year;
      startMonth = month - 1;
    }
  } else {
    // Ciclo termina en el mes siguiente
    startYear = year;
    startMonth = month;
    if (month === 12) {
      endYear = year + 1;
      endMonth = 1;
    } else {
      endYear = year;
      endMonth = month + 1;
    }
  }

  const daysInEndMonth = getDaysInMonth(endYear, endMonth);
  const endDay = Math.min(cutoffDay, daysInEndMonth);

  const daysInStartMonth = getDaysInMonth(startYear, startMonth);
  const prevCutoff = Math.min(cutoffDay, daysInStartMonth);

  let startDayFormatted: string;
  if (prevCutoff >= daysInStartMonth) {
    startDayFormatted = `${endYear}-${pad(endMonth)}-01`;
  } else {
    startDayFormatted = `${startYear}-${pad(startMonth)}-${pad(prevCutoff + 1)}`;
  }

  return {
    start: startDayFormatted,
    end: `${endYear}-${pad(endMonth)}-${pad(endDay)}`
  };
}

/**
 * Helpers para almacenamiento local de la configuración acumulativa (Sinking Funds) de presupuestos.
 */
export const getBudgetCumulativeStorageKey = (householdId?: string, categoryId?: string, ownerType?: string): string => {
  return `orbita_budget_cumulative_${householdId || 'default'}_${categoryId || 'unknown'}_${ownerType || 'SHARED'}`;
};

export const getBudgetCumulativeLegacyKey = (householdId?: string, categoryId?: string): string => {
  return `orbita_budget_cumulative_${householdId || 'default'}_${categoryId || 'unknown'}`;
};

export const isBudgetCumulativeStored = (householdId?: string, categoryId?: string, ownerType?: string): boolean => {
  if (typeof window === 'undefined') return false;
  try {
    const specific = localStorage.getItem(getBudgetCumulativeStorageKey(householdId, categoryId, ownerType));
    if (specific !== null) return specific === 'true';
    const legacy = localStorage.getItem(getBudgetCumulativeLegacyKey(householdId, categoryId));
    if (legacy !== null) return legacy === 'true';
    return false;
  } catch {
    return false;
  }
};

export const saveBudgetCumulativeStored = (
  householdId: string,
  categoryId: string,
  ownerType: string,
  isCumulative: boolean
): void => {
  if (typeof window === 'undefined') return;
  try {
    const val = String(Boolean(isCumulative));
    localStorage.setItem(getBudgetCumulativeStorageKey(householdId, categoryId, ownerType), val);
    localStorage.setItem(getBudgetCumulativeLegacyKey(householdId, categoryId), val);
  } catch (e) {
    console.warn('Error guardando indicador acumulativo de presupuesto', e);
  }
};

/**
 * Helpers para almacenamiento local del fondeo/aporte real mensual a presupuestos.
 */
export const getBudgetMonthlyFundingStorageKey = (budgetId?: string, period?: string): string => {
  return `orbita_budget_funding_${budgetId || 'default'}_${period ? period.slice(0, 7) : 'current'}`;
};

export const getBudgetMonthlyFundingStored = (budgetId?: string, period?: string): number | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(getBudgetMonthlyFundingStorageKey(budgetId, period));
    if (raw !== null && raw !== '') {
      const val = parseFloat(raw);
      return isNaN(val) ? null : val;
    }
    return null;
  } catch {
    return null;
  }
};

export const saveBudgetMonthlyFundingStored = (
  budgetId: string,
  period: string,
  amount: number
): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(getBudgetMonthlyFundingStorageKey(budgetId, period), String(amount));
  } catch (e) {
    console.warn('Error guardando fondeo mensual de presupuesto', e);
  }
};

export interface CumulativeBudgetInput {
  budget: {
    id?: string;
    categoryId?: string;
    category?: string;
    period?: string;
    ownerType?: string;
    isCumulative?: boolean;
    initialPeriod?: string;
    assignedAmount?: number;
    base?: number;
    fixedAmount?: number;
    [key: string]: any;
  };
  allExpenses: Array<{
    id?: string;
    categoryId?: string;
    amount?: number;
    currency?: string;
    date?: string;
    isPrivate?: boolean;
    isShared?: boolean;
    ownerUid?: string;
    userId?: string;
    paidBy?: string;
    [key: string]: any;
  }>;
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  monthlyAllocation?: number;
  initialPeriod?: string;
  appContext?: 'household' | 'personal' | string;
  activeUserId?: string;
  monthlyFundings?: Record<string, number> | Array<{ period: string; amount: number }>;
}

export interface CumulativeBudgetResult {
  currentSpent: number;
  totalAccumulatedAssigned: number;
  totalHistoricalSpent: number;
  accumulatedBalance: number;
  elapsedMonths: number;
  currentPeriodFunding: number;
}

/**
 * 7. calculateCumulativeBudget(params)
 * Calcula las métricas acumulativas de un presupuesto (Sinking Fund):
 * - currentSpent: gastos del periodo activo [start, end].
 * - isCumulative === true:
 *   * Determina meses transcurridos desde initialPeriod hasta el periodo activo.
 *   * Suma los aportes reales mensuales registrados para cada periodo (o el allocation nominal por defecto).
 *   * totalHistoricalSpent = suma de gastos de esa categoría hasta fin del periodo activo.
 *   * accumulatedBalance = max(0, totalAccumulatedAssigned - totalHistoricalSpent).
 * - isCumulative === false:
 *   * accumulatedBalance = monthlyAllocation - currentSpent.
 *   * elapsedMonths = 1.
 * - Respeta aislamiento estricto de contexto (household vs personal).
 */
export function calculateCumulativeBudget(
  params: CumulativeBudgetInput
): CumulativeBudgetResult {
  const allocation = Math.max(
    0,
    Number(params.monthlyAllocation ?? params.budget?.assignedAmount ?? params.budget?.base ?? params.budget?.fixedAmount ?? 0)
  );

  const isCumulative = Boolean(params.budget?.isCumulative);
  const toDateStr = (d?: string | null) => (d ? d.slice(0, 10) : '');

  const start = params.currentPeriodStart || '';
  const end = params.currentPeriodEnd || '9999-12-31';

  const isPersonal = params.appContext === 'personal';
  const targetCatId = params.budget?.categoryId;
  const targetCatName = params.budget?.category ? String(params.budget.category).toLowerCase() : '';

  const matchingExpenses = (params.allExpenses || []).filter((e) => {
    if (!e) return false;
    const matchesCat =
      (targetCatId && e.categoryId === targetCatId) ||
      (targetCatName && typeof e.category === 'string' && e.category.toLowerCase() === targetCatName);
    if (!matchesCat) return false;

    const isShared = e.isShared !== undefined ? Boolean(e.isShared) : !e.isPrivate;
    const owner = e.ownerUid || e.userId || e.paidBy;

    if (isPersonal) {
      if (isShared) return false;
      if (params.activeUserId && owner && owner !== params.activeUserId) return false;
      return true;
    }

    // Household
    if (!isShared) return false;
    return true;
  });

  let currentSpent = 0;
  let totalHistoricalSpent = 0;

  for (const exp of matchingExpenses) {
    const amt = Math.max(0, Number(exp.amount) || 0);
    const expDate = toDateStr(exp.date);

    if (!expDate || expDate <= end) {
      totalHistoricalSpent += amt;
    }

    if (expDate && expDate >= start && expDate <= end) {
      currentSpent += amt;
    } else if (!start && (!expDate || expDate <= end)) {
      currentSpent += amt;
    }
  }

  currentSpent = Math.round(currentSpent * 100) / 100;
  totalHistoricalSpent = Math.round(totalHistoricalSpent * 100) / 100;

  const initPeriodStr =
    params.initialPeriod ||
    params.budget?.initialPeriod ||
    params.budget?.period ||
    (start ? start.slice(0, 7) : '2026-01-01');
  const targetPeriodStr = params.currentPeriodEnd
    ? params.currentPeriodEnd.slice(0, 7)
    : (params.budget?.period?.slice(0, 7) || '2026-11-01');

  // Función auxiliar para obtener fondeo de un mes específico
  const getFundingForMonth = (pStr: string): number => {
    let monthAmount: number | null = null;
    if (params.monthlyFundings) {
      if (Array.isArray(params.monthlyFundings)) {
        const found = params.monthlyFundings.find(f => f && f.period && f.period.slice(0, 7) === pStr);
        if (found && typeof found.amount === 'number') {
          monthAmount = found.amount;
        }
      } else if (typeof params.monthlyFundings === 'object' && params.monthlyFundings[pStr] !== undefined) {
        monthAmount = Number(params.monthlyFundings[pStr]);
      }
    }
    if (monthAmount === null && params.budget?.id) {
      monthAmount = getBudgetMonthlyFundingStored(params.budget.id, pStr);
    }
    return monthAmount !== null && !isNaN(monthAmount) ? monthAmount : allocation;
  };

  let elapsedMonths = 1;
  let totalAccumulatedAssigned = allocation;
  let accumulatedBalance = 0;
  let currentPeriodFunding = getFundingForMonth(targetPeriodStr);

  if (isCumulative) {
    const [yA, mA] = initPeriodStr.slice(0, 7).split('-').map(Number);
    const [yB, mB] = targetPeriodStr.slice(0, 7).split('-').map(Number);

    if (!isNaN(yA) && !isNaN(mA) && !isNaN(yB) && !isNaN(mB)) {
      let curY = yA;
      let curM = mA;
      let count = 0;
      let sumFunded = 0;

      while (curY < yB || (curY === yB && curM <= mB)) {
        count++;
        const pStr = `${curY}-${String(curM).padStart(2, '0')}`;
        const fundedAmount = getFundingForMonth(pStr);
        sumFunded += fundedAmount;

        if (pStr === targetPeriodStr) {
          currentPeriodFunding = fundedAmount;
        }

        curM++;
        if (curM > 12) {
          curM = 1;
          curY++;
        }
      }
      elapsedMonths = Math.max(1, count);
      totalAccumulatedAssigned = Math.round(sumFunded * 100) / 100;
    } else {
      totalAccumulatedAssigned = allocation;
    }

    accumulatedBalance = Math.max(
      0,
      Math.round((totalAccumulatedAssigned - totalHistoricalSpent) * 100) / 100
    );
  } else {
    totalAccumulatedAssigned = allocation;
    accumulatedBalance = Math.round((allocation - currentSpent) * 100) / 100;
    elapsedMonths = 1;
    currentPeriodFunding = allocation;
  }

  return {
    currentSpent,
    totalAccumulatedAssigned,
    totalHistoricalSpent,
    accumulatedBalance,
    elapsedMonths,
    currentPeriodFunding
  };
}

export interface MemberPendingContribution {
  userId: string;
  userName: string;
  photoURL?: string;
  targetQuota: number;
  paidAmount: number;
  pendingAmount: number;
  isFullyCovered: boolean;
}

export interface CalculateMemberPendingContributionsParams {
  assignedAmount: number;
  userShares?: UserIncomeShare[] | null;
  manualContribution?: ManualContributionInput | null;
  periodExpenses?: Array<{
    amount: number;
    paidBy?: string;
    userId?: string;
    ownerUid?: string;
  }>;
  users?: Array<{
    id: string;
    name?: string;
    displayName?: string;
    photoURL?: string;
    photoUrl?: string;
    memberSlot?: string;
  }>;
  ownerType?: string;
  appContext?: 'household' | 'personal' | string;
  activeUserId?: string;
}

/**
 * Calcula la cuota y el monto dinámico pendiente por aportar para cada integrante en un presupuesto.
 * cuotaDelIntegrante = calculada según proporciones o asignación manual
 * montoPendiente = Math.max(0, cuotaDelIntegrante - gastosPagadosPorElIntegranteEnEstaCategoria)
 */
export function calculateMemberPendingContributions(
  params: CalculateMemberPendingContributionsParams
): MemberPendingContribution[] {
  const {
    assignedAmount,
    userShares,
    manualContribution,
    periodExpenses = [],
    users = [],
    ownerType,
    appContext,
    activeUserId
  } = params;

  let splits: UserBudgetSplit[] = [];

  if (ownerType && ownerType !== 'SHARED') {
    const ownerUser = users.find(u => u.memberSlot === ownerType || u.id === ownerType) || users[0];
    if (ownerUser) {
      splits = [{
        userId: ownerUser.id,
        userName: ownerUser.displayName || ownerUser.name || 'Usuario',
        contribution: assignedAmount,
        ratio: 1,
        percentage: 100,
        isManual: true
      }];
    }
  } else if (appContext === 'personal' && activeUserId) {
    const activeUser = users.find(u => u.id === activeUserId) || users[0];
    if (activeUser) {
      splits = [{
        userId: activeUser.id,
        userName: activeUser.displayName || activeUser.name || 'Usuario',
        contribution: assignedAmount,
        ratio: 1,
        percentage: 100,
        isManual: true
      }];
    }
  } else {
    const splitCalc = calculateBudgetSplit(assignedAmount, userShares, manualContribution);
    splits = splitCalc.splits;
  }

  return splits.map(split => {
    const userObj = users.find(u => u.id === split.userId);
    const photoURL = userObj?.photoURL || userObj?.photoUrl;
    const userName = userObj?.displayName || userObj?.name || split.userName || 'Usuario';

    const paidAmount = periodExpenses.reduce((acc, exp) => {
      const payerId = exp.ownerUid || exp.userId || exp.paidBy;
      const isMatch = payerId === split.userId || (userObj?.memberSlot && payerId === userObj.memberSlot);
      if (isMatch) {
        return acc + (Number(exp.amount) || 0);
      }
      return acc;
    }, 0);

    const safePaid = Math.round(paidAmount * 100) / 100;
    const targetQuota = Math.round((Number(split.contribution) || 0) * 100) / 100;
    const pendingAmount = Math.max(0, Math.round((targetQuota - safePaid) * 100) / 100);

    return {
      userId: split.userId,
      userName,
      photoURL,
      targetQuota,
      paidAmount: safePaid,
      pendingAmount,
      isFullyCovered: pendingAmount === 0
    };
  });
}





