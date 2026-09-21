import React from 'react';
import { Card } from './ui/Card';
import { Calendar } from 'lucide-react';
import { FormatCurrency } from '../utils';

export function PaymentCalendar({ expenses = [] }) {
  // Generamos algunas fechas próximas de ejemplo para visualizar el calendario
  const upcoming = expenses.slice(0, 4).map((exp, i) => {
    const d = new Date();
    d.setDate(d.getDate() + (i * 2 + 1));
    return {
      id: exp.id || i,
      desc: exp.desc,
      date: d,
      amount: exp.amount,
      currency: exp.currency || 'MXN'
    };
  });

  return (
    <Card>
      <h2 className="text-lg font-bold mb-6 flex items-center gap-3">
        <div className="bg-blue-100 p-2 rounded-xl text-blue-600">
          <Calendar size={20} />
        </div>
        Calendario de Pagos (Próximos)
      </h2>
      
      <div className="space-y-4">
        {upcoming.length === 0 ? (
          <p className="text-sm text-slate-500">No hay pagos próximos registrados.</p>
        ) : (
          upcoming.map((payment) => (
            <div key={payment.id} className="flex justify-between items-center p-4 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 flex flex-col items-center justify-center min-w-[60px]">
                  <span className="text-xs text-slate-400 font-bold uppercase">
                    {payment.date.toLocaleString('es-MX', { month: 'short' })}
                  </span>
                  <span className="text-lg text-slate-800 font-black">
                    {payment.date.getDate()}
                  </span>
                </div>
                <div>
                  <p className="font-bold text-slate-800">{payment.desc}</p>
                  <p className="text-xs text-slate-500">Recordatorio / Recurrente</p>
                </div>
              </div>
              <span className="font-black text-slate-800">
                {FormatCurrency(payment.amount)} <span className="text-xs font-normal text-slate-500">{payment.currency}</span>
              </span>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
