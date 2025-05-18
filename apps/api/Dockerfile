# Stage 1: Builder
FROM node:20-alpine AS builder
WORKDIR /workspace

# Install global tooling (esbuild, etc.)
RUN npm install --global esbuild

# Copy only lockfiles + nx config for caching
COPY package.json package-lock.json nx.json tsconfig.base.json ./
RUN npm ci

# Copy libs and API source
COPY libs/ ./libs/
COPY apps/api/ ./apps/api/

# Copy root ESLint config so Nx can find it
COPY eslint.config.mjs ./

# Build only the API app
RUN npx nx build api --configuration=production --skip-nx-cache

# Stage 2: Runner
FROM node:20-alpine AS runner
WORKDIR /workspace

# Non-root user
RUN addgroup -g 1001 appgroup && \
    adduser -u 1001 -S appuser -G appgroup

# Copy built API
COPY --from=builder --chown=appuser:appgroup \
     /workspace/dist/apps/api ./dist

# Copy runtime deps declarations
COPY package.json package-lock.json ./

# Install prod deps only
RUN npm ci --production

USER appuser
EXPOSE 3000

# Start the NestJS application
CMD ["node", "dist/main.js"]
