# Scripts

## Deployment

| Script | Description |
|--------|-------------|
| `deploy.sh` | Deploy production (docker-compose) |
| `deploy-stagging.sh` | Deploy stagging (build from source) |
| `deploy-stagging-server.sh` | Deploy stagging (pull pre-built images) |
| `deploy-master.sh` | Production deploy (legacy) |
| `server-ci-production.sh` | Server-side CI for production |
| `push-production-images.sh` | Build and push production images to Docker Hub |
| `build-and-push-stagging.sh` | Build and push stagging images (local Mac) |

## Utilities

| Script | Description |
|--------|-------------|
| `setup.sh` | Initial project setup |
| `verify-deployment.sh` | Verify deployment health |
| `flush-cache-and-rebuild.sh` | Flush cache and rebuild |
| `trigger-daily-calculations.sh` | Trigger daily ROI/binary calculations |
| `SERVER_FIX_GITHUB_SSH.sh` | Fix GitHub SSH on server |
