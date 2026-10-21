import React, { useState, useMemo } from 'react';
import { PieChart, TrendingUp, Trash2, Edit2, Lock, ArrowDownRight, ArrowUpRight, AlertTriangle, Target } from 'lucide-react';
import { OrbitaLogo } from '../components/ui/OrbitaLogo';
import { PieChart as PieChartRecharts, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { FormatCurrency } from '../utils';
import { PaymentCalendar } from '../components/PaymentCalendar';
import { useAppStore } from '../store/useAppStore';

export function DashboardView({ data, calc, methods }) {
  const [deleteConfirm, setDeleteConfirm] = useState<{id: string, type: 'income'|'expense'} | null>(null);
  const [movementFilter, setMovementFilter] = useState<'all' | 'income' | 'expense'>('all');

  const allExpenses = useAppStore(state => state.expenses);
  const dateRange = useAppStore(state => state.dateRange);

  const currentUserId = data.user?.uid || '';

  // Cálculos de Privacidad y Totales
  const { totalIncome, totalExpense, currentBalance, relevantIncomes, relevantExpenses, chartData, usersWithProportion } = useMemo(() => {
    const rIncomes = data.incomes.filter(i => !i.isPrivate || i.userId === currentUserId);
    const tIncome = rIncomes.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);

    const rExpenses = data.expenses.filter(e => !e.isPrivate || e.userId === currentUserId);
    const tExpense = rExpenses.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);

    const balance = tIncome - tExpense;

    // Data for Chart
    const expenseByUser = rExpenses.reduce((acc, curr) => {
      if (!acc[curr.userId]) {
        const u = data.users.find(user => user.id === curr.userId);
        acc[curr.userId] = {
          name: u?.name || 'Desconocido',
          gasto: 0,
          fill: u?.id === currentUserId ? '#4f46e5' : '#0ea5e9' // Indigo for me, Sky for others
        };
      }
      acc[curr.userId].gasto += Number(curr.amount || 0);
      return acc;
    }, {});
    const cData = Object.values(expenseByUser);

    // Proportions for "Mi Casa"
    const incomeByUser = rIncomes.reduce((acc, curr) => {
      acc[curr.userId] = (acc[curr.userId] || 0) + Number(curr.amount || 0);
      return acc;
    }, {});

    const uProportion = data.users.map(u => {
      const userIncome = incomeByUser[u.id] || 0;
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
  }, [data.incomes, data.expenses, data.users, currentUserId]);


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
    
    let combined = [...incomes, ...expenses];
    
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
    
    return combined;
  }, [relevantIncomes, relevantExpenses, movementFilter]);

  const prevMonthExpense = useMemo(() => {
    const startObj = dateRange?.start ? new Date(dateRange.start) : new Date();
    const prevMonthStart = new Date(startObj.getFullYear(), startObj.getMonth() - 1, 1);
    const prevMonthEnd = new Date(startObj.getFullYear(), startObj.getMonth(), 0);
    
    return allExpenses.filter((e: any) => {
        if (!e.date) return false;
        const d = new Date(e.date);
        return d >= prevMonthStart && d <= prevMonthEnd;
    }).reduce((acc: number, curr: any) => acc + Number(curr.amount || 0), 0);
  }, [allExpenses, dateRange]);

  const expenseTrend = prevMonthExpense > 0 
    ? ((totalExpense - prevMonthExpense) / prevMonthExpense) * 100 
    : 0;

  return (
    <div className="space-y-6 animate-in">
      {/* Alerta de Presupuesto */}
      {(calc.unallocated < 0 || totalExpense > totalIncome) && (
        <div className="bg-red-500 text-white p-3 rounded-xl shadow-sm flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <AlertTriangle size={18} />
            <span className="font-semibold text-sm">
              {totalExpense > totalIncome 
                ? "¡Advertencia! Tus gastos totales han superado tus ingresos."
                : "¡Advertencia! Tu presupuesto asignado excede tus ingresos."}
            </span>
          </div>
        </div>
      )}

      {/* TARJETAS RESUMEN */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Presupuesto Base Cero */}
        <div className="bg-slate-900 p-6 rounded-2xl shadow-sm relative overflow-hidden md:col-span-2 flex flex-col justify-between">
          <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
            <PieChart size={120} className="text-white" />
          </div>
          <div className="relative z-10">
            <h2 className="text-slate-400 font-medium mb-1 uppercase tracking-wider text-xs flex items-center gap-2">
              <TrendingUp size={14} /> Presupuesto Base Cero
            </h2>
            <div className="text-4xl font-title font-bold text-white tabular-nums tracking-tight mb-2">
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

        {/* Ingresos Totales */}
        <Card className="flex flex-col justify-center bg-white border-slate-100">
          <div className="flex items-center gap-2 text-slate-500 mb-2">
            <div className="p-1.5 bg-green-100 rounded-lg text-green-600">
              <ArrowUpRight size={16} />
            </div>
            <h3 className="text-xs font-medium uppercase tracking-wider">Ingresos Totales</h3>
          </div>
          <div className="text-2xl font-bold text-slate-900 tabular-nums">
            {FormatCurrency(totalIncome)}
          </div>
        </Card>

        {/* Gastos Totales */}
        <Card className="flex flex-col justify-center bg-white border-slate-100">
          <div className="flex items-center gap-2 text-slate-500 mb-2">
            <div className="p-1.5 bg-red-100 rounded-lg text-red-600">
              <ArrowDownRight size={16} />
            </div>
            <h3 className="text-xs font-medium uppercase tracking-wider">Gastos Totales</h3>
          </div>
          <div className="flex items-end gap-2">
            <div className="text-2xl font-bold text-slate-900 tabular-nums">
              {FormatCurrency(totalExpense)}
            </div>
            {prevMonthExpense > 0 && (
              <span className={`text-xs font-medium mb-1 ${expenseTrend > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                {expenseTrend > 0 ? '↑' : '↓'} {Math.abs(expenseTrend).toFixed(1)}% vs mes pasado
              </span>
            )}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* PANEL MI CASA & BALANCE */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="bg-gradient-to-br from-indigo-50 to-white border-indigo-100">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-title font-bold text-indigo-950 flex items-center gap-2">
                <OrbitaLogo size={18} className="text-indigo-600"/> Mi Casa
              </h2>
            </div>
            
            <div className="space-y-4">
              {usersWithProportion.map(user => (
                <div key={user.id} className="flex items-center justify-between p-3 bg-white/60 rounded-xl border border-white/80 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full ${user?.avatar || 'bg-slate-200'} flex items-center justify-center text-slate-700 font-bold shadow-sm overflow-hidden border-2 border-white`}>
                      {user?.photoURL ? (
                        <img 
                          src={user.photoURL} 
                          alt={user?.name} 
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        user?.name?.[0]
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800 text-sm">{user.name} {user.id === currentUserId && '(Tú)'}</p>
                      <p className="text-xs text-slate-500">Aporte: {user.proportion.toFixed(1)}%</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-indigo-900 rounded-xl text-white">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="text-indigo-200 text-xs uppercase tracking-wider mb-1">Balance del Periodo</p>
                  <p className={`text-2xl font-bold tabular-nums ${currentBalance >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {FormatCurrency(currentBalance)}
                  </p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-indigo-800/50">
                <p className="text-indigo-200 text-xs uppercase tracking-wider mb-2">Estado de Liquidación</p>
                {calc.netSettlement > 0 ? (
                  <p className="text-sm bg-white/10 py-1.5 px-3 rounded-lg inline-block border border-white/5">
                    {data.users[1]?.name || 'Zoé'} transfiere a {data.users[0]?.name || 'David'} <span className="font-bold text-emerald-300 ml-1">{FormatCurrency(calc.settlementAmount)}</span>
                  </p>
                ) : calc.netSettlement < 0 ? (
                  <p className="text-sm bg-white/10 py-1.5 px-3 rounded-lg inline-block border border-white/5">
                    {data.users[0]?.name || 'David'} transfiere a {data.users[1]?.name || 'Zoé'} <span className="font-bold text-emerald-300 ml-1">{FormatCurrency(calc.settlementAmount)}</span>
                  </p>
                ) : (
                  <p className="text-sm font-bold text-emerald-400 bg-emerald-500/10 py-1.5 px-3 rounded-lg inline-block">Cuentas Saldadas 🙌</p>
                )}
              </div>
            </div>
          </Card>

          <Card>
            <h2 className="text-lg font-title font-bold text-slate-900 mb-4">Distribución del Gasto</h2>
            <div className="h-48 w-full">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChartRecharts>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={5}
                      dataKey="gasto"
                    >
                      {chartData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => FormatCurrency(value)}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                  </PieChartRecharts>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-slate-400 text-sm">
                  No hay gastos en este periodo
                </div>
              )}
            </div>

            {/* Progreso de Metas Destacadas */}
            {(data.projects && data.projects.length > 0) && (
              <div className="mt-6 pt-4 border-t border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <Target size={16} className="text-indigo-600" /> Metas Activas
                </h3>
                <div className="space-y-3">
                  {data.projects.slice(0, 2).map((project: any) => {
                    const progress = project.targetAmount > 0 ? Math.min(100, (project.currentAmount / project.targetAmount) * 100) : 0;
                    return (
                      <div key={project.id}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="font-medium text-slate-700">{project.name}</span>
                          <span className="text-slate-500">{progress.toFixed(0)}%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5">
                          <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: `${progress}%` }}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* DESGLOSE DE MOVIMIENTOS */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="h-full">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
              <h2 className="text-lg font-title font-bold text-slate-900">Desglose de Movimientos</h2>
              
              <div className="flex bg-slate-100 p-1 rounded-lg self-start sm:self-auto">
                <button 
                  onClick={() => setMovementFilter('all')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${movementFilter === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Todos
                </button>
                <button 
                  onClick={() => setMovementFilter('income')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${movementFilter === 'income' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-emerald-600'}`}
                >
                  Ingresos
                </button>
                <button 
                  onClick={() => setMovementFilter('expense')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${movementFilter === 'expense' ? 'bg-white text-red-600 shadow-sm' : 'text-slate-500 hover:text-red-600'}`}
                >
                  Gastos
                </button>
              </div>
            </div>
            
            {allMovements.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                No hay movimientos registrados en este periodo con el filtro actual.
              </div>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 pb-2">
                {allMovements.map(mov => {
                  const user = data.users.find(u => u.id === mov.userId);
                  const isIncome = mov.movementType === 'income';
                  
                  return (
                    <div key={`${mov.movementType}-${mov.id}`} className="flex justify-between items-center p-3.5 bg-slate-50/50 rounded-xl border border-slate-100 hover:bg-white hover:shadow-sm transition-all group">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-sm border border-white overflow-hidden ${isIncome ? 'bg-emerald-100' : 'bg-red-100'}`}>
                           {isIncome ? <ArrowUpRight size={16} className="text-emerald-600" /> : <ArrowDownRight size={16} className="text-red-600" />}
                        </div>
                        <div className={`w-9 h-9 rounded-full ${user?.avatar || 'bg-slate-200'} flex items-center justify-center text-slate-700 font-bold text-xs shadow-sm border border-white overflow-hidden`}>
                          {user?.photoURL ? (
                            <img 
                              src={user.photoURL} 
                              alt={user?.name} 
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover" 
                            />
                          ) : (
                            user?.name?.[0]
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-slate-900 text-sm">{mov.description || mov.desc || mov.type || mov.name || mov.category || 'Movimiento'}</p>
                            {mov.isPrivate && (
                              <span title="Privado" className="flex">
                                <Lock size={12} className="text-amber-500" />
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {user?.name} &bull; {mov.date ? mov.date.split('T')[0].split('-').reverse().join('/') : 'Sin fecha'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className={`font-semibold tabular-nums tracking-tight ${isIncome ? 'text-emerald-600' : 'text-slate-900'}`}>
                            {isIncome ? '+' : '-'}{FormatCurrency(mov.amount)}
                          </p>
                          {mov.currency && mov.currency !== 'MXN' && (
                            <p className="text-[10px] text-slate-400 font-medium">{mov.currency}</p>
                          )}
                        </div>
                        <div className="flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => {
                            if (isIncome && methods.handleOpenIncomeModal) methods.handleOpenIncomeModal(mov);
                            if (!isIncome && methods.handleOpenExpenseModal) methods.handleOpenExpenseModal(mov);
                          }} className="text-slate-400 hover:text-indigo-600 transition-colors p-1 bg-slate-100 rounded-md">
                            <Edit2 size={12} />
                          </button>
                          <button onClick={() => handleDelete(mov.id, mov.movementType)} className="text-slate-400 hover:text-red-600 transition-colors p-1 bg-slate-100 rounded-md">
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      </div>

      <div className="mt-6">
        <PaymentCalendar expenses={relevantExpenses} accounts={data.accounts || []} />
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
