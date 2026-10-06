# Imagen de la API. Contexto de build: raíz del monorepo.
#   docker build -f apps/api/Dockerfile -t pos-api .
# Etapas:
#   build   -> dependencias completas + compilación (también ejecuta migraciones)
#   runtime -> solo dependencias de producción y JS compilado

FROM node:24-alpine AS base
WORKDIR /app

FROM base AS build
COPY package.json package-lock.json ./
COPY packages/shared/package.json packages/shared/
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/
RUN npm ci --ignore-scripts
COPY tsconfig.base.json ./
COPY packages/shared packages/shared
COPY apps/api apps/api
RUN npm run build -w @pos/shared \
  && npm run prisma:generate -w @pos/api \
  && npm run build -w @pos/api

FROM base AS runtime
ENV NODE_ENV=production
COPY package.json package-lock.json ./
COPY packages/shared/package.json packages/shared/
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/
# --omit=optional: el CLI de Prisma es "devOptional" (peer opcional de
# @prisma/client) y --omit=dev por sí solo no lo excluye.
RUN npm ci --omit=dev --omit=optional --ignore-scripts -w @pos/api \
  && npm cache clean --force
COPY --from=build /app/packages/shared/dist packages/shared/dist
COPY --from=build /app/apps/api/dist apps/api/dist
USER node
WORKDIR /app/apps/api
EXPOSE 3001
HEALTHCHECK --interval=15s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3001/api/health > /dev/null || exit 1
CMD ["node", "--enable-source-maps", "dist/main.js"]
