// Contenu pédagogique de l'API (statique, trois langues) — pensé pour les
// étudiants : guide d'infusion, glossaire et exercices pratiques.
//
// Le guide d'infusion et le glossaire vivent dans data/ : le front Yew les
// compile aussi (build.rs), pour que le site et l'API disent la même chose.

import BREWING from "./data/brewing.json" with { type: "json" };
import GLOSSARY from "./data/glossary.json" with { type: "json" };

export { BREWING, GLOSSARY };

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
