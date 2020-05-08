package main

import (
	"net/http"
	"testing"

	"github.com/CzarSimon/httputil/jwt"
	"github.com/CzarSimon/webca/api-server/internal/model"
	"github.com/stretchr/testify/assert"
)

func TestCreateRootCertificate(t *testing.T) {
	assert := assert.New(t)
	e, _ := createTestEnv()
	server := newServer(e)

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

	req := createTestRequest("/v1/certificates", http.MethodPost, model.UserRole, body)
	res := performTestRequest(server.Handler, req)
	assert.Equal(http.StatusOK, res.Code)
}

func TestCreateRootCertificate_UnauthorizedAndForbidden(t *testing.T) {
	assert := assert.New(t)
	e, _ := createTestEnv()
	server := newServer(e)

	req := createTestRequest("/v1/certificates", http.MethodPost, "", model.CertificateRequest{})
	res := performTestRequest(server.Handler, req)
	assert.Equal(http.StatusUnauthorized, res.Code)

	req = createTestRequest("/v1/certificates", http.MethodPost, jwt.AnonymousRole, model.CertificateRequest{})
	res = performTestRequest(server.Handler, req)
	assert.Equal(http.StatusForbidden, res.Code)
}
