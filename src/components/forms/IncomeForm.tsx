import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../ui/Button';
import { DollarSign, Calendar, User, Tag, Lock } from 'lucide-react';

const INPUT_CLASS =
  'w-full px-3 py-2.5 bg-white border border-slate-100 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors';

const LABEL_CLASS = 'block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5';

const incomeSchema = z.object({
  userId: z.string().min(1, 'El aportador es obligatorio'),
  amount: z.number().min(0.01, 'El monto debe ser mayor a 0'),
  categoryId: z.string().optional(),
  incomeCategoryType: z.enum(['Ordinario', 'Extraordinario']),
  accountId: z.string().optional(),
  currency: z.enum(['MXN', 'USD']),
  date: z.string().min(1, 'La fecha es obligatoria'),
  source: z.string().optional(),
  isPrivate: z.boolean(),
});

type IncomeFormData = z.infer<typeof incomeSchema>;

export function IncomeForm({ initialData, users, categories = [], accounts = [], currentUserId, onSubmit, onCancel, appContext = 'household' }: {
  initialData?: any;
  users: any[];
  categories?: any[];
  accounts?: any[];
  currentUserId: string;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  appContext?: 'personal' | 'household';
}) {
  const assetAccounts = accounts.filter(a => a.type === 'ASSET' || a.type === 'BANK_ACCOUNT');
  const incomeCategories = categories.filter(c => c.type === 'INCOME');

  const { register, handleSubmit, formState: { errors } } = useForm<IncomeFormData>({
    resolver: zodResolver(incomeSchema),
    defaultValues: initialData || {
      userId: users?.some(u => u.id === currentUserId) ? currentUserId : (users?.[0]?.id || ''),
      amount: 0,
      categoryId: '',
      incomeCategoryType: 'Ordinario',
      accountId: assetAccounts.length > 0 ? assetAccounts[0].id : '',
      currency: 'MXN',
      date: new Date().toISOString().split('T')[0],
      isPrivate: appContext === 'personal',
    },
  });

  const onFormSubmit = (data: IncomeFormData) => {
    onSubmit({ ...data, isPrivate: appContext === 'personal' });
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
          <label className={LABEL_CLASS}>
            <span className="flex items-center gap-1.5">
              <User size={11} />
              Aportador
            </span>
          </label>
          <div className="flex gap-3 mt-2">
            {users.map((u: any) => (
              <label 
                key={u.id} 
                className="relative cursor-pointer group flex flex-col items-center gap-1.5"
                title={u.name}
              >
                <input
                  type="radio"
                  value={u.id}
                  className="peer sr-only"
                  aria-invalid={!!errors.userId}
                  aria-describedby={errors.userId ? "income-userId-error" : undefined}
                  {...register('userId')}
                />
                <div className={`w-10 h-10 rounded-full ${u.avatar || 'bg-slate-200'} flex items-center justify-center text-slate-700 font-bold transition-all peer-checked:ring-2 peer-checked:ring-indigo-600 peer-checked:ring-offset-2 hover:ring-2 hover:ring-indigo-300 hover:ring-offset-1`}>
                  {u.photoURL ? (
                    <>
                      <img 
                        src={u.photoURL} 
                        alt={u.name} 
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover rounded-full" 
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          if (e.currentTarget.nextElementSibling) {
                            e.currentTarget.nextElementSibling.classList.remove('hidden');
                          }
                        }}
                      />
                      <span className="hidden text-sm">{u.name?.[0]}</span>
                    </>
                  ) : (
                    <span className="text-sm">{u.name?.[0]}</span>
                  )}
                </div>
                <span className="text-[10px] font-medium text-slate-600 truncate max-w-[60px] text-center peer-checked:text-indigo-700 peer-checked:font-bold">
                  {u.name?.split(' ')[0]}
                </span>
              </label>
            ))}
          </div>
          {errors.userId && <p id="income-userId-error" className="text-red-500 text-xs mt-2">{errors.userId.message}</p>}
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
            id="income-currency"
            aria-label="Moneda"
            className="px-3 py-2.5 bg-white border border-slate-100 rounded-lg text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
            aria-invalid={!!errors.currency}
            aria-describedby={errors.currency ? "income-currency-error" : undefined}
            {...register('currency')}
          >
            <option value="MXN">MXN</option>
            <option value="USD">USD</option>
          </select>
        </div>
        {errors.amount && <p id="income-amount-error" className="text-red-500 text-xs mt-1">{errors.amount.message}</p>}
        {errors.currency && <p id="income-currency-error" className="text-red-500 text-xs mt-1">{errors.currency.message}</p>}
      </div>

      {/* Row 3: Categoria y Tipo */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="income-categoryId" className={LABEL_CLASS}>
            <span className="flex items-center gap-1.5">
              <Tag size={11} />
              Categoría
            </span>
          </label>
          <select
            id="income-categoryId"
            className={INPUT_CLASS}
            aria-invalid={!!errors.categoryId}
            aria-describedby={errors.categoryId ? "income-categoryId-error" : undefined}
            {...register('categoryId')}
          >
            <option value="">Ninguna</option>
            {incomeCategories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          {errors.categoryId && <p id="income-categoryId-error" className="text-red-500 text-xs mt-1">{errors.categoryId.message}</p>}
        </div>
        <div>
          <label htmlFor="income-incomeCategoryType" className={LABEL_CLASS}>
            <span className="flex items-center gap-1.5">
              Frecuencia
            </span>
          </label>
          <select
            id="income-incomeCategoryType"
            className={INPUT_CLASS}
            aria-invalid={!!errors.incomeCategoryType}
            aria-describedby={errors.incomeCategoryType ? "income-incomeCategoryType-error" : undefined}
            {...register('incomeCategoryType')}
          >
            <option value="Ordinario">Ordinario (Recurrente)</option>
            <option value="Extraordinario">Extraordinario (Único)</option>
          </select>
          {errors.incomeCategoryType && <p id="income-incomeCategoryType-error" className="text-red-500 text-xs mt-1">{errors.incomeCategoryType.message}</p>}
        </div>
      </div>

      {/* Row 3.5: Cuenta destino */}
      <div>
        <label htmlFor="income-accountId" className={LABEL_CLASS}>
          Cuenta de Destino
        </label>
        <select
          id="income-accountId"
          className={INPUT_CLASS}
          aria-invalid={!!errors.accountId}
          aria-describedby={errors.accountId ? "income-accountId-error" : undefined}
          {...register('accountId')}
        >
          {assetAccounts.map(a => (
            <option key={a.id} value={a.id}>{a.name}</option>
          ))}
          {assetAccounts.length === 0 && <option value="">Sin cuentas de banco</option>}
        </select>
        {errors.accountId && <p id="income-accountId-error" className="text-red-500 text-xs mt-1">{errors.accountId.message}</p>}
      </div>

      {/* Origen */}
      <div>
        <label htmlFor="income-source" className={LABEL_CLASS}>
          Origen / Fuente del Dinero
        </label>
        <input
          id="income-source"
          type="text"
          placeholder="Ej. Empresa SA de CV, Banco X..."
          className={INPUT_CLASS}
          {...register('source')}
        />
      </div>



      {/* Actions */}
      <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
        <Button variant="secondary" type="button" onClick={onCancel}>Cancelar</Button>
        <Button type="submit">Guardar Ingreso</Button>
      </div>
    </form>
  );
}
