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
 * Sachets de thé Lipton, colorés selon les VRAIES couleurs des boîtes, par gamme :
 *  - Thés noirs  → boîte jaune Lipton officiel (#FFE105) + bande d'accent du parfum
 *  - Thés verts  → boîtes vertes
 *  - Infusions   → couleur du fruit / de la plante
 * Réf. palette de marque : jaune #FFE105, rouge #E20025.
 */
export const TEAS: TeaSachet[] = [
  // === Jaune — gamme thé noir (boîte jaune Lipton + accent parfum) ===
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
    id: "intense",
    name: { fr: "Lipton Intense", en: "Lipton Intense", es: "Lipton Intense" },
    description: {
      fr: "Thé noir robuste et puissant en goût.",
      en: "Robust black tea, powerful in taste.",
      es: "Té negro robusto y potente en sabor.",
    },
    typeKey: "blackTea",
    family: "Jaune",
    colors: ["#ffe105", "#9c1006"],
    ink: "#4a1206",
    caffeineFree: false,
  },
  {
    id: "lemon",
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
    id: "earl-grey-intense",
    name: { fr: "Earl Grey Intense", en: "Earl Grey Intense", es: "Earl Grey Intenso" },
    description: {
      fr: "Earl Grey corsé, bergamote plus prononcée.",
      en: "Bold Earl Grey, more pronounced bergamot.",
      es: "Earl Grey intenso, bergamota más marcada.",
    },
    typeKey: "blackTeaFlavored",
    family: "Jaune",
    colors: ["#ffe105", "#16304f"],
    ink: "#3a2a00",
    caffeineFree: false,
  },
  {
    id: "honey",
    name: { fr: "Thé au Miel", en: "Honey", es: "Miel" },
    description: {
      fr: "Thé noir adouci par une note de miel doré.",
      en: "Black tea softened with a note of golden honey.",
      es: "Té negro suavizado con una nota de miel dorada.",
    },
    typeKey: "blackTeaFlavored",
    family: "Jaune",
    colors: ["#ffe105", "#e0900a"],
    ink: "#4a2a00",
    caffeineFree: false,
  },
  {
    id: "caramel",
    name: { fr: "Caramel", en: "Caramel", es: "Caramelo" },
    description: {
      fr: "Thé noir gourmand aux notes de caramel.",
      en: "Indulgent black tea with caramel notes.",
      es: "Té negro goloso con notas de caramelo.",
    },
    typeKey: "blackTeaFlavored",
    family: "Jaune",
    colors: ["#ffe105", "#8f4e16"],
    ink: "#4a2400",
    caffeineFree: false,
  },
  {
    id: "chai",
    name: { fr: "Chaï Épices", en: "Chai Spices", es: "Chai Especias" },
    description: {
      fr: "Thé noir, cannelle, cardamome et gingembre.",
      en: "Black tea, cinnamon, cardamom and ginger.",
      es: "Té negro, canela, cardamomo y jengibre.",
    },
    typeKey: "blackTeaSpiced",
    family: "Jaune",
    colors: ["#ffe105", "#b5611f"],
    ink: "#4a2400",
    caffeineFree: false,
  },

  // === Ambre — infusions chaudes / dorées ===
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
  {
    id: "rooibos",
    name: { fr: "Rooibos Vanille", en: "Vanilla Rooibos", es: "Rooibos Vainilla" },
    description: {
      fr: "Rooibos d'Afrique du Sud et vanille douce, sans théine.",
      en: "South African rooibos and sweet vanilla, caffeine-free.",
      es: "Rooibos de Sudáfrica y vainilla dulce, sin teína.",
    },
    typeKey: "rooibos",
    family: "Ambre",
    colors: ["#d9673a", "#9a2f16"],
    ink: "#fff1e6",
    caffeineFree: true,
  },
  {
    id: "ginger",
    name: { fr: "Citron Gingembre", en: "Lemon Ginger", es: "Limón Jengibre" },
    description: {
      fr: "Gingembre piquant et citron, infusion tonique.",
      en: "Spicy ginger and lemon, an invigorating infusion.",
      es: "Jengibre picante y limón, infusión tonificante.",
    },
    typeKey: "infusion",
    family: "Ambre",
    colors: ["#e8a13c", "#b86512"],
    ink: "#3d1f00",
    caffeineFree: true,
  },

  // === Rouge — infusions fruits rouges ===
  {
    id: "red-fruits",
    name: { fr: "Fruits Rouges", en: "Red Fruits", es: "Frutos Rojos" },
    description: {
      fr: "Hibiscus, cassis et framboise pour une infusion gourmande.",
      en: "Hibiscus, blackcurrant and raspberry for a treat.",
      es: "Hibisco, grosella y frambuesa para una infusión golosa.",
    },
    typeKey: "infusionFruity",
    family: "Rouge",
    colors: ["#d81b3f", "#8e0e2a"],
    ink: "#fff0f3",
    caffeineFree: true,
  },
  {
    id: "cherry",
    name: { fr: "Cerise", en: "Cherry", es: "Cereza" },
    description: {
      fr: "Cerise juteuse sur fond d'hibiscus acidulé.",
      en: "Juicy cherry over tangy hibiscus.",
      es: "Cereza jugosa sobre hibisco ácido.",
    },
    typeKey: "infusionFruity",
    family: "Rouge",
    colors: ["#d62246", "#8a0f2a"],
    ink: "#fff0f3",
    caffeineFree: true,
  },
  {
    id: "rosehip",
    name: { fr: "Églantier", en: "Rosehip", es: "Escaramujo" },
    description: {
      fr: "Cynorhodon (églantier) doux et légèrement acidulé.",
      en: "Sweet, slightly tangy rosehip.",
      es: "Escaramujo dulce y ligeramente ácido.",
    },
    typeKey: "infusion",
    family: "Rouge",
    colors: ["#d8324a", "#931024"],
    ink: "#fff0f2",
    caffeineFree: true,
  },

  // === Rose — infusions fruitées roses ===
  {
    id: "strawberry",
    name: { fr: "Fraise", en: "Strawberry", es: "Fresa" },
    description: {
      fr: "Fraise sucrée, infusion douce et gourmande.",
      en: "Sweet strawberry, a soft and indulgent infusion.",
      es: "Fresa dulce, infusión suave y golosa.",
    },
    typeKey: "infusionFruity",
    family: "Rose",
    colors: ["#f58aa6", "#d44d74"],
    ink: "#4a0d22",
    caffeineFree: true,
  },
  {
    id: "pink-grapefruit",
    name: { fr: "Pamplemousse Rose", en: "Pink Grapefruit", es: "Pomelo Rosa" },
    description: {
      fr: "Pamplemousse rose vif, à la fois sucré et acidulé.",
      en: "Bright pink grapefruit, both sweet and tangy.",
      es: "Pomelo rosa vivo, a la vez dulce y ácido.",
    },
    typeKey: "infusion",
    family: "Rose",
    colors: ["#f6957f", "#e0594a"],
    ink: "#4a1208",
    caffeineFree: true,
  },
  {
    id: "rose-litchi",
    name: { fr: "Rose & Litchi", en: "Rose & Lychee", es: "Rosa y Lichi" },
    description: {
      fr: "Rose délicate et litchi sucré, infusion florale.",
      en: "Delicate rose and sweet lychee, a floral infusion.",
      es: "Rosa delicada y lichi dulce, infusión floral.",
    },
    typeKey: "infusion",
    family: "Rose",
    colors: ["#f7b3cc", "#e06b97"],
    ink: "#5a132f",
    caffeineFree: true,
  },

  // === Violet — infusions fruits noirs / fleurs ===
  {
    id: "forest-fruits",
    name: { fr: "Fruits des Bois", en: "Forest Fruits", es: "Frutos del Bosque" },
    description: {
      fr: "Myrtille et mûre sauvages, infusion ronde et fruitée.",
      en: "Wild blueberry and blackberry, round and fruity.",
      es: "Arándano y mora silvestres, infusión redonda y frutal.",
    },
    typeKey: "infusionFruity",
    family: "Violet",
    colors: ["#7b2d8e", "#3d1452"],
    ink: "#f7eaff",
    caffeineFree: true,
  },
  {
    id: "blackcurrant",
    name: { fr: "Cassis", en: "Blackcurrant", es: "Grosella Negra" },
    description: {
      fr: "Cassis intense et acidulé sur fond d'hibiscus.",
      en: "Intense, tangy blackcurrant over hibiscus.",
      es: "Grosella negra intensa y ácida sobre hibisco.",
    },
    typeKey: "infusionFruity",
    family: "Violet",
    colors: ["#5e2a84", "#2a0f47"],
    ink: "#f3e8ff",
    caffeineFree: true,
  },
  {
    id: "lavender",
    name: { fr: "Lavande", en: "Lavender", es: "Lavanda" },
    description: {
      fr: "Fleurs de lavande, infusion florale et relaxante.",
      en: "Lavender flowers, a floral and relaxing infusion.",
      es: "Flores de lavanda, infusión floral y relajante.",
    },
    typeKey: "infusion",
    family: "Violet",
    colors: ["#9b7bc4", "#5b3d8a"],
    ink: "#f3ecff",
    caffeineFree: true,
  },
  {
    id: "blueberry",
    name: { fr: "Myrtille", en: "Blueberry", es: "Arándano" },
    description: {
      fr: "Myrtille intense et veloutée.",
      en: "Intense, velvety blueberry.",
      es: "Arándano intenso y aterciopelado.",
    },
    typeKey: "infusionFruity",
    family: "Violet",
    colors: ["#6a3b9e", "#341259"],
    ink: "#f1e6ff",
    caffeineFree: true,
  },

  // === Bleu — infusion fleur de bleuet ===
  {
    id: "cornflower",
    name: { fr: "Fleur de Bleuet", en: "Cornflower", es: "Aciano" },
    description: {
      fr: "Pétales de bleuet, infusion délicate et fleurie.",
      en: "Cornflower petals, a delicate, flowery infusion.",
      es: "Pétalos de aciano, infusión delicada y florida.",
    },
    typeKey: "infusion",
    family: "Bleu",
    colors: ["#5b8fd0", "#2b4f86"],
    ink: "#eaf2ff",
    caffeineFree: true,
  },

  // === Vert — gamme thé vert + infusions vertes ===
  {
    id: "green-tea",
    name: { fr: "Thé Vert Nature", en: "Pure Green Tea", es: "Té Verde Natural" },
    description: {
      fr: "Thé vert pur, léger et rafraîchissant, boîte verte.",
      en: "Pure green tea, light and refreshing, green box.",
      es: "Té verde puro, ligero y refrescante, caja verde.",
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
    id: "jasmine",
    name: { fr: "Thé Vert Jasmin", en: "Jasmine Green Tea", es: "Té Verde Jazmín" },
    description: {
      fr: "Thé vert parfumé aux fleurs de jasmin.",
      en: "Green tea scented with jasmine flowers.",
      es: "Té verde perfumado con flores de jazmín.",
    },
    typeKey: "greenTeaFlavored",
    family: "Vert",
    colors: ["#b6dd8a", "#4f9a3a"],
    ink: "#11320f",
    caffeineFree: false,
  },
  {
    id: "green-ginger-lemon",
    name: {
      fr: "Thé Vert Gingembre Citron",
      en: "Green Tea Ginger Lemon",
      es: "Té Verde Jengibre Limón",
    },
    description: {
      fr: "Thé vert tonique au gingembre et au citron.",
      en: "Invigorating green tea with ginger and lemon.",
      es: "Té verde tonificante con jengibre y limón.",
    },
    typeKey: "greenTeaFlavored",
    family: "Vert",
    colors: ["#a6d44f", "#4f9a2e"],
    ink: "#13280c",
    caffeineFree: false,
  },
  {
    id: "matcha",
    name: { fr: "Matcha", en: "Matcha", es: "Matcha" },
    description: {
      fr: "Thé vert matcha, intense et végétal.",
      en: "Matcha green tea, intense and vegetal.",
      es: "Té verde matcha, intenso y vegetal.",
    },
    typeKey: "greenTea",
    family: "Vert",
    colors: ["#86c64a", "#3f7d1f"],
    ink: "#10250a",
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
    id: "white-tea",
    name: { fr: "Thé Blanc", en: "White Tea", es: "Té Blanco" },
    description: {
      fr: "Thé blanc délicat, boîte claire et nacrée.",
      en: "Delicate white tea, pale pearly box.",
      es: "Té blanco delicado, caja clara y nacarada.",
    },
    typeKey: "whiteTea",
    family: "Vert",
    colors: ["#e3ead0", "#9bb37a"],
    ink: "#2c3a1c",
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
    id: "verbena",
    name: { fr: "Verveine", en: "Verbena", es: "Verbena" },
    description: {
      fr: "Verveine citronnée, légère et apaisante.",
      en: "Lemon verbena, light and soothing.",
      es: "Verbena con limón, ligera y calmante.",
    },
    typeKey: "infusion",
    family: "Vert",
    colors: ["#bcd860", "#6f9a23"],
    ink: "#27330a",
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
