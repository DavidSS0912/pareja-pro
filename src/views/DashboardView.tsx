import React, { useState, useMemo } from 'react';
import { PieChart, TrendingUp, Trash2, Edit2, Lock, ArrowDownRight, ArrowUpRight, ArrowLeftRight, AlertTriangle, Target } from 'lucide-react';
import { OrbitaLogo } from '../components/ui/OrbitaLogo';
import { PieChart as PieChartRecharts, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { FormatCurrency } from '../utils';
import { PaymentCalendar } from '../components/PaymentCalendar';
import { useAppStore } from '../store/useAppStore';

export interface DashboardViewProps {
  data: any;
  calc: any;
  methods: any;
  appContext?: 'household' | 'personal';
}

export function DashboardView({ data, calc, methods, appContext = 'household' }: DashboardViewProps) {
  const [deleteConfirm, setDeleteConfirm] = useState<{id: string, type: 'income'|'expense'} | null>(null);
  const [movementFilter, setMovementFilter] = useState<'all' | 'income' | 'expense' | 'transfer'>('all');
  const [distributionMode, setDistributionMode] = useState<'expenses' | 'incomes'>('expenses');

  const allExpenses = useAppStore(state => state.expenses);
  const dateRange = useAppStore(state => state.dateRange);

  const currentUserId = data.user?.uid || '';

  // Cálculos de Privacidad y Totales
  const { totalIncome, totalExpense, currentBalance, relevantIncomes, relevantExpenses, chartData, usersWithProportion } = useMemo(() => {
    const rIncomes = data.incomes || [];
    const tIncome = rIncomes.reduce((acc: number, curr: any) => acc + Number(curr.amount || 0), 0);

    const rExpenses = data.expenses || [];
    const tExpense = rExpenses.reduce((acc: number, curr: any) => acc + Number(curr.amount || 0), 0);

    const balance = tIncome - tExpense;

    // Data for Chart según distributionMode y appContext
    const targetItems = distributionMode === 'expenses' ? rExpenses : rIncomes;
    let cData: any[] = [];

    if (appContext === 'personal') {
      const PALETTE = ['#10B981', '#6366F1', '#111319', '#F97316', '#64748B', '#CBD5E1', '#0EA5E9', '#F43F5E', '#A855F7'];
      const byCategory = targetItems.reduce((acc: Record<string, any>, curr: any) => {
        const cat = curr.category || curr.categoryName || 'General';
        if (!acc[cat]) {
          acc[cat] = {
            name: cat,
            value: 0,
            gasto: 0,
            ingreso: 0,
            fill: PALETTE[Object.keys(acc).length % PALETTE.length]
          };
        }
        const amt = Number(curr.amount || 0);
        acc[cat].value += amt;
        acc[cat].gasto += amt;
        acc[cat].ingreso += amt;
        return acc;
      }, {});
      cData = Object.values(byCategory);
    } else {
      const byUser = targetItems.reduce((acc: Record<string, any>, curr: any) => {
        const uid = curr.userId || curr.ownerUid || curr.paidBy;
        if (!uid) return acc;
        if (!acc[uid]) {
          const u = (data.users || []).find((user: any) => user.id === uid || user.uid === uid);
          acc[uid] = {
            name: u?.name || u?.displayName || 'Desconocido',
            value: 0,
            gasto: 0,
            ingreso: 0,
            fill: uid === currentUserId ? '#111319' : '#6366F1' // Obsidian para mí, Lavanda para el partner
          };
        }
        const amt = Number(curr.amount || 0);
        acc[uid].value += amt;
        acc[uid].gasto += amt;
        acc[uid].ingreso += amt;
        return acc;
      }, {});
      cData = Object.values(byUser);
    }

    // Proportions for "Mi Casa"
    const incomeByUser = rIncomes.reduce((acc: Record<string, number>, curr: any) => {
      const uid = curr.userId || curr.ownerUid;
      if (uid) {
        acc[uid] = (acc[uid] || 0) + Number(curr.amount || 0);
      }
      return acc;
    }, {});

    const uProportion = (data.users || []).map((u: any) => {
      const userIncome = incomeByUser[u.id] || incomeByUser[u.uid] || 0;
      const proportion = tIncome > 0 ? (userIncome / tIncome) * 100 : 0;
      return { ...u, proportion };
    });

    return {
      totalIncome: tIncome,
      totalExpense: tExpense,
      currentBalance: balance,
      relevantIncomes: rIncomes,
      relevantExpenses: rExpenses,
      chartData: cData,
      usersWithProportion: uProportion
    };
  }, [data.incomes, data.expenses, data.users, currentUserId, distributionMode, appContext]);


  const handleDelete = (id, type) => {
    setDeleteConfirm({ id, type });
  };

  const confirmDelete = () => {
    if (deleteConfirm) {
      if (deleteConfirm.type === 'income' && methods.deleteIncome) {
        methods.deleteIncome(deleteConfirm.id);
      } else if (deleteConfirm.type === 'expense' && methods.deleteExpense) {
        methods.deleteExpense(deleteConfirm.id);
      }
      setDeleteConfirm(null);
    }
  };

  const allMovements = useMemo(() => {
    const incomes = relevantIncomes.map(i => ({ ...i, movementType: 'income' }));
    const expenses = relevantExpenses.map(e => ({ ...e, movementType: 'expense' }));
    const transfers = (data.transfers || []).map((t: any) => ({
      ...t,
      movementType: 'transfer',
      isTransfer: true,
      desc: t.description || (t.type === 'CARD_PAYMENT' ? 'Pago de Tarjeta' : 'Transferencia'),
      category: `${t.sourceAccountName || 'Origen'} → ${t.targetAccountName || 'Destino'}`
    }));
    
    let combined = [...incomes, ...expenses, ...transfers];
    
    // Sort by date descending
    combined.sort((a, b) => {
      const dateA = a.date ? new Date(a.date).getTime() : 0;
      const dateB = b.date ? new Date(b.date).getTime() : 0;
      return dateB - dateA;
    });

    if (movementFilter === 'income') {
      return combined.filter(m => m.movementType === 'income');
    }
    if (movementFilter === 'expense') {
      return combined.filter(m => m.movementType === 'expense');
    }
    if (movementFilter === 'transfer') {
      return combined.filter(m => m.movementType === 'transfer');
    }
    
    return combined;
  }, [relevantIncomes, relevantExpenses, data.transfers, movementFilter]);

  const prevMonthExpense = useMemo(() => {
    const startObj = dateRange?.start ? new Date(dateRange.start) : new Date();
    const prevMonthStart = new Date(startObj.getFullYear(), startObj.getMonth() - 1, 1);
    const prevMonthEnd = new Date(startObj.getFullYear(), startObj.getMonth(), 0);
    
    const contextFilteredExpenses = (allExpenses || []).filter((e: any) => {
      const ownerUid = e.ownerUid || e.userId || e.paidBy;
      const isShared = e.isShared !== undefined ? Boolean(e.isShared) : !e.isPrivate;
      if (appContext === 'personal') {
        return ownerUid === currentUserId && !isShared;
      }
      return isShared;
    });

    return contextFilteredExpenses.filter((e: any) => {
        if (!e.date) return false;
        const d = new Date(e.date);
        return d >= prevMonthStart && d <= prevMonthEnd;
    }).reduce((acc: number, curr: any) => acc + Number(curr.amount || 0), 0);
  }, [allExpenses, dateRange, appContext, currentUserId]);

  const expenseTrend = prevMonthExpense > 0 
    ? ((totalExpense - prevMonthExpense) / prevMonthExpense) * 100 
    : 0;

  const calendarAccounts = useMemo(() => {
    const rawAccounts: any[] = data.accounts || [];
    const currentSlot = data.user?.memberSlot || (data.memberSlot as any);
    if (appContext === 'personal') {
      if (!currentSlot) return [];
      return rawAccounts.filter((a: any) => a?.ownerType === currentSlot);
    }
    return rawAccounts.filter((a: any) => a?.ownerType === 'SHARED');
  }, [data.accounts, data.user?.memberSlot, data.memberSlot, appContext]);

  return (
    <div className="space-y-6 animate-in">
      {/* Alerta de Presupuesto */}
      {(calc.unallocated < 0 || totalExpense > totalIncome) && (
        <div className="bg-[#FDEFEA] border border-[#F97316]/30 text-[#F97316] p-4 rounded-2xl shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <AlertTriangle size={18} />
            <span className="font-semibold text-sm">
              {totalExpense > totalIncome 
                ? "¡Advertencia! Tus gastos totales han superado tus ingresos."
                : "¡Advertencia! Tu presupuesto asignado excede tus ingresos."}
            </span>
          </div>
        </div>
      )}

      {/* Bento Grid Principal: 12 Columnas */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        {/* Hero: Presupuesto Base Cero (md:col-span-6) */}
        <div className="col-span-1 md:col-span-6 bg-[#111319] border border-[#232733] rounded-3xl p-6 text-white shadow-bento relative overflow-hidden flex flex-col justify-between min-h-[170px]">
          <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
            <PieChart size={130} className="text-white" />
          </div>
          <div className="relative z-10">
            <h2 className="text-slate-400 font-medium mb-1 uppercase tracking-wider text-xs flex items-center gap-2">
              <TrendingUp size={14} className="text-[#10B981]" /> Presupuesto Base Cero
            </h2>
            <div className="text-3xl md:text-4xl font-title font-bold text-white tabular-nums tracking-tight my-2">
              {FormatCurrency(calc.unallocated)}
            </div>
            <p className="text-xs text-slate-300">
              {calc.unallocated === 0 
                ? '¡Perfecto! Todo está asignado.' 
                : calc.unallocated > 0 
                  ? 'Tienes dinero sin asignar.'
                  : 'Atención: Tu presupuesto excede tus ingresos.'}
            </p>
          </div>
        </div>

        {/* KPI: Ingresos Totales (md:col-span-3) */}
        <div className="col-span-1 md:col-span-3 bg-white border border-[#EEF0F4] rounded-3xl p-6 shadow-bento flex flex-col justify-between min-h-[170px]">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Ingresos Totales</h3>
            <div className="p-2 bg-[#E8F8F0] text-[#10B981] rounded-full">
              <ArrowUpRight size={16} />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 tabular-nums">
              {FormatCurrency(totalIncome)}
            </div>
          </div>
        </div>

        {/* KPI: Gastos Totales (md:col-span-3) */}
        <div className="col-span-1 md:col-span-3 bg-white border border-[#EEF0F4] rounded-3xl p-6 shadow-bento flex flex-col justify-between min-h-[170px]">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Gastos Totales</h3>
            <div className="p-2 bg-[#FDEFEA] text-[#F97316] rounded-full">
              <ArrowDownRight size={16} />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 tabular-nums">
              {FormatCurrency(totalExpense)}
            </div>
            {prevMonthExpense > 0 && (
              <div className="mt-1">
                <span className={`text-xs font-medium tabular-nums px-2 py-0.5 rounded-full inline-flex items-center gap-0.5 ${expenseTrend > 0 ? 'bg-[#FDEFEA] text-[#F97316]' : 'bg-[#E8F8F0] text-[#10B981]'}`}>
                  {expenseTrend > 0 ? '↑' : '↓'} {Math.abs(expenseTrend).toFixed(1)}% vs mes pasado
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Mi Casa y Liquidación (col-span-12 lg:col-span-7) */}
        <div className="col-span-1 md:col-span-12 lg:col-span-7 bg-white border border-[#EEF0F4] rounded-3xl p-6 shadow-bento flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <OrbitaLogo size={18} className="text-slate-900" /> Mi Casa
              </h2>
            </div>
            
            <div className="space-y-3">
              {usersWithProportion.map(user => (
                <div key={user.id} className="flex items-center justify-between p-3.5 bg-[#F8FAFC] border border-[#EEF0F4] rounded-2xl">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full ${user?.avatar || 'bg-slate-200'} flex items-center justify-center text-slate-700 font-bold shadow-sm overflow-hidden border-2 border-white`}>
                      {(user?.photoURL || user?.photoUrl) ? (
                        <img 
                          src={user.photoURL || user.photoUrl} 
                          alt={user?.name || user?.displayName || 'Usuario'} 
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        user?.name?.[0] || user?.displayName?.[0] || 'U'
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 text-sm">{user.name} {user.id === currentUserId && '(Tú)'}</p>
                      <p className="text-xs text-slate-400">Aporte: <span className="tabular-nums font-medium text-slate-600">{user.proportion.toFixed(1)}%</span></p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 p-4 bg-[#111319] border border-[#232733] rounded-2xl text-white">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="text-slate-400 text-xs uppercase tracking-wider mb-1 font-semibold">Balance del Periodo</p>
                <p className={`text-2xl font-bold tabular-nums ${currentBalance >= 0 ? 'text-[#10B981]' : 'text-[#F97316]'}`}>
                  {FormatCurrency(currentBalance)}
                </p>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-[#232733]">
              <p className="text-slate-400 text-xs uppercase tracking-wider mb-2 font-semibold">Estado de Liquidación</p>
              {calc.netSettlement > 0 ? (
                <p className="text-sm bg-white/10 py-1.5 px-3 rounded-lg inline-block border border-white/5 text-slate-200">
                  {data.users[1]?.name || 'Zoé'} transfiere a {data.users[0]?.name || 'David'} <span className="font-bold text-[#10B981] ml-1 tabular-nums">{FormatCurrency(calc.settlementAmount)}</span>
                </p>
              ) : calc.netSettlement < 0 ? (
                <p className="text-sm bg-white/10 py-1.5 px-3 rounded-lg inline-block border border-white/5 text-slate-200">
                  {data.users[0]?.name || 'David'} transfiere a {data.users[1]?.name || 'Zoé'} <span className="font-bold text-[#10B981] ml-1 tabular-nums">{FormatCurrency(calc.settlementAmount)}</span>
                </p>
              ) : (
                <p className="text-sm font-semibold text-[#10B981] bg-[#10B981]/10 py-1.5 px-3 rounded-lg inline-block">Cuentas Saldadas 🙌</p>
              )}
            </div>
          </div>
        </div>

        {/* Gráfica Donut y Metas (col-span-12 lg:col-span-5) */}
        <div className="col-span-1 md:col-span-12 lg:col-span-5 bg-white border border-[#EEF0F4] rounded-3xl p-6 shadow-bento flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-4">
              <h2 className="text-base font-bold text-slate-900">
                {distributionMode === 'expenses' ? 'Distribución del Gasto' : 'Distribución del Ingreso'}
              </h2>
              <div className="flex bg-[#F5F6FA] border border-[#EEF0F4] p-1 rounded-full shrink-0">
                <button
                  type="button"
                  onClick={() => setDistributionMode('expenses')}
                  className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors ${
                    distributionMode === 'expenses'
                      ? 'bg-[#111319] text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Gastos
                </button>
                <button
                  type="button"
                  onClick={() => setDistributionMode('incomes')}
                  className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors ${
                    distributionMode === 'incomes'
                      ? 'bg-[#111319] text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Ingresos
                </button>
              </div>
            </div>

            <div className="h-48 w-full">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChartRecharts>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={78}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {chartData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => FormatCurrency(Number(value) || 0)}
                      contentStyle={{ borderRadius: '12px', border: '1px solid #EEF0F4', backgroundColor: '#111319', color: '#fff', boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.08)' }}
                      itemStyle={{ color: '#fff' }}
                    />
                  </PieChartRecharts>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-slate-400 text-sm">
                  {distributionMode === 'expenses' ? 'No hay gastos en este periodo' : 'No hay ingresos en este periodo'}
                </div>
              )}
            </div>
          </div>

          {/* Progreso de Metas Destacadas */}
          {(data.projects && data.projects.length > 0) && (
            <div className="mt-4 pt-4 border-t border-[#EEF0F4]">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                <Target size={14} className="text-slate-700" /> Metas Activas
              </h3>
              <div className="space-y-3">
                {data.projects.slice(0, 2).map((project: any) => {
                  const progress = project.targetAmount > 0 ? Math.min(100, (project.currentAmount / project.targetAmount) * 100) : 0;
                  return (
                    <div key={project.id}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-medium text-slate-700">{project.name}</span>
                        <span className="text-slate-500 tabular-nums">{progress.toFixed(0)}%</span>
                      </div>
                      <div className="w-full bg-[#F5F6FA] rounded-full h-1.5">
                        <div className="bg-[#111319] h-1.5 rounded-full" style={{ width: `${progress}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Desglose de Movimientos (col-span-12) */}
        <div className="col-span-1 md:col-span-12 bg-white border border-[#EEF0F4] rounded-3xl p-6 shadow-bento flex flex-col">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
            <h2 className="text-base font-bold text-slate-900">Desglose de Movimientos</h2>
            
            <div className="flex bg-[#F5F6FA] border border-[#EEF0F4] p-1 rounded-full self-start sm:self-auto">
              <button 
                onClick={() => setMovementFilter('all')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-colors ${movementFilter === 'all' ? 'bg-[#111319] text-white shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
              >
                Todos
              </button>
              <button 
                onClick={() => setMovementFilter('income')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-colors ${movementFilter === 'income' ? 'bg-[#111319] text-white shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
              >
                Ingresos
              </button>
              <button 
                onClick={() => setMovementFilter('expense')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-colors ${movementFilter === 'expense' ? 'bg-[#111319] text-white shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
              >
                Gastos
              </button>
              <button 
                onClick={() => setMovementFilter('transfer')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-colors ${movementFilter === 'transfer' ? 'bg-[#111319] text-white shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
              >
                Transferencias
              </button>
            </div>
          </div>
          
          {allMovements.length === 0 ? (
            <div className="text-center py-12 text-slate-400 flex-1 flex items-center justify-center">
              No hay movimientos registrados en este periodo con el filtro actual.
            </div>
          ) : (
            <div className="divide-y divide-[#EEF0F4] flex-1 min-h-0 max-h-[720px] overflow-y-auto pr-2 pb-2">
              {allMovements.map(mov => {
                const user = data.users.find(u => u.id === (mov.userId || mov.ownerUid));
                const isIncome = mov.movementType === 'income';
                const isTransfer = mov.movementType === 'transfer';
                
                return (
                  <div key={`${mov.movementType}-${mov.id}`} className="flex justify-between items-center py-3.5 hover:bg-[#F8FAFC] px-2 rounded-xl transition-all group">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                        isIncome 
                          ? 'bg-[#E8F8F0] text-[#10B981]' 
                          : isTransfer 
                          ? 'bg-[#EEF2FF] text-[#6366F1]' 
                          : 'bg-[#FDEFEA] text-[#F97316]'
                      }`}>
                         {isIncome ? (
                           <ArrowUpRight size={18} />
                         ) : isTransfer ? (
                           <ArrowLeftRight size={18} />
                         ) : (
                           <ArrowDownRight size={18} />
                         )}
                      </div>
                      <div className={`w-8 h-8 rounded-full ${user?.avatar || (isTransfer ? 'bg-[#EEF2FF] text-[#6366F1]' : 'bg-slate-200 text-slate-700')} flex items-center justify-center font-bold text-xs shadow-xs border border-white overflow-hidden shrink-0`}>
                        {(user?.photoURL || user?.photoUrl) ? (
                          <img 
                            src={user.photoURL || user.photoUrl} 
                            alt={user?.name || user?.displayName || 'Usuario'} 
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover" 
                          />
                        ) : (
                          user?.name?.[0] || user?.displayName?.[0] || (isTransfer ? '⇄' : 'U')
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-slate-900 text-sm">{mov.description || mov.desc || mov.type || mov.name || mov.category || 'Movimiento'}</p>
                          {isTransfer && (
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${mov.type === 'CARD_PAYMENT' ? 'bg-[#EEF2FF] text-[#6366F1]' : 'bg-[#F1F5F9] text-[#64748B]'}`}>
                              {mov.type === 'CARD_PAYMENT' ? 'Pago TDC' : 'Transferencia'}
                            </span>
                          )}
                          {mov.isPrivate && (
                            <span title="Privado" className="flex">
                              <Lock size={12} className="text-amber-500" />
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {isTransfer 
                            ? `${mov.sourceAccountName || 'Origen'} → ${mov.targetAccountName || 'Destino'} • ${mov.date ? mov.date.split('T')[0].split('-').reverse().join('/') : 'Sin fecha'}`
                            : `${user?.name || 'Usuario'} • ${mov.date ? mov.date.split('T')[0].split('-').reverse().join('/') : 'Sin fecha'}`
                          }
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className={`font-semibold tabular-nums tracking-tight ${isIncome ? 'text-[#10B981]' : isTransfer ? 'text-[#6366F1]' : 'text-slate-900'}`}>
                          {isIncome ? '+' : isTransfer ? '' : '-'}{FormatCurrency(mov.amount)}
                        </p>
                        {mov.currency && mov.currency !== 'MXN' && (
                          <p className="text-[10px] text-slate-400 font-medium">{mov.currency}</p>
                        )}
                      </div>
                      {isTransfer ? (
                        methods.handleOpenTransferModal && (
                          <div className="flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => methods.handleOpenTransferModal(mov)} className="text-slate-400 hover:text-slate-800 transition-colors p-1.5 bg-[#F5F6FA] hover:bg-[#EEF0F4] rounded-lg">
                              <Edit2 size={12} />
                            </button>
                          </div>
                        )
                      ) : (
                        <div className="flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => {
                            if (isIncome && methods.handleOpenIncomeModal) methods.handleOpenIncomeModal(mov);
                            if (!isIncome && methods.handleOpenExpenseModal) methods.handleOpenExpenseModal(mov);
                          }} className="text-slate-400 hover:text-slate-800 transition-colors p-1.5 bg-[#F5F6FA] hover:bg-[#EEF0F4] rounded-lg">
                            <Edit2 size={12} />
                          </button>
                          <button onClick={() => handleDelete(mov.id, mov.movementType)} className="text-slate-400 hover:text-red-600 transition-colors p-1.5 bg-[#F5F6FA] hover:bg-[#EEF0F4] rounded-lg">
                            <Trash2 size={12} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Calendario de Pagos (col-span-12) */}
        <div className="col-span-1 md:col-span-12 bg-white border border-[#EEF0F4] rounded-3xl p-6 shadow-bento">
          <PaymentCalendar expenses={relevantExpenses} accounts={calendarAccounts} />
        </div>
      </div>

      <Modal 
        isOpen={!!deleteConfirm} 
        onClose={() => setDeleteConfirm(null)} 
        title="Confirmar eliminación"
      >
        <div className="p-4">
          <p className="text-slate-700 mb-6 text-center">¿Estás seguro de que deseas eliminar este {deleteConfirm?.type === 'income' ? 'ingreso' : 'gasto'}? Esta acción no se puede deshacer.</p>
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" onClick={() => setDeleteConfirm(null)}>
              Cancelar
            </Button>
            <Button variant="danger" className="bg-red-600 text-white hover:bg-red-700" onClick={confirmDelete}>
              Eliminar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
