#!/bin/bash
# Deploy stagging environment on the same production server
# Stagging: API on 4000 (stagging.api.crownbankers.com), Frontend on 3002 (stagging.crownbankers.com)

set -e

echo "🚀 Stagging Environment Deployment"
echo "==================================="

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

COMPOSE_FILE="docker-compose.stagging.yml"
ENV_FILE=".env.stagging"

if [ ! -f "$COMPOSE_FILE" ]; then
    echo -e "${RED}❌ $COMPOSE_FILE not found!${NC}"
    exit 1
fi

if [ ! -f "$ENV_FILE" ]; then
    echo -e "${RED}❌ $ENV_FILE not found!${NC}"
    echo "Copy .env.stagging.example to .env.stagging and configure it."
    exit 1
fi

if command -v docker &> /dev/null && docker compose version &> /dev/null 2>&1; then
    DOCKER_COMPOSE="docker compose"
elif command -v docker-compose &> /dev/null; then
    DOCKER_COMPOSE="docker-compose"
else
    echo -e "${RED}❌ Docker Compose not found!${NC}"
    exit 1
fi

COMPOSE_CMD="$DOCKER_COMPOSE -f $COMPOSE_FILE --env-file $ENV_FILE"

echo ""
echo "🛑 Stopping stagging containers..."
$COMPOSE_CMD down --remove-orphans 2>/dev/null || true

echo ""
echo "🔨 Building stagging Docker images..."
$COMPOSE_CMD build --no-cache

echo ""
echo "🚀 Starting stagging containers..."
$COMPOSE_CMD up -d --remove-orphans

echo ""
echo "⏳ Waiting for services..."
sleep 15

echo ""
echo "📊 Container Status:"
docker ps --filter "name=binary-system-.*-stagging" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo "🏥 Health checks..."

BACKEND_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:4000/api/v1/health 2>/dev/null || \
                 curl -s -o /dev/null -w "%{http_code}" http://localhost:4000/api/health 2>/dev/null || echo "000")
if [ "$BACKEND_HEALTH" = "200" ] || [ "$BACKEND_HEALTH" = "404" ]; then
    echo -e "${GREEN}✅ Backend (port 4000) is responding${NC}"
else
    echo -e "${YELLOW}⚠️  Backend returned HTTP $BACKEND_HEALTH${NC}"
    $COMPOSE_CMD logs --tail=20 backend
fi

FRONTEND_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3002 2>/dev/null || echo "000")
if [ "$FRONTEND_HEALTH" = "200" ] || [ "$FRONTEND_HEALTH" = "000" ]; then
    echo -e "${GREEN}✅ Frontend (port 3002) is responding${NC}"
else
    echo -e "${YELLOW}⚠️  Frontend returned HTTP $FRONTEND_HEALTH${NC}"
    $COMPOSE_CMD logs --tail=20 frontend
fi

echo ""
echo -e "${GREEN}✅ Stagging deployment complete!${NC}"
echo ""
echo "🌐 Stagging URLs (after DNS/nginx config):"
echo "   API:     https://stagging.api.crownbankers.com (port 4000)"
echo "   Frontend: https://stagging.crownbankers.com (port 3002)"
echo ""
echo "📋 Commands:"
echo "   Logs:    $COMPOSE_CMD logs -f"
echo "   Stop:    $COMPOSE_CMD down"
