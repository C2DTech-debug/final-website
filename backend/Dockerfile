# syntax=docker/dockerfile:1

# ---------- Install deps ----------
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# ---------- Build TypeScript ----------
FROM node:20-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# ---------- Runtime ----------
FROM node:20-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app

# Production dependencies only
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Compiled output
COPY --from=build /app/dist ./dist

# Writable runtime dirs (media uploads + logs). Mount a volume on /app/uploads.
RUN mkdir -p /app/uploads /app/logs

EXPOSE 5000

CMD ["node", "dist/server.js"]
