import { createService } from './baseService';
import { db } from '../firebase';
import { doc, getDoc, setDoc, addDoc, collection } from 'firebase/firestore';

export const userService = createService('users');

export const getOrCreateUserAndHouse = async (fbUser: any) => {
  const userDocRef = doc(db, 'users', fbUser.uid);
  const userDoc = await getDoc(userDocRef);
  
  let currentHouseId = '';
  if (userDoc.exists()) {
    currentHouseId = userDoc.data().houseId;
    try {
      await setDoc(userDocRef, { photoURL: fbUser.photoURL || null }, { merge: true });
    } catch (err) {
      console.error("Error updating photoURL", err);
    }
  } else {
    currentHouseId = `house_${fbUser.uid}`;
    await setDoc(doc(db, 'houses', currentHouseId), { members: [fbUser.uid] });
    await setDoc(userDocRef, { 
      houseId: currentHouseId, 
      email: fbUser.email, 
      displayName: fbUser.displayName,
      name: fbUser.displayName?.split(' ')[0] || 'Usuario',
      avatar: 'bg-indigo-500',
      photoURL: fbUser.photoURL || null
    });
  }
  return currentHouseId;
};

export const checkInvitation = async (inviteId: string) => {
  const inviteRef = doc(db, 'invitations', inviteId);
  const inviteDoc = await getDoc(inviteRef);
  if (inviteDoc.exists() && !inviteDoc.data().accepted) {
    return inviteDoc.data().houseId;
  }
  return null;
};

export const acceptInvitation = async (userId: string, inviteId: string) => {
  const inviteRef = doc(db, 'invitations', inviteId);
  const inviteDoc = await getDoc(inviteRef);
  if (inviteDoc.exists()) {
    const newHouseId = inviteDoc.data().houseId;
    const houseRef = doc(db, 'houses', newHouseId);
    const houseDoc = await getDoc(houseRef);
    if (houseDoc.exists()) {
       await setDoc(doc(db, 'houses', newHouseId), { members: [...houseDoc.data().members, userId] }, { merge: true });
       await setDoc(doc(db, 'users', userId), { houseId: newHouseId }, { merge: true });
       await setDoc(inviteRef, { accepted: true }, { merge: true });
       return newHouseId;
    }
  }
  return null;
};

export const createInvitation = async (userId: string, houseId: string) => {
  const inviteRef = await addDoc(collection(db, 'invitations'), {
    houseId,
    fromUid: userId,
    createdAt: new Date().toISOString(),
    accepted: false
  });
  return inviteRef.id;
};
