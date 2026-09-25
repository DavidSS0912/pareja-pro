import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../ui/Button';

const assetSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio'),
  owner: z.string().min(1, 'Obligatorio'),
  value: z.coerce.number().min(0, 'El valor no puede ser negativo'),
  type: z.enum(['Liquidez', 'Inversión Segura', 'Alto Riesgo', 'Bien Depreciable', 'Bienes Raíces']),
});

type AssetFormData = z.infer<typeof assetSchema>;

export function AssetForm({ initialData, users, onSubmit, onCancel }) {
  const { register, handleSubmit, formState: { errors } } = useForm<AssetFormData>({
    resolver: zodResolver(assetSchema),
    defaultValues: initialData || {
      name: '',
      owner: 'Ambos',
      value: 0,
      type: 'Liquidez'
    }
  });

  const onFormSubmit = (data: AssetFormData) => {
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-bold text-slate-700 mb-1">Nombre del Activo</label>
        <input 
          type="text" 
          className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
          placeholder="Ej. Cuenta Nu, Auto, CETES"
          {...register('name')}
        />
        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">Valor (MXN)</label>
          <input 
            type="number" 
            step="0.01"
            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
            placeholder="0.00"
            {...register('value')}
          />
          {errors.value && <p className="text-red-500 text-xs mt-1">{errors.value.message}</p>}
        </div>
        
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">Propietario</label>
          <select 
            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
            {...register('owner')}
          >
            <option value="Ambos">Ambos (Compartido)</option>
            {users.map((u: any) => <option key={u.id} value={u.name}>{u.name}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-bold text-slate-700 mb-1">Tipo de Activo</label>
        <select 
          className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
          {...register('type')}
        >
          <option value="Liquidez">Liquidez (Efectivo)</option>
          <option value="Inversión Segura">Inversión Segura</option>
          <option value="Alto Riesgo">Alto Riesgo</option>
          <option value="Bien Depreciable">Bien Depreciable</option>
          <option value="Bienes Raíces">Bienes Raíces</option>
        </select>
      </div>

      <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
        <Button variant="secondary" onClick={onCancel} type="button">Cancelar</Button>
        <Button type="submit">Guardar Activo</Button>
      </div>
    </form>
  );
}
