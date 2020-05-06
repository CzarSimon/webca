package model

import (
	"fmt"
	"time"

	"github.com/CzarSimon/httputil/id"
	"github.com/CzarSimon/webca/api-server/internal/timeutil"
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
	Password string `json:"password,omitempty"`
}

// LoginResponse authentication response.
type LoginResponse struct {
	Token   string  `json:"token,omitempty"`
	Account Account `json:"account,omitempty"`
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

// AuditEvent sensitive activity performed in the system.
type AuditEvent struct {
	ID        string    `json:"id,omitempty"`
	UserID    string    `json:"userId,omitempty"`
	Activity  string    `json:"activity,omitempty"`
	Resource  string    `json:"resource,omitempty"`
	CreatedAt time.Time `json:"createdAt,omitempty"`
}

// NewAuditEvent creates a new AuditEvent
func NewAuditEvent(userID, activity, resource string) AuditEvent {
	return AuditEvent{
		ID:        id.New(),
		UserID:    userID,
		Activity:  activity,
		Resource:  resource,
		CreatedAt: timeutil.Now(),
	}
}

func (e AuditEvent) String() string {
	return fmt.Sprintf("AuditEvent(id=%s, userId=%s, activity=%s, resource=%s, createdAt=%v)", e.ID, e.UserID, e.Activity, e.Resource, e.CreatedAt)
}
