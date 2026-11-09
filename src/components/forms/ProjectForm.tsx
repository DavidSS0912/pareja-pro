import React, { useState, useEffect, useMemo } from 'react';
import { Target, Wallet, AlertCircle, Sparkles } from 'lucide-react';
import { Button } from '../ui/Button';
import { FormatCurrency } from '../../utils';
import { validateProjectTargetAccount } from '../../utils/projectCalculations';
import { useAppStore } from '../../store/useAppStore';

export interface ProjectFormData {
  name: string;
  targetAmount: number;
  monthlyQuota: number;
  targetAccountId: string;
  targetAccount: string;
  priority: number;
}

export interface ProjectFormProps {
  initialData?: any;
  accounts?: any[];
  onSubmit: (data: ProjectFormData) => Promise<void> | void;
  onCancel: () => void;
}

const INPUT_CLASS =
  'w-full rounded-xl border border-[#EEF0F4] bg-[#F5F6FA] focus:bg-white focus:border-[#111319] focus:ring-1 focus:ring-[#111319] text-slate-900 text-sm font-medium transition-colors px-3.5 py-2.5 placeholder:text-slate-400';

const LABEL_CLASS = 'block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5';

export function ProjectForm({
  initialData,
  accounts = [],
  onSubmit,
  onCancel
}: ProjectFormProps) {
  // Filtrar exclusivamente cuentas reales de activo o efectivo (no tarjetas de crédito)
  const validAssetAccounts = useMemo(() => {
    return (accounts || []).filter((acc) => {
      const type = String(acc?.type || '').toUpperCase();
      return type === 'ASSET' || type === 'BANK_ACCOUNT' || type === 'CASH' || type === 'DEBIT';
    });
  }, [accounts]);

  const [name, setName] = useState(() => initialData?.name || '');
  const [targetAmount, setTargetAmount] = useState<number | ''>(() => (initialData?.targetAmount ?? ''));
  const [monthlyQuota, setMonthlyQuota] = useState<number | ''>(() => (initialData?.monthlyQuota ?? ''));
  const [targetAccountId, setTargetAccountId] = useState(() => {
    if (initialData) {
      const matched = validAssetAccounts.find(
        (a) => a.id === initialData.targetAccountId || a.name === initialData.targetAccount || a.id === initialData.targetAccount
      );
      if (matched) return matched.id;
    }
    return validAssetAccounts[0]?.id || '';
  });
  const [priority, setPriority] = useState<number>(() => (initialData?.priority ?? 1));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Inicializar o resetear datos al abrir o cambiar de proyecto
  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setTargetAmount(initialData.targetAmount ?? '');
      setMonthlyQuota(initialData.monthlyQuota ?? '');
      // Resolver cuenta por ID o por nombre existente
      const matchedAcc = validAssetAccounts.find(
        (a) => a.id === initialData.targetAccountId || a.name === initialData.targetAccount || a.id === initialData.targetAccount
      );
      setTargetAccountId(matchedAcc ? matchedAcc.id : validAssetAccounts[0]?.id || '');
      setPriority(initialData.priority ?? 1);
    } else {
      setName('');
      setTargetAmount('');
      setMonthlyQuota('');
      setTargetAccountId(validAssetAccounts[0]?.id || '');
      const existingProjects = (useAppStore.getState() as any).projects || [];
      const maxPriority = existingProjects.reduce((max: number, p: any) => Math.max(max, Number(p.priority) || 0), 0);
      setPriority(maxPriority + 1);
    }
    setErrorMessage(null);
  }, [initialData, validAssetAccounts]);

  const selectedAccount = useMemo(() => {
    return validAssetAccounts.find((a) => a.id === targetAccountId);
  }, [validAssetAccounts, targetAccountId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedName = name.trim();
    if (!trimmedName) {
      setErrorMessage('El nombre del proyecto es obligatorio');
      return;
    }

    const numTarget = Number(targetAmount);
    if (isNaN(numTarget) || numTarget <= 0) {
      setErrorMessage('El monto meta debe ser mayor a 0');
      return;
    }

    const numQuota = Number(monthlyQuota);
    if (isNaN(numQuota) || numQuota < 0) {
      setErrorMessage('La cuota mensual no puede ser negativa');
      return;
    }

    if (!selectedAccount) {
      setErrorMessage('Debe seleccionar una cuenta bancaria de destino');
      return;
    }

    const validation = validateProjectTargetAccount(selectedAccount);
    if (!validation.isValid) {
      setErrorMessage(validation.error || 'Cuenta destino inválida');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit({
        name: trimmedName,
        targetAmount: numTarget,
        monthlyQuota: numQuota,
        targetAccountId: selectedAccount.id,
        targetAccount: selectedAccount.name || selectedAccount.id,
        priority: Number(priority) || 1
      });
    } catch (err: any) {
      setErrorMessage(err?.message || 'Error al guardar el proyecto');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Nombre */}
      <div>
        <label htmlFor="project-name" className={`${LABEL_CLASS} flex items-center gap-1.5`}>
          <Target size={14} className="text-slate-700" />
          Nombre del Proyecto o Meta
        </label>
        <input
          id="project-name"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ej. Vacaciones Europa, Enganche Casa, Fondo Emergencia"
          className={INPUT_CLASS}
        />
      </div>

      {/* Montos */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="project-targetAmount" className={LABEL_CLASS}>
            Monto Meta ($)
          </label>
          <input
            id="project-targetAmount"
            type="number"
            step="0.01"
            min="1"
            required
            value={targetAmount}
            onChange={(e) => setTargetAmount(e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="50000"
            className={`${INPUT_CLASS} tabular-nums`}
          />
        </div>
        <div>
          <label htmlFor="project-monthlyQuota" className={LABEL_CLASS}>
            Cuota Mensual ($)
          </label>
          <input
            id="project-monthlyQuota"
            type="number"
            step="0.01"
            min="0"
            value={monthlyQuota}
            onChange={(e) => setMonthlyQuota(e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="3000"
            className={`${INPUT_CLASS} tabular-nums`}
          />
        </div>
      </div>

      {/* Cuenta Destino Vinculada */}
      <div>
        <label htmlFor="project-targetAccountId" className={`${LABEL_CLASS} flex items-center gap-1.5`}>
          <Wallet size={14} className="text-slate-700" />
          Cuenta Destino (Billetera / Banco)
        </label>
        {validAssetAccounts.length === 0 ? (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
            No tienes cuentas de débito o efectivo registradas. Ve a Billetera para agregar una cuenta primero.
          </div>
        ) : (
          <select
            id="project-targetAccountId"
            value={targetAccountId}
            onChange={(e) => setTargetAccountId(e.target.value)}
            className={`${INPUT_CLASS} tabular-nums`}
          >
            {validAssetAccounts.map((acc) => (
              <option key={acc.id} value={acc.id}>
                {acc.name} — Apartado / Cajita (Disponible: {FormatCurrency(acc.balance || 0)})
              </option>
            ))}
          </select>
        )}
        <p className="text-xs text-[#6366F1] bg-[#EEF2FF] border border-[#C7D2FE] p-2.5 rounded-xl mt-2 flex items-center gap-1.5 font-medium">
          <Sparkles size={13} className="text-[#6366F1] shrink-0" />
          Las aportaciones a esta meta se gestionarán como apartados protegidos dentro de esta cuenta.
        </p>
      </div>

      {/* Mensaje de error */}
      {errorMessage && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2 font-medium">
          <AlertCircle size={16} className="shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Botones de acción */}
      <div className="flex justify-end gap-2.5 pt-3 border-t border-[#EEF0F4] items-center">
        <Button
          variant="secondary"
          onClick={onCancel}
          disabled={isSubmitting}
          type="button"
          className="!bg-white !border !border-[#EEF0F4] hover:!bg-slate-50 !text-slate-700 !rounded-full px-5 py-2.5 font-medium transition-colors cursor-pointer shadow-none"
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting || validAssetAccounts.length === 0}
          className="!bg-[#111319] hover:!bg-[#1A1D26] !text-white !rounded-full px-6 py-2.5 font-medium transition-colors duration-150 shadow-sm cursor-pointer disabled:opacity-50"
        >
          {isSubmitting ? 'Guardando...' : initialData ? 'Guardar Cambios' : 'Crear Proyecto'}
        </Button>
      </div>
    </form>
  );
}
