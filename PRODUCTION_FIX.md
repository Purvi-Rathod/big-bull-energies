# Production Frontend Fix - Environment Variable Issue

## Problem
The frontend is showing error: `TypeError: Cannot read properties of undefined (reading 'aa')`

This is caused by `NEXT_PUBLIC_API_URL` not being available at runtime in the Next.js standalone build.

## Solution

### Option 1: Rebuild with Updated Dockerfile (Recommended)

The Dockerfile has been updated to include `NEXT_PUBLIC_API_URL` in the runner stage. Rebuild the frontend:

```bash
# Stop the frontend container
docker stop binary-system-frontend
docker rm binary-system-frontend

# Rebuild with the updated Dockerfile
cd /path/to/binary_system
docker compose build --no-cache frontend

# Start the container
docker compose up -d frontend
```

### Option 2: Quick Fix - Set Environment Variable at Runtime

If you can't rebuild immediately, you can set the environment variable when starting the container:

```bash
# Stop current container
docker stop binary-system-frontend
docker rm binary-system-frontend

# Start with environment variable
docker run -d \
  --name binary-system-frontend \
  --network binary-network \
  -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL=http://199.188.204.202:8000/api/v1 \
  -e NODE_ENV=production \
  binary-system-frontend:latest
```

### Option 3: Update docker-compose.yml and Rebuild

Ensure your `docker-compose.yml` has the environment variable set:

```yaml
frontend:
  build:
    context: ./client
    dockerfile: Dockerfile
    args:
      - NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL:-http://199.188.204.202:8000}/api/v1
  container_name: binary-system-frontend
  ports:
    - "3000:3000"
  environment:
    - NODE_ENV=production
    - NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL:-http://199.188.204.202:8000}/api/v1
  depends_on:
    - backend
  restart: unless-stopped
  networks:
    - binary-network
```

Then rebuild:
```bash
docker compose build --no-cache frontend
docker compose up -d frontend
```

## Verify Fix

After applying the fix, check the logs:

```bash
docker logs binary-system-frontend
```

You should see:
```
✓ Ready in XXms
```

And no errors about undefined properties.

## Test the Frontend

```bash
# Check if frontend is accessible
curl http://localhost:3000

# Or check in browser
# http://199.188.204.202:3000
```


