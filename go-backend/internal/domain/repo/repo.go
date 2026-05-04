package repo

import (
	"context"
	"time"

	"limpiatuciudad-backend/internal/domain"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

type UserRepo struct {
	col *mongo.Collection
}

func NewUserRepo(db *mongo.Database) *UserRepo {
	return &UserRepo{
		col: db.Collection("users"),
	}
}

func (r *UserRepo) FindByEmail(ctx context.Context, email string) (*domain.User, error) {
	var u domain.User
	if err := r.col.FindOne(ctx, bson.M{"email": email}).Decode(&u); err != nil {
		return nil, err
	}
	return &u, nil
}

func (r *UserRepo) InsertWithID(ctx context.Context, u *domain.User) error {
	u.CreatedAt = time.Now().UTC()
	_, err := r.col.InsertOne(ctx, u)
	return err
}
