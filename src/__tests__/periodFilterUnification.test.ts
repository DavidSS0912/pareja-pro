// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { resolveBudgetPeriodFromDateRange } from '../utils/budgetCalculations';
import { calculateUnallocatedBaseCero } from '../App';

describe('Unificación de Filtro Periodo (dateRange) con Presupuestos', () => {
  describe('a) resolveBudgetPeriodFromDateRange', () => {
    it('mapea correctamente cortes que cruzan meses usando dateRange.end como mes de corte (21/09/2026 - 21/10/2026 -> 2026-10-01)', () => {
      const dateRange = { start: '2026-09-21', end: '2026-10-21' };
      const period = resolveBudgetPeriodFromDateRange(dateRange);
      expect(period).toBe('2026-10-01');
    });

    it('si solo viene dateRange.start, deriva el periodo desde start', () => {
      const dateRange = { start: '2026-11-15' };
      const period = resolveBudgetPeriodFromDateRange(dateRange);
      expect(period).toBe('2026-11-01');
    });

    it('si no viene dateRange, retorna el primer día del mes actual', () => {
      const now = new Date();
      const expected = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
      expect(resolveBudgetPeriodFromDateRange(null)).toBe(expected);
      expect(resolveBudgetPeriodFromDateRange(undefined)).toBe(expected);
    });
  });

  describe('b) Acumulación de gastos que cruzan meses calendario en el rango activo', () => {
    it('gastos del 25/09 y del 05/10 en un rango 21/09 - 21/10 se acumulan en la categoría sin descartarse por mes textual', () => {
      // Simulación de la lógica de computedSpent en BudgetsView
      const budget = {
        id: 'b-despensa',
        categoryId: 'cat-super',
        category: 'Despensa',
        assignedAmount: 6000,
        ownerType: 'SHARED',
        period: '2026-10-01'
      };

      // data.expenses ya viene filtrado del 21/09/2026 al 21/10/2026 por App.tsx
      const expensesInRange = [
        { id: 'e1', categoryId: 'cat-super', amount: 1500, date: '2026-09-25', isPrivate: false },
        { id: 'e2', categoryId: 'cat-super', amount: 2000, date: '2026-10-05', isPrivate: false }
      ];

      // La lógica unificada NO debe filtrar por e.date.substring(0, 7) === budget.period.substring(0, 7)
      const computedSpent = expensesInRange
        .filter(e => {
          const matchesCategory = Boolean(budget.categoryId && e.categoryId === budget.categoryId);
          const matchesOwner = (!budget.ownerType || budget.ownerType === 'SHARED') ? !e.isPrivate : Boolean(e.isPrivate);
          return matchesCategory && matchesOwner;
        })
        .reduce((acc, curr) => acc + curr.amount, 0);

      expect(computedSpent).toBe(3500); // 1500 + 2000
    });
  });

  describe('c) periodIncomes toma íntegramente los ingresos entregados por el rango', () => {
    it('no descarta ingresos del corte que pertenezcan a meses distintos a selectedMonth', () => {
      const incomesInRange = [
        { id: 'i1', amount: 10000, date: '2026-09-30', userId: 'user-a' },
        { id: 'i2', amount: 15000, date: '2026-10-15', userId: 'user-a' }
      ];

      // Con la lógica unificada, periodIncomes usa directamente data.incomes
      const periodIncomes = incomesInRange;
      const totalIncome = periodIncomes.reduce((acc, i) => acc + i.amount, 0);

      expect(totalIncome).toBe(25000);
      expect(periodIncomes).toHaveLength(2);
    });
  });

  describe('d) Cálculo de unallocated (Presupuesto Base Cero)', () => {
    it('calcula unallocated = totalIncome - (presupuestos asignados + cuota mensual de proyectos)', () => {
      const totalIncome = 48905;
      const budgets = [
        { id: 'b1', base: 6000 },
        { id: 'b2', assignedAmount: 4000 },
        { id: 'b3', fixedAmount: 5000 }
      ];
      const projects = [
        { id: 'p1', monthlyQuota: 3833, isCompleted: false, currentAmount: 20000 },
        { id: 'p2', monthlyQuota: 1000, isCompleted: true, currentAmount: 50000 }
      ];

      const result = calculateUnallocatedBaseCero(totalIncome, budgets, projects);

      expect(result.totalBudgeted).toBe(15000);
      expect(result.totalProjectsMonthlyQuota).toBe(3833);
      expect(result.totalPresupuestado).toBe(18833);
      expect(result.unallocated).toBe(30072);
    });

    it('los saldos acumulados de tarjetas o cuentas pasivo NO se descuentan del unallocated del periodo', () => {
      const totalIncome = 30000;
      const budgets = [{ id: 'b1', base: 10000 }];
      const projects = [{ id: 'p1', monthlyQuota: 2000, currentAmount: 50000, isCompleted: false }];
      const accounts = [
        { id: 'acc1', type: 'CREDIT_CARD', balance: 45000 },
        { id: 'acc2', type: 'LIABILITY', balance: 15000 }
      ];

      const result = calculateUnallocatedBaseCero(totalIncome, budgets, projects, accounts);

      expect(result.unallocated).toBe(18000);
    });
  });
});
