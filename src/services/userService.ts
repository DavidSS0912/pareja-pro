export const getOrCreateUserAndHouse = async (fbUser: any) => {
  return `house_${fbUser.uid}`;
};
export const checkInvitation = async (_inviteId: string) => { return null; };
export const acceptInvitation = async (_userId: string, _inviteId: string) => { return null; };
export const createInvitation = async (_userId: string, _houseId: string) => { return "mock-invite-id"; };
export const leaveHouse = async (userId: string, _currentHouseId: string) => { return `house_${userId}`; };
