import { auth, provider, rtdb } from "../firebase/firebase";
import { signInWithPopup } from "firebase/auth";
import { ref, set, onDisconnect } from "firebase/database";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

export default function LoginPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user && user.email === import.meta.env.VITE_EMAIL_ADMIN) {
        const presenceRef = ref(rtdb, "presence/admin");
        await set(presenceRef, { state: "online" });
        onDisconnect(presenceRef).set({ state: "offline" });
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      if (!user) throw new Error("User tidak ditemukan");

      const idToken = await user.getIdToken();

      // Kirim token ke backend untuk dibuatkan session cookie
      const res = await fetch("http://localhost:5700/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // <- penting agar cookie tersimpan
        body: JSON.stringify({ idToken }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Login gagal");
      }

      const data = await res.json();
      console.log("✅ Login berhasil:", data);

      // Navigasi ke dashboard
      navigate("/");
    } catch (error: any) {
      alert("Gagal login: " + error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-sm">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Login</h2>
        <button
          onClick={handleLogin}
          className="w-full bg-gray-800 text-white py-2 rounded-lg hover:bg-black transition"
        >
          Login dengan Google
        </button>
      </div>
    </div>
  );
}
