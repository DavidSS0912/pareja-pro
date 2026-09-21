import React, { useState, useMemo } from 'react';
import { 
  Home, 
  CreditCard, 
  PieChart, 
  ArrowRightLeft, 
  Wallet,
  BarChart3,
  Landmark,
  Flame
} from 'lucide-react';

import { useAppStore } from './store/useAppStore';
import { DashboardView } from './views/DashboardView';
import { BudgetsView } from './views/BudgetsView';
import { CardsView } from './views/CardsView';
import { SettlementView } from './views/SettlementView';
import { DebtSimulatorView } from './views/DebtSimulatorView';
import { WealthView } from './views/WealthView';
import { HistoricalView } from './views/HistoricalView';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const data = useAppStore(); const methods = data;

  const calc = useMemo(() => {
    const totalIncome = data.incomes.reduce((acc, curr) => acc + curr.amount, 0);
    
    let zoeOwesDavid = 0;
    let davidOwesZoe = 0;
    data.expenses.forEach(exp => {
      if (exp.split === 50) {
        if (exp.paidBy === 'u1') zoeOwesDavid += exp.amount / 2;
        if (exp.paidBy === 'u2') davidOwesZoe += exp.amount / 2;
      }
    });
    const netSettlement = zoeOwesDavid - davidOwesZoe;

    const totalBudgeted = data.budgets.reduce((acc, curr) => acc + curr.base, 0);
    const unallocated = totalIncome - totalBudgeted;

    const needs = data.budgets.filter(b => b.type === 'Necesidad').reduce((acc, curr) => acc + curr.base, 0);
    const wants = data.budgets.filter(b => b.type === 'Deseo').reduce((acc, curr) => acc + curr.base, 0);
    const savings = data.budgets.filter(b => b.type === 'Ahorro').reduce((acc, curr) => acc + curr.base, 0);

    const totalAssets = data.assets.reduce((acc, curr) => acc + curr.value, 0);
    const totalLiabilities = data.cards.reduce((acc, curr) => acc + curr.balance, 0);
    const netWorth = totalAssets - totalLiabilities;

    return {
      totalIncome, unallocated, 
      netSettlement, settlementAmount: Math.abs(netSettlement),
      needsPct: (needs / totalIncome) * 100,
      wantsPct: (wants / totalIncome) * 100,
      savingsPct: (savings / totalIncome) * 100,
      totalAssets, totalLiabilities, netWorth
    };
  }, [data]);

  const renderTab = () => {
    switch (activeTab) {
      case 'dashboard': return <DashboardView data={data} calc={calc} methods={methods} />;
      case 'budgets': return <BudgetsView data={data} methods={methods} />;
      case 'cards': return <CardsView data={data} methods={methods} />;
      case 'settlement': return <SettlementView data={data} calc={calc} methods={methods} />;
      case 'debts': return <DebtSimulatorView data={data} />;
      case 'wealth': return <WealthView data={data} calc={calc} methods={methods} />;
      case 'historical': return <HistoricalView data={data} />;
      default: return <DashboardView data={data} calc={calc} methods={methods} />;
    }
  };

  const navItems = [
    { id: 'dashboard', icon: <Home size={20} />, label: 'Resumen' },
    { id: 'budgets', icon: <PieChart size={20} />, label: 'Rollover' },
    { id: 'cards', icon: <CreditCard size={20} />, label: 'Tarjetas' },
    { id: 'settlement', icon: <ArrowRightLeft size={20} />, label: 'Cuentas' },
    { id: 'debts', icon: <Flame size={20} />, label: 'Simulador' },
    { id: 'wealth', icon: <Landmark size={20} />, label: 'Patrimonio' },
    { id: 'historical', icon: <BarChart3 size={20} />, label: 'Histórico' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-24 md:pb-0 md:pl-72 relative">
      {/* Background gradients for premium feel */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-teal-100/40 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-100/40 rounded-full blur-[120px]"></div>
      </div>

      <nav className="fixed bottom-0 w-full bg-white/80 backdrop-blur-xl border-t border-slate-200/50 flex overflow-x-auto scrollbar-hide p-3 md:flex-col md:justify-start md:w-72 md:h-full md:left-0 md:top-0 md:border-r md:border-t-0 md:p-6 z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.03)] md:shadow-[10px_0_40px_rgba(0,0,0,0.03)] transition-all">
        <div className="hidden md:flex mb-12 items-center gap-3 px-2">
          <div className="bg-gradient-to-br from-emerald-400 to-teal-600 p-2.5 rounded-2xl text-white shadow-lg shadow-emerald-200">
            <Wallet size={24}/>
          </div>
          <h1 className="text-2xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-emerald-700 to-teal-700">ParejaPro</h1>
        </div>
        
        <div className="flex md:flex-col gap-2 w-full min-w-max">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col md:flex-row items-center gap-1 md:gap-4 p-2.5 md:px-5 md:py-4 rounded-2xl transition-all duration-300 flex-1 md:flex-none relative overflow-hidden group ${
                activeTab === item.id 
                  ? 'text-emerald-700 font-bold shadow-sm bg-emerald-50 md:bg-emerald-50 border border-emerald-100' 
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/50 border border-transparent'
              }`}
            >
              {activeTab === item.id && (
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-100/0 via-emerald-100/50 to-emerald-100/0 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              )}
              <div className={`relative z-10 transition-transform duration-300 ${activeTab === item.id ? 'scale-110' : 'group-hover:scale-110'}`}>
                {item.icon}
              </div>
              <span className="text-[10px] md:text-[15px] whitespace-nowrap relative z-10 tracking-tight">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      <main className="p-4 md:p-10 max-w-5xl mx-auto space-y-6 relative z-10">
        <div className="md:hidden flex items-center gap-3 mb-8 bg-white/80 backdrop-blur-md p-4 rounded-3xl shadow-sm border border-slate-100">
          <div className="bg-gradient-to-br from-emerald-400 to-teal-600 p-2 rounded-xl text-white shadow-md shadow-emerald-200/50">
            <Wallet size={20}/>
          </div>
          <h1 className="text-2xl font-black tracking-tighter text-slate-800">ParejaPro</h1>
        </div>
        
        {renderTab()}
      </main>
    </div>
  );
}
