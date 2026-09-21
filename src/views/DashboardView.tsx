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
      <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white p-8 rounded-[32px] shadow-xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500">
          <PieChart size={140} />
        </div>
        <div className="relative z-10 flex justify-between items-start">
          <div>
            <h2 className="text-emerald-100 font-medium mb-2 uppercase tracking-widest text-xs flex items-center gap-2">
              <TrendingUp size={14} /> Presupuesto Base Cero
            </h2>
            <div className="text-5xl sm:text-6xl font-black mb-3 tracking-tighter">
              {FormatCurrency(calc.unallocated)}
            </div>
            <p className="text-sm text-emerald-50 max-w-sm leading-relaxed backdrop-blur-sm bg-black/10 p-3 rounded-2xl inline-block border border-white/10">
              {calc.unallocated === 0 
                ? '¡Perfecto! Cada peso tiene una misión este mes.' 
                : calc.unallocated > 0 
                  ? 'Tienes dinero sin asignar. Asígnalo a deudas o inversiones para completar la base cero.'
                  : 'Atención: Tu presupuesto excede tus ingresos.'}
            </p>
          </div>
          <Button variant="ghost" className="text-white hover:bg-white/20 border border-white/30" onClick={() => handleOpenModal()}>
            <Plus size={18} className="mr-1" /> Ingreso
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <h2 className="text-lg font-bold mb-6 flex items-center gap-3">
            <div className="bg-emerald-100 p-2 rounded-xl text-emerald-600">
              <UserPlus size={20} />
            </div>
            Mi Casa
          </h2>
          <div className="space-y-4">
            {data.users.map(u => (
              <div key={u.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className={`w-10 h-10 rounded-full ${u.avatar || 'bg-slate-300'} flex items-center justify-center text-white font-bold`}>
                  {u.photoURL ? (
                    <>
                      <img 
                        src={u.photoURL} 
                        alt={u.name} 
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover rounded-full" 
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
                  <p className="font-bold text-slate-800">{u.name}</p>
                  <p className="text-xs text-slate-500">{u.email}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-bold mb-8 flex items-center gap-3">
            <div className="bg-indigo-100 p-2 rounded-xl text-indigo-600">
              <PieChart size={20} />
            </div>
            Regla 50/30/20 (Asignación Actual)
          </h2>
          <div className="space-y-6">
            {[
              { label: 'Necesidades', target: 'Meta: 50%', color: 'bg-indigo-500', pct: calc.needsPct },
              { label: 'Deseos', target: 'Meta: 30%', color: 'bg-amber-400', pct: calc.wantsPct },
              { label: 'Ahorro / Deudas', target: 'Meta: 20%', color: 'bg-emerald-500', pct: calc.savingsPct },
            ].map(item => (
              <div key={item.label} className="group cursor-default">
                <div className="flex justify-between items-end mb-2">
                  <div>
                    <span className="font-bold text-slate-800 block text-sm sm:text-base">{item.label}</span>
                    <span className="text-xs text-slate-400 font-medium">{item.target}</span>
                  </div>
                  <span className="font-bold text-lg group-hover:scale-110 transition-transform origin-right">
                    {item.pct.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-slate-100/80 rounded-full h-4 overflow-hidden border border-slate-200 shadow-inner">
                  <div 
                    className={`${item.color} h-4 rounded-full transition-all duration-1000 ease-out`} 
                    style={{ width: `${Math.min(item.pct, 100)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-bold mb-6">Desglose de Ingresos</h2>
          <div className="space-y-3">
            {data.incomes.map(income => {
              const user = data.users.find(u => u.id === income.userId);
              return (
                <div key={income.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100 group">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full ${user?.avatar || 'bg-slate-300'} flex items-center justify-center text-white font-bold text-xs`}>
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
                      <p className="font-bold text-slate-800 text-sm">{income.type}</p>
                      <p className="text-xs text-slate-500">{user?.name} &bull; {income.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="font-bold text-emerald-600">{FormatCurrency(income.amount)}</p>
                    <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleOpenModal(income)} className="text-slate-400 hover:text-blue-500">
                        <Edit2 size={14} />
                      </button>
                      <button onClick={() => handleDelete(income.id)} className="text-slate-400 hover:text-rose-500">
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
