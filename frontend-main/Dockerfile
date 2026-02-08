# ---- Builder ----
    FROM node:20-slim AS builder

    WORKDIR /app
    
    # Copy npm config to force correct SWC binary
    COPY .npmrc .npmrc
    
    # Copy package files
    COPY package*.json ./
    
    # Install ALL dependencies (this downloads the correct Linux SWC)
    RUN npm install
    
    # Copy entire source code
    COPY . .
    
    # Build Next.js
    RUN npm run build
    
    # ---- Runner ----
    FROM node:20-slim AS runner
    
    WORKDIR /app
    
    ENV NODE_ENV=production
    
    # Copy npm config again (sometimes needed)
    COPY .npmrc .npmrc
    
    # Copy package files
    COPY package*.json ./
    
    # Install ONLY production deps
    RUN npm install --production
    
    # Copy build artifacts from builder
    COPY --from=builder /app/.next ./.next
    COPY --from=builder /app/public ./public
    COPY --from=builder /app/next.config.js ./next.config.js
    
    EXPOSE 3000
    
    CMD ["npm", "start"]