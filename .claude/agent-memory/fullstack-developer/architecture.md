---
name: architecture
description: Estructura de carpetas y arquitectura del proyecto
type: reference
---

# Arquitectura del Proyecto

## Estructura
```
src/
├── components/       # Componentes reutilizables
│   ├── Layout.jsx
│   ├── MapComponent.jsx
│   ├── StatusBadge.jsx
│   ├── PriorityBadge.jsx
│   └── ReportCard.jsx
├── contexts/         # Estado global
│   ├── AuthContext.jsx
│   └── DataContext.jsx
├── data/             # Datos mock
│   └── mockData.js
├── hooks/            # Custom hooks
│   ├── useGeolocation.js
│   └── useOffline.js
├── pages/            # Páginas por rol
│   ├── ciudadano/
│   ├── municipalidad/
│   └── cuadrilla/
├── utils/            # Utilidades
│   └── storage.js
└── App.jsx           # Routing
```

## Patrones Clave
- Context API para estado global (auth + datos)
- localStorage para persistencia
- Componentes funcionales con hooks
- Mobile-first con Tailwind

**Why:** Arquitectura escalable que separa concerns por rol y funcionalidad.

**How to apply:**
- Nuevos componentes van en components/
- Nueva lógica de estado en contexts/
- Páginas nuevas en pages/[rol]/
