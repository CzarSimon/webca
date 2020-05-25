package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"testing"

	"github.com/CzarSimon/httputil/id"
	"github.com/CzarSimon/httputil/jwt"
	"github.com/CzarSimon/webca/api-server/internal/model"
	"github.com/CzarSimon/webca/api-server/internal/repository"
	"github.com/CzarSimon/webca/api-server/internal/rsautil"
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

	var rBody model.Certificate
	err = json.NewDecoder(res.Result().Body).Decode(&rBody)
	assert.NoError(err)
	assert.Len(rBody.ID, 36)
	assert.Empty(rBody.KeyPair)
	assert.Empty(rBody.SignatoryID)
	assert.NotEmpty(rBody.CreatedAt)

	assert.Equal("PEM", rBody.Format)
	assert.Equal("ROOT_CA", rBody.Type)
	assert.Equal(account.ID, rBody.AccountID)
	assert.Equal(body.Name, rBody.Name)
	assert.True(strings.HasPrefix(rBody.Body, "-----BEGIN CERTIFICATE-----"))
	assert.True(strings.HasSuffix(rBody.Body, "-----END CERTIFICATE-----\n"))

	certRepo := repository.NewCertificateRepository(e.db)
	cert, exists, err := certRepo.FindByNameAndAccountID(ctx, body.Name, account.ID)
	assert.NoError(err)
	assert.True(exists)
	assert.Equal(rBody.ID, cert.ID)
	assert.True(strings.HasPrefix(cert.Body, "-----BEGIN CERTIFICATE-----"))
	assert.True(strings.HasSuffix(cert.Body, "-----END CERTIFICATE-----\n"))

	keyPairRepo := repository.NewKeyPairRepository(e.db)
	keys, err := keyPairRepo.FindByAccountID(ctx, account.ID)
	assert.NoError(err)
	assert.Len(keys, 1)

	key := keys[0]
	assert.Equal(rsautil.Algorithm, key.Algorithm)
	assert.Equal("PEM", key.Format)
	assert.Equal(user.Account.ID, key.AccountID)
	assert.Len(key.ID, 36)
	assert.NotEmpty(key.Credentials)
	assert.NotEmpty(key.EncryptionSalt)
	assert.NotEmpty(key.CreatedAt)
	assert.NotEmpty(key.PrivateKey)

	assert.True(strings.HasPrefix(key.PublicKey, "-----BEGIN PUBLIC KEY-----"))
	assert.True(strings.HasSuffix(key.PublicKey, "-----END PUBLIC KEY-----\n"))
	assert.False(strings.HasPrefix(key.PrivateKey, "-----BEGIN RSA PRIVATE KEY-----"))

	auditRepo := repository.NewAuditEventRepository(e.db)
	events, err := auditRepo.FindByResource(ctx, fmt.Sprintf("webca:api-server:key-pair:%s", key.ID))
	assert.NoError(err)
	assert.Len(events, 1)
	assert.Equal("CREATE", events[0].Activity)
	assert.Equal(user.ID, events[0].UserID)

	events, err = auditRepo.FindByResource(ctx, fmt.Sprintf("webca:api-server:certificate:%s", cert.ID))
	assert.NoError(err)
	assert.Len(events, 1)
	assert.Equal("CREATE", events[0].Activity)
	assert.Equal(user.ID, events[0].UserID)
}

func TestCreateCertificate_WeekPassword(t *testing.T) {
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
			CommonName: "WebCA Test Root CA",
		},
		Type:      "ROOT_CA",
		Algorithm: "RSA",
		Password:  "123456",
		Options: map[string]interface{}{
			"keySize": 2048,
		},
	}

	req := createTestRequest("/v1/certificates", http.MethodPost, user.JWTUser(), body)
	res := performTestRequest(server.Handler, req)
	assert.Equal(http.StatusBadRequest, res.Code)

	keyPairRepo := repository.NewKeyPairRepository(e.db)
	keys, err := keyPairRepo.FindByAccountID(ctx, account.ID)
	assert.NoError(err)
	assert.Len(keys, 0)
}

func TestCreateCertificate_AuthenticatedUserMissingInDatabase(t *testing.T) {
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
			CommonName: "WebCA Test Root CA",
		},
		Type:      "ROOT_CA",
		Algorithm: "RSA",
		Password:  "4ad4a159f6145fd8168b2de1c11677ff",
		Options: map[string]interface{}{
			"keySize": 2048,
		},
	}

	jwtUser := user.JWTUser()
	jwtUser.ID = id.New()
	req := createTestRequest("/v1/certificates", http.MethodPost, jwtUser, body)
	res := performTestRequest(server.Handler, req)
	assert.Equal(http.StatusUnauthorized, res.Code)

	keyPairRepo := repository.NewKeyPairRepository(e.db)
	keys, err := keyPairRepo.FindByAccountID(ctx, account.ID)
	assert.NoError(err)
	assert.Len(keys, 0)
}

func TestCreateCertificate_UnsupportedType(t *testing.T) {
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
			CommonName: "WebCA Test Root CA",
		},
		Type:      "ODD_TYPE",
		Algorithm: "RSA",
		Password:  "04360c52972e25e9e85f71168b51f67e",
		Options: map[string]interface{}{
			"keySize": 2048,
		},
	}

	req := createTestRequest("/v1/certificates", http.MethodPost, user.JWTUser(), body)
	res := performTestRequest(server.Handler, req)
	assert.Equal(http.StatusBadRequest, res.Code)

	keyPairRepo := repository.NewKeyPairRepository(e.db)
	keys, err := keyPairRepo.FindByAccountID(ctx, account.ID)
	assert.NoError(err)
	assert.Len(keys, 0)

	certRepo := repository.NewCertificateRepository(e.db)
	_, exists, err := certRepo.FindByNameAndAccountID(ctx, body.Name, account.ID)
	assert.NoError(err)
	assert.False(exists)
}

func TestCreateCertificate_UnsupportedAlgorithm(t *testing.T) {
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
			CommonName: "WebCA Test Root CA",
		},
		Type:      "ROOT_CA",
		Algorithm: "ODD_ALGO",
		Password:  "04360c52972e25e9e85f71168b51f67e",
		Options: map[string]interface{}{
			"keySize": 2048,
		},
	}

	req := createTestRequest("/v1/certificates", http.MethodPost, user.JWTUser(), body)
	res := performTestRequest(server.Handler, req)
	assert.Equal(http.StatusBadRequest, res.Code)

	keyPairRepo := repository.NewKeyPairRepository(e.db)
	keys, err := keyPairRepo.FindByAccountID(ctx, account.ID)
	assert.NoError(err)
	assert.Len(keys, 0)

	certRepo := repository.NewCertificateRepository(e.db)
	_, exists, err := certRepo.FindByNameAndAccountID(ctx, body.Name, account.ID)
	assert.NoError(err)
	assert.False(exists)
}

func TestCreateCertificate_BadContentType(t *testing.T) {
	testBadContentType(t, "/v1/certificates", http.MethodPost, model.UserRole)
}

func TestCreateCertificate_UnauthorizedAndForbidden(t *testing.T) {
	testUnauthorized(t, "/v1/certificates", http.MethodPost)
	testForbidden(t, "/v1/certificates", http.MethodPost, []string{
		jwt.AnonymousRole,
	})
}

func TestGetCertificateOptions(t *testing.T) {
	assert := assert.New(t)
	e, _ := createTestEnv()
	server := newServer(e)

	account := model.NewAccount("test-account")
	user := model.NewUser("mail@mail.com", model.UserRole, model.Credentials{}, account)

	req := createTestRequest("/v1/certificate-options", http.MethodGet, user.JWTUser(), nil)
	res := performTestRequest(server.Handler, req)
	assert.Equal(http.StatusOK, res.Code)

	var rBody model.CertificateOptions
	err := json.NewDecoder(res.Result().Body).Decode(&rBody)
	assert.NoError(err)

	assert.Len(rBody.Algorithms, 1)
	assert.Equal(rBody.Algorithms[0], rsautil.Algorithm)
	assert.Len(rBody.Formats, 1)
	assert.Equal(rBody.Formats[0], "PEM")

	assert.Len(rBody.Types, 3)
	tm := make(map[string]model.CertificateType)
	for _, t := range rBody.Types {
		tm[t.Name] = t
	}

	for _, name := range []string{model.RootCAType, model.IntermediateCAType, model.UserCertificateType} {
		t, ok := tm[name]
		assert.True(ok)
		assert.True(t.Active)
	}
}

func TestGetCertificateOptions_BadContentType(t *testing.T) {
	testBadContentType(t, "/v1/certificate-options", http.MethodGet, model.UserRole)
}

func TestGetCertificateTypes_UnauthorizedAndForbidden(t *testing.T) {
	testUnauthorized(t, "/v1/certificate-options", http.MethodGet)
	testForbidden(t, "/v1/certificate-options", http.MethodGet, []string{
		jwt.AnonymousRole,
	})
}

func TestGetCertificate(t *testing.T) {
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
	admin := model.NewUser("admin@mail.com", model.AdminRole, model.Credentials{}, account)
	err = userRepo.Save(ctx, admin)
	assert.NoError(err)

	user := model.NewUser("user@mail.com", model.UserRole, model.Credentials{}, account)
	err = userRepo.Save(ctx, user)
	assert.NoError(err)

	otherUser := model.NewUser("user@mail.com", model.UserRole, model.Credentials{}, otherAccount)
	err = userRepo.Save(ctx, otherUser)
	assert.NoError(err)

	body := model.CertificateRequest{
		Name: "test-root-ca-certificate",
		Subject: model.CertificateSubject{
			CommonName: "WebCA Test Root CA",
		},
		Type:      "ROOT_CA",
		Algorithm: "RSA",
		Password:  "edcc550504ad1e531a5a008644932355",
		Options: map[string]interface{}{
			"keySize": 512,
		},
	}

	req := createTestRequest("/v1/certificates", http.MethodPost, admin.JWTUser(), body)
	res := performTestRequest(server.Handler, req)
	assert.Equal(http.StatusOK, res.Code)

	certRepo := repository.NewCertificateRepository(e.db)
	cert, exists, err := certRepo.FindByNameAndAccountID(ctx, body.Name, account.ID)
	assert.NoError(err)
	assert.True(exists)

	path := fmt.Sprintf("/v1/certificates/%s", cert.ID)
	req = createTestRequest(path, http.MethodGet, user.JWTUser(), nil)
	res = performTestRequest(server.Handler, req)
	assert.Equal(http.StatusOK, res.Code)

	var rBody model.Certificate
	err = json.NewDecoder(res.Result().Body).Decode(&rBody)
	assert.NoError(err)

	assert.Empty(rBody.KeyPair)
	assert.NotEmpty(rBody.Body)
	assert.Equal(cert.ID, rBody.ID)
	assert.Equal("ROOT_CA", rBody.Type)
	assert.Equal(account.ID, rBody.AccountID)
	assert.Equal(body.Name, rBody.Name)

	req = createTestRequest(path, http.MethodGet, admin.JWTUser(), nil)
	res = performTestRequest(server.Handler, req)
	assert.Equal(http.StatusOK, res.Code)

	auditRepo := repository.NewAuditEventRepository(e.db)
	events, err := auditRepo.FindByResource(ctx, fmt.Sprintf("webca:api-server:certificate:%s", cert.ID))
	assert.NoError(err)
	assert.Len(events, 3)
	assert.Equal("CREATE", events[0].Activity)
	assert.Equal(admin.ID, events[0].UserID)
	assert.Equal("READ", events[1].Activity)
	assert.Equal(user.ID, events[1].UserID)
	assert.Equal("READ", events[2].Activity)
	assert.Equal(admin.ID, events[2].UserID)

	req = createTestRequest(path, http.MethodGet, otherUser.JWTUser(), nil)
	res = performTestRequest(server.Handler, req)
	assert.Equal(http.StatusForbidden, res.Code)

	principalThatDoesNotExist := jwt.User{
		ID:    id.New(),
		Roles: []string{model.AdminRole},
	}

	req = createTestRequest(path, http.MethodGet, principalThatDoesNotExist, nil)
	res = performTestRequest(server.Handler, req)
	assert.Equal(http.StatusUnauthorized, res.Code)
}

func TestGetCertificate_NotFound(t *testing.T) {
	assert := assert.New(t)
	e, _ := createTestEnv()
	server := newServer(e)

	principal := jwt.User{
		ID:    id.New(),
		Roles: []string{model.UserRole},
	}

	path := fmt.Sprintf("/v1/certificates/%s", id.New())
	req := createTestRequest(path, http.MethodGet, principal, nil)
	res := performTestRequest(server.Handler, req)
	assert.Equal(http.StatusNotFound, res.Code)
}

func TestGetCertificate_BadContentType(t *testing.T) {
	path := fmt.Sprintf("/v1/certificates/%s", id.New())
	testBadContentType(t, path, http.MethodGet, model.UserRole)
}

func TestGetCertificate_UnauthorizedAndForbidden(t *testing.T) {
	path := fmt.Sprintf("/v1/certificates/%s", id.New())
	testUnauthorized(t, path, http.MethodGet)
	testForbidden(t, path, http.MethodGet, []string{
		jwt.AnonymousRole,
	})
}
