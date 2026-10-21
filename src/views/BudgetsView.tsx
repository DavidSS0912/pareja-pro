import React, { useState } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { BudgetForm } from '../components/forms/BudgetForm';
import { FormatCurrency } from '../utils';

const normalize = (amount, currency) => {
  if (!amount) return 0;
  return currency === 'USD' ? amount * parseFloat(localStorage.getItem('exchangeRate') || '20') : amount;
};

export function BudgetsView({ data, methods, appContext }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
  });

  React.useEffect(() => {
    methods.fetchBudgetsForMonth?.(selectedMonth);
  }, [selectedMonth, methods.fetchBudgetsForMonth]);

  const handleOpenModal = (budget = null) => {
    setEditingBudget(budget);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingBudget(null);
    setIsModalOpen(false);
  };

  const handleSubmit = (formData) => {
    const dataWithPeriod = { ...formData, period: selectedMonth };
    if (editingBudget) {
      methods.updateBudget(editingBudget.id, dataWithPeriod);
    } else {
      methods.addBudget(dataWithPeriod);
    }
    handleCloseModal();
  };

  const handleCopyPrevious = () => {
    if (window.confirm('¿Copiar los presupuestos del mes anterior a este mes?')) {
      methods.copyBudgetsFromPreviousMonth?.(selectedMonth);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('¿Estás seguro de eliminar este presupuesto?')) {
      methods.deleteBudget(id);
    }
  };

  return (
    <div className="space-y-6 animate-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-slate-800">Presupuestos</h2>
          <p className="text-slate-600 mt-2 font-medium">Guía y plantillas de asignación de fondos.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <input 
            type="month" 
            className="px-4 py-2 bg-white border border-slate-200 rounded-xl font-medium text-slate-700 w-full sm:w-auto focus:ring-2 focus:ring-primary focus:border-primary"
            value={selectedMonth.substring(0, 7)}
            onChange={(e) => {
              if (e.target.value) {
                setSelectedMonth(`${e.target.value}-01`);
              }
            }}
          />
          <div className="flex gap-2 w-full sm:w-auto">
            <Button variant="outline" onClick={handleCopyPrevious} className="flex-1 sm:flex-none whitespace-nowrap">
              Copiar anterior
            </Button>
            <Button onClick={() => handleOpenModal()} className="flex-1 sm:flex-none whitespace-nowrap">
              <Plus size={18} className="mr-2" /> Nuevo
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {data.budgets.map(budget => {
          const computedSpent = data.expenses
            .filter(e => {
              const matchesCategory = Boolean(budget.categoryId && e.categoryId === budget.categoryId);
              const matchesPeriod = String(e.date || '').substring(0, 7) === String(budget.period || selectedMonth).substring(0, 7);
              const matchesOwner = (!budget.ownerType || budget.ownerType === 'SHARED') ? !e.isPrivate : Boolean(e.isPrivate);
              return matchesCategory && matchesPeriod && matchesOwner;
            })
            .reduce((acc, curr) => acc + normalize(curr.amount, curr.currency), 0);
          
          const actualSpent = computedSpent > 0 ? computedSpent : 0;
          const disponible = budget.base;
          const porcentaje = Math.min((actualSpent / disponible) * 100, 100) || 0;
          
          let alertColor = 'bg-emerald-500';
          let alertText = 'text-emerald-600';
          if (porcentaje >= 100) {
            alertColor = 'bg-rose-600';
            alertText = 'text-rose-600 font-black';
          } else if (porcentaje >= 80) {
            alertColor = 'bg-amber-500';
            alertText = 'text-amber-600 font-bold';
          }
          
          return (
            <Card key={budget.id} className="hover:border-indigo-200 transition-colors group cursor-default relative">
              <div className="absolute top-4 right-4 flex flex-col gap-2 z-20">
                <button onClick={() => handleOpenModal(budget)} className="p-1.5 bg-white text-slate-600 hover:text-blue-600 rounded-lg shadow-sm border border-slate-100">
                  <Edit2 size={16} />
                </button>
                <button onClick={() => handleDelete(budget.id)} className="p-1.5 bg-white text-slate-600 hover:text-rose-600 rounded-lg shadow-sm border border-slate-100">
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="flex items-center gap-4 mb-6">
                <div className="text-4xl bg-slate-100 p-4 rounded-2xl group-hover:scale-110 group-hover:bg-indigo-50 transition-all duration-300">
                  {budget.icon}
                </div>
                <div className="flex-1 pr-10">
                  <h3 className="font-bold text-slate-800 text-xl tracking-tight">{budget.category}</h3>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs p-4 bg-slate-50 rounded-2xl mb-5 text-center border border-slate-100">
                <div>
                  <span className="block text-slate-500 font-medium mb-1">Presupuesto Mensual</span>
                  <span className="font-black text-slate-800">{FormatCurrency(disponible)}</span>
                </div>
                <div className="border-l border-slate-200">
                  <span className="block text-slate-500 font-medium mb-1">Total Gastado</span>
                  <span className="font-bold text-slate-700">{FormatCurrency(actualSpent)}</span>
                </div>
              </div>

              <div className="flex justify-between text-sm mb-3 font-bold">
                <span className="text-slate-600">Porcentaje: {porcentaje.toFixed(1)}%</span>
                <span className={disponible - actualSpent < 0 ? 'text-rose-600' : alertText}>
                  Restante: {FormatCurrency(disponible - actualSpent)}
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden shadow-inner relative">
                <div 
                  className={`h-full transition-all duration-1000 ease-out ${alertColor}`} 
                  style={{ width: `${porcentaje}%` }}
                ></div>
                {porcentaje >= 80 && (
                  <div className="absolute top-0 right-0 h-full w-full bg-rose-500/20 animate-pulse pointer-events-none"></div>
                )}
              </div>
            </Card>
          )
        })}
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        title={editingBudget ? "Editar Presupuesto" : "Nuevo Presupuesto"}
      >
        <BudgetForm 
          initialData={editingBudget} 
          onSubmit={handleSubmit} 
          onCancel={handleCloseModal}
          appContext={appContext}
        />
      </Modal>
    </div>
  );
}
