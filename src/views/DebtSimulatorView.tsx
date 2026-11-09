import React, { useState } from 'react';
import { Flame, Snowflake, AlertCircle } from 'lucide-react';
import { FormatCurrency } from '../utils';
import { proyectarLiquidacion, ordenarAvalancha, ordenarBolaDNieve } from '../services/simuladorService';

export function DebtSimulatorView({ data }: { data: any }) {
  const [strategy, setStrategy] = useState<'avalanche' | 'snowball'>('avalanche');
  const [pagoExtra, setPagoExtra] = useState(1000);
  
  const activeCards = (data?.accounts || [])
    .filter((c: any) => (c.type === 'LIABILITY' || c.type === 'CREDIT_CARD') && Number(c.balance || 0) > 0)
    .map((c: any) => ({
      id: c.id,
      nombre: c.name,
      saldoActual: Number(c.balance || 0),
      apr: (Number(c.interestRate) || 0) / 100,
      pagoMinimo: Number(c.balance || 0) * 0.05 // default 5% minimum payment
    }));
  const sortedDebts = strategy === 'avalanche' ? ordenarAvalancha(activeCards) : ordenarBolaDNieve(activeCards);
  const { meses, totalInteresPagado } = proyectarLiquidacion(sortedDebts, pagoExtra);

  return (
    <div className="space-y-6 animate-in">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-2">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">Simulador de Deuda</h2>
          <p className="text-slate-500 mt-1 font-medium text-sm">Estrategia para liquidar tus créditos de manera óptima y pagar menos intereses.</p>
        </div>
        <div className="inline-flex bg-[#F5F6FA] border border-[#EEF0F4] rounded-full p-1.5 shadow-sm self-start sm:self-auto">
          <button 
            type="button"
            onClick={() => setStrategy('avalanche')} 
            className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
              strategy === 'avalanche' 
                ? 'bg-[#111319] text-white shadow-sm' 
                : 'text-[#8C93A6] hover:text-slate-900'
            }`}
          >
            <Flame size={14} className={strategy === 'avalanche' ? 'text-amber-400' : ''} /> 
            <span>Avalancha (Mayor Interés)</span>
          </button>
          <button 
            type="button"
            onClick={() => setStrategy('snowball')} 
            className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
              strategy === 'snowball' 
                ? 'bg-[#111319] text-white shadow-sm' 
                : 'text-[#8C93A6] hover:text-slate-900'
            }`}
          >
            <Snowflake size={14} className={strategy === 'snowball' ? 'text-blue-400' : ''} /> 
            <span>Bola de Nieve (Menor Saldo)</span>
          </button>
        </div>
      </div>

      {/* Panel de Métricas / Configuración Bento */}
      <div className="bg-white border border-[#EEF0F4] rounded-3xl p-6 shadow-bento grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">Pago Extra Mensual</span>
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-bold text-sm">$</span>
            <input 
              type="number" 
              value={pagoExtra} 
              onChange={(e) => setPagoExtra(Math.max(0, Number(e.target.value)))} 
              className="bg-[#F5F6FA] border border-[#EEF0F4] focus:border-[#111319] focus:outline-none rounded-xl px-3 py-2 text-slate-900 font-bold w-36 text-sm tabular-nums transition-colors" 
            />
          </div>
        </div>
        <div className="md:border-l md:border-[#EEF0F4] md:pl-6">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Tiempo Estimado</span>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight tabular-nums">
            {meses} <span className="text-sm font-semibold text-slate-500">meses</span>
          </p>
        </div>
        <div className="md:border-l md:border-[#EEF0F4] md:pl-6">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Interés Total Proyectado</span>
          <p className="text-2xl sm:text-3xl font-black text-[#F97316] tracking-tight tabular-nums">
            {FormatCurrency(totalInteresPagado)}
          </p>
        </div>
      </div>

      {/* Lista de Deudas Ordenadas */}
      <div className="space-y-4">
        {sortedDebts.length === 0 ? (
          <div className="bg-white border border-[#EEF0F4] rounded-3xl p-12 text-center shadow-bento">
            <div className="w-12 h-12 rounded-2xl bg-[#E8F8F0] text-[#10B981] flex items-center justify-center mx-auto mb-3">
              <AlertCircle size={24} />
            </div>
            <p className="text-base font-bold text-slate-900">¡Sin deudas activas registradas!</p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              No tienes cuentas de tipo pasivo o tarjetas de crédito con saldo pendiente mayor a cero.
            </p>
          </div>
        ) : (
          sortedDebts.map((debt, idx) => (
            <div 
              key={debt.id} 
              className="bg-white border border-[#EEF0F4] hover:border-slate-300 rounded-3xl p-6 shadow-bento transition-colors relative overflow-hidden flex flex-col sm:flex-row justify-between sm:items-center gap-4"
            >
              {idx === 0 && (
                <div className={`absolute left-0 top-0 w-1.5 h-full ${strategy === 'avalanche' ? 'bg-[#F97316]' : 'bg-[#6366F1]'}`}></div>
              )}
              <div className="pl-2">
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <h3 className="font-bold text-lg text-slate-900 tracking-tight">{debt.nombre}</h3>
                  {idx === 0 && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#E8F8F0] text-[#10B981] border border-[#10B981]/20">
                      Objetivo Prioritario
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span>Tasa anual (APR):</span>
                  <span className="font-semibold text-[#F97316] bg-[#FDEFEA] px-2 py-0.5 rounded-full tabular-nums text-xs">
                    {(debt.apr * 100).toFixed(1)}%
                  </span>
                  <span>•</span>
                  <span>Pago mín. est.: <strong className="font-semibold text-slate-700 tabular-nums">{FormatCurrency(debt.pagoMinimo)}</strong></span>
                </div>
              </div>
              <div className="text-left sm:text-right pl-2 sm:pl-0">
                <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold block mb-0.5">Saldo Pendiente</span>
                <p className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight tabular-nums">
                  {FormatCurrency(debt.saldoActual)}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-8 text-xs text-slate-400 text-center px-4">
        <p><strong>Aviso Legal:</strong> Las simulaciones mostradas son proyecciones estimadas y pueden variar según los términos específicos de tus instituciones financieras. Consulta directamente con tu banco para conocer los montos exactos y condiciones vigentes.</p>
      </div>
    </div>
  );
}
