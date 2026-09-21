import React, { useState, useMemo, useEffect } from 'react';
import {
  Home,
  CreditCard,
  PieChart,
  ArrowRightLeft,
  Wallet,
  BarChart3,
  Landmark,
  Flame,
  UserPlus,
  LogOut
} from 'lucide-react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth, db } from './firebase';
import { doc, getDoc, setDoc, addDoc, collection } from 'firebase/firestore';

import { useAppStore } from './store/useAppStore';
import { AuthView } from './views/AuthView';
import { DashboardView } from './views/DashboardView';
import { BudgetsView } from './views/BudgetsView';
import { CardsView } from './views/CardsView';
import { SettlementView } from './views/SettlementView';
import { DebtSimulatorView } from './views/DebtSimulatorView';
import { WealthView } from './views/WealthView';
import { HistoricalView } from './views/HistoricalView';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteLink, setInviteLink] = useState('');
  const [joinHouseConfirm, setJoinHouseConfirm] = useState<string | null>(null);

  const data = useAppStore();
  const methods = data;
  const { user, houseId, authLoading, setUser, setHouseId, setAuthLoading, initListeners } = data;

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        setUser({ uid: fbUser.uid, email: fbUser.email, displayName: fbUser.displayName, photoURL: fbUser.photoURL });
        
        const userDocRef = doc(db, 'users', fbUser.uid);
        const userDoc = await getDoc(userDocRef);
        
        let currentHouseId = '';
        if (userDoc.exists()) {
          currentHouseId = userDoc.data().houseId;
          setHouseId(currentHouseId);
        } else {
          currentHouseId = `house_${fbUser.uid}`;
          await setDoc(doc(db, 'houses', currentHouseId), { members: [fbUser.uid] });
          await setDoc(userDocRef, { houseId: currentHouseId, email: fbUser.email, displayName: fbUser.displayName });
          setHouseId(currentHouseId);
        }

        // Check for invite
        const path = window.location.pathname;
        if (path.startsWith('/invite/')) {
          const inviteId = path.split('/')[2];
          const inviteRef = doc(db, 'invitations', inviteId);
          const inviteDoc = await getDoc(inviteRef);
          if (inviteDoc.exists() && !inviteDoc.data().accepted) {
             const invitedHouseId = inviteDoc.data().houseId;
             if (invitedHouseId !== currentHouseId) {
               setJoinHouseConfirm(inviteId);
             } else {
               window.history.replaceState({}, document.title, "/");
             }
          } else {
            window.history.replaceState({}, document.title, "/");
          }
        }
      } else {
        setUser(null);
        setHouseId(null);
      }
      setAuthLoading(false);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (houseId) {
      const unsub = initListeners(houseId);
      return () => unsub();
    }
  }, [houseId]);

  const handleJoinHouse = async (accept: boolean) => {
    if (accept && joinHouseConfirm && user) {
      const inviteRef = doc(db, 'invitations', joinHouseConfirm);
      const inviteDoc = await getDoc(inviteRef);
      if (inviteDoc.exists()) {
        const newHouseId = inviteDoc.data().houseId;
        const houseRef = doc(db, 'houses', newHouseId);
        const houseDoc = await getDoc(houseRef);
        if (houseDoc.exists()) {
           await setDoc(doc(db, 'houses', newHouseId), { members: [...houseDoc.data().members, user.uid] }, { merge: true });
           await setDoc(doc(db, 'users', user.uid), { houseId: newHouseId }, { merge: true });
           await setDoc(inviteRef, { accepted: true }, { merge: true });
           setHouseId(newHouseId);
        }
      }
    }
    setJoinHouseConfirm(null);
    window.history.replaceState({}, document.title, "/");
  };

  const handleInvite = async () => {
    if (!user || !houseId) return;
    const inviteRef = await addDoc(collection(db, 'invitations'), {
      houseId,
      fromUid: user.uid,
      createdAt: new Date().toISOString(),
      accepted: false
    });
    const link = `${window.location.origin}/invite/${inviteRef.id}`;
    setInviteLink(link);
    navigator.clipboard.writeText(link);
  };

  const calc = useMemo(() => {
    const totalIncome = data.incomes.reduce((acc, curr) => acc + curr.amount, 0);

    let zoeOwesDavid = 0;
    let davidOwesZoe = 0;
    data.expenses.forEach(exp => {
      if (exp.split === 50) {
        if (exp.paidBy === 'u1') zoeOwesDavid += exp.amount / 2;
        if (exp.paidBy === 'u2') davidOwesZoe += exp.amount / 2;
      }
    });
    const netSettlement = zoeOwesDavid - davidOwesZoe;

    const totalBudgeted = data.budgets.reduce((acc, curr) => acc + curr.base, 0);
    const unallocated = totalIncome - totalBudgeted;

    const needs = data.budgets.filter(b => b.type === 'Necesidad').reduce((acc, curr) => acc + curr.base, 0);
    const wants = data.budgets.filter(b => b.type === 'Deseo').reduce((acc, curr) => acc + curr.base, 0);
    const savings = data.budgets.filter(b => b.type === 'Ahorro').reduce((acc, curr) => acc + curr.base, 0);

    const totalAssets = data.assets.reduce((acc, curr) => acc + curr.value, 0);
    const totalLiabilities = data.cards.reduce((acc, curr) => acc + curr.balance, 0);
    const netWorth = totalAssets - totalLiabilities;

    return {
      totalIncome, unallocated,
      netSettlement, settlementAmount: Math.abs(netSettlement),
      needsPct: totalIncome ? (needs / totalIncome) * 100 : 0,
      wantsPct: totalIncome ? (wants / totalIncome) * 100 : 0,
      savingsPct: totalIncome ? (savings / totalIncome) * 100 : 0,
      totalAssets, totalLiabilities, netWorth
    };
  }, [data]);

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div></div>;
  }

  if (!user) {
    return <AuthView />;
  }

  const renderTab = () => {
    switch (activeTab) {
      case 'dashboard': return <DashboardView data={data} calc={calc} methods={methods} />;
      case 'budgets': return <BudgetsView data={data} methods={methods} />;
      case 'cards': return <CardsView data={data} methods={methods} />;
      case 'settlement': return <SettlementView data={data} calc={calc} methods={methods} />;
      case 'debts': return <DebtSimulatorView data={data} />;
      case 'wealth': return <WealthView data={data} calc={calc} methods={methods} />;
      case 'historical': return <HistoricalView data={data} />;
      default: return <DashboardView data={data} calc={calc} methods={methods} />;
    }
  };

  const navItems = [
    { id: 'dashboard', icon: <Home size={20} />, label: 'Resumen' },
    { id: 'budgets', icon: <PieChart size={20} />, label: 'Rollover' },
    { id: 'cards', icon: <CreditCard size={20} />, label: 'Tarjetas' },
    { id: 'settlement', icon: <ArrowRightLeft size={20} />, label: 'Cuentas' },
    { id: 'debts', icon: <Flame size={20} />, label: 'Simulador' },
    { id: 'wealth', icon: <Landmark size={20} />, label: 'Patrimonio' },
    { id: 'historical', icon: <BarChart3 size={20} />, label: 'Histórico' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-24 md:pb-0 md:pl-72 relative">
      {/* Background gradients for premium feel */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-teal-100/40 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-100/40 rounded-full blur-[120px]"></div>
      </div>

      <nav className="fixed bottom-0 w-full bg-white/80 backdrop-blur-xl border-t border-slate-200/50 flex overflow-x-auto scrollbar-hide p-3 md:flex-col md:justify-start md:w-72 md:h-full md:left-0 md:top-0 md:border-r md:border-t-0 md:p-6 z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.03)] md:shadow-[10px_0_40px_rgba(0,0,0,0.03)] transition-all">
        <div className="hidden md:flex mb-12 items-center gap-3 px-2">
          <div className="bg-gradient-to-br from-emerald-400 to-teal-600 p-2.5 rounded-2xl text-white shadow-lg shadow-emerald-200">
            <Wallet size={24}/>
          </div>
          <h1 className="text-2xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-emerald-700 to-teal-700">Órbita2</h1>
        </div>

        <div className="flex md:flex-col gap-2 w-full min-w-max">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col md:flex-row items-center gap-1 md:gap-4 p-2.5 md:px-5 md:py-4 rounded-2xl transition-all duration-300 flex-1 md:flex-none relative overflow-hidden group ${
                activeTab === item.id
                  ? 'text-emerald-700 font-bold shadow-sm bg-emerald-50 md:bg-emerald-50 border border-emerald-100'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/50 border border-transparent'
              }`}
            >
              {activeTab === item.id && (
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-100/0 via-emerald-100/50 to-emerald-100/0 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              )}
              <div className={`relative z-10 transition-transform duration-300 ${activeTab === item.id ? 'scale-110' : 'group-hover:scale-110'}`}>
                {item.icon}
              </div>
              <span className="text-[10px] md:text-[15px] whitespace-nowrap relative z-10 tracking-tight">{item.label}</span>
            </button>
          ))}
          
          <div className="hidden md:block mt-auto pt-6 border-t border-slate-200/50">
            <button onClick={() => { setShowInviteModal(true); handleInvite(); }} className="w-full flex items-center gap-4 p-4 rounded-2xl text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors font-medium">
              <UserPlus size={20} />
              <span>Invitar integrante</span>
            </button>
            <button onClick={() => signOut(auth)} className="w-full mt-2 flex items-center gap-4 p-4 rounded-2xl text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors">
              <LogOut size={20} />
              <span>Cerrar sesión</span>
            </button>
          </div>
        </div>
      </nav>

      <main className="p-4 md:p-10 max-w-5xl mx-auto space-y-6 relative z-10">
        <div className="md:hidden flex items-center justify-between mb-8 bg-white/80 backdrop-blur-md p-4 rounded-3xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-emerald-400 to-teal-600 p-2 rounded-xl text-white shadow-md shadow-emerald-200/50">
              <Wallet size={20}/>
            </div>
            <h1 className="text-2xl font-black tracking-tighter text-slate-800">Órbita2</h1>
          </div>
          <button onClick={() => { setShowInviteModal(true); handleInvite(); }} className="p-2 text-emerald-700 bg-emerald-50 rounded-xl">
            <UserPlus size={20} />
          </button>
        </div>

        {renderTab()}
      </main>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-[2rem] max-w-md w-full shadow-2xl relative">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">Invitar a tu casa</h2>
            <p className="text-slate-500 mb-6">Comparte este enlace para que otra persona se una a tu misma cuenta y gestionen sus finanzas juntos.</p>
            {inviteLink ? (
              <div className="bg-slate-50 p-4 rounded-2xl flex flex-col gap-3">
                <code className="text-sm text-emerald-700 break-all">{inviteLink}</code>
                <p className="text-xs font-bold text-emerald-600">¡Copiado al portapapeles!</p>
              </div>
            ) : (
              <div className="flex justify-center p-4"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div></div>
            )}
            <button onClick={() => setShowInviteModal(false)} className="mt-8 w-full bg-slate-900 text-white p-4 rounded-2xl font-bold">
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* Join House Modal */}
      {joinHouseConfirm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-[2rem] max-w-md w-full shadow-2xl relative text-center">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <UserPlus size={32} />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-4">¡Te han invitado a una casa!</h2>
            <p className="text-slate-600 mb-8 font-medium">¿Deseas abandonar tu casa actual para unirte a esta nueva casa o mantenerte en tu casa actual?</p>
            <div className="flex flex-col gap-3">
              <button onClick={() => handleJoinHouse(true)} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white p-4 rounded-2xl font-bold transition-colors shadow-lg shadow-emerald-200">
                Unirme a la nueva casa
              </button>
              <button onClick={() => handleJoinHouse(false)} className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 p-4 rounded-2xl font-bold transition-colors">
                Mantenerme en mi casa actual
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
