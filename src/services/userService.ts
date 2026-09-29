import { getCurrentUser, createHouseholdAndUser } from '../lib/dataconnect';

export const getOrCreateUserAndHouse = async (fbUser: any) => {
  try {
    // 1. Intentamos obtener el usuario actual de la BD
    const existing = await getCurrentUser();
    
    if (existing.data.user && existing.data.user.householdId) {
      console.log("Usuario encontrado en BD:", existing.data.user.householdId);
      return existing.data.user.householdId;
    }
    
    // 2. Si no existe, creamos el Hogar y el Usuario vinculados
    console.log("Usuario no existe en BD, creándolo...");
    const created = await createHouseholdAndUser({
      email: fbUser.email || '',
      displayName: fbUser.displayName || 'Usuario'
    });
    
    const newHouseholdId = created.data.household_insert.id;
    console.log("Hogar creado con éxito:", newHouseholdId);
    
    return newHouseholdId;
    
  } catch (error) {
    console.error("Error en getOrCreateUserAndHouse:", error);
    return null;
  }
};

export const checkInvitation = async (_inviteId: string) => { return null; };
export const acceptInvitation = async (_userId: string, _inviteId: string) => { return null; };
export const createInvitation = async (_userId: string, _houseId: string) => { return "mock-invite-id"; };
export const leaveHouse = async (userId: string, _currentHouseId: string) => { return `house_${userId}`; };
