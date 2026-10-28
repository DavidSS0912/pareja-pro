import { describe, it, expect } from 'vitest';
import {
  calculateHouseholdIncomeShares,
  calculateBudgetAssignedAmount,
  calculateBudgetSplit,
  type UserIncomeShare,
  type BudgetInput,
  type HouseholdIncomeSharesResult,
  type BudgetAssignedAmountResult,
  type BudgetSplitResult
} from '../utils/budgetCalculations';

describe('Motor Matemático de Presupuestos Híbridos y Reparto de Ingresos (budgetCalculations)', () => {
  const mockUsers = [
    { id: 'user-a', name: 'David', email: 'david@test.com' },
    { id: 'user-b', name: 'Zoé', email: 'zoe@test.com' }
  ];

  describe('1. calculateHouseholdIncomeShares(incomes, users, defaultRatio)', () => {
    it('calcula la suma total de ingresos y la proporción exacta de aportación de cada usuario', () => {
      const incomes = [
        { id: 'inc-1', userId: 'user-a', amount: 30000, date: '2026-10-01' },
        { id: 'inc-2', userId: 'user-b', amount: 20000, date: '2026-10-05' }
      ];

      const result: HouseholdIncomeSharesResult = calculateHouseholdIncomeShares(incomes, mockUsers);

      expect(result.totalIncome).toBe(50000);
      expect(result.isDefaultRatio).toBe(false);
      expect(result.userShares).toHaveLength(2);

      const shareA = result.userShares.find((s) => s.userId === 'user-a')!;
      const shareB = result.userShares.find((s) => s.userId === 'user-b')!;

      expect(shareA.income).toBe(30000);
      expect(shareA.ratio).toBeCloseTo(0.6, 5);
      expect(shareA.percentage).toBeCloseTo(60, 2);

      expect(shareB.income).toBe(20000);
      expect(shareB.ratio).toBeCloseTo(0.4, 5);
      expect(shareB.percentage).toBeCloseTo(40, 2);
    });

    it('soporta ingresos mapeados mediante ownerUid además de userId', () => {
      const incomes = [
        { id: 'inc-1', ownerUid: 'user-a', amount: 15000 },
        { id: 'inc-2', ownerUid: 'user-b', amount: 35000 }
      ];

      const result = calculateHouseholdIncomeShares(incomes, mockUsers);

      expect(result.totalIncome).toBe(50000);
      const shareA = result.userShares.find((s) => s.userId === 'user-a')!;
      const shareB = result.userShares.find((s) => s.userId === 'user-b')!;

      expect(shareA.ratio).toBeCloseTo(0.3, 5);
      expect(shareB.ratio).toBeCloseTo(0.7, 5);
    });

    it('si un usuario no tiene ingresos registrados en el periodo, su ratio es 0 y el otro 1', () => {
      const incomes = [
        { id: 'inc-1', userId: 'user-a', amount: 25000 }
      ];

      const result = calculateHouseholdIncomeShares(incomes, mockUsers);

      expect(result.totalIncome).toBe(25000);
      const shareA = result.userShares.find((s) => s.userId === 'user-a')!;
      const shareB = result.userShares.find((s) => s.userId === 'user-b')!;

      expect(shareA.income).toBe(25000);
      expect(shareA.ratio).toBe(1);
      expect(shareA.percentage).toBe(100);

      expect(shareB.income).toBe(0);
      expect(shareB.ratio).toBe(0);
      expect(shareB.percentage).toBe(0);
    });

    it('si no hay ingresos (totalIncome === 0), aplica defaultRatio equitativo 50/50 por defecto', () => {
      const incomes: any[] = [];

      const result = calculateHouseholdIncomeShares(incomes, mockUsers);

      expect(result.totalIncome).toBe(0);
      expect(result.isDefaultRatio).toBe(true);

      const shareA = result.userShares.find((s) => s.userId === 'user-a')!;
      const shareB = result.userShares.find((s) => s.userId === 'user-b')!;

      expect(shareA.ratio).toBe(0.5);
      expect(shareA.percentage).toBe(50);
      expect(shareB.ratio).toBe(0.5);
      expect(shareB.percentage).toBe(50);
    });

    it('si no hay ingresos y se pasa un defaultRatio personalizado, respeta dicho ratio', () => {
      const incomes: any[] = [];
      const customDefaultRatio = {
        'user-a': 0.7,
        'user-b': 0.3
      };

      const result = calculateHouseholdIncomeShares(incomes, mockUsers, customDefaultRatio);

      expect(result.totalIncome).toBe(0);
      expect(result.isDefaultRatio).toBe(true);

      const shareA = result.userShares.find((s) => s.userId === 'user-a')!;
      const shareB = result.userShares.find((s) => s.userId === 'user-b')!;

      expect(shareA.ratio).toBeCloseTo(0.7, 5);
      expect(shareA.percentage).toBeCloseTo(70, 2);
      expect(shareB.ratio).toBeCloseTo(0.3, 5);
      expect(shareB.percentage).toBeCloseTo(30, 2);
    });

    it('maneja con solidez nulos, valores indefinidos o montos no numéricos en incomes', () => {
      const incomes = [
        null,
        undefined,
        { id: '1', userId: 'user-a', amount: 'not-a-number' as any },
        { id: '2', userId: 'user-a', amount: -500 }, // Ignora o sanea montos negativos
        { id: '3', userId: 'user-b', amount: 10000 }
      ];

      const result = calculateHouseholdIncomeShares(incomes as any, mockUsers);

      expect(result.totalIncome).toBe(10000);
      const shareA = result.userShares.find((s) => s.userId === 'user-a')!;
      const shareB = result.userShares.find((s) => s.userId === 'user-b')!;

      expect(shareA.ratio).toBe(0);
      expect(shareB.ratio).toBe(1);
    });
  });

  describe('2. calculateBudgetAssignedAmount(budget, totalIncome, totalFixedBudgets)', () => {
    it('en modo PERCENTAGE, calcula Asignado = (percentage / 100) * totalIncome', () => {
      const budget: BudgetInput = {
        id: 'b-1',
        name: 'Supermercado',
        mode: 'PERCENTAGE',
        percentage: 20
      };

      const totalIncome = 60000;
      const result: BudgetAssignedAmountResult = calculateBudgetAssignedAmount(budget, totalIncome);

      expect(result.mode).toBe('PERCENTAGE');
      expect(result.assignedAmount).toBe(12000); // 20% de 60,000
      expect(result.fundingProgress).toBe(100);
      expect(result.isFullyFunded).toBe(true);
      expect(result.deficit).toBe(0);
    });

    it('en modo PERCENTAGE con ingresos 0, asigna 0 sin fallar por división', () => {
      const budget: BudgetInput = {
        id: 'b-1',
        mode: 'PERCENTAGE',
        percentage: 15
      };

      const result = calculateBudgetAssignedAmount(budget, 0);

      expect(result.assignedAmount).toBe(0);
      expect(result.fundingProgress).toBe(0);
      expect(result.isFullyFunded).toBe(true);
    });

    it('en modo FIXED, Asignado = fixedAmount y calcula fundingProgress según totalFixedBudgets', () => {
      const budget: BudgetInput = {
        id: 'b-2',
        name: 'Renta',
        mode: 'FIXED',
        fixedAmount: 18000
      };

      // Si los ingresos totales cubren con creces todos los presupuestos fijos requeridos
      const totalIncome = 40000;
      const totalFixedBudgets = 20000; // total de compromisos fijos del hogar

      const result = calculateBudgetAssignedAmount(budget, totalIncome, totalFixedBudgets);

      expect(result.mode).toBe('FIXED');
      expect(result.assignedAmount).toBe(18000);
      expect(result.fundingProgress).toBe(100);
      expect(result.isFullyFunded).toBe(true);
      expect(result.deficit).toBe(0);
      expect(result.coveredAmount).toBe(18000);
    });

    it('en modo FIXED con déficit de ingresos, calcula el progreso parcial y déficit de cobertura', () => {
      const budget: BudgetInput = {
        id: 'b-2',
        name: 'Renta',
        mode: 'FIXED',
        fixedAmount: 10000
      };

      // Ingresos totales son la mitad del total de fijos
      const totalIncome = 15000;
      const totalFixedBudgets = 30000; // 50% de liquidez para compromisos fijos

      const result = calculateBudgetAssignedAmount(budget, totalIncome, totalFixedBudgets);

      expect(result.assignedAmount).toBe(10000);
      expect(result.fundingProgress).toBeCloseTo(50, 2); // 50% cubierto
      expect(result.isFullyFunded).toBe(false);
      expect(result.coveredAmount).toBe(5000); // 50% de 10,000
      expect(result.deficit).toBe(5000); // Faltan 5,000
    });

    it('en modo FIXED si totalIncome es 0, fundingProgress es 0 y deficit es el total', () => {
      const budget: BudgetInput = {
        id: 'b-2',
        mode: 'FIXED',
        fixedAmount: 8000
      };

      const result = calculateBudgetAssignedAmount(budget, 0, 16000);

      expect(result.assignedAmount).toBe(8000);
      expect(result.fundingProgress).toBe(0);
      expect(result.isFullyFunded).toBe(false);
      expect(result.coveredAmount).toBe(0);
      expect(result.deficit).toBe(8000);
    });

    it('acepta campos heredados (base o assignedAmount) si fixedAmount no viene definido', () => {
      const budget: BudgetInput = {
        id: 'b-legacy',
        mode: 'FIXED',
        base: 7500
      };

      const result = calculateBudgetAssignedAmount(budget, 20000, 20000);

      expect(result.assignedAmount).toBe(7500);
      expect(result.isFullyFunded).toBe(true);
    });
  });

  describe('3. calculateBudgetSplit(assignedAmount, userShares, manualFixedContribution)', () => {
    const userShares: UserIncomeShare[] = [
      { userId: 'user-a', userName: 'David', income: 30000, ratio: 0.6, percentage: 60 },
      { userId: 'user-b', userName: 'Zoé', income: 20000, ratio: 0.4, percentage: 40 }
    ];

    it('realiza el reparto proporcional estándar cuando no hay aportación fija manual', () => {
      const assignedAmount = 10000;

      const result: BudgetSplitResult = calculateBudgetSplit(assignedAmount, userShares);

      expect(result.assignedAmount).toBe(10000);
      expect(result.totalSplit).toBe(10000);
      expect(result.hasManualContribution).toBe(false);

      const splitA = result.splits.find((s) => s.userId === 'user-a')!;
      const splitB = result.splits.find((s) => s.userId === 'user-b')!;

      expect(splitA.contribution).toBe(6000);
      expect(splitA.isManual).toBe(false);

      expect(splitB.contribution).toBe(4000);
      expect(splitB.isManual).toBe(false);
    });

    it('ajuste manual: si el usuario A fija una aportación manual F_A, el usuario B cubre max(0, Asignado - F_A)', () => {
      const assignedAmount = 10000;
      // David fija manualmente que aportará $3,500
      const manualContribution = {
        userId: 'user-a',
        amount: 3500
      };

      const result = calculateBudgetSplit(assignedAmount, userShares, manualContribution);

      expect(result.hasManualContribution).toBe(true);
      expect(result.totalSplit).toBe(10000);

      const splitA = result.splits.find((s) => s.userId === 'user-a')!;
      const splitB = result.splits.find((s) => s.userId === 'user-b')!;

      expect(splitA.contribution).toBe(3500);
      expect(splitA.isManual).toBe(true);

      // Zoé cubre automáticamente el resto: 10,000 - 3,500 = 6,500
      expect(splitB.contribution).toBe(6500);
      expect(splitB.isManual).toBe(false);
    });

    it('si la aportación fija manual supera el monto total asignado, se limita al 100% y el otro usuario aporta 0', () => {
      const assignedAmount = 5000;
      // David fija $7,000 para un presupuesto de $5,000
      const manualContribution = {
        userId: 'user-a',
        amount: 7000
      };

      const result = calculateBudgetSplit(assignedAmount, userShares, manualContribution);

      expect(result.totalSplit).toBe(5000);

      const splitA = result.splits.find((s) => s.userId === 'user-a')!;
      const splitB = result.splits.find((s) => s.userId === 'user-b')!;

      expect(splitA.contribution).toBe(5000);
      expect(splitB.contribution).toBe(0);
    });

    it('si la aportación fija manual es 0, el otro usuario cubre el 100% del monto asignado', () => {
      const assignedAmount = 4000;
      const manualContribution = {
        userId: 'user-a',
        amount: 0
      };

      const result = calculateBudgetSplit(assignedAmount, userShares, manualContribution);

      expect(result.totalSplit).toBe(4000);

      const splitA = result.splits.find((s) => s.userId === 'user-a')!;
      const splitB = result.splits.find((s) => s.userId === 'user-b')!;

      expect(splitA.contribution).toBe(0);
      expect(splitB.contribution).toBe(4000);
    });

    it('garantiza precisión exacta de centavos sin discrepancias por coma flotante', () => {
      // Reparto de $1,000 con tercios (1/3 y 2/3)
      const thirdsShares: UserIncomeShare[] = [
        { userId: 'user-a', userName: 'David', income: 10, ratio: 1 / 3, percentage: 33.3333 },
        { userId: 'user-b', userName: 'Zoé', income: 20, ratio: 2 / 3, percentage: 66.6667 }
      ];

      const assignedAmount = 1000;
      const result = calculateBudgetSplit(assignedAmount, thirdsShares);

      expect(result.totalSplit).toBe(1000);

      const sum = result.splits.reduce((acc, s) => acc + s.contribution, 0);
      expect(sum).toBe(1000);
    });
  });
});
