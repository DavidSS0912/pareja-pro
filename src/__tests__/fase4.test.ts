import { describe, it, expect } from 'vitest';
import { proyectoAlcanzadoMeta, distribuirEnCascada } from '../services/proyectosService';
import {
  ordenarBolaDNieve,
  ordenarAvalancha,
  proyectarLiquidacion,
  calcularPatrimonio
} from '../services/simuladorService';

const deudas = [
  { id: '1', nombre: 'Tarjeta A', saldoActual: 5000, apr: 0.36, pagoMinimo: 200 },
  { id: '2', nombre: 'Auto',      saldoActual: 80000, apr: 0.12, pagoMinimo: 1500 },
  { id: '3', nombre: 'Tarjeta B', saldoActual: 1200,  apr: 0.24, pagoMinimo: 100 },
];

describe('proyectosService', () => {
  it('detecta que un proyecto alcanzó su meta', () => {
    expect(proyectoAlcanzadoMeta({ id: '1', name: 'test', targetAmount: 1000, currentAmount: 1000, priority: 1, isCompleted: false })).toBe(true);
  });

  it('proyectoAlcanzadoMeta retorna false si no ha llegado', () => {
    expect(proyectoAlcanzadoMeta({ id: '1', name: 'test', targetAmount: 1000, currentAmount: 500, priority: 1, isCompleted: false })).toBe(false);
  });

  it('distribuirEnCascada asigna en orden de prioridad', () => {
    const projects = [
      { id: 'p1', name: 'Fondo', targetAmount: 500, currentAmount: 400, priority: 1, isCompleted: false },
      { id: 'p2', name: 'Enganche', targetAmount: 10000, currentAmount: 0, priority: 2, isCompleted: false },
    ];
    const result = distribuirEnCascada(projects, 300);
    expect(result[0].projectId).toBe('p1');
    expect(result[0].aporte).toBe(100); // solo faltaban 100 para completarlo
    expect(result[1].projectId).toBe('p2');
    expect(result[1].aporte).toBe(200); // el resto va al siguiente
  });
});

describe('simuladorService', () => {
  it('Bola de Nieve ordena por saldo ascendente', () => {
    const ordenadas = ordenarBolaDNieve(deudas);
    expect(ordenadas[0].id).toBe('3'); // saldo 1200 primero
    expect(ordenadas[2].id).toBe('2'); // saldo 80000 último
  });

  it('Avalancha ordena por APR descendente', () => {
    const ordenadas = ordenarAvalancha(deudas);
    expect(ordenadas[0].id).toBe('1'); // APR 36% primero
    expect(ordenadas[2].id).toBe('2'); // APR 12% último
  });

  it('Avalancha paga menos intereses que Bola de Nieve', () => {
    const resultAvalancha = proyectarLiquidacion(ordenarAvalancha(deudas), 1000);
    const resultBola = proyectarLiquidacion(ordenarBolaDNieve(deudas), 1000);
    expect(resultAvalancha.totalInteresPagado).toBeLessThan(resultBola.totalInteresPagado);
  });

  it('calcularPatrimonio suma correctamente', () => {
    expect(calcularPatrimonio(50000, 200000, 100000)).toBe(150000);
  });

  it('calcularPatrimonio retorna negativo con deuda mayor que activos', () => {
    expect(calcularPatrimonio(10000, 0, 50000)).toBe(-40000);
  });
});
