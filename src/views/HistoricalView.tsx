import React from 'react';
import { Card } from '../components/ui/Card';
import { FormatCurrency } from '../utils';
import { SEED_DATA } from '../data';
import { useAppStore } from '../store/useAppStore';
import { Download } from 'lucide-react';

export function HistoricalView({ data }) {
  const expenses = useAppStore(state => state.expenses);
  const snapshots = data.snapshots || SEED_DATA.snapshots || [];
  const maxVal = snapshots.length > 0 ? Math.max(...snapshots.map(s => Math.max(s.income, s.expense))) : 1;

  const handleExportCSV = () => {
    if (!expenses || expenses.length === 0) return;
    const headers = ['id', 'description', 'amount', 'category', 'date', 'paidBy', 'type'];
    const csvContent = [
      headers.join(','),
      ...expenses.map(e => headers.map(h => `"${e[h] || ''}"`).join(','))
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'historial_orbita2.csv';
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const expensesByCategory = React.useMemo(() => {
    const totals = {};
    let totalExpense = 0;
    expenses.forEach(e => {
      const amt = Number(e.amount) || 0;
      const cat = e.category || 'Otros';
      totals[cat] = (totals[cat] || 0) + amt;
      totalExpense += amt;
    });
    return Object.entries(totals)
      .map(([name, amount]) => ({ name, amount, percentage: totalExpense > 0 ? (amount / totalExpense) * 100 : 0 }))
      .sort((a, b) => b.amount - a.amount);
  }, [expenses]);

  return (
    <div className="space-y-6 animate-in">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
        <h2 className="text-3xl font-black tracking-tight text-slate-800">Histórico Anual</h2>
        <p className="text-slate-500 mt-2 font-medium">Comparativa de ingresos vs gastos por mes.</p>
        </div>
        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition shadow-sm"
        >
          <Download className="w-5 h-5" />
          Exportar a CSV
        </button>
      </div>

      <Card className="pt-10 pb-8">
        <div className="flex items-end gap-3 h-72 w-full border-b-2 border-slate-100 pb-3 overflow-x-auto scrollbar-hide px-4">
          {snapshots.map((snap, idx) => {
            const incomeHeight = (snap.income / maxVal) * 100;
            const expenseHeight = (snap.expense / maxVal) * 100;
            const isOver = snap.expense > snap.income;

            return (
              <div key={idx} className="flex-1 flex flex-col justify-end items-center group min-w-[60px] relative cursor-pointer">
                <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:-translate-y-2 text-xs text-center mb-2 bg-slate-900 text-white p-3 rounded-xl whitespace-nowrap absolute bottom-full mb-4 z-10 pointer-events-none shadow-xl border border-slate-700">
                  <div className="font-bold text-slate-300 mb-1 uppercase tracking-widest">{snap.month}</div>
                  <div className="flex justify-between gap-4">
                    <span className="text-emerald-400">In:</span> 
                    <span className="font-mono">{FormatCurrency(snap.income)}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className={isOver ? 'text-rose-400' : 'text-slate-300'}>Out:</span> 
                    <span className="font-mono">{FormatCurrency(snap.expense)}</span>
                  </div>
                  {/* Tooltip arrow */}
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900"></div>
                </div>

                <div className="flex gap-1.5 w-full justify-center items-end h-full">
                  <div 
                    className="w-4 md:w-8 bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-md transition-all duration-700 ease-out group-hover:brightness-110 shadow-sm" 
                    style={{ height: `${incomeHeight}%` }}
                  ></div>
                  <div 
                    className={`w-4 md:w-8 rounded-t-md transition-all duration-700 ease-out group-hover:brightness-110 shadow-sm ${isOver ? 'bg-gradient-to-t from-rose-600 to-rose-400' : 'bg-gradient-to-t from-slate-300 to-slate-200'}`} 
                    style={{ height: `${expenseHeight}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="flex gap-3 w-full mt-4 px-4">
          {snapshots.map((snap, idx) => (
            <div key={idx} className="flex-1 text-center text-sm font-bold text-slate-500 min-w-[60px]">
              {snap.month}
            </div>
          ))}
        </div>

        <div className="flex flex-wrap justify-center gap-6 mt-10 border-t border-slate-100 pt-8">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-sm"></div> 
            <span className="text-sm font-bold text-slate-600">Ingresos</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 shadow-sm"></div> 
            <span className="text-sm font-bold text-slate-600">Gastos Normales</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-gradient-to-br from-rose-400 to-rose-600 shadow-sm"></div> 
            <span className="text-sm font-bold text-slate-600">Mes Sobregirado</span>
          </div>
        </div>
      </Card>

      {expensesByCategory.length > 0 && (
        <Card className="p-6">
          <h3 className="text-xl font-bold text-slate-800 mb-6">Gastos por Categoría</h3>
          <div className="space-y-5">
            {expensesByCategory.map((cat, idx) => (
              <div key={idx}>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-slate-700">{cat.name}</span>
                  <span className="text-slate-500 font-mono text-sm">{FormatCurrency(cat.amount)} ({cat.percentage.toFixed(1)}%)</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3">
                  <div 
                    className="bg-emerald-500 h-3 rounded-full transition-all duration-700"
                    style={{ width: `${cat.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
