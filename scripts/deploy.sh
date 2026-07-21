#!/bin/bash
# Big Bull Energies — production deploy (PM2 + nginx)
#
# Run on the server from the project root:
#   bash scripts/deploy.sh
#
# Or from anywhere:
#   cd /root/big-bull-energies && bash scripts/deploy.sh
#
# Options (environment variables):
#   DEPLOY_BRANCH=be-update     Git branch to pull (default: be-update)
#   PUBLIC_URL=http://104.219.250.57   Site URL behind nginx
#   SKIP_INSTALL=1              Skip npm install
#   SKIP_NGINX=1                Skip nginx config reload
#   SKIP_PULL=1                 Skip git pull (rebuild/restart only)

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_ROOT"

DEPLOY_BRANCH="${DEPLOY_BRANCH:-be-update}"
PUBLIC_URL="${PUBLIC_URL:-http://104.219.250.57}"
API_URL="${PUBLIC_URL}/api/v1"
SERVER_IP="${SERVER_IP:-104.219.250.57}"

log()  { echo -e "${BLUE}$1${NC}"; }
ok()   { echo -e "${GREEN}✅ $1${NC}"; }
warn() { echo -e "${YELLOW}⚠️  $1${NC}"; }
fail() { echo -e "${RED}❌ $1${NC}"; exit 1; }

step() {
  echo ""
  log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  log "$1"
  log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
}

require_cmd() {
  command -v "$1" >/dev/null 2>&1 || fail "$1 is not installed"
}

update_env_var() {
  local file="$1"
  local key="$2"
  local value="$3"
  if grep -q "^${key}=" "$file" 2>/dev/null; then
    sed -i "s|^${key}=.*|${key}=${value}|" "$file"
  else
    echo "${key}=${value}" >> "$file"
  fi
}

ensure_pm2_process() {
  local name="$1"
  local dir="$2"

  if pm2 describe "$name" >/dev/null 2>&1; then
    return 0
  fi

  warn "PM2 process '$name' not found — creating it..."
  pm2 start npm --name "$name" -- start --cwd "$dir"
  pm2 save
}

health_check() {
  local label="$1"
  local url="$2"
  local code
  code="$(curl -s -o /dev/null -w '%{http_code}' "$url" 2>/dev/null || echo "000")"
  if [[ "$code" == "200" || "$code" == "304" ]]; then
    ok "$label: HTTP $code"
  else
    warn "$label: HTTP $code ($url)"
  fi
}

echo ""
log "🚀 Big Bull Energies — Deploy"
log "   Project:  $PROJECT_ROOT"
log "   Branch:   $DEPLOY_BRANCH"
log "   Site URL: $PUBLIC_URL"
echo ""

require_cmd git
require_cmd npm
require_cmd pm2

# ── 1. Git pull ──────────────────────────────────────────────────────────────
if [[ "${SKIP_PULL:-0}" != "1" ]]; then
  step "Step 1/6 — Pull latest code"

  if [[ ! -d .git ]]; then
    fail "Not a git repository: $PROJECT_ROOT"
  fi

  # Discard local edits to tracked files so pull never blocks deploy
  git fetch origin
  git checkout "$DEPLOY_BRANCH"
  git reset --hard "origin/$DEPLOY_BRANCH"
  git clean -fd -e 'server/.env' -e 'client/.env.local' -e 'client/.env.production'
  ok "At commit: $(git rev-parse --short HEAD) — $(git log -1 --pretty=%s)"
else
  warn "Skipping git pull (SKIP_PULL=1)"
fi

# ── 2. Environment files ─────────────────────────────────────────────────────
step "Step 2/6 — Configure environment"

mkdir -p client server

cat > client/.env.production <<EOF
NEXT_PUBLIC_API_URL=${API_URL}
EOF
ok "client/.env.production → NEXT_PUBLIC_API_URL=${API_URL}"

if [[ -f server/.env ]]; then
  update_env_var server/.env ALLOWED_ORIGINS "$PUBLIC_URL"
  update_env_var server/.env CLIENT_URL "$PUBLIC_URL"
  update_env_var server/.env FRONTEND_URL "$PUBLIC_URL"
  update_env_var server/.env BASE_URL "$PUBLIC_URL"
  ok "server/.env URLs updated for nginx"
else
  warn "server/.env not found — create it before first deploy"
fi

# ── 3. Install dependencies ──────────────────────────────────────────────────
step "Step 3/6 — Install dependencies"

if [[ "${SKIP_INSTALL:-0}" != "1" ]]; then
  (cd client && npm install --no-audit --no-fund)
  ok "Client dependencies installed"
  (cd server && npm install --no-audit --no-fund)
  ok "Server dependencies installed"
else
  warn "Skipping npm install (SKIP_INSTALL=1)"
fi

# ── 4. Build ───────────────────────────────────────────────────────────────────
step "Step 4/6 — Build client & server"

(cd client && npm run build)
ok "Client build complete"

(cd server && npm run build)
ok "Server build complete"

# ── 5. PM2 restart ───────────────────────────────────────────────────────────
step "Step 5/6 — Restart PM2 processes"

ensure_pm2_process client "$PROJECT_ROOT/client"
ensure_pm2_process server "$PROJECT_ROOT/server"

pm2 restart all --update-env
pm2 save
sleep 3
pm2 list
ok "PM2 processes restarted"

# ── 6. Nginx (optional) ───────────────────────────────────────────────────────
if [[ "${SKIP_NGINX:-0}" != "1" ]] && command -v nginx >/dev/null 2>&1; then
  step "Step 6/6 — Reload nginx"

  NGINX_CONF="$PROJECT_ROOT/nginx/bigbull-energies.ip.conf"
  if [[ -f "$NGINX_CONF" ]]; then
    if [[ -d /etc/nginx/conf.d ]]; then
      cp "$NGINX_CONF" /etc/nginx/conf.d/bigbull-energies.conf
      rm -f /etc/nginx/conf.d/default.conf 2>/dev/null || true
    elif [[ -d /etc/nginx/sites-available ]]; then
      cp "$NGINX_CONF" /etc/nginx/sites-available/bigbull-energies
      ln -sf /etc/nginx/sites-available/bigbull-energies /etc/nginx/sites-enabled/bigbull-energies
      rm -f /etc/nginx/sites-enabled/default 2>/dev/null || true
    fi
    nginx -t
    systemctl reload nginx
    ok "Nginx reloaded"
  else
    warn "nginx config not found at $NGINX_CONF — skipping"
  fi
else
  warn "Skipping nginx reload"
fi

# ── Health checks ─────────────────────────────────────────────────────────────
step "Health checks"

health_check "Frontend (local :3000)" "http://127.0.0.1:3000/"
health_check "Backend  (local :5000)" "http://127.0.0.1:5000/api/v1/health"
health_check "Nginx    (port 80)"   "http://127.0.0.1/api/v1/health"
health_check "Public   (external)"  "${PUBLIC_URL}/api/v1/health"

echo ""
ok "Deployment complete!"
echo ""
echo "  Website:  ${PUBLIC_URL}"
echo "  API:      ${API_URL}"
echo "  Commit:   $(git rev-parse --short HEAD 2>/dev/null || echo 'unknown')"
echo ""
echo "  Logs:     pm2 logs"
echo "  Status:   pm2 list"
echo "  Restart:  pm2 restart all"
echo ""
