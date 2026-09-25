import React from 'react';

export function PrivacyPolicyView() {
  return (
    <div className="space-y-6 animate-in p-6 bg-white rounded-xl border border-slate-200">
      <h2 className="text-3xl font-black tracking-tight text-slate-800">Política de Privacidad</h2>
      <div className="prose text-slate-600">
        <p>Tu privacidad es importante para nosotros. Esta política explica cómo recopilamos y usamos tu información.</p>
        <h3 className="text-xl font-bold mt-4 text-slate-800">1. Recopilación de Datos</h3>
        <p>Recopilamos información relacionada con tus ingresos, gastos y presupuestos para proveerte el servicio principal de la aplicación.</p>
        <h3 className="text-xl font-bold mt-4 text-slate-800">2. Uso de la Información</h3>
        <p>Tus datos son almacenados de forma segura y solo se comparten con los miembros que invites explícitamente a tu "casa" dentro de la aplicación.</p>
      </div>
    </div>
  );
}
