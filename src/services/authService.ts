import { signInWithPopup, signOut as firebaseSignOut, onAuthStateChanged } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';

export const authService = {
  loginWithGoogle: async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Error logging in with Google:", error);
      throw error;
    }
  },
  
  logout: async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error("Error logging out:", error);
      throw error;
    }
  },
  
  onAuthStateChange: (callback: (user: any) => void) => {
    return onAuthStateChanged(auth, callback);
  }
};
