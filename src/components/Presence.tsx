import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import {
  ref,
  set,
  onDisconnect,
} from "firebase/database";
import { auth, rtdb } from "../firebase/firebase";

export default function Presence() {
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && user.email === import.meta.env.VITE_EMAIL_ADMIN) {
        const statusRef = ref(rtdb, "presence/admin");

        // Tulis status online saat user terautentikasi sebagai admin
        set(statusRef, true);

        // Saat koneksi terputus (tab ditutup atau internet mati), set offline
        onDisconnect(statusRef).set(false);
      }
    });

    return () => unsubscribe();
  }, []);

  return null;
}
