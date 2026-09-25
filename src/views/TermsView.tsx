import React from 'react';

export function TermsView() {
  return (
    <div className="space-y-6 animate-in p-6 bg-white rounded-xl border border-slate-200">
      <h2 className="text-3xl font-black tracking-tight text-slate-800">Términos y Condiciones</h2>
      <div className="prose text-slate-600">
        <p>Bienvenido a Órbita2. Al utilizar nuestra aplicación, aceptas estos términos y condiciones en su totalidad.</p>
        <h3 className="text-xl font-bold mt-4 text-slate-800">1. Uso del Servicio</h3>
        <p>Esta herramienta se proporciona "tal cual" para propósitos de gestión financiera personal y compartida.</p>
        <h3 className="text-xl font-bold mt-4 text-slate-800">2. Responsabilidad</h3>
        <p>No somos responsables de las decisiones financieras que tomes basándote en los cálculos y simulaciones mostrados en la aplicación.</p>
      </div>
    </div>
  );
}
