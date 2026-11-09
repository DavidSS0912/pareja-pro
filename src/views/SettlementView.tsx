import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Download, UserPlus, Check } from 'lucide-react';
import { Modal } from '../components/ui/Modal';
import { MovementForm } from '../components/forms/MovementForm';
import { FormatCurrency, exportToCSV } from '../utils';
import { createInvitation } from '../services/userService';

const formatDateDDMMAAAA = (dateStr?: string) => {
  if (!dateStr) return 'N/A';
  if (typeof dateStr === 'string' && /^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
    const [year, month, day] = dateStr.slice(0, 10).split('-');
    return `${day}/${month}/${year}`;
  }
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

const getSplitLabel = (exp: any) => {
  if (exp.isPrivate || exp.splitType === 'individual') return 'Individual';
  if (exp.splitType === 'proporcional') return 'Proporcional';
  return '50/50';
};

export function SettlementView({ data, calc, methods }: { data?: any; calc?: any; methods?: any }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [inviteCopied, setInviteCopied] = useState(false);
  const [isInviting, setIsInviting] = useState(false);

  const users = data?.users || [];
  const hasMultipleUsers = users.length >= 2;

  const userA = users[0];
  const userB = users[1];
  const nameA = userA?.name || userA?.displayName || userA?.email?.split('@')[0] || 'Usuario 1';
  const nameB = userB?.name || userB?.displayName || userB?.email?.split('@')[0] || 'Usuario 2';
  const initialA = nameA.charAt(0).toUpperCase();
  const initialB = nameB.charAt(0).toUpperCase();

  const netSettlement = calc?.netSettlement || 0;
  const settlementAmount = calc?.settlementAmount || 0;

  const handleOpenModal = (_expense: any = null) => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleMovementSubmit = async (action: any) => {
    if (action.type === 'EXPENSE') {
      await methods?.addExpense?.(action.payload);
    } else if (action.type === 'INCOME') {
      await methods?.addIncome?.(action.payload);
    } else if (action.type === 'TRANSFER') {
      await methods?.payCreditCard?.(
        action.payload.sourceAccountId,
        action.payload.targetAccountId,
        action.payload.amount,
        action.payload.date,
        action.payload.ownerUid,
        action.payload.isShared
      );
    }
    handleCloseModal();
  };

  const handleDelete = (id: string) => {
    if (window.confirm('¿Estás seguro de eliminar este gasto? Esto recalculará el liquidador.')) {
      methods?.deleteExpense?.(id);
    }
  };

  const handleInvite = async () => {
    setIsInviting(true);
    try {
      if (methods?.handleInvite && typeof methods.handleInvite === 'function') {
        await methods.handleInvite();
      }

      const userId = data?.user?.uid || '';
      const houseId = data?.houseId || '';
      const inviteId = await createInvitation(userId, houseId);
      if (inviteId) {
        const link = `${window.location.origin}/invite/${inviteId}`;
        setInviteLink(link);
        try {
          await navigator.clipboard.writeText(link);
          setInviteCopied(true);
          setTimeout(() => setInviteCopied(false), 4000);
        } catch (clipErr) {
          console.warn('Clipboard write failed:', clipErr);
        }
      }
    } catch (err) {
      console.error('Error al generar invitación:', err);
    } finally {
      setIsInviting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in">
      <div className="mb-2">
        <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">Liquidador Interno</h2>
        <p className="text-slate-500 mt-1 font-medium text-sm">Conciliación automática de gastos compartidos en el hogar.</p>
      </div>

      {!hasMultipleUsers ? (
        <div className="bg-white border border-[#EEF0F4] rounded-3xl p-8 sm:p-12 text-center shadow-bento relative overflow-hidden">
          <div className="max-w-md mx-auto flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-[#EEF2FF] text-[#6366F1] flex items-center justify-center mb-6 border border-[#6366F1]/10">
              <UserPlus className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-3 tracking-tight">Liquidación en Pareja</h3>
            <p className="text-slate-500 font-medium mb-8 text-sm leading-relaxed">
              Para conciliar gastos compartidos y calcular automáticamente quién le debe a quién, necesitas al menos dos integrantes en tu casa.
            </p>
            
            <button 
              type="button"
              onClick={handleInvite}
              disabled={isInviting}
              className="w-full sm:w-auto bg-[#111319] hover:bg-[#1A1D26] text-white rounded-full px-8 py-3.5 font-medium transition-colors duration-150 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <UserPlus size={18} />
              <span>{isInviting ? 'Generando invitación...' : 'Invitar a alguien a mi casa'}</span>
            </button>

            {inviteCopied && (
              <div className="mt-4 p-3 bg-[#E8F8F0] border border-[#10B981]/20 text-[#10B981] text-xs font-semibold rounded-2xl flex items-center gap-2 animate-in fade-in">
                <Check size={16} className="text-[#10B981] shrink-0" />
                <span>¡Enlace copiado al portapapeles! Compártelo con tu pareja.</span>
              </div>
            )}

            {inviteLink && !inviteCopied && (
              <div className="mt-4 w-full p-3 bg-[#F8FAFC] border border-[#EEF0F4] rounded-2xl text-xs text-slate-600 font-mono break-all flex items-center justify-between gap-2">
                <span className="truncate">{inviteLink}</span>
                <button 
                  type="button" 
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(inviteLink);
                      setInviteCopied(true);
                      setTimeout(() => setInviteCopied(false), 4000);
                    } catch (e) {
                      console.error(e);
                    }
                  }} 
                  className="text-slate-900 hover:text-[#6366F1] font-sans font-semibold shrink-0 cursor-pointer text-xs"
                >
                  Copiar
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-[#111319] border border-[#232733] rounded-3xl p-6 sm:p-10 text-white shadow-bento relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#6366F1]/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="text-center relative z-10">
            <span className="inline-block text-slate-400 font-bold mb-3 tracking-widest uppercase text-xs">
              Balance Neto Mensual
            </span>
            <div className="text-5xl sm:text-7xl font-black mb-8 tracking-tight text-white tabular-nums">
              {FormatCurrency(settlementAmount)}
            </div>
            
            <div className="inline-flex items-center gap-3 sm:gap-4 bg-[#1A1D26] p-2.5 px-5 rounded-2xl border border-[#232733] max-w-full">
              {netSettlement > 0 ? (
                 <>
                   <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full overflow-hidden bg-[#EEF2FF] text-[#6366F1] flex items-center justify-center font-bold text-base shadow-sm border border-[#232733] shrink-0">
                     {(userB?.photoURL || userB?.photoUrl) ? (
                       <img src={userB.photoURL || userB.photoUrl} alt={nameB} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                     ) : (
                       <span>{initialB}</span>
                     )}
                   </div> 
                   <span className="font-semibold text-sm sm:text-base tracking-tight">
                     {nameB} <span className="text-slate-400 font-normal">transfiere a</span> {nameA}
                   </span>
                   <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full overflow-hidden bg-[#E8F8F0] text-[#10B981] flex items-center justify-center font-bold text-base shadow-sm border border-[#232733] shrink-0">
                     {(userA?.photoURL || userA?.photoUrl) ? (
                       <img src={userA.photoURL || userA.photoUrl} alt={nameA} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                     ) : (
                       <span>{initialA}</span>
                     )}
                   </div>
                 </>
              ) : netSettlement < 0 ? (
                 <>
                   <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full overflow-hidden bg-[#E8F8F0] text-[#10B981] flex items-center justify-center font-bold text-base shadow-sm border border-[#232733] shrink-0">
                     {(userA?.photoURL || userA?.photoUrl) ? (
                       <img src={userA.photoURL || userA.photoUrl} alt={nameA} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                     ) : (
                       <span>{initialA}</span>
                     )}
                   </div> 
                   <span className="font-semibold text-sm sm:text-base tracking-tight">
                     {nameA} <span className="text-slate-400 font-normal">transfiere a</span> {nameB}
                   </span>
                   <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full overflow-hidden bg-[#EEF2FF] text-[#6366F1] flex items-center justify-center font-bold text-base shadow-sm border border-[#232733] shrink-0">
                     {(userB?.photoURL || userB?.photoUrl) ? (
                       <img src={userB.photoURL || userB.photoUrl} alt={nameB} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                     ) : (
                       <span>{initialB}</span>
                     )}
                   </div>
                 </>
              ) : (
                <span className="px-4 py-1.5 font-semibold text-sm tracking-tight text-white">Cuentas Saldadas 🙌</span>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="bg-white border border-[#EEF0F4] rounded-3xl p-6 sm:p-8 shadow-bento space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-[#EEF0F4]">
          <div>
            <h3 className="font-bold text-lg text-slate-900">Historial de Gastos</h3>
            <p className="text-xs text-slate-400 mt-0.5 font-medium">Detalle de movimientos compartidos que impactan la liquidación</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button 
              type="button"
              onClick={() => exportToCSV(data?.expenses || [], 'liquidacion_gastos')} 
              className="bg-white border border-[#EEF0F4] hover:bg-slate-50 text-slate-700 rounded-full px-4 py-2 font-medium transition-colors text-xs inline-flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Download size={15} /> 
              <span>Exportar</span>
            </button>
            <button 
              type="button"
              onClick={() => handleOpenModal()} 
              className="bg-[#111319] hover:bg-[#1A1D26] text-white rounded-full px-5 py-2 font-medium transition-colors duration-150 text-xs inline-flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Plus size={15} /> 
              <span>Nuevo Gasto</span>
            </button>
          </div>
        </div>
        
        <div className="space-y-3">
          {(data?.expenses || []).length === 0 ? (
            <div className="text-center py-12 text-slate-400 bg-[#F8FAFC] rounded-2xl border border-dashed border-[#EEF0F4]">
              <p className="font-medium text-sm text-slate-500">No hay gastos compartidos registrados para este período.</p>
            </div>
          ) : (
            (data?.expenses || []).map((exp: any) => {
              const payer = (data?.users || []).find((u: any) => u.id === exp.paidBy);
              const payerName = payer?.name || payer?.displayName || payer?.email?.split('@')[0] || 'Desconocido';
              const payerInitial = payerName.charAt(0).toUpperCase();

              return (
                <div key={exp.id} className="flex justify-between items-center p-4 bg-[#F8FAFC] hover:bg-[#F1F5F9] rounded-2xl border border-[#EEF0F4] transition-colors group">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-[#EEF2FF] text-[#6366F1] border border-[#EEF0F4] flex items-center justify-center font-bold text-xs overflow-hidden shrink-0">
                      {(payer?.photoURL || payer?.photoUrl) ? (
                        <>
                          <img 
                            src={payer.photoURL || payer.photoUrl} 
                            alt={payerName} 
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover" 
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              if (e.currentTarget.nextElementSibling) {
                                e.currentTarget.nextElementSibling.classList.remove('hidden');
                              }
                            }}
                          />
                          <span className="hidden">{payerInitial}</span>
                        </>
                      ) : (
                        payerInitial
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900 text-sm truncate">
                        {exp.desc} {exp.isPrivate && <span className="text-[10px] ml-1.5 bg-[#F1F5F9] text-slate-600 px-2 py-0.5 rounded-full font-medium">Privado</span>}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5 flex-wrap">
                        <span>Pagado por <strong className="text-slate-600 font-medium">{payerName}</strong></span>
                        <span>•</span>
                        <span className="tabular-nums">Fecha: {formatDateDDMMAAAA(exp.date)}</span>
                        <span>•</span>
                        <span>División: {getSplitLabel(exp)}</span>
                        <span>•</span>
                        <span>{exp.currency || 'MXN'}</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <span className="font-bold text-slate-900 text-base sm:text-lg tabular-nums">
                      {FormatCurrency(exp.amount)}
                    </span>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        type="button"
                        onClick={() => handleOpenModal(exp)} 
                        className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-[#EEF0F4] cursor-pointer" 
                        title="Editar"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button 
                        type="button"
                        onClick={() => handleDelete(exp.id)} 
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-[#FDEFEA] rounded-lg transition-colors border border-transparent hover:border-rose-100 cursor-pointer" 
                        title="Eliminar"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        title="Nuevo Gasto"
      >
        {isModalOpen && (
          <MovementForm 
            initialMode="expense"
            categories={data?.categories}
            accounts={data?.accounts}
            currentUserId={data?.user?.uid || ''}
            onSubmit={handleMovementSubmit} 
            onCancel={handleCloseModal} 
          />
        )}
      </Modal>

      <div className="mt-8 text-xs text-slate-400 text-center px-4">
        <p><strong>Aviso:</strong> Este simulador y liquidador tienen fines informativos y de ayuda en la gestión. No constituyen asesoría contable ni legal. Verifica tus montos antes de realizar cualquier transferencia.</p>
      </div>
    </div>
  );
}
