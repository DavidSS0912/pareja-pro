/// <reference types="vite/client" />
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, connectAuthEmulator } from "firebase/auth";
import { getDataConnect, connectDataConnectEmulator } from "firebase/data-connect";
import { connectorConfig } from "./lib/dataconnect";

const useEmulator = import.meta.env.DEV && import.meta.env.VITE_USE_PROD !== 'true';

const firebaseConfig = {
  apiKey: "AIzaSyCpNwMBegGWdKoR2SE5Ntm-DbN0omTYybY",
  authDomain: "orbita2-f8aa1.firebaseapp.com",
  projectId: useEmulator ? "demo-pareja-pro" : "orbita2-f8aa1",
  storageBucket: "orbita2-f8aa1.firebasestorage.app",
  messagingSenderId: "731960014497",
  appId: "1:731960014497:web:b7a1f2a22ae4f0d3bbe2e0",
  measurementId: "G-M57M160WVR"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const dataConnect = getDataConnect(app, connectorConfig);

if (import.meta.env.DEV) {
  if (import.meta.env.VITE_USE_PROD !== 'true') {
    const emulatorHost = window.location.hostname || "127.0.0.1";
    connectAuthEmulator(auth, `http://${emulatorHost}:9099`);
    connectDataConnectEmulator(dataConnect, emulatorHost, 9399);
    console.log(`Conectado a los emuladores de Firebase en ${emulatorHost} (Auth 9099, DataConnect 9399).`);
    
    // Create a visible badge
    const badge = document.createElement('div');
    badge.textContent = 'EMULADOR';
    badge.style.position = 'fixed';
    badge.style.bottom = '10px';
    badge.style.right = '10px';
    badge.style.backgroundColor = '#ef4444';
    badge.style.color = 'white';
    badge.style.padding = '8px 16px';
    badge.style.borderRadius = '8px';
    badge.style.fontWeight = 'bold';
    badge.style.zIndex = '9999';
    badge.style.pointerEvents = 'none';
    badge.style.boxShadow = '0 4px 6px -1px rgb(0 0 0 / 0.1)';
    document.body.appendChild(badge);
  } else {
    console.warn("⚠️ CONECTADO A PRODUCCIÓN DESDE LOCAL ⚠️");
  }
}
