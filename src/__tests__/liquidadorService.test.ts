import { describe, it, expect } from 'vitest';
import {
  calcularProrrateo,
  simplificarDeudas,
  generarCronogramaMsi
} from '../services/liquidadorService';

describe('Liquidador Service', () => {
  it('calcularProrrateo(6000, 4000) debe retornar 0.6', () => {
    expect(calcularProrrateo(6000, 4000)).toBe(0.6);
  });

  it('calcularProrrateo(0, 0) debe retornar 0.5 (fallback equitativo)', () => {
    expect(calcularProrrateo(0, 0)).toBe(0.5);
  });

  it('simplificarDeudas(100, -50) debe indicar que B debe transferir a A', () => {
    const result = simplificarDeudas(100, -50);
    expect(result).toEqual({ deudor: 'B', monto: 75 });
  });

  it('generarCronogramaMsi(1200, 12, new Date("2026-01-01")) debe generar 12 entradas de $100 c/u', () => {
    const startDate = new Date('2026-01-01');
    const result = generarCronogramaMsi(1200, 12, startDate);
    expect(result.length).toBe(12);
    result.forEach((item, index) => {
      expect(item.amount).toBe(100);
      const expectedDate = new Date(startDate);
      expectedDate.setMonth(expectedDate.getMonth() + index + 1);
      expect(item.dueDate.getTime()).toBe(expectedDate.getTime());
    });
  });

  it('simplificarDeudas(50, 50) debe retornar { deudor: null, monto: 0 }', () => {
    const result = simplificarDeudas(50, 50);
    expect(result).toEqual({ deudor: null, monto: 0 });
  });
});
