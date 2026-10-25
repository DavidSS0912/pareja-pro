import { describe, it, expect, vi } from 'vitest';
import {
  validateAmount,
  validateMovement,
  buildMovementAction,
  normalizeTags,
  getLastUsedAccountId,
  saveLastUsedAccountId,
  type ExpenseAdvancedOptions,
  type KeyValueStorage,
  type MovementMode,
} from '../services/movementService';

describe('movementOptions - 1. Validación de MSI (en Hogar / appContext !== "personal")', () => {
  const baseExpense = {
    type: 'EXPENSE' as const,
    amount: 1200,
    date: '2026-10-24',
    currentUserId: 'usr-100',
    appContext: 'household',
    categoryId: 'cat-appliances',
    categoryName: 'Electrodomésticos',
    sourceAccountId: 'acc-credit-1',
  };

  it('rechaza msiCount inválidos (1, 49, 2.5, NaN, undefined, null, "3") con error claro cuando isMsi: true', () => {
    const invalidCounts = [1, 49, 2.5, NaN, undefined, null, '3'];

    for (const invalidCount of invalidCounts) {
      const result = validateMovement({
        ...baseExpense,
        options: {
          isMsi: true,
          msiCount: invalidCount as any,
        },
      });
      expect(result.valid).toBe(false);
      expect(result.error).toBe('El número de meses sin intereses debe ser un entero entre 2 y 48');
    }
  });

  it('acepta msiCount válidos (2, 48, 3, 12) cuando isMsi: true', () => {
    const validCounts = [2, 48, 3, 12];

    for (const validCount of validCounts) {
      const result = validateMovement({
        ...baseExpense,
        options: {
          isMsi: true,
          msiCount: validCount,
        },
      });
      expect(result).toEqual({ valid: true });
    }
  });

  it('ignora msiCount cuando isMsi es false o está ausente', () => {
    // isMsi: false con msiCount inválido
    const resFalse = validateMovement({
      ...baseExpense,
      options: {
        isMsi: false,
        msiCount: 999 as any,
      },
    });
    expect(resFalse).toEqual({ valid: true });

    // isMsi ausente con msiCount inválido
    const resMissing = validateMovement({
      ...baseExpense,
      options: {
        msiCount: 999 as any,
      },
    });
    expect(resMissing).toEqual({ valid: true });

    // options vacío
    const resEmpty = validateMovement({
      ...baseExpense,
      options: {},
    });
    expect(resEmpty).toEqual({ valid: true });

    // options ausente
    const resNoOptions = validateMovement(baseExpense);
    expect(resNoOptions).toEqual({ valid: true });
  });
});

describe('movementOptions - 2. Validación de splitType (en Hogar)', () => {
  const baseExpense = {
    type: 'EXPENSE' as const,
    amount: 300,
    date: '2026-10-24',
    currentUserId: 'usr-100',
    appContext: 'household',
    categoryId: 'cat-groceries',
    categoryName: 'Supermercado',
    sourceAccountId: 'acc-debit-1',
  };

  it('acepta splitType permitidos: 50/50, proporcional, individual', () => {
    const allowedTypes: ExpenseAdvancedOptions['splitType'][] = ['50/50', 'proporcional', 'individual'];

    for (const splitType of allowedTypes) {
      const result = validateMovement({
        ...baseExpense,
        options: { splitType },
      });
      expect(result).toEqual({ valid: true });
    }
  });

  it('rechaza valores no permitidos de splitType (ej. custom, 70/30, invalido)', () => {
    const invalidTypes = ['custom', '70/30', 'invalido', ''];

    for (const invalidType of invalidTypes) {
      const result = validateMovement({
        ...baseExpense,
        options: { splitType: invalidType as any },
      });
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Tipo de división inválido');
    }
  });

  it('asigna "50/50" por defecto en el payload si splitType no se especifica en options', () => {
    const actionNoOptions = buildMovementAction(baseExpense);
    expect(actionNoOptions.type).toBe('EXPENSE');
    if (actionNoOptions.type === 'EXPENSE') {
      expect(actionNoOptions.payload.splitType).toBe('50/50');
    }

    const actionEmptyOptions = buildMovementAction({
      ...baseExpense,
      options: {},
    });
    expect(actionEmptyOptions.type).toBe('EXPENSE');
    if (actionEmptyOptions.type === 'EXPENSE') {
      expect(actionEmptyOptions.payload.splitType).toBe('50/50');
    }
  });
});

describe('movementOptions - 3. normalizeTags', () => {
  it('limpia espacios en blanco alrededor de cada tag', () => {
    expect(normalizeTags(['  super  ', 'casa  '])).toEqual(['super', 'casa']);
  });

  it('descarta strings vacíos o de puros espacios, y elementos no-string', () => {
    expect(normalizeTags(['', '   ', null as any, undefined as any, 123 as any, 'comida'])).toEqual(['comida']);
  });

  it('deduplica preservando el orden de primera aparición', () => {
    expect(normalizeTags(['a', 'b', 'a', 'c', 'b'])).toEqual(['a', 'b', 'c']);
  });

  it('devuelve arreglo vacío para entrada vacía, undefined o null', () => {
    expect(normalizeTags([])).toEqual([]);
    expect(normalizeTags(undefined)).toEqual([]);
    expect(normalizeTags(null as any)).toEqual([]);
  });
});

describe('movementOptions - 4. buildMovementAction - EXPENSE payload en Hogar', () => {
  const baseExpenseInput = {
    type: 'EXPENSE' as const,
    amount: '450.50',
    date: '2026-10-24',
    currentUserId: 'usr-100',
    appContext: 'household',
    categoryId: 'cat-home',
    categoryName: 'Hogar y Muebles',
    sourceAccountId: 'acc-credit-1',
    note: 'Mesa de comedor',
  };

  it('incluye splitType, isMsi, msiCount y tags normalizados con opciones completas', () => {
    const options: ExpenseAdvancedOptions = {
      splitType: 'proporcional',
      isMsi: true,
      msiCount: 6,
      tags: [' tag1 ', 'tag1', 'tag2'],
    };

    const action = buildMovementAction({
      ...baseExpenseInput,
      options,
    });

    expect(action).toEqual({
      type: 'EXPENSE',
      payload: {
        amount: 450.5,
        categoryId: 'cat-home',
        category: 'Hogar y Muebles',
        sourceAccountId: 'acc-credit-1',
        date: '2026-10-24',
        desc: 'Mesa de comedor',
        paidBy: 'usr-100',
        isPrivate: false,
        isShared: true,
        splitType: 'proporcional',
        isMsi: true,
        msiCount: 6,
        tags: ['tag1', 'tag2'],
      },
    });
  });

  it('genera payload idéntico a F3.1 (splitType: "50/50", sin isMsi, msiCount ni tags) cuando options es undefined', () => {
    const action = buildMovementAction(baseExpenseInput);

    expect(action).toEqual({
      type: 'EXPENSE',
      payload: {
        amount: 450.5,
        categoryId: 'cat-home',
        category: 'Hogar y Muebles',
        sourceAccountId: 'acc-credit-1',
        date: '2026-10-24',
        desc: 'Mesa de comedor',
        paidBy: 'usr-100',
        isPrivate: false,
        isShared: true,
        splitType: '50/50',
      },
    });

    const payload = action.payload as any;
    expect(payload.isMsi).toBeUndefined();
    expect(payload.msiCount).toBeUndefined();
    expect(payload.tags).toBeUndefined();
  });
});

describe('movementOptions - 5. Paridad con contexto Personal (appContext === "personal")', () => {
  it('ignora splitType y MSI en Personal (splitType="50/50", sin isMsi ni msiCount), pero SÍ incluye tags normalizados', () => {
    const personalInput = {
      type: 'EXPENSE' as const,
      amount: 180,
      date: '2026-10-24',
      currentUserId: 'usr-personal',
      appContext: 'personal',
      categoryId: 'cat-books',
      categoryName: 'Libros',
      sourceAccountId: 'acc-debit-1',
      note: 'Novela de ciencia ficción',
      options: {
        splitType: 'individual' as const,
        isMsi: true,
        msiCount: 6,
        tags: ['  mi-tag  '],
      },
    };

    const action = buildMovementAction(personalInput);

    expect(action.type).toBe('EXPENSE');
    const payload = action.payload as any;
    expect(payload.splitType).toBe('50/50');
    expect(payload.isMsi).toBeUndefined();
    expect(payload.msiCount).toBeUndefined();
    expect(payload.tags).toEqual(['mi-tag']);
    expect(payload.isPrivate).toBe(true);
    expect(payload.isShared).toBe(false);
  });
});

describe('movementOptions - 6. INCOME y TRANSFER ignoran opciones', () => {
  it('INCOME con options no contiene splitType, isMsi, msiCount ni tags en payload', () => {
    const incomeInput = {
      type: 'INCOME' as const,
      amount: 5000,
      date: '2026-10-24',
      currentUserId: 'usr-100',
      appContext: 'household',
      categoryId: 'cat-bonus',
      categoryName: 'Bono',
      targetAccountId: 'acc-bank-1',
      options: {
        splitType: 'individual' as const,
        isMsi: true,
        msiCount: 12,
        tags: ['bono-tag'],
      },
    };

    const action = buildMovementAction(incomeInput);
    const payload = action.payload as any;

    expect(payload.splitType).toBeUndefined();
    expect(payload.isMsi).toBeUndefined();
    expect(payload.msiCount).toBeUndefined();
    expect(payload.tags).toBeUndefined();
  });

  it('TRANSFER con options no contiene splitType, isMsi, msiCount ni tags en payload', () => {
    const transferInput = {
      type: 'TRANSFER' as const,
      amount: 600,
      date: '2026-10-24',
      currentUserId: 'usr-100',
      appContext: 'household',
      sourceAccountId: 'acc-1',
      targetAccountId: 'acc-2',
      options: {
        splitType: 'proporcional' as const,
        isMsi: true,
        msiCount: 3,
        tags: ['traspaso-tag'],
      },
    };

    const action = buildMovementAction(transferInput);
    const payload = action.payload as any;

    expect(payload.splitType).toBeUndefined();
    expect(payload.isMsi).toBeUndefined();
    expect(payload.msiCount).toBeUndefined();
    expect(payload.tags).toBeUndefined();
  });
});

describe('movementOptions - 7. D3b - INCOME incluye incomeCategoryType', () => {
  it('buildMovementAction para INCOME incluye incomeCategoryType: "Ordinario" en el payload', () => {
    const incomeInput = {
      type: 'INCOME' as const,
      amount: 2500,
      date: '2026-10-24',
      currentUserId: 'usr-100',
      categoryId: 'cat-salary',
      categoryName: 'Salario',
      targetAccountId: 'acc-savings',
    };

    const action = buildMovementAction(incomeInput);
    expect(action.type).toBe('INCOME');
    const payload = action.payload as any;
    expect(payload.incomeCategoryType).toBe('Ordinario');
  });
});

describe('movementOptions - 8. Memoria de cuenta (getLastUsedAccountId y saveLastUsedAccountId)', () => {
  const createMockStorage = () => {
    const store = new Map<string, string>();
    return {
      store,
      getItem: vi.fn((key: string): string | null => store.get(key) ?? null),
      setItem: vi.fn((key: string, value: string): void => {
        store.set(key, value);
      }),
    };
  };

  it('usa la clave exacta orbita_last_account_${uid}_${mode} para guardar y recuperar', () => {
    const storage = createMockStorage();
    const uid = 'usr-42';
    const mode: MovementMode = 'expense';
    const accountId = 'acc-visa-99';

    saveLastUsedAccountId(storage, uid, mode, accountId);
    expect(storage.setItem).toHaveBeenCalledWith('orbita_last_account_usr-42_expense', accountId);

    const retrieved = getLastUsedAccountId(storage, uid, mode, [accountId, 'acc-other']);
    expect(storage.getItem).toHaveBeenCalledWith('orbita_last_account_usr-42_expense');
    expect(retrieved).toBe(accountId);
  });

  it('garantiza aislamiento por uid (usuario A no lee la cuenta de usuario B)', () => {
    const storage = createMockStorage();
    saveLastUsedAccountId(storage, 'usr-A', 'expense', 'acc-A');
    saveLastUsedAccountId(storage, 'usr-B', 'expense', 'acc-B');

    expect(getLastUsedAccountId(storage, 'usr-A', 'expense', ['acc-A', 'acc-B'])).toBe('acc-A');
    expect(getLastUsedAccountId(storage, 'usr-B', 'expense', ['acc-A', 'acc-B'])).toBe('acc-B');
  });

  it('garantiza aislamiento por mode (expense, income, transfer usan claves distintas)', () => {
    const storage = createMockStorage();
    const uid = 'usr-shared';

    saveLastUsedAccountId(storage, uid, 'expense', 'acc-exp');
    saveLastUsedAccountId(storage, uid, 'income', 'acc-inc');
    saveLastUsedAccountId(storage, uid, 'transfer', 'acc-tr');

    const validList = ['acc-exp', 'acc-inc', 'acc-tr'];
    expect(getLastUsedAccountId(storage, uid, 'expense', validList)).toBe('acc-exp');
    expect(getLastUsedAccountId(storage, uid, 'income', validList)).toBe('acc-inc');
    expect(getLastUsedAccountId(storage, uid, 'transfer', validList)).toBe('acc-tr');
  });

  it('descarta ID obsoleto devolviendo null si el storage devuelve una cuenta que no está en validAccountIds', () => {
    const storage = createMockStorage();
    const uid = 'usr-1';
    saveLastUsedAccountId(storage, uid, 'expense', 'acc-deleted');

    const retrieved = getLastUsedAccountId(storage, uid, 'expense', ['acc-active-1', 'acc-active-2']);
    expect(retrieved).toBeNull();
  });

  it('maneja excepciones de storage (getItem o setItem) sin propagar errores', () => {
    const failingStorage: KeyValueStorage = {
      getItem: vi.fn(() => {
        throw new Error('QuotaExceededError');
      }),
      setItem: vi.fn(() => {
        throw new Error('QuotaExceededError');
      }),
    };

    expect(() => saveLastUsedAccountId(failingStorage, 'usr-1', 'expense', 'acc-1')).not.toThrow();
    expect(getLastUsedAccountId(failingStorage, 'usr-1', 'expense', ['acc-1'])).toBeNull();
  });

  it('devuelve null y no arroja error ante parámetros nulos, indefinidos o vacíos', () => {
    const storage = createMockStorage();

    // getLastUsedAccountId con parámetros nulos o inválidos
    expect(getLastUsedAccountId(null, 'usr-1', 'expense', ['acc-1'])).toBeNull();
    expect(getLastUsedAccountId(undefined, 'usr-1', 'expense', ['acc-1'])).toBeNull();
    expect(getLastUsedAccountId(storage, null, 'expense', ['acc-1'])).toBeNull();
    expect(getLastUsedAccountId(storage, undefined, 'expense', ['acc-1'])).toBeNull();
    expect(getLastUsedAccountId(storage, '', 'expense', ['acc-1'])).toBeNull();
    expect(getLastUsedAccountId(storage, '   ', 'expense', ['acc-1'])).toBeNull();

    // saveLastUsedAccountId con parámetros nulos o inválidos
    expect(() => saveLastUsedAccountId(null, 'usr-1', 'expense', 'acc-1')).not.toThrow();
    expect(() => saveLastUsedAccountId(undefined, 'usr-1', 'expense', 'acc-1')).not.toThrow();
    expect(() => saveLastUsedAccountId(storage, null, 'expense', 'acc-1')).not.toThrow();
    expect(() => saveLastUsedAccountId(storage, undefined, 'expense', 'acc-1')).not.toThrow();
    expect(() => saveLastUsedAccountId(storage, '', 'expense', 'acc-1')).not.toThrow();
    expect(() => saveLastUsedAccountId(storage, '   ', 'expense', 'acc-1')).not.toThrow();

    storage.setItem.mockClear();
    saveLastUsedAccountId(storage, null, 'expense', 'acc-1');
    saveLastUsedAccountId(storage, undefined, 'expense', 'acc-1');
    saveLastUsedAccountId(storage, '', 'expense', 'acc-1');
    saveLastUsedAccountId(storage, '   ', 'expense', 'acc-1');
    saveLastUsedAccountId(storage, 'usr-1', 'expense', '');
    saveLastUsedAccountId(storage, 'usr-1', 'expense', '   ');
    expect(storage.setItem).not.toHaveBeenCalled();
  });
});

describe('movementOptions - 9. Validación de calendario', () => {
  const baseExpense = {
    type: 'EXPENSE' as const,
    amount: 100,
    currentUserId: 'usr-100',
    appContext: 'household',
    categoryId: 'cat-test',
    categoryName: 'Test',
    sourceAccountId: 'acc-test',
  };

  it('acepta 2028-02-29 como fecha válida (año bisiesto)', () => {
    const result = validateMovement({
      ...baseExpense,
      date: '2028-02-29',
    });
    expect(result).toEqual({ valid: true });
  });

  it('rechaza 2026-02-29 como fecha inválida en el calendario (no bisiesto)', () => {
    const result = validateMovement({
      ...baseExpense,
      date: '2026-02-29',
    });
    expect(result.valid).toBe(false);
    expect(result.error).toBe('La fecha no es válida en el calendario');
  });

  it('rechaza 2026-04-31 como fecha inválida en el calendario (abril solo tiene 30 días)', () => {
    const result = validateMovement({
      ...baseExpense,
      date: '2026-04-31',
    });
    expect(result.valid).toBe(false);
    expect(result.error).toBe('La fecha no es válida en el calendario');
  });
});

describe('movementOptions - Validación de monto (validateAmount)', () => {
  it('valida montos numéricos y strings con precisión decimal requerida', () => {
    expect(validateAmount(250.5)).toEqual({ valid: true, amount: 250.5 });
    expect(validateAmount('1299.99')).toEqual({ valid: true, amount: 1299.99 });
    expect(validateAmount('invalid').valid).toBe(false);
  });

  it('B1: retorna "El monto debe ser mayor a cero" para números negativos (-15) y strings con signo negativo ("-5")', () => {
    const resNum = validateAmount(-15);
    expect(resNum.valid).toBe(false);
    expect(resNum.error).toBe('El monto debe ser mayor a cero');

    const resStr = validateAmount('-5');
    expect(resStr.valid).toBe(false);
    expect(resStr.error).toBe('El monto debe ser mayor a cero');
  });
});
