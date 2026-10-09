# --- Étape 1 : front Yew (Rust → WebAssembly) compilé par Trunk → ./dist ---
FROM rust:1.97-slim AS front
WORKDIR /app
RUN apt-get update \
  && apt-get install -y --no-install-recommends curl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

COPY rust-toolchain.toml Cargo.toml Cargo.lock build.rs Trunk.toml index.html ./
COPY scripts ./scripts
COPY data ./data
COPY src ./src
COPY styles ./styles
COPY public ./public
RUN sh scripts/build.sh

# --- Étape 2 : image légère Node qui sert ./dist + l'API publique ---
FROM node:24-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production

COPY --from=front /app/dist ./dist
COPY server.js api-content.js package.json ./
COPY data ./data

# Heroku fournit $PORT au démarrage ; server.js l'utilise.
EXPOSE 3000
CMD ["node", "server.js"]
