# 🫖 Lipton — Sachets de thé par couleurs

Front-end **React 19** (build **esbuild**, serveur **Node**) qui présente une
collection de sachets de thé Lipton **triés par couleurs**. Chaque thé a sa
**fiche colorée** reprenant les teintes du thé ou de sa boîte (dégradé +
nuancier des codes hex).

## Fonctionnalités

- 🎨 **Fiches colorées** — dégradé aux couleurs du thé / de la boîte, encre lisible adaptée.
- 🗂️ **Tri par familles de couleurs** — Jaune, Ambre, Rouge, Rose, Violet, Bleu, Vert.
- 🔘 **Filtres** par couleur en un clic.
- 🍵 **Sachet illustré** et nuancier hex sur chaque carte.
- ⚡ Stack légère : React 19 + esbuild, serveur Node sans dépendance.

## Démarrer

```bash
npm install
npm run dev   # serveur esbuild + watch  →  http://localhost:3000
```

## Autres commandes

```bash
npm run build # build de production dans ./dist
npm start     # sert ./dist sur $PORT (défaut 3000)
```

## Déploiement Heroku

L'app fonctionne directement sur le **buildpack Node** de Heroku :

```bash
git push heroku main
```

Heroku exécute `npm run build` (esbuild → `./dist`) puis `npm start`
(`server.js`, qui écoute sur `$PORT`). Un `Dockerfile` + `heroku.yml` sont
aussi fournis si tu préfères un déploiement en *container stack*.

## API publique

Le serveur expose une **API JSON publique** (lecture seule, CORS ouvert) avec
tout le catalogue. Les données sont générées au build depuis `src/data.ts`
(source unique) vers `dist/api/teas.json`.

| Méthode & route        | Description                                                |
| ---------------------- | --------------------------------------------------------- |
| `GET /api`             | Index auto-documenté (endpoints, nombre de sachets).      |
| `GET /api/teas`        | Liste des sachets. Filtres en query (voir ci-dessous).    |
| `GET /api/teas/:id`    | Un sachet par identifiant (ex. `/api/teas/yellow-label`). |
| `GET /api/families`    | Familles de couleur et leur nombre de sachets.            |
| `GET /api/types`       | Types de thé et leur nombre de sachets.                   |

**Filtres de `/api/teas`** (combinables) :

- `family` — famille de couleur (`Jaune`, `Vert`, `Coffret`, …)
- `type` — type de thé (`blackTea`, `greenTea`, `infusion`, …)
- `search` — texte recherché dans le nom (toutes langues)
- `caffeineFree`, `pyramid`, `coldBrew`, `coffret`, `limited` — `true` / `false`
- `lang` — `fr` | `en` | `es` : aplatit `name`/`description` dans cette langue

```bash
curl https://<app>.herokuapp.com/api/teas?family=Vert&lang=en
curl https://<app>.herokuapp.com/api/teas/english-breakfast
```

## Structure

```
build.mjs         Build esbuild (et serveur de dev avec --serve)
server.js         Serveur statique Node + API JSON publique, sert ./dist sur $PORT
Procfile          web: npm start
src/
  main.tsx        Montage React
  App.tsx         UI : groupes de couleurs + cartes
  data.ts         Données des sachets et leurs couleurs
  styles.css      Styles
```

## Ajouter un thé

Ajoutez une entrée dans `TEAS` (`src/data.ts`) avec sa famille de couleur et
ses deux couleurs de dégradé (`colors`) :

```ts
{
  id: "vanille",
  name: "Vanille",
  type: "Thé noir aromatisé",
  description: "Thé noir et vanille douce.",
  family: "Ambre",
  colors: ["#e8c98a", "#b07d2e"],
  ink: "#3d2600",
  caffeine: "Théiné",
}
```
