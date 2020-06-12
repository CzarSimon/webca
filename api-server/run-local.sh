cd cmd
go build
cd ..
mv cmd/cmd api-server

export MIGRATIONS_PATH='./resources/db/sqlite'
export JWT_ISSUER='webca'
export JWT_SECRET_FILE='./resources/testing/jwt-secret.key'

export PASSWORD_SALT_LENGTH='32'
export PASSWORD_MIN_LENGTH='8'
export PASSWORD_ENCRYPTION_KEY_FILE='./resources/testing/jwt-secret.key'

export DB_TYPE='sqlite'
export DB_FILENAME='./test.db'

export JAEGER_SERVICE_NAME='api-server'
export JAEGER_SAMPLER_TYPE='const'
export JAEGER_SAMPLER_PARAM=1
export JAEGER_REPORTER_LOG_SPANS='1'

./api-server