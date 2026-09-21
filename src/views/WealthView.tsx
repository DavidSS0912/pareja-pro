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

      <Card className="text-center py-12 relative overflow-hidden">
        <div className="relative z-10">
          <h3 className="text-slate-500 font-medium uppercase tracking-widest text-xs mb-4">Riqueza Real del Hogar</h3>
          <div className="text-6xl sm:text-7xl font-black text-slate-900 mb-4 tracking-tighter tabular-nums">
            {FormatCurrency(calc.netWorth)}
          </div>
          <p className="text-green-700 font-medium bg-green-50 inline-block px-4 py-1.5 rounded-lg border border-green-200 text-sm">
            Tu patrimonio está en números positivos.
          </p>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SavingsGoals goals={data.goals} />
        <Card className="hover:border-indigo-200 transition-colors">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-lg flex items-center gap-3 text-slate-900 tracking-tight">
              <div className="bg-green-50 p-2 rounded-lg text-green-600">
                <TrendingUp size={18} />
              </div>
              Activos <span className="text-green-600 tabular-nums font-medium text-base">{FormatCurrency(calc.totalAssets)}</span>
            </h3>
            <Button size="sm" onClick={() => handleOpenModal()} className="!p-2"><Plus size={16}/></Button>
          </div>
          
          <div className="space-y-3">
            {data.assets.map(asset => (
              <div key={asset.id} className="flex justify-between items-center p-3 bg-white rounded-lg border border-[#E5E5E5] hover:border-indigo-200 transition-colors group">
                <div>
                  <p className="font-medium text-slate-900">{asset.name}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{asset.type} • <span className="text-slate-600 font-medium">{asset.owner}</span></p>
                </div>
                <div className="flex items-center gap-4">
                  <p className="font-semibold text-green-600 tabular-nums tracking-tight">{FormatCurrency(asset.value)}</p>
                  <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleOpenModal(asset)} className="text-slate-400 hover:text-indigo-600">
                      <Edit2 size={14} />
                    </button>
                    <button onClick={() => handleDelete(asset.id)} className="text-slate-400 hover:text-red-600">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="hover:border-red-200 transition-colors">
          <h3 className="font-bold text-lg mb-6 flex items-center gap-3 text-slate-900 tracking-tight">
            <div className="bg-red-50 p-2 rounded-lg text-red-600">
              <TrendingDown size={18} />
            </div>
            Pasivos <span className="ml-auto text-red-600 tabular-nums font-medium text-base">-{FormatCurrency(calc.totalLiabilities)}</span>
          </h3>
          <div className="space-y-3">
            {data.cards.map(debt => (
              <div key={debt.id} className="flex justify-between items-center p-3 bg-white rounded-lg border border-[#E5E5E5] hover:border-red-200 transition-colors">
                <div>
                  <p className="font-medium text-slate-900">{debt.name}</p>
                  <p className="text-xs text-slate-500 mt-0.5">Tarjeta de Crédito</p>
                </div>
                <p className="font-semibold text-red-600 tabular-nums tracking-tight">{FormatCurrency(debt.balance)}</p>
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
