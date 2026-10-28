import { calculateAccountAvailableBalance } from './walletCalculations';

/**
 * Tipos e interfaces para la vinculación contable de proyectos y aportaciones.
 */

export interface ProjectAccountValidationResult {
  isValid: boolean;
  error?: string;
}

export interface ProjectContributionParams {
  project: {
    id: string;
    name?: string;
    targetAmount?: number;
    savedAmount?: number;
    currentAmount?: number;
    targetAccountId?: string;
    targetAccount?: string;
    [key: string]: any;
  };
  sourceAccount: {
    id: string;
    name?: string;
    type?: string;
    balance?: number;
    [key: string]: any;
  };
  targetAccount: {
    id: string;
    name?: string;
    type?: string;
    balance?: number;
    [key: string]: any;
  };
  amount: number;
  activeProjectsInTargetAccount?: any[];
  date?: string;
  notes?: string;
  userId?: string;
}

export interface ProjectPlannedTransfer {
  isInternalTransfer: true;
  sourceAccountId: string;
  targetAccountId: string;
  amount: number;
  date: string;
  description: string;
}

export interface ProjectContributionRecord {
  projectId: string;
  sourceAccountId: string;
  targetAccountId: string;
  amount: number;
  date: string;
  notes?: string;
  userId?: string;
  isInternalPiggyBank: boolean;
}

export interface ProjectContributionPlan {
  isValid: boolean;
  error?: string;
  isInternalPiggyBank: boolean;
  amount: number;
  newProjectSavedAmount: number;
  projectReachedGoal: boolean;
  plannedTransfer?: ProjectPlannedTransfer;
  contributionRecord?: ProjectContributionRecord;
}

/**
 * Valida que la cuenta destino de un proyecto sea una cuenta real de activo/efectivo.
 */
export function validateProjectTargetAccount(account: any): ProjectAccountValidationResult {
  if (!account || typeof account !== 'object' || !account.id) {
    return {
      isValid: false,
      error: 'Debe seleccionar una cuenta destino válida'
    };
  }

  const accountType = String(account.type || '').toUpperCase();
  const validAssetTypes = ['ASSET', 'BANK_ACCOUNT', 'CASH', 'DEBIT'];

  if (!validAssetTypes.includes(accountType)) {
    return {
      isValid: false,
      error: 'La cuenta destino debe ser de tipo activo o efectivo (no se admiten pasivos o tarjetas de crédito)'
    };
  }

  return { isValid: true };
}

/**
 * Calcula el plan de aportación distinguiendo entre Origen != Destino (Transferencia interna)
 * y Origen == Destino (Apartado / Cajita en la misma cuenta).
 */
export function calculateProjectContribution(params: ProjectContributionParams): ProjectContributionPlan {
  const {
    project,
    sourceAccount,
    targetAccount,
    amount,
    activeProjectsInTargetAccount,
    date,
    notes,
    userId
  } = params;

  const numericAmount = Number(amount);
  if (isNaN(numericAmount) || numericAmount <= 0) {
    return {
      isValid: false,
      error: 'El monto de la aportación debe ser mayor a 0',
      isInternalPiggyBank: false,
      amount: 0,
      newProjectSavedAmount: Number(project?.savedAmount ?? project?.currentAmount ?? 0),
      projectReachedGoal: false
    };
  }

  // 1. Validar cuenta destino
  const targetValidation = validateProjectTargetAccount(targetAccount);
  if (!targetValidation.isValid) {
    return {
      isValid: false,
      error: targetValidation.error,
      isInternalPiggyBank: false,
      amount: numericAmount,
      newProjectSavedAmount: Number(project?.savedAmount ?? project?.currentAmount ?? 0),
      projectReachedGoal: false
    };
  }

  // 2. Validar cuenta origen
  if (!sourceAccount || !sourceAccount.id) {
    return {
      isValid: false,
      error: 'Debe seleccionar una cuenta de origen válida',
      isInternalPiggyBank: false,
      amount: numericAmount,
      newProjectSavedAmount: Number(project?.savedAmount ?? project?.currentAmount ?? 0),
      projectReachedGoal: false
    };
  }

  const sourceType = String(sourceAccount.type || '').toUpperCase();
  const validSourceTypes = ['ASSET', 'BANK_ACCOUNT', 'CASH', 'DEBIT'];
  if (!validSourceTypes.includes(sourceType)) {
    return {
      isValid: false,
      error: 'La cuenta origen debe ser de tipo débito o efectivo',
      isInternalPiggyBank: false,
      amount: numericAmount,
      newProjectSavedAmount: Number(project?.savedAmount ?? project?.currentAmount ?? 0),
      projectReachedGoal: false
    };
  }

  // 3. Determinar si es un apartado interno en la misma cuenta
  const isInternalPiggyBank = String(sourceAccount.id) === String(targetAccount.id);

  // 4. Validar saldo disponible
  if (isInternalPiggyBank) {
    // En apartado interno, el saldo disponible es Saldo Contable - Apartados existentes en esa cuenta
    const metrics = calculateAccountAvailableBalance(sourceAccount, activeProjectsInTargetAccount);
    if (numericAmount > metrics.availableBalance) {
      return {
        isValid: false,
        error: `Saldo disponible insuficiente en la cuenta para apartar este monto (Disponible: $${metrics.availableBalance.toLocaleString()})`,
        isInternalPiggyBank: true,
        amount: numericAmount,
        newProjectSavedAmount: Number(project?.savedAmount ?? project?.currentAmount ?? 0),
        projectReachedGoal: false
      };
    }
  } else {
    // En transferencia entre cuentas distintas, validar saldo contable origen
    const sourceBalance = Number(sourceAccount.balance) || 0;
    if (numericAmount > sourceBalance) {
      return {
        isValid: false,
        error: `Saldo insuficiente en la cuenta origen para realizar la transferencia (Saldo: $${sourceBalance.toLocaleString()})`,
        isInternalPiggyBank: false,
        amount: numericAmount,
        newProjectSavedAmount: Number(project?.savedAmount ?? project?.currentAmount ?? 0),
        projectReachedGoal: false
      };
    }
  }

  // 5. Calcular nuevo progreso
  const currentSaved = Number(project?.savedAmount ?? project?.currentAmount ?? 0);
  const newProjectSavedAmount = currentSaved + numericAmount;
  const targetAmount = Number(project?.targetAmount || 0);
  const projectReachedGoal = targetAmount > 0 && newProjectSavedAmount >= targetAmount;

  const contributionDate = date || new Date().toISOString().split('T')[0];

  // 6. Planificar transferencia contable si Origen != Destino
  let plannedTransfer: ProjectPlannedTransfer | undefined = undefined;
  if (!isInternalPiggyBank) {
    plannedTransfer = {
      isInternalTransfer: true,
      sourceAccountId: sourceAccount.id,
      targetAccountId: targetAccount.id,
      amount: numericAmount,
      date: contributionDate,
      description: notes || `Aportación a proyecto: ${project?.name || 'Ahorro'}`
    };
  }

  // 7. Registro de trazabilidad
  const contributionRecord: ProjectContributionRecord = {
    projectId: project.id,
    sourceAccountId: sourceAccount.id,
    targetAccountId: targetAccount.id,
    amount: numericAmount,
    date: contributionDate,
    notes,
    userId,
    isInternalPiggyBank
  };

  return {
    isValid: true,
    isInternalPiggyBank,
    amount: numericAmount,
    newProjectSavedAmount,
    projectReachedGoal,
    plannedTransfer,
    contributionRecord
  };
}
