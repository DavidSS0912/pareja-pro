import { describe, it, expect } from 'vitest';
import {
  filterByContext,
  getPartnerSlot,
  isPartnerAccount,
  filterSourceAccounts,
  filterTransferTargetAccounts,
} from '../services/ownershipService';

describe('Matriz de Privacidad Estricta en Cuentas y Transferencias', () => {
  const mockAccounts = [
    { id: 'acc-shared-1', name: 'Cuenta Compartida BBVA', type: 'ASSET', ownerType: 'SHARED', balance: 15000 },
    { id: 'acc-user-a-1', name: 'Nómina Banorte A', type: 'ASSET', ownerType: 'USER_A', balance: 25000 },
    { id: 'card-user-a-1', name: 'Tarjeta Oro A', type: 'LIABILITY', ownerType: 'USER_A', balance: 5000, creditLimit: 30000, paymentDay: 15 },
    { id: 'acc-user-b-1', name: 'Nómina Santander B', type: 'ASSET', ownerType: 'USER_B', balance: 40000 },
    { id: 'card-user-b-1', name: 'Tarjeta Platinum B', type: 'LIABILITY', ownerType: 'USER_B', balance: 12000, creditLimit: 80000, paymentDay: 22 },
  ];

  describe('1. Identificación de Cuentas de la Pareja (isPartnerAccount y getPartnerSlot)', () => {
    it('determina correctamente el slot de la pareja', () => {
      expect(getPartnerSlot('USER_A')).toBe('USER_B');
      expect(getPartnerSlot('USER_B')).toBe('USER_A');
      expect(getPartnerSlot(null)).toBeNull();
    });

    it('identifica como cuenta de pareja exclusivamente las cuentas personales del otro usuario', () => {
      // Para USER_A:
      expect(isPartnerAccount(mockAccounts[0], 'USER_A')).toBe(false); // SHARED no es de pareja
      expect(isPartnerAccount(mockAccounts[1], 'USER_A')).toBe(false); // USER_A es propia
      expect(isPartnerAccount(mockAccounts[2], 'USER_A')).toBe(false); // Tarjeta propia
      expect(isPartnerAccount(mockAccounts[3], 'USER_A')).toBe(true);  // USER_B es de la pareja
      expect(isPartnerAccount(mockAccounts[4], 'USER_A')).toBe(true);  // Tarjeta de USER_B es de la pareja

      // Para USER_B:
      expect(isPartnerAccount(mockAccounts[0], 'USER_B')).toBe(false); // SHARED
      expect(isPartnerAccount(mockAccounts[1], 'USER_B')).toBe(true);  // USER_A es de la pareja
      expect(isPartnerAccount(mockAccounts[2], 'USER_B')).toBe(true);  // Tarjeta de USER_A es de la pareja
      expect(isPartnerAccount(mockAccounts[3], 'USER_B')).toBe(false); // USER_B es propia
    });
  });

  describe('2. Blindaje en Origen de Fondos (filterSourceAccounts)', () => {
    it('el selector de origen en transferencias permite ÚNICAMENTE cuentas propias y de Hogar', () => {
      const sourceForA = filterSourceAccounts(mockAccounts, 'USER_A');
      const idsForA = sourceForA.map(a => a.id);

      expect(idsForA).toContain('acc-shared-1');
      expect(idsForA).toContain('acc-user-a-1');
      expect(idsForA).toContain('card-user-a-1');
      // PROHIBIDO: Excluye terminantemente cuentas de USER_B
      expect(idsForA).not.toContain('acc-user-b-1');
      expect(idsForA).not.toContain('card-user-b-1');
    });

    it('el selector de origen para USER_B excluye terminantemente cuentas de USER_A', () => {
      const sourceForB = filterSourceAccounts(mockAccounts, 'USER_B');
      const idsForB = sourceForB.map(a => a.id);

      expect(idsForB).toContain('acc-shared-1');
      expect(idsForB).toContain('acc-user-b-1');
      expect(idsForB).toContain('card-user-b-1');
      expect(idsForB).not.toContain('acc-user-a-1');
      expect(idsForB).not.toContain('card-user-a-1');
    });
  });

  describe('3. Modo Destino Ciego en Transferencias hacia la Pareja', () => {
    it('el selector de destino permite cuentas propias, compartidas y de la pareja', () => {
      const targetAccounts = filterTransferTargetAccounts(mockAccounts);
      expect(targetAccounts).toHaveLength(5);
    });

    it('simula formatAccountOption aplicando MODO DESTINO CIEGO para cuentas de la pareja', () => {
      const formatAccountOptionHelper = (acc: any, activeUserSlot: 'USER_A' | 'USER_B', isSource: boolean) => {
        const partner = isPartnerAccount(acc, activeUserSlot);
        const ownerLabel = acc.ownerType === 'USER_A' ? 'Usuario A' : acc.ownerType === 'USER_B' ? 'Usuario B' : 'Compartida';
        const baseName = `[${ownerLabel}] ${acc.name}`;

        // MODO DESTINO CIEGO: sin saldo ni disponible
        if (partner) {
          return baseName;
        }

        if (isSource && acc.type !== 'LIABILITY') {
          return `${baseName} (Disp: $${acc.balance.toFixed(2)})`;
        }
        return baseName;
      };

      // Si el usuario es USER_A:
      // Cuenta propia como origen -> Muestra saldo disponible
      const ownFormattedSource = formatAccountOptionHelper(mockAccounts[1], 'USER_A', true);
      expect(ownFormattedSource).toBe('[Usuario A] Nómina Banorte A (Disp: $25000.00)');

      // Cuenta de la pareja como destino -> MODO DESTINO CIEGO (cero saldo, cero disponible)
      const partnerFormattedTarget = formatAccountOptionHelper(mockAccounts[3], 'USER_A', false);
      expect(partnerFormattedTarget).toBe('[Usuario B] Nómina Santander B');
      expect(partnerFormattedTarget).not.toContain('Disp');
      expect(partnerFormattedTarget).not.toContain('40000');
      expect(partnerFormattedTarget).not.toContain('$');
    });
  });

  describe('4. Blindaje en Billetera (filterByContext y AccountsView)', () => {
    it('en modo "Hogar": lista y suma exclusivamente cuentas compartidas (ownerType === "SHARED")', () => {
      const householdAccounts = filterByContext(mockAccounts, 'shared', 'USER_A');
      
      expect(householdAccounts).toHaveLength(1);
      expect(householdAccounts[0].id).toBe('acc-shared-1');
      expect(householdAccounts[0].ownerType).toBe('SHARED');

      // Las cuentas personales NO están en el arreglo ni suman al balance
      const nonShared = householdAccounts.filter(a => a.ownerType !== 'SHARED');
      expect(nonShared).toHaveLength(0);

      const totalHogarBalance = householdAccounts.reduce((sum, a) => sum + a.balance, 0);
      expect(totalHogarBalance).toBe(15000); // Solo la compartida
    });

    it('en modo "Personal": lista exclusivamente cuentas del usuario activo y oculta totalmente las de la pareja', () => {
      const personalA = filterByContext(mockAccounts, 'personal', 'USER_A');
      const personalB = filterByContext(mockAccounts, 'personal', 'USER_B');

      expect(personalA.map(a => a.id)).toEqual(['acc-user-a-1', 'card-user-a-1']);
      expect(personalB.map(a => a.id)).toEqual(['acc-user-b-1', 'card-user-b-1']);

      // A no puede ver cuentas ni límites de B
      expect(personalA.some(a => a.ownerType === 'USER_B')).toBe(false);
      // B no puede ver cuentas ni límites de A
      expect(personalB.some(a => a.ownerType === 'USER_A')).toBe(false);
    });
  });

  describe('5. Blindaje en Calendario de Pagos (PaymentCalendar)', () => {
    it('en modo "Hogar", solo pasa tarjetas de crédito compartidas', () => {
      const calendarHousehold = mockAccounts
        .filter(a => a.type === 'LIABILITY')
        .filter(a => a.ownerType === 'SHARED');

      expect(calendarHousehold).toHaveLength(0); // No hay tarjetas compartidas en mockAccounts
    });

    it('en modo "Personal", solo pasa tarjetas del usuario activo', () => {
      const calendarPersonalA = mockAccounts
        .filter(a => a.type === 'LIABILITY')
        .filter(a => a.ownerType === 'USER_A');

      expect(calendarPersonalA).toHaveLength(1);
      expect(calendarPersonalA[0].id).toBe('card-user-a-1');
      // No contiene la tarjeta de B
      expect(calendarPersonalA.some(a => a.id === 'card-user-b-1')).toBe(false);
    });
  });
});
