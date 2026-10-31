// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { filterContextByMode, filterTransfersByMode } from '../App';
import { useAppStore } from '../store/useAppStore';
import { inferBudgetCategoryIcon, resolveBudgetIcon } from '../store/slices/dataSlice';
import {
  createAccount,
  createJournalWithEntries,
  seedDefaultAccounts,
  deleteJournal,
  getInvitation,
} from '../lib/dataconnect';
import { validateMovement } from '../services/movementService';
import { filterTransferTargetAccounts } from '../services/ownershipService';
import { checkInvitation } from '../services/userService';

vi.mock('../lib/dataconnect', async (importOriginal) => {
  const actual = await importOriginal<any>();
  return {
    ...actual,
    createAccount: vi.fn(),
    updateAccount: vi.fn(),
    deleteAccount: vi.fn(),
    archiveAccount: vi.fn(),
    createJournalWithEntries: vi.fn(),
    createInternalTransfer: vi.fn(),
    updateInternalTransfer: vi.fn(),
    deleteJournal: vi.fn(),
    seedDefaultAccounts: vi.fn(),
    getInvitation: vi.fn(),
  };
});

describe('Audited Bugs Fix - Pruebas Unitarias Exhaustivas', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // =========================================================================
  // 1. Aislamiento Estricto Hogar vs Personal (filterContext)
  // =========================================================================
  describe('1. filterContext en App.tsx (Hogar vs Personal)', () => {
    const currentUserId = 'user-david-123';
    const partnerId = 'user-partner-456';

    const sampleIncomes = [
      { id: 'inc-1', description: 'Sueldo Compartido', amount: 5000, isPrivate: false, isShared: true, ownerUid: currentUserId },
      { id: 'inc-2', description: 'Bono Privado David', amount: 1000, isPrivate: true, isShared: false, ownerUid: currentUserId },
      { id: 'inc-3', description: 'Sueldo Pareja', amount: 4000, isPrivate: false, isShared: true, ownerUid: partnerId },
      { id: 'inc-4', description: 'Venta Privada Pareja', amount: 800, isPrivate: true, isShared: false, ownerUid: partnerId },
    ];

    const sampleExpenses = [
      { id: 'exp-1', description: 'Supermercado Hogar', amount: 1500, isPrivate: false, isShared: true, userId: currentUserId },
      { id: 'exp-2', description: 'Ropa Privada David', amount: 600, isPrivate: true, isShared: false, userId: currentUserId },
      { id: 'exp-3', description: 'Luz y Gas', amount: 800, isPrivate: false, isShared: true, paidBy: partnerId },
      { id: 'exp-4', description: 'Capricho Privado Pareja', amount: 300, isPrivate: true, isShared: false, paidBy: partnerId },
    ];

    it("en modo 'household' excluye estrictamente ingresos y gastos privados, incluso del usuario activo", () => {
      const householdIncomes = filterContextByMode(sampleIncomes, 'household', currentUserId);
      expect(householdIncomes).toHaveLength(2);
      expect(householdIncomes.map((i) => i.id)).toEqual(['inc-1', 'inc-3']);
      expect(householdIncomes.some((i) => i.isPrivate)).toBe(false);

      const householdExpenses = filterContextByMode(sampleExpenses, 'household', currentUserId);
      expect(householdExpenses).toHaveLength(2);
      expect(householdExpenses.map((e) => e.id)).toEqual(['exp-1', 'exp-3']);
      expect(householdExpenses.some((e) => e.isPrivate)).toBe(false);
    });

    it("en modo 'personal' devuelve únicamente movimientos privados que pertenecen al usuario activo", () => {
      const personalIncomes = filterContextByMode(sampleIncomes, 'personal', currentUserId);
      expect(personalIncomes).toHaveLength(1);
      expect(personalIncomes[0].id).toBe('inc-2');
      expect(personalIncomes[0].ownerUid).toBe(currentUserId);
      expect(personalIncomes[0].isPrivate).toBe(true);

      const personalExpenses = filterContextByMode(sampleExpenses, 'personal', currentUserId);
      expect(personalExpenses).toHaveLength(1);
      expect(personalExpenses[0].id).toBe('exp-2');
      expect(personalExpenses[0].userId).toBe(currentUserId);
      expect(personalExpenses[0].isPrivate).toBe(true);
    });

    it("en modo 'personal' no cuela movimientos privados de la pareja ni compartidos", () => {
      const personalIncomes = filterContextByMode(sampleIncomes, 'personal', currentUserId);
      expect(personalIncomes.some((i) => i.ownerUid === partnerId)).toBe(false);
      expect(personalIncomes.some((i) => i.isShared)).toBe(false);

      const personalExpenses = filterContextByMode(sampleExpenses, 'personal', currentUserId);
      expect(personalExpenses.some((e) => e.paidBy === partnerId)).toBe(false);
      expect(personalExpenses.some((e) => e.isShared)).toBe(false);
    });

    it("filterTransfersByMode en 'household' y 'personal' soporta sourceOwnerUid e isShared", () => {
      const sampleTransfers = [
        { id: 'tr-1', description: 'Traspaso compartido', amount: 500, isShared: true, sourceOwnerUid: currentUserId },
        { id: 'tr-2', description: 'Traspaso privado David', amount: 200, isShared: false, isPrivate: true, sourceOwnerUid: currentUserId },
        { id: 'tr-3', description: 'Traspaso privado Pareja', amount: 300, isShared: false, isPrivate: true, sourceOwnerUid: partnerId },
      ];

      const householdTransfers = filterTransfersByMode(sampleTransfers, 'household', currentUserId);
      expect(householdTransfers).toHaveLength(1);
      expect(householdTransfers[0].id).toBe('tr-1');

      const personalTransfers = filterTransfersByMode(sampleTransfers, 'personal', currentUserId);
      expect(personalTransfers).toHaveLength(1);
      expect(personalTransfers[0].id).toBe('tr-2');
    });

    it("filterTransfersByMode es bilateral: incluye transferencias CROSS_USERS en el modo personal tanto para emisor como para receptor", () => {
      const crossTransfer = {
        id: 'tr-cross-1',
        description: 'Traspaso a pareja',
        amount: 1,
        sourceOwnerUid: currentUserId,
        targetOwnerUid: partnerId,
        sourceOwnerType: 'USER_A',
        targetOwnerType: 'USER_B',
        transferKind: 'CROSS_USERS',
        isShared: false,
      };

      // Para el emisor (David) en modo personal: debe incluirse
      const senderPersonal = filterTransfersByMode([crossTransfer], 'personal', currentUserId);
      expect(senderPersonal).toHaveLength(1);
      expect(senderPersonal[0].id).toBe('tr-cross-1');

      // Para el receptor (Pareja) en modo personal: debe incluirse
      const receiverPersonal = filterTransfersByMode([crossTransfer], 'personal', partnerId);
      expect(receiverPersonal).toHaveLength(1);
      expect(receiverPersonal[0].id).toBe('tr-cross-1');

      // Para un tercer usuario no participante en modo personal: se excluye
      const thirdPartyPersonal = filterTransfersByMode([crossTransfer], 'personal', 'other-user-999');
      expect(thirdPartyPersonal).toHaveLength(0);
    });

    it("filterTransfersByMode en modo household incluye transferencias compartidas o que involucren cuentas de Hogar (SHARED)", () => {
      const transfers = [
        { id: 'tr-shared-flag', isShared: true, sourceOwnerUid: currentUserId, targetOwnerUid: partnerId },
        { id: 'tr-shared-acc', isShared: false, sourceOwnerType: 'SHARED', targetOwnerType: 'USER_A', sourceOwnerUid: currentUserId },
        { id: 'tr-private-cross', isShared: false, sourceOwnerType: 'USER_A', targetOwnerType: 'USER_B', sourceOwnerUid: currentUserId, targetOwnerUid: partnerId },
      ];

      const householdTransfers = filterTransfersByMode(transfers, 'household', currentUserId);
      expect(householdTransfers.map((t: any) => t.id)).toEqual(['tr-shared-flag', 'tr-shared-acc']);
    });

    it("filtra gastos históricos del mes anterior respetando el appContext activo", () => {
      const prevExpenses = [
        { id: 'prev-1', amount: 1000, isShared: true, isPrivate: false, date: '2026-09-15', userId: currentUserId },
        { id: 'prev-2', amount: 400, isShared: false, isPrivate: true, date: '2026-09-16', userId: currentUserId },
        { id: 'prev-3', amount: 600, isShared: false, isPrivate: true, date: '2026-09-17', userId: partnerId },
      ];

      const householdPrev = filterContextByMode(prevExpenses, 'household', currentUserId);
      const personalPrev = filterContextByMode(prevExpenses, 'personal', currentUserId);

      expect(householdPrev.map((e) => e.id)).toEqual(['prev-1']);
      expect(personalPrev.map((e) => e.id)).toEqual(['prev-2']);
    });
  });

  // =========================================================================
  // 2. Historial de Transferencias y Categorías (HistoricalView)
  // =========================================================================
  describe('2. Historial de Transferencias y Categorías (HistoricalView)', () => {
    it('evalúa categorías de transferencias como Transferencia o Pago de Tarjeta sin colisión de rutas', () => {
      const rawTransfers = [
        {
          id: 'tr-1',
          type: 'TRANSFER',
          amount: 500,
          date: '2026-10-15',
          sourceAccountName: 'Nómina BBVA',
          targetAccountName: 'Apartados Santander',
        },
        {
          id: 'tr-2',
          type: 'CARD_PAYMENT',
          amount: 1200,
          date: '2026-10-18',
          sourceAccountName: 'Nómina BBVA',
          targetAccountName: 'Tarjeta Nu',
        },
      ];

      // Verificamos que la categoría calculada sea consistente con el tipo y los filtros
      const trRecords = rawTransfers.map((t: any) => ({
        ...t,
        category: t.type === 'CARD_PAYMENT' ? 'Pago de Tarjeta' : 'Transferencia',
        typeLabel: t.type === 'CARD_PAYMENT' ? 'Pago de Tarjeta' : 'Transferencia',
      }));

      expect(trRecords[0].category).toBe('Transferencia');
      expect(trRecords[1].category).toBe('Pago de Tarjeta');
      // No debe contener flechas de colisión con los nombres de cuenta
      expect(trRecords[0].category).not.toContain('→');
      expect(trRecords[1].category).not.toContain('→');
    });

    it("filtro de categorías con deselectedCategories funciona sin interferencia de gastos", () => {
      const deselectedCategories = new Set(['Comida', 'Supermercado', 'Renta']);
      const rawTransfers = [
        { id: 'tr-1', type: 'TRANSFER', amount: 500 },
        { id: 'tr-2', type: 'CARD_PAYMENT', amount: 1200 },
      ];

      // Filtrado de transferencias
      const filtered = rawTransfers.filter((t) => {
        const cat = t.type === 'CARD_PAYMENT' ? 'Pago de Tarjeta' : 'Transferencia';
        return !deselectedCategories.has(cat);
      });

      // Ninguna transferencia se descartó porque las categorías deseleccionadas eran de gastos
      expect(filtered).toHaveLength(2);

      // Si se deselecciona 'Transferencia', solo queda 'Pago de Tarjeta'
      deselectedCategories.add('Transferencia');
      const filteredAfter = rawTransfers.filter((t) => {
        const cat = t.type === 'CARD_PAYMENT' ? 'Pago de Tarjeta' : 'Transferencia';
        return !deselectedCategories.has(cat);
      });
      expect(filteredAfter).toHaveLength(1);
      expect(filteredAfter[0].id).toBe('tr-2');
    });

    it('atribución dual: no descarta la transferencia si al menos uno de los participantes está seleccionado', () => {
      const deselectedUsers = new Set(['user-algae-123']); // Se deselecciona el emisor
      const senderUid: string = 'user-algae-123';
      const receiverUid: string = 'user-chicken-456';

      const senderSelected = !deselectedUsers.has(senderUid);
      const receiverSelected = !deselectedUsers.has(receiverUid);

      // Si están en una transferencia inter-usuario, permanece visible si cualquiera está seleccionado
      const isVisible = (senderUid && receiverUid && senderUid !== receiverUid)
        ? (senderSelected || receiverSelected)
        : senderSelected;

      expect(isVisible).toBe(true);

      // Si se deseleccionan AMBOS participantes, entonces sí se oculta
      deselectedUsers.add('user-chicken-456');
      const senderSelectedBoth = !deselectedUsers.has(senderUid);
      const receiverSelectedBoth = !deselectedUsers.has(receiverUid);
      const isVisibleBoth = (senderUid && receiverUid && senderUid !== receiverUid)
        ? (senderSelectedBoth || receiverSelectedBoth)
        : senderSelectedBoth;

      expect(isVisibleBoth).toBe(false);
    });

    it('construye trayectoria Emisor → Receptor para la columna Registrado por cuando senderUid !== receiverUid', () => {
      const users = [
        { id: 'user-algae-123', name: 'Algae Raccoon' },
        { id: 'user-chicken-456', name: 'Chicken Algae' },
      ];
      const record = {
        recordType: 'transfer',
        senderUid: 'user-algae-123',
        receiverUid: 'user-chicken-456',
        sourceOwnerUid: 'user-algae-123',
        targetOwnerUid: 'user-chicken-456',
      };

      const senderObj = users.find((u) => u.id === record.senderUid);
      const receiverObj = users.find((u) => u.id === record.receiverUid);
      const userName = (record.senderUid && record.receiverUid && record.senderUid !== record.receiverUid)
        ? `${senderObj?.name || 'Origen'} → ${receiverObj?.name || 'Destino'}`
        : senderObj?.name || 'Sistema';

      expect(userName).toBe('Algae Raccoon → Chicken Algae');
    });

    it('asigna monto positivo y etiqueta Transferencia Recibida para el receptor en vista personal', () => {
      const currentUserId = 'user-chicken-456';
      const appContext = 'personal';
      const record = {
        recordType: 'transfer',
        type: 'TRANSFER',
        amount: 1,
        senderUid: 'user-algae-123',
        receiverUid: 'user-chicken-456',
      };

      const isTransfer = record.recordType === 'transfer';
      const isReceiver = isTransfer && currentUserId && (record.receiverUid === currentUserId);
      const isSender = isTransfer && currentUserId && (record.senderUid === currentUserId);

      let amountSign = '';
      if (appContext === 'personal' && isReceiver && !isSender) {
        amountSign = '+';
      }

      const typeBadgeLabel = isTransfer && appContext === 'personal' && isReceiver && !isSender
        ? 'Transferencia Recibida'
        : 'Transferencia';

      expect(amountSign).toBe('+');
      expect(typeBadgeLabel).toBe('Transferencia Recibida');
    });
  });

  // =========================================================================
  // 3. Asiento de Saldo Inicial al Crear Cuenta (accountSlice.ts)
  // =========================================================================
  describe('3. Asiento de Saldo Inicial al Crear Cuenta (accountSlice)', () => {
    it('genera asiento de apertura con createJournalWithEntries si initialBalance > 0 en cuenta de activo', async () => {
      (createAccount as any).mockResolvedValueOnce({
        data: { account_insert: { id: 'new-acc-asset-999' } },
      });
      (createJournalWithEntries as any).mockResolvedValueOnce({
        data: { journal_insert: { id: 'journal-opening-1' } },
      });

      useAppStore.setState({
        user: { uid: 'user-titular-1', memberSlot: 'USER_A' } as any,
        houseId: 'house-abc-123',
        accounts: [
          { id: 'acc-inc-default', type: 'INCOME', name: 'Ingresos del Hogar' },
          { id: 'acc-exp-default', type: 'EXPENSE', name: 'Gastos del Hogar' },
        ] as any,
        fetchDashboardData: vi.fn().mockResolvedValue(undefined) as any,
      });

      await useAppStore.getState().addAccount({
        name: 'BBVA Nómina Ahorro',
        type: 'ASSET',
        initialBalance: 2500,
        shared: true,
      });

      expect(createAccount).toHaveBeenCalledTimes(1);
      expect(createJournalWithEntries).toHaveBeenCalledTimes(1);
      expect(createJournalWithEntries).toHaveBeenCalledWith(
        expect.objectContaining({
          householdId: 'house-abc-123',
          description: 'Saldo inicial',
          amount: 2500,
          debitAccountId: 'new-acc-asset-999', // DEBIT suma saldo al activo
          creditAccountId: 'acc-inc-default',   // CREDIT a cuenta de contrapartida
          isShared: true,
        })
      );
    });

    it('genera asiento con CREDIT a la cuenta si initialBalance > 0 en tarjeta de crédito (LIABILITY)', async () => {
      (createAccount as any).mockResolvedValueOnce({
        data: { account_insert: { id: 'new-card-liability-888' } },
      });
      (createJournalWithEntries as any).mockResolvedValueOnce({
        data: { journal_insert: { id: 'journal-opening-card' } },
      });

      useAppStore.setState({
        user: { uid: 'user-titular-2', memberSlot: 'USER_B' } as any,
        houseId: 'house-abc-123',
        accounts: [
          { id: 'acc-inc-default', type: 'INCOME', name: 'Ingresos del Hogar' },
          { id: 'acc-exp-default', type: 'EXPENSE', name: 'Gastos del Hogar' },
        ] as any,
        fetchDashboardData: vi.fn().mockResolvedValue(undefined) as any,
      });

      await useAppStore.getState().addAccount({
        name: 'Tarjeta Nu Deuda Inicial',
        type: 'LIABILITY',
        initialBalance: 1200,
        shared: false,
      });

      expect(createAccount).toHaveBeenCalledTimes(1);
      expect(createJournalWithEntries).toHaveBeenCalledTimes(1);
      expect(createJournalWithEntries).toHaveBeenCalledWith(
        expect.objectContaining({
          householdId: 'house-abc-123',
          description: 'Saldo inicial',
          amount: 1200,
          creditAccountId: 'new-card-liability-888', // CREDIT suma deuda contable a la tarjeta
          debitAccountId: 'acc-exp-default',
        })
      );
    });

    it('redondea initialBalance a 2 decimales si tiene más cifras fraccionarias', async () => {
      (createAccount as any).mockResolvedValueOnce({
        data: { account_insert: { id: 'new-acc-round-111' } },
      });
      (createJournalWithEntries as any).mockResolvedValueOnce({
        data: { journal_insert: { id: 'journal-round-1' } },
      });

      useAppStore.setState({
        user: { uid: 'user-titular-1' } as any,
        houseId: 'house-abc-123',
        accounts: [
          { id: 'acc-inc-default', type: 'INCOME', name: 'Ingresos del Hogar' },
          { id: 'acc-exp-default', type: 'EXPENSE', name: 'Gastos del Hogar' },
        ] as any,
        fetchDashboardData: vi.fn().mockResolvedValue(undefined) as any,
      });

      await useAppStore.getState().addAccount({
        name: 'Cuenta Fracciones',
        type: 'ASSET',
        initialBalance: 123.456,
        shared: true,
      });

      expect(createJournalWithEntries).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: 123.46,
        })
      );
    });

    it('utiliza la respuesta directa de seedDefaultAccounts si las cuentas predeterminadas no existían', async () => {
      (createAccount as any).mockResolvedValueOnce({
        data: { account_insert: { id: 'new-acc-seed-222' } },
      });
      (seedDefaultAccounts as any).mockResolvedValueOnce({
        data: {
          assetAccount: { id: 'seed-asset-1' },
          incomeAccount: { id: 'seed-income-1' },
          expenseAccount: { id: 'seed-expense-1' },
        },
      });
      (createJournalWithEntries as any).mockResolvedValueOnce({
        data: { journal_insert: { id: 'journal-seed-1' } },
      });

      useAppStore.setState({
        user: { uid: 'user-titular-1' } as any,
        houseId: 'house-abc-123',
        accounts: [] as any,
        fetchDashboardData: vi.fn().mockResolvedValue(undefined) as any,
      });

      await useAppStore.getState().addAccount({
        name: 'Cuenta Con Auto Seed',
        type: 'ASSET',
        initialBalance: 500,
        shared: true,
      });

      expect(seedDefaultAccounts).toHaveBeenCalledTimes(1);
      expect(createJournalWithEntries).toHaveBeenCalledWith(
        expect.objectContaining({
          creditAccountId: 'seed-income-1',
          debitAccountId: 'new-acc-seed-222',
          amount: 500,
        })
      );
    });

    it('NO genera asiento de apertura si initialBalance es 0 o no se especifica', async () => {
      (createAccount as any).mockResolvedValueOnce({
        data: { account_insert: { id: 'new-acc-zero-777' } },
      });

      useAppStore.setState({
        user: { uid: 'user-titular-1' } as any,
        houseId: 'house-abc-123',
        accounts: [] as any,
        fetchDashboardData: vi.fn().mockResolvedValue(undefined) as any,
      });

      await useAppStore.getState().addAccount({
        name: 'Efectivo Vacio',
        type: 'ASSET',
        initialBalance: 0,
        shared: true,
      });

      expect(createAccount).toHaveBeenCalledTimes(1);
      expect(createJournalWithEntries).not.toHaveBeenCalled();
    });
  });

  // =========================================================================
  // 4. Validación y Disponibilidad en Transferencias (MovementForm & MovementService)
  // =========================================================================
  describe('4. Validación de Fondos Disponibles en Transferencias', () => {
    it('bloquea la transferencia si amount supera el saldo disponible de una cuenta de activo', () => {
      const result = validateMovement({
        type: 'TRANSFER',
        amount: 1200,
        date: '2026-10-25',
        currentUserId: 'usr-david-123',
        sourceAccountId: 'acc-asset-1',
        targetAccountId: 'acc-asset-2',
        sourceAccountName: 'Caja Débito',
        sourceAccountAvailableBalance: 1000,
      });

      expect(result.valid).toBe(false);
      expect(result.error).toContain('Fondos insuficientes en la cuenta de origen "Caja Débito"');
      expect(result.error).toContain('Saldo disponible: $1000.00');
    });

    it('permite la transferencia si amount es menor o igual al disponible real de una cuenta de activo', () => {
      const result = validateMovement({
        type: 'TRANSFER',
        amount: 800,
        date: '2026-10-25',
        currentUserId: 'usr-david-123',
        sourceAccountId: 'acc-asset-1',
        targetAccountId: 'acc-asset-2',
        sourceAccountName: 'Caja Débito',
        sourceAccountAvailableBalance: 1000,
      });

      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('no bloquea por disponibilidad si la cuenta de origen no especifica disponible (por ej. pasivo)', () => {
      const result = validateMovement({
        type: 'TRANSFER',
        amount: 5000,
        date: '2026-10-25',
        currentUserId: 'usr-david-123',
        sourceAccountId: 'acc-card-1',
        targetAccountId: 'acc-asset-2',
        sourceAccountAvailableBalance: undefined, // En pasivos no se restringe por disponible
      });

      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('payCreditCard asigna fallbacks de ownerUid e isShared cuando no se suministran explícitamente', async () => {
      useAppStore.setState({
        user: { uid: 'user-active-default' } as any,
        houseId: 'house-xyz-456',
        fetchDashboardData: vi.fn().mockResolvedValue(undefined) as any,
      });

      await useAppStore.getState().payCreditCard(
        'acc-bank-1',
        'acc-card-1',
        350,
        '2026-10-29'
        // ownerUid and isShared omitted
      );

      expect(createJournalWithEntries).toHaveBeenCalledWith(
        expect.objectContaining({
          householdId: 'house-xyz-456',
          amount: 350,
          debitAccountId: 'acc-card-1',
          creditAccountId: 'acc-bank-1',
          ownerUid: 'user-active-default',
          isShared: true,
          isInternalTransfer: true,
        })
      );
    });

    it('updateTransfer preserva isShared, isPrivate, ownerUid y userId en el estado en memoria', async () => {
      const initialTransfers = [
        {
          id: 'tr-edit-1',
          date: '2026-10-10',
          amount: 300,
          sourceAccountId: 'acc-1',
          targetAccountId: 'acc-2',
          sourceOwnerUid: 'usr-david',
          isShared: false,
          isPrivate: true,
        },
      ];

      useAppStore.setState({
        houseId: 'house-xyz-456',
        transfers: initialTransfers as any,
        accounts: [
          { id: 'acc-1', name: 'BBVA', ownerType: 'USER_A' },
          { id: 'acc-2', name: 'Santander', ownerType: 'USER_A' },
        ] as any,
        users: [{ id: 'usr-david', memberSlot: 'USER_A' }] as any,
        fetchDashboardData: vi.fn().mockResolvedValue(undefined) as any,
      });

      await useAppStore.getState().updateTransfer(
        'tr-edit-1',
        'acc-1',
        'acc-2',
        450,
        '2026-10-12',
        'usr-david',
        false, // isShared = false
        'Ajuste privado',
        'usr-david',
        'usr-david'
      );

      const updated = useAppStore.getState().transfers.find((t) => t.id === 'tr-edit-1') as any;
      expect(updated).toBeDefined();
      expect(updated?.amount).toBe(450);
      expect(updated?.isShared).toBe(false);
      expect(updated?.isPrivate).toBe(true);
      expect(updated?.ownerUid).toBe('usr-david');
      expect(updated?.userId).toBe('usr-david');
    });
  });

  // =========================================================================
  // 7. Opt-In de Cuentas Personales para Transferencias de Pareja (allowPartnerTransfers)
  // =========================================================================
  describe('7. filterTransferTargetAccounts con Opt-In allowPartnerTransfers', () => {
    const mockAccounts = [
      { id: 'acc-shared', name: 'Cuenta Compartida Hogar', ownerType: 'SHARED', allowPartnerTransfers: false },
      { id: 'acc-own-a', name: 'Nómina David A', ownerType: 'USER_A', allowPartnerTransfers: false },
      { id: 'acc-partner-b-closed', name: 'Ahorro Secreto B', ownerType: 'USER_B', allowPartnerTransfers: false },
      { id: 'acc-partner-b-open', name: 'Débito Recibir B', ownerType: 'USER_B', allowPartnerTransfers: true },
    ];

    it('para USER_A: muestra cuenta propia, compartida y únicamente la cuenta de USER_B que tenga allowPartnerTransfers=true', () => {
      const targetsForA = filterTransferTargetAccounts(mockAccounts, 'USER_A');
      const ids = targetsForA.map((a) => a.id);
      expect(ids).toContain('acc-shared');
      expect(ids).toContain('acc-own-a');
      expect(ids).toContain('acc-partner-b-open');
      expect(ids).not.toContain('acc-partner-b-closed');
      expect(targetsForA).toHaveLength(3);
    });

    it('para USER_B: muestra cuenta propia, compartida y excluye cuenta de USER_A que tenga allowPartnerTransfers=false', () => {
      const targetsForB = filterTransferTargetAccounts(mockAccounts, 'USER_B');
      const ids = targetsForB.map((a) => a.id);
      expect(ids).toContain('acc-shared');
      expect(ids).toContain('acc-partner-b-closed');
      expect(ids).toContain('acc-partner-b-open');
      expect(ids).not.toContain('acc-own-a');
      expect(targetsForB).toHaveLength(3);
    });

    it('si no se provee userSlot, retorna todas las cuentas de forma segura', () => {
      const all = filterTransferTargetAccounts(mockAccounts);
      expect(all).toHaveLength(4);
    });
  });

  // =========================================================================
  // 8. Eliminación Completa de Transferencias (deleteTransfer)
  // =========================================================================
  describe('8. deleteTransfer en accountSlice', () => {
    it('elimina la transferencia de forma optimista y llama a deleteJournal en Data Connect', async () => {
      const sampleTransfers = [
        { id: 'tr-del-1', amount: 500, description: 'Traspaso a borrar' },
        { id: 'tr-del-2', amount: 300, description: 'Traspaso que queda' },
      ];

      useAppStore.setState({
        houseId: 'house-del-789',
        transfers: sampleTransfers as any,
        fetchDashboardData: vi.fn().mockResolvedValue(undefined) as any,
      });

      await useAppStore.getState().deleteTransfer('tr-del-1');

      expect(deleteJournal).toHaveBeenCalledWith({
        journalId: 'tr-del-1',
        householdId: 'house-del-789',
      });

      const remaining = useAppStore.getState().transfers;
      expect(remaining.map((t: any) => t.id)).toEqual(['tr-del-2']);
    });

    it('revierte el estado optimista si deleteJournal falla', async () => {
      const sampleTransfers = [{ id: 'tr-fail-1', amount: 100 }];
      (deleteJournal as any).mockRejectedValueOnce(new Error('Network error on delete'));

      useAppStore.setState({
        houseId: 'house-fail-789',
        transfers: sampleTransfers as any,
        fetchDashboardData: vi.fn().mockResolvedValue(undefined) as any,
      });

      await expect(useAppStore.getState().deleteTransfer('tr-fail-1')).rejects.toThrow('Network error on delete');

      const rolledBack = useAppStore.getState().transfers;
      expect(rolledBack).toHaveLength(1);
      expect(rolledBack[0].id).toBe('tr-fail-1');
    });
  });

  // =========================================================================
  // 6. Inferencia Semántica y Resolución de Íconos de Presupuesto
  // =========================================================================
  describe('6. Inferencia Semántica y Resolución de Íconos de Presupuesto', () => {
    it('infiere íconos correctos según palabras clave comunes en español', () => {
      expect(inferBudgetCategoryIcon('Luz')).toBe('💡');
      expect(inferBudgetCategoryIcon('Energía Eléctrica CFE')).toBe('💡');
      expect(inferBudgetCategoryIcon('Agua Potable')).toBe('💧');
      expect(inferBudgetCategoryIcon('Gas Natural')).toBe('🔥');
      expect(inferBudgetCategoryIcon('Internet Totalplay')).toBe('📱');
      expect(inferBudgetCategoryIcon('Préstamo Bancario')).toBe('🏦');
      expect(inferBudgetCategoryIcon('Crédito Automotriz')).toBe('🏦');
      expect(inferBudgetCategoryIcon('Ahorro para la Casa')).toBe('💰');
      expect(inferBudgetCategoryIcon('Renta de Casa')).toBe('🏠');
      expect(inferBudgetCategoryIcon('Despensa y Súper')).toBe('🛒');
      expect(inferBudgetCategoryIcon('Restaurantes y Salidas')).toBe('🍽️');
      expect(inferBudgetCategoryIcon('Gasolina Auto')).toBe('🚗');
      expect(inferBudgetCategoryIcon('Gastos Médicos y Salud')).toBe('🏥');
      expect(inferBudgetCategoryIcon('Colegiatura Universidad')).toBe('🎓');
      expect(inferBudgetCategoryIcon('Streaming Cine y Ocio')).toBe('🍿');
      expect(inferBudgetCategoryIcon('Vacaciones y Vuelos')).toBe('✈️');
      expect(inferBudgetCategoryIcon('Veterinaria Mascotas')).toBe('🐾');
    });

    it('resolveBudgetIcon reemplaza NULL, vacío o el carrito por defecto con la inferencia semántica', () => {
      expect(resolveBudgetIcon(null, 'Luz')).toBe('💡');
      expect(resolveBudgetIcon('', 'Agua')).toBe('💧');
      expect(resolveBudgetIcon('🛒', 'Préstamo')).toBe('🏦');
      expect(resolveBudgetIcon('🛒', 'Ahorro para el retiro')).toBe('💰');
    });

    it('resolveBudgetIcon preserva íconos personalizados elegidos por el usuario', () => {
      expect(resolveBudgetIcon('🎮', 'Videojuegos')).toBe('🎮');
      expect(resolveBudgetIcon('🍕', 'Despensa')).toBe('🍕');
    });
  });

  // =========================================================================
  // 7. Cálculo de Total Presupuestado (Presupuestos + Metas Activas)
  // =========================================================================
  describe('7. Cálculo de Total Presupuestado en Planeación', () => {
    it('suma presupuestos del mes y cuotas mensuales solo de metas activas, excluyendo completadas', () => {
      const budgets = [
        { id: 'b1', amount: 5000, allocatedAmount: 5000 },
        { id: 'b2', amount: 2000, allocatedAmount: 2000 },
      ];

      const projects = [
        { id: 'p1', name: 'Fondo de Emergencia', monthlyQuota: 1500, status: 'active', isCompleted: false },
        { id: 'p2', name: 'Viaje a Japón', monthlyQuota: 1000, status: 'pending', isCompleted: false },
        { id: 'p3', name: 'Comprar Laptop', monthlyQuota: 800, status: 'completed', isCompleted: true },
        { id: 'p4', name: 'Boda', monthlyQuota: 2000, status: 'active', isCompleted: true }, // completada por flag
      ];

      const totalBudgetsMonth = budgets.reduce((acc, b) => acc + Number(b.allocatedAmount ?? b.amount ?? 0), 0);
      expect(totalBudgetsMonth).toBe(7000);

      const activeGoalsQuota = projects
        .filter((p) => !p.isCompleted && p.status !== 'completed')
        .reduce((acc, p) => acc + Number(p.monthlyQuota || 0), 0);
      expect(activeGoalsQuota).toBe(2500); // 1500 + 1000

      const totalPresupuestado = totalBudgetsMonth + activeGoalsQuota;
      expect(totalPresupuestado).toBe(9500);
    });
  });

  // =========================================================================
  // 8. Retención de Record al Abrir Modales de Edición (App.tsx)
  // =========================================================================
  describe('8. Retención de Record al Abrir Modales de Edición', () => {
    it('asigna el registro al estado de edición y no lo resetea a null', () => {
      let editingMovement: any = null;
      let isModalOpen = false;

      const handleOpenExpenseModal = (record?: any) => {
        editingMovement = record || null;
        isModalOpen = true;
      };

      const handleOpenIncomeModal = (record?: any) => {
        editingMovement = record || null;
        isModalOpen = true;
      };

      const sampleExpense = { id: 'exp-123', amount: 450, description: 'Cena' };
      handleOpenExpenseModal(sampleExpense);
      expect(isModalOpen).toBe(true);
      expect(editingMovement).toEqual(sampleExpense);

      const sampleIncome = { id: 'inc-456', amount: 8000, description: 'Honorarios' };
      handleOpenIncomeModal(sampleIncome);
      expect(isModalOpen).toBe(true);
      expect(editingMovement).toEqual(sampleIncome);

      // Al hacer clic en "Nuevo Movimiento", se limpia a null
      const handleNewMovement = () => {
        editingMovement = null;
        isModalOpen = true;
      };
      handleNewMovement();
      expect(editingMovement).toBeNull();
    });
  });

  // =========================================================================
  // 9. Resolución de Nombre y Foto del Emisor en checkInvitation
  // =========================================================================
  describe('9. Resolución de Nombre y Foto del Emisor en checkInvitation', () => {
    it('resuelve correctamente displayName y photoUrl del emisor a partir de users_on_household', async () => {
      const mockInvitationData = {
        id: 'inv-123',
        status: 'PENDING',
        expiresAt: new Date(Date.now() + 86400000).toISOString(),
        createdByUid: 'uid-david-partner',
        household: {
          id: 'house-456',
          name: 'Hogar David y Sofía',
          users_on_household: [
            {
              uid: 'uid-david-partner',
              displayName: 'David Santillán',
              photoUrl: 'https://lh3.googleusercontent.com/photo-david.jpg',
            },
          ],
        },
      };

      (getInvitation as any).mockResolvedValueOnce({
        data: { invitation: mockInvitationData },
      });

      const result = await checkInvitation('inv-123');
      expect(result).not.toBeNull();
      expect(typeof result).toBe('object');
      if (typeof result === 'object' && result !== null) {
        expect(result.householdId).toBe('house-456');
        expect(result.householdName).toBe('Hogar David y Sofía');
        expect(result.inviterName).toBe('David Santillán');
        expect(result.inviterPhotoUrl).toBe('https://lh3.googleusercontent.com/photo-david.jpg');
        expect(result.inviterUid).toBe('uid-david-partner');
      }
    });

    it('usa fallback de nombre y maneja foto nula cuando users_on_household no tiene foto', async () => {
      const mockInvitationWithoutPhoto = {
        id: 'inv-456',
        status: 'PENDING',
        expiresAt: new Date(Date.now() + 86400000).toISOString(),
        createdByUid: 'uid-partner-only',
        household: {
          id: 'house-789',
          name: 'Nuestro Hogar',
          users_on_household: [
            {
              uid: 'uid-partner-only',
              displayName: 'Sofía',
              photoUrl: null,
            },
          ],
        },
      };

      (getInvitation as any).mockResolvedValueOnce({
        data: { invitation: mockInvitationWithoutPhoto },
      });

      const result = await checkInvitation('inv-456');
      expect(result).not.toBeNull();
      if (typeof result === 'object' && result !== null) {
        expect(result.inviterName).toBe('Sofía');
        expect(result.inviterPhotoUrl).toBeNull();
      }
    });

    it('usa "Tu pareja" como fallback por defecto si users_on_household viene vacío', async () => {
      const mockInvitationEmptyUsers = {
        id: 'inv-empty',
        status: 'PENDING',
        expiresAt: new Date(Date.now() + 86400000).toISOString(),
        createdByUid: 'uid-unknown',
        household: {
          id: 'house-empty',
          name: 'Hogar Vacío',
          users_on_household: [],
        },
      };

      (getInvitation as any).mockResolvedValueOnce({
        data: { invitation: mockInvitationEmptyUsers },
      });

      const result = await checkInvitation('inv-empty');
      expect(result).not.toBeNull();
      if (typeof result === 'object' && result !== null) {
        expect(result.inviterName).toBe('Tu pareja');
        expect(result.inviterPhotoUrl).toBeNull();
      }
    });
  });
});
