1. Local Mac – build and push
File: scripts/build-and-push-stagging.sh
# On your Mac (after cd into project)./scripts/build-and-push-stagging.sh
Builds backend (linux/amd64, linux/arm64) and pushes to Docker Hub
Builds frontend with NEXT_PUBLIC_API_URL=https://api.stagging.crownbankers.com/api/v1
Pushes both images to mayank934/crown-*-image:stagging
Requires docker login and docker buildx
2. Server – deploy
File: scripts/deploy-stagging-server.sh
# On the server (after git pull or copy script)cd ~/apps/stagging/crown-bankers./scripts/deploy-stagging-server.sh
Pulls mayank934/crown-backend-image:stagging and mayank934/crown-frontend-image:stagging
Stops and removes existing stagging containers
Starts backend on port 4000, frontend on port 3002
Runs health checks
Usage
Local Mac:
cd ~/Desktop/binary_systemdocker login   # if needed./scripts/build-and-push-stagging.sh
Server:
cd ~/apps/stagging/crown-bankersgit pull   # get latest scripts./scripts/deploy-stagging-server.sh


