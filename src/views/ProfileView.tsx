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
        name: m.displayName || m.email || 'Usuario',
        displayName: m.displayName || m.email || 'Usuario',
        email: m.email,
        memberSlot: m.memberSlot,
        photoURL: m.id === user?.uid ? user.photoURL : null,
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
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Users size={22} />
            </div>
            <div>
              <h2 className="text-xl font-bold font-title text-slate-900">Integrantes del Hogar</h2>
              <p className="text-xs text-slate-500">Gestión de miembros y roles en el hogar compartido</p>
            </div>
          </div>
          <span className="text-xs font-bold px-3 py-1 bg-slate-100 text-slate-600 rounded-full">
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
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-slate-100 rounded-2xl bg-slate-50/70 hover:bg-slate-50 transition-colors gap-3"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-base overflow-hidden border border-indigo-200">
                    {u.photoURL ? (
                      <img src={u.photoURL} alt={u.name} className="w-full h-full object-cover" />
                    ) : (
                      u.name?.charAt(0)?.toUpperCase() || <User size={20} />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-slate-900 text-sm">
                        {u.displayName || u.name || 'Usuario'}
                      </p>
                      {isMe && (
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
                          Tú
                        </span>
                      )}
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1 ${
                        isMemberA
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      }`}>
                        <Shield size={10} />
                        {isMemberA ? 'Creador (USER A)' : 'Pareja (USER B)'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{u.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  {users.length > 1 && isMe && (
                    <button
                      disabled={actionLoading}
                      onClick={handleLeaveHouse}
                      className="text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-xl transition-colors font-medium text-xs flex items-center gap-1.5 border border-red-200 disabled:opacity-50"
                    >
                      <LogOut size={14} /> Abandonar hogar
                    </button>
                  )}
                  {users.length > 1 && !isMe && isCreator && (
                    <button
                      disabled={actionLoading}
                      onClick={() => handleRemoveMember(u.id, u.displayName || u.name)}
                      className="text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-xl transition-colors font-medium text-xs flex items-center gap-1.5 border border-red-200 disabled:opacity-50"
                    >
                      <Trash2 size={14} /> Expulsar
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {users.length > 1 && (
          <div className="mt-4 p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl flex items-start gap-2.5 text-xs text-amber-800">
            <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
            <p>
              El historial de transacciones y presupuestos compartidos queda ligado al hogar.
              Si un integrante lo abandona o es expulsado, recibirá un nuevo hogar limpio y conservará únicamente las transacciones que realice a partir de ese momento.
            </p>
          </div>
        )}
      </div>

      {/* Invitaciones Pendientes */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock size={22} />
            </div>
            <div>
              <h2 className="text-xl font-bold font-title text-slate-900">Invitaciones Pendientes</h2>
              <p className="text-xs text-slate-500">Enlaces de invitación activos emitidos para este hogar</p>
            </div>
          </div>
          <button
            onClick={loadPendingInvitations}
            disabled={loadingInvites}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-colors"
            title="Recargar invitaciones"
          >
            <RefreshCw size={16} className={loadingInvites ? 'animate-spin' : ''} />
          </button>
        </div>

        {loadingInvites ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-primary"></div>
          </div>
        ) : pendingInvites.length === 0 ? (
          <p className="text-sm text-slate-500 py-4 text-center italic">
            No hay invitaciones pendientes emitidas para este hogar.
          </p>
        ) : (
          <div className="space-y-3">
            {pendingInvites.map((inv: any) => (
              <div
                key={inv.id}
                className="flex items-center justify-between p-3.5 border border-slate-100 rounded-xl bg-slate-50/60"
              >
                <div>
                  <p className="font-mono text-xs text-slate-800 font-semibold break-all">
                    Código: {inv.id}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Caduca: {new Date(inv.expiresAt).toLocaleDateString()} a las {new Date(inv.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <button
                  onClick={() => handleRevokeInvite(inv.id)}
                  className="text-red-600 hover:bg-red-50 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 border border-red-200"
                >
                  <XCircle size={14} /> Revocar
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
