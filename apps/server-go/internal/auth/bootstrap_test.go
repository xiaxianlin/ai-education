package auth

import (
	"context"
	"errors"
	"testing"
	"time"
)

type fakeSuperManagerStore struct {
	exists bool
	err    error

	created      bool
	id           string
	username     string
	passwordHash string
	managerType  int
	status       int
	timestamp    int64
}

func (s *fakeSuperManagerStore) ManagerExists(context.Context, string) (bool, error) {
	return s.exists, s.err
}

func (s *fakeSuperManagerStore) CreateSuperManager(_ context.Context, id string, username string, passwordHash string, managerType int, status int, timestamp int64) error {
	s.created = true
	s.id = id
	s.username = username
	s.passwordHash = passwordHash
	s.managerType = managerType
	s.status = status
	s.timestamp = timestamp
	return nil
}

func TestEnsureSuperManagerCreatesEnabledSuperManager(t *testing.T) {
	t.Parallel()

	store := &fakeSuperManagerStore{}
	created, err := EnsureSuperManager(context.Background(), store, fakeHasher{}, SuperManagerBootstrapConfig{
		Username: " admin ",
		Password: "Secret123!",
		Clock: func() time.Time {
			return time.Unix(123, 0)
		},
		IDGenerator: func() (string, error) {
			return "manager-1", nil
		},
	})
	if err != nil {
		t.Fatalf("EnsureSuperManager returned error: %v", err)
	}
	if !created || !store.created {
		t.Fatal("expected super manager to be created")
	}
	if store.id != "manager-1" || store.username != "admin" || store.passwordHash != "hash:Secret123!" {
		t.Fatalf("unexpected created manager: %#v", store)
	}
	if store.managerType != superManagerType || store.status != accountEnabled || store.timestamp != 123 {
		t.Fatalf("unexpected manager metadata: %#v", store)
	}
}

func TestEnsureSuperManagerSkipsExistingManager(t *testing.T) {
	t.Parallel()

	store := &fakeSuperManagerStore{exists: true}
	created, err := EnsureSuperManager(context.Background(), store, fakeHasher{}, SuperManagerBootstrapConfig{
		Username: "admin",
		Password: "Secret123!",
	})
	if err != nil {
		t.Fatalf("EnsureSuperManager returned error: %v", err)
	}
	if created || store.created {
		t.Fatal("expected existing super manager to be skipped")
	}
}

func TestEnsureSuperManagerSkipsMissingConfig(t *testing.T) {
	t.Parallel()

	store := &fakeSuperManagerStore{}
	created, err := EnsureSuperManager(context.Background(), store, fakeHasher{}, SuperManagerBootstrapConfig{})
	if err != nil {
		t.Fatalf("EnsureSuperManager returned error: %v", err)
	}
	if created || store.created {
		t.Fatal("expected missing config to skip bootstrap")
	}
}

func TestEnsureSuperManagerReturnsLookupError(t *testing.T) {
	t.Parallel()

	store := &fakeSuperManagerStore{err: errors.New("db down")}
	created, err := EnsureSuperManager(context.Background(), store, fakeHasher{}, SuperManagerBootstrapConfig{
		Username: "admin",
		Password: "Secret123!",
	})
	if err == nil {
		t.Fatal("expected lookup error")
	}
	if created || store.created {
		t.Fatal("expected lookup failure to skip create")
	}
}
