// Contexto global de la aplicación: determina qué datos mostrar
export type AppContext = 'personal' | 'household';

export interface EntryWithContext {
  id: string;
  amount: number;
  ownerUid: string;
  isShared: boolean;
  description?: string;
  date?: string;
}

// Filtra entries según el contexto activo del usuario
export function filtrarPorContexto(
  entries: EntryWithContext[],
  context: AppContext,
  currentUserUid: string
): EntryWithContext[] {
  if (context === 'personal') {
    // Solo muestra entradas donde el usuario es propietario Y no son compartidas
    return entries.filter(e => e.ownerUid === currentUserUid && !e.isShared);
  }
  // Contexto hogar: muestra entradas compartidas de todo el hogar
  return entries.filter(e => e.isShared);
}

// Determina si un monto en divisa extranjera debe convertirse
export function convertirMonto(
  amount: number,
  fromCurrency: string,
  toCurrency: string,
  exchangeRate: number
): number {
  if (fromCurrency === toCurrency) return amount;
  return parseFloat((amount * exchangeRate).toFixed(2));
}
