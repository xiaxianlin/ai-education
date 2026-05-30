package db

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
)

const queryManagerByID = `
SELECT id, username, password, token, type, status, create_time, update_time
FROM ah_manager
WHERE id = ?
LIMIT 1`

const queryManagerUsernameExists = `
SELECT id
FROM ah_manager
WHERE username = ?
LIMIT 1`

const insertManager = `
INSERT INTO ah_manager (id, username, password, token, type, status, create_time, update_time)
VALUES (?, ?, ?, NULL, ?, ?, ?, ?)`

const updateManager = `
UPDATE ah_manager
SET type = COALESCE(?, type), status = COALESCE(?, status), update_time = ?
WHERE id = ?`

const deleteManager = `
DELETE FROM ah_manager
WHERE id = ?`

const updateManagerPassword = `
UPDATE ah_manager
SET password = ?, token = COALESCE(?, token), update_time = ?
WHERE id = ?`

const queryAllManagers = `
SELECT id, username, password, token, type, status, create_time, update_time
FROM ah_manager
ORDER BY create_time DESC`

func (r *TokenRepository) GetManagerByID(ctx context.Context, managerID string) (*ManagerRecord, error) {
	if managerID == "" {
		return nil, ErrNotFound
	}
	if r == nil || r.queryer == nil {
		return nil, errors.New("token repository queryer is nil")
	}
	record, err := scanManagerRecord(r.queryer.QueryRowContext(ctx, queryManagerByID, managerID))
	if err != nil {
		return nil, err
	}
	return record, nil
}

func (r *TokenRepository) ManagerUsernameExists(ctx context.Context, username string) (bool, error) {
	if username == "" {
		return false, nil
	}
	if r == nil || r.queryer == nil {
		return false, errors.New("token repository queryer is nil")
	}
	var id string
	err := r.queryer.QueryRowContext(ctx, queryManagerUsernameExists, username).Scan(&id)
	if errors.Is(err, sql.ErrNoRows) {
		return false, nil
	}
	if err != nil {
		return false, fmt.Errorf("check manager username: %w", err)
	}
	return true, nil
}

func (r *TokenRepository) CreateManager(ctx context.Context, record ManagerRecord) error {
	if r == nil || r.queryer == nil {
		return errors.New("token repository queryer is nil")
	}
	_, err := r.queryer.ExecContext(
		ctx,
		insertManager,
		record.ID,
		record.Username,
		record.Password,
		record.Type,
		record.Status,
		record.CreateTime,
		nullInt64Value(record.UpdateTime),
	)
	if err != nil {
		return fmt.Errorf("create manager: %w", err)
	}
	return nil
}

func (r *TokenRepository) UpdateManager(ctx context.Context, managerID string, managerType *int, status *int, updateTime int64) error {
	if managerID == "" {
		return ErrNotFound
	}
	if r == nil || r.queryer == nil {
		return errors.New("token repository queryer is nil")
	}
	result, err := r.queryer.ExecContext(
		ctx,
		updateManager,
		nullIntValue(managerType),
		nullIntValue(status),
		updateTime,
		managerID,
	)
	if err != nil {
		return fmt.Errorf("update manager: %w", err)
	}
	if affectedRows(result) == 0 {
		return ErrNotFound
	}
	return nil
}

func (r *TokenRepository) DeleteManager(ctx context.Context, managerID string) error {
	if managerID == "" {
		return ErrNotFound
	}
	if r == nil || r.queryer == nil {
		return errors.New("token repository queryer is nil")
	}
	result, err := r.queryer.ExecContext(ctx, deleteManager, managerID)
	if err != nil {
		return fmt.Errorf("delete manager: %w", err)
	}
	if affectedRows(result) == 0 {
		return ErrNotFound
	}
	return nil
}

func (r *TokenRepository) UpdateManagerPassword(ctx context.Context, managerID string, passwordHash string, token *string, updateTime int64) error {
	if managerID == "" {
		return ErrNotFound
	}
	if r == nil || r.queryer == nil {
		return errors.New("token repository queryer is nil")
	}
	result, err := r.queryer.ExecContext(
		ctx,
		updateManagerPassword,
		passwordHash,
		nullStringValue(token),
		updateTime,
		managerID,
	)
	if err != nil {
		return fmt.Errorf("update manager password: %w", err)
	}
	if affectedRows(result) == 0 {
		return ErrNotFound
	}
	return nil
}

func (r *TokenRepository) ListManagers(ctx context.Context) ([]ManagerRecord, error) {
	if r == nil || r.queryer == nil {
		return nil, errors.New("token repository queryer is nil")
	}
	rows, err := r.queryer.QueryContext(ctx, queryAllManagers)
	if err != nil {
		return nil, fmt.Errorf("list managers: %w", err)
	}
	defer rows.Close()

	records := make([]ManagerRecord, 0)
	for rows.Next() {
		record, err := scanManagerRecord(rows)
		if err != nil {
			return nil, err
		}
		records = append(records, *record)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterate managers: %w", err)
	}
	return records, nil
}

type managerScanner interface {
	Scan(dest ...any) error
}

func scanManagerRecord(scanner managerScanner) (*ManagerRecord, error) {
	var record ManagerRecord
	var token sql.NullString
	var updateTime sql.NullInt64
	err := scanner.Scan(
		&record.ID,
		&record.Username,
		&record.Password,
		&token,
		&record.Type,
		&record.Status,
		&record.CreateTime,
		&updateTime,
	)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, ErrNotFound
	}
	if err != nil {
		return nil, fmt.Errorf("scan manager: %w", err)
	}
	record.Token = stringPointer(token)
	record.UpdateTime = int64Pointer(updateTime)
	return &record, nil
}

func affectedRows(result sql.Result) int64 {
	if result == nil {
		return 0
	}
	rows, err := result.RowsAffected()
	if err != nil {
		return 0
	}
	return rows
}

func nullIntValue(value *int) sql.NullInt64 {
	if value == nil {
		return sql.NullInt64{}
	}
	return sql.NullInt64{Int64: int64(*value), Valid: true}
}

func nullInt64Value(value *int64) sql.NullInt64 {
	if value == nil {
		return sql.NullInt64{}
	}
	return sql.NullInt64{Int64: *value, Valid: true}
}

func nullStringValue(value *string) sql.NullString {
	if value == nil {
		return sql.NullString{}
	}
	return sql.NullString{String: *value, Valid: true}
}
