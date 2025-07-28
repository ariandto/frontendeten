import { useEffect, useRef, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, rtdb } from "../firebase/firebase";
import { onChildAdded, push, ref } from "firebase/database";

interface ChatMessage {
  displayName: string;
  text: string;
  timestamp: number;
}

export default function ChatBox() {
  const [user, setUser] = useState<any>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (u) {
        setUser(u);
        const chatRef = ref(rtdb, `chats/${u.uid}`);

        onChildAdded(chatRef, (snapshot) => {
          const data = snapshot.val();
          setMessages((prev) => [...prev, data]);
        });
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!text.trim() || !user) return;

    const message: ChatMessage = {
      displayName: user.displayName || "Pengunjung",
      text,
      timestamp: Date.now(),
    };

    await push(ref(rtdb, `chats/${user.uid}`), message);
    setText("");
  };

  return (
    <div className="space-y-4">
      <div className="h-80 overflow-y-auto bg-gray-50 border border-gray-200 rounded p-3 space-y-2 text-sm">
        {messages.map((msg, idx) => (
          <div key={idx} className="flex flex-col">
            <span className="font-medium text-gray-700">{msg.displayName}</span>
            <span>{msg.text}</span>
          </div>
        ))}
        <div ref={bottomRef}></div>
      </div>

      <div className="flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Ketik pesan..."
          className="flex-1 border rounded px-3 py-2"
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button
          onClick={sendMessage}
          className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-black transition"
        >
          Kirim
        </button>
      </div>
    </div>
  );
}
