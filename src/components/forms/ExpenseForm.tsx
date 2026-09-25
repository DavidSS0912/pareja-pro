import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../ui/Button';

const expenseSchema = z.object({
  desc: z.string().min(1, 'La descripción es obligatoria'),
  amount: z.coerce.number().min(0.01, 'El monto debe ser mayor a 0'),
  paidBy: z.string().min(1, 'Obligatorio'),
  splitType: z.enum(['50/50', 'proporcional']),
  currency: z.enum(['MXN', 'USD']),
  category: z.string().min(1, 'Obligatorio'),
  date: z.string().min(1, 'Obligatorio'),
  isPrivate: z.boolean(),
});

type ExpenseFormData = z.infer<typeof expenseSchema>;

export function ExpenseForm({ initialData, users, budgets = [], currentUserId, onSubmit, onCancel }) {
  const { register, handleSubmit, watch, formState: { errors } } = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: initialData || {
      desc: '',
      amount: 0,
      paidBy: currentUserId || users[0]?.id || '',
      splitType: '50/50',
      currency: 'MXN',
      category: 'Varios',
      date: new Date().toISOString().split('T')[0],
      isPrivate: false,
    },
  });

  const isPrivate = watch('isPrivate');

  const onFormSubmit = (data: ExpenseFormData) => {
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">Fecha</label>
          <input 
            type="date"
            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-colors"
            {...register('date')}
          />
          {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">Descripción</label>
          <input 
            type="text"
            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            placeholder="Ej. Walmart Quincena"
            {...register('desc')}
          />
          {errors.desc && <p className="text-red-500 text-xs mt-1">{errors.desc.message}</p>}
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-bold text-slate-700 mb-1">Monto</label>
        <div className="flex gap-2">
          <input
            type="number"
            step="0.01"
            className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            placeholder="0.00"
            {...register('amount')}
          />
          <select
            className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
            {...register('currency')}
          >
            <option value="MXN">MXN</option>
            <option value="USD">USD</option>
          </select>
        </div>
        {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount.message}</p>}
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="isPrivate"
          className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
          {...register('isPrivate')}
        />
        <label htmlFor="isPrivate" className="text-sm font-medium text-slate-700">Gasto Privado (No se divide)</label>
      </div>

      <div>
        <label className="block text-sm font-bold text-slate-700 mb-1">Categoría</label>
        <select
          className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
          {...register('category')}
        >
          <option value="Varios">Varios</option>
          {budgets.map((b: any) => (
            <option key={b.id} value={b.category}>{b.category}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1">Pagado por</label>
          <select 
            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            {...register('paidBy')}
          >
            {users.map((u: any) => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
        </div>
        
        {!isPrivate && (
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">División</label>
            <select
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              {...register('splitType')}
            >
              <option value="50/50">Mitades (50/50)</option>
              <option value="proporcional">Proporcional (Ingresos)</option>
            </select>
          </div>
        )}
      </div>

      <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
        <Button variant="secondary" onClick={onCancel} type="button">Cancelar</Button>
        <Button type="submit">Guardar Gasto</Button>
      </div>
    </form>
  );
}
