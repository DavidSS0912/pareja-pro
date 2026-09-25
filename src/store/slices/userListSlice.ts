import { StateCreator } from 'zustand';
import { RecordItem } from '../../services/baseService';

export interface UserListSlice {
  users: RecordItem[];
  setUsers: (users: RecordItem[]) => void;
}

export const createUserListSlice: StateCreator<UserListSlice> = (set) => ({
  users: [],
  setUsers: (users) => set({ users }),
});
