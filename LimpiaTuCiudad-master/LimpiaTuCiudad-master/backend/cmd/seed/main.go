package main

import (
	"context"
	"fmt"
	"log"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"

	"limpiatuciudad-backend/internal/auth"
	"limpiatuciudad-backend/internal/domain"
	"limpiatuciudad-backend/internal/domain/config"
	"limpiatuciudad-backend/internal/domain/repo"
)

func main() {
	// Load configuration
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("Failed to load config: %v", err)
	}

	// Setup MongoDB connection
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	client, err := mongo.Connect(ctx, options.Client().ApplyURI(cfg.MongoDBURI))
	if err != nil {
		log.Fatalf("Failed to connect to MongoDB: %v", err)
	}
	defer func() {
		if err = client.Disconnect(context.Background()); err != nil {
			log.Fatalf("Failed to disconnect from MongoDB: %v", err)
		}
	}()

	err = client.Ping(ctx, nil)
	if err != nil {
		log.Fatalf("Failed to ping MongoDB: %v", err)
	}

	log.Printf("Connected to MongoDB at %s", cfg.MongoDBURI)

	// Create database and repo
	db := client.Database(cfg.MongoDB)
	userRepo := repo.NewUserRepo(db)

	// Seed cuadrillas
	seedCuadrillas(ctx, userRepo)
}

func seedCuadrillas(ctx context.Context, userRepo *repo.UserRepo) {
	cuadrillas := []struct {
		name      string
		email     string
		password  string
		specialty string
		zone      string
		members   int
	}{
		{
			name:      "Cuadrilla Norte",
			email:     "cuadrilla.norte@servicios.gob",
			password:  "cuadrilla123",
			specialty: "infraestructura",
			zone:      "Norte",
			members:   4,
		},
		{
			name:      "Cuadrilla Sur",
			email:     "cuadrilla.sur@servicios.gob",
			password:  "cuadrilla123",
			specialty: "servicios",
			zone:      "Sur",
			members:   3,
		},
		{
			name:      "Cuadrilla Centro",
			email:     "cuadrilla.centro@servicios.gob",
			password:  "cuadrilla123",
			specialty: "limpieza",
			zone:      "Centro",
			members:   5,
		},
	}

	for _, c := range cuadrillas {
		// Check if cuadrilla already exists
		existing, err := userRepo.FindByEmail(ctx, c.email)
		if err == nil && existing != nil {
			fmt.Printf("⚠️  Cuadrilla '%s' ya existe en la base de datos\n", c.name)
			continue
		}

		// Hash password
		hash, err := auth.HashPassword(c.password)
		if err != nil {
			log.Fatalf("Error hashing password for %s: %v", c.name, err)
		}

		// Create cuadrilla user
		user := &domain.User{
			ID:           domain.NewObjectID(),
			Name:         c.name,
			Email:        c.email,
			PasswordHash: hash,
			Role:         domain.RoleCuadrilla,
			Phone:        "+54 9 11 0000-0000",
			Specialty:    c.specialty,
			Zone:         c.zone,
			Members:      c.members,
		}

		if err := userRepo.InsertWithID(ctx, user); err != nil {
			log.Fatalf("Error inserting cuadrilla %s: %v", c.name, err)
		}

		fmt.Printf("✅ Cuadrilla '%s' creada exitosamente (ID: %s)\n", c.name, user.ID.Hex())
	}

	fmt.Println("\n🎉 Seed de cuadrillas completado")
}
