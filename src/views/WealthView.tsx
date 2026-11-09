import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Plus, Edit2, Trash2, ShieldCheck, AlertCircle } from 'lucide-react';
import { Modal } from '../components/ui/Modal';
import { AssetForm } from '../components/forms/AssetForm';
import { SavingsGoals } from '../components/SavingsGoals';
import { FormatCurrency } from '../utils';

export function WealthView({ data, calc, methods }: { data: any; calc: any; methods: any }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<any | null>(null);

  const handleOpenModal = (asset: any = null) => {
    setEditingAsset(asset);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingAsset(null);
    setIsModalOpen(false);
  };

  const handleSubmit = (formData: any) => {
    if (editingAsset) {
      methods.updateAsset(editingAsset.id, formData);
    } else {
      methods.addAsset(formData);
    }
    handleCloseModal();
  };

  const handleDelete = (id: string) => {
    if (window.confirm('¿Estás seguro de eliminar este activo?')) {
      methods.deleteAsset(id);
    }
  };

  const isNetWorthPositive = (calc?.netWorth || 0) >= 0;

  return (
    <div className="space-y-6 animate-in">
      <div className="mb-2">
        <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">Patrimonio Neto</h2>
        <p className="text-slate-500 mt-1 font-medium text-sm">Activos (lo que tienes) menos Pasivos (lo que debes).</p>
      </div>

      {/* Hero Card de Patrimonio Neto Obsidian */}
      <div className="bg-[#111319] border border-[#232733] rounded-3xl p-8 sm:p-10 text-white shadow-bento text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#10B981]/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10">
          <span className="text-slate-400 font-bold uppercase tracking-widest text-xs mb-3 block">
            Riqueza Real del Hogar
          </span>
          <div className="text-5xl sm:text-7xl font-black text-white mb-4 tracking-tight tabular-nums">
            {FormatCurrency(calc?.netWorth || 0)}
          </div>
          <div>
            {isNetWorthPositive ? (
              <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold bg-[#E8F8F0] text-[#10B981] border border-[#10B981]/20">
                <ShieldCheck size={14} />
                <span>Tu patrimonio neto se mantiene en terreno positivo</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold bg-[#FDEFEA] text-[#F97316] border border-[#F97316]/20">
                <AlertCircle size={14} />
                <span>Pasivos superiores a los activos líquidos consolidados</span>
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="col-span-1 md:col-span-2">
          <SavingsGoals goals={data?.goals} />
        </div>

        {/* Tarjeta de Activos */}
        <div className="bg-white border border-[#EEF0F4] rounded-3xl p-6 shadow-bento space-y-5">
          <div className="flex justify-between items-center pb-4 border-b border-[#EEF0F4]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#E8F8F0] text-[#10B981] border border-[#10B981]/20 flex items-center justify-center shrink-0">
                <TrendingUp size={18} />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-900 tracking-tight">Activos</h3>
                <p className="text-xs font-bold text-[#10B981] tabular-nums mt-0.5">
                  {FormatCurrency(calc?.totalAssets || 0)}
                </p>
              </div>
            </div>
            <button 
              type="button"
              onClick={() => handleOpenModal()} 
              className="w-9 h-9 rounded-full bg-[#111319] hover:bg-[#1A1D26] text-white flex items-center justify-center transition-colors cursor-pointer shadow-sm"
              title="Nuevo Activo"
            >
              <Plus size={16} />
            </button>
          </div>
          
          <div className="space-y-3">
            {(data?.assets || []).length === 0 ? (
              <div className="text-center py-8 text-slate-400 bg-[#F8FAFC] rounded-2xl border border-dashed border-[#EEF0F4]">
                <p className="text-xs font-medium text-slate-500">No hay activos registrados todavía.</p>
              </div>
            ) : (
              (data?.assets || []).map((asset: any) => (
                <div key={asset.id} className="flex justify-between items-center p-3.5 bg-[#F8FAFC] rounded-2xl border border-[#EEF0F4] hover:bg-[#F1F5F9] transition-colors group">
                  <div className="min-w-0 pr-2">
                    <p className="font-semibold text-slate-900 text-sm truncate">{asset.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5 truncate">
                      <span>{asset.type}</span>
                      {asset.owner && (
                        <>
                          <span> • </span>
                          <span className="text-slate-600 font-medium">{asset.owner}</span>
                        </>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <p className="font-bold text-[#10B981] tabular-nums text-sm sm:text-base tracking-tight">
                      {FormatCurrency(asset.value)}
                    </p>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        type="button"
                        onClick={() => handleOpenModal(asset)} 
                        className="p-1 text-slate-400 hover:text-slate-900 transition-colors cursor-pointer"
                        title="Editar"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button 
                        type="button"
                        onClick={() => handleDelete(asset.id)} 
                        className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                        title="Eliminar"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Tarjeta de Pasivos */}
        <div className="bg-white border border-[#EEF0F4] rounded-3xl p-6 shadow-bento space-y-5">
          <div className="flex justify-between items-center pb-4 border-b border-[#EEF0F4]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#FDEFEA] text-[#F97316] border border-[#F97316]/20 flex items-center justify-center shrink-0">
                <TrendingDown size={18} />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-900 tracking-tight">Pasivos</h3>
                <p className="text-xs font-bold text-[#F97316] tabular-nums mt-0.5">
                  -{FormatCurrency(calc?.totalLiabilities || 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {((data?.accounts || []).filter((a: any) => a.type === 'LIABILITY' || a.type === 'CREDIT_CARD')).length === 0 ? (
              <div className="text-center py-8 text-slate-400 bg-[#F8FAFC] rounded-2xl border border-dashed border-[#EEF0F4]">
                <p className="text-xs font-medium text-slate-500">Sin pasivos o deudas registradas.</p>
              </div>
            ) : (
              (data?.accounts || []).filter((a: any) => a.type === 'LIABILITY' || a.type === 'CREDIT_CARD').map((debt: any) => (
                <div key={debt.id} className="flex justify-between items-center p-3.5 bg-[#F8FAFC] rounded-2xl border border-[#EEF0F4] hover:bg-[#F1F5F9] transition-colors">
                  <div className="min-w-0 pr-2">
                    <p className="font-semibold text-slate-900 text-sm truncate">{debt.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {debt.type === 'CREDIT_CARD' ? 'Tarjeta de Crédito' : 'Pasivo / Préstamo'}
                    </p>
                  </div>
                  <p className="font-bold text-[#F97316] tabular-nums text-sm sm:text-base tracking-tight shrink-0">
                    {FormatCurrency(debt.balance || 0)}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        title={editingAsset ? "Editar Activo" : "Nuevo Activo"}
      >
        <AssetForm 
          initialData={editingAsset} 
          users={data?.users}
          onSubmit={handleSubmit} 
          onCancel={handleCloseModal} 
        />
      </Modal>
    </div>
  );
}
