import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../ui/Button';

const budgetSchema = z.object({
  category: z.string().min(1, 'La categoría es obligatoria'),
  type: z.enum(['Necesidad', 'Deseo', 'Ahorro']),
  shared: z.boolean(),
  base: z.number().min(0, 'El monto base no puede ser negativo'),
  rollover: z.number(),
  spent: z.number().min(0),
  icon: z.string().min(1, 'Obligatorio'),
});

type BudgetFormData = z.infer<typeof budgetSchema>;

export function BudgetForm({ initialData, onSubmit, onCancel }) {
  const { register, handleSubmit, formState: { errors } } = useForm<BudgetFormData>({
    resolver: zodResolver(budgetSchema),
    defaultValues: initialData || {
      category: '',
      type: 'Necesidad',
      shared: true,
      base: 0,
      rollover: 0,
      spent: 0,
      icon: '🛒'
    }
  });

  const onFormSubmit = (data: BudgetFormData) => {
    onSubmit(data);
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
          <label htmlFor="budget-category" className="block text-sm font-bold text-slate-700 mb-1">Categoría</label>
          <input 
            id="budget-category"
            type="text"
            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Ej. Supermercado"
            aria-invalid={!!errors.category}
            aria-describedby={errors.category ? "budget-category-error" : undefined}
            {...register('category')}
          />
          {errors.category && <p id="budget-category-error" className="text-red-500 text-xs mt-1">{errors.category.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="budget-type" className="block text-sm font-bold text-slate-700 mb-1">Tipo de Presupuesto</label>
          <select 
            id="budget-type"
            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
            aria-invalid={!!errors.type}
            aria-describedby={errors.type ? "budget-type-error" : undefined}
            {...register('type')}
          >
            <option value="Necesidad">Necesidad (50%)</option>
            <option value="Deseo">Deseo (30%)</option>
            <option value="Ahorro">Ahorro/Deuda (20%)</option>
          </select>
          {errors.type && <p id="budget-type-error" className="text-red-500 text-xs mt-1">{errors.type.message}</p>}
        </div>
        <div>
          <label htmlFor="budget-base" className="block text-sm font-bold text-slate-700 mb-1">Monto Base Mensual</label>
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
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="budget-rollover" className="block text-sm font-bold text-slate-700 mb-1">Rollover Inicial</label>
          <input 
            id="budget-rollover"
            type="number"
            step="0.01"
            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
            aria-invalid={!!errors.rollover}
            aria-describedby={errors.rollover ? "budget-rollover-error" : undefined}
            {...register('rollover', { valueAsNumber: true })}
          />
          {errors.rollover && <p id="budget-rollover-error" className="text-red-500 text-xs mt-1">{errors.rollover.message}</p>}
        </div>
        <div>
          <label htmlFor="budget-spent" className="block text-sm font-bold text-slate-700 mb-1">Ya gastado</label>
          <input 
            id="budget-spent"
            type="number"
            step="0.01"
            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
            aria-invalid={!!errors.spent}
            aria-describedby={errors.spent ? "budget-spent-error" : undefined}
            {...register('spent', { valueAsNumber: true })}
          />
          {errors.spent && <p id="budget-spent-error" className="text-red-500 text-xs mt-1">{errors.spent.message}</p>}
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
        <Button variant="secondary" onClick={onCancel} type="button">Cancelar</Button>
        <Button type="submit">Guardar Presupuesto</Button>
      </div>
    </form>
  );
}
