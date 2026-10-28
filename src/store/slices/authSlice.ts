import { StateCreator } from 'zustand';

export type MemberSlotType = 'USER_A' | 'USER_B' | null;

export interface UserState {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  memberSlot?: MemberSlotType;
}

export interface AuthSlice {
  user: UserState | null;
  houseId: string | null;
  memberSlot: MemberSlotType;
  authLoading: boolean;
  dateRange: { start: string, end: string };

  setUser: (user: UserState | null) => void;
  setHouseId: (houseId: string | null) => void;
  setMemberSlot: (slot: MemberSlotType) => void;
  setAuthLoading: (loading: boolean) => void;
  setDateRange: (start: string, end: string) => void;
}

export const createAuthSlice: StateCreator<AuthSlice> = (set) => ({
  user: null,
  houseId: null,
  memberSlot: null,
  authLoading: true,
  dateRange: {
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0]
  },
  setUser: (user) => set({
    user,
    memberSlot: user?.memberSlot !== undefined ? user.memberSlot : null
  }),
  setHouseId: (houseId) => set({ houseId }),
  setMemberSlot: (memberSlot) => set((state) => ({
    memberSlot,
    user: state.user ? { ...state.user, memberSlot } : null
  })),
  setAuthLoading: (loading) => set({ authLoading: loading }),
  setDateRange: (start, end) => set({ dateRange: { start, end } }),
});
