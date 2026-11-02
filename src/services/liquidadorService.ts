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

export interface LiquidacionHogarParams {
  users: Array<{ id: string; memberSlot?: string; [key: string]: any }>;
  expenses: Array<{
    amount: number;
    currency?: string;
    paidBy?: string;
    userId?: string;
    ownerUid?: string;
    splitType?: string;
    isPrivate?: boolean;
    [key: string]: any;
  }>;
  incomes: Array<{
    amount: number;
    currency?: string;
    userId?: string;
    ownerUid?: string;
    isPrivate?: boolean;
    [key: string]: any;
  }>;
  normalize?: (amount: number, currency?: string) => number;
}

export interface LiquidacionHogarResult {
  bOwesA: number;
  aOwesB: number;
  netSettlement: number;
  settlementAmount: number;
  simplifiedDebt: { deudor: 'A' | 'B' | null; monto: number };
  incomesByUser: Record<string, number>;
}

export function calcularLiquidacionHogar({
  users = [],
  expenses = [],
  incomes = [],
  normalize = (amount: number) => amount
}: LiquidacionHogarParams): LiquidacionHogarResult {
  const norm = normalize || ((amount: number) => amount);

  // Inicializar incomesByUser para todos los usuarios conocidos
  const incomesByUser: Record<string, number> = {};
  users.forEach((u) => {
    if (u.id) incomesByUser[u.id] = 0;
  });

  // a) Sumar incomesByUser únicamente con ingresos públicos del rango (!inc.isPrivate)
  incomes.forEach((inc) => {
    if (inc.isPrivate) return;
    const uid = inc.userId || inc.ownerUid;
    if (uid) {
      incomesByUser[uid] = (incomesByUser[uid] || 0) + norm(inc.amount, inc.currency);
    }
  });

  const isSingleUser = (users?.length || 0) < 2;
  const userA = users.find((u: any) => u.memberSlot === 'USER_A') || users[0];
  const userB = users.find((u: any) => u.memberSlot === 'USER_B') || users[1];
  const userAId = userA?.id || 'u1';
  const userBId = userB?.id || 'u2';

  if (isSingleUser) {
    return {
      bOwesA: 0,
      aOwesB: 0,
      netSettlement: 0,
      settlementAmount: 0,
      simplifiedDebt: { deudor: null, monto: 0 },
      incomesByUser
    };
  }

  let bOwesA = 0;
  let aOwesB = 0;

  expenses.forEach((exp) => {
    // b) Si exp.isPrivate, ignorar el gasto
    if (exp.isPrivate) return;

    // c) Si exp.splitType === 'individual', no genera deuda cruzada entre miembros
    if (exp.splitType === 'individual') return;

    const normalizedAmount = norm(exp.amount, exp.currency);

    // e) Si exp.splitType === '50/50' (o default), ratioA = 0.5, ratioB = 0.5
    let ratioA = 0.5;
    let ratioB = 0.5;

    // d) Si exp.splitType === 'proporcional', ratioA = calcularProrrateo(incA, incB) usando estrictamente incA e incB del rango activo
    if (exp.splitType === 'proporcional') {
      const incA = incomesByUser[userAId] || 0;
      const incB = incomesByUser[userBId] || 0;
      ratioA = calcularProrrateo(incA, incB);
      ratioB = 1 - ratioA;
    }

    // f) Acumular bOwesA += normalizedAmount * ratioB cuando paga A y aOwesB += normalizedAmount * ratioA cuando paga B
    const payer = exp.paidBy || exp.userId || exp.ownerUid;
    if (payer === userAId || payer === 'u1') {
      bOwesA += normalizedAmount * ratioB;
    } else if (payer === userBId || payer === 'u2') {
      aOwesB += normalizedAmount * ratioA;
    }
  });

  // g) Calcular deuda neta real sin dividir entre 2 por segunda vez
  const rawNet = bOwesA - aOwesB;
  const netSettlement = parseFloat(rawNet.toFixed(2));
  const absNet = Math.abs(netSettlement);

  const simplifiedDebt: { deudor: 'A' | 'B' | null; monto: number } =
    absNet < 0.01
      ? { deudor: null, monto: 0 }
      : {
          deudor: netSettlement > 0 ? 'B' : 'A',
          monto: parseFloat(absNet.toFixed(2))
        };

  const settlementAmount = simplifiedDebt.monto;

  return {
    bOwesA: parseFloat(bOwesA.toFixed(2)),
    aOwesB: parseFloat(aOwesB.toFixed(2)),
    netSettlement,
    settlementAmount,
    simplifiedDebt,
    incomesByUser
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
