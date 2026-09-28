import React, { useState } from 'react';
import { Flame, Snowflake } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { FormatCurrency } from '../utils';
import { proyectarLiquidacion, ordenarAvalancha, ordenarBolaDNieve } from '../services/simuladorService';

export function DebtSimulatorView({ data }) {
  const [strategy, setStrategy] = useState('avalanche');
  const [pagoExtra, setPagoExtra] = useState(1000);
  
  const activeCards = data.cards.filter(c => c.balance > 0).map(c => ({
    id: c.id,
    nombre: c.name,
    saldoActual: c.balance,
    apr: c.interestRate / 100,
    pagoMinimo: c.balance * 0.05 // default 5% minimum payment
  }));
  const sortedDebts = strategy === 'avalanche' ? ordenarAvalancha(activeCards) : ordenarBolaDNieve(activeCards);
  const { meses, totalInteresPagado } = proyectarLiquidacion(sortedDebts, 1000); // 1000 is mock extra payment


  return (
    <div className="space-y-6 animate-in">
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-6 mb-8">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-slate-800">Simulador de Deuda</h2>
          <p className="text-slate-600 mt-2 font-medium">Estrategia para liquidar créditos más rápido.</p>
        </div>
        <div className="flex bg-slate-200/50 p-1.5 rounded-2xl backdrop-blur-sm shadow-inner border border-slate-200">
          <button 
            onClick={() => setStrategy('avalanche')} 
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${strategy === 'avalanche' ? 'bg-white shadow-md text-rose-600 scale-105' : 'text-slate-600 hover:text-slate-700'}`}
          >
            <Flame size={18} className={strategy === 'avalanche' ? 'animate-pulse' : ''} /> Avalancha
          </button>
          <button 
            onClick={() => setStrategy('snowball')} 
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${strategy === 'snowball' ? 'bg-white shadow-md text-blue-600 scale-105' : 'text-slate-600 hover:text-slate-700'}`}
          >
            <Snowflake size={18} className={strategy === 'snowball' ? 'animate-pulse' : ''} /> Bola de Nieve
          </button>
        </div>
      </div>

      <div className="bg-indigo-50 p-4 rounded-xl mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <p className="text-sm text-indigo-800 font-bold mb-1">Pago Extra Mensual</p>
          <div className="flex items-center gap-2">
            <span className="text-indigo-900 font-bold">$</span>
            <input type="number" value={pagoExtra} onChange={(e) => setPagoExtra(Number(e.target.value))} className="bg-white border border-indigo-200 rounded px-2 py-1 text-indigo-900 font-bold w-24" />
          </div>
        </div>
        <div><p className="text-sm text-indigo-800 font-bold">Tiempo estimado</p><p className="text-2xl font-black text-indigo-900">{meses} meses</p></div>
        <div className="text-right"><p className="text-sm text-indigo-800 font-bold">Interés Total</p><p className="text-2xl font-black text-indigo-900">{FormatCurrency(totalInteresPagado)}</p></div>
      </div>
      <div className="space-y-5">
        {sortedDebts.map((debt, idx) => (
          <Card key={debt.id} className="relative overflow-hidden group hover:border-slate-300 transition-colors">
            {idx === 0 && (
              <div className={`absolute left-0 top-0 w-2 h-full transition-colors duration-500 ${strategy === 'avalanche' ? 'bg-gradient-to-b from-rose-400 to-rose-600' : 'bg-gradient-to-b from-blue-400 to-blue-600'}`}></div>
            )}
            <div className="flex justify-between items-center pl-4">
              <div>
                <div className="flex items-center gap-4 mb-2">
                  <h3 className="font-black text-xl text-slate-800 tracking-tight">{debt.nombre}</h3>
                  {idx === 0 && (
                    <span className={`text-[10px] uppercase font-black px-3 py-1 rounded-lg text-white tracking-widest shadow-sm ${strategy === 'avalanche' ? 'bg-rose-500' : 'bg-blue-500'}`}>
                      Objetivo Actual
                    </span>
                  )}
                </div>
                <p className="text-sm font-medium text-slate-600">
                  Tasa de Interés: <span className="font-bold text-rose-500 bg-rose-50 px-2 py-0.5 rounded-md ml-1">{debt.apr * 100}%</span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500 mb-1 uppercase tracking-widest font-bold">Saldo Pendiente</p>
                <p className="text-3xl font-black text-slate-800 tracking-tighter">{FormatCurrency(debt.saldoActual)}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-8 text-xs text-slate-500 text-center px-4">
        <p><strong>Aviso Legal:</strong> Las simulaciones mostradas son proyecciones estimadas y pueden variar según los términos específicos de tus instituciones financieras. Consulta directamente con tu banco para conocer los montos exactos y condiciones vigentes.</p>
      </div>
    </div>
  );
}
