# Multi-stage build: Build stage
FROM node:22-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies for building)
RUN npm ci

# Copy application files
COPY . .

# Build the React application
RUN npm run build

# Create uploads directory
RUN mkdir -p uploads/images uploads/pdfs uploads/drivers

# Ensure favicon files exist in dist directory
RUN if [ -f "public/favicon.png" ] && [ ! -f "dist/favicon.png" ]; then cp public/favicon.png dist/favicon.png; fi
RUN if [ -f "public/favicon.ico" ] && [ ! -f "dist/favicon.ico" ]; then cp public/favicon.ico dist/favicon.ico; fi
RUN if [ -f "dist/favicon.png" ] && [ ! -f "dist/favicon.ico" ]; then cp dist/favicon.png dist/favicon.ico; fi

# Set permissions
RUN chmod -R 755 uploads

# Production stage: Multi-stage with Nginx
FROM node:22-alpine

# Install nginx and curl
RUN apk add --no-cache nginx curl

# Copy built application and server files
COPY --from=builder /app/dist /app/dist
COPY --from=builder /app/uploads /app/uploads
COPY --from=builder /app/server.js /app/
COPY --from=builder /app/package*.json /app/
COPY --from=builder /app/database.js /app/
COPY --from=builder /app/sitemap-generator.js /app/
COPY --from=builder /app/setup_database_caprover.js /app/
COPY --from=builder /app/database_setup.sql /app/
COPY --from=builder /app/process.env /app/
COPY --from=builder /app/utils /app/utils
COPY --from=builder /app/node_modules /app/node_modules

# Copy nginx configuration
COPY nginx.conf /etc/nginx/http.d/default.conf

# Set working directory
WORKDIR /app

# Create startup script
RUN echo '#!/bin/sh' > /start.sh && \
    echo 'nginx &' >> /start.sh && \
    echo 'node server.js' >> /start.sh && \
    chmod +x /start.sh

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:80/health || exit 1

# Start both nginx and node
CMD ["/start.sh"]
