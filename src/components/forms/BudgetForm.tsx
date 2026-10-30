import React, { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../ui/Button';
import { useAppStore } from '../../store/useAppStore';

const budgetSchema = z.object({
  categoryId: z.string().min(1, 'La categoría es obligatoria'),
  icon: z.string().min(1, 'Obligatorio'),
  mode: z.enum(['PERCENTAGE', 'FIXED']),
  percentage: z.number().optional().nullable(),
  base: z.number().optional().nullable(),
  fixedAmount: z.number().optional().nullable(),
  splitType: z.enum(['PROPORTIONAL', 'CUSTOM']),
  customUserId: z.string().optional().nullable(),
  customUserAmount: z.number().optional().nullable(),
  shared: z.boolean().optional(),
}).superRefine((data, ctx) => {
  if (data.base === undefined || data.base === null || isNaN(data.base)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'El monto fijo es obligatorio',
      path: ['base'],
    });
  } else if (data.base < 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'El monto asignado no puede ser negativo',
      path: ['base'],
    });
  }

  if (data.splitType === 'CUSTOM') {
    if (!data.customUserId || data.customUserId.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Debe seleccionar un integrante',
        path: ['customUserId'],
      });
    }
    if (data.customUserAmount === undefined || data.customUserAmount === null || isNaN(data.customUserAmount)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'El monto personalizado es obligatorio',
        path: ['customUserAmount'],
      });
    } else if (data.customUserAmount < 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'El monto no puede ser negativo',
        path: ['customUserAmount'],
      });
    }
  }
});

export type BudgetFormData = z.infer<typeof budgetSchema>;

export interface BudgetFormProps {
  initialData?: any;
  users?: any[];
  onSubmit: (data: any) => void;
  onCancel: () => void;
  appContext?: string;
}

export function BudgetForm({
  initialData,
  users,
  onSubmit,
  onCancel,
  appContext = 'household'
}: BudgetFormProps) {
  const categories = useAppStore(state => state.categories);
  const expenseCategories = categories.filter(c => c.type === 'EXPENSE');
  const storeUsers = useAppStore(state => (state as any).users) || [];
  const resolvedUsers = (users && users.length > 0) ? users : storeUsers;

  const userOptions = useMemo(() => {
    let opts: Array<{ id: string; name: string }> = [];
    if (resolvedUsers && resolvedUsers.length >= 2) {
      opts = resolvedUsers.map((u: any, i: number) => ({
        id: String(u.id || u.uid || `user_${i + 1}`),
        name: u.displayName || u.name || u.email || `Integrante ${i + 1}`,
      }));
    } else if (resolvedUsers && resolvedUsers.length === 1) {
      opts = [
        {
          id: String(resolvedUsers[0].id || resolvedUsers[0].uid || 'user_1'),
          name: resolvedUsers[0].displayName || resolvedUsers[0].name || resolvedUsers[0].email || 'Integrante 1',
        },
        { id: 'partner', name: 'Pareja / Integrante 2' }
      ];
    } else {
      opts = [
        { id: 'user_1', name: 'Integrante 1' },
        { id: 'user_2', name: 'Integrante 2' }
      ];
    }

    if (initialData?.customUserId && !opts.some(o => o.id === initialData.customUserId)) {
      opts.push({
        id: initialData.customUserId,
        name: initialData.customUserName || `Integrante (${initialData.customUserId})`
      });
    }

    return opts;
  }, [resolvedUsers, initialData?.customUserId, initialData?.customUserName]);

  const defaultValues: BudgetFormData = useMemo(() => {
    const rawSplit = initialData?.splitType ? String(initialData.splitType).toUpperCase() : 'PROPORTIONAL';
    const splitType: 'PROPORTIONAL' | 'CUSTOM' = rawSplit === 'CUSTOM' ? 'CUSTOM' : 'PROPORTIONAL';
    const baseValue = Number(initialData?.base ?? initialData?.fixedAmount ?? initialData?.assignedAmount ?? 0);

    return {
      categoryId: initialData?.categoryId || '',
      icon: initialData?.icon || '🛒',
      mode: 'FIXED',
      percentage: 0,
      base: baseValue,
      fixedAmount: baseValue,
      splitType,
      customUserId: initialData?.customUserId || userOptions[0]?.id || '',
      customUserAmount: initialData?.customUserAmount !== undefined && initialData?.customUserAmount !== null 
        ? Number(initialData.customUserAmount) 
        : 0,
      shared: initialData?.shared ?? (appContext === 'household'),
    };
  }, [initialData, appContext, userOptions]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    clearErrors,
    reset,
    formState: { errors }
  } = useForm<BudgetFormData>({
    resolver: zodResolver(budgetSchema),
    defaultValues
  });

  const currentSplitType = watch('splitType');

  useEffect(() => {
    reset(defaultValues);
  }, [initialData, reset]);

  const showCoupleConfig = appContext === 'household';

  const onFormSubmit = (data: BudgetFormData) => {
    const selectedCategory = categories.find(c => c.id === data.categoryId);
    const isHousehold = appContext === 'household';
    const isCustomSplit = isHousehold && data.splitType === 'CUSTOM';

    const rawBase = Number(data.base ?? data.fixedAmount ?? 0);
    const baseVal = isNaN(rawBase) ? 0 : rawBase;

    const rawCustomAmount = Number(data.customUserAmount ?? 0);
    const customUserAmountVal = isCustomSplit ? (isNaN(rawCustomAmount) ? 0 : rawCustomAmount) : 0;
    const customUserIdVal = isCustomSplit ? (data.customUserId || userOptions[0]?.id || '') : null;

    const activeUserSlot = useAppStore.getState().memberSlot || useAppStore.getState().user?.memberSlot || 'USER_A';

    const payload = {
      ...(initialData || {}),
      ...data,
      category: selectedCategory?.name || '',
      mode: 'FIXED',
      percentage: 0,
      base: baseVal,
      fixedAmount: baseVal,
      splitType: isHousehold ? data.splitType : 'PROPORTIONAL',
      customUserId: isHousehold ? customUserIdVal : null,
      customUserAmount: isHousehold ? customUserAmountVal : 0,
      shared: isHousehold,
      ownerType: isHousehold ? 'SHARED' : activeUserSlot,
    };

    onSubmit(payload);
  };

  const handleSplitTypeChange = (newSplit: 'PROPORTIONAL' | 'CUSTOM') => {
    setValue('splitType', newSplit, { shouldValidate: true, shouldDirty: true });
    clearErrors(['customUserId', 'customUserAmount']);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
      <input type="hidden" {...register('mode')} />
      <input type="hidden" {...register('splitType')} />
      <input type="hidden" {...register('fixedAmount')} />
      <input type="hidden" {...register('shared')} />

      {/* Ícono y Categoría */}
      <div className="flex gap-3">
        <div className="w-20">
          <label htmlFor="budget-icon" className="block text-sm font-bold text-slate-700 mb-1">
            Ícono
          </label>
          <input 
            id="budget-icon"
            type="text"
            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-center text-xl focus:ring-2 focus:ring-indigo-500"
            aria-invalid={!!errors.icon}
            aria-describedby={errors.icon ? "budget-icon-error" : undefined}
            {...register('icon')}
          />
          {errors.icon && (
            <p id="budget-icon-error" className="text-red-500 text-xs mt-1">
              {errors.icon.message}
            </p>
          )}
        </div>
        <div className="flex-1">
          <label htmlFor="budget-categoryId" className="block text-sm font-bold text-slate-700 mb-1">
            Categoría
          </label>
          <select 
            id="budget-categoryId"
            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            aria-invalid={!!errors.categoryId}
            aria-describedby={errors.categoryId ? "budget-categoryId-error" : undefined}
            {...register('categoryId')}
          >
            <option value="">Seleccione una categoría...</option>
            {expenseCategories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          {errors.categoryId && (
            <p id="budget-categoryId-error" className="text-red-500 text-xs mt-1">
              {errors.categoryId.message}
            </p>
          )}
        </div>
      </div>

      {/* Meta Fija Mensual ($) */}
      <div>
        <label htmlFor="budget-base" className="block text-sm font-bold text-slate-700 mb-1">
          Meta Fija Mensual ($)
        </label>
        <div className="relative">
          <input 
            id="budget-base"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 text-sm"
            aria-invalid={!!errors.base}
            aria-describedby={errors.base ? "budget-base-error" : undefined}
            {...register('base', { 
              valueAsNumber: true,
              onChange: (e) => {
                const val = parseFloat(e.target.value);
                setValue('fixedAmount', isNaN(val) ? 0 : val);
              }
            })}
          />
        </div>
        {errors.base && (
          <p id="budget-base-error" className="text-red-500 text-xs mt-1">
            {errors.base.message}
          </p>
        )}
      </div>

      {/* Configuración de Aportación de Pareja */}
      {showCoupleConfig && (
        <div className="pt-3 border-t border-slate-100 space-y-3">
          <div className="space-y-1.5">
            <label className="block text-sm font-bold text-slate-700">
              Equidad de Aportación de Pareja
            </label>
            <div 
              className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-xl"
              role="radiogroup" 
              aria-label="Equidad de aportación de pareja"
            >
              <button
                type="button"
                role="radio"
                aria-checked={currentSplitType === 'PROPORTIONAL'}
                onClick={() => handleSplitTypeChange('PROPORTIONAL')}
                className={`py-2 px-3 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
                  currentSplitType === 'PROPORTIONAL'
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
              >
                Proporcional a ingresos del mes
              </button>
              <button
                type="button"
                role="radio"
                aria-checked={currentSplitType === 'CUSTOM'}
                onClick={() => handleSplitTypeChange('CUSTOM')}
                className={`py-2 px-3 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
                  currentSplitType === 'CUSTOM'
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
              >
                Aportación personalizada
              </button>
            </div>
            {currentSplitType === 'PROPORTIONAL' && (
              <p className="text-xs text-slate-500 mt-1">
                Cada integrante aportará proporcionalmente a sus ingresos registrados en el mes.
              </p>
            )}
          </div>

          {currentSplitType === 'CUSTOM' && (
            <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100/80 space-y-3">
              <div>
                <label htmlFor="budget-customUserId" className="block text-sm font-bold text-slate-700 mb-1">
                  Integrante que fija su monto
                </label>
                <select
                  id="budget-customUserId"
                  className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  aria-invalid={!!errors.customUserId}
                  aria-describedby={errors.customUserId ? "budget-customUserId-error" : undefined}
                  {...register('customUserId')}
                >
                  {userOptions.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name}
                    </option>
                  ))}
                </select>
                {errors.customUserId && (
                  <p id="budget-customUserId-error" className="text-red-500 text-xs mt-1">
                    {errors.customUserId.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="budget-customUserAmount" className="block text-sm font-bold text-slate-700 mb-1">
                  Monto Fijo Aportado ($)
                </label>
                <input
                  id="budget-customUserAmount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 text-sm"
                  aria-invalid={!!errors.customUserAmount}
                  aria-describedby={errors.customUserAmount ? "budget-customUserAmount-error budget-customUserAmount-hint" : "budget-customUserAmount-hint"}
                  {...register('customUserAmount', { valueAsNumber: true })}
                />
                <p id="budget-customUserAmount-hint" className="text-xs text-indigo-700 mt-1.5 font-medium">
                  El segundo integrante cubrirá automáticamente el remanente del presupuesto asignado.
                </p>
                {errors.customUserAmount && (
                  <p id="budget-customUserAmount-error" className="text-red-500 text-xs mt-1">
                    {errors.customUserAmount.message}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Botones de Acción */}
      <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
        <Button variant="secondary" onClick={onCancel} type="button">
          Cancelar
        </Button>
        <Button type="submit">
          Guardar Presupuesto
        </Button>
      </div>
    </form>
  );
}
