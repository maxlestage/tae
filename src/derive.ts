import type { Lang, Localized, TeaSachet, TypeKey } from "./data.ts";

// Réexport pour le générateur de l'API publique (source unique du catalogue).
export { TEAS } from "./data.ts";

/** Ingrédients principaux dérivés du type (fallback). */
const BASE_INGREDIENTS: Record<TypeKey, Localized> = {
  blackTea: { fr: "Thé noir", en: "Black tea", es: "Té negro" },
  blackTeaFlavored: {
    fr: "Thé noir, arôme naturel",
    en: "Black tea, natural flavouring",
    es: "Té negro, aroma natural",
  },
  blackTeaSpiced: {
    fr: "Thé noir, épices, arôme naturel",
    en: "Black tea, spices, natural flavouring",
    es: "Té negro, especias, aroma natural",
  },
  greenTea: { fr: "Thé vert", en: "Green tea", es: "Té verde" },
  greenTeaFlavored: {
    fr: "Thé vert, arôme naturel",
    en: "Green tea, natural flavouring",
    es: "Té verde, aroma natural",
  },
  whiteTea: { fr: "Thé blanc", en: "White tea", es: "Té blanco" },
  rooibos: { fr: "Rooibos", en: "Rooibos", es: "Rooibos" },
  infusion: {
    fr: "Plantes et arômes naturels",
    en: "Herbs and natural flavourings",
    es: "Plantas y aromas naturales",
  },
  infusionFruity: {
    fr: "Hibiscus, morceaux de fruits, arôme naturel",
    en: "Hibiscus, fruit pieces, natural flavouring",
    es: "Hibisco, trozos de fruta, aroma natural",
  },
  coffret: { fr: "", en: "", es: "" },
};

/** Listes d'ingrédients documentées (réelles) pour certaines références. */
const INGREDIENTS_OVERRIDE: Record<string, Localized> = {
  chamomile: { fr: "Camomille", en: "Chamomile flowers", es: "Manzanilla" },
  peppermint: { fr: "Menthe poivrée", en: "Peppermint", es: "Menta piperita" },
  "spearmint-soft": { fr: "Menthe douce", en: "Spearmint", es: "Hierbabuena" },
  verbena: { fr: "Verveine", en: "Lemon verbena", es: "Verbena" },
  "verbena-mint": { fr: "Verveine, menthe", en: "Verbena, mint", es: "Verbena, menta" },
  linden: { fr: "Tilleul", en: "Linden", es: "Tilo" },
  "rooibos-vanilla": {
    fr: "Rooibos, arôme vanille",
    en: "Rooibos, vanilla flavouring",
    es: "Rooibos, aroma de vainilla",
  },
  "moroccan-mint": {
    fr: "Menthe, épices, réglisse",
    en: "Mint, spices, licorice",
    es: "Menta, especias, regaliz",
  },
  digestion: {
    fr: "Menthe verte, fenouil, camomille, rooibos, menthe poivrée, réglisse, gingembre",
    en: "Spearmint, fennel, chamomile, rooibos, peppermint, licorice, ginger",
    es: "Hierbabuena, hinojo, manzanilla, rooibos, menta piperita, regaliz, jengibre",
  },
  relax: {
    fr: "Camomille, feuilles d'oranger, tilleul, lavande, arôme vanille",
    en: "Chamomile, orange leaves, linden, lavender, vanilla flavouring",
    es: "Manzanilla, hojas de naranjo, tilo, lavanda, aroma de vainilla",
  },
  gingerbread: {
    fr: "Rooibos, cannelle, gingembre, écorces d'orange, réglisse, girofle",
    en: "Rooibos, cinnamon, ginger, orange peel, licorice, cloves",
    es: "Rooibos, canela, jengibre, cáscara de naranja, regaliz, clavo",
  },
  "organic-lemon-ginger": {
    fr: "Citronnelle, gingembre, menthe, écorces de citron et d'orange",
    en: "Lemongrass, ginger, mint, lemon and orange peel",
    es: "Hierba limón, jengibre, menta, cáscara de limón y naranja",
  },
  "lemon-ginger": {
    fr: "Gingembre, citron, écorces d'agrumes",
    en: "Ginger, lemon, citrus peel",
    es: "Jengibre, limón, cáscara de cítricos",
  },
  ginger: {
    fr: "Gingembre, citron, écorces d'agrumes",
    en: "Ginger, lemon, citrus peel",
    es: "Jengibre, limón, cáscara de cítricos",
  },
  "red-fruits-infusion": {
    fr: "Hibiscus, fruits rouges, arôme naturel",
    en: "Hibiscus, red fruits, natural flavouring",
    es: "Hibisco, frutos rojos, aroma natural",
  },
  "evening-mint-licorice": {
    fr: "Menthe, réglisse, plantes",
    en: "Mint, licorice, herbs",
    es: "Menta, regaliz, plantas",
  },
};

/** Ingrédients (traduits) d'un sachet, ou null pour un coffret. */
export function ingredientsFor(tea: TeaSachet): Localized | null {
  if (tea.coffret) return null;
  return INGREDIENTS_OVERRIDE[tea.id] ?? BASE_INGREDIENTS[tea.typeKey];
}

export function ingredientsText(tea: TeaSachet, lang: Lang): string {
  return ingredientsFor(tea)?.[lang] ?? "";
}

/**
 * Intensité 1–5 ; 0 = non applicable (coffret).
 *
 * Chaque thé porte désormais son propre `intensity` dans `data.ts` : la valeur
 * est jugée thé par thé. Le repli par type ci-dessous ne sert plus qu'aux
 * références ajoutées sans intensité — le déduire du type donnait des paquets
 * fourre-tout (42 thés sur 78 dans le même).
 */
export function intensityValue(tea: TeaSachet): number {
  if (tea.coffret) return 0;
  if (tea.intensity) return tea.intensity;
  switch (tea.typeKey) {
    case "blackTea":
    case "blackTeaSpiced":
      return 4;
    case "blackTeaFlavored":
      return 3;
    case "greenTea":
    case "greenTeaFlavored":
    case "rooibos":
    case "infusion":
    case "infusionFruity":
      return 2;
    case "whiteTea":
      return 1;
    default:
      return 2;
  }
}
