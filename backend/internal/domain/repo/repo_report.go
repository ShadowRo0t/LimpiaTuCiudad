package repo

import (
	"context"
	"time"

	"limpiatuciudad-backend/internal/domain"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type ReportRepo struct {
	col *mongo.Collection
}

func NewReportRepo(db *mongo.Database) *ReportRepo {
	return &ReportRepo{
		col: db.Collection("reports"),
	}
}

func (r *ReportRepo) InsertWithID(ctx context.Context, rpt *domain.Report) error {
	now := time.Now().UTC()
	rpt.CreatedAt = now
	rpt.UpdatedAt = now

	_, err := r.col.InsertOne(ctx, rpt)
	return err
}

func (r *ReportRepo) FindByID(ctx context.Context, id domain.ObjectID) (*domain.Report, error) {
	var rpt domain.Report
	if err := r.col.FindOne(ctx, bson.M{"_id": id}).Decode(&rpt); err != nil {
		return nil, err
	}
	return &rpt, nil
}

type ListReportsFilters struct {
	UserID     *domain.ObjectID
	AssignedTo *domain.ObjectID
	Status     string
	Type       string
	Category   string
	Priority   string
}

func (r *ReportRepo) ListReports(ctx context.Context, f ListReportsFilters) ([]domain.Report, error) {
	filter := bson.M{}
	if f.UserID != nil {
		filter["userID"] = f.UserID.Primitive()
	}

	if f.AssignedTo != nil {
		filter["assignedTo"] = f.AssignedTo.Primitive()
	}
	if f.Status != "" {
		filter["status"] = f.Status
	}
	if f.Type != "" {
		filter["type"] = f.Type
	}
	if f.Category != "" {
		filter["category"] = f.Category
	}
	if f.Priority != "" {
		filter["priority"] = f.Priority
	}

	cur, err := r.col.Find(ctx, filter, options.Find().SetSort(bson.M{"createdAt": -1}))
	if err != nil {
		return nil, err
	}
	defer cur.Close(ctx)

	var out []domain.Report
	if err := cur.All(ctx, &out); err != nil {
		return nil, err
	}
	return out, nil
}

func (r *ReportRepo) ExistsDuplicate(ctx context.Context, typ string, lat, lng float64, radiusMeters int) (bool, error) {
	filter := bson.M{
		"type":        typ,
		"isDuplicate": false,
		"status":      bson.M{"$ne": string(domain.StatusResuelto)},
		"location": bson.M{
			"$near": bson.M{
				"$geometry": bson.M{
					"type":        "Point",
					"coordinates": []float64{lng, lat},
				},
				"$maxDistance": radiusMeters,
			},
		},
	}
	err := r.col.FindOne(ctx, filter).Err()
	if err == mongo.ErrNoDocuments {
		return false, nil
	}
	return err == nil, err
}

func (r *ReportRepo) FindNearbyActive(ctx context.Context, typ string, lat, lng float64, radiusMeters int) ([]domain.Report, error) {
	filter := bson.M{
		"type":        typ,
		"isDuplicate": false,
		"status":      bson.M{"$ne": string(domain.StatusResuelto)},
		"location": bson.M{
			"$near": bson.M{
				"$geometry": bson.M{
					"type":        "Point",
					"coordinates": []float64{lng, lat},
				},
				"$maxDistance": radiusMeters,
			},
		},
	}
	cur, err := r.col.Find(ctx, filter)
	if err != nil {
		return nil, err
	}
	defer cur.Close(ctx)

	var out []domain.Report
	if err := cur.All(ctx, &out); err != nil {
		return nil, err
	}
	return out, nil
}

