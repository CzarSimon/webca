package password

import (
	"fmt"
)

// Policy represents rules to validate that a password is valid and constructed properly.
type Policy struct {
	SaltLength int
	MinLength  int
}

// Allowed asserts that a password is allowed under the policy and returns an error if not.
func (p Policy) Allowed(candidate string) error {
	if len(candidate) < p.MinLength {
		return fmt.Errorf("password is to short, must be at least %d characters", p.MinLength)
	}

	return nil
}
