import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import { registerSW } from 'virtual:pwa-register';

// ✅ Daftarkan service worker
const updateSW = registerSW({
  onNeedRefresh() {
    if (confirm("Versi baru aplikasi tersedia. Muat ulang sekarang?")) {
      updateSW(true);
    }
  },
  onOfflineReady() {
    console.log("Aplikasi siap digunakan secara offline 🚀");
  },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
