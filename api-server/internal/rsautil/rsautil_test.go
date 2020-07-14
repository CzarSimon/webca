package rsautil

import (
	"crypto/x509"
	"strings"
	"testing"

	"github.com/CzarSimon/httputil/id"
	"github.com/CzarSimon/webca/api-server/internal/model"
	"github.com/CzarSimon/webca/api-server/internal/timeutil"
	"github.com/stretchr/testify/assert"
)

func TestGenerateKeys(t *testing.T) {
	assert := assert.New(t)

	rsaKey, err := GenerateKeys(model.KeyRequest{
		Algorithm: Algorithm,
		Options: map[string]interface{}{
			"keySize": 1024,
		},
	})
	assert.NoError(err)
	assert.Equal(1024, rsaKey.keySize)
	assert.Equal("RSA", rsaKey.algorithm)
	assert.NotNil(rsaKey.publicKey)
	assert.NotNil(rsaKey.privateKey)

	pair := rsaKey.Encode()

	assert.True(strings.HasPrefix(pair.PublicKey, "-----BEGIN PUBLIC KEY-----"))
	assert.True(strings.HasSuffix(pair.PublicKey, "-----END PUBLIC KEY-----\n"))

	assert.True(strings.HasPrefix(pair.PrivateKey, "-----BEGIN RSA PRIVATE KEY-----"))
	assert.True(strings.HasSuffix(pair.PrivateKey, "-----END RSA PRIVATE KEY-----\n"))

	assert.Len(pair.ID, 36)
	assert.Equal("PEM", pair.Format)
	assert.Equal(Algorithm, pair.Algorithm)
	assert.NotEmpty(pair.CreatedAt)

	assert.Empty(pair.AccountID)
	assert.Empty(pair.Credentials)

	rsaKey, err = GenerateKeys(model.KeyRequest{
		Algorithm: Algorithm,
		Options: map[string]interface{}{
			"keySize": "512",
		},
	})
	assert.NoError(err)
	assert.Equal(512, rsaKey.keySize)
	assert.Equal("RSA", rsaKey.algorithm)
	assert.NotNil(rsaKey.publicKey)
	assert.NotNil(rsaKey.privateKey)

	rsaKey, err = GenerateKeys(model.KeyRequest{
		Algorithm: Algorithm,
		Options: map[string]interface{}{
			"keySize": float64(512),
		},
	})
	assert.NoError(err)
	assert.Equal(512, rsaKey.keySize)
	assert.Equal("RSA", rsaKey.algorithm)
	assert.NotNil(rsaKey.publicKey)
	assert.NotNil(rsaKey.privateKey)
}

func TestGenerateKeys_BadOptions(t *testing.T) {
	assert := assert.New(t)

	// Options cannot be nil
	_, err := GenerateKeys(model.KeyRequest{
		Algorithm: Algorithm,
	})
	assert.Error(err)

	// Options must contain keySize.
	_, err = GenerateKeys(model.KeyRequest{
		Algorithm: Algorithm,
		Options:   map[string]interface{}{},
	})
	assert.Error(err)

	// Options.keySize must be an integer.
	_, err = GenerateKeys(model.KeyRequest{
		Algorithm: Algorithm,
		Options: map[string]interface{}{
			"keySize": "not an integer",
		},
	})
	assert.Error(err)
}

func TestGenerateKeys_Unsupported(t *testing.T) {
	assert := assert.New(t)

	algos := []string{
		"ECDSA",
		"UNSUPPORTED",
	}

	for _, alg := range algos {
		_, err := GenerateKeys(model.KeyRequest{
			Algorithm: alg,
		})
		assert.Error(err)
	}
}

func TestDecode(t *testing.T) {
	assert := assert.New(t)

	rsaKey, err := GenerateKeys(model.KeyRequest{
		Algorithm: Algorithm,
		Options: map[string]interface{}{
			"keySize": 512,
		},
	})
	assert.NoError(err)
	original := rsaKey.Encode()

	decoded, err := Decode(original)
	assert.NoError(err)

	copy := decoded.Encode()
	assert.Equal(original.PublicKey, copy.PublicKey)
	assert.Equal(original.PrivateKey, copy.PrivateKey)
}

func TestDecode_WrongTypes(t *testing.T) {
	assert := assert.New(t)

	rsaKey, err := GenerateKeys(model.KeyRequest{
		Algorithm: Algorithm,
		Options: map[string]interface{}{
			"keySize": 512,
		},
	})
	assert.NoError(err)

	wrongPubKey := model.KeyPair{
		ID:         id.New(),
		PublicKey:  encodePem("WRONG TYPE", x509.MarshalPKCS1PublicKey(rsaKey.publicKey)),
		PrivateKey: encodePem(privateKeyType, x509.MarshalPKCS1PrivateKey(rsaKey.privateKey)),
		Format:     "PEM",
		Algorithm:  rsaKey.algorithm,
		CreatedAt:  timeutil.Now(),
	}

	_, err = Decode(wrongPubKey)
	assert.Error(err)

	wrongPrivKey := model.KeyPair{
		ID:         id.New(),
		PublicKey:  encodePem(publicKeyType, x509.MarshalPKCS1PublicKey(rsaKey.publicKey)),
		PrivateKey: encodePem("WRONG TYPE", x509.MarshalPKCS1PrivateKey(rsaKey.privateKey)),
		Format:     "PEM",
		Algorithm:  rsaKey.algorithm,
		CreatedAt:  timeutil.Now(),
	}

	_, err = Decode(wrongPrivKey)
	assert.Error(err)
}
