import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { auth, rtdb, provider } from "../firebase/firebase";
import { signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { onValue, ref } from "firebase/database";
import { MessageCircle } from "lucide-react";

export default function TopNavigation() {
  const [user, setUser] = useState<any>(null);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [hasVisitorReply, setHasVisitorReply] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsub();
  }, []);

  // 🔔 Admin: Hitung jumlah pesan masuk dari pengunjung
  useEffect(() => {
  if (user?.email === "ariandto@gmail.com") {
    const chatRef = ref(rtdb, "chats");

    const unsub = onValue(chatRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) return setUnreadCount(0);

      // Ambil UID dari URL jika sedang di /admin?uid=xxxx
      const params = new URLSearchParams(location.search);
      const selectedUid = params.get("uid");

      let count = 0;
      Object.entries(data).forEach(([uid, chat]: any) => {
        // Skip pesan dari UID yang sedang dibuka
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


  // 🔔 Pengunjung: Deteksi jika ada balasan dari admin
  useEffect(() => {
    if (user && user.email !== "ariandto@gmail.com") {
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
      await signInWithPopup(auth, provider);
    } catch (error) {
      alert("Gagal login");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      alert("Gagal logout");
    }
  };

  return (
    <nav className="w-full fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 px-6 py-2 flex justify-between items-center">
      {/* Logo */}
      <Link to="/" className="flex items-center gap-3 group">
        <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center transition-transform duration-300 group-hover:scale-105 group-hover:shadow-md">
          <span className="text-2xl font-bold text-black">eten.</span>
        </div>
        <span className="text-xl font-bold text-gray-800 hidden sm:inline">Eten Sports Wear</span>
      </Link>

      {/* Menu */}
      <div className="flex items-center gap-6 text-sm sm:text-base text-gray-700 font-medium">
        <Link to="/about" className="hover:text-black transition">About</Link>
        <Link to="/contact" className="hover:text-black transition">Contacts</Link>

        {/* 🔔 Admin Panel Notif */}
        {user?.email === "ariandto@gmail.com" && (
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
        )}

        {/* 🔔 Pengunjung Chat Notif */}
        {user && user.email !== "ariandto@gmail.com" && (
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
