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

# Production stage: Use Nginx to serve static files and proxy API requests
FROM nginx:alpine

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built application from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html/dist
COPY --from=builder /app/uploads /app/uploads

# Copy server files for API
COPY --from=builder /app/server.js /app/
COPY --from=builder /app/package*.json /app/
COPY --from=builder /app/database.js /app/
COPY --from=builder /app/sitemap-generator.js /app/
COPY --from=builder /app/utils /app/utils
COPY --from=builder /app/node_modules /app/node_modules

# Create a startup script that runs both Nginx and Node.js
RUN echo '#!/bin/sh' > /start.sh && \
    echo 'nginx &' >> /start.sh && \
    echo 'cd /app && node server.js &' >> /start.sh && \
    echo 'wait' >> /start.sh && \
    chmod +x /start.sh

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:80/health || exit 1

# Start both Nginx and Node.js
CMD ["/start.sh"]
