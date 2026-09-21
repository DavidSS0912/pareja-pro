import React from 'react';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import { Wallet, LogIn } from 'lucide-react';

export const AuthView = () => {
  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Error logging in:", error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden">
      {/* Background gradients for premium feel */}
      <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-teal-100/50 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] left-[-10%] w-[70%] h-[70%] bg-emerald-100/50 rounded-full blur-[150px] pointer-events-none"></div>

      <div className="bg-white/70 backdrop-blur-2xl p-10 md:p-16 rounded-[3rem] shadow-2xl border border-white/50 w-full max-w-md text-center relative z-10 mx-4">
        <div className="flex justify-center mb-8">
          <div className="bg-gradient-to-br from-emerald-400 to-teal-600 p-4 rounded-3xl text-white shadow-xl shadow-emerald-200/50">
            <Wallet size={48} strokeWidth={1.5}/>
          </div>
        </div>
        <h1 className="text-4xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-emerald-700 to-teal-700 mb-2">Órbita2</h1>
        <p className="text-slate-500 font-medium mb-10 text-lg">Finanzas en pareja, en órbita.</p>
        
        <button
          onClick={handleLogin}
          className="w-full flex items-center justify-center gap-3 bg-slate-900 hover:bg-slate-800 text-white p-4 rounded-2xl font-bold text-lg transition-all duration-300 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
        >
          <LogIn size={24} />
          <span>Ingresar con Google</span>
        </button>
      </div>
    </div>
  );
};
