import { filterByContext } from './services/ownershipService';
import { calcularProrrateo, simplificarDeudas } from './services/liquidadorService';
import { calcularPatrimonio } from './services/simuladorService';
import React, { useState, useMemo, useEffect } from 'react';
import {
  Home,
  Wallet,
  Target,
  Users,
  BarChart3,
  Settings,
  UserPlus,
  LogOut,
  User,
  Plus,
  Copy
} from 'lucide-react';
import { Modal } from './components/ui/Modal';
import { MovementForm } from './components/forms/MovementForm';
import { OrbitaLogo } from './components/ui/OrbitaLogo';
import { authService } from './services/authService';
import {
  getOrCreateUserAndHouse,
  checkInvitation,
  acceptInvitation,
  createInvitation,
  getHouseholdMembers,
  InvitationDetails
} from './services/userService';

import { useAppStore, resetAppStore } from './store/useAppStore';
import { useShallow } from 'zustand/react/shallow';
import { AuthView } from './views/AuthView';
import { DashboardView } from './views/DashboardView';
import { PlanningView } from './views/PlanningView';
import { AccountsView } from './views/AccountsView';
import { SettlementView } from './views/SettlementView';
import { HistoricalView } from './views/HistoricalView';
import { SettingsView } from './views/SettingsView';
import { ProfileView } from './views/ProfileView';

import { TermsView } from './views/TermsView';
import { PrivacyPolicyView } from './views/PrivacyPolicyView';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { ToastContainer } from './components/ui/Toast';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteLink, setInviteLink] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const [joinHouseConfirm, setJoinHouseConfirm] = useState<string | null>(null);
  const [inviteModalData, setInviteModalData] = useState<InvitationDetails | null>(null);
  const [joinLoading, setJoinLoading] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);

  const [appContext, setAppContext] = useState<any>('household');
  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);

  const handleOpenMovementModal = () => {
    setIsMovementModalOpen(true);
  };
  const handleOpenIncomeModal = handleOpenMovementModal;
  const handleOpenExpenseModal = handleOpenMovementModal;


  const data = useAppStore(useShallow(state => ({
    user: state.user,
    houseId: state.houseId,
    authLoading: state.authLoading,
    dateRange: state.dateRange,
    expenses: state.expenses,
    budgets: state.budgets,
    assets: state.assets,
    incomes: state.incomes,
    users: state.users,
    goals: state.goals,
    projects: state.projects,
    categories: state.categories,
    tags: state.tags,
    accounts: state.accounts,
    contributions: state.contributions,
    setUser: state.setUser,
    setHouseId: state.setHouseId,
    setAuthLoading: state.setAuthLoading,
    setUsers: state.setUsers,
    setDateRange: state.setDateRange,
    fetchDashboardData: state.fetchDashboardData,
    addExpense: state.addExpense,
    addProject: state.addProject,
    updateProject: state.updateProject,
    deleteProject: state.deleteProject,
    addContribution: state.addContribution,
    addContributionAndUpdateProject: state.addContributionAndUpdateProject,
    updateContribution: state.updateContribution,
    deleteContribution: state.deleteContribution,
    updateExpense: state.updateExpense,
    deleteExpense: state.deleteExpense,
    addBudget: state.addBudget,
    updateBudget: state.updateBudget,
    deleteBudget: state.deleteBudget,
    addAccount: state.addAccount,
    updateAccount: state.updateAccount,
    deleteAccount: state.deleteAccount,
    payCreditCard: state.payCreditCard,
    addAsset: state.addAsset,
    updateAsset: state.updateAsset,
    deleteAsset: state.deleteAsset,
    addIncome: state.addIncome,
    updateIncome: state.updateIncome,
    deleteIncome: state.deleteIncome,
    addGoal: state.addGoal,
    updateGoal: state.updateGoal,
    deleteGoal: state.deleteGoal,
    fetchBudgetsForMonth: state.fetchBudgetsForMonth,
    copyBudgetsFromPreviousMonth: state.copyBudgetsFromPreviousMonth,
    refreshSettings: state.refreshSettings,
    memberSlot: state.memberSlot,
    setMemberSlot: state.setMemberSlot,
  })));
  
  const methods = { ...data, handleOpenMovementModal, handleOpenIncomeModal, handleOpenExpenseModal };
  const { user, houseId, memberSlot, authLoading, setUser, setHouseId, setMemberSlot, setAuthLoading, fetchDashboardData, refreshSettings, dateRange, setDateRange } = data;

  const filteredData = useMemo(() => {
    const start = dateRange?.start || '2000-01-01';
    const end = dateRange?.end || '2100-12-31';
    // Firebase returns Timestamps as full ISO strings ("2026-09-30T05:00:00Z").
    // We normalize to date-only ("2026-09-30") for correct string range comparison.
    const toDateStr = (d: string | undefined | null): string | null =>
      d ? d.slice(0, 10) : null;
    const filterContext = (items: any[], isIncome = false) => {
       const userUid = user?.uid || '';
       return items.filter((i: any) => {
         const ownerUid = i.ownerUid || i.userId || i.paidBy;
         const isShared = !i.isPrivate;
         if (appContext === 'personal') {
           if (isIncome) {
             return !userUid || ownerUid === userUid;
           }
           return ownerUid === userUid && !isShared;
         }
         // appContext === 'household'
         if (isIncome) {
           return isShared || !userUid || ownerUid === userUid;
         }
         return isShared;
       });
    };
    const inDateRange = (date: string | undefined | null) => {
      const d = toDateStr(date);
      return !d || (d >= start && d <= end);
    };

    // Para presupuestos y cuentas: en contexto personal se filtran estrictamente por el memberSlot activo
    const contextMode = appContext === 'personal' ? 'personal' : 'shared';

    return {
      ...data,
      incomes: filterContext(data.incomes.filter(i => inDateRange(i.date)), true),
      expenses: filterContext(data.expenses.filter(e => inDateRange(e.date)), false),
      budgets: filterByContext<any>(data.budgets, contextMode, memberSlot),
      accounts: filterByContext(data.accounts || [], contextMode, memberSlot)
    };
  }, [data, dateRange, appContext, user, memberSlot]);

  useEffect(() => {
    const storedColor = localStorage.getItem('app_second_color');
    if (storedColor) {
      document.documentElement.style.setProperty('--second-color', storedColor);
    }
    const primaryColor = localStorage.getItem('app_primary_color');
    if (primaryColor) {
      document.documentElement.style.setProperty('--primary-color', primaryColor);
    }
  }, []);

  useEffect(() => {
    const unsub = authService.onAuthStateChange(async (fbUser) => {
      try {
        if (fbUser) {
          const currentUid = useAppStore.getState().user?.uid;
          if (currentUid && currentUid !== fbUser.uid) {
            resetAppStore();
          }
          setUser({ uid: fbUser.uid, email: fbUser.email, displayName: fbUser.displayName, photoURL: fbUser.photoURL });
          
          const currentHouseId = await getOrCreateUserAndHouse(fbUser);
          setHouseId(currentHouseId);

          // Poblar el store de usuarios con los miembros del hogar ordenados (USER_A en 0, USER_B en 1)
          const localUser = {
            id: fbUser.uid,
            name: fbUser.displayName || (fbUser.email ? fbUser.email.split('@')[0] : 'Usuario'),
            displayName: fbUser.displayName || (fbUser.email ? fbUser.email.split('@')[0] : 'Usuario'),
            email: fbUser.email || '',
            photoURL: fbUser.photoURL || null,
          };

          try {
            if (currentHouseId) {
              const members = await getHouseholdMembers(currentHouseId);
              const sortedMembers = [...members].sort((a, b) => {
                if (a.memberSlot === 'USER_A') return -1;
                if (b.memberSlot === 'USER_A') return 1;
                if (a.memberSlot === 'USER_B') return -1;
                if (b.memberSlot === 'USER_B') return 1;
                return 0;
              });

              // Sincronizar el slot del usuario actual con setMemberSlot
              const currentMember = members.find(m => m.id === fbUser.uid);
              if (currentMember?.memberSlot) {
                setMemberSlot(currentMember.memberSlot as any);
              }

              const mappedUsers = sortedMembers.map(m => ({
                id: m.id,
                name: m.displayName || (m.email ? m.email.split('@')[0] : 'Usuario'),
                displayName: m.displayName || (m.email ? m.email.split('@')[0] : 'Usuario'),
                email: m.email || '',
                memberSlot: m.memberSlot,
                photoURL: m.id === fbUser.uid ? (fbUser.photoURL || null) : null,
                createdAt: m.createdAt
              }));

              data.setUsers(mappedUsers.length > 0 ? mappedUsers : [localUser]);
            } else {
              data.setUsers([localUser]);
            }
          } catch (memberErr) {
            console.error("Error al obtener miembros del hogar:", memberErr);
            data.setUsers([localUser]);
          }

          // Check for invite (desde la URL o desde sessionStorage resguardado previo al login)
          let inviteIdToProcess: string | null = null;
          const path = window.location.pathname;
          if (path.startsWith('/invite/')) {
            inviteIdToProcess = path.split('/')[2];
          } else {
            const pendingId = sessionStorage.getItem('pending_invite_id');
            if (pendingId) {
              inviteIdToProcess = pendingId;
            }
          }

          if (inviteIdToProcess) {
            // Limpieza inmediata de URL y de sessionStorage
            sessionStorage.removeItem('pending_invite_id');
            if (window.location.pathname.startsWith('/invite/')) {
              window.history.replaceState({}, document.title, "/");
            }

            const inviteDetails = await checkInvitation(inviteIdToProcess);
            if (inviteDetails && typeof inviteDetails === 'object' && inviteDetails.householdId) {
              if (inviteDetails.householdId !== currentHouseId) {
                setInviteModalData(inviteDetails as InvitationDetails);
                setJoinHouseConfirm(inviteIdToProcess);
              }
            }
          }
        } else {
          // Si no hay sesión activa y la URL contiene /invite/:id, resguardar en sessionStorage
          const path = window.location.pathname;
          if (path.startsWith('/invite/')) {
            const inviteId = path.split('/')[2];
            if (inviteId) {
              sessionStorage.setItem('pending_invite_id', inviteId);
            }
          }
          resetAppStore();
        }
      } catch (error) {
        console.error("Error setting up user:", error);
        setGlobalError(error instanceof Error ? error : new Error(String(error)));
      } finally {
        setAuthLoading(false);
      }
    });
    return () => unsub();
  }, [setUser, setHouseId, setAuthLoading]); // eslint-disable-line react-hooks/exhaustive-deps

  const [globalError, setGlobalError] = useState<Error | null>(null);

  useEffect(() => {
    if (houseId) {
      const loadData = async () => {
        try {
          await Promise.all([
            fetchDashboardData(houseId),
            refreshSettings()
          ]);
        } catch (error) {
          console.error("Error loading global data:", error);
          setGlobalError(error instanceof Error ? error : new Error(String(error)));
        }
      };
      loadData();
    }
  }, [houseId, fetchDashboardData, refreshSettings]);

  if (globalError) {
    throw globalError; // Let ErrorBoundary catch it
  }

  const handleJoinHouse = async (accept: boolean) => {
    sessionStorage.removeItem('pending_invite_id');
    window.history.replaceState({}, document.title, "/");
    if (accept && joinHouseConfirm && user) {
      setJoinLoading(true);
      setJoinError(null);
      try {
        const newHouseId = await acceptInvitation(joinHouseConfirm);
        if (newHouseId) {
          resetAppStore();
          setHouseId(newHouseId);
        }
      } catch (err: any) {
        console.error("Error al unirse al hogar:", err);
        setJoinError(err?.message || "No se pudo unir al hogar. La invitación puede haber expirado o el hogar estar lleno.");
        setJoinLoading(false);
        return;
      } finally {
        setJoinLoading(false);
      }
    }
    setJoinHouseConfirm(null);
    setInviteModalData(null);
    setJoinError(null);
  };

  const handleInvite = async () => {
    if (!houseId) return;
    setInviteLoading(true);
    setInviteError(null);
    setCopiedLink(false);
    setInviteLink('');
    try {
      const inviteId = await createInvitation(houseId);
      const link = `${window.location.origin}/invite/${inviteId}`;
      setInviteLink(link);
    } catch (err: any) {
      console.error("Error al generar invitación:", err);
      const msg = err?.message || String(err);
      if (msg.includes('límite de 2') || msg.includes('2 integrantes')) {
        setInviteError('El hogar ya cuenta con el límite máximo de 2 integrantes.');
      } else {
        setInviteError('No se pudo generar la invitación. Inténtalo de nuevo más tarde.');
      }
    } finally {
      setInviteLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (!inviteLink) return;
    navigator.clipboard.writeText(inviteLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const calc = useMemo(() => {
    // Tasa de cambio fija temporal para normalizar
    const EXCHANGE_RATE_USD_MXN = parseFloat(localStorage.getItem("exchangeRate") || "20");
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



    const isSingleUser = (filteredData.users?.length || 0) < 2;
    const userA = filteredData.users.find((u: any) => u.memberSlot === 'USER_A') || filteredData.users[0];
    const userB = filteredData.users.find((u: any) => u.memberSlot === 'USER_B') || filteredData.users[1];
    const userAId = userA?.id || 'u1';
    const userBId = userB?.id || 'u2';

    let bOwesA = 0;
    let aOwesB = 0;
    let netSettlement = 0;
    let settlementAmount = 0;
    let simplifiedDebt: { deudor: 'A' | 'B' | null; monto: number } = { deudor: null, monto: 0 };

    if (!isSingleUser) {
      filteredData.expenses.forEach(exp => {
        if (exp.isPrivate) return;

        const normalizedAmount = normalize(exp.amount, exp.currency);

        let ratioA = 0.5;
        let ratioB = 0.5;

        if (exp.splitType === 'proporcional') {
          const incA = incomesByUser[userAId] || 0;
          const incB = incomesByUser[userBId] || 0;
          ratioA = calcularProrrateo(incA, incB);
          ratioB = 1 - ratioA;
        }

        if (exp.paidBy === userAId || exp.paidBy === 'u1') {
          bOwesA += normalizedAmount * ratioB;
        } else if (exp.paidBy === userBId || exp.paidBy === 'u2') {
          aOwesB += normalizedAmount * ratioA;
        }
      });

      netSettlement = bOwesA - aOwesB;
      simplifiedDebt = simplificarDeudas(aOwesB, bOwesA);
      settlementAmount = simplifiedDebt.monto;
    }

    const totalBudgeted = (filteredData.budgets || []).reduce((acc, curr) => acc + (Number(curr.base) || 0), 0);
    const totalDebtAllocated = (filteredData.accounts || []).filter((a: any) => a.type === 'CREDIT_CARD' || a.type === 'LIABILITY').reduce((acc: any, curr: any) => acc + (Number(curr.balance) || 0), 0);
    const totalSavingsProjects = (filteredData.projects || []).reduce((acc, curr) => acc + (Number(curr.currentAmount) || 0), 0);
    const unallocated = totalIncome - (totalBudgeted + totalDebtAllocated + totalSavingsProjects);

    const needs = (filteredData.budgets || []).filter(b => b.type === 'Necesidad').reduce((acc, curr) => acc + (Number(curr.base) || 0), 0);
    const wants = (filteredData.budgets || []).filter(b => b.type === 'Deseo').reduce((acc, curr) => acc + (Number(curr.base) || 0), 0);
    const savings = (filteredData.budgets || []).filter(b => b.type === 'Ahorro').reduce((acc, curr) => acc + (Number(curr.base) || 0), 0);


    const totalAssets = filteredData.assets.reduce((acc, curr) => acc + curr.value, 0);
    const totalLiabilities = (filteredData.accounts || []).filter((a: any) => a.type === 'CREDIT_CARD' || a.type === 'LIABILITY').reduce((acc: any, curr: any) => acc + (curr.balance || 0), 0);
    const activosLiquidos = (filteredData as any).accounts ? (filteredData as any).accounts.reduce((acc: any, curr: any) => acc + curr.balance, 0) : 0;
    const activosExternos = totalAssets;
    const netWorth = calcularPatrimonio(activosLiquidos, activosExternos, totalLiabilities);

    return {
      totalIncome, unallocated,
      netSettlement: isSingleUser ? 0 : netSettlement,
      settlementAmount: isSingleUser ? 0 : settlementAmount,
      simplifiedDebt,
      needsPct: totalIncome ? (needs / totalIncome) * 100 : 0,
      wantsPct: totalIncome ? (wants / totalIncome) * 100 : 0,
      savingsPct: totalIncome ? (savings / totalIncome) * 100 : 0,
      totalAssets, totalLiabilities, netWorth
    };
  }, [filteredData]);

  if (authLoading) {
    return <div className="min-h-[100dvh] flex items-center justify-center bg-slate-50"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;
  }

  if (!user) {
    return <AuthView />;
  }

  const renderTab = () => {
    switch (activeTab) {
      case 'dashboard': return <DashboardView data={filteredData} calc={calc} methods={methods} />;
      case 'wallet':
      case 'cards':
      case 'debts':
      case 'wealth':
        return <AccountsView data={filteredData} methods={methods} appContext={appContext} />;
      case 'planning':
      case 'budgets':
      case 'projects':
        return <PlanningView data={filteredData} calc={calc} methods={methods} appContext={appContext} defaultSubTab={activeTab === 'projects' ? 'projects' : 'budgets'} />;
      case 'settlement': return <SettlementView data={filteredData} calc={calc} methods={methods} />;
      case 'historical': return <HistoricalView data={filteredData} methods={methods} />;
      case 'settings': return <SettingsView />;
      case 'profile': return <ProfileView data={filteredData} />;
      case 'household': return <ProfileView data={filteredData} />;

      case 'terms': return <TermsView />;
      case 'privacy': return <PrivacyPolicyView />;
      default: return <DashboardView data={filteredData} calc={calc} methods={methods} />;
    }
  };

  const navItems = [
    { id: 'dashboard', icon: <Home size={20} />, label: 'Inicio' },
    { id: 'wallet', icon: <Wallet size={20} />, label: 'Billetera' },
    { id: 'planning', icon: <Target size={20} />, label: 'Planeación' },
    { id: 'settlement', icon: <Users size={20} />, label: 'Hogar' },
    { id: 'historical', icon: <BarChart3 size={20} />, label: 'Historial' },
    { id: 'settings', icon: <Settings size={20} />, label: 'Ajustes' },
  ];

  const renderContextToggle = () => {
    const isPersonal = appContext === 'personal';
    const otherUser = data.users.find(u => u.id !== user?.uid);
    
    return (
      <button 
        onClick={() => setAppContext(isPersonal ? 'household' : 'personal')}
        className={`relative flex items-center justify-center w-10 h-10 rounded-full border-2 shadow-sm overflow-hidden transition-all duration-300 hover:scale-105 active:scale-95 ${isPersonal ? 'border-slate-200 bg-white' : 'border-primary bg-primary/10'}`}
        title={isPersonal ? "Contexto: Personal" : "Contexto: Hogar"}
      >
        {isPersonal ? (
          user?.photoURL ? (
            <img src={user.photoURL} alt="Personal" className="w-full h-full object-cover" />
          ) : (
            <User size={20} className="text-slate-600" />
          )
        ) : (
          otherUser?.photoURL ? (
            <img src={otherUser.photoURL} alt="Hogar" className="w-full h-full object-cover" />
          ) : (
            <Users size={20} className="text-primary" />
          )
        )}
      </button>
    );
  };

  return (
    <div className="min-h-[100dvh] bg-gray-50 text-slate-900 font-sans pb-24 md:pb-0 md:pl-72 relative">
      <nav className="fixed bottom-0 w-full bg-slate-900 text-white flex overflow-x-auto scrollbar-hide p-6 md:flex-col md:justify-start md:w-72 md:h-full md:left-0 md:top-0 md:p-8 z-50 transition-all">
        <div className="hidden md:flex mb-12 items-center gap-3 px-2">
          <OrbitaLogo size={44} />
          <h1 className="text-2xl font-bold tracking-tight text-white font-title">Orbita2</h1>
        </div>

        <div className="flex md:flex-col gap-4 w-full min-w-max">
          {navItems.map(item => {
            const isItemActive = activeTab === item.id ||
              (item.id === 'wallet' && ['cards', 'debts', 'wealth'].includes(activeTab)) ||
              (item.id === 'planning' && ['budgets', 'projects'].includes(activeTab));
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col md:flex-row items-center gap-1 md:gap-3 p-3 md:px-4 md:py-3 rounded-2xl transition-all duration-200 flex-1 md:flex-none relative group ${
                  isItemActive
                    ? 'text-white font-medium bg-primary shadow-md'
                    : 'text-slate-400 font-normal hover:text-white hover:bg-slate-800'
                }`}
              >
                <div className={`relative z-10 transition-transform duration-200 ${isItemActive ? 'scale-105' : 'group-hover:scale-105'}`}>
                  {item.icon}
                </div>
                <span className="text-[10px] md:text-sm whitespace-nowrap relative z-10 tracking-tight">{item.label}</span>
              </button>
            );
          })}
          
          <div className="hidden md:block mt-auto pt-8 border-t border-slate-800">
            <button onClick={() => { setShowInviteModal(true); handleInvite(); }} className="w-full flex items-center gap-3 p-3 rounded-2xl text-primary hover:bg-slate-800 transition-colors font-medium">
              <UserPlus size={18} />
              <span className="text-sm">Invitar integrante</span>
            </button>
            <button onClick={() => authService.logout()} className="w-full mt-2 flex items-center gap-3 p-3 rounded-2xl text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors">
              <LogOut size={18} />
              <span className="text-sm">Cerrar sesión</span>
            </button>
            <div className="mt-6 flex gap-4 justify-center text-xs text-slate-500">
              <button onClick={() => setActiveTab('terms')} className="hover:text-slate-300 transition-colors">Términos</button>
              <button onClick={() => setActiveTab('privacy')} className="hover:text-slate-300 transition-colors">Privacidad</button>
            </div>
          </div>
        </div>
      </nav>

      <main className="p-4 md:p-10 max-w-5xl mx-auto space-y-6 relative z-10">
        <div className="md:hidden flex items-center justify-between mb-6 bg-white p-4 border-b border-[#E5E5E5] -mx-4 -mt-4">
          <div className="flex items-center gap-3">
            <OrbitaLogo size={36} />
            <h1 className="text-xl font-bold tracking-tight text-slate-900 font-title">Orbita2</h1>
          </div>
          <div className="flex items-center gap-3">
            {renderContextToggle()}
            <button onClick={() => { setShowInviteModal(true); handleInvite(); }} className="p-2 text-primary bg-primary/10 rounded-lg">
              <UserPlus size={20} />
            </button>
          </div>
        </div>

        <div className="hidden md:flex justify-end items-center mb-2 -mt-4">
           <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm">
             <span className="text-sm font-bold text-slate-600">{appContext === 'personal' ? 'Personal' : 'Hogar'}</span>
             {renderContextToggle()}
           </div>
        </div>

        {activeTab !== 'settings' && activeTab !== 'historical' && activeTab !== 'terms' && activeTab !== 'privacy' && activeTab !== 'wallet' && activeTab !== 'cards' && activeTab !== 'debts' && activeTab !== 'wealth' && (
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-3 md:p-4 rounded-2xl border border-transparent shadow-sm">
            <div className="flex items-center gap-3 w-full md:w-1/2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider hidden md:block">Periodo:</span>
              <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-full flex-1 md:flex-none">
                <label htmlFor="startDate" className="sr-only">Fecha inicial</label>
                <input id="startDate" type="date" value={dateRange?.start || ''} onChange={e => setDateRange(e.target.value, dateRange?.end || '')} className="px-3 py-2 bg-transparent text-sm font-medium text-slate-700 outline-none transition-all tabular-nums tracking-tight w-full" aria-label="Fecha inicial" />
                <span className="text-slate-300 font-bold">-</span>
                <label htmlFor="endDate" className="sr-only">Fecha final</label>
                <input id="endDate" type="date" value={dateRange?.end || ''} onChange={e => setDateRange(dateRange?.start || '', e.target.value)} className="px-3 py-2 bg-transparent text-sm font-medium text-slate-700 outline-none transition-all tabular-nums tracking-tight w-full" aria-label="Fecha final" />
              </div>
            </div>
            
            <div className="flex gap-2 w-full md:w-1/2 justify-end">
              <button onClick={() => setIsMovementModalOpen(true)} className="flex-1 md:flex-none bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm px-4 py-2.5 rounded-full text-sm font-bold flex items-center justify-center gap-2 transition-colors">
                <Plus size={16} /> Nuevo Movimiento
              </button>
            </div>
          </div>
        )}

        <ErrorBoundary key={activeTab}>
          {renderTab()}
        </ErrorBoundary>
      </main>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-slate-900/60 z-[100] flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm max-w-md w-full relative">
            <h2 className="text-2xl font-bold text-slate-900 mb-2 font-title">Invitar a tu hogar</h2>
            <p className="text-slate-500 mb-6 text-sm">
              Comparte este enlace para que tu pareja se una a tu hogar y gestionen sus finanzas juntos.
            </p>

            {inviteLoading && (
              <div className="flex flex-col items-center justify-center py-6">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-2"></div>
                <p className="text-xs text-slate-400">Generando enlace seguro...</p>
              </div>
            )}

            {inviteError && (
              <div className="bg-amber-50 text-amber-800 p-4 rounded-lg border border-amber-200 text-sm mb-4">
                <p className="font-semibold">{inviteError}</p>
              </div>
            )}

            {inviteLink && !inviteLoading && (
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 flex flex-col gap-3">
                <div className="bg-white p-2.5 rounded border border-slate-200 font-mono text-xs text-slate-700 break-all select-all">
                  {inviteLink}
                </div>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="w-full bg-primary hover:bg-primary/90 text-white py-2 px-4 rounded-lg font-bold text-sm transition-colors flex items-center justify-center gap-2"
                >
                  <Copy size={16} />
                  {copiedLink ? '¡Enlace copiado!' : 'Copiar enlace'}
                </button>
                <p className="text-xs text-slate-400 text-center">
                  ⏳ Este enlace caduca automáticamente en 7 días.
                </p>
              </div>
            )}

            <button
              onClick={() => { setShowInviteModal(false); setInviteError(null); }}
              className="mt-6 w-full bg-slate-100 hover:bg-slate-200 text-slate-700 p-3 rounded-lg font-bold text-sm transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* Join House Modal */}
      {joinHouseConfirm && (
        <div className="fixed inset-0 bg-slate-900/60 z-[100] flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm max-w-md w-full relative text-center">
            <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
              <UserPlus size={32} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2 font-title">
              ¡Te han invitado a un hogar!
            </h2>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-6 text-left">
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">Detalles de la invitación</p>
              <p className="text-sm text-slate-800 font-bold">
                Hogar: <span className="font-normal text-slate-600">{inviteModalData?.householdName || 'Hogar compartido'}</span>
              </p>
              <p className="text-sm text-slate-800 font-bold mt-1">
                Invitado por: <span className="font-normal text-slate-600">{inviteModalData?.inviterName || 'Tu pareja'}</span>
              </p>
            </div>
            <p className="text-slate-600 mb-6 text-sm">
              ¿Deseas unirte a este hogar para compartir finanzas y presupuestos en común?
            </p>
            {joinError && (
              <div className="bg-red-50 text-red-700 p-3 rounded-lg border border-red-200 text-xs mb-4">
                {joinError}
              </div>
            )}
            <div className="flex flex-col gap-3">
              <button
                disabled={joinLoading}
                onClick={() => handleJoinHouse(true)}
                className="w-full bg-primary hover:bg-primary/90 text-white p-3 rounded-lg font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {joinLoading ? 'Uniéndote al hogar...' : 'Unirme al nuevo hogar'}
              </button>
              <button
                disabled={joinLoading}
                onClick={() => handleJoinHouse(false)}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 p-3 rounded-lg font-bold transition-colors disabled:opacity-50"
              >
                Mantenerme en mi hogar actual
              </button>
            </div>
          </div>
        </div>
      )}



      {/* Modal for Unified Movement (F3.1) */}
      <Modal
        isOpen={isMovementModalOpen}
        onClose={() => setIsMovementModalOpen(false)}
        title="Nuevo Movimiento"
      >
        {isMovementModalOpen && (
          <MovementForm
            categories={data.categories}
            accounts={data.accounts}
            currentUserId={user?.uid}
            appContext={appContext}
            onSubmit={async (action) => {
              if (action.type === 'EXPENSE') {
                await methods.addExpense(action.payload);
              } else if (action.type === 'INCOME') {
                await methods.addIncome(action.payload);
              } else if (action.type === 'TRANSFER') {
                await methods.payCreditCard(
                  action.payload.sourceAccountId,
                  action.payload.targetAccountId,
                  action.payload.amount,
                  action.payload.date,
                  action.payload.ownerUid,
                  action.payload.isShared
                );
              }
              setIsMovementModalOpen(false);
            }}
            onCancel={() => setIsMovementModalOpen(false)}
          />
        )}
      </Modal>

      {/* Toast Notifications */}
      <ToastContainer />
    </div>
  );
}
