import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../ui/Button';

const expenseSchema = z.object({
  desc: z.string().min(1, 'La descripción es obligatoria'),
  amount: z.number().min(0.01, 'El monto debe ser mayor a 0'),
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
          <label htmlFor="expense-date" className="block text-sm font-bold text-slate-700 mb-1">Fecha</label>
          <input 
            id="expense-date"
            type="date"
            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-colors"
            aria-invalid={!!errors.date}
            aria-describedby={errors.date ? "expense-date-error" : undefined}
            {...register('date')}
          />
          {errors.date && <p id="expense-date-error" className="text-red-500 text-xs mt-1">{errors.date.message}</p>}
        </div>
        <div>
          <label htmlFor="expense-desc" className="block text-sm font-bold text-slate-700 mb-1">Descripción</label>
          <input 
            id="expense-desc"
            type="text"
            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            placeholder="Ej. Walmart Quincena"
            aria-invalid={!!errors.desc}
            aria-describedby={errors.desc ? "expense-desc-error" : undefined}
            {...register('desc')}
          />
          {errors.desc && <p id="expense-desc-error" className="text-red-500 text-xs mt-1">{errors.desc.message}</p>}
        </div>
      </div>
      
      <div>
        <label htmlFor="expense-amount" className="block text-sm font-bold text-slate-700 mb-1">Monto</label>
        <div className="flex gap-2">
          <input
            id="expense-amount"
            type="number"
            step="0.01"
            className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            placeholder="0.00"
            aria-invalid={!!errors.amount}
            aria-describedby={errors.amount ? "expense-amount-error" : undefined}
            {...register('amount', { valueAsNumber: true })}
          />
          <select
            id="expense-currency"
            aria-label="Moneda"
            className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
            aria-invalid={!!errors.currency}
            aria-describedby={errors.currency ? "expense-currency-error" : undefined}
            {...register('currency')}
          >
            <option value="MXN">MXN</option>
            <option value="USD">USD</option>
          </select>
        </div>
        {errors.amount && <p id="expense-amount-error" className="text-red-500 text-xs mt-1">{errors.amount.message}</p>}
        {errors.currency && <p id="expense-currency-error" className="text-red-500 text-xs mt-1">{errors.currency.message}</p>}
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="isPrivate"
          className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
          aria-invalid={!!errors.isPrivate}
          aria-describedby={errors.isPrivate ? "expense-isPrivate-error" : undefined}
          {...register('isPrivate')}
        />
        <label htmlFor="isPrivate" className="text-sm font-medium text-slate-700">Gasto Privado (No se divide)</label>
      </div>
      {errors.isPrivate && <p id="expense-isPrivate-error" className="text-red-500 text-xs mt-1">{errors.isPrivate.message}</p>}

      <div>
        <label htmlFor="expense-category" className="block text-sm font-bold text-slate-700 mb-1">Categoría</label>
        <select
          id="expense-category"
          className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
          aria-invalid={!!errors.category}
          aria-describedby={errors.category ? "expense-category-error" : undefined}
          {...register('category')}
        >
          <option value="Varios">Varios</option>
          {budgets.map((b: any) => (
            <option key={b.id} value={b.category}>{b.category}</option>
          ))}
        </select>
        {errors.category && <p id="expense-category-error" className="text-red-500 text-xs mt-1">{errors.category.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="expense-paidBy" className="block text-sm font-bold text-slate-700 mb-1">Pagado por</label>
          <select 
            id="expense-paidBy"
            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            aria-invalid={!!errors.paidBy}
            aria-describedby={errors.paidBy ? "expense-paidBy-error" : undefined}
            {...register('paidBy')}
          >
            {users.map((u: any) => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
          {errors.paidBy && <p id="expense-paidBy-error" className="text-red-500 text-xs mt-1">{errors.paidBy.message}</p>}
        </div>
        
        {!isPrivate && (
          <div>
            <label htmlFor="expense-splitType" className="block text-sm font-bold text-slate-700 mb-1">División</label>
            <select
              id="expense-splitType"
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              aria-invalid={!!errors.splitType}
              aria-describedby={errors.splitType ? "expense-splitType-error" : undefined}
              {...register('splitType')}
            >
              <option value="50/50">Mitades (50/50)</option>
              <option value="proporcional">Proporcional (Ingresos)</option>
            </select>
            {errors.splitType && <p id="expense-splitType-error" className="text-red-500 text-xs mt-1">{errors.splitType.message}</p>}
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
