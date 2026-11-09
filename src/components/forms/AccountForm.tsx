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

const INPUT_CLASS =
  'w-full rounded-xl border border-[#EEF0F4] bg-[#F5F6FA] focus:bg-white focus:border-[#111319] focus:ring-1 focus:ring-[#111319] text-slate-900 text-sm font-medium transition-colors px-3.5 py-2.5 placeholder:text-slate-400';

const LABEL_CLASS = 'block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5';

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
    defaultValues: initialData
      ? {
          ...initialData,
          creditLimit: initialData.creditLimit ?? 0,
          cutDay: initialData.cutDay ?? 1,
          paymentDay: initialData.paymentDay ?? 1,
          color: initialData.color || defaultValues.color,
          allowPartnerTransfers: Boolean(initialData.allowPartnerTransfers)
        }
      : defaultValues
  });

  useEffect(() => {
    if (initialData) {
      reset({
        ...initialData,
        creditLimit: initialData.creditLimit ?? 0,
        cutDay: initialData.cutDay ?? 1,
        paymentDay: initialData.paymentDay ?? 1,
        color: initialData.color || defaultValues.color,
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
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="account-name" className={LABEL_CLASS}>Nombre</label>
          <input 
            id="account-name"
            type="text" 
            className={INPUT_CLASS}
            placeholder="Ej. Nu Clásica"
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? "account-name-error" : undefined}
            {...register('name')}
          />
          {errors.name && <p id="account-name-error" className="text-red-500 text-xs mt-1 font-medium">{errors.name.message}</p>}
        </div>
        <div>
          <label htmlFor="account-type" className={LABEL_CLASS}>Tipo</label>
          <select 
            id="account-type"
            disabled={!!initialData}
            className={`${INPUT_CLASS} disabled:opacity-60`}
            aria-invalid={!!errors.type}
            aria-describedby={errors.type ? "account-type-error" : undefined}
            {...register('type')}
          >
            <option value="ASSET">Débito / Efectivo</option>
            <option value="LIABILITY">Tarjeta de Crédito</option>
          </select>
          {errors.type && <p id="account-type-error" className="text-red-500 text-xs mt-1 font-medium">{errors.type.message}</p>}
        </div>
      </div>

      {!initialData && (
        <div className="grid grid-cols-1 gap-3">
          <div>
            <label htmlFor="account-initialBalance" className={LABEL_CLASS}>
              {selectedType === 'ASSET' ? 'Saldo Inicial ($)' : 'Deuda Inicial ($)'}
            </label>
            <input 
              id="account-initialBalance"
              type="number"
              step="any"
              className={`${INPUT_CLASS} tabular-nums`}
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
            {errors.initialBalance && <p id="account-initialBalance-error" className="text-red-500 text-xs mt-1 font-medium">{errors.initialBalance.message}</p>}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-3">
        <div>
          <label htmlFor="account-color" className={LABEL_CLASS}>Color/Tema</label>
          <select 
            id="account-color"
            className={INPUT_CLASS}
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
          {errors.color && <p id="account-color-error" className="text-red-500 text-xs mt-1 font-medium">{errors.color.message}</p>}
        </div>
      </div>

      {selectedType === 'LIABILITY' && (
        <div className="bg-[#F8FAFC] border border-[#EEF0F4] rounded-2xl p-4 sm:p-5 grid grid-cols-3 gap-3">
          <div>
            <label htmlFor="account-limit" className={LABEL_CLASS}>Límite</label>
            <input 
              id="account-limit"
              type="number" 
              className={`${INPUT_CLASS} tabular-nums`}
              aria-invalid={!!errors.creditLimit}
              aria-describedby={errors.creditLimit ? "account-limit-error" : undefined}
              {...register('creditLimit', { valueAsNumber: true })}
            />
            {errors.creditLimit && <p id="account-limit-error" className="text-red-500 text-xs mt-1 font-medium">{errors.creditLimit.message}</p>}
          </div>
          <div>
            <label htmlFor="account-cutDay" className={LABEL_CLASS}>Día Corte</label>
            <input 
              id="account-cutDay"
              type="number" 
              className={`${INPUT_CLASS} tabular-nums`}
              aria-invalid={!!errors.cutDay}
              aria-describedby={errors.cutDay ? "account-cutDay-error" : undefined}
              {...register('cutDay', { valueAsNumber: true })}
            />
            {errors.cutDay && <p id="account-cutDay-error" className="text-red-500 text-xs mt-1 font-medium">{errors.cutDay.message}</p>}
          </div>
          <div>
            <label htmlFor="account-paymentDay" className={LABEL_CLASS}>Día Pago</label>
            <input 
              id="account-paymentDay"
              type="number" 
              className={`${INPUT_CLASS} tabular-nums`}
              aria-invalid={!!errors.paymentDay}
              aria-describedby={errors.paymentDay ? "account-paymentDay-error" : undefined}
              {...register('paymentDay', { valueAsNumber: true })}
            />
            {errors.paymentDay && <p id="account-paymentDay-error" className="text-red-500 text-xs mt-1 font-medium">{errors.paymentDay.message}</p>}
          </div>
        </div>
      )}

      {isPersonalAccount && (
        <div className="p-4 sm:p-5 bg-[#EEF2FF] border border-[#C7D2FE] rounded-2xl">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              id="account-allowPartnerTransfers"
              data-testid="account-allowPartnerTransfers"
              className="mt-1 h-4 w-4 rounded border-[#C7D2FE] text-[#111319] focus:ring-[#111319] cursor-pointer"
              {...register('allowPartnerTransfers')}
            />
            <div className="select-none">
              <span className="block text-sm font-bold text-slate-800">
                Permitir que mi pareja me transfiera a esta cuenta
              </span>
              <span className="block text-xs text-slate-600 mt-0.5 leading-relaxed">
                Destino Ciego: solo verá nombre y titular para enviarte fondos, sin revelar jamás tu saldo disponible ni movimientos.
              </span>
            </div>
          </label>
        </div>
      )}

      <div className="flex justify-end gap-2.5 pt-3 border-t border-[#EEF0F4] items-center">
        <Button
          variant="secondary"
          onClick={onCancel}
          type="button"
          className="!bg-white !border !border-[#EEF0F4] hover:!bg-slate-50 !text-slate-700 !rounded-full px-5 py-2.5 font-medium transition-colors cursor-pointer shadow-none"
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          className="!bg-[#111319] hover:!bg-[#1A1D26] !text-white !rounded-full px-6 py-2.5 font-medium transition-colors duration-150 shadow-sm cursor-pointer"
        >
          Guardar Cuenta
        </Button>
      </div>
    </form>
  );
}
