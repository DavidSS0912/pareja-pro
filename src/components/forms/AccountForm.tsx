import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../ui/Button';

const accountSchema = z.object({
  name: z.string().min(1, 'Obligatorio'),
  type: z.enum(['ASSET', 'LIABILITY']),
  shared: z.boolean().optional(),
  allowPartnerTransfers: z.boolean().optional(),
  creditLimit: z.number().nullable().optional(),
  cutDay: z.number().min(1).max(31).nullable().optional(),
  paymentDay: z.number().min(1).max(31).nullable().optional(),
  color: z.string().nullable().optional(),
  initialBalance: z.number().optional()
});

export type AccountFormData = z.infer<typeof accountSchema>;

export interface AccountFormProps {
  initialData?: any;
  users?: any[];
  onSubmit: (data: any) => void;
  onCancel: () => void;
  appContext?: string;
}

const defaultValues: AccountFormData = {
  name: '',
  type: 'LIABILITY',
  shared: false,
  allowPartnerTransfers: false,
  creditLimit: 0,
  cutDay: 1,
  paymentDay: 1,
  color: 'bg-gradient-to-br from-slate-700 to-slate-900',
  initialBalance: 0
};

export function AccountForm({
  initialData,
  users: _users,
  onSubmit,
  onCancel,
  appContext = 'household'
}: AccountFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors }
  } = useForm<AccountFormData>({
    resolver: zodResolver(accountSchema),
    defaultValues: initialData ? { ...initialData, allowPartnerTransfers: Boolean(initialData.allowPartnerTransfers) } : defaultValues
  });

  useEffect(() => {
    if (initialData) {
      reset({
        ...initialData,
        allowPartnerTransfers: Boolean(initialData.allowPartnerTransfers)
      });
    } else {
      reset(defaultValues);
    }
  }, [initialData, reset]);

  const selectedType = watch('type');
  const isPersonalAccount = appContext === 'personal' || (initialData ? initialData.ownerType !== 'SHARED' : true);

  const onFormSubmit = (data: AccountFormData) => {
    const finalType = (initialData?.type || data.type) as 'ASSET' | 'LIABILITY';
    const isAsset = finalType === 'ASSET';

    const payload: any = {
      ...data,
      type: finalType,
      shared: appContext === 'household',
      allowPartnerTransfers: isPersonalAccount ? Boolean(data.allowPartnerTransfers) : false
    };

    // If it's an asset, ensure creditLimit and cutDay/paymentDay are null or 0
    if (isAsset) {
      payload.creditLimit = 0;
      payload.cutDay = undefined;
      payload.paymentDay = undefined;
    }

    if (!initialData) {
      const parsedBalance = typeof data.initialBalance === 'number' && !isNaN(data.initialBalance)
        ? data.initialBalance
        : (data.initialBalance !== undefined && data.initialBalance !== null && !isNaN(Number(data.initialBalance))
            ? Number(data.initialBalance)
            : 0);
      payload.initialBalance = parsedBalance;
    } else {
      delete payload.initialBalance;
    }

    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="account-name" className="block text-sm font-bold text-slate-700 mb-1">Nombre</label>
          <input 
            id="account-name"
            type="text" 
            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
            placeholder="Ej. Nu Clásica"
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? "account-name-error" : undefined}
            {...register('name')}
          />
          {errors.name && <p id="account-name-error" className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
        </div>
        <div>
          <label htmlFor="account-type" className="block text-sm font-bold text-slate-700 mb-1">Tipo</label>
          <select 
            id="account-type"
            disabled={!!initialData}
            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 disabled:opacity-60"
            aria-invalid={!!errors.type}
            aria-describedby={errors.type ? "account-type-error" : undefined}
            {...register('type')}
          >
            <option value="ASSET">Débito / Efectivo</option>
            <option value="LIABILITY">Tarjeta de Crédito</option>
          </select>
          {errors.type && <p id="account-type-error" className="text-red-500 text-xs mt-1">{errors.type.message}</p>}
        </div>
      </div>

      {!initialData && (
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label htmlFor="account-initialBalance" className="block text-sm font-bold text-slate-700 mb-1">
              {selectedType === 'ASSET' ? 'Saldo Inicial ($)' : 'Deuda Inicial ($)'}
            </label>
            <input 
              id="account-initialBalance"
              type="number"
              step="any"
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
              placeholder="0"
              aria-invalid={!!errors.initialBalance}
              aria-describedby={errors.initialBalance ? "account-initialBalance-error" : undefined}
              {...register('initialBalance', { 
                valueAsNumber: true,
                setValueAs: (v) => (v === '' || v === null || (typeof v === 'number' && isNaN(v)) ? 0 : Number(v))
              })}
            />
            <p className="text-xs text-slate-500 mt-1">
              {selectedType === 'ASSET' 
                ? 'Saldo de apertura con el que arranca esta cuenta de débito/efectivo.'
                : 'Monto de deuda actual acumulada al día de hoy en la tarjeta.'}
            </p>
            {errors.initialBalance && <p id="account-initialBalance-error" className="text-red-500 text-xs mt-1">{errors.initialBalance.message}</p>}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        <div>
          <label htmlFor="account-color" className="block text-sm font-bold text-slate-700 mb-1">Color/Tema</label>
          <select 
            id="account-color"
            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
            aria-invalid={!!errors.color}
            aria-describedby={errors.color ? "account-color-error" : undefined}
            {...register('color')}
          >
            <option value="bg-gradient-to-br from-slate-700 to-slate-900">Negro (Clásica)</option>
            <option value="bg-gradient-to-br from-purple-600 to-purple-900">Morado (Nu)</option>
            <option value="bg-gradient-to-br from-blue-700 to-blue-900">Azul (BBVA/Banamex)</option>
            <option value="bg-gradient-to-br from-red-600 to-red-800">Rojo (Santander/Costco)</option>
            <option value="bg-gradient-to-br from-emerald-500 to-teal-700">Verde (Efectivo/Débito)</option>
            <option value="bg-gradient-to-br from-amber-500 to-yellow-700">Oro (Gold)</option>
            <option value="bg-gradient-to-br from-slate-300 to-slate-500">Plata (Silver)</option>
          </select>
          {errors.color && <p id="account-color-error" className="text-red-500 text-xs mt-1">{errors.color.message}</p>}
        </div>
      </div>

      {isPersonalAccount && (
        <div className="p-3.5 bg-indigo-50/70 border border-indigo-100 rounded-2xl">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              id="account-allowPartnerTransfers"
              data-testid="account-allowPartnerTransfers"
              className="mt-1 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
              {...register('allowPartnerTransfers')}
            />
            <div className="select-none">
              <span className="block text-sm font-bold text-slate-800">
                Permitir que mi pareja me transfiera a esta cuenta
              </span>
              <span className="block text-xs text-slate-500 mt-0.5 leading-relaxed">
                Destino Ciego: solo verá nombre y titular para enviarte fondos, sin revelar jamás tu saldo disponible ni movimientos.
              </span>
            </div>
          </label>
        </div>
      )}

      {selectedType === 'LIABILITY' && (
        <div className="grid grid-cols-3 gap-2 border-t border-slate-100 pt-4 mt-2">
          <div>
            <label htmlFor="account-limit" className="block text-sm font-bold text-slate-700 mb-1">Límite</label>
            <input 
              id="account-limit"
              type="number" 
              className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
              aria-invalid={!!errors.creditLimit}
              aria-describedby={errors.creditLimit ? "account-limit-error" : undefined}
              {...register('creditLimit', { valueAsNumber: true })}
            />
            {errors.creditLimit && <p id="account-limit-error" className="text-red-500 text-xs mt-1">{errors.creditLimit.message}</p>}
          </div>
          <div>
            <label htmlFor="account-cutDay" className="block text-sm font-bold text-slate-700 mb-1">Día Corte</label>
            <input 
              id="account-cutDay"
              type="number" 
              className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
              aria-invalid={!!errors.cutDay}
              aria-describedby={errors.cutDay ? "account-cutDay-error" : undefined}
              {...register('cutDay', { valueAsNumber: true })}
            />
            {errors.cutDay && <p id="account-cutDay-error" className="text-red-500 text-xs mt-1">{errors.cutDay.message}</p>}
          </div>
          <div>
            <label htmlFor="account-paymentDay" className="block text-sm font-bold text-slate-700 mb-1">Día Pago</label>
            <input 
              id="account-paymentDay"
              type="number" 
              className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
              aria-invalid={!!errors.paymentDay}
              aria-describedby={errors.paymentDay ? "account-paymentDay-error" : undefined}
              {...register('paymentDay', { valueAsNumber: true })}
            />
            {errors.paymentDay && <p id="account-paymentDay-error" className="text-red-500 text-xs mt-1">{errors.paymentDay.message}</p>}
          </div>
        </div>
      )}

      <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
        <Button variant="secondary" onClick={onCancel} type="button">Cancelar</Button>
        <Button type="submit">Guardar Cuenta</Button>
      </div>
    </form>
  );
}
