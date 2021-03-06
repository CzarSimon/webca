package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"testing"

	"github.com/CzarSimon/httputil/id"
	"github.com/CzarSimon/httputil/jwt"
	"github.com/CzarSimon/webca/api-server/internal/model"
	"github.com/CzarSimon/webca/api-server/internal/repository"
	"github.com/stretchr/testify/assert"
)

func TestGetUser(t *testing.T) {
	assert := assert.New(t)
	e, ctx := createTestEnv()
	server := newServer(e)

	accountRepo := repository.NewAccountRepository(e.db)
	account := model.NewAccount("test-account")
	err := accountRepo.Save(ctx, account)
	assert.NoError(err)

	user := model.NewUser("mail@mail.com", model.UserRole, model.Credentials{}, account)
	userRepo := repository.NewUserRepository(e.db)
	err = userRepo.Save(ctx, user)
	assert.NoError(err)

	path := fmt.Sprintf("/v1/users/%s", user.ID)
	req := createTestRequest(path, http.MethodGet, user.JWTUser(), nil)
	res := performTestRequest(server.Handler, req)
	assert.Equal(http.StatusOK, res.Code)

	var rBody model.User
	err = json.NewDecoder(res.Result().Body).Decode(&rBody)
	assert.NoError(err)
	assert.Equal(user.ID, rBody.ID)
	assert.Equal(user.Email, rBody.Email)
	assert.Equal(user.Role, rBody.Role)
	assert.Equal(account.ID, rBody.Account.ID)
	assert.Empty(rBody.Credentials)

	auditRepo := repository.NewAuditEventRepository(e.db)
	events, err := auditRepo.FindByResource(ctx, fmt.Sprintf("webca:api-server:user:%s", user.ID))
	assert.NoError(err)
	assert.Len(events, 1)
	assert.Equal("READ", events[0].Activity)
	assert.Equal(user.ID, events[0].UserID)
}

func TestGetUser_NotFound(t *testing.T) {
	assert := assert.New(t)
	e, ctx := createTestEnv()
	server := newServer(e)

	account := model.NewAccount("test-account")
	user := model.NewUser("mail@mail.com", model.UserRole, model.Credentials{}, account)

	path := fmt.Sprintf("/v1/users/%s", user.ID)
	req := createTestRequest(path, http.MethodGet, user.JWTUser(), nil)
	res := performTestRequest(server.Handler, req)
	assert.Equal(http.StatusNotFound, res.Code)

	auditRepo := repository.NewAuditEventRepository(e.db)
	events, err := auditRepo.FindByResource(ctx, fmt.Sprintf("webca:api-server:user:%s", user.ID))
	assert.NoError(err)
	assert.Len(events, 0)
}

func TestGetUser_OtherUser(t *testing.T) {
	assert := assert.New(t)
	e, ctx := createTestEnv()
	server := newServer(e)

	accountRepo := repository.NewAccountRepository(e.db)
	account := model.NewAccount("test-account")
	err := accountRepo.Save(ctx, account)
	assert.NoError(err)

	otherAccount := model.NewAccount("other-account")
	err = accountRepo.Save(ctx, otherAccount)
	assert.NoError(err)

	userRepo := repository.NewUserRepository(e.db)
	user := model.NewUser("mail@mail.com", model.UserRole, model.Credentials{}, account)
	err = userRepo.Save(ctx, user)
	assert.NoError(err)

	admin := model.NewUser("admin@mail.com", model.AdminRole, model.Credentials{}, account)
	err = userRepo.Save(ctx, admin)
	assert.NoError(err)

	otherUser := model.NewUser("mail@other.com", model.UserRole, model.Credentials{}, otherAccount)
	err = userRepo.Save(ctx, otherUser)
	assert.NoError(err)

	path := fmt.Sprintf("/v1/users/%s", user.ID)
	req := createTestRequest(path, http.MethodGet, admin.JWTUser(), nil)
	res := performTestRequest(server.Handler, req)
	assert.Equal(http.StatusOK, res.Code)

	var rBody model.User
	err = json.NewDecoder(res.Result().Body).Decode(&rBody)
	assert.NoError(err)
	assert.Equal(user.ID, rBody.ID)
	assert.Equal(user.Email, rBody.Email)
	assert.Equal(user.Role, rBody.Role)
	assert.Equal(account.ID, rBody.Account.ID)
	assert.Empty(rBody.Credentials)

	userPrincipal := jwt.User{
		ID:    id.New(),
		Roles: []string{model.UserRole},
	}

	req = createTestRequest(path, http.MethodGet, userPrincipal, nil)
	res = performTestRequest(server.Handler, req)
	assert.Equal(http.StatusForbidden, res.Code)

	otherPath := fmt.Sprintf("/v1/users/%s", otherUser.ID)
	req = createTestRequest(otherPath, http.MethodGet, user.JWTUser(), nil)
	res = performTestRequest(server.Handler, req)
	assert.Equal(http.StatusForbidden, res.Code)

	req = createTestRequest(otherPath, http.MethodGet, admin.JWTUser(), nil)
	res = performTestRequest(server.Handler, req)
	assert.Equal(http.StatusForbidden, res.Code)

	auditRepo := repository.NewAuditEventRepository(e.db)
	events, err := auditRepo.FindByResource(ctx, fmt.Sprintf("webca:api-server:user:%s", user.ID))
	assert.NoError(err)
	assert.Len(events, 1)
	assert.Equal("READ", events[0].Activity)
	assert.Equal(admin.ID, events[0].UserID)

	events, err = auditRepo.FindByResource(ctx, fmt.Sprintf("webca:api-server:user:%s", otherUser.ID))
	assert.NoError(err)
	assert.Len(events, 0)
}

func TestGetUser_BadContentType(t *testing.T) {
	path := fmt.Sprintf("/v1/users/%s", id.New())
	testBadContentType(t, path, http.MethodGet, model.UserRole)
}

func TestGetUser_UnauthorizedAndForbidden(t *testing.T) {
	path := fmt.Sprintf("/v1/users/%s", id.New())
	testUnauthorized(t, path, http.MethodGet)
	testForbidden(t, path, http.MethodGet, []string{
		jwt.AnonymousRole,
	})
}
