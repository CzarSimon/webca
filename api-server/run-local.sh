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

export DB_HOST='127.0.0.1'
export DB_PORT='3306'
export DB_DATABASE='apiserver'
export DB_USERNAME='apiserver'
export DB_PASSWORD='password'

./api-server