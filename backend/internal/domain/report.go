package domain

import "time"

type ReportStatus string
type Priority string

const (
	StatusPending   ReportStatus = "pendiente"
	StatusEnProceso ReportStatus = "en-proceso"
	StatusResuelto  ReportStatus = "resuelto"
	StatusRechazado ReportStatus = "rechazado"

	PriorityBaja    Priority = "baja"
	PriorityMedia   Priority = "media"
	PriorityAlta    Priority = "alta"
	PriorityCritica Priority = "critica"
)

type GeoPoint struct {
	Type        string     `bson:"type" json:"type"`
	Coordinates [2]float64 `bson:"coordinates" json:"coordinates"`
}

//key: ObjectID hex del archivo en GridFS
//url: endpoint para descargar

type PhotoRef struct {
	Key string `bson:"key" json:"key"`
	URL string `bson:"url" json:"url"`
}

type Report struct {
	ID     ObjectID `bson:"_id,omitempty" json:"id"`
	UserID ObjectID `bson:"user_id" json:"userID"`

	Type        string `bson:"type" json:"type"`
	TypeName    string `bson:"typeName" json:"typeName"`
	Category    string `bson:"category" json:"category"`
	Description string `bson:"description" json:"description"`
	Address     string `bson:"address" json:"address"`

	Location GeoPoint   `bson:"location" json:"location"`
	Photos   []PhotoRef `bson:"photos" json:"photos"`

	Status      ReportStatus `bson:"status" json:"status"`
	Priority    Priority     `bson:"priority" json:"priority"`
	AssignedTo  *ObjectID    `bson:"assignedTo" json:"assignedTo"`
	IsDuplicate bool         `bson:"isDuplicate" json:"isDuplicate"`

	ResolvedAt      *time.Time `bson:"resolvedAt" json:"resolvedAt"`
	ResolutionPhoto *PhotoRef  `bson:"resolutionPhoto" json:"resolutionPhoto"`
	ResolutionNotes string     `bson:"resolutionNotes,omitempty" json:"resolutionNotes,omitempty"`

	CreatedAt time.Time `bson:"createdAt" json:"createdAt"`
	UpdatedAt time.Time `bson:"updatedAt" json:"updatedAt"`
}
