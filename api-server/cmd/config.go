package main

import (
	"io/ioutil"
	"strconv"
	"strings"

	"github.com/CzarSimon/httputil/dbutil"
	"github.com/CzarSimon/httputil/environ"
	"github.com/CzarSimon/httputil/jwt"
	"github.com/CzarSimon/webca/api-server/internal/password"
	"go.uber.org/zap"
)

type config struct {
	db             dbutil.Config
	port           string
	passwordPolicy password.Policy
	migrationsPath string
	jwtCredentials jwt.Credentials
}

func getConfig() config {
	return config{
		db:             getDBCredentials(),
		port:           environ.Get("SERVICE_PORT", "8080"),
		passwordPolicy: getPasswordPolicy(),
		migrationsPath: environ.Get("MIGRATIONS_PATH", "/etc/api-server/migrations"),
		jwtCredentials: getJwtCredentials(),
	}
}

func getDBCredentials() dbutil.Config {
	dbType := strings.ToLower(environ.Get("DB_TYPE", "mysql"))
	if dbType == "sqlite" {
		return dbutil.SqliteConfig{
			Name: environ.MustGet("DB_FILENAME"),
		}
	}

	return dbutil.MysqlConfig{
		Host:             environ.MustGet("DB_HOST"),
		Port:             environ.MustGet("DB_PORT"),
		Database:         environ.MustGet("DB_DATABASE"),
		User:             environ.MustGet("DB_USERNAME"),
		Password:         mustReadSecretFromFile("DB_PASSWORD_FILE"),
		ConnectionParams: "parseTime=true",
	}
}

func getJwtCredentials() jwt.Credentials {
	return jwt.Credentials{
		Issuer: environ.MustGet("JWT_ISSUER"),
		Secret: mustReadSecretFromFile("PASSWORD_ENCRYPTION_KEY_FILE"),
	}
}

func getPasswordPolicy() password.Policy {
	return password.Policy{
		SaltLength: getIntFromEnvironment("PASSWORD_SALT_LENGTH", 32),
		MinLength:  getIntFromEnvironment("PASSWORD_MIN_LENGTH", 16),
	}
}

func mustReadSecretFromFile(key string) string {
	filename := environ.MustGet(key)
	b, err := ioutil.ReadFile(filename)
	if err != nil {
		log.Fatal("could not read file: "+filename, zap.Error(err))
	}

	return string(b)
}

func getIntFromEnvironment(key string, defaultVal int) int {
	s := environ.Get(key, strconv.Itoa(defaultVal))
	intVal, err := strconv.Atoi(s)
	if err != nil {
		log.Sugar().Fatalf("failed to parse %s: %s", key, defaultVal)
	}

	return intVal
}
