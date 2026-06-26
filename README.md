# 🫖 Lipton — Sachets de thé par couleurs

Front-end **React + Bun** qui présente une collection de sachets de thé Lipton
**triés par couleurs**. Chaque thé a sa **fiche colorée** reprenant les teintes
du thé ou de sa boîte (dégradé + nuancier des codes hex).

## Fonctionnalités

- 🎨 **Fiches colorées** — dégradé aux couleurs du thé / de la boîte, encre lisible adaptée.
- 🗂️ **Tri par familles de couleurs** — Jaune, Ambre, Rouge, Rose, Violet, Bleu, Vert.
- 🔘 **Filtres** par couleur en un clic.
- 🍵 **Sachet illustré** et nuancier hex sur chaque carte.
- ⚡ Stack légère : React 19 + Bun, sans bundler externe.

## Démarrer

```bash
bun install
bun dev      # serveur de dev avec hot reload  →  http://localhost:3000
```

## Autres commandes

```bash
bun start    # sert l'app sans hot reload
bun build    # build de production dans ./dist
```

## Structure

```
index.html        Point d'entrée HTML (importé par Bun)
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
