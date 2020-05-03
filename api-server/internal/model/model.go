package model

import (
	"time"
)

// Certificate types
const (
	RootCAType         = "ROOT_CA"
	IntermediateCAType = "INTERMEDIATE_CA"
	CertificateType    = "CERTIFICATE"
)

// AccountRequest account creation and authentication request.
type AccountRequest struct {
	Name     string `json:"name,omitempty"`
	Password string `json:"name,omitempty"`
}

// Account user account.
type Account struct {
	ID        string    `json:"id,omitempty"`
	Name      string    `json:"name,omitempty"`
	Password  string    `json:"-"`
	Salt      string    `json:"-"`
	CreatedAt time.Time `json:"createdAt,omitempty"`
	UpdatedAt time.Time `json:"updatedAt,omitempty"`
}

// Certificate tls certificate and metadata.
type Certificate struct {
	ID          string `json:"id,omitempty"`
	Signature   string `json:"signature,omitempty"`
	PrivateKey  string `json:"privateKey,omitempty"`
	Format      string `json:"format,omitempty"`
	Type        string `json:"type,omitempty"`
	SignatoryID string `json:"signatoryId,omitempty"`
	AccountID   string `json:"accountId,omitempty"`
	CreatedAt   string `json:"createdAt,omitempty"`
	UpdatedAt   string `json:"updatedAt,omitempty"`
}
