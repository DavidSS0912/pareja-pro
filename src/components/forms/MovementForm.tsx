import React, { useState, useEffect } from 'react';
import {
  MovementAction,
  MovementValidationInput,
  buildMovementAction,
  validateMovement,
  getTodayLocalISO,
  getLastUsedAccountId,
  saveLastUsedAccountId,
} from '../../services/movementService';
import { calculateAccountAvailableBalance } from '../../utils/walletCalculations';
import { isPartnerAccount, filterTransferTargetAccounts, MemberSlotFilter } from '../../services/ownershipService';
import { useAppStore } from '../../store/useAppStore';
import { Button } from '../ui/Button';
import {
  ArrowLeftRight,
  ArrowRight,
  ArrowDownLeft,
  ArrowUpRight,
  AlertCircle,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export interface MovementFormProps {
  categories?: Array<{ id: string; name: string; type?: string }>;
  accounts?: Array<{ id: string; name: string; type?: string; ownerType?: string; balance?: number }>;
  currentUserId?: string | null;
  memberSlot?: MemberSlotFilter;
  appContext?: string;
  initialMode?: 'expense' | 'income' | 'transfer' | 'EXPENSE' | 'INCOME' | 'TRANSFER';
  initialType?: 'EXPENSE' | 'INCOME' | 'TRANSFER';
  initialSourceAccountId?: string;
  initialTargetAccountId?: string;
  initialData?: any;
  onSubmit: (action: MovementAction) => void | Promise<void>;
  onCancel: () => void;
}

const INPUT_CLASS =
  'w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors';

const LABEL_CLASS = 'block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5';

function getSafeStorage(): Storage | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage;
    }
    return null;
  } catch {
    return null;
  }
}

export function MovementForm({
  categories = [],
  accounts = [],
  currentUserId,
  memberSlot: propMemberSlot,
  appContext = 'household',
  initialMode,
  initialType,
  initialSourceAccountId,
  initialTargetAccountId,
  initialData,
  onSubmit,
  onCancel,
}: MovementFormProps) {
  const resolvedInitialType: 'EXPENSE' | 'INCOME' | 'TRANSFER' = (() => {
    if (initialData) {
      const recType = (initialData.recordType || initialData.movementType || initialData.type || '').toUpperCase();
      if (recType === 'TRANSFER' || recType === 'CARD_PAYMENT' || recType.includes('TRANSFER')) return 'TRANSFER';
      if (recType === 'INCOME' || recType.includes('INGRESO')) return 'INCOME';
      if (recType === 'EXPENSE' || recType.includes('GASTO') || recType === 'DEBIT') return 'EXPENSE';
    }
    const raw = (initialMode || initialType || '').toUpperCase();
    if (raw === 'INCOME') return 'INCOME';
    if (raw === 'TRANSFER') return 'TRANSFER';
    return 'EXPENSE';
  })();

  const [type, setType] = useState<'EXPENSE' | 'INCOME' | 'TRANSFER'>(resolvedInitialType);
  const [amount, setAmount] = useState<string>(() => {
    if (initialData?.amount !== undefined && initialData?.amount !== null) {
      return String(initialData.amount);
    }
    return '';
  });
  const [date, setDate] = useState<string>(() => {
    if (initialData?.date) {
      return String(initialData.date).slice(0, 10);
    }
    return getTodayLocalISO();
  });
  const [categoryId, setCategoryId] = useState<string>(() => {
    if (initialData?.categoryId) return initialData.categoryId;
    if (initialData?.category) {
      const catName = typeof initialData.category === 'string' ? initialData.category : initialData.category?.name;
      if (catName) {
        const found = categories.find((c) => c.name.toLowerCase() === catName.toLowerCase());
        if (found) return found.id;
      }
    }
    return '';
  });
  const [sourceAccountId, setSourceAccountId] = useState<string>(() => {
    return (
      initialData?.sourceAccountId ||
      initialData?.sourceAccount ||
      initialData?.payerAccountId ||
      (resolvedInitialType === 'EXPENSE' ? initialData?.accountId : '') ||
      initialSourceAccountId ||
      ''
    );
  });
  const [targetAccountId, setTargetAccountId] = useState<string>(() => {
    return (
      initialData?.targetAccountId ||
      initialData?.targetAccount ||
      (resolvedInitialType === 'INCOME' ? initialData?.accountId : '') ||
      initialTargetAccountId ||
      ''
    );
  });
  const [note, setNote] = useState<string>(() => {
    const rawNote = initialData?.description || initialData?.note || initialData?.desc || '';
    return rawNote.replace(/^Ingreso\s*-\s*/i, '');
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // F3.2: Opciones avanzadas de gasto (Expandidas por defecto y división proporcional)
  const [isOptionsOpen, setIsOptionsOpen] = useState<boolean>(true);
  const [splitType, setSplitType] = useState<'50/50' | 'proporcional' | 'individual'>(() => {
    if (initialData?.splitType) {
      const s = String(initialData.splitType).toLowerCase();
      if (s === '50/50') return '50/50';
      if (s === 'individual') return 'individual';
    }
    return 'proporcional';
  });
  const [isMsi, setIsMsi] = useState<boolean>(() => Boolean(initialData?.isMsi));
  const [msiCount, setMsiCount] = useState<number | string>(() => (initialData?.msiCount ? Number(initialData.msiCount) : 3));
  const [selectedTags, setSelectedTags] = useState<string[]>(() => (Array.isArray(initialData?.tags) ? initialData.tags : []));

  // F3.2: Registro de interacción manual en cuentas
  const [sourceTouched, setSourceTouched] = useState<boolean>(
    !!(initialData?.sourceAccountId || initialData?.sourceAccount || initialSourceAccountId)
  );
  const [targetTouched, setTargetTouched] = useState<boolean>(
    !!(initialData?.targetAccountId || initialData?.targetAccount || initialTargetAccountId)
  );

  // F3.2: Etiquetas del store
  const tags = useAppStore((state) => state.tags);

  // Proyectos para cálculo de saldo disponible
  const projects = useAppStore((state) => (state as any).projects || []);

  // Usuarios del hogar del store para resolver titulares
  const users = useAppStore((state) => (state as any).users || []);
  const storeMemberSlot = useAppStore((state) => (state as any).memberSlot);
  const userA = users.find((u: any) => u.memberSlot === 'USER_A');
  const userB = users.find((u: any) => u.memberSlot === 'USER_B');

  // Identificar el memberSlot del usuario activo (USER_A o USER_B)
  const activeMemberSlot: MemberSlotFilter =
    propMemberSlot ||
    storeMemberSlot ||
    users.find((u: any) => u.id === currentUserId)?.memberSlot ||
    (currentUserId === userA?.id ? 'USER_A' : currentUserId === userB?.id ? 'USER_B' : null);

  // Sincronizar datos si cambia initialData mientras el componente sigue montado
  useEffect(() => {
    if (initialData) {
      const recType = (initialData.recordType || initialData.movementType || initialData.type || '').toUpperCase();
      let resolvedType: 'EXPENSE' | 'INCOME' | 'TRANSFER' = 'EXPENSE';
      if (recType === 'TRANSFER' || recType === 'CARD_PAYMENT' || recType.includes('TRANSFER')) {
        resolvedType = 'TRANSFER';
        setType('TRANSFER');
      } else if (recType === 'INCOME' || recType.includes('INGRESO')) {
        resolvedType = 'INCOME';
        setType('INCOME');
      } else {
        setType('EXPENSE');
      }

      if (initialData.amount !== undefined && initialData.amount !== null) {
        setAmount(String(initialData.amount));
      }
      if (initialData.date) {
        setDate(String(initialData.date).slice(0, 10));
      }

      if (initialData.categoryId) {
        setCategoryId(initialData.categoryId);
      } else if (initialData.category) {
        const catName = typeof initialData.category === 'string' ? initialData.category : initialData.category?.name;
        if (catName) {
          const found = categories.find((c) => c.name.toLowerCase() === catName.toLowerCase());
          if (found) setCategoryId(found.id);
        }
      }

      const srcId =
        initialData.sourceAccountId ||
        initialData.sourceAccount ||
        initialData.payerAccountId ||
        (resolvedType === 'EXPENSE' ? initialData.accountId : '');
      if (srcId) {
        setSourceAccountId(srcId);
        setSourceTouched(true);
      }

      const tgtId =
        initialData.targetAccountId ||
        initialData.targetAccount ||
        (resolvedType === 'INCOME' ? initialData.accountId : '');
      if (tgtId) {
        setTargetAccountId(tgtId);
        setTargetTouched(true);
      }

      const rawNote = initialData.description || initialData.note || initialData.desc || '';
      setNote(rawNote.replace(/^Ingreso\s*-\s*/i, ''));

      if (initialData.splitType) {
        const s = String(initialData.splitType).toLowerCase();
        if (s === '50/50') setSplitType('50/50');
        else if (s === 'individual') setSplitType('individual');
        else setSplitType('proporcional');
      } else {
        setSplitType('proporcional');
      }

      setIsMsi(Boolean(initialData.isMsi));
      setMsiCount(initialData.msiCount ? Number(initialData.msiCount) : 3);
      setSelectedTags(Array.isArray(initialData.tags) ? initialData.tags : []);
      setIsOptionsOpen(true);
    }
  }, [initialData, categories]);

  const getAccountOwnerLabel = (acc: any): string | null => {
    if (!acc) return null;
    if (acc.ownerType === 'USER_A') {
      return userA?.name || userA?.displayName || 'Usuario A';
    }
    if (acc.ownerType === 'USER_B') {
      return userB?.name || userB?.displayName || 'Usuario B';
    }
    if (acc.ownerType === 'SHARED') {
      return 'Compartida';
    }
    return null;
  };

  const formatAccountOption = (acc: any, isSource: boolean = false): string => {
    const label = getAccountOwnerLabel(acc);
    const baseName = label ? `[${label}] ${acc.name}` : acc.name;

    // MODO DESTINO CIEGO para cuentas de la pareja:
    // NUNCA mostrar "(Disp: $...)" ni saldo alguno
    if (isPartnerAccount(acc, activeMemberSlot)) {
      return baseName;
    }

    if (isSource && acc.type !== 'LIABILITY' && acc.type !== 'CREDIT_CARD') {
      const baseMetrics = calculateAccountAvailableBalance(acc, projects);
      const isInitialSource = initialData && acc.id === (initialData.sourceAccountId || initialData.sourceAccount);
      const effectiveBal = isInitialSource
        ? baseMetrics.availableBalance + Number(initialData.amount || 0)
        : baseMetrics.availableBalance;
      const formattedBal = effectiveBal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      return `${baseName} (Disp: $${formattedBal})`;
    }
    return baseName;
  };

  // Filtrado de catálogos según la modalidad
  const expenseCategories = categories.filter((c) => c.type === 'EXPENSE' || !c.type);
  const serverIncomeCats = categories.filter((c) => c.type === 'INCOME');
  const DEFAULT_INCOME_CATS = [
    { id: 'default-inc-1', name: 'Sueldo / Salario', type: 'INCOME' },
    { id: 'default-inc-2', name: 'Honorarios / Ventas', type: 'INCOME' },
    { id: 'default-inc-3', name: 'Otros Ingresos', type: 'INCOME' }
  ];
  const effectiveIncomeCategories = serverIncomeCats.length > 0 ? serverIncomeCats : DEFAULT_INCOME_CATS;
  const incomeCategories = effectiveIncomeCategories;

  useEffect(() => {
    if (type === 'INCOME' && serverIncomeCats.length === 0) {
      const houseId = (useAppStore.getState() as any).houseId;
      if (houseId) {
        import('../../lib/dataconnect').then(async ({ createCategory, getCategories }) => {
          const defaults = [
            { name: 'Sueldo / Salario', type: 'INCOME', color: '#10b981', ownerType: 'SHARED' },
            { name: 'Honorarios / Ventas', type: 'INCOME', color: '#3b82f6', ownerType: 'SHARED' },
            { name: 'Otros Ingresos', type: 'INCOME', color: '#8b5cf6', ownerType: 'SHARED' }
          ];
          for (const d of defaults) {
            try {
              await createCategory({
                householdId: houseId,
                name: d.name,
                type: d.type as any,
                color: d.color,
                ownerType: d.ownerType as any
              });
            } catch (e) {
              console.warn('Category already exists or failed:', e);
            }
          }
          const res = await getCategories({ householdId: houseId }, { fetchPolicy: 'SERVER_ONLY' as any });
          if (res.data?.categories) {
            useAppStore.setState({ categories: res.data.categories as any });
          }
        });
      }
    }
  }, [type, serverIncomeCats.length]);

  const assetOrBankAccounts = accounts.filter(
    (a) => a.type === 'ASSET' || a.type === 'BANK_ACCOUNT' || a.type === 'LIABILITY'
  );
  const depositAccounts = accounts.filter(
    (a) => a.type === 'ASSET' || a.type === 'BANK_ACCOUNT'
  );

  // Origen de transferencias: ÚNICAMENTE cuentas propias (ownerType === memberSlot) y de Hogar (ownerType === 'SHARED')
  // Prohibir y excluir terminantemente las cuentas personales de la pareja como origen de retiro.
  const transferSourceAccounts = assetOrBankAccounts.filter((a) => !isPartnerAccount(a, activeMemberSlot));

  // Destino de transferencias: permitir cuentas propias, compartidas y cuentas personales de la pareja (solo con opt-in activo en MODO DESTINO CIEGO)
  const transferTargetAccounts = filterTransferTargetAccounts(assetOrBankAccounts, activeMemberSlot);

  // Gastos: excluir cuentas de la pareja; solo permitir cuentas propias y compartidas
  const expenseAccounts = assetOrBankAccounts.filter((a) => !isPartnerAccount(a, activeMemberSlot));

  // Ingresos: excluir cuentas de la pareja; solo permitir cuentas propias y compartidas
  const incomeDepositAccounts = depositAccounts.filter((a) => !isPartnerAccount(a, activeMemberSlot));

  const selectedSourceAcc = assetOrBankAccounts.find((a) => a.id === sourceAccountId);
  const selectedTargetAcc = assetOrBankAccounts.find((a) => a.id === targetAccountId);

  const transferOperationInfo = (() => {
    if (type !== 'TRANSFER' || !selectedSourceAcc || !selectedTargetAcc) return null;
    const isTargetLiability = selectedTargetAcc.type === 'LIABILITY' || selectedTargetAcc.type === 'CREDIT_CARD';
    if (isTargetLiability) {
      return {
        kind: 'CARD_PAYMENT' as const,
        label: 'Pago de Tarjeta de Crédito',
        badgeClass: 'bg-indigo-50 border-indigo-200 text-indigo-700'
      };
    }
    const srcOwner = selectedSourceAcc.ownerType;
    const tgtOwner = selectedTargetAcc.ownerType;
    const srcLabel = getAccountOwnerLabel(selectedSourceAcc) || 'Emisor';
    const tgtLabel = getAccountOwnerLabel(selectedTargetAcc) || 'Receptor';

    if (srcOwner && tgtOwner && srcOwner !== 'SHARED' && tgtOwner !== 'SHARED' && srcOwner !== tgtOwner) {
      return {
        kind: 'CROSS_USERS' as const,
        label: `Transferencia a pareja (${srcLabel} → ${tgtLabel})`,
        badgeClass: 'bg-purple-50 border-purple-200 text-purple-700'
      };
    }

    return {
      kind: 'SAME_USER' as const,
      label: 'Traspaso entre cuentas propias',
      badgeClass: 'bg-emerald-50 border-emerald-200 text-emerald-700'
    };
  })();

  // F3.2: Memoria de última cuenta al montar o cambiar de modalidad
  useEffect(() => {
    const storage = getSafeStorage();
    if (type === 'EXPENSE') {
      if (!sourceTouched || !sourceAccountId || isPartnerAccount(selectedSourceAcc, activeMemberSlot)) {
        const validIds = expenseAccounts.map((a) => a.id);
        const last = getLastUsedAccountId(storage, currentUserId, 'expense', validIds);
        if (last) {
          setSourceAccountId(last);
        } else if (isPartnerAccount(selectedSourceAcc, activeMemberSlot)) {
          setSourceAccountId(expenseAccounts[0]?.id || '');
        }
      }
    } else if (type === 'INCOME') {
      if (!targetTouched || !targetAccountId || isPartnerAccount(selectedTargetAcc, activeMemberSlot)) {
        const validIds = incomeDepositAccounts.map((a) => a.id);
        const last = getLastUsedAccountId(storage, currentUserId, 'income', validIds);
        if (last) {
          setTargetAccountId(last);
        } else if (isPartnerAccount(selectedTargetAcc, activeMemberSlot)) {
          setTargetAccountId(incomeDepositAccounts[0]?.id || '');
        }
      }
    } else if (type === 'TRANSFER') {
      if (!sourceTouched || !sourceAccountId || isPartnerAccount(selectedSourceAcc, activeMemberSlot)) {
        const validIds = transferSourceAccounts.map((a) => a.id);
        const last = getLastUsedAccountId(storage, currentUserId, 'transfer', validIds);
        if (last) {
          setSourceAccountId(last);
        } else if (isPartnerAccount(selectedSourceAcc, activeMemberSlot)) {
          setSourceAccountId(transferSourceAccounts[0]?.id || '');
        }
      }
    }
  }, [type, currentUserId, accounts, sourceTouched, targetTouched, sourceAccountId, targetAccountId, expenseAccounts, incomeDepositAccounts, transferSourceAccounts, selectedSourceAcc, selectedTargetAcc, activeMemberSlot]);

  const handleTypeChange = (newType: 'EXPENSE' | 'INCOME' | 'TRANSFER') => {
    setType(newType);
    setFormError(null);
    setCategoryId('');
    setSourceAccountId('');
    setTargetAccountId('');
    setSourceTouched(false);
    setTargetTouched(false);
    setSplitType('proporcional');
    setIsMsi(false);
    setMsiCount(3);
    setSelectedTags([]);
    setIsOptionsOpen(true);
  };

  const handleTagToggle = (tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  };

  // Detección de estados vacíos
  const isAuthMissing = !currentUserId || currentUserId.trim() === '';
  const isExpenseBlocked =
    type === 'EXPENSE' && (expenseCategories.length === 0 || expenseAccounts.length === 0);
  const isIncomeBlocked =
    type === 'INCOME' && (incomeCategories.length === 0 || incomeDepositAccounts.length === 0);
  const isTransferBlocked =
    type === 'TRANSFER' && (transferSourceAccounts.length === 0 || transferTargetAccounts.length < 2);

  const isFormBlocked = isAuthMissing || isExpenseBlocked || isIncomeBlocked || isTransferBlocked;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (type === 'TRANSFER' && isPartnerAccount(selectedSourceAcc, activeMemberSlot)) {
      setFormError('No puedes transferir fondos desde una cuenta de tu pareja');
      return;
    }
    if (type === 'EXPENSE' && isPartnerAccount(selectedSourceAcc, activeMemberSlot)) {
      setFormError('No puedes pagar un gasto con una cuenta de tu pareja');
      return;
    }
    if (type === 'INCOME' && isPartnerAccount(selectedTargetAcc, activeMemberSlot)) {
      setFormError('No puedes depositar un ingreso en una cuenta de tu pareja');
      return;
    }

    const activeCatList = type === 'EXPENSE' ? expenseCategories : incomeCategories;
    const selectedCategory = activeCatList.find((c) => c.id === categoryId);

    let sourceOwnerUid: string | undefined;
    let targetOwnerUid: string | undefined;
    let sourceOwnerType: 'USER_A' | 'USER_B' | 'SHARED' | undefined;
    let targetOwnerType: 'USER_A' | 'USER_B' | 'SHARED' | undefined;
    let transferKind: 'SAME_USER' | 'CROSS_USERS' | 'CARD_PAYMENT' | undefined;
    let sourceAvailableBal: number | undefined = undefined;

    if (type === 'TRANSFER' && selectedSourceAcc && selectedTargetAcc) {
      sourceOwnerType = selectedSourceAcc.ownerType as any;
      targetOwnerType = selectedTargetAcc.ownerType as any;
      transferKind = transferOperationInfo?.kind;

      const resolveUid = (acc: any) => {
        if (!acc || acc.ownerType === 'SHARED') return currentUserId || '';
        if (acc.ownerType === 'USER_A') return userA?.id || userA?.uid || currentUserId || '';
        if (acc.ownerType === 'USER_B') return userB?.id || userB?.uid || currentUserId || '';
        return currentUserId || '';
      };

      sourceOwnerUid = resolveUid(selectedSourceAcc);
      targetOwnerUid = resolveUid(selectedTargetAcc);

      if (selectedSourceAcc.type !== 'LIABILITY' && selectedSourceAcc.type !== 'CREDIT_CARD') {
        const baseMetrics = calculateAccountAvailableBalance(selectedSourceAcc, projects);
        const isInitialSource = initialData && selectedSourceAcc.id === (initialData.sourceAccountId || initialData.sourceAccount);
        sourceAvailableBal = isInitialSource
          ? baseMetrics.availableBalance + Number(initialData.amount || 0)
          : baseMetrics.availableBalance;
      }
    }

    const validationInput: MovementValidationInput = {
      type,
      amount,
      date,
      currentUserId: currentUserId || undefined,
      appContext,
      categoryId: type !== 'TRANSFER' ? categoryId : undefined,
      categoryName: selectedCategory?.name,
      sourceAccountId: type === 'EXPENSE' || type === 'TRANSFER' ? sourceAccountId : undefined,
      targetAccountId: type === 'INCOME' || type === 'TRANSFER' ? targetAccountId : undefined,
      note: note,
      sourceOwnerUid,
      targetOwnerUid,
      sourceOwnerType,
      targetOwnerType,
      transferKind,
      sourceAccountAvailableBalance: sourceAvailableBal,
      sourceAccountName: selectedSourceAcc?.name,
      ...(type === 'EXPENSE'
        ? {
            options: {
              splitType,
              isMsi,
              msiCount: isMsi ? Number(msiCount) : undefined,
              tags: selectedTags,
            },
          }
        : {}),
    };

    const validation = validateMovement(validationInput);
    if (!validation.valid) {
      setFormError(validation.error || 'Por favor verifica los campos');
      return;
    }

    try {
      setIsSubmitting(true);
      if (type === 'INCOME' && validationInput.categoryId && validationInput.categoryId.startsWith('default-inc-')) {
        const houseId = (useAppStore.getState() as any).houseId;
        if (houseId) {
          try {
            const { createCategory, getCategories } = await import('../../lib/dataconnect');
            const catName = selectedCategory?.name || 'Sueldo / Salario';
            const createRes = await createCategory({
              householdId: houseId,
              name: catName,
              type: 'INCOME' as any,
              color: '#10b981',
              ownerType: 'SHARED' as any
            });
            const realCatId = createRes.data?.category_insert?.id;
            if (realCatId) {
              validationInput.categoryId = realCatId;
              const res = await getCategories({ householdId: houseId }, { fetchPolicy: 'SERVER_ONLY' as any });
              if (res.data?.categories) {
                useAppStore.setState({ categories: res.data.categories as any });
              }
            }
          } catch (catErr) {
            console.warn('Could not auto-create real category UUID on submit:', catErr);
          }
        }
      }
      const action = buildMovementAction(validationInput);
      await onSubmit(action);

      // F3.2: Guardar última cuenta usada condicionado al éxito de onSubmit
      const storage = getSafeStorage();
      if (type === 'EXPENSE') {
        saveLastUsedAccountId(storage, currentUserId, 'expense', sourceAccountId);
      } else if (type === 'INCOME') {
        saveLastUsedAccountId(storage, currentUserId, 'income', targetAccountId);
      } else if (type === 'TRANSFER') {
        saveLastUsedAccountId(storage, currentUserId, 'transfer', sourceAccountId);
      }
    } catch (err: any) {
      setFormError(err?.message || 'Error al procesar el movimiento');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Selector de modalidad (Gasto, Ingreso, Transferencia) */}
      <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-xl">
        <button
          type="button"
          onClick={() => handleTypeChange('EXPENSE')}
          className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            type === 'EXPENSE'
              ? 'bg-white text-secondary shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <ArrowDownLeft size={14} /> Gasto
        </button>
        <button
          type="button"
          onClick={() => handleTypeChange('INCOME')}
          className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            type === 'INCOME'
              ? 'bg-white text-primary shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <ArrowUpRight size={14} /> Ingreso
        </button>
        <button
          type="button"
          onClick={() => handleTypeChange('TRANSFER')}
          className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            type === 'TRANSFER'
              ? 'bg-white text-indigo-600 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <ArrowLeftRight size={14} /> Transferir
        </button>
      </div>

      {/* Alertas de bloqueo por estado vacío o falta de sesión */}
      {isAuthMissing && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2 text-amber-800 text-xs">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <span>No hay sesión de usuario activa. Inicia sesión para registrar movimientos.</span>
        </div>
      )}

      {isExpenseBlocked && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2 text-amber-800 text-xs">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <span>
            {expenseCategories.length === 0
              ? 'No hay categorías de gastos configuradas en el hogar.'
              : 'No hay cuentas disponibles para pagar el gasto.'}
          </span>
        </div>
      )}

      {isIncomeBlocked && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2 text-amber-800 text-xs">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <span>
            {incomeCategories.length === 0
              ? 'No hay categorías de ingreso configuradas en el hogar.'
              : 'No hay cuentas destino disponibles para recibir el ingreso.'}
          </span>
        </div>
      )}

      {isTransferBlocked && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2 text-amber-800 text-xs">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <span>Se necesitan al menos 2 cuentas para realizar una transferencia interna.</span>
        </div>
      )}

      {/* Monto y Fecha */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label htmlFor="mov-amount" className={LABEL_CLASS}>
            Monto ($)
          </label>
          <input
            id="mov-amount"
            type="number"
            step="0.01"
            min="0.01"
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value);
              if (formError) setFormError(null);
            }}
            placeholder="0.00"
            className={INPUT_CLASS}
            required
            disabled={isFormBlocked}
          />
        </div>

        <div>
          <label htmlFor="mov-date" className={LABEL_CLASS}>
            Fecha
          </label>
          <input
            id="mov-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={INPUT_CLASS}
            required
            disabled={isFormBlocked}
          />
        </div>
      </div>

      {/* Campos para Gasto */}
      {type === 'EXPENSE' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label htmlFor="mov-cat-exp" className={LABEL_CLASS}>
              Categoría
            </label>
            <select
              id="mov-cat-exp"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className={INPUT_CLASS}
              required
              disabled={isFormBlocked}
            >
              <option value="">Selecciona categoría</option>
              {expenseCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="mov-source-exp" className={LABEL_CLASS}>
              Pagado con
            </label>
            <select
              id="mov-source-exp"
              data-testid="mov-source-exp"
              value={sourceAccountId}
              onChange={(e) => {
                setSourceAccountId(e.target.value);
                setSourceTouched(true);
              }}
              className={INPUT_CLASS}
              required
              disabled={isFormBlocked}
            >
              <option value="">Selecciona cuenta</option>
              {expenseAccounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Campos para Ingreso */}
      {type === 'INCOME' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label htmlFor="mov-cat-inc" className={LABEL_CLASS}>
              Categoría
            </label>
            <select
              id="mov-cat-inc"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className={INPUT_CLASS}
              required
              disabled={isFormBlocked}
            >
              <option value="">Selecciona categoría</option>
              {incomeCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="mov-dest-inc" className={LABEL_CLASS}>
              Entra a
            </label>
            <select
              id="mov-dest-inc"
              data-testid="mov-dest-inc"
              value={targetAccountId}
              onChange={(e) => {
                setTargetAccountId(e.target.value);
                setTargetTouched(true);
              }}
              className={INPUT_CLASS}
              required
              disabled={isFormBlocked}
            >
              <option value="">Selecciona cuenta destino</option>
              {incomeDepositAccounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Campos para Transferencia con Enrutamiento Claro y Destino Ciego */}
      {type === 'TRANSFER' && (
        <div className="space-y-4">
          {/* Header de Operación con Badge */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Enrutamiento de Fondos
            </span>
            {transferOperationInfo ? (
              <div
                data-testid="transfer-operation-indicator"
                className={`px-3 py-1.5 rounded-full border text-xs font-bold flex items-center gap-1.5 shadow-xs ${transferOperationInfo.badgeClass}`}
              >
                <ArrowLeftRight size={13} className="shrink-0" />
                <span>{transferOperationInfo.label}</span>
              </div>
            ) : (
              <span className="text-xs text-slate-400">Selecciona origen y destino</span>
            )}
          </div>

          {/* Bloque visual: [Origen] → [Destino] */}
          <div className="bg-slate-50/80 border border-slate-200 rounded-2xl p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-[1fr,auto,1fr] gap-3 items-center">
              {/* Origen */}
              <div className="space-y-1.5">
                <label htmlFor="mov-source-trans" className={LABEL_CLASS}>
                  De cuenta (Origen)
                </label>
                <select
                  id="mov-source-trans"
                  data-testid="mov-source-acc"
                  value={sourceAccountId}
                  onChange={(e) => {
                    setSourceAccountId(e.target.value);
                    setSourceTouched(true);
                    if (formError) setFormError(null);
                  }}
                  className={INPUT_CLASS}
                  required
                  disabled={isFormBlocked}
                >
                  <option value="">Selecciona cuenta origen</option>
                  {transferSourceAccounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {formatAccountOption(a, true)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Indicador de Flujo / Flecha */}
              <div className="hidden md:flex flex-col items-center justify-center pt-5 text-indigo-500">
                <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-200 flex items-center justify-center shadow-xs">
                  <ArrowRight size={16} />
                </div>
              </div>

              {/* Destino */}
              <div className="space-y-1.5">
                <label htmlFor="mov-target-trans" className={LABEL_CLASS}>
                  A cuenta (Destino)
                </label>
                <select
                  id="mov-target-trans"
                  data-testid="mov-target-acc"
                  value={targetAccountId}
                  onChange={(e) => {
                    setTargetAccountId(e.target.value);
                    setTargetTouched(true);
                    if (formError) setFormError(null);
                  }}
                  className={INPUT_CLASS}
                  required
                  disabled={isFormBlocked}
                >
                  <option value="">Selecciona cuenta destino</option>
                  {transferTargetAccounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {formatAccountOption(a, false)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Panel informativo desacoplado debajo de los selectores */}
            <div className="pt-3 border-t border-slate-200/70 flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center text-xs">
              {/* Disponibilidad en Origen */}
              {selectedSourceAcc &&
                !isPartnerAccount(selectedSourceAcc, activeMemberSlot) &&
                selectedSourceAcc.type !== 'LIABILITY' &&
                selectedSourceAcc.type !== 'CREDIT_CARD' && (() => {
                const metrics = calculateAccountAvailableBalance(selectedSourceAcc, projects);
                const isInitialSource = Boolean(initialData && selectedSourceAcc.id === (initialData.sourceAccountId || initialData.sourceAccount));
                const available = isInitialSource
                  ? metrics.availableBalance + Number(initialData.amount || 0)
                  : metrics.availableBalance;
                const isOver = Boolean(amount && Number(amount) > available);
                return (
                  <div className="space-y-0.5">
                    <span className="text-slate-600 font-medium">
                      Disponible en origen:{' '}
                      <strong className={`font-bold ${isOver ? 'text-red-600' : 'text-slate-800'}`}>
                        ${available.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </strong>
                      {' '}(Contable: ${metrics.ledgerBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})
                    </span>
                    {isOver && (
                      <p className="text-red-600 font-semibold">
                        El monto supera el disponible para transferir.
                      </p>
                    )}
                  </div>
                );
              })()}

              {/* Modo Destino Ciego / Badge para Destino */}
              {selectedTargetAcc && isPartnerAccount(selectedTargetAcc, activeMemberSlot) && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 text-purple-700 border border-purple-200/80 rounded-xl font-medium">
                  <ShieldCheck size={15} className="shrink-0 text-purple-600" />
                  <span>Modo Destino Ciego: Tu pareja recibirá los fondos; no se revelan saldos ni movimientos.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Nota opcional */}
      <div>
        <label htmlFor="mov-note" className={LABEL_CLASS}>
          Nota o detalle (opcional)
        </label>
        <input
          id="mov-note"
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder={
            type === 'EXPENSE'
              ? 'Ej. Supermercado, Almuerzo...'
              : type === 'INCOME'
              ? 'Ej. Sueldo quincenal, Bono...'
              : 'Ej. Traspaso ahorro, Préstamo...'
          }
          className={INPUT_CLASS}
          disabled={isFormBlocked}
        />
      </div>

      {/* Acordeón / Colapsable "Más opciones" para Gasto */}
      {type === 'EXPENSE' && (
        <div className="pt-1">
          <button
            type="button"
            onClick={() => setIsOptionsOpen((prev) => !prev)}
            aria-expanded={isOptionsOpen}
            aria-controls="movement-advanced-options"
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 transition-colors focus:outline-none"
          >
            <span>Más opciones</span>
            {isOptionsOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          {isOptionsOpen && (
            <div id="movement-advanced-options" className="space-y-3 pt-2">
              {appContext !== 'personal' && (
                <>
                  <div>
                    <label htmlFor="mov-split-type" className={LABEL_CLASS}>
                      Tipo de división
                    </label>
                    <select
                      id="mov-split-type"
                      value={splitType}
                      onChange={(e) =>
                        setSplitType(e.target.value as '50/50' | 'proporcional' | 'individual')
                      }
                      className={INPUT_CLASS}
                      disabled={isFormBlocked}
                    >
                      <option value="50/50">Mitades (50/50)</option>
                      <option value="proporcional">Proporcional (Ingresos)</option>
                      <option value="individual">Individual (100% pagador)</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        id="mov-is-msi"
                        type="checkbox"
                        checked={isMsi}
                        onChange={(e) => setIsMsi(e.target.checked)}
                        className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary/50"
                        disabled={isFormBlocked}
                      />
                      <label
                        htmlFor="mov-is-msi"
                        className="text-xs font-semibold text-slate-700 cursor-pointer select-none"
                      >
                        Meses sin intereses (MSI)
                      </label>
                    </div>

                    {isMsi && (
                      <div>
                        <label htmlFor="mov-msi-count" className={LABEL_CLASS}>
                          Número de meses (2 a 48)
                        </label>
                        <input
                          id="mov-msi-count"
                          type="number"
                          min={2}
                          max={48}
                          value={msiCount}
                          onChange={(e) =>
                            setMsiCount(e.target.value === '' ? '' : Number(e.target.value))
                          }
                          className={INPUT_CLASS}
                          disabled={isFormBlocked}
                        />
                      </div>
                    )}
                  </div>
                </>
              )}

              {tags && tags.length > 0 && (
                <div>
                  <span id="mov-tags-label" className={LABEL_CLASS}>
                    Etiquetas
                  </span>
                  <div
                    role="group"
                    aria-labelledby="mov-tags-label"
                    className="flex flex-wrap gap-1.5"
                  >
                    {tags.map((t) => {
                      if (!t || !t.id || !t.name) return null;
                      const isSelected = selectedTags.includes(t.id);
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => handleTagToggle(t.id)}
                          aria-pressed={isSelected}
                          className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${
                            isSelected
                              ? 'bg-primary text-white shadow-xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {t.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Error de validación o envío */}
      {formError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-xs">
          {formError}
        </div>
      )}

      {/* Botones de acción */}
      <div className="flex gap-2 pt-2 justify-end">
        <Button variant="outline" type="button" onClick={onCancel}>
          Cancelar
        </Button>
        <Button
          variant="primary"
          type="submit"
          disabled={isFormBlocked || isSubmitting}
        >
          {isSubmitting
            ? 'Guardando...'
            : initialData
            ? (type === 'TRANSFER' ? 'Actualizar Transferencia' : 'Actualizar Movimiento')
            : 'Guardar Movimiento'}
        </Button>
      </div>
    </form>
  );
}
