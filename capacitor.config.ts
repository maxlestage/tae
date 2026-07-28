import type { CapacitorConfig } from "@capacitor/cli";

/**
 * Configuration de l'app iOS native (Capacitor).
 *
 * Le même build web (dossier `dist/`) alimente le site ET l'app native :
 * Capacitor embarque `dist/` dans une coquille WKWebView. Le catalogue des
 * 78 thés étant inclus dans le bundle JS, l'app fonctionne hors-ligne.
 *
 * Pour compiler l'app (sur un Mac avec Xcode) :
 *   npm install
 *   npm run ios:add     # crée le projet ios/ (une seule fois)
 *   npm run ios:open    # ouvre Xcode → Run / Archive
 * Après chaque changement du code web : `npm run ios:sync`.
 */
const config: CapacitorConfig = {
  appId: "com.maxlestage.liptonteas",
  appName: "Lipton Thés",
  webDir: "dist",
  backgroundColor: "#ffe105",
  ios: {
    // Le contenu ne passe pas sous la barre d'état / l'encoche.
    contentInset: "always",
    backgroundColor: "#ffe105",
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 800,
      launchAutoHide: true,
      backgroundColor: "#ffe105",
      showSpinner: false,
    },
  },
};

export default config;
