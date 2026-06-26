# --- Étape build : installe les deps et compile le front avec esbuild ---
FROM node:22-slim AS build
WORKDIR /app

# Cache des dépendances
COPY package.json package-lock.json* ./
RUN npm install

# Build statique → ./dist
COPY . .
RUN npm run build

# --- Étape runtime : image légère qui sert ./dist ---
FROM node:22-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /app/dist ./dist
COPY server.js ./

# Heroku fournit $PORT au démarrage ; server.js l'utilise.
EXPOSE 3000
CMD ["node", "server.js"]
