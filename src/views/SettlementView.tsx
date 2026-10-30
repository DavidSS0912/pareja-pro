import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Download, UserPlus, Check } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
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
      <div className="mb-8">
        <h2 className="text-3xl font-black tracking-tight text-slate-800">Liquidador Interno</h2>
        <p className="text-slate-600 mt-2 font-medium">Conciliación automática de gastos compartidos.</p>
      </div>

      {!hasMultipleUsers ? (
        <Card className="p-8 sm:p-12 text-center bg-white border border-slate-200/80 shadow-sm rounded-3xl relative overflow-hidden">
          <div className="max-w-md mx-auto flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-6 shadow-inner">
              <UserPlus className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-3 tracking-tight">Liquidación en Pareja</h3>
            <p className="text-slate-600 font-medium mb-8 text-sm leading-relaxed">
              Para conciliar gastos compartidos y calcular automáticamente quién le debe a quién, necesitas al menos dos integrantes en tu casa.
            </p>
            
            <Button 
              onClick={handleInvite}
              disabled={isInviting}
              className="w-full sm:w-auto px-8 py-3.5 text-base font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all flex items-center justify-center gap-2"
            >
              <UserPlus size={18} />
              {isInviting ? 'Generando invitación...' : 'Invitar a alguien a mi casa'}
            </Button>

            {inviteCopied && (
              <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold rounded-xl flex items-center gap-2 animate-in fade-in">
                <Check size={16} className="text-emerald-600 shrink-0" />
                <span>¡Enlace copiado al portapapeles! Compártelo con tu pareja.</span>
              </div>
            )}

            {inviteLink && !inviteCopied && (
              <div className="mt-4 w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 font-mono break-all flex items-center justify-between gap-2">
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
                  className="text-primary hover:underline font-sans font-semibold shrink-0"
                >
                  Copiar
                </button>
              </div>
            )}
          </div>
        </Card>
      ) : (
        <Card className="bg-gradient-to-br from-slate-900 to-slate-800 text-white border-0 py-16 relative overflow-hidden shadow-2xl">
          {/* Background decorative elements */}
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-700/50 via-transparent to-transparent pointer-events-none"></div>
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="text-center relative z-10">
            <p className="text-slate-300 font-bold mb-4 tracking-widest uppercase text-sm">Balance Neto Mensual</p>
            <div className="text-7xl font-black mb-8 tracking-tighter text-white tabular-nums drop-shadow-lg">
              {FormatCurrency(settlementAmount)}
            </div>
            
            <div className="inline-flex items-center gap-3 sm:gap-4 bg-white/10 p-2.5 px-5 rounded-2xl border border-white/10 max-w-full">
              {netSettlement > 0 ? (
                 <>
                   <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center font-black text-lg text-white shadow-inner border border-purple-300/30 shrink-0">
                     {(userB?.photoURL || userB?.photoUrl) ? (
                       <img src={userB.photoURL || userB.photoUrl} alt={nameB} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                     ) : (
                       <span>{initialB}</span>
                     )}
                   </div> 
                   <span className="font-bold text-base sm:text-lg tracking-tight">
                     {nameB} <span className="text-slate-300 font-normal">transfiere a</span> {nameA}
                   </span>
                   <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center font-black text-lg text-white shadow-inner border border-blue-300/30 shrink-0">
                     {(userA?.photoURL || userA?.photoUrl) ? (
                       <img src={userA.photoURL || userA.photoUrl} alt={nameA} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                     ) : (
                       <span>{initialA}</span>
                     )}
                   </div>
                 </>
              ) : netSettlement < 0 ? (
                 <>
                   <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center font-black text-lg text-white shadow-inner border border-blue-300/30 shrink-0">
                     {(userA?.photoURL || userA?.photoUrl) ? (
                       <img src={userA.photoURL || userA.photoUrl} alt={nameA} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                     ) : (
                       <span>{initialA}</span>
                     )}
                   </div> 
                   <span className="font-bold text-base sm:text-lg tracking-tight">
                     {nameA} <span className="text-slate-300 font-normal">transfiere a</span> {nameB}
                   </span>
                   <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center font-black text-lg text-white shadow-inner border border-purple-300/30 shrink-0">
                     {(userB?.photoURL || userB?.photoUrl) ? (
                       <img src={userB.photoURL || userB.photoUrl} alt={nameB} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                     ) : (
                       <span>{initialB}</span>
                     )}
                   </div>
                 </>
              ) : (
                <span className="px-6 py-2 font-bold text-lg tracking-tight">Cuentas Saldadas 🙌</span>
              )}
            </div>
          </div>
        </Card>
      )}

      <Card>
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-xl text-slate-800">Historial de Gastos</h3>
          <div className="flex gap-2">
            <Button onClick={() => exportToCSV(data?.expenses || [], 'liquidacion_gastos')} size="sm" variant="secondary">
              <Download size={16} className="mr-1" /> Exportar
            </Button>
            <Button onClick={() => handleOpenModal()} size="sm">
              <Plus size={16} className="mr-1" /> Nuevo Gasto
            </Button>
          </div>
        </div>
        
        <div className="space-y-3">
          {(data?.expenses || []).length === 0 ? (
            <div className="text-center py-12 text-slate-500 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
              <p className="font-medium text-sm">No hay gastos compartidos registrados para este período.</p>
            </div>
          ) : (
            (data?.expenses || []).map((exp: any) => {
              const payer = (data?.users || []).find((u: any) => u.id === exp.paidBy);
              const payerName = payer?.name || payer?.displayName || payer?.email?.split('@')[0] || 'Desconocido';
              const payerInitial = payerName.charAt(0).toUpperCase();

              return (
                <div key={exp.id} className="flex justify-between items-center p-4 bg-rose-50/50 hover:bg-rose-50 rounded-2xl border border-rose-100/50 transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full ${payer?.avatar || 'bg-slate-300'} flex items-center justify-center text-white font-bold overflow-hidden shrink-0`}>
                      {(payer?.photoURL || payer?.photoUrl) ? (
                        <>
                          <img 
                            src={payer.photoURL || payer.photoUrl} 
                            alt={payerName} 
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover rounded-full" 
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
                    <div>
                      <p className="font-bold text-slate-800">{exp.desc} {exp.isPrivate && <span className="text-xs ml-2 bg-slate-200 text-slate-600 px-2 py-1 rounded">Privado</span>}</p>
                      <p className="text-xs font-medium text-slate-600 mt-1">
                        Pagado por {payerName} • Fecha: {formatDateDDMMAAAA(exp.date)} • División: {getSplitLabel(exp)} • Moneda: {exp.currency || 'MXN'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <span className="font-black text-slate-800 text-lg">{FormatCurrency(exp.amount)}</span>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleOpenModal(exp)} className="p-2 text-slate-500 hover:text-blue-500 hover:bg-white rounded-lg transition-colors" title="Editar">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDelete(exp.id)} className="p-2 text-slate-500 hover:text-rose-500 hover:bg-white rounded-lg transition-colors" title="Eliminar">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </Card>

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

      <div className="mt-8 text-xs text-slate-500 text-center px-4">
        <p><strong>Aviso:</strong> Este simulador y liquidador tienen fines informativos y de ayuda en la gestión. No constituyen asesoría contable ni legal. Verifica tus montos antes de realizar cualquier transferencia.</p>
      </div>
    </div>
  );
}
