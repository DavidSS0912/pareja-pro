import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAppStore } from '../store/useAppStore';
import { buildMovementAction } from '../services/movementService';
import {
  createSharedExpenseWithProration,
  createJournalWithEntries,
  addTagToJournal,
  deleteJournal,
  seedDefaultAccounts,
} from '../lib/dataconnect';

vi.mock('../lib/dataconnect', () => ({
  createSharedExpenseWithProration: vi.fn(),
  createJournalWithEntries: vi.fn(),
  addTagToJournal: vi.fn(),
  deleteJournal: vi.fn(),
  seedDefaultAccounts: vi.fn(),
}));

describe('movementContract - OLEADA B (T-1 a T-5) Contract Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (createSharedExpenseWithProration as any).mockResolvedValue({
      data: { journal_insert: { id: 'journal-real-123' } },
    });
    (createJournalWithEntries as any).mockResolvedValue({
      data: { journal_insert: { id: 'journal-journal-456' } },
    });
    useAppStore.setState({
      user: { uid: 'usr-contract-1', email: 'test@example.com' } as any,
      houseId: 'house-contract-1',
      accounts: [
        { id: 'acc-exp-1', type: 'EXPENSE', name: 'Gasto U1' },
        { id: 'acc-exp-2', type: 'EXPENSE', name: 'Gasto U2' },
        { id: 'acc-bank', type: 'BANK_ACCOUNT', name: 'Banco' },
        { id: 'acc-inc', type: 'INCOME', name: 'Ingreso' },
        { id: 'acc-card', type: 'LIABILITY', name: 'Tarjeta Crédito' },
      ] as any,
      expenses: [],
      incomes: [],
      fetchDashboardData: vi.fn().mockResolvedValue(undefined) as any,
    });
  });

  // T-1: MSI de 3 cuotas con derivación de líneas de expenseSlice.ts
  it('T-1: MSI de 3 cuotas con derivación de líneas de expenseSlice.ts', async () => {
    const action = buildMovementAction({
      type: 'EXPENSE',
      amount: 300,
      date: '2026-10-21',
      currentUserId: 'usr-contract-1',
      categoryId: 'cat-1',
      categoryName: 'Electrodoméstico',
      sourceAccountId: 'acc-bank',
      options: { isMsi: true, msiCount: 3 },
    });

    await useAppStore.getState().addExpense(action.payload);

    // expenseSlice.ts:99 -> bucle for (let i = 0; i < msiCount; i++)
    expect(createSharedExpenseWithProration).toHaveBeenCalledTimes(3);

    const calls = (createSharedExpenseWithProration as any).mock.calls;
    let firstMsiRefId: string | null = null;

    for (let i = 0; i < 3; i++) {
      const callArgs = calls[i][0];
      // expenseSlice.ts:120 -> msiMonthNumber: isMsi ? i + 1 : null
      expect(callArgs.msiMonthNumber).toBe(i + 1);
      // expenseSlice.ts:118 -> isMsi: isMsi
      expect(callArgs.isMsi).toBe(true);
      // expenseSlice.ts:55, 109 -> amountPerMonth = item.amount / msiCount (300 / 3 = 100)
      expect(callArgs.totalAmount).toBe(100);

      // expenseSlice.ts:100-103, 107 -> cálculo de fecha por cada cuota
      let d = new Date('2026-10-21');
      if (i > 0) d.setMonth(d.getMonth() + i);
      expect(callArgs.date).toBe(d.toISOString());

      // expenseSlice.ts:57-65, 114-115 -> división 50/50 baseUser1Amount / baseUser2Amount
      expect(callArgs.user1Amount).toBe(50);
      expect(callArgs.user2Amount).toBe(50);

      // expenseSlice.ts:68, 119 -> msiRefId no nulo e idéntico en las 3 llamadas
      expect(typeof callArgs.msiRefId).toBe('string');
      expect(callArgs.msiRefId).toBeTruthy();
      if (i === 0) {
        firstMsiRefId = callArgs.msiRefId;
      } else {
        expect(callArgs.msiRefId).toBe(firstMsiRefId);
      }
    }
  });

  // T-2: Ampliar prueba de control con argumentos completos de expenseSlice.ts
  it('T-2: Ampliar prueba de control con argumentos completos de expenseSlice.ts', async () => {
    const action = buildMovementAction({
      type: 'EXPENSE',
      amount: 100,
      date: '2026-10-21',
      currentUserId: 'usr-contract-1',
      categoryId: 'cat-1',
      categoryName: 'Super',
      sourceAccountId: 'acc-bank',
    });

    await useAppStore.getState().addExpense(action.payload);

    expect(createSharedExpenseWithProration).toHaveBeenCalledTimes(1);
    expect(createSharedExpenseWithProration).toHaveBeenCalledWith(
      expect.objectContaining({
        // expenseSlice.ts:117 -> isShared: !item.isPrivate
        isShared: true,
        // expenseSlice.ts:70, 116 -> ownerUid: resolvedOwner
        ownerUid: 'usr-contract-1',
        // expenseSlice.ts:124 -> categoryId: item.categoryId || null
        categoryId: 'cat-1',
        // expenseSlice.ts:48, 111 -> payerAccountId: payerAccountId
        payerAccountId: 'acc-bank',
        // expenseSlice.ts:49, 112 -> user1ExpenseAccountId: user1ExpenseAccountId
        user1ExpenseAccountId: 'acc-exp-1',
        // expenseSlice.ts:50, 113 -> user2ExpenseAccountId: user2ExpenseAccountId
        user2ExpenseAccountId: 'acc-exp-2',
        // expenseSlice.ts:55, 109 -> totalAmount: 100
        totalAmount: 100,
        // expenseSlice.ts:57-65, 114-115 -> user1Amount: 50, user2Amount: 50
        user1Amount: 50,
        user2Amount: 50,
        // expenseSlice.ts:53, 118 -> const isMsi = item.isMsi; al no ser MSI es falsy (undefined / false)
        isMsi: expect.toSatisfy((val: any) => val === false || val === undefined),
      })
    );
  });

  // T-3: 'proporcional' produce el mismo reparto que '50/50', y Personal ignora 'individual'
  describe('T-3: Reparto proporcional y contexto personal', () => {
    it('Subtest A: Gasto con options: { splitType: "proporcional" } produce 50/50 (expenseSlice.ts:60-65)', async () => {
      const action = buildMovementAction({
        type: 'EXPENSE',
        amount: 100,
        date: '2026-10-21',
        currentUserId: 'usr-contract-1',
        categoryId: 'cat-1',
        categoryName: 'Super',
        sourceAccountId: 'acc-bank',
        options: { splitType: 'proporcional' },
      });

      await useAppStore.getState().addExpense(action.payload);

      expect(createSharedExpenseWithProration).toHaveBeenCalledTimes(1);
      expect(createSharedExpenseWithProration).toHaveBeenCalledWith(
        expect.objectContaining({
          user1Amount: 50,
          user2Amount: 50,
        })
      );
    });

    it('Subtest B: Gasto en appContext: "personal" con options: { splitType: "individual" } produce reparto 50/50 e isShared: false (expenseSlice.ts:60-65, 117)', async () => {
      const action = buildMovementAction({
        type: 'EXPENSE',
        amount: 100,
        date: '2026-10-21',
        currentUserId: 'usr-contract-1',
        categoryId: 'cat-1',
        categoryName: 'Gasto Personal',
        sourceAccountId: 'acc-bank',
        appContext: 'personal',
        options: { splitType: 'individual' },
      });

      await useAppStore.getState().addExpense(action.payload);

      expect(createSharedExpenseWithProration).toHaveBeenCalledTimes(1);
      expect(createSharedExpenseWithProration).toHaveBeenCalledWith(
        expect.objectContaining({
          user1Amount: 50,
          user2Amount: 50,
          isShared: false,
        })
      );
    });
  });

  // T-4: addIncome con createJournalWithEntries
  // DEMOSTRACIÓN ROJO POR ASERCIÓN: se espera deliberadamente amount: 999999 en vez de 1500
  it('T-4: addIncome con createJournalWithEntries (incomeSlice.ts:60-72, 82)', async () => {
    const action = buildMovementAction({
      type: 'INCOME',
      amount: 1500,
      date: '2026-10-21',
      note: 'Quincena',
      currentUserId: 'usr-contract-1',
      targetAccountId: 'acc-bank',
      categoryId: 'cat-salary',
    });

    expect(action.type).toBe('INCOME');
    if (action.type !== 'INCOME') throw new Error('Expected INCOME action');

    await useAppStore.getState().addIncome(action.payload);

    expect(createJournalWithEntries).toHaveBeenCalledTimes(1);
    expect(createJournalWithEntries).toHaveBeenCalledWith(
      expect.objectContaining({
        householdId: 'house-contract-1',
        description: 'Ingreso - Quincena',
        amount: 1500,
        date: new Date('2026-10-21').toISOString(),
        debitAccountId: 'acc-bank',
        creditAccountId: 'acc-inc',
        ownerUid: 'usr-contract-1',
        isShared: true,
        incomeCategoryType: 'Ordinario',
        categoryId: 'cat-salary',
      })
    );
    expect(useAppStore.getState().fetchDashboardData).toHaveBeenCalledWith('house-contract-1');
  });

  // T-5: payCreditCard con createJournalWithEntries y orden de App.tsx:620-627
  describe('T-5: payCreditCard con createJournalWithEntries y orden de App.tsx:620-627', () => {
    it('Subtest A: Input TRANSFER con monto 400 llama a payCreditCard en orden de App.tsx:620-627', async () => {
      const action = buildMovementAction({
        type: 'TRANSFER',
        amount: 400,
        date: '2026-10-21',
        currentUserId: 'usr-contract-1',
        sourceAccountId: 'acc-bank',
        targetAccountId: 'acc-card',
      });

      expect(action.type).toBe('TRANSFER');
      if (action.type !== 'TRANSFER') throw new Error('Expected TRANSFER action');

      // Orden en App.tsx:620-627:
      // methods.payCreditCard(action.payload.sourceAccountId, action.payload.targetAccountId, action.payload.amount, action.payload.date, action.payload.ownerUid, action.payload.isShared)
      await useAppStore.getState().payCreditCard(
        action.payload.sourceAccountId,
        action.payload.targetAccountId,
        action.payload.amount,
        action.payload.date,
        action.payload.ownerUid,
        action.payload.isShared
      );

      // accountSlice.ts:116-127
      expect(createJournalWithEntries).toHaveBeenCalledTimes(1);
      expect(createJournalWithEntries).toHaveBeenCalledWith(
        expect.objectContaining({
          householdId: 'house-contract-1',
          debitAccountId: 'acc-card',
          creditAccountId: 'acc-bank',
          amount: 400,
          date: new Date('2026-10-21').toISOString(),
          ownerUid: 'usr-contract-1',
          isShared: true,
          isInternalTransfer: true,
        })
      );
      // accountSlice.ts:128
      expect(useAppStore.getState().fetchDashboardData).toHaveBeenCalledWith('house-contract-1');
    });

    it('Subtest B: Retorno temprano si falta houseId (accountSlice.ts:114)', async () => {
      useAppStore.setState({ houseId: null });

      const action = buildMovementAction({
        type: 'TRANSFER',
        amount: 400,
        date: '2026-10-21',
        currentUserId: 'usr-contract-1',
        sourceAccountId: 'acc-bank',
        targetAccountId: 'acc-card',
      });

      expect(action.type).toBe('TRANSFER');
      if (action.type !== 'TRANSFER') throw new Error('Expected TRANSFER action');

      await useAppStore.getState().payCreditCard(
        action.payload.sourceAccountId,
        action.payload.targetAccountId,
        action.payload.amount,
        action.payload.date,
        action.payload.ownerUid,
        action.payload.isShared
      );

      // accountSlice.ts:114 -> if (!houseId) return;
      expect(createJournalWithEntries).not.toHaveBeenCalled();
    });
  });

  // Pruebas complementarias de tags e individual
  it('Complementaria: Caso tags invoca addTagToJournal por cada tag', async () => {
    const action = buildMovementAction({
      type: 'EXPENSE',
      amount: 50,
      date: '2026-10-21',
      currentUserId: 'usr-contract-1',
      categoryId: 'cat-1',
      sourceAccountId: 'acc-bank',
      options: { tags: ['tag-a', 'tag-b'] },
    });

    await useAppStore.getState().addExpense(action.payload);

    expect(addTagToJournal).toHaveBeenCalledWith(
      expect.objectContaining({
        journalId: 'journal-real-123',
        tagId: 'tag-a',
      })
    );
    expect(addTagToJournal).toHaveBeenCalledWith(
      expect.objectContaining({
        journalId: 'journal-real-123',
        tagId: 'tag-b',
      })
    );
  });

  it('Complementaria: Caso splitType individual asigna 100% a user1 (expenseSlice.ts:58-65)', async () => {
    const action = buildMovementAction({
      type: 'EXPENSE',
      amount: 80,
      date: '2026-10-21',
      currentUserId: 'usr-contract-1',
      categoryId: 'cat-1',
      sourceAccountId: 'acc-bank',
      options: { splitType: 'individual' },
    });

    await useAppStore.getState().addExpense(action.payload);

    expect(createSharedExpenseWithProration).toHaveBeenCalledWith(
      expect.objectContaining({
        user1Amount: 80,
        user2Amount: 0,
      })
    );
  });
});
