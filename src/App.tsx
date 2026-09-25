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
import { useShallow } from 'zustand/react/shallow';
import { AuthView } from './views/AuthView';
import { DashboardView } from './views/DashboardView';
import { BudgetsView } from './views/BudgetsView';
import { CardsView } from './views/CardsView';
import { SettlementView } from './views/SettlementView';
import { DebtSimulatorView } from './views/DebtSimulatorView';
import { WealthView } from './views/WealthView';
import { HistoricalView } from './views/HistoricalView';
import { ToastContainer } from './components/ui/Toast';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteLink, setInviteLink] = useState('');
  const [joinHouseConfirm, setJoinHouseConfirm] = useState<string | null>(null);

  const data = useAppStore(useShallow(state => ({
    user: state.user,
    houseId: state.houseId,
    authLoading: state.authLoading,
    dateRange: state.dateRange,
    expenses: state.expenses,
    budgets: state.budgets,
    cards: state.cards,
    assets: state.assets,
    incomes: state.incomes,
    users: state.users,
    goals: state.goals,
    setUser: state.setUser,
    setHouseId: state.setHouseId,
    setAuthLoading: state.setAuthLoading,
    setDateRange: state.setDateRange,
    initListeners: state.initListeners,
    addExpense: state.addExpense,
    updateExpense: state.updateExpense,
    deleteExpense: state.deleteExpense,
    addBudget: state.addBudget,
    updateBudget: state.updateBudget,
    deleteBudget: state.deleteBudget,
    addCard: state.addCard,
    updateCard: state.updateCard,
    deleteCard: state.deleteCard,
    addAsset: state.addAsset,
    updateAsset: state.updateAsset,
    deleteAsset: state.deleteAsset,
    addIncome: state.addIncome,
    updateIncome: state.updateIncome,
    deleteIncome: state.deleteIncome,
    addGoal: state.addGoal,
    updateGoal: state.updateGoal,
    deleteGoal: state.deleteGoal,
  })));
  const methods = data;
  const { user, houseId, authLoading, setUser, setHouseId, setAuthLoading, initListeners, dateRange, setDateRange } = data;

  const filteredData = useMemo(() => {
    const start = dateRange?.start || '2000-01-01';
    const end = dateRange?.end || '2100-12-31';
    return {
      ...data,
      incomes: data.incomes.filter(i => !i.date || (i.date >= start && i.date <= end)),
      expenses: data.expenses.filter(e => !e.date || (e.date >= start && e.date <= end))
    };
  }, [data, dateRange]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      try {
        if (fbUser) {
          setUser({ uid: fbUser.uid, email: fbUser.email, displayName: fbUser.displayName, photoURL: fbUser.photoURL });
          
          const userDocRef = doc(db, 'users', fbUser.uid);
          const userDoc = await getDoc(userDocRef);
          
          let currentHouseId = '';
          if (userDoc.exists()) {
            currentHouseId = userDoc.data().houseId;
            try {
              await setDoc(userDocRef, { photoURL: fbUser.photoURL || null }, { merge: true });
            } catch (err) {
              console.error("Error updating photoURL", err);
            }
            setHouseId(currentHouseId);
          } else {
            currentHouseId = `house_${fbUser.uid}`;
            await setDoc(doc(db, 'houses', currentHouseId), { members: [fbUser.uid] });
            await setDoc(userDocRef, { 
              houseId: currentHouseId, 
              email: fbUser.email, 
              displayName: fbUser.displayName,
              name: fbUser.displayName?.split(' ')[0] || 'Usuario',
              avatar: 'bg-indigo-500',
              photoURL: fbUser.photoURL || null
            });
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
      } catch (error) {
        console.error("Error setting up user:", error);
      } finally {
        setAuthLoading(false);
      }
    });
    return () => unsub();
  }, [setUser, setHouseId, setAuthLoading]);

  useEffect(() => {
    if (houseId) {
      const unsub = initListeners(houseId);
      return () => unsub();
    }
  }, [houseId, initListeners]);

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
    // Tasa de cambio fija temporal para normalizar
    const EXCHANGE_RATE_USD_MXN = 20;
    const normalize = (amount, currency) => {
      if (!amount) return 0;
      return currency === 'USD' ? amount * EXCHANGE_RATE_USD_MXN : amount;
    };

    // Solo ingresos públicos se cuentan para el presupuesto de la casa
    const totalIncome = filteredData.incomes.filter(i => !i.isPrivate).reduce((acc, curr) => acc + normalize(curr.amount, curr.currency), 0);

    const incomesByUser = {};
    filteredData.users.forEach(u => incomesByUser[u.id] = 0);
    filteredData.incomes.forEach(inc => {
      if (inc.userId) incomesByUser[inc.userId] = (incomesByUser[inc.userId] || 0) + normalize(inc.amount, inc.currency);
    });



    let zoeOwesDavid = 0;
    let davidOwesZoe = 0;

    filteredData.expenses.forEach(exp => {
      if (exp.isPrivate) return;

      const normalizedAmount = normalize(exp.amount, exp.currency);

      let ratio1 = 0.5;
      let ratio2 = 0.5;

      if (exp.splitType === 'proporcional') {
        const u1Id = filteredData.users[0]?.id || 'u1';
        const u2Id = filteredData.users[1]?.id || 'u2';
        
        const inc1 = incomesByUser[u1Id] || 0;
        const inc2 = incomesByUser[u2Id] || 0;
        const sum = inc1 + inc2;

        if (sum > 0) {
          ratio1 = inc1 / sum;
          ratio2 = inc2 / sum;
        }
      }

      if (exp.paidBy === filteredData.users[0]?.id || exp.paidBy === 'u1') {
        zoeOwesDavid += normalizedAmount * ratio2;
      } else if (exp.paidBy === filteredData.users[1]?.id || exp.paidBy === 'u2') {
        davidOwesZoe += normalizedAmount * ratio1;
      }
    });

    const netSettlement = zoeOwesDavid - davidOwesZoe;

    const totalBudgeted = filteredData.budgets.reduce((acc, curr) => acc + curr.base, 0);
    const unallocated = totalIncome - totalBudgeted;

    const needs = filteredData.budgets.filter(b => b.type === 'Necesidad').reduce((acc, curr) => acc + curr.base, 0);
    const wants = filteredData.budgets.filter(b => b.type === 'Deseo').reduce((acc, curr) => acc + curr.base, 0);
    const savings = filteredData.budgets.filter(b => b.type === 'Ahorro').reduce((acc, curr) => acc + curr.base, 0);

    const totalAssets = filteredData.assets.reduce((acc, curr) => acc + curr.value, 0);
    const totalLiabilities = filteredData.cards.reduce((acc, curr) => acc + curr.balance, 0);
    const netWorth = totalAssets - totalLiabilities;

    return {
      totalIncome, unallocated,
      netSettlement, settlementAmount: Math.abs(netSettlement),
      needsPct: totalIncome ? (needs / totalIncome) * 100 : 0,
      wantsPct: totalIncome ? (wants / totalIncome) * 100 : 0,
      savingsPct: totalIncome ? (savings / totalIncome) * 100 : 0,
      totalAssets, totalLiabilities, netWorth
    };
  }, [filteredData]);

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;
  }

  if (!user) {
    return <AuthView />;
  }

  const renderTab = () => {
    switch (activeTab) {
      case 'dashboard': return <DashboardView data={filteredData} calc={calc} methods={methods} />;
      case 'budgets': return <BudgetsView data={filteredData} methods={methods} />;
      case 'cards': return <CardsView data={filteredData} methods={methods} />;
      case 'settlement': return <SettlementView data={filteredData} calc={calc} methods={methods} />;
      case 'debts': return <DebtSimulatorView data={filteredData} />;
      case 'wealth': return <WealthView data={filteredData} calc={calc} methods={methods} />;
      case 'historical': return <HistoricalView data={data} />;
      default: return <DashboardView data={filteredData} calc={calc} methods={methods} />;
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
    <div className="min-h-screen bg-[#FAFAFA] text-slate-900 font-sans pb-24 md:pb-0 md:pl-72 relative">
      <nav className="fixed bottom-0 w-full bg-white border-t border-[#E5E5E5] flex overflow-x-auto scrollbar-hide p-3 md:flex-col md:justify-start md:w-72 md:h-full md:left-0 md:top-0 md:border-r md:border-t-0 md:p-6 z-50 transition-all">
        <div className="hidden md:flex mb-12 items-center gap-3 px-2">
          <div className="bg-indigo-600 p-2.5 rounded-lg text-white">
            <Wallet size={24}/>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-title">Órbita2</h1>
        </div>

        <div className="flex md:flex-col gap-2 w-full min-w-max">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col md:flex-row items-center gap-1 md:gap-3 p-2.5 md:px-4 md:py-3 rounded-lg transition-all duration-200 flex-1 md:flex-none relative group ${
                activeTab === item.id
                  ? 'text-indigo-600 font-medium bg-indigo-50 border border-indigo-100'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50 border border-transparent'
              }`}
            >
              <div className={`relative z-10 transition-transform duration-200 ${activeTab === item.id ? 'scale-105' : 'group-hover:scale-105'}`}>
                {item.icon}
              </div>
              <span className="text-[10px] md:text-sm whitespace-nowrap relative z-10 tracking-tight">{item.label}</span>
            </button>
          ))}
          
          <div className="hidden md:block mt-auto pt-6 border-t border-[#E5E5E5]">
            <button onClick={() => { setShowInviteModal(true); handleInvite(); }} className="w-full flex items-center gap-3 p-3 rounded-lg text-indigo-600 hover:bg-indigo-50 transition-colors font-medium">
              <UserPlus size={18} />
              <span className="text-sm">Invitar integrante</span>
            </button>
            <button onClick={() => signOut(auth)} className="w-full mt-2 flex items-center gap-3 p-3 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors">
              <LogOut size={18} />
              <span className="text-sm">Cerrar sesión</span>
            </button>
          </div>
        </div>
      </nav>

      <main className="p-4 md:p-10 max-w-5xl mx-auto space-y-6 relative z-10">
        <div className="md:hidden flex items-center justify-between mb-6 bg-white p-4 border-b border-[#E5E5E5] -mx-4 -mt-4">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-lg text-white">
              <Wallet size={20}/>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 font-title">Órbita2</h1>
          </div>
          <button onClick={() => { setShowInviteModal(true); handleInvite(); }} className="p-2 text-indigo-600 bg-indigo-50 rounded-lg">
            <UserPlus size={20} />
          </button>
        </div>

        {activeTab !== 'historical' && (
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4 bg-white p-4 rounded-xl border border-[#E5E5E5]">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Periodo:</span>
            <div className="flex items-center gap-2">
              <input type="date" value={dateRange?.start || ''} onChange={e => setDateRange(e.target.value, dateRange?.end || '')} className="px-3 py-1.5 bg-white border border-[#E5E5E5] rounded-md text-sm font-medium text-slate-900 focus:ring-1 focus:ring-indigo-500 outline-none transition-all tabular-nums tracking-tight" />
              <span className="text-slate-400">-</span>
              <input type="date" value={dateRange?.end || ''} onChange={e => setDateRange(dateRange?.start || '', e.target.value)} className="px-3 py-1.5 bg-white border border-[#E5E5E5] rounded-md text-sm font-medium text-slate-900 focus:ring-1 focus:ring-indigo-500 outline-none transition-all tabular-nums tracking-tight" />
            </div>
          </div>
        )}

        {renderTab()}
      </main>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-slate-900/60 z-[100] flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm max-w-md w-full relative">
            <h2 className="text-2xl font-bold text-slate-900 mb-4 font-title">Invitar a tu casa</h2>
            <p className="text-slate-500 mb-6">Comparte este enlace para que otra persona se una a tu misma cuenta y gestionen sus finanzas juntos.</p>
            {inviteLink ? (
              <div className="bg-slate-50 p-4 rounded-lg border border-[#E5E5E5] flex flex-col gap-3">
                <code className="text-sm text-indigo-600 break-all">{inviteLink}</code>
                <p className="text-xs font-bold text-indigo-600">¡Copiado al portapapeles!</p>
              </div>
            ) : (
              <div className="flex justify-center p-4"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>
            )}
            <button onClick={() => setShowInviteModal(false)} className="mt-8 w-full bg-slate-900 hover:bg-slate-800 text-white p-3 rounded-lg font-bold transition-colors">
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* Join House Modal */}
      {joinHouseConfirm && (
        <div className="fixed inset-0 bg-slate-900/60 z-[100] flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm max-w-md w-full relative text-center">
            <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <UserPlus size={32} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-4 font-title">¡Te han invitado a una casa!</h2>
            <p className="text-slate-600 mb-8 font-medium">¿Deseas abandonar tu casa actual para unirte a esta nueva casa o mantenerte en tu casa actual?</p>
            <div className="flex flex-col gap-3">
              <button onClick={() => handleJoinHouse(true)} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-lg font-bold transition-colors">
                Unirme a la nueva casa
              </button>
              <button onClick={() => handleJoinHouse(false)} className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 p-3 rounded-lg font-bold transition-colors">
                Mantenerme en mi casa actual
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notifications */}
      <ToastContainer />
    </div>
  );
}
