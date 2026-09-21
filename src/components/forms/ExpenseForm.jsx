import React, { useState } from 'react';
import { Button } from '../ui/Button';

export function ExpenseForm({ initialData, users, onSubmit, onCancel }) {
  const [formData, setFormData] = useState(initialData || {
    desc: '',
    amount: '',
    paidBy: users[0]?.id || 'u1',
    split: 50
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      amount: Number(formData.amount),
      split: Number(formData.split)
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
      
      <div>
        <label className="block text-sm font-bold text-slate-700 mb-1">Monto (MXN)</label>
        <input 
          type="number" 
          required
          min="0"
          step="0.01"
          className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
          value={formData.amount} 
          onChange={e => setFormData({...formData, amount: e.target.value})} 
          placeholder="0.00"
        />
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
        
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">División (%)</label>
          <select 
            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            value={formData.split} 
            onChange={e => setFormData({...formData, split: e.target.value})}
          >
            <option value={50}>Mitades (50/50)</option>
            <option value={100}>Gasto Individual</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
        <Button variant="secondary" onClick={onCancel}>Cancelar</Button>
        <Button type="submit">Guardar Gasto</Button>
      </div>
    </form>
  );
}
