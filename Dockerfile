# --- Étape build : installe les deps et compile le front avec Bun ---
FROM oven/bun:1 AS build
WORKDIR /app

# Cache des dépendances
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# Build statique → ./dist
COPY . .
RUN bun build ./index.html --outdir=dist --minify

# --- Étape runtime : image légère qui sert ./dist ---
FROM oven/bun:1-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /app/dist ./dist
COPY server.ts ./

# Heroku fournit $PORT au démarrage ; server.ts l'utilise.
EXPOSE 3000
CMD ["bun", "server.ts"]
