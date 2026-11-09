import React, { useState, useEffect, useCallback } from 'react';
import { User, LogOut, Trash2, Shield, Users, Clock, AlertTriangle, XCircle, RefreshCw } from 'lucide-react';
import { leaveHouse, removeMember, revokeInvitation, getHouseholdMembers } from '../services/userService';
import { getPendingInvitations } from '../lib/dataconnect';
import { QueryFetchPolicy } from 'firebase/data-connect';
import { useAppStore, resetAppStore } from '../store/useAppStore';
import { useToastStore } from '../store/useToastStore';
import { useShallow } from 'zustand/react/shallow';

interface ProfileViewProps {
  data?: any;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ data: propData }) => {
  const storeData = useAppStore(useShallow(state => ({
    user: state.user,
    users: state.users,
    houseId: state.houseId,
    setHouseId: state.setHouseId,
    setUsers: state.setUsers
  })));

  const user = propData?.user || storeData.user;
  const users = propData?.users || storeData.users || [];
  const houseId = propData?.houseId || storeData.houseId;

  const { addToast } = useToastStore();

  const [pendingInvites, setPendingInvites] = useState<any[]>([]);
  const [loadingInvites, setLoadingInvites] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const currentUserObj = users.find((u: any) => u.id === user?.uid);
  const isCreator = currentUserObj?.memberSlot === 'USER_A';

  const loadPendingInvitations = useCallback(async () => {
    if (!houseId) return;
    setLoadingInvites(true);
    try {
      const res = await getPendingInvitations(
        { householdId: houseId },
        { fetchPolicy: QueryFetchPolicy.SERVER_ONLY }
      );
      setPendingInvites(res.data?.invitations || []);
    } catch (err) {
      console.error("Error al cargar invitaciones pendientes:", err);
    } finally {
      setLoadingInvites(false);
    }
  }, [houseId]);

  useEffect(() => {
    loadPendingInvitations();
  }, [loadPendingInvitations]);

  const handleLeaveHouse = async () => {
    const confirmation = window.confirm(
      "¿Estás seguro de que deseas abandonar este hogar?\n\n" +
      "IMPORTANTE: Todo el historial de transacciones, cuentas y presupuestos permanecerá en el hogar original. " +
      "Tu usuario comenzará en un nuevo hogar independiente con cuentas por defecto."
    );

    if (!confirmation || !houseId) return;

    setActionLoading(true);
    try {
      const newHouseId = await leaveHouse(houseId);
      addToast('Has salido del hogar exitosamente. Tu nuevo hogar independiente está listo.', 'success');
      resetAppStore();
      if (newHouseId) {
        storeData.setHouseId(newHouseId);
      }
    } catch (err: any) {
      console.error("Error al salir del hogar:", err);
      addToast(err?.message || 'Error al salir del hogar.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveMember = async (memberId: string, memberName: string) => {
    const confirmation = window.confirm(
      `¿Estás seguro de que deseas expulsar a ${memberName || 'este integrante'} del hogar?\n\n` +
      "El integrante expulsado será asignado a un nuevo hogar independiente y ya no tendrá acceso al historial de este hogar."
    );

    if (!confirmation || !houseId) return;

    setActionLoading(true);
    try {
      await removeMember(houseId, memberId);
      addToast('Miembro expulsado exitosamente del hogar.', 'success');
      
      // Actualizar la lista de miembros en memoria sin recargar la página
      const updatedMembers = await getHouseholdMembers(houseId);
      const sorted = [...updatedMembers].sort((a, b) => {
        if (a.memberSlot === 'USER_A') return -1;
        if (b.memberSlot === 'USER_A') return 1;
        if (a.memberSlot === 'USER_B') return -1;
        if (b.memberSlot === 'USER_B') return 1;
        return 0;
      });

      storeData.setUsers(sorted.map(m => ({
        id: m.id,
        name: m.displayName || (m.email ? m.email.split('@')[0] : 'Usuario'),
        displayName: m.displayName || (m.email ? m.email.split('@')[0] : 'Usuario'),
        email: m.email,
        memberSlot: m.memberSlot,
        photoURL: m.photoURL || m.photoUrl || (m.id === user?.uid ? user.photoURL : null),
        photoUrl: m.photoURL || m.photoUrl || (m.id === user?.uid ? user.photoURL : null),
        createdAt: m.createdAt
      })));
    } catch (err: any) {
      console.error("Error al expulsar al miembro:", err);
      addToast(err?.message || 'Error al expulsar al integrante.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRevokeInvite = async (inviteId: string) => {
    if (!houseId) return;
    try {
      await revokeInvitation(inviteId, houseId);
      addToast('Invitación revocada exitosamente.', 'success');
      await loadPendingInvitations();
    } catch (err: any) {
      console.error("Error al revocar invitación:", err);
      addToast(err?.message || 'Error al revocar la invitación.', 'error');
    }
  };

  return (
    <div className="space-y-6 animate-in">
      {/* Integrantes del Hogar */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#EEF0F4] shadow-bento space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-[#EEF0F4]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#EEF2FF] text-[#6366F1] border border-[#EEF0F4] flex items-center justify-center shrink-0">
              <Users size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold font-title text-slate-900">Integrantes del Hogar</h2>
              <p className="text-xs text-slate-400 font-medium">Gestión de miembros y roles en el hogar compartido</p>
            </div>
          </div>
          <span className="text-xs font-semibold px-3 py-1 bg-[#F5F6FA] text-slate-600 rounded-full border border-[#EEF0F4] tabular-nums">
            {users.length} / 2 integrantes
          </span>
        </div>

        <div className="space-y-3">
          {users.map((u: any) => {
            const isMe = u.id === user?.uid;
            const isMemberA = u.memberSlot === 'USER_A';
            return (
              <div
                key={u.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-[#EEF0F4] rounded-2xl bg-[#F8FAFC] hover:bg-[#F1F5F9] transition-colors gap-3"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-full bg-[#EEF2FF] text-[#6366F1] flex items-center justify-center font-bold text-base overflow-hidden border border-[#EEF0F4] shrink-0">
                    {(u.photoURL || u.photoUrl) ? (
                      <img
                        src={u.photoURL || u.photoUrl}
                        alt={u.displayName || u.name || 'Usuario'}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      (u.displayName || u.name)?.charAt(0)?.toUpperCase() || <User size={20} />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-slate-900 text-sm">
                        {u.displayName || u.name || (u.email ? u.email.split('@')[0] : 'Usuario')}
                      </p>
                      {isMe && (
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-[#111319] text-white px-2.5 py-0.5 rounded-full">
                          Tú
                        </span>
                      )}
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                        isMemberA
                          ? 'bg-[#FDEFEA] text-[#F97316] border border-[#F97316]/20'
                          : 'bg-[#E8F8F0] text-[#10B981] border border-[#10B981]/20'
                      }`}>
                        <Shield size={10} />
                        {isMemberA ? 'Administrador' : 'Miembro'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{u.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  {users.length > 1 && isMe && (
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={handleLeaveHouse}
                      className="text-rose-600 hover:bg-[#FDEFEA] px-3.5 py-1.5 rounded-full transition-colors font-medium text-xs flex items-center gap-1.5 border border-rose-200 cursor-pointer disabled:opacity-50"
                    >
                      <LogOut size={14} /> 
                      <span>Abandonar hogar</span>
                    </button>
                  )}
                  {users.length > 1 && !isMe && isCreator && (
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={() => handleRemoveMember(u.id, u.displayName || u.name)}
                      className="text-rose-600 hover:bg-[#FDEFEA] px-3.5 py-1.5 rounded-full transition-colors font-medium text-xs flex items-center gap-1.5 border border-rose-200 cursor-pointer disabled:opacity-50"
                    >
                      <Trash2 size={14} /> 
                      <span>Expulsar</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {users.length > 1 && (
          <div className="mt-4 p-4 bg-[#FDEFEA] border border-[#F97316]/20 rounded-2xl flex items-start gap-3 text-xs text-[#F97316] leading-relaxed">
            <AlertTriangle size={16} className="text-[#F97316] shrink-0 mt-0.5" />
            <p>
              El historial de transacciones y presupuestos compartidos queda ligado al hogar.
              Si un integrante lo abandona o es expulsado, recibirá un nuevo hogar limpio y conservará únicamente las transacciones que realice a partir de ese momento.
            </p>
          </div>
        )}
      </div>

      {/* Invitaciones Pendientes */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#EEF0F4] shadow-bento space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-[#EEF0F4]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FDEFEA] text-[#F97316] border border-[#EEF0F4] flex items-center justify-center shrink-0">
              <Clock size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold font-title text-slate-900">Invitaciones Pendientes</h2>
              <p className="text-xs text-slate-400 font-medium">Enlaces de invitación activos emitidos para este hogar</p>
            </div>
          </div>
          <button
            type="button"
            onClick={loadPendingInvitations}
            disabled={loadingInvites}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-[#F8FAFC] rounded-full transition-colors border border-[#EEF0F4] cursor-pointer"
            title="Recargar invitaciones"
          >
            <RefreshCw size={15} className={loadingInvites ? 'animate-spin' : ''} />
          </button>
        </div>

        {loadingInvites ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-slate-900"></div>
          </div>
        ) : pendingInvites.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center italic bg-[#F8FAFC] rounded-2xl border border-dashed border-[#EEF0F4]">
            No hay invitaciones pendientes emitidas para este hogar.
          </p>
        ) : (
          <div className="space-y-3">
            {pendingInvites.map((inv: any) => (
              <div
                key={inv.id}
                className="flex items-center justify-between p-4 border border-[#EEF0F4] rounded-2xl bg-[#F8FAFC]"
              >
                <div>
                  <p className="font-mono text-xs text-slate-900 font-semibold break-all">
                    Código: {inv.id}
                  </p>
                  <p className="text-xs text-slate-400 mt-1 tabular-nums">
                    Caduca: {new Date(inv.expiresAt).toLocaleDateString()} a las {new Date(inv.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleRevokeInvite(inv.id)}
                  className="text-rose-600 hover:bg-[#FDEFEA] px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors flex items-center gap-1.5 border border-rose-200 cursor-pointer"
                >
                  <XCircle size={14} /> 
                  <span>Revocar</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
