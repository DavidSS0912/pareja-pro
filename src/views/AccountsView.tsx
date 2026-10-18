import React, { useState } from 'react';
import { Plus, Edit2, Trash2, CreditCard } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { AccountForm } from '../components/forms/AccountForm';
import { PaymentForm } from '../components/forms/PaymentForm';
import { FormatCurrency } from '../utils';

export function AccountsView({ data, methods, appContext }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [payingAccount, setPayingAccount] = useState(null);

  const handleOpenModal = (account = null) => {
    setEditingAccount(account);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingAccount(null);
    setIsModalOpen(false);
  };

  const handleOpenPaymentModal = (account) => {
    setPayingAccount(account);
    setIsPaymentModalOpen(true);
  };

  const handleClosePaymentModal = () => {
    setPayingAccount(null);
    setIsPaymentModalOpen(false);
  };

  const handleSubmit = (formData) => {
    if (editingAccount) {
      methods.updateAccount(editingAccount.id, formData);
    } else {
      methods.addAccount(formData);
    }
    handleCloseModal();
  };

  const handlePaymentSubmit = (formData) => {
    if (payingAccount) {
      methods.payCreditCard(
        formData.sourceAccountId,
        payingAccount.id,
        formData.amount,
        formData.date,
        data.user?.uid || 'unknown',
        payingAccount.ownerType === 'SHARED'
      );
    }
    handleClosePaymentModal();
  };

  const handleDelete = (id) => {
    if (window.confirm('¿Estás seguro de eliminar esta cuenta?')) {
      methods.deleteAccount(id);
    }
  };

  const assetAccounts = (data.accounts || []).filter(a => a.type === 'ASSET' || a.type === 'BANK_ACCOUNT');

  return (
    <div className="space-y-6 animate-in">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-slate-800">Cuentas y Tarjetas</h2>
          <p className="text-slate-600 mt-2 font-medium">Gestiona tus fuentes de ingresos y tus tarjetas de crédito.</p>
        </div>
        <Button onClick={() => handleOpenModal()}>
          <Plus size={18} className="mr-2" /> Nueva Cuenta
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {(data.accounts || []).filter(acc => acc.type === 'ASSET' || acc.type === 'LIABILITY').map(account => {
          const isCredit = account.type === 'LIABILITY';
          // Calculate balance if possible from entries
          const balance = account.balance || 0; 
          
          return (
          <div 
            key={account.id} 
            className={`${account.color || 'bg-slate-800'} rounded-[32px] p-8 text-white shadow-xl relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300`}
          >
            {/* Quick Actions overlay */}
            <div className="absolute top-4 right-4 flex gap-2 z-20">
              <button onClick={() => handleOpenModal(account)} className="p-2 bg-slate-800/20 hover:bg-slate-800/40 backdrop-blur-sm rounded-full transition-colors" title="Editar">
                <Edit2 size={16} />
              </button>
              { !account.systemKey && (
              <button onClick={() => handleDelete(account.id)} className="p-2 bg-rose-500/50 hover:bg-rose-500/80 backdrop-blur-sm rounded-full transition-colors" title="Eliminar">
                <Trash2 size={16} />
              </button>
              )}
            </div>

            {/* Glossy overlay effect */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent opacity-50 pointer-events-none"></div>
            <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700 pointer-events-none"></div>
            <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-black/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700 pointer-events-none"></div>
            
            <div className="flex justify-between items-start mb-10 relative z-10 pr-16">
              <div>
                <h3 className="text-2xl font-black tracking-tight">{account.name}</h3>
                <span className="text-[10px] bg-black/20 px-3 py-1 rounded-lg mt-3 inline-block font-bold uppercase tracking-widest border border-white/10 backdrop-blur-sm shadow-sm">
                  {account.ownerType === 'SHARED' ? 'Uso Compartido' : 'Uso Individual'}
                </span>
                <span className="ml-2 text-[10px] bg-white/20 px-3 py-1 rounded-lg mt-3 inline-block font-bold uppercase tracking-widest border border-white/10 backdrop-blur-sm shadow-sm">
                  {isCredit ? 'Crédito' : 'Débito'}
                </span>
              </div>
              <div className="text-right bg-black/20 px-4 py-2 rounded-2xl border border-white/10 backdrop-blur-md shadow-inner">
                <p className="text-[10px] opacity-70 uppercase tracking-widest font-bold mb-1">
                  {isCredit ? 'Límite' : 'Balance'}
                </p>
                <p className="font-black tracking-tight">{FormatCurrency(isCredit ? (account.creditLimit || 0) : balance)}</p>
              </div>
            </div>

            {isCredit && (
              <div className="bg-white/10 p-6 rounded-[24px] backdrop-blur-md relative z-10 border border-white/20 shadow-lg group-hover:bg-white/20 transition-colors duration-300">
                <div className="flex justify-between items-end mb-6">
                  <div>
                    <p className="text-xs opacity-90 mb-1 font-medium tracking-wide">Deuda actual</p>
                    <p className="text-4xl font-black tracking-tighter">{FormatCurrency(Math.abs(balance))}</p>
                  </div>
                  <button 
                    onClick={() => handleOpenPaymentModal(account)}
                    className="flex items-center gap-2 bg-white text-slate-900 px-4 py-2 rounded-xl text-sm font-bold shadow-sm hover:shadow-md transition-shadow"
                  >
                    <CreditCard size={16} />
                    Pagar Tarjeta
                  </button>
                </div>
                <div className="flex justify-between items-center text-sm font-bold pt-4 border-t border-white/20">
                  <span className="opacity-90">Corte: Día {account.cutDay}</span>
                  <span className="bg-white/20 px-3 py-1.5 rounded-lg text-white shadow-sm border border-white/10">
                    Pago: Día {account.paymentDay}
                  </span>
                </div>
              </div>
            )}
          </div>
        )})}
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        title={editingAccount ? "Editar Cuenta" : "Nueva Cuenta"}
      >
        <AccountForm 
          initialData={editingAccount} 
          users={data.users}
          appContext={appContext}
          onSubmit={handleSubmit} 
          onCancel={handleCloseModal} 
        />
      </Modal>

      <Modal
        isOpen={isPaymentModalOpen}
        onClose={handleClosePaymentModal}
        title="Registrar Pago a Tarjeta"
      >
        <PaymentForm
          targetAccount={payingAccount}
          assetAccounts={assetAccounts}
          onSubmit={handlePaymentSubmit}
          onCancel={handleClosePaymentModal}
        />
      </Modal>
    </div>
  );
}
