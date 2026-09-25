import { StateCreator } from 'zustand';
import { RecordItem } from '../../services/baseService';
import { assetService } from '../../services/assetService';
import { AuthSlice } from './authSlice';

export interface AssetSlice {
  assets: RecordItem[];
  setAssets: (assets: RecordItem[]) => void;
  addAsset: (asset: Omit<RecordItem, 'id'>) => Promise<void>;
  updateAsset: (id: string, asset: Partial<Omit<RecordItem, 'id'>>) => Promise<void>;
  deleteAsset: (id: string) => Promise<void>;
}

export const createAssetSlice: StateCreator<AssetSlice & AuthSlice, [], [], AssetSlice> = (set, get) => ({
  assets: [],
  setAssets: (assets) => set({ assets }),
  addAsset: async (asset) => {
    const { houseId } = get();
    if (!houseId) return;
    await assetService.add(asset, houseId);
  },
  updateAsset: async (id, asset) => {
    await assetService.update(id, asset);
  },
  deleteAsset: async (id) => {
    await assetService.delete(id);
  }
});
