package main

import (
	"net/http"
	"testing"

	"github.com/CzarSimon/httputil/jwt"
	"github.com/CzarSimon/webca/api-server/internal/model"
	"github.com/CzarSimon/webca/api-server/internal/repository"
	"github.com/stretchr/testify/assert"
)

func TestCreateRootCertificate(t *testing.T) {
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

	body := model.CertificateRequest{
		Name: "test-root-ca-certificate",
		Subject: model.CertificateSubject{
			CommonName:         "WebCA Test Root CA",
			Country:            "SE",
			Locality:           "Stockholm",
			Organization:       "WebCA AB",
			OrganizationalUnit: "Engineering",
			Email:              "engineering@webca.io",
		},
		Type:      "ROOT_CA",
		Algorithm: "RSA",
		Password:  "edcc550504ad1e531a5a008644932355",
		Options: map[string]interface{}{
			"keySize": 2048,
		},
	}

	req := createTestRequest("/v1/certificates", http.MethodPost, user.JWTUser(), body)
	res := performTestRequest(server.Handler, req)
	assert.Equal(http.StatusOK, res.Code)
}

func TestCreateRootCertificate_UnauthorizedAndForbidden(t *testing.T) {
	testUnauthorized(t, "/v1/certificates", http.MethodPost)
	testForbidden(t, "/v1/certificates", http.MethodPost, []string{
		jwt.AnonymousRole,
	})
}
