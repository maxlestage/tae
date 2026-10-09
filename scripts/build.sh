#!/bin/sh
# Build de production du front Yew → ./dist (appelé par `npm run build`).
#
# Fonctionne aussi sur une machine sans Rust (buildpack Node de Heroku, poste
# neuf) : la toolchain (figée par rust-toolchain.toml) et Trunk sont alors
# installés dans un dossier temporaire, hors du dépôt et du slug Heroku.
set -eu

TRUNK_VERSION="0.21.14"
cd "$(dirname "$0")/.."

TOOLS="${LIPTON_TOOLS_DIR:-${TMPDIR:-/tmp}/lipton-build-tools}"
mkdir -p "$TOOLS"

fetch() {
  curl --proto '=https' --tlsv1.2 -sSfL "$1" -o "$2"
}

case "$(uname -s)-$(uname -m)" in
  Linux-x86_64) triple="x86_64-unknown-linux-gnu" ;;
  Linux-aarch64 | Linux-arm64) triple="aarch64-unknown-linux-gnu" ;;
  Darwin-x86_64) triple="x86_64-apple-darwin" ;;
  Darwin-arm64) triple="aarch64-apple-darwin" ;;
  *) triple="" ;;
esac

# --- Rust (rustup lit rust-toolchain.toml : version + cible wasm32) ---------
if ! command -v cargo >/dev/null 2>&1; then
  if [ -x "$HOME/.cargo/bin/cargo" ]; then
    PATH="$HOME/.cargo/bin:$PATH"
  else
    [ -n "$triple" ] || { echo "Plateforme non gérée : installe Rust (https://rustup.rs)." >&2; exit 1; }
    export RUSTUP_HOME="$TOOLS/rustup" CARGO_HOME="$TOOLS/cargo"
    if [ ! -x "$CARGO_HOME/bin/cargo" ]; then
      echo "▸ Installation de Rust (rustup) dans $TOOLS…"
      fetch "https://static.rust-lang.org/rustup/dist/$triple/rustup-init" "$TOOLS/rustup-init"
      chmod +x "$TOOLS/rustup-init"
      "$TOOLS/rustup-init" -y --profile minimal --default-toolchain none --no-modify-path
    fi
    PATH="$CARGO_HOME/bin:$PATH"
  fi
fi
export PATH

# --- Trunk (binaire officiel) -------------------------------------------------
if ! command -v trunk >/dev/null 2>&1; then
  [ -n "$triple" ] || { echo "Plateforme non gérée : cargo install trunk --locked" >&2; exit 1; }
  bin="$TOOLS/trunk-$TRUNK_VERSION"
  if [ ! -x "$bin/trunk" ]; then
    echo "▸ Téléchargement de Trunk $TRUNK_VERSION…"
    mkdir -p "$bin"
    fetch "https://github.com/trunk-rs/trunk/releases/download/v$TRUNK_VERSION/trunk-$triple.tar.gz" "$bin/trunk.tar.gz"
    tar -xzf "$bin/trunk.tar.gz" -C "$bin"
    rm "$bin/trunk.tar.gz"
  fi
  PATH="$bin:$PATH"
fi

# Sur Heroku (variable STACK), les objets de compilation restent hors du slug.
if [ -n "${STACK:-}" ] && [ -z "${CARGO_TARGET_DIR:-}" ]; then
  export CARGO_TARGET_DIR="$TOOLS/target"
fi

trunk build --release
echo "✓ build → ./dist"
