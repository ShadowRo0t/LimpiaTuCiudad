package domain

import (
	"encoding/json"
	"fmt"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type ObjectID primitive.ObjectID

func NewObjectID() ObjectID {
	return ObjectID(primitive.NewObjectID())
}

func ParseObjectID(hex string) (ObjectID, error) {
	oid, err := primitive.ObjectIDFromHex(hex)
	if err != nil {
		return ObjectID{}, err
	}
	return ObjectID(oid), nil
}

func (id ObjectID) Primitive() primitive.ObjectID { return primitive.ObjectID(id) }
func (id ObjectID) Hex() string                   { return primitive.ObjectID(id).Hex() }

func (id ObjectID) MarshalJSON() ([]byte, error) {
	if primitive.ObjectID(id).IsZero() {
		return []byte("null"), nil
	}
	return json.Marshal(id.Hex())
}

func (id *ObjectID) UnmarshalJSON(b []byte) error {
	if string(b) == "null" {
		*id = ObjectID{}
		return nil
	}
	var s string
	if err := json.Unmarshal(b, &s); err != nil {
		return fmt.Errorf("ObjectID debe ser un string: %w", err)
	}
	oid, err := primitive.ObjectIDFromHex(s)
	if err != nil {
		return err
	}
	*id = ObjectID(oid)
	return nil
}
