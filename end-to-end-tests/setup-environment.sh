COMMIT_ID=$(git rev-parse  --short HEAD)
TEST_ID="$COMMIT_ID-$(openssl rand 5 -hex)"

docker network create $TEST_ID

docker run -d --name httplogger --network $TEST_ID -e JAEGER_DISABLED=true czarsimon/httplogger:0.7 