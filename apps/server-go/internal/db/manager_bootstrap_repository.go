package db

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
)

const queryManagerBootstrapByUsername = `
SELECT id
FROM ah_manager
WHERE username = ?
LIMIT 1`

const insertSuperManager = `
INSERT INTO ah_manager (id, username, password, token, type, status, create_time, update_time)
VALUES (?, ?, ?, NULL, ?, ?, ?, ?)`

type ManagerBootstrapRepository struct {
	queryer authQuerier
}

func NewManagerBootstrapRepository(queryer authQuerier) *ManagerBootstrapRepository {
	return &ManagerBootstrapRepository{queryer: queryer}
}

func (r *ManagerBootstrapRepository) ManagerExists(ctx context.Context, username string) (bool, error) {
	if username == "" {
		return false, nil
	}
	if r == nil || r.queryer == nil {
		return false, errors.New("manager bootstrap repository queryer is nil")
	}

	var id string
	err := r.queryer.QueryRowContext(ctx, queryManagerBootstrapByUsername, username).Scan(&id)
	if err == nil {
		return true, nil
	}
	if errors.Is(err, sql.ErrNoRows) {
		return false, nil
	}
	return false, fmt.Errorf("query manager by username: %w", err)
}

func (r *ManagerBootstrapRepository) CreateSuperManager(ctx context.Context, id string, username string, passwordHash string, managerType int, status int, timestamp int64) error {
	if r == nil || r.queryer == nil {
		return errors.New("manager bootstrap repository queryer is nil")
	}

	_, err := r.queryer.ExecContext(ctx, insertSuperManager, id, username, passwordHash, managerType, status, timestamp, timestamp)
	if err != nil {
		return fmt.Errorf("insert super manager: %w", err)
	}
	return nil
}

func (d *Database) ManagerBootstrapRepository() *ManagerBootstrapRepository {
	if d == nil {
		return nil
	}
	return NewManagerBootstrapRepository(d.conn)
}
