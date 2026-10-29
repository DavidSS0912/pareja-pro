import React, { useState, useEffect } from 'react';
import { User, Users, Coins, Palette, LogOut, Copy, Check, Share2, Building2 } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { useShallow } from 'zustand/react/shallow';
import { Button } from '../components/ui/Button';
import { authService } from '../services/authService';
import { createInvitation } from '../services/userService';
import { ProfileView } from './ProfileView';

export interface SettingsViewProps {
  onLogout?: () => void;
}

export function SettingsView({ onLogout }: SettingsViewProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'household' | 'currency' | 'appearance'>('profile');
  const [, setForceRender] = useState(0);

  const { user, houseId, users, refreshSettings } = useAppStore(useShallow(state => ({
    user: state.user,
    houseId: state.houseId,
    users: state.users,
    refreshSettings: state.refreshSettings
  })));

  useEffect(() => {
    refreshSettings();
  }, [refreshSettings]);

  // Invitaciones
  const [inviteLink, setInviteLink] = useState('');
  const [isGeneratingInvite, setIsGeneratingInvite] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const handleGenerateInvite = async () => {
    if (!user || !houseId) return;
    try {
      setIsGeneratingInvite(true);
      const inviteId = await createInvitation(user.uid, houseId);
      const link = `${window.location.origin}/invite/${inviteId}`;
      setInviteLink(link);
      await navigator.clipboard.writeText(link);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 3000);
    } catch (err) {
      console.error('Error generando invitación:', err);
    } finally {
      setIsGeneratingInvite(false);
    }
  };

  const handleCopyExistingLink = async () => {
    if (!inviteLink) return;
    try {
      await navigator.clipboard.writeText(inviteLink);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 3000);
    } catch (err) {
      console.error('Error copiando link:', err);
    }
  };

  // Moneda y Tipo de Cambio
  const [defaultCurrency, setDefaultCurrency] = useState(() => localStorage.getItem('defaultCurrency') || 'MXN');
  const [exchangeRate, setExchangeRate] = useState(() => localStorage.getItem('exchangeRate') || '20');
  const [exchangeSaved, setExchangeSaved] = useState(false);

  const handleSaveCurrency = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('defaultCurrency', defaultCurrency);
    localStorage.setItem('exchangeRate', exchangeRate);
    setExchangeSaved(true);
    setTimeout(() => setExchangeSaved(false), 2500);
  };

  // Cierre de sesión
  const handleLogout = async () => {
    if (onLogout) {
      onLogout();
    } else {
      await authService.logout();
    }
  };

  // Apariencia
  const primaryColors = ['#4f46e5', '#3b82f6', '#0ea5e9', '#10b981', '#f59e0b', '#f43f5e', '#ec4899', '#8b5cf6', '#14b8a6'];
  const secondaryColors = ['#f43f5e', '#f59e0b', '#10b981', '#0ea5e9', '#8b5cf6', '#ec4899'];

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col md:flex-row min-h-[600px] gap-8">
      {/* Sidebar de Ajustes */}
      <div className="w-full md:w-64 flex flex-col justify-between">
        <div className="flex flex-col gap-1.5">
          <h2 className="text-xl font-bold text-slate-900 mb-4 px-2 font-title">Ajustes</h2>
          
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-150 font-medium text-sm ${
              activeTab === 'profile' ? 'bg-primary/10 text-primary font-bold shadow-sm' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <User size={18} />
            <span>Perfil de Usuario</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('household')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-150 font-medium text-sm ${
              activeTab === 'household' ? 'bg-primary/10 text-primary font-bold shadow-sm' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Users size={18} />
            <span>Integrantes del Hogar</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('currency')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-150 font-medium text-sm ${
              activeTab === 'currency' ? 'bg-primary/10 text-primary font-bold shadow-sm' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Coins size={18} />
            <span>Moneda y Tipo de Cambio</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('appearance')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-150 font-medium text-sm ${
              activeTab === 'appearance' ? 'bg-primary/10 text-primary font-bold shadow-sm' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Palette size={18} />
            <span>Apariencia y Colores</span>
          </button>
        </div>

        {/* Botón de Cierre de Sesión en el Menú */}
        <div className="pt-6 mt-6 border-t border-slate-100">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-colors font-medium text-sm"
          >
            <LogOut size={18} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </div>

      {/* Área Principal de Contenido */}
      <div className="flex-1 border-t md:border-t-0 md:border-l border-slate-100 pt-6 md:pt-0 md:pl-8">
        
        {/* 1. PERFIL DE USUARIO */}
        {activeTab === 'profile' && (
          <div className="space-y-6 max-w-xl">
            <div>
              <h3 className="text-lg font-bold text-slate-900 font-title">Perfil de Usuario</h3>
              <p className="text-sm text-slate-500 mt-1">Información de tu cuenta autenticada.</p>
            </div>

            <div className="flex items-center gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="w-16 h-16 rounded-full bg-slate-200 overflow-hidden flex items-center justify-center text-slate-500 font-bold text-xl flex-shrink-0">
                {user?.photoURL ? (
                  <img src={user.photoURL} alt="Avatar" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                ) : (
                  <span>{(user?.displayName || user?.email || 'U').charAt(0).toUpperCase()}</span>
                )}
              </div>
              <div className="min-w-0">
                <p className="font-bold text-slate-900 text-base truncate">{user?.displayName || 'Usuario de Orbita'}</p>
                <p className="text-sm text-slate-500 truncate">{user?.email || 'Sin correo asociado'}</p>
                <p className="text-xs text-slate-400 font-mono mt-1">ID: {user?.uid}</p>
              </div>
            </div>
            <div className="p-4 rounded-xl border border-blue-100 bg-blue-50/50 text-xs text-blue-700">
              <p className="font-semibold mb-1">Sesión Autenticada</p>
              <p>Tu cuenta está gestionada a través del sistema de autenticación de Orbita. Las credenciales están protegidas y sincronizadas con tu hogar.</p>
            </div>

            <p className="text-sm text-slate-500 italic">Nota: La edición del perfil desde la app aún no está disponible.</p>
            <div className="pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActiveTab('household')}
                className="text-sm font-semibold text-primary hover:underline flex items-center gap-1.5"
              >
                <Users size={16} /> Administrar integrantes de mi hogar →
              </button>
            </div>
          </div>
        )}

        {/* 2. INTEGRANTES DEL HOGAR */}
        {activeTab === 'household' && (
          <div className="space-y-6 max-w-2xl">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <Building2 size={20} />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Identificador del Hogar</p>
                  <p className="text-sm font-mono font-bold text-slate-800">{houseId || 'Sin hogar asignado'}</p>
                </div>
              </div>
            </div>

            {/* Enlace de Invitación */}
            <div className="p-5 rounded-2xl border border-indigo-100 bg-indigo-50/30 space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Share2 size={18} />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900">Invitar a un nuevo integrante</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Genera un enlace único para que tu pareja o familiar se una a este mismo hogar y gestionen juntos las finanzas.</p>
                </div>
              </div>

              {inviteLink ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-indigo-200">
                    <code className="text-xs text-indigo-600 break-all flex-1 font-mono">{inviteLink}</code>
                    <button
                      type="button"
                      onClick={handleCopyExistingLink}
                      className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors flex-shrink-0"
                      title="Copiar enlace"
                    >
                      {isCopied ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />}
                    </button>
                  </div>
                  {isCopied && (
                    <p className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                      <Check size={14} /> Enlace copiado al portapapeles
                    </p>
                  )}
                </div>
              ) : (
                <Button
                  type="button"
                  onClick={handleGenerateInvite}
                  disabled={isGeneratingInvite}
                  className="w-full sm:w-auto"
                >
                  {isGeneratingInvite ? 'Generando...' : 'Generar Enlace de Invitación'}
                </Button>
              )}
            </div>

            {/* Integrantes, abandono de hogar y gestión de invitaciones */}
            <ProfileView />
          </div>
        )}

        {/* 3. MONEDA Y TIPO DE CAMBIO */}
        {activeTab === 'currency' && (
          <div className="space-y-6 max-w-xl">
            <div>
              <h3 className="text-lg font-bold text-slate-900 font-title">Moneda y Divisas</h3>
              <p className="text-sm text-slate-500 mt-1">Configura la moneda base y la tasa de conversión para monedas extranjeras.</p>
            </div>

            <form onSubmit={handleSaveCurrency} className="space-y-5">
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">Moneda Base</label>
                <select
                  value={defaultCurrency}
                  onChange={e => setDefaultCurrency(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
                >
                  <option value="MXN">MXN - Peso Mexicano ($)</option>
                  <option value="USD">USD - Dólar Estadounidense ($)</option>
                  <option value="EUR">EUR - Euro (€)</option>
                </select>
                <p className="text-xs text-slate-400">Es la moneda de referencia en la que se calculan los saldos totales y presupuestos.</p>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">Tipo de Cambio (USD a MXN)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-400 font-bold">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    value={exchangeRate}
                    onChange={e => setExchangeRate(e.target.value)}
                    className="w-full pl-8 pr-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    placeholder="20.00"
                    required
                  />
                </div>
                <p className="text-xs text-slate-400">Se aplica para normalizar transacciones o presupuestos denominados en USD.</p>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <Button type="submit">Guardar Configuración</Button>
                {exchangeSaved && (
                  <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                    <Check size={15} /> Guardado exitosamente
                  </span>
                )}
              </div>
            </form>
          </div>
        )}

        {/* 4. APARIENCIA Y COLORES */}
        {activeTab === 'appearance' && (
          <div className="space-y-6 max-w-xl">
            <div>
              <h3 className="text-lg font-bold text-slate-900 font-title">Apariencia y Tema</h3>
              <p className="text-sm text-slate-500 mt-1">Personaliza el aspecto visual y la paleta de colores de Orbita.</p>
            </div>

            <div className="flex items-center gap-3 p-4 border border-slate-100 rounded-2xl bg-slate-50">
              <div className="w-8 h-8 rounded-full bg-primary flex-shrink-0"></div>
              <div>
                <p className="font-bold text-slate-800 text-sm">Tema Claro (Predeterminado)</p>
                <p className="text-xs text-slate-500">Diseñado con contraste optimizado para uso diario en escritorio y móvil.</p>
              </div>
            </div>

            <div className="p-5 border border-slate-100 rounded-2xl bg-slate-50/70 space-y-3">
              <div>
                <p className="font-bold text-slate-800 text-sm">Color Primario de la Aplicación</p>
                <p className="text-xs text-slate-500">Acento principal para botones, pestañas activas y destacados.</p>
              </div>
              <div className="flex flex-wrap gap-3 pt-1">
                {primaryColors.map(color => {
                  const storedColor = localStorage.getItem('app_primary_color') || '#4f46e5';
                  const isActive = storedColor === color;
                  return (
                    <button
                      key={color}
                      type="button"
                      onClick={() => {
                        localStorage.setItem('app_primary_color', color);
                        document.documentElement.style.setProperty('--primary-color', color);
                        setForceRender(prev => prev + 1);
                      }}
                      className={`w-9 h-9 rounded-full transition-all duration-150 ${
                        isActive ? 'ring-2 ring-offset-2 ring-slate-400 scale-110 shadow-sm' : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: color }}
                      title={`Color ${color}`}
                    />
                  );
                })}
              </div>
            </div>

            <div className="p-5 border border-slate-100 rounded-2xl bg-slate-50/70 space-y-3">
              <div>
                <p className="font-bold text-slate-800 text-sm">Color Secundario</p>
                <p className="text-xs text-slate-500">Acento para etiquetas, insignias y elementos secundarios.</p>
              </div>
              <div className="flex flex-wrap gap-3 pt-1">
                {secondaryColors.map(color => {
                  const storedColor = localStorage.getItem('app_second_color') || '#f43f5e';
                  const isActive = storedColor === color;
                  return (
                    <button
                      key={color}
                      type="button"
                      onClick={() => {
                        localStorage.setItem('app_second_color', color);
                        document.documentElement.style.setProperty('--second-color', color);
                        setForceRender(prev => prev + 1);
                      }}
                      className={`w-9 h-9 rounded-full transition-all duration-150 ${
                        isActive ? 'ring-2 ring-offset-2 ring-slate-400 scale-110 shadow-sm' : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: color }}
                      title={`Color ${color}`}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
