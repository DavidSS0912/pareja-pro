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
            account: { id: 'acc-debito', name: 'BBVA Débito', type: 'ASSET' },
          },
          {
            id: 'entry-debit-1',
            amount: 2500,
            entryType: 'DEBIT',
            ownerUid: 'usr-1',
            isShared: false,
            account: { id: 'acc-ahorro', name: 'Caja Ahorro', type: 'ASSET' },
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
            account: { id: 'acc-debito', name: 'BBVA Débito', type: 'ASSET' },
          },
          {
            id: 'entry-debit-2',
            amount: 4800,
            entryType: 'DEBIT',
            ownerUid: 'usr-1',
            isShared: true,
            account: { id: 'acc-credito', name: 'Tarjeta Oro', type: 'LIABILITY' },
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
        targetAccountId: 'acc-ahorro',
        targetAccountName: 'Caja Ahorro',
        type: 'TRANSFER',
      },
      {
        id: 'journal-cardpay-2',
        date: '2026-10-18T16:00:00Z',
        amount: 4800,
        description: 'Pago mensual Tarjeta de Crédito',
        sourceAccountId: 'acc-debito',
        sourceAccountName: 'BBVA Débito',
        targetAccountId: 'acc-credito',
        targetAccountName: 'Tarjeta Oro',
        type: 'CARD_PAYMENT',
      },
    ]);
  });
});
