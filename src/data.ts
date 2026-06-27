export type ColorFamily =
  | "Jaune"
  | "Rouge"
  | "Vert"
  | "Bleu"
  | "Violet"
  | "Ambre"
  | "Rose";

export type Lang = "fr" | "en" | "es";

/** Chaîne traduite dans les trois langues. */
export type Localized = Record<Lang, string>;

export type TypeKey =
  | "blackTea"
  | "blackTeaFlavored"
  | "blackTeaSpiced"
  | "greenTea"
  | "greenTeaFlavored"
  | "whiteTea"
  | "rooibos"
  | "infusion"
  | "infusionFruity";

export interface TeaSachet {
  id: string;
  name: Localized;
  description: Localized;
  typeKey: TypeKey;
  /** Famille de couleur dominante de la boîte */
  family: ColorFamily;
  /** Dégradé aux vraies couleurs de la boîte : [teinte dominante, bande d'accent] */
  colors: [string, string];
  /** Couleur du texte lisible sur le dégradé */
  ink: string;
  caffeineFree: boolean;
}

/**
 * Gamme Lipton vendue en France (réf. lipton.fr + revendeurs FR).
 * Colorés selon les vraies couleurs des boîtes, par gamme :
 *  - Thés noirs  → boîte jaune Lipton officiel (#FFE105) + bande d'accent du parfum
 *  - Thés verts  → boîtes vertes
 *  - Infusions   → couleur du fruit / de la plante
 * Réf. palette de marque : jaune #FFE105, rouge #E20025.
 */
export const TEAS: TeaSachet[] = [
  // === Jaune — thés noirs (boîte jaune Lipton + accent parfum) ===
  {
    id: "yellow-label",
    name: { fr: "Yellow Label", en: "Yellow Label", es: "Yellow Label" },
    description: {
      fr: "Le thé noir emblématique de Lipton, boîte jaune et logo rouge.",
      en: "Lipton's iconic black tea, yellow box and red logo.",
      es: "El té negro icónico de Lipton, caja amarilla y logo rojo.",
    },
    typeKey: "blackTea",
    family: "Jaune",
    colors: ["#ffe105", "#e20025"],
    ink: "#4a1206",
    caffeineFree: false,
  },
  {
    id: "english-breakfast",
    name: { fr: "English Breakfast", en: "English Breakfast", es: "English Breakfast" },
    description: {
      fr: "Mélange corsé et malté, parfait au réveil.",
      en: "Bold, malty blend, perfect to wake up.",
      es: "Mezcla intensa y maltosa, perfecta para despertar.",
    },
    typeKey: "blackTea",
    family: "Jaune",
    colors: ["#ffe105", "#c8102e"],
    ink: "#4a1206",
    caffeineFree: false,
  },
  {
    id: "earl-grey",
    name: { fr: "Earl Grey", en: "Earl Grey", es: "Earl Grey" },
    description: {
      fr: "Thé noir à la bergamote, boîte jaune et bande bleue.",
      en: "Bergamot black tea, yellow box and blue band.",
      es: "Té negro a la bergamota, caja amarilla y banda azul.",
    },
    typeKey: "blackTeaFlavored",
    family: "Jaune",
    colors: ["#ffe105", "#1d3c66"],
    ink: "#3a2a00",
    caffeineFree: false,
  },
  {
    id: "russian-earl-grey",
    name: { fr: "Earl Grey Russe", en: "Russian Earl Grey", es: "Earl Grey Ruso" },
    description: {
      fr: "Earl Grey intense aux agrumes, style russe.",
      en: "Bold citrus Earl Grey, Russian style.",
      es: "Earl Grey intenso a cítricos, estilo ruso.",
    },
    typeKey: "blackTeaFlavored",
    family: "Jaune",
    colors: ["#ffe105", "#16304f"],
    ink: "#3a2a00",
    caffeineFree: false,
  },
  {
    id: "darjeeling",
    name: { fr: "Darjeeling", en: "Darjeeling", es: "Darjeeling" },
    description: {
      fr: "Thé noir Darjeeling, fin et délicat.",
      en: "Darjeeling black tea, fine and delicate.",
      es: "Té negro Darjeeling, fino y delicado.",
    },
    typeKey: "blackTea",
    family: "Jaune",
    colors: ["#ffe105", "#b5611f"],
    ink: "#4a2400",
    caffeineFree: false,
  },
  {
    id: "lemon-black",
    name: { fr: "Citron", en: "Lemon", es: "Limón" },
    description: {
      fr: "Thé noir vif relevé d'une note de citron.",
      en: "Lively black tea with a hint of lemon.",
      es: "Té negro vivo con un toque de limón.",
    },
    typeKey: "blackTeaFlavored",
    family: "Jaune",
    colors: ["#ffe105", "#f5a623"],
    ink: "#4a2a00",
    caffeineFree: false,
  },
  {
    id: "red-fruits-black",
    name: { fr: "Fruits Rouges", en: "Red Fruits", es: "Frutos Rojos" },
    description: {
      fr: "Thé noir et fruits rouges gourmands.",
      en: "Black tea and indulgent red fruits.",
      es: "Té negro y golosos frutos rojos.",
    },
    typeKey: "blackTeaFlavored",
    family: "Jaune",
    colors: ["#ffe105", "#c8102e"],
    ink: "#4a1206",
    caffeineFree: false,
  },
  {
    id: "forest-fruits-black",
    name: { fr: "Fruits des Bois", en: "Forest Fruits", es: "Frutos del Bosque" },
    description: {
      fr: "Thé noir, myrtille et mûre des bois.",
      en: "Black tea, wild blueberry and blackberry.",
      es: "Té negro, arándano y mora silvestres.",
    },
    typeKey: "blackTeaFlavored",
    family: "Jaune",
    colors: ["#ffe105", "#7b2d8e"],
    ink: "#4a1206",
    caffeineFree: false,
  },
  {
    id: "strawberry-black",
    name: { fr: "Fraise", en: "Strawberry", es: "Fresa" },
    description: {
      fr: "Thé noir et fraise douce et sucrée.",
      en: "Black tea and sweet strawberry.",
      es: "Té negro y fresa dulce.",
    },
    typeKey: "blackTeaFlavored",
    family: "Jaune",
    colors: ["#ffe105", "#d23a5a"],
    ink: "#4a1206",
    caffeineFree: false,
  },
  {
    id: "blackcurrant-black",
    name: { fr: "Cassis", en: "Blackcurrant", es: "Grosella Negra" },
    description: {
      fr: "Thé noir et cassis intense et acidulé.",
      en: "Black tea and intense, tangy blackcurrant.",
      es: "Té negro y grosella negra intensa y ácida.",
    },
    typeKey: "blackTeaFlavored",
    family: "Jaune",
    colors: ["#ffe105", "#5e2a84"],
    ink: "#4a1206",
    caffeineFree: false,
  },
  {
    id: "vanilla-black",
    name: { fr: "Vanille", en: "Vanilla", es: "Vainilla" },
    description: {
      fr: "Thé noir et vanille douce et crémeuse.",
      en: "Black tea with sweet, creamy vanilla.",
      es: "Té negro con vainilla dulce y cremosa.",
    },
    typeKey: "blackTeaFlavored",
    family: "Jaune",
    colors: ["#ffe105", "#caa06a"],
    ink: "#4a2a00",
    caffeineFree: false,
  },

  // === Ambre — infusions ===
  {
    id: "rooibos",
    name: { fr: "Rooibos", en: "Rooibos", es: "Rooibos" },
    description: {
      fr: "Rooibos d'Afrique du Sud, doux et sans théine.",
      en: "South African rooibos, smooth and caffeine-free.",
      es: "Rooibos de Sudáfrica, suave y sin teína.",
    },
    typeKey: "rooibos",
    family: "Ambre",
    colors: ["#d9673a", "#9a2f16"],
    ink: "#fff1e6",
    caffeineFree: true,
  },
  {
    id: "chamomile",
    name: { fr: "Camomille", en: "Chamomile", es: "Manzanilla" },
    description: {
      fr: "Fleurs de camomille douces, sans théine, pour le soir.",
      en: "Gentle chamomile flowers, caffeine-free, for the evening.",
      es: "Flores de manzanilla suaves, sin teína, para la noche.",
    },
    typeKey: "infusion",
    family: "Ambre",
    colors: ["#f3d04a", "#d99a1e"],
    ink: "#4a3500",
    caffeineFree: true,
  },

  // === Vert — gamme thé vert + infusions menthe ===
  {
    id: "green-tea",
    name: { fr: "Thé Vert Nature", en: "Green Tea", es: "Té Verde" },
    description: {
      fr: "Thé vert pur, léger et rafraîchissant.",
      en: "Pure green tea, light and refreshing.",
      es: "Té verde puro, ligero y refrescante.",
    },
    typeKey: "greenTea",
    family: "Vert",
    colors: ["#7cc243", "#1b5e20"],
    ink: "#0d2e12",
    caffeineFree: false,
  },
  {
    id: "green-mint",
    name: { fr: "Thé Vert Menthe", en: "Green Tea Mint", es: "Té Verde Menta" },
    description: {
      fr: "Thé vert et menthe fraîche, vivifiant.",
      en: "Green tea and fresh mint, invigorating.",
      es: "Té verde y menta fresca, vigorizante.",
    },
    typeKey: "greenTeaFlavored",
    family: "Vert",
    colors: ["#86d35a", "#178a4c"],
    ink: "#0d2e1b",
    caffeineFree: false,
  },
  {
    id: "green-orient",
    name: { fr: "Thé Vert Orient", en: "Green Tea Orient", es: "Té Verde Oriente" },
    description: {
      fr: "Thé vert parfumé, notes de jasmin et de fleurs.",
      en: "Fragrant green tea, jasmine and flowers.",
      es: "Té verde perfumado, jazmín y flores.",
    },
    typeKey: "greenTeaFlavored",
    family: "Vert",
    colors: ["#9ad36a", "#3f8a3a"],
    ink: "#0d2e1b",
    caffeineFree: false,
  },
  {
    id: "green-citrus",
    name: { fr: "Thé Vert Agrumes", en: "Green Tea Citrus", es: "Té Verde Cítricos" },
    description: {
      fr: "Thé vert, citron, citron vert et pamplemousse.",
      en: "Green tea, lemon, lime and grapefruit.",
      es: "Té verde, limón, lima y pomelo.",
    },
    typeKey: "greenTeaFlavored",
    family: "Vert",
    colors: ["#a8d44f", "#5a9a2e"],
    ink: "#13280c",
    caffeineFree: false,
  },
  {
    id: "green-lemon",
    name: { fr: "Thé Vert Citron", en: "Green Tea Lemon", es: "Té Verde Limón" },
    description: {
      fr: "Thé vert et citron, frais et léger.",
      en: "Green tea and lemon, fresh and light.",
      es: "Té verde y limón, fresco y ligero.",
    },
    typeKey: "greenTeaFlavored",
    family: "Vert",
    colors: ["#b6d44a", "#6f9a2e"],
    ink: "#13280c",
    caffeineFree: false,
  },
  {
    id: "sencha",
    name: { fr: "Sencha", en: "Sencha", es: "Sencha" },
    description: {
      fr: "Sencha japonais, frais et herbacé.",
      en: "Japanese sencha, fresh and grassy.",
      es: "Sencha japonés, fresco y herbáceo.",
    },
    typeKey: "greenTea",
    family: "Vert",
    colors: ["#8fce5a", "#2f7d3a"],
    ink: "#0d2812",
    caffeineFree: false,
  },
  {
    id: "green-mint-intense",
    name: { fr: "Menthe Intense", en: "Intense Mint Green Tea", es: "Menta Intensa" },
    description: {
      fr: "Thé vert et menthe intense, très rafraîchissant.",
      en: "Green tea and intense mint, very refreshing.",
      es: "Té verde y menta intensa, muy refrescante.",
    },
    typeKey: "greenTeaFlavored",
    family: "Vert",
    colors: ["#6cc85a", "#1f8a4c"],
    ink: "#0d2e1b",
    caffeineFree: false,
  },
  {
    id: "peppermint",
    name: { fr: "Menthe Poivrée", en: "Peppermint", es: "Menta Piperita" },
    description: {
      fr: "Pure menthe poivrée, sans théine, digestion légère.",
      en: "Pure peppermint, caffeine-free, light digestion.",
      es: "Menta piperita pura, sin teína, digestión ligera.",
    },
    typeKey: "infusion",
    family: "Vert",
    colors: ["#56c596", "#1b8a5a"],
    ink: "#06291c",
    caffeineFree: true,
  },
  {
    id: "spearmint-soft",
    name: { fr: "Menthe Douce", en: "Spearmint", es: "Hierbabuena" },
    description: {
      fr: "Menthe douce, infusion fraîche et légère.",
      en: "Spearmint, a fresh, light infusion.",
      es: "Hierbabuena, infusión fresca y ligera.",
    },
    typeKey: "infusion",
    family: "Vert",
    colors: ["#6cc89a", "#1f8a5a"],
    ink: "#06291c",
    caffeineFree: true,
  },
];

export const FAMILY_ORDER: ColorFamily[] = [
  "Jaune",
  "Ambre",
  "Rouge",
  "Rose",
  "Violet",
  "Bleu",
  "Vert",
];

export const FAMILY_SWATCH: Record<ColorFamily, string> = {
  Jaune: "#ffe105",
  Ambre: "#d98032",
  Rouge: "#d81b3f",
  Rose: "#e06b97",
  Violet: "#7b2d8e",
  Bleu: "#3a6ea5",
  Vert: "#2e9e4f",
};
