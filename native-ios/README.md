# Lipton Thés — app iOS native (SwiftUI)

Application iOS **100 % native** (SwiftUI), séparée du site web mais qui
**réutilise les mêmes données** : le catalogue des 78 sachets est embarqué
(`Resources/teas.json`, généré par le build web dans `dist/api/teas.json`), donc
l'app fonctionne **hors-ligne**. Aucune WebView : toute l'interface est native.

## Fonctionnalités

- Catalogue groupé par **famille de couleur** (sections repliables).
- Cartes aux **couleurs du thé** (dégradé + texture toile), fiche détaillée.
- **Filtre** par couleur, **tri** par couleur ou intensité.
- **Intensité**, **ingrédients**, nuancier hex.
- **3 langues** (FR/EN/ES), **mode clair/sombre** automatique.

## Compiler (sur un Mac)

Prérequis : **macOS + Xcode**, et un **compte Apple Developer** pour publier.
Le projet Xcode est généré avec [XcodeGen](https://github.com/yonaskolb/XcodeGen).

```bash
brew install xcodegen        # une fois
cd native-ios
xcodegen generate            # crée LiptonThes.xcodeproj
open LiptonThes.xcodeproj     # Xcode → sélectionne ton équipe → Run / Archive
```

## Tester sur TestFlight (Xcode Cloud)

Le dépôt est prêt pour **Xcode Cloud** : signature auto, scheme partagé, et un
script `ci_scripts/ci_post_clone.sh` qui régénère le projet dans le runner.
Étapes détaillées (fiche App Store Connect, workflow, TestFlight) :
**[TESTFLIGHT.md](TESTFLIGHT.md)**.

## Mettre à jour les données

Le fichier `Resources/teas.json` est une copie de `dist/api/teas.json`
(source unique). Après avoir modifié le catalogue côté web :

```bash
# depuis la racine du dépôt
npm run build
cp dist/api/teas.json native-ios/Resources/teas.json
```

## Structure

```
project.yml            Définition du projet (XcodeGen)
Sources/
  LiptonThesApp.swift  Point d'entrée @main
  ContentView.swift    Écran principal (filtres, tri, sections)
  TeaCard.swift → Components.swift  Carte, sachet, points d'intensité, texture
  TeaDetailView.swift  Fiche produit (sheet)
  Models.swift         Tea / Localized (Codable)
  DataStore.swift      Chargement de teas.json
  Localization.swift   Textes et libellés FR/EN/ES
  Theme.swift          Couleurs hex, dégradés
Resources/
  teas.json            Catalogue (78 sachets)
  Assets.xcassets      Icône, texture, couleur d'accent
```
