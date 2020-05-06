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
	"github.com/CzarSimon/webca/api-server/internal/model"
	"github.com/CzarSimon/webca/api-server/internal/service"
	"github.com/CzarSimon/webca/api-server/internal/timeutil"
	"github.com/opentracing/opentracing-go"
	"github.com/stretchr/testify/assert"
	"go.uber.org/zap"
)

func TestSignUp_NewAccount(t *testing.T) {
	starttime := timeutil.Now()
	assert := assert.New(t)
	e, _ := createTestEnv()
	server := newServer(e)

	body := model.AuthenticationRequest{
		AccountName: "test-account",
		Email:       "mail@mail.com",
		Password:    "a5f3feccb16822dcfaa50c9fba91cab3",
	}

	req := createTestRequest("/v1/signup", http.MethodPost, "", body)
	res := performTestRequest(server.Handler, req)
	endtime := timeutil.Now()
	assert.Equal(http.StatusOK, res.Code)

	var responseBody model.AuthenticationResponse
	err := json.NewDecoder(res.Result().Body).Decode(&responseBody)
	assert.NoError(err)

	user, err := jwt.NewVerifier(e.cfg.jwtCredentials, 0).Verify(responseBody.Token)
	assert.NoError(err)
	assert.Equal(responseBody.User.ID, user.ID)
	assert.True(user.HasRole(model.AdminRole))

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

	e := &env{
		cfg: cfg,
		db:  db,
		accountService: &service.AccountService{
			JwtIssuer: jwt.NewIssuer(cfg.jwtCredentials),
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
