//! Contenu éditorial du site (FR / EN / ES) : guide d'infusion, types de thé,
//! gammes, couleurs, FAQ, à propos, navigation. Les conseils par type et le
//! glossaire viennent de `data/` (partagés avec l'API) via `build.rs`.

use crate::catalog::{Localized, Tea, TypeKey};

/// Entrée du glossaire.
pub struct Term {
    pub label: Localized,
    pub definition: Localized,
}

include!(concat!(env!("OUT_DIR"), "/content.rs"));

const fn l(fr: &'static str, en: &'static str, es: &'static str) -> Localized {
    Localized { fr, en, es }
}

// --- Navigation -------------------------------------------------------------------

/// Sections de la page : (ancre, libellé).
pub static NAV: [(&str, Localized); 7] = [
    ("catalogue", l("Catalogue", "Catalogue", "Catálogo")),
    (
        "infusion",
        l("Bien infuser", "Brewing guide", "Guía de infusión"),
    ),
    ("types", l("Les thés", "Tea types", "Tipos de té")),
    ("couleurs", l("Les couleurs", "Colours", "Colores")),
    ("glossaire", l("Glossaire", "Glossary", "Glosario")),
    ("faq", l("Questions", "FAQ", "Preguntas")),
    ("a-propos", l("À propos", "About", "Acerca de")),
];

pub const NAV_TITLE: Localized = l("Sections", "Sections", "Secciones");
pub const MENU: Localized = l("Menu", "Menu", "Menú");
pub const MENU_CLOSE: Localized = l("Fermer le menu", "Close menu", "Cerrar el menú");
pub const MENU_CLOSE_SHORT: Localized = l("Fermer", "Close", "Cerrar");
pub const MENU_TAGLINE: Localized = l(
    "La gamme Lipton vendue en France, rangée comme un nuancier.",
    "The Lipton range sold in France, arranged like a colour chart.",
    "La gama Lipton vendida en Francia, ordenada como una carta de colores.",
);

/// En-tête d'une section : petit sur-titre, titre, chapeau.
pub struct Heading {
    pub kicker: Localized,
    pub title: Localized,
    pub intro: Localized,
}

// --- Bien infuser -----------------------------------------------------------------

pub static GUIDE: Heading = Heading {
    kicker: l("Guide", "Guide", "Guía"),
    title: l("Bien infuser", "Brew it right", "Infusionar bien"),
    intro: l(
        "Une bonne tasse tient à trois choses : une eau fraîche, la bonne température et le bon temps. Voici les repères utilisés dans chaque fiche — et par le minuteur.",
        "A good cup comes down to three things: fresh water, the right temperature and the right time. These are the guidelines used on every card — and by the timer.",
        "Una buena taza depende de tres cosas: agua fresca, la temperatura adecuada y el tiempo justo. Estas son las referencias de cada ficha, y del temporizador.",
    ),
};

pub struct Rule {
    pub title: Localized,
    pub text: Localized,
}

pub static RULES: [Rule; 3] = [
    Rule {
        title: l("Une eau fraîche", "Fresh water", "Agua fresca"),
        text: l(
            "Faites chauffer une eau fraîchement tirée, idéalement filtrée : une eau qui a bouilli plusieurs fois aplatit les arômes.",
            "Heat freshly drawn, ideally filtered water: water boiled several times flattens the aromas.",
            "Calienta agua recién sacada, idealmente filtrada: el agua hervida varias veces apaga los aromas.",
        ),
    },
    Rule {
        title: l(
            "La bonne température",
            "The right temperature",
            "La temperatura adecuada",
        ),
        text: l(
            "Thés verts et blancs : une eau chaude mais pas bouillante (70–80 °C). Thés noirs, rooibos et infusions : une eau proche de l'ébullition (90–100 °C).",
            "Green and white teas: hot but not boiling water (70–80 °C). Black teas, rooibos and herbal infusions: water close to boiling (90–100 °C).",
            "Tés verdes y blancos: agua caliente pero sin hervir (70–80 °C). Tés negros, rooibos e infusiones: agua casi hirviendo (90–100 °C).",
        ),
    },
    Rule {
        title: l("Le bon temps", "The right time", "El tiempo justo"),
        text: l(
            "Retirez le sachet à la fin du temps conseillé : trop long, le thé devient amer ; trop court, il manque de corps. Le minuteur de chaque fiche s'en charge.",
            "Take the bag out once the advised time is up: too long and tea turns bitter, too short and it lacks body. Each card's timer handles it.",
            "Retira la bolsita al acabar el tiempo recomendado: demasiado largo, el té amarga; demasiado corto, le falta cuerpo. El temporizador de cada ficha se encarga.",
        ),
    },
];

pub const COLUMN_TYPE: Localized = l("Type", "Type", "Tipo");
pub const COLUMN_TEMP: Localized = l("Température", "Temperature", "Temperatura");
pub const COLUMN_TIME: Localized = l("Durée", "Time", "Tiempo");
pub const COLUMN_TIP: Localized = l("Conseil", "Tip", "Consejo");
pub const TEAS_IN_CATALOGUE: Localized = l("sachets", "tea bags", "bolsitas");
pub const COLD_BREW: Localized = l("Infuse à froid", "Cold brew", "Infusión en frío");
pub const COLD_TIP: Localized = l(
    "Sachet dans une carafe d'eau froide, puis au frais : une boisson douce, jamais amère.",
    "Bag in a jug of cold water, then into the fridge: a smooth drink that never turns bitter.",
    "Bolsita en una jarra de agua fría y a la nevera: una bebida suave que nunca amarga.",
);
pub const TIP_LABEL: Localized = l("Conseil d'infusion", "Brewing tip", "Consejo de infusión");

/// Conseil d'infusion d'un sachet (gamme à froid, sinon selon son type).
pub fn tip(tea: &Tea) -> Option<Localized> {
    if tea.cold_brew {
        return Some(COLD_TIP);
    }
    TIPS.iter()
        .find(|(k, _)| *k == tea.type_key)
        .map(|(_, t)| *t)
}

pub fn type_tip(key: TypeKey) -> Option<Localized> {
    TIPS.iter().find(|(k, _)| *k == key).map(|(_, t)| *t)
}

// --- Types de thé & gammes ---------------------------------------------------------

pub static TYPES: Heading = Heading {
    kicker: l("Comprendre", "Understand", "Entender"),
    title: l(
        "Du thé noir au rooibos",
        "From black tea to rooibos",
        "Del té negro al rooibos",
    ),
    intro: l(
        "Tous les sachets ne contiennent pas des feuilles de théier. Voici les grandes familles du catalogue, ce qui les distingue et combien de références chacune compte.",
        "Not every bag holds tea leaves. Here are the main kinds in the catalogue, what sets them apart and how many references each one has.",
        "No todas las bolsitas contienen hojas de té. Estas son las grandes familias del catálogo, lo que las distingue y cuántas referencias tiene cada una.",
    ),
};

/// Ce qui caractérise un type de thé.
pub fn type_blurb(key: TypeKey) -> Localized {
    match key {
        TypeKey::BlackTea => l(
            "Feuilles de théier entièrement oxydées : une tasse ambrée, franche et corsée, idéale le matin, nature ou avec un nuage de lait.",
            "Fully oxidised tea leaves: an amber, bold, straightforward cup, ideal in the morning, plain or with a dash of milk.",
            "Hojas de té totalmente oxidadas: una taza ambarina, franca e intensa, ideal por la mañana, sola o con un poco de leche.",
        ),
        TypeKey::BlackTeaFlavored => l(
            "La même base de thé noir, parfumée d'arômes naturels : bergamote, agrumes, fruits rouges, épices…",
            "The same black-tea base, scented with natural flavourings: bergamot, citrus, red fruits, spices…",
            "La misma base de té negro, perfumada con aromas naturales: bergamota, cítricos, frutos rojos, especias…",
        ),
        TypeKey::BlackTeaSpiced => l(
            "Thé noir relevé d'épices chaudes (cannelle, gingembre, girofle…), qui se marie bien avec un nuage de lait.",
            "Black tea warmed up with spices (cinnamon, ginger, cloves…), lovely with a dash of milk.",
            "Té negro con especias cálidas (canela, jengibre, clavo…), que combina bien con un poco de leche.",
        ),
        TypeKey::GreenTea => l(
            "Feuilles non oxydées, simplement chauffées puis séchées : un goût frais et végétal qui demande une eau moins chaude.",
            "Unoxidised leaves, simply heated then dried: a fresh, vegetal taste that calls for cooler water.",
            "Hojas sin oxidar, simplemente calentadas y secadas: un sabor fresco y vegetal que pide agua menos caliente.",
        ),
        TypeKey::GreenTeaFlavored => l(
            "Thé vert associé à des fruits, de la menthe ou des fleurs : plus doux et parfumé, parfait l'après-midi.",
            "Green tea paired with fruit, mint or flowers: softer and more fragrant, perfect in the afternoon.",
            "Té verde con frutas, menta o flores: más suave y aromático, perfecto por la tarde.",
        ),
        TypeKey::WhiteTea => l(
            "Jeunes pousses à peine transformées : le plus délicat des thés, tout en finesse.",
            "Young buds, barely processed: the most delicate of teas, all finesse.",
            "Brotes jóvenes apenas transformados: el más delicado de los tés.",
        ),
        TypeKey::Rooibos => l(
            "« Buisson rouge » d'Afrique du Sud : naturellement sans théine, rond et légèrement sucré, il supporte une longue infusion.",
            "South Africa's “red bush”: naturally caffeine-free, round and slightly sweet, it can steep for a long time.",
            "El «arbusto rojo» de Sudáfrica: sin teína por naturaleza, redondo y algo dulce, admite una infusión larga.",
        ),
        TypeKey::Infusion => l(
            "Plantes, fleurs et épices sans feuille de thé — camomille, verveine, menthe, tilleul… Sans théine, parfaites le soir.",
            "Herbs, flowers and spices with no tea leaf — chamomile, verbena, mint, linden… Caffeine-free, perfect in the evening.",
            "Plantas, flores y especias sin hoja de té: manzanilla, verbena, menta, tila… Sin teína, perfectas por la noche.",
        ),
        TypeKey::InfusionFruity => l(
            "Hibiscus et morceaux de fruits : une boisson acidulée et colorée, délicieuse chaude comme glacée.",
            "Hibiscus and fruit pieces: a tangy, colourful drink, delicious hot or iced.",
            "Hibisco y trozos de fruta: una bebida ácida y colorida, deliciosa caliente o con hielo.",
        ),
        TypeKey::Coffret => l(
            "Des assortiments de plusieurs parfums dans une même boîte, pour goûter ou offrir.",
            "Assortments of several flavours in one box, to taste or to give.",
            "Surtidos de varios sabores en una misma caja, para probar o regalar.",
        ),
    }
}

pub const RANGES_TITLE: Localized = l("Les gammes", "The ranges", "Las gamas");

/// Gamme spéciale d'un sachet.
#[derive(Clone, Copy, PartialEq)]
pub enum Range {
    Exclusive,
    Cold,
    Limited,
}

impl Range {
    pub const ALL: [Range; 3] = [Range::Exclusive, Range::Cold, Range::Limited];

    pub fn of(self, tea: &Tea) -> bool {
        match self {
            Range::Exclusive => tea.pyramid,
            Range::Cold => tea.cold_brew,
            Range::Limited => tea.limited,
        }
    }

    pub fn icon(self) -> &'static str {
        match self {
            Range::Exclusive => "✦",
            Range::Cold => "❄",
            Range::Limited => "★",
        }
    }

    pub fn name(self) -> Localized {
        match self {
            Range::Exclusive => l(
                "Exclusive Selection",
                "Exclusive Selection",
                "Exclusive Selection",
            ),
            Range::Cold => COLD_BREW,
            Range::Limited => l(
                "Éditions limitées",
                "Limited editions",
                "Ediciones limitadas",
            ),
        }
    }

    pub fn text(self) -> Localized {
        match self {
            Range::Exclusive => l(
                "Des sachets pyramides plus spacieux, où feuilles et morceaux se déploient : la gamme premium.",
                "Roomier pyramid bags where leaves and pieces unfurl: the premium range.",
                "Bolsitas piramidales más amplias donde hojas y trozos se despliegan: la gama premium.",
            ),
            Range::Cold => l(
                "Des sachets conçus pour l'eau froide : une boisson rafraîchissante, sans bouilloire.",
                "Bags designed for cold water: a refreshing drink, no kettle needed.",
                "Bolsitas pensadas para agua fría: una bebida refrescante, sin hervidor.",
            ),
            Range::Limited => l(
                "Des recettes saisonnières, comme le thé de Noël, disponibles un temps seulement.",
                "Seasonal recipes, like the Christmas tea, available for a limited time only.",
                "Recetas de temporada, como el té de Navidad, disponibles solo un tiempo.",
            ),
        }
    }
}

// --- Couleurs & chiffres -------------------------------------------------------

pub static COLOURS: Heading = Heading {
    kicker: l("Le parti pris", "The idea", "La idea"),
    title: l(
        "Pourquoi par couleurs ?",
        "Why by colour?",
        "¿Por qué por colores?",
    ),
    intro: l(
        "En rayon, on reconnaît une boîte à sa couleur bien avant de lire son nom. Le catalogue suit ce réflexe : chaque thé est rangé selon la couleur dominante de sa boîte, et sa fiche reprend son dégradé — la teinte principale puis la bande d'accent du parfum.",
        "On the shelf you recognise a box by its colour long before reading its name. The catalogue follows that instinct: each tea is filed under its box's dominant colour, and its card reuses that gradient — the main shade, then the flavour's accent band.",
        "En la estantería reconocemos una caja por su color mucho antes de leer su nombre. El catálogo sigue ese reflejo: cada té se ordena según el color dominante de su caja, y su ficha retoma su degradado: el tono principal y luego la franja de acento del sabor.",
    ),
};

pub const COLOURS_HINT: Localized = l(
    "Touchez une couleur pour filtrer le catalogue.",
    "Tap a colour to filter the catalogue.",
    "Toca un color para filtrar el catálogo.",
);
pub const FIGURES_TITLE: Localized = l(
    "Le catalogue en chiffres",
    "The catalogue in figures",
    "El catálogo en cifras",
);
pub const FIG_TEAS: Localized = l("sachets", "tea bags", "bolsitas");
pub const FIG_CAFFEINE_FREE: Localized = l("sans théine", "caffeine-free", "sin teína");
pub const FIG_TYPES: Localized = l("types de thé", "tea types", "tipos de té");
pub const FIG_EXCLUSIVE: Localized = l(
    "Exclusive Selection",
    "Exclusive Selection",
    "Exclusive Selection",
);
pub const FIG_COLD: Localized = l("infuse à froid", "cold brew", "en frío");
pub const FIG_LIMITED: Localized = l(
    "éditions limitées",
    "limited editions",
    "ediciones limitadas",
);
pub const FIG_COFFRETS: Localized = l("coffrets", "gift sets", "estuches");
pub const FIG_LANGS: Localized = l("langues", "languages", "idiomas");

// --- Glossaire -------------------------------------------------------------------

pub static GLOSSARY_HEADING: Heading = Heading {
    kicker: l("Lexique", "Glossary", "Glosario"),
    title: l("Les mots du thé", "Tea words", "Las palabras del té"),
    intro: l(
        "Les termes que vous croiserez dans les fiches, expliqués simplement.",
        "The terms you'll come across on the cards, simply explained.",
        "Los términos que encontrarás en las fichas, explicados de forma sencilla.",
    ),
};

// --- FAQ -------------------------------------------------------------------------

pub static FAQ_HEADING: Heading = Heading {
    kicker: l("Questions", "Questions", "Preguntas"),
    title: l(
        "Questions fréquentes",
        "Frequently asked questions",
        "Preguntas frecuentes",
    ),
    intro: l(
        "Tout ce qu'il faut savoir pour profiter du site.",
        "Everything you need to know to make the most of the site.",
        "Todo lo que hay que saber para aprovechar la web.",
    ),
};

pub struct Qa {
    pub question: Localized,
    pub answer: Localized,
}

pub static FAQ: [Qa; 9] = [
    Qa {
        question: l(
            "D'où viennent les informations ?",
            "Where does the information come from?",
            "¿De dónde sale la información?",
        ),
        answer: l(
            "Le catalogue suit la gamme Lipton vendue en France (site de la marque et revendeurs français). Les couleurs reproduisent celles des boîtes ; les ingrédients sont ceux des emballages pour les références documentées, sinon ceux du type de thé. Les conseils d'infusion sont des repères : en cas de doute, suivez l'emballage.",
            "The catalogue follows the Lipton range sold in France (the brand's website and French retailers). Colours mirror the boxes; ingredients come from the packaging for documented references, otherwise from the tea type. Brewing advice is a guideline: when in doubt, follow the packaging.",
            "El catálogo sigue la gama Lipton vendida en Francia (web de la marca y distribuidores franceses). Los colores reproducen los de las cajas; los ingredientes son los del envase en las referencias documentadas y, si no, los del tipo de té. Los consejos de infusión son orientativos: ante la duda, sigue el envase.",
        ),
    },
    Qa {
        question: l(
            "Que veut dire l'intensité ?",
            "What does intensity mean?",
            "¿Qué significa la intensidad?",
        ),
        answer: l(
            "C'est la force du thé en bouche, notée de 1 (très léger) à 5 (très corsé) et jugée thé par thé. Le tri « Intensité » range tout le catalogue du plus corsé au plus léger.",
            "It's how strong the tea tastes, rated from 1 (very light) to 5 (very bold) and judged tea by tea. The “Intensity” sort ranks the whole catalogue from boldest to lightest.",
            "Es la fuerza del té en boca, de 1 (muy suave) a 5 (muy intenso), valorada té por té. El orden «Intensidad» clasifica todo el catálogo del más intenso al más suave.",
        ),
    },
    Qa {
        question: l(
            "Comment trouver un thé sans théine ?",
            "How do I find a caffeine-free tea?",
            "¿Cómo encuentro un té sin teína?",
        ),
        answer: l(
            "Choisissez le tri « Moment » : la section « Le soir » réunit les rooibos et les infusions, naturellement sans théine. Chaque carte l'indique aussi en haut à droite.",
            "Pick the “Time” sort: the “Evening” section gathers rooibos and herbal infusions, which are naturally caffeine-free. Each card also says so in its top-right corner.",
            "Elige el orden «Momento»: la sección «Por la noche» reúne los rooibos y las infusiones, sin teína por naturaleza. Cada tarjeta lo indica también arriba a la derecha.",
        ),
    },
    Qa {
        question: l(
            "Comment marche le minuteur ?",
            "How does the timer work?",
            "¿Cómo funciona el temporizador?",
        ),
        answer: l(
            "Ouvrez une fiche : le minuteur est réglé sur la durée conseillée pour ce thé. Ajustez-le par pas de 30 secondes, lancez-le, et un bip (plus une vibration sur mobile) vous prévient quand c'est prêt. L'écran reste allumé pendant l'infusion, et le décompte reste juste même si vous changez d'onglet.",
            "Open a card: the timer is set to the advised time for that tea. Adjust it in 30-second steps, start it, and a beep (plus a vibration on mobile) tells you when it's ready. The screen stays on while brewing, and the countdown stays accurate even if you switch tabs.",
            "Abre una ficha: el temporizador está ajustado al tiempo recomendado para ese té. Ajústalo de 30 en 30 segundos, inícialo y un pitido (más una vibración en el móvil) te avisa cuando está listo. La pantalla sigue encendida durante la infusión y la cuenta atrás es exacta aunque cambies de pestaña.",
        ),
    },
    Qa {
        question: l(
            "Puis-je installer le site comme une app ?",
            "Can I install the site as an app?",
            "¿Puedo instalar la web como una app?",
        ),
        answer: l(
            "Oui. Sur iPhone : Safari → Partager → « Sur l'écran d'accueil ». Sur Android ou ordinateur : menu du navigateur → « Installer l'application ». Une fois installé, le catalogue fonctionne même sans connexion.",
            "Yes. On iPhone: Safari → Share → “Add to Home Screen”. On Android or desktop: browser menu → “Install app”. Once installed, the catalogue works even offline.",
            "Sí. En iPhone: Safari → Compartir → «Añadir a pantalla de inicio». En Android u ordenador: menú del navegador → «Instalar aplicación». Una vez instalada, el catálogo funciona incluso sin conexión.",
        ),
    },
    Qa {
        question: l(
            "Existe-t-il une app iPhone ?",
            "Is there an iPhone app?",
            "¿Hay una app para iPhone?",
        ),
        answer: l(
            "Oui : une app iOS native, avec le même catalogue embarqué (utilisable hors-ligne), les fiches colorées et le minuteur. Elle est en phase de test via TestFlight.",
            "Yes: a native iOS app with the same catalogue built in (usable offline), the coloured cards and the timer. It is currently being tested through TestFlight.",
            "Sí: una app iOS nativa con el mismo catálogo integrado (usable sin conexión), las fichas de color y el temporizador. Está en fase de pruebas mediante TestFlight.",
        ),
    },
    Qa {
        question: l(
            "Mes données sont-elles collectées ?",
            "Is my data collected?",
            "¿Se recogen mis datos?",
        ),
        answer: l(
            "Non. Pas de compte, pas de cookie, pas de mesure d'audience. Vos préférences (langue, thème, filtre, tri, sections repliées) sont enregistrées uniquement dans votre navigateur.",
            "No. No account, no cookies, no analytics. Your preferences (language, theme, filter, sort, collapsed sections) are stored only in your browser.",
            "No. Sin cuenta, sin cookies, sin medición de audiencia. Tus preferencias (idioma, tema, filtro, orden, secciones plegadas) se guardan solo en tu navegador.",
        ),
    },
    Qa {
        question: l(
            "Les animations me gênent.",
            "The animations bother me.",
            "Las animaciones me molestan.",
        ),
        answer: l(
            "Activez « Réduire les animations » dans les réglages d'accessibilité de votre appareil : le site les coupe toutes et affiche le contenu directement.",
            "Turn on “Reduce motion” in your device's accessibility settings: the site switches them all off and shows the content straight away.",
            "Activa «Reducir movimiento» en los ajustes de accesibilidad de tu dispositivo: la web las desactiva todas y muestra el contenido directamente.",
        ),
    },
    Qa {
        question: l(
            "Puis-je réutiliser les données ?",
            "Can I reuse the data?",
            "¿Puedo reutilizar los datos?",
        ),
        answer: l(
            "Oui, grâce à l'API publique : tout le catalogue en JSON ou en CSV, avec filtres, tri et pagination, une documentation, un bac à sable et des exercices guidés.",
            "Yes, through the public API: the whole catalogue as JSON or CSV, with filters, sorting and pagination, documentation, a sandbox and guided exercises.",
            "Sí, con la API pública: todo el catálogo en JSON o CSV, con filtros, orden y paginación, documentación, un banco de pruebas y ejercicios guiados.",
        ),
    },
];

// --- À propos ----------------------------------------------------------------------

pub static ABOUT: Heading = Heading {
    kicker: l("À propos", "About", "Acerca de"),
    title: l(
        "Un catalogue, trois écrans",
        "One catalogue, three screens",
        "Un catálogo, tres pantallas",
    ),
    intro: l(
        "« Lipton · Sachets de thé par couleurs » est un projet conçu et développé par Maxime Nathan Lestage. Le même catalogue alimente ce site, une app iPhone native et une API publique pensée pour apprendre.",
        "“Lipton · Tea bags by colour” is a project designed and developed by Maxime Nathan Lestage. One catalogue powers this website, a native iPhone app and a public API built for learning.",
        "«Lipton · Bolsitas de té por colores» es un proyecto diseñado y desarrollado por Maxime Nathan Lestage. Un mismo catálogo alimenta esta web, una app nativa para iPhone y una API pública pensada para aprender.",
    ),
};

pub struct Pillar {
    pub title: Localized,
    pub text: Localized,
}

pub static PILLARS: [Pillar; 3] = [
    Pillar {
        title: l("Le site", "The website", "La web"),
        text: l(
            "Écrit en Rust avec Yew et compilé en WebAssembly : rapide, installable, utilisable hors-ligne, en trois langues.",
            "Written in Rust with Yew and compiled to WebAssembly: fast, installable, usable offline, in three languages.",
            "Escrita en Rust con Yew y compilada a WebAssembly: rápida, instalable, usable sin conexión, en tres idiomas.",
        ),
    },
    Pillar {
        title: l("L'app iPhone", "The iPhone app", "La app para iPhone"),
        text: l(
            "Une app SwiftUI 100 % native, avec le catalogue embarqué, un écran de lancement animé et un minuteur mémorisé par thé.",
            "A 100% native SwiftUI app, with the catalogue built in, an animated launch screen and a timer remembered per tea.",
            "Una app SwiftUI 100 % nativa, con el catálogo integrado, una pantalla de inicio animada y un temporizador recordado por té.",
        ),
    },
    Pillar {
        title: l("L'API publique", "The public API", "La API pública"),
        text: l(
            "Le catalogue en JSON, en libre accès : documentation, Swagger, bac à sable, quiz et exercices guidés.",
            "The catalogue as JSON, open to all: documentation, Swagger, sandbox, quiz and guided exercises.",
            "El catálogo en JSON, de libre acceso: documentación, Swagger, banco de pruebas, quiz y ejercicios guiados.",
        ),
    },
];

/// Liens de l'API publique : (chemin, libellé).
pub static API_LINKS: [(&str, Localized); 4] = [
    (
        "/api/docs",
        l("Documentation", "Documentation", "Documentación"),
    ),
    (
        "/api/playground",
        l("Bac à sable", "Sandbox", "Banco de pruebas"),
    ),
    ("/api/swagger", l("Swagger", "Swagger", "Swagger")),
    ("/api/openapi.json", l("OpenAPI", "OpenAPI", "OpenAPI")),
];

pub const CREDITS: Localized = l(
    "Conçu et développé par Maxime Nathan Lestage · @maxlestage",
    "Designed and developed by Maxime Nathan Lestage · @maxlestage",
    "Diseñado y desarrollado por Maxime Nathan Lestage · @maxlestage",
);
pub const TRADEMARK: Localized = l(
    "Lipton est une marque de son propriétaire ; les noms et couleurs des produits servent à les identifier.",
    "Lipton is a trademark of its owner; product names and colours are used to identify them.",
    "Lipton es una marca de su propietario; los nombres y colores de los productos sirven para identificarlos.",
);

// --- Fiche ---------------------------------------------------------------------------

pub const SIMILAR: Localized = l("Dans la même couleur", "Same colour", "Del mismo color");
pub const RANGE_LABEL: Localized = l("Gamme", "Range", "Gama");
