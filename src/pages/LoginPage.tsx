import { auth, provider, rtdb } from "../firebase/firebase";
import { signInWithPopup } from "firebase/auth";
import { ref, set, onDisconnect } from "firebase/database";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

export default function LoginPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        // Jika admin, set presence
        if (user.email === "ariandto@gmail.com") {
          const presenceRef = ref(rtdb, "presence/admin");
          await set(presenceRef, { state: "online" });
          onDisconnect(presenceRef).set({ state: "offline" });
        }

        navigate("/");
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      alert("Gagal login: " + error);
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
