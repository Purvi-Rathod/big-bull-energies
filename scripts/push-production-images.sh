#!/bin/bash
# Load env from server/.env, build fresh production images (with env vars for build),
# then tag and push to Docker Hub.
# Requires: docker login before running.

set -e

# Project root (directory containing docker-compose.yml)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$ROOT_DIR"

# Env file used for build (compose substitutes ${VAR} from this file)
ENV_FILE="${ENV_FILE:-server/.env}"
if [[ ! -f "$ENV_FILE" ]]; then
  echo "Error: Env file not found: $ENV_FILE"
  exit 1
fi
echo "Using env file: $ENV_FILE"

BACKEND_IMAGE="${BACKEND_IMAGE:-mayank934/crown-prod-b:latest}"
FRONTEND_IMAGE="${FRONTEND_IMAGE:-mayank934/crown-prod-f:latest}"

LOCAL_BACKEND="binary_system-backend:latest"
LOCAL_FRONTEND="binary_system-frontend:latest"

echo "--- Step 1: Fresh build with env variables ---"
docker compose --env-file "$ENV_FILE" build --no-cache

echo "--- Step 2: Tag images ---"
docker tag "$LOCAL_BACKEND" "$BACKEND_IMAGE"
docker tag "$LOCAL_FRONTEND" "$FRONTEND_IMAGE"

echo "--- Step 3: Push to Docker Hub ---"
echo "Pushing $BACKEND_IMAGE ..."
docker push "$BACKEND_IMAGE"
echo "Pushing $FRONTEND_IMAGE ..."
docker push "$FRONTEND_IMAGE"

echo "Done. Backend: $BACKEND_IMAGE | Frontend: $FRONTEND_IMAGE"
