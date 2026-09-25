import React from 'react';
import { authService } from '../services/authService';
import { Wallet, LogIn } from 'lucide-react';

export const AuthView = () => {
  const handleLogin = async () => {
    try {
      await authService.loginWithGoogle();
    } catch (error) {
      console.error("Error logging in:", error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA] relative overflow-hidden">
      {/* Subtle static gradients — no blur */}
      <div className="absolute top-0 right-0 w-[480px] h-[480px] bg-indigo-50 rounded-full opacity-60 pointer-events-none -translate-y-1/2 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-slate-100 rounded-full opacity-50 pointer-events-none translate-y-1/2 -translate-x-1/3" />

      <div className="bg-white border border-[#E5E5E5] shadow-lg rounded-2xl p-10 md:p-16 w-full max-w-md text-center relative z-10 mx-4">
        <div className="flex justify-center mb-8">
          <div className="bg-indigo-600 p-4 rounded-2xl text-white">
            <Wallet size={40} strokeWidth={1.5} />
          </div>
        </div>
        <h1 className="text-4xl font-black tracking-tighter text-slate-900 mb-2">Órbita2</h1>
        <p className="text-slate-500 font-medium mb-10 text-base">Finanzas en pareja, en órbita.</p>

        <button
          onClick={handleLogin}
          className="w-full flex items-center justify-center gap-3 bg-slate-900 hover:bg-slate-800 text-white p-4 rounded-lg font-semibold text-base transition-colors duration-200 active:scale-[0.98]"
        >
          <LogIn size={20} />
          <span>Ingresar con Google</span>
        </button>
      </div>
    </div>
  );
};
