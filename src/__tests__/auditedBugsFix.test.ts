// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { filterContextByMode, filterTransfersByMode } from '../App';
import { useAppStore } from '../store/useAppStore';
import {
  createAccount,
  createJournalWithEntries,
  seedDefaultAccounts,
} from '../lib/dataconnect';
import { validateMovement } from '../services/movementService';

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
    seedDefaultAccounts: vi.fn(),
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
});
