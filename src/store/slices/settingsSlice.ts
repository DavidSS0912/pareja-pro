import { StateCreator } from 'zustand';
import { AuthSlice } from './authSlice';
import { DataSlice } from './dataSlice';
import { getCategories, getTags, createCategory, updateCategory, deleteCategory, createTag, deleteTag } from '../../lib/dataconnect';
import { useToastStore } from '../useToastStore';

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

export interface SettingsSlice {
  categories: Category[];
  tags: Tag[];
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
  
  refreshSettings: async () => {
    const state = get();
    const houseId = state.houseId;
    if (!houseId) return;
    
    try {
      const [catsRes, tagsRes] = await Promise.all([
        getCategories({ householdId: houseId }),
        getTags({ householdId: houseId })
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
        ownerType: item.ownerType as any
      });
      await get().refreshSettings();
      useToastStore.getState().addToast("Categoría agregada", "success");
    } catch (e) {
      console.error(e);
      useToastStore.getState().addToast("Error al agregar categoría", "error");
    }
  },

  updateCategoryItem: async (id, name, color) => {
    try {
      await updateCategory({
        id,
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
    try {
      await deleteCategory({ id });
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
    try {
      await deleteTag({ id });
      await get().refreshSettings();
      useToastStore.getState().addToast("Etiqueta eliminada", "success");
    } catch (e) {
      console.error(e);
      useToastStore.getState().addToast("Error al eliminar etiqueta", "error");
    }
  }
});
