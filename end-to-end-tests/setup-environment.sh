NETWORK="webca-network"

docker network create $NETWORK

docker run -d --name httplogger --network $NETWORK -e JAEGER_DISABLED=true czarsimon/httplogger:0.7 

web_app_image=$(sh parse-image.sh web-app)
docker run -d --name web-app --network $NETWORK $web_app_image

edge_proxy_image=$(sh parse-image.sh edge-proxy)
docker run -d --name edge-proxy --network $NETWORK -p 28080:8080 $edge_proxy_image
