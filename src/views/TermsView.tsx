import React from 'react';
import { FileText } from 'lucide-react';

export function TermsView() {
  return (
    <div className="space-y-6 animate-in max-w-4xl mx-auto">
      <div className="bg-white border border-[#EEF0F4] rounded-3xl p-6 sm:p-8 shadow-bento space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-[#EEF0F4]">
          <div className="w-10 h-10 rounded-xl bg-[#EEF2FF] text-[#6366F1] border border-[#6366F1]/20 flex items-center justify-center shrink-0">
            <FileText size={20} />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">Términos y Condiciones</h2>
            <p className="text-xs text-slate-400 mt-0.5 font-medium">Última actualización: Noviembre 2026</p>
          </div>
        </div>

        <div className="space-y-6 text-sm text-slate-600 leading-relaxed">
          <p className="font-medium text-slate-700">
            Bienvenido a Orbita2. Al utilizar nuestra aplicación y sus herramientas financieras asociadas, aceptas estos términos y condiciones en su totalidad.
          </p>

          <div className="bg-[#F8FAFC] border border-[#EEF0F4] rounded-2xl p-5 space-y-2">
            <h3 className="text-base font-bold text-slate-900">1. Uso del Servicio</h3>
            <p className="text-slate-600 text-xs sm:text-sm">
              Esta herramienta se proporciona con fines exclusivos de gestión financiera personal, análisis patrimonial y conciliación de gastos en pareja o del hogar.
            </p>
          </div>

          <div className="bg-[#F8FAFC] border border-[#EEF0F4] rounded-2xl p-5 space-y-2">
            <h3 className="text-base font-bold text-slate-900">2. Responsabilidad Financiera</h3>
            <p className="text-slate-600 text-xs sm:text-sm">
              Las proyecciones, simulaciones de deuda y cálculos de liquidación son referencias estimadas. No constituyen asesoría legal, contable ni fiscal vinculante. Verifica siempre los datos antes de ejecutar transferencias bancarias reales.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
