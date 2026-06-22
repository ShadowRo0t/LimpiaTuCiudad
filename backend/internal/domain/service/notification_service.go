package service

import (
	"context"
	"limpiatuciudad-backend/internal/domain"
	"limpiatuciudad-backend/internal/domain/repo"
)

type NotificationService struct {
	repo *repo.NotificationRepo
}

func NewNotificationService(repo *repo.NotificationRepo) *NotificationService {
	return &NotificationService{repo: repo}
}

func (s *NotificationService) Create(ctx context.Context, n *domain.Notification) error {
	return s.repo.InsertWithID(ctx, n)
}

func (s *NotificationService) MarkRead(ctx context.Context, notifiID, userID domain.ObjectID) error {
	return s.repo.MarkRead(ctx, notifiID, userID)
}

func (s *NotificationService) List(ctx context.Context, userID domain.ObjectID, unreadOnly bool) ([]domain.Notification, error) {
	return s.repo.ListByUser(ctx, userID, unreadOnly)
}

func (s *NotificationService) MarkAllRead(ctx context.Context, userID domain.ObjectID) error {
	return s.repo.MarkAllRead(ctx, userID)
}
