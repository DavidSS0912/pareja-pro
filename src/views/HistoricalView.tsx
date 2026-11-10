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

export function HistoricalView({ data, methods, appContext = 'household' }: any) {
  const { expenses = [], incomes = [], users = [], transfers = [] } = data || {};
  const currentUserId = data?.user?.uid || data?.user?.id || '';

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
    transfers.forEach((t: any) => {
      cats.add(t.type === 'CARD_PAYMENT' ? 'Pago de Tarjeta' : 'Transferencia');
    });
    return Array.from(cats).sort();
  }, [expenses, incomes, transfers]);

  const categoryColorMap = useMemo(() => {
    const map: Record<string, string> = {
      'Transferencia': 'bg-indigo-500',
      'Pago de Tarjeta': 'bg-purple-500',
    };
    categories.forEach((cat, idx) => {
      if (!map[cat]) {
        map[cat] = CATEGORY_COLORS[idx % CATEGORY_COLORS.length];
      }
    });
    return map;
  }, [categories]);

  const displayedCategories = useMemo(() => {
    if (movementFilter === 'transfers') {
      return ['Transferencia', 'Pago de Tarjeta'];
    }
    if (movementFilter === 'incomes') {
      const cats = new Set<string>();
      incomes.forEach((i: any) => cats.add(i.category || i.source || 'Otros'));
      return Array.from(cats).sort();
    }
    if (movementFilter === 'expenses') {
      const cats = new Set<string>();
      expenses.forEach((e: any) => cats.add(e.category || 'Otros'));
      return Array.from(cats).sort();
    }
    return categories;
  }, [movementFilter, categories, expenses, incomes]);

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
    return (transfers || []).filter((t: any) => {
      const senderUid = t.sourceOwnerUid || t.senderUid || t.ownerUid || t.userId;
      const receiverUid = t.targetOwnerUid || t.receiverUid;

      if (deselectedUsers.size > 0) {
        const senderSelected = senderUid ? !deselectedUsers.has(senderUid) : false;
        const receiverSelected = receiverUid ? !deselectedUsers.has(receiverUid) : false;
        // Permanece visible si está seleccionado el emisor O el receptor
        if (senderUid && receiverUid && senderUid !== receiverUid) {
          if (!senderSelected && !receiverSelected) return false;
        } else if (senderUid && deselectedUsers.has(senderUid)) {
          return false;
        } else if (!senderUid && receiverUid && deselectedUsers.has(receiverUid)) {
          return false;
        }
      }

      const cat = t.type === 'CARD_PAYMENT' ? 'Pago de Tarjeta' : 'Transferencia';
      if (deselectedCategories.has(cat)) return false;
      return true;
    });
  }, [transfers, deselectedUsers, deselectedCategories]);

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
      ...t,
      id: t.id,
      date: t.date,
      recordType: 'transfer',
      type: t.type,
      typeLabel: t.type === 'CARD_PAYMENT' ? 'Pago de Tarjeta' : 'Transferencia',
      category: t.type === 'CARD_PAYMENT' ? 'Pago de Tarjeta' : 'Transferencia',
      description: t.description || '',
      amount: Math.abs(Number(t.amount) || 0),
      sourceAccountName: t.sourceAccountName || '',
      targetAccountName: t.targetAccountName || '',
      sourceOwnerUid: t.sourceOwnerUid || t.senderUid || t.ownerUid || '',
      targetOwnerUid: t.targetOwnerUid || t.receiverUid || '',
      senderUid: t.sourceOwnerUid || t.senderUid || t.ownerUid || '',
      receiverUid: t.targetOwnerUid || t.receiverUid || '',
      userId: t.ownerUid || t.userId || t.sourceOwnerUid || '',
      ownerUid: t.ownerUid || t.userId || t.sourceOwnerUid || '',
      isPrivate: t.isPrivate
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

  const recordsByCategory = useMemo(() => {
    const totals: Record<string, number> = {};
    let totalAmt = 0;

    if (movementFilter === 'incomes') {
      (filteredIncomes || []).forEach((i: any) => {
        const amt = Math.abs(Number(i.amount) || 0);
        const cat = i.category || i.source || 'Otros';
        totals[cat] = (totals[cat] || 0) + amt;
        totalAmt += amt;
      });
    } else if (movementFilter === 'transfers') {
      (filteredTransfers || []).forEach((t: any) => {
        const amt = Math.abs(Number(t.amount) || 0);
        const cat = t.type === 'CARD_PAYMENT' ? 'Pago de Tarjeta' : 'Transferencia';
        totals[cat] = (totals[cat] || 0) + amt;
        totalAmt += amt;
      });
    } else {
      (filteredExpenses || []).forEach((e: any) => {
        const amt = Math.abs(Number(e.amount) || 0);
        const cat = e.category || 'Otros';
        totals[cat] = (totals[cat] || 0) + amt;
        totalAmt += amt;
      });
    }

    return Object.entries(totals)
      .map(([name, amount]) => ({
        name,
        amount,
        percentage: totalAmt > 0 ? (amount / totalAmt) * 100 : 0
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [filteredExpenses, filteredIncomes, filteredTransfers, movementFilter]);

  const expensesByCategory = recordsByCategory;

  const categoryBreakdownTitle = useMemo(() => {
    if (movementFilter === 'incomes') return 'Ingresos por Categoría';
    if (movementFilter === 'transfers') return 'Transferencias por Tipo';
    return 'Gastos por Categoría';
  }, [movementFilter]);

  const snapshots = useMemo(() => {
    const monthlyData: Record<string, {
      income: number;
      expense: number;
      transfer: number;
      count: number;
      incomeByCategory: Record<string, number>;
      expenseByCategory: Record<string, number>;
      transferByCategory: Record<string, number>;
    }> = {};

    const getMonthEntry = (month: string) => {
      if (!monthlyData[month]) {
        monthlyData[month] = {
          income: 0,
          expense: 0,
          transfer: 0,
          count: 0,
          incomeByCategory: {},
          expenseByCategory: {},
          transferByCategory: {}
        };
      }
      return monthlyData[month];
    };
    
    if (movementFilter === 'all' || movementFilter === 'expenses') {
      (filteredExpenses || []).forEach((e: any) => {
        if (!e?.date) return;
        const month = e.date.substring(0, 7);
        const entry = getMonthEntry(month);
        const amt = Math.abs(Number(e.amount) || 0);
        entry.expense += amt;
        entry.count += 1;
        const cat = e.category || 'Otros';
        entry.expenseByCategory[cat] = (entry.expenseByCategory[cat] || 0) + amt;
      });
    }

    if (movementFilter === 'all' || movementFilter === 'incomes') {
      (filteredIncomes || []).forEach((i: any) => {
        if (!i?.date) return;
        const month = i.date.substring(0, 7);
        const entry = getMonthEntry(month);
        const amt = Math.abs(Number(i.amount) || 0);
        entry.income += amt;
        entry.count += 1;
        const cat = i.category || i.source || 'Otros';
        entry.incomeByCategory[cat] = (entry.incomeByCategory[cat] || 0) + amt;
      });
    }

    if (movementFilter === 'all' || movementFilter === 'transfers') {
      (filteredTransfers || []).forEach((t: any) => {
        if (!t?.date) return;
        const month = t.date.substring(0, 7);
        const entry = getMonthEntry(month);
        const amt = Math.abs(Number(t.amount) || 0);
        entry.transfer += amt;
        entry.count += 1;
        const cat = t.type === 'CARD_PAYMENT' ? 'Pago de Tarjeta' : 'Transferencia';
        entry.transferByCategory[cat] = (entry.transferByCategory[cat] || 0) + amt;
      });
    }

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
          transfer: data.transfer,
          count: data.count,
          incomeByCategory: data.incomeByCategory,
          expenseByCategory: data.expenseByCategory,
          transferByCategory: data.transferByCategory,
          balance: data.income - data.expense,
          margin: data.income > 0 ? ((data.income - data.expense) / data.income) * 100 : 0
        };
      });
  }, [filteredExpenses, filteredIncomes, filteredTransfers, movementFilter]);

  const maxVal = snapshots.length > 0 
    ? Math.max(1, ...snapshots.map(s => Math.max(s.income || 0, s.expense || 0, s.transfer || 0))) 
    : 1;

  return (
    <div className="space-y-6 animate-in">
      <div className="mb-2 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">Histórico</h2>
          <p className="text-slate-500 mt-1 font-medium text-sm">Comparativa de ingresos vs gastos y evolución financiera por periodo.</p>
        </div>
        
        <div className="bg-white border border-[#EEF0F4] rounded-3xl p-4 sm:p-5 shadow-bento flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center justify-center gap-2 bg-[#F8FAFC] border border-[#EEF0F4] rounded-2xl sm:rounded-full px-3 py-2 w-full sm:w-auto">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider hidden md:block mr-1">Periodo:</span>
            <input 
              type="date" 
              value={methods?.dateRange?.start || ''} 
              onChange={e => methods?.setDateRange?.(e.target.value, methods?.dateRange?.end || '')} 
              className="bg-transparent text-xs sm:text-sm font-medium text-slate-800 tabular-nums focus:outline-none" 
              aria-label="Fecha inicial" 
            />
            <span className="text-slate-400 font-bold">-</span>
            <input 
              type="date" 
              value={methods?.dateRange?.end || ''} 
              onChange={e => methods?.setDateRange?.(methods?.dateRange?.start || '', e.target.value)} 
              className="bg-transparent text-xs sm:text-sm font-medium text-slate-800 tabular-nums focus:outline-none" 
              aria-label="Fecha final" 
            />
          </div>
          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center justify-center gap-2 bg-[#111319] hover:bg-[#1A1D26] text-white rounded-full px-5 py-2.5 text-xs sm:text-sm font-medium transition-colors w-full sm:w-auto shadow-sm"
          >
            <Download size={14} />
            <span>Exportar CSV</span>
          </button>
        </div>
      </div>

      {/* Panel Superior de Controles y Filtros */}
      <div className="bg-white p-5 rounded-3xl shadow-bento border border-[#EEF0F4] space-y-4">
        {/* Fila superior: Selector rápido por tipo de movimiento y selector de vista */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="inline-flex bg-[#F5F6FA] border border-[#EEF0F4] rounded-full p-1.5 shadow-sm overflow-x-auto">
            <button
              type="button"
              onClick={() => setMovementFilter('all')}
              className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                movementFilter === 'all'
                  ? 'bg-[#111319] text-white shadow-sm'
                  : 'text-[#8C93A6] hover:text-slate-900'
              }`}
            >
              Todos
            </button>
            <button
              type="button"
              onClick={() => setMovementFilter('incomes')}
              className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                movementFilter === 'incomes'
                  ? 'bg-[#111319] text-white shadow-sm'
                  : 'text-[#8C93A6] hover:text-slate-900'
              }`}
            >
              Ingresos
            </button>
            <button
              type="button"
              onClick={() => setMovementFilter('expenses')}
              className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                movementFilter === 'expenses'
                  ? 'bg-[#111319] text-white shadow-sm'
                  : 'text-[#8C93A6] hover:text-slate-900'
              }`}
            >
              Gastos
            </button>
            <button
              type="button"
              onClick={() => setMovementFilter('transfers')}
              className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                movementFilter === 'transfers'
                  ? 'bg-[#111319] text-white shadow-sm'
                  : 'text-[#8C93A6] hover:text-slate-900'
              }`}
            >
              Transferencias / Pagos TDC
            </button>
          </div>

          <div className="inline-flex bg-[#F5F6FA] border border-[#EEF0F4] rounded-full p-1.5 shadow-sm w-fit self-end sm:self-auto">
            <button
              type="button"
              onClick={() => setViewMode('graph')}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                viewMode === 'graph' 
                  ? 'bg-[#111319] text-white shadow-sm' 
                  : 'text-[#8C93A6] hover:text-slate-900'
              }`}
            >
              <BarChart2 size={14} />
              <span>Gráfica</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                viewMode === 'table' 
                  ? 'bg-[#111319] text-white shadow-sm' 
                  : 'text-[#8C93A6] hover:text-slate-900'
              }`}
            >
              <TableIcon size={14} />
              <span>Tabla</span>
            </button>
          </div>
        </div>

        {/* Coexistencia armónica de Filtro por Usuarios y Filtro por Categorías arriba de la gráfica y tabla */}
        {(users.length > 0 || displayedCategories.length > 0) && (
          <div className="pt-3 border-t border-[#EEF0F4] space-y-3">
            {users.length > 0 && (
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Filtrar por Usuario:</span>
                <div className="flex flex-wrap items-center gap-4">
                  {users.map((user: any) => (
                    <label key={user.id} className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={!deselectedUsers.has(user.id)}
                        onChange={() => toggleUser(user.id)}
                        className="w-4 h-4 rounded border-[#EEF0F4] text-[#111319] focus:ring-[#111319] transition-colors"
                      />
                      <span className="text-xs font-medium text-slate-700 group-hover:text-slate-900 transition-colors">
                        {user.name || 'Usuario sin nombre'}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {displayedCategories.length > 0 && (
              <div className={`flex flex-wrap items-center gap-3 ${users.length > 0 ? 'pt-3 border-t border-[#EEF0F4]' : ''}`}>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Filtrar por Categoría:</span>
                <div className="flex flex-wrap items-center gap-2">
                  {displayedCategories.map((cat: string) => {
                    const isSelected = !deselectedCategories.has(cat);
                    const colorClass = categoryColorMap[cat] || 'bg-slate-500';
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => toggleCategory(cat)}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-all border flex items-center gap-1.5 cursor-pointer ${
                          isSelected
                            ? 'bg-white border-[#EEF0F4] text-slate-900 shadow-sm'
                            : 'bg-[#F8FAFC] border-transparent text-slate-400 opacity-60 hover:opacity-100'
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full ${colorClass}`}></span>
                        <span>{cat}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className={viewMode === 'graph' ? "bg-white border border-[#EEF0F4] rounded-3xl p-6 sm:p-8 shadow-bento" : "bg-white border border-[#EEF0F4] rounded-3xl shadow-bento overflow-hidden"}>
        {viewMode === 'graph' ? (
          <>
            <div 
              ref={scrollRef}
              onMouseDown={handleMouseDown}
              onMouseLeave={handleMouseLeave}
              onMouseUp={handleMouseUp}
              onMouseMove={handleMouseMove}
              className={`flex items-end gap-3 h-72 w-full border-b border-[#EEF0F4] pb-3 overflow-x-auto scrollbar-hide px-4 select-none ${isDown ? 'cursor-grabbing' : 'cursor-grab'}`}
            >
              {snapshots.length === 0 ? (
                <div className="w-full h-full flex items-center justify-center text-slate-400 font-medium text-xs">
                  No hay datos para mostrar en este rango
                </div>
              ) : (
                  snapshots.map((snap, idx) => {
                    return (
                      <div key={idx} className="flex-1 h-full flex flex-col justify-end items-center group min-w-[60px] relative">
                        <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:-translate-y-2 text-xs mb-2 bg-[#111319] text-white p-3.5 rounded-2xl whitespace-nowrap absolute bottom-full mb-4 z-10 pointer-events-none shadow-xl border border-[#232733]">
                          <div className="font-bold text-slate-300 mb-1 uppercase tracking-widest text-center tabular-nums">{snap.month}</div>
                          
                          {Object.entries(snap.incomeByCategory).length > 0 && (
                            <div className="mt-2 mb-1 text-[10px] uppercase text-[#10B981] font-bold border-b border-[#232733] pb-1">Ingresos</div>
                          )}
                          {Object.entries(snap.incomeByCategory).map(([cat, amt]) => (
                            <div key={cat} className="flex justify-between gap-4 text-xs mt-1">
                              <div className="flex items-center gap-1.5">
                                <span className={`w-2 h-2 rounded-full ${categoryColorMap[cat] || 'bg-slate-500'}`}></span>
                                <span className="text-slate-300">{cat}</span>
                              </div>
                              <span className="font-mono text-white tabular-nums">{FormatCurrency(amt)}</span>
                            </div>
                          ))}

                          {Object.entries(snap.expenseByCategory).length > 0 && (
                            <div className="mt-2 mb-1 text-[10px] uppercase text-[#F97316] font-bold border-b border-[#232733] pb-1">Gastos</div>
                          )}
                          {Object.entries(snap.expenseByCategory).map(([cat, amt]) => (
                            <div key={cat} className="flex justify-between gap-4 text-xs mt-1">
                              <div className="flex items-center gap-1.5">
                                <span className={`w-2 h-2 rounded-full ${categoryColorMap[cat] || 'bg-slate-500'}`}></span>
                                <span className="text-slate-300">{cat}</span>
                              </div>
                              <span className="font-mono text-white tabular-nums">{FormatCurrency(amt)}</span>
                            </div>
                          ))}

                          {Object.entries(snap.transferByCategory).length > 0 && (
                            <div className="mt-2 mb-1 text-[10px] uppercase text-[#6366F1] font-bold border-b border-[#232733] pb-1">Transferencias</div>
                          )}
                          {Object.entries(snap.transferByCategory).map(([cat, amt]) => (
                            <div key={cat} className="flex justify-between gap-4 text-xs mt-1">
                              <div className="flex items-center gap-1.5">
                                <span className={`w-2 h-2 rounded-full ${categoryColorMap[cat] || 'bg-indigo-500'}`}></span>
                                <span className="text-slate-300">{cat}</span>
                              </div>
                              <span className="font-mono text-white tabular-nums">{FormatCurrency(amt)}</span>
                            </div>
                          ))}

                          {movementFilter === 'transfers' ? (
                            <div className="mt-2 pt-2 border-t border-[#232733] flex justify-between gap-4 font-bold">
                              <span className="text-[#6366F1]">Total:</span>
                              <span className="font-mono text-white tabular-nums">{FormatCurrency(snap.transfer)}</span>
                            </div>
                          ) : (
                            <div className="mt-2 pt-2 border-t border-[#232733] flex justify-between gap-4 font-bold">
                              <span className={snap.balance >= 0 ? 'text-[#10B981]' : 'text-[#F97316]'}>Bal:</span>
                              <span className="font-mono text-white tabular-nums">{FormatCurrency(snap.balance)}</span>
                            </div>
                          )}
                          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#111319]"></div>
                        </div>

                        <div className="flex gap-1.5 w-full justify-center items-end h-full">
                          {movementFilter === 'transfers' ? (
                            <div className="w-4 md:w-8 h-full flex flex-col-reverse justify-start gap-[1px]">
                              {Object.entries(snap.transferByCategory).map(([cat, amt]) => {
                                const h = (amt / maxVal) * 100;
                                return (
                                  <div
                                    key={cat}
                                    className={`${categoryColorMap[cat] || 'bg-indigo-500'} w-full transition-all duration-700 hover:brightness-110 shadow-sm first:rounded-b-md last:rounded-t-md`}
                                    style={{ height: `${h}%` }}
                                  ></div>
                                );
                              })}
                            </div>
                          ) : (
                            <>
                              {(movementFilter === 'all' || movementFilter === 'incomes') && (
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
                              )}
                              {(movementFilter === 'all' || movementFilter === 'expenses') && (
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
                              )}
                              {movementFilter === 'all' && (
                                <div className="w-4 md:w-8 h-full flex flex-col-reverse justify-start gap-[1px]">
                                  {Object.entries(snap.transferByCategory).map(([cat, amt]) => {
                                    const h = (amt / maxVal) * 100;
                                    return (
                                      <div
                                        key={cat}
                                        className={`${categoryColorMap[cat] || 'bg-indigo-500'} w-full transition-all duration-700 hover:brightness-110 shadow-sm first:rounded-b-md last:rounded-t-md`}
                                        style={{ height: `${h}%` }}
                                      ></div>
                                    );
                                  })}
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })
              )}
            </div>
            
            {snapshots.length > 0 && (
              <div className="flex gap-3 w-full mt-4 px-4">
                {snapshots.map((snap, idx) => (
                  <div key={idx} className="flex-1 text-center text-xs font-bold text-slate-500 min-w-[60px] tabular-nums">
                    {snap.month}
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col">
            {selectedRecords.size > 0 && (
              <div className="p-4 bg-[#EEF2FF] border-b border-[#EEF0F4] flex items-center justify-between gap-4">
                <span className="text-xs font-bold text-[#6366F1] tabular-nums">{selectedRecords.size} seleccionado(s)</span>
                <div className="flex items-center gap-3">
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
                        type="button"
                        onClick={() => {
                          if (!record) return;
                          if (record.recordType === 'expense') methods.handleOpenExpenseModal(record);
                          else if (record.recordType === 'income') methods.handleOpenIncomeModal(record);
                          else if (record.recordType === 'transfer') methods.handleOpenTransferModal(record);
                        }}
                        className="flex items-center gap-1 text-xs font-semibold text-[#6366F1] hover:text-indigo-800 cursor-pointer"
                      >
                        <Edit2 size={14} /> 
                        <span>Editar</span>
                      </button>
                    );
                  })()}
                  <button 
                    type="button"
                    onClick={() => setIsDeleteModalOpen(true)}
                    className="flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-800 cursor-pointer"
                  >
                    <Trash2 size={14} /> 
                    <span>Eliminar</span>
                  </button>
                </div>
              </div>
            )}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-[#F8FAFC] text-slate-400 text-xs uppercase font-semibold tracking-wider border-b border-[#EEF0F4]">
                  <tr>
                    <th className="px-4 py-3.5 w-10">
                      <input 
                        type="checkbox" 
                        className="rounded border-[#EEF0F4] text-[#111319] focus:ring-[#111319]"
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
                    <th className="px-5 py-3.5">Fecha</th>
                    <th className="px-5 py-3.5">Tipo</th>
                    <th className="px-5 py-3.5">Categoría / Fuente</th>
                    <th className="px-5 py-3.5">Descripción</th>
                    <th className="px-5 py-3.5 text-right">Monto</th>
                    <th className="px-5 py-3.5">Registrado por</th>
                    <th className="px-5 py-3.5 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EEF0F4]">
                  {detailedRecords.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-5 py-8 text-center text-slate-400 font-medium text-xs">
                        No hay datos para mostrar en este rango
                      </td>
                    </tr>
                  ) : (
                    detailedRecords.map((record: any) => {
                      const isTransfer = record.recordType === 'transfer';
                      const senderUid = record.senderUid || record.sourceOwnerUid || record.userId || record.ownerUid;
                      const receiverUid = record.receiverUid || record.targetOwnerUid;
                      const isReceiver = isTransfer && currentUserId && (receiverUid === currentUserId);
                      const isSender = isTransfer && currentUserId && (senderUid === currentUserId);

                      const senderObj = senderUid ? users.find((u: any) => u.id === senderUid) : null;
                      const receiverObj = receiverUid ? users.find((u: any) => u.id === receiverUid) : null;
                      const senderName = senderObj?.name || 'Origen';
                      const receiverName = receiverObj?.name || 'Destino';

                      let userName = '-';
                      if (isTransfer) {
                        if (senderUid && receiverUid && senderUid !== receiverUid) {
                          userName = `${senderName} → ${receiverName}`;
                        } else {
                          userName = senderObj?.name || receiverObj?.name || 'Sistema';
                        }
                      } else {
                        const uid = record.userId || record.paidBy || record.ownerUid || record.sourceOwnerUid;
                        const userObj = uid ? users.find((u: any) => u.id === uid) : null;
                        userName = userObj?.name || 'Desconocido';
                      }

                      const isSelected = selectedRecords.has(record.id);

                      let amountSign = '';
                      let amountClass = 'text-slate-900 font-bold';
                      if (record.recordType === 'income') {
                        amountSign = '+';
                        amountClass = 'text-[#10B981] font-bold';
                      } else if (isTransfer) {
                        if (appContext === 'personal') {
                          if (isReceiver && !isSender) {
                            amountSign = '+';
                            amountClass = 'text-[#10B981] font-bold';
                          } else if (isSender && !isReceiver) {
                            amountSign = '-';
                            amountClass = 'text-slate-900 font-bold';
                          } else {
                            amountSign = '';
                            amountClass = 'text-[#6366F1] font-bold';
                          }
                        } else {
                          amountSign = '';
                          amountClass = 'text-[#6366F1] font-bold';
                        }
                      } else {
                        amountSign = '-';
                        amountClass = 'text-[#F97316] font-bold';
                      }

                      const typeBadgeClass = record.recordType === 'income' 
                        ? 'bg-[#E8F8F0] text-[#10B981] border border-[#10B981]/20' 
                        : isTransfer
                          ? record.type === 'CARD_PAYMENT'
                            ? 'bg-[#EEF2FF] text-purple-700 border border-purple-200/50'
                            : (appContext === 'personal' && isReceiver && !isSender)
                              ? 'bg-[#E8F8F0] text-[#10B981] border border-[#10B981]/20'
                              : 'bg-[#EEF2FF] text-[#6366F1] border border-[#6366F1]/20'
                          : 'bg-[#FDEFEA] text-[#F97316] border border-[#F97316]/20';

                      const typeBadgeLabel = record.recordType === 'income'
                        ? 'Ingreso'
                        : isTransfer
                          ? (record.type === 'CARD_PAYMENT'
                              ? 'Pago de Tarjeta'
                              : (appContext === 'personal' && isReceiver && !isSender)
                                ? 'Transferencia Recibida'
                                : 'Transferencia')
                          : 'Gasto';

                      return (
                        <tr key={record.id} className={`transition-colors ${isSelected ? 'bg-[#EEF2FF]/40' : 'hover:bg-[#F8FAFC]'}`}>
                          <td className="px-4 py-3.5">
                            <input 
                              type="checkbox" 
                              className="rounded border-[#EEF0F4] text-[#111319] focus:ring-[#111319]"
                              checked={isSelected}
                              onChange={() => {
                                const newSet = new Set(selectedRecords);
                                if (isSelected) newSet.delete(record.id);
                                else newSet.add(record.id);
                                setSelectedRecords(newSet);
                              }}
                            />
                          </td>
                          <td className="px-5 py-3.5 whitespace-nowrap text-slate-700 font-medium text-xs tabular-nums">
                            {record.date ? record.date.substring(0, 10) : '-'}
                          </td>
                          <td className="px-5 py-3.5 whitespace-nowrap">
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${typeBadgeClass}`}>
                              {typeBadgeLabel}
                            </span>
                          </td>
                          <td className="px-5 py-3.5">
                            {record.recordType === 'transfer' ? (
                              <span className="font-semibold text-xs text-[#6366F1] flex items-center gap-1.5">
                                <ArrowLeftRight size={13} className="text-[#6366F1] flex-shrink-0" />
                                <span>{record.sourceAccountName || 'Origen'} → {record.targetAccountName || 'Destino'}</span>
                              </span>
                            ) : (
                              <span className="font-semibold text-xs text-slate-900">
                                {record.category || record.source || record.type || 'Otros'}
                              </span>
                            )}
                          </td>
                          <td className="px-5 py-3.5 truncate max-w-xs text-xs text-slate-500" title={record.description}>
                            {record.description || '-'}
                          </td>
                          <td className="px-5 py-3.5 text-right font-medium whitespace-nowrap text-sm tabular-nums">
                            <span className={amountClass}>
                              {amountSign}
                              {FormatCurrency(record.amount)}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-slate-600 text-xs whitespace-nowrap">
                            {userName}
                          </td>
                          <td className="px-5 py-3.5 whitespace-nowrap text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                type="button"
                                data-testid={`edit-record-${record.id}`}
                                onClick={() => {
                                  if (record.recordType === 'expense' && typeof methods?.handleOpenExpenseModal === 'function') {
                                    methods.handleOpenExpenseModal(record);
                                  } else if (record.recordType === 'income' && typeof methods?.handleOpenIncomeModal === 'function') {
                                    methods.handleOpenIncomeModal(record);
                                  } else if (record.recordType === 'transfer' && typeof methods?.handleOpenTransferModal === 'function') {
                                    methods.handleOpenTransferModal(record);
                                  }
                                }}
                                className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                                title="Editar movimiento"
                              >
                                <Edit2 size={14} />
                              </button>
                              <button
                                type="button"
                                data-testid={`delete-record-${record.id}`}
                                onClick={() => {
                                  setSelectedRecords(new Set([record.id]));
                                  setIsDeleteModalOpen(true);
                                }}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-[#FDEFEA] rounded-lg transition-colors cursor-pointer"
                                title="Eliminar movimiento"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
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
      </div>

      {expensesByCategory.length > 0 && (
        <div className="bg-white border border-[#EEF0F4] rounded-3xl p-6 sm:p-8 shadow-bento space-y-6">
          <div className="pb-3 border-b border-[#EEF0F4]">
            <h3 className="text-lg font-bold text-slate-900">{categoryBreakdownTitle}</h3>
            <p className="text-xs text-slate-400 font-medium mt-0.5">Distribución porcentual del periodo seleccionado</p>
          </div>
          <div className="space-y-4">
            {expensesByCategory.map((cat, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-900">{cat.name}</span>
                  <span className="text-slate-600 font-semibold tabular-nums">{FormatCurrency(cat.amount)} ({cat.percentage.toFixed(1)}%)</span>
                </div>
                <div className="w-full bg-[#F5F6FA] border border-[#EEF0F4] rounded-full h-2.5 overflow-hidden">
                  <div 
                    className={`${categoryColorMap[cat.name] || 'bg-emerald-500'} h-2.5 rounded-full transition-all duration-700`}
                    style={{ width: `${Math.min(100, Math.max(0, cat.percentage))}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirmar eliminación"
      >
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <div className="w-12 h-12 bg-[#FDEFEA] text-[#F97316] rounded-2xl flex items-center justify-center mb-4 border border-[#F97316]/20">
            <AlertCircle size={24} />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">
            ¿Eliminar {selectedRecords.size} {selectedRecords.size === 1 ? 'registro' : 'registros'}?
          </h3>
          <p className="text-slate-500 text-xs sm:text-sm mb-6 max-w-sm leading-relaxed">
            Esta acción no se puede deshacer. Los registros seleccionados serán eliminados permanentemente de tu historial.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <button
              type="button"
              className="bg-white border border-[#EEF0F4] hover:bg-slate-50 text-slate-700 rounded-full px-5 py-2.5 font-medium transition-colors text-xs flex-1 cursor-pointer"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Cancelar
            </button>
            <button
              type="button"
              className="bg-rose-600 hover:bg-rose-700 text-white rounded-full px-5 py-2.5 font-medium transition-colors text-xs flex-1 cursor-pointer shadow-sm"
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
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
