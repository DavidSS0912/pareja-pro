import { describe, it, expect } from 'vitest';
import {
  filterByContext,
  getPartnerSlot,
  isPartnerAccount,
  filterSourceAccounts,
  filterTransferTargetAccounts,
} from '../services/ownershipService';

describe('ownershipService - filterByContext', () => {
  const sampleItems = [
    { id: '1', name: 'Cuenta Compartida', ownerType: 'SHARED' },
    { id: '2', name: 'Tarjeta A', ownerType: 'USER_A' },
    { id: '3', name: 'Tarjeta B', ownerType: 'USER_B' },
    { id: '4', name: 'Item sin ownerType' },
    { id: '5', name: 'Item con ownerType null', ownerType: null as any },
  ];

  describe('Contexto "shared"', () => {
    it('retorna exclusivamente los elementos con ownerType === "SHARED"', () => {
      const result = filterByContext(sampleItems, 'shared', 'USER_A');
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1');
      expect(result[0].ownerType).toBe('SHARED');
    });

    it('funciona igual independientemente del userSlot cuando el contexto es "shared"', () => {
      const resultB = filterByContext(sampleItems, 'shared', 'USER_B');
      const resultNull = filterByContext(sampleItems, 'shared', null);
      expect(resultB).toHaveLength(1);
      expect(resultNull).toHaveLength(1);
      expect(resultB[0].id).toBe('1');
    });
  });

  describe('Contexto "personal"', () => {
    it('retorna exclusivamente los elementos pertenecientes a USER_A cuando userSlot es USER_A', () => {
      const result = filterByContext(sampleItems, 'personal', 'USER_A');
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('2');
      expect(result[0].ownerType).toBe('USER_A');
    });

    it('retorna exclusivamente los elementos pertenecientes a USER_B cuando userSlot es USER_B', () => {
      const result = filterByContext(sampleItems, 'personal', 'USER_B');
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('3');
      expect(result[0].ownerType).toBe('USER_B');
    });

    it('retorna arreglo vacío si userSlot es null en contexto personal', () => {
      const result = filterByContext(sampleItems, 'personal', null);
      expect(result).toEqual([]);
    });
  });

  describe('Contexto "all"', () => {
    it('retorna todos los elementos sin alterar la colección', () => {
      const result = filterByContext(sampleItems, 'all', 'USER_A');
      expect(result).toHaveLength(sampleItems.length);
      expect(result).toEqual(sampleItems);
    });
  });

  describe('Casos borde y robustez', () => {
    it('excluye items sin ownerType o con ownerType inválido en personal y shared', () => {
      const edgeItems = [
        { id: 'x1' },
        { id: 'x2', ownerType: undefined },
        { id: 'x3', ownerType: '' },
      ];
      expect(filterByContext(edgeItems, 'shared', 'USER_A')).toEqual([]);
      expect(filterByContext(edgeItems, 'personal', 'USER_A')).toEqual([]);
    });

    it('retorna arreglo vacío si la entrada es nula o vacía', () => {
      expect(filterByContext([], 'personal', 'USER_A')).toEqual([]);
      expect(filterByContext(null as any, 'shared', 'USER_A')).toEqual([]);
      expect(filterByContext(undefined as any, 'all', 'USER_B')).toEqual([]);
    });
  });

  describe('getPartnerSlot y isPartnerAccount', () => {
    it('obtiene el slot opuesto o null', () => {
      expect(getPartnerSlot('USER_A')).toBe('USER_B');
      expect(getPartnerSlot('USER_B')).toBe('USER_A');
      expect(getPartnerSlot(null)).toBeNull();
    });

    it('identifica correctamente cuentas personales de la pareja', () => {
      expect(isPartnerAccount({ ownerType: 'USER_B' }, 'USER_A')).toBe(true);
      expect(isPartnerAccount({ ownerType: 'USER_A' }, 'USER_B')).toBe(true);
      expect(isPartnerAccount({ ownerType: 'USER_A' }, 'USER_A')).toBe(false);
      expect(isPartnerAccount({ ownerType: 'SHARED' }, 'USER_A')).toBe(false);
      expect(isPartnerAccount(null, 'USER_A')).toBe(false);
    });
  });

  describe('filterSourceAccounts y filterTransferTargetAccounts', () => {
    it('filtra cuentas de origen excluyendo las de la pareja', () => {
      const accounts = [
        { id: '1', ownerType: 'SHARED' },
        { id: '2', ownerType: 'USER_A' },
        { id: '3', ownerType: 'USER_B' },
      ];
      const sourceA = filterSourceAccounts(accounts, 'USER_A');
      expect(sourceA.map(a => a.id)).toEqual(['1', '2']);

      const sourceB = filterSourceAccounts(accounts, 'USER_B');
      expect(sourceB.map(a => a.id)).toEqual(['1', '3']);
    });

    it('retorna arreglo seguro ante entradas vacías o nulas', () => {
      expect(filterSourceAccounts([], 'USER_A')).toEqual([]);
      expect(filterSourceAccounts(null as any, 'USER_A')).toEqual([]);
      expect(filterTransferTargetAccounts([])).toEqual([]);
      expect(filterTransferTargetAccounts(null as any)).toEqual([]);
    });
  });
});
