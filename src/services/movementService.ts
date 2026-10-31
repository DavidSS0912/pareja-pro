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

export interface ExpenseAdvancedOptions {
  splitType?: '50/50' | 'proporcional' | 'individual';
  isMsi?: boolean;
  msiCount?: number;
  tags?: string[];
}

export interface KeyValueStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export type MovementMode = 'expense' | 'income' | 'transfer';

export function getLastUsedAccountId(
  storage: KeyValueStorage | null | undefined,
  uid: string | null | undefined,
  mode: MovementMode,
  validAccountIds: string[]
): string | null {
  if (!storage || !uid || typeof uid !== 'string' || uid.trim() === '') {
    return null;
  }
  try {
    const key = `orbita_last_account_${uid}_${mode}`;
    const val = storage.getItem(key);
    if (val && validAccountIds && validAccountIds.includes(val)) {
      return val;
    }
    return null;
  } catch {
    return null;
  }
}

export function saveLastUsedAccountId(
  storage: KeyValueStorage | null | undefined,
  uid: string | null | undefined,
  mode: MovementMode,
  accountId: string
): void {
  if (
    !storage ||
    !uid ||
    typeof uid !== 'string' ||
    uid.trim() === '' ||
    !accountId ||
    typeof accountId !== 'string' ||
    accountId.trim() === ''
  ) {
    return;
  }
  try {
    const key = `orbita_last_account_${uid}_${mode}`;
    storage.setItem(key, accountId);
  } catch {
    // Silencia cualquier excepción (ej. cuota excedida)
  }
}

export function normalizeTags(tags?: string[]): string[] {
  if (!Array.isArray(tags) || tags.length === 0) {
    return [];
  }
  const result: string[] = [];
  const seen = new Set<string>();
  for (const item of tags) {
    if (typeof item === 'string') {
      const trimmed = item.trim();
      if (trimmed !== '' && !seen.has(trimmed)) {
        seen.add(trimmed);
        result.push(trimmed);
      }
    }
  }
  return result;
}

export interface LocalDateLike {
  getFullYear(): number;
  getMonth(): number;
  getDate(): number;
}

export function getTodayLocalISO(now?: Date | LocalDateLike): string {
  const d = now || new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

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

  // Comprobar decimales sin aritmética flotante usando la representación en cadena
  // Nota: expresiones como (0.1 + 0.2) en JS producen "0.30000000000000004" (>2 decimales)
  const parts = rawStr.split('.');
  if (parts.length > 2) {
    return { valid: false, error: 'Formato de número inválido' };
  }
  if (parts.length === 2 && parts[1].length > 2) {
    return { valid: false, error: 'El monto no puede tener más de 2 decimales' };
  }

  // Si es un número negativo con formato válido, informar que debe ser mayor a cero
  if (/^-\d+(\.\d{1,2})?$/.test(rawStr)) {
    return { valid: false, error: 'El monto debe ser mayor a cero' };
  }

  // Patrón estricto: solo dígitos con punto decimal opcional y máximo 2 decimales
  // Rechaza notación científica (1e-7, 1e3), signos explícitos (+5) y formatos no válidos
  if (!/^\d+(\.\d{1,2})?$/.test(rawStr)) {
    return { valid: false, error: 'Formato de número inválido' };
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
  options?: ExpenseAdvancedOptions;
  sourceOwnerUid?: string;
  targetOwnerUid?: string;
  sourceOwnerType?: 'USER_A' | 'USER_B' | 'SHARED';
  targetOwnerType?: 'USER_A' | 'USER_B' | 'SHARED';
  transferKind?: 'SAME_USER' | 'CROSS_USERS' | 'CARD_PAYMENT';
  sourceAccountAvailableBalance?: number;
  sourceAccountName?: string;
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

  // 3. Validación de fecha y existencia en el calendario
  if (!input.date || typeof input.date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(input.date)) {
    return { valid: false, error: 'La fecha es obligatoria y debe tener formato YYYY-MM-DD' };
  }

  const [yearStr, monthStr, dayStr] = input.date.split('-');
  const year = Number(yearStr);
  const month = Number(monthStr);
  const day = Number(dayStr);
  if (month < 1 || month > 12 || day < 1 || day > 31) {
    return { valid: false, error: 'La fecha no es válida en el calendario' };
  }
  const dateObj = new Date(year, month - 1, day);
  if (
    dateObj.getFullYear() !== year ||
    dateObj.getMonth() !== month - 1 ||
    dateObj.getDate() !== day
  ) {
    return { valid: false, error: 'La fecha no es válida en el calendario' };
  }

  // 4. Validación por modalidad
  if (input.type === 'EXPENSE') {
    if (!input.categoryId || input.categoryId.trim() === '') {
      return { valid: false, error: 'La categoría de gasto es obligatoria' };
    }
    if (!input.sourceAccountId || input.sourceAccountId.trim() === '') {
      return { valid: false, error: 'La cuenta de origen es obligatoria' };
    }
    if (input.appContext !== 'personal') {
      if (input.options?.splitType !== undefined) {
        const allowedSplitTypes = ['50/50', 'proporcional', 'individual'];
        if (!allowedSplitTypes.includes(input.options.splitType)) {
          return { valid: false, error: 'Tipo de división inválido' };
        }
      }
      if (input.options?.isMsi === true) {
        const msiCount = input.options.msiCount;
        if (
          typeof msiCount !== 'number' ||
          !Number.isInteger(msiCount) ||
          msiCount < 2 ||
          msiCount > 48
        ) {
          return {
            valid: false,
            error: 'El número de meses sin intereses debe ser un entero entre 2 y 48',
          };
        }
      }
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
    if (input.sourceAccountAvailableBalance !== undefined && amountRes.amount !== undefined) {
      if (amountRes.amount > input.sourceAccountAvailableBalance) {
        const accLabel = input.sourceAccountName ? ` "${input.sourceAccountName}"` : '';
        return {
          valid: false,
          error: `Fondos insuficientes en la cuenta de origen${accLabel}. Saldo disponible: $${input.sourceAccountAvailableBalance.toFixed(2)}`,
        };
      }
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
        splitType?: '50/50' | 'proporcional' | 'individual';
        isMsi?: boolean;
        msiCount?: number;
        tags?: string[];
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
        incomeCategoryType?: string;
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
        description?: string;
        note?: string;
        sourceOwnerUid?: string;
        targetOwnerUid?: string;
        sourceOwnerType?: 'USER_A' | 'USER_B' | 'SHARED';
        targetOwnerType?: 'USER_A' | 'USER_B' | 'SHARED';
        transferKind?: 'SAME_USER' | 'CROSS_USERS' | 'CARD_PAYMENT';
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
    const isPersonal = input.appContext === 'personal';
    const splitType = isPersonal ? '50/50' : (input.options?.splitType || '50/50');
    const isMsi = isPersonal ? false : !!input.options?.isMsi;
    const msiCount = isMsi ? input.options?.msiCount : undefined;
    const normalizedTags = normalizeTags(input.options?.tags);

    const payload: {
      amount: number;
      categoryId: string;
      category: string;
      sourceAccountId: string;
      date: string;
      desc: string;
      paidBy: string;
      isPrivate: boolean;
      isShared: boolean;
      splitType?: '50/50' | 'proporcional' | 'individual';
      isMsi?: boolean;
      msiCount?: number;
      tags?: string[];
    } = {
      amount,
      categoryId: input.categoryId!,
      category: categoryName,
      sourceAccountId: input.sourceAccountId!,
      date: input.date,
      desc: note || categoryName,
      paidBy: input.currentUserId!,
      isPrivate: flags.isPrivate,
      isShared: flags.isShared,
      splitType,
    };

    if (isMsi) {
      payload.isMsi = true;
      payload.msiCount = msiCount;
    }

    if (normalizedTags.length > 0) {
      payload.tags = normalizedTags;
    }

    return {
      type: 'EXPENSE',
      payload,
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
        incomeCategoryType: 'Ordinario',
      },
    };
  }

  // TRANSFER
  const transferPayload: any = {
    sourceAccountId: input.sourceAccountId!,
    targetAccountId: input.targetAccountId!,
    amount,
    date: input.date,
    ownerUid: input.currentUserId!,
    isShared: flags.isShared,
  };

  if (note) {
    transferPayload.description = note;
    transferPayload.note = note;
  }
  if (input.sourceOwnerUid) transferPayload.sourceOwnerUid = input.sourceOwnerUid;
  if (input.targetOwnerUid) transferPayload.targetOwnerUid = input.targetOwnerUid;
  if (input.sourceOwnerType) transferPayload.sourceOwnerType = input.sourceOwnerType;
  if (input.targetOwnerType) transferPayload.targetOwnerType = input.targetOwnerType;
  if (input.transferKind) transferPayload.transferKind = input.transferKind;

  return {
    type: 'TRANSFER',
    payload: transferPayload,
  };
}

/**
 * Calcula la fecha de una cuota de MSI con clamp al último día del mes correspondiente.
 * Si la compra se hace el 31 de octubre:
 * - Cuota 1 (offset 0): 31 de octubre
 * - Cuota 2 (offset 1): 30 de noviembre (noviembre solo tiene 30 días)
 * - Cuota 3 (offset 2): 31 de diciembre
 * - En febrero: 28 de febrero (o 29 si bisiesto)
 */
export function calculateMsiInstallmentDate(
  baseDate: string | Date,
  monthOffset: number
): Date {
  let year: number;
  let month: number; // 1-12
  let day: number;
  let hours = 0;
  let minutes = 0;
  let seconds = 0;
  let ms = 0;

  if (typeof baseDate === 'string') {
    const trimmed = baseDate.trim();
    const match = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
      year = parseInt(match[1], 10);
      month = parseInt(match[2], 10);
      day = parseInt(match[3], 10);
      if (trimmed.includes('T')) {
        const parsed = new Date(trimmed);
        if (!isNaN(parsed.getTime())) {
          hours = parsed.getUTCHours();
          minutes = parsed.getUTCMinutes();
          seconds = parsed.getUTCSeconds();
          ms = parsed.getUTCMilliseconds();
        }
      }
    } else {
      const parsed = new Date(trimmed);
      year = parsed.getUTCFullYear();
      month = parsed.getUTCMonth() + 1;
      day = parsed.getUTCDate();
      hours = parsed.getUTCHours();
      minutes = parsed.getUTCMinutes();
      seconds = parsed.getUTCSeconds();
      ms = parsed.getUTCMilliseconds();
    }
  } else {
    year = baseDate.getUTCFullYear();
    month = baseDate.getUTCMonth() + 1;
    day = baseDate.getUTCDate();
    hours = baseDate.getUTCHours();
    minutes = baseDate.getUTCMinutes();
    seconds = baseDate.getUTCSeconds();
    ms = baseDate.getUTCMilliseconds();
  }

  const totalMonths = year * 12 + (month - 1) + monthOffset;
  const targetYear = Math.floor(totalMonths / 12);
  const targetMonth = ((totalMonths % 12) + 12) % 12 + 1; // 1-12

  // Último día de targetMonth en targetYear:
  // Date.UTC(targetYear, targetMonth, 0) da el día 0 de targetMonth+1 (0-indexed: targetMonth), o sea el último día de targetMonth
  const daysInTargetMonth = new Date(Date.UTC(targetYear, targetMonth, 0)).getUTCDate();
  const targetDay = Math.min(day, daysInTargetMonth);

  return new Date(Date.UTC(targetYear, targetMonth - 1, targetDay, hours, minutes, seconds, ms));
}

