import { describe, it, expect } from 'vitest';
import {
  calculateAccountAvailableBalance,
  calculateCreditCardMetrics,
  calculateLiquidWealth,
} from '../utils/walletCalculations';

describe('walletCalculations - Motor de Cálculos de Billetera (Tarea 2.1)', () => {
  describe('a) calculateAccountAvailableBalance(account, activeProjects)', () => {
    it('calcula Saldo Disponible = Saldo Contable - Saldo en Apartados (proyectos activos vinculados)', () => {
      const account = {
        id: 'acc-debito-bbva',
        name: 'BBVA Nómina',
        type: 'ASSET',
        balance: 25000,
      };

      const activeProjects = [
        {
          id: 'proj-1',
          name: 'Fondo de Emergencia',
          targetAccountId: 'acc-debito-bbva',
          savedAmount: 5000,
          status: 'active',
          isCompleted: false,
        },
        {
          id: 'proj-2',
          name: 'Vacaciones Japón',
          targetAccountId: 'acc-debito-bbva',
          savedAmount: 3500,
          status: 'active',
          isCompleted: false,
        },
        {
          id: 'proj-3',
          name: 'Auto Nuevo (otra cuenta)',
          targetAccountId: 'acc-otra-cuenta',
          savedAmount: 10000,
          status: 'active',
          isCompleted: false,
        },
      ];

      const result = calculateAccountAvailableBalance(account, activeProjects);

      expect(result.ledgerBalance).toBe(25000);
      expect(result.allocatedBalance).toBe(8500); // 5000 + 3500
      expect(result.availableBalance).toBe(16500); // 25000 - 8500
    });

    it('si no hay proyectos vinculados, Saldo Disponible = Saldo Contable y Apartados = 0', () => {
      const account = {
        id: 'acc-efectivo',
        name: 'Efectivo',
        type: 'ASSET',
        balance: 4200,
      };

      const result = calculateAccountAvailableBalance(account, []);

      expect(result.ledgerBalance).toBe(4200);
      expect(result.allocatedBalance).toBe(0);
      expect(result.availableBalance).toBe(4200);
    });

    it('ignora proyectos completados o inactivos', () => {
      const account = {
        id: 'acc-ahorro',
        name: 'Ahorro Santander',
        type: 'ASSET',
        balance: 10000,
      };

      const projects = [
        {
          id: 'proj-completado',
          name: 'Meta cumplida',
          targetAccountId: 'acc-ahorro',
          savedAmount: 4000,
          status: 'completed',
          isCompleted: true,
        },
        {
          id: 'proj-activo',
          name: 'Meta en curso',
          targetAccountId: 'acc-ahorro',
          savedAmount: 2000,
          status: 'active',
          isCompleted: false,
        },
      ];

      const result = calculateAccountAvailableBalance(account, projects);

      expect(result.allocatedBalance).toBe(2000);
      expect(result.availableBalance).toBe(8000);
    });

    it('refleja el monto real si los apartados superan el saldo contable (déficit real)', () => {
      const account = {
        id: 'acc-sobregirada',
        name: 'Cuenta con retiro no previsto',
        type: 'ASSET',
        balance: 2000,
      };

      const projects = [
        {
          id: 'proj-apartado-grande',
          name: 'Renta comprometida',
          targetAccountId: 'acc-sobregirada',
          savedAmount: 5000,
          status: 'active',
          isCompleted: false,
        },
      ];

      const result = calculateAccountAvailableBalance(account, projects);

      expect(result.ledgerBalance).toBe(2000);
      expect(result.allocatedBalance).toBe(5000);
      // Saldo en Apartados nunca vuelve negativo el Disponible sin reflejar el monto real (-3000)
      expect(result.availableBalance).toBe(-3000);
    });

    it('maneja de forma segura valores nulos o indefinidos', () => {
      const result = calculateAccountAvailableBalance(null, null);
      expect(result.ledgerBalance).toBe(0);
      expect(result.allocatedBalance).toBe(0);
      expect(result.availableBalance).toBe(0);
    });
  });

  describe('b) calculateCreditCardMetrics(account)', () => {
    it('si balance > 0 (deuda): Deuda Actual = balance, Saldo a favor = 0, Crédito Disponible y % utilización correctos', () => {
      const account = {
        id: 'card-oro',
        name: 'Tarjeta Oro BBVA',
        type: 'LIABILITY',
        balance: 3500,
        creditLimit: 10000,
      };

      const metrics = calculateCreditCardMetrics(account);

      expect(metrics.currentDebt).toBe(3500);
      expect(metrics.positiveBalance).toBe(0);
      expect(metrics.creditAvailable).toBe(6500); // 10000 - 3500
      expect(metrics.utilizationPercentage).toBe(35); // (3500 / 10000) * 100
    });

    it('si balance < 0 (saldo a favor): Deuda Actual = 0, Saldo a favor = |balance|', () => {
      const account = {
        id: 'card-platino',
        name: 'Tarjeta Platino con pago de más',
        type: 'LIABILITY',
        balance: -1250,
        creditLimit: 15000,
      };

      const metrics = calculateCreditCardMetrics(account);

      expect(metrics.currentDebt).toBe(0);
      expect(metrics.positiveBalance).toBe(1250);
      // Crédito Disponible = max(0, creditLimit - max(0, balance))
      expect(metrics.creditAvailable).toBe(15000); // max(0, 15000 - 0)
      expect(metrics.utilizationPercentage).toBe(0);
    });

    it('si la deuda supera el límite de crédito (sobregiro), clamp de Crédito Disponible a 0 y % a 100', () => {
      const account = {
        id: 'card-tope',
        name: 'Tarjeta al tope',
        type: 'LIABILITY',
        balance: 12000,
        creditLimit: 10000,
      };

      const metrics = calculateCreditCardMetrics(account);

      expect(metrics.currentDebt).toBe(12000);
      expect(metrics.positiveBalance).toBe(0);
      expect(metrics.creditAvailable).toBe(0); // max(0, 10000 - 12000) = 0
      expect(metrics.utilizationPercentage).toBe(100); // clamp a 100
    });

    it('maneja límite 0 o no definido de forma segura sin división por cero ni NaN', () => {
      const accountSinLimite = {
        id: 'card-sin-limite',
        name: 'Tarjeta sin límite registrado',
        type: 'LIABILITY',
        balance: 500,
        creditLimit: 0,
      };

      const metrics = calculateCreditCardMetrics(accountSinLimite);

      expect(metrics.currentDebt).toBe(500);
      expect(metrics.positiveBalance).toBe(0);
      expect(metrics.creditAvailable).toBe(0);
      expect(metrics.utilizationPercentage).toBe(0); // No NaN ni Infinity
      expect(Number.isFinite(metrics.utilizationPercentage)).toBe(true);
    });

    it('maneja cuenta nula de forma segura', () => {
      const metrics = calculateCreditCardMetrics(null);

      expect(metrics.currentDebt).toBe(0);
      expect(metrics.positiveBalance).toBe(0);
      expect(metrics.creditAvailable).toBe(0);
      expect(metrics.utilizationPercentage).toBe(0);
    });
  });

  describe('c) calculateLiquidWealth(accounts, activeProjects)', () => {
    it('Patrimonio Líquido = (Total ASSET: Disponible + Apartados) - (Total Deuda Tarjetas LIABILITY: balance > 0)', () => {
      const accounts = [
        { id: 'acc-1', name: 'BBVA Débito', type: 'ASSET', balance: 15000 },
        { id: 'acc-2', name: 'Santander Nómina', type: 'BANK_ACCOUNT', balance: 5000 },
        { id: 'acc-3', name: 'Tarjeta Crédito Nu', type: 'LIABILITY', balance: 4000 },
        { id: 'acc-4', name: 'Tarjeta Crédito Oro', type: 'CREDIT_CARD', balance: 2000 },
      ];

      const activeProjects = [
        { id: 'p1', targetAccountId: 'acc-1', savedAmount: 3000, status: 'active' },
      ];

      const wealth = calculateLiquidWealth(accounts, activeProjects);

      // Total en Débito/Efectivo ASSET: Disponible (12000 + 5000) + Apartados (3000) = 20000
      expect(wealth.totalLiquidAssets).toBe(20000);
      // Total Deuda en Tarjetas: 4000 + 2000 = 6000
      expect(wealth.totalCreditDebt).toBe(6000);
      // Patrimonio Líquido = 20000 - 6000 = 14000
      expect(wealth.liquidWealth).toBe(14000);
    });

    it('tarjetas con saldo a favor (balance < 0) no aumentan deuda ni distorsionan el patrimonio líquido', () => {
      const accounts = [
        { id: 'acc-debito', name: 'Débito', type: 'ASSET', balance: 10000 },
        { id: 'card-deuda', name: 'TDC Deuda', type: 'LIABILITY', balance: 3000 },
        { id: 'card-a-favor', name: 'TDC Saldo a Favor', type: 'LIABILITY', balance: -1500 },
      ];

      const wealth = calculateLiquidWealth(accounts, []);

      expect(wealth.totalLiquidAssets).toBe(10000);
      // Solo la tarjeta con balance > 0 cuenta como deuda: 3000
      expect(wealth.totalCreditDebt).toBe(3000);
      // Patrimonio Líquido = 10000 - 3000 = 7000
      expect(wealth.liquidWealth).toBe(7000);
    });

    it('maneja listas vacías o nulas retornando 0 de forma determinista', () => {
      const wealth = calculateLiquidWealth(null, null);

      expect(wealth.totalLiquidAssets).toBe(0);
      expect(wealth.totalCreditDebt).toBe(0);
      expect(wealth.liquidWealth).toBe(0);
    });
  });
});
