import { StateCreator } from 'zustand';
import { RecordItem } from '../types';
import { AuthSlice } from './authSlice';

export interface CardSlice {
  cards: RecordItem[];
  setCards: (items: RecordItem[]) => void;
  addCard: (item: any) => Promise<void>;
  updateCard: (id: string, item: any) => Promise<void>;
  deleteCard: (id: string) => Promise<void>;

}

export const createCardSlice: StateCreator<CardSlice & AuthSlice, [], [], CardSlice> = (set, get) => ({
  cards: [],
  setCards: (items) => set({ cards: items }),
  addCard: async (item) => {},
  updateCard: async (id, item) => {},
  deleteCard: async (id) => {}

});
