export interface Deuda {
  id: string;
  nombre: string;
  saldoActual: number;
  apr: number;         // Tasa Anual (ej. 0.24 = 24%)
  pagoMinimo: number;
}

export interface PasoSimulacion {
  mes: number;
  deudasRestantes: Deuda[];
  pagoTotal: number;
}

// Estrategia Bola de Nieve: ordena por saldo ascendente (victorias rápidas)
export function ordenarBolaDNieve(deudas: Deuda[]): Deuda[] {
  return [...deudas].sort((a, b) => a.saldoActual - b.saldoActual);
}

// Estrategia Avalancha: ordena por APR descendente (minimiza intereses)
export function ordenarAvalancha(deudas: Deuda[]): Deuda[] {
  return [...deudas].sort((a, b) => b.apr - a.apr);
}

// Proyecta cuántos meses faltan para liquidar todas las deudas
// pagoExtra: flujo de caja libre adicional más allá de los pagos mínimos
export function proyectarLiquidacion(
  deudasOrdenadas: Deuda[],
  pagoExtra: number
): { meses: number; totalInteresPagado: number } {
  let deudas = deudasOrdenadas.map(d => ({ ...d }));
  let mes = 0;
  let totalInteres = 0;
  const MAX_MESES = 600; // límite de seguridad: 50 años

  while (deudas.some(d => d.saldoActual > 0) && mes < MAX_MESES) {
    mes++;
    let extraDisponible = pagoExtra;

    for (const deuda of deudas) {
      if (deuda.saldoActual <= 0) continue;

      // Aplicar interés mensual
      const interesMes = parseFloat(
        (deuda.saldoActual * (deuda.apr / 12)).toFixed(2)
      );
      totalInteres += interesMes;
      deuda.saldoActual += interesMes;

      // Pago mínimo
      const pagoMensual = Math.min(deuda.pagoMinimo, deuda.saldoActual);
      deuda.saldoActual = parseFloat((deuda.saldoActual - pagoMensual).toFixed(2));
    }

    // Aplicar pago extra a la primera deuda activa (en el orden dado)
    for (const deuda of deudas) {
      if (deuda.saldoActual <= 0 || extraDisponible <= 0) continue;
      const pagoE = Math.min(extraDisponible, deuda.saldoActual);
      deuda.saldoActual = parseFloat((deuda.saldoActual - pagoE).toFixed(2));
      extraDisponible -= pagoE;
    }

    // Limpiar deudas saldadas
    deudas = deudas.map(d => ({
      ...d,
      saldoActual: Math.max(0, d.saldoActual)
    }));
  }

  return { meses: mes, totalInteresPagado: parseFloat(totalInteres.toFixed(2)) };
}

// Calcula Patrimonio Neto
export function calcularPatrimonio(
  activosLiquidos: number,
  activosExternos: number,
  pasivos: number
): number {
  return parseFloat((activosLiquidos + activosExternos - pasivos).toFixed(2));
}
