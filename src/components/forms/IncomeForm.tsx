import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../ui/Button';
import { DollarSign, Calendar, User, Tag, Lock } from 'lucide-react';

const INPUT_CLASS =
  'w-full px-3 py-2.5 bg-white border border-[#E5E5E5] rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors';

const LABEL_CLASS = 'block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5';

const incomeSchema = z.object({
  userId: z.string().min(1, 'El aportador es obligatorio'),
  amount: z.number().min(0.01, 'El monto debe ser mayor a 0'),
  type: z.enum(['Sueldo', 'Bono', 'Ventas', 'Inversiones', 'Otro']),
  currency: z.enum(['MXN', 'USD']),
  date: z.string().min(1, 'La fecha es obligatoria'),
  isPrivate: z.boolean(),
});

type IncomeFormData = z.infer<typeof incomeSchema>;

export function IncomeForm({ initialData, users, currentUserId, onSubmit, onCancel }: {
  initialData?: any;
  users: any[];
  currentUserId: string;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}) {
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<IncomeFormData>({
    resolver: zodResolver(incomeSchema),
    defaultValues: initialData || {
      userId: currentUserId || users[0]?.id || '',
      amount: 0,
      type: 'Sueldo',
      currency: 'MXN',
      date: new Date().toISOString().split('T')[0],
      isPrivate: false,
    },
  });

  const isPrivate = watch('isPrivate');

  const onFormSubmit = (data: IncomeFormData) => {
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-5">
      {/* Row 1: Fecha + Aportador */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="income-date" className={LABEL_CLASS}>
            <span className="flex items-center gap-1.5">
              <Calendar size={11} />
              Fecha
            </span>
          </label>
          <input
            id="income-date"
            type="date"
            className={INPUT_CLASS}
            aria-invalid={!!errors.date}
            aria-describedby={errors.date ? "income-date-error" : undefined}
            {...register('date')}
          />
          {errors.date && <p id="income-date-error" className="text-red-500 text-xs mt-1">{errors.date.message}</p>}
        </div>
        <div>
          <label htmlFor="income-userId" className={LABEL_CLASS}>
            <span className="flex items-center gap-1.5">
              <User size={11} />
              Aportador
            </span>
          </label>
          <select
            id="income-userId"
            className={INPUT_CLASS}
            aria-invalid={!!errors.userId}
            aria-describedby={errors.userId ? "income-userId-error" : undefined}
            {...register('userId')}
          >
            {users.map((u: any) => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
          {errors.userId && <p id="income-userId-error" className="text-red-500 text-xs mt-1">{errors.userId.message}</p>}
        </div>
      </div>

      {/* Row 2: Monto + Moneda */}
      <div>
        <label htmlFor="income-amount" className={LABEL_CLASS}>
          <span className="flex items-center gap-1.5">
            <DollarSign size={11} />
            Monto
          </span>
        </label>
        <div className="flex gap-2">
          <input
            id="income-amount"
            type="number"
            step="0.01"
            className={`${INPUT_CLASS} flex-1 tabular-nums tracking-tight`}
            placeholder="0.00"
            aria-invalid={!!errors.amount}
            aria-describedby={errors.amount ? "income-amount-error" : undefined}
            {...register('amount', { valueAsNumber: true })}
          />
          <select
            aria-label="Moneda"
            className="px-3 py-2.5 bg-white border border-[#E5E5E5] rounded-lg text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
            {...register('currency')}
          >
            <option value="MXN">MXN</option>
            <option value="USD">USD</option>
          </select>
        </div>
        {errors.amount && <p id="income-amount-error" className="text-red-500 text-xs mt-1">{errors.amount.message}</p>}
      </div>

      {/* Row 3: Tipo */}
      <div>
        <label htmlFor="income-type" className={LABEL_CLASS}>
          <span className="flex items-center gap-1.5">
            <Tag size={11} />
            Tipo de Ingreso
          </span>
        </label>
        <select
          id="income-type"
          className={INPUT_CLASS}
          {...register('type')}
        >
          <option value="Sueldo">Sueldo / Salario</option>
          <option value="Bono">Bono / Utilidades</option>
          <option value="Ventas">Ventas / Negocio</option>
          <option value="Inversiones">Retornos de Inversión</option>
          <option value="Otro">Otro Ingreso</option>
        </select>
      </div>

      {/* Row 4: Privado toggle */}
      <div 
        className="flex items-start gap-3 p-3 rounded-lg border border-[#E5E5E5] bg-slate-50 cursor-pointer group"
        onClick={() => setValue('isPrivate', !isPrivate, { shouldValidate: true })}
      >
        <div className={`mt-0.5 w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
          isPrivate
            ? 'bg-indigo-600 border-indigo-600'
            : 'bg-white border-slate-300 group-hover:border-indigo-400'
        }`}>
          {isPrivate && (
            <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 10 10" fill="none">
              <path d="M1.5 5L4 7.5L8.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </div>
        <div>
          <p className="text-sm font-medium text-slate-900 flex items-center gap-1.5">
            <Lock size={12} className="text-slate-400" />
            Ingreso Privado
          </p>
          <p className="text-xs text-slate-500 mt-0.5">No se contabiliza en el presupuesto compartido.</p>
        </div>
      </div>
      <input type="checkbox" className="hidden" {...register('isPrivate')} />

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-4 border-t border-[#E5E5E5]">
        <Button variant="secondary" type="button" onClick={onCancel}>Cancelar</Button>
        <Button type="submit">Guardar Ingreso</Button>
      </div>
    </form>
  );
}
