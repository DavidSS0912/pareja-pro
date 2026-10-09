import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../ui/Button';

import { useAppStore } from '../../store/useAppStore';

const budgetSchema = z.object({
  categoryId: z.string().min(1, 'La categoría es obligatoria'),
  base: z.number().min(0, 'El monto asignado no puede ser negativo'),
  icon: z.string().min(1, 'Obligatorio'),
  shared: z.boolean().optional(),
});

type BudgetFormData = z.infer<typeof budgetSchema>;

export function BudgetForm({ initialData, onSubmit, onCancel, appContext = 'household' }) {
  const categories = useAppStore(state => state.categories);
  const expenseCategories = categories.filter(c => c.type === 'EXPENSE'); // Normally budgets are for expenses
  
  const { register, handleSubmit, formState: { errors } } = useForm<BudgetFormData>({
    resolver: zodResolver(budgetSchema),
    defaultValues: initialData || {
      categoryId: '',
      base: 0,
      icon: '🛒',
      shared: appContext === 'household'
    }
  });

  const onFormSubmit = (data: BudgetFormData) => {
    const selectedCategory = categories.find(c => c.id === data.categoryId);
    onSubmit({ 
      ...data, 
      category: selectedCategory?.name || '', 
      shared: appContext === 'household' 
    });
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
      <div className="flex gap-3">
        <div className="w-20">
          <label htmlFor="budget-icon" className="block text-sm font-bold text-slate-700 mb-1">Ícono</label>
          <input 
            id="budget-icon"
            type="text"
            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-center text-xl"
            aria-invalid={!!errors.icon}
            aria-describedby={errors.icon ? "budget-icon-error" : undefined}
            {...register('icon')}
          />
          {errors.icon && <p id="budget-icon-error" className="text-red-500 text-xs mt-1">{errors.icon.message}</p>}
        </div>
        <div className="flex-1">
          <label htmlFor="budget-categoryId" className="block text-sm font-bold text-slate-700 mb-1">Categoría</label>
          <select 
            id="budget-categoryId"
            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            aria-invalid={!!errors.categoryId}
            aria-describedby={errors.categoryId ? "budget-categoryId-error" : undefined}
            {...register('categoryId')}
          >
            <option value="">Seleccione una categoría...</option>
            {expenseCategories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          {errors.categoryId && <p id="budget-categoryId-error" className="text-red-500 text-xs mt-1">{errors.categoryId.message}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="budget-base" className="block text-sm font-bold text-slate-700 mb-1">Monto Asignado (Mensual)</label>
        <input 
          id="budget-base"
          type="number"
          step="0.01"
          className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
          aria-invalid={!!errors.base}
          aria-describedby={errors.base ? "budget-base-error" : undefined}
          {...register('base', { valueAsNumber: true })}
        />
        {errors.base && <p id="budget-base-error" className="text-red-500 text-xs mt-1">{errors.base.message}</p>}
      </div>

      <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
        <Button variant="secondary" onClick={onCancel} type="button">Cancelar</Button>
        <Button type="submit">Guardar Presupuesto</Button>
      </div>
    </form>
  );
}
