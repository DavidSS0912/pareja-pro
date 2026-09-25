import { db } from '../firebase';
import { collection, doc, addDoc, updateDoc, deleteDoc, onSnapshot, query, where, Unsubscribe } from 'firebase/firestore';

export interface RecordItem {
  id: string;
  [key: string]: any;
}

export const createService = (collectionName: string) => {
  return {
    subscribe: (houseId: string, callback: (data: RecordItem[]) => void): Unsubscribe => {
      const q = query(collection(db, collectionName), where('houseId', '==', houseId));
      return onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        callback(data);
      });
    },
    add: async (item: Omit<RecordItem, 'id'>, houseId: string) => {
      await addDoc(collection(db, collectionName), { ...item, houseId });
    },
    update: async (id: string, item: Partial<Omit<RecordItem, 'id'>>) => {
      await updateDoc(doc(db, collectionName, id), item);
    },
    delete: async (id: string) => {
      await deleteDoc(doc(db, collectionName, id));
    }
  };
};
