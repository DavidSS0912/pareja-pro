import { describe, it, expect } from 'vitest';
import { calculateCutoffDateRange } from '../utils/budgetCalculations';
import { validateMovement, buildMovementAction } from '../services/movementService';

describe('Stage 2 - Día de Corte y Movimientos en USD', () => {
  describe('calculateCutoffDateRange', () => {
    it('caso día 1 (mes natural): retorna del día 1 al último día del mes en noviembre', () => {
      // 7 de noviembre de 2026
      const ref = new Date('2026-11-07T12:00:00Z');
      const range = calculateCutoffDateRange(1, ref);
      expect(range.start).toBe('2026-11-01');
      expect(range.end).toBe('2026-11-30');
    });

    it('caso día <= 0: se comporta como mes natural', () => {
      const ref = new Date('2026-05-15T12:00:00Z');
      const range = calculateCutoffDateRange(0, ref);
      expect(range.start).toBe('2026-05-01');
      expect(range.end).toBe('2026-05-31');
    });

    it('caso día 1 en febrero no bisiesto: retorna hasta el 28 de febrero', () => {
      const ref = new Date('2026-02-14T12:00:00Z');
      const range = calculateCutoffDateRange(1, ref);
      expect(range.start).toBe('2026-02-01');
      expect(range.end).toBe('2026-02-28');
    });

    it('caso día 1 en febrero bisiesto (2024): retorna hasta el 29 de febrero', () => {
      const ref = new Date('2024-02-14T12:00:00Z');
      const range = calculateCutoffDateRange(1, ref);
      expect(range.start).toBe('2024-02-01');
      expect(range.end).toBe('2024-02-29');
    });

    it('caso día 21 antes de la fecha de corte (ej. 7 de noviembre con corte 21): 22 oct a 21 nov', () => {
      const ref = new Date('2026-11-07T12:00:00Z');
      const range = calculateCutoffDateRange(21, ref);
      expect(range.start).toBe('2026-10-22');
      expect(range.end).toBe('2026-11-21');
    });

    it('caso día 21 en la fecha exacta de corte (21 de noviembre): 22 oct a 21 nov', () => {
      const ref = new Date('2026-11-21T12:00:00Z');
      const range = calculateCutoffDateRange(21, ref);
      expect(range.start).toBe('2026-10-22');
      expect(range.end).toBe('2026-11-21');
    });

    it('caso día 21 después de la fecha de corte (25 de noviembre con corte 21): 22 nov a 21 dic', () => {
      const ref = new Date('2026-11-25T12:00:00Z');
      const range = calculateCutoffDateRange(21, ref);
      expect(range.start).toBe('2026-11-22');
      expect(range.end).toBe('2026-12-21');
    });

    it('manejo de fin de mes y clamp seguro: corte 31 en mes de 30 días (noviembre)', () => {
      const ref = new Date('2026-11-15T12:00:00Z');
      const range = calculateCutoffDateRange(31, ref);
      expect(range.end).toBe('2026-11-30');
    });

    it('manejo de fin de mes y clamp seguro: corte 30 en mes de febrero (2026)', () => {
      const ref = new Date('2026-02-10T12:00:00Z');
      const range = calculateCutoffDateRange(30, ref);
      expect(range.end).toBe('2026-02-28');
    });
  });

  describe('movementService - Operaciones en USD y Tipo de Cambio', () => {
    it('validateMovement rechaza tipo de cambio menor o igual a cero cuando la moneda es USD', () => {
      const resZero = validateMovement({
        type: 'EXPENSE',
        amount: 100,
        date: '2026-11-07',
        currentUserId: 'uid_1',
        categoryId: 'cat_1',
        sourceAccountId: 'acc_1',
        currency: 'USD',
        exchangeRate: 0,
      });
      expect(resZero.valid).toBe(false);
      expect(resZero.error).toMatch(/tipo de cambio/i);

      const resNegative = validateMovement({
        type: 'EXPENSE',
        amount: 100,
        date: '2026-11-07',
        currentUserId: 'uid_1',
        categoryId: 'cat_1',
        sourceAccountId: 'acc_1',
        currency: 'USD',
        exchangeRate: -5,
      });
      expect(resNegative.valid).toBe(false);

      const resMissing = validateMovement({
        type: 'EXPENSE',
        amount: 100,
        date: '2026-11-07',
        currentUserId: 'uid_1',
        categoryId: 'cat_1',
        sourceAccountId: 'acc_1',
        currency: 'USD',
      });
      expect(resMissing.valid).toBe(false);
    });

    it('buildMovementAction convierte Gasto en USD a Moneda Base y añade metadato auditable', () => {
      const action = buildMovementAction({
        type: 'EXPENSE',
        amount: 100,
        date: '2026-11-07',
        currentUserId: 'uid_1',
        categoryId: 'cat_1',
        categoryName: 'Restaurante',
        sourceAccountId: 'acc_1',
        currency: 'USD',
        exchangeRate: 20.5,
        note: 'Cena con clientes',
      });

      expect(action.type).toBe('EXPENSE');
      if (action.type === 'EXPENSE') {
        expect(action.payload.amount).toBe(2050); // 100 * 20.50
        expect(action.payload.desc).toBe('Cena con clientes [USD $100.00 @ $20.50]');
      }
    });

    it('buildMovementAction convierte Ingreso en USD con centavos exactos y preserva metadatos', () => {
      const action = buildMovementAction({
        type: 'INCOME',
        amount: 50.25,
        date: '2026-11-07',
        currentUserId: 'uid_1',
        categoryId: 'cat_2',
        categoryName: 'Honorarios',
        targetAccountId: 'acc_2',
        currency: 'USD',
        exchangeRate: 19.8,
      });

      expect(action.type).toBe('INCOME');
      if (action.type === 'INCOME') {
        // 50.25 * 19.80 = 994.95
        expect(action.payload.amount).toBe(994.95);
        expect(action.payload.source).toBe('Honorarios [USD $50.25 @ $19.80]');
      }
    });

    it('buildMovementAction convierte Transferencia en USD y añade metadato a la nota', () => {
      const action = buildMovementAction({
        type: 'TRANSFER',
        amount: 75,
        date: '2026-11-07',
        currentUserId: 'uid_1',
        sourceAccountId: 'acc_src',
        targetAccountId: 'acc_tgt',
        currency: 'USD',
        exchangeRate: 20,
        note: 'Envío de remesa',
      });

      expect(action.type).toBe('TRANSFER');
      if (action.type === 'TRANSFER') {
        expect(action.payload.amount).toBe(1500); // 75 * 20
        expect(action.payload.description).toBe('Envío de remesa [USD $75.00 @ $20.00]');
      }
    });

    it('operaciones en Moneda Base (o sin moneda USD) mantienen amount intacto sin alterar notas', () => {
      const action = buildMovementAction({
        type: 'EXPENSE',
        amount: 250,
        date: '2026-11-07',
        currentUserId: 'uid_1',
        categoryId: 'cat_1',
        sourceAccountId: 'acc_1',
        note: 'Supermercado',
      });

      if (action.type === 'EXPENSE') {
        expect(action.payload.amount).toBe(250);
        expect(action.payload.desc).toBe('Supermercado');
      }
    });
  });
});
