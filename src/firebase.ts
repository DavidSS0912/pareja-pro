import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, enableMultiTabIndexedDbPersistence } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCpNwMBegGWdKoR2SE5Ntm-DbN0omTYybY",
  authDomain: "orbita2-f8aa1.firebaseapp.com",
  projectId: "orbita2-f8aa1",
  storageBucket: "orbita2-f8aa1.firebasestorage.app",
  messagingSenderId: "731960014497",
  appId: "1:731960014497:web:b7a1f2a22ae4f0d3bbe2e0",
  measurementId: "G-M57M160WVR"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

enableMultiTabIndexedDbPersistence(db).catch((err) => {
  if (err.code === 'failed-precondition') {
    console.warn('Múltiples pestañas abiertas, persistencia desactivada.');
  } else if (err.code === 'unimplemented') {
    console.warn('El navegador no soporta persistencia offline.');
  }
});

export const googleProvider = new GoogleAuthProvider();
