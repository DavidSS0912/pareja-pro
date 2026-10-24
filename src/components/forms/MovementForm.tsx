import React, { useState } from 'react';
import {
  MovementAction,
  buildMovementAction,
  validateMovement,
  getTodayLocalISO,
} from '../../services/movementService';
import { Button } from '../ui/Button';
import { ArrowLeftRight, ArrowDownLeft, ArrowUpRight, AlertCircle } from 'lucide-react';

export interface MovementFormProps {
  categories?: Array<{ id: string; name: string; type?: string }>;
  accounts?: Array<{ id: string; name: string; type?: string }>;
  currentUserId?: string | null;
  appContext?: string;
  onSubmit: (action: MovementAction) => void | Promise<void>;
  onCancel: () => void;
}

const INPUT_CLASS =
  'w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors';

const LABEL_CLASS = 'block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5';

export function MovementForm({
  categories = [],
  accounts = [],
  currentUserId,
  appContext = 'household',
  onSubmit,
  onCancel,
}: MovementFormProps) {
  const [type, setType] = useState<'EXPENSE' | 'INCOME' | 'TRANSFER'>('EXPENSE');
  const [amount, setAmount] = useState<string>('');
  const [date, setDate] = useState<string>(() => getTodayLocalISO());
  const [categoryId, setCategoryId] = useState<string>('');
  const [sourceAccountId, setSourceAccountId] = useState<string>('');
  const [targetAccountId, setTargetAccountId] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleTypeChange = (newType: 'EXPENSE' | 'INCOME' | 'TRANSFER') => {
    setType(newType);
    setFormError(null);
    setCategoryId('');
    setSourceAccountId('');
    setTargetAccountId('');
  };

  // Filtrado de catálogos según la modalidad
  const expenseCategories = categories.filter((c) => c.type === 'EXPENSE' || !c.type);
  const incomeCategories = categories.filter((c) => c.type === 'INCOME');

  const assetOrBankAccounts = accounts.filter(
    (a) => a.type === 'ASSET' || a.type === 'BANK_ACCOUNT' || a.type === 'LIABILITY'
  );
  const depositAccounts = accounts.filter(
    (a) => a.type === 'ASSET' || a.type === 'BANK_ACCOUNT'
  );

  // Detección de estados vacíos
  const isAuthMissing = !currentUserId || currentUserId.trim() === '';
  const isExpenseBlocked =
    type === 'EXPENSE' && (expenseCategories.length === 0 || assetOrBankAccounts.length === 0);
  const isIncomeBlocked =
    type === 'INCOME' && (incomeCategories.length === 0 || depositAccounts.length === 0);
  const isTransferBlocked =
    type === 'TRANSFER' && assetOrBankAccounts.length < 2;

  const isFormBlocked = isAuthMissing || isExpenseBlocked || isIncomeBlocked || isTransferBlocked;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const activeCatList = type === 'EXPENSE' ? expenseCategories : incomeCategories;
    const selectedCategory = activeCatList.find((c) => c.id === categoryId);

    const validationInput = {
      type,
      amount,
      date,
      currentUserId: currentUserId || undefined,
      appContext,
      categoryId: type !== 'TRANSFER' ? categoryId : undefined,
      categoryName: selectedCategory?.name,
      sourceAccountId: type === 'EXPENSE' || type === 'TRANSFER' ? sourceAccountId : undefined,
      targetAccountId: type === 'INCOME' || type === 'TRANSFER' ? targetAccountId : undefined,
      note,
    };

    const validation = validateMovement(validationInput);
    if (!validation.valid) {
      setFormError(validation.error || 'Por favor verifica los campos');
      return;
    }

    try {
      setIsSubmitting(true);
      const action = buildMovementAction(validationInput);
      await onSubmit(action);
    } catch (err: any) {
      setFormError(err?.message || 'Error al procesar el movimiento');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Selector de modalidad (Gasto, Ingreso, Transferencia) */}
      <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-xl">
        <button
          type="button"
          onClick={() => handleTypeChange('EXPENSE')}
          className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            type === 'EXPENSE'
              ? 'bg-white text-secondary shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <ArrowDownLeft size={14} /> Gasto
        </button>
        <button
          type="button"
          onClick={() => handleTypeChange('INCOME')}
          className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            type === 'INCOME'
              ? 'bg-white text-primary shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <ArrowUpRight size={14} /> Ingreso
        </button>
        <button
          type="button"
          onClick={() => handleTypeChange('TRANSFER')}
          className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            type === 'TRANSFER'
              ? 'bg-white text-indigo-600 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <ArrowLeftRight size={14} /> Transferir
        </button>
      </div>

      {/* Alertas de bloqueo por estado vacío o falta de sesión */}
      {isAuthMissing && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2 text-amber-800 text-xs">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <span>No hay sesión de usuario activa. Inicia sesión para registrar movimientos.</span>
        </div>
      )}

      {isExpenseBlocked && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2 text-amber-800 text-xs">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <span>
            {expenseCategories.length === 0
              ? 'No hay categorías de gastos configuradas en el hogar.'
              : 'No hay cuentas disponibles para pagar el gasto.'}
          </span>
        </div>
      )}

      {isIncomeBlocked && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2 text-amber-800 text-xs">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <span>
            {incomeCategories.length === 0
              ? 'No hay categorías de ingreso configuradas en el hogar.'
              : 'No hay cuentas destino disponibles para recibir el ingreso.'}
          </span>
        </div>
      )}

      {isTransferBlocked && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2 text-amber-800 text-xs">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <span>Se necesitan al menos 2 cuentas para realizar una transferencia interna.</span>
        </div>
      )}

      {/* Monto y Fecha */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label htmlFor="mov-amount" className={LABEL_CLASS}>
            Monto ($)
          </label>
          <input
            id="mov-amount"
            type="number"
            step="0.01"
            min="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className={INPUT_CLASS}
            required
            disabled={isFormBlocked}
          />
        </div>

        <div>
          <label htmlFor="mov-date" className={LABEL_CLASS}>
            Fecha
          </label>
          <input
            id="mov-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={INPUT_CLASS}
            required
            disabled={isFormBlocked}
          />
        </div>
      </div>

      {/* Campos para Gasto */}
      {type === 'EXPENSE' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label htmlFor="mov-cat-exp" className={LABEL_CLASS}>
              Categoría
            </label>
            <select
              id="mov-cat-exp"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className={INPUT_CLASS}
              required
              disabled={isFormBlocked}
            >
              <option value="">Selecciona categoría</option>
              {expenseCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="mov-source-exp" className={LABEL_CLASS}>
              Pagado con
            </label>
            <select
              id="mov-source-exp"
              value={sourceAccountId}
              onChange={(e) => setSourceAccountId(e.target.value)}
              className={INPUT_CLASS}
              required
              disabled={isFormBlocked}
            >
              <option value="">Selecciona cuenta</option>
              {assetOrBankAccounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Campos para Ingreso */}
      {type === 'INCOME' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label htmlFor="mov-cat-inc" className={LABEL_CLASS}>
              Categoría
            </label>
            <select
              id="mov-cat-inc"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className={INPUT_CLASS}
              required
              disabled={isFormBlocked}
            >
              <option value="">Selecciona categoría</option>
              {incomeCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="mov-target-inc" className={LABEL_CLASS}>
              Entra a
            </label>
            <select
              id="mov-target-inc"
              value={targetAccountId}
              onChange={(e) => setTargetAccountId(e.target.value)}
              className={INPUT_CLASS}
              required
              disabled={isFormBlocked}
            >
              <option value="">Selecciona cuenta destino</option>
              {depositAccounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Campos para Transferencia */}
      {type === 'TRANSFER' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label htmlFor="mov-source-trans" className={LABEL_CLASS}>
              De cuenta (Origen)
            </label>
            <select
              id="mov-source-trans"
              value={sourceAccountId}
              onChange={(e) => setSourceAccountId(e.target.value)}
              className={INPUT_CLASS}
              required
              disabled={isFormBlocked}
            >
              <option value="">Selecciona cuenta origen</option>
              {assetOrBankAccounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="mov-target-trans" className={LABEL_CLASS}>
              A cuenta (Destino)
            </label>
            <select
              id="mov-target-trans"
              value={targetAccountId}
              onChange={(e) => setTargetAccountId(e.target.value)}
              className={INPUT_CLASS}
              required
              disabled={isFormBlocked}
            >
              <option value="">Selecciona cuenta destino</option>
              {assetOrBankAccounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Nota opcional */}
      <div>
        <label htmlFor="mov-note" className={LABEL_CLASS}>
          Nota o detalle (opcional)
        </label>
        <input
          id="mov-note"
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder={
            type === 'EXPENSE'
              ? 'Ej. Supermercado, Almuerzo...'
              : type === 'INCOME'
              ? 'Ej. Sueldo quincenal, Bono...'
              : 'Ej. Traspaso a ahorro...'
          }
          className={INPUT_CLASS}
          disabled={isFormBlocked}
        />
      </div>

      {/* Error de validación o envío */}
      {formError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-xs">
          {formError}
        </div>
      )}

      {/* Botones de acción */}
      <div className="flex gap-2 pt-2 justify-end">
        <Button variant="outline" type="button" onClick={onCancel}>
          Cancelar
        </Button>
        <Button
          variant="primary"
          type="submit"
          disabled={isFormBlocked || isSubmitting}
        >
          {isSubmitting ? 'Guardando...' : 'Guardar Movimiento'}
        </Button>
      </div>
    </form>
  );
}
