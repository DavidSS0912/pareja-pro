import { describe, it, expect } from 'vitest';
import {
  filterSourceAccounts,
  filterTransferTargetAccounts,
  filterOperationAccounts,
} from '../services/ownershipService';

describe('Stage 1 - Matriz de Privacidad de Cuentas por Contexto (household vs personal)', () => {
  const accounts = [
    { id: 'acc_shared', name: 'Cuenta Conjunta Hogar', ownerType: 'SHARED', allowPartnerTransfers: false },
    { id: 'acc_a_private', name: 'Nómina Personal A', ownerType: 'USER_A', allowPartnerTransfers: false },
    { id: 'acc_a_optin', name: 'Ahorro A con Opt-In', ownerType: 'USER_A', allowPartnerTransfers: true },
    { id: 'acc_b_private', name: 'Nómina Personal B', ownerType: 'USER_B', allowPartnerTransfers: false },
    { id: 'acc_b_optin', name: 'Ahorro B con Opt-In', ownerType: 'USER_B', allowPartnerTransfers: true },
  ];

  describe('Contexto Household', () => {
    it('filtra cuentas de origen para USER_A en household: permite SHARED y propias, excluye terminantemente a USER_B', () => {
      const source = filterSourceAccounts(accounts, 'USER_A', 'household');
      const ids = source.map((a) => a.id);
      expect(ids).toContain('acc_shared');
      expect(ids).toContain('acc_a_private');
      expect(ids).toContain('acc_a_optin');
      expect(ids).not.toContain('acc_b_private');
      expect(ids).not.toContain('acc_b_optin');
    });

    it('filtra cuentas de destino para USER_A en household: permite SHARED, propias y de USER_B solo con allowPartnerTransfers', () => {
      const target = filterTransferTargetAccounts(accounts, 'USER_A', 'household');
      const ids = target.map((a) => a.id);
      expect(ids).toContain('acc_shared');
      expect(ids).toContain('acc_a_private');
      expect(ids).toContain('acc_a_optin');
      expect(ids).not.toContain('acc_b_private');
      expect(ids).toContain('acc_b_optin');
    });

    it('filtra cuentas de operaciones (gastos/ingresos) en household: permite SHARED y propias', () => {
      const opsA = filterOperationAccounts(accounts, 'USER_A', 'household');
      expect(opsA.map((a) => a.id)).toEqual(['acc_shared', 'acc_a_private', 'acc_a_optin']);
    });

    it('mantiene retrocompatibilidad cuando appContext se omite (por defecto household)', () => {
      const source = filterSourceAccounts(accounts, 'USER_A');
      expect(source.map((a) => a.id)).toEqual(['acc_shared', 'acc_a_private', 'acc_a_optin']);

      const target = filterTransferTargetAccounts(accounts, 'USER_A');
      expect(target.map((a) => a.id)).toEqual(['acc_shared', 'acc_a_private', 'acc_a_optin', 'acc_b_optin']);
    });
  });

  describe('Contexto Personal', () => {
    it('filtra cuentas de origen para USER_A en personal: EXCLUSIVAMENTE cuentas propias de USER_A (excluye SHARED y USER_B)', () => {
      const source = filterSourceAccounts(accounts, 'USER_A', 'personal');
      const ids = source.map((a) => a.id);
      expect(ids).not.toContain('acc_shared');
      expect(ids).toContain('acc_a_private');
      expect(ids).toContain('acc_a_optin');
      expect(ids).not.toContain('acc_b_private');
      expect(ids).not.toContain('acc_b_optin');
      expect(ids).toEqual(['acc_a_private', 'acc_a_optin']);
    });

    it('filtra cuentas de destino para USER_A en personal: cuentas propias y partner con opt-in, pero EXCLUYE SHARED', () => {
      const target = filterTransferTargetAccounts(accounts, 'USER_A', 'personal');
      const ids = target.map((a) => a.id);
      expect(ids).not.toContain('acc_shared');
      expect(ids).toContain('acc_a_private');
      expect(ids).toContain('acc_a_optin');
      expect(ids).not.toContain('acc_b_private');
      expect(ids).toContain('acc_b_optin');
      expect(ids).toEqual(['acc_a_private', 'acc_a_optin', 'acc_b_optin']);
    });

    it('filtra cuentas de origen para USER_B en personal: EXCLUSIVAMENTE cuentas propias de USER_B', () => {
      const source = filterSourceAccounts(accounts, 'USER_B', 'personal');
      const ids = source.map((a) => a.id);
      expect(ids).toEqual(['acc_b_private', 'acc_b_optin']);
    });

    it('filtra cuentas de destino para USER_B en personal: cuentas propias de USER_B y partner (USER_A) con opt-in, excluye SHARED', () => {
      const target = filterTransferTargetAccounts(accounts, 'USER_B', 'personal');
      const ids = target.map((a) => a.id);
      expect(ids).toEqual(['acc_a_optin', 'acc_b_private', 'acc_b_optin']);
    });

    it('filtra cuentas de operaciones (gastos/ingresos) en personal: exclusivamente cuentas propias', () => {
      const opsA = filterOperationAccounts(accounts, 'USER_A', 'personal');
      expect(opsA.map((a) => a.id)).toEqual(['acc_a_private', 'acc_a_optin']);

      const opsB = filterOperationAccounts(accounts, 'USER_B', 'personal');
      expect(opsB.map((a) => a.id)).toEqual(['acc_b_private', 'acc_b_optin']);
    });
  });
});

