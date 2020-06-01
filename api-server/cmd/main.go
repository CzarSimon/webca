package main

import (
	"net/http"

	"github.com/CzarSimon/httputil"
	"github.com/CzarSimon/httputil/logger"
	"github.com/CzarSimon/webca/api-server/internal/model"
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
	r.Use(httputil.AllowJSON())

	rbac := httputil.NewRBAC(e.cfg.jwtCredentials)
	admin := r.Group("", rbac.Secure(model.AdminRole))
	secured := r.Group("", rbac.Secure(model.AdminRole, model.UserRole))

	r.POST("/v1/signup", e.signup)
	r.POST("/v1/login", e.login)

	secured.POST("/v1/certificates", e.createCertificate)
	secured.GET("/v1/certificates", e.getCertificates)
	secured.GET("/v1/certificates/:id", e.getCertificate)
	secured.GET("/v1/certificates/:id/body", e.getCertificateBody)
	secured.GET("/v1/certificate-options", e.getCertificateOptions)
	secured.GET("/v1/users/:id", e.getUser)

	admin.GET("/v1/certificates/:id/private-key", e.getCertificatePrivateKey)

	return &http.Server{
		Addr:    ":" + e.cfg.port,
		Handler: r,
	}
}
