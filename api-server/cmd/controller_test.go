package main

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/CzarSimon/httputil/client/rpc"
	"github.com/CzarSimon/httputil/dbutil"
	"github.com/CzarSimon/httputil/jwt"
	"github.com/CzarSimon/webca/api-server/internal/audit"
	"github.com/CzarSimon/webca/api-server/internal/model"
	"github.com/CzarSimon/webca/api-server/internal/password"
	"github.com/CzarSimon/webca/api-server/internal/repository"
	"github.com/CzarSimon/webca/api-server/internal/service"
	"github.com/CzarSimon/webca/api-server/internal/timeutil"
	"github.com/opentracing/opentracing-go"
	"github.com/stretchr/testify/assert"
	"go.uber.org/zap"
)

func TestSignUp_NewAccount(t *testing.T) {
	starttime := timeutil.Now()
	assert := assert.New(t)
	e, ctx := createTestEnv()
	server := newServer(e)

	body := model.AuthenticationRequest{
		AccountName: "test-account",
		Email:       "mail@mail.com",
		Password:    "a5f3feccb16822dcfaa50c9fba91cab3",
	}

	accountRepo := repository.NewAccountRepository(e.db)
	_, accountExists, err := accountRepo.FindByName(ctx, body.AccountName)
	assert.False(accountExists)
	assert.NoError(err)

	userRepo := repository.NewUserRepository(e.db)
	_, userExists, err := userRepo.FindByAccountNameAndEmail(ctx, body.AccountName, body.Email)
	assert.False(userExists)
	assert.NoError(err)

	req := createTestRequest("/v1/signup", http.MethodPost, "", body)
	res := performTestRequest(server.Handler, req)
	endtime := timeutil.Now()
	assert.Equal(http.StatusOK, res.Code)

	var responseBody model.AuthenticationResponse
	err = json.NewDecoder(res.Result().Body).Decode(&responseBody)
	assert.NoError(err)

	// Check JWT
	user, err := jwt.NewVerifier(e.cfg.jwtCredentials, 0).Verify(responseBody.Token)
	assert.NoError(err)
	assert.Equal(responseBody.User.ID, user.ID)
	assert.True(user.HasRole(model.AdminRole)) // Should be ADMIN since account was created.

	// Check response body.
	assert.Equal(model.AdminRole, responseBody.User.Role)
	assert.Equal(body.Email, responseBody.User.Email)
	assert.Equal(body.AccountName, responseBody.User.Account.Name)
	assert.Empty(responseBody.User.Credentials.Password)
	assert.Empty(responseBody.User.Credentials.Salt)
	assert.True(starttime.Before(responseBody.User.CreatedAt))
	assert.True(starttime.Before(responseBody.User.UpdatedAt))
	assert.True(endtime.After(responseBody.User.CreatedAt))
	assert.True(endtime.After(responseBody.User.UpdatedAt))
	assert.True(endtime.After(responseBody.User.Account.CreatedAt))
	assert.True(endtime.After(responseBody.User.Account.CreatedAt))
	assert.True(starttime.Before(responseBody.User.Account.CreatedAt))
	assert.True(starttime.Before(responseBody.User.Account.CreatedAt))

	account, accountExists, err := accountRepo.FindByName(ctx, body.AccountName)
	assert.True(accountExists)
	assert.NoError(err)
	assert.Equal(body.AccountName, account.Name)
	assert.Equal(responseBody.User.Account.ID, account.ID)

	storedUser, userExists, err := userRepo.FindByAccountNameAndEmail(ctx, body.AccountName, body.Email)
	assert.True(userExists)
	assert.NoError(err)
	assert.Equal(body.Email, storedUser.Email)
	assert.Equal(user.ID, storedUser.ID)
	assert.Equal(responseBody.User.Account.ID, storedUser.Account.ID)
	assert.Equal(model.AdminRole, storedUser.Role)

	assert.NotEmpty(storedUser.Credentials.Password)
	assert.NotEmpty(storedUser.Credentials.Salt)
	assert.NotEqual(body.Password, storedUser.Credentials.Password)

	auditRepo := repository.NewAuditEventRepository(e.db)
	events, err := auditRepo.FindByResource(ctx, fmt.Sprintf("webca:api-server:account:%s", account.ID))
	assert.NoError(err)
	assert.Len(events, 1)
	assert.Equal("CREATE", events[0].Activity)
	assert.Equal(user.ID, events[0].UserID)

	events, err = auditRepo.FindByResource(ctx, fmt.Sprintf("webca:api-server:user:%s", user.ID))
	assert.NoError(err)
	assert.Len(events, 1)
	assert.Equal("CREATE", events[0].Activity)
	assert.Equal(user.ID, events[0].UserID)
}

func TestSignUp_ExistingAccount(t *testing.T) {
	assert := assert.New(t)
	e, ctx := createTestEnv()
	server := newServer(e)

	body := model.AuthenticationRequest{
		AccountName: "existing-test-account",
		Email:       "mail@mail.com",
		Password:    "a5f3feccb16822dcfaa50c9fba91cab3",
	}

	accountRepo := repository.NewAccountRepository(e.db)
	err := accountRepo.Save(ctx, model.NewAccount(body.AccountName))
	assert.NoError(err)

	userRepo := repository.NewUserRepository(e.db)
	_, userExists, err := userRepo.FindByAccountNameAndEmail(ctx, body.AccountName, body.Email)
	assert.False(userExists)
	assert.NoError(err)

	req := createTestRequest("/v1/signup", http.MethodPost, "", body)
	res := performTestRequest(server.Handler, req)
	assert.Equal(http.StatusOK, res.Code)

	var responseBody model.AuthenticationResponse
	err = json.NewDecoder(res.Result().Body).Decode(&responseBody)
	assert.NoError(err)

	// Check JWT
	user, err := jwt.NewVerifier(e.cfg.jwtCredentials, 0).Verify(responseBody.Token)
	assert.NoError(err)
	assert.True(user.HasRole(model.UserRole)) // Should be USER since account already existed.

	// Check response body.
	assert.Equal(model.UserRole, responseBody.User.Role)
	assert.Equal(body.Email, responseBody.User.Email)
	assert.Equal(body.AccountName, responseBody.User.Account.Name)

	storedUser, userExists, err := userRepo.FindByAccountNameAndEmail(ctx, body.AccountName, body.Email)
	assert.True(userExists)
	assert.NoError(err)
	assert.Equal(body.Email, storedUser.Email)
	assert.Equal(responseBody.User.Account.ID, storedUser.Account.ID)
	assert.Equal(model.UserRole, storedUser.Role)

	auditRepo := repository.NewAuditEventRepository(e.db)
	events, err := auditRepo.FindByResource(ctx, fmt.Sprintf("webca:api-server:account:%s", storedUser.Account.ID))
	assert.NoError(err)
	assert.Len(events, 1)
	assert.Equal("READ", events[0].Activity)
	assert.Equal(user.ID, events[0].UserID)

	events, err = auditRepo.FindByResource(ctx, fmt.Sprintf("webca:api-server:user:%s", user.ID))
	assert.NoError(err)
	assert.Len(events, 1)
	assert.Equal("CREATE", events[0].Activity)
	assert.Equal(user.ID, events[0].UserID)
}

func TestSignUp_SameUser_NewAccount(t *testing.T) {
	assert := assert.New(t)
	e, ctx := createTestEnv()
	server := newServer(e)

	accountRepo := repository.NewAccountRepository(e.db)
	existingAccount := model.NewAccount("existing-account")
	err := accountRepo.Save(ctx, existingAccount)
	assert.NoError(err)

	existingUser := model.NewUser("mail@mail.com", model.UserRole, model.Credentials{}, existingAccount)
	userRepo := repository.NewUserRepository(e.db)
	err = userRepo.Save(ctx, existingUser)
	assert.NoError(err)

	body := model.AuthenticationRequest{
		AccountName: "new-account",
		Email:       existingUser.Email,
		Password:    "a5f3feccb16822dcfaa50c9fba91cab3",
	}

	_, userExists, err := userRepo.FindByAccountNameAndEmail(ctx, body.AccountName, body.Email)
	assert.False(userExists)
	assert.NoError(err)

	_, userExists, _ = userRepo.FindByAccountNameAndEmail(ctx, existingAccount.Name, body.Email)
	assert.True(userExists)

	req := createTestRequest("/v1/signup", http.MethodPost, "", body)
	res := performTestRequest(server.Handler, req)
	assert.Equal(http.StatusOK, res.Code)

	var responseBody model.AuthenticationResponse
	err = json.NewDecoder(res.Result().Body).Decode(&responseBody)
	assert.NoError(err)

	// Check response body.
	assert.Equal(model.AdminRole, responseBody.User.Role)
	assert.Equal(body.Email, responseBody.User.Email)
	assert.Equal(body.AccountName, responseBody.User.Account.Name)

	newUser, userExists, _ := userRepo.FindByAccountNameAndEmail(ctx, body.AccountName, body.Email)
	assert.True(userExists)
	assert.Equal(existingUser.Email, newUser.Email)
	assert.Equal(responseBody.User.Account.ID, newUser.Account.ID)
	assert.NotEqual(existingAccount.ID, newUser.Account.ID)
	assert.Equal(model.AdminRole, newUser.Role)

	oldUser, userExists, _ := userRepo.FindByAccountNameAndEmail(ctx, existingAccount.Name, body.Email)
	assert.True(userExists)
	assert.NotEqual(oldUser.ID, newUser.ID)
	assert.Equal(existingUser.ID, oldUser.ID)
	assert.Equal(oldUser.Email, newUser.Email)
	assert.NotEqual(oldUser.Account.ID, newUser.Account.ID)
}

func TestSignUp_WeekPassword(t *testing.T) {
	assert := assert.New(t)
	e, ctx := createTestEnv()
	server := newServer(e)

	body := model.AuthenticationRequest{
		AccountName: "new-account",
		Email:       "mail@mail.com",
		Password:    "top-short",
	}

	req := createTestRequest("/v1/signup", http.MethodPost, "", body)
	res := performTestRequest(server.Handler, req)
	assert.Equal(http.StatusBadRequest, res.Code)

	userRepo := repository.NewUserRepository(e.db)
	_, userExists, err := userRepo.FindByAccountNameAndEmail(ctx, body.AccountName, body.Email)
	assert.NoError(err)
	assert.False(userExists)
}

// ---- Test utils ----

func createTestEnv() (*env, context.Context) {
	cfg := config{
		db:             dbutil.SqliteConfig{},
		migrationsPath: "../resources/db/sqlite",
		jwtCredentials: getTestJWTCredentials(),
	}

	db := dbutil.MustConnect(cfg.db)

	err := dbutil.Downgrade(cfg.migrationsPath, cfg.db.Driver(), db)
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

	e := &env{
		cfg: cfg,
		db:  db,
		accountService: &service.AccountService{
			JwtIssuer:       jwt.NewIssuer(cfg.jwtCredentials),
			AuditLog:        auditLog,
			AccountRepo:     repository.NewAccountRepository(db),
			UserRepo:        repository.NewUserRepository(db),
			PasswordService: passwordSvc,
		},
	}

	return e, context.Background()
}

func performTestRequest(r http.Handler, req *http.Request) *httptest.ResponseRecorder {
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)
	return w
}

func createTestRequest(route, method, role string, body interface{}) *http.Request {
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

	if role == "" {
		return req
	}

	issuer := jwt.NewIssuer(getTestJWTCredentials())
	token, err := issuer.Issue(jwt.User{
		ID:    "test-user",
		Roles: []string{role},
	}, time.Hour)

	req.Header.Add("Authorization", "Bearer "+token)
	return req
}

func getTestJWTCredentials() jwt.Credentials {
	return jwt.Credentials{
		Issuer: "test",
		Secret: "very-secret-secret",
	}
}
