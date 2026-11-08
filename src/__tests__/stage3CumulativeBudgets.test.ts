import { describe, it, expect } from 'vitest';
import { calculateCumulativeBudget } from '../utils/budgetCalculations';

describe('Stage 3 - Presupuestos Acumulativos / Rollover y Saldo a Favor', () => {
  const sampleExpenses = [
    // Gastos compartidos de la categoría cat_viajes en meses anteriores y actual
    { id: 'exp_1', categoryId: 'cat_viajes', amount: 150, date: '2026-06-10', isPrivate: false, ownerUid: 'user_a' },
    { id: 'exp_2', categoryId: 'cat_viajes', amount: 200, date: '2026-08-15', isPrivate: false, ownerUid: 'user_b' },
    { id: 'exp_3', categoryId: 'cat_viajes', amount: 100, date: '2026-11-05', isPrivate: false, ownerUid: 'user_a' }, // Gasto del periodo actual (nov)
    // Gasto privado del mismo cat_viajes (debe ser ignorado en contexto household)
    { id: 'exp_priv', categoryId: 'cat_viajes', amount: 300, date: '2026-09-12', isPrivate: true, ownerUid: 'user_a' },
    // Gasto de otra categoría (debe ser ignorado)
    { id: 'exp_other', categoryId: 'cat_comida', amount: 500, date: '2026-11-02', isPrivate: false, ownerUid: 'user_a' },
  ];

  it('calcula saldo acumulado a favor en presupuesto acumulativo (ej. $200 x 6 meses = $1,200 asignado - $450 gastado = $750 saldo)', () => {
    // Presupuesto de viajes iniciado en junio 2026 y evaluado en noviembre 2026 (6 meses: jun, jul, ago, sep, oct, nov)
    const budget = {
      id: 'b_viajes',
      categoryId: 'cat_viajes',
      category: 'Viajes',
      period: '2026-11-01',
      initialPeriod: '2026-06-01',
      assignedAmount: 200,
      isCumulative: true,
      ownerType: 'SHARED',
    };

    const res = calculateCumulativeBudget({
      budget,
      allExpenses: sampleExpenses,
      currentPeriodStart: '2026-11-01',
      currentPeriodEnd: '2026-11-30',
      monthlyAllocation: 200,
      initialPeriod: '2026-06-01',
      appContext: 'household',
    });

    expect(res.elapsedMonths).toBe(6);
    expect(res.totalAccumulatedAssigned).toBe(1200); // 200 * 6
    expect(res.currentSpent).toBe(100);             // Solo exp_3 en noviembre
    expect(res.totalHistoricalSpent).toBe(450);      // 150 + 200 + 100 = 450 (ignora exp_priv de 300)
    expect(res.accumulatedBalance).toBe(750);        // 1200 - 450 = 750 disponible a favor
  });

  it('un presupuesto no acumulativo (isCumulative: false) no acumula meses previos y evalúa solo el periodo activo', () => {
    const budget = {
      id: 'b_comida',
      categoryId: 'cat_viajes',
      category: 'Viajes',
      period: '2026-11-01',
      initialPeriod: '2026-06-01',
      assignedAmount: 200,
      isCumulative: false,
      ownerType: 'SHARED',
    };

    const res = calculateCumulativeBudget({
      budget,
      allExpenses: sampleExpenses,
      currentPeriodStart: '2026-11-01',
      currentPeriodEnd: '2026-11-30',
      monthlyAllocation: 200,
      initialPeriod: '2026-06-01',
      appContext: 'household',
    });

    expect(res.elapsedMonths).toBe(1);
    expect(res.totalAccumulatedAssigned).toBe(200);
    expect(res.currentSpent).toBe(100);
    expect(res.accumulatedBalance).toBe(100); // 200 - 100 = 100
  });

  it('aislamiento estricto de contexto: en household NO suma gastos privados', () => {
    const budget = {
      id: 'b_viajes',
      categoryId: 'cat_viajes',
      isCumulative: true,
      assignedAmount: 500,
      initialPeriod: '2026-11-01',
      period: '2026-11-01',
    };

    const res = calculateCumulativeBudget({
      budget,
      allExpenses: [
        { id: '1', categoryId: 'cat_viajes', amount: 100, date: '2026-11-10', isPrivate: false, ownerUid: 'user_a' },
        { id: '2', categoryId: 'cat_viajes', amount: 300, date: '2026-11-12', isPrivate: true, ownerUid: 'user_a' },
      ],
      currentPeriodStart: '2026-11-01',
      currentPeriodEnd: '2026-11-30',
      monthlyAllocation: 500,
      appContext: 'household',
    });

    // En household solo debe sumar el gasto no privado (100)
    expect(res.currentSpent).toBe(100);
    expect(res.totalHistoricalSpent).toBe(100);
    expect(res.accumulatedBalance).toBe(400); // 500 - 100
  });

  it('aislamiento estricto de contexto: en personal NO suma gastos compartidos ni de otros usuarios', () => {
    const budget = {
      id: 'b_personal',
      categoryId: 'cat_tech',
      isCumulative: true,
      assignedAmount: 300,
      initialPeriod: '2026-10-01',
      period: '2026-11-01',
    };

    const res = calculateCumulativeBudget({
      budget,
      allExpenses: [
        { id: '1', categoryId: 'cat_tech', amount: 80, date: '2026-10-15', isPrivate: true, ownerUid: 'user_a' },
        { id: '2', categoryId: 'cat_tech', amount: 90, date: '2026-10-20', isPrivate: true, ownerUid: 'user_b' }, // Usuario ajeno
        { id: '3', categoryId: 'cat_tech', amount: 120, date: '2026-11-05', isPrivate: false, ownerUid: 'user_a' }, // Gasto compartido
        { id: '4', categoryId: 'cat_tech', amount: 50, date: '2026-11-12', isPrivate: true, ownerUid: 'user_a' }, // Gasto personal propio periodo activo
      ],
      currentPeriodStart: '2026-11-01',
      currentPeriodEnd: '2026-11-30',
      monthlyAllocation: 300,
      initialPeriod: '2026-10-01',
      appContext: 'personal',
      activeUserId: 'user_a',
    });

    // Meses: oct y nov = 2 meses -> 300 * 2 = 600
    expect(res.elapsedMonths).toBe(2);
    expect(res.totalAccumulatedAssigned).toBe(600);
    // Gastos propios de user_a privados: exp 1 (80) y exp 4 (50) -> total 130
    expect(res.currentSpent).toBe(50);
    expect(res.totalHistoricalSpent).toBe(130);
    expect(res.accumulatedBalance).toBe(470); // 600 - 130
  });
});
