import type { ColorFamily, Lang, TypeKey } from "./data.ts";

export const LANGS: Lang[] = ["fr", "en", "es"];

export const LANG_LABEL: Record<Lang, string> = {
  fr: "FR",
  en: "EN",
  es: "ES",
};

export interface UiStrings {
  kicker: string;
  title: string;
  subtitle: string;
  all: string;
  themeLight: string;
  themeDark: string;
  openCard: string;
  close: string;
  caffeinated: string;
  caffeineFree: string;
  colour: string;
  caffeineLabel: string;
  typeLabel: string;
  gradient: string;
  formatLabel: string;
  brewLabel: string;
  momentLabel: string;
  intensityLabel: string;
  ingredientsLabel: string;
  certificationLabel: string;
  certificationValue: string;
  momentDay: string;
  momentEvening: string;
  variedValue: string;
  coldWater: string;
  fmtBag: string;
  fmtPyramid: string;
  fmtCold: string;
  fmtBox: string;
  sortLabel: string;
  sortColour: string;
  sortIntensity: string;
  sortMoment: string;
  collapseAll: string;
  expandAll: string;
  country: string;
  footer: (count: number, year: number) => string;
  openAria: (name: string) => string;
  langAria: string;
}

export const UI: Record<Lang, UiStrings> = {
  fr: {
    kicker: "Collection",
    title: "Sachets de thé",
    subtitle: "Triés par couleurs — clique sur un thé pour ouvrir sa fiche colorée.",
    all: "Toutes",
    themeLight: "Clair",
    themeDark: "Sombre",
    openCard: "Ouvrir la fiche →",
    close: "Fermer",
    caffeinated: "Théiné",
    caffeineFree: "Sans théine",
    colour: "Couleur",
    caffeineLabel: "Théine",
    typeLabel: "Type",
    gradient: "Dégradé du thé",
    formatLabel: "Format",
    brewLabel: "Infusion",
    momentLabel: "Moment",
    intensityLabel: "Intensité",
    ingredientsLabel: "Ingrédients",
    certificationLabel: "Certification",
    certificationValue: "Rainforest Alliance",
    momentDay: "Matin & journée",
    momentEvening: "Le soir",
    variedValue: "Varié",
    coldWater: "Eau froide",
    fmtBag: "Sachet",
    fmtPyramid: "Sachet pyramide",
    fmtCold: "Infuse à froid",
    fmtBox: "Assortiment",
    sortLabel: "Trier par",
    sortColour: "Couleur",
    sortIntensity: "Intensité",
    sortMoment: "Moment",
    collapseAll: "Tout réduire",
    expandAll: "Tout déplier",
    country: "Gamme vendue en France",
    footer: (n, year) => `© ${year} @maxlestage · ${n} sachets`,
    openAria: (name) => `Ouvrir la fiche ${name}`,
    langAria: "Choisir la langue",
  },
  en: {
    kicker: "Collection",
    title: "Tea bags",
    subtitle: "Sorted by colour — click a tea to open its coloured card.",
    all: "All",
    themeLight: "Light",
    themeDark: "Dark",
    openCard: "Open card →",
    close: "Close",
    caffeinated: "Caffeinated",
    caffeineFree: "Caffeine-free",
    colour: "Colour",
    caffeineLabel: "Caffeine",
    typeLabel: "Type",
    gradient: "Tea gradient",
    formatLabel: "Format",
    brewLabel: "Brewing",
    momentLabel: "Time of day",
    intensityLabel: "Intensity",
    ingredientsLabel: "Ingredients",
    certificationLabel: "Certification",
    certificationValue: "Rainforest Alliance",
    momentDay: "Morning & day",
    momentEvening: "Evening",
    variedValue: "Varies",
    coldWater: "Cold water",
    fmtBag: "Tea bag",
    fmtPyramid: "Pyramid bag",
    fmtCold: "Cold brew",
    fmtBox: "Assortment",
    sortLabel: "Sort by",
    sortColour: "Colour",
    sortIntensity: "Intensity",
    sortMoment: "Time",
    collapseAll: "Collapse all",
    expandAll: "Expand all",
    country: "Range sold in France",
    footer: (n, year) => `© ${year} @maxlestage · ${n} tea bags`,
    openAria: (name) => `Open the ${name} card`,
    langAria: "Choose language",
  },
  es: {
    kicker: "Colección",
    title: "Bolsitas de té",
    subtitle: "Ordenados por color — haz clic en un té para abrir su ficha de color.",
    all: "Todos",
    themeLight: "Claro",
    themeDark: "Oscuro",
    openCard: "Abrir ficha →",
    close: "Cerrar",
    caffeinated: "Con teína",
    caffeineFree: "Sin teína",
    colour: "Color",
    caffeineLabel: "Teína",
    typeLabel: "Tipo",
    gradient: "Degradado del té",
    formatLabel: "Formato",
    brewLabel: "Infusión",
    momentLabel: "Momento",
    intensityLabel: "Intensidad",
    ingredientsLabel: "Ingredientes",
    certificationLabel: "Certificación",
    certificationValue: "Rainforest Alliance",
    momentDay: "Mañana y día",
    momentEvening: "Por la noche",
    variedValue: "Variado",
    coldWater: "Agua fría",
    fmtBag: "Bolsita",
    fmtPyramid: "Pirámide",
    fmtCold: "Infusión en frío",
    fmtBox: "Surtido",
    sortLabel: "Ordenar por",
    sortColour: "Color",
    sortIntensity: "Intensidad",
    sortMoment: "Momento",
    collapseAll: "Contraer todo",
    expandAll: "Expandir todo",
    country: "Gama vendida en Francia",
    footer: (n, year) => `© ${year} @maxlestage · ${n} bolsitas`,
    openAria: (name) => `Abrir la ficha ${name}`,
    langAria: "Elegir idioma",
  },
};

export const FAMILY_LABEL: Record<Lang, Record<ColorFamily, string>> = {
  fr: {
    Jaune: "Jaune",
    Ambre: "Ambre",
    Rouge: "Rouge",
    Rose: "Rose",
    Violet: "Violet",
    Bleu: "Bleu",
    Vert: "Vert",
    Coffret: "Coffrets",
  },
  en: {
    Jaune: "Yellow",
    Ambre: "Amber",
    Rouge: "Red",
    Rose: "Pink",
    Violet: "Purple",
    Bleu: "Blue",
    Vert: "Green",
    Coffret: "Gift Sets",
  },
  es: {
    Jaune: "Amarillo",
    Ambre: "Ámbar",
    Rouge: "Rojo",
    Rose: "Rosa",
    Violet: "Morado",
    Bleu: "Azul",
    Vert: "Verde",
    Coffret: "Estuches",
  },
};

export const TYPE_LABEL: Record<Lang, Record<TypeKey, string>> = {
  fr: {
    blackTea: "Thé noir",
    blackTeaFlavored: "Thé noir aromatisé",
    blackTeaSpiced: "Thé noir épicé",
    greenTea: "Thé vert",
    greenTeaFlavored: "Thé vert aromatisé",
    whiteTea: "Thé blanc",
    rooibos: "Rooibos",
    infusion: "Infusion",
    infusionFruity: "Infusion fruitée",
    coffret: "Coffret",
  },
  en: {
    blackTea: "Black tea",
    blackTeaFlavored: "Flavoured black tea",
    blackTeaSpiced: "Spiced black tea",
    greenTea: "Green tea",
    greenTeaFlavored: "Flavoured green tea",
    whiteTea: "White tea",
    rooibos: "Rooibos",
    infusion: "Herbal infusion",
    infusionFruity: "Fruit infusion",
    coffret: "Gift set",
  },
  es: {
    blackTea: "Té negro",
    blackTeaFlavored: "Té negro aromatizado",
    blackTeaSpiced: "Té negro especiado",
    greenTea: "Té verde",
    greenTeaFlavored: "Té verde aromatizado",
    whiteTea: "Té blanco",
    rooibos: "Rooibos",
    infusion: "Infusión",
    infusionFruity: "Infusión de frutas",
    coffret: "Estuche",
  },
};
