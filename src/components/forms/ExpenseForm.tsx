import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../ui/Button';
import { DollarSign, Calendar, User, Tag, Lock, List, CreditCard } from 'lucide-react';

const INPUT_CLASS =
  'w-full px-3 py-2.5 bg-white border border-slate-100 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors';

const LABEL_CLASS = 'block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5';

const expenseSchema = z.object({
  desc: z.string().min(1, 'La descripción es obligatoria'),
  amount: z.number().min(0.01, 'El monto debe ser mayor a 0'),
  paidBy: z.string().min(1, 'El aportador es obligatorio'),
  splitType: z.enum(['50/50', 'proporcional', 'individual']).optional(),
  isMsi: z.boolean().optional(),
  msiCount: z.number().optional(),
  isRecurring: z.boolean().optional(),
  recurringFrequency: z.enum(['SEMANAL', 'QUINCENAL', 'MENSUAL', 'ANUAL']).optional(),
  recurringEndDate: z.string().optional(),
  currency: z.enum(['MXN', 'USD']),
  categoryId: z.string().optional(),
  date: z.string().min(1, 'La fecha es obligatoria'),
  isPrivate: z.boolean(),
  sourceAccountId: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

type ExpenseFormData = z.infer<typeof expenseSchema>;

export function ExpenseForm({ initialData, users, categories = [], accounts = [], tags = [], currentUserId, onSubmit, onCancel, appContext = 'household' }: any) {
  const expenseCategories = categories.filter((c: any) => c.type === 'EXPENSE');
  const assetAccounts = accounts.filter((a: any) => a.type === 'ASSET' || a.type === 'BANK_ACCOUNT' || a.type === 'LIABILITY');

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: initialData || {
      desc: '',
      amount: 0,
      paidBy: initialData?.paidBy || (users?.some((u: any) => u.id === currentUserId) ? currentUserId : users?.[0]?.id) || '',
      splitType: '50/50',
      isMsi: false,
      msiCount: 3,
      isRecurring: false,
      recurringFrequency: 'MENSUAL',
      recurringEndDate: '',
      currency: 'MXN',
      categoryId: '',
      date: new Date().toISOString().split('T')[0],
      isPrivate: appContext === 'personal',
      sourceAccountId: assetAccounts.length > 0 ? assetAccounts[0].id : '',
      tags: [],
    },
  });

  const isShared = !watch('isPrivate');
  const splitType = watch('splitType');
  const isMsi = watch('isMsi');
  const isRecurring = watch('isRecurring');
  const selectedTags = watch('tags') || [];

  const toggleTag = (tagId: string) => {
    if (selectedTags.includes(tagId)) {
      setValue('tags', selectedTags.filter(id => id !== tagId));
    } else {
      setValue('tags', [...selectedTags, tagId]);
    }
  };

  const onFormSubmit = (data: ExpenseFormData) => {
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-5">
      {/* Row 1: Fecha + Aportador */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="expense-date" className={LABEL_CLASS}>
            <span className="flex items-center gap-1.5">
              <Calendar size={11} />
              Fecha
            </span>
          </label>
          <input
            id="expense-date"
            type="date"
            className={INPUT_CLASS}
            aria-invalid={!!errors.date}
            aria-describedby={errors.date ? "expense-date-error" : undefined}
            {...register('date')}
          />
          {errors.date && <p id="expense-date-error" className="text-red-500 text-xs mt-1">{errors.date.message}</p>}
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
                  aria-invalid={!!errors.paidBy}
                  aria-describedby={errors.paidBy ? "expense-paidBy-error" : undefined}
                  {...register('paidBy')}
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
          {errors.paidBy && <p id="expense-paidBy-error" className="text-red-500 text-xs mt-2">{errors.paidBy.message}</p>}
        </div>
      </div>

      {/* Descripción */}
      <div>
        <label htmlFor="expense-desc" className={LABEL_CLASS}>
          Descripción
        </label>
        <input 
          id="expense-desc"
          type="text"
          className={INPUT_CLASS}
          placeholder="Ej. Walmart Quincena"
          aria-invalid={!!errors.desc}
          aria-describedby={errors.desc ? "expense-desc-error" : undefined}
          {...register('desc')}
        />
        {errors.desc && <p id="expense-desc-error" className="text-red-500 text-xs mt-1">{errors.desc.message}</p>}
      </div>
      
      {/* Monto + Moneda */}
      <div>
        <label htmlFor="expense-amount" className={LABEL_CLASS}>
          <span className="flex items-center gap-1.5">
            <DollarSign size={11} />
            Monto
          </span>
        </label>
        <div className="flex gap-2">
          <input
            id="expense-amount"
            type="number"
            step="0.01"
            className={`${INPUT_CLASS} flex-1 tabular-nums tracking-tight`}
            placeholder="0.00"
            aria-invalid={!!errors.amount}
            aria-describedby={errors.amount ? "expense-amount-error" : undefined}
            {...register('amount', { valueAsNumber: true })}
          />
          <select
            id="expense-currency"
            aria-label="Moneda"
            className="px-3 py-2.5 bg-white border border-slate-100 rounded-lg text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
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

      {/* Row: Categoría + Origen */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="expense-categoryId" className={LABEL_CLASS}>
            <span className="flex items-center gap-1.5">
              <Tag size={11} />
              Categoría
            </span>
          </label>
          <select
            id="expense-categoryId"
            className={INPUT_CLASS}
            aria-invalid={!!errors.categoryId}
            aria-describedby={errors.categoryId ? "expense-categoryId-error" : undefined}
            {...register('categoryId')}
          >
            <option value="">Ninguna</option>
            {expenseCategories.map((c: any) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          {errors.categoryId && <p id="expense-categoryId-error" className="text-red-500 text-xs mt-1">{errors.categoryId.message}</p>}
        </div>
        
        <div>
          <label htmlFor="expense-sourceAccountId" className={LABEL_CLASS}>
            <span className="flex items-center gap-1.5">
              <CreditCard size={11} />
              Origen de Fondos
            </span>
          </label>
          <select
            id="expense-sourceAccountId"
            className={INPUT_CLASS}
            {...register("sourceAccountId")}
          >
            <option value="">Selecciona (opcional)</option>
            {assetAccounts.map((a: any) => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Row: Etiquetas (Tags) */}
      <div>
        <label className={LABEL_CLASS}>
          <span className="flex items-center gap-1.5">
            <Tag size={11} />
            Etiquetas Transversales
          </span>
        </label>
        <div className="flex flex-wrap gap-2 mt-2">
          {tags.map((t: any) => (
            <button
              key={t.id}
              type="button"
              onClick={() => toggleTag(t.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${selectedTags.includes(t.id) ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              {t.name}
            </button>
          ))}
          {tags.length === 0 && <span className="text-xs text-slate-400">No hay etiquetas creadas.</span>}
        </div>
      </div>

      {isShared && (
        <div className="w-full">
          <div>
            <label htmlFor="expense-splitType" className={LABEL_CLASS}>
              <span className="flex items-center gap-1.5">
                <List size={11} />
                División
              </span>
            </label>
            <select
              id="expense-splitType"
              className={INPUT_CLASS}
              aria-invalid={!!errors.splitType}
              aria-describedby={errors.splitType ? "expense-splitType-error" : undefined}
              {...register('splitType')}
            >
              <option value="50/50">Mitades (50/50)</option>
              <option value="proporcional">Proporcional (Ingresos)</option>
              <option value="individual">Individual (100% pagador)</option>
            </select>
            {errors.splitType && <p id="expense-splitType-error" className="text-red-500 text-xs mt-1">{errors.splitType.message}</p>}
          </div>
        </div>
      )}

      {isShared && (
        <div className="space-y-4">
          <div>
            <label className="flex items-center gap-2 cursor-pointer group">
              <input 
                type="checkbox"
                className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 cursor-pointer"
                {...register('isRecurring')}
              />
              <span className="text-sm font-semibold text-slate-700 group-hover:text-indigo-600 transition-colors">¿Es Gasto Recurrente?</span>
            </label>
          </div>

          {isRecurring && !isMsi && (
            <div className="grid grid-cols-2 gap-4 w-full">
              <div>
                <label htmlFor="expense-recurringFrequency" className={LABEL_CLASS}>
                  <span className="flex items-center gap-1.5">
                    <Calendar size={11} />
                    Frecuencia
                  </span>
                </label>
                <select
                  id="expense-recurringFrequency"
                  className={INPUT_CLASS}
                  {...register('recurringFrequency')}
                >
                  <option value="SEMANAL">Semanal</option>
                  <option value="QUINCENAL">Quincenal</option>
                  <option value="MENSUAL">Mensual</option>
                  <option value="ANUAL">Anual</option>
                </select>
              </div>
              <div>
                <label htmlFor="expense-recurringEndDate" className={LABEL_CLASS}>
                  <span className="flex items-center gap-1.5">
                    <Calendar size={11} />
                    Fecha Límite (Opcional)
                  </span>
                </label>
                <input
                  id="expense-recurringEndDate"
                  type="date"
                  className={INPUT_CLASS}
                  {...register('recurringEndDate')}
                />
              </div>
            </div>
          )}

          <div>
            <label className="flex items-center gap-2 cursor-pointer group">
              <input 
                type="checkbox"
                className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 cursor-pointer"
                {...register('isMsi')}
              />
              <span className="text-sm font-semibold text-slate-700 group-hover:text-indigo-600 transition-colors">¿Es a Meses Sin Intereses?</span>
            </label>
          </div>

          {isMsi && !isRecurring && (
            <div className="w-full sm:w-1/2">
              <label htmlFor="expense-msiCount" className={LABEL_CLASS}>
                <span className="flex items-center gap-1.5">
                  <Calendar size={11} />
                  Cantidad de Meses
                </span>
              </label>
              <input
                id="expense-msiCount"
                type="number"
                min="2"
                max="48"
                className={INPUT_CLASS}
                {...register('msiCount', { valueAsNumber: true })}
              />
            </div>
          )}
        </div>
      )}

      {/* Row: Privado toggle */}
      <label 
        htmlFor="expense-isPrivate"
        className="flex items-start gap-3 p-3 rounded-lg border border-slate-100 bg-slate-50 cursor-pointer group hover:bg-slate-100 transition-colors"
      >
        <div className="mt-0.5 flex items-center justify-center shrink-0">
          <input 
            type="checkbox" 
            id="expense-isPrivate"
            className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 cursor-pointer"
            aria-invalid={!!errors.isPrivate}
            aria-describedby={errors.isPrivate ? "expense-isPrivate-error" : undefined}
            {...register('isPrivate')} 
          />
        </div>
        <div>
          <p className="text-sm font-medium text-slate-900 flex items-center gap-1.5">
            <Lock size={12} className="text-slate-500" />
            Gasto Privado
          </p>
          <p className="text-xs text-slate-600 mt-0.5">No se contabiliza en el presupuesto compartido.</p>
        </div>
      </label>
      {errors.isPrivate && <p id="expense-isPrivate-error" className="text-red-500 text-xs mt-1">{errors.isPrivate.message}</p>}

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
        <Button variant="secondary" type="button" onClick={onCancel}>Cancelar</Button>
        <Button type="submit">Guardar Gasto</Button>
      </div>
    </form>
  );
}
