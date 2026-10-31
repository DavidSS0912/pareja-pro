import React, { useState, useMemo, useEffect } from 'react';
import { 
  PieChart, 
  Target, 
  TrendingUp, 
  Info, 
  Wallet,
  CheckCircle2, 
  AlertTriangle 
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { FormatCurrency } from '../utils';
import { calculateHouseholdIncomeShares } from '../utils/budgetCalculations';
import { BudgetsView } from './BudgetsView';
import { ProjectsView } from './ProjectsView';

export interface PlanningViewProps {
  data?: any;
  calc?: any;
  methods?: any;
  appContext?: any;
  defaultSubTab?: 'budgets' | 'projects';
}

export function PlanningView({
  data = {},
  calc = {},
  methods = {},
  appContext = 'household',
  defaultSubTab = 'budgets'
}: PlanningViewProps) {
  const [activeSubTab, setActiveSubTab] = useState<'budgets' | 'projects'>(defaultSubTab);

  const [selectedMonth, setSelectedMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
  });

  useEffect(() => {
    methods?.fetchBudgetsForMonth?.(selectedMonth);
  }, [selectedMonth, methods?.fetchBudgetsForMonth]);

  // Ingresos del periodo para el resumen ejecutivo
  const periodIncomes = useMemo(() => {
    const sourceIncomes = data?.allIncomes || data?.rawIncomes || data?.incomes || [];
    return sourceIncomes.filter(
      (inc: any) => !selectedMonth || String(inc.date || '').substring(0, 7) === selectedMonth.substring(0, 7)
    );
  }, [data?.allIncomes, data?.rawIncomes, data?.incomes, selectedMonth]);

  const incomeShares = useMemo(() => {
    return calculateHouseholdIncomeShares(periodIncomes, data?.users);
  }, [periodIncomes, data?.users]);

  // Proyectos / metas activos (excluyendo los completados)
  const activeProjects = useMemo(() => {
    return (data?.projects || []).filter((p: any) => !p.isCompleted && p.status !== 'completed');
  }, [data?.projects]);

  const totalProjectsMonthlyQuota = useMemo(() => {
    return activeProjects.reduce((sum: number, p: any) => sum + (Number(p.monthlyQuota) || 0), 0);
  }, [activeProjects]);

  // Suma de presupuestos del mes
  const totalBudgetsAssigned = useMemo(() => {
    return (data?.budgets || []).reduce((sum: number, b: any) => {
      const amount = Number(b.base ?? b.assignedAmount ?? b.fixedAmount ?? 0);
      return sum + (isNaN(amount) ? 0 : amount);
    }, 0);
  }, [data?.budgets]);

  // Total Presupuestado del mes = Presupuestos del Mes + Cuota de Metas Activas
  const totalPresupuestado = totalBudgetsAssigned + totalProjectsMonthlyQuota;
  const remanente = incomeShares.totalIncome - totalPresupuestado;

  return (
    <div className="space-y-6 animate-in">
      {/* 1) TÍTULO SUPERIOR Y SELECTOR DE MES */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-slate-800">Presupuestos</h2>
          <p className="text-slate-600 mt-1 font-medium">
            Guía y plantillas de asignación de fondos.
          </p>
        </div>
        <input 
          type="month" 
          aria-label="Seleccionar mes de planeación"
          className="px-4 py-2 bg-white border border-slate-200 rounded-xl font-medium text-slate-700 w-full sm:w-auto focus:ring-2 focus:ring-primary focus:border-primary shadow-xs"
          value={selectedMonth.substring(0, 7)}
          onChange={(e) => {
            if (e.target.value) {
              setSelectedMonth(`${e.target.value}-01`);
            }
          }}
        />
      </div>

      {/* 2) RESUMEN EJECUTIVO DE INGRESOS Y TOTAL PRESUPUESTADO */}
      <Card className="bg-gradient-to-br from-slate-900 via-slate-850 to-indigo-950 text-white p-6 rounded-3xl border border-slate-800/80 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="flex-1 space-y-3 min-w-0">
            <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold uppercase tracking-wider">
              <TrendingUp size={15} className="text-indigo-400" />
              <span>Resumen Ejecutivo de Ingresos ({selectedMonth.substring(0, 7)})</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
              {/* Total Ingresos */}
              <div>
                <span className="text-xs text-indigo-300 font-medium block">Ingresos Totales</span>
                <span className="text-2xl sm:text-3xl font-black tracking-tight text-white tabular-nums">
                  {FormatCurrency(incomeShares.totalIncome)}
                </span>
              </div>

              {/* Total Presupuestado (Presupuestos + Cuotas Metas) */}
              <div className="border-t sm:border-t-0 sm:border-l border-white/10 pt-2 sm:pt-0 sm:pl-4">
                <span className="text-xs text-indigo-300 font-medium block">Total Presupuestado</span>
                <span className="text-2xl sm:text-3xl font-black tracking-tight text-emerald-300 tabular-nums">
                  {FormatCurrency(totalPresupuestado)}
                </span>
                <span className="text-[11px] text-slate-300 block mt-0.5">
                  Gastos: {FormatCurrency(totalBudgetsAssigned)} • Metas: {FormatCurrency(totalProjectsMonthlyQuota)}
                </span>
              </div>

              {/* Remanente Disponible */}
              <div className="border-t sm:border-t-0 sm:border-l border-white/10 pt-2 sm:pt-0 sm:pl-4">
                <span className="text-xs text-indigo-300 font-medium block">Remanente Libre</span>
                <span className={`text-2xl sm:text-3xl font-black tracking-tight tabular-nums ${remanente >= 0 ? 'text-white' : 'text-rose-400'}`}>
                  {FormatCurrency(remanente)}
                </span>
                <span className="text-[11px] text-slate-300 block mt-0.5">
                  {remanente >= 0 ? 'Disponible para ahorro' : 'Déficit presupuestado'}
                </span>
              </div>
            </div>
          </div>

          {/* Desglose por Integrante */}
          <div className="w-full lg:w-auto lg:min-w-[300px] xl:min-w-[320px] pt-4 lg:pt-0 border-t lg:border-t-0 lg:border-l border-white/10 lg:pl-6 shrink-0">
            <div className="text-xs font-bold text-indigo-300 uppercase tracking-wider mb-2.5">
              <span>Aporte por Integrante</span>
            </div>
            
            {incomeShares.userShares.length > 0 ? (
              <div className="flex flex-col gap-2">
                {incomeShares.userShares.map((user) => {
                  const userObj = (data?.users || []).find((u: any) => u.id === user.userId || u.uid === user.userId);
                  const photo = userObj?.photoUrl || userObj?.photoURL;
                  const initial = (user.userName || 'U').trim().charAt(0).toUpperCase();

                  return (
                    <div 
                      key={user.userId}
                      className="flex items-center justify-between gap-3 p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                    >
                      {/* Lado izquierdo: Avatar/inicial circular pequeño (24px) + Nombre completo legible */}
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        {photo ? (
                          <img
                            src={photo}
                            alt={user.userName || 'Usuario'}
                            className="w-6 h-6 rounded-full object-cover border border-white/20 shrink-0"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-500 to-primary text-white flex items-center justify-center text-[11px] font-black shrink-0 border border-white/20 select-none">
                            {initial}
                          </div>
                        )}
                        <span className="text-xs font-medium text-slate-200 truncate">
                          {user.userName}
                        </span>
                      </div>

                      {/* Lado derecho: Monto completo formateado con FormatCurrency + Badge de porcentaje */}
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-mono text-xs font-bold text-white whitespace-nowrap">
                          {FormatCurrency(user.income)}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 whitespace-nowrap">
                          {user.percentage.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-indigo-200">No hay integrantes registrados en el hogar.</p>
            )}
          </div>
        </div>

        {incomeShares.totalIncome === 0 && (
          <div className="mt-4 pt-3 border-t border-white/10 flex items-center gap-2 text-xs text-amber-200 bg-amber-500/10 px-3 py-2 rounded-xl border border-amber-500/20">
            <Info size={15} className="shrink-0 text-amber-400" />
            <span>Aún no hay ingresos registrados este mes. El cálculo opera con aportación equitativa (50/50).</span>
          </div>
        )}
      </Card>

      {/* 3) PESTAÑAS DE NAVEGACIÓN */}
      <div className="flex items-center justify-center sm:justify-start">
        <div className="bg-white p-1 rounded-2xl border border-slate-200/80 shadow-sm flex items-center w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setActiveSubTab('budgets')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 py-2 px-6 rounded-xl text-sm font-bold transition-all duration-200 ${
              activeSubTab === 'budgets'
                ? 'bg-primary text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <PieChart size={17} />
            <span>Presupuestos del Mes</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('projects')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 py-2 px-6 rounded-xl text-sm font-bold transition-all duration-200 ${
              activeSubTab === 'projects'
                ? 'bg-primary text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Target size={17} />
            <span>Proyectos y Metas</span>
          </button>
        </div>
      </div>

      {/* Contenido de la vista activa */}
      {activeSubTab === 'budgets' ? (
        <BudgetsView 
          data={data} 
          methods={methods} 
          appContext={appContext} 
          selectedMonth={selectedMonth}
          onMonthChange={setSelectedMonth}
          hideHeader={true}
        />
      ) : (
        <ProjectsView data={data} calc={calc} methods={methods} />
      )}
    </div>
  );
}
