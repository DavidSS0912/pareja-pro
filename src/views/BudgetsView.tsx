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
  DollarSign 
} from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';
import { useAppStore } from '../store/useAppStore';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { BudgetForm } from '../components/forms/BudgetForm';
import { FormatCurrency } from '../utils';
import { 
  calculateHouseholdIncomeShares, 
  calculateBudgetAssignedAmount, 
  calculateBudgetSplit 
} from '../utils/budgetCalculations';
import { resolveBudgetIcon } from '../store/slices/dataSlice';

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

  // Form states for in-situ categories & tags management
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryType, setNewCategoryType] = useState<'EXPENSE' | 'INCOME'>('EXPENSE');
  const [newCategoryColor, setNewCategoryColor] = useState('#6366f1');
  const [newTagName, setNewTagName] = useState('');

  const [localSelectedMonth, setLocalSelectedMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
  });

  const selectedMonth = propSelectedMonth || localSelectedMonth;
  const setSelectedMonth = (newMonth: string) => {
    setLocalSelectedMonth(newMonth);
    onMonthChange?.(newMonth);
  };

  // Store access for Categories and Tags
  const { 
    categories, 
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

  const handleDelete = (id: string) => {
    if (window.confirm('¿Estás seguro de eliminar este presupuesto?')) {
      methods?.deleteBudget?.(id);
    }
  };

  // Handlers for in-situ modal
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    await addCategory({
      name: newCategoryName.trim(),
      type: newCategoryType,
      color: newCategoryColor,
      ownerType: 'SHARED'
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
    const sourceIncomes = data?.allIncomes || data?.rawIncomes || data?.incomes || [];
    return sourceIncomes.filter(
      inc => !selectedMonth || String(inc.date || '').substring(0, 7) === selectedMonth.substring(0, 7)
    );
  }, [data?.allIncomes, data?.rawIncomes, data?.incomes, selectedMonth]);

  const incomeShares = useMemo(() => {
    return calculateHouseholdIncomeShares(periodIncomes, data?.users);
  }, [periodIncomes, data?.users]);

  const totalFixedBudgets = useMemo(() => {
    return (data?.budgets || [])
      .filter(b => b.mode !== 'PERCENTAGE')
      .reduce((sum, b) => sum + Number(b.fixedAmount ?? b.base ?? 0), 0);
  }, [data?.budgets]);

  return (
    <div className="space-y-6 animate-in">
      {!hideHeader ? (
        <>
          {/* 2. Cabecera y Resumen Ejecutivo Superior */}
          <div className="flex flex-col gap-4 mb-2">
            {/* Fila superior: Título y subtítulo a la izquierda, selector de mes a la derecha */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-3xl font-black tracking-tight text-slate-800">Presupuestos</h2>
                <p className="text-slate-600 mt-1 font-medium">Guía y plantillas de asignación de fondos.</p>
              </div>
              <input 
                type="month" 
                className="px-4 py-2 bg-white border border-slate-200 rounded-xl font-medium text-slate-700 w-full sm:w-auto focus:ring-2 focus:ring-primary focus:border-primary shadow-xs"
                value={selectedMonth.substring(0, 7)}
                onChange={(e) => {
                  if (e.target.value) {
                    setSelectedMonth(`${e.target.value}-01`);
                  }
                }}
              />
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
                <span>Aún no hay ingresos registrados este mes. El cálculo opera con aportación equitativa (50/50).</span>
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

            const manualContrib = budget.splitType === 'CUSTOM' && budget.customUserId 
              ? { userId: budget.customUserId, amount: Number(budget.customUserAmount) || 0 } 
              : null;
            const splitCalc = calculateBudgetSplit(assignedAmount, incomeShares.userShares, manualContrib);

            let budgetSplits = splitCalc.splits;
            if (budget.ownerType && budget.ownerType !== 'SHARED') {
              const ownerUser = (data?.users || []).find((u: any) => u.memberSlot === budget.ownerType || u.id === budget.ownerType) || (data?.users || [])[0];
              if (ownerUser) {
                budgetSplits = [{
                  userId: ownerUser.id,
                  userName: ownerUser.name || ownerUser.displayName || ownerUser.email,
                  contribution: assignedAmount,
                  ratio: 1,
                  percentage: 100,
                  isManual: true
                }];
              }
            }

            const computedSpent = (data?.expenses || [])
              .filter(e => {
                const matchesCategory = Boolean(budget.categoryId && e.categoryId === budget.categoryId);
                const matchesPeriod = String(e.date || '').substring(0, 7) === String(budget.period || selectedMonth).substring(0, 7);
                const matchesOwner = (!budget.ownerType || budget.ownerType === 'SHARED') ? !e.isPrivate : Boolean(e.isPrivate);
                return matchesCategory && matchesPeriod && matchesOwner;
              })
              .reduce((acc, curr) => acc + normalize(curr.amount, curr.currency), 0);
            
            const actualSpent = computedSpent > 0 ? computedSpent : 0;
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
                className="hover:border-indigo-200 transition-all duration-200 group cursor-default relative rounded-3xl p-6 shadow-sm border border-slate-100 bg-white"
              >
                {/* Botones de acción Editar / Eliminar */}
                <div className="absolute top-4 right-4 flex items-center gap-1.5 z-20">
                  <button 
                    onClick={() => handleOpenModal(budget)} 
                    className="p-1.5 bg-white text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg shadow-xs border border-slate-200 transition-colors"
                    title="Editar presupuesto"
                  >
                    <Edit2 size={15} />
                  </button>
                  <button 
                    onClick={() => handleDelete(budget.id)} 
                    className="p-1.5 bg-white text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg shadow-xs border border-slate-200 transition-colors"
                    title="Eliminar presupuesto"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>

                {/* Encabezado de la tarjeta con Icono, Nombre y Badges Híbridos */}
                <div className="flex items-start gap-4 mb-5">
                  <div className="text-3xl bg-slate-100 p-3.5 rounded-2xl group-hover:scale-105 group-hover:bg-indigo-50 transition-all duration-300 shrink-0">
                    {resolveBudgetIcon(budget.icon, budget.category)}
                  </div>
                  <div className="flex-1 pr-16">
                    <h3 className="font-bold text-slate-800 text-lg tracking-tight line-clamp-1">
                      {budget.category}
                    </h3>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      {/* Badge distintivo del modelo */}
                      {budget.mode === 'PERCENTAGE' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                          <Percent size={11} className="stroke-[2.5]" />
                          {budget.percentage}% del Ingreso
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                          <DollarSign size={11} className="stroke-[2.5]" />
                          $ Meta Fija
                        </span>
                      )}
                      {budget.ownerType && budget.ownerType !== 'SHARED' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600">
                          Privado
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Grid métrico: Asignado Mes vs Total Gastado */}
                <div className="grid grid-cols-2 gap-2 text-xs p-3.5 bg-slate-50 rounded-2xl mb-4 text-center border border-slate-100">
                  <div>
                    <span className="block text-slate-500 font-medium mb-1">Asignado Mes</span>
                    <span className="font-black text-slate-800 text-sm">{FormatCurrency(assignedAmount)}</span>
                  </div>
                  <div className="border-l border-slate-200">
                    <span className="block text-slate-500 font-medium mb-1">Total Gastado</span>
                    <span className="font-bold text-slate-700 text-sm">{FormatCurrency(actualSpent)}</span>
                  </div>
                </div>

                {/* Barra de progreso y estado de consumo */}
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-600">Consumido: {rawPorcentaje.toFixed(1)}%</span>
                    <span className={restante < 0 ? 'text-rose-600 font-black' : alertText}>
                      Restante: {FormatCurrency(restante)}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden shadow-inner relative">
                    <div 
                      className={`h-full transition-all duration-700 ease-out ${alertColor}`} 
                      style={{ width: `${progressBarWidth}%` }}
                    />
                    {rawPorcentaje >= 80 && (
                      <div className="absolute top-0 right-0 h-full w-full bg-rose-500/20 animate-pulse pointer-events-none" />
                    )}
                  </div>
                </div>

                {/* Desglose de aportación por integrante */}
                {budgetSplits.length > 0 && (
                  <div className="pt-3 border-t border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                      Aportación por Integrante
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {budgetSplits.map(split => {
                        const splitUser = (data?.users || []).find((u: any) => u.id === split.userId);
                        const userPhoto = splitUser?.photoURL || splitUser?.photoUrl;
                        const userName = splitUser?.displayName || splitUser?.name || split.userName || 'Usuario';
                        const initial = userName.charAt(0).toUpperCase();

                        return (
                          <div 
                            key={split.userId}
                            className="flex items-center justify-between px-2.5 py-1.5 bg-slate-50/80 rounded-xl border border-slate-100 text-xs"
                          >
                            <div className="flex items-center gap-2 truncate mr-2">
                              <div className="w-7 h-7 rounded-full bg-slate-200 overflow-hidden flex items-center justify-center font-bold text-xs text-slate-700 shrink-0 border border-slate-300">
                                {userPhoto ? (
                                  <img
                                    src={userPhoto}
                                    alt={userName}
                                    referrerPolicy="no-referrer"
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <span>{initial}</span>
                                )}
                              </div>
                              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                                split.isManual 
                                  ? 'bg-amber-100 text-amber-800' 
                                  : 'bg-indigo-100 text-indigo-700'
                              }`}>
                                {split.isManual ? 'Fija' : 'Proporcional'}
                              </span>
                            </div>
                            <span className="font-bold text-slate-900 shrink-0">
                              {FormatCurrency(split.contribution)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
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
