import { describe, it, expect } from 'vitest';
import { useAppStore, resetAppStore, getInitialDateRange, initialAppState, LIFECYCLE_KEYS } from '../store/useAppStore';

describe('Limpieza de sesión: resetAppStore()', () => {
  it('puebla el store con datos del usuario A, ejecuta el reseteo y comprueba que todos los slices quedan vacíos', () => {
    // 1. Poblar el store con datos del usuario A en todos los slices
    useAppStore.setState({
      // AuthSlice
      user: {
        uid: 'user-a-123',
        email: 'usera@example.com',
        displayName: 'Usuario A',
        photoURL: 'https://example.com/photo.jpg'
      },
      houseId: 'household-uuid-789',
      authLoading: false,
      dateRange: { start: '2025-01-01', end: '2025-01-31' },

      // ExpenseSlice
      expenses: [
        { id: 'exp-1', amount: 150, description: 'Supermercado' },
        { id: 'exp-2', amount: 45, description: 'Café' }
      ] as any,

      // BudgetSlice
      budgets: [
        { id: 'b-1', category: 'Comida', base: 5000, period: '2025-01-01' }
      ] as any,

      // AccountSlice
      accounts: [
        { id: 'acc-1', name: 'BBVA Débito', type: 'ASSET', balance: 12000 },
        { id: 'acc-2', name: 'Tarjeta Oro', type: 'LIABILITY', balance: 4500 }
      ] as any,

      // AssetSlice
      assets: [
        { id: 'asset-1', name: 'Auto', value: 200000, type: 'Vehículo' }
      ] as any,

      // IncomeSlice
      incomes: [
        { id: 'inc-1', amount: 35000, description: 'Nómina' }
      ] as any,

      // GoalSlice
      goals: [
        { id: 'goal-1', name: 'Fondo Emergencia', targetAmount: 50000 }
      ] as any,

      // UserListSlice
      users: [
        { id: 'user-a-123', name: 'Usuario A', email: 'usera@example.com' },
        { id: 'user-b-456', name: 'Usuario B', email: 'userb@example.com' }
      ] as any,

      // DataSlice
      selectedBudgetMonth: '2025-01-01',

      // ProjectSlice
      projects: [
        { id: 'proj-1', name: 'Viaje a Japón', targetAmount: 80000 }
      ] as any,
      contributions: [
        { id: 'contrib-1', amount: 5000, projectId: 'proj-1' }
      ] as any,

      // SettingsSlice
      categories: [
        { id: 'cat-1', name: 'Despensa', type: 'EXPENSE', ownerType: 'SHARED' }
      ] as any,
      tags: [
        { id: 'tag-1', name: 'Vacaciones' }
      ] as any
    });

    // Verificar que los datos fueron poblados exitosamente
    const populated = useAppStore.getState();
    expect(populated.user?.uid).toBe('user-a-123');
    expect(populated.houseId).toBe('household-uuid-789');
    expect(populated.expenses.length).toBeGreaterThan(0);
    expect(populated.budgets.length).toBeGreaterThan(0);
    expect(populated.accounts.length).toBeGreaterThan(0);
    expect(populated.assets.length).toBeGreaterThan(0);
    expect(populated.incomes.length).toBeGreaterThan(0);
    expect(populated.goals.length).toBeGreaterThan(0);
    expect(populated.users.length).toBeGreaterThan(0);
    expect(populated.selectedBudgetMonth).toBe('2025-01-01');
    expect(populated.projects.length).toBeGreaterThan(0);
    expect(populated.contributions.length).toBeGreaterThan(0);
    expect(populated.categories.length).toBeGreaterThan(0);
    expect(populated.tags.length).toBeGreaterThan(0);

    // 2. Ejecutar el reseteo del store
    resetAppStore();

    // 3. Comprobar que todos los slices quedan en su estado inicial vacío
    const reset = useAppStore.getState();

    // AuthSlice
    expect(reset.user).toBeNull();
    expect(reset.houseId).toBeNull();
    expect(reset.authLoading).toBe(false);
    expect(reset.dateRange).toEqual(getInitialDateRange());

    // ExpenseSlice
    expect(reset.expenses).toEqual([]);

    // BudgetSlice
    expect(reset.budgets).toEqual([]);

    // AccountSlice
    expect(reset.accounts).toEqual([]);

    // AssetSlice
    expect(reset.assets).toEqual([]);

    // IncomeSlice
    expect(reset.incomes).toEqual([]);

    // GoalSlice
    expect(reset.goals).toEqual([]);

    // UserListSlice
    expect(reset.users).toEqual([]);

    // DataSlice
    expect(reset.selectedBudgetMonth).toBeUndefined();

    // ProjectSlice
    expect(reset.projects).toEqual([]);
    expect(reset.contributions).toEqual([]);

    // SettingsSlice
    expect(reset.categories).toEqual([]);
    expect(reset.tags).toEqual([]);
  });

  it('excluye authLoading del reseteo: si authLoading es false, resetAppStore() lo mantiene en false', () => {
    useAppStore.setState({ authLoading: false });
    expect(useAppStore.getState().authLoading).toBe(false);

    resetAppStore();

    expect(useAppStore.getState().authLoading).toBe(false);
  });

  it('puebla cada campo no función del store, resetea y comprueba dinámicamente que todos vuelven al valor inicial', () => {
    const initialState = useAppStore.getState();
    const nonFunctionKeys = Object.keys(initialState).filter(
      (key) => typeof (initialState as any)[key] !== 'function'
    );

    // 1. Poblar cada campo no función con un valor distinto del inicial
    const modifiedState: Record<string, any> = {};
    for (const key of nonFunctionKeys) {
      const val = (initialState as any)[key];
      if (Array.isArray(val)) {
        modifiedState[key] = [{ id: `dummy-${key}`, fake: true }];
      } else if (typeof val === 'string') {
        modifiedState[key] = `modified-${key}`;
      } else if (typeof val === 'number') {
        modifiedState[key] = 99999;
      } else if (typeof val === 'boolean') {
        modifiedState[key] = !val;
      } else if (val === null || val === undefined) {
        modifiedState[key] = { modified: true, for: key };
      } else if (typeof val === 'object') {
        modifiedState[key] = { ...val, modified: true, start: '1999-01-01', end: '1999-01-31' };
      }
    }

    useAppStore.setState(modifiedState as any);

    // Verificar que todos los campos no función fueron efectivamente modificados
    const populated = useAppStore.getState();
    for (const key of nonFunctionKeys) {
      expect((populated as any)[key]).not.toEqual((initialState as any)[key]);
    }

    // 2. Ejecutar el reseteo
    resetAppStore();

    // 3. Comprobar que todos los campos vuelven al valor inicial recorriendo dinámicamente las claves del store
    const finalState = useAppStore.getState();
    for (const key of nonFunctionKeys) {
      if ((LIFECYCLE_KEYS as readonly string[]).includes(key)) {
        // Las claves de ciclo de vida quedan excluidas del reseteo
        expect((finalState as any)[key]).toEqual(modifiedState[key]);
      } else if (key === 'dateRange') {
        expect((finalState as any)[key]).toEqual(getInitialDateRange());
      } else {
        expect((finalState as any)[key]).toEqual((initialAppState as any)[key]);
      }
    }
  });
});
