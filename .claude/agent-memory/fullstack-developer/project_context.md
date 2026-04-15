---
name: project_context
description: Contexto del proyecto LimpiaTuCiudad - plataforma de gestión de reportes urbanos
type: project
---

# Proyecto: LimpiaTuCiudad

Plataforma web para gestión de reportes de problemas urbanos con 3 roles: ciudadano, municipalidad y cuadrilla.

**Why:** Proyecto universitario de Ingeniería de Software para resolver reporte ineficiente de problemas urbanos mediante canales fragmentados.

**How to apply:**
- Mantener separación clara entre los 3 módulos/roles
- Priorizar UX mobile-first para ciudadano y cuadrilla
- Los datos se persisten en localStorage para demo sin backend
- Implementar detección de duplicados por ubicación/tipo

## Casos de Uso Implementados
- CU01: Reporte de incidente urbano con foto + GPS
- CU02: Clasificación y priorización automática/manual
- CU03: Gestión de despliegue y asignación de cuadrillas
- CU04: Resolución con evidencia fotográfica
- CU05: Dashboard con KPIs y exportación PDF/Excel
