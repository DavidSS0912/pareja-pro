import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Plus, Edit2, Trash2 } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { AssetForm } from '../components/forms/AssetForm';
import { SavingsGoals } from '../components/SavingsGoals';
import { FormatCurrency } from '../utils';

export function WealthView({ data, calc, methods }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);

  const handleOpenModal = (asset = null) => {
    setEditingAsset(asset);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingAsset(null);
    setIsModalOpen(false);
  };

  const handleSubmit = (formData) => {
    if (editingAsset) {
      methods.updateAsset(editingAsset.id, formData);
    } else {
      methods.addAsset(formData);
    }
    handleCloseModal();
  };

  const handleDelete = (id) => {
    if (window.confirm('¿Estás seguro de eliminar este activo?')) {
      methods.deleteAsset(id);
    }
  };

  return (
    <div className="space-y-6 animate-in">
      <div className="mb-8">
        <h2 className="text-3xl font-black tracking-tight text-slate-800">Patrimonio Neto</h2>
        <p className="text-slate-500 mt-2 font-medium">Activos (Lo que tienes) menos Pasivos (Lo que debes).</p>
      </div>

      <Card className="bg-gradient-to-br from-emerald-50 to-teal-100/50 border-emerald-100 text-center py-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-200/50 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
        <div className="relative z-10">
          <h3 className="text-emerald-800 font-bold uppercase tracking-widest text-sm mb-4">Riqueza Real del Hogar</h3>
          <div className="text-6xl sm:text-7xl font-black text-emerald-600 mb-4 tracking-tighter drop-shadow-sm">
            {FormatCurrency(calc.netWorth)}
          </div>
          <p className="text-emerald-700 font-medium bg-emerald-100/50 inline-block px-4 py-1.5 rounded-full backdrop-blur-sm border border-emerald-200/50">
            Tu patrimonio está en números positivos.
          </p>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SavingsGoals goals={data.goals} />
        <Card className="hover:border-emerald-200 transition-colors">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-black text-xl flex items-center gap-3 text-emerald-600 tracking-tight">
              <div className="bg-emerald-100 p-2 rounded-xl text-emerald-600">
                <TrendingUp size={20} />
              </div>
              Activos <span className="opacity-70">+{FormatCurrency(calc.totalAssets)}</span>
            </h3>
            <Button size="sm" onClick={() => handleOpenModal()} className="!p-2"><Plus size={16}/></Button>
          </div>
          
          <div className="space-y-4">
            {data.assets.map(asset => (
              <div key={asset.id} className="flex justify-between items-center p-4 bg-slate-50/80 rounded-2xl border border-slate-100 hover:bg-emerald-50 transition-colors group">
                <div>
                  <p className="font-bold text-slate-800">{asset.name}</p>
                  <p className="text-xs font-medium text-slate-500 mt-1">{asset.type} • <span className="text-slate-600 font-bold">{asset.owner}</span></p>
                </div>
                <div className="flex items-center gap-4">
                  <p className="font-black text-emerald-600 text-lg tracking-tight">{FormatCurrency(asset.value)}</p>
                  <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleOpenModal(asset)} className="text-slate-400 hover:text-blue-500">
                      <Edit2 size={14} />
                    </button>
                    <button onClick={() => handleDelete(asset.id)} className="text-slate-400 hover:text-rose-500">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="hover:border-rose-200 transition-colors">
          <h3 className="font-black text-xl mb-6 flex items-center gap-3 text-rose-600 tracking-tight">
            <div className="bg-rose-100 p-2 rounded-xl text-rose-600">
              <TrendingDown size={20} />
            </div>
            Pasivos <span className="ml-auto opacity-70">-{FormatCurrency(calc.totalLiabilities)}</span>
          </h3>
          <div className="space-y-4">
            {data.cards.map(debt => (
              <div key={debt.id} className="flex justify-between items-center p-4 bg-slate-50/80 rounded-2xl border border-slate-100 hover:bg-rose-50 transition-colors">
                <div>
                  <p className="font-bold text-slate-800">{debt.name}</p>
                  <p className="text-xs font-medium text-slate-500 mt-1">Tarjeta de Crédito</p>
                </div>
                <p className="font-black text-rose-600 text-lg tracking-tight">{FormatCurrency(debt.balance)}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        title={editingAsset ? "Editar Activo" : "Nuevo Activo"}
      >
        <AssetForm 
          initialData={editingAsset} 
          users={data.users}
          onSubmit={handleSubmit} 
          onCancel={handleCloseModal} 
        />
      </Modal>
    </div>
  );
}
