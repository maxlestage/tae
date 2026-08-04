import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App.tsx";
import { isTauri } from "./platform.ts";
import "./styles.css";

const root = document.getElementById("root");
if (!root) throw new Error("Élément #root introuvable");

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// PWA : enregistre le service worker (hors-ligne + installable).
// Inutile dans l'app native Tauri : les assets sont déjà dans le bundle et il
// n'y a pas de serveur à mettre en cache.
if (!isTauri() && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {
      /* ignoré */
    });
  });
}
