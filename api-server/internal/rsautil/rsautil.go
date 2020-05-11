package rsautil

import (
	"crypto/rand"
	"crypto/rsa"
	"crypto/x509"
	"encoding/pem"
	"fmt"
	"strconv"

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

func (o options) String() string {
	return fmt.Sprintf("options(algorithm=%s, keySize=%d)", o.algorithm, o.keySize)
}

// KeyPair asymmetric key pair of a RSA public and private keys.
type KeyPair struct {
	publicKey  *rsa.PublicKey
	privateKey *rsa.PrivateKey
	options
}

// Encode encodes and RSA keypair into a serialized KeyPair.
func (p KeyPair) Encode() model.KeyPair {
	return model.KeyPair{
		ID:         id.New(),
		PublicKey:  encodePem("PUBLIC KEY", x509.MarshalPKCS1PublicKey(p.publicKey)),
		PrivateKey: encodePem("RSA PRIVATE KEY", x509.MarshalPKCS1PrivateKey(p.privateKey)),
		Format:     "PEM",
		Algorithm:  p.algorithm,
		CreatedAt:  timeutil.Now(),
	}
}

// CreateCertificate creates certificate based on a RSA key pair.
func (p KeyPair) CreateCertificate(template x509.Certificate) (string, error) {
	return "-", nil
}

// GenerateKeys parses key options and generates an RSA KeyPair.
func GenerateKeys(req model.KeyRequest) (KeyPair, error) {
	opts, err := parseOptions(req)
	if err != nil {
		return KeyPair{}, err
	}

	key, err := rsa.GenerateKey(rand.Reader, opts.keySize)
	if err != nil {
		return KeyPair{}, fmt.Errorf("rsautil: failed to generate RSA key options=%s: %w", opts, err)
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

	var keySize int
	var err error
	switch typedVal := val.(type) {
	case int:
		keySize = typedVal
	case float64:
		keySize = int(typedVal)
	case string:
		keySize, err = strconv.Atoi(typedVal)
		if err != nil {
			return options{}, fmt.Errorf("rsautil: KeyRequest.Options.keySize must convertible to an int got %s. error: %w ", typedVal, err)
		}
	default:
		return options{}, fmt.Errorf("rsautil: KeyRequest.Options.keySize must convertible to an int got value=%v type=%T", val, val)
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
