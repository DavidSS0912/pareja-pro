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
      <form onSubmit={handleSubmit} className="space-y-5 p-1">
        {/* Resumen de la Tarjeta */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-indigo-100 text-indigo-700">
                <CreditCard size={20} />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-base leading-tight">
                  {targetAccount?.name || 'Tarjeta de Crédito'}
                </h3>
                <p className="text-xs text-slate-500">
                  Límite: {FormatCurrency(targetAccount?.creditLimit || 0)}
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs uppercase tracking-wider font-semibold text-slate-400 block">
                Deuda Actual
              </span>
              <span className="text-xl font-black text-rose-600 tabular-nums">
                {FormatCurrency(cardMetrics.currentDebt)}
              </span>
            </div>
          </div>

          {/* Aviso si no tiene deuda o saldo a favor */}
          {cardMetrics.currentDebt <= 0 ? (
            <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200/60 rounded-xl p-2.5">
              <CheckCircle2 size={16} className="shrink-0" />
              <span>
                Esta tarjeta está al día. No tiene deuda pendiente
                {cardMetrics.positiveBalance > 0 && ` y cuenta con un saldo a favor de ${FormatCurrency(cardMetrics.positiveBalance)}`}.
              </span>
            </div>
          ) : (
            <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-xs text-slate-500">
              <span>Crédito disponible: {FormatCurrency(cardMetrics.creditAvailable)}</span>
              <button
                type="button"
                onClick={handlePayFullDebt}
                className="font-bold text-indigo-600 hover:text-indigo-800 transition-colors inline-flex items-center gap-1 hover:underline cursor-pointer"
              >
                Liquidar total ({FormatCurrency(cardMetrics.currentDebt)})
              </button>
            </div>
          )}
        </div>

        {/* Cuenta Origen ("Pagar desde") */}
        <div>
          <label htmlFor="source-account-select" className="block text-sm font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
            <Wallet size={16} className="text-slate-500" />
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
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 font-medium text-slate-800 text-sm"
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
          <label htmlFor="payment-amount" className="block text-sm font-bold text-slate-700 mb-1.5">
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
              className={`w-full pl-8 pr-4 py-2.5 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-indigo-500 font-semibold text-slate-900 text-base ${
                exceedsSourceBalance ? 'border-red-400 focus:ring-red-400' : 'border-slate-200'
              }`}
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
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{submitError}</span>
          </div>
        )}

        {/* Botones de acción */}
        <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting} type="button">
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={!canSubmit}
            className="flex items-center gap-2"
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
