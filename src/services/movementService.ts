/**
 * Servicio unificado de movimientos (Fase 3 - F3.1)
 *
 * Limitación F3:
 * Las transferencias contables internas (CreateJournalWithEntries con isInternalTransfer: true)
 * cuadran y afectan saldos en GetHouseholdNetBalances, pero las consultas GetExpensesByHousehold
 * y GetIncomesByHousehold filtran isInternalTransfer: { eq: false }. Por tanto, no se listan
 * en las vistas de gastos/ingresos ni admiten edición o eliminación desde la UI en esta fase.
 */

export const MAX_AMOUNT_NUMERIC_14_2 = 999999999999.99;

export interface MovementContextFlags {
  isPrivate: boolean;
  isShared: boolean;
}

export function resolveMovementContext(appContext?: string): MovementContextFlags {
  if (appContext === 'personal') {
    return { isPrivate: true, isShared: false };
  }
  return { isPrivate: false, isShared: true };
}

export interface AmountValidationResult {
  valid: boolean;
  error?: string;
  amount?: number;
}

export function validateAmount(raw: number | string | null | undefined): AmountValidationResult {
  if (raw === null || raw === undefined) {
    return { valid: false, error: 'El monto es obligatorio' };
  }

  const rawStr = String(raw).trim();
  if (rawStr === '') {
    return { valid: false, error: 'El monto es obligatorio' };
  }

  const num = typeof raw === 'number' ? raw : Number(rawStr);
  if (Number.isNaN(num) || !Number.isFinite(num)) {
    return { valid: false, error: 'El monto no es un número válido' };
  }

  if (num <= 0) {
    return { valid: false, error: 'El monto debe ser mayor a cero' };
  }

  if (num > MAX_AMOUNT_NUMERIC_14_2) {
    return { valid: false, error: `El monto excede el límite máximo permitido (${MAX_AMOUNT_NUMERIC_14_2})` };
  }

  // Comprobar decimales sin aritmética flotante usando la representación en cadena
  // Nota: expresiones como (0.1 + 0.2) en JS producen "0.30000000000000004" (>2 decimales)
  const parts = rawStr.split('.');
  if (parts.length > 2) {
    return { valid: false, error: 'Formato de número inválido' };
  }
  if (parts.length === 2 && parts[1].length > 2) {
    return { valid: false, error: 'El monto no puede tener más de 2 decimales' };
  }

  return { valid: true, amount: num };
}

export interface MovementValidationInput {
  type: 'EXPENSE' | 'INCOME' | 'TRANSFER';
  amount: number | string;
  date: string;
  currentUserId?: string | null;
  appContext?: string;
  categoryId?: string;
  categoryName?: string;
  sourceAccountId?: string;
  targetAccountId?: string;
  note?: string;
}

export interface MovementValidationResult {
  valid: boolean;
  error?: string;
}

export function validateMovement(input: MovementValidationInput): MovementValidationResult {
  // 1. Validación de usuario (aislamiento por uid estricto, sin fallback a users[0])
  if (!input.currentUserId || typeof input.currentUserId !== 'string' || input.currentUserId.trim() === '') {
    return { valid: false, error: 'Usuario no autenticado o sesión inválida' };
  }

  // 2. Validación de monto (precisión decimal y límites)
  const amountRes = validateAmount(input.amount);
  if (!amountRes.valid) {
    return { valid: false, error: amountRes.error };
  }

  // 3. Validación de fecha
  if (!input.date || typeof input.date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(input.date)) {
    return { valid: false, error: 'La fecha es obligatoria y debe tener formato YYYY-MM-DD' };
  }

  // 4. Validación por modalidad
  if (input.type === 'EXPENSE') {
    if (!input.categoryId || input.categoryId.trim() === '') {
      return { valid: false, error: 'La categoría de gasto es obligatoria' };
    }
    if (!input.sourceAccountId || input.sourceAccountId.trim() === '') {
      return { valid: false, error: 'La cuenta de origen es obligatoria' };
    }
  } else if (input.type === 'INCOME') {
    if (!input.categoryId || input.categoryId.trim() === '') {
      return { valid: false, error: 'La categoría de ingreso es obligatoria' };
    }
    if (!input.targetAccountId || input.targetAccountId.trim() === '') {
      return { valid: false, error: 'La cuenta de destino es obligatoria' };
    }
  } else if (input.type === 'TRANSFER') {
    if (!input.sourceAccountId || input.sourceAccountId.trim() === '') {
      return { valid: false, error: 'La cuenta de origen es obligatoria' };
    }
    if (!input.targetAccountId || input.targetAccountId.trim() === '') {
      return { valid: false, error: 'La cuenta de destino es obligatoria' };
    }
    if (input.sourceAccountId === input.targetAccountId) {
      return { valid: false, error: 'La cuenta de origen y destino deben ser diferentes' };
    }
  } else {
    return { valid: false, error: 'Modalidad de movimiento desconocida' };
  }

  return { valid: true };
}

export type MovementAction =
  | {
      type: 'EXPENSE';
      payload: {
        amount: number;
        categoryId: string;
        category: string;
        sourceAccountId: string;
        date: string;
        desc: string;
        paidBy: string;
        isPrivate: boolean;
        isShared: boolean;
        splitType: '50/50';
      };
    }
  | {
      type: 'INCOME';
      payload: {
        amount: number;
        categoryId: string;
        accountId: string;
        date: string;
        source: string;
        type: string;
        userId: string;
        isPrivate: boolean;
        isShared: boolean;
      };
    }
  | {
      type: 'TRANSFER';
      payload: {
        sourceAccountId: string;
        targetAccountId: string;
        amount: number;
        date: string;
        ownerUid: string;
        isShared: boolean;
      };
    };

export function buildMovementAction(input: MovementValidationInput): MovementAction {
  const validation = validateMovement(input);
  if (!validation.valid) {
    throw new Error(validation.error || 'Datos de movimiento inválidos');
  }

  const amountRes = validateAmount(input.amount);
  const amount = amountRes.amount!;
  const flags = resolveMovementContext(input.appContext);
  const note = (input.note || '').trim();

  if (input.type === 'EXPENSE') {
    const categoryName = input.categoryName || 'Gasto';
    return {
      type: 'EXPENSE',
      payload: {
        amount,
        categoryId: input.categoryId!,
        category: categoryName,
        sourceAccountId: input.sourceAccountId!,
        date: input.date,
        desc: note || categoryName,
        paidBy: input.currentUserId!,
        isPrivate: flags.isPrivate,
        isShared: flags.isShared,
        splitType: '50/50',
      },
    };
  }

  if (input.type === 'INCOME') {
    const categoryName = input.categoryName || 'Ingreso';
    const source = note || categoryName;
    return {
      type: 'INCOME',
      payload: {
        amount,
        categoryId: input.categoryId!,
        accountId: input.targetAccountId!,
        date: input.date,
        source,
        type: source,
        userId: input.currentUserId!,
        isPrivate: flags.isPrivate,
        isShared: flags.isShared,
      },
    };
  }

  // TRANSFER
  return {
    type: 'TRANSFER',
    payload: {
      sourceAccountId: input.sourceAccountId!,
      targetAccountId: input.targetAccountId!,
      amount,
      date: input.date,
      ownerUid: input.currentUserId!,
      isShared: flags.isShared,
    },
  };
}
