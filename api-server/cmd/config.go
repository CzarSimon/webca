package main

import (
	"strconv"

	"github.com/CzarSimon/httputil/dbutil"
	"github.com/CzarSimon/httputil/environ"
	"github.com/CzarSimon/httputil/jwt"
)

type config struct {
	db             dbutil.Config
	port           string
	saltLength     int
	migrationsPath string
	jwtCredentials jwt.Credentials
}

func getConfig() config {
	saltLenStr := environ.Get("PASSWORD_SALT_LENGTH", "32")
	saltLength, err := strconv.Atoi(saltLenStr)
	if err != nil {
		log.Fatal("failed to parse saltLength: " + saltLenStr)
	}

	return config{
		db: dbutil.SqliteConfig{
			Name: "./test.db",
		},
		port:           environ.Get("SERVICE_PORT", "8080"),
		saltLength:     saltLength,
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

func mustReadSecretFromFile(keyName string) string {
	filepath := environ.MustGet("keyName")
	return filepath
}
