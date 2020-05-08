package rsautil

import (
	"crypto/rand"
	"crypto/rsa"
	"fmt"

	"github.com/CzarSimon/webca/api-server/internal/model"
)

// options options for generation of an RSA key.
type options struct {
	keySize int
}

// KeyPair asymmetric key pair of a RSA public and private keys.
type KeyPair struct {
	publicKey  *rsa.PublicKey
	privateKey *rsa.PrivateKey
	options
}

// GenerateKeys parses key options and generates an RSA KeyPair.
func GenerateKeys(req model.KeyRequest) (KeyPair, error) {
	opts, err := parseOptions(req)
	if err != nil {
		return KeyPair{}, err
	}

	key, err := rsa.GenerateKey(rand.Reader, opts.keySize)
	if err != nil {
		return KeyPair{}, err
	}

	return KeyPair{
		publicKey:  &key.PublicKey,
		privateKey: key,
		options:    opts,
	}, nil
}

func parseOptions(req model.KeyRequest) (options, error) {
	if req.Algorithm != model.RSAAlgorithm {
		return options{}, fmt.Errorf("rsautil: unsupported KeyRequest.Algorithm=%s", req.Algorithm)
	}

	if req.Options == nil {
		return options{}, fmt.Errorf("rsautil: KeyRequest.Options cannot be nil")
	}

	val, ok := req.Options["keySize"]
	if !ok {
		return options{}, fmt.Errorf("rsautil: KeyRequest.Options must contain keySize")
	}

	keySize, ok := val.(int)
	if !ok {
		return options{}, fmt.Errorf("rsautil: KeyRequest.Options.keySize must be an int got: %v", val)
	}

	return options{
		keySize: keySize,
	}, nil
}
