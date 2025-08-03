import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import BASE_URL from "../api/base";

interface MeResponse {
  uid: string;
  email: string;
  name: string;
  admin: boolean;
}

export default function BottomNavigation() {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await fetch(`${BASE_URL}/me`, {
          credentials: "include", // penting agar cookie dikirim
        });

        if (!res.ok) {
          console.warn("Belum login atau gagal ambil data.");
          return;
        }

        const data: MeResponse = await res.json();
        setIsAdmin(data.admin === true);
      } catch (err) {
        console.error("❌ Gagal ambil data user:", err);
      }
    };

    fetchMe();
  }, []);

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-inner px-4 py-2 flex justify-end items-center">
      {!isAdmin && (
        <button
          onClick={() => navigate("/chat")}
          className="bg-gray-800 text-white text-sm px-4 py-2 rounded-full hover:bg-black transition"
        >
          Chat Admin
        </button>
      )}
    </footer>
  );
}
