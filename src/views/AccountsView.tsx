import React, { useState, useMemo } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  CreditCard,
  Wallet,
  PiggyBank,
  Flame,
  Building2,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  ShieldCheck
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { AccountForm } from '../components/forms/AccountForm';
import { AssetForm } from '../components/forms/AssetForm';
import { CreditCardPaymentModal } from '../components/forms/CreditCardPaymentModal';
import { DebtSimulatorView } from './DebtSimulatorView';
import { FormatCurrency } from '../utils';
import {
  calculateAccountAvailableBalance,
  calculateCreditCardMetrics,
  calculateLiquidWealth
} from '../utils/walletCalculations';

export interface AccountsViewProps {
  data?: any;
  methods?: any;
  appContext?: string;
}

export function AccountsView({ data = {}, methods = {}, appContext = 'household' }: AccountsViewProps) {
  // Pestaña activa: Billetera unificada vs Simulador de Deuda
  const [activeTab, setActiveTab] = useState<'wallet' | 'debts'>('wallet');

  // Estado del modal de cuentas
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<any>(null);

  // Estado del modal de pago de tarjeta
  const [selectedCardForPayment, setSelectedCardForPayment] = useState<any>(null);

  // Estado para la sección colapsable de bienes e inversiones externas
  const [isExternalAssetsOpen, setIsExternalAssetsOpen] = useState(false);
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<any>(null);

  const rawAccounts: any[] = data?.accounts || [];
  const projects: any[] = data?.projects || [];
  const assets: any[] = data?.assets || [];
  const users: any[] = data?.users || [];

  const currentSlot = data?.memberSlot || data?.user?.memberSlot;

  // Filtrado estricto por contexto:
  // - En modo 'Hogar': Listar y sumar al patrimonio exclusivamente cuentas compartidas (ownerType === 'SHARED').
  //   Las cuentas personales NO deben sumarse al balance general de Hogar ni mostrarse en esta vista.
  // - En modo 'Personal': Listar y sumar exclusivamente las cuentas del usuario activo (ownerType === memberSlot).
  //   Las cuentas de la pareja deben ser estrictamente invisibles (sin montos, fechas de corte ni límites).
  const accounts = useMemo(() => {
    if (appContext === 'personal') {
      if (!currentSlot) return [];
      return rawAccounts.filter((a: any) => a?.ownerType === currentSlot);
    }
    return rawAccounts.filter((a: any) => a?.ownerType === 'SHARED');
  }, [rawAccounts, appContext, currentSlot]);

  // Cálculos consolidados para el Hero de Patrimonio Líquido
  const liquidWealthMetrics = calculateLiquidWealth(accounts, projects);
  const totalExternalAssets = assets.reduce((sum, a) => sum + (Number(a?.value) || 0), 0);

  // Clasificación de cuentas
  const debitAccounts = accounts.filter((a) => {
    const t = (a?.type || '').toUpperCase();
    return t === 'ASSET' || t === 'BANK_ACCOUNT' || t === 'CASH' || t === 'DEBIT';
  });

  const creditAccounts = accounts.filter((a) => {
    const t = (a?.type || '').toUpperCase();
    return t === 'LIABILITY' || t === 'CREDIT_CARD';
  });

  // Manejo de modal de cuenta
  const handleOpenModal = (account = null) => {
    setEditingAccount(account);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingAccount(null);
    setIsModalOpen(false);
  };

  const handleSubmit = async (formData: any) => {
    try {
      if (editingAccount) {
        if (methods?.updateAccount) {
          await methods.updateAccount(editingAccount.id, formData);
        }
      } else {
        const createFn = methods?.createAccount || methods?.addAccount;
        if (createFn) {
          await createFn(formData);
        }
      }
      handleCloseModal();
    } catch (err) {
      console.error('Error al guardar la cuenta:', err);
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = typeof window !== 'undefined' && window.confirm ? window.confirm('¿Estás seguro de eliminar esta cuenta?') : true;
    if (confirmed) {
      if (methods?.deleteAccount) {
        await methods.deleteAccount(id);
      }
    }
  };

  // Manejo de activos externos (bienes e inversiones)
  const handleOpenAssetModal = (asset = null) => {
    setEditingAsset(asset);
    setIsAssetModalOpen(true);
  };

  const handleCloseAssetModal = () => {
    setEditingAsset(null);
    setIsAssetModalOpen(false);
  };

  const handleAssetSubmit = async (formData: any) => {
    try {
      if (editingAsset) {
        if (methods?.updateAsset) {
          await methods.updateAsset(editingAsset.id, formData);
        }
      } else {
        if (methods?.addAsset) {
          await methods.addAsset(formData);
        }
      }
      handleCloseAssetModal();
    } catch (err) {
      console.error('Error al guardar activo externo:', err);
    }
  };

  const handleAssetDelete = async (id: string) => {
    const confirmed = typeof window !== 'undefined' && window.confirm ? window.confirm('¿Estás seguro de eliminar este activo?') : true;
    if (confirmed) {
      if (methods?.deleteAsset) {
        await methods.deleteAsset(id);
      }
    }
  };

  // Manejo de pago de tarjeta de crédito
  const handlePayCreditCard = async (sourceAccountId: string, targetAccountId: string, amount: number) => {
    if (methods?.payCreditCard) {
      const today = new Date().toISOString().split('T')[0];
      const ownerUid = data?.user?.uid || data?.user?.id || '';
      const isShared = appContext === 'household';
      await methods.payCreditCard(sourceAccountId, targetAccountId, amount, today, ownerUid, isShared);
    }
  };

  // Semáforo para utilización de crédito: verde < 30%, amarillo 30-70%, rojo > 70%
  const getUtilizationColor = (pct: number) => {
    if (pct < 30) {
      return {
        bar: 'bg-emerald-400',
        text: 'text-emerald-400',
        badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30'
      };
    }
    if (pct <= 70) {
      return {
        bar: 'bg-amber-400',
        text: 'text-amber-400',
        badge: 'bg-amber-500/20 text-amber-300 border-amber-400/30'
      };
    }
    return {
      bar: 'bg-rose-500',
      text: 'text-rose-400',
      badge: 'bg-rose-500/20 text-rose-300 border-rose-400/30'
    };
  };

  return (
    <div className="space-y-8 animate-in">
      {/* Cabecera principal con sub-navegación segmentada */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-slate-800">Billetera Unificada</h2>
          <p className="text-slate-600 mt-1 font-medium">
            Gestiona tus cuentas de débito, apartados, tarjetas de crédito y patrimonio líquido.
          </p>
        </div>
        {activeTab === 'wallet' && (
          <Button onClick={() => handleOpenModal()} className="self-start sm:self-auto">
            <Plus size={18} className="mr-2" /> Nueva Cuenta
          </Button>
        )}
      </div>

      {/* Sub-navegación segmentada: [ Mis Cuentas y Tarjetas | Simulador de Deuda ] */}
      <div className="flex bg-slate-200/70 p-1.5 rounded-2xl backdrop-blur-sm border border-slate-200 w-fit">
        <button
          type="button"
          onClick={() => setActiveTab('wallet')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
            activeTab === 'wallet'
              ? 'bg-white shadow-md text-slate-900 scale-100'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Wallet size={18} />
          <span>Mis Cuentas y Tarjetas</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('debts')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
            activeTab === 'debts'
              ? 'bg-white shadow-md text-indigo-600 scale-100'
              : 'text-slate-600 hover:text-indigo-600'
          }`}
        >
          <Flame size={18} />
          <span>Simulador de Deuda</span>
        </button>
      </div>

      {/* Vista de Simulador de Deuda */}
      {activeTab === 'debts' ? (
        <DebtSimulatorView {...({ accounts, data: { ...(data || {}), accounts } } as any)} />
      ) : (
        <>
          {/* a) KPI Hero Superior de Patrimonio Líquido */}
          <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-[32px] p-7 md:p-8 text-white shadow-2xl relative overflow-hidden border border-slate-800">
            {/* Glow atmosférico */}
            <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                    <ShieldCheck size={18} />
                  </div>
                  <span className="text-xs uppercase font-bold tracking-widest text-indigo-300">
                    Patrimonio Líquido Consolidado
                  </span>
                </div>
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl md:text-5xl font-black tracking-tight tabular-nums">
                    {FormatCurrency(liquidWealthMetrics.liquidWealth)}
                  </span>
                </div>
                <p className="text-xs text-slate-300 max-w-xl font-medium">
                  Disponible real descontando compromisos de tarjetas de crédito del total en cuentas de débito y efectivo.
                </p>
              </div>

              {/* Métricas secundarias de activos y pasivos líquidos */}
              <div className="flex flex-wrap sm:flex-nowrap gap-3">
                <div className="bg-white/10 border border-white/15 rounded-2xl px-4 py-3 backdrop-blur-md min-w-[145px]">
                  <div className="flex items-center gap-1.5 text-emerald-300 text-xs font-semibold mb-1">
                    <TrendingUp size={14} />
                    <span>Activos Líquidos</span>
                  </div>
                  <p className="text-lg font-black text-white tabular-nums">
                    {FormatCurrency(liquidWealthMetrics.totalLiquidAssets)}
                  </p>
                  <span className="text-[10px] text-slate-400">Débito + Apartados</span>
                </div>

                <div className="bg-white/10 border border-white/15 rounded-2xl px-4 py-3 backdrop-blur-md min-w-[145px]">
                  <div className="flex items-center gap-1.5 text-rose-300 text-xs font-semibold mb-1">
                    <TrendingDown size={14} />
                    <span>Deuda Tarjetas</span>
                  </div>
                  <p className="text-lg font-black text-white tabular-nums">
                    {FormatCurrency(liquidWealthMetrics.totalCreditDebt)}
                  </p>
                  <span className="text-[10px] text-slate-400">Pasivo en uso</span>
                </div>
              </div>
            </div>

            {/* Botón secundario discreto: Acordeón de Activos Físicos / Externos */}
            <div className="relative z-10 mt-6 pt-5 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setIsExternalAssetsOpen((prev) => !prev)}
                aria-expanded={isExternalAssetsOpen}
                aria-label="Ver / Registrar Bienes e Inversiones Externas"
                className="inline-flex items-center gap-2 text-xs font-bold text-indigo-200 hover:text-white bg-white/10 hover:bg-white/20 border border-white/15 px-3.5 py-2 rounded-xl transition-all cursor-pointer backdrop-blur-sm"
              >
                <Building2 size={15} />
                <span>
                  {isExternalAssetsOpen
                    ? 'Ocultar Bienes e Inversiones Externas'
                    : 'Ver / Registrar Bienes e Inversiones Externas'}
                </span>
                {isExternalAssetsOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>

              {totalExternalAssets > 0 && (
                <span className="text-xs text-slate-300 font-medium">
                  Bienes registrados:{' '}
                  <strong className="text-white font-bold">{FormatCurrency(totalExternalAssets)}</strong>
                </span>
              )}
            </div>

            {/* Panel colapsable de Bienes e Inversiones Externas */}
            {isExternalAssetsOpen && (
              <div className="relative z-10 mt-5 p-5 bg-white/10 rounded-2xl border border-white/15 backdrop-blur-md space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="font-bold text-sm text-white">Bienes e Inversiones Externas (No Líquidos)</h4>
                    <p className="text-xs text-slate-300">
                      Inmuebles, autos, inversiones o bienes patrimoniales que no forman parte del circulante.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleOpenAssetModal()}
                    className="flex items-center gap-1.5 bg-white text-slate-900 px-3.5 py-2 rounded-xl text-xs font-bold shadow-sm hover:bg-slate-100 transition-colors cursor-pointer self-start sm:self-auto"
                  >
                    <Plus size={14} /> Registrar Bien / Inversión
                  </button>
                </div>

                {assets.length === 0 ? (
                  <p className="text-xs text-slate-300 italic py-2">
                    No tienes bienes o inversiones externas registradas. Haz clic en "Registrar Bien / Inversión" para añadirlos.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
                    {assets.filter(Boolean).map((asset: any) => (
                      <div
                        key={asset.id}
                        className="bg-black/25 border border-white/10 rounded-xl p-3.5 flex justify-between items-center group hover:border-white/25 transition-all"
                      >
                        <div>
                          <p className="text-sm font-bold text-white">{asset.name}</p>
                          <p className="text-[11px] text-slate-300">
                            {asset.type} • {asset.owner || 'Compartido'}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-emerald-300 tabular-nums">
                            {FormatCurrency(Number(asset.value) || 0)}
                          </span>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              type="button"
                              onClick={() => handleOpenAssetModal(asset)}
                              className="p-1 text-slate-300 hover:text-white transition-colors"
                              title="Editar"
                            >
                              <Edit2 size={13} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleAssetDelete(asset.id)}
                              className="p-1 text-slate-300 hover:text-rose-400 transition-colors"
                              title="Eliminar"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* b) Bloque de Cuentas Débito / Efectivo (ASSET / CASH) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
                  <Wallet size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800 tracking-tight">Cuentas Débito y Efectivo</h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Saldos disponibles para gastos corrientes y apartados de proyectos
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-lg">
                {debitAccounts.length} {debitAccounts.length === 1 ? 'cuenta' : 'cuentas'}
              </span>
            </div>

            {debitAccounts.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 border border-dashed border-slate-200 rounded-3xl">
                <p className="text-sm text-slate-500 font-medium">No tienes cuentas de débito o efectivo registradas.</p>
                <Button size="sm" onClick={() => handleOpenModal()} className="mt-3">
                  <Plus size={16} className="mr-1" /> Añadir Cuenta Débito
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {debitAccounts.map((account) => {
                  const { ledgerBalance, allocatedBalance, availableBalance } =
                    calculateAccountAvailableBalance(account, projects);

                  return (
                    <div
                      key={account.id}
                      className={`${
                        account.color || 'bg-slate-800'
                      } rounded-[32px] p-7 text-white shadow-xl relative overflow-hidden group hover:scale-[1.01] transition-all duration-300`}
                    >
                      {/* Efectos visuales de resplandor */}
                      <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-60 pointer-events-none" />
                      <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-700 pointer-events-none" />
                      <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-black/20 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-700 pointer-events-none" />

                      {/* Botones de acción rápida */}
                      <div className="absolute top-5 right-5 flex gap-2 z-20">
                        <button
                          type="button"
                          onClick={() => handleOpenModal(account)}
                          className="p-2 bg-slate-900/30 hover:bg-slate-900/50 backdrop-blur-sm rounded-full transition-colors text-white cursor-pointer"
                          title="Editar cuenta"
                        >
                          <Edit2 size={15} />
                        </button>
                        {!account.systemKey && (
                          <button
                            type="button"
                            onClick={() => handleDelete(account.id)}
                            className="p-2 bg-rose-500/50 hover:bg-rose-500/80 backdrop-blur-sm rounded-full transition-colors text-white cursor-pointer"
                            title="Eliminar cuenta"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>

                      <div className="relative z-10 pr-20 mb-6">
                        <h4 className="text-2xl font-black tracking-tight">{account.name}</h4>
                        <div className="flex flex-wrap gap-2 mt-2.5">
                          <span className="text-[10px] bg-black/25 px-2.5 py-1 rounded-lg font-bold uppercase tracking-wider border border-white/10 backdrop-blur-sm">
                            {account.ownerType === 'SHARED' ? 'Uso Compartido' : 'Uso Individual'}
                          </span>
                          <span className="text-[10px] bg-white/20 px-2.5 py-1 rounded-lg font-bold uppercase tracking-wider border border-white/10 backdrop-blur-sm">
                            Débito / Efectivo
                          </span>
                        </div>
                      </div>

                      <div className="bg-white/10 p-5 rounded-[22px] backdrop-blur-md relative z-10 border border-white/15 shadow-inner space-y-4">
                        {/* Saldo Disponible - GRANDE Y DESTACADO */}
                        <div>
                          <p className="text-xs opacity-80 uppercase tracking-wider font-bold mb-1">
                            Saldo Disponible
                          </p>
                          <p className="text-3xl sm:text-4xl font-black tracking-tight text-white tabular-nums">
                            {FormatCurrency(availableBalance)}
                          </p>
                        </div>

                        {/* En Apartados / Cajitas - Visible con badge sutil si es > 0 */}
                        {allocatedBalance > 0 && (
                          <div className="flex items-center justify-between bg-indigo-500/25 border border-indigo-300/30 px-3.5 py-2 rounded-xl backdrop-blur-sm">
                            <div className="flex items-center gap-2 text-indigo-100 text-xs font-semibold">
                              <PiggyBank size={16} className="text-indigo-200 shrink-0" />
                              <span>En Apartados / Cajitas:</span>
                            </div>
                            <span className="font-bold text-white text-xs tabular-nums">
                              {FormatCurrency(allocatedBalance)}
                            </span>
                          </div>
                        )}

                        {/* Saldo Total Contable */}
                        <div className="flex justify-between items-center text-xs pt-3 border-t border-white/15">
                          <span className="opacity-80 font-medium">Saldo Total Contable:</span>
                          <span className="font-bold text-white tabular-nums text-sm">
                            {FormatCurrency(ledgerBalance)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* c) Bloque de Tarjetas de Crédito (LIABILITY / CREDIT_CARD) */}
          <div className="space-y-4 pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-100 text-indigo-700 rounded-xl">
                  <CreditCard size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800 tracking-tight">Tarjetas de Crédito</h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Límites, deudas vigentes, disponibilidad de crédito y pagos
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-lg">
                {creditAccounts.length} {creditAccounts.length === 1 ? 'tarjeta' : 'tarjetas'}
              </span>
            </div>

            {creditAccounts.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 border border-dashed border-slate-200 rounded-3xl">
                <p className="text-sm text-slate-500 font-medium">No tienes tarjetas de crédito registradas.</p>
                <Button size="sm" onClick={() => handleOpenModal()} className="mt-3">
                  <Plus size={16} className="mr-1" /> Añadir Tarjeta de Crédito
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {creditAccounts.map((account) => {
                  const { currentDebt, positiveBalance, creditAvailable, utilizationPercentage } =
                    calculateCreditCardMetrics(account);
                  const colorConfig = getUtilizationColor(utilizationPercentage);
                  const rawBalance = Number(account?.balance) || 0;

                  return (
                    <div
                      key={account.id}
                      className={`${
                        account.color || 'bg-slate-900'
                      } rounded-[32px] p-7 text-white shadow-xl relative overflow-hidden group hover:scale-[1.01] transition-all duration-300 flex flex-col justify-between`}
                    >
                      {/* Efectos de fondo */}
                      <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-50 pointer-events-none" />
                      <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-700 pointer-events-none" />
                      <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-black/30 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-700 pointer-events-none" />

                      {/* Botones de acción rápida */}
                      <div className="absolute top-5 right-5 flex gap-2 z-20">
                        <button
                          type="button"
                          onClick={() => handleOpenModal(account)}
                          className="p-2 bg-slate-900/40 hover:bg-slate-900/60 backdrop-blur-sm rounded-full transition-colors text-white cursor-pointer"
                          title="Editar tarjeta"
                        >
                          <Edit2 size={15} />
                        </button>
                        {!account.systemKey && (
                          <button
                            type="button"
                            onClick={() => handleDelete(account.id)}
                            className="p-2 bg-rose-500/50 hover:bg-rose-500/80 backdrop-blur-sm rounded-full transition-colors text-white cursor-pointer"
                            title="Eliminar tarjeta"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>

                      {/* Header de la tarjeta */}
                      <div className="relative z-10 pr-20 mb-6">
                        <h4 className="text-2xl font-black tracking-tight">{account.name}</h4>
                        <div className="flex flex-wrap gap-2 mt-2.5">
                          <span className="text-[10px] bg-black/30 px-2.5 py-1 rounded-lg font-bold uppercase tracking-wider border border-white/10 backdrop-blur-sm">
                            {account.ownerType === 'SHARED' ? 'Uso Compartido' : 'Uso Individual'}
                          </span>
                          <span className="text-[10px] bg-indigo-500/30 px-2.5 py-1 rounded-lg font-bold uppercase tracking-wider border border-indigo-400/20 backdrop-blur-sm">
                            Crédito
                          </span>
                        </div>
                      </div>

                      {/* Contenedor métricas de tarjeta */}
                      <div className="bg-white/10 p-5 rounded-[22px] backdrop-blur-md relative z-10 border border-white/15 shadow-inner space-y-4">
                        {/* Métricas principales: Deuda Actual / Saldo a favor y Crédito Disponible */}
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            {rawBalance > 0 ? (
                              <div>
                                <p className="text-xs opacity-80 uppercase tracking-wider font-bold mb-1">
                                  Deuda Actual
                                </p>
                                <p className="text-3xl sm:text-4xl font-black tracking-tight text-white tabular-nums">
                                  {FormatCurrency(currentDebt)}
                                </p>
                              </div>
                            ) : rawBalance < 0 ? (
                              <div>
                                <p className="text-xs opacity-80 uppercase tracking-wider font-bold mb-1">
                                  Estado de Cuenta
                                </p>
                                <div className="mt-1 inline-flex items-center gap-1.5 bg-emerald-500/25 text-emerald-200 border border-emerald-400/30 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold backdrop-blur-sm">
                                  <CheckCircle2 size={15} className="shrink-0" />
                                  <span>Saldo a favor: {FormatCurrency(positiveBalance)}</span>
                                </div>
                              </div>
                            ) : (
                              <div>
                                <p className="text-xs opacity-80 uppercase tracking-wider font-bold mb-1">
                                  Deuda Actual
                                </p>
                                <p className="text-3xl sm:text-4xl font-black tracking-tight text-white tabular-nums">
                                  {FormatCurrency(0)}
                                </p>
                                <p className="text-[11px] text-emerald-300 font-medium mt-1">
                                  Al corriente • Sin deuda
                                </p>
                              </div>
                            )}
                          </div>

                          <div className="text-right">
                            <p className="text-xs opacity-80 uppercase tracking-wider font-bold mb-1">
                              Crédito Disponible
                            </p>
                            <p className="text-xl sm:text-2xl font-black tracking-tight text-white tabular-nums">
                              {FormatCurrency(creditAvailable)}
                            </p>
                          </div>
                        </div>

                        {/* Barra de utilización con semáforo */}
                        <div className="space-y-1.5 pt-3 border-t border-white/15">
                          <div className="flex justify-between items-center text-xs">
                            <span className="opacity-80 font-medium">
                              Límite: {FormatCurrency(account.creditLimit || 0)}
                            </span>
                            <span className={`font-bold ${colorConfig.text}`}>
                              Utilización: {utilizationPercentage.toFixed(0)}%
                            </span>
                          </div>
                          <div className="w-full h-2 bg-black/30 rounded-full overflow-hidden border border-white/10">
                            <div
                              className={`h-full ${colorConfig.bar} rounded-full transition-all duration-500`}
                              style={{ width: `${utilizationPercentage}%` }}
                            />
                          </div>
                        </div>

                        {/* Fechas de corte y pago */}
                        <div className="flex justify-between items-center text-xs font-semibold pt-3 border-t border-white/15">
                          <span className="opacity-80">Corte: Día {account.cutDay ?? '—'}</span>
                          <span className="bg-white/15 px-3 py-1 rounded-lg text-white border border-white/10 backdrop-blur-sm">
                            Pago: Día {account.paymentDay ?? '—'}
                          </span>
                        </div>

                        {/* Botón de acción rápida: Pagar Tarjeta */}
                        <button
                          type="button"
                          onClick={() => setSelectedCardForPayment(account)}
                          className="w-full mt-2 flex items-center justify-center gap-2 bg-white text-slate-900 py-2.5 px-4 rounded-xl text-sm font-bold shadow-sm hover:bg-slate-100 hover:shadow-md transition-all cursor-pointer"
                        >
                          <CreditCard size={16} />
                          <span>Pagar Tarjeta</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}

      {/* Modal de Creación / Edición de Cuentas */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingAccount ? 'Editar Cuenta' : 'Nueva Cuenta'}
      >
        {isModalOpen && (
          <AccountForm
            key={editingAccount?.id || 'new'}
            initialData={editingAccount}
            users={users}
            appContext={appContext}
            onSubmit={handleSubmit}
            onCancel={handleCloseModal}
          />
        )}
      </Modal>

      {/* Modal Dedicado de Pago de Tarjeta de Crédito */}
      <CreditCardPaymentModal
        isOpen={!!selectedCardForPayment}
        onClose={() => setSelectedCardForPayment(null)}
        targetAccount={selectedCardForPayment}
        sourceAccounts={accounts}
        onPay={handlePayCreditCard}
      />

      {/* Modal de Bienes e Inversiones Externas */}
      <Modal
        isOpen={isAssetModalOpen}
        onClose={handleCloseAssetModal}
        title={editingAsset ? 'Editar Bien / Inversión' : 'Registrar Bien / Inversión'}
      >
        {isAssetModalOpen && (
          <AssetForm
            initialData={editingAsset}
            users={users}
            onSubmit={handleAssetSubmit}
            onCancel={handleCloseAssetModal}
          />
        )}
      </Modal>
    </div>
  );
}
