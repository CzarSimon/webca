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
	RootCAType          = "ROOT_CA"
	IntermediateCAType  = "INTERMEDIATE_CA"
	UserCertificateType = "CERTIFICATE"
)

// User roles
const (
	AdminRole = "ADMIN"
	UserRole  = "USER"
)

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
	Account     Account     `json:"account,omitempty"`
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
	return fmt.Sprintf("User(id=%s, role=%s, createdAt=%v, updatedAt=%v, account=%s)", u.ID, u.Role, u.CreatedAt, u.UpdatedAt, u.Account)
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

// Signatory reference to and credentials for certificate signer.
type Signatory struct {
	ID       string
	Password string
}

func (s Signatory) String() string {
	return fmt.Sprintf("Signatory(id=%s)", s.ID)
}

// CertificateRequest certificate creation request body.
type CertificateRequest struct {
	Name          string                 `json:"name,omitempty"`
	Subject       CertificateSubject     `json:"subject,omitempty"`
	Type          string                 `json:"type,omitempty"`
	Algorithm     string                 `json:"algorithm,omitempty"`
	Signatory     Signatory              `json:"signatory,omitempty"`
	Password      string                 `json:"password,omitempty"`
	Options       map[string]interface{} `json:"options,omitempty"`
	ExpiresInDays int                    `json:"expiresInDays,omitempty"`
	UserID        string                 `json:"-"`
}

// KeyRequest extracts key request from a certificate request.
func (c CertificateRequest) KeyRequest() KeyRequest {
	opts := c.Options
	if opts == nil {
		opts = make(map[string]interface{})
	}

	return KeyRequest{
		Algorithm: c.Algorithm,
		Options:   opts,
	}
}

// Validate validates the contents of a CertificateRequest
func (c CertificateRequest) Validate() error {
	if c.Type != RootCAType && c.Type != IntermediateCAType && c.Type != UserCertificateType {
		return fmt.Errorf("invalid certificate type: %s", c.Type)
	}

	if c.Type != RootCAType && (c.Signatory.ID == "" || c.Signatory.Password == "") {
		return fmt.Errorf("certificate type %s requires a valid signatory", c.Type)
	}

	return nil
}

// KeyEncoder interface to encode a serialized keypair and provide generic access to the public and private keys.
type KeyEncoder interface {
	Encode() KeyPair
	PublicKey() interface{}
	PrivateKey() interface{}
}

// KeyRequest instructions for generation of a key pair.
type KeyRequest struct {
	Algorithm string                 `json:"algorithm,omitempty"`
	Options   map[string]interface{} `json:"options,omitempty"`
}

// CertificateSubject identiy to which a certificate is issued.
type CertificateSubject struct {
	CommonName         string `json:"commonName,omitempty"`
	Country            string `json:"country,omitempty"`
	State              string `json:"state,omitempty"`
	Locality           string `json:"locality,omitempty"`
	Organization       string `json:"organization,omitempty"`
	OrganizationalUnit string `json:"organizationalUnit,omitempty"`
	Email              string `json:"email,omitempty"`
}

func (s CertificateSubject) String() string {
	return fmt.Sprintf("C=%s, ST=%s, L=%s, O=%s, OU=%s, CN=%s", s.Country, s.State, s.Locality, s.Organization, s.OrganizationalUnit, s.CommonName)
}

// Certificate tls certificate and metadata.
type Certificate struct {
	ID           string             `json:"id,omitempty"`
	Name         string             `json:"name,omitempty"`
	SerialNumber int64              `json:"serialNumber,omitempty"`
	Subject      CertificateSubject `json:"subject,omitempty"`
	Body         string             `json:"body,omitempty"`
	KeyPair      KeyPair            `json:"-"`
	Format       string             `json:"format,omitempty"`
	Type         string             `json:"type,omitempty"`
	SignatoryID  string             `json:"signatoryId,omitempty"`
	AccountID    string             `json:"accountId,omitempty"`
	CreatedAt    time.Time          `json:"createdAt,omitempty"`
	ExpiresAt    time.Time          `json:"expiresAt,omitempty"`
}

func (c Certificate) String() string {
	return fmt.Sprintf(
		"Certificate(id=%s, name=%s, serialNumber=%d, subject=[%s], format=%s, type=%s, signatoryId=%s, accountId=%s, createdAt=%v, expiresAt=%v)",
		c.ID, c.Name, c.SerialNumber, c.Subject, c.Format, c.Type, c.SignatoryID, c.AccountID, c.CreatedAt, c.ExpiresAt,
	)
}

// CertificateType description of a certificate type and its status.
type CertificateType struct {
	Name      string    `json:"name,omitempty"`
	Active    bool      `json:"active,omitempty"`
	CreatedAt time.Time `json:"createdAt,omitempty"`
	UpdatedAt time.Time `json:"updatedAt,omitempty"`
}

func (t CertificateType) String() string {
	return fmt.Sprintf("CertificateType(name=%s, active=%t, createdAt=%v, updatedAt=%v)", t.Name, t.Active, t.CreatedAt, t.UpdatedAt)
}

// CertificateOptions options for creation of certificates.
type CertificateOptions struct {
	Types      []CertificateType `json:"types,omitempty"`
	Algorithms []string          `json:"algorithms,omitempty"`
	Formats    []string          `json:"formats,omitempty"`
}

// KeyPair asymmetric key pair of a public and private key, the private key is encrypted.
type KeyPair struct {
	ID             string      `json:"id,omitempty"`
	PublicKey      string      `json:"publicKey,omitempty"`
	PrivateKey     string      `json:"privateKey,omitempty"`
	Format         string      `json:"format,omitempty"`
	Algorithm      string      `json:"algorithm,omitempty"`
	EncryptionSalt string      `json:"-"`
	Credentials    Credentials `json:"-"`
	AccountID      string      `json:"accountId,omitempty"`
	CreatedAt      time.Time   `json:"createdAt,omitempty"`
}

func (k KeyPair) String() string {
	return fmt.Sprintf("KeyPair(id=%s, format=%s, algorithm=%s, accountId=%s, createdAt=%v)", k.ID, k.Format, k.Algorithm, k.AccountID, k.CreatedAt)
}

// CertificatePage paginated list of certificates.
type CertificatePage struct {
	CurrentPage    int           `json:"currentPage,omitempty"`
	TotalPages     int           `json:"totalPages,omitempty"`
	TotalResults   int           `json:"totalResults,omitempty"`
	ResultsPerPage int           `json:"resultsPerPage,omitempty"`
	Results        []Certificate `json:"results,omitempty"`
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

// Attachment file attachment.
type Attachment struct {
	Body        string `json:"body,omitempty"`
	ContentType string `json:"contentType,omitempty"`
	Filename    string `json:"filename,omitempty"`
}

// ContentDisposition creates the value for the Content-Disposition header.
func (a Attachment) ContentDisposition() string {
	return fmt.Sprintf("attachment; filename=%s;", a.Filename)
}

func (a Attachment) String() string {
	return fmt.Sprintf("Attachment(filename=%s, contentType=%s)", a.Filename, a.ContentType)
}
