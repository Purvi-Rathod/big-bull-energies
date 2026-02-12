#!/bin/bash
# Build and push stagging images to Docker Hub (run on local Mac)
# Requires: docker buildx, logged in to Docker Hub (docker login)

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_ROOT"

IMAGE_PREFIX="mayank934"
TAG="stagging"
FRONTEND_API_URL="https://api.stagging.crownbankers.com/api/v1"

echo "🔨 Building and pushing stagging images to Docker Hub"
echo "====================================================="
echo ""

# Build backend (multi-platform)
echo "📦 Building backend..."
cd server
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -t ${IMAGE_PREFIX}/crown-backend-image:${TAG} \
  --push .
cd "$PROJECT_ROOT"
echo "✅ Backend pushed: ${IMAGE_PREFIX}/crown-backend-image:${TAG}"
echo ""

# Build frontend with stagging API URL (amd64 only - avoids arm64 network issues)
echo "📦 Building frontend (NEXT_PUBLIC_API_URL=${FRONTEND_API_URL})..."
cd client
docker buildx build \
  --platform linux/amd64 \
  --build-arg NEXT_PUBLIC_API_URL="${FRONTEND_API_URL}" \
  -t ${IMAGE_PREFIX}/crown-frontend-image:${TAG} \
  --push .
cd "$PROJECT_ROOT"
echo "✅ Frontend pushed: ${IMAGE_PREFIX}/crown-frontend-image:${TAG}"
echo ""

echo "✅ All stagging images built and pushed!"
echo ""
echo "Next: Run scripts/deploy-stagging-server.sh on the server"
