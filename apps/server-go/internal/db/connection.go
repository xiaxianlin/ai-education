package db

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"time"

	"ai-education/server-go/internal/config"
)

const DefaultDriverName = "mysql"

var ErrMissingDatabaseURL = errors.New("database url is required")

type ConnectionOptions struct {
	DriverName      string
	MaxOpenConns    int
	MaxIdleConns    int
	ConnMaxLifetime time.Duration
	PingTimeout     time.Duration
}

type Option func(*ConnectionOptions)

type Database struct {
	conn *sql.DB
}

func Open(ctx context.Context, cfg config.Config, opts ...Option) (*Database, error) {
	options := ConnectionOptions{
		DriverName:      DefaultDriverName,
		MaxOpenConns:    25,
		MaxIdleConns:    25,
		ConnMaxLifetime: 5 * time.Minute,
		PingTimeout:     5 * time.Second,
	}
	for _, opt := range opts {
		opt(&options)
	}

	rawURL := cfg.Database.URL
	if rawURL == "" {
		rawURL = cfg.DatabaseURL
	}
	if rawURL == "" {
		return nil, ErrMissingDatabaseURL
	}
	if options.DriverName == "" {
		return nil, errors.New("database driver name is required")
	}

	dsn, err := NormalizeMySQLDSN(rawURL)
	if err != nil {
		return nil, err
	}

	conn, err := sql.Open(options.DriverName, dsn)
	if err != nil {
		return nil, fmt.Errorf("open database: %w", err)
	}

	conn.SetMaxOpenConns(options.MaxOpenConns)
	conn.SetMaxIdleConns(options.MaxIdleConns)
	conn.SetConnMaxLifetime(options.ConnMaxLifetime)

	pingCtx := ctx
	cancel := func() {}
	if options.PingTimeout > 0 {
		pingCtx, cancel = context.WithTimeout(ctx, options.PingTimeout)
	}
	defer cancel()

	if err := conn.PingContext(pingCtx); err != nil {
		_ = conn.Close()
		return nil, fmt.Errorf("ping database: %w", err)
	}

	return &Database{conn: conn}, nil
}

func WithDriverName(driverName string) Option {
	return func(options *ConnectionOptions) {
		options.DriverName = driverName
	}
}

func WithPool(maxOpenConns int, maxIdleConns int, connMaxLifetime time.Duration) Option {
	return func(options *ConnectionOptions) {
		options.MaxOpenConns = maxOpenConns
		options.MaxIdleConns = maxIdleConns
		options.ConnMaxLifetime = connMaxLifetime
	}
}

func WithPingTimeout(timeout time.Duration) Option {
	return func(options *ConnectionOptions) {
		options.PingTimeout = timeout
	}
}

func (d *Database) SQL() *sql.DB {
	if d == nil {
		return nil
	}
	return d.conn
}

func (d *Database) Close() error {
	if d == nil || d.conn == nil {
		return nil
	}
	return d.conn.Close()
}

func (d *Database) Ping(ctx context.Context) error {
	if d == nil || d.conn == nil {
		return errors.New("database is not open")
	}
	return d.conn.PingContext(ctx)
}

func (d *Database) TokenRepository() *TokenRepository {
	if d == nil {
		return nil
	}
	return NewTokenRepository(d.conn)
}
