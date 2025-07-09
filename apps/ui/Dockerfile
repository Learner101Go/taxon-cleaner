# Stage 1: Builder
FROM node:20-alpine AS builder
WORKDIR /workspace

# Copy root lockfiles + nx config
COPY package.json package-lock.json nx.json tsconfig.base.json ./
RUN npm ci

# Copy root ESLint config so Nx can find it
COPY eslint.config.mjs ./

# Copy UI source and shared libs
COPY libs/ ./libs/
COPY apps/ui/ ./apps/ui/

# Build only the UI app
RUN npx nx build ui --configuration=production --skip-nx-cache

# Stage 2: nginx server
FROM nginx:1.25-alpine AS production
# Remove default site
RUN rm -f /etc/nginx/conf.d/default.conf

# Copy custom nginx config (if you have one)
COPY apps/ui/nginx.conf /etc/nginx/conf.d/default.conf

# Copy built UI
COPY --from=builder /workspace/dist/apps/ui/browser /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
