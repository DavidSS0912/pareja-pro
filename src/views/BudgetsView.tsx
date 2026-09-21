import React, { useState } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { BudgetForm } from '../components/forms/BudgetForm';
import { FormatCurrency } from '../utils';

const EXCHANGE_RATE_USD_MXN = 20;
const normalize = (amount, currency) => {
  if (!amount) return 0;
  return currency === 'USD' ? amount * EXCHANGE_RATE_USD_MXN : amount;
};

export function BudgetsView({ data, methods }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);

  const handleOpenModal = (budget = null) => {
    setEditingBudget(budget);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingBudget(null);
    setIsModalOpen(false);
  };

  const handleSubmit = (formData) => {
    if (editingBudget) {
      methods.updateBudget(editingBudget.id, formData);
    } else {
      methods.addBudget(formData);
    }
    handleCloseModal();
  };

  const handleDelete = (id) => {
    if (window.confirm('¿Estás seguro de eliminar este presupuesto?')) {
      methods.deleteBudget(id);
    }
  };

  return (
    <div className="space-y-6 animate-in">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-slate-800">Rollover & Fondos</h2>
          <p className="text-slate-500 mt-2 font-medium">Saldos arrastrados de meses anteriores.</p>
        </div>
        <Button onClick={() => handleOpenModal()}>
          <Plus size={18} className="mr-2" /> Nuevo Presupuesto
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {data.budgets.map(budget => {
          const computedSpent = data.expenses
            .filter(e => e.category === budget.category && !e.isPrivate)
            .reduce((acc, curr) => acc + normalize(curr.amount, curr.currency), 0);
          
          // Fallback to budget.spent if no matching expenses found (for mock data compatibility)
          const actualSpent = computedSpent > 0 ? computedSpent : budget.spent || 0;

          const disponible = budget.base + budget.rollover;
          const porcentaje = Math.min((actualSpent / disponible) * 100, 100) || 0;
          
          let alertColor = budget.type === 'Ahorro' ? 'bg-indigo-500' : 'bg-emerald-500';
          let alertText = 'text-emerald-600';
          if (budget.type !== 'Ahorro') {
            if (porcentaje >= 100) {
              alertColor = 'bg-rose-600';
              alertText = 'text-rose-600 font-black';
            } else if (porcentaje >= 80) {
              alertColor = 'bg-amber-500';
              alertText = 'text-amber-600 font-bold';
            }
          }
          
          return (
            <Card key={budget.id} className="hover:border-emerald-200 transition-colors group cursor-default relative">
              <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleOpenModal(budget)} className="p-1.5 bg-white text-slate-500 hover:text-blue-600 rounded-lg shadow-sm border border-slate-100">
                  <Edit2 size={16} />
                </button>
                <button onClick={() => handleDelete(budget.id)} className="p-1.5 bg-white text-slate-500 hover:text-rose-600 rounded-lg shadow-sm border border-slate-100">
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="flex items-center gap-4 mb-6">
                <div className="text-4xl bg-slate-100 p-4 rounded-2xl group-hover:scale-110 group-hover:bg-emerald-50 transition-all duration-300">
                  {budget.icon}
                </div>
                <div className="flex-1 pr-10">
                  <h3 className="font-bold text-slate-800 text-xl tracking-tight">{budget.category}</h3>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="text-[10px] uppercase font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded-md tracking-wider">
                      {budget.type}
                    </span>
                    {budget.type === 'Ahorro' && (
                      <span className="text-[10px] uppercase font-bold text-indigo-700 bg-indigo-100 px-2 py-1 rounded-md tracking-wider">
                        Sinking Fund
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs p-4 bg-slate-50 rounded-2xl mb-5 text-center border border-slate-100">
                <div>
                  <span className="block text-slate-400 font-medium mb-1">Base Mes</span>
                  <span className="font-bold text-slate-700">{FormatCurrency(budget.base)}</span>
                </div>
                <div className="border-x border-slate-200">
                  <span className="block text-slate-400 font-medium mb-1">Rollover</span>
                  <span className={`font-bold ${budget.rollover >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {budget.rollover > 0 ? '+' : ''}{FormatCurrency(budget.rollover)}
                  </span>
                </div>
                <div>
                  <span className="block text-slate-400 font-medium mb-1">Total Disp.</span>
                  <span className="font-black text-slate-800">{FormatCurrency(disponible)}</span>
                </div>
              </div>

              <div className="flex justify-between text-sm mb-3 font-bold">
                <span className="text-slate-500">Gastado: {FormatCurrency(actualSpent)}</span>
                <span className={disponible - actualSpent < 0 ? 'text-rose-600' : alertText}>
                  Restante: {FormatCurrency(disponible - actualSpent)}
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden shadow-inner relative">
                <div 
                  className={`h-full transition-all duration-1000 ease-out ${alertColor}`} 
                  style={{ width: `${porcentaje}%` }}
                ></div>
                {porcentaje >= 80 && budget.type !== 'Ahorro' && (
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
        />
      </Modal>
    </div>
  );
}
