import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../ui/Button';

const paymentSchema = z.object({
  sourceAccountId: z.string().min(1, 'Obligatorio'),
  amount: z.number().min(0.01, 'El monto debe ser mayor a 0'),
  date: z.string().min(1, 'La fecha es obligatoria'),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

export function PaymentForm({ targetAccount, assetAccounts, onSubmit, onCancel }) {
  const { register, handleSubmit, formState: { errors } } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      sourceAccountId: assetAccounts.length > 0 ? assetAccounts[0].id : '',
      amount: Math.abs(targetAccount?.balance || 0),
      date: new Date().toISOString().split('T')[0],
    },
  });

  const onFormSubmit = (data: PaymentFormData) => {
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
      <div className="bg-slate-50 p-4 rounded-xl mb-4 border border-slate-100">
        <p className="text-sm text-slate-500 mb-1">Pagando a tarjeta</p>
        <p className="font-bold text-slate-800">{targetAccount?.name}</p>
      </div>

      <div>
        <label htmlFor="sourceAccountId" className="block text-sm font-bold text-slate-700 mb-1">Origen de Fondos</label>
        <select
          id="sourceAccountId"
          className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
          aria-invalid={!!errors.sourceAccountId}
          aria-describedby={errors.sourceAccountId ? "sourceAccountId-error" : undefined}
          {...register('sourceAccountId')}
        >
          {assetAccounts.map((a: any) => (
            <option key={a.id} value={a.id}>{a.name}</option>
          ))}
        </select>
        {errors.sourceAccountId && <p id="sourceAccountId-error" className="text-red-500 text-xs mt-1">{errors.sourceAccountId.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="amount" className="block text-sm font-bold text-slate-700 mb-1">Monto</label>
          <input
            id="amount"
            type="number"
            step="0.01"
            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
            aria-invalid={!!errors.amount}
            aria-describedby={errors.amount ? "amount-error" : undefined}
            {...register('amount', { valueAsNumber: true })}
          />
          {errors.amount && <p id="amount-error" className="text-red-500 text-xs mt-1">{errors.amount.message}</p>}
        </div>
        <div>
          <label htmlFor="date" className="block text-sm font-bold text-slate-700 mb-1">Fecha</label>
          <input
            id="date"
            type="date"
            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
            aria-invalid={!!errors.date}
            aria-describedby={errors.date ? "date-error" : undefined}
            {...register('date')}
          />
          {errors.date && <p id="date-error" className="text-red-500 text-xs mt-1">{errors.date.message}</p>}
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
        <Button variant="secondary" onClick={onCancel} type="button">Cancelar</Button>
        <Button type="submit">Registrar Pago</Button>
      </div>
    </form>
  );
}
