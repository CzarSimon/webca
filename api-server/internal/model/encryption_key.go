package model

import (
	"encoding/base64"
	"fmt"
	"time"

	"github.com/CzarSimon/httputil/crypto"
	"github.com/CzarSimon/httputil/id"
	"github.com/CzarSimon/webca/api-server/internal/timeutil"
)

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

	if len(plaintext) != k.Length {
		return nil, fmt.Errorf("failed to unwrap key, unexpected length %d, expected %d", len(plaintext), k.Length)
	}

	return plaintext, nil
}

// NewEncryptionKey generate a random wrapped encryption key.
func NewEncryptionKey(key []byte, length int) (EncryptionKey, error) {
	plaintext, err := crypto.RandomBytes(length)
	if err != nil {
		return EncryptionKey{}, nil
	}

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
