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
          <label htmlFor="card-name" className="block text-sm font-bold text-slate-700 mb-1">Nombre Tarjeta</label>
          <input 
            id="card-name"
            type="text" 
            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
            placeholder="Ej. Nu Clásica"
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? "card-name-error" : undefined}
            {...register('name')}
          />
          {errors.name && <p id="card-name-error" className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
        </div>
        <div>
          <label htmlFor="card-color" className="block text-sm font-bold text-slate-700 mb-1">Color/Tema</label>
          <select 
            id="card-color"
            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
            aria-invalid={!!errors.color}
            aria-describedby={errors.color ? "card-color-error" : undefined}
            {...register('color')}
          >
            <option value="bg-gradient-to-br from-slate-700 to-slate-900">Negro (Clásica)</option>
            <option value="bg-gradient-to-br from-purple-600 to-purple-900">Morado (Nu)</option>
            <option value="bg-gradient-to-br from-blue-700 to-blue-900">Azul (BBVA/Banamex)</option>
            <option value="bg-gradient-to-br from-red-600 to-red-800">Rojo (Santander/Costco)</option>
            <option value="bg-gradient-to-br from-amber-500 to-yellow-700">Oro (Gold)</option>
            <option value="bg-gradient-to-br from-slate-300 to-slate-500">Plata (Silver)</option>
          </select>
          {errors.color && <p id="card-color-error" className="text-red-500 text-xs mt-1">{errors.color.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="card-owner" className="block text-sm font-bold text-slate-700 mb-1">Titular</label>
          <select 
            id="card-owner"
            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
            aria-invalid={!!errors.ownerId}
            aria-describedby={errors.ownerId ? "card-ownerId-error" : undefined}
            {...register('ownerId')}
          >
            {users.map((u: any) => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
          {errors.ownerId && <p id="card-ownerId-error" className="text-red-500 text-xs mt-1">{errors.ownerId.message}</p>}
        </div>
        <div>
          <label htmlFor="card-shared" className="block text-sm font-bold text-slate-700 mb-1">Uso Compartido</label>
          <select 
            id="card-shared"
            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
            aria-invalid={!!errors.shared}
            aria-describedby={errors.shared ? "card-shared-error" : undefined}
            {...register('shared', { setValueAs: v => v === 'true' })}
          >
            <option value="false">No (Individual)</option>
            <option value="true">Sí (Gastos de Hogar)</option>
          </select>
          {errors.shared && <p id="card-shared-error" className="text-red-500 text-xs mt-1">{errors.shared.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div>
          <label htmlFor="card-limit" className="block text-sm font-bold text-slate-700 mb-1">Límite</label>
          <input 
            id="card-limit"
            type="number" 
            className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
            aria-invalid={!!errors.limit}
            aria-describedby={errors.limit ? "card-limit-error" : undefined}
            {...register('limit', { valueAsNumber: true })}
          />
          {errors.limit && <p id="card-limit-error" className="text-red-500 text-xs mt-1">{errors.limit.message}</p>}
        </div>
        <div>
          <label htmlFor="card-cutDay" className="block text-sm font-bold text-slate-700 mb-1">Día Corte</label>
          <input 
            id="card-cutDay"
            type="number" 
            className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
            aria-invalid={!!errors.cutDay}
            aria-describedby={errors.cutDay ? "card-cutDay-error" : undefined}
            {...register('cutDay', { valueAsNumber: true })}
          />
          {errors.cutDay && <p id="card-cutDay-error" className="text-red-500 text-xs mt-1">{errors.cutDay.message}</p>}
        </div>
        <div>
          <label htmlFor="card-payDay" className="block text-sm font-bold text-slate-700 mb-1">Día Pago</label>
          <input 
            id="card-payDay"
            type="number" 
            className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
            aria-invalid={!!errors.payDay}
            aria-describedby={errors.payDay ? "card-payDay-error" : undefined}
            {...register('payDay', { valueAsNumber: true })}
          />
          {errors.payDay && <p id="card-payDay-error" className="text-red-500 text-xs mt-1">{errors.payDay.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div>
          <label htmlFor="card-balance" className="block text-sm font-bold text-slate-700 mb-1">Saldo Actual</label>
          <input 
            id="card-balance"
            type="number" step="0.01" 
            className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
            aria-invalid={!!errors.balance}
            aria-describedby={errors.balance ? "card-balance-error" : undefined}
            {...register('balance', { valueAsNumber: true })}
          />
          {errors.balance && <p id="card-balance-error" className="text-red-500 text-xs mt-1">{errors.balance.message}</p>}
        </div>
        <div>
          <label htmlFor="card-noInterestPay" className="block text-[11px] font-bold text-slate-700 mb-1 leading-tight">Pago para no int.</label>
          <input 
            id="card-noInterestPay"
            type="number" step="0.01" 
            className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
            aria-invalid={!!errors.noInterestPay}
            aria-describedby={errors.noInterestPay ? "card-noInterestPay-error" : undefined}
            {...register('noInterestPay', { valueAsNumber: true })}
          />
          {errors.noInterestPay && <p id="card-noInterestPay-error" className="text-red-500 text-xs mt-1">{errors.noInterestPay.message}</p>}
        </div>
        <div>
          <label htmlFor="card-interestRate" className="block text-sm font-bold text-slate-700 mb-1">Tasa Int. (%)</label>
          <input 
            id="card-interestRate"
            type="number" step="0.01" 
            className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
            aria-invalid={!!errors.interestRate}
            aria-describedby={errors.interestRate ? "card-interestRate-error" : undefined}
            {...register('interestRate', { valueAsNumber: true })}
          />
          {errors.interestRate && <p id="card-interestRate-error" className="text-red-500 text-xs mt-1">{errors.interestRate.message}</p>}
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
        <Button variant="secondary" onClick={onCancel} type="button">Cancelar</Button>
        <Button type="submit">Guardar Tarjeta</Button>
      </div>
    </form>
  );
}
