#!/bin/bash
# Server CI: deploy PRODUCTION only. Does NOT touch staging.
# Run on: production server (e.g. from CI after push-production-images.sh).
# Usage: ./scripts/server-ci-production.sh
#
# Staging uses different images/containers (crown-backend-image:stagging, etc.).
# This script only uses docker-compose.prod.yml and production images.

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_ROOT"

COMPOSE_FILE="docker-compose.prod.yml"
ENV_FILE=".env"

# Explicit production image names (do not reference staging image names here)
PROD_BACKEND_IMAGE="mayank934/crown-prod-b:latest"
PROD_FRONTEND_IMAGE="mayank934/crown-prod-f:latest"

echo "🚀 Server CI: Production deploy only (staging not touched)"
echo "============================================================"
echo "(First pull can take 2–5 min; backend and frontend pull in parallel.)"
echo ""

if [ ! -f "$COMPOSE_FILE" ]; then
    echo "❌ $COMPOSE_FILE not found!"
    exit 1
fi

if [ ! -f "$ENV_FILE" ]; then
    echo "❌ $ENV_FILE not found! Create it from server/.env with production values."
    exit 1
fi

LOG_FILE="${PROJECT_ROOT}/.server-ci-production.log"
PID_FILE="${PROJECT_ROOT}/.server-ci-production.pid"

(
  retry_pull() {
    local img="$1" i=1 max=3
    while ! docker pull "$img"; do
      echo "[$(date -Iseconds)] Pull failed (attempt $i/$max), retrying in 15s..."
      [[ $i -ge $max ]] && { echo "[$(date -Iseconds)] Pull failed after $max attempts."; return 1; }
      sleep 15
      ((i++))
    done
  }
  echo "[$(date -Iseconds)] Starting production deploy (pulling both images in parallel, retry on timeout)..."
  retry_pull "$PROD_BACKEND_IMAGE" &
  retry_pull "$PROD_FRONTEND_IMAGE" &
  wait
  echo "[$(date -Iseconds)] Pull done, recreating containers..."
  docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d --force-recreate
  echo "[$(date -Iseconds)] Production deploy done. Staging not modified."
) >> "$LOG_FILE" 2>&1 &

BG_PID=$!
echo $BG_PID > "$PID_FILE"
echo ""
echo "✅ Deploy triggered in background (PID $BG_PID). CI exits now."
echo "   Log: $LOG_FILE"
echo "   To wait for completion: tail -f $LOG_FILE"
