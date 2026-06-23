package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"

	"limpiatuciudad-backend/internal/domain"
	"limpiatuciudad-backend/internal/domain/config"
	"limpiatuciudad-backend/internal/domain/repo"
	"limpiatuciudad-backend/internal/domain/service"
)

func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}
		next.ServeHTTP(w, r)
	})
}

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

	// Instanciar base de datos, repos y servicios
	db := client.Database(cfg.MongoDB)
	reportRepo := repo.NewReportRepo(db)
	reportService := service.NewReportService(reportRepo)
	userRepo := repo.NewUserRepo(db)

	// Setup HTTP Router
	r := chi.NewRouter()
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(corsMiddleware)

	// /health endpoint
	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		timestamp := time.Now().UTC().Format("2006-01-02T15:04:05.000Z")
		w.Write([]byte(`{"status":"ok","timestamp":"` + timestamp + `"}`))
	})

	// /api endpoints
	r.Route("/api", func(api chi.Router) {
		api.Get("/", func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusOK)
			w.Write([]byte(`{"message":"API de LimpiaTuCiudad","version":"1.0.0","endpoints":{"health":"/health","api":"/api","reports":"/api/reports","cuadrillas":"/api/cuadrillas"}}`))
		})

		// GET /api/reports - Listar reportes con filtros
		api.Get("/reports", func(w http.ResponseWriter, r *http.Request) {
			ctx := r.Context()
			var filters repo.ListReportsFilters

			status := r.URL.Query().Get("status")
			if status != "" {
				filters.Status = status
			}
			typ := r.URL.Query().Get("type")
			if typ != "" {
				filters.Type = typ
			}
			category := r.URL.Query().Get("category")
			if category != "" {
				filters.Category = category
			}
			priority := r.URL.Query().Get("priority")
			if priority != "" {
				filters.Priority = priority
			}

			userIDHex := r.URL.Query().Get("userID")
			if userIDHex != "" {
				if uid, err := domain.ParseObjectID(userIDHex); err == nil {
					filters.UserID = &uid
				}
			}

			list, err := reportService.List(ctx, filters)
			if err != nil {
				http.Error(w, fmt.Sprintf("Error listando reportes: %v", err), http.StatusInternalServerError)
				return
			}

			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(list)
		})

		// GET /api/reports/{id} - Obtener un reporte por ID
		api.Get("/reports/{id}", func(w http.ResponseWriter, r *http.Request) {
			idStr := chi.URLParam(r, "id")
			id, err := domain.ParseObjectID(idStr)
			if err != nil {
				http.Error(w, "ID de reporte inválido", http.StatusBadRequest)
				return
			}

			rpt, err := reportService.FindByID(r.Context(), id)
			if err != nil {
				http.Error(w, fmt.Sprintf("Reporte no encontrado: %v", err), http.StatusNotFound)
				return
			}

			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(rpt)
		})

		// POST /api/reports - Crear reporte (con lógica BERT integrada)
		api.Post("/reports", func(w http.ResponseWriter, r *http.Request) {
			var rpt domain.Report
			if err := json.NewDecoder(r.Body).Decode(&rpt); err != nil {
				http.Error(w, fmt.Sprintf("Cuerpo JSON inválido: %v", err), http.StatusBadRequest)
				return
			}

			// Autogenerar ObjectID si es nulo o vacío
			if rpt.ID.Hex() == "000000000000000000000000" || rpt.ID.Hex() == "" {
				rpt.ID = domain.NewObjectID()
			}

			if err := reportService.Create(r.Context(), &rpt); err != nil {
				http.Error(w, fmt.Sprintf("Error al crear reporte: %v", err), http.StatusInternalServerError)
				return
			}

			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusCreated)
			json.NewEncoder(w).Encode(rpt)
		})

		// GET /api/cuadrillas - Listar todas las cuadrillas
		api.Get("/cuadrillas", func(w http.ResponseWriter, r *http.Request) {
			ctx := r.Context()
			cuadrillas, err := userRepo.FindByRole(ctx, domain.RoleCuadrilla)
			if err != nil {
				http.Error(w, fmt.Sprintf("Error listando cuadrillas: %v", err), http.StatusInternalServerError)
				return
			}

			// Remover contraseñas del response
			for i := range cuadrillas {
				cuadrillas[i].PasswordHash = ""
			}

			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(cuadrillas)
		})

		// GET /api/cuadrillas/{id} - Obtener cuadrilla por ID
		api.Get("/cuadrillas/{id}", func(w http.ResponseWriter, r *http.Request) {
			idStr := chi.URLParam(r, "id")
			id, err := domain.ParseObjectID(idStr)
			if err != nil {
				http.Error(w, "ID de cuadrilla inválido", http.StatusBadRequest)
				return
			}

			cuadrilla, err := userRepo.FindByID(r.Context(), id)
			if err != nil {
				http.Error(w, fmt.Sprintf("Cuadrilla no encontrada: %v", err), http.StatusNotFound)
				return
			}

			if cuadrilla.Role != domain.RoleCuadrilla {
				http.Error(w, "El usuario no es una cuadrilla", http.StatusBadRequest)
				return
			}

			cuadrilla.PasswordHash = ""

			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(cuadrilla)
		})
	})

	// Start server
	log.Printf("Backend corriendo en http://localhost%s", cfg.HTTPAddr)
	if err := http.ListenAndServe(cfg.HTTPAddr, r); err != nil {
		log.Fatalf("Server failed: %v", err)
	}
}
