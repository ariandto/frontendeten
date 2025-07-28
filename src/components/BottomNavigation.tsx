import { useNavigate } from "react-router-dom";

export default function BottomNavigation() {
  const navigate = useNavigate();

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-inner px-4 py-2 flex justify-end items-center">
      <button
        onClick={() => navigate("/chat")}
        className="bg-gray-800 text-white text-sm px-4 py-2 rounded-full hover:bg-black transition"
      >
        Chat Admin
      </button>
    </footer>
  );
}
