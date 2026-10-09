#!/bin/sh
# Développement : API Node sur :3001 + Trunk (rechargement à chaud) sur :3000.
# Trunk relaie /api/ vers le serveur Node (voir Trunk.toml).
set -eu
cd "$(dirname "$0")/.."

PORT=3001 node server.js &
API_PID=$!
trap 'kill "$API_PID" 2>/dev/null' EXIT INT TERM

trunk serve --port 3000
