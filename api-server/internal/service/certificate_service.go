package service

import (
	"context"
	"crypto/rand"
	"crypto/x509"
	"crypto/x509/pkix"
	"encoding/base64"
	"encoding/pem"
	"fmt"
	"math/big"

	"github.com/CzarSimon/httputil"
	"github.com/CzarSimon/httputil/crypto"
	"github.com/CzarSimon/httputil/id"
	"github.com/CzarSimon/httputil/jwt"
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

// GetCertificate retrieves certificate if it exists.
func (c *CertificateService) GetCertificate(ctx context.Context, principal jwt.User, id string) (model.Certificate, error) {
	span, ctx := opentracing.StartSpanFromContext(ctx, "certificate_service_get_certificate")
	defer span.Finish()

	cert, found, err := c.CertRepo.Find(ctx, id)
	if err != nil {
		return model.Certificate{}, err
	}

	if !found {
		err = fmt.Errorf("certificate with id %s does not exist", id)
		return model.Certificate{}, httputil.NotFoundError(err)
	}

	err = c.assertCertificateAccess(ctx, cert, principal)
	if err != nil {
		return model.Certificate{}, err
	}

	c.logCertificateReading(ctx, cert, principal.ID)
	return cert, nil
}

// GetOptions fetches certificate creation options.
func (c *CertificateService) GetOptions(ctx context.Context) (model.CertificateOptions, error) {
	span, ctx := opentracing.StartSpanFromContext(ctx, "certificate_service_get_options")
	defer span.Finish()

	types, err := c.CertRepo.FindTypes(ctx)
	if err != nil {
		return model.CertificateOptions{}, err
	}

	opts := model.CertificateOptions{
		Types:      types,
		Algorithms: []string{rsautil.Algorithm},
		Formats:    []string{"PEM"},
	}
	return opts, nil
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
		return model.Certificate{}, err
	}

	cert, err := c.createCertificate(ctx, req, keys, user)
	if err != nil {
		return model.Certificate{}, err
	}

	return cert, nil
}

func (c *CertificateService) createCertificate(ctx context.Context, req model.CertificateRequest, keys model.KeyEncoder, user model.User) (model.Certificate, error) {
	keyPair, err := c.encryptKeys(ctx, keys.Encode(), req.Password, user)
	if err != nil {
		return model.Certificate{}, err
	}

	cert, err := signCertificate(assembleCertificate(req, keyPair, user), keys)
	if err != nil {
		return model.Certificate{}, err
	}

	err = c.CertRepo.Save(ctx, cert)
	if err != nil {
		return model.Certificate{}, err
	}

	c.logNewCertificate(ctx, cert, user.ID)
	return cert, nil
}

func (c *CertificateService) createKeys(ctx context.Context, req model.KeyRequest) (model.KeyEncoder, error) {
	switch req.Algorithm {
	case rsautil.Algorithm:
		return rsautil.GenerateKeys(req)
	default:
		err := fmt.Errorf("CertificateService: unsupported KeyRequest.Algorithm=%s", req.Algorithm)
		return nil, httputil.BadRequestError(err)
	}
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

func (c *CertificateService) assertCertificateAccess(ctx context.Context, cert model.Certificate, principal jwt.User) error {
	user, err := c.findUser(ctx, principal.ID)
	if err != nil {
		return err
	}

	if user.Account.ID != cert.AccountID {
		err = fmt.Errorf("%s is not alowed to access %s. wrong account", user, cert)
		return httputil.ForbiddenError(err)
	}

	return nil
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
	c.AuditLog.Create(ctx, userID, "certificate:%s", cert.ID)
	c.AuditLog.Create(ctx, userID, "key-pair:%s", cert.KeyPair.ID)
}

func (c *CertificateService) logCertificateReading(ctx context.Context, cert model.Certificate, userID string) {
	c.AuditLog.Read(ctx, userID, "certificate:%s", cert.ID)
}

func signCertificate(cert model.Certificate, keys model.KeyEncoder) (model.Certificate, error) {
	template, err := x509Template(cert)
	if err != nil {
		return model.Certificate{}, err
	}

	b, err := x509.CreateCertificate(rand.Reader, template, template, keys.PublicKey(), keys.PrivateKey())
	if err != nil {
		return model.Certificate{}, fmt.Errorf("failed to create x509 certificate: %w", err)
	}

	block := &pem.Block{Type: "CERTIFICATE", Bytes: b}
	cert.Body = string(pem.EncodeToMemory(block))
	return cert, nil
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

func x509Template(cert model.Certificate) (*x509.Certificate, error) {
	now := timeutil.Now()
	xc := &x509.Certificate{
		SerialNumber: big.NewInt(1),
		Subject: pkix.Name{
			CommonName:         cert.Subject.CommonName,
			Country:            []string{cert.Subject.Country},
			Province:           []string{cert.Subject.State},
			Locality:           []string{cert.Subject.Locality},
			Organization:       []string{cert.Subject.Organization},
			OrganizationalUnit: []string{cert.Subject.OrganizationalUnit},
		},
		NotBefore: now,
		NotAfter:  now.AddDate(0, 0, 365),
	}

	switch cert.Type {
	case model.RootCAType:
		xc.IsCA = true
		xc.KeyUsage = x509.KeyUsageDigitalSignature | x509.KeyUsageCertSign
		xc.ExtKeyUsage = []x509.ExtKeyUsage{x509.ExtKeyUsageClientAuth, x509.ExtKeyUsageServerAuth}
		xc.BasicConstraintsValid = true
	default:
		err := fmt.Errorf("unsupported certificate type: %s", cert.Type)
		return nil, httputil.BadRequestError(err)
	}

	return xc, nil
}
