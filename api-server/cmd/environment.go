package main

import (
	"database/sql"
	"io"

	"github.com/CzarSimon/httputil"
	"github.com/CzarSimon/httputil/dbutil"
	"github.com/CzarSimon/httputil/jwt"
	"github.com/CzarSimon/webca/api-server/internal/audit"
	"github.com/CzarSimon/webca/api-server/internal/authorization"
	"github.com/CzarSimon/webca/api-server/internal/password"
	"github.com/CzarSimon/webca/api-server/internal/repository"
	"github.com/CzarSimon/webca/api-server/internal/service"
	"github.com/gin-gonic/gin"
	"github.com/opentracing/opentracing-go"
	jaegercfg "github.com/uber/jaeger-client-go/config"
	"go.uber.org/zap"
)

type env struct {
	cfg                config
	db                 *sql.DB
	accountService     *service.AccountService
	certificateService *service.CertificateService
	userService        *service.UserService
	invitationService  *service.InvitationService
	traceCloser        io.Closer
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

	err = e.traceCloser.Close()
	if err != nil {
		log.Error("failed to close tracer connection", zap.Error(err))
	}
}

func setupEnv() *env {
	jcfg, err := jaegercfg.FromEnv()
	if err != nil {
		log.Fatal("failed to create jaeger configuration", zap.Error(err))
	}

	tracer, closer, err := jcfg.NewTracer()
	if err != nil {
		log.Fatal("failed to create tracer", zap.Error(err))
	}

	opentracing.SetGlobalTracer(tracer)

	cfg := getConfig()

	db := dbutil.MustConnect(cfg.db)
	err = dbutil.Upgrade(cfg.migrationsPath, cfg.db.Driver(), db)
	if err != nil {
		log.Fatal("failed to apply database migrations", zap.Error(err))
	}

	passwordSvc, err := password.NewService(mustReadSecretFromFile("PASSWORD_ENCRYPTION_KEY_FILE"), cfg.passwordPolicy)
	if err != nil {
		log.Fatal("failed create password.Service", zap.Error(err))
	}

	auditRepo := repository.NewAuditEventRepository(db)
	auditLog := audit.NewLogger("webca:api-server", auditRepo)

	userRepo := repository.NewUserRepository(db)
	authService := authorization.NewService(userRepo)

	return &env{
		cfg: cfg,
		db:  db,
		accountService: &service.AccountService{
			JwtIssuer:       jwt.NewIssuer(cfg.jwtCredentials),
			AuditLog:        auditLog,
			AccountRepo:     repository.NewAccountRepository(db),
			UserRepo:        userRepo,
			PasswordService: passwordSvc,
		},
		certificateService: &service.CertificateService{
			AuditLog:        auditLog,
			CertRepo:        repository.NewCertificateRepository(db),
			KeyPairRepo:     repository.NewKeyPairRepository(db),
			UserRepo:        userRepo,
			PasswordService: passwordSvc,
			AuthService:     authService,
		},
		userService: &service.UserService{
			AuditLog:    auditLog,
			UserRepo:    userRepo,
			AuthService: authService,
		},
		invitationService: &service.InvitationService{
			AuditLog:       auditLog,
			InvitationRepo: repository.NewInvitationRepository(db),
			UserRepo:       userRepo,
		},
		traceCloser: closer,
	}
}

func notImplemented(c *gin.Context) {
	c.Error(httputil.NotImplementedError(nil))
}
