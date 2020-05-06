package model

import (
	"fmt"
	"time"

	"github.com/CzarSimon/httputil/id"
	"github.com/CzarSimon/httputil/jwt"
	"github.com/CzarSimon/webca/api-server/internal/timeutil"
)

// Certificate types
const (
	RootCAType         = "ROOT_CA"
	IntermediateCAType = "INTERMEDIATE_CA"
	CertificateType    = "CERTIFICATE"
)

// User roles
const (
	AdminRole = "ADMIN"
	UserRole  = "USER"
)

// AccountRequest account creation and authentication request.
type AccountRequest struct {
	Name     string `json:"name,omitempty"`
	Password string `json:"password,omitempty"`
}

// AuthenticationRequest authentication information.
type AuthenticationRequest struct {
	AccountName string `json:"accountName,omitempty"`
	Email       string `json:"email,omitempty"`
	Password    string `json:"password,omitempty"`
}

// AuthenticationResponse user information and access token.
type AuthenticationResponse struct {
	Token string `json:"token,omitempty"`
	User  User   `json:"user,omitempty"`
}

// User account member.
type User struct {
	ID          string      `json:"id,omitempty"`
	Email       string      `json:"email,omitempty"`
	Role        string      `json:"role,omitempty"`
	Credentials Credentials `json:"-"`
	CreatedAt   time.Time   `json:"createdAt,omitempty"`
	UpdatedAt   time.Time   `json:"updatedAt,omitempty"`
	Account     Account
}

// NewUser creates a new user account.
func NewUser(email, role string, credentials Credentials, account Account) User {
	now := timeutil.Now()

	return User{
		ID:          id.New(),
		Email:       email,
		Role:        role,
		Credentials: credentials,
		CreatedAt:   now,
		UpdatedAt:   now,
		Account:     account,
	}
}

// JWTUser creates a jwt principal based on a user.
func (u User) JWTUser() jwt.User {
	return jwt.User{
		ID: u.ID,
		Roles: []string{
			u.Role,
		},
	}
}

func (u User) String() string {
	return fmt.Sprintf("User(id=%s, role=%s, createdAt=%v, updatedAt=%v)", u.ID, u.Role, u.CreatedAt, u.UpdatedAt)
}

// Account user account.
type Account struct {
	ID        string    `json:"id,omitempty"`
	Name      string    `json:"name,omitempty"`
	CreatedAt time.Time `json:"createdAt,omitempty"`
	UpdatedAt time.Time `json:"updatedAt,omitempty"`
}

// NewAccount creates a new account.
func NewAccount(name string) Account {
	now := timeutil.Now()

	return Account{
		ID:        id.New(),
		Name:      name,
		CreatedAt: now,
		UpdatedAt: now,
	}
}

func (a Account) String() string {
	return fmt.Sprintf("Account(id=%s, name=%s, createdAt=%v, updatedAt=%v)", a.ID, a.Name, a.CreatedAt, a.UpdatedAt)
}

// Credentials authentication session.
type Credentials struct {
	Password string
	Salt     string
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
