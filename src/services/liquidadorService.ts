export function calcularProrrateo(ingresoA: number, ingresoB: number): number {
  if (ingresoA + ingresoB === 0) return 0.5;
  return ingresoA / (ingresoA + ingresoB);
}

export function simplificarDeudas(
  saldoNetoPagador: number,
  saldoNetoReceptor: number
): { deudor: 'A' | 'B' | null; monto: number } {
  const neto = saldoNetoPagador - saldoNetoReceptor;
  if (Math.abs(neto) < 0.01) return { deudor: null, monto: 0 };
  return {
    deudor: neto < 0 ? 'A' : 'B',
    monto: Math.abs(neto) / 2
  };
}

export function generarCronogramaMsi(
  totalAmount: number,
  months: number,
  startDate: Date
): Array<{ dueDate: Date; amount: number }> {
  const cuota = totalAmount / months;
  return Array.from({ length: months }, (_, i) => {
    const dueDate = new Date(startDate);
    dueDate.setMonth(dueDate.getMonth() + i + 1);
    return { dueDate, amount: parseFloat(cuota.toFixed(2)) };
  });
}
