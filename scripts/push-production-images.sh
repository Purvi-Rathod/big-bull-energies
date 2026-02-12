#!/bin/bash
# Load env from server/.env, build fresh production images for linux/amd64 (server),
# then push to Docker Hub. Requires: docker login and buildx.
#
# Builds for linux/amd64 so images run on typical production servers (not arm64).

set -e

# Project root (directory containing docker-compose.yml) — run from repo root or scripts/
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$ROOT_DIR"

if [[ ! -f server/Dockerfile || ! -f client/Dockerfile ]]; then
  echo "Error: Run from repo root or scripts/; server/Dockerfile and client/Dockerfile must exist."
  exit 1
fi

PLATFORM="linux/amd64"

# Env file used for build args (e.g. NEXT_PUBLIC_API_URL)
ENV_FILE="${ENV_FILE:-server/.env}"
if [[ ! -f "$ENV_FILE" ]]; then
  echo "Error: Env file not found: $ENV_FILE"
  exit 1
fi
echo "Using env file: $ENV_FILE"

# Load NEXT_PUBLIC_API_URL without sourcing whole .env (avoids set -e exit from .env commands)
NEXT_PUBLIC_API_URL="https://api.crownbankers.com/api/v1"
if grep -qE '^NEXT_PUBLIC_API_URL=' "$ENV_FILE" 2>/dev/null; then
  val=$(grep -E '^NEXT_PUBLIC_API_URL=' "$ENV_FILE" | head -1 | cut -d= -f2- | sed "s/^['\"]//;s/['\"]$//")
  [[ -n "$val" ]] && NEXT_PUBLIC_API_URL="$val"
fi

BACKEND_IMAGE="${BACKEND_IMAGE:-mayank934/crown-prod-b:latest}"
FRONTEND_IMAGE="${FRONTEND_IMAGE:-mayank934/crown-prod-f:latest}"

echo "--- Building for $PLATFORM (production server) ---"
# On arm64 (e.g. Mac), use default buildx; ensure multi-platform: docker buildx create --use

echo "--- Step 1: Build and push backend ($BACKEND_IMAGE) ---"
docker buildx build \
  --platform "$PLATFORM" \
  --no-cache \
  -f server/Dockerfile \
  -t "$BACKEND_IMAGE" \
  --push \
  server/

echo "--- Step 2: Build and push frontend ($FRONTEND_IMAGE) ---"
docker buildx build \
  --platform "$PLATFORM" \
  --no-cache \
  --build-arg NEXT_PUBLIC_API_URL="$NEXT_PUBLIC_API_URL" \
  -f client/Dockerfile \
  -t "$FRONTEND_IMAGE" \
  --push \
  client/

echo "Done. Backend: $BACKEND_IMAGE | Frontend: $FRONTEND_IMAGE (both $PLATFORM)"
