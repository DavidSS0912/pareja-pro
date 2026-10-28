import { describe, it, expect } from 'vitest';
import { filterByContext } from '../services/ownershipService';

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
});
