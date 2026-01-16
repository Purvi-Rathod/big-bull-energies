#!/bin/bash
set -e

echo "🚀 Starting Master Deployment Process..."
echo "=========================================="

# Navigate to project root
cd "$(dirname "$0")/.."

# Step 1: Verify we're on the latest commit
echo ""
echo "📋 Step 1: Verifying Git status..."
git fetch origin
LATEST_COMMIT=$(git rev-parse origin/main)
CURRENT_COMMIT=$(git rev-parse HEAD)

if [ "$CURRENT_COMMIT" != "$LATEST_COMMIT" ]; then
    echo "⚠️  Warning: Not on latest commit. Current: $CURRENT_COMMIT, Latest: $LATEST_COMMIT"
    echo "   Pulling latest changes..."
    git pull origin main
else
    echo "✅ Already on latest commit: $LATEST_COMMIT"
fi

# Step 2: Verify critical files exist
echo ""
echo "📋 Step 2: Verifying critical files..."
if [ ! -f "client/app/tree/page.tsx" ]; then
    echo "❌ Error: client/app/tree/page.tsx not found!"
    exit 1
fi

if [ ! -f "client/app/(dashboard)/my-tree/page.tsx" ]; then
    echo "❌ Error: client/app/(dashboard)/my-tree/page.tsx not found!"
    exit 1
fi

if [ ! -f "server/src/routes/tree.routes.ts" ]; then
    echo "❌ Error: server/src/routes/tree.routes.ts not found!"
    exit 1
fi

# Check if lazy loading code exists
if ! grep -q "handleExpandNode" client/app/tree/page.tsx; then
    echo "❌ Error: handleExpandNode not found in tree/page.tsx!"
    exit 1
fi

if ! grep -q "getNodeDownlines" server/src/routes/tree.routes.ts; then
    echo "❌ Error: getNodeDownlines route not found!"
    exit 1
fi

echo "✅ All critical files verified"

# Step 3: Stop containers
echo ""
echo "📋 Step 3: Stopping containers..."
docker compose down

# Step 4: Clean all caches
echo ""
echo "📋 Step 4: Cleaning all caches..."
echo "   - Removing frontend cache volume..."
docker volume rm binary_system_frontend-next-cache 2>/dev/null || echo "     Volume doesn't exist (OK)"

echo "   - Removing local build artifacts..."
rm -rf client/.next
rm -rf server/dist
rm -rf client/node_modules/.cache

echo "   - Pruning Docker build cache..."
docker builder prune -f

# Step 5: Rebuild everything from scratch
echo ""
echo "📋 Step 5: Rebuilding all services (no cache)..."
docker compose build --no-cache --pull

# Step 6: Start containers
echo ""
echo "📋 Step 6: Starting containers..."
docker compose up -d

# Step 7: Wait for services to be ready
echo ""
echo "📋 Step 7: Waiting for services to be ready..."
sleep 10

# Step 8: Verify deployment
echo ""
echo "📋 Step 8: Verifying deployment..."

# Check if containers are running
if ! docker ps | grep -q "binary-system-backend"; then
    echo "❌ Error: Backend container is not running!"
    docker compose logs backend
    exit 1
fi

if ! docker ps | grep -q "binary-system-frontend"; then
    echo "❌ Error: Frontend container is not running!"
    docker compose logs frontend
    exit 1
fi

echo "✅ Containers are running"

# Check backend health
echo ""
echo "   - Checking backend health..."
BACKEND_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/api/v1/health || echo "000")
if [ "$BACKEND_HEALTH" != "200" ] && [ "$BACKEND_HEALTH" != "404" ]; then
    echo "   ⚠️  Backend health check returned: $BACKEND_HEALTH"
else
    echo "   ✅ Backend is responding"
fi

# Check frontend health
echo ""
echo "   - Checking frontend health..."
FRONTEND_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 || echo "000")
if [ "$FRONTEND_HEALTH" != "200" ]; then
    echo "   ⚠️  Frontend health check returned: $FRONTEND_HEALTH"
else
    echo "   ✅ Frontend is responding"
fi

# Step 9: Show logs
echo ""
echo "📋 Step 9: Recent container logs..."
echo ""
echo "=== Backend Logs (last 20 lines) ==="
docker compose logs --tail=20 backend
echo ""
echo "=== Frontend Logs (last 20 lines) ==="
docker compose logs --tail=20 frontend

# Step 10: Verification summary
echo ""
echo "=========================================="
echo "✅ Deployment Complete!"
echo ""
echo "📊 Summary:"
echo "   - Git Commit: $(git rev-parse --short HEAD)"
echo "   - Backend: http://localhost:8000"
echo "   - Frontend: http://localhost:3000"
echo ""
echo "🔍 To verify tree changes:"
echo "   1. Open http://localhost:3000/tree (or /my-tree)"
echo "   2. Look for 'View Downlines' buttons on nodes"
echo "   3. Check browser console for any errors"
echo ""
echo "📝 To view logs:"
echo "   docker compose logs -f"
echo "=========================================="
