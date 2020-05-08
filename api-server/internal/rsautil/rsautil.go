package rsautil

import (
	"crypto/rand"
	"crypto/rsa"
	"crypto/x509"
	"encoding/pem"
	"fmt"

	"github.com/CzarSimon/httputil/id"
	"github.com/CzarSimon/webca/api-server/internal/model"
	"github.com/CzarSimon/webca/api-server/internal/timeutil"
)

// Algorithm name of the RSA algorithm.
const Algorithm = "RSA"

// options options for generation of an RSA key.
type options struct {
	keySize   int
	algorithm string
}

// KeyPair asymmetric key pair of a RSA public and private keys.
type KeyPair struct {
	publicKey  *rsa.PublicKey
	privateKey *rsa.PrivateKey
	options
}

// Encode encodes and RSA keypair into a serialized KeyPair.
func (p KeyPair) Encode() (model.KeyPair, error) {
	return model.KeyPair{
		ID:         id.New(),
		PublicKey:  encodePem("PUBLIC KEY", x509.MarshalPKCS1PublicKey(p.publicKey)),
		PrivateKey: encodePem("RSA PRIVATE KEY", x509.MarshalPKCS1PrivateKey(p.privateKey)),
		Format:     "PEM",
		Algorithm:  p.algorithm,
		CreatedAt:  timeutil.Now(),
	}, nil
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
	if req.Algorithm != Algorithm {
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
		keySize:   keySize,
		algorithm: req.Algorithm,
	}, nil
}

func encodePem(blockType string, b []byte) string {
	block := &pem.Block{
		Type:  blockType,
		Bytes: b,
	}

	return string(pem.EncodeToMemory(block))
}
