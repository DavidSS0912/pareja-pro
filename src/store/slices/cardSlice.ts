import { StateCreator } from 'zustand';
import { RecordItem } from '../../services/baseService';
import { cardService } from '../../services/cardService';
import { AuthSlice } from './authSlice';

export interface CardSlice {
  cards: RecordItem[];
  setCards: (cards: RecordItem[]) => void;
  addCard: (card: Omit<RecordItem, 'id'>) => Promise<void>;
  updateCard: (id: string, card: Partial<Omit<RecordItem, 'id'>>) => Promise<void>;
  deleteCard: (id: string) => Promise<void>;
}

export const createCardSlice: StateCreator<CardSlice & AuthSlice, [], [], CardSlice> = (set, get) => ({
  cards: [],
  setCards: (cards) => set({ cards }),
  addCard: async (card) => {
    const { houseId } = get();
    if (!houseId) return;
    await cardService.add(card, houseId);
  },
  updateCard: async (id, card) => {
    await cardService.update(id, card);
  },
  deleteCard: async (id) => {
    await cardService.delete(id);
  }
});
