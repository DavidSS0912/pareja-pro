import { describe, it, expect } from 'vitest';
import {
  validateAmount,
  validateMovement,
  buildMovementAction,
  resolveMovementContext,
  MAX_AMOUNT_NUMERIC_14_2,
} from '../services/movementService';

describe('movementService - validateAmount', () => {
  it('permite enteros y números con 1 o 2 decimales', () => {
    expect(validateAmount(100)).toEqual({ valid: true, amount: 100 });
    expect(validateAmount('50.5')).toEqual({ valid: true, amount: 50.5 });
    expect(validateAmount(99.99)).toEqual({ valid: true, amount: 99.99 });
  });

  it('rechaza montos con más de 2 decimales (incluyendo 0.1 + 0.2 por imprecisión flotante)', () => {
    // 0.1 + 0.2 produce 0.30000000000000004 en IEEE-754
    const floatImprecision = 0.1 + 0.2;
    const resFloat = validateAmount(floatImprecision);
    expect(resFloat.valid).toBe(false);
    expect(resFloat.error).toBe('El monto no puede tener más de 2 decimales');

    const res3Decimals = validateAmount('10.555');
    expect(res3Decimals.valid).toBe(false);
    expect(res3Decimals.error).toBe('El monto no puede tener más de 2 decimales');
  });

  it('rechaza cero, negativos, NaN y valores vacíos', () => {
    expect(validateAmount(0).valid).toBe(false);
    expect(validateAmount(-15).valid).toBe(false);
    expect(validateAmount(NaN).valid).toBe(false);
    expect(validateAmount('').valid).toBe(false);
    expect(validateAmount(null).valid).toBe(false);
    expect(validateAmount(undefined).valid).toBe(false);
  });

  it('respeta el tope máximo numeric(14,2)', () => {
    expect(validateAmount(MAX_AMOUNT_NUMERIC_14_2).valid).toBe(true);
    const overLimit = MAX_AMOUNT_NUMERIC_14_2 + 1;
    const resOver = validateAmount(overLimit);
    expect(resOver.valid).toBe(false);
    expect(resOver.error).toContain('límite máximo');
  });
});

describe('movementService - resolveMovementContext', () => {
  it('resuelve personal como isPrivate=true, isShared=false', () => {
    expect(resolveMovementContext('personal')).toEqual({ isPrivate: true, isShared: false });
  });

  it('resuelve household o por defecto como isPrivate=false, isShared=true', () => {
    expect(resolveMovementContext('household')).toEqual({ isPrivate: false, isShared: true });
    expect(resolveMovementContext(undefined)).toEqual({ isPrivate: false, isShared: true });
  });
});

describe('movementService - validaciones de usuario y modalidades', () => {
  const baseValidExpense = {
    type: 'EXPENSE' as const,
    amount: 150.0,
    date: '2026-10-21',
    currentUserId: 'usr-123',
    appContext: 'household',
    categoryId: 'cat-groceries',
    categoryName: 'Supermercado',
    sourceAccountId: 'acc-bank-1',
    note: 'Compras de la semana',
  };

  it('rechaza si falta el currentUserId (sin fallback a users[0])', () => {
    const noUser = validateMovement({ ...baseValidExpense, currentUserId: undefined });
    expect(noUser.valid).toBe(false);
    expect(noUser.error).toBe('Usuario no autenticado o sesión inválida');

    const emptyUser = validateMovement({ ...baseValidExpense, currentUserId: '   ' });
    expect(emptyUser.valid).toBe(false);
    expect(emptyUser.error).toBe('Usuario no autenticado o sesión inválida');
  });

  it('valida modalidad EXPENSE (requiere categoryId y sourceAccountId)', () => {
    const missingCat = validateMovement({ ...baseValidExpense, categoryId: '' });
    expect(missingCat.valid).toBe(false);
    expect(missingCat.error).toBe('La categoría de gasto es obligatoria');

    const missingAcc = validateMovement({ ...baseValidExpense, sourceAccountId: '' });
    expect(missingAcc.valid).toBe(false);
    expect(missingAcc.error).toBe('La cuenta de origen es obligatoria');

    expect(validateMovement(baseValidExpense).valid).toBe(true);
  });

  it('valida modalidad INCOME (requiere categoryId y targetAccountId)', () => {
    const baseValidIncome = {
      type: 'INCOME' as const,
      amount: 5000,
      date: '2026-10-21',
      currentUserId: 'usr-123',
      appContext: 'personal',
      categoryId: 'cat-salary',
      categoryName: 'Sueldo',
      targetAccountId: 'acc-savings',
      note: 'Nómina quincenal',
    };

    const missingCat = validateMovement({ ...baseValidIncome, categoryId: '' });
    expect(missingCat.valid).toBe(false);
    expect(missingCat.error).toBe('La categoría de ingreso es obligatoria');

    const missingTarget = validateMovement({ ...baseValidIncome, targetAccountId: '' });
    expect(missingTarget.valid).toBe(false);
    expect(missingTarget.error).toBe('La cuenta de destino es obligatoria');

    expect(validateMovement(baseValidIncome).valid).toBe(true);
  });

  it('valida modalidad TRANSFER (rechaza si origen y destino son la misma cuenta)', () => {
    const transferSameAcc = {
      type: 'TRANSFER' as const,
      amount: 300,
      date: '2026-10-21',
      currentUserId: 'usr-123',
      sourceAccountId: 'acc-bank-1',
      targetAccountId: 'acc-bank-1',
    };

    const resSame = validateMovement(transferSameAcc);
    expect(resSame.valid).toBe(false);
    expect(resSame.error).toBe('La cuenta de origen y destino deben ser diferentes');

    const transferDiffAcc = {
      ...transferSameAcc,
      targetAccountId: 'acc-bank-2',
    };
    expect(validateMovement(transferDiffAcc).valid).toBe(true);
  });
});

describe('movementService - buildMovementAction', () => {
  it('construye payload para EXPENSE con flags correctos y nota', () => {
    const action = buildMovementAction({
      type: 'EXPENSE',
      amount: '250.50',
      date: '2026-10-21',
      currentUserId: 'usr-test',
      appContext: 'household',
      categoryId: 'cat-food',
      categoryName: 'Comida',
      sourceAccountId: 'acc-card',
      note: 'Cena aniversario',
    });

    expect(action).toEqual({
      type: 'EXPENSE',
      payload: {
        amount: 250.5,
        categoryId: 'cat-food',
        category: 'Comida',
        sourceAccountId: 'acc-card',
        date: '2026-10-21',
        desc: 'Cena aniversario',
        paidBy: 'usr-test',
        isPrivate: false,
        isShared: true,
        splitType: '50/50',
      },
    });
  });

  it('construye payload para INCOME con contexto personal', () => {
    const action = buildMovementAction({
      type: 'INCOME',
      amount: 1200,
      date: '2026-10-21',
      currentUserId: 'usr-test',
      appContext: 'personal',
      categoryId: 'cat-freelance',
      categoryName: 'Freelance',
      targetAccountId: 'acc-checking',
    });

    expect(action).toEqual({
      type: 'INCOME',
      payload: {
        amount: 1200,
        categoryId: 'cat-freelance',
        accountId: 'acc-checking',
        date: '2026-10-21',
        source: 'Freelance',
        type: 'Freelance',
        userId: 'usr-test',
        isPrivate: true,
        isShared: false,
      },
    });
  });

  it('construye payload para TRANSFER sin exponer categorías contables', () => {
    const action = buildMovementAction({
      type: 'TRANSFER',
      amount: 450,
      date: '2026-10-21',
      currentUserId: 'usr-test',
      appContext: 'household',
      sourceAccountId: 'acc-checking',
      targetAccountId: 'acc-savings',
    });

    expect(action).toEqual({
      type: 'TRANSFER',
      payload: {
        sourceAccountId: 'acc-checking',
        targetAccountId: 'acc-savings',
        amount: 450,
        date: '2026-10-21',
        ownerUid: 'usr-test',
        isShared: true,
      },
    });
  });
});
