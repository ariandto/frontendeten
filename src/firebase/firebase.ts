import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getDatabase } from "firebase/database";

// Konfigurasi dari .env
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_APIKEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTHDOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECTID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE,
  messagingSenderId: import.meta.env.VITE_FIREBASE_SENDERID,
  appId: import.meta.env.VITE_FIREBASE_APPID,
  databaseURL: import.meta.env.VITE_FIREBASE_DBURL,
};

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);

// Instance service yang akan digunakan di seluruh project
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const rtdb = getDatabase(app);
