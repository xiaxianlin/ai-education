package auth

import (
	"crypto/sha256"
	"encoding/hex"
	"strings"

	"golang.org/x/crypto/bcrypt"
)

type PythonPasswordHasher struct{}

func NewPythonPasswordHasher() PythonPasswordHasher {
	return PythonPasswordHasher{}
}

func (PythonPasswordHasher) Hash(plain string) (string, error) {
	hashed, err := bcrypt.GenerateFromPassword([]byte(plain), 12)
	if err != nil {
		return "", err
	}
	return string(hashed), nil
}

func (PythonPasswordHasher) Compare(plain string, hashed string) bool {
	if hashed == "" {
		return false
	}

	if strings.HasPrefix(hashed, "$2a$") ||
		strings.HasPrefix(hashed, "$2b$") ||
		strings.HasPrefix(hashed, "$2y$") {
		return bcrypt.CompareHashAndPassword([]byte(hashed), []byte(plain)) == nil
	}

	return compareLegacySHA256(plain, hashed)
}

func compareLegacySHA256(plain string, hashed string) bool {
	sum := sha256.Sum256([]byte(plain))
	return hex.EncodeToString(sum[:]) == hashed
}
