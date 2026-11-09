import React, { useMemo } from 'react';
import { Card } from './ui/Card';
import { Calendar } from 'lucide-react';
import { FormatCurrency } from '../utils';

export function PaymentCalendar({ expenses = [], accounts = [] }: any) {
  const upcoming = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcomingList: any[] = [];

    // 1. MSI: Already stored as future expenses
    const msiExpenses = expenses.filter((e: any) => e.isMsi && new Date(e.date) >= today);
    msiExpenses.forEach((exp: any) => {
      upcomingList.push({
        id: `msi-${exp.id}`,
        desc: `${exp.description || exp.category} (MSI ${exp.msiMonthNumber || '?'})`,
        date: new Date(exp.date),
        amount: exp.amount,
        currency: exp.currency || 'MXN',
        type: 'MSI'
      });
    });

    // 2. Gastos Recurrentes: Proyectar la próxima fecha
    const recurringExpenses = expenses.filter((e: any) => e.isRecurring && e.recurringFrequency);
    
    // Solo tomamos el último registro de cada recurrente usando la misma descripción/categoria
    // Para simplificar, proyectamos a partir de la fecha del gasto guardado.
    recurringExpenses.forEach((exp: any) => {
      let nextDate = new Date(exp.date);
      // Avanzar la fecha hasta que sea mayor o igual a hoy
      while (nextDate < today) {
        if (exp.recurringFrequency === 'SEMANAL') {
          nextDate.setDate(nextDate.getDate() + 7);
        } else if (exp.recurringFrequency === 'QUINCENAL') {
          nextDate.setDate(nextDate.getDate() + 15);
        } else if (exp.recurringFrequency === 'MENSUAL') {
          nextDate.setMonth(nextDate.getMonth() + 1);
        } else if (exp.recurringFrequency === 'ANUAL') {
          nextDate.setFullYear(nextDate.getFullYear() + 1);
        } else {
          break; // Fallback
        }
      }
      
      // Si la proyectó dentro de los próximos 30 días, lo agregamos
      const daysDiff = (nextDate.getTime() - today.getTime()) / (1000 * 3600 * 24);
      if (daysDiff <= 30) {
        upcomingList.push({
          id: `rec-${exp.id}`,
          desc: exp.description || exp.category,
          date: nextDate,
          amount: exp.amount,
          currency: exp.currency || 'MXN',
          type: `Recurrente (${exp.recurringFrequency.toLowerCase()})`
        });
      }
    });

    // 3. Tarjetas de Crédito
    const creditCards = accounts.filter((a: any) => a.type === 'LIABILITY' && a.paymentDay);
    creditCards.forEach((card: any) => {
      // Calcular la fecha de pago de este mes o del próximo
      let paymentDate = new Date(today.getFullYear(), today.getMonth(), card.paymentDay);
      if (paymentDate < today) {
        paymentDate.setMonth(paymentDate.getMonth() + 1); // Ya pasó este mes
      }
      
      const daysDiff = (paymentDate.getTime() - today.getTime()) / (1000 * 3600 * 24);
      if (daysDiff <= 30) {
        upcomingList.push({
          id: `tc-${card.id}-${paymentDate.getMonth()}`,
          desc: `Pago Tarjeta: ${card.name}`,
          date: paymentDate,
          amount: 0, // No sabemos el pago para no fallar
          currency: 'MXN',
          type: 'Tarjeta de Crédito',
          isCreditCard: true
        });
      }
    });

    // Ordenar por fecha próxima
    return upcomingList.sort((a, b) => a.date.getTime() - b.date.getTime()).slice(0, 5);
  }, [expenses, accounts]);

  return (
    <Card>
      <h2 className="text-lg font-bold mb-6 flex items-center gap-3 text-slate-900">
        <div className="p-2.5 rounded-2xl bg-[#EEF2FF] text-[#6366F1]">
          <Calendar size={20} />
        </div>
        Calendario de Pagos (Próximos 30 días)
      </h2>
      
      <div className="space-y-3">
        {upcoming.length === 0 ? (
          <p className="text-sm text-slate-400">No hay pagos próximos registrados.</p>
        ) : (
          upcoming.map((payment) => (
            <div key={payment.id} className="p-3.5 bg-[#F8FAFC] border border-[#EEF0F4] rounded-2xl hover:border-slate-300 transition-all flex justify-between items-center">
              <div className="flex items-center gap-3.5">
                <div className="bg-white p-2 rounded-xl border border-[#EEF0F4] flex flex-col items-center justify-center min-w-[56px]">
                  <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                    {payment.date.toLocaleString('es-MX', { month: 'short' })}
                  </span>
                  <span className="text-lg text-slate-900 font-bold tabular-nums leading-tight">
                    {payment.date.getDate()}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-slate-900 text-sm">{payment.desc}</p>
                  <p className="text-xs font-medium text-[#6366F1]">{payment.type}</p>
                </div>
              </div>
              <span className="font-bold text-slate-900 text-right tabular-nums text-sm">
                {payment.isCreditCard ? (
                  <span className="text-xs text-slate-400 font-normal">Revisar estado<br/>de cuenta</span>
                ) : (
                  <>
                    {FormatCurrency(payment.amount)} <span className="text-xs font-normal text-slate-400">{payment.currency}</span>
                  </>
                )}
              </span>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
