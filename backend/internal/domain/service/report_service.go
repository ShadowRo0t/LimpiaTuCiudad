package service

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"log"
	"os/exec"
	"time"

	"limpiatuciudad-backend/internal/domain"
	"limpiatuciudad-backend/internal/domain/repo"
)

type ReportService struct {
	repo *repo.ReportRepo
}

func NewReportService(repo *repo.ReportRepo) *ReportService {
	return &ReportService{repo: repo}
}

type BertInput struct {
	NewDescription       string   `json:"new_description"`
	ExistingDescriptions []string `json:"existing_descriptions"`
}

type BertOutput struct {
	Similarities []float64 `json:"similarities"`
	Error        string    `json:"error,omitempty"`
}

type OwlvitInput struct {
	Description string `json:"description"`
	PhotoPath   string `json:"photoPath"`
	PhotoBase64 string `json:"photoBase64"`
}

// computeOwlvitDetection llama al script de Python owlvit_detector.py para detectar el estado del árbol caído
func (s *ReportService) computeOwlvitDetection(desc string, photoSource string, isBase64 bool) (*domain.AIDetection, error) {
	inputData := OwlvitInput{
		Description: desc,
	}
	if isBase64 {
		inputData.PhotoBase64 = photoSource
	} else {
		inputData.PhotoPath = photoSource
	}

	payload, err := json.Marshal(inputData)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal Owlvit input: %w", err)
	}

	cmd := exec.Command("python", "owlvit_detector.py")
	
	var stdout, stderr bytes.Buffer
	cmd.Stdin = bytes.NewReader(payload)
	cmd.Stdout = &stdout
	cmd.Stderr = &stderr

	// Timeout de 25 segundos para procesamiento local de imágenes con Deep Learning
	ctx, cancel := context.WithTimeout(context.Background(), 25*time.Second)
	defer cancel()

	done := make(chan error, 1)
	go func() {
		done <- cmd.Run()
	}()

	select {
	case <-ctx.Done():
		if cmd.Process != nil {
			_ = cmd.Process.Kill()
		}
		return nil, fmt.Errorf("OWL-ViT detector script execution timed out")
	case err = <-done:
		if err != nil {
			return nil, fmt.Errorf("OWL-ViT detector execution failed: %v, stderr: %s", err, stderr.String())
		}
	}

	var output domain.AIDetection
	if err := json.Unmarshal(stdout.Bytes(), &output); err != nil {
		return nil, fmt.Errorf("failed to unmarshal OWL-ViT output: %w, raw: %s", err, stdout.String())
	}

	return &output, nil
}

// computeBertSimilarity llama al script de Python bert_similarity.py para obtener el porcentaje de similitud
func (s *ReportService) computeBertSimilarity(newDesc string, existingDescs []string) ([]float64, error) {
	inputData := BertInput{
		NewDescription:       newDesc,
		ExistingDescriptions: existingDescs,
	}

	payload, err := json.Marshal(inputData)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal BERT input: %w", err)
	}

	// Ejecutar python bert_similarity.py en el CWD (backend)
	cmd := exec.Command("python", "bert_similarity.py")
	
	var stdout, stderr bytes.Buffer
	cmd.Stdin = bytes.NewReader(payload)
	cmd.Stdout = &stdout
	cmd.Stderr = &stderr

	// Timeout de 20 segundos para evitar bloqueos del modelo de deep learning en CPU
	ctx, cancel := context.WithTimeout(context.Background(), 20*time.Second)
	defer cancel()

	done := make(chan error, 1)
	go func() {
		done <- cmd.Run()
	}()

	select {
	case <-ctx.Done():
		if cmd.Process != nil {
			_ = cmd.Process.Kill()
		}
		return nil, fmt.Errorf("BERT script execution timed out")
	case err = <-done:
		if err != nil {
			return nil, fmt.Errorf("BERT script execution failed: %v, stderr: %s", err, stderr.String())
		}
	}

	var output BertOutput
	if err := json.Unmarshal(stdout.Bytes(), &output); err != nil {
		return nil, fmt.Errorf("failed to unmarshal BERT output: %w, raw: %s", err, stdout.String())
	}

	if output.Error != "" {
		return nil, fmt.Errorf("BERT python error: %s", output.Error)
	}

	return output.Similarities, nil
}

// Create inserta un reporte y realiza la detección de duplicados con BERT
func (s *ReportService) Create(ctx context.Context, rpt *domain.Report) error {
	// Inicializar campos por defecto si vienen vacíos
	rpt.IsDuplicate = false
	if rpt.Status == "" {
		rpt.Status = domain.StatusPending
	}
	if rpt.Priority == "" {
		rpt.Priority = domain.PriorityBaja
	}

	// Ejecutar análisis OWL-ViT si es un reporte de árbol y tiene fotos
	if rpt.Type == "arbol" && len(rpt.Photos) > 0 {
		log.Printf("[ReportService] Ejecutando análisis OWL-ViT para reporte de árbol caído...")
		photoSource := rpt.Photos[0].URL
		isBase64 := false
		if len(photoSource) > 30 && (photoSource[:10] == "data:image" || len(photoSource) > 1000) {
			isBase64 = true
		}
		
		aiResult, err := s.computeOwlvitDetection(rpt.Description, photoSource, isBase64)
		if err != nil {
			log.Printf("[ReportService] Error en análisis OWL-ViT: %v. Usando fallback local.", err)
		} else {
			rpt.AIAnalysis = aiResult
			log.Printf("[ReportService] Análisis OWL-ViT completado. Nivel de peligro: %s", aiResult.DangerLevel)
			
			// Ajustar la prioridad del reporte basado en el peligro de la IA
			switch aiResult.DangerLevel {
			case "critica":
				rpt.Priority = domain.PriorityCritica
			case "alta":
				rpt.Priority = domain.PriorityAlta
			case "media":
				rpt.Priority = domain.PriorityMedia
			case "baja":
				rpt.Priority = domain.PriorityBaja
			}
		}
	}


	// 1. Buscar reportes activos del mismo tipo en un radio de 100 metros
	// coordenadas en GeoJSON: [lng, lat]
	lng := rpt.Location.Coordinates[0]
	lat := rpt.Location.Coordinates[1]

	nearby, err := s.repo.FindNearbyActive(ctx, rpt.Type, lat, lng, 100)
	if err != nil {
		log.Printf("[ReportService] Error buscando reportes cercanos: %v", err)
	} else if len(nearby) > 0 {
		log.Printf("[ReportService] Se encontraron %d reportes cercanos del tipo '%s'. Ejecutando BERT...", len(nearby), rpt.Type)
		
		existingDescriptions := make([]string, len(nearby))
		for i, r := range nearby {
			existingDescriptions[i] = r.Description
		}

		scores, err := s.computeBertSimilarity(rpt.Description, existingDescriptions)
		if err != nil {
			log.Printf("[ReportService] Falló cálculo de BERT: %v. Usando fallback de duplicado geográfico.", err)
			// Fallback: si falla BERT, pero hay reportes idénticos en ubicación, marcamos como duplicado de forma preventiva
			rpt.IsDuplicate = true
			rpt.Status = domain.StatusRechazado
		} else {
			log.Printf("[ReportService] Similitudes devueltas por BERT: %v", scores)
			for i, score := range scores {
				if score > 0.75 { // Umbral de duplicidad semántica de BERT
					log.Printf("[ReportService] ¡Duplicado detectado! Reporte nuevo coincide con Reporte Antiguo (ID: %s, Similitud: %.4f)", nearby[i].ID.Hex(), score)
					rpt.IsDuplicate = true
					rpt.Status = domain.StatusRechazado
					break
				}
			}
		}
	} else {
		log.Printf("[ReportService] No hay reportes activos del mismo tipo a menos de 100 metros.")
	}

	// 2. Insertar reporte en MongoDB
	return s.repo.InsertWithID(ctx, rpt)
}

func (s *ReportService) FindByID(ctx context.Context, id domain.ObjectID) (*domain.Report, error) {
	return s.repo.FindByID(ctx, id)
}

func (s *ReportService) List(ctx context.Context, f repo.ListReportsFilters) ([]domain.Report, error) {
	return s.repo.ListReports(ctx, f)
}
