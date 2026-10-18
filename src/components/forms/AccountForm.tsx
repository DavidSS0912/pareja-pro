import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../ui/Button';

const accountSchema = z.object({
  name: z.string().min(1, 'Obligatorio'),
  type: z.enum(['ASSET', 'LIABILITY']),
  shared: z.boolean(),
  creditLimit: z.number().optional(),
  cutDay: z.number().min(1).max(31).optional(),
  paymentDay: z.number().min(1).max(31).optional(),
  color: z.string().optional()
});

type AccountFormData = z.infer<typeof accountSchema>;

export function AccountForm({ initialData, users, onSubmit, onCancel, appContext = 'household' }) {
  const { register, handleSubmit, watch, formState: { errors } } = useForm<AccountFormData>({
    resolver: zodResolver(accountSchema),
    defaultValues: initialData || {
      name: '',
      type: 'LIABILITY',
      shared: false,
      creditLimit: 0,
      cutDay: 1,
      paymentDay: 1,
      color: 'bg-gradient-to-br from-slate-700 to-slate-900'
    }
  });

  const selectedType = watch('type');

  const onFormSubmit = (data: AccountFormData) => {
    // If it's an asset, ensure creditLimit and cutDay/paymentDay are null or 0
    if (data.type === 'ASSET') {
      data.creditLimit = 0;
      data.cutDay = undefined;
      data.paymentDay = undefined;
    }
    onSubmit({ ...data, shared: appContext === 'household' });
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="account-name" className="block text-sm font-bold text-slate-700 mb-1">Nombre</label>
          <input 
            id="account-name"
            type="text" 
            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
            placeholder="Ej. Nu Clásica"
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? "account-name-error" : undefined}
            {...register('name')}
          />
          {errors.name && <p id="account-name-error" className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
        </div>
        <div>
          <label htmlFor="account-type" className="block text-sm font-bold text-slate-700 mb-1">Tipo</label>
          <select 
            id="account-type"
            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
            aria-invalid={!!errors.type}
            aria-describedby={errors.type ? "account-type-error" : undefined}
            {...register('type')}
          >
            <option value="ASSET">Débito / Efectivo</option>
            <option value="LIABILITY">Tarjeta de Crédito</option>
          </select>
          {errors.type && <p id="account-type-error" className="text-red-500 text-xs mt-1">{errors.type.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div>
          <label htmlFor="account-color" className="block text-sm font-bold text-slate-700 mb-1">Color/Tema</label>
          <select 
            id="account-color"
            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
            aria-invalid={!!errors.color}
            aria-describedby={errors.color ? "account-color-error" : undefined}
            {...register('color')}
          >
            <option value="bg-gradient-to-br from-slate-700 to-slate-900">Negro (Clásica)</option>
            <option value="bg-gradient-to-br from-purple-600 to-purple-900">Morado (Nu)</option>
            <option value="bg-gradient-to-br from-blue-700 to-blue-900">Azul (BBVA/Banamex)</option>
            <option value="bg-gradient-to-br from-red-600 to-red-800">Rojo (Santander/Costco)</option>
            <option value="bg-gradient-to-br from-emerald-500 to-teal-700">Verde (Efectivo/Débito)</option>
            <option value="bg-gradient-to-br from-amber-500 to-yellow-700">Oro (Gold)</option>
            <option value="bg-gradient-to-br from-slate-300 to-slate-500">Plata (Silver)</option>
          </select>
          {errors.color && <p id="account-color-error" className="text-red-500 text-xs mt-1">{errors.color.message}</p>}
        </div>
      </div>

      {selectedType === 'LIABILITY' && (
        <div className="grid grid-cols-3 gap-2 border-t border-slate-100 pt-4 mt-2">
          <div>
            <label htmlFor="account-limit" className="block text-sm font-bold text-slate-700 mb-1">Límite</label>
            <input 
              id="account-limit"
              type="number" 
              className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
              aria-invalid={!!errors.creditLimit}
              aria-describedby={errors.creditLimit ? "account-limit-error" : undefined}
              {...register('creditLimit', { valueAsNumber: true })}
            />
            {errors.creditLimit && <p id="account-limit-error" className="text-red-500 text-xs mt-1">{errors.creditLimit.message}</p>}
          </div>
          <div>
            <label htmlFor="account-cutDay" className="block text-sm font-bold text-slate-700 mb-1">Día Corte</label>
            <input 
              id="account-cutDay"
              type="number" 
              className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
              aria-invalid={!!errors.cutDay}
              aria-describedby={errors.cutDay ? "account-cutDay-error" : undefined}
              {...register('cutDay', { valueAsNumber: true })}
            />
            {errors.cutDay && <p id="account-cutDay-error" className="text-red-500 text-xs mt-1">{errors.cutDay.message}</p>}
          </div>
          <div>
            <label htmlFor="account-paymentDay" className="block text-sm font-bold text-slate-700 mb-1">Día Pago</label>
            <input 
              id="account-paymentDay"
              type="number" 
              className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
              aria-invalid={!!errors.paymentDay}
              aria-describedby={errors.paymentDay ? "account-paymentDay-error" : undefined}
              {...register('paymentDay', { valueAsNumber: true })}
            />
            {errors.paymentDay && <p id="account-paymentDay-error" className="text-red-500 text-xs mt-1">{errors.paymentDay.message}</p>}
          </div>
        </div>
      )}

      <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
        <Button variant="secondary" onClick={onCancel} type="button">Cancelar</Button>
        <Button type="submit">Guardar Cuenta</Button>
      </div>
    </form>
  );
}
