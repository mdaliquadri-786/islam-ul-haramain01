# Multi-stage Dockerfile for @islamic/web Next.js Monorepo Application
# Base image
FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# Dependencies stage
FROM base AS deps
WORKDIR /app
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/web/package.json ./apps/web/
COPY packages/islamic-engine/package.json ./packages/islamic-engine/
COPY packages/database/package.json ./packages/database/
COPY packages/ui/package.json ./packages/ui/
RUN pnpm install --frozen-lockfile

# Builder stage
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/web/node_modules ./apps/web/node_modules
COPY --from=deps /app/packages/islamic-engine/node_modules ./packages/islamic-engine/node_modules
COPY --from=deps /app/packages/database/node_modules ./packages/database/node_modules
COPY --from=deps /app/packages/ui/node_modules ./packages/ui/node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
RUN pnpm --filter ./packages/* build
RUN pnpm --filter ./apps/web build

# Runner stage (Production container)
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Create unprivileged application user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Set correct permissions
COPY --from=builder /app/apps/web/public ./apps/web/public
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next ./apps/web/.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/web/node_modules ./apps/web/node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/apps/web/package.json ./apps/web/package.json
COPY --from=builder /app/package.json ./package.json

USER nextjs

EXPOSE 3000

CMD ["node", "apps/web/node_modules/next/dist/bin/next", "start", "apps/web"]
