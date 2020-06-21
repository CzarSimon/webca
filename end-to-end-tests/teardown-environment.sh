docker rm -f edge-proxy
docker rm -f httplogger
docker rm -f api-server
docker rm -f webca-db
docker rm -f web-app

docker network rm webca-network