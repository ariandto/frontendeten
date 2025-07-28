import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { onValue, ref, set } from "firebase/database";
import { auth, rtdb } from "../firebase/firebase";
import ChatBox from "../components/ChatBox";
import Presence from "../components/Presence";
import { onAuthStateChanged } from "firebase/auth";

export default function ChatPage() {
  const navigate = useNavigate();
  const [adminOnline, setAdminOnline] = useState(false);
  const [userUid, setUserUid] = useState<string | null>(null);
  const [hasReply, setHasReply] = useState(false);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserUid(user.uid);
      } else {
        navigate("/login");
      }
    });

    return () => unsubAuth();
  }, [navigate]);

  // Cek status online admin
  useEffect(() => {
    const adminRef = ref(rtdb, "presence/admin/state");
    const unsub = onValue(adminRef, (snapshot) => {
      setAdminOnline(snapshot.val() === "online");
    });
    return () => unsub();
  }, []);

  // Cek apakah ada pesan balasan dari Admin dan tandai sebagai sudah dibaca
  useEffect(() => {
    if (!userUid) return;

    const userChatRef = ref(rtdb, `chats/${userUid}`);
    const unsub = onValue(userChatRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) return;

      let foundUnreadReply = false;

      Object.entries(data).forEach(([key, msg]: any) => {
        if (msg.displayName === "Admin" && !msg.read) {
          foundUnreadReply = true;
          set(ref(rtdb, `chats/${userUid}/${key}/read`), true);
        }
      });

      setHasReply(foundUnreadReply);
    });

    return () => unsub();
  }, [userUid]);

  return (
    <div className="pt-20 pb-20 px-4 bg-gradient-to-b from-gray-100 via-gray-50 to-white min-h-screen">
      <Presence />

      <div className="relative max-w-2xl mx-auto bg-white border border-gray-200 shadow-xl rounded-2xl p-6">
        {/* Tombol Close */}
        <button
          onClick={() => navigate("/")}
          className="absolute top-4 right-4 text-sm px-3 py-1 rounded-full bg-gray-800 text-white hover:bg-black transition"
        >
          ✕ Close
        </button>

        {/* Status Admin */}
        <div className="text-sm text-gray-600 text-center mb-4">
          Admin: {" "}
          <span
            className={`font-semibold ${
              adminOnline ? "text-green-600" : "text-red-600"
            }`}
          >
            {adminOnline ? "Online" : "Offline"}
          </span>
        </div>

        {/* Notifikasi */}
        {hasReply && (
          <div className="text-sm text-center mb-4 text-blue-600 font-semibold">
            🔔 Anda mendapat balasan dari Admin!
          </div>
        )}

        {/* Judul */}
        <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">
          💬 Chat dengan Admin
        </h2>

        {/* ChatBox */}
        <ChatBox />
      </div>
    </div>
  );
}
