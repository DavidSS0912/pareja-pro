import React, { useState } from 'react';
import { Button } from '../ui/Button';

export function ExpenseForm({ initialData, users, budgets = [], onSubmit, onCancel }) {
  const [formData, setFormData] = useState(initialData || {
    desc: '',
    amount: '',
    paidBy: users[0]?.id || 'u1',
    splitType: '50/50',
    currency: 'MXN',
    category: 'Varios',
    date: new Date().toISOString().split('T')[0],
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
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">Fecha</label>
          <input 
            type="date" 
            required
            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 transition-colors"
            value={formData.date} 
            onChange={e => setFormData({...formData, date: e.target.value})} 
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">Descripción</label>
          <input 
            type="text" 
            required
            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
            value={formData.desc} 
            onChange={e => setFormData({...formData, desc: e.target.value})} 
            placeholder="Ej. Walmart Quincena"
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-bold text-slate-700 mb-1">Monto</label>
        <div className="flex gap-2">
          <input
            type="number"
            required
            min="0"
            step="0.01"
            className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
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
          id="isPrivate"
          checked={formData.isPrivate}
          onChange={e => setFormData({...formData, isPrivate: e.target.checked})}
          className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500"
        />
        <label htmlFor="isPrivate" className="text-sm font-medium text-slate-700">Gasto Privado (No se divide)</label>
      </div>

      <div>
        <label className="block text-sm font-bold text-slate-700 mb-1">Categoría</label>
        <select
          className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
          value={formData.category}
          onChange={e => setFormData({...formData, category: e.target.value})}
        >
          <option value="Varios">Varios</option>
          {budgets.map(b => (
            <option key={b.id} value={b.category}>{b.category}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">Pagado por</label>
          <select 
            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            value={formData.paidBy} 
            onChange={e => setFormData({...formData, paidBy: e.target.value})}
          >
            {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
        </div>
        
        {!formData.isPrivate && (
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">División</label>
            <select
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              value={formData.splitType}
              onChange={e => setFormData({...formData, splitType: e.target.value})}
            >
              <option value="50/50">Mitades (50/50)</option>
              <option value="proporcional">Proporcional (Ingresos)</option>
            </select>
          </div>
        )}
      </div>

      <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
        <Button variant="secondary" onClick={onCancel}>Cancelar</Button>
        <Button type="submit">Guardar Gasto</Button>
      </div>
    </form>
  );
}
