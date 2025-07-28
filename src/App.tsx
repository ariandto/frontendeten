import { Routes, Route } from "react-router-dom";
import TopNavigation from "./components/TopNavigation";
import MainNavigation from "./components/MainNavigation";
import BottomNavigation from "./components/BottomNavigation";
import ChatPage from "./pages/ChatPage";
import AdminPanel from "./pages/AdminPanel";
import LoginPage from "./pages/LoginPage";
import { useEffect, useRef } from "react";
import { onValue, ref } from "firebase/database";
import { rtdb } from "./firebase/firebase";

function App() {
  const prevMessageCountRef = useRef(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const chatRef = ref(rtdb, "chats");

    const unsub = onValue(chatRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) return;

      // Hitung total semua pesan dari semua user
      const totalMessages = Object.values(data).reduce((acc: number, userChats) => {
        return acc + (typeof userChats === "object" && userChats ? Object.keys(userChats).length : 0);
      }, 0);

      // Jika jumlah pesan meningkat dan bukan pertama kali load, bunyikan notif
      if (
        prevMessageCountRef.current !== 0 &&
        totalMessages > prevMessageCountRef.current
      ) {
        if (audioRef.current) {
          audioRef.current.play().catch(() => {
            console.warn("🔇 Gagal memutar notifikasi. Izin audio mungkin diblokir.");
          });
        }
        document.title = "📨 Pesan Baru Masuk!";
        setTimeout(() => {
          document.title = "Lacak Pengiriman Azko";
        }, 3000);
      }

      prevMessageCountRef.current = totalMessages;
    });

    return () => unsub();
  }, []);

  return (
    <>
      {/* 🔊 Tag audio untuk notifikasi */}
      <audio ref={audioRef} src="/notif.wav" preload="auto" />

      <TopNavigation />
      <Routes>
        <Route path="/" element={<MainNavigation />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
      <BottomNavigation />
    </>
  );
}

export default App;
