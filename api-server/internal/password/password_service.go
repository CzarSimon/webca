package password

import (
	"context"
	"encoding/base64"
	"fmt"

	"github.com/CzarSimon/httputil"
	"github.com/CzarSimon/httputil/crypto"
	"github.com/CzarSimon/webca/api-server/internal/model"
	"github.com/opentracing/opentracing-go"
)

// Service hashes and verifies passwords.
type Service struct {
	hasher crypto.Hasher
	cipher crypto.Cipher
	policy Policy
}

// NewService creates a new Service with an enclosed encryption key.
func NewService(key string, policy Policy) (*Service, error) {
	keyHasher := crypto.Sha256Hasher{}
	encryptionKey, err := keyHasher.Hash([]byte(key), []byte(""))
	if err != nil {
		return nil, fmt.Errorf("failed to hash password encryption key: %w", err)
	}

	return &Service{
		hasher: crypto.DefaultScryptHasher(),
		cipher: crypto.NewAESCipher(encryptionKey),
		policy: policy,
	}, nil
}

// Hash genrates a salt and a hashed and encrypted password.
func (s *Service) Hash(ctx context.Context, password string) (model.Credentials, error) {
	span, ctx := opentracing.StartSpanFromContext(ctx, "password_service_hash")
	defer span.Finish()

	err := s.Allowed(password)
	if err != nil {
		return model.Credentials{}, httputil.BadRequestError(err)
	}

	salt, err := s.GenerateSalt()
	if err != nil {
		return model.Credentials{}, fmt.Errorf("salt generation failed: %w", err)
	}

	hash, err := s.hasher.Hash([]byte(password), salt)
	if err != nil {
		return model.Credentials{}, fmt.Errorf("failed to hash password and salt: %w", err)
	}

	ciphertext, err := s.cipher.Encrypt(hash)
	if err != nil {
		return model.Credentials{}, fmt.Errorf("failed to encrypt password hash: %w", err)
	}

	return model.Credentials{
		Password: encode(ciphertext),
		Salt:     encode(salt),
	}, nil
}

// Allowed used the underlying policy to assert that a password is allowed.
func (s *Service) Allowed(candidate string) error {
	return s.policy.Allowed(candidate)
}

// GenerateSalt generates a random salt whose length is based on the underlying policy.
func (s *Service) GenerateSalt() ([]byte, error) {
	return crypto.RandomBytes(s.policy.SaltLength)
}

func encode(b []byte) string {
	return base64.StdEncoding.EncodeToString(b)
}
