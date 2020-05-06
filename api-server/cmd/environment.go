package main

import (
	"database/sql"

	"github.com/CzarSimon/httputil"
	"github.com/CzarSimon/httputil/dbutil"
	"github.com/CzarSimon/httputil/jwt"
	"github.com/CzarSimon/webca/api-server/internal/password"
	"github.com/CzarSimon/webca/api-server/internal/repository"
	"github.com/CzarSimon/webca/api-server/internal/service"
	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

type env struct {
	cfg            config
	db             *sql.DB
	accountService *service.AccountService
}

func (e *env) checkHealth() error {
	err := dbutil.Connected(e.db)
	if err != nil {
		return httputil.ServiceUnavailableError(err)
	}

	return nil
}

func (e *env) close() {
	err := e.db.Close()
	if err != nil {
		log.Error("failed to close database connection", zap.Error(err))
	}
}

func setupEnv() *env {
	cfg := getConfig()

	db := dbutil.MustConnect(cfg.db)
	err := dbutil.Upgrade(cfg.migrationsPath, cfg.db.Driver(), db)
	if err != nil {
		log.Fatal("failed to apply database migrations", zap.Error(err))
	}

	passwordSvc, err := password.NewService(mustReadSecretFromFile("PASSWORD_ENCRYPTION_KEY_FILE"), cfg.passwordPolicy)
	if err != nil {
		log.Fatal("failed create password.Servicie", zap.Error(err))
	}

	return &env{
		cfg: cfg,
		db:  db,
		accountService: &service.AccountService{
			JwtIssuer:       jwt.NewIssuer(cfg.jwtCredentials),
			AccountRepo:     repository.NewAccountRepository(db),
			UserRepo:        repository.NewUserRepository(db),
			PasswordService: passwordSvc,
		},
	}
}

func notImplemented(c *gin.Context) {
	c.Error(httputil.NotImplementedError(nil))
}
