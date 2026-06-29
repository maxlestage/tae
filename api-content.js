// Contenu pédagogique de l'API (statique, trois langues) — pensé pour les
// étudiants : guide d'infusion, glossaire et exercices pratiques.

/** Guide d'infusion par type de thé : température (°C), durée (min) et conseils. */
export const BREWING = {
  blackTea: {
    tempC: [90, 95], minutes: [3, 5],
    tips: {
      fr: "Eau frémissante. Au-delà de 5 min, le thé devient amer.",
      en: "Near-boiling water. Past 5 min it turns bitter.",
      es: "Agua casi hirviendo. Más de 5 min amarga.",
    },
  },
  blackTeaFlavored: {
    tempC: [90, 95], minutes: [3, 4],
    tips: {
      fr: "Un peu plus court pour préserver les arômes.",
      en: "Slightly shorter to keep the aromas.",
      es: "Un poco más corto para conservar los aromas.",
    },
  },
  blackTeaSpiced: {
    tempC: [90, 95], minutes: [4, 5],
    tips: {
      fr: "Se marie très bien avec un nuage de lait.",
      en: "Pairs well with a dash of milk.",
      es: "Combina bien con un poco de leche.",
    },
  },
  greenTea: {
    tempC: [70, 80], minutes: [1, 3],
    tips: {
      fr: "Eau pas trop chaude, sinon amertume.",
      en: "Don't use boiling water or it gets bitter.",
      es: "Agua no muy caliente o amarga.",
    },
  },
  greenTeaFlavored: {
    tempC: [70, 80], minutes: [2, 3],
    tips: {
      fr: "Idéal l'après-midi.",
      en: "Great in the afternoon.",
      es: "Ideal por la tarde.",
    },
  },
  whiteTea: {
    tempC: [70, 80], minutes: [2, 5],
    tips: {
      fr: "Thé délicat : eau douce et infusion patiente.",
      en: "Delicate tea: soft water, patient steeping.",
      es: "Té delicado: agua suave e infusión paciente.",
    },
  },
  rooibos: {
    tempC: [90, 100], minutes: [5, 7],
    tips: {
      fr: "Naturellement sans théine, infusion longue possible.",
      en: "Naturally caffeine-free, long steeping is fine.",
      es: "Sin teína por naturaleza, admite infusión larga.",
    },
  },
  infusion: {
    tempC: [90, 100], minutes: [5, 7],
    tips: {
      fr: "Eau bien chaude pour libérer les plantes.",
      en: "Hot water to release the herbs.",
      es: "Agua bien caliente para liberar las plantas.",
    },
  },
  infusionFruity: {
    tempC: [90, 100], minutes: [5, 8],
    tips: {
      fr: "Délicieuse aussi glacée.",
      en: "Also delicious iced.",
      es: "Deliciosa también con hielo.",
    },
  },
  coffret: {
    tempC: null, minutes: null,
    tips: {
      fr: "Coffret de plusieurs parfums : suivre chaque sachet.",
      en: "Gift set of several flavours: follow each bag.",
      es: "Estuche de varios sabores: seguir cada bolsita.",
    },
  },
};

/** Glossaire des termes employés dans le catalogue. */
export const GLOSSARY = [
  {
    term: "théine",
    definition: {
      fr: "Nom de la caféine présente dans le thé ; effet stimulant.",
      en: "The caffeine naturally found in tea; a stimulant.",
      es: "La cafeína presente en el té; efecto estimulante.",
    },
  },
  {
    term: "rooibos",
    definition: {
      fr: "« Buisson rouge » d'Afrique du Sud, infusion sans théine.",
      en: "South-African \"red bush\", a caffeine-free infusion.",
      es: "\"Arbusto rojo\" de Sudáfrica, infusión sin teína.",
    },
  },
  {
    term: "infusion",
    definition: {
      fr: "Boisson de plantes/fruits sans feuille de thé (sans théine).",
      en: "A herbal/fruit brew without tea leaves (caffeine-free).",
      es: "Bebida de plantas/frutas sin hoja de té (sin teína).",
    },
  },
  {
    term: "pyramide",
    definition: {
      fr: "Sachet en forme de pyramide laissant les feuilles se déployer (gamme Exclusive Selection).",
      en: "Pyramid-shaped bag that lets leaves unfurl (Exclusive Selection range).",
      es: "Bolsita piramidal que deja desplegar las hojas (gama Exclusive Selection).",
    },
  },
  {
    term: "cold brew",
    definition: {
      fr: "Infusion à l'eau froide, plusieurs heures, plus douce.",
      en: "Cold-water steeping over several hours, smoother taste.",
      es: "Infusión en agua fría durante horas, más suave.",
    },
  },
  {
    term: "intensité",
    definition: {
      fr: "Force du thé en bouche, de 1 (léger) à 5 (corsé).",
      en: "Strength in the cup, from 1 (light) to 5 (bold).",
      es: "Fuerza en boca, de 1 (ligero) a 5 (intenso).",
    },
  },
  {
    term: "Rainforest Alliance",
    definition: {
      fr: "Certification d'agriculture durable présente sur la gamme.",
      en: "Sustainable-farming certification carried by the range.",
      es: "Certificación de agricultura sostenible de la gama.",
    },
  },
];

/** Exercices pratiques pour apprendre à consommer l'API. */
export const EXERCISES = [
  {
    id: "list-all",
    title: { fr: "Lister tous les sachets", en: "List all tea bags", es: "Listar todas las bolsitas" },
    goal: {
      fr: "Récupère le catalogue complet et compte les résultats.",
      en: "Fetch the whole catalogue and count the results.",
      es: "Obtén el catálogo completo y cuenta los resultados.",
    },
    endpoint: "/api/v1/teas",
    hint: { fr: "Regarde le champ total.", en: "Look at the total field.", es: "Mira el campo total." },
  },
  {
    id: "filter-green",
    title: { fr: "Filtrer les thés verts", en: "Filter green teas", es: "Filtrar tés verdes" },
    goal: {
      fr: "N'affiche que la famille Vert, en anglais.",
      en: "Show only the Green family, in English.",
      es: "Muestra solo la familia Verde, en inglés.",
    },
    endpoint: "/api/v1/teas?family=Vert&lang=en",
    hint: { fr: "Combine family= et lang=.", en: "Combine family= and lang=.", es: "Combina family= y lang=." },
  },
  {
    id: "paginate",
    title: { fr: "Paginer les résultats", en: "Paginate results", es: "Paginar resultados" },
    goal: {
      fr: "Affiche 10 sachets, puis les 10 suivants via les liens.",
      en: "Show 10 tea bags, then the next 10 using the links.",
      es: "Muestra 10 bolsitas y luego las 10 siguientes con los enlaces.",
    },
    endpoint: "/api/v1/teas?limit=10&offset=0",
    hint: { fr: "Suis _links.next.", en: "Follow _links.next.", es: "Sigue _links.next." },
  },
  {
    id: "search",
    title: { fr: "Rechercher « menthe »", en: "Search \"mint\"", es: "Buscar \"menta\"" },
    goal: {
      fr: "Trouve tous les thés à la menthe.",
      en: "Find every mint tea.",
      es: "Encuentra todos los tés de menta.",
    },
    endpoint: "/api/v1/teas?search=menthe",
    hint: { fr: "La recherche lit le nom et la description.", en: "Search covers name and description.", es: "La búsqueda cubre nombre y descripción." },
  },
  {
    id: "one-tea",
    title: { fr: "Ouvrir une fiche", en: "Open one tea", es: "Abrir una ficha" },
    goal: {
      fr: "Récupère le détail de « yellow-label » et lis ses ingrédients.",
      en: "Fetch the \"yellow-label\" detail and read its ingredients.",
      es: "Obtén el detalle de \"yellow-label\" y lee sus ingredientes.",
    },
    endpoint: "/api/v1/teas/yellow-label?lang=fr",
    hint: { fr: "Le champ ingredients.", en: "The ingredients field.", es: "El campo ingredients." },
  },
  {
    id: "quiz",
    title: { fr: "Jouer au quiz", en: "Play the quiz", es: "Jugar al quiz" },
    goal: {
      fr: "Récupère une question, propose les options et vérifie answer.",
      en: "Fetch a question, show the options and check answer.",
      es: "Obtén una pregunta, muestra las opciones y verifica answer.",
    },
    endpoint: "/api/v1/quiz?lang=fr",
    hint: { fr: "answer contient la bonne réponse.", en: "answer holds the correct option.", es: "answer contiene la respuesta correcta." },
  },
];
