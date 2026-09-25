import React, { useState } from 'react';
import { Flame, Snowflake } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { FormatCurrency } from '../utils';

export function DebtSimulatorView({ data }) {
  const [strategy, setStrategy] = useState('avalanche');
  
  const sortedDebts = [...data.cards].filter(c => c.balance > 0).sort((a, b) => {
    if (strategy === 'avalanche') return b.interestRate - a.interestRate;
    return a.balance - b.balance;
  });

  return (
    <div className="space-y-6 animate-in">
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-6 mb-8">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-slate-800">Simulador de Deuda</h2>
          <p className="text-slate-500 mt-2 font-medium">Estrategia para liquidar créditos más rápido.</p>
        </div>
        <div className="flex bg-slate-200/50 p-1.5 rounded-2xl backdrop-blur-sm shadow-inner border border-slate-200">
          <button 
            onClick={() => setStrategy('avalanche')} 
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${strategy === 'avalanche' ? 'bg-white shadow-md text-rose-600 scale-105' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Flame size={18} className={strategy === 'avalanche' ? 'animate-pulse' : ''} /> Avalancha
          </button>
          <button 
            onClick={() => setStrategy('snowball')} 
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${strategy === 'snowball' ? 'bg-white shadow-md text-blue-600 scale-105' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Snowflake size={18} className={strategy === 'snowball' ? 'animate-pulse' : ''} /> Bola de Nieve
          </button>
        </div>
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
                  <h3 className="font-black text-xl text-slate-800 tracking-tight">{debt.name}</h3>
                  {idx === 0 && (
                    <span className={`text-[10px] uppercase font-black px-3 py-1 rounded-lg text-white tracking-widest shadow-sm ${strategy === 'avalanche' ? 'bg-rose-500' : 'bg-blue-500'}`}>
                      Objetivo Actual
                    </span>
                  )}
                </div>
                <p className="text-sm font-medium text-slate-500">
                  Tasa de Interés: <span className="font-bold text-rose-500 bg-rose-50 px-2 py-0.5 rounded-md ml-1">{debt.interestRate}%</span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-400 mb-1 uppercase tracking-widest font-bold">Saldo Pendiente</p>
                <p className="text-3xl font-black text-slate-800 tracking-tighter">{FormatCurrency(debt.balance)}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-8 text-xs text-slate-400 text-center px-4">
        <p><strong>Aviso Legal:</strong> Las simulaciones mostradas son proyecciones estimadas y pueden variar según los términos específicos de tus instituciones financieras. Consulta directamente con tu banco para conocer los montos exactos y condiciones vigentes.</p>
      </div>
    </div>
  );
}
