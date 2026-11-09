import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { useToastStore, Toast, ToastType } from '../../store/useToastStore';

const TOAST_CONFIG: Record<ToastType, {
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
}> = {
  success: {
    icon: <CheckCircle size={18} />,
    iconBg: 'bg-[#E8F8F0]',
    iconColor: 'text-[#10B981]',
  },
  error: {
    icon: <XCircle size={18} />,
    iconBg: 'bg-[#FDEFEA]',
    iconColor: 'text-[#F97316]',
  },
  warning: {
    icon: <AlertTriangle size={18} />,
    iconBg: 'bg-[#FEF3C7]',
    iconColor: 'text-[#F59E0B]',
  },
  info: {
    icon: <Info size={18} />,
    iconBg: 'bg-[#EEF2FF]',
    iconColor: 'text-[#6366F1]',
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
        flex items-start gap-3 px-4 py-3 rounded-2xl border border-[#EEF0F4] shadow-bento bg-white
        min-w-[280px] max-w-[360px] text-sm font-medium
        transition-all duration-200 ease-out
        ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
      `}
    >
      <span className={`p-1 rounded-xl shrink-0 ${config.iconBg} ${config.iconColor}`}>
        {config.icon}
      </span>
      <span className="flex-1 leading-snug text-slate-800">
        {toast.message}
      </span>
      <button
        onClick={handleClose}
        className="shrink-0 text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-slate-50 mt-0.5"
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

