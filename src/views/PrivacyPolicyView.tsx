import React from 'react';
import { Shield } from 'lucide-react';

export function PrivacyPolicyView() {
  return (
    <div className="space-y-6 animate-in max-w-4xl mx-auto">
      <div className="bg-white border border-[#EEF0F4] rounded-3xl p-6 sm:p-8 shadow-bento space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-[#EEF0F4]">
          <div className="w-10 h-10 rounded-xl bg-[#E8F8F0] text-[#10B981] border border-[#10B981]/20 flex items-center justify-center shrink-0">
            <Shield size={20} />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">Política de Privacidad</h2>
            <p className="text-xs text-slate-400 mt-0.5 font-medium">Última actualización: Noviembre 2026</p>
          </div>
        </div>

        <div className="space-y-6 text-sm text-slate-600 leading-relaxed">
          <p className="font-medium text-slate-700">
            Tu privacidad y la seguridad de tus datos financieros son fundamentales para nosotros. Esta política explica cómo recopilamos, usamos y resguardamos tu información dentro de la plataforma.
          </p>

          <div className="bg-[#F8FAFC] border border-[#EEF0F4] rounded-2xl p-5 space-y-2">
            <h3 className="text-base font-bold text-slate-900">1. Recopilación de Datos</h3>
            <p className="text-slate-600 text-xs sm:text-sm">
              Recopilamos información relacionada con tus transacciones, presupuestos, cuentas y activos únicamente para proveerte el servicio principal de conciliación y control financiero personal y de pareja.
            </p>
          </div>

          <div className="bg-[#F8FAFC] border border-[#EEF0F4] rounded-2xl p-5 space-y-2">
            <h3 className="text-base font-bold text-slate-900">2. Uso y Protección de la Información</h3>
            <p className="text-slate-600 text-xs sm:text-sm">
              Tus datos son almacenados de forma segura mediante reglas de seguridad estrictas en la nube y solo se comparten con los miembros que invites explícitamente a tu hogar dentro de la aplicación. No comercializamos tu información con terceros.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
