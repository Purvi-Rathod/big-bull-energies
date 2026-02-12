# Docker Compose Files

All compose files are at repo root.

| File | Purpose | Ports |
|------|---------|-------|
| `docker-compose.yml` | Production (build from source) | 3000, 8000 |
| `docker-compose.dev.yml` | Development (hot reload) | 3000, 8000 |
| `docker-compose.prod.yml` | Production (pre-built images) | 3000, 8000 |
| `docker-compose.stagging.yml` | Stagging (build from source) | 3002, 4000 |
| `docker-compose.stagging.images.yml` | Stagging (pre-built images) | 3002, 4000 |

## Usage

```bash
# Production
docker compose up -d

# Stagging (build)
docker compose -f docker-compose.stagging.yml --env-file .env.stagging up -d

# Stagging (pre-built images)
docker compose -f docker-compose.stagging.images.yml --env-file .env.stagging up -d
```
