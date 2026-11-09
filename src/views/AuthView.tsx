import React from 'react';
import { authService } from '../services/authService';
import { LogIn } from 'lucide-react';
import { OrbitaLogo } from '../components/ui/OrbitaLogo';

export const AuthView = () => {
  const handleLogin = async () => {
    try {
      await authService.loginWithGoogle();
    } catch (error) {
      console.error("Error logging in:", error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F6FA] relative overflow-hidden p-4">
      {/* Luces sutiles en pasteles bento */}
      <div className="absolute top-0 right-0 w-[480px] h-[480px] bg-[#EEF2FF] rounded-full opacity-70 pointer-events-none -translate-y-1/2 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#E8F8F0] rounded-full opacity-60 pointer-events-none translate-y-1/2 -translate-x-1/3" />

      <div className="bg-white border border-[#EEF0F4] rounded-3xl p-8 sm:p-12 w-full max-w-md text-center shadow-bento relative z-10">
        <div className="flex justify-center mb-6">
          <OrbitaLogo size={68} />
        </div>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 mb-2">Orbita2</h1>
        <p className="text-slate-500 font-medium mb-8 text-sm sm:text-base">Finanzas en pareja, en órbita y en sincronía.</p>

        <button
          type="button"
          onClick={handleLogin}
          className="w-full flex items-center justify-center gap-2.5 bg-[#111319] hover:bg-[#1A1D26] text-white py-3.5 px-6 rounded-full font-medium text-sm transition-colors duration-150 cursor-pointer shadow-sm active:scale-[0.99]"
        >
          <LogIn size={18} />
          <span>Ingresar con Google</span>
        </button>
      </div>
    </div>
  );
};
