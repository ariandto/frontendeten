import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import {
  onValue,
  push,
  ref,
  remove,
  set,
  onDisconnect,
} from "firebase/database";
import { auth, rtdb } from "../firebase/firebase";
import { Helmet } from "react-helmet";

interface ChatMessage {
  key: string;
  displayName: string;
  text: string;
  timestamp: number;
}

interface UserChats {
  uid: string;
  messages: ChatMessage[];
}

export default function AdminPanel() {
  const [users, setUsers] = useState<UserChats[]>([]);
  const [selectedUid, setSelectedUid] = useState<string>("");
  const [newMessage, setNewMessage] = useState<string>("");
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
  const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
    const emailAdmin = import.meta.env.VITE_EMAIL_ADMIN;

    if (!user || user.email !== emailAdmin) {
      navigate("/login");
      return;
    }

    const presenceRef = ref(rtdb, "presence/admin/state");
    set(presenceRef, "online");
    onDisconnect(presenceRef).set("offline");
  });

  const chatRef = ref(rtdb, "chats");
  onValue(chatRef, (snapshot) => {
    const data = snapshot.val();
    if (!data) {
      setUsers([]);
      return;
    }

    const parsed: UserChats[] = Object.entries(data).map(
      ([uid, messages]) => ({
        uid,
        messages: Object.entries(messages as Record<string, ChatMessage>)
          .map(([key, value]) => ({ ...value, key }))
          .sort((a, b) => a.timestamp - b.timestamp),
      })
    );

    setUsers(parsed);

    const fromQuery = searchParams.get("uid");
    if (fromQuery) {
      setSelectedUid(fromQuery);
    }
  });

  return () => unsubscribeAuth();
}, [navigate]);


  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [users, selectedUid]);

  const sendMessage = async () => {
    if (!selectedUid || !newMessage.trim()) return;

    const msgRef = ref(rtdb, `chats/${selectedUid}`);
    await push(msgRef, {
      displayName: "Admin",
      text: newMessage.trim(),
      timestamp: Date.now(),
    });

    setNewMessage("");
  };

  const handleDeleteMessage = async (uid: string, messageKey: string) => {
    const confirmDelete = confirm("Yakin ingin menghapus pesan ini?");
    if (!confirmDelete) return;

    const msgRef = ref(rtdb, `chats/${uid}/${messageKey}`);
    await remove(msgRef);
  };

  const handleDeleteAllMessages = async (uid: string) => {
    const confirmDelete = confirm("Hapus semua pesan dari pengunjung ini?");
    if (!confirmDelete) return;

    const userChatRef = ref(rtdb, `chats/${uid}`);
    await remove(userChatRef);
    setSelectedUid("");
  };

  const handleLogout = async () => {
    const presenceRef = ref(rtdb, "presence/admin/state");
    await set(presenceRef, "offline");
    await signOut(auth);
    navigate("/login");
  };

  const selectedUser = users.find((u) => u.uid === selectedUid);
  const getUserLabel = (uid: string, firstMsg?: ChatMessage) =>
    firstMsg?.displayName || `Pengunjung-${uid.slice(0, 6)}`;

  return (
    <div className="pt-20 pb-20 px-4 bg-gray-50 min-h-screen">
      <Helmet>
        <title>Admin Panel - Chat Masuk</title>
      </Helmet>

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Sidebar Pengunjung */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-md p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              👤 Pengunjung
            </h3>
            <div className="flex gap-2">
              <button
                onClick={() => navigate("/")}
                className="text-sm bg-gray-300 text-gray-800 px-3 py-1 rounded hover:bg-gray-400"
                title="Kembali ke halaman utama"
              >
                ✕
              </button>
              <button
                onClick={handleLogout}
                className="text-sm bg-gray-800 text-white px-3 py-1 rounded hover:bg-black"
              >
                📴
              </button>
            </div>
          </div>

          {users.map((u) => (
            <button
              key={u.uid}
              onClick={() => setSelectedUid(u.uid)}
              className={`block w-full text-left px-4 py-2 mb-2 rounded-lg border ${
                selectedUid === u.uid
                  ? "bg-gray-800 text-white"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {getUserLabel(u.uid, u.messages[0])}
            </button>
          ))}
        </div>

        {/* Chatbox */}
        <div className="md:col-span-2 bg-white border border-gray-200 rounded-xl shadow-md p-4">
          <div className="flex justify-between items-center mb-4">
            <div className="flex flex-wrap items-center gap-3">
              <h3 className="text-lg font-semibold text-gray-800">
                Chat dengan:{" "}
                {selectedUid
                  ? getUserLabel(selectedUid, selectedUser?.messages[0])
                  : "(pilih pengunjung)"}
              </h3>
              {selectedUid && (
                <button
                  onClick={() => setSelectedUid("")}
                  className="text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 px-2 py-1 rounded transition"
                  title="Tutup chat"
                >
                  ❌ Tutup
                </button>
              )}
            </div>

            {selectedUid && (
              <button
                onClick={() => handleDeleteAllMessages(selectedUid)}
                className="text-sm px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700"
              >
                🗑️ Hapus Semua
              </button>
            )}
          </div>

          <div className="h-[400px] overflow-y-auto border border-gray-200 rounded p-4 bg-gray-50">
            {selectedUser?.messages.map((msg) => (
              <div key={msg.key} className="mb-4 border-b pb-2 relative">
                <div className="font-semibold text-gray-700">
                  {msg.displayName}
                </div>
                <div className="text-gray-800">{msg.text}</div>
                <div className="text-gray-400 text-xs">
                  {msg.timestamp
                    ? new Date(msg.timestamp).toLocaleString("id-ID", {
                        dateStyle: "short",
                        timeStyle: "short",
                      })
                    : ""}
                </div>
                <button
                  onClick={() => handleDeleteMessage(selectedUid, msg.key)}
                  className="absolute top-0 right-0 text-xs text-red-500 hover:text-red-700"
                >
                  ❌
                </button>
              </div>
            ))}
            <div ref={bottomRef}></div>
          </div>

          {selectedUid && (
            <div className="mt-4 flex gap-2">
              <input
                type="text"
                className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm"
                placeholder="Ketik balasan..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
              />
              <button
                onClick={sendMessage}
                className="bg-gray-800 hover:bg-black text-white px-4 py-2 rounded-lg text-sm"
              >
                Kirim
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
