package main

import (
	"database/sql"

	"github.com/CzarSimon/httputil"
	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

type env struct {
	cfg config
	db  *sql.DB
}

func (e *env) checkHealth() error {
	/*
		err := dbutil.Connected(e.db)
		if err != nil {
			return httputil.ServiceUnavailableError(err)
		}
	*/

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

	/*
		db := dbutil.MustConnect(cfg.db)
		err = dbutil.Upgrade(cfg.migrationsPath, cfg.db.Driver(), db)
		if err != nil {
			log.Fatal("failed to apply database migrations", zap.Error(err))
		}
	*/

	return &env{
		cfg: cfg,
	}
}

func notImplemented(c *gin.Context) {
	c.Error(httputil.NotImplementedError(nil))
}
