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
