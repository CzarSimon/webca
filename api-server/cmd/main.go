package main

import (
	"net/http"

	"github.com/CzarSimon/httputil"
	"github.com/CzarSimon/httputil/logger"
	_ "github.com/go-sql-driver/mysql"
	_ "github.com/mattn/go-sqlite3"
	"go.uber.org/zap"
)

var log = logger.GetDefaultLogger("api-server/main")

func main() {
	e := setupEnv()
	defer e.close()

	server := newServer(e)
	log.Info("Started api-server listening on port: " + e.cfg.port)

	err := server.ListenAndServe()
	if err != nil {
		log.Error("Unexpected error stoped server.", zap.Error(err))
	}
}

func newServer(e *env) *http.Server {
	r := httputil.NewRouter("api-server", e.checkHealth)

	/*
		rbac := httputil.RBAC{
			Verifier: jwt.NewVerifier(e.cfg.jwtCredentials, time.Minute),
		}
		v1 := r.Group("/v1", rbac.Secure("USER"))
	*/
	r.POST("/v1/signup", e.signup)

	return &http.Server{
		Addr:    ":" + e.cfg.port,
		Handler: r,
	}
}
