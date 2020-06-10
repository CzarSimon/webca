docker rm -f edge-proxy
docker rm -f httplogger
docker rm -f web-app
docker rm -f api-server

docker network rm webca-network