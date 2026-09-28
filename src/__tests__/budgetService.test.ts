import { describe, it, expect } from 'vitest';
import { calcularDineroSinAsignar, calcularArrastre, distribuirRemanente } from '../services/budgetService';

describe('budgetService', () => {
  it('calcularDineroSinAsignar retorna la diferencia correcta', () => {
    expect(calcularDineroSinAsignar(10000, 7500)).toBe(2500);
  });

  it('calcularDineroSinAsignar retorna negativo si hay sobreasignación', () => {
    expect(calcularDineroSinAsignar(8000, 10000)).toBe(-2000);
  });

  it('calcularArrastre retorna positivo si hay superávit', () => {
    expect(calcularArrastre(1000, 700)).toBe(300);
  });

  it('calcularArrastre retorna negativo si hay déficit', () => {
    expect(calcularArrastre(500, 650)).toBe(-150);
  });

  it('distribuirRemanente distribuye correctamente con prorrateo 60/40', () => {
    const result = distribuirRemanente(-200, 0.6);
    expect(result.montoUserA).toBe(-120);
    expect(result.montoUserB).toBe(-80);
  });
});
