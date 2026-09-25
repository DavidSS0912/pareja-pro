import { createService, RecordItem } from './baseService';
import { db } from '../firebase';
import { doc, collection, writeBatch } from 'firebase/firestore';

export const projectService = {
  ...createService('projects'),
  addContributionAndUpdateProject: async (
    houseId: string, 
    projectId: string, 
    contribution: Omit<RecordItem, 'id'>, 
    newSavedAmount: number
  ) => {
    const batch = writeBatch(db);
    
    // Create new contribution doc
    const contribRef = doc(collection(db, 'contributions'));
    batch.set(contribRef, { ...contribution, houseId, projectId });
    
    // Update project doc
    const projectRef = doc(db, 'projects', projectId);
    batch.update(projectRef, { savedAmount: newSavedAmount });
    
    await batch.commit();
  }
};
