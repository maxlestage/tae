# 🫖 Lipton — Sachets de thé par couleurs

Site qui présente la gamme de sachets de thé Lipton vendue en France, **triée par
couleurs**. Chaque thé a sa **fiche colorée** reprenant les teintes de sa boîte
(dégradé + nuancier des codes hex), son intensité, ses ingrédients et un
minuteur d'infusion.

Le front est écrit en **Rust** avec **[Yew](https://yew.rs) 0.23** et compilé en
**WebAssembly** par **[Trunk](https://trunkrs.dev)** ; un serveur **Node 24**
sans dépendance sert le site et une **API JSON publique**.

> Présentation complète de l'app : **[FICHE-PRODUIT.md](FICHE-PRODUIT.md)**.

## Fonctionnalités

- 🎨 **Fiches colorées** — dégradé aux couleurs de la boîte, encre lisible adaptée, texture toile.
- 🗂️ **Tri** par couleur, par intensité (1 à 5) ou par moment (journée / soir).
- 🔘 **Filtres** par famille de couleur, sections repliables, préférences mémorisées.
- ⏱️ **Minuteur d'infusion** pré-réglé par thé (bip + vibration, écran gardé allumé).
- 📋 **Fiche enrichie** — conseil d'infusion, type et gamme expliqués, suggestions « Dans la même couleur ».
- 📚 **Sections d'information** — *Bien infuser* (règles d'or, tableau par type avec
  jauges), *Du thé noir au rooibos* (types et gammes), *Pourquoi par couleurs ?*
  (répartition cliquable, chiffres clés), *Les mots du thé* (glossaire),
  *Questions fréquentes*, *À propos*.
- 🧭 **Menu plein écran** numéroté et plan du site dans le pied de page.
- 🌍 **FR / EN / ES**, thème **clair / sombre**, **PWA** installable et hors-ligne.

### Animations

Le site adopte un langage de mouvement « agence créative » :

- **Intro** : rideau jaune Lipton avec compteur 0 → 100 %, affiché en HTML pur
  pendant le téléchargement du WASM, qui se lève en goutte.
- **Titre lettre par lettre**, logo qui pivote, **chiffres clés** qui défilent.
- **Halos colorés** en parallaxe (souris + scroll) et grain photo.
- **Bandeaux défilants** de noms de thés, accélérés et inclinés par la vitesse de scroll.
- **Curseur personnalisé** (point + anneau à inertie, « Ouvrir » au survol d'une carte)
  et **boutons magnétiques**.
- **Cartes en 3D** qui s'inclinent sous le pointeur, avec reflet ; le sachet se balance.
- **Apparitions au scroll** en cascade et titres révélés par masque.
- **Fiche** qui se dévoile **en cercle depuis le point du clic** (et s'y referme).
- **Changement de thème** en cercle (View Transitions API).
- **Menu** en rideau jaune, liens qui montent un à un ; jauges, barres et
  compteurs qui se remplissent à l'apparition ; FAQ en accordéon animé.
- **Défilement fluide** à la molette et trajets animés vers les sections ;
  **lueur d'ambiance** qui prend la couleur de la section à l'écran.
- **Sachets flottants** et reflet sur le logo dans l'accueil, qui recule et
  s'efface au scroll ; lettres qui sautent au survol.
- En-têtes de section : **mot fantôme** qui glisse avec le scroll, sur-titre
  **brouillé** puis révélé, chapeau qui **s'allume mot à mot**.
- **Ondes au clic**, **texte roulant** au survol, curseur aux couleurs du thé
  survolé, cartes dévoilées par un **volet**, nombre de sachets qui redéfile.
- Minuteur : **vapeur** et sachet qui **trempe** ; pied de page : badge
  circulaire qui tourne ; **changement de langue** en fondu glissé.
- Tout est désactivé si le système demande de **réduire les animations**.

Ces effets sont pilotés par `src/motion.rs` et `src/fx.rs` (une boucle
`requestAnimationFrame` qui écrit des variables CSS, sans re-rendu Yew) et par
le CSS.

## Démarrer

Prérequis : **Node 24** et **[Rust](https://rustup.rs)** (la version et la cible
`wasm32-unknown-unknown` sont fixées par `rust-toolchain.toml`), plus **Trunk** :

```bash
cargo install trunk --locked   # ou binaire : https://github.com/trunk-rs/trunk/releases
npm run dev                    # Trunk (rechargement à chaud) → http://localhost:3000
```

`npm run dev` lance aussi l'API Node sur le port 3001 ; Trunk lui relaie `/api/`.

## Autres commandes

```bash
npm run build   # build de production → ./dist (installe Rust + Trunk si absents)
npm start       # sert ./dist + l'API sur $PORT (défaut 3000)
cargo clippy --target wasm32-unknown-unknown   # lint
```

## Déploiement Heroku

- **Buildpack Node** (`git push heroku master`) : Heroku exécute `npm run build` ;
  `scripts/build.sh` installe alors Rust et Trunk dans un dossier temporaire
  (hors du slug), compile le WASM, puis `npm start` lance `server.js`.
- **Container stack** (`heroku stack:set container`) : `heroku.yml` construit le
  `Dockerfile` multi-étapes (Rust → WASM, puis image Node 24 légère).

Le serveur compresse les fichiers statiques (Brotli / gzip : le WASM passe
d'environ 450 Ko à 155 Ko), les sert avec un ETag et le type `application/wasm`.

## API publique

Le serveur expose une **API JSON publique** (lecture seule, CORS ouvert) avec
tout le catalogue, lu depuis `data/teas.json` (source unique). Le guide
d'infusion (`/api/brewing`) et le glossaire (`/api/glossary`) viennent de
`data/brewing.json` et `data/glossary.json`, partagés avec le site.

| Méthode & route         | Description                                                |
| ----------------------- | --------------------------------------------------------- |
| `GET /api`              | Index auto-documenté (endpoints, nombre de sachets).      |
| `GET /api/teas`         | Liste des sachets. Filtres/tri/pagination en query.       |
| `GET /api/teas/random`  | Un sachet au hasard (respecte les filtres).               |
| `GET /api/teas/:id`     | Un sachet par identifiant (ex. `/api/teas/yellow-label`). |
| `GET /api/families`     | Familles de couleur et leur nombre de sachets.            |
| `GET /api/types`        | Types de thé et leur nombre de sachets.                   |
| `GET /api/stats`        | Statistiques (totaux par famille, type, options).         |
| `GET /api/brewing`      | Guide d'infusion par type (`type`, `lang`).               |
| `GET /api/glossary`     | Glossaire des termes (`lang`).                            |
| `GET /api/quiz`         | Une question de quiz générée depuis le catalogue (`lang`).|
| `GET /api/exercises`    | Exercices guidés pour apprendre l'API (`lang`).           |
| `GET /api/openapi.json` | Spécification OpenAPI 3.1 (Swagger, génération de clients).|
| `GET /api/docs`         | Documentation écrite et complète (page HTML).             |
| `GET /api/swagger`      | Documentation interactive (Swagger UI).                   |
| `GET /api/playground`   | Bac à sable : tester les requêtes en direct + exercices.  |

Chaque sachet inclut aussi les champs dérivés affichés par l'app : `intensity`
(0–5) et `ingredients` (objet par langue, ou `null` pour un coffret). Les
réponses portent un **ETag** : un `If-None-Match` renvoie `304 Not Modified`.

**Versionnage & hypermedia** (pratique pour les étudiants) — toutes les routes
existent aussi sous **`/api/v1/…`**. Les listes incluent `meta` (page, pages,
perPage) et `_links` (`self`, `next`, `prev`, `first`, `last`), et chaque
sachet porte un `_links.self` vers sa fiche.

**Filtres de `/api/teas`** (combinables) :

- `family` — famille de couleur (`Jaune`, `Vert`, `Coffret`, …)
- `type` — type de thé (`blackTea`, `greenTea`, `infusion`, …)
- `search` — texte recherché dans le **nom et la description** (toutes langues)
- `caffeineFree`, `pyramid`, `coldBrew`, `coffret`, `limited` — `true` / `false`
- `lang` — `fr` | `en` | `es` : aplatit `name`/`description` dans cette langue

**Tri, pagination, format & champs** :

- `sort` — `id` | `name` | `family` | `type` ; `order` — `asc` (défaut) | `desc`
- `limit`, `offset` — entiers ≥ 0 ; la réponse JSON inclut `total`, `count`, `offset`, `limit`
- `format` — `json` (défaut) | `csv` (export tableur, aussi dispo sur `/api/teas/:id`)
- `fields` — liste de champs séparés par des virgules à conserver (ex. `id,name,colors`)

```bash
curl "https://<app>.herokuapp.com/api/teas?family=Vert&lang=en"
curl "https://<app>.herokuapp.com/api/teas?sort=name&order=desc&limit=10"
curl "https://<app>.herokuapp.com/api/teas?fields=id,name,colors&lang=fr"
curl "https://<app>.herokuapp.com/api/teas?format=csv" -o sachets.csv
curl "https://<app>.herokuapp.com/api/teas/random"
curl "https://<app>.herokuapp.com/api/stats"
```

## App iOS native (SwiftUI)

Une **app iOS 100 % native** (SwiftUI, aucune WebView) vit dans
[`native-ios/`](native-ios/). Elle **réutilise les mêmes données** que le site :
le catalogue des 78 sachets y est embarqué (`teas.json`, copie de
`data/teas.json`), donc l'app fonctionne **hors-ligne**.

C'est aussi la base nécessaire pour un **widget iPhone** : WidgetKit impose une
extension SwiftUI, qu'aucune coquille WebView ne peut fournir.

> Compiler et publier une app iOS nécessite **macOS + Xcode** et un **compte
> Apple Developer**. Le code et le projet sont prêts ; ces étapes se font sur un Mac.

### Envoi automatique sur TestFlight

Tout est enchaîné par la CI : **un push sur `master`** régénère le projet,
copie le catalogue (`data/teas.json`), **vérifie la compilation**, puis archive
et envoie sur TestFlight. Le **numéro de build est automatique** (nombre de
commits, donc toujours croissant) — rien à incrémenter.

Sans les secrets App Store Connect, la CI s'arrête après la compilation : elle
sert alors de garde-fou (on voit immédiatement si le Swift casse). Pour activer
l'envoi, ajouter les 4 secrets décrits dans
[`native-ios/TESTFLIGHT.md`](native-ios/TESTFLIGHT.md).

### Travailler en local (Mac)

```bash
brew install xcodegen          # une fois
npm run ios:prepare            # catalogue + projet Xcode
open native-ios/LiptonThes.xcodeproj
```

## Structure

```
index.html            Page d'entrée Trunk (+ écran d'intro statique)
Trunk.toml            Build WASM (wasm-opt, minification, proxy de dev)
Cargo.toml            Crate Rust du front (Yew 0.23, wasm-bindgen, web-sys)
build.rs              Compile data/*.json en données Rust (validées au build)
rust-toolchain.toml   Version de Rust + cible wasm32
src/
  main.rs             Montage Yew + service worker
  app.rs              État (langue, thème, filtres, tri, sections, fiche ouverte)
  catalog.rs          Types du catalogue (Tea, Family, TypeKey)
  i18n.rs             Textes de l'interface FR / EN / ES
  content.rs          Contenu éditorial FR / EN / ES (guide, types, FAQ, à propos, menu)
  tea.rs              Dégradés, repères d'infusion, libellés dérivés
  motion.rs           Moteur d'animation (curseur, aimant, 3D, bandeaux, reveal, intro)
  fx.rs               Défilement fluide, progression au scroll, ambiance, ondes,
                      textes brouillés, transitions de page
  dom.rs              Accès navigateur (stockage local, préférences)
  components/         Hero, bandeaux, barre d'outils + menu, groupes, carte, fiche,
                      minuteur, guide, types, couleurs, glossaire, FAQ, à propos, pied de page
styles/main.css       Styles et animations
public/               Assets statiques (polices, logo, textures, icônes, manifest, sw.js)
data/teas.json        Catalogue des sachets — source unique (front, API, iOS)
data/brewing.json     Conseils d'infusion par type (front, API)
data/glossary.json    Glossaire (front, API)
docs/fiche-produit/   Captures d'écran de la fiche produit
server.js             Serveur Node : ./dist + API JSON publique
api-content.js        Contenu pédagogique de l'API (infusion, glossaire, exercices)
scripts/              build.sh (production) et dev.sh (développement)
native-ios/           App iOS native SwiftUI (projet XcodeGen)
```

## Ajouter un thé

Ajoutez une entrée dans `data/teas.json` (et incrémentez `count`) : le build Rust
la valide (couleurs `#rrggbb`, famille et type connus, intensité 1–5,
traductions présentes) et échoue avec un message clair sinon.

```json
{
  "id": "vanille",
  "name": { "fr": "Vanille", "en": "Vanilla", "es": "Vainilla" },
  "description": {
    "fr": "Thé noir et vanille douce.",
    "en": "Black tea and soft vanilla.",
    "es": "Té negro y vainilla suave."
  },
  "typeKey": "blackTeaFlavored",
  "family": "Ambre",
  "colors": ["#e8c98a", "#b07d2e"],
  "ink": "#3d2600",
  "caffeineFree": false,
  "intensity": 3,
  "ingredients": {
    "fr": "Thé noir, arôme naturel",
    "en": "Black tea, natural flavouring",
    "es": "Té negro, aroma natural"
  }
}
```

Puis `npm run native:data` pour mettre à jour la copie de l'app iOS.

Les conseils d'infusion (`data/brewing.json`) et le glossaire
(`data/glossary.json`) se modifient de la même façon ; les textes des sections
du site sont dans `src/content.rs`.
