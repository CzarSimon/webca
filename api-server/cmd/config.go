package main

import (
	"strconv"

	"github.com/CzarSimon/httputil/dbutil"
	"github.com/CzarSimon/httputil/environ"
	"github.com/CzarSimon/httputil/jwt"
	"github.com/CzarSimon/webca/api-server/internal/password"
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
		db: dbutil.SqliteConfig{
			Name: "./test.db",
		},
		port:           environ.Get("SERVICE_PORT", "8080"),
		passwordPolicy: getPasswordPolicy(),
		migrationsPath: environ.Get("MIGRATIONS_PATH", "/etc/api-server/migrations"),
		jwtCredentials: getJwtCredentials(),
	}
}

func getDBCredentials() dbutil.Config {
	return dbutil.MysqlConfig{
		Host:             environ.MustGet("DB_HOST"),
		Port:             environ.MustGet("DB_PORT"),
		Database:         environ.MustGet("DB_DATABASE"),
		User:             environ.MustGet("DB_USERNAME"),
		Password:         environ.MustGet("DB_PASSWORD"),
		ConnectionParams: "parseTime=true",
	}
}

func getJwtCredentials() jwt.Credentials {
	return jwt.Credentials{
		Issuer: environ.MustGet("JWT_ISSUER"),
		Secret: environ.MustGet("JWT_SECRET"),
	}
}

func getPasswordPolicy() password.Policy {
	return password.Policy{
		SaltLength: getIntFromEnvironment("PASSWORD_SALT_LENGTH", 32),
		MinLength:  getIntFromEnvironment("PASSWORD_MIN_LENGTH", 16),
	}
}

func mustReadSecretFromFile(key string) string {
	filepath := environ.MustGet(key)
	return filepath
}

func getIntFromEnvironment(key string, defaultVal int) int {
	s := environ.Get(key, strconv.Itoa(defaultVal))
	intVal, err := strconv.Atoi(s)
	if err != nil {
		log.Sugar().Fatalf("failed to parse %s: %s", key, defaultVal)
	}

	return intVal
}
