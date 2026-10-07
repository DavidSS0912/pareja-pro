import { getCurrentUser, createHouseholdAndUser, seedDefaultAccounts } from '../lib/dataconnect';

export const getOrCreateUserAndHouse = async (fbUser: any) => {
  try {
    // 1. Intentamos obtener el usuario actual de la BD
    const existing = await getCurrentUser();
    
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

export const checkInvitation = async (_inviteId: string) => { return null; };
export const acceptInvitation = async (_userId: string, _inviteId: string) => { return null; };
export const createInvitation = async (_userId: string, _houseId: string) => { return "mock-invite-id"; };
export const leaveHouse = async (userId: string, _currentHouseId: string) => { return `house_${userId}`; };
