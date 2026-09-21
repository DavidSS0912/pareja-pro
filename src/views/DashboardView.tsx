import React, { useState } from 'react';
import { PieChart, TrendingUp, Plus, Trash2, Edit2, UserPlus } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { IncomeForm } from '../components/forms/IncomeForm';
import { FormatCurrency } from '../utils';
import { PaymentCalendar } from '../components/PaymentCalendar';

export function DashboardView({ data, calc, methods }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIncome, setEditingIncome] = useState(null);

  const handleOpenModal = (income = null) => {
    setEditingIncome(income);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingIncome(null);
    setIsModalOpen(false);
  };

  const handleSubmit = (formData) => {
    if (editingIncome) {
      methods.updateIncome(editingIncome.id, formData);
    } else {
      methods.addIncome(formData);
    }
    handleCloseModal();
  };

  const handleDelete = (id) => {
    if (window.confirm('¿Estás seguro de eliminar este ingreso?')) {
      methods.deleteIncome(id);
    }
  };

  return (
    <div className="space-y-6 animate-in">
      <div className="bg-white p-8 rounded-2xl border border-[#E5E5E5] flex justify-between items-start">
        <div>
          <h2 className="text-slate-500 font-medium mb-2 uppercase tracking-wider text-xs flex items-center gap-2">
            <TrendingUp size={14} /> Presupuesto Base Cero
          </h2>
          <div className="text-5xl sm:text-6xl font-title font-bold mb-3 tracking-tight text-slate-900 tabular-nums">
            {FormatCurrency(calc.unallocated)}
          </div>
          <p className="text-sm text-slate-600 max-w-sm leading-relaxed p-3 rounded-lg bg-slate-50 border border-[#E5E5E5]">
            {calc.unallocated === 0 
              ? '¡Perfecto! Cada peso tiene una misión este mes.' 
              : calc.unallocated > 0 
                ? 'Tienes dinero sin asignar. Asígnalo a deudas o inversiones para completar la base cero.'
                : 'Atención: Tu presupuesto excede tus ingresos.'}
          </p>
        </div>
        <Button variant="outline" className="text-indigo-600 hover:bg-indigo-50 border border-indigo-200" onClick={() => handleOpenModal()}>
          <Plus size={18} className="mr-1" /> Ingreso
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="rounded-2xl border border-[#E5E5E5] shadow-none">
          <h2 className="text-lg font-title font-bold text-slate-900 mb-6 flex items-center gap-3">
            <div className="bg-slate-100 p-2 rounded-lg text-slate-600">
              <UserPlus size={20} />
            </div>
            Mi Casa
          </h2>
          <div className="space-y-4">
            {data.users.map(u => (
              <div key={u.id} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-[#E5E5E5]">
                <div className={`w-10 h-10 rounded-full ${u.avatar || 'bg-slate-200'} flex items-center justify-center text-slate-700 font-bold`}>
                  {u.photoURL ? (
                    <>
                      <img 
                        src={u.photoURL} 
                        alt={u.name} 
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover rounded-full border border-[#E5E5E5]" 
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          if (e.currentTarget.nextElementSibling) {
                            e.currentTarget.nextElementSibling.classList.remove('hidden');
                          }
                        }}
                      />
                      <span className="hidden">{u.name?.[0]}</span>
                    </>
                  ) : (
                    u.name?.[0]
                  )}
                </div>
                <div>
                  <p className="font-bold text-slate-900">{u.name}</p>
                  <p className="text-xs text-slate-500">{u.email}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="rounded-2xl border border-[#E5E5E5] shadow-none">
          <h2 className="text-lg font-title font-bold text-slate-900 mb-8 flex items-center gap-3">
            <div className="bg-indigo-50 p-2 rounded-lg text-indigo-600">
              <PieChart size={20} />
            </div>
            Regla 50/30/20
          </h2>
          <div className="space-y-6">
            {[
              { label: 'Necesidades', target: 'Meta: 50%', color: 'bg-indigo-500', pct: calc.needsPct },
              { label: 'Deseos', target: 'Meta: 30%', color: 'bg-slate-400', pct: calc.wantsPct },
              { label: 'Ahorro / Deudas', target: 'Meta: 20%', color: 'bg-slate-800', pct: calc.savingsPct },
            ].map(item => (
              <div key={item.label} className="group cursor-default">
                <div className="flex justify-between items-end mb-2">
                  <div>
                    <span className="font-medium text-slate-900 block text-sm">{item.label}</span>
                    <span className="text-xs text-slate-500">{item.target}</span>
                  </div>
                  <span className="font-medium tabular-nums tracking-tight text-slate-900">
                    {item.pct.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div 
                    className={`${item.color} h-2 rounded-full transition-all duration-1000 ease-out`} 
                    style={{ width: `${Math.min(item.pct, 100)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="rounded-2xl border border-[#E5E5E5] shadow-none">
          <h2 className="text-lg font-title font-bold text-slate-900 mb-6">Desglose de Ingresos</h2>
          <div className="space-y-3">
            {data.incomes.map(income => {
              const user = data.users.find(u => u.id === income.userId);
              return (
                <div key={income.id} className="flex justify-between items-center p-3 bg-white rounded-lg border border-[#E5E5E5] group hover:border-indigo-200 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full ${user?.avatar || 'bg-slate-200'} flex items-center justify-center text-slate-700 font-bold text-xs`}>
                      {user?.photoURL ? (
                        <>
                          <img 
                            src={user.photoURL} 
                            alt={user?.name} 
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover rounded-full" 
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              if (e.currentTarget.nextElementSibling) {
                                e.currentTarget.nextElementSibling.classList.remove('hidden');
                              }
                            }}
                          />
                          <span className="hidden">{user?.name?.[0]}</span>
                        </>
                      ) : (
                        user?.name?.[0]
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 text-sm">{income.type}</p>
                      <p className="text-xs text-slate-500">{user?.name} &bull; {income.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="font-medium text-green-600 tabular-nums tracking-tight">{FormatCurrency(income.amount)}</p>
                    <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleOpenModal(income)} className="text-slate-400 hover:text-indigo-600">
                        <Edit2 size={14} />
                      </button>
                      <button onClick={() => handleDelete(income.id)} className="text-slate-400 hover:text-red-600">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      <div className="mt-6">
        <PaymentCalendar expenses={data.expenses} />
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        title={editingIncome ? "Editar Ingreso" : "Nuevo Ingreso"}
      >
        <IncomeForm 
          initialData={editingIncome} 
          users={data.users} 
          onSubmit={handleSubmit} 
          onCancel={handleCloseModal} 
        />
      </Modal>
    </div>
  );
}
