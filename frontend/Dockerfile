# Stage 1 — Build
FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

COPY . .

RUN npm run build

# Stage 2 — Serve
FROM node:22-alpine

RUN npm install -g serve

WORKDIR /app
COPY --from=build /app/dist ./dist

CMD serve -s dist -l ${PORT:-5173}
