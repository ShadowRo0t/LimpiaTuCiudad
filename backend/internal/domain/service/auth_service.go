package service

import (
	"context"
	"errors"
	"strings"

	"limpiatuciudad-backend/internal/auth"
	"limpiatuciudad-backend/internal/domain"
	"limpiatuciudad-backend/internal/domain/repo"

	"go.mongodb.org/mongo-driver/mongo"
)

var (
	ErrInvalidCredentials = errors.New("invalid credentials")
	ErrEmailExists        = errors.New("email already exists")
	ErrJWTsecretMissing   = errors.New("JWT secret is missing")
)

type AuthService struct {
	users  *repo.UserRepo
	secret []byte
}

func NewAuthService(users *repo.UserRepo, secret []byte) *AuthService {
	return &AuthService{users: users, secret: secret}
}

func (s *AuthService) Login(ctx context.Context, email, password string) (string, *domain.User, error) {
	u, err := s.users.FindByEmail(ctx, strings.ToLower(email))
	if err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			return "", nil, ErrInvalidCredentials
		}
		return "", nil, err
	}

	if !auth.CheckPassword(u.PasswordHash, password) {
		return "", nil, ErrInvalidCredentials
	}
	if len(s.secret) == 0 {
		return "", nil, ErrJWTsecretMissing
	}

	tok, err := auth.SignToken(s.secret, u.ID.Hex(), string(u.Role))
	if err != nil {
		return "", nil, err
	}

	u.PasswordHash = ""
	return tok, u, nil
}

func (s *AuthService) RegisterCiudadano(ctx context.Context, name, email, password, phone string) (string, *domain.User, error) {
	email = strings.ToLower(email)

	if _, err := s.users.FindByEmail(ctx, email); err == nil {
		return "", nil, ErrEmailExists

	}
	hash, err := auth.HashPassword(password)
	if err != nil {
		return "", nil, err
	}

	u := &domain.User{
		ID:           domain.NewObjectID(),
		Name:         name,
		Email:        email,
		Phone:        phone,
		PasswordHash: hash,
		Role:         domain.RoleCiudadano,
	}

	if err := s.users.InsertWithID(ctx, u); err != nil {
		return "", nil, err
	}

	if len(s.secret) == 0 {
		return "", nil, ErrJWTsecretMissing
	}

	tok, err := auth.SignToken(s.secret, u.ID.Hex(), string(u.Role))
	if err != nil {
		return "", nil, err
	}

	u.PasswordHash = ""
	return tok, u, nil
}
