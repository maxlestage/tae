/**
 * Détecte si l'app tourne dans la coquille native Tauri (v2) plutôt que dans
 * un navigateur. Tauri injecte `__TAURI_INTERNALS__` sur `window`.
 *
 * Utile car, en natif, le front est servi depuis le bundle : il n'y a ni
 * serveur HTTP ni API locale, donc certaines fonctionnalités web (service
 * worker, liens vers /api/…) n'ont pas de sens.
 */
export function isTauri(): boolean {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}
