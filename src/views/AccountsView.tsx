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

  // Semáforo para utilización de crédito (DESIGN.md): Menta < 30%, Ámbar 30-70%, Coral > 70%
  const getUtilizationColor = (pct: number) => {
    if (pct < 30) {
      return {
        bar: 'bg-[#10B981]',
        text: 'text-[#10B981]',
        badge: 'bg-[#E8F8F0]/20 text-[#10B981] border-[#10B981]/30'
      };
    }
    if (pct <= 70) {
      return {
        bar: 'bg-[#F59E0B]',
        text: 'text-[#F59E0B]',
        badge: 'bg-amber-500/20 text-amber-300 border-amber-400/30'
      };
    }
    return {
      bar: 'bg-[#F97316]',
      text: 'text-[#F97316]',
      badge: 'bg-[#FDEFEA]/20 text-[#F97316] border-[#F97316]/30'
    };
  };

  return (
    <div className="space-y-6 animate-in">
      {/* Cabecera principal con sub-navegación segmentada en Bento */}
      <div className="bg-white p-6 rounded-3xl border border-[#EEF0F4] shadow-bento flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#E8F8F0] text-[#10B981]">
              <Wallet size={24} />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                Billetera Unificada
              </h2>
              <p className="text-slate-500 text-sm mt-0.5">
                Gestiona tus cuentas de débito, apartados, tarjetas de crédito y patrimonio líquido.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-start md:justify-end">
          {/* Sub-navegación tipo píldora minimalista */}
          <div className="bg-[#F5F6FA] border border-[#EEF0F4] rounded-full p-1.5 shadow-sm inline-flex items-center">
            <button
              type="button"
              onClick={() => setActiveTab('wallet')}
              className={`flex items-center gap-2 rounded-full px-5 py-2 text-xs sm:text-sm font-medium transition-colors duration-150 cursor-pointer ${
                activeTab === 'wallet'
                  ? 'bg-[#111319] text-white shadow-sm'
                  : 'text-[#8C93A6] hover:text-slate-900'
              }`}
            >
              <Wallet size={16} />
              <span>Mis Cuentas</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('debts')}
              className={`flex items-center gap-2 rounded-full px-5 py-2 text-xs sm:text-sm font-medium transition-colors duration-150 cursor-pointer ${
                activeTab === 'debts'
                  ? 'bg-[#111319] text-white shadow-sm'
                  : 'text-[#8C93A6] hover:text-slate-900'
              }`}
            >
              <Flame size={16} />
              <span>Simulador de Deuda</span>
            </button>
          </div>

          {activeTab === 'wallet' && (
            <button
              type="button"
              onClick={() => handleOpenModal()}
              className="flex items-center gap-2 bg-[#111319] hover:bg-[#1A1D26] text-white rounded-full px-5 py-2.5 font-medium transition-colors duration-150 shadow-sm cursor-pointer"
            >
              <Plus size={18} />
              <span>Nueva Cuenta</span>
            </button>
          )}
        </div>
      </div>

      {/* Vista de Simulador de Deuda */}
      {activeTab === 'debts' ? (
        <DebtSimulatorView {...({ accounts, data: { ...(data || {}), accounts } } as any)} />
      ) : (
        <>
          {/* a) KPI Hero Superior de Patrimonio Líquido */}
          <div className="bg-[#111319] border border-[#232733] rounded-3xl p-6 sm:p-8 text-white shadow-bento relative overflow-hidden group">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-xl bg-[#E8F8F0]/15 text-[#10B981] border border-[#10B981]/30">
                    <ShieldCheck size={18} />
                  </span>
                  <span className="text-xs uppercase font-bold tracking-widest text-slate-400">
                    Patrimonio Líquido Consolidado
                  </span>
                </div>
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl md:text-5xl font-black tracking-tight text-white tabular-nums">
                    {FormatCurrency(liquidWealthMetrics.liquidWealth)}
                  </span>
                </div>
                <p className="text-xs text-slate-400 max-w-xl font-medium">
                  Disponible real descontando compromisos de tarjetas de crédito del total en cuentas de débito y efectivo.
                </p>
              </div>

              {/* Métricas secundarias de activos y pasivos líquidos */}
              <div className="flex flex-wrap sm:flex-nowrap gap-3">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 min-w-[150px]">
                  <div className="flex items-center gap-1.5 text-[#10B981] text-xs font-semibold mb-1">
                    <TrendingUp size={14} />
                    <span>Activos Líquidos</span>
                  </div>
                  <p className="text-xl font-bold text-white tabular-nums">
                    {FormatCurrency(liquidWealthMetrics.totalLiquidAssets)}
                  </p>
                  <span className="text-[11px] text-slate-400 mt-0.5 block">Débito + Apartados</span>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 min-w-[150px]">
                  <div className="flex items-center gap-1.5 text-[#F97316] text-xs font-semibold mb-1">
                    <TrendingDown size={14} />
                    <span>Deuda Tarjetas</span>
                  </div>
                  <p className="text-xl font-bold text-white tabular-nums">
                    {FormatCurrency(liquidWealthMetrics.totalCreditDebt)}
                  </p>
                  <span className="text-[11px] text-slate-400 mt-0.5 block">Pasivo en uso</span>
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
                className="inline-flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-white bg-white/10 hover:bg-white/15 border border-white/10 px-3.5 py-2 rounded-full transition-colors cursor-pointer"
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
                <span className="text-xs text-slate-400 font-medium">
                  Bienes registrados:{' '}
                  <strong className="text-white font-bold tabular-nums">{FormatCurrency(totalExternalAssets)}</strong>
                </span>
              )}
            </div>

            {/* Panel colapsable de Bienes e Inversiones Externas */}
            {isExternalAssetsOpen && (
              <div className="relative z-10 bg-[#1A1D26] border border-[#232733] rounded-2xl p-5 mt-4 space-y-4 animate-in fade-in duration-300">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="font-bold text-sm text-white">Bienes e Inversiones Externas (No Líquidos)</h4>
                    <p className="text-xs text-slate-400">
                      Inmuebles, autos, inversiones o bienes patrimoniales que no forman parte del circulante.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleOpenAssetModal()}
                    className="flex items-center gap-1.5 bg-white hover:bg-slate-100 text-slate-900 px-3.5 py-2 rounded-full text-xs font-semibold shadow-sm transition-colors cursor-pointer self-start sm:self-auto"
                  >
                    <Plus size={14} /> <span>Registrar Bien / Inversión</span>
                  </button>
                </div>

                {assets.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-2">
                    No tienes bienes o inversiones externas registradas. Haz clic en "Registrar Bien / Inversión" para añadirlos.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
                    {assets.filter(Boolean).map((asset: any) => (
                      <div
                        key={asset.id}
                        className="bg-white/5 border border-white/10 rounded-xl p-3.5 flex justify-between items-center group hover:border-white/20 transition-all"
                      >
                        <div>
                          <p className="text-sm font-bold text-white">{asset.name}</p>
                          <p className="text-[11px] text-slate-400">
                            {asset.type} • {asset.owner || 'Compartido'}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-[#10B981] tabular-nums">
                            {FormatCurrency(Number(asset.value) || 0)}
                          </span>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              type="button"
                              onClick={() => handleOpenAssetModal(asset)}
                              className="p-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
                              title="Editar"
                            >
                              <Edit2 size={13} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleAssetDelete(asset.id)}
                              className="p-1 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
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
                <div className="p-2.5 bg-[#E8F8F0] text-[#10B981] rounded-2xl">
                  <Wallet size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 tracking-tight">Cuentas Débito y Efectivo</h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Saldos disponibles para gastos corrientes y apartados de proyectos
                  </p>
                </div>
              </div>
              <span className="text-xs font-semibold text-slate-500 bg-[#F1F5F9] px-2.5 py-1 rounded-full tabular-nums">
                {debitAccounts.length} {debitAccounts.length === 1 ? 'cuenta' : 'cuentas'}
              </span>
            </div>

            {debitAccounts.length === 0 ? (
              <div className="p-8 text-center bg-white border border-[#EEF0F4] rounded-3xl shadow-bento space-y-3">
                <Wallet size={36} className="mx-auto text-slate-400" />
                <h4 className="text-base font-bold text-slate-800">No tienes cuentas de débito o efectivo registradas</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Registra tus cuentas bancarias o billeteras de efectivo para controlar tus saldos disponibles.
                </p>
                <button
                  type="button"
                  onClick={() => handleOpenModal()}
                  className="mt-2 inline-flex items-center gap-2 bg-[#111319] hover:bg-[#1A1D26] text-white rounded-full px-4 py-2 text-xs font-medium transition-colors shadow-sm cursor-pointer"
                >
                  <Plus size={16} />
                  <span>Añadir Cuenta Débito</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {debitAccounts.map((account) => {
                  const { ledgerBalance, allocatedBalance, availableBalance } =
                    calculateAccountAvailableBalance(account, projects);

                  return (
                    <div
                      key={account.id}
                      className="bg-white border border-[#EEF0F4] rounded-2xl p-4 sm:p-5 shadow-bento hover:border-slate-300 transition-all flex flex-col justify-between group"
                    >
                      <div>
                        {/* Cabecera de la cuenta */}
                        <div className="flex items-start justify-between gap-3 mb-4">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-[#F8FAFC] border border-[#EEF0F4] flex items-center justify-center text-slate-700 shrink-0">
                              <Wallet size={15} />
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-base font-bold text-slate-900 truncate">
                                {account.name}
                              </h4>
                              <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                                <span className="text-[10px] bg-[#E8F8F0] text-[#10B981] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider">
                                  {account.ownerType === 'SHARED' ? 'Compartido' : 'Individual'}
                                </span>
                                <span className="text-[10px] bg-[#F1F5F9] text-[#64748B] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider">
                                  Débito
                                </span>
                                {account.ownerType !== 'SHARED' && (
                                  <span
                                    data-testid={`account-partner-status-${account.id}`}
                                    className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider ${
                                      account.allowPartnerTransfers
                                        ? 'bg-[#E8F8F0] text-[#10B981]'
                                        : 'bg-[#F1F5F9] text-slate-400'
                                    }`}
                                  >
                                    {account.allowPartnerTransfers ? 'Transferible' : 'Privado'}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Acciones */}
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                            <button
                              type="button"
                              onClick={() => handleOpenModal(account)}
                              className="p-1.5 text-slate-400 hover:text-slate-900 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                              title="Editar cuenta"
                            >
                              <Edit2 size={13} />
                            </button>
                            {!account.systemKey && (
                              <button
                                type="button"
                                onClick={() => handleDelete(account.id)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                                title="Eliminar cuenta"
                              >
                                <Trash2 size={13} />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Saldo Disponible */}
                        <div className="mb-3">
                          <p className="text-xs uppercase font-semibold text-slate-400 tracking-wider mb-0.5">
                            Saldo Disponible
                          </p>
                          <p className="text-2xl font-bold text-slate-900 tracking-tight tabular-nums">
                            {FormatCurrency(availableBalance)}
                          </p>
                        </div>

                        {/* En Apartados / Cajitas */}
                        {allocatedBalance > 0 && (
                          <div className="mb-3 bg-[#EEF2FF] border border-[#6366F1]/10 rounded-xl p-2.5 text-[#6366F1] font-medium text-xs flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <PiggyBank size={15} className="text-[#6366F1] shrink-0" />
                              <span>En Apartados:</span>
                            </div>
                            <span className="font-bold tabular-nums">
                              {FormatCurrency(allocatedBalance)}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Saldo Total Contable en Pie: Solo si hay apartados activos */}
                      {allocatedBalance > 0 && (
                        <div className="flex justify-between items-center border-t border-[#EEF0F4] pt-2.5 text-xs text-slate-400">
                          <span className="font-medium">Saldo Total Contable:</span>
                          <span className="font-bold text-slate-700 tabular-nums text-sm">
                            {FormatCurrency(ledgerBalance)}
                          </span>
                        </div>
                      )}
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
                <div className="p-2.5 bg-[#EEF2FF] text-[#6366F1] rounded-2xl">
                  <CreditCard size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 tracking-tight">Tarjetas de Crédito</h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Límites, deudas vigentes, disponibilidad de crédito y pagos
                  </p>
                </div>
              </div>
              <span className="text-xs font-semibold text-slate-500 bg-[#F1F5F9] px-2.5 py-1 rounded-full tabular-nums">
                {creditAccounts.length} {creditAccounts.length === 1 ? 'tarjeta' : 'tarjetas'}
              </span>
            </div>

            {creditAccounts.length === 0 ? (
              <div className="p-8 text-center bg-white border border-[#EEF0F4] rounded-3xl shadow-bento space-y-3">
                <CreditCard size={36} className="mx-auto text-slate-400" />
                <h4 className="text-base font-bold text-slate-800">No tienes tarjetas de crédito registradas</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Registra tus tarjetas de crédito para dar seguimiento a límites, fechas de corte y pagos oportunos.
                </p>
                <button
                  type="button"
                  onClick={() => handleOpenModal()}
                  className="mt-2 inline-flex items-center gap-2 bg-[#111319] hover:bg-[#1A1D26] text-white rounded-full px-4 py-2 text-xs font-medium transition-colors shadow-sm cursor-pointer"
                >
                  <Plus size={16} />
                  <span>Añadir Tarjeta de Crédito</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {creditAccounts.map((account) => {
                  const { currentDebt, positiveBalance, creditAvailable, utilizationPercentage } =
                    calculateCreditCardMetrics(account);
                  const colorConfig = getUtilizationColor(utilizationPercentage);
                  const rawBalance = Number(account?.balance) || 0;
                  const hasDates = account.cutDay != null || account.paymentDay != null;

                  return (
                    <div
                      key={account.id}
                      className="bg-[#111319] border border-[#232733] rounded-2xl p-4 sm:p-5 text-white shadow-bento flex flex-col justify-between gap-3 group hover:border-slate-700 transition-all duration-200"
                    >
                      {/* Cabecera */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h4 className="font-semibold text-base text-white truncate">
                            {account.name}
                          </h4>
                          <div className="flex flex-wrap items-center gap-1.5 mt-1">
                            <span className="bg-white/10 text-slate-300 text-[10px] rounded-full px-2 py-0.5 font-semibold uppercase tracking-wider">
                              {account.ownerType === 'SHARED' ? 'Compartida' : 'Individual'}
                            </span>
                            {account.ownerType !== 'SHARED' && (
                              <span
                                data-testid={`account-partner-status-${account.id}`}
                                className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider ${
                                  account.allowPartnerTransfers
                                    ? 'bg-[#10B981]/20 text-[#10B981]'
                                    : 'bg-white/10 text-slate-400'
                                }`}
                              >
                                {account.allowPartnerTransfers ? 'Transferible' : 'Privada'}
                              </span>
                            )}
                            {hasDates && (
                              <span className="text-[10px] text-slate-400 font-medium tabular-nums">
                                Corte: d.{account.cutDay ?? '—'} • Pago: d.{account.paymentDay ?? '—'}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Botones de acción discretos */}
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                          <button
                            type="button"
                            onClick={() => handleOpenModal(account)}
                            className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                            title="Editar tarjeta"
                          >
                            <Edit2 size={13} />
                          </button>
                          {!account.systemKey && (
                            <button
                              type="button"
                              onClick={() => handleDelete(account.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                              title="Eliminar tarjeta"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Bloque Métrico: Fila simple con Deuda Actual y Crédito Disponible */}
                      <div className="flex items-end justify-between gap-4 pt-1">
                        <div>
                          <p className="text-xs uppercase font-semibold text-slate-400 tracking-wider mb-0.5">
                            Deuda Actual
                          </p>
                          {rawBalance > 0 ? (
                            <p className="text-2xl font-bold tabular-nums text-white">
                              {FormatCurrency(currentDebt)}
                            </p>
                          ) : rawBalance < 0 ? (
                            <div className="inline-flex items-center gap-1.5 bg-[#E8F8F0]/20 text-[#10B981] border border-[#10B981]/30 px-2.5 py-0.5 rounded-lg text-xs font-bold tabular-nums">
                              <CheckCircle2 size={13} className="shrink-0" />
                              <span>Saldo a favor: {FormatCurrency(positiveBalance)}</span>
                            </div>
                          ) : (
                            <div>
                              <p className="text-2xl font-bold tabular-nums text-white">
                                {FormatCurrency(0)}
                              </p>
                              <p className="text-[11px] text-[#10B981] font-medium mt-0.5">
                                Al corriente • Sin deuda
                              </p>
                            </div>
                          )}
                        </div>

                        <div className="text-right">
                          <p className="text-xs uppercase font-semibold text-slate-400 tracking-wider mb-0.5">
                            Crédito Disponible
                          </p>
                          <p className="text-base font-semibold tabular-nums text-slate-300">
                            {FormatCurrency(creditAvailable)}
                          </p>
                        </div>
                      </div>

                      {/* Barra de Utilización */}
                      <div className="space-y-1.5 pt-2 border-t border-white/10">
                        <div className="text-xs text-slate-400 tabular-nums flex justify-between">
                          <span>
                            Límite: <strong className="text-slate-200">{FormatCurrency(account.creditLimit || 0)}</strong>
                          </span>
                          <span className={`font-semibold ${colorConfig.text}`}>
                            Utilización: {utilizationPercentage.toFixed(0)}%
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${colorConfig.bar} rounded-full transition-all duration-500`}
                            style={{ width: `${Math.min(100, Math.max(0, utilizationPercentage))}%` }}
                          />
                        </div>
                      </div>

                      {/* Botón Pagar Tarjeta */}
                      <button
                        type="button"
                        onClick={() => setSelectedCardForPayment(account)}
                        className="bg-white/10 hover:bg-white/20 border border-white/15 text-white rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors w-full sm:w-auto self-end mt-1 cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <CreditCard size={13} />
                        <span>Pagar Tarjeta</span>
                      </button>
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
            key={editingAsset?.id || 'new'}
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
