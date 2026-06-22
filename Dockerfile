# ─── Stage 1: Build ───────────────────────────────────────────────────────────
FROM node:22-alpine AS build

# Set working directory
WORKDIR /app

# Increase Node.js heap size to prevent OOM on low-memory VPS
ENV NODE_OPTIONS="--max-old-space-size=2048"

# Copy package manifests first (layer cache optimisation)
COPY package.json package-lock.json ./

# Install ALL dependencies (including devDependencies needed for build)
RUN npm ci --prefer-offline

# Copy application source
COPY . .

# Build the app (tsc type-check + vite bundle)
RUN npm run build

# ─── Stage 2: Serve ───────────────────────────────────────────────────────────
FROM nginx:stable-alpine AS production

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built static assets from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Expose HTTP port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
