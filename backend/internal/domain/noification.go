package domain

import "time"

type Notification struct {
	ID        ObjectID  `bson:"_id,omitempty" json:"id"`
	UserID    ObjectID  `bson:"user_id" json:"userID"`
	ReportID  ObjectID  `bson:"report_id" json:"reportID"`
	Type      string    `bson:"type" json:"type"`
	Title     string    `bson:"title" json:"title"`
	Message   string    `bson:"message" json:"message"`
	Read      bool      `bson:"read" json:"read"`
	CreatedAt time.Time `bson:"createdAt" json:"createdAt"`
}
