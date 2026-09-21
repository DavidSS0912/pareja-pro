import React, { useState } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { ExpenseForm } from '../components/forms/ExpenseForm';
import { FormatCurrency } from '../utils';

export function SettlementView({ data, calc, methods }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);

  const handleOpenModal = (expense = null) => {
    setEditingExpense(expense);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingExpense(null);
    setIsModalOpen(false);
  };

  const handleSubmit = (formData) => {
    if (editingExpense) {
      methods.updateExpense(editingExpense.id, formData);
    } else {
      methods.addExpense(formData);
    }
    handleCloseModal();
  };

  const handleDelete = (id) => {
    if (window.confirm('¿Estás seguro de eliminar este gasto? Esto recalculará el liquidador.')) {
      methods.deleteExpense(id);
    }
  };

  return (
    <div className="space-y-6 animate-in">
      <div className="mb-8">
        <h2 className="text-3xl font-black tracking-tight text-slate-800">Liquidador Interno</h2>
        <p className="text-slate-500 mt-2 font-medium">Conciliación automática de gastos compartidos.</p>
      </div>

      <Card className="bg-gradient-to-br from-slate-900 to-slate-800 text-white border-0 py-16 relative overflow-hidden shadow-2xl">
        {/* Background decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-700/50 via-transparent to-transparent pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="text-center relative z-10">
          <p className="text-slate-400 font-bold mb-4 tracking-widest uppercase text-sm">Balance Neto Mensual</p>
          <div className="text-7xl font-black mb-8 tracking-tighter text-emerald-400 drop-shadow-lg">
            {FormatCurrency(calc.settlementAmount)}
          </div>
          
          <div className="inline-flex items-center gap-5 bg-white/10 p-2.5 pr-8 rounded-full border border-white/10 backdrop-blur-md shadow-xl">
            {calc.netSettlement > 0 ? (
               <>
                 <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center font-black text-xl shadow-inner border border-purple-300/30">Z</div> 
                 <span className="font-bold text-lg tracking-tight">Zoé transfiere a David</span>
               </>
            ) : calc.netSettlement < 0 ? (
               <>
                 <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center font-black text-xl shadow-inner border border-blue-300/30">D</div> 
                 <span className="font-bold text-lg tracking-tight">David transfiere a Zoé</span>
               </>
            ) : (
              <span className="px-6 py-2 font-bold text-lg tracking-tight">Cuentas Saldadas 🙌</span>
            )}
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-xl text-slate-800">Historial de Gastos</h3>
          <Button onClick={() => handleOpenModal()} size="sm">
            <Plus size={16} className="mr-1" /> Nuevo Gasto
          </Button>
        </div>
        
        <div className="space-y-3">
          {data.expenses.map(exp => {
            const payer = data.users.find(u => u.id === exp.paidBy);
            return (
              <div key={exp.id} className="flex justify-between items-center p-4 bg-slate-50 hover:bg-slate-100 rounded-2xl border border-slate-100 transition-colors group">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full ${payer?.avatar || 'bg-slate-300'} flex items-center justify-center text-white font-bold`}>
                    {payer?.name?.[0]}
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">{exp.desc} {exp.isPrivate && <span className="text-xs ml-2 bg-slate-200 text-slate-600 px-2 py-1 rounded">Privado</span>}</p>
                    <p className="text-xs font-medium text-slate-500 mt-1">
                      Pagado por {payer?.name} • División: {exp.isPrivate ? 'No aplica (Privado)' : (exp.splitType === 'proporcional' ? 'Proporcional' : '50/50')} • Moneda: {exp.currency || 'MXN'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <span className="font-black text-slate-800 text-lg">{FormatCurrency(exp.amount)}</span>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleOpenModal(exp)} className="p-2 text-slate-400 hover:text-blue-500 hover:bg-white rounded-lg transition-colors">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => handleDelete(exp.id)} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-white rounded-lg transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <Modal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        title={editingExpense ? "Editar Gasto" : "Nuevo Gasto"}
      >
        <ExpenseForm 
          initialData={editingExpense} 
          users={data.users}
          onSubmit={handleSubmit} 
          onCancel={handleCloseModal} 
        />
      </Modal>
    </div>
  );
}
