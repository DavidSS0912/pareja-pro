import { QueryFetchPolicy } from 'firebase/data-connect';
import {
  getCurrentUser,
  createHouseholdAndUser,
  createInvitation as createInvitationMutation,
  acceptInvitation as acceptInvitationMutation,
  revokeInvitation as revokeInvitationMutation,
  leaveHousehold as leaveHouseholdMutation,
  removeHouseholdMember as removeHouseholdMemberMutation,
  getInvitation,
  getHouseholdMembers as getHouseholdMembersQuery,
  MemberSlot
} from '../lib/dataconnect';

export { MemberSlot };

export interface InvitationDetails {
  householdId: string;
  householdName: string;
  inviterName: string;
  status: string;
  expiresAt: string;
}

export interface HouseholdMember {
  id: string;
  email: string;
  displayName: string;
  memberSlot: MemberSlot | string | null;
  createdAt: string;
}

export const getOrCreateUserAndHouse = async (fbUser: any) => {
  try {
    // 1. Intentamos obtener el usuario actual de la BD
    const existing = await getCurrentUser({ fetchPolicy: QueryFetchPolicy.SERVER_ONLY });
    
    if (existing.data.user && existing.data.user.householdId) {
      const householdId = existing.data.user.householdId;
      console.log("Usuario encontrado en BD:", householdId);
      
      // 2. Ejecutar migración / deduplicación de cuentas
      try {
        const { runAccountMigration } = await import('./accountMigrationService');
        await runAccountMigration(householdId);
      } catch (error) {
        console.error("Error al ejecutar migración de cuentas:", error);
      }
      
      return householdId;
    }
    
    // 3. Si no existe, creamos el Hogar y el Usuario vinculados (con cuentas por defecto)
    console.log("Usuario no existe en BD, creándolo...");
    const created = await createHouseholdAndUser({
      email: fbUser.email || '',
      displayName: fbUser.displayName || 'Usuario'
    });
    
    const newHouseholdId = created.data.household_insert.id;
    console.log("Hogar creado con éxito (cuentas incluidas):", newHouseholdId);
    
    return newHouseholdId;
    
  } catch (error) {
    console.error("Error en getOrCreateUserAndHouse:", error);
    return null;
  }
};

/**
 * Crea una invitación para el hogar con una fecha de expiración.
 * Por defecto expira en 7 días si no se especifica.
 * Soporta sobrecarga para llamadas heredadas (userId, householdId).
 */
export async function createInvitation(
  householdIdOrUserId: string,
  expiresAtOrHouseId?: Date | string
): Promise<string> {
  let targetHouseholdId = householdIdOrUserId;
  let targetExpiration: string;

  if (typeof expiresAtOrHouseId === 'string') {
    // Llamada heredada: (userId, houseId)
    targetHouseholdId = expiresAtOrHouseId;
    targetExpiration = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  } else if (expiresAtOrHouseId instanceof Date) {
    targetExpiration = expiresAtOrHouseId.toISOString();
  } else {
    targetExpiration = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  }

  const res = await createInvitationMutation({
    householdId: targetHouseholdId,
    expiresAt: targetExpiration
  });

  return res.data.invitation_insert.id;
}

/**
 * Consulta y valida una invitación por su ID.
 * Devuelve los detalles si está pendiente y vigente, o null si es inválida/expirada.
 */
export const checkInvitation = async (invitationId: string): Promise<InvitationDetails | string | null> => {
  try {
    const res = await getInvitation({ id: invitationId }, { fetchPolicy: QueryFetchPolicy.SERVER_ONLY });
    const inv = res.data?.invitation;
    if (!inv || !inv.household) {
      return null;
    }
    return {
      householdId: inv.household.id,
      householdName: inv.household.name,
      inviterName: inv.createdByUid || 'Pareja',
      status: inv.status,
      expiresAt: inv.expiresAt
    };
  } catch (error) {
    console.error("Error al verificar invitación:", error);
    return null;
  }
};

/**
 * Acepta una invitación y vincula al usuario al hogar correspondiente.
 * Devuelve el nuevo householdId.
 * Soporta sobrecarga para llamadas heredadas (userId, invitationId) o (invitationId, householdId?).
 */
export async function acceptInvitation(
  invitationIdOrUserId: string,
  maybeInviteIdOrHouseholdId?: string
): Promise<string> {
  let inviteId = invitationIdOrUserId;
  let targetHouseholdId: string | undefined = maybeInviteIdOrHouseholdId;

  // Si se pasaron dos argumentos y el primero no es UUID (ej. UID de Firebase), el segundo es inviteId
  if (maybeInviteIdOrHouseholdId) {
    if (invitationIdOrUserId.length !== 36 && maybeInviteIdOrHouseholdId.length === 36) {
      inviteId = maybeInviteIdOrHouseholdId;
      targetHouseholdId = undefined;
    }
  }

  // Si no disponemos de targetHouseholdId, lo consultamos con getInvitation
  if (!targetHouseholdId) {
    const inviteRes = await getInvitation({ id: inviteId }, { fetchPolicy: QueryFetchPolicy.SERVER_ONLY });
    if (!inviteRes.data?.invitation?.household?.id) {
      throw new Error('La invitación no existe, ya fue utilizada o ha expirado');
    }
    targetHouseholdId = inviteRes.data.invitation.household.id;
  }

  await acceptInvitationMutation({
    invitationId: inviteId,
    householdId: targetHouseholdId
  });

  return targetHouseholdId;
}

/**
 * Abandona el hogar actual creando uno nuevo independiente para el usuario con cuentas por defecto.
 * Soporta sobrecarga para llamadas heredadas (userId, householdId).
 */
export async function leaveHouse(
  householdIdOrUserId: string,
  maybeHouseholdId?: string
): Promise<string> {
  const householdId = maybeHouseholdId || householdIdOrUserId;
  const res = await leaveHouseholdMutation({ householdId });
  return res.data.newHousehold.id;
}

/**
 * Remueve a un miembro del hogar (solo ejecutable por el creador USER_A).
 */
export const removeMember = async (householdId: string, memberUid: string): Promise<void> => {
  await removeHouseholdMemberMutation({
    householdId,
    memberUid
  });
};

/**
 * Revoca una invitación pendiente del hogar.
 */
export const revokeInvitation = async (invitationId: string, householdId: string): Promise<void> => {
  await revokeInvitationMutation({
    id: invitationId,
    householdId
  });
};

/**
 * Consulta la lista de miembros de un hogar y los mapea al tipo interno.
 */
export const getHouseholdMembers = async (householdId: string): Promise<HouseholdMember[]> => {
  const res = await getHouseholdMembersQuery({ householdId }, { fetchPolicy: QueryFetchPolicy.SERVER_ONLY });
  const users = res.data?.users || [];
  return users.map(u => ({
    id: u.uid,
    email: u.email,
    displayName: u.displayName || '',
    memberSlot: u.memberSlot || null,
    createdAt: u.createdAt
  }));
};
