import { describe, it, expect } from 'vitest';
import { calcularLiquidacionHogar } from '../services/liquidadorService';

describe('calcularLiquidacionHogar - Liquidación en Pareja (Opción Estricta)', () => {
  const users = [
    { id: 'user-david', name: 'David SZ', memberSlot: 'USER_A' },
    { id: 'user-zoe', name: 'Zoé Acosta', memberSlot: 'USER_B' }
  ];

  it('gasto 50/50 de $200 pagado por A genera que B debe exactamente $100 (sin doble división)', () => {
    const expenses = [
      { id: 'exp-1', amount: 200, paidBy: 'user-david', splitType: '50/50', isPrivate: false }
    ];
    const incomes: any[] = [];

    const result = calcularLiquidacionHogar({ users, expenses, incomes });

    expect(result.bOwesA).toBe(100);
    expect(result.aOwesB).toBe(0);
    expect(result.netSettlement).toBe(100);
    expect(result.settlementAmount).toBe(100);
    expect(result.simplifiedDebt).toEqual({ deudor: 'B', monto: 100 });
  });

  it('gasto proporcional de $1,000 con ingresos $29,905 (A) y $19,000 (B) genera deuda exacta para B sin doble división', () => {
    const incomes = [
      { id: 'inc-1', userId: 'user-david', amount: 29905, isPrivate: false },
      { id: 'inc-2', userId: 'user-zoe', amount: 19000, isPrivate: false }
    ];
    const expenses = [
      { id: 'exp-prop', amount: 1000, paidBy: 'user-david', splitType: 'proporcional', isPrivate: false }
    ];

    const result = calcularLiquidacionHogar({ users, expenses, incomes });

    // ratioA = 29905 / 48905 = 0.6114916...
    // ratioB = 19000 / 48905 = 0.3885083...
    // bOwesA = 1000 * ratioB = 388.5083... -> ~388.51
    expect(result.incomesByUser['user-david']).toBe(29905);
    expect(result.incomesByUser['user-zoe']).toBe(19000);
    expect(result.bOwesA).toBeCloseTo(388.51, 1);
    expect(result.aOwesB).toBe(0);
    expect(result.settlementAmount).toBeCloseTo(388.51, 1);
    expect(result.simplifiedDebt.deudor).toBe('B');
    expect(result.simplifiedDebt.monto).toBeCloseTo(388.51, 1);
  });

  it('gasto individual compartido pagado por A o B genera $0 de deuda a la contraparte', () => {
    const expenses = [
      { id: 'exp-ind-a', amount: 500, paidBy: 'user-david', splitType: 'individual', isPrivate: false },
      { id: 'exp-ind-b', amount: 300, paidBy: 'user-zoe', splitType: 'individual', isPrivate: false }
    ];
    const incomes: any[] = [];

    const result = calcularLiquidacionHogar({ users, expenses, incomes });

    expect(result.bOwesA).toBe(0);
    expect(result.aOwesB).toBe(0);
    expect(result.netSettlement).toBe(0);
    expect(result.settlementAmount).toBe(0);
    expect(result.simplifiedDebt).toEqual({ deudor: null, monto: 0 });
  });

  it('gastos o ingresos con isPrivate: true quedan excluidos del prorrateo y de la liquidación', () => {
    const incomes = [
      { id: 'inc-pub', userId: 'user-david', amount: 10000, isPrivate: false },
      { id: 'inc-priv', userId: 'user-zoe', amount: 50000, isPrivate: true } // Debe ignorarse
    ];
    const expenses = [
      { id: 'exp-priv', amount: 800, paidBy: 'user-david', splitType: '50/50', isPrivate: true }, // Debe ignorarse
      { id: 'exp-pub', amount: 200, paidBy: 'user-david', splitType: '50/50', isPrivate: false }
    ];

    const result = calcularLiquidacionHogar({ users, expenses, incomes });

    expect(result.incomesByUser['user-david']).toBe(10000);
    expect(result.incomesByUser['user-zoe']).toBe(0); // Ingreso privado ignorado
    expect(result.bOwesA).toBe(100); // Solo el gasto público de $200 genera $100
    expect(result.settlementAmount).toBe(100);
    expect(result.simplifiedDebt).toEqual({ deudor: 'B', monto: 100 });
  });

  it('prorrateo estricto: si B tiene $0 en el rango y A tiene $29,905, ratioB es 0 y gasto proporcional pagado por A genera $0 a B', () => {
    const incomes = [
      { id: 'inc-a', userId: 'user-david', amount: 29905, isPrivate: false }
      // user-zoe no tiene ingresos en el rango activo
    ];
    const expenses = [
      { id: 'exp-prop', amount: 1000, paidBy: 'user-david', splitType: 'proporcional', isPrivate: false }
    ];

    const result = calcularLiquidacionHogar({ users, expenses, incomes });

    expect(result.incomesByUser['user-david']).toBe(29905);
    expect(result.incomesByUser['user-zoe']).toBe(0);
    expect(result.bOwesA).toBe(0); // 1000 * 0 = 0
    expect(result.settlementAmount).toBe(0);
    expect(result.simplifiedDebt).toEqual({ deudor: null, monto: 0 });
  });
});
