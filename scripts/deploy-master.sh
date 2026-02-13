#!/bin/bash
set -e

# Production deployment only. Does NOT touch staging containers.
# Prod: binary-system-frontend, binary-system-backend (ports 3000, 8000)
# Staging (untouched): binary-system-frontend-stagging, binary-system-backend-stagging (ports 3002, 4000)

COMPOSE_FILE="docker-compose.yml"

echo "🚀 Production Deployment (master)"
echo "=========================================="
echo "   Using: -f $COMPOSE_FILE (prod only; staging untouched)"
echo "=========================================="

# Navigate to project root
cd "$(dirname "$0")/.."

# Step 1: Pull latest changes on main and go to latest
echo ""
echo "📋 Step 1: Pull latest changes on main..."
git fetch origin
git checkout main
git pull origin main
echo "✅ At latest commit: $(git rev-parse --short HEAD)"

# Step 2: Build new images with no cache (prod services only)
echo ""
echo "📋 Step 2: Building prod images (no cache)..."
docker compose -f "$COMPOSE_FILE" build --no-cache
echo "✅ Build complete"

# Step 3: Recreate prod containers only (staging containers untouched)
echo ""
echo "📋 Step 3: Recreating prod containers..."
docker compose -f "$COMPOSE_FILE" up -d --force-recreate
echo "✅ Prod containers recreated"

# Step 4: Wait for services to be ready
echo ""
echo "📋 Step 4: Waiting for services to be ready..."
sleep 10

# Step 5: Verify deployment (prod containers only)
echo ""
echo "📋 Step 5: Verifying deployment..."

if ! docker ps --format "{{.Names}}" | grep -qx "binary-system-backend"; then
    echo "❌ Error: Prod backend (binary-system-backend) is not running!"
    docker compose -f "$COMPOSE_FILE" logs backend
    exit 1
fi
echo "   ✅ binary-system-backend is running"

if ! docker ps --format "{{.Names}}" | grep -qx "binary-system-frontend"; then
    echo "❌ Error: Prod frontend (binary-system-frontend) is not running!"
    docker compose -f "$COMPOSE_FILE" logs frontend
    exit 1
fi
echo "   ✅ binary-system-frontend is running"

# Health checks (prod ports 8000, 3000)
echo ""
echo "   - Backend health (port 8000)..."
BACKEND_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/api/v1/health 2>/dev/null || echo "000")
if [ "$BACKEND_HEALTH" != "200" ] && [ "$BACKEND_HEALTH" != "404" ]; then
    echo "   ⚠️  Backend health check returned: $BACKEND_HEALTH"
else
    echo "   ✅ Backend responding"
fi

echo "   - Frontend health (port 3000)..."
FRONTEND_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 2>/dev/null || echo "000")
if [ "$FRONTEND_HEALTH" != "200" ]; then
    echo "   ⚠️  Frontend health check returned: $FRONTEND_HEALTH"
else
    echo "   ✅ Frontend responding"
fi

# Recent logs
echo ""
echo "📋 Recent prod container logs..."
echo "=== Backend (last 15 lines) ==="
docker compose -f "$COMPOSE_FILE" logs --tail=15 backend
echo ""
echo "=== Frontend (last 15 lines) ==="
docker compose -f "$COMPOSE_FILE" logs --tail=15 frontend

echo ""
echo "=========================================="
echo "✅ Production deployment complete"
echo "   - Commit: $(git rev-parse --short HEAD)"
echo "   - Backend: http://localhost:8000"
echo "   - Frontend: http://localhost:3000"
echo "   - Staging containers were NOT modified"
echo "=========================================="
