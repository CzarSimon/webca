package model_test

import (
	"testing"

	"github.com/CzarSimon/webca/api-server/internal/model"
	"github.com/stretchr/testify/assert"
)

func TestCertificateSubject_String(t *testing.T) {
	assert := assert.New(t)

	sub := model.CertificateSubject{
		CommonName:         "WebCA Test Root CA",
		Country:            "SE",
		Locality:           "Stockholm",
		Organization:       "WebCA AB",
		OrganizationalUnit: "Engineering",
		Email:              "engineering@webca.io",
	}

	assert.Equal("C=SE, ST=, L=Stockholm, O=WebCA AB, OU=Engineering, CN=WebCA Test Root CA", sub.String())
}	