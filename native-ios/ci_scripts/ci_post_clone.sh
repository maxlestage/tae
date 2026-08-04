#!/bin/sh
# Xcode Cloud — exécuté après le clonage, avant la résolution du projet.
# Le projet Xcode est généré par XcodeGen (non versionné) : on le recrée ici.
set -e

echo "▸ Installation de XcodeGen…"
brew install xcodegen

echo "▸ Génération du projet Xcode…"
cd "$CI_PRIMARY_REPOSITORY_PATH/native-ios"
xcodegen generate

echo "✓ LiptonThes.xcodeproj prêt."
