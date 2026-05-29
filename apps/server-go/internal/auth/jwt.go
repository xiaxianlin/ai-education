package auth

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"strings"
	"time"
)

const DefaultTokenTTL = 168 * time.Hour

var (
	ErrMissingTokenSecret    = errors.New("jwt secret is required")
	ErrInvalidTokenStructure = errors.New("invalid jwt structure")
	ErrTokenExpired          = errors.New("jwt is expired")
)

type JWTResolver[T any] struct {
	secret []byte
	ttl    time.Duration
	clock  Clock
}

func NewJWTResolver[T any](secret string, ttl time.Duration, clock Clock) *JWTResolver[T] {
	if ttl == 0 {
		ttl = DefaultTokenTTL
	}
	if clock == nil {
		clock = time.Now
	}
	return &JWTResolver[T]{
		secret: []byte(secret),
		ttl:    ttl,
		clock:  clock,
	}
}

func (r *JWTResolver[T]) Issue(claims T) (string, error) {
	if r == nil || len(r.secret) == 0 {
		return "", ErrMissingTokenSecret
	}

	payload, err := claimsToMap(claims)
	if err != nil {
		return "", err
	}
	payload["exp"] = r.clock().Add(r.ttl).Unix()

	header := map[string]string{
		"alg": "HS256",
		"typ": "JWT",
	}

	encodedHeader, err := encodeJSONSegment(header)
	if err != nil {
		return "", err
	}
	encodedPayload, err := encodeJSONSegment(payload)
	if err != nil {
		return "", err
	}

	signingInput := encodedHeader + "." + encodedPayload
	signature := signHS256(r.secret, signingInput)
	return signingInput + "." + base64.RawURLEncoding.EncodeToString(signature), nil
}

func (r *JWTResolver[T]) Resolve(token string) (T, error) {
	var zero T
	if r == nil || len(r.secret) == 0 {
		return zero, ErrMissingTokenSecret
	}

	parts := strings.Split(token, ".")
	if len(parts) != 3 || parts[0] == "" || parts[1] == "" || parts[2] == "" {
		return zero, ErrInvalidTokenStructure
	}

	var header struct {
		Algorithm string `json:"alg"`
	}
	if err := decodeJSONSegment(parts[0], &header); err != nil {
		return zero, fmt.Errorf("%w: %v", ErrInvalidTokenStructure, err)
	}
	if header.Algorithm != "HS256" {
		return zero, ErrInvalidTokenStructure
	}

	expectedSignature := signHS256(r.secret, parts[0]+"."+parts[1])
	actualSignature, err := base64.RawURLEncoding.DecodeString(parts[2])
	if err != nil || !hmac.Equal(actualSignature, expectedSignature) {
		return zero, ErrInvalidToken
	}

	var payload map[string]any
	if err := decodeJSONSegment(parts[1], &payload); err != nil {
		return zero, fmt.Errorf("%w: %v", ErrInvalidTokenStructure, err)
	}
	if err := validatePythonPayload(payload, r.clock()); err != nil {
		return zero, err
	}

	var claims T
	if err := decodeJSONSegment(parts[1], &claims); err != nil {
		return zero, fmt.Errorf("%w: %v", ErrInvalidTokenStructure, err)
	}
	return claims, nil
}

func claimsToMap(claims any) (map[string]any, error) {
	raw, err := json.Marshal(claims)
	if err != nil {
		return nil, fmt.Errorf("encode jwt claims: %w", err)
	}

	var payload map[string]any
	if err := json.Unmarshal(raw, &payload); err != nil {
		return nil, fmt.Errorf("decode jwt claims: %w", err)
	}
	return payload, nil
}

func encodeJSONSegment(value any) (string, error) {
	raw, err := json.Marshal(value)
	if err != nil {
		return "", fmt.Errorf("encode jwt segment: %w", err)
	}
	return base64.RawURLEncoding.EncodeToString(raw), nil
}

func decodeJSONSegment(segment string, value any) error {
	raw, err := base64.RawURLEncoding.DecodeString(segment)
	if err != nil {
		return err
	}
	return json.Unmarshal(raw, value)
}

func signHS256(secret []byte, signingInput string) []byte {
	mac := hmac.New(sha256.New, secret)
	_, _ = mac.Write([]byte(signingInput))
	return mac.Sum(nil)
}

func validatePythonPayload(payload map[string]any, now time.Time) error {
	id, ok := payload["id"].(string)
	if !ok || id == "" {
		return ErrInvalidTokenStructure
	}
	if _, ok := numericClaim(payload["update_time"]); !ok {
		return ErrInvalidTokenStructure
	}

	exp, ok := numericClaim(payload["exp"])
	if !ok {
		return ErrInvalidTokenStructure
	}
	if now.Unix() >= exp {
		return ErrTokenExpired
	}
	return nil
}

func numericClaim(value any) (int64, bool) {
	switch v := value.(type) {
	case float64:
		return int64(v), true
	case int64:
		return v, true
	case json.Number:
		n, err := v.Int64()
		return n, err == nil
	default:
		return 0, false
	}
}
