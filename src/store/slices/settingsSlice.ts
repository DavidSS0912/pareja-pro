import { StateCreator } from 'zustand';
import { AuthSlice } from './authSlice';
import { DataSlice } from './dataSlice';
import { QueryFetchPolicy } from 'firebase/data-connect';
import { getCategories, getTags, createCategory, updateCategory, deleteCategory, createTag, deleteTag } from '../../lib/dataconnect';
import { useToastStore } from '../useToastStore';

const SERVER_ONLY = { fetchPolicy: QueryFetchPolicy.SERVER_ONLY };

export interface Category {
  id: string;
  name: string;
  type: 'EXPENSE' | 'INCOME';
  color?: string;
  ownerType: 'USER_A' | 'USER_B' | 'SHARED';
}

export interface Tag {
  id: string;
  name: string;
}

const getHouseholdCutoffFromStorage = (): number => {
  if (typeof window === 'undefined') return 1;
  try {
    const raw = localStorage.getItem('orbita_cutoff_day_household');
    const parsed = parseInt(raw || '1', 10);
    return isNaN(parsed) || parsed < 1 || parsed > 31 ? 1 : parsed;
  } catch {
    return 1;
  }
};

const getPersonalCutoffKey = (uid?: string | null): string => {
  return uid ? `orbita_cutoff_day_personal_${uid}` : 'orbita_cutoff_day_personal';
};

const getPersonalCutoffFromStorage = (uid?: string | null): number => {
  if (typeof window === 'undefined') return 1;
  try {
    const key = getPersonalCutoffKey(uid);
    const raw = localStorage.getItem(key);
    const parsed = parseInt(raw || '1', 10);
    return isNaN(parsed) || parsed < 1 || parsed > 31 ? 1 : parsed;
  } catch {
    return 1;
  }
};

const getDefaultCurrencyFromStorage = (): string => {
  if (typeof window === 'undefined') return 'MXN';
  try {
    return localStorage.getItem('defaultCurrency') || 'MXN';
  } catch {
    return 'MXN';
  }
};

const getExchangeRateFromStorage = (): number => {
  if (typeof window === 'undefined') return 20.0;
  try {
    const raw = localStorage.getItem('exchangeRate');
    const parsed = parseFloat(raw || '20.0');
    return isNaN(parsed) || parsed <= 0 ? 20.0 : parsed;
  } catch {
    return 20.0;
  }
};

export interface SettingsSlice {
  categories: Category[];
  tags: Tag[];
  cutoffDayHousehold: number;
  cutoffDayPersonal: number;
  defaultCurrency: string;
  exchangeRate: number;
  setCutoffDayHousehold: (day: number) => void;
  setCutoffDayPersonal: (day: number) => void;
  setDefaultCurrency: (curr: string) => void;
  setExchangeRate: (rate: number) => void;
  refreshSettings: () => Promise<void>;
  addCategory: (item: Omit<Category, 'id'>) => Promise<void>;
  updateCategoryItem: (id: string, name: string, color?: string) => Promise<void>;
  deleteCategoryItem: (id: string) => Promise<void>;
  addTag: (name: string) => Promise<void>;
  deleteTagItem: (id: string) => Promise<void>;
}

export const createSettingsSlice: StateCreator<SettingsSlice & AuthSlice & DataSlice, [], [], SettingsSlice> = (set, get) => ({
  categories: [],
  tags: [],
  cutoffDayHousehold: getHouseholdCutoffFromStorage(),
  cutoffDayPersonal: getPersonalCutoffFromStorage(),
  defaultCurrency: getDefaultCurrencyFromStorage(),
  exchangeRate: getExchangeRateFromStorage(),

  setCutoffDayHousehold: (day: number) => {
    const clamped = Math.max(1, Math.min(31, Math.round(day || 1)));
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('orbita_cutoff_day_household', String(clamped));
      } catch (err) {
        console.warn('Error guardando cutoffDayHousehold en localStorage', err);
      }
    }
    set({ cutoffDayHousehold: clamped });
  },

  setCutoffDayPersonal: (day: number) => {
    const clamped = Math.max(1, Math.min(31, Math.round(day || 1)));
    const uid = get().user?.uid;
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(getPersonalCutoffKey(uid), String(clamped));
      } catch (err) {
        console.warn('Error guardando cutoffDayPersonal en localStorage', err);
      }
    }
    set({ cutoffDayPersonal: clamped });
  },

  setDefaultCurrency: (curr: string) => {
    const safeCurr = curr ? curr.toUpperCase() : 'MXN';
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('defaultCurrency', safeCurr);
      } catch (err) {
        console.warn('Error guardando defaultCurrency en localStorage', err);
      }
    }
    set({ defaultCurrency: safeCurr });
  },

  setExchangeRate: (rate: number) => {
    const safeRate = Number(rate) > 0 ? Number(rate) : 20.0;
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('exchangeRate', String(safeRate));
      } catch (err) {
        console.warn('Error guardando exchangeRate en localStorage', err);
      }
    }
    set({ exchangeRate: safeRate });
  },
  
  refreshSettings: async () => {
    const state = get();
    const houseId = state.houseId;

    // Sincronizar configuraciones locales reactivamente
    const currentUid = state.user?.uid;
    set({
      cutoffDayHousehold: getHouseholdCutoffFromStorage(),
      cutoffDayPersonal: getPersonalCutoffFromStorage(currentUid),
      defaultCurrency: getDefaultCurrencyFromStorage(),
      exchangeRate: getExchangeRateFromStorage()
    });

    if (!houseId) return;
    
    try {
      const [catsRes, tagsRes] = await Promise.all([
        getCategories({ householdId: houseId }, SERVER_ONLY),
        getTags({ householdId: houseId }, SERVER_ONLY)
      ]);
      set({ 
        categories: (catsRes.data?.categories || []) as Category[], 
        tags: (tagsRes.data?.tags || []) as Tag[]
      });
    } catch (e) {
      console.error("Error al cargar ajustes (Categorías y Tags)", e);
    }
  },

  addCategory: async (item) => {
    const state = get();
    const houseId = state.houseId;
    if (!houseId) return;

    try {
      await createCategory({
        householdId: houseId,
        name: item.name,
        type: item.type as any,
        color: item.color || null,
        ownerType: (item.ownerType || (state.memberSlot || state.user?.memberSlot || 'SHARED')) as any
      });
      await get().refreshSettings();
      useToastStore.getState().addToast("Categoría agregada", "success");
    } catch (e) {
      console.error(e);
      useToastStore.getState().addToast("Error al agregar categoría", "error");
    }
  },

  updateCategoryItem: async (id, name, color) => {
    const houseId = get().houseId;
    if (!houseId) return;
    try {
      await updateCategory({
        id,
        householdId: houseId,
        name,
        color: color || null
      });
      await get().refreshSettings();
      useToastStore.getState().addToast("Categoría actualizada", "success");
    } catch (e) {
      console.error(e);
      useToastStore.getState().addToast("Error al actualizar categoría", "error");
    }
  },

  deleteCategoryItem: async (id) => {
    const houseId = get().houseId;
    if (!houseId) return;
    try {
      await deleteCategory({ id, householdId: houseId });
      await get().refreshSettings();
      useToastStore.getState().addToast("Categoría eliminada", "success");
    } catch (e) {
      console.error(e);
      useToastStore.getState().addToast("Error al eliminar categoría", "error");
    }
  },

  addTag: async (name) => {
    const state = get();
    const houseId = state.houseId;
    if (!houseId) return;

    try {
      await createTag({
        householdId: houseId,
        name
      });
      await get().refreshSettings();
      useToastStore.getState().addToast("Etiqueta agregada", "success");
    } catch (e) {
      console.error(e);
      useToastStore.getState().addToast("Error al agregar etiqueta", "error");
    }
  },

  deleteTagItem: async (id) => {
    const houseId = get().houseId;
    if (!houseId) return;
    try {
      await deleteTag({ id, householdId: houseId });
      await get().refreshSettings();
      useToastStore.getState().addToast("Etiqueta eliminada", "success");
    } catch (e) {
      console.error(e);
      useToastStore.getState().addToast("Error al eliminar etiqueta", "error");
    }
  }
});
