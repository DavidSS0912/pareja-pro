import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAppStore } from '../store/useAppStore';
import {
  getHouseholdAccounts,
  getInternalTransfersByHousehold,
  getHouseholdNetBalances,
  getBudgetsByMonth,
  getSavingsProjects,
  getExternalAssets,
  getExpensesByHousehold,
  getIncomesByHousehold,
  createInternalTransfer,
} from '../lib/dataconnect';

vi.mock('../lib/dataconnect', () => ({
  getHouseholdAccounts: vi.fn(),
  getInternalTransfersByHousehold: vi.fn(),
  getHouseholdNetBalances: vi.fn(),
  getBudgetsByMonth: vi.fn(),
  getSavingsProjects: vi.fn(),
  getExternalAssets: vi.fn(),
  getExpensesByHousehold: vi.fn(),
  getIncomesByHousehold: vi.fn(),
  createInternalTransfer: vi.fn(),
}));

describe('dataSlice - Tarea 1.2: householdUsers y transferencias internas en dataSlice', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Defaults para las consultas existentes
    (getHouseholdNetBalances as any).mockResolvedValue({ data: { entries: [] } });
    (getBudgetsByMonth as any).mockResolvedValue({ data: { budgets: [] } });
    (getSavingsProjects as any).mockResolvedValue({ data: { savingsProjects: [] } });
    (getExternalAssets as any).mockResolvedValue({ data: { externalAssets: [] } });
    (getExpensesByHousehold as any).mockResolvedValue({ data: { entries: [] } });
    (getIncomesByHousehold as any).mockResolvedValue({ data: { entries: [] } });
    (createInternalTransfer as any).mockResolvedValue({ data: {} });

    // Reset store state
    useAppStore.setState({
      houseId: 'house-test-123',
      users: [],
      accounts: [],
    } as any);
  });

  it('asigna a state.users todos los integrantes devueltos por householdUsers en fetchDashboardData', async () => {
    const mockHouseholdUsers = [
      { uid: 'usr-1', email: 'david@example.com', displayName: 'David S' },
      { uid: 'usr-2', email: 'zoe@example.com', displayName: 'Zoe R' },
      { uid: 'usr-3', email: 'sin_nombre@example.com', displayName: null },
    ];

    (getHouseholdAccounts as any).mockResolvedValue({
      data: {
        accounts: [],
        householdUsers: mockHouseholdUsers,
      },
    });
    (getInternalTransfersByHousehold as any).mockResolvedValue({
      data: { journals: [] },
    });

    await useAppStore.getState().fetchDashboardData('house-test-123');

    const stateUsers = useAppStore.getState().users;
    expect(stateUsers).toEqual([
      { id: 'usr-1', name: 'David S', email: 'david@example.com' },
      { id: 'usr-2', name: 'Zoe R', email: 'zoe@example.com' },
      { id: 'usr-3', name: 'sin_nombre@example.com', email: 'sin_nombre@example.com' },
    ]);
  });

  it('consulta getInternalTransfersByHousehold y mapee state.transfers diferenciando TRANSFER y CARD_PAYMENT', async () => {
    (getHouseholdAccounts as any).mockResolvedValue({
      data: {
        accounts: [],
        householdUsers: [],
      },
    });

    const mockJournals = [
      {
        id: 'journal-transfer-1',
        date: '2026-10-15T12:00:00Z',
        description: 'Traspaso a cuenta de ahorro',
        isInternalTransfer: true,
        createdAt: '2026-10-15T12:00:00Z',
        entries_on_journal: [
          {
            id: 'entry-credit-1',
            amount: 2500,
            entryType: 'CREDIT',
            ownerUid: 'usr-1',
            isShared: false,
            account: { id: 'acc-debito', name: 'BBVA Débito', type: 'ASSET', ownerType: 'USER_A' },
          },
          {
            id: 'entry-debit-1',
            amount: 2500,
            entryType: 'DEBIT',
            ownerUid: 'usr-1',
            isShared: false,
            account: { id: 'acc-ahorro', name: 'Caja Ahorro', type: 'ASSET', ownerType: 'USER_A' },
          },
        ],
      },
      {
        id: 'journal-cardpay-2',
        date: '2026-10-18T16:00:00Z',
        description: 'Pago mensual Tarjeta de Crédito',
        isInternalTransfer: true,
        createdAt: '2026-10-18T16:00:00Z',
        entries_on_journal: [
          {
            id: 'entry-credit-2',
            amount: 4800,
            entryType: 'CREDIT',
            ownerUid: 'usr-1',
            isShared: true,
            account: { id: 'acc-debito', name: 'BBVA Débito', type: 'ASSET', ownerType: 'USER_A' },
          },
          {
            id: 'entry-debit-2',
            amount: 4800,
            entryType: 'DEBIT',
            ownerUid: 'usr-1',
            isShared: true,
            account: { id: 'acc-credito', name: 'Tarjeta Oro', type: 'LIABILITY', ownerType: 'USER_A' },
          },
        ],
      },
    ];

    (getInternalTransfersByHousehold as any).mockResolvedValue({
      data: {
        journals: mockJournals,
      },
    });

    await useAppStore.getState().fetchDashboardData('house-test-123');

    expect(getInternalTransfersByHousehold).toHaveBeenCalledWith(
      { householdId: 'house-test-123' },
      expect.anything()
    );

    const transfers = useAppStore.getState().transfers;
    expect(transfers).toBeDefined();
    expect(transfers).toHaveLength(2);
    expect(transfers).toEqual([
      {
        id: 'journal-transfer-1',
        date: '2026-10-15T12:00:00Z',
        amount: 2500,
        description: 'Traspaso a cuenta de ahorro',
        sourceAccountId: 'acc-debito',
        sourceAccountName: 'BBVA Débito',
        sourceOwnerType: 'USER_A',
        sourceOwnerUid: 'usr-1',
        targetAccountId: 'acc-ahorro',
        targetAccountName: 'Caja Ahorro',
        targetOwnerType: 'USER_A',
        targetOwnerUid: 'usr-1',
        senderUid: 'usr-1',
        receiverUid: 'usr-1',
        transferKind: 'SAME_USER',
        type: 'TRANSFER',
      },
      {
        id: 'journal-cardpay-2',
        date: '2026-10-18T16:00:00Z',
        amount: 4800,
        description: 'Pago mensual Tarjeta de Crédito',
        sourceAccountId: 'acc-debito',
        sourceAccountName: 'BBVA Débito',
        sourceOwnerType: 'USER_A',
        sourceOwnerUid: 'usr-1',
        targetAccountId: 'acc-credito',
        targetAccountName: 'Tarjeta Oro',
        targetOwnerType: 'USER_A',
        targetOwnerUid: 'usr-1',
        senderUid: 'usr-1',
        receiverUid: 'usr-1',
        transferKind: 'CARD_PAYMENT',
        type: 'CARD_PAYMENT',
      },
    ]);
  });

  it('mapea correctamente transferencias cruzadas entre miembros (CROSS_USERS) con UIDs diferenciados', async () => {
    (getHouseholdAccounts as any).mockResolvedValue({
      data: {
        accounts: [],
        householdUsers: [],
      },
    });

    const mockCrossTransfer = [
      {
        id: 'journal-cross-1',
        date: '2026-10-20T10:00:00Z',
        description: 'Aporte de despensa para Zoe',
        isInternalTransfer: true,
        createdAt: '2026-10-20T10:00:00Z',
        entries_on_journal: [
          {
            id: 'entry-credit-cross',
            amount: 1500,
            entryType: 'CREDIT',
            ownerUid: 'usr-david',
            isShared: true,
            account: { id: 'acc-david-debito', name: 'BBVA David', type: 'ASSET', ownerType: 'USER_A' },
          },
          {
            id: 'entry-debit-cross',
            amount: 1500,
            entryType: 'DEBIT',
            ownerUid: 'usr-zoe',
            isShared: true,
            account: { id: 'acc-zoe-debito', name: 'Hey Banco Zoe', type: 'ASSET', ownerType: 'USER_B' },
          },
        ],
      },
    ];

    (getInternalTransfersByHousehold as any).mockResolvedValue({
      data: {
        journals: mockCrossTransfer,
      },
    });

    await useAppStore.getState().fetchDashboardData('house-test-123');

    const transfers = useAppStore.getState().transfers;
    expect(transfers).toHaveLength(1);
    expect(transfers[0]).toEqual({
      id: 'journal-cross-1',
      date: '2026-10-20T10:00:00Z',
      amount: 1500,
      description: 'Aporte de despensa para Zoe',
      sourceAccountId: 'acc-david-debito',
      sourceAccountName: 'BBVA David',
      sourceOwnerType: 'USER_A',
      sourceOwnerUid: 'usr-david',
      targetAccountId: 'acc-zoe-debito',
      targetAccountName: 'Hey Banco Zoe',
      targetOwnerType: 'USER_B',
      targetOwnerUid: 'usr-zoe',
      senderUid: 'usr-david',
      receiverUid: 'usr-zoe',
      transferKind: 'CROSS_USERS',
      type: 'TRANSFER',
    });
  });

  it('createTransfer invoca createInternalTransfer con UIDs diferenciados de emisor y receptor', async () => {
    useAppStore.setState({
      houseId: 'house-test-123',
      users: [
        { id: 'usr-david', memberSlot: 'USER_A' },
        { id: 'usr-zoe', memberSlot: 'USER_B' },
      ],
      accounts: [
        { id: 'acc-david', ownerType: 'USER_A' },
        { id: 'acc-zoe', ownerType: 'USER_B' },
      ],
    } as any);

    await useAppStore.getState().createTransfer(
      'acc-david',
      'acc-zoe',
      2000,
      '2026-10-25',
      'usr-david',
      true,
      'Traspaso a Zoe',
      'usr-david',
      'usr-zoe'
    );

    expect(createInternalTransfer).toHaveBeenCalledWith({
      householdId: 'house-test-123',
      date: new Date('2026-10-25').toISOString(),
      description: 'Traspaso a Zoe',
      amount: 2000,
      sourceAccountId: 'acc-david',
      targetAccountId: 'acc-zoe',
      sourceOwnerUid: 'usr-david',
      targetOwnerUid: 'usr-zoe',
      isShared: true,
    });
  });
});
