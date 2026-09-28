import { createService } from './baseService';
export const budgetService = createService('budgets');

import { calcularProrrateo } from './liquidadorService';

// Calcula el dinero libre no asignado a ningún presupuesto
export function calcularDineroSinAsignar(
  totalIncome: number,
  totalAssigned: number
): number {
  return parseFloat((totalIncome - totalAssigned).toFixed(2));
}

// Calcula el arrastre (remanente) de un presupuesto cerrado
export function calcularArrastre(
  assignedAmount: number,
  gastadoReal: number
): number {
  return parseFloat((assignedAmount - gastadoReal).toFixed(2));
}

// Distribuye un remanente negativo compartido entre dos usuarios según prorrateo
export function distribuirRemanente(
  remanente: number,
  prorataFactor: number
): { montoUserA: number; montoUserB: number } {
  const montoA = parseFloat((remanente * prorataFactor).toFixed(2));
  const montoB = parseFloat((remanente * (1 - prorataFactor)).toFixed(2));
  return { montoUserA: montoA, montoUserB: montoB };
}
