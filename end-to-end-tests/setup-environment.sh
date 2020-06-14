NETWORK="webca-network"

echo "Creating test network $NETWORK"
docker network create $NETWORK

echo "Starting database server"
mysql_image=$(sh parse-image.sh mysql)
docker run -d --name webca-db --network $NETWORK -p 23306:3306 -e MYSQL_ROOT_PASSWORD=password $mysql_image

echo "Starting httplogger"
docker run -d --name httplogger --network $NETWORK -e JAEGER_DISABLED=true czarsimon/httplogger:0.7 

api_server_image=$(sh parse-image.sh api-server)
docker pull $api_server_image

edge_proxy_image=$(sh parse-image.sh edge-proxy)
docker pull $edge_proxy_image

web_app_image=$(sh parse-image.sh web-app)
# docker run -d --name web-app --network $NETWORK $web_app_image

sleep_time='30'
if [ "$CI" == "1" ] || [ "$CI" == "true" ]
then
  sleep_time='60'
fi
echo "Waiting for $sleep_time seconds for the database to be ready"
sleep $sleep_time

echo "Adding database users."
docker exec -i webca-db mysql -u'root' -p'password' < ./db-users.sql

echo "Starting api-server"
docker run -d --name api-server --network $NETWORK \
    -e MIGRATIONS_PATH='/etc/api-server/migrations' \
    -e JWT_ISSUER='webca' \
    -e PASSWORD_SALT_LENGTH='32' \
    -e PASSWORD_MIN_LENGTH='16' \
    -e DB_TYPE='mysql' \
    -e DB_HOST='webca-db' \
    -e DB_PORT='3306' \
    -e DB_DATABASE='apiserver' \
    -e DB_USERNAME='apiserver' \
    -e JAEGER_DISABLED=true \
    -e PASSWORD_ENCRYPTION_KEY_FILE='/etc/api-server/password-encryption-key.txt' \
    -e DB_PASSWORD_FILE='/etc/api-server/database-password.txt' \
    -e JWT_ISSUER='/etc/api-server/jwt-secret.txt' \
    -v "$PWD/secrets/password-encryption-key.txt":'/etc/api-server/password-encryption-key.txt' \
    -v "$PWD/secrets/database-password.txt":'/etc/api-server/database-password.txt' \
    -v "$PWD/secrets/jwt-secret.txt":'/etc/api-server/jwt-secret.txt' \
    $api_server_image

echo "Starting edge-proxy"
docker run -d --name edge-proxy --network $NETWORK -p 28080:8080 $edge_proxy_image

echo "Waiting for containers to be ready"
sleep 5
docker ps
