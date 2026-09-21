import React, { useState } from 'react';
import { Button } from '../ui/Button';

export function IncomeForm({ initialData, users, onSubmit, onCancel }) {
  const [formData, setFormData] = useState(initialData || {
    userId: users[0]?.id || 'u1',
    amount: '',
    type: 'Sueldo',
    currency: 'MXN',
    isPrivate: false
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      amount: Number(formData.amount)
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-bold text-slate-700 mb-1">Monto</label>
        <div className="flex gap-2">
          <input
            type="number"
            required
            min="0"
            step="0.01"
            className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
            value={formData.amount}
            onChange={e => setFormData({...formData, amount: e.target.value})}
            placeholder="0.00"
          />
          <select
            className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
            value={formData.currency}
            onChange={e => setFormData({...formData, currency: e.target.value})}
          >
            <option value="MXN">MXN</option>
            <option value="USD">USD</option>
          </select>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="isPrivateIncome"
          checked={formData.isPrivate}
          onChange={e => setFormData({...formData, isPrivate: e.target.checked})}
          className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500"
        />
        <label htmlFor="isPrivateIncome" className="text-sm font-medium text-slate-700">Ingreso Privado (No contemplado en presupuesto común)</label>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">Aportador</label>
          <select 
            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
            value={formData.userId} 
            onChange={e => setFormData({...formData, userId: e.target.value})}
          >
            {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">Tipo</label>
          <select 
            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
            value={formData.type} 
            onChange={e => setFormData({...formData, type: e.target.value})}
          >
            <option value="Sueldo">Sueldo / Salario</option>
            <option value="Bono">Bono / Utilidades</option>
            <option value="Ventas">Ventas / Negocio</option>
            <option value="Inversiones">Retornos de Inversión</option>
            <option value="Otro">Otro Ingreso</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
        <Button variant="secondary" onClick={onCancel}>Cancelar</Button>
        <Button type="submit">Guardar Ingreso</Button>
      </div>
    </form>
  );
}
