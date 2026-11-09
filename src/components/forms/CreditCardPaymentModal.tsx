import React, { useState, useEffect, useMemo } from 'react';
import { CreditCard, Wallet, AlertCircle, AlertTriangle, CheckCircle2, ArrowRight } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { FormatCurrency } from '../../utils';
import { calculateCreditCardMetrics } from '../../utils/walletCalculations';

export interface CreditCardPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetAccount: any;
  sourceAccounts: any[];
  onPay: (sourceAccountId: string, targetAccountId: string, amount: number) => Promise<void> | void;
}

const INPUT_CLASS =
  'w-full rounded-xl border border-[#EEF0F4] bg-[#F5F6FA] focus:bg-white focus:border-[#111319] focus:ring-1 focus:ring-[#111319] text-slate-900 text-sm font-medium transition-colors px-3.5 py-2.5 placeholder:text-slate-400';

const LABEL_CLASS = 'block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5';

export function CreditCardPaymentModal({
  isOpen,
  onClose,
  targetAccount,
  sourceAccounts,
  onPay
}: CreditCardPaymentModalProps) {
  // Filtrar cuentas de débito y efectivo disponibles para pago
  const availableSources = useMemo(() => {
    return (sourceAccounts || []).filter(
      (a) => a && (a.type === 'ASSET' || a.type === 'BANK_ACCOUNT' || a.type === 'CASH')
    );
  }, [sourceAccounts]);

  // Métricas de la tarjeta de crédito seleccionada
  const cardMetrics = useMemo(() => {
    return calculateCreditCardMetrics(targetAccount);
  }, [targetAccount]);

  const [selectedSourceId, setSelectedSourceId] = useState<string>('');
  const [amountInput, setAmountInput] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Inicializar o resetear estado al abrir o cambiar de cuenta
  useEffect(() => {
    if (isOpen) {
      if (availableSources.length > 0) {
        setSelectedSourceId(availableSources[0].id);
      } else {
        setSelectedSourceId('');
      }
      setAmountInput('');
      setSubmitError(null);
    }
  }, [isOpen, targetAccount, availableSources]);

  // Cuenta origen actualmente seleccionada
  const selectedSourceAccount = useMemo(() => {
    return availableSources.find((a) => a.id === selectedSourceId);
  }, [availableSources, selectedSourceId]);

  const parsedAmount = parseFloat(amountInput) || 0;
  const sourceAvailableBalance = Number(selectedSourceAccount?.balance) || 0;

  // Validaciones
  const isAmountValid = parsedAmount > 0;
  const exceedsSourceBalance = parsedAmount > sourceAvailableBalance;
  const exceedsDebt = cardMetrics.currentDebt > 0 && parsedAmount > cardMetrics.currentDebt;
  const canSubmit =
    !isSubmitting &&
    availableSources.length > 0 &&
    !!selectedSourceId &&
    isAmountValid &&
    !exceedsSourceBalance;

  // Acción rápida: liquidar total
  const handlePayFullDebt = () => {
    if (cardMetrics.currentDebt > 0) {
      setAmountInput(cardMetrics.currentDebt.toString());
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || !targetAccount?.id) return;

    try {
      setIsSubmitting(true);
      setSubmitError(null);
      await onPay(selectedSourceId, targetAccount.id, parsedAmount);
      onClose();
    } catch (err: any) {
      setSubmitError(err?.message || 'Error al procesar el pago de la tarjeta.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Pagar Tarjeta de Crédito">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Resumen de la Tarjeta */}
        <div className="bg-[#F8FAFC] border border-[#EEF0F4] rounded-2xl p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-xl bg-[#EEF2FF] text-[#6366F1]">
                <CreditCard size={20} />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-base leading-tight">
                  {targetAccount?.name || 'Tarjeta de Crédito'}
                </h3>
                <p className="text-xs text-slate-500 tabular-nums">
                  Límite: {FormatCurrency(targetAccount?.creditLimit || 0)}
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs uppercase tracking-wider font-semibold text-slate-400 block">
                Deuda Actual
              </span>
              <span className="text-xl font-bold text-rose-600 tabular-nums">
                {FormatCurrency(cardMetrics.currentDebt)}
              </span>
            </div>
          </div>

          {/* Aviso si no tiene deuda o saldo a favor */}
          {cardMetrics.currentDebt <= 0 ? (
            <div className="flex items-center gap-2 text-xs text-[#065F46] bg-[#E8F8F0] border border-[#A7F3D0] rounded-xl p-3">
              <CheckCircle2 size={16} className="shrink-0 text-[#10B981]" />
              <span>
                Esta tarjeta está al día. No tiene deuda pendiente
                {cardMetrics.positiveBalance > 0 && ` y cuenta con un saldo a favor de ${FormatCurrency(cardMetrics.positiveBalance)}`}.
              </span>
            </div>
          ) : (
            <div className="flex items-center justify-between pt-2.5 border-t border-[#EEF0F4] text-xs text-slate-500">
              <span className="tabular-nums">Crédito disponible: {FormatCurrency(cardMetrics.creditAvailable)}</span>
              <button
                type="button"
                onClick={handlePayFullDebt}
                className="font-medium text-[#111319] hover:text-slate-600 transition-colors inline-flex items-center gap-1 underline cursor-pointer tabular-nums"
              >
                Liquidar total ({FormatCurrency(cardMetrics.currentDebt)})
              </button>
            </div>
          )}
        </div>

        {/* Cuenta Origen ("Pagar desde") */}
        <div>
          <label htmlFor="source-account-select" className={LABEL_CLASS}>
            Pagar desde (Cuenta de Retiro)
          </label>
          {availableSources.length === 0 ? (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center gap-2">
              <AlertTriangle size={16} className="shrink-0" />
              <span>No tienes cuentas de débito o efectivo registradas para fondear este pago.</span>
            </div>
          ) : (
            <select
              id="source-account-select"
              value={selectedSourceId}
              onChange={(e) => setSelectedSourceId(e.target.value)}
              className={`${INPUT_CLASS} tabular-nums`}
              disabled={isSubmitting}
            >
              {availableSources.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} — Disponible: {FormatCurrency(acc.balance || 0)}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Monto a Pagar */}
        <div>
          <label htmlFor="payment-amount" className={LABEL_CLASS}>
            Monto a Pagar ($)
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
            <input
              id="payment-amount"
              type="number"
              step="any"
              min="0.01"
              value={amountInput}
              onChange={(e) => setAmountInput(e.target.value)}
              placeholder="0.00"
              disabled={isSubmitting || availableSources.length === 0}
              className={`w-full pl-8 pr-4 py-2.5 rounded-xl border ${
                exceedsSourceBalance ? 'border-red-400 focus:ring-red-400' : 'border-[#EEF0F4]'
              } bg-[#F5F6FA] focus:bg-white focus:border-[#111319] focus:ring-1 focus:ring-[#111319] text-slate-900 text-base font-semibold transition-colors placeholder:text-slate-400 tabular-nums`}
            />
          </div>

          {/* Validaciones y advertencias */}
          {exceedsSourceBalance && (
            <p className="flex items-center gap-1.5 text-red-500 text-xs mt-1.5 font-medium">
              <AlertCircle size={14} className="shrink-0" />
              El monto excede el saldo disponible de la cuenta seleccionada ({FormatCurrency(sourceAvailableBalance)}).
            </p>
          )}

          {!exceedsSourceBalance && exceedsDebt && (
            <p className="flex items-center gap-1.5 text-amber-600 text-xs mt-1.5 font-medium">
              <AlertTriangle size={14} className="shrink-0" />
              El monto excede la deuda actual. Se generará un saldo a favor en la tarjeta.
            </p>
          )}
        </div>

        {/* Error en el envío */}
        {submitError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2 font-medium">
            <AlertCircle size={16} className="shrink-0" />
            <span>{submitError}</span>
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
              'Procesando...'
            ) : (
              <>
                <span>Pagar Tarjeta</span>
                <ArrowRight size={16} />
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
