# Tester l'app sur TestFlight avec Xcode Cloud

Xcode Cloud compile l'app dans le cloud d'Apple, la **signe automatiquement** et
l'envoie sur **TestFlight** — tu n'as pas besoin de compiler toi-même. Comme le
projet Xcode est généré par XcodeGen, un script (`ci_scripts/ci_post_clone.sh`)
le régénère automatiquement dans le runner. Tout est déjà en place dans le dépôt ;
il reste la partie « comptes Apple » à faire une fois.

## Prérequis

- Un **Mac avec Xcode 15+**.
- L'**Apple Developer Program** (99 $/an) — obligatoire pour TestFlight.
- Le dépôt sur GitHub (`maxlestage/tae`, déjà le cas).

## 1. Créer la fiche de l'app dans App Store Connect

1. [developer.apple.com](https://developer.apple.com) → **Certificates, Identifiers & Profiles** → **Identifiers** → **+** → *App IDs* → *App*.
   - Bundle ID (explicite) : `com.maxlestage.liptonthes`.
2. [appstoreconnect.apple.com](https://appstoreconnect.apple.com) → **Apps** → **+** → **Nouvelle app**.
   - Plateforme **iOS**, nom **Lipton Thés**, langue, **Bundle ID** ci-dessus, un SKU au choix (ex. `liptonthes`).
   - *(Pas besoin de soumettre à la revue pour du test interne TestFlight.)*

## 2. Générer le projet et choisir l'équipe (une fois, sur le Mac)

```bash
brew install xcodegen
cd native-ios
xcodegen generate
open LiptonThes.xcodeproj
```

Dans Xcode : cible **LiptonThes** → onglet **Signing & Capabilities** →
coche **Automatically manage signing** → choisis ton **Team**.

## 3. Créer le workflow Xcode Cloud

1. Dans Xcode, menu **Integrate → Create Workflow** (ou **Product → Xcode Cloud**).
2. Connecte-toi et **autorise l'accès au dépôt GitHub** (installe l'app GitHub « Xcode Cloud »).
3. Choisis le scheme **LiptonThes**.
4. Configure le workflow :
   - **Condition de départ** : par ex. « Branch Changes » sur `master` (ou sur un tag).
   - **Action** : **Archive** (iOS), puis, dans *Post-Actions*, **TestFlight (Internal Testing)**.
   - Xcode Cloud détecte `native-ios/ci_scripts/ci_post_clone.sh` et régénère le projet à chaque build.
5. Enregistre → Xcode Cloud lance le **premier build**.

## 4. Installer via TestFlight

1. Quand le build est terminé et « traité », va dans App Store Connect → **TestFlight**.
2. Ajoute-toi comme **testeur interne** (Internal Testing → ton compte).
3. Installe l'app **TestFlight** sur ton iPhone, accepte l'invitation, installe la build.

## Bon à savoir

- **Signature** : gérée automatiquement par Xcode Cloud (aucun certificat à exporter).
- **Conformité au chiffrement** : déjà réglée (`ITSAppUsesNonExemptEncryption = NO`), pas de question à chaque build.
- **Numéro de build** : active « Increment build number » dans l'action *Archive*, ou incrémente `CURRENT_PROJECT_VERSION` dans `project.yml`.
- **Où vivent les scripts CI** : `native-ios/ci_scripts/` (à côté du projet). Ne pas renommer `ci_post_clone.sh`.
- Le **site web et l'API** ne sont pas concernés : Xcode Cloud ne construit que l'app iOS.
