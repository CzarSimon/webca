package model

import (
	"encoding/base64"
	"fmt"
	"time"

	"github.com/CzarSimon/httputil/crypto"
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

// EncryptionKey key used in an symetric cipher.
type EncryptionKey struct {
	ID        string
	Key       string
	Length    int
	CreatedAt time.Time
}

func (k EncryptionKey) String() string {
	return fmt.Sprintf("EncryptionKey(id=%s, len=%d, createdAt=%v)", k.ID, k.Length, k.CreatedAt)
}

// Unwrap decodes and decrypts the encryption key.
func (k EncryptionKey) Unwrap(key []byte) ([]byte, error) {
	ciphertext, err := base64.StdEncoding.DecodeString(k.Key)
	if err != nil {
		return nil, fmt.Errorf("failed to decode key: %w", err)
	}

	plaintext, err := crypto.NewCipher(key).Decrypt(ciphertext)
	if err != nil {
		return nil, fmt.Errorf("failed to decrypt key: %w", err)
	}

	return plaintext, nil
}

// NewEncryptionKey generate a random wrapped encryption key.
func NewEncryptionKey(key []byte, length int) (EncryptionKey, error) {
	plaintext := make([]byte, length)

	ciphertext, err := crypto.NewCipher(key).Encrypt(plaintext)
	if err != nil {
		return EncryptionKey{}, fmt.Errorf("failed to encrypt key: %w", err)
	}

	return EncryptionKey{
		ID:        id.New(),
		Key:       base64.StdEncoding.EncodeToString(ciphertext),
		Length:    length,
		CreatedAt: timeutil.Now(),
	}, nil
}

// AuditEvent sensitive activity performed in the system.
type AuditEvent struct {
	ID        string    `json:"id,omitempty"`
	UserID    string    `json:"userId,omitempty"`
	Activity  string    `json:"activity,omitempty"`
	Resource  string    `json:"resource,omitempty"`
	CreatedAt time.Time `json:"createdAt,omitempty"`
}

func (e AuditEvent) String() string {
	return fmt.Sprintf("AuditEvent(id=%s, userId=%s, activity=%s, resource=%s, createdAt=%v)", e.ID, e.UserID, e.Activity, e.Resource, e.CreatedAt)
}
