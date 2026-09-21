import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { Button } from './Button';

export function Modal({ isOpen, onClose, title, children }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (isOpen && dialog && !dialog.open) {
      dialog.showModal();
    } else if (!isOpen && dialog && dialog.open) {
      dialog.close();
    }
  }, [isOpen]);

  // Manejar cierre al presionar ESC o al hacer clic fuera
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') onClose();
  };

  const handleBackdropClick = (e) => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const rect = dialog.getBoundingClientRect();
    const isInDialog = (
      rect.top <= e.clientY &&
      e.clientY <= rect.top + rect.height &&
      rect.left <= e.clientX &&
      e.clientX <= rect.left + rect.width
    );
    if (!isInDialog) {
      onClose();
    }
  };

  return (
    <dialog
      ref={dialogRef}
      onKeyDown={handleKeyDown}
      onClick={handleBackdropClick}
      className="p-0 m-auto bg-transparent backdrop:bg-slate-900/50 backdrop:backdrop-blur-sm rounded-[32px] overflow-hidden animate-in fade-in zoom-in-95 duration-200"
    >
      <div className="bg-white max-w-lg w-[90vw] md:w-[500px] shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50">
          <h2 className="text-xl font-bold tracking-tight text-slate-800">{title}</h2>
          <Button variant="ghost" size="sm" onClick={onClose} className="!p-2 -mr-2" aria-label="Cerrar">
            <X size={20} />
          </Button>
        </div>
        <div className="p-6 overflow-y-auto">
          {children}
        </div>
      </div>
    </dialog>
  );
}
