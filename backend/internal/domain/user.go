package domain

import "time"

type Role string

const (
	RoleCiudadano     Role = "ciudadano"
	RoleMunicipalidad Role = "Municipalidad"
	RoleCuadrilla     Role = "Cuadrilla"
)

type User struct {
	ID           ObjectID `bson:"_id,omitempty" json:"id"`
	Name         string   `bson:"name" json:"name"`
	Email        string   `bson:"email" json:"email"`
	PasswordHash string   `bson:"password_hash" json:"-"`
	Role         Role     `bson:"role" json:"role"`

	Phone       string `bson:"phone" json:"phone"`
	Departament string `bson:"departament,omitempty" json:"departament,omitempty"`

	Specialty string `bson:"specialty,omitempty" json:"specialty,omitempty"`
	Zone      string `bson:"zone,omitempty" json:"zone,omitempty"`
	Members   int    `bson:"members,omitempty" json:"members,omitempty"`

	CreatedAt time.Time `bson:"createdAt" json:"createdAt"`
}
