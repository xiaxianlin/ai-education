package auth

import (
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"strings"
)

var ErrBcryptDependencyMissing = errors.New("bcrypt password hashing requires golang.org/x/crypto/bcrypt")

type PythonPasswordHasher struct{}

func NewPythonPasswordHasher() PythonPasswordHasher {
	return PythonPasswordHasher{}
}

func (PythonPasswordHasher) Hash(string) (string, error) {
	// TODO(auth): enable bcrypt generation after approving golang.org/x/crypto/bcrypt.
	return "", ErrBcryptDependencyMissing
}

func (PythonPasswordHasher) Compare(plain string, hashed string) bool {
	if hashed == "" {
		return false
	}

	if strings.HasPrefix(hashed, "$2a$") ||
		strings.HasPrefix(hashed, "$2b$") ||
		strings.HasPrefix(hashed, "$2y$") {
		// TODO(auth): verify Python bcrypt hashes with golang.org/x/crypto/bcrypt.
		return false
	}

	return compareLegacySHA256(plain, hashed)
}

func compareLegacySHA256(plain string, hashed string) bool {
	sum := sha256.Sum256([]byte(plain))
	return hex.EncodeToString(sum[:]) == hashed
}
