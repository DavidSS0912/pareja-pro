import { describe, it, expect } from 'vitest';
import { mergeAccountsWithBalances } from '../services/accountService';

describe('mergeAccountsWithBalances (Función Pura de Cuentas y Saldos)', () => {
  it('Cuenta con asiento conserva ownerType, name, type', () => {
    // Cuenta del servidor con todos sus metadatos
    const serverAccounts = [
      {
        id: 'acc-1',
        name: 'BBVA Débito',
        type: 'ASSET',
        ownerType: 'USER_A',
        color: 'bg-blue-500',
        cutDay: 15,
        paymentDay: 5
      }
    ];

    // Asiento contable devuelto por GetHouseholdNetBalances donde account solo trae id y type
    const balanceEntries = [
      {
        entryType: 'DEBIT',
        amount: 1500,
        account: { id: 'acc-1', type: 'ASSET' }
      }
    ];

    const currentAccounts: any[] = [];

    const result = mergeAccountsWithBalances(serverAccounts, balanceEntries, currentAccounts);

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('acc-1');
    expect(result[0].name).toBe('BBVA Débito');
    expect(result[0].type).toBe('ASSET');
    expect(result[0].ownerType).toBe('USER_A');
    expect(result[0].color).toBe('bg-blue-500');
    expect(result[0].balance).toBe(1500);
  });

  it('Saldo correcto con asientos DEBIT y CREDIT', () => {
    const serverAccounts = [
      { id: 'acc-asset', name: 'Cuenta Banco', type: 'ASSET', ownerType: 'SHARED' },
      { id: 'acc-liability', name: 'Tarjeta Crédito', type: 'LIABILITY', ownerType: 'USER_B' }
    ];

    const balanceEntries = [
      // Para ASSET (naturaleza deudora): DEBIT suma (+1000), CREDIT resta (-250) -> balance = 750
      { entryType: 'DEBIT', amount: 1000, account: { id: 'acc-asset', type: 'ASSET' } },
      { entryType: 'CREDIT', amount: 250, account: { id: 'acc-asset', type: 'ASSET' } },
      // Para LIABILITY (naturaleza acreedora): CREDIT suma (+500), DEBIT resta (-200) -> balance = 300
      { entryType: 'CREDIT', amount: 500, account: { id: 'acc-liability', type: 'LIABILITY' } },
      { entryType: 'DEBIT', amount: 200, account: { id: 'acc-liability', type: 'LIABILITY' } }
    ];

    const result = mergeAccountsWithBalances(serverAccounts, balanceEntries, []);

    const assetAcc = result.find(a => a.id === 'acc-asset');
    const liabilityAcc = result.find(a => a.id === 'acc-liability');

    expect(assetAcc?.balance).toBe(750);
    expect(liabilityAcc?.balance).toBe(300);
  });

  it('temp- sin equivalente se conserva y con equivalente se descarta', () => {
    const serverAccounts = [
      { id: 'acc-real', name: 'Nu Crédito', type: 'LIABILITY', ownerType: 'USER_A' }
    ];
    const balanceEntries: any[] = [];
    const currentAccounts = [
      // Con equivalente (mismo nombre y tipo que acc-real): se debe descartar
      { id: 'temp-1', name: 'Nu Crédito', type: 'LIABILITY', ownerType: 'USER_A' },
      // Sin equivalente: se debe conservar
      { id: 'temp-2', name: 'Efectivo Bolsillo', type: 'ASSET', ownerType: 'USER_A' }
    ];

    const result = mergeAccountsWithBalances(serverAccounts, balanceEntries, currentAccounts);

    expect(result.some(a => a.id === 'acc-real')).toBe(true);
    expect(result.some(a => a.id === 'temp-1')).toBe(false);
    expect(result.some(a => a.id === 'temp-2')).toBe(true);
    expect(result).toHaveLength(2);
  });

  it('Cuenta sin asientos aparece con saldo 0', () => {
    const serverAccounts = [
      { id: 'acc-zero', name: 'Cuenta Sin Movimientos', type: 'ASSET', ownerType: 'SHARED' }
    ];
    const balanceEntries: any[] = [];

    const result = mergeAccountsWithBalances(serverAccounts, balanceEntries, []);

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('acc-zero');
    expect(result[0].balance).toBe(0);
  });
});
