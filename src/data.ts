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
 * Gamme Lipton vendue aux États-Unis (réf. lipton.com/us + revendeurs US).
 * Colorés selon les vraies couleurs des boîtes, par gamme :
 *  - Thés noirs  → boîte jaune Lipton officiel (#FFE105) + bande d'accent
 *  - Thés verts  → boîtes vertes
 *  - Infusions   → couleur du fruit / de la plante
 * Réf. palette de marque : jaune #FFE105, rouge #E20025.
 */
export const TEAS: TeaSachet[] = [
  // === Jaune — thés noirs ===
  {
    id: "black-tea",
    name: { fr: "Thé Noir", en: "Black Tea", es: "Té Negro" },
    description: {
      fr: "Le thé noir classique Lipton, orange pekoe, corsé et lisse.",
      en: "Lipton's classic black tea, orange pekoe, bold and smooth.",
      es: "El té negro clásico de Lipton, orange pekoe, intenso y suave.",
    },
    typeKey: "blackTea",
    family: "Jaune",
    colors: ["#ffe105", "#e20025"],
    ink: "#4a1206",
    caffeineFree: false,
  },
  {
    id: "extra-bold",
    name: {
      fr: "Thé Noir Extra Corsé",
      en: "Extra Bold Black Tea",
      es: "Té Negro Extra Fuerte",
    },
    description: {
      fr: "Thé noir extra corsé, riche et puissant.",
      en: "Extra bold black tea, rich and powerful.",
      es: "Té negro extra fuerte, rico y potente.",
    },
    typeKey: "blackTea",
    family: "Jaune",
    colors: ["#ffe105", "#9c1006"],
    ink: "#4a1206",
    caffeineFree: false,
  },
  {
    id: "decaf-black",
    name: {
      fr: "Thé Noir Décaféiné",
      en: "Decaffeinated Black Tea",
      es: "Té Negro Descafeinado",
    },
    description: {
      fr: "Tout le goût du thé noir Lipton, sans la théine.",
      en: "All the taste of Lipton black tea, without the caffeine.",
      es: "Todo el sabor del té negro Lipton, sin teína.",
    },
    typeKey: "blackTea",
    family: "Jaune",
    colors: ["#ffe105", "#7a6a55"],
    ink: "#4a1206",
    caffeineFree: true,
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
    id: "iced-tea",
    name: {
      fr: "Thé Glacé (sachets)",
      en: "Iced Tea Brew Bags",
      es: "Té Helado (bolsitas)",
    },
    description: {
      fr: "Grands sachets pour préparer un thé glacé maison.",
      en: "Family-size brew bags for homemade iced tea.",
      es: "Bolsitas grandes para preparar té helado casero.",
    },
    typeKey: "blackTea",
    family: "Jaune",
    colors: ["#ffe105", "#c8102e"],
    ink: "#4a1206",
    caffeineFree: false,
  },

  // === Ambre — infusions chaudes / dorées ===
  {
    id: "lemon-ginger",
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
  {
    id: "chamomile",
    name: { fr: "Camomille", en: "Golden Chamomile", es: "Manzanilla" },
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
    id: "cinnamon-apple",
    name: { fr: "Pomme Cannelle", en: "Cinnamon Apple", es: "Manzana Canela" },
    description: {
      fr: "Pomme et cannelle, infusion douce et épicée.",
      en: "Apple and cinnamon, a soft, spiced infusion.",
      es: "Manzana y canela, infusión suave y especiada.",
    },
    typeKey: "infusion",
    family: "Ambre",
    colors: ["#d8893a", "#8f3516"],
    ink: "#fff1e6",
    caffeineFree: true,
  },
  {
    id: "orange",
    name: { fr: "Orange", en: "Orange", es: "Naranja" },
    description: {
      fr: "Infusion d'orange juteuse et ensoleillée.",
      en: "Juicy, sunny orange infusion.",
      es: "Infusión de naranja jugosa y soleada.",
    },
    typeKey: "infusion",
    family: "Ambre",
    colors: ["#f0962e", "#c25a12"],
    ink: "#3d1f00",
    caffeineFree: true,
  },
  {
    id: "ginger-twist",
    name: { fr: "Gingembre Vif", en: "Ginger Twist", es: "Jengibre Intenso" },
    description: {
      fr: "Gingembre piquant, infusion tonique et épicée.",
      en: "Zesty ginger, an invigorating, spicy infusion.",
      es: "Jengibre picante, infusión tonificante y especiada.",
    },
    typeKey: "infusion",
    family: "Ambre",
    colors: ["#e0902e", "#a85510"],
    ink: "#3d1f00",
    caffeineFree: true,
  },
  {
    id: "lemon-herbal",
    name: { fr: "Citron (infusion)", en: "Lemon", es: "Limón" },
    description: {
      fr: "Infusion de citron vif, sans théine.",
      en: "Bright lemon herbal infusion, caffeine-free.",
      es: "Infusión de limón vivo, sin teína.",
    },
    typeKey: "infusion",
    family: "Ambre",
    colors: ["#f2c52e", "#cf8a12"],
    ink: "#4a3500",
    caffeineFree: true,
  },

  // === Rouge — infusion fruitée ===
  {
    id: "berry-hibiscus",
    name: { fr: "Baies Hibiscus", en: "Berry Hibiscus", es: "Bayas Hibisco" },
    description: {
      fr: "Baies des bois et hibiscus, acidulé et fruité.",
      en: "Wild berries and hibiscus, tangy and fruity.",
      es: "Bayas del bosque e hibisco, ácido y afrutado.",
    },
    typeKey: "infusionFruity",
    family: "Rouge",
    colors: ["#cc1f55", "#7a0e3a"],
    ink: "#fff0f3",
    caffeineFree: true,
  },

  // === Violet — infusions du soir / bien-être ===
  {
    id: "bedtime",
    name: { fr: "Nuit Paisible", en: "Bedtime Bliss", es: "Noche Tranquila" },
    description: {
      fr: "Camomille, lavande et menthe pour la nuit.",
      en: "Chamomile, lavender and mint for the night.",
      es: "Manzanilla, lavanda y menta para la noche.",
    },
    typeKey: "infusion",
    family: "Violet",
    colors: ["#8a73c2", "#4a2f82"],
    ink: "#f3ecff",
    caffeineFree: true,
  },
  {
    id: "stress-less",
    name: { fr: "Anti-Stress", en: "Stress Therapy", es: "Anti-Estrés" },
    description: {
      fr: "Cannelle, camomille et lavande, infusion apaisante.",
      en: "Cinnamon, chamomile and lavender, a calming infusion.",
      es: "Canela, manzanilla y lavanda, infusión calmante.",
    },
    typeKey: "infusion",
    family: "Violet",
    colors: ["#9a7fc2", "#5a3b8a"],
    ink: "#f3ecff",
    caffeineFree: true,
  },

  // === Vert — gamme thé vert + infusions vertes ===
  {
    id: "green-tea",
    name: { fr: "Thé Vert Nature", en: "Green Tea", es: "Té Verde" },
    description: {
      fr: "Thé vert 100% naturel, léger et rafraîchissant.",
      en: "100% natural green tea, light and refreshing.",
      es: "Té verde 100% natural, ligero y refrescante.",
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
    id: "matcha",
    name: { fr: "Matcha", en: "Matcha Green Tea", es: "Té Verde Matcha" },
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
    id: "matcha-ginger",
    name: { fr: "Matcha Gingembre", en: "Matcha with Ginger", es: "Matcha con Jengibre" },
    description: {
      fr: "Thé vert matcha relevé de gingembre.",
      en: "Matcha green tea with a touch of ginger.",
      es: "Té verde matcha con un toque de jengibre.",
    },
    typeKey: "greenTeaFlavored",
    family: "Vert",
    colors: ["#9ac24a", "#4f7d1f"],
    ink: "#10250a",
    caffeineFree: false,
  },
  {
    id: "green-cranberry-pomegranate",
    name: {
      fr: "Thé Vert Canneberge Grenade",
      en: "Superfruit Cranberry Pomegranate",
      es: "Té Verde Arándano Granada",
    },
    description: {
      fr: "Thé vert, canneberge acidulée et grenade.",
      en: "Green tea, tangy cranberry and pomegranate.",
      es: "Té verde, arándano ácido y granada.",
    },
    typeKey: "greenTeaFlavored",
    family: "Vert",
    colors: ["#8fbf4a", "#7a2f5a"],
    ink: "#12260c",
    caffeineFree: false,
  },
  {
    id: "green-peach",
    name: { fr: "Pêche Paradis", en: "Peach Paradise", es: "Melocotón Paraíso" },
    description: {
      fr: "Thé vert et pêche, doux et estival.",
      en: "Green tea and peach, soft and summery.",
      es: "Té verde y melocotón, suave y veraniego.",
    },
    typeKey: "greenTeaFlavored",
    family: "Vert",
    colors: ["#a6d45a", "#e0913f"],
    ink: "#13280c",
    caffeineFree: false,
  },
  {
    id: "green-lemon-ginseng",
    name: {
      fr: "Thé Vert Citron Ginseng",
      en: "Lemon Ginseng Green Tea",
      es: "Té Verde Limón Ginseng",
    },
    description: {
      fr: "Thé vert tonifiant, citron et ginseng.",
      en: "Invigorating green tea, lemon and ginseng.",
      es: "Té verde tonificante, limón y ginseng.",
    },
    typeKey: "greenTeaFlavored",
    family: "Vert",
    colors: ["#aacf52", "#5a9a2e"],
    ink: "#13280c",
    caffeineFree: false,
  },
  {
    id: "green-acai-blueberry",
    name: {
      fr: "Thé Vert Açaï Myrtille",
      en: "Purple Açai Blueberry",
      es: "Té Verde Açaí Arándano",
    },
    description: {
      fr: "Thé vert, açaï et myrtille, notes violettes.",
      en: "Green tea, açai and blueberry.",
      es: "Té verde, açaí y arándano.",
    },
    typeKey: "greenTeaFlavored",
    family: "Vert",
    colors: ["#8fbf52", "#5a3b8a"],
    ink: "#12260c",
    caffeineFree: false,
  },
  {
    id: "green-orange-passion-jasmine",
    name: {
      fr: "Thé Vert Orange Passion Jasmin",
      en: "Orange Passionfruit Jasmine",
      es: "Té Verde Naranja Maracuyá Jazmín",
    },
    description: {
      fr: "Thé vert, orange, fruit de la passion et jasmin.",
      en: "Green tea, orange, passionfruit and jasmine.",
      es: "Té verde, naranja, maracuyá y jazmín.",
    },
    typeKey: "greenTeaFlavored",
    family: "Vert",
    colors: ["#a8d44f", "#e08a2e"],
    ink: "#13280c",
    caffeineFree: false,
  },
  {
    id: "green-decaf",
    name: {
      fr: "Thé Vert Décaféiné",
      en: "Decaffeinated Green Tea",
      es: "Té Verde Descafeinado",
    },
    description: {
      fr: "Thé vert pur, sans théine.",
      en: "Pure green tea, caffeine-free.",
      es: "Té verde puro, sin teína.",
    },
    typeKey: "greenTea",
    family: "Vert",
    colors: ["#9ccb5a", "#3f7d2a"],
    ink: "#12260c",
    caffeineFree: true,
  },
  {
    id: "green-organic",
    name: { fr: "Thé Vert Bio", en: "Organic Green Tea", es: "Té Verde Orgánico" },
    description: {
      fr: "Thé vert 100% naturel issu de l'agriculture biologique.",
      en: "100% natural green tea, organically grown.",
      es: "Té verde 100% natural de cultivo orgánico.",
    },
    typeKey: "greenTea",
    family: "Vert",
    colors: ["#7cc243", "#2f7d2a"],
    ink: "#0d2e12",
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
    id: "detox",
    name: { fr: "Détox", en: "Detox", es: "Detox" },
    description: {
      fr: "Thé vert, pamplemousse, pissenlit et ortie.",
      en: "Green tea, grapefruit, dandelion and nettle.",
      es: "Té verde, pomelo, diente de león y ortiga.",
    },
    typeKey: "greenTeaFlavored",
    family: "Vert",
    colors: ["#cfe05a", "#7a9a2e"],
    ink: "#27330a",
    caffeineFree: false,
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
