import React, { useState } from 'react';
import { Button } from '../ui/Button';

export function BudgetForm({ initialData, onSubmit, onCancel }) {
  const [formData, setFormData] = useState(initialData || {
    category: '',
    type: 'Necesidad',
    shared: true,
    base: '',
    rollover: 0,
    spent: 0,
    icon: '🛒'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      base: Number(formData.base),
      rollover: Number(formData.rollover),
      spent: Number(formData.spent)
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex gap-3">
        <div className="w-20">
          <label className="block text-sm font-bold text-slate-700 mb-1">Ícono</label>
          <input 
            type="text" 
            required
            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-center text-xl"
            value={formData.icon} 
            onChange={e => setFormData({...formData, icon: e.target.value})} 
          />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-bold text-slate-700 mb-1">Categoría</label>
          <input 
            type="text" 
            required
            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            value={formData.category} 
            onChange={e => setFormData({...formData, category: e.target.value})} 
            placeholder="Ej. Supermercado"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">Tipo de Presupuesto</label>
          <select 
            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
            value={formData.type} 
            onChange={e => setFormData({...formData, type: e.target.value})}
          >
            <option value="Necesidad">Necesidad (50%)</option>
            <option value="Deseo">Deseo (30%)</option>
            <option value="Ahorro">Ahorro/Deuda (20%)</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">Monto Base Mensual</label>
          <input 
            type="number" 
            required
            min="0"
            step="0.01"
            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
            value={formData.base} 
            onChange={e => setFormData({...formData, base: e.target.value})} 
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">Rollover Inicial</label>
          <input 
            type="number" 
            step="0.01"
            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
            value={formData.rollover} 
            onChange={e => setFormData({...formData, rollover: e.target.value})} 
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">Ya gastado</label>
          <input 
            type="number" 
            min="0"
            step="0.01"
            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
            value={formData.spent} 
            onChange={e => setFormData({...formData, spent: e.target.value})} 
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
        <Button variant="secondary" onClick={onCancel}>Cancelar</Button>
        <Button type="submit">Guardar Presupuesto</Button>
      </div>
    </form>
  );
}
