package rsautil

import (
	"testing"

	"github.com/CzarSimon/webca/api-server/internal/model"
	"github.com/stretchr/testify/assert"
)

func TestGenerateKeys(t *testing.T) {
	assert := assert.New(t)

	pair, err := GenerateKeys(model.KeyRequest{
		Algorithm: model.RSAAlgorithm,
		Options: map[string]interface{}{
			"keySize": 1024,
		},
	})
	assert.NoError(err)
	assert.Equal(1024, pair.keySize)
	assert.NotNil(pair.publicKey)
	assert.NotNil(pair.privateKey)
}

func TestGenerateKeys_BadOptions(t *testing.T) {
	assert := assert.New(t)

	// Options cannot be nil
	_, err := GenerateKeys(model.KeyRequest{
		Algorithm: model.RSAAlgorithm,
	})
	assert.Error(err)

	// Options must contain keySize.
	_, err = GenerateKeys(model.KeyRequest{
		Algorithm: model.RSAAlgorithm,
		Options:   map[string]interface{}{},
	})
	assert.Error(err)

	// Options.keySize must be an integer.
	_, err = GenerateKeys(model.KeyRequest{
		Algorithm: model.RSAAlgorithm,
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
