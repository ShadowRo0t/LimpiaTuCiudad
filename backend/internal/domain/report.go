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

type DetectedObject struct {
	Label      string     `bson:"label" json:"label"`
	Confidence float64    `bson:"confidence" json:"confidence"`
	Box        [4]float64 `bson:"box" json:"box"` // [ymin, xmin, ymax, xmax]
}

type AIDetection struct {
	Performed     bool             `bson:"performed" json:"performed"`
	HasFallenTree bool             `bson:"hasFallenTree" json:"hasFallenTree"`
	DangerLevel   string           `bson:"dangerLevel" json:"dangerLevel"`
	Confidence    float64          `bson:"confidence" json:"confidence"`
	Reason        string           `bson:"reason" json:"reason"`
	TreeSize      string           `bson:"treeSize" json:"treeSize"`
	Obstruction   string           `bson:"obstruction" json:"obstruction"`
	Damage        string           `bson:"damage" json:"damage"`
	Objects       []DetectedObject `bson:"objects" json:"objects"`
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

	AIAnalysis *AIDetection `bson:"aiAnalysis,omitempty" json:"aiAnalysis,omitempty"`

	CreatedAt time.Time `bson:"createdAt" json:"createdAt"`
	UpdatedAt time.Time `bson:"updatedAt" json:"updatedAt"`
}

