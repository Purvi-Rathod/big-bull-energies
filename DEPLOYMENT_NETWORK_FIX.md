# Docker Build Network Timeout Fix

## Issue
Docker builds failing with `ETIMEDOUT` errors during `npm ci` due to network connectivity issues on production server.

## Solution Applied

### Backend Dockerfile Improvements:
1. **Added npm network configuration** with extended timeouts
2. **Added retry logic** for npm install (3 attempts with delays)
3. **Reduced maxsockets** to 5 (prevents connection exhaustion)
4. **Changed `--only=production` to `--omit=dev`** (more reliable)

### Changes Made:

```dockerfile
# Before:
RUN npm ci --only=production && npm cache clean --force

# After:
RUN npm config set registry https://registry.npmjs.org/ && \
    npm config set fetch-timeout 300000 && \
    npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000 && \
    npm config set maxsockets 5 && \
    (npm ci --omit=dev || (sleep 10 && npm ci --omit=dev) || (sleep 20 && npm ci --omit=dev)) && \
    npm cache clean --force
```

## Network Configuration Details

- **fetch-timeout**: 300000ms (5 minutes) - Extended timeout for slow connections
- **fetch-retry-mintimeout**: 20000ms (20 seconds) - Minimum wait between retries
- **fetch-retry-maxtimeout**: 120000ms (2 minutes) - Maximum wait between retries
- **maxsockets**: 5 - Reduced from default to prevent connection exhaustion
- **Retry logic**: 3 attempts with increasing delays (0s, 10s, 20s)

## Next.js Migration

- Updated from 16.0.7 → 16.0.10
- Fixes all CVEs including:
  - CVE-2025-66478 (Critical RCE)
  - CVE-2025-55184 (High DoS)
  - CVE-2025-55183 (Medium Source exposure)
  - CVE-2025-67779 (High DoS)

## Deployment Command

```bash
# On production server
cd ~/apps/binary_system
git pull origin main
docker compose down --remove-orphans
docker compose build --no-cache
docker compose up -d
docker image prune -f
docker builder prune -f
```

## If Build Still Fails

### Option 1: Build with increased timeout
```bash
DOCKER_BUILDKIT=1 docker compose build --progress=plain --no-cache
```

### Option 2: Build services separately
```bash
# Build backend first
docker compose build backend

# Then frontend
docker compose build frontend

# Start both
docker compose up -d
```

### Option 3: Use build cache
```bash
# Build without --no-cache to use cache
docker compose build
docker compose up -d
```

## Verification

After deployment:
```bash
# Check containers
docker ps

# Verify Next.js version
docker exec binary-system-frontend npm list next
# Should show: next@16.0.10

# Check backend
docker logs binary-system-backend --tail 20

# Check frontend
docker logs binary-system-frontend --tail 20
```

---

**Last Updated:** $(date)
**Status:** ✅ Network timeout handling improved
