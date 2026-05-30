package auth

import (
	"context"
	"crypto/rand"
	"errors"
	"fmt"
	"strings"
	"time"
)

const (
	superManagerType = 0
	accountEnabled   = 1
)

type SuperManagerStore interface {
	ManagerExists(ctx context.Context, username string) (bool, error)
	CreateSuperManager(ctx context.Context, id string, username string, passwordHash string, managerType int, status int, timestamp int64) error
}

type SuperManagerBootstrapConfig struct {
	Username    string
	Password    string
	Clock       Clock
	IDGenerator func() (string, error)
}

func EnsureSuperManager(ctx context.Context, store SuperManagerStore, hasher PasswordHasher, cfg SuperManagerBootstrapConfig) (bool, error) {
	username := strings.TrimSpace(cfg.Username)
	if username == "" || cfg.Password == "" {
		return false, nil
	}
	if store == nil {
		return false, errors.New("super manager store is nil")
	}
	if hasher == nil {
		return false, errors.New("password hasher is nil")
	}

	exists, err := store.ManagerExists(ctx, username)
	if err != nil {
		return false, fmt.Errorf("check super manager: %w", err)
	}
	if exists {
		return false, nil
	}

	passwordHash, err := hasher.Hash(cfg.Password)
	if err != nil {
		return false, fmt.Errorf("hash super manager password: %w", err)
	}

	generateID := cfg.IDGenerator
	if generateID == nil {
		generateID = newUUIDString
	}
	id, err := generateID()
	if err != nil {
		return false, fmt.Errorf("generate super manager id: %w", err)
	}

	now := time.Now
	if cfg.Clock != nil {
		now = cfg.Clock
	}
	timestamp := now().Unix()

	if err := store.CreateSuperManager(ctx, id, username, passwordHash, superManagerType, accountEnabled, timestamp); err != nil {
		return false, fmt.Errorf("create super manager: %w", err)
	}
	return true, nil
}

func newUUIDString() (string, error) {
	var b [16]byte
	if _, err := rand.Read(b[:]); err != nil {
		return "", err
	}
	b[6] = (b[6] & 0x0f) | 0x40
	b[8] = (b[8] & 0x3f) | 0x80
	return fmt.Sprintf("%08x-%04x-%04x-%04x-%012x", b[0:4], b[4:6], b[6:8], b[8:10], b[10:16]), nil
}
