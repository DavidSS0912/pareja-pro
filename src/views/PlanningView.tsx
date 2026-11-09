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
import { FormatCurrency } from '../utils';
import { calculateHouseholdIncomeShares, resolveBudgetPeriodFromDateRange, resolveContextUsers } from '../utils/budgetCalculations';
import { useAppStore } from '../store/useAppStore';
import { BudgetsView } from './BudgetsView';
import { ProjectsView } from './ProjectsView';

export interface PlanningViewProps {
  data?: any;
  calc?: any;
  methods?: any;
  appContext?: any;
  defaultSubTab?: 'budgets' | 'projects';
  selectedMonth?: string;
  onMonthChange?: (month: string) => void;
}

export function PlanningView({
  data = {},
  calc = {},
  methods = {},
  appContext = 'household',
  defaultSubTab = 'budgets',
  selectedMonth: propSelectedMonth,
  onMonthChange
}: PlanningViewProps) {
  const [activeSubTab, setActiveSubTab] = useState<'budgets' | 'projects'>(defaultSubTab);

  const storeDateRange = useAppStore(state => state.dateRange);
  const activeDateRange = data?.dateRange || storeDateRange;

  const derivedPeriod = useMemo(() => {
    return resolveBudgetPeriodFromDateRange(activeDateRange);
  }, [activeDateRange]);

  const selectedMonth = propSelectedMonth || derivedPeriod;

  useEffect(() => {
    methods?.fetchBudgetsForMonth?.(selectedMonth);
  }, [selectedMonth, methods?.fetchBudgetsForMonth]);

  // Ingresos del periodo para el resumen ejecutivo (usa directamente data?.incomes del rango)
  const periodIncomes = useMemo(() => {
    return data?.incomes || [];
  }, [data?.incomes]);

  const contextUsers = useMemo(() => {
    return resolveContextUsers(data?.users, data?.user, data?.memberSlot, appContext);
  }, [data?.users, data?.user, data?.memberSlot, appContext]);

  const incomeShares = useMemo(() => {
    return calculateHouseholdIncomeShares(periodIncomes, contextUsers);
  }, [periodIncomes, contextUsers]);

  // Proyectos / metas activos (excluyendo los completados, pausados o archivados y acotando a modo personal si aplica)
  const activeProjects = useMemo(() => {
    const all = (data?.projects || []).filter(
      (p: any) =>
        !p.isCompleted &&
        p.status !== 'completed' &&
        p.status !== 'paused' &&
        !p.isPaused &&
        !p.isArchived &&
        (p.priority === undefined || p.priority === null || p.priority > 0)
    );
    if (appContext === 'personal') {
      const currentSlot = data?.memberSlot || data?.user?.memberSlot;
      const currentUid = data?.user?.uid;
      const accounts = data?.accounts || [];
      return all.filter((p: any) => {
        if (p.ownerType) return p.ownerType === currentSlot;
        if (p.ownerUid) return p.ownerUid === currentUid;
        const targetAcc = accounts.find((a: any) => a.id === p.targetAccountId || a.name === p.targetAccount || a.id === p.targetAccount);
        if (targetAcc) {
          return targetAcc.ownerType === currentSlot;
        }
        return false;
      });
    }
    return all;
  }, [data?.projects, appContext, data?.memberSlot, data?.user, data?.accounts]);

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
      {/* 1) TÍTULO SUPERIOR */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">Presupuestos</h2>
          <p className="text-slate-500 mt-1 font-medium text-sm">
            Guía y plantillas de asignación de fondos.
          </p>
        </div>
      </div>

      {/* 2) RESUMEN EJECUTIVO DE INGRESOS Y TOTAL PRESUPUESTADO */}
      <div className="bg-[#111319] border border-[#232733] rounded-3xl p-6 text-white shadow-bento relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="flex-1 space-y-3 min-w-0">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold uppercase tracking-wider">
              <TrendingUp size={15} className="text-slate-400" />
              <span>Resumen Ejecutivo de Ingresos ({selectedMonth.substring(0, 7)})</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
              {/* Total Ingresos */}
              <div>
                <span className="text-xs text-slate-400 font-medium block">Ingresos Totales</span>
                <span className="text-2xl sm:text-3xl font-bold tracking-tight text-white tabular-nums">
                  {FormatCurrency(incomeShares.totalIncome)}
                </span>
              </div>

              {/* Total Presupuestado (Presupuestos + Cuotas Metas) */}
              <div className="border-t sm:border-t-0 sm:border-l border-[#232733] pt-2 sm:pt-0 sm:pl-4">
                <span className="text-xs text-slate-400 font-medium block">Total Presupuestado</span>
                <span className="text-2xl sm:text-3xl font-bold tracking-tight text-[#10B981] tabular-nums">
                  {FormatCurrency(totalPresupuestado)}
                </span>
                <span className="text-[11px] text-slate-400 block mt-0.5 tabular-nums">
                  Gastos: {FormatCurrency(totalBudgetsAssigned)} • Metas: {FormatCurrency(totalProjectsMonthlyQuota)}
                </span>
              </div>

              {/* Remanente Disponible */}
              <div className="border-t sm:border-t-0 sm:border-l border-[#232733] pt-2 sm:pt-0 sm:pl-4">
                <span className="text-xs text-slate-400 font-medium block">Remanente Libre</span>
                <span className={`text-2xl sm:text-3xl font-bold tracking-tight tabular-nums ${remanente >= 0 ? 'text-white' : 'text-[#F97316]'}`}>
                  {FormatCurrency(remanente)}
                </span>
                <span className="text-[11px] text-slate-400 block mt-0.5">
                  {remanente >= 0 ? 'Disponible para ahorro' : 'Déficit presupuestado'}
                </span>
              </div>
            </div>
          </div>

          {/* Desglose por Integrante */}
          <div className="w-full lg:w-auto lg:min-w-[300px] xl:min-w-[320px] pt-4 lg:pt-0 border-t lg:border-t-0 lg:border-l border-[#232733] lg:pl-6 shrink-0">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
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
                      className="flex items-center justify-between gap-3 p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
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
                          <div className="w-6 h-6 rounded-full bg-slate-800 text-white flex items-center justify-center text-[11px] font-bold shrink-0 border border-white/20 select-none">
                            {initial}
                          </div>
                        )}
                        <span className="text-xs font-medium text-slate-200 truncate">
                          {user.userName}
                        </span>
                      </div>

                      {/* Lado derecho: Monto completo formateado con FormatCurrency + Badge de porcentaje */}
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-mono text-xs font-bold text-white whitespace-nowrap tabular-nums">
                          {FormatCurrency(user.income)}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-slate-300 border border-white/15 whitespace-nowrap tabular-nums">
                          {user.percentage.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-slate-400">No hay integrantes registrados en el hogar.</p>
            )}
          </div>
        </div>

        {incomeShares.totalIncome === 0 && (
          <div className="mt-4 pt-3 border-t border-[#232733] flex items-center gap-2 text-xs text-amber-200 bg-amber-500/10 px-3 py-2 rounded-xl border border-amber-500/20">
            <Info size={15} className="shrink-0 text-amber-400" />
            <span>
              {appContext === 'personal'
                ? 'Aún no hay ingresos personales registrados en este periodo.'
                : 'Aún no hay ingresos registrados este mes. El cálculo opera con aportación equitativa (50/50).'}
            </span>
          </div>
        )}
      </div>

      {/* 3) PESTAÑAS DE NAVEGACIÓN */}
      <div className="flex items-center justify-center sm:justify-start">
        <div className="bg-white border border-[#EEF0F4] rounded-full p-1.5 shadow-sm flex items-center w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setActiveSubTab('budgets')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-full px-5 py-2 font-medium transition-colors duration-150 text-sm ${
              activeSubTab === 'budgets'
                ? 'bg-[#111319] text-white shadow-xs'
                : 'text-[#8C93A6] hover:text-slate-900'
            }`}
          >
            <PieChart size={17} />
            <span>Presupuestos del Mes</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('projects')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-full px-5 py-2 font-medium transition-colors duration-150 text-sm ${
              activeSubTab === 'projects'
                ? 'bg-[#111319] text-white shadow-xs'
                : 'text-[#8C93A6] hover:text-slate-900'
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
          onMonthChange={onMonthChange}
          hideHeader={true}
        />
      ) : (
        <ProjectsView data={data} calc={calc} methods={methods} />
      )}
    </div>
  );
}
