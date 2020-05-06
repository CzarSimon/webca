package password_test

import (
	"encoding/hex"
	"testing"

	"github.com/CzarSimon/httputil/crypto"
	"github.com/CzarSimon/webca/api-server/internal/password"
	"github.com/stretchr/testify/assert"
)

func TestPolicyAllowed(t *testing.T) {
	assert := assert.New(t)

	policy := password.Policy{SaltLength: 32, MinLength: 5}

	// Too short
	assert.Error(policy.Allowed(""))
	assert.Error(policy.Allowed("abcd"))

	// Ok
	assert.NoError(policy.Allowed("abcde"))
	assert.NoError(policy.Allowed("abcdef"))

	b, err := crypto.RandomBytes(500)
	assert.NoError(err)
	veryLongPassword := hex.EncodeToString(b)
	assert.NoError(policy.Allowed(veryLongPassword))
}
