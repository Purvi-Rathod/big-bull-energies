# Backend Dockerfile - SECURITY HARDENED
FROM node:18-alpine

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies with retry logic for network issues
COPY package*.json ./
RUN npm config set registry https://registry.npmjs.org/ && \
    npm config set fetch-timeout 300000 && \
    npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000 && \
    npm config set maxsockets 5 && \
    (npm ci --omit=dev || (sleep 10 && npm ci --omit=dev) || (sleep 20 && npm ci --omit=dev)) && \
    npm cache clean --force

# Copy the rest of the application
COPY . .

# Build the TypeScript code
RUN npm run build

# Create writable directories for runtime (logs, temp files)
RUN mkdir -p /usr/src/app/logs /usr/src/app/tmp && \
    chown -R nodejs:nodejs /usr/src/app

# Switch to non-root user
USER nodejs

# Expose the port
EXPOSE 8000

# Start the app
CMD ["npm", "start"]
