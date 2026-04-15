# LimpiaTuCiudad - Plataforma de Gestión de Reportes Urbanos

Plataforma web completa para la gestión de reportes de problemas urbanos, desarrollada con React + Vite + Tailwind CSS.

## Descripción del Proyecto

LimpiaTuCiudad es un sistema que permite a los ciudadanos reportar problemas urbanos (baches, luminarias apagadas, acumulación de basura, etc.) de manera georreferenciada, y a las municipalidades gestionar eficientemente estos reportes asignándolos a las cuadrillas correspondientes.

## Características Principales

### Módulo Ciudadano
- Registro de reportes con fotos y geolocalización GPS
- Seguimiento del estado de reportes (pendiente, en proceso, resuelto)
- Notificaciones de actualizaciones
- Detección de duplicados por ubicación/tipo

### Portal Municipal
- Dashboard con KPIs y métricas
- Gestión y clasificación de reportes
- Asignación automática/manual de cuadrillas
- Analíticas con gráficos y mapas de calor
- Exportación de reportes (PDF/Excel)

### App Cuadrilla
- Lista de tareas asignadas
- Rutas optimizadas de trabajo
- Reporte de finalización con evidencia fotográfica
- Soporte offline básico

## Actores del Sistema

1. **Ciudadano**: Reporta incidentes y hace seguimiento
2. **Municipalidad**: Gestiona, prioriza y asigna cuadrillas
3. **Cuadrilla**: Ejecuta reparaciones y reporta evidencia

## Tecnologías Utilizadas

- **Frontend**: React 18, Vite, Tailwind CSS
- **Mapas**: Leaflet + React-Leaflet
- **Gráficos**: Recharts
- **Exportación**: jsPDF, XLSX
- **Iconos**: Lucide React
- **Enrutamiento**: React Router v6

## Instalación

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Construir para producción
npm run build
```

## Credenciales de Demostración

### Ciudadano
- Email: `juan@email.com`
- Contraseña: `123456`

### Municipalidad
- Email: `admin@municipalidad.gob`
- Contraseña: `admin123`

### Cuadrilla
- Email: `cuadrilla.norte@servicios.gob`
- Contraseña: `cuadrilla123`

## Estructura del Proyecto

```
src/
├── components/          # Componentes reutilizables
│   ├── Layout.jsx
│   ├── MapComponent.jsx
│   ├── StatusBadge.jsx
│   ├── PriorityBadge.jsx
│   └── ReportCard.jsx
├── contexts/            # Contextos de React
│   ├── AuthContext.jsx  # Autenticación
│   └── DataContext.jsx  # Datos y estado global
├── data/                # Datos mock y utilidades
│   └── mockData.js
├── hooks/               # Hooks personalizados
│   ├── useGeolocation.js
│   └── useOffline.js
├── pages/               # Páginas por rol
│   ├── Login.jsx
│   ├── Register.jsx
│   ├── NotFound.jsx
│   ├── ciudadano/
│   ├── municipalidad/
│   └── cuadrilla/
├── utils/               # Utilidades
│   └── storage.js
├── App.jsx              # Configuración de rutas
├── main.jsx             # Punto de entrada
└── index.css            # Estilos globales
```

## Casos de Uso Implementados

### CU01 - Reporte de incidente urbano
- Formulario con captura de fotos
- Geolocalización automática (GPS) con opción manual
- Validación de campos obligatorios
- Detección de duplicados (mismo tipo + ubicación cercana)

### CU02 - Clasificación y priorización
- Tablero con reportes ordenados por prioridad automática
- Capacidad de modificar prioridad manualmente
- Filtrado por categoría y urgencia

### CU03 - Gestión de despliegue
- Asignación automática según especialidad y zona de cuadrilla
- Generación de lista de trabajo diaria con rutas optimizadas

### CU04 - Resolución y seguimiento
- Cuadrilla sube foto de evidencia al completar
- Cambio de estado a "Resuelto"
- Notificación automática al ciudadano

### CU05 - Administración y analítica
- Dashboard con KPIs (tiempo promedio resolución, reportes por zona, estados)
- Mapas de calor de concentración de problemas
- Filtros por fecha, tipo, estado
- Exportación PDF/Excel

## Almacenamiento de Datos

La aplicación utiliza `localStorage` para persistencia de datos:
- `ltc_reports`: Reportes de incidentes
- `ltc_notifications`: Notificaciones de usuarios
- `ltc_user`: Usuario autenticado
- `ltc_pending_actions`: Acciones pendientes para sincronización offline

## Consideraciones Técnicas

- **Mobile-first**: Diseño responsive optimizado para móviles
- **Offline-first**: Funcionalidad básica sin conexión
- **Accesibilidad**: Componentes con ARIA labels y navegación por teclado
- **Performance**: Lazy loading y code splitting automático con Vite

## Próximas Mejoras

- Integración con backend real (API REST/GraphQL)
- Autenticación con JWT
- Mapas de calor interactivos con Leaflet
- Notificaciones push en tiempo real
- Sistema de comentarios en reportes

## Licencia

Proyecto desarrollado con fines educativos.
