cd cmd
echo "Building api-server"
go build
cd ..
mv cmd/cmd api-server

export MIGRATIONS_PATH='./resources/db/mysql'
export JWT_ISSUER='webca'
export JWT_SECRET_FILE='./resources/testing/jwt-secret.key'

export PASSWORD_SALT_LENGTH='32'
export PASSWORD_MIN_LENGTH='8'
export PASSWORD_ENCRYPTION_KEY_FILE='./resources/testing/password-encryption.key'

# export DB_TYPE='sqlite'
# export DB_FILENAME='./test.db'

export DB_TYPE='mysql'
export DB_HOST='127.0.0.1'
export DB_PORT='23306'
export DB_DATABASE='apiserver'
export DB_USERNAME='apiserver'
export DB_PASSWORD_FILE='./resources/testing/database-password.key'

export JAEGER_SERVICE_NAME='api-server'
export JAEGER_SAMPLER_TYPE='const'
export JAEGER_SAMPLER_PARAM=1
export JAEGER_REPORTER_LOG_SPANS='1'

./api-server