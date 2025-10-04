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

# Create favicon.ico from favicon.png for nginx compatibility
RUN cp dist/favicon.png dist/favicon.ico

# Set permissions
RUN chmod -R 755 uploads

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Start the application
CMD ["npm", "start"]
