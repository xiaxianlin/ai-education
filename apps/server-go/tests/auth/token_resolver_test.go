package auth_test

import (
	"errors"
	"testing"
	"time"

	"ai-education/server-go/internal/auth"
)

func TestJWTResolverMissingSecret(t *testing.T) {
	t.Parallel()

	resolver := auth.NewJWTResolver[auth.ManagerTokenClaims]("", auth.DefaultTokenTTL, fixedClock())

	if _, err := resolver.Issue(auth.ManagerTokenClaims{ID: "manager-1", UpdateTime: 100}); !errors.Is(err, auth.ErrMissingTokenSecret) {
		t.Fatalf("Issue err = %v, want ErrMissingTokenSecret", err)
	}

	if _, err := resolver.Resolve("token"); !errors.Is(err, auth.ErrMissingTokenSecret) {
		t.Fatalf("Resolve err = %v, want ErrMissingTokenSecret", err)
	}
}

func TestJWTResolverValidPythonPayload(t *testing.T) {
	t.Parallel()

	resolver := auth.NewJWTResolver[auth.ManagerTokenClaims]("secret", auth.DefaultTokenTTL, fixedClock())

	token, err := resolver.Issue(auth.ManagerTokenClaims{ID: "manager-1", UpdateTime: 1234567890})
	if err != nil {
		t.Fatalf("Issue returned error: %v", err)
	}

	claims, err := resolver.Resolve(token)
	if err != nil {
		t.Fatalf("Resolve returned error: %v", err)
	}
	if claims.ID != "manager-1" || claims.UpdateTime != 1234567890 {
		t.Fatalf("claims = %#v, want manager id and update_time", claims)
	}
}

func TestJWTResolverExpired(t *testing.T) {
	t.Parallel()

	resolver := auth.NewJWTResolver[auth.StudentTokenClaims]("secret", -time.Hour, fixedClock())

	token, err := resolver.Issue(auth.StudentTokenClaims{ID: "student-1", UpdateTime: 1234567890})
	if err != nil {
		t.Fatalf("Issue returned error: %v", err)
	}

	if _, err := resolver.Resolve(token); !errors.Is(err, auth.ErrTokenExpired) {
		t.Fatalf("Resolve err = %v, want ErrTokenExpired", err)
	}
}

func TestJWTResolverInvalidPayloadStructure(t *testing.T) {
	t.Parallel()

	type malformedClaims struct {
		Foo string `json:"foo"`
	}

	resolver := auth.NewJWTResolver[malformedClaims]("secret", auth.DefaultTokenTTL, fixedClock())
	token, err := resolver.Issue(malformedClaims{Foo: "bar"})
	if err != nil {
		t.Fatalf("Issue returned error: %v", err)
	}

	if _, err := resolver.Resolve(token); !errors.Is(err, auth.ErrInvalidTokenStructure) {
		t.Fatalf("Resolve err = %v, want ErrInvalidTokenStructure", err)
	}
}

func fixedClock() auth.Clock {
	return func() time.Time {
		return time.Unix(1700000000, 0)
	}
}
