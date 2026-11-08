import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  FolderPlus, 
  Tag, 
  Folder, 
  TrendingUp, 
  Info, 
  Percent, 
  DollarSign,
  ChevronDown,
  ChevronUp,
  PiggyBank,
  ChevronLeft,
  ChevronRight,
  Wallet,
  ArrowDownLeft,
  Receipt
} from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';
import { useAppStore } from '../store/useAppStore';
import { useToastStore } from '../store/useToastStore';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { BudgetForm } from '../components/forms/BudgetForm';
import { FormatCurrency } from '../utils';
import { 
  calculateHouseholdIncomeShares, 
  calculateBudgetAssignedAmount, 
  calculateBudgetSplit,
  resolveBudgetPeriodFromDateRange,
  resolveContextUsers,
  calculateCumulativeBudget,
  saveBudgetMonthlyFundingStored,
  getBudgetMonthlyFundingStored,
  calculateMemberPendingContributions
} from '../utils/budgetCalculations';
import { resolveBudgetIcon } from '../store/slices/dataSlice';
import { filterCategoriesByContext, MemberSlotFilter } from '../services/ownershipService';
import { Category } from '../store/slices/settingsSlice';

const normalize = (amount?: number | null, currency?: string) => {
  if (!amount) return 0;
  return currency === 'USD' ? amount * parseFloat(localStorage.getItem('exchangeRate') || '20') : amount;
};

interface BudgetsViewProps {
  data?: {
    budgets?: any[];
    expenses?: any[];
    incomes?: any[];
    users?: any[];
    [key: string]: any;
  };
  methods?: {
    fetchBudgetsForMonth?: (month: string) => Promise<any> | void;
    addBudget?: (budget: any) => Promise<any> | void;
    updateBudget?: (id: string, budget: any) => Promise<any> | void;
    deleteBudget?: (id: string) => Promise<any> | void;
    copyBudgetsFromPreviousMonth?: (month: string) => Promise<any> | void;
    [key: string]: any;
  };
  appContext?: string;
  hideHeader?: boolean;
  selectedMonth?: string;
  onMonthChange?: (month: string) => void;
}

export function BudgetsView({ 
  data, 
  methods, 
  appContext, 
  hideHeader = false,
  selectedMonth: propSelectedMonth,
  onMonthChange
}: BudgetsViewProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<any | null>(null);
  const [isCategoriesModalOpen, setIsCategoriesModalOpen] = useState(false);
  const [activeModalTab, setActiveModalTab] = useState<'categories' | 'tags'>('categories');
  const [selectedBudgetId, setSelectedBudgetId] = useState<string | null>(null);
  const [isFundingModalOpen, setIsFundingModalOpen] = useState(false);
  const [fundingAmountInput, setFundingAmountInput] = useState('');
  const [fundingRefreshKey, setFundingRefreshKey] = useState(0);

  // Form states for in-situ categories & tags management
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryType, setNewCategoryType] = useState<'EXPENSE' | 'INCOME'>('EXPENSE');
  const [newCategoryColor, setNewCategoryColor] = useState('#6366f1');
  const [newTagName, setNewTagName] = useState('');

  const storeDateRange = useAppStore(state => state.dateRange);
  const activeDateRange = data?.dateRange || storeDateRange;

  const derivedPeriod = useMemo(() => {
    return resolveBudgetPeriodFromDateRange(activeDateRange);
  }, [activeDateRange]);

  const selectedMonth = propSelectedMonth || derivedPeriod;
  const setSelectedMonth = (newMonth: string) => {
    onMonthChange?.(newMonth);
  };

  // Store access for Categories and Tags
  const { 
    categories: storeCategories, 
    tags, 
    addCategory, 
    deleteCategoryItem, 
    addTag, 
    deleteTagItem, 
    refreshSettings 
  } = useAppStore(
    useShallow(state => ({
      categories: state.categories,
      tags: state.tags,
      addCategory: state.addCategory,
      deleteCategoryItem: state.deleteCategoryItem,
      addTag: state.addTag,
      deleteTagItem: state.deleteTagItem,
      refreshSettings: state.refreshSettings
    }))
  );

  const activeUserSlot = (data?.memberSlot || data?.user?.memberSlot || useAppStore.getState().memberSlot || 'USER_A') as MemberSlotFilter;
  const categories = useMemo<Category[]>(() => {
    const sourceCats = data?.categories && data.categories.length > 0 ? data.categories : storeCategories;
    return filterCategoriesByContext<Category>(sourceCats || [], appContext, activeUserSlot);
  }, [data?.categories, storeCategories, appContext, activeUserSlot]);

  useEffect(() => {
    methods?.fetchBudgetsForMonth?.(selectedMonth);
  }, [selectedMonth, methods?.fetchBudgetsForMonth]);

  useEffect(() => {
    if (isCategoriesModalOpen) {
      refreshSettings?.();
    }
  }, [isCategoriesModalOpen, refreshSettings]);

  const handleOpenModal = (budget: any = null) => {
    setEditingBudget(budget);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingBudget(null);
    setIsModalOpen(false);
  };

  const handleSubmit = (formData: any) => {
    const dataWithPeriod = { ...formData, period: selectedMonth };
    if (editingBudget) {
      methods?.updateBudget?.(editingBudget.id, dataWithPeriod);
    } else {
      methods?.addBudget?.(dataWithPeriod);
    }
    handleCloseModal();
  };

  const handleCopyPrevious = () => {
    if (window.confirm('¿Copiar los presupuestos del mes anterior a este mes?')) {
      methods?.copyBudgetsFromPreviousMonth?.(selectedMonth);
    }
  };

  const selectedBudget = useMemo(() => {
    if (!selectedBudgetId) return null;
    return (data?.budgets || []).find((b: any) => b.id === selectedBudgetId) || null;
  }, [selectedBudgetId, data?.budgets]);

  const handleDelete = (id: string) => {
    if (window.confirm('¿Estás seguro de eliminar este presupuesto?')) {
      methods?.deleteBudget?.(id);
      if (selectedBudgetId === id) {
        setSelectedBudgetId(null);
      }
    }
  };

  const handleOpenFundingModal = (budget: any) => {
    const periodKey = derivedPeriod || budget.period || 'current';
    const stored = getBudgetMonthlyFundingStored(budget.id, periodKey);
    const assignedCalc = calculateBudgetAssignedAmount(budget, incomeShares.totalIncome, totalFixedBudgets);
    const initialVal = stored !== null ? stored : assignedCalc.assignedAmount;
    setFundingAmountInput(String(initialVal));
    setIsFundingModalOpen(true);
  };

  const handleSaveFunding = (e: React.FormEvent) => {
    e.preventDefault();
    const currentB = selectedBudget || (data?.budgets || []).find((b: any) => b.id === selectedBudgetId);
    if (!currentB?.id) return;
    const num = parseFloat(fundingAmountInput);
    if (isNaN(num) || num < 0) return;
    const periodKey = derivedPeriod || currentB.period || 'current';
    saveBudgetMonthlyFundingStored(currentB.id, periodKey, num);
    useToastStore.getState().addToast(`Apartado mensual registrado: ${FormatCurrency(num)}`, 'success');
    setIsFundingModalOpen(false);
    setFundingRefreshKey(k => k + 1);
  };

  // Handlers for in-situ modal
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    const catOwnerType = appContext === 'personal' ? (activeUserSlot || 'USER_A') : 'SHARED';
    await addCategory({
      name: newCategoryName.trim(),
      type: newCategoryType,
      color: newCategoryColor,
      ownerType: catOwnerType
    });
    setNewCategoryName('');
  };

  const handleAddTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagName.trim()) return;
    await addTag(newTagName.trim());
    setNewTagName('');
  };

  // Requisitos 1 y 2: Cálculos de ingresos y proporciones del hogar
  const periodIncomes = useMemo(() => {
    return data?.incomes || [];
  }, [data?.incomes]);

  const contextUsers = useMemo(() => {
    return resolveContextUsers(data?.users, data?.user, data?.memberSlot, appContext);
  }, [data?.users, data?.user, data?.memberSlot, appContext]);

  const incomeShares = useMemo(() => {
    return calculateHouseholdIncomeShares(periodIncomes, contextUsers);
  }, [periodIncomes, contextUsers]);

  const totalFixedBudgets = useMemo(() => {
    return (data?.budgets || [])
      .filter(b => b.mode !== 'PERCENTAGE')
      .reduce((sum, b) => sum + Number(b.fixedAmount ?? b.base ?? 0), 0);
  }, [data?.budgets]);

  // =========================================================================
  // NIVEL 2: VISTA DETALLADA DEL PRESUPUESTO (Replicando patrón ProjectsView)
  // =========================================================================
  if (selectedBudgetId && selectedBudget) {
    const assignedCalc = calculateBudgetAssignedAmount(selectedBudget, incomeShares.totalIncome, totalFixedBudgets);
    const assignedAmount = assignedCalc.assignedAmount;
    const currentUid = data?.user?.id || data?.user?.uid;

    const cumulativeCalc = calculateCumulativeBudget({
      budget: selectedBudget,
      allExpenses: data?.expenses || [],
      currentPeriodStart: activeDateRange?.start,
      currentPeriodEnd: activeDateRange?.end,
      monthlyAllocation: assignedAmount,
      initialPeriod: selectedBudget.initialPeriod || selectedBudget.period,
      appContext,
      activeUserId: currentUid,
    });

    const periodExpenses = (data?.expenses || []).filter(e => {
      const matchesCategory = (Boolean(selectedBudget.categoryId) && e.categoryId === selectedBudget.categoryId) ||
        (Boolean(selectedBudget.category) && Boolean(e.category) && selectedBudget.category.toLowerCase() === e.category.toLowerCase());
      const isShared = e.isShared !== undefined ? Boolean(e.isShared) : !e.isPrivate;
      const owner = e.ownerUid || e.userId || e.paidBy;
      const matchesContext = appContext === 'personal'
        ? (!isShared && (!currentUid || owner === currentUid))
        : isShared;
      const d = e.date ? e.date.slice(0, 10) : '';
      const start = activeDateRange?.start || '';
      const end = activeDateRange?.end || '9999-12-31';
      const inRange = !d || (d >= start && d <= end);
      return matchesCategory && matchesContext && inRange;
    });

    const actualSpent = cumulativeCalc.currentSpent;
    const restante = assignedAmount - actualSpent;
    const rawPorcentaje = assignedAmount > 0 
      ? (actualSpent / assignedAmount) * 100 
      : (actualSpent > 0 ? 100 : 0);
    const progressBarWidth = Math.min(Math.max(rawPorcentaje, 0), 100);

    let alertColor = 'bg-emerald-500';
    let alertText = 'text-emerald-600';
    if (rawPorcentaje >= 100) {
      alertColor = 'bg-rose-600';
      alertText = 'text-rose-600 font-black';
    } else if (rawPorcentaje >= 80) {
      alertColor = 'bg-amber-500';
      alertText = 'text-amber-600 font-bold';
    }

    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        {/* Cabecera con Breadcrumbs canónicos estilo ProjectsView */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-500 flex-wrap">
            <button
              type="button"
              onClick={() => setSelectedBudgetId(null)}
              className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 transition-colors font-bold cursor-pointer"
            >
              <ChevronLeft size={18} />
              <span>Volver a Presupuestos</span>
            </button>
            <span className="text-slate-300">/</span>
            <span className="text-slate-900 font-bold truncate max-w-[200px] sm:max-w-xs">
              {selectedBudget.category}
            </span>
            {selectedBudget.isCumulative && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-50 text-teal-700 border border-teal-200/60 ml-1">
                <PiggyBank size={11} className="stroke-[2.5]" />
                Acumulativo
              </span>
            )}
            {selectedBudget.ownerType && selectedBudget.ownerType !== 'SHARED' && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600">
                Privado
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDelete(selectedBudget.id)}
              className="flex items-center gap-1.5 text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200"
            >
              <Trash2 size={15} />
              <span>Eliminar</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleOpenModal(selectedBudget)}
              className="flex items-center gap-1.5"
            >
              <Edit2 size={15} />
              <span>Editar Presupuesto</span>
            </Button>
            <Button
              size="sm"
              onClick={() => handleOpenFundingModal(selectedBudget)}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
            >
              <Plus size={16} />
              <span>+ Apartar Dinero</span>
            </Button>
          </div>
        </div>

        {/* Tarjetas de Balance del Presupuesto (4 métricas) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-5 rounded-3xl border border-slate-100 bg-white shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Meta Asignada</span>
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                {selectedBudget.mode === 'PERCENTAGE' ? <Percent size={16} /> : <DollarSign size={16} />}
              </div>
            </div>
            <p className="text-2xl font-black text-slate-800 tracking-tight">
              {FormatCurrency(assignedAmount)}
            </p>
            <span className="text-xs text-slate-400 mt-1 block">
              {selectedBudget.mode === 'PERCENTAGE' ? `${selectedBudget.percentage}% del Ingreso` : 'Meta mensual asignada'}
            </span>
          </Card>

          <Card className="p-5 rounded-3xl border border-slate-100 bg-white shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Apartado de este Mes</span>
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                <Wallet size={16} />
              </div>
            </div>
            <p className="text-2xl font-black text-emerald-600 tracking-tight">
              {FormatCurrency(cumulativeCalc.currentPeriodFunding)}
            </p>
            <span className="text-xs text-slate-400 mt-1 block">
              {cumulativeCalc.currentPeriodFunding === assignedAmount 
                ? 'Apartado al 100%' 
                : (cumulativeCalc.currentPeriodFunding < assignedAmount ? 'Apartado Parcial' : 'Apartado Extra')}
            </span>
          </Card>

          <Card className="p-5 rounded-3xl border border-slate-100 bg-white shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Gastos del Periodo</span>
              <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
                <TrendingUp size={16} />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-800 tracking-tight">
              {FormatCurrency(actualSpent)}
            </p>
            <span className="text-xs text-slate-400 mt-1 block">
              {periodExpenses.length} {periodExpenses.length === 1 ? 'movimiento' : 'movimientos'}
            </span>
          </Card>

          <Card className="p-5 rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 via-teal-500/10 to-indigo-500/10 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                {selectedBudget.isCumulative ? 'Saldo Acumulado Disponible' : 'Remanente Mes'}
              </span>
              <div className="p-2 bg-emerald-500/20 text-emerald-700 rounded-xl">
                <PiggyBank size={16} />
              </div>
            </div>
            <p className="text-2xl font-black text-emerald-700 tracking-tight">
              {FormatCurrency(selectedBudget.isCumulative ? cumulativeCalc.accumulatedBalance : Math.max(0, restante))}
            </p>
            <span className="text-xs text-emerald-600/80 mt-1 block">
              {selectedBudget.isCumulative 
                ? `${cumulativeCalc.elapsedMonths} ${cumulativeCalc.elapsedMonths === 1 ? 'mes acumulado' : 'meses acumulados'} · Ahorro acumulado` 
                : 'Disponible para gastar'}
            </span>
          </Card>
        </div>

        {/* Barra de progreso de consumo del presupuesto */}
        <Card className="p-6 rounded-3xl border border-slate-100 bg-white shadow-sm space-y-3">
          <div className="flex justify-between items-center text-xs font-bold">
            <span className="text-slate-600">
              Consumido: {rawPorcentaje.toFixed(1)}% ({FormatCurrency(actualSpent)} de {FormatCurrency(cumulativeCalc.currentPeriodFunding)})
            </span>
            <span className={restante < 0 ? 'text-rose-600 font-black' : alertText}>
              Restante: {FormatCurrency(restante)}
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden shadow-inner relative">
            <div 
              className={`h-full transition-all duration-700 ease-out ${alertColor}`} 
              style={{ width: `${progressBarWidth}%` }}
            />
            {rawPorcentaje >= 80 && (
              <div className="absolute top-0 right-0 h-full w-full bg-rose-500/20 animate-pulse pointer-events-none" />
            )}
          </div>
          {selectedBudget.isCumulative && (
            <p className="text-xs text-slate-400 mt-2 flex items-center gap-1.5">
              <Info size={14} className="text-teal-600 shrink-0" />
              <span>
                Presupuesto acumulativo: el saldo no gastado se acumula de forma continua mes con mes como ahorro acumulado.
              </span>
            </p>
          )}
        </Card>

        {/* Listado detallado de movimientos del periodo */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Receipt size={18} className="text-indigo-600" />
              <h3 className="font-bold text-slate-800 text-base">
                Movimientos del Periodo ({periodExpenses.length})
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-medium">
              {activeDateRange?.start ? `${activeDateRange.start} al ${activeDateRange.end}` : derivedPeriod}
            </span>
          </div>

          {periodExpenses.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                <Receipt size={24} />
              </div>
              <p className="text-sm font-bold text-slate-600">Sin movimientos en este periodo</p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                No se han registrado gastos para la categoría &ldquo;{selectedBudget.category}&rdquo; dentro del rango de fechas activo.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {periodExpenses.map((exp: any) => {
                const payerUser = (data?.users || []).find((u: any) => u.id === (exp.ownerUid || exp.userId || exp.paidBy));
                const payerName = payerUser?.displayName || payerUser?.name || 'Usuario';
                const formattedDate = exp.date ? exp.date.slice(0, 10) : 'Fecha no especificada';
                const accountObj = (data?.accounts || []).find((a: any) => a.id === (exp.accountId || exp.sourceAccountId || exp.sourceAccount));
                const accountName = accountObj?.name || 'Cuenta no especificada';

                return (
                  <div key={exp.id} className="py-3.5 flex items-center justify-between gap-4 hover:bg-slate-50/60 px-2 rounded-2xl transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden border border-slate-200">
                        {payerUser?.photoURL || payerUser?.photoUrl ? (
                          <img src={payerUser.photoURL || payerUser.photoUrl} alt={payerName} className="w-full h-full object-cover" />
                        ) : (
                          payerName.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-sm text-slate-800 truncate">
                          {exp.description || exp.category || 'Gasto'}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5 flex-wrap">
                          <span>{formattedDate}</span>
                          <span>•</span>
                          <span className="inline-flex items-center gap-1">
                            <Wallet size={11} />
                            {accountName}
                          </span>
                          <span>•</span>
                          <span>{payerName}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-bold text-sm text-slate-900 block">
                        {FormatCurrency(normalize(exp.amount, exp.currency))}
                      </span>
                      <span className="text-[10px] text-slate-400 font-semibold uppercase">
                        {exp.currency || 'MXN'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal de Apartar Dinero al Presupuesto */}
        <Modal
          isOpen={isFundingModalOpen}
          onClose={() => setIsFundingModalOpen(false)}
          title="Apartar Dinero al Presupuesto"
        >
          <form onSubmit={handleSaveFunding} className="space-y-4">
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-600 space-y-1">
              <div className="flex justify-between">
                <span className="font-medium text-slate-500">Categoría:</span>
                <span className="font-bold text-slate-800">{selectedBudget.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-slate-500">Periodo:</span>
                <span className="font-bold text-slate-800">{derivedPeriod}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-slate-500">Meta Asignada:</span>
                <span className="font-black text-indigo-600">{FormatCurrency(assignedAmount)}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Monto Apartado este Mes ($)
              </label>
              <input
                required
                type="number"
                step="0.01"
                min="0"
                value={fundingAmountInput}
                onChange={(e) => setFundingAmountInput(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-base font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500"
                placeholder="Ej. 120.00"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Indica cuánto dinero apartas para este presupuesto en el mes activo (puedes registrar apartados parciales o totales).
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setIsFundingModalOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                Guardar Apartado
              </Button>
            </div>
          </form>
        </Modal>

        {/* Modal de Presupuesto (Edición) */}
        <Modal 
          isOpen={isModalOpen} 
          onClose={handleCloseModal} 
          title="Editar Presupuesto"
        >
          {isModalOpen && (
            <BudgetForm 
              key={editingBudget?.id || 'edit'} 
              initialData={editingBudget} 
              users={data?.users} 
              onSubmit={handleSubmit} 
              onCancel={handleCloseModal} 
              appContext={appContext} 
            />
          )}
        </Modal>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in">
      {!hideHeader ? (
        <>
          {/* 2. Cabecera y Resumen Ejecutivo Superior */}
          <div className="flex flex-col gap-4 mb-2">
            {/* Fila superior: Título y subtítulo a la izquierda */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-3xl font-black tracking-tight text-slate-800">Presupuestos</h2>
                <p className="text-slate-600 mt-1 font-medium">Guía y plantillas de asignación de fondos.</p>
              </div>
            </div>

            {/* Fila inferior: Botones de acción */}
            <div className="flex flex-wrap gap-2 w-full justify-start sm:justify-end">
              <Button 
                variant="outline" 
                onClick={() => setIsCategoriesModalOpen(true)}
                className="flex-1 sm:flex-none whitespace-nowrap flex items-center gap-2 border-slate-200 hover:bg-slate-50 text-slate-700"
                title="Gestionar Categorías y Etiquetas"
              >
                <FolderPlus size={18} className="text-indigo-600" />
                <span>Categorías / Tags</span>
              </Button>
              <Button 
                variant="outline" 
                onClick={handleCopyPrevious} 
                className="flex-1 sm:flex-none whitespace-nowrap"
              >
                Copiar anterior
              </Button>
              <Button 
                onClick={() => handleOpenModal()} 
                className="flex-1 sm:flex-none whitespace-nowrap"
              >
                <Plus size={18} className="mr-1.5" /> Nuevo
              </Button>
            </div>
          </div>

          {/* Panel / Tarjeta de Resumen Ejecutivo de Ingresos del Periodo */}
          <Card className="bg-gradient-to-br from-slate-900 via-slate-850 to-indigo-950 text-white p-6 rounded-3xl border border-slate-800/80 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-8 -mr-8 w-44 h-44 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold uppercase tracking-wider">
                  <TrendingUp size={15} className="text-indigo-400" />
                  <span>Resumen Ejecutivo de Ingresos ({selectedMonth.substring(0, 7)})</span>
                </div>
                <div className="flex items-baseline gap-2 pt-1">
                  <span className="text-3xl md:text-4xl font-black tracking-tight text-white">
                    {FormatCurrency(incomeShares.totalIncome)}
                  </span>
                  <span className="text-xs text-indigo-300 font-medium">ingresos totales</span>
                </div>
              </div>

              <div className="flex-1 lg:max-w-xl">
                <div className="text-xs font-bold text-indigo-200 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>Desglose por Integrante</span>
                </div>
                
                {incomeShares.userShares.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {incomeShares.userShares.map((user) => (
                      <div 
                        key={user.userId}
                        className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 border border-white/10 flex items-center justify-between shadow-xs"
                      >
                        <div className="truncate mr-2">
                          <p className="text-xs font-medium text-indigo-200 truncate">{user.userName}</p>
                          <p className="text-sm font-bold text-white">{FormatCurrency(user.income)}</p>
                        </div>
                        <span className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-black bg-indigo-500/30 text-indigo-100 border border-indigo-400/25 shrink-0">
                          {user.percentage.toFixed(1)}%
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-indigo-200">No hay integrantes registrados en el hogar.</p>
                )}
              </div>
            </div>

            {incomeShares.totalIncome === 0 && (
              <div className="mt-4 pt-4 border-t border-white/10 flex items-center gap-2.5 text-xs text-amber-200 bg-amber-500/10 px-3.5 py-2.5 rounded-xl border border-amber-500/20">
                <Info size={16} className="shrink-0 text-amber-400" />
                <span>
                  {appContext === 'personal'
                    ? 'Aún no hay ingresos personales registrados en este periodo.'
                    : 'Aún no hay ingresos registrados este mes. El cálculo opera con aportación equitativa (50/50).'}
                </span>
              </div>
            )}
          </Card>
        </>
      ) : (
        /* Barra de acciones cuando la cabecera reside en PlanningView */
        <div className="flex flex-wrap gap-2 w-full justify-start sm:justify-end mb-2">
          <Button 
            variant="outline" 
            onClick={() => setIsCategoriesModalOpen(true)}
            className="flex-1 sm:flex-none whitespace-nowrap flex items-center gap-2 border-slate-200 hover:bg-slate-50 text-slate-700"
            title="Gestionar Categorías y Etiquetas"
          >
            <FolderPlus size={18} className="text-indigo-600" />
            <span>Categorías / Tags</span>
          </Button>
          <Button 
            variant="outline" 
            onClick={handleCopyPrevious} 
            className="flex-1 sm:flex-none whitespace-nowrap"
          >
            Copiar anterior
          </Button>
          <Button 
            onClick={() => handleOpenModal()} 
            className="flex-1 sm:flex-none whitespace-nowrap"
          >
            <Plus size={18} className="mr-1.5" /> Nuevo
          </Button>
        </div>
      )}

      {/* 3. Tarjetas de Presupuesto Rediseñadas */}
      {(data?.budgets || []).length === 0 ? (
        <Card className="text-center py-12 px-4 border-dashed border-2 border-slate-200 rounded-3xl">
          <div className="max-w-md mx-auto space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 mx-auto flex items-center justify-center">
              <FolderPlus size={24} />
            </div>
            <h3 className="font-bold text-slate-800 text-lg">No hay presupuestos para este periodo</h3>
            <p className="text-sm text-slate-500">
              Crea un presupuesto para este mes o copia la estructura del mes anterior para comenzar.
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <Button variant="outline" onClick={handleCopyPrevious}>Copiar anterior</Button>
              <Button onClick={() => handleOpenModal()}>
                <Plus size={16} className="mr-1" /> Crear presupuesto
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {(data?.budgets || []).map(budget => {
            // Requisito 1: Cálculos por presupuesto
            const assignedCalc = calculateBudgetAssignedAmount(budget, incomeShares.totalIncome, totalFixedBudgets);
            const assignedAmount = assignedCalc.assignedAmount;

            const computedSpent = (data?.expenses || [])
              .filter(e => {
                const matchesCategory = Boolean(budget.categoryId && e.categoryId === budget.categoryId);
                const matchesOwner = (!budget.ownerType || budget.ownerType === 'SHARED') ? !e.isPrivate : Boolean(e.isPrivate);
                return matchesCategory && matchesOwner;
              })
              .reduce((acc, curr) => acc + normalize(curr.amount, curr.currency), 0);
            
            const actualSpent = computedSpent > 0 ? computedSpent : 0;

            const currentUid = data?.user?.id || data?.user?.uid;
            const cumulativeCalc = calculateCumulativeBudget({
              budget,
              allExpenses: data?.expenses || [],
              currentPeriodStart: activeDateRange?.start,
              currentPeriodEnd: activeDateRange?.end,
              monthlyAllocation: assignedAmount,
              initialPeriod: budget.initialPeriod || budget.period,
              appContext,
              activeUserId: currentUid,
            });

            const periodExpenses = (data?.expenses || []).filter(e => {
              const matchesCategory = (Boolean(budget.categoryId) && e.categoryId === budget.categoryId) ||
                (Boolean(budget.category) && Boolean(e.category) && budget.category.toLowerCase() === e.category.toLowerCase());
              const isShared = e.isShared !== undefined ? Boolean(e.isShared) : !e.isPrivate;
              const owner = e.ownerUid || e.userId || e.paidBy;
              const matchesContext = appContext === 'personal'
                ? (!isShared && (!currentUid || owner === currentUid))
                : isShared;
              const d = e.date ? e.date.slice(0, 10) : '';
              const start = activeDateRange?.start || '';
              const end = activeDateRange?.end || '9999-12-31';
              const inRange = !d || (d >= start && d <= end);
              return matchesCategory && matchesContext && inRange;
            });

            const manualContrib = budget.splitType === 'CUSTOM' && budget.customUserId 
              ? { userId: budget.customUserId, amount: Number(budget.customUserAmount) || 0 } 
              : null;

            const pendingContributions = calculateMemberPendingContributions({
              assignedAmount,
              userShares: incomeShares.userShares,
              manualContribution: manualContrib,
              periodExpenses,
              users: contextUsers || data?.users || [],
              ownerType: budget.ownerType,
              appContext,
              activeUserId: currentUid,
            });

            const restante = assignedAmount - actualSpent;
            const rawPorcentaje = assignedAmount > 0 
              ? (actualSpent / assignedAmount) * 100 
              : (actualSpent > 0 ? 100 : 0);
            const progressBarWidth = Math.min(Math.max(rawPorcentaje, 0), 100);

            // Semáforo de colores según porcentaje consumido (< 80% verde, 80-99% amarillo, >= 100% rojo)
            let alertColor = 'bg-emerald-500';
            let alertText = 'text-emerald-600';
            if (rawPorcentaje >= 100) {
              alertColor = 'bg-rose-600';
              alertText = 'text-rose-600 font-black';
            } else if (rawPorcentaje >= 80) {
              alertColor = 'bg-amber-500';
              alertText = 'text-amber-600 font-bold';
            }

            return (
              <Card 
                key={budget.id} 
                className="hover:border-indigo-200 transition-all duration-200 group cursor-default rounded-3xl p-5 shadow-sm border border-slate-100 bg-white space-y-4"
              >
                {/* BLOQUE 1 (CABECERA): Icono + Nombre a la izquierda, Editar/Eliminar a la derecha */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="text-xl bg-slate-50 p-2 rounded-xl group-hover:scale-105 group-hover:bg-indigo-50 transition-all duration-300 shrink-0">
                      {resolveBudgetIcon(budget.icon, budget.category)}
                    </div>
                    <h3 className="font-bold text-slate-800 text-base tracking-tight truncate">
                      {budget.category}
                    </h3>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button 
                      type="button"
                      onClick={() => handleOpenModal(budget)} 
                      className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                      title="Editar presupuesto"
                    >
                      <Edit2 size={15} />
                    </button>
                    <button 
                      type="button"
                      onClick={() => handleDelete(budget.id)} 
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Eliminar presupuesto"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                {/* BLOQUE 2 (HERO Y CONTEXTO DEL MES) */}
                <div>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                      {budget.isCumulative ? 'DISPONIBLE ACUMULADO' : 'DISPONIBLE ESTE MES'}
                    </span>
                    <div className={`text-3xl font-extrabold tracking-tight mt-0.5 ${
                      budget.isCumulative 
                        ? 'text-emerald-600' 
                        : (restante < 0 ? 'text-rose-600' : 'text-slate-900')
                    }`}>
                      {FormatCurrency(budget.isCumulative ? cumulativeCalc.accumulatedBalance : Math.max(0, restante))}
                    </div>
                  </div>

                  {/* Barra de progreso delgada y elegante */}
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden mt-3 relative">
                    <div 
                      className={`h-full transition-all duration-500 ease-out ${alertColor}`} 
                      style={{ width: `${progressBarWidth}%` }}
                    />
                  </div>

                  {/* Renglón sutil bajo la barra */}
                  <div className="flex justify-between items-center text-xs text-slate-400 mt-1.5">
                    <span>
                      Meta: <strong className="font-semibold text-slate-600">{FormatCurrency(assignedAmount)}{budget.isCumulative ? '/mes' : ''}</strong>
                    </span>
                    <span>
                      Gastado: <strong className="font-semibold text-slate-600">{FormatCurrency(actualSpent)}</strong>
                    </span>
                  </div>
                </div>

                {/* BLOQUE 3 (FOOTER UNIFICADO - UNA SOLA LÍNEA DIVISORIA) */}
                <div className="border-t border-slate-100 mt-4 pt-3 flex items-center justify-between gap-3">
                  {/* Izquierda: Aportación por integrante */}
                  <div className="flex items-center gap-3 min-w-0 flex-wrap">
                    {pendingContributions.map((member) => (
                      <div key={member.userId} className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
                        <div className="w-5 h-5 rounded-full bg-slate-200 overflow-hidden flex items-center justify-center font-bold text-[9px] text-slate-700 shrink-0 border border-slate-300">
                          {member.photoURL ? (
                            <img
                              src={member.photoURL}
                              alt={member.userName}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span>{member.userName.charAt(0).toUpperCase()}</span>
                          )}
                        </div>
                        <span className="truncate max-w-[80px]">
                          {member.userName.split(' ')[0]}:
                        </span>
                        {member.isFullyCovered ? (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                            $0
                          </span>
                        ) : (
                          <span className="font-bold text-slate-800">
                            {FormatCurrency(member.pendingAmount)}
                          </span>
                        )}
                      </div>
                    ))}
                    {pendingContributions.length === 0 && (
                      <span className="text-xs text-slate-400">Sin integrantes</span>
                    )}
                  </div>

                  {/* Derecha: Enlace al detalle del presupuesto */}
                  <button
                    type="button"
                    onClick={() => setSelectedBudgetId(budget.id)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors shrink-0 group cursor-pointer"
                  >
                    <span className="hidden sm:inline">Movimientos del periodo</span>
                    <span className="sm:hidden">Movimientos</span>
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 group-hover:bg-indigo-50 group-hover:text-indigo-700 transition-colors">
                      {periodExpenses.length}
                    </span>
                    <ChevronRight size={15} className="text-slate-400 group-hover:text-indigo-600 transition-colors" />
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* 4. Modal In-Situ de Gestión de Categorías y Etiquetas */}
      <Modal 
        isOpen={isCategoriesModalOpen} 
        onClose={() => setIsCategoriesModalOpen(false)} 
        title="Categorías y Etiquetas"
      >
        <div className="space-y-5">
          {/* Tabs */}
          <div className="flex border-b border-slate-200">
            <button
              type="button"
              onClick={() => setActiveModalTab('categories')}
              className={`flex items-center gap-2 pb-2.5 px-4 font-bold text-sm border-b-2 transition-colors ${
                activeModalTab === 'categories'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Folder size={16} />
              <span>Categorías ({categories?.length || 0})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveModalTab('tags')}
              className={`flex items-center gap-2 pb-2.5 px-4 font-bold text-sm border-b-2 transition-colors ${
                activeModalTab === 'tags'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Tag size={16} />
              <span>Etiquetas ({tags?.length || 0})</span>
            </button>
          </div>

          {/* Tab Categorías */}
          {activeModalTab === 'categories' && (
            <div className="space-y-4">
              <form onSubmit={handleAddCategory} className="flex flex-col sm:flex-row gap-2.5 items-end p-3.5 border border-slate-100 rounded-2xl bg-slate-50">
                <div className="flex-1 w-full">
                  <label className="block text-xs font-bold text-slate-600 mb-1">Nombre</label>
                  <input 
                    required 
                    type="text" 
                    value={newCategoryName} 
                    onChange={e => setNewCategoryName(e.target.value)} 
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500" 
                    placeholder="Ej. Despensa, Servicios..." 
                  />
                </div>
                <div className="w-full sm:w-28">
                  <label className="block text-xs font-bold text-slate-600 mb-1">Tipo</label>
                  <select 
                    value={newCategoryType} 
                    onChange={e => setNewCategoryType(e.target.value as 'EXPENSE' | 'INCOME')} 
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="EXPENSE">Gasto</option>
                    <option value="INCOME">Ingreso</option>
                  </select>
                </div>
                <div className="w-full sm:w-16">
                  <label className="block text-xs font-bold text-slate-600 mb-1">Color</label>
                  <input 
                    type="color" 
                    value={newCategoryColor} 
                    onChange={e => setNewCategoryColor(e.target.value)} 
                    className="w-full h-[38px] cursor-pointer bg-white border border-slate-200 rounded-xl p-1" 
                  />
                </div>
                <Button type="submit" className="w-full sm:w-auto h-[38px] px-3">
                  <Plus size={16} />
                </Button>
              </form>

              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {categories?.map(c => (
                  <div 
                    key={c.id} 
                    className="flex items-center justify-between p-3 border border-slate-100 rounded-xl bg-white hover:bg-slate-50 transition-colors shadow-2xs"
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded-full shrink-0 shadow-xs" 
                        style={{ backgroundColor: c.color || '#6366f1' }} 
                      />
                      <div>
                        <p className="font-bold text-sm text-slate-800">{c.name}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                          {c.type === 'EXPENSE' ? 'Gasto' : 'Ingreso'}
                        </p>
                      </div>
                    </div>
                    <button 
                      type="button"
                      onClick={() => deleteCategoryItem(c.id)} 
                      className="text-slate-400 hover:text-rose-600 p-2 rounded-lg hover:bg-rose-50 transition-colors"
                      title="Eliminar categoría"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
                {(!categories || categories.length === 0) && (
                  <p className="text-sm text-slate-500 text-center py-6">No hay categorías configuradas.</p>
                )}
              </div>
            </div>
          )}

          {/* Tab Etiquetas */}
          {activeModalTab === 'tags' && (
            <div className="space-y-4">
              <form onSubmit={handleAddTag} className="flex gap-2">
                <input 
                  type="text" 
                  value={newTagName} 
                  onChange={e => setNewTagName(e.target.value)} 
                  placeholder="Nueva etiqueta (ej. #Vacaciones, #Mascota)" 
                  className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <Button type="submit" className="whitespace-nowrap flex items-center gap-1.5">
                  <Plus size={16} /> Agregar
                </Button>
              </form>

              <div className="flex flex-wrap gap-2 max-h-64 overflow-y-auto p-1">
                {tags?.map(t => (
                  <div 
                    key={t.id} 
                    className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-full text-xs font-semibold border border-indigo-100 shadow-2xs"
                  >
                    <span>#{t.name.replace(/^#/, '')}</span>
                    <button 
                      type="button"
                      onClick={() => deleteTagItem(t.id)} 
                      className="text-indigo-400 hover:text-rose-600 transition-colors ml-0.5"
                      title="Eliminar etiqueta"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
                {(!tags || tags.length === 0) && (
                  <p className="text-sm text-slate-500 text-center py-6 w-full">Aún no has creado ninguna etiqueta.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* 5. Modal de Presupuesto */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        title={editingBudget ? "Editar Presupuesto" : "Nuevo Presupuesto"}
      >
        {isModalOpen && (
          <BudgetForm 
            key={editingBudget?.id || 'new'} 
            initialData={editingBudget} 
            users={data?.users} 
            onSubmit={handleSubmit} 
            onCancel={handleCloseModal} 
            appContext={appContext} 
          />
        )}
      </Modal>
    </div>
  );
}
