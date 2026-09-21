import { create } from 'zustand';
import { db } from '../firebase';
import { collection, doc, addDoc, updateDoc, deleteDoc, onSnapshot, query, where } from 'firebase/firestore';

export interface RecordItem {
  id: string;
  [key: string]: any;
}

export interface UserState {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export interface AppState {
  user: UserState | null;
  houseId: string | null;
  authLoading: boolean;

  setUser: (user: UserState | null) => void;
  setHouseId: (houseId: string | null) => void;
  setAuthLoading: (loading: boolean) => void;

  expenses: RecordItem[];
  budgets: RecordItem[];
  cards: RecordItem[];
  assets: RecordItem[];
  incomes: RecordItem[];

  initListeners: (houseId: string) => () => void;

  addExpense: (expense: Omit<RecordItem, 'id'>) => Promise<void>;
  updateExpense: (id: string, expense: Partial<Omit<RecordItem, 'id'>>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;

  addBudget: (budget: Omit<RecordItem, 'id'>) => Promise<void>;
  updateBudget: (id: string, budget: Partial<Omit<RecordItem, 'id'>>) => Promise<void>;
  deleteBudget: (id: string) => Promise<void>;

  addCard: (card: Omit<RecordItem, 'id'>) => Promise<void>;
  updateCard: (id: string, card: Partial<Omit<RecordItem, 'id'>>) => Promise<void>;
  deleteCard: (id: string) => Promise<void>;

  addAsset: (asset: Omit<RecordItem, 'id'>) => Promise<void>;
  updateAsset: (id: string, asset: Partial<Omit<RecordItem, 'id'>>) => Promise<void>;
  deleteAsset: (id: string) => Promise<void>;

  addIncome: (income: Omit<RecordItem, 'id'>) => Promise<void>;
  updateIncome: (id: string, income: Partial<Omit<RecordItem, 'id'>>) => Promise<void>;
  deleteIncome: (id: string) => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  user: null,
  houseId: null,
  authLoading: true,

  setUser: (user) => set({ user }),
  setHouseId: (houseId) => set({ houseId }),
  setAuthLoading: (loading) => set({ authLoading: loading }),

  expenses: [],
  budgets: [],
  cards: [],
  assets: [],
  incomes: [],

  initListeners: (houseId: string) => {
    const collections = ['expenses', 'budgets', 'cards', 'assets', 'incomes'] as const;
    const unsubscribes = collections.map((colName) => {
      const q = query(collection(db, colName), where('houseId', '==', houseId));
      return onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        set({ [colName]: data });
      });
    });

    return () => unsubscribes.forEach(unsub => unsub());
  },

  addExpense: async (expense) => {
    const { houseId } = get();
    if (!houseId) return;
    await addDoc(collection(db, 'expenses'), { ...expense, houseId });
  },
  updateExpense: async (id, expense) => { await updateDoc(doc(db, 'expenses', id), expense); },
  deleteExpense: async (id) => { await deleteDoc(doc(db, 'expenses', id)); },

  addBudget: async (budget) => {
    const { houseId } = get();
    if (!houseId) return;
    await addDoc(collection(db, 'budgets'), { ...budget, houseId });
  },
  updateBudget: async (id, budget) => { await updateDoc(doc(db, 'budgets', id), budget); },
  deleteBudget: async (id) => { await deleteDoc(doc(db, 'budgets', id)); },

  addCard: async (card) => {
    const { houseId } = get();
    if (!houseId) return;
    await addDoc(collection(db, 'cards'), { ...card, houseId });
  },
  updateCard: async (id, card) => { await updateDoc(doc(db, 'cards', id), card); },
  deleteCard: async (id) => { await deleteDoc(doc(db, 'cards', id)); },

  addAsset: async (asset) => {
    const { houseId } = get();
    if (!houseId) return;
    await addDoc(collection(db, 'assets'), { ...asset, houseId });
  },
  updateAsset: async (id, asset) => { await updateDoc(doc(db, 'assets', id), asset); },
  deleteAsset: async (id) => { await deleteDoc(doc(db, 'assets', id)); },

  addIncome: async (income) => {
    const { houseId } = get();
    if (!houseId) return;
    await addDoc(collection(db, 'incomes'), { ...income, houseId });
  },
  updateIncome: async (id, income) => { await updateDoc(doc(db, 'incomes', id), income); },
  deleteIncome: async (id) => { await deleteDoc(doc(db, 'incomes', id)); },
}));
