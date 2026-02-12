#!/bin/bash
# Deploy stagging containers on server (pull images, run on ports 3002 & 4000)
# Run on: stagging server
# Usage: ./scripts/deploy-stagging-server.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_ROOT"

IMAGE_PREFIX="mayank934"
TAG="stagging"
ENV_FILE=".env.stagging"

echo "🚀 Deploying stagging from Docker Hub"
echo "====================================="

if [ ! -f "$ENV_FILE" ]; then
    echo "❌ .env.stagging not found!"
    exit 1
fi

echo ""
echo "📥 Pulling latest images..."
docker pull ${IMAGE_PREFIX}/crown-backend-image:${TAG}
docker pull ${IMAGE_PREFIX}/crown-frontend-image:${TAG}

echo ""
echo "🛑 Stopping existing stagging containers..."
docker stop binary-system-backend-stagging binary-system-frontend-stagging 2>/dev/null || true
docker rm binary-system-backend-stagging binary-system-frontend-stagging 2>/dev/null || true

echo ""
echo "🚀 Starting stagging backend (port 4000)..."
docker run -d \
  --name binary-system-backend-stagging \
  --restart unless-stopped \
  -p 4000:8000 \
  --env-file "$ENV_FILE" \
  ${IMAGE_PREFIX}/crown-backend-image:${TAG}

echo ""
echo "🚀 Starting stagging frontend (port 3002)..."
docker run -d \
  --name binary-system-frontend-stagging \
  --restart unless-stopped \
  -p 3002:8000 \
  --env-file "$ENV_FILE" \
  ${IMAGE_PREFIX}/crown-frontend-image:${TAG}

echo ""
echo "⏳ Waiting for services..."
sleep 8

echo ""
echo "📊 Container status:"
docker ps --filter "name=binary-system-.*-stagging" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo "🏥 Health checks:"
BACKEND=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:4000/api/v1/health 2>/dev/null || echo "000")
FRONTEND=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3002 2>/dev/null || echo "000")
echo "   Backend (4000):  HTTP $BACKEND"
echo "   Frontend (3002): HTTP $FRONTEND"

echo ""
echo "✅ Stagging deployment complete!"
echo ""
echo "🌐 URLs:"
echo "   API:     https://api.stagging.crownbankers.com (4000)"
echo "   Frontend: https://stagging.crownbankers.com (3002)"
