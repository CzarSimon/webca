package main

import (
	"context"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/CzarSimon/httputil/client/rpc"
	"github.com/CzarSimon/httputil/dbutil"
	"github.com/CzarSimon/httputil/id"
	"github.com/CzarSimon/httputil/jwt"
	"github.com/CzarSimon/webca/api-server/internal/audit"
	"github.com/CzarSimon/webca/api-server/internal/authorization"
	"github.com/CzarSimon/webca/api-server/internal/password"
	"github.com/CzarSimon/webca/api-server/internal/repository"
	"github.com/CzarSimon/webca/api-server/internal/service"
	"github.com/opentracing/opentracing-go"
	"github.com/stretchr/testify/assert"
	"go.uber.org/zap"
)

func TestTestHealth(t *testing.T) {
	assert := assert.New(t)
	e, _ := createTestEnv()
	server := newServer(e)

	req := createUnauthenticatedTestRequest("/health", http.MethodGet, nil)
	assert.Equal(http.StatusOK, performTestRequest(server.Handler, req).Code)

	e.db.Close()
	req = createUnauthenticatedTestRequest("/health", http.MethodGet, nil)
	assert.Equal(http.StatusServiceUnavailable, performTestRequest(server.Handler, req).Code)
}

func testUnauthorized(t *testing.T, route, method string) {
	assert := assert.New(t)
	e, _ := createTestEnv()
	server := newServer(e)

	req := createUnauthenticatedTestRequest(route, method, nil)
	res := performTestRequest(server.Handler, req)
	assert.Equal(http.StatusUnauthorized, res.Code)
}

func testForbidden(t *testing.T, route, method string, roles []string) {
	assert := assert.New(t)
	e, _ := createTestEnv()
	server := newServer(e)

	for _, role := range roles {
		user := jwt.User{
			ID:    id.New(),
			Roles: []string{role},
		}
		req := createTestRequest(route, method, user, nil)
		res := performTestRequest(server.Handler, req)
		assert.Equal(http.StatusForbidden, res.Code)
	}
}

func testBadContentType(t *testing.T, route, method, role string) {
	assert := assert.New(t)
	e, _ := createTestEnv()
	server := newServer(e)

	user := jwt.User{
		ID:    id.New(),
		Roles: []string{role},
	}
	req := createTestRequest(route, method, user, nil)
	req.Header.Del("Content-Type")
	res := performTestRequest(server.Handler, req)
	assert.Equal(http.StatusUnsupportedMediaType, res.Code)

	req = createTestRequest(route, method, user, nil)
	req.Header.Set("Content-Type", "application/xml")
	res = performTestRequest(server.Handler, req)
	assert.Equal(http.StatusUnsupportedMediaType, res.Code)

	req = createTestRequest(route, method, user, nil)
	req.Header.Set("Content-Type", "text/plain")
	res = performTestRequest(server.Handler, req)
	assert.Equal(http.StatusUnsupportedMediaType, res.Code)

	req = createTestRequest(route, method, user, nil)
	req.Header.Set("Content-Type", "text/html")
	res = performTestRequest(server.Handler, req)
	assert.Equal(http.StatusUnsupportedMediaType, res.Code)
}

// ---- Test utils ----

func createTestEnv() (*env, context.Context) {
	testID := id.New()
	fmt.Println("Test ", testID)
	cfg := config{
		db:             dbutil.SqliteConfig{Name: fmt.Sprintf("../resources/testing/test-%s.db", testID)},
		migrationsPath: "../resources/db/sqlite",
		jwtCredentials: getTestJWTCredentials(),
	}

	db := dbutil.MustConnect(cfg.db)
	_, err := db.Exec("PRAGMA foreign_keys = ON")
	if err != nil {
		log.Panic("Failed to activate foregin keys", zap.Error(err))
	}

	err = dbutil.Downgrade(cfg.migrationsPath, cfg.db.Driver(), db)
	if err != nil {
		log.Panic("Failed to apply downgrade migratons", zap.Error(err))
	}

	err = dbutil.Upgrade(cfg.migrationsPath, cfg.db.Driver(), db)
	if err != nil {
		log.Panic("Failed to apply upgrade migratons", zap.Error(err))
	}

	policy := password.Policy{SaltLength: 32, MinLength: 16}
	passwordSvc, err := password.NewService("secret-password-encryption-key", policy)
	if err != nil {
		log.Fatal("failed create password.Servicie", zap.Error(err))
	}

	auditRepo := repository.NewAuditEventRepository(db)
	auditLog := audit.NewLogger("webca:api-server", auditRepo)

	userRepo := repository.NewUserRepository(db)
	authService := authorization.NewService(userRepo)

	e := &env{
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
	}

	return e, context.Background()
}

func performTestRequest(r http.Handler, req *http.Request) *httptest.ResponseRecorder {
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)
	return w
}

func createTestRequest(route, method string, user jwt.User, body interface{}) *http.Request {
	issuer := jwt.NewIssuer(getTestJWTCredentials())
	token, err := issuer.Issue(user, time.Hour)
	if err != nil {
		log.Fatal(err.Error())
	}

	req := createUnauthenticatedTestRequest(route, method, body)
	req.Header.Add("Authorization", "Bearer "+token)
	return req
}

func createUnauthenticatedTestRequest(route, method string, body interface{}) *http.Request {
	client := rpc.NewClient(time.Second)
	req, err := client.CreateRequest(method, route, body)
	if err != nil {
		log.Fatal("Failed to create request", zap.Error(err))
	}

	span := opentracing.StartSpan(fmt.Sprintf("%s.%s", method, route))
	opentracing.GlobalTracer().Inject(
		span.Context(),
		opentracing.HTTPHeaders,
		opentracing.HTTPHeadersCarrier(req.Header),
	)

	req.Header.Set("Content-Type", "application/json")
	return req
}

func getTestJWTCredentials() jwt.Credentials {
	return jwt.Credentials{
		Issuer: "test",
		Secret: "very-secret-secret",
	}
}
