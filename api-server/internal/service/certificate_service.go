package service

import (
	"context"

	"github.com/CzarSimon/webca/api-server/internal/audit"
	"github.com/CzarSimon/webca/api-server/internal/model"
	"github.com/CzarSimon/webca/api-server/internal/password"
	"github.com/CzarSimon/webca/api-server/internal/repository"
	"github.com/opentracing/opentracing-go"
)

// CertificateService service responsible for certificate createion and management.
type CertificateService struct {
	AuditLog        audit.Logger
	KeyPairRepo     repository.KeyPairRepository
	PasswordService *password.Service
}

// Create creates and stores a certificate and private key.
func (c *CertificateService) Create(ctx context.Context, req model.CertificateRequest) (model.Certificate, error) {
	span, _ := opentracing.StartSpanFromContext(ctx, "certificate_service_create")
	defer span.Finish()

	cert, err := c.createCertificate(ctx, req)
	if err != nil {
		return model.Certificate{}, err
	}

	return cert, nil
}

func (c *CertificateService) createCertificate(ctx context.Context, req model.CertificateRequest) (model.Certificate, error) {
	return model.Certificate{}, nil
}
