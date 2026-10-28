import React, { useRef, useState, useMemo } from 'react';
import { Card } from '../components/ui/Card';
import { FormatCurrency, exportToCSV } from '../utils';
import { Download, BarChart2, Table as TableIcon, Trash2, Edit2, AlertCircle, ArrowLeftRight } from 'lucide-react';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';

const CATEGORY_COLORS = [
  'bg-emerald-500', 'bg-blue-500', 'bg-rose-500', 'bg-amber-500',
  'bg-purple-500', 'bg-cyan-500', 'bg-pink-500', 'bg-orange-500',
  'bg-teal-500', 'bg-indigo-500', 'bg-fuchsia-500', 'bg-lime-500'
];

export function HistoricalView({ data, methods }: any) {
  const { expenses = [], incomes = [], users = [], transfers = [] } = data || {};

  const [deselectedUsers, setDeselectedUsers] = useState<Set<string>>(new Set());
  const [deselectedCategories, setDeselectedCategories] = useState<Set<string>>(new Set());
  const [movementFilter, setMovementFilter] = useState<'all' | 'incomes' | 'expenses' | 'transfers'>('all');
  const [viewMode, setViewMode] = useState<'graph' | 'table'>('graph');
  const [selectedRecords, setSelectedRecords] = useState<Set<string>>(new Set());
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const categories = useMemo(() => {
    const cats = new Set<string>();
    expenses.forEach((e: any) => cats.add(e.category || 'Otros'));
    incomes.forEach((i: any) => cats.add(i.category || i.source || 'Otros'));
    return Array.from(cats).sort();
  }, [expenses, incomes]);

  const categoryColorMap = useMemo(() => {
    const map: Record<string, string> = {};
    categories.forEach((cat, idx) => {
      map[cat] = CATEGORY_COLORS[idx % CATEGORY_COLORS.length];
    });
    return map;
  }, [categories]);

  const toggleCategory = (cat: string) => {
    setDeselectedCategories(prev => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDown, setIsDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!scrollRef.current) return;
    setIsDown(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };
  const handleMouseLeave = () => setIsDown(false);
  const handleMouseUp = () => setIsDown(false);
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDown || !scrollRef.current) return;
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  const toggleUser = (userId: string) => {
    setDeselectedUsers(prev => {
      const next = new Set(prev);
      if (next.has(userId)) {
        next.delete(userId);
      } else {
        next.add(userId);
      }
      return next;
    });
  };

  const filteredExpenses = useMemo(() => {
    return expenses.filter((e: any) => {
      if (e.userId && deselectedUsers.has(e.userId)) return false;
      if (e.paidBy && deselectedUsers.has(e.paidBy)) return false;
      if (e.ownerUid && deselectedUsers.has(e.ownerUid)) return false;
      const cat = e.category || 'Otros';
      if (deselectedCategories.has(cat)) return false;
      return true;
    });
  }, [expenses, deselectedUsers, deselectedCategories]);

  const filteredIncomes = useMemo(() => {
    return incomes.filter((i: any) => {
      if (i.userId && deselectedUsers.has(i.userId)) return false;
      if (i.ownerUid && deselectedUsers.has(i.ownerUid)) return false;
      const cat = i.category || i.source || 'Otros';
      if (deselectedCategories.has(cat)) return false;
      return true;
    });
  }, [incomes, deselectedUsers, deselectedCategories]);

  const filteredTransfers = useMemo(() => {
    const start = methods?.dateRange?.start;
    const end = methods?.dateRange?.end;
    return (transfers || []).filter((t: any) => {
      const uid = t.userId || t.ownerUid;
      if (uid && deselectedUsers.has(uid)) return false;
      const dateStr = t.date ? t.date.slice(0, 10) : null;
      if (start && dateStr && dateStr < start) return false;
      if (end && dateStr && dateStr > end) return false;
      return true;
    });
  }, [transfers, deselectedUsers, methods?.dateRange]);

  const detailedRecords = useMemo(() => {
    const expRecords = filteredExpenses.map((e: any) => ({
      ...e,
      id: e.id,
      date: e.date,
      recordType: 'expense',
      typeLabel: 'Gasto',
      category: e.category || 'Otros',
      description: e.description || '',
      amount: Math.abs(Number(e.amount) || 0),
      sourceAccountName: '',
      targetAccountName: '',
      userId: e.userId || e.paidBy || e.ownerUid || '',
    }));

    const incRecords = filteredIncomes.map((i: any) => ({
      ...i,
      id: i.id,
      date: i.date,
      recordType: 'income',
      typeLabel: 'Ingreso',
      category: i.category || i.source || 'Otros',
      description: i.description || '',
      amount: Math.abs(Number(i.amount) || 0),
      sourceAccountName: '',
      targetAccountName: '',
      userId: i.userId || i.ownerUid || '',
    }));

    const trRecords = filteredTransfers.map((t: any) => ({
      id: t.id,
      date: t.date,
      recordType: 'transfer',
      type: t.type,
      typeLabel: t.type === 'CARD_PAYMENT' ? 'Pago de Tarjeta' : 'Transferencia',
      category: `${t.sourceAccountName || 'Origen'} → ${t.targetAccountName || 'Destino'}`,
      description: t.description || '',
      amount: t.amount,
      sourceAccountName: t.sourceAccountName || '',
      targetAccountName: t.targetAccountName || '',
      userId: t.ownerUid || t.userId || '',
      ...t
    }));

    let combined: any[] = [];
    if (movementFilter === 'incomes') {
      combined = incRecords;
    } else if (movementFilter === 'expenses') {
      combined = expRecords;
    } else if (movementFilter === 'transfers') {
      combined = trRecords;
    } else {
      combined = [...expRecords, ...incRecords, ...trRecords];
    }

    return combined.sort((a, b) => {
      const dateA = a.date || '';
      const dateB = b.date || '';
      return dateB.localeCompare(dateA); // Descending
    });
  }, [filteredExpenses, filteredIncomes, filteredTransfers, movementFilter]);

  const handleExportCSV = () => {
    exportToCSV(detailedRecords, 'historial_orbita2');
  };

  const expensesByCategory = useMemo(() => {
    const totals: Record<string, number> = {};
    let totalExpense = 0;
    (filteredExpenses || []).forEach((e: any) => {
      const amt = Number(e.amount) || 0;
      const cat = e.category || 'Otros';
      totals[cat] = (totals[cat] || 0) + amt;
      totalExpense += amt;
    });
    return Object.entries(totals)
      .map(([name, amount]) => ({
        name,
        amount,
        percentage: totalExpense > 0 ? (amount / totalExpense) * 100 : 0
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [filteredExpenses]);

  const snapshots = useMemo(() => {
    const monthlyData: Record<string, { income: number; expense: number; count: number; incomeByCategory: Record<string, number>; expenseByCategory: Record<string, number> }> = {};
    
    (filteredExpenses || []).forEach((e: any) => {
      if (!e?.date) return;
      const month = e.date.substring(0, 7);
      if (!monthlyData[month]) monthlyData[month] = { income: 0, expense: 0, count: 0, incomeByCategory: {}, expenseByCategory: {} };
      const amt = Number(e.amount) || 0;
      monthlyData[month].expense += amt;
      monthlyData[month].count += 1;
      const cat = e.category || 'Otros';
      monthlyData[month].expenseByCategory[cat] = (monthlyData[month].expenseByCategory[cat] || 0) + amt;
    });

    (filteredIncomes || []).forEach((i: any) => {
      if (!i?.date) return;
      const month = i.date.substring(0, 7);
      if (!monthlyData[month]) monthlyData[month] = { income: 0, expense: 0, count: 0, incomeByCategory: {}, expenseByCategory: {} };
      const amt = Number(i.amount) || 0;
      monthlyData[month].income += amt;
      monthlyData[month].count += 1;
      const cat = i.category || i.source || 'Otros';
      monthlyData[month].incomeByCategory[cat] = (monthlyData[month].incomeByCategory[cat] || 0) + amt;
    });

    return Object.entries(monthlyData)
      .sort(([monthA], [monthB]) => monthA.localeCompare(monthB))
      .map(([month, data]) => {
        const [year, m] = month.split('-');
        const dateObj = new Date(Number(year), Number(m) - 1);
        const monthName = dateObj.toLocaleString('es-ES', { month: 'short' });
        const displayMonth = `${monthName.charAt(0).toUpperCase() + monthName.slice(1)} ${year.substring(2)}`;

        return {
          month: displayMonth,
          rawMonth: month,
          income: data.income,
          expense: data.expense,
          count: data.count,
          incomeByCategory: data.incomeByCategory,
          expenseByCategory: data.expenseByCategory,
          balance: data.income - data.expense,
          margin: data.income > 0 ? ((data.income - data.expense) / data.income) * 100 : 0
        };
      });
  }, [filteredExpenses, filteredIncomes]);

  const maxVal = snapshots.length > 0 
    ? Math.max(1, ...snapshots.map(s => Math.max(s.income, s.expense))) 
    : 1;

  return (
    <div className="space-y-6 animate-in">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-slate-800">Histórico Anual</h2>
          <p className="text-slate-600 mt-2 font-medium">Comparativa de ingresos vs gastos por mes.</p>
        </div>
        
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 bg-white p-3 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider hidden md:block">Periodo:</span>
            <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-full flex-1 md:flex-none">
              <input 
                type="date" 
                value={methods?.dateRange?.start || ''} 
                onChange={e => methods?.setDateRange?.(e.target.value, methods?.dateRange?.end || '')} 
                className="px-3 py-2 bg-transparent text-sm font-medium text-slate-700 outline-none transition-all tabular-nums tracking-tight w-full" 
                aria-label="Fecha inicial" 
              />
              <span className="text-slate-300 font-bold">-</span>
              <input 
                type="date" 
                value={methods?.dateRange?.end || ''} 
                onChange={e => methods?.setDateRange?.(methods?.dateRange?.start || '', e.target.value)} 
                className="px-3 py-2 bg-transparent text-sm font-medium text-slate-700 outline-none transition-all tabular-nums tracking-tight w-full" 
                aria-label="Fecha final" 
              />
            </div>
          </div>
          <button
            onClick={handleExportCSV}
            className="flex items-center justify-center w-full md:w-auto gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            Exportar CSV
          </button>
        </div>
      </div>

      {/* Panel Superior de Controles y Filtros */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 space-y-4">
        {/* Fila superior: Selector rápido por tipo de movimiento y selector de vista */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl overflow-x-auto">
            <button
              type="button"
              onClick={() => setMovementFilter('all')}
              className={`px-3.5 py-1.5 rounded-lg text-xs md:text-sm font-bold whitespace-nowrap transition-all ${
                movementFilter === 'all'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              Todos
            </button>
            <button
              type="button"
              onClick={() => setMovementFilter('incomes')}
              className={`px-3.5 py-1.5 rounded-lg text-xs md:text-sm font-bold whitespace-nowrap transition-all ${
                movementFilter === 'incomes'
                  ? 'bg-white text-emerald-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              Ingresos
            </button>
            <button
              type="button"
              onClick={() => setMovementFilter('expenses')}
              className={`px-3.5 py-1.5 rounded-lg text-xs md:text-sm font-bold whitespace-nowrap transition-all ${
                movementFilter === 'expenses'
                  ? 'bg-white text-rose-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              Gastos
            </button>
            <button
              type="button"
              onClick={() => setMovementFilter('transfers')}
              className={`px-3.5 py-1.5 rounded-lg text-xs md:text-sm font-bold whitespace-nowrap transition-all ${
                movementFilter === 'transfers'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              Transferencias / Pagos TDC
            </button>
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl w-fit self-end sm:self-auto">
            <button
              type="button"
              onClick={() => setViewMode('graph')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs md:text-sm font-bold transition-all ${
                viewMode === 'graph' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-700'
              }`}
            >
              <BarChart2 className="w-4 h-4" />
              Gráfica
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs md:text-sm font-bold transition-all ${
                viewMode === 'table' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-700'
              }`}
            >
              <TableIcon className="w-4 h-4" />
              Tabla
            </button>
          </div>
        </div>

        {/* Coexistencia armónica de Filtro por Usuarios y Filtro por Categorías arriba de la gráfica y tabla */}
        {(users.length > 0 || categories.length > 0) && (
          <div className="pt-3 border-t border-slate-100 space-y-3">
            {users.length > 0 && (
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Filtrar por Usuario:</span>
                <div className="flex flex-wrap items-center gap-4">
                  {users.map((user: any) => (
                    <label key={user.id} className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={!deselectedUsers.has(user.id)}
                        onChange={() => toggleUser(user.id)}
                        className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600 transition-colors"
                      />
                      <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900 transition-colors">
                        {user.name || 'Usuario sin nombre'}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {categories.length > 0 && (
              <div className={`flex flex-wrap items-center gap-3 ${users.length > 0 ? 'pt-3 border-t border-slate-50' : ''}`}>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Filtrar por Categoría:</span>
                <div className="flex flex-wrap items-center gap-2">
                  {categories.map((cat: string) => {
                    const isSelected = !deselectedCategories.has(cat);
                    const colorClass = categoryColorMap[cat] || 'bg-slate-500';
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => toggleCategory(cat)}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border shadow-xs flex items-center gap-2 ${
                          isSelected
                            ? 'bg-white border-slate-200 text-slate-700'
                            : 'bg-slate-50 border-transparent text-slate-400 opacity-50 hover:opacity-100'
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full ${colorClass}`}></span>
                        {cat}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <Card className={viewMode === 'graph' ? "pt-10 pb-8" : "p-0 overflow-hidden"}>
        {viewMode === 'graph' ? (
          <>
            <div 
              ref={scrollRef}
              onMouseDown={handleMouseDown}
              onMouseLeave={handleMouseLeave}
              onMouseUp={handleMouseUp}
              onMouseMove={handleMouseMove}
              className={`flex items-end gap-3 h-72 w-full border-b-2 border-slate-100 pb-3 overflow-x-auto scrollbar-hide px-4 select-none ${isDown ? 'cursor-grabbing' : 'cursor-grab'}`}
            >
              {snapshots.length === 0 ? (
                <div className="w-full h-full flex items-center justify-center text-slate-500 font-medium">
                  No hay datos para mostrar
                </div>
              ) : (
                  snapshots.map((snap, idx) => {
                    return (
                      <div key={idx} className="flex-1 h-full flex flex-col justify-end items-center group min-w-[60px] relative">
                        <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:-translate-y-2 text-xs mb-2 bg-slate-900 text-white p-3 rounded-xl whitespace-nowrap absolute bottom-full mb-4 z-10 pointer-events-none shadow-xl border border-slate-700">
                          <div className="font-bold text-slate-300 mb-1 uppercase tracking-widest text-center">{snap.month}</div>
                          
                          {Object.entries(snap.incomeByCategory).length > 0 && (
                            <div className="mt-2 mb-1 text-[10px] uppercase text-emerald-400 font-bold border-b border-slate-700 pb-1">Ingresos</div>
                          )}
                          {Object.entries(snap.incomeByCategory).map(([cat, amt]) => (
                            <div key={cat} className="flex justify-between gap-4 text-xs mt-1">
                              <div className="flex items-center gap-1.5">
                                <span className={`w-2 h-2 rounded-full ${categoryColorMap[cat] || 'bg-slate-500'}`}></span>
                                <span className="text-slate-300">{cat}</span>
                              </div>
                              <span className="font-mono text-white">{FormatCurrency(amt)}</span>
                            </div>
                          ))}

                          {Object.entries(snap.expenseByCategory).length > 0 && (
                            <div className="mt-2 mb-1 text-[10px] uppercase text-rose-400 font-bold border-b border-slate-700 pb-1">Gastos</div>
                          )}
                          {Object.entries(snap.expenseByCategory).map(([cat, amt]) => (
                            <div key={cat} className="flex justify-between gap-4 text-xs mt-1">
                              <div className="flex items-center gap-1.5">
                                <span className={`w-2 h-2 rounded-full ${categoryColorMap[cat] || 'bg-slate-500'}`}></span>
                                <span className="text-slate-300">{cat}</span>
                              </div>
                              <span className="font-mono text-white">{FormatCurrency(amt)}</span>
                            </div>
                          ))}

                          <div className="mt-2 pt-2 border-t border-slate-700 flex justify-between gap-4 font-bold">
                            <span className={snap.balance >= 0 ? 'text-emerald-400' : 'text-rose-400'}>Bal:</span>
                            <span className="font-mono text-white">{FormatCurrency(snap.balance)}</span>
                          </div>
                          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900"></div>
                        </div>

                        <div className="flex gap-1.5 w-full justify-center items-end h-full">
                          <div className="w-4 md:w-8 h-full flex flex-col-reverse justify-start gap-[1px]">
                            {Object.entries(snap.incomeByCategory).map(([cat, amt]) => {
                              const h = (amt / maxVal) * 100;
                              return (
                                <div
                                  key={cat}
                                  className={`${categoryColorMap[cat] || 'bg-slate-500'} w-full transition-all duration-700 hover:brightness-110 shadow-sm first:rounded-b-md last:rounded-t-md`}
                                  style={{ height: `${h}%` }}
                                ></div>
                              );
                            })}
                          </div>
                          <div className="w-4 md:w-8 h-full flex flex-col-reverse justify-start gap-[1px]">
                            {Object.entries(snap.expenseByCategory).map(([cat, amt]) => {
                              const h = (amt / maxVal) * 100;
                              return (
                                <div
                                  key={cat}
                                  className={`${categoryColorMap[cat] || 'bg-slate-500'} w-full transition-all duration-700 hover:brightness-110 shadow-sm first:rounded-b-md last:rounded-t-md opacity-90`}
                                  style={{ height: `${h}%` }}
                                ></div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })
              )}
            </div>
            
            {snapshots.length > 0 && (
              <div className="flex gap-3 w-full mt-4 px-4">
                {snapshots.map((snap, idx) => (
                  <div key={idx} className="flex-1 text-center text-sm font-bold text-slate-600 min-w-[60px]">
                    {snap.month}
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col">
            {selectedRecords.size > 0 && (
              <div className="p-4 bg-indigo-50 border-b border-indigo-100 flex items-center gap-4">
                <span className="text-sm font-bold text-indigo-800">{selectedRecords.size} seleccionado(s)</span>
                {selectedRecords.size === 1 && (() => {
                  const id = Array.from(selectedRecords)[0];
                  const record = detailedRecords.find((r: any) => r.id === id);
                  const canEdit = record && (
                    (record.recordType === 'expense' && typeof methods?.handleOpenExpenseModal === 'function') ||
                    (record.recordType === 'income' && typeof methods?.handleOpenIncomeModal === 'function') ||
                    (record.recordType === 'transfer' && typeof methods?.handleOpenTransferModal === 'function')
                  );
                  if (!canEdit) return null;
                  return (
                    <button 
                      onClick={() => {
                        if (!record) return;
                        if (record.recordType === 'expense') methods.handleOpenExpenseModal(record);
                        else if (record.recordType === 'income') methods.handleOpenIncomeModal(record);
                        else if (record.recordType === 'transfer') methods.handleOpenTransferModal(record);
                      }}
                      className="flex items-center gap-1 text-sm font-bold text-indigo-600 hover:text-indigo-800"
                    >
                      <Edit2 className="w-4 h-4" /> Editar
                    </button>
                  );
                })()}
                <button 
                  onClick={() => setIsDeleteModalOpen(true)}
                  className="flex items-center gap-1 text-sm font-bold text-rose-600 hover:text-rose-800"
                >
                  <Trash2 className="w-4 h-4" /> Eliminar
                </button>
              </div>
            )}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-slate-600 text-xs uppercase font-bold">
                  <tr>
                    <th className="px-4 py-4 rounded-tl-xl w-10">
                      <input 
                        type="checkbox" 
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-600"
                        ref={input => {
                          if (input) {
                            const isAll = detailedRecords.length > 0 && detailedRecords.every((r: any) => selectedRecords.has(r.id));
                            input.indeterminate = selectedRecords.size > 0 && !isAll;
                          }
                        }}
                        checked={detailedRecords.length > 0 && detailedRecords.every((r: any) => selectedRecords.has(r.id))}
                        onChange={() => {
                          const isAll = detailedRecords.length > 0 && detailedRecords.every((r: any) => selectedRecords.has(r.id));
                          if (isAll) {
                            setSelectedRecords(new Set());
                          } else {
                            setSelectedRecords(new Set(detailedRecords.map((r: any) => r.id)));
                          }
                        }}
                      />
                    </th>
                    <th className="px-6 py-4">Fecha</th>
                    <th className="px-6 py-4">Tipo</th>
                    <th className="px-6 py-4">Categoría / Fuente</th>
                    <th className="px-6 py-4">Descripción</th>
                    <th className="px-6 py-4 text-right">Monto</th>
                    <th className="px-6 py-4 rounded-tr-xl">Registrado por</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {detailedRecords.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-slate-500 font-medium">
                        No hay datos para mostrar
                      </td>
                    </tr>
                  ) : (
                    detailedRecords.map((record: any) => {
                      const uid = record.userId || record.paidBy || record.ownerUid;
                      const userObj = uid ? users.find((u: any) => u.id === uid) : null;
                      let userName = '-';
                      if (record.recordType === 'transfer') {
                        userName = userObj?.name || 'Sistema';
                      } else {
                        userName = userObj?.name || 'Desconocido';
                      }

                      const isSelected = selectedRecords.has(record.id);

                      return (
                        <tr key={record.id} className={`transition-colors ${isSelected ? 'bg-indigo-50/50' : 'hover:bg-slate-50'}`}>
                          <td className="px-4 py-4">
                            <input 
                              type="checkbox" 
                              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-600"
                              checked={isSelected}
                              onChange={() => {
                                const newSet = new Set(selectedRecords);
                                if (isSelected) newSet.delete(record.id);
                                else newSet.add(record.id);
                                setSelectedRecords(newSet);
                              }}
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-slate-700 font-medium">
                            {record.date ? record.date.substring(0, 10) : '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2.5 py-1 rounded-md text-xs font-bold border ${
                              record.recordType === 'income' 
                                ? 'bg-emerald-100 text-emerald-700 border-emerald-200/50' 
                                : record.recordType === 'transfer'
                                  ? record.type === 'CARD_PAYMENT'
                                    ? 'bg-purple-100 text-purple-700 border-purple-200/50'
                                    : 'bg-blue-100 text-blue-700 border-blue-200/50'
                                  : 'bg-rose-100 text-rose-700 border-rose-200/50'
                            }`}>
                              {record.recordType === 'transfer'
                                ? (record.type === 'CARD_PAYMENT' ? 'Pago de Tarjeta' : 'Transferencia')
                                : (record.recordType === 'income' ? 'Ingreso' : 'Gasto')}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {record.recordType === 'transfer' ? (
                              <span className="font-medium text-indigo-700 flex items-center gap-1.5">
                                <ArrowLeftRight size={14} className="text-indigo-500 flex-shrink-0" />
                                <span>{record.sourceAccountName || 'Origen'} → {record.targetAccountName || 'Destino'}</span>
                              </span>
                            ) : (
                              <span className="font-medium text-slate-700">
                                {record.category || record.source || record.type || 'Otros'}
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 truncate max-w-xs text-slate-600" title={record.description}>
                            {record.description || '-'}
                          </td>
                          <td className="px-6 py-4 text-right font-mono font-medium whitespace-nowrap">
                            <span className={
                              record.recordType === 'income' 
                                ? 'text-emerald-600' 
                                : record.recordType === 'transfer'
                                  ? 'text-indigo-600 font-bold'
                                  : 'text-slate-600'
                            }>
                              {record.recordType === 'income' ? '+' : record.recordType === 'transfer' ? '' : '-'}
                              {FormatCurrency(record.amount)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-slate-700 whitespace-nowrap">
                            {userName}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Card>

      {expensesByCategory.length > 0 && (
        <Card className="p-6">
          <h3 className="text-xl font-bold text-slate-800 mb-6">Gastos por Categoría</h3>
          <div className="space-y-5">
            {expensesByCategory.map((cat, idx) => (
              <div key={idx}>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-slate-700">{cat.name}</span>
                  <span className="text-slate-600 font-mono text-sm">{FormatCurrency(cat.amount)} ({cat.percentage.toFixed(1)}%)</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3">
                  <div 
                    className={`${categoryColorMap[cat.name] || 'bg-emerald-500'} h-3 rounded-full transition-all duration-700`}
                    style={{ width: `${Math.min(100, Math.max(0, cat.percentage))}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirmar eliminación"
      >
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mb-4">
            <AlertCircle size={24} />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">
            ¿Eliminar {selectedRecords.size} {selectedRecords.size === 1 ? 'registro' : 'registros'}?
          </h3>
          <p className="text-slate-600 mb-8 max-w-sm">
            Esta acción no se puede deshacer. Los registros seleccionados serán eliminados permanentemente de tu historial.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="danger"
              className="flex-1"
              onClick={() => {
                selectedRecords.forEach(id => {
                  const record = detailedRecords.find((r: any) => r.id === id);
                  if (record) {
                    if (record.recordType === 'expense' && typeof methods?.deleteExpense === 'function') {
                      methods.deleteExpense(id);
                    } else if (record.recordType === 'income' && typeof methods?.deleteIncome === 'function') {
                      methods.deleteIncome(id);
                    } else if (record.recordType === 'transfer' && typeof methods?.deleteTransfer === 'function') {
                      methods.deleteTransfer(id);
                    }
                  }
                });
                setSelectedRecords(new Set());
                setIsDeleteModalOpen(false);
              }}
            >
              Sí, eliminar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
