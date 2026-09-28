export const getOrCreateUserAndHouse = async (fbUser: any) => {
  return `house_${fbUser.uid}`;
};
export const checkInvitation = async (inviteId: string) => { return null; };
export const acceptInvitation = async (userId: string, inviteId: string) => { return null; };
export const createInvitation = async (userId: string, houseId: string) => { return "mock-invite-id"; };
export const leaveHouse = async (userId: string, currentHouseId: string) => { return `house_${userId}`; };
