FROM node:20-bookworm-slim@sha256:ef358d9fa0734e2c3b42482aa352c28a59245bc3d32e07ef57810cf8ba9092c5 AS deps
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates curl && rm -rf /var/lib/apt/lists/*
# Copy root and workspace package manifests to leverage npm ci with workspaces
COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/package.json
COPY packages/types/package.json packages/types/package.json
COPY packages/config/package.json packages/config/package.json
COPY packages/ui/package.json packages/ui/package.json
RUN npm ci --silent

FROM node:20-bookworm-slim@sha256:ef358d9fa0734e2c3b42482aa352c28a59245bc3d32e07ef57810cf8ba9092c5 AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Generate Prisma client for API
ENV PRISMA_CLI_BINARY_TARGETS=linux-arm64-openssl-1.1.x,linux-arm64-openssl-3.0.x
RUN rm -rf node_modules/.prisma && npx prisma generate --schema apps/api/prisma/schema.prisma
# Build API
WORKDIR /app/apps/api
RUN npx -y nest build

FROM node:20-bookworm-slim@sha256:ef358d9fa0734e2c3b42482aa352c28a59245bc3d32e07ef57810cf8ba9092c5 AS runtime
WORKDIR /app
ENV NODE_ENV=production
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates && rm -rf /var/lib/apt/lists/*
# Create non-root user
RUN useradd -m nodeuser
# Copy runtime deps and built dist
# Ensure package.json is present before pruning so npm keeps required deps
COPY --from=build /app/apps/api/package.json ./package.json
# Use node_modules after prisma generate (from build stage)
COPY --from=build /app/node_modules ./node_modules
# Prune dev dependencies as root, then hand off ownership
RUN npm prune --omit=dev && chown -R nodeuser:nodeuser /app
COPY --from=build /app/apps/api/dist ./dist
USER nodeuser
EXPOSE 3001
HEALTHCHECK CMD node -e "require('http').get('http://127.0.0.1:3001/v1/ready',r=>process.exit(0)).on('error',()=>process.exit(1))"
CMD ["node","dist/main.js"]

