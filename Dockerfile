# --- Stage 1: Install dependencies ---
FROM node:20-alpine AS deps
# Alpine is even smaller than slim; libc6-compat is needed for Next.js/Sharp
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm i

# --- Stage 2: Build the project ---
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

COPY .env ./
# Pass your build-time env vars here

RUN npm run build

# --- Stage 3: The Production Runner (The only part that stays) ---
FROM node:20-alpine AS runner
WORKDIR /app

ENV PORT 3000

# Create a secure user so you don't run as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# ONLY copy what is strictly necessary from the builder stage
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

# Next.js standalone mode generates a server.js file
CMD ["node", "server.js"]
