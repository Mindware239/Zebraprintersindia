# Use Node.js 22 LTS
FROM node:22-alpine

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

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:80/health || exit 1

# Start the application
CMD ["npm", "start"]
