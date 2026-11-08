import { describe, it, expect } from 'vitest';
import { filterCategoriesByContext, MemberSlotFilter } from '../services/ownershipService';

describe('categoryPrivacyIsolation - Aislamiento estricto de visibilidad de categorías', () => {
  const mockCategories = [
    { id: 'cat-shared-1', name: 'Despensa Compartida', type: 'EXPENSE', ownerType: 'SHARED' },
    { id: 'cat-shared-2', name: 'Servicios Hogar', type: 'EXPENSE', ownerType: 'SHARED' },
    { id: 'cat-global-sys', name: 'Otros Ingresos Globales', type: 'INCOME' }, // Sin ownerType (sistema)
    { id: 'cat-user-a-1', name: 'Gimnasio David', type: 'EXPENSE', ownerType: 'USER_A' },
    { id: 'cat-user-a-2', name: 'Hobbies Personal A', type: 'EXPENSE', ownerType: 'USER_A' },
    { id: 'cat-user-b-1', name: 'Cuidado Personal Zoe', type: 'EXPENSE', ownerType: 'USER_B' },
    { id: 'cat-user-b-2', name: 'Curso Diseño Zoe', type: 'EXPENSE', ownerType: 'USER_B' },
    { id: 'cat-private-flag', name: 'Gasto Oculto Privado', type: 'EXPENSE', ownerType: 'SHARED', isPrivate: true },
  ];

  describe('Contexto "household"', () => {
    it('muestra únicamente categorías del hogar (SHARED y globales de sistema sin asignación privada)', () => {
      const result = filterCategoriesByContext(mockCategories, 'household', 'USER_A');

      // Debe incluir cat-shared-1, cat-shared-2 y cat-global-sys
      expect(result).toHaveLength(3);
      const ids = result.map(c => c.id);
      expect(ids).toContain('cat-shared-1');
      expect(ids).toContain('cat-shared-2');
      expect(ids).toContain('cat-global-sys');
    });

    it('bloquea terminantemente categorías personales de USER_A y USER_B en household', () => {
      const result = filterCategoriesByContext(mockCategories, 'household', 'USER_A');
      const ids = result.map(c => c.id);

      expect(ids).not.toContain('cat-user-a-1');
      expect(ids).not.toContain('cat-user-a-2');
      expect(ids).not.toContain('cat-user-b-1');
      expect(ids).not.toContain('cat-user-b-2');
      expect(ids).not.toContain('cat-private-flag');
    });
  });

  describe('Contexto "personal"', () => {
    it('en personal para USER_A muestra únicamente categorías propias de USER_A y sistema', () => {
      const result = filterCategoriesByContext(mockCategories, 'personal', 'USER_A');

      expect(result).toHaveLength(3);
      const ids = result.map(c => c.id);
      expect(ids).toContain('cat-user-a-1');
      expect(ids).toContain('cat-user-a-2');
      expect(ids).toContain('cat-global-sys');

      // Excluye categorías de la pareja y compartidas del hogar
      expect(ids).not.toContain('cat-user-b-1');
      expect(ids).not.toContain('cat-user-b-2');
      expect(ids).not.toContain('cat-shared-1');
      expect(ids).not.toContain('cat-shared-2');
    });

    it('en personal para USER_B muestra únicamente categorías propias de USER_B y sistema', () => {
      const result = filterCategoriesByContext(mockCategories, 'personal', 'USER_B');

      expect(result).toHaveLength(3);
      const ids = result.map(c => c.id);
      expect(ids).toContain('cat-user-b-1');
      expect(ids).toContain('cat-user-b-2');
      expect(ids).toContain('cat-global-sys');

      // Excluye categorías de USER_A y compartidas del hogar
      expect(ids).not.toContain('cat-user-a-1');
      expect(ids).not.toContain('cat-user-a-2');
      expect(ids).not.toContain('cat-shared-1');
      expect(ids).not.toContain('cat-shared-2');
    });

    it('si no hay slot activo en personal no expone categorías privadas', () => {
      const result = filterCategoriesByContext(mockCategories, 'personal', null);
      const ids = result.map(c => c.id);
      expect(ids).not.toContain('cat-user-a-1');
      expect(ids).not.toContain('cat-user-b-1');
    });
  });
});
