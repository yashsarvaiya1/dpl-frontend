# Use the official Bun image
FROM oven/bun:1 AS builder

WORKDIR /app

# Install dependencies
# We use bun.lock here because your project is using the new Bun 1.2+ format
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# Copy the rest of the application
COPY . .

# Build the Next.js application
RUN bun run build

# Production Stage
FROM oven/bun:1-slim AS runner
WORKDIR /app

# Copy built assets from builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000

# Start the application
CMD ["bun", "run", "start"]
