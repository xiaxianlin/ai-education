package db

import "testing"

func TestNormalizeMySQLDSNFromPythonAsyncURL(t *testing.T) {
	got, err := NormalizeMySQLDSN("mysql+asyncmy://user:pass@localhost:3306/ai_education")
	if err != nil {
		t.Fatal(err)
	}
	want := "user:pass@tcp(localhost:3306)/ai_education?charset=utf8mb4&loc=Local&parseTime=true"
	if got != want {
		t.Fatalf("DSN = %q, want %q", got, want)
	}
}

func TestNormalizeMySQLDSNPreservesQuery(t *testing.T) {
	got, err := NormalizeMySQLDSN("mysql+pymysql://u:p@db/edu?charset=utf8&timeout=10s")
	if err != nil {
		t.Fatal(err)
	}
	want := "u:p@tcp(db)/edu?charset=utf8&loc=Local&parseTime=true&timeout=10s"
	if got != want {
		t.Fatalf("DSN = %q, want %q", got, want)
	}
}

func TestNormalizeMySQLDSNPassesNativeDSNThrough(t *testing.T) {
	raw := "user:pass@tcp(localhost:3306)/ai_education?parseTime=true"
	got, err := NormalizeMySQLDSN(raw)
	if err != nil {
		t.Fatal(err)
	}
	if got != raw {
		t.Fatalf("DSN = %q, want original", got)
	}
}

func TestNormalizeMySQLDSNReturnsMissingError(t *testing.T) {
	if _, err := NormalizeMySQLDSN(""); err != ErrMissingDatabaseURL {
		t.Fatalf("err = %v, want ErrMissingDatabaseURL", err)
	}
}
