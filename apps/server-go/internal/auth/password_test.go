package auth

import "testing"

func TestPythonPasswordHasherVerifiesBcrypt(t *testing.T) {
	hasher := NewPythonPasswordHasher()
	hashed, err := hasher.Hash("secret")
	if err != nil {
		t.Fatal(err)
	}
	if !hasher.Compare("secret", hashed) {
		t.Fatal("expected bcrypt password to verify")
	}
	if hasher.Compare("wrong", hashed) {
		t.Fatal("expected wrong bcrypt password to fail")
	}
}

func TestPythonPasswordHasherVerifiesLegacySHA256(t *testing.T) {
	hasher := NewPythonPasswordHasher()
	if !hasher.Compare("secret", "2bb80d537b1da3e38bd30361aa855686bde0eacd7162fef6a25fe97bf527a25b") {
		t.Fatal("expected legacy SHA256 password to verify")
	}
}
