package domain

type DashboardStats struct {
	Total            int            `json:"total"`
	Pendientes       int            `json:"pendientes"`
	EnProceso        int            `json:"enProceso"`
	Resueltos        int            `json:"resueltos"`
	Duplicados       int            `json:"duplicados"`
	AvgResolutionDay string         `json:"avgResolutionTime"`
	ByCategory       map[string]int `json:"byCategory"`
	ByType           map[string]int `json:"byType"`
}
