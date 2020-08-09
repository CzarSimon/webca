package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"testing"
	"time"

	"github.com/CzarSimon/httputil/id"
	"github.com/CzarSimon/httputil/jwt"
	"github.com/CzarSimon/webca/api-server/internal/model"
	"github.com/CzarSimon/webca/api-server/internal/repository"
	"github.com/CzarSimon/webca/api-server/internal/timeutil"
	"github.com/stretchr/testify/assert"
)

func TestCreateInvitation(t *testing.T) {
	assert := assert.New(t)
	e, ctx := createTestEnv()
	server := newServer(e)

	startTime := timeutil.Now()
	account, admin, _ := createTestAccount(t, e)

	body := model.InvitationCreationRequest{
		Email: "new-user@webca.io",
		Role:  model.UserRole,
	}
	req := createTestRequest("/v1/invitations", http.MethodPost, admin.JWTUser(), body)
	res := performTestRequest(server.Handler, req)
	assert.Equal(http.StatusOK, res.Code)

	var invite model.Invitation
	err := json.NewDecoder(res.Result().Body).Decode(&invite)
	assert.NoError(err)
	assert.Len(invite.ID, 36)
	assert.Equal(model.InvitationCreated, invite.Status)
	assert.Equal(model.UserRole, invite.Role)
	assert.Equal("new-user@webca.io", invite.Email)
	assert.Equal(admin.ID, invite.CreatedByID)
	assert.Equal(account.ID, invite.Account.ID)
	assert.Equal(invite.CreatedAt.Add(24*time.Hour), invite.ValidTo)
	assert.True(invite.CreatedAt.Before(timeutil.Now()))
	assert.True(invite.CreatedAt.After(startTime))

	inviteRepo := repository.NewInvitationRepository(e.db)
	stored, exists, err := inviteRepo.Find(ctx, invite.ID)
	assert.NoError(err)
	assert.True(exists)
	assert.Equal(invite, stored)

	auditRepo := repository.NewAuditEventRepository(e.db)
	events, err := auditRepo.FindByResource(ctx, fmt.Sprintf("webca:api-server:invitation:%s", invite.ID))
	assert.NoError(err)
	assert.Len(events, 1)
	assert.Equal("CREATE", events[0].Activity)
	assert.Equal(admin.ID, events[0].UserID)
}

func TestCreateInvitation_InvalidRole(t *testing.T) {
	assert := assert.New(t)
	e, _ := createTestEnv()
	server := newServer(e)

	_, admin, _ := createTestAccount(t, e)

	body := model.InvitationCreationRequest{
		Email: "new-user@webca.io",
		Role:  "UNKNOWN_ROLE",
	}
	req := createTestRequest("/v1/invitations", http.MethodPost, admin.JWTUser(), body)
	res := performTestRequest(server.Handler, req)
	assert.Equal(http.StatusBadRequest, res.Code)
}

func TestCreateInvitation_EmptyEmail(t *testing.T) {
	assert := assert.New(t)
	e, _ := createTestEnv()
	server := newServer(e)

	_, admin, _ := createTestAccount(t, e)

	body := model.InvitationCreationRequest{
		Email: "",
		Role:  model.AdminRole,
	}
	req := createTestRequest("/v1/invitations", http.MethodPost, admin.JWTUser(), body)
	res := performTestRequest(server.Handler, req)
	assert.Equal(http.StatusBadRequest, res.Code)
}

func TestCreateInvitation_BadContentType(t *testing.T) {
	path := "/v1/invitations"
	testBadContentType(t, path, http.MethodPost, model.AdminRole)
}

func TestCreateInvitation_UnauthorizedAndForbidden(t *testing.T) {
	path := "/v1/invitations"
	testUnauthorized(t, path, http.MethodPost)
	testForbidden(t, path, http.MethodPost, []string{
		jwt.AnonymousRole,
		model.UserRole,
	})
}

func TestGetInvitation(t *testing.T) {
	assert := assert.New(t)
	e, ctx := createTestEnv()
	server := newServer(e)

	startTime := timeutil.Now()
	account, admin, _ := createTestAccount(t, e)
	inviteRepo := repository.NewInvitationRepository(e.db)
	invite := model.Invitation{
		ID:          id.New(),
		Email:       "new-user@webca.io",
		Role:        model.AdminRole,
		Status:      model.InvitationCreated,
		CreatedByID: admin.ID,
		Account:     account,
		CreatedAt:   startTime,
		ValidTo:     startTime.Add(24 * time.Hour),
	}
	err := inviteRepo.Save(ctx, invite)
	assert.NoError(err)

	path := fmt.Sprintf("/v1/invitations/%s", invite.ID)
	req := createUnauthenticatedTestRequest(path, http.MethodGet, nil)
	res := performTestRequest(server.Handler, req)
	assert.Equal(http.StatusOK, res.Code)

	var rBody model.Invitation
	err = json.NewDecoder(res.Result().Body).Decode(&rBody)
	assert.NoError(err)
	assert.Equal(invite, rBody)

	auditRepo := repository.NewAuditEventRepository(e.db)
	events, err := auditRepo.FindByResource(ctx, fmt.Sprintf("webca:api-server:invitation:%s", invite.ID))
	assert.NoError(err)
	assert.Len(events, 1)
	assert.Equal("READ", events[0].Activity)
	assert.Equal("ANONYMOUS", events[0].UserID)
}

func TestGetInvitation_BadContentType(t *testing.T) {
	path := fmt.Sprintf("/v1/invitations/%s", id.New())
	testBadContentType(t, path, http.MethodGet, model.AdminRole)
}
