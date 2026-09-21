import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { DollarSign, Calendar, User, Tag, Lock } from 'lucide-react';

const INPUT_CLASS =
  'w-full px-3 py-2.5 bg-white border border-[#E5E5E5] rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors';

const LABEL_CLASS = 'block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5';

export function IncomeForm({ initialData, users, currentUserId, onSubmit, onCancel }: {
  initialData?: any;
  users: any[];
  currentUserId: string;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState(initialData || {
    userId: currentUserId || users[0]?.id || '',
    amount: '',
    type: 'Sueldo',
    currency: 'MXN',
    date: new Date().toISOString().split('T')[0],
    isPrivate: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ ...formData, amount: Number(formData.amount) });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* Row 1: Fecha + Aportador */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={LABEL_CLASS}>
            <span className="flex items-center gap-1.5">
              <Calendar size={11} />
              Fecha
            </span>
          </label>
          <input
            type="date"
            required
            className={INPUT_CLASS}
            value={formData.date}
            onChange={e => setFormData({ ...formData, date: e.target.value })}
          />
        </div>
        <div>
          <label className={LABEL_CLASS}>
            <span className="flex items-center gap-1.5">
              <User size={11} />
              Aportador
            </span>
          </label>
          <select
            className={INPUT_CLASS}
            value={formData.userId}
            onChange={e => setFormData({ ...formData, userId: e.target.value })}
          >
            {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
        </div>
      </div>

      {/* Row 2: Monto + Moneda */}
      <div>
        <label className={LABEL_CLASS}>
          <span className="flex items-center gap-1.5">
            <DollarSign size={11} />
            Monto
          </span>
        </label>
        <div className="flex gap-2">
          <input
            type="number"
            required
            min="0"
            step="0.01"
            className={`${INPUT_CLASS} flex-1 tabular-nums tracking-tight`}
            value={formData.amount}
            onChange={e => setFormData({ ...formData, amount: e.target.value })}
            placeholder="0.00"
          />
          <select
            className="px-3 py-2.5 bg-white border border-[#E5E5E5] rounded-lg text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
            value={formData.currency}
            onChange={e => setFormData({ ...formData, currency: e.target.value })}
          >
            <option value="MXN">MXN</option>
            <option value="USD">USD</option>
          </select>
        </div>
      </div>

      {/* Row 3: Tipo */}
      <div>
        <label className={LABEL_CLASS}>
          <span className="flex items-center gap-1.5">
            <Tag size={11} />
            Tipo de Ingreso
          </span>
        </label>
        <select
          className={INPUT_CLASS}
          value={formData.type}
          onChange={e => setFormData({ ...formData, type: e.target.value })}
        >
          <option value="Sueldo">Sueldo / Salario</option>
          <option value="Bono">Bono / Utilidades</option>
          <option value="Ventas">Ventas / Negocio</option>
          <option value="Inversiones">Retornos de Inversión</option>
          <option value="Otro">Otro Ingreso</option>
        </select>
      </div>

      {/* Row 4: Privado toggle */}
      <div className="flex items-start gap-3 p-3 rounded-lg border border-[#E5E5E5] bg-slate-50 cursor-pointer group"
           onClick={() => setFormData({ ...formData, isPrivate: !formData.isPrivate })}>
        <div className={`mt-0.5 w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
          formData.isPrivate
            ? 'bg-indigo-600 border-indigo-600'
            : 'bg-white border-slate-300 group-hover:border-indigo-400'
        }`}>
          {formData.isPrivate && (
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

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-4 border-t border-[#E5E5E5]">
        <Button variant="secondary" type="button" onClick={onCancel}>Cancelar</Button>
        <Button type="submit">Guardar Ingreso</Button>
      </div>
    </form>
  );
}
