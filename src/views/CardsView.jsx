import React, { useState } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { CardForm } from '../components/forms/CardForm';
import { FormatCurrency } from '../utils';

export function CardsView({ data, methods }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState(null);

  const handleOpenModal = (card = null) => {
    setEditingCard(card);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingCard(null);
    setIsModalOpen(false);
  };

  const handleSubmit = (formData) => {
    if (editingCard) {
      methods.updateCard(editingCard.id, formData);
    } else {
      methods.addCard(formData);
    }
    handleCloseModal();
  };

  const handleDelete = (id) => {
    if (window.confirm('¿Estás seguro de eliminar esta tarjeta?')) {
      methods.deleteCard(id);
    }
  };

  return (
    <div className="space-y-6 animate-in">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-slate-800">Gestión de Crédito</h2>
          <p className="text-slate-500 mt-2 font-medium">Controla tus fechas y pagos para no generar intereses.</p>
        </div>
        <Button onClick={() => handleOpenModal()}>
          <Plus size={18} className="mr-2" /> Nueva Tarjeta
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {data.cards.map(card => (
          <div 
            key={card.id} 
            className={`${card.color} rounded-[32px] p-8 text-white shadow-xl relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300`}
          >
            {/* Quick Actions overlay */}
            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
              <button onClick={() => handleOpenModal(card)} className="p-2 bg-white/10 hover:bg-white/30 backdrop-blur-sm rounded-full transition-colors">
                <Edit2 size={16} />
              </button>
              <button onClick={() => handleDelete(card.id)} className="p-2 bg-rose-500/50 hover:bg-rose-500/80 backdrop-blur-sm rounded-full transition-colors">
                <Trash2 size={16} />
              </button>
            </div>

            {/* Glossy overlay effect */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent opacity-50 pointer-events-none"></div>
            <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700 pointer-events-none"></div>
            <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-black/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700 pointer-events-none"></div>
            
            <div className="flex justify-between items-start mb-10 relative z-10 pr-16">
              <div>
                <h3 className="text-2xl font-black tracking-tight">{card.name}</h3>
                <span className="text-[10px] bg-black/20 px-3 py-1 rounded-lg mt-3 inline-block font-bold uppercase tracking-widest border border-white/10 backdrop-blur-sm shadow-sm">
                  {card.shared ? 'Uso Compartido' : 'Uso Individual'}
                </span>
              </div>
              <div className="text-right bg-black/20 px-4 py-2 rounded-2xl border border-white/10 backdrop-blur-md shadow-inner">
                <p className="text-[10px] opacity-70 uppercase tracking-widest font-bold mb-1">Límite</p>
                <p className="font-black tracking-tight">{FormatCurrency(card.limit)}</p>
              </div>
            </div>

            <div className="bg-white/10 p-6 rounded-[24px] backdrop-blur-md relative z-10 border border-white/20 shadow-lg group-hover:bg-white/20 transition-colors duration-300">
              <div className="flex justify-between items-end mb-6">
                <div>
                  <p className="text-xs opacity-90 mb-1 font-medium tracking-wide">Pago p/ no generar int.</p>
                  <p className="text-4xl font-black tracking-tighter">{FormatCurrency(card.noInterestPay)}</p>
                </div>
              </div>
              <div className="flex justify-between items-center text-sm font-bold pt-4 border-t border-white/20">
                <span className="opacity-90">Corte: Día {card.cutDay}</span>
                <span className="bg-white/20 px-3 py-1.5 rounded-lg text-white shadow-sm border border-white/10">
                  Pago: Día {card.payDay}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        title={editingCard ? "Editar Tarjeta" : "Nueva Tarjeta"}
      >
        <CardForm 
          initialData={editingCard} 
          users={data.users}
          onSubmit={handleSubmit} 
          onCancel={handleCloseModal} 
        />
      </Modal>
    </div>
  );
}
