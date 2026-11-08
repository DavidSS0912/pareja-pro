import { describe, it, expect } from 'vitest';
import { calculateCumulativeBudget } from '../utils/budgetCalculations';

describe('stage4BudgetDetailAndFunding - Fondeo Real Mensual y Cálculo Acumulativo Sinking Fund', () => {
  it('toma en cuenta el fondeo real del mes activo cuando difiere de la meta asignada ($120 en lugar de $200)', () => {
    const budget = {
      id: 'budget-sinking-1',
      categoryId: 'cat-vacaciones',
      category: 'Vacaciones',
      isCumulative: true,
      initialPeriod: '2026-11',
      period: '2026-11',
      assignedAmount: 200
    };

    const expenses = [
      {
        id: 'exp-1',
        categoryId: 'cat-vacaciones',
        amount: 20,
        date: '2026-11-15',
        isPrivate: false,
        isShared: true
      }
    ];

    // Se registró un fondeo real de $120 en lugar de la meta de $200
    const result = calculateCumulativeBudget({
      budget,
      allExpenses: expenses,
      currentPeriodStart: '2026-11-01',
      currentPeriodEnd: '2026-11-30',
      monthlyAllocation: 200,
      initialPeriod: '2026-11',
      appContext: 'household',
      monthlyFundings: {
        '2026-11': 120
      }
    });

    // Validar que el total asignado refleja el fondeo real ($120) y no la meta nominal ($200)
    expect(result.currentPeriodFunding).toBe(120);
    expect(result.totalAccumulatedAssigned).toBe(120);
    // Saldo acumulado disponible = 120 fondeados - 20 gastados = 100
    expect(result.accumulatedBalance).toBe(100);
    expect(result.currentSpent).toBe(20);
  });

  it('suma correctamente fondeos reales variables a lo largo de varios meses transcurridos', () => {
    const budget = {
      id: 'budget-sinking-2',
      categoryId: 'cat-seguro',
      category: 'Seguro Auto',
      isCumulative: true,
      initialPeriod: '2026-09',
      period: '2026-11',
      assignedAmount: 200
    };

    const expenses = [
      {
        id: 'exp-sep',
        categoryId: 'cat-seguro',
        amount: 30,
        date: '2026-09-20',
        isShared: true
      },
      {
        id: 'exp-nov',
        categoryId: 'cat-seguro',
        amount: 50,
        date: '2026-11-10',
        isShared: true
      }
    ];

    // Fondeos variables: Sep = $120, Oct = $150, Nov = $200 (meta completa)
    // Total fondeado acumulado = 120 + 150 + 200 = 470
    // Total gastado histórico = 30 + 50 = 80
    // Saldo disponible = 470 - 80 = 390
    const result = calculateCumulativeBudget({
      budget,
      allExpenses: expenses,
      currentPeriodStart: '2026-11-01',
      currentPeriodEnd: '2026-11-30',
      monthlyAllocation: 200,
      initialPeriod: '2026-09',
      appContext: 'household',
      monthlyFundings: {
        '2026-09': 120,
        '2026-10': 150,
        '2026-11': 200
      }
    });

    expect(result.elapsedMonths).toBe(3);
    expect(result.currentPeriodFunding).toBe(200);
    expect(result.totalAccumulatedAssigned).toBe(470);
    expect(result.totalHistoricalSpent).toBe(80);
    expect(result.currentSpent).toBe(50);
    expect(result.accumulatedBalance).toBe(390);
  });

  it('si no hay fondeo registrado para un mes previo, usa por defecto la asignación mensual nominal', () => {
    const budget = {
      id: 'budget-sinking-3',
      categoryId: 'cat-mantenimiento',
      category: 'Mantenimiento',
      isCumulative: true,
      initialPeriod: '2026-10',
      period: '2026-11',
      assignedAmount: 200
    };

    // Octubre sin fondeo explícito (asume meta 200), Noviembre fondeado con 120
    // Total fondeado = 200 + 120 = 320
    const result = calculateCumulativeBudget({
      budget,
      allExpenses: [],
      currentPeriodStart: '2026-11-01',
      currentPeriodEnd: '2026-11-30',
      monthlyAllocation: 200,
      initialPeriod: '2026-10',
      appContext: 'household',
      monthlyFundings: {
        '2026-11': 120
      }
    });

    expect(result.elapsedMonths).toBe(2);
    expect(result.totalAccumulatedAssigned).toBe(320);
    expect(result.accumulatedBalance).toBe(320);
  });
});
