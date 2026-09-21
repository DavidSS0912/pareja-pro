import React, { useState } from 'react';
import { Button } from '../ui/Button';

export function CardForm({ initialData, users, onSubmit, onCancel }) {
  const [formData, setFormData] = useState(initialData || {
    name: '',
    ownerId: users[0]?.id || 'u1',
    shared: false,
    limit: '',
    cutDay: '',
    payDay: '',
    balance: '',
    noInterestPay: '',
    interestRate: '',
    color: 'bg-gradient-to-br from-slate-700 to-slate-900'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      shared: formData.shared === 'true' || formData.shared === true,
      limit: Number(formData.limit),
      cutDay: Number(formData.cutDay),
      payDay: Number(formData.payDay),
      balance: Number(formData.balance),
      noInterestPay: Number(formData.noInterestPay),
      interestRate: Number(formData.interestRate)
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">Nombre Tarjeta</label>
          <input 
            type="text" 
            required
            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
            value={formData.name} 
            onChange={e => setFormData({...formData, name: e.target.value})} 
            placeholder="Ej. Nu Clásica"
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">Color/Tema</label>
          <select 
            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
            value={formData.color} 
            onChange={e => setFormData({...formData, color: e.target.value})}
          >
            <option value="bg-gradient-to-br from-slate-700 to-slate-900">Negro (Clásica)</option>
            <option value="bg-gradient-to-br from-purple-600 to-purple-900">Morado (Nu)</option>
            <option value="bg-gradient-to-br from-blue-700 to-blue-900">Azul (BBVA/Banamex)</option>
            <option value="bg-gradient-to-br from-red-600 to-red-800">Rojo (Santander/Costco)</option>
            <option value="bg-gradient-to-br from-amber-500 to-yellow-700">Oro (Gold)</option>
            <option value="bg-gradient-to-br from-slate-300 to-slate-500">Plata (Silver)</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">Titular</label>
          <select 
            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
            value={formData.ownerId} 
            onChange={e => setFormData({...formData, ownerId: e.target.value})}
          >
            {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">Uso Compartido</label>
          <select 
            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
            value={formData.shared} 
            onChange={e => setFormData({...formData, shared: e.target.value})}
          >
            <option value="false">No (Individual)</option>
            <option value="true">Sí (Gastos de Hogar)</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">Límite</label>
          <input 
            type="number" required
            className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
            value={formData.limit} 
            onChange={e => setFormData({...formData, limit: e.target.value})} 
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">Día Corte</label>
          <input 
            type="number" required min="1" max="31"
            className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
            value={formData.cutDay} 
            onChange={e => setFormData({...formData, cutDay: e.target.value})} 
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">Día Pago</label>
          <input 
            type="number" required min="1" max="31"
            className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
            value={formData.payDay} 
            onChange={e => setFormData({...formData, payDay: e.target.value})} 
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">Saldo Actual</label>
          <input 
            type="number" step="0.01" required
            className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
            value={formData.balance} 
            onChange={e => setFormData({...formData, balance: e.target.value})} 
          />
        </div>
        <div>
          <label className="block text-[11px] font-bold text-slate-700 mb-1 leading-tight">Pago para no int.</label>
          <input 
            type="number" step="0.01" required
            className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
            value={formData.noInterestPay} 
            onChange={e => setFormData({...formData, noInterestPay: e.target.value})} 
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">Tasa Int. (%)</label>
          <input 
            type="number" step="0.01" required
            className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
            value={formData.interestRate} 
            onChange={e => setFormData({...formData, interestRate: e.target.value})} 
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
        <Button variant="secondary" onClick={onCancel}>Cancelar</Button>
        <Button type="submit">Guardar Tarjeta</Button>
      </div>
    </form>
  );
}
