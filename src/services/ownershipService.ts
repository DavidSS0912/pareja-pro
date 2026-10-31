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
 * (retiros en transferencias, pagos de gastos, etc.):
 * Solo cuentas propias (ownerType === userSlot) y compartidas (ownerType === 'SHARED').
 * Excluye terminantemente cuentas personales de la pareja.
 */
export function filterSourceAccounts<T extends { ownerType?: string }>(
  accounts: T[],
  userSlot: MemberSlotFilter
): T[] {
  if (!accounts || !Array.isArray(accounts)) return [];
  return accounts.filter(acc => !isPartnerAccount(acc, userSlot));
}

/**
 * Filtra cuentas que pueden ser utilizadas como destino en transferencias:
 * Permite cuentas compartidas y cuentas propias.
 * Las cuentas personales de la pareja SOLO se permiten si tienen activo el opt-in
 * `allowPartnerTransfers === true` (para operar en modo 'Destino Ciego').
 * Si no tienen opt-in o está en false, quedan terminantemente excluidas.
 */
export function filterTransferTargetAccounts<T extends { ownerType?: string; allowPartnerTransfers?: boolean }>(
  accounts: T[],
  userSlot?: MemberSlotFilter
): T[] {
  if (!accounts || !Array.isArray(accounts)) return [];
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


