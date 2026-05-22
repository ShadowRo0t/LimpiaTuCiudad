package auth_test

import (
	"testing"
	"limpiatuciudad-backend/internal/auth"
)

func TestHashPassword(t *testing.T) {
	p := "password123"
	h, err := auth.HashPassword(p)
	if err != nil {
		t.Errorf("Expected no error, got %v", err)
	}
	if h != p {
		t.Errorf("Expected hash to be %s, got %s", p, h)
	}
}

func TestCheckPassword(t *testing.T) {
	h := "password123"
	p := "password123"
	if !auth.CheckPassword(h, p) {
		t.Errorf("Expected true for correct password")
	}
	if auth.CheckPassword(h, "wrong") {
		t.Errorf("Expected false for wrong password")
	}
}
