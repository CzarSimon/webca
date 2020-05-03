cd cmd
go build
cd ..
mv cmd/cmd api-server

export MIGRATIONS_PATH='./resources/db/sqlite'
export JWT_ISSUER='webca'
export JWT_SECRET='jwt-secret'

export PASSWORD_PEPPER='pepper-secret'

export DB_HOST='127.0.0.1'
export DB_PORT='3306'
export DB_DATABASE='apiserver'
export DB_USERNAME='apiserver'
export DB_PASSWORD='password'

./api-server