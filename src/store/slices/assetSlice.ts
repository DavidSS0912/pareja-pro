import { StateCreator } from 'zustand';
import { RecordItem } from '../types';
import { AuthSlice } from './authSlice';

export interface AssetSlice {
  assets: RecordItem[];
  setAssets: (items: RecordItem[]) => void;
  addAsset: (item: any) => Promise<void>;
  updateAsset: (id: string, item: any) => Promise<void>;
  deleteAsset: (id: string) => Promise<void>;

}

export const createAssetSlice: StateCreator<AssetSlice & AuthSlice, [], [], AssetSlice> = (set) => ({
  assets: [],
  setAssets: (items) => set({ assets: items }),
  addAsset: async (_item) => {},
  updateAsset: async (_id, _item) => {},
  deleteAsset: async (_id) => {}

});
