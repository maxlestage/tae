export type ColorFamily =
  | "Jaune"
  | "Rouge"
  | "Vert"
  | "Bleu"
  | "Violet"
  | "Ambre"
  | "Rose";

export interface TeaSachet {
  id: string;
  name: string;
  type: string;
  description: string;
  /** Famille de couleur dominante (boîte ou infusion) */
  family: ColorFamily;
  /** Couleurs de la fiche : dégradé aux couleurs du thé / de sa boîte */
  colors: [string, string];
  /** Couleur du texte lisible sur le dégradé */
  ink: string;
  caffeine: "Théiné" | "Sans théine";
}

/**
 * Sachets de thé Lipton, chaque fiche prend les couleurs
 * caractéristiques du thé ou de sa boîte.
 */
export const TEAS: TeaSachet[] = [
  // --- Jaune ---
  {
    id: "yellow-label",
    name: "Yellow Label",
    type: "Thé noir",
    description: "Le thé noir emblématique de Lipton, étiquette jaune.",
    family: "Jaune",
    colors: ["#ffd200", "#f7a600"],
    ink: "#5a3b00",
    caffeine: "Théiné",
  },
  {
    id: "lemon",
    name: "Citron",
    type: "Thé noir aromatisé",
    description: "Thé noir vif relevé d'une note de citron.",
    family: "Jaune",
    colors: ["#ffe14d", "#ffb300"],
    ink: "#5a4500",
    caffeine: "Théiné",
  },
  {
    id: "chamomile",
    name: "Camomille",
    type: "Infusion",
    description: "Fleurs de camomille douces, sans théine, pour le soir.",
    family: "Jaune",
    colors: ["#f9e27a", "#e8c64a"],
    ink: "#5a4a12",
    caffeine: "Sans théine",
  },

  // --- Rouge ---
  {
    id: "english-breakfast",
    name: "English Breakfast",
    type: "Thé noir",
    description: "Mélange corsé et malté, parfait au réveil.",
    family: "Rouge",
    colors: ["#c8102e", "#7a0a1c"],
    ink: "#fff0f0",
    caffeine: "Théiné",
  },
  {
    id: "intense",
    name: "Lipton Intense",
    type: "Thé noir",
    description: "Thé noir robuste et puissant en goût.",
    family: "Rouge",
    colors: ["#e63329", "#9c1006"],
    ink: "#fff2f0",
    caffeine: "Théiné",
  },
  {
    id: "red-fruits",
    name: "Fruits Rouges",
    type: "Infusion fruitée",
    description: "Hibiscus, cassis et framboise pour une infusion gourmande.",
    family: "Rouge",
    colors: ["#d81b3f", "#8e0e44"],
    ink: "#fff0f4",
    caffeine: "Sans théine",
  },

  // --- Vert ---
  {
    id: "green-tea",
    name: "Thé Vert Nature",
    type: "Thé vert",
    description: "Thé vert pur, léger et rafraîchissant.",
    family: "Vert",
    colors: ["#7bc043", "#2e7d32"],
    ink: "#0f2e12",
    caffeine: "Théiné",
  },
  {
    id: "green-mint",
    name: "Thé Vert Menthe",
    type: "Thé vert aromatisé",
    description: "Thé vert et menthe fraîche, vivifiant.",
    family: "Vert",
    colors: ["#9ad34f", "#1f8a4c"],
    ink: "#0d2e1b",
    caffeine: "Théiné",
  },
  {
    id: "peppermint",
    name: "Menthe Poivrée",
    type: "Infusion",
    description: "Pure menthe poivrée, sans théine, digestion légère.",
    family: "Vert",
    colors: ["#56c596", "#1b8a5a"],
    ink: "#06291c",
    caffeine: "Sans théine",
  },

  // --- Bleu ---
  {
    id: "earl-grey",
    name: "Earl Grey",
    type: "Thé noir aromatisé",
    description: "Thé noir parfumé à la bergamote, élégant et frais.",
    family: "Bleu",
    colors: ["#3a6ea5", "#1d3c66"],
    ink: "#eaf2ff",
    caffeine: "Théiné",
  },
  {
    id: "white-tea",
    name: "Thé Blanc",
    type: "Thé blanc",
    description: "Thé blanc délicat, subtil et peu théiné.",
    family: "Bleu",
    colors: ["#7fa8d0", "#3f6da0"],
    ink: "#0c2238",
    caffeine: "Théiné",
  },

  // --- Violet ---
  {
    id: "forest-fruits",
    name: "Fruits des Bois",
    type: "Infusion fruitée",
    description: "Myrtille et mûre sauvages, infusion ronde et fruitée.",
    family: "Violet",
    colors: ["#7b2d8e", "#3d1452"],
    ink: "#f7eaff",
    caffeine: "Sans théine",
  },
  {
    id: "blackcurrant",
    name: "Cassis",
    type: "Infusion fruitée",
    description: "Cassis intense et acidulé sur fond d'hibiscus.",
    family: "Violet",
    colors: ["#5e2a84", "#2a0f47"],
    ink: "#f3e8ff",
    caffeine: "Sans théine",
  },

  // --- Ambre ---
  {
    id: "rooibos",
    name: "Rooibos Vanille",
    type: "Rooibos",
    description: "Rooibos d'Afrique du Sud et vanille douce, sans théine.",
    family: "Ambre",
    colors: ["#d98032", "#9a4a16"],
    ink: "#fff3e6",
    caffeine: "Sans théine",
  },
  {
    id: "ginger",
    name: "Citron Gingembre",
    type: "Infusion",
    description: "Gingembre piquant et citron, infusion tonique.",
    family: "Ambre",
    colors: ["#e8a13c", "#b86512"],
    ink: "#3d1f00",
    caffeine: "Sans théine",
  },

  // --- Rose ---
  {
    id: "jasmine",
    name: "Thé Vert Jasmin",
    type: "Thé vert aromatisé",
    description: "Thé vert parfumé aux fleurs de jasmin.",
    family: "Rose",
    colors: ["#f4a6c0", "#d65b8a"],
    ink: "#4a0d2a",
    caffeine: "Théiné",
  },
  {
    id: "rose-litchi",
    name: "Rose & Litchi",
    type: "Infusion",
    description: "Rose délicate et litchi sucré, infusion florale.",
    family: "Rose",
    colors: ["#f7b3cc", "#e06b97"],
    ink: "#5a132f",
    caffeine: "Sans théine",
  },

  // --- Jaune (suite) ---
  {
    id: "honey",
    name: "Thé au Miel",
    type: "Thé noir aromatisé",
    description: "Thé noir adouci par une note de miel doré.",
    family: "Jaune",
    colors: ["#ffd24d", "#e09000"],
    ink: "#5a3b00",
    caffeine: "Théiné",
  },
  {
    id: "verbena",
    name: "Verveine",
    type: "Infusion",
    description: "Verveine citronnée, légère et apaisante.",
    family: "Jaune",
    colors: ["#f2e06a", "#cdbb3a"],
    ink: "#4a4410",
    caffeine: "Sans théine",
  },

  // --- Ambre (suite) ---
  {
    id: "caramel",
    name: "Caramel",
    type: "Thé noir aromatisé",
    description: "Thé noir gourmand aux notes de caramel.",
    family: "Ambre",
    colors: ["#d9913f", "#8f4e16"],
    ink: "#3d2200",
    caffeine: "Théiné",
  },
  {
    id: "chai",
    name: "Chaï Épices",
    type: "Thé noir épicé",
    description: "Thé noir, cannelle, cardamome et gingembre.",
    family: "Ambre",
    colors: ["#cf7a3a", "#7e3d12"],
    ink: "#fff0e0",
    caffeine: "Théiné",
  },

  // --- Rouge (suite) ---
  {
    id: "cherry",
    name: "Cerise",
    type: "Infusion fruitée",
    description: "Cerise juteuse sur fond d'hibiscus acidulé.",
    family: "Rouge",
    colors: ["#d62246", "#8a0f2a"],
    ink: "#fff0f3",
    caffeine: "Sans théine",
  },
  {
    id: "rosehip",
    name: "Églantier",
    type: "Infusion",
    description: "Cynorhodon (églantier) doux et légèrement acidulé.",
    family: "Rouge",
    colors: ["#d8324a", "#931024"],
    ink: "#fff0f2",
    caffeine: "Sans théine",
  },

  // --- Rose (suite) ---
  {
    id: "strawberry",
    name: "Fraise",
    type: "Infusion fruitée",
    description: "Fraise sucrée, infusion douce et gourmande.",
    family: "Rose",
    colors: ["#f58aa6", "#d44d74"],
    ink: "#4a0d22",
    caffeine: "Sans théine",
  },
  {
    id: "pink-grapefruit",
    name: "Pamplemousse Rose",
    type: "Infusion",
    description: "Pamplemousse rose vif, à la fois sucré et acidulé.",
    family: "Rose",
    colors: ["#f6957f", "#e0594a"],
    ink: "#4a1208",
    caffeine: "Sans théine",
  },

  // --- Violet (suite) ---
  {
    id: "lavender",
    name: "Lavande",
    type: "Infusion",
    description: "Fleurs de lavande, infusion florale et relaxante.",
    family: "Violet",
    colors: ["#9b7bc4", "#5b3d8a"],
    ink: "#f3ecff",
    caffeine: "Sans théine",
  },
  {
    id: "blueberry",
    name: "Myrtille",
    type: "Infusion fruitée",
    description: "Myrtille intense et veloutée.",
    family: "Violet",
    colors: ["#6a3b9e", "#341259"],
    ink: "#f1e6ff",
    caffeine: "Sans théine",
  },

  // --- Bleu (suite) ---
  {
    id: "cornflower",
    name: "Fleur de Bleuet",
    type: "Infusion",
    description: "Pétales de bleuet, infusion délicate et fleurie.",
    family: "Bleu",
    colors: ["#5b8fd0", "#2b4f86"],
    ink: "#eaf2ff",
    caffeine: "Sans théine",
  },
  {
    id: "earl-grey-intense",
    name: "Earl Grey Intense",
    type: "Thé noir aromatisé",
    description: "Earl Grey corsé, bergamote plus prononcée.",
    family: "Bleu",
    colors: ["#34618f", "#16304f"],
    ink: "#e8f1ff",
    caffeine: "Théiné",
  },

  // --- Vert (suite) ---
  {
    id: "matcha",
    name: "Matcha",
    type: "Thé vert",
    description: "Thé vert matcha, intense et végétal.",
    family: "Vert",
    colors: ["#86c64a", "#3f7d1f"],
    ink: "#10250a",
    caffeine: "Théiné",
  },
  {
    id: "sencha",
    name: "Sencha",
    type: "Thé vert",
    description: "Sencha japonais, frais et herbacé.",
    family: "Vert",
    colors: ["#8fce5a", "#2f7d3a"],
    ink: "#0d2812",
    caffeine: "Théiné",
  },
  {
    id: "green-ginger-lemon",
    name: "Thé Vert Gingembre Citron",
    type: "Thé vert aromatisé",
    description: "Thé vert tonique au gingembre et au citron.",
    family: "Vert",
    colors: ["#a6d44f", "#4f9a2e"],
    ink: "#13280c",
    caffeine: "Théiné",
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
  Jaune: "#ffcc00",
  Ambre: "#d98032",
  Rouge: "#d81b3f",
  Rose: "#e06b97",
  Violet: "#7b2d8e",
  Bleu: "#3a6ea5",
  Vert: "#2e9e4f",
};
