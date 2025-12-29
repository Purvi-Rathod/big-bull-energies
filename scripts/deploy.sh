#!/bin/bash

# Deployment script for CNEOX Binary MLM Platform
# This script handles a fresh deployment

set -e

echo "🚀 CNEOX Platform Deployment"
echo "============================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo -e "${RED}❌ .env file not found!${NC}"
    echo "Please create .env file from .env.example"
    exit 1
fi

# Detect Docker Compose command
if command -v docker &> /dev/null && docker compose version &> /dev/null; then
    DOCKER_COMPOSE="docker compose"
    echo -e "${GREEN}✅ Using Docker Compose v2${NC}"
elif command -v docker-compose &> /dev/null; then
    DOCKER_COMPOSE="docker-compose"
    echo -e "${YELLOW}⚠️  Using Docker Compose v1 (legacy)${NC}"
else
    echo -e "${RED}❌ Docker Compose not found!${NC}"
    echo "Please install Docker Compose:"
    echo "  - Docker Compose v2: Already included with Docker Desktop"
    echo "  - Docker Compose v1: apt install docker-compose"
    exit 1
fi

# Stop existing containers
echo ""
echo "🛑 Stopping existing containers..."
$DOCKER_COMPOSE down 2>/dev/null || true
docker stop binary-system-frontend binary-system-backend 2>/dev/null || true
docker rm binary-system-frontend binary-system-backend 2>/dev/null || true

# Remove old images (optional - comment out if you want to keep old images)
read -p "Do you want to remove old images? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🗑️  Removing old images..."
    docker rmi binary_system-backend binary_system-frontend 2>/dev/null || true
fi

# Build new images
echo ""
echo "🔨 Building Docker images..."
$DOCKER_COMPOSE build --no-cache

# Start containers
echo ""
echo "🚀 Starting containers..."
$DOCKER_COMPOSE up -d

# Wait for services to be ready
echo ""
echo "⏳ Waiting for services to start..."
sleep 5

# Check container status
echo ""
echo "📊 Container Status:"
docker ps --filter "name=binary-system" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# Health checks
echo ""
echo "🏥 Running health checks..."

# Backend health check
if curl -f http://localhost:8000/health &> /dev/null; then
    echo -e "${GREEN}✅ Backend is healthy${NC}"
else
    echo -e "${YELLOW}⚠️  Backend health check failed (may still be starting)${NC}"
fi

# Frontend health check
if curl -f http://localhost:3000 &> /dev/null; then
    echo -e "${GREEN}✅ Frontend is responding${NC}"
else
    echo -e "${YELLOW}⚠️  Frontend health check failed (may still be starting)${NC}"
fi

echo ""
echo -e "${GREEN}✅ Deployment complete!${NC}"
echo ""
echo "📋 Useful commands:"
echo "  View logs:        $DOCKER_COMPOSE logs -f"
echo "  View backend:     $DOCKER_COMPOSE logs -f backend"
echo "  View frontend:    $DOCKER_COMPOSE logs -f frontend"
echo "  Stop services:    $DOCKER_COMPOSE down"
echo "  Restart services: $DOCKER_COMPOSE restart"
echo ""
echo "🌐 Access the application:"
echo "  Frontend: http://199.188.204.202:3000"
echo "  Backend:  http://199.188.204.202:8000"
echo "  API Docs: http://199.188.204.202:8000/api-docs"
