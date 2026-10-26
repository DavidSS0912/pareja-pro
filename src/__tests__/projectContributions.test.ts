import { describe, it, expect } from 'vitest';
import {
  validateProjectTargetAccount,
  calculateProjectContribution,
  type ProjectContributionParams,
  type ProjectContributionPlan
} from '../utils/projectCalculations';

describe('Vinculación de Proyectos a Cuentas Reales y Flujo de Aportaciones (projectCalculations)', () => {
  const mockNuAccount = {
    id: 'acc-nu',
    name: 'Cuenta Nu Débito',
    type: 'ASSET',
    balance: 20000
  };

  const mockBbvaAccount = {
    id: 'acc-bbva',
    name: 'BBVA Nómina',
    type: 'BANK_ACCOUNT',
    balance: 35000
  };

  const mockCreditCard = {
    id: 'acc-tdc',
    name: 'TDC Nu',
    type: 'LIABILITY',
    balance: 5000
  };

  const mockProject = {
    id: 'proj-1',
    name: 'Vacaciones Japón',
    targetAmount: 50000,
    savedAmount: 15000,
    targetAccountId: 'acc-nu',
    targetAccount: 'acc-nu',
    status: 'active'
  };

  describe('1. validateProjectTargetAccount(account)', () => {
    it('valida exitosamente cuentas reales de activo o efectivo (ASSET, BANK_ACCOUNT, CASH)', () => {
      expect(validateProjectTargetAccount(mockNuAccount).isValid).toBe(true);
      expect(validateProjectTargetAccount(mockBbvaAccount).isValid).toBe(true);
      expect(validateProjectTargetAccount({ id: 'acc-cash', name: 'Efectivo', type: 'CASH', balance: 1000 }).isValid).toBe(true);
    });

    it('rechaza cuentas de pasivo / tarjeta de crédito (LIABILITY) como cuenta destino de un proyecto', () => {
      const result = validateProjectTargetAccount(mockCreditCard);
      expect(result.isValid).toBe(false);
      expect(result.error).toMatch(/activo|efectivo|pasivo|crédito/i);
    });

    it('rechaza cuentas nulas o sin identificador', () => {
      expect(validateProjectTargetAccount(null).isValid).toBe(false);
      expect(validateProjectTargetAccount({ name: 'Sin ID' }).isValid).toBe(false);
    });
  });

  describe('2. Aportación con Origen != Destino (Transferencia entre cuentas)', () => {
    it('planifica la transferencia contable interna e incrementa savedAmount del proyecto', () => {
      const params: ProjectContributionParams = {
        project: mockProject,
        sourceAccount: mockBbvaAccount, // Origen: BBVA
        targetAccount: mockNuAccount,   // Destino: Nu
        amount: 5000,
        date: '2026-10-25',
        notes: 'Ahorro quincenal'
      };

      const plan: ProjectContributionPlan = calculateProjectContribution(params);

      expect(plan.isValid).toBe(true);
      expect(plan.isInternalPiggyBank).toBe(false);
      expect(plan.amount).toBe(5000);
      expect(plan.newProjectSavedAmount).toBe(20000); // 15,000 + 5,000
      expect(plan.projectReachedGoal).toBe(false);

      // Transferencia contable planificada
      expect(plan.plannedTransfer).toBeDefined();
      expect(plan.plannedTransfer?.isInternalTransfer).toBe(true);
      expect(plan.plannedTransfer?.sourceAccountId).toBe('acc-bbva');
      expect(plan.plannedTransfer?.targetAccountId).toBe('acc-nu');
      expect(plan.plannedTransfer?.amount).toBe(5000);

      // Trazabilidad de aportación
      expect(plan.contributionRecord).toMatchObject({
        projectId: 'proj-1',
        sourceAccountId: 'acc-bbva',
        targetAccountId: 'acc-nu',
        amount: 5000,
        isInternalPiggyBank: false,
        notes: 'Ahorro quincenal'
      });
    });

    it('rechaza la aportación si el monto excede el saldo de la cuenta origen', () => {
      const params: ProjectContributionParams = {
        project: mockProject,
        sourceAccount: mockBbvaAccount, // Saldo 35,000
        targetAccount: mockNuAccount,
        amount: 40000 // Excede
      };

      const plan = calculateProjectContribution(params);
      expect(plan.isValid).toBe(false);
      expect(plan.error).toMatch(/saldo.*insuficiente/i);
    });
  });

  describe('3. Aportación con Origen == Destino (Apartado / Cajita en la misma cuenta)', () => {
    it('no genera transferencia externa entre dos cuentas distintas e incrementa savedAmount', () => {
      const params: ProjectContributionParams = {
        project: mockProject,
        sourceAccount: mockNuAccount, // Origen: Nu
        targetAccount: mockNuAccount, // Destino: Nu (la misma cuenta)
        amount: 3000
      };

      const plan = calculateProjectContribution(params);

      expect(plan.isValid).toBe(true);
      expect(plan.isInternalPiggyBank).toBe(true);
      expect(plan.plannedTransfer).toBeUndefined(); // No hay transferencia bancaria entre cuentas
      expect(plan.newProjectSavedAmount).toBe(18000); // 15,000 + 3,000
      expect(plan.contributionRecord.isInternalPiggyBank).toBe(true);
    });

    it('valida que el saldo contable disponible descontando otros apartados no resulte sobregirado', () => {
      // Nu tiene saldo contable de $20,000
      // Hay otro proyecto activo que ya tiene apartados $18,000 en Nu -> Disponible real = $2,000
      const existingActiveProjects = [
        { id: 'proj-other', targetAccountId: 'acc-nu', savedAmount: 18000, status: 'active' }
      ];

      const params: ProjectContributionParams = {
        project: mockProject,
        sourceAccount: mockNuAccount,
        targetAccount: mockNuAccount,
        amount: 3000, // Requiere $3,000 pero solo hay $2,000 libres en apartados
        activeProjectsInTargetAccount: existingActiveProjects
      };

      const plan = calculateProjectContribution(params);
      expect(plan.isValid).toBe(false);
      expect(plan.error).toMatch(/saldo.*disponible.*insuficiente|apartado/i);
    });
  });

  describe('4. Detección de meta completada', () => {
    it('detecta correctamente cuando una aportación completa o supera la meta del proyecto', () => {
      const params: ProjectContributionParams = {
        project: { ...mockProject, savedAmount: 48000, targetAmount: 50000 },
        sourceAccount: mockBbvaAccount,
        targetAccount: mockNuAccount,
        amount: 2500 // 48,000 + 2,500 = 50,500 >= 50,000
      };

      const plan = calculateProjectContribution(params);
      expect(plan.isValid).toBe(true);
      expect(plan.newProjectSavedAmount).toBe(50500);
      expect(plan.projectReachedGoal).toBe(true);
    });
  });
});
