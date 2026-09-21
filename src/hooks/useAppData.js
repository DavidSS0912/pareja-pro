import { useState, useEffect } from 'react';
import { SEED_DATA } from '../data';

const STORAGE_KEY = 'parejapro_data';

export function useAppData() {
  const [data, setData] = useState(() => {
    try {
      const item = window.localStorage.getItem(STORAGE_KEY);
      return item ? JSON.parse(item) : SEED_DATA;
    } catch (error) {
      console.error(error);
      return SEED_DATA;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error(error);
    }
  }, [data]);

  const generateId = (prefix) => `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;

  // Generic CRUD functions
  const addRecord = (collection, record) => {
    setData(prev => ({
      ...prev,
      [collection]: [...prev[collection], { ...record, id: generateId(collection[0]) }]
    }));
  };

  const updateRecord = (collection, id, updatedRecord) => {
    setData(prev => ({
      ...prev,
      [collection]: prev[collection].map(item => item.id === id ? { ...item, ...updatedRecord } : item)
    }));
  };

  const deleteRecord = (collection, id) => {
    setData(prev => ({
      ...prev,
      [collection]: prev[collection].filter(item => item.id !== id)
    }));
  };

  // Specific helpers
  const methods = {
    addExpense: (expense) => addRecord('expenses', expense),
    updateExpense: (id, expense) => updateRecord('expenses', id, expense),
    deleteExpense: (id) => deleteRecord('expenses', id),
    
    addBudget: (budget) => addRecord('budgets', budget),
    updateBudget: (id, budget) => updateRecord('budgets', id, budget),
    deleteBudget: (id) => deleteRecord('budgets', id),

    addCard: (card) => addRecord('cards', card),
    updateCard: (id, card) => updateRecord('cards', id, card),
    deleteCard: (id) => deleteRecord('cards', id),

    addAsset: (asset) => addRecord('assets', asset),
    updateAsset: (id, asset) => updateRecord('assets', id, asset),
    deleteAsset: (id) => deleteRecord('assets', id),

    addIncome: (income) => addRecord('incomes', income),
    updateIncome: (id, income) => updateRecord('incomes', id, income),
    deleteIncome: (id) => deleteRecord('incomes', id),
  };

  return [data, methods];
}
