# Backend Dockerfile - SECURITY HARDENED
FROM node:18-alpine

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm ci --only=production && \
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
