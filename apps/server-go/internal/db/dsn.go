package db

import (
	"fmt"
	"net"
	"net/url"
	"sort"
	"strings"
)

func NormalizeMySQLDSN(raw string) (string, error) {
	raw = strings.TrimSpace(raw)
	if raw == "" {
		return "", ErrMissingDatabaseURL
	}

	if !strings.Contains(raw, "://") {
		return raw, nil
	}

	parsed, err := url.Parse(raw)
	if err != nil {
		return "", fmt.Errorf("parse database url: %w", err)
	}

	switch parsed.Scheme {
	case "mysql", "mysql+asyncmy", "mysql+pymysql", "mysql+aiomysql":
	default:
		return raw, nil
	}

	username := parsed.User.Username()
	password, hasPassword := parsed.User.Password()
	auth := username
	if hasPassword {
		auth += ":" + password
	}
	if auth != "" {
		auth += "@"
	}

	host := parsed.Hostname()
	port := parsed.Port()
	if host == "" {
		host = "127.0.0.1"
	}
	address := host
	if port != "" {
		address = net.JoinHostPort(host, port)
	}

	database := strings.TrimPrefix(parsed.Path, "/")
	query := parsed.Query()
	ensureQueryDefault(query, "charset", "utf8mb4")
	ensureQueryDefault(query, "parseTime", "true")
	ensureQueryDefault(query, "loc", "Local")

	return fmt.Sprintf("%stcp(%s)/%s?%s", auth, address, database, encodeQuery(query)), nil
}

func ensureQueryDefault(query url.Values, key string, value string) {
	if query.Get(key) == "" {
		query.Set(key, value)
	}
}

func encodeQuery(query url.Values) string {
	keys := make([]string, 0, len(query))
	for key := range query {
		keys = append(keys, key)
	}
	sort.Strings(keys)

	parts := make([]string, 0, len(keys))
	for _, key := range keys {
		values := query[key]
		sort.Strings(values)
		for _, value := range values {
			parts = append(parts, url.QueryEscape(key)+"="+url.QueryEscape(value))
		}
	}
	return strings.Join(parts, "&")
}
