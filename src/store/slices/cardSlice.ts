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

export const createCardSlice: StateCreator<CardSlice & AuthSlice, [], [], CardSlice> = (set) => ({
  cards: [],
  setCards: (items) => set({ cards: items }),
  addCard: async (_item) => {
    alert("Operación 'Agregar Tarjeta' no disponible en DataConnect (PostgreSQL).");
  },
  updateCard: async (_id, _item) => {
    alert("Operación 'Actualizar Tarjeta' no disponible en DataConnect (PostgreSQL).");
  },
  deleteCard: async (_id) => {
    alert("Operación 'Eliminar Tarjeta' no disponible en DataConnect (PostgreSQL).");
  }

});
