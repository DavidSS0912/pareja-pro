import React from 'react';
import { User, LogOut, Trash2 } from 'lucide-react';
import { leaveHouse } from '../services/userService';
import { useToastStore } from '../store/useToastStore';
export const ProfileView = ({ data }: any) => {
  const { user, users = [], houseId } = data;
  const { addToast } = useToastStore();

  const handleLeaveHouse = async () => {
    if (window.confirm('¿Estás seguro de que quieres salir de esta casa? Te llevarás tu historial.')) {
      try {
        await leaveHouse(user.uid, houseId);
        addToast('Has salido de la casa exitosamente.', 'success');
        window.location.reload();
      } catch (_err) {
        addToast('Error al salir de la casa.', 'error');
      }
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar a este miembro?')) {
      try {
        await leaveHouse(memberId, houseId);
        addToast('Miembro eliminado exitosamente.', 'success');
        window.location.reload();
      } catch (_err) {
        addToast('Error al eliminar miembro.', 'error');
      }
    }
  };

  return (
    <div className="space-y-6 animate-in">
      <div className="bg-white p-8 rounded-2xl border border-[#E5E5E5]">
        <h2 className="text-xl font-bold font-title mb-6">Mi Casa (Compartida)</h2>
        <div className="space-y-4">
          {users.map((u: any) => (
            <div key={u.id} className="flex justify-between items-center p-4 border border-[#E5E5E5] rounded-xl bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                  {u.name?.charAt(0) || <User size={20} />}
                </div>
                <div>
                  <p className="font-bold text-slate-900">{u.name} {u.id === user?.uid && '(Tú)'}</p>
                  <p className="text-sm text-slate-500">{u.email}</p>
                </div>
              </div>
              {users.length > 1 && u.id === user?.uid && (
                <button onClick={handleLeaveHouse} className="text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors flex items-center gap-2">
                  <LogOut size={16} /> Salir
                </button>
              )}
              {users.length > 1 && u.id !== user?.uid && (
                <button onClick={() => handleRemoveMember(u.id)} className="text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors flex items-center gap-2">
                  <Trash2 size={16} /> Eliminar
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
