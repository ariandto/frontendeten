import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { auth, rtdb, provider } from "../../firebase/firebase";
import { signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { onValue, ref } from "firebase/database";
import { MessageCircle } from "lucide-react";
import BASE from "../../api/base";

const ADMIN_EMAIL = import.meta.env.VITE_EMAIL_ADMIN;

export default function TopNavigation() {
  const [user, setUser] = useState<any>(null);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [hasVisitorReply, setHasVisitorReply] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsub();
  }, []);

  // 🔔 Admin: Hitung pesan masuk
  useEffect(() => {
    if (user?.email === ADMIN_EMAIL) {
      const chatRef = ref(rtdb, "chats");

      const unsub = onValue(chatRef, (snapshot) => {
        const data = snapshot.val();
        if (!data) return setUnreadCount(0);

        const params = new URLSearchParams(location.search);
        const selectedUid = params.get("uid");

        let count = 0;
        Object.entries(data).forEach(([uid, chat]: any) => {
          if (uid === selectedUid) return;

          Object.values(chat).forEach((msg: any) => {
            if (msg.displayName !== "Admin") {
              count++;
            }
          });
        });

        setUnreadCount(count);
      });

      return () => unsub();
    }
  }, [user, location]);

  // 🔔 Pengunjung
  useEffect(() => {
    if (user && user.email !== ADMIN_EMAIL) {
      const chatRef = ref(rtdb, `chats/${user.uid}`);
      const unsub = onValue(chatRef, (snapshot) => {
        const data = snapshot.val();
        if (!data) {
          setHasVisitorReply(false);
          return;
        }

        const messages = Object.values(data) as any[];
        const adminReplyExists = messages.some((msg) => msg.displayName === "Admin");
        setHasVisitorReply(adminReplyExists);
      });

      return () => unsub();
    }
  }, [user]);

 const handleLogin = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    if (!user) throw new Error("User tidak ditemukan");

    const idToken = await user.getIdToken(true); // ✅ Ambil ID Token

    // ✅ Kirim ke backend agar dapat session cookie
    const res = await fetch(`${BASE}/api/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // WAJIB agar cookie tersimpan
      body: JSON.stringify({ idToken }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Login gagal");
    }
    navigate("/home");
    console.log("✅ Login sukses");

    // refresh halaman atau arahkan ke home
    window.location.reload(); // agar auth re-checked di frontend
  } catch (error: any) {
    console.error("❌ Login error:", error);
    alert("Gagal login: " + error.message);
  }
};


  const handleLogout = async () => {
  try {
    // 1. Hapus sesi di Firebase Auth
    await signOut(auth);

    // 2. Hapus session cookie di backend
    await fetch(`${BASE}/api/logout`, {
      method: "POST",
      credentials: "include", // wajib agar bisa kirim cookie ke backend
    });

    // 3. Redirect ke form login atau reload
    navigate("/login"); // atau navigate("/login") jika pakai react-router
  } catch (error) {
    console.error("❌ Logout error:", error);
    alert("Gagal logout");
  }
};


  return (
    <nav className="w-full fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 px-6 py-2 flex justify-between items-center">
      <Link to="/home" className="flex items-center gap-3 group">
        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center transition-transform duration-300 group-hover:scale-105 group-hover:shadow-md">
          <span className="text-2xl font-bold text-black">eten.</span>
        </div>
        <span className="text-xl font-bold text-gray-800 hidden sm:inline">Eten Sports Wear</span>
      </Link>

      <div className="flex items-center gap-6 text-sm sm:text-base text-gray-700 font-medium">
        <Link to="/about" className="hover:text-black transition">About</Link>
        

        {/* ✅ Admin */}
        {user?.email === ADMIN_EMAIL && (
          <>
            {/* <Link
              to="/manage-product"
              className={`hover:text-black transition ${location.pathname === "/products" ? "font-bold" : ""}`}
            >
              Manage
            </Link> */}
            <Link
              to="/admin"
              className={`relative hover:text-black transition ${location.pathname === "/admin" ? "font-bold" : ""}`}
              title="Admin Panel"
            >
              <MessageCircle className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                  {unreadCount}
                </span>
              )}
            </Link>
          </>
        )}

        {/* 🔔 Pengunjung */}
        {user && user.email !== ADMIN_EMAIL && (
          <Link
            to="/chat"
            className={`relative hover:text-black transition ${location.pathname === "/chat" ? "font-bold" : ""}`}
            title="Chat Admin"
          >
            <MessageCircle className="w-5 h-5" />
            {hasVisitorReply && (
              <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-full animate-ping">
                !
              </span>
            )}
          </Link>
        )}

        {/* Login/Logout */}
        {user ? (
          <button
            onClick={handleLogout}
            className="text-white bg-gray-800 hover:bg-black px-4 py-1.5 rounded transition"
          >
            Logout
          </button>
        ) : (
          <button
            onClick={handleLogin}
            className="text-white bg-gray-800 hover:bg-black px-4 py-1.5 rounded transition"
          >
            Login
          </button>
        )}
      </div>
    </nav>
  );
}
