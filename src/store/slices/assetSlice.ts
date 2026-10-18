import { StateCreator } from 'zustand';
import { RecordItem } from '../types';
import { AuthSlice } from './authSlice';
import { DataSlice } from './dataSlice';
import { createExternalAsset, updateExternalAsset } from '../../lib/dataconnect';

export interface AssetSlice {
  assets: RecordItem[];
  setAssets: (items: RecordItem[]) => void;
  addAsset: (item: any) => Promise<void>;
  updateAsset: (id: string, item: any) => Promise<void>;
  deleteAsset: (id: string) => Promise<void>;
}

export const createAssetSlice: StateCreator<AssetSlice & AuthSlice & DataSlice, [], [], AssetSlice> = (set, get) => ({
  assets: [],
  setAssets: (items) => set({ assets: items }),
  addAsset: async (item) => {
    const state = get();
    const houseId = state.houseId || "00000000-0000-0000-0000-000000000000";
    await createExternalAsset({
      householdId: houseId,
      name: item.name || 'Activo',
      estimatedValue: item.value || 0,
      assetType: item.type || 'Liquidez'
    });
    if (state.houseId) await state.fetchDashboardData(state.houseId);
  },
  updateAsset: async (id, item) => {
    const state = get();
    const houseId = state.houseId;
    if (!houseId) return;
    await updateExternalAsset({
      assetId: id,
      householdId: houseId,
      estimatedValue: item.value !== undefined ? item.value : 0
    });
    await state.fetchDashboardData(houseId);
  },
  deleteAsset: async (_id) => {}
});
