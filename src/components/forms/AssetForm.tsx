import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../ui/Button';

const assetSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio'),
  owner: z.string().min(1, 'Obligatorio'),
  value: z.number().min(0, 'El valor no puede ser negativo'),
  type: z.enum(['Liquidez', 'Inversión Segura', 'Alto Riesgo', 'Bien Depreciable', 'Bienes Raíces']),
});

type AssetFormData = z.infer<typeof assetSchema>;

const INPUT_CLASS =
  'w-full rounded-xl border border-[#EEF0F4] bg-[#F5F6FA] focus:bg-white focus:border-[#111319] focus:ring-1 focus:ring-[#111319] text-slate-900 text-sm font-medium transition-colors px-3.5 py-2.5 placeholder:text-slate-400';

const LABEL_CLASS = 'block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5';

export function AssetForm({ initialData, users, onSubmit, onCancel }) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<AssetFormData>({
    resolver: zodResolver(assetSchema),
    defaultValues: initialData || {
      name: '',
      owner: 'Ambos',
      value: 0,
      type: 'Liquidez'
    }
  });

  useEffect(() => {
    if (initialData) {
      reset(initialData);
    } else {
      reset({
        name: '',
        owner: 'Ambos',
        value: 0,
        type: 'Liquidez'
      });
    }
  }, [initialData, reset]);

  const onFormSubmit = (data: AssetFormData) => {
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
      <div>
        <label htmlFor="asset-name" className={LABEL_CLASS}>Nombre del Activo</label>
        <input 
          id="asset-name"
          type="text" 
          className={INPUT_CLASS}
          placeholder="Ej. Cuenta Nu, Auto, CETES"
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? "asset-name-error" : undefined}
          {...register('name')}
        />
        {errors.name && <p id="asset-name-error" className="text-red-500 text-xs mt-1 font-medium">{errors.name.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="asset-value" className={LABEL_CLASS}>Valor (MXN)</label>
          <input 
            id="asset-value"
            type="number" 
            step="0.01"
            className={`${INPUT_CLASS} tabular-nums`}
            placeholder="0.00"
            aria-invalid={!!errors.value}
            aria-describedby={errors.value ? "asset-value-error" : undefined}
            {...register('value', { valueAsNumber: true })}
          />
          {errors.value && <p id="asset-value-error" className="text-red-500 text-xs mt-1 font-medium">{errors.value.message}</p>}
        </div>
        
        <div>
          <label htmlFor="asset-owner" className={LABEL_CLASS}>Propietario</label>
          <select 
            id="asset-owner"
            className={INPUT_CLASS}
            aria-invalid={!!errors.owner}
            aria-describedby={errors.owner ? "asset-owner-error" : undefined}
            {...register('owner')}
          >
            <option value="Ambos">Ambos (Compartido)</option>
            {users.map((u: any) => <option key={u.id} value={u.name}>{u.name}</option>)}
          </select>
          {errors.owner && <p id="asset-owner-error" className="text-red-500 text-xs mt-1 font-medium">{errors.owner.message}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="asset-type" className={LABEL_CLASS}>Tipo de Activo</label>
        <select 
          id="asset-type"
          className={INPUT_CLASS}
          aria-invalid={!!errors.type}
          aria-describedby={errors.type ? "asset-type-error" : undefined}
          {...register('type')}
        >
          <option value="Liquidez">Liquidez (Efectivo)</option>
          <option value="Inversión Segura">Inversión Segura</option>
          <option value="Alto Riesgo">Alto Riesgo</option>
          <option value="Bien Depreciable">Bien Depreciable</option>
          <option value="Bienes Raíces">Bienes Raíces</option>
        </select>
        {errors.type && <p id="asset-type-error" className="text-red-500 text-xs mt-1 font-medium">{errors.type.message}</p>}
      </div>

      <div className="flex justify-end gap-2.5 pt-3 border-t border-[#EEF0F4] items-center">
        <Button
          variant="secondary"
          onClick={onCancel}
          type="button"
          className="!bg-white !border !border-[#EEF0F4] hover:!bg-slate-50 !text-slate-700 !rounded-full px-5 py-2.5 font-medium transition-colors cursor-pointer shadow-none"
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          className="!bg-[#111319] hover:!bg-[#1A1D26] !text-white !rounded-full px-6 py-2.5 font-medium transition-colors duration-150 shadow-sm cursor-pointer"
        >
          Guardar Activo
        </Button>
      </div>
    </form>
  );
}
