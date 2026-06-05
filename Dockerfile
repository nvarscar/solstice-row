# Development stage — source mounted at runtime via volume, hot-reload via next dev
FROM node:lts-alpine AS dev
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY scripts/init.sh ./scripts/init.sh
RUN chmod +x ./scripts/init.sh
EXPOSE 3000
CMD ["sh", "./scripts/init.sh"]

# Stage 1: production dependencies only
FROM node:lts-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev

# Stage 2: full install + build
FROM node:lts-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 3: slim runtime image
FROM node:lts-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/content ./content
COPY --from=builder /app/next.config.mjs ./
COPY --from=builder /app/package.json ./
COPY scripts/init.sh ./scripts/init.sh
RUN chmod +x ./scripts/init.sh

EXPOSE 3000
CMD ["sh", "./scripts/init.sh"]
