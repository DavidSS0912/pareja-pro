import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../ui/Button';

const cardSchema = z.object({
  name: z.string().min(1, 'Obligatorio'),
  ownerId: z.string().min(1, 'Obligatorio'),
  shared: z.boolean(),
  limit: z.number().min(0),
  cutDay: z.number().min(1).max(31),
  payDay: z.number().min(1).max(31),
  balance: z.number(),
  noInterestPay: z.number().min(0),
  interestRate: z.number().min(0),
  color: z.string()
});

type CardFormData = z.infer<typeof cardSchema>;

export function CardForm({ initialData, users, onSubmit, onCancel }) {
  const { register, handleSubmit, formState: { errors } } = useForm<CardFormData>({
    resolver: zodResolver(cardSchema),
    defaultValues: initialData || {
      name: '',
      ownerId: users[0]?.id || 'u1',
      shared: false,
      limit: 0,
      cutDay: 1,
      payDay: 1,
      balance: 0,
      noInterestPay: 0,
      interestRate: 0,
      color: 'bg-gradient-to-br from-slate-700 to-slate-900'
    }
  });

  const onFormSubmit = (data: CardFormData) => {
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">Nombre Tarjeta</label>
          <input 
            type="text" 
            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
            placeholder="Ej. Nu Clásica"
            {...register('name')}
          />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">Color/Tema</label>
          <select 
            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
            {...register('color')}
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
            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
            {...register('ownerId')}
          >
            {users.map((u: any) => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">Uso Compartido</label>
          <select 
            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
            {...register('shared', { setValueAs: v => v === 'true' })}
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
            type="number" 
            className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
            {...register('limit', { valueAsNumber: true })}
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">Día Corte</label>
          <input 
            type="number" 
            className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
            {...register('cutDay', { valueAsNumber: true })}
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">Día Pago</label>
          <input 
            type="number" 
            className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
            {...register('payDay', { valueAsNumber: true })}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">Saldo Actual</label>
          <input 
            type="number" step="0.01" 
            className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
            {...register('balance', { valueAsNumber: true })}
          />
        </div>
        <div>
          <label className="block text-[11px] font-bold text-slate-700 mb-1 leading-tight">Pago para no int.</label>
          <input 
            type="number" step="0.01" 
            className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
            {...register('noInterestPay', { valueAsNumber: true })}
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">Tasa Int. (%)</label>
          <input 
            type="number" step="0.01" 
            className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
            {...register('interestRate', { valueAsNumber: true })}
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
        <Button variant="secondary" onClick={onCancel} type="button">Cancelar</Button>
        <Button type="submit">Guardar Tarjeta</Button>
      </div>
    </form>
  );
}
