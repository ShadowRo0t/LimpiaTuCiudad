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

func (r *UserRepo) FindByID(ctx context.Context, id domain.ObjectID) (*domain.User, error) {
	var u domain.User
	if err := r.col.FindOne(ctx, bson.M{"_id": id}).Decode(&u); err != nil {
		return nil, err
	}
	return &u, nil
}

func (r *UserRepo) FindByRole(ctx context.Context, role domain.Role) ([]*domain.User, error) {
	cursor, err := r.col.Find(ctx, bson.M{"role": role})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var users []*domain.User
	if err = cursor.All(ctx, &users); err != nil {
		return nil, err
	}

	return users, nil
}

func (r *UserRepo) InsertWithID(ctx context.Context, u *domain.User) error {
	u.CreatedAt = time.Now().UTC()
	_, err := r.col.InsertOne(ctx, u)
	return err
}
