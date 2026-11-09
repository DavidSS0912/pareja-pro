import React, { useState, useEffect, useMemo } from 'react';
import { Target, Wallet, ArrowRight, AlertCircle, Sparkles, CheckCircle2, ArrowDownUp } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { FormatCurrency } from '../../utils';
import {
  calculateProjectContribution,
  type ProjectContributionPlan
} from '../../utils/projectCalculations';
import { calculateAccountAvailableBalance } from '../../utils/walletCalculations';

export interface ProjectContributionModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: any;
  accounts: any[];
  activeProjects?: any[];
  onContribute: (plan: ProjectContributionPlan) => Promise<void> | void;
}

const INPUT_CLASS =
  'w-full rounded-xl border border-[#EEF0F4] bg-[#F5F6FA] focus:bg-white focus:border-[#111319] focus:ring-1 focus:ring-[#111319] text-slate-900 text-sm font-medium transition-colors px-3.5 py-2.5 placeholder:text-slate-400';

const LABEL_CLASS = 'block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5';

export function ProjectContributionModal({
  isOpen,
  onClose,
  project,
  accounts = [],
  activeProjects = [],
  onContribute
}: ProjectContributionModalProps) {
  // Cuentas de activo y efectivo
  const validAccounts = useMemo(() => {
    return (accounts || []).filter((acc) => {
      const type = String(acc?.type || '').toUpperCase();
      return type === 'ASSET' || type === 'BANK_ACCOUNT' || type === 'CASH' || type === 'DEBIT';
    });
  }, [accounts]);

  // Cuenta destino asignada al proyecto
  const targetAccount = useMemo(() => {
    if (!project) return null;
    return (
      validAccounts.find(
        (a) => a.id === project.targetAccountId || a.id === project.targetAccount || a.name === project.targetAccount
      ) || validAccounts[0] || null
    );
  }, [project, validAccounts]);

  const [selectedSourceId, setSelectedSourceId] = useState<string>('');
  const [amountInput, setAmountInput] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Inicializar o resetear estado al abrir
  useEffect(() => {
    if (isOpen) {
      // Preseleccionar la cuenta destino del proyecto como origen si está disponible
      if (targetAccount) {
        setSelectedSourceId(targetAccount.id);
      } else if (validAccounts.length > 0) {
        setSelectedSourceId(validAccounts[0].id);
      } else {
        setSelectedSourceId('');
      }
      setAmountInput('');
      setNotes('');
      setErrorMessage(null);
    }
  }, [isOpen, targetAccount, validAccounts]);

  // Cuenta origen seleccionada
  const selectedSourceAccount = useMemo(() => {
    return validAccounts.find((a) => a.id === selectedSourceId);
  }, [validAccounts, selectedSourceId]);

  const isInternalPiggyBank = selectedSourceAccount?.id === targetAccount?.id;

  // Cálculo del saldo disponible real en la cuenta origen
  const sourceAvailableBalance = useMemo(() => {
    if (!selectedSourceAccount) return 0;
    const metrics = calculateAccountAvailableBalance(selectedSourceAccount, activeProjects);
    return metrics.availableBalance;
  }, [selectedSourceAccount, activeProjects]);

  const numericAmount = parseFloat(amountInput) || 0;
  const currentSaved = Number(project?.savedAmount ?? project?.currentAmount ?? 0);
  const targetAmount = Number(project?.targetAmount || 0);
  const remainingNeeded = Math.max(0, targetAmount - currentSaved);
  const willReachGoal = targetAmount > 0 && currentSaved + numericAmount >= targetAmount;

  // Validación
  const exceedsBalance = numericAmount > sourceAvailableBalance;
  const isAmountValid = numericAmount > 0 && !exceedsBalance;
  const canSubmit = !isSubmitting && !!selectedSourceAccount && !!targetAccount && isAmountValid;

  // Acción rápida: completar meta
  const handleSetRemainingNeeded = () => {
    if (remainingNeeded > 0) {
      setAmountInput(Math.min(remainingNeeded, sourceAvailableBalance).toString());
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!canSubmit || !selectedSourceAccount || !targetAccount || !project) return;

    const plan = calculateProjectContribution({
      project,
      sourceAccount: selectedSourceAccount,
      targetAccount,
      amount: numericAmount,
      activeProjectsInTargetAccount: activeProjects,
      notes: notes.trim() || undefined
    });

    if (!plan.isValid) {
      setErrorMessage(plan.error || 'Aportación no válida');
      return;
    }

    try {
      setIsSubmitting(true);
      await onContribute(plan);
      onClose();
    } catch (err: any) {
      setErrorMessage(err?.message || 'Error al procesar la aportación');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Aportar a Meta de Ahorro">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Resumen del Proyecto */}
        <div className="bg-[#F8FAFC] border border-[#EEF0F4] rounded-2xl p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-xl bg-[#EEF2FF] text-[#6366F1]">
                <Target size={20} />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-base leading-tight">
                  {project?.name || 'Proyecto de Ahorro'}
                </h3>
                <p className="text-xs text-slate-500 tabular-nums">
                  Meta: {FormatCurrency(targetAmount)} • Ahorrado: {FormatCurrency(currentSaved)}
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs uppercase tracking-wider font-semibold text-slate-400 block">
                Faltante
              </span>
              <span className="text-sm font-bold text-slate-700 tabular-nums">
                {FormatCurrency(remainingNeeded)}
              </span>
            </div>
          </div>
        </div>

        {/* Cuenta Origen ("Aportar desde") */}
        <div>
          <label htmlFor="contribution-source-account" className={`${LABEL_CLASS} flex items-center gap-1.5`}>
            <Wallet size={14} className="text-slate-700" />
            Aportar desde (Cuenta Origen)
          </label>
          {validAccounts.length === 0 ? (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
              No tienes cuentas de activo registradas para realizar aportaciones.
            </div>
          ) : (
            <select
              id="contribution-source-account"
              value={selectedSourceId}
              onChange={(e) => setSelectedSourceId(e.target.value)}
              disabled={isSubmitting}
              className={`${INPUT_CLASS} tabular-nums`}
            >
              {validAccounts.map((acc) => {
                const bal = calculateAccountAvailableBalance(acc, activeProjects).availableBalance;
                return (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} — Disponible: {FormatCurrency(bal)}
                  </option>
                );
              })}
            </select>
          )}
        </div>

        {/* Indicador Visual Dinámico: Apartado Interno vs Transferencia Externa */}
        <div className="transition-colors duration-200">
          {isInternalPiggyBank ? (
            <div className="p-3.5 rounded-2xl border border-[#A7F3D0] bg-[#E8F8F0] text-xs flex items-center gap-3">
              <div className="p-1.5 rounded-xl bg-white text-[#10B981] shadow-xs shrink-0">
                <Sparkles size={16} />
              </div>
              <div>
                <p className="font-bold text-[#065F46]">Apartado interno en la misma cuenta</p>
                <p className="text-[#047857] mt-0.5 leading-relaxed">
                  El dinero permanece en {targetAccount?.name}, reservándose como apartado contable protegido para esta meta.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-2xl border border-[#C7D2FE] bg-[#EEF2FF] text-xs flex items-center gap-3">
              <div className="p-1.5 rounded-xl bg-white text-[#6366F1] shadow-xs shrink-0">
                <ArrowDownUp size={16} />
              </div>
              <div>
                <p className="font-bold text-[#4338CA]">Transferencia bancaria entre cuentas</p>
                <p className="text-[#4F46E5] mt-0.5 leading-relaxed">
                  Se registrará una transferencia de {selectedSourceAccount?.name} hacia {targetAccount?.name}.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Monto de la Aportación */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label htmlFor="contribution-amount" className={LABEL_CLASS}>
              Monto a Aportar ($)
            </label>
            {remainingNeeded > 0 && sourceAvailableBalance > 0 && (
              <button
                type="button"
                onClick={handleSetRemainingNeeded}
                className="text-xs font-semibold text-[#111319] hover:text-slate-600 underline cursor-pointer tabular-nums"
              >
                Completar meta ({FormatCurrency(Math.min(remainingNeeded, sourceAvailableBalance))})
              </button>
            )}
          </div>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
            <input
              id="contribution-amount"
              type="number"
              step="any"
              min="0.01"
              value={amountInput}
              onChange={(e) => setAmountInput(e.target.value)}
              placeholder="0.00"
              disabled={isSubmitting || validAccounts.length === 0}
              className={`w-full pl-8 pr-4 py-2.5 rounded-xl border ${
                exceedsBalance ? 'border-red-400 focus:ring-red-400' : 'border-[#EEF0F4]'
              } bg-[#F5F6FA] focus:bg-white focus:border-[#111319] focus:ring-1 focus:ring-[#111319] text-slate-900 text-base font-semibold transition-colors placeholder:text-slate-400 tabular-nums`}
            />
          </div>

          {exceedsBalance && (
            <p className="flex items-center gap-1.5 text-red-500 text-xs mt-1.5 font-medium">
              <AlertCircle size={14} className="shrink-0" />
              El monto excede el saldo disponible de la cuenta seleccionada ({FormatCurrency(sourceAvailableBalance)}).
            </p>
          )}

          {!exceedsBalance && willReachGoal && (
            <p className="flex items-center gap-1.5 text-[#065F46] bg-[#E8F8F0] border border-[#A7F3D0] p-2.5 rounded-xl text-xs mt-2 font-medium">
              <CheckCircle2 size={14} className="shrink-0 text-[#10B981]" />
              ¡Esta aportación completará o superará la meta de ahorro establecida! 🎉
            </p>
          )}
        </div>

        {/* Notas Opcionales */}
        <div>
          <label htmlFor="contribution-notes" className={LABEL_CLASS}>
            Nota / Concepto (Opcional)
          </label>
          <input
            id="contribution-notes"
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Ej. Ahorro quincenal, Bono navideño"
            className={INPUT_CLASS}
          />
        </div>

        {/* Error */}
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
            onClick={onClose}
            disabled={isSubmitting}
            type="button"
            className="!bg-white !border !border-[#EEF0F4] hover:!bg-slate-50 !text-slate-700 !rounded-full px-5 py-2.5 font-medium transition-colors cursor-pointer shadow-none"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={!canSubmit}
            className="!bg-[#111319] hover:!bg-[#1A1D26] !text-white !rounded-full px-6 py-2.5 font-medium transition-colors duration-150 shadow-sm cursor-pointer disabled:opacity-50 flex items-center gap-2"
          >
            {isSubmitting ? (
              'Guardando...'
            ) : (
              <>
                <span>Confirmar Aportación</span>
                <ArrowRight size={16} />
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
