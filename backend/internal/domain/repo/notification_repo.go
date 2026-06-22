package repo

import (
	"context"
	"time"

	"limpiatuciudad-backend/internal/domain"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type NotificationRepo struct {
	col *mongo.Collection
}

func NewNotificationRepo(db *mongo.Database) *NotificationRepo {
	return &NotificationRepo{col: db.Collection("notifications")}
}

func (r *NotificationRepo) InsertWithID(ctx context.Context, n *domain.Notification) error {
	n.CreatedAt = time.Now()
	_, err := r.col.InsertOne(ctx, n)
	return err
}

func (r *NotificationRepo) ListByUser(ctx context.Context, userID domain.ObjectID, unreadOnly bool) ([]domain.Notification, error) {
	filter := bson.M{"userId": userID.Primitive()}
	if unreadOnly {
		filter["read"] = false
	}

	cur, err := r.col.Find(ctx, filter, options.Find().SetSort(bson.M{"createdAt": -1}))
	if err != nil {
		return nil, err
	}
	defer cur.Close(ctx)

	var out []domain.Notification
	if err := cur.All(ctx, &out); err != nil {
		return nil, err
	}
	return out, nil
}

func (r *NotificationRepo) MarkRead(ctx context.Context, id domain.ObjectID, userID domain.ObjectID) error {
	_, err := r.col.UpdateOne(ctx,
		bson.M{"_id": id.Primitive(), "userId": userID.Primitive()},
		bson.M{"$set": bson.M{"read": true}},
	)
	return err
}

func (r *NotificationRepo) MarkAllRead(ctx context.Context, userID domain.ObjectID) error {
	_, err := r.col.UpdateMany(ctx,
		bson.M{"userId": userID.Primitive(), "read": false},
		bson.M{"$set": bson.M{"read": true}},
	)
	return err
}
