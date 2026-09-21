import React, { useState } from 'react';
import { Button } from '../ui/Button';

export function AssetForm({ initialData, users, onSubmit, onCancel }) {
  const [formData, setFormData] = useState(initialData || {
    name: '',
    owner: 'Ambos',
    value: '',
    type: 'Liquidez'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      value: Number(formData.value)
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-bold text-slate-700 mb-1">Nombre del Activo</label>
        <input 
          type="text" 
          required
          className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
          value={formData.name} 
          onChange={e => setFormData({...formData, name: e.target.value})} 
          placeholder="Ej. Cuenta Nu, Auto, CETES"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">Valor (MXN)</label>
          <input 
            type="number" 
            required
            step="0.01"
            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
            value={formData.value} 
            onChange={e => setFormData({...formData, value: e.target.value})} 
            placeholder="0.00"
          />
        </div>
        
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">Propietario</label>
          <select 
            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
            value={formData.owner} 
            onChange={e => setFormData({...formData, owner: e.target.value})}
          >
            <option value="Ambos">Ambos (Compartido)</option>
            {users.map(u => <option key={u.id} value={u.name}>{u.name}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-bold text-slate-700 mb-1">Tipo de Activo</label>
        <select 
          className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
          value={formData.type} 
          onChange={e => setFormData({...formData, type: e.target.value})}
        >
          <option value="Liquidez">Liquidez (Efectivo)</option>
          <option value="Inversión Segura">Inversión Segura</option>
          <option value="Alto Riesgo">Alto Riesgo</option>
          <option value="Bien Depreciable">Bien Depreciable</option>
          <option value="Bienes Raíces">Bienes Raíces</option>
        </select>
      </div>

      <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
        <Button variant="secondary" onClick={onCancel}>Cancelar</Button>
        <Button type="submit">Guardar Activo</Button>
      </div>
    </form>
  );
}
