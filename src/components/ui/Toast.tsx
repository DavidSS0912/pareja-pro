import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { useToastStore, Toast, ToastType } from '../../store/useToastStore';

const TOAST_CONFIG: Record<ToastType, {
  icon: React.ReactNode;
  border: string;
  iconColor: string;
  textColor: string;
}> = {
  success: {
    icon: <CheckCircle size={18} />,
    border: 'border-green-200',
    iconColor: 'text-green-600',
    textColor: 'text-green-900',
  },
  error: {
    icon: <XCircle size={18} />,
    border: 'border-red-200',
    iconColor: 'text-red-600',
    textColor: 'text-red-900',
  },
  warning: {
    icon: <AlertTriangle size={18} />,
    border: 'border-amber-200',
    iconColor: 'text-amber-600',
    textColor: 'text-amber-900',
  },
  info: {
    icon: <Info size={18} />,
    border: 'border-indigo-200',
    iconColor: 'text-indigo-600',
    textColor: 'text-indigo-900',
  },
};

function ToastItem({ toast }: { toast: Toast }) {
  const { removeToast } = useToastStore();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Trigger enter animation on mount
    const frame = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  const config = TOAST_CONFIG[toast.type];

  const handleClose = () => {
    setVisible(false);
    setTimeout(() => removeToast(toast.id), 200);
  };

  return (
    <div
      className={`
        flex items-start gap-3 px-4 py-3 rounded-xl border shadow-lg bg-white
        min-w-[280px] max-w-[360px] text-sm font-medium
        transition-all duration-200 ease-out
        ${config.border}
        ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
      `}
    >
      <span className={`mt-0.5 shrink-0 ${config.iconColor}`}>
        {config.icon}
      </span>
      <span className={`flex-1 leading-snug ${config.textColor}`}>
        {toast.message}
      </span>
      <button
        onClick={handleClose}
        className="shrink-0 text-slate-400 hover:text-slate-700 transition-colors mt-0.5"
        aria-label="Cerrar notificación"
      >
        <X size={16} />
      </button>
    </div>
  );
}

export function ToastContainer() {
  const { toasts } = useToastStore();

  return (
    <div
      className="fixed bottom-4 right-4 z-[200] flex flex-col gap-2 pointer-events-none"
      aria-live="polite"
      aria-label="Notificaciones"
    >
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastItem toast={toast} />
        </div>
      ))}
    </div>
  );
}

// Convenience hook to use toast from any component
export { useToastStore as useToast };
