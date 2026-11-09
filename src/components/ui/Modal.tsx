import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

export function Modal({ isOpen, onClose, title, children }: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (isOpen && dialog && !dialog.open) {
      dialog.showModal();
    } else if (!isOpen && dialog && dialog.open) {
      dialog.close();
    }
  }, [isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const rect = dialog.getBoundingClientRect();
    const isInDialog = (
      rect.top <= e.clientY &&
      e.clientY <= rect.top + rect.height &&
      rect.left <= e.clientX &&
      e.clientX <= rect.left + rect.width
    );
    if (!isInDialog) onClose();
  };

  return (
    <dialog
      ref={dialogRef}
      onKeyDown={handleKeyDown}
      onClick={handleBackdropClick}
      className="p-0 m-auto bg-transparent backdrop:backdrop-blur-sm backdrop:bg-slate-900/40 rounded-3xl overflow-hidden animate-in fade-in duration-200 outline-none"
    >
      <div className="bg-white rounded-3xl border border-[#EEF0F4] shadow-2xl max-w-lg w-[90vw] md:w-[500px] flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center px-6 py-4 border-b border-[#EEF0F4] bg-white">
          <h2 className="text-lg font-bold tracking-tight text-slate-900">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-50 transition-colors"
            aria-label="Cerrar"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-6 overflow-y-auto">
          {children}
        </div>
      </div>
    </dialog>
  );
}
