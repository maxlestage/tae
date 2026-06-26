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
  /** Famille de couleur dominante de la boîte */
  family: ColorFamily;
  /** Dégradé aux vraies couleurs de la boîte : [teinte dominante, bande d'accent] */
  colors: [string, string];
  /** Couleur du texte lisible sur le dégradé */
  ink: string;
  caffeine: "Théiné" | "Sans théine";
}

/**
 * Sachets de thé Lipton, colorés selon les VRAIES couleurs des boîtes, par gamme :
 *  - Thés noirs  → boîte jaune Lipton officiel (#FFE105) + bande d'accent du parfum
 *                  (rouge logo #E20025, bleu bergamote, ambre, etc.)
 *  - Thés verts  → boîtes vertes
 *  - Infusions   → couleur du fruit / de la plante
 * Réf. palette de marque : jaune #FFE105, rouge #E20025.
 */
export const TEAS: TeaSachet[] = [
  // === Jaune — gamme thé noir (boîte jaune Lipton + accent parfum) ===
  {
    id: "yellow-label",
    name: "Yellow Label",
    type: "Thé noir",
    description: "Le thé noir emblématique de Lipton, boîte jaune et logo rouge.",
    family: "Jaune",
    colors: ["#ffe105", "#e20025"],
    ink: "#4a1206",
    caffeine: "Théiné",
  },
  {
    id: "english-breakfast",
    name: "English Breakfast",
    type: "Thé noir",
    description: "Mélange corsé et malté, parfait au réveil.",
    family: "Jaune",
    colors: ["#ffe105", "#c8102e"],
    ink: "#4a1206",
    caffeine: "Théiné",
  },
  {
    id: "intense",
    name: "Lipton Intense",
    type: "Thé noir",
    description: "Thé noir robuste et puissant en goût.",
    family: "Jaune",
    colors: ["#ffe105", "#9c1006"],
    ink: "#4a1206",
    caffeine: "Théiné",
  },
  {
    id: "lemon",
    name: "Citron",
    type: "Thé noir aromatisé",
    description: "Thé noir vif relevé d'une note de citron.",
    family: "Jaune",
    colors: ["#ffe105", "#f5a623"],
    ink: "#4a2a00",
    caffeine: "Théiné",
  },
  {
    id: "earl-grey",
    name: "Earl Grey",
    type: "Thé noir aromatisé",
    description: "Thé noir à la bergamote, boîte jaune et bande bleue.",
    family: "Jaune",
    colors: ["#ffe105", "#1d3c66"],
    ink: "#3a2a00",
    caffeine: "Théiné",
  },
  {
    id: "earl-grey-intense",
    name: "Earl Grey Intense",
    type: "Thé noir aromatisé",
    description: "Earl Grey corsé, bergamote plus prononcée.",
    family: "Jaune",
    colors: ["#ffe105", "#16304f"],
    ink: "#3a2a00",
    caffeine: "Théiné",
  },
  {
    id: "honey",
    name: "Thé au Miel",
    type: "Thé noir aromatisé",
    description: "Thé noir adouci par une note de miel doré.",
    family: "Jaune",
    colors: ["#ffe105", "#e0900a"],
    ink: "#4a2a00",
    caffeine: "Théiné",
  },
  {
    id: "caramel",
    name: "Caramel",
    type: "Thé noir aromatisé",
    description: "Thé noir gourmand aux notes de caramel.",
    family: "Jaune",
    colors: ["#ffe105", "#8f4e16"],
    ink: "#4a2400",
    caffeine: "Théiné",
  },
  {
    id: "chai",
    name: "Chaï Épices",
    type: "Thé noir épicé",
    description: "Thé noir, cannelle, cardamome et gingembre.",
    family: "Jaune",
    colors: ["#ffe105", "#b5611f"],
    ink: "#4a2400",
    caffeine: "Théiné",
  },

  // === Ambre — infusions chaudes / dorées ===
  {
    id: "chamomile",
    name: "Camomille",
    type: "Infusion",
    description: "Fleurs de camomille douces, sans théine, pour le soir.",
    family: "Ambre",
    colors: ["#f3d04a", "#d99a1e"],
    ink: "#4a3500",
    caffeine: "Sans théine",
  },
  {
    id: "rooibos",
    name: "Rooibos Vanille",
    type: "Rooibos",
    description: "Rooibos d'Afrique du Sud et vanille douce, sans théine.",
    family: "Ambre",
    colors: ["#d9673a", "#9a2f16"],
    ink: "#fff1e6",
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

  // === Rouge — infusions fruits rouges ===
  {
    id: "red-fruits",
    name: "Fruits Rouges",
    type: "Infusion fruitée",
    description: "Hibiscus, cassis et framboise pour une infusion gourmande.",
    family: "Rouge",
    colors: ["#d81b3f", "#8e0e2a"],
    ink: "#fff0f3",
    caffeine: "Sans théine",
  },
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

  // === Rose — infusions fruitées roses ===
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

  // === Violet — infusions fruits noirs / fleurs ===
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

  // === Bleu — infusion fleur de bleuet ===
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

  // === Vert — gamme thé vert + infusions vertes ===
  {
    id: "green-tea",
    name: "Thé Vert Nature",
    type: "Thé vert",
    description: "Thé vert pur, léger et rafraîchissant, boîte verte.",
    family: "Vert",
    colors: ["#7cc243", "#1b5e20"],
    ink: "#0d2e12",
    caffeine: "Théiné",
  },
  {
    id: "green-mint",
    name: "Thé Vert Menthe",
    type: "Thé vert aromatisé",
    description: "Thé vert et menthe fraîche, vivifiant.",
    family: "Vert",
    colors: ["#86d35a", "#178a4c"],
    ink: "#0d2e1b",
    caffeine: "Théiné",
  },
  {
    id: "jasmine",
    name: "Thé Vert Jasmin",
    type: "Thé vert aromatisé",
    description: "Thé vert parfumé aux fleurs de jasmin.",
    family: "Vert",
    colors: ["#b6dd8a", "#4f9a3a"],
    ink: "#11320f",
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
    id: "white-tea",
    name: "Thé Blanc",
    type: "Thé blanc",
    description: "Thé blanc délicat, boîte claire et nacrée.",
    family: "Vert",
    colors: ["#e3ead0", "#9bb37a"],
    ink: "#2c3a1c",
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
  {
    id: "verbena",
    name: "Verveine",
    type: "Infusion",
    description: "Verveine citronnée, légère et apaisante.",
    family: "Vert",
    colors: ["#bcd860", "#6f9a23"],
    ink: "#27330a",
    caffeine: "Sans théine",
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
