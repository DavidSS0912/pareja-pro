import { StateCreator } from 'zustand';

export interface UserState {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export interface AuthSlice {
  user: UserState | null;
  houseId: string | null;
  authLoading: boolean;
  dateRange: { start: string, end: string };

  setUser: (user: UserState | null) => void;
  setHouseId: (houseId: string | null) => void;
  setAuthLoading: (loading: boolean) => void;
  setDateRange: (start: string, end: string) => void;
}

export const createAuthSlice: StateCreator<AuthSlice> = (set) => ({
  user: null,
  houseId: null,
  authLoading: true,
  dateRange: {
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0]
  },
  setUser: (user) => set({ user }),
  setHouseId: (houseId) => set({ houseId }),
  setAuthLoading: (loading) => set({ authLoading: loading }),
  setDateRange: (start, end) => set({ dateRange: { start, end } }),
});
