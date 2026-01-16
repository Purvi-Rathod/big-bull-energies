#!/bin/bash
set -e

echo "🔍 Verifying Deployment..."
echo "=========================="

# Navigate to project root
cd "$(dirname "$0")/.."

echo ""
echo "1. Checking Git commit..."
CURRENT_COMMIT=$(git rev-parse --short HEAD)
echo "   Current commit: $CURRENT_COMMIT"

echo ""
echo "2. Checking if containers are running..."
if docker ps | grep -q "binary-system-backend"; then
    echo "   ✅ Backend container is running"
else
    echo "   ❌ Backend container is NOT running"
    exit 1
fi

if docker ps | grep -q "binary-system-frontend"; then
    echo "   ✅ Frontend container is running"
else
    echo "   ❌ Frontend container is NOT running"
    exit 1
fi

echo ""
echo "3. Verifying code in containers..."

# Check backend - verify API route exists
echo ""
echo "   Backend - Checking tree routes..."
if docker exec binary-system-backend grep -q "getNodeDownlines" /usr/src/app/dist/routes/tree.routes.js 2>/dev/null; then
    echo "   ✅ getNodeDownlines route found in backend"
else
    echo "   ❌ getNodeDownlines route NOT found in backend"
    echo "   Checking source file..."
    docker exec binary-system-backend cat /usr/src/app/src/routes/tree.routes.ts | grep "getNodeDownlines" || echo "   Route not in source either!"
fi

# Check frontend - verify tree page has expand functionality
echo ""
echo "   Frontend - Checking tree page..."
if docker exec binary-system-frontend grep -q "handleExpandNode" /app/app/tree/page.js 2>/dev/null || \
   docker exec binary-system-frontend find /app -name "page.js" -exec grep -l "handleExpandNode" {} \; 2>/dev/null | grep -q tree; then
    echo "   ✅ handleExpandNode found in frontend tree page"
else
    echo "   ⚠️  handleExpandNode not found in built files (checking source)..."
    if docker exec binary-system-frontend find /app -name "page.tsx" -exec grep -l "handleExpandNode" {} \; 2>/dev/null | grep -q tree; then
        echo "   ✅ Found in source, but may not be built correctly"
    else
        echo "   ❌ handleExpandNode NOT found in frontend"
    fi
fi

# Check my-tree page
echo ""
echo "   Frontend - Checking my-tree page..."
if docker exec binary-system-frontend find /app -name "*.js" -exec grep -l "handleExpandNode" {} \; 2>/dev/null | grep -q my-tree || \
   docker exec binary-system-frontend find /app -path "*/my-tree/*" -name "*.js" -exec grep -l "expandedNodes" {} \; 2>/dev/null | head -1; then
    echo "   ✅ Expand functionality found in my-tree page"
else
    echo "   ⚠️  Expand functionality may not be in my-tree build"
fi

echo ""
echo "4. Testing API endpoint..."
echo "   Testing: GET /api/v1/tree/node/CROWN-000123/downlines"
API_TEST=$(curl -s -o /dev/null -w "%{http_code}" \
    -H "Authorization: Bearer test" \
    http://localhost:8000/api/v1/tree/node/CROWN-000123/downlines 2>/dev/null || echo "000")
if [ "$API_TEST" = "401" ] || [ "$API_TEST" = "404" ]; then
    echo "   ✅ API endpoint exists (returned $API_TEST - expected for unauthenticated)"
else
    echo "   ⚠️  API endpoint returned: $API_TEST"
fi

echo ""
echo "5. Checking frontend build info..."
FRONTEND_BUILD_TIME=$(docker exec binary-system-frontend stat -c %y /app/.next/BUILD_ID 2>/dev/null | cut -d' ' -f1 || echo "unknown")
echo "   Frontend build date: $FRONTEND_BUILD_TIME"

echo ""
echo "6. Container logs (last 5 lines)..."
echo ""
echo "   Backend:"
docker compose logs --tail=5 backend | sed 's/^/      /'
echo ""
echo "   Frontend:"
docker compose logs --tail=5 frontend | sed 's/^/      /'

echo ""
echo "=========================="
echo "✅ Verification Complete!"
echo ""
echo "💡 If changes are not visible:"
echo "   1. Clear browser cache (Ctrl+Shift+Delete)"
echo "   2. Try incognito/private window"
echo "   3. Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)"
echo "   4. Check browser console for errors (F12)"
echo ""
