export type ContextFilterType = 'all' | 'shared' | 'personal';
export type MemberSlotFilter = 'USER_A' | 'USER_B' | null;

/**
 * Filtra una colección de elementos según el contexto de visualización ('all' | 'shared' | 'personal')
 * y el memberSlot ('USER_A' | 'USER_B' | null) del usuario autenticado.
 * 
 * - 'all': Retorna la totalidad de los elementos sin filtrar.
 * - 'shared': Retorna exclusivamente los elementos cuyo ownerType sea 'SHARED'.
 * - 'personal': Retorna exclusivamente los elementos cuyo ownerType coincida exactamente con el memberSlot activo.
 */
export function filterByContext<T extends { ownerType?: string }>(
  items: T[],
  context: ContextFilterType,
  userSlot: MemberSlotFilter
): T[] {
  if (!items || !Array.isArray(items)) return [];
  if (context === 'all') return items;
  if (context === 'shared') {
    return items.filter(item => Boolean(item && item.ownerType === 'SHARED'));
  }
  if (context === 'personal') {
    if (!userSlot) return [];
    return items.filter(item => Boolean(item && item.ownerType === userSlot));
  }
  return items;
}

/**
 * Filtra categorías según el contexto de la aplicación ('household' | 'personal')
 * y el memberSlot activo ('USER_A' | 'USER_B' | null).
 * 
 * Reglas de privacidad:
 * - En 'household':
 *   Mostrar ÚNICAMENTE categorías del hogar ('SHARED' o globales sin asignación privada).
 *   Bloquear terminantemente categorías personales ('USER_A' y 'USER_B', o con isPrivate === true).
 * - En 'personal':
 *   Mostrar únicamente categorías propias del usuario activo (ownerType === userSlot)
 *   y las de sistema globales (sin ownerType y sin privacidad asignada).
 *   Excluir terminantemente categorías personales de la pareja (ownerType === partnerSlot)
 *   y categorías exclusivas del hogar ('SHARED').
 */
export function filterCategoriesByContext<T extends Record<string, any>>(
  categories: T[],
  appContext: 'household' | 'personal' | string,
  userSlot: MemberSlotFilter
): T[] {
  if (!categories || !Array.isArray(categories)) return [];
  const isPersonal = appContext === 'personal';

  if (!isPersonal) {
    return categories.filter(c => {
      if (!c) return false;
      if (c.isPrivate) return false;
      if (c.ownerType === 'USER_A' || c.ownerType === 'USER_B') return false;
      return true;
    });
  }

  const partnerSlot = getPartnerSlot(userSlot);
  return categories.filter(c => {
    if (!c) return false;
    if (c.isPrivate && (!userSlot || c.ownerType !== userSlot)) return false;
    if (partnerSlot && c.ownerType === partnerSlot) return false;
    if (userSlot && c.ownerType === userSlot) return true;
    if (!c.ownerType && !c.isPrivate) return true;
    return false;
  });
}

/**
 * Retorna el memberSlot de la pareja según el slot del usuario activo.
 */
export function getPartnerSlot(userSlot: MemberSlotFilter): MemberSlotFilter {
  if (userSlot === 'USER_A') return 'USER_B';
  if (userSlot === 'USER_B') return 'USER_A';
  return null;
}

/**
 * Determina si una cuenta pertenece a la pareja (es personal del otro usuario).
 */
export function isPartnerAccount(
  account: { ownerType?: string } | null | undefined,
  userSlot: MemberSlotFilter
): boolean {
  if (!account || !account.ownerType || account.ownerType === 'SHARED') return false;
  const partnerSlot = getPartnerSlot(userSlot);
  if (partnerSlot && account.ownerType === partnerSlot) return true;
  if (userSlot && account.ownerType !== userSlot && (account.ownerType === 'USER_A' || account.ownerType === 'USER_B')) {
    return true;
  }
  return false;
}

/**
 * Filtra cuentas que pueden ser utilizadas como origen de fondos
 * (retiros en transferencias, pagos de gastos, depósitos de ingresos, etc.):
 * - En 'household': Solo cuentas propias (ownerType === userSlot) y compartidas (ownerType === 'SHARED').
 *   Excluye terminantemente cuentas personales de la pareja.
 * - En 'personal': Exclusivamente cuentas propias (ownerType === userSlot).
 *   Excluye cuentas compartidas (SHARED) y cuentas personales de la pareja.
 */
export function filterSourceAccounts<T extends { ownerType?: string }>(
  accounts: T[],
  userSlot: MemberSlotFilter,
  appContext: 'household' | 'personal' = 'household'
): T[] {
  if (!accounts || !Array.isArray(accounts)) return [];
  if (appContext === 'personal') {
    if (!userSlot) return [];
    return accounts.filter(acc => Boolean(acc && acc.ownerType === userSlot));
  }
  return accounts.filter(acc => !isPartnerAccount(acc, userSlot));
}

/**
 * Filtra cuentas que pueden ser utilizadas como destino en transferencias:
 * - En 'household': Permite cuentas compartidas y cuentas propias.
 *   Las cuentas personales de la pareja SOLO se permiten si tienen activo el opt-in
 *   `allowPartnerTransfers === true` (para operar en modo 'Destino Ciego').
 *   Si no tienen opt-in o está en false, quedan terminantemente excluidas.
 * - En 'personal': Permite exclusivamente cuentas propias del usuario activo
 *   y cuentas personales de la pareja con opt-in activo (`allowPartnerTransfers === true`).
 *   Excluye terminantemente cuentas compartidas ('SHARED').
 */
export function filterTransferTargetAccounts<T extends { ownerType?: string; allowPartnerTransfers?: boolean }>(
  accounts: T[],
  userSlot?: MemberSlotFilter,
  appContext: 'household' | 'personal' = 'household'
): T[] {
  if (!accounts || !Array.isArray(accounts)) return [];
  if (appContext === 'personal') {
    if (!userSlot) return [];
    return accounts.filter(acc => {
      if (!acc) return false;
      if (acc.ownerType === 'SHARED') return false;
      if (isPartnerAccount(acc, userSlot)) {
        return Boolean(acc.allowPartnerTransfers);
      }
      return acc.ownerType === userSlot;
    });
  }
  if (!userSlot) return accounts;
  return accounts.filter(acc => {
    if (!acc) return false;
    if (isPartnerAccount(acc, userSlot)) {
      return Boolean(acc.allowPartnerTransfers);
    }
    return true;
  });
}

/**
 * Filtra cuentas para operaciones ordinarias (gastos e ingresos) según contexto.
 */
export function filterOperationAccounts<T extends { ownerType?: string }>(
  accounts: T[],
  userSlot: MemberSlotFilter,
  appContext: 'household' | 'personal' = 'household'
): T[] {
  return filterSourceAccounts(accounts, userSlot, appContext);
}

/**
 * Determina si un usuario es el emisor o el receptor de una transferencia.
 */
export function isTransferParticipant(
  transfer: { sourceOwnerUid?: string; targetOwnerUid?: string; senderUid?: string; receiverUid?: string; ownerUid?: string; userId?: string } | null | undefined,
  userUid: string
): boolean {
  if (!transfer || !userUid) return false;
  const senderUid = transfer.sourceOwnerUid || transfer.senderUid || transfer.ownerUid || transfer.userId;
  const receiverUid = transfer.targetOwnerUid || transfer.receiverUid;
  return senderUid === userUid || receiverUid === userUid;
}

/**
 * Determina si el usuario es específicamente el receptor de la transferencia.
 */
export function isTransferReceiver(
  transfer: { targetOwnerUid?: string; receiverUid?: string } | null | undefined,
  userUid: string
): boolean {
  if (!transfer || !userUid) return false;
  const receiverUid = transfer.targetOwnerUid || transfer.receiverUid;
  return receiverUid === userUid;
}

/**
 * Determina si el usuario es específicamente el emisor de la transferencia.
 */
export function isTransferSender(
  transfer: { sourceOwnerUid?: string; senderUid?: string; ownerUid?: string; userId?: string } | null | undefined,
  userUid: string
): boolean {
  if (!transfer || !userUid) return false;
  const senderUid = transfer.sourceOwnerUid || transfer.senderUid || transfer.ownerUid || transfer.userId;
  return senderUid === userUid;
}


