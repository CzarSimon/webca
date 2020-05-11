package service

import (
	"context"
	"crypto/x509"
	"encoding/base64"
	"fmt"

	"github.com/CzarSimon/httputil"
	"github.com/CzarSimon/httputil/crypto"
	"github.com/CzarSimon/httputil/id"
	"github.com/CzarSimon/webca/api-server/internal/audit"
	"github.com/CzarSimon/webca/api-server/internal/model"
	"github.com/CzarSimon/webca/api-server/internal/password"
	"github.com/CzarSimon/webca/api-server/internal/repository"
	"github.com/CzarSimon/webca/api-server/internal/rsautil"
	"github.com/CzarSimon/webca/api-server/internal/timeutil"
	"github.com/opentracing/opentracing-go"
)

// CertificateService service responsible for certificate createion and management.
type CertificateService struct {
	AuditLog        audit.Logger
	CertRepo        repository.CertificateRepository
	KeyPairRepo     repository.KeyPairRepository
	UserRepo        repository.UserRepository
	PasswordService *password.Service
}

// Create creates and stores a certificate and private key.
func (c *CertificateService) Create(ctx context.Context, req model.CertificateRequest) (model.Certificate, error) {
	span, ctx := opentracing.StartSpanFromContext(ctx, "certificate_service_create")
	defer span.Finish()

	err := c.PasswordService.Allowed(req.Password)
	if err != nil {
		return model.Certificate{}, httputil.BadRequestError(err)
	}

	user, err := c.findUser(ctx, req.UserID)
	if err != nil {
		return model.Certificate{}, err
	}

	keys, err := c.createKeys(ctx, req.KeyRequest())
	if err != nil {
		return model.Certificate{}, httputil.InternalServerError(err)
	}

	cert, err := c.createCertificate(ctx, req, keys, user)
	if err != nil {
		return model.Certificate{}, httputil.InternalServerError(err)
	}

	return cert, nil
}

func (c *CertificateService) createCertificate(ctx context.Context, req model.CertificateRequest, keys model.SignEncoder, user model.User) (model.Certificate, error) {
	keyPair, err := c.encryptKeys(ctx, keys.Encode(), req.Password, user)
	if err != nil {
		return model.Certificate{}, err
	}

	cert := assembleCertificate(req, keyPair, user)
	body, err := keys.CreateCertificate(x509.Certificate{})
	if err != nil {
		return model.Certificate{}, fmt.Errorf("failed to create x509 certificate: %w", err)
	}

	cert.Body = body
	err = c.CertRepo.Save(ctx, cert)
	if err != nil {
		return model.Certificate{}, err
	}

	c.logNewCertificate(ctx, cert, user.ID)
	return cert, nil
}

func (c *CertificateService) createKeys(ctx context.Context, req model.KeyRequest) (model.SignEncoder, error) {
	keys, err := rsautil.GenerateKeys(req)
	return keys, err
}

func (c *CertificateService) encryptKeys(ctx context.Context, keyPair model.KeyPair, pwd string, user model.User) (model.KeyPair, error) {
	creds, err := c.PasswordService.Hash(ctx, pwd)
	if err != nil {
		return model.KeyPair{}, err
	}

	salt, err := c.PasswordService.GenerateSalt()
	if err != nil {
		return model.KeyPair{}, fmt.Errorf("salt generation failed: %w", err)
	}

	encryptionKey, err := crypto.Hmac([]byte(pwd), salt)
	if err != nil {
		return model.KeyPair{}, fmt.Errorf("failed to generate encryption key: %w", err)
	}

	ciphertext, err := crypto.NewAESCipher(encryptionKey).Encrypt([]byte(keyPair.PrivateKey))
	if err != nil {
		return model.KeyPair{}, fmt.Errorf("failed to encrypt private key: %w", err)
	}

	keyPair.Credentials = creds
	keyPair.EncryptionSalt = base64.StdEncoding.EncodeToString(salt)
	keyPair.PrivateKey = base64.StdEncoding.EncodeToString(ciphertext)
	keyPair.AccountID = user.Account.ID

	return keyPair, nil
}

func (c *CertificateService) findUser(ctx context.Context, userID string) (model.User, error) {
	user, exists, err := c.UserRepo.Find(ctx, userID)
	if err != nil {
		return model.User{}, httputil.InternalServerError(err)
	}

	if !exists {
		err := fmt.Errorf("unable to find User(id=%s) even though an authenticated user id was provided", userID)
		return model.User{}, httputil.UnauthorizedError(err)
	}

	return user, nil
}

func (c *CertificateService) logNewCertificate(ctx context.Context, cert model.Certificate, userID string) {
	// c.AuditLog.Create(ctx, userID, "certificate:%s", cert.ID)
	c.AuditLog.Create(ctx, userID, "key-pair:%s", cert.KeyPair.ID)
}

func assembleCertificate(req model.CertificateRequest, keyPair model.KeyPair, user model.User) model.Certificate {
	return model.Certificate{
		ID:        id.New(),
		Name:      req.Name,
		Subject:   req.Subject,
		KeyPair:   keyPair,
		Format:    keyPair.Format,
		Type:      req.Type,
		AccountID: user.Account.ID,
		CreatedAt: timeutil.Now(),
	}
}
