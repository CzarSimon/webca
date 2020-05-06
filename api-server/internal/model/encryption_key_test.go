package model_test

import (
	"encoding/base64"
	"testing"

	"github.com/CzarSimon/httputil/crypto"
	"github.com/CzarSimon/webca/api-server/internal/model"
	"github.com/stretchr/testify/assert"
)

func TestNewEncryptionKey(t *testing.T) {
	assert := assert.New(t)

	secret := []byte("super-secret-key")
	key, err := model.NewEncryptionKey(secret, 32)

	assert.NoError(err)
	assert.Equal(32, key.Length)

	keyMaterial, err := key.Unwrap(secret)
	assert.NoError(err)
	assert.Len(keyMaterial, 32)
}

func TestEncryptionKey_Unwrap(t *testing.T) {
	assert := assert.New(t)

	secret := []byte("super-secret-key")
	plaintext := []byte("plaintext-key")
	ciphertext, err := crypto.NewCipher(secret).Encrypt(plaintext)

	assert.NoError(err)

	key := model.EncryptionKey{
		Key:    base64.StdEncoding.EncodeToString(ciphertext),
		Length: len(plaintext),
	}

	keyMaterial, err := key.Unwrap(secret)
	assert.NoError(err)
	assert.Equal(string(plaintext), string(keyMaterial))

	key.Length = key.Length + 2
	keyMaterial, err = key.Unwrap(secret)
	assert.Error(err)
	assert.Nil(keyMaterial)

	key.Length = key.Length - 4
	keyMaterial, err = key.Unwrap(secret)
	assert.Error(err)
	assert.Nil(keyMaterial)
}
