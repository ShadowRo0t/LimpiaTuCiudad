# APIs Utilizadas en LimpiaTuCiudad

## 1. Backend API (REST propia)

**Ubicación:** `backend/cmd/api/main.go`

**Base:** Go + Chi - Framework HTTP ligero para construir APIs REST.

**Endpoints disponibles:**

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/health` | Health check - Verifica el estado del servidor |
| GET | `/api` | Información general de la API (versión, endpoints disponibles) |

**Dependencias:**
- `go-chi/chi/v5` - Enrutador HTTP
- `go.mongodb.org/mongo-driver` - Driver de MongoDB

**Puerto:** 3000 (o el definido en `HTTP_ADDR`)

---

## 2. OpenStreetMap Tiles API

**Ubicación:** `frontend/src/components/MapComponent.jsx`

**Base:** OpenStreetMap (OSM) - Servicio de mapas open-source.

**URL de tiles:**
```
https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png
```

**Uso:** Visualización de mapas interactivos para seleccionar ubicaciones de reportes.

**Dependencias:**
- `leaflet` ^1.9.4 - Librería de mapas JavaScript
- `react-leaflet` ^4.2.1 - Wrapper de React para Leaflet

**Íconos de Leaflet:**
- CDN: `https://unpkg.com/leaflet@1.9.4/dist/images/`

---

## 3. Geolocation API (Navegador)

**Ubicación:** `frontend/src/hooks/useGeolocation.js`

**Base:** API nativa del navegador (`navigator.geolocation`).

**Métodos utilizados:**
- `navigator.geolocation.getCurrentPosition()` - Obtiene la posición actual del usuario

**Opciones:**
- `enableHighAccuracy: true` - Alta precisión
- `timeout: 10000` - Timeout de 10 segundos
- `maximumAge: 0` - No usar caché

**Casos de error manejados:**
- `PERMISSION_DENIED` - Permiso denegado
- `POSITION_UNAVAILABLE` - Información no disponible
- `TIMEOUT` - Tiempo de espera agotado

---

## 4. localStorage API (Navegador)

**Ubicaciones:**
- `frontend/src/contexts/AuthContext.jsx`
- `frontend/src/contexts/DataContext.jsx`

**Base:** Web Storage API nativa del navegador.

**Claves utilizadas:**
- `ltc_user` - Almacena datos del usuario autenticado
- `ltc_reports` - Almacena reportes generados
- `ltc_notifications` - Almacena notificaciones del sistema

**Uso:** Persistencia de datos en el navegador (simulación de base de datos local).

---

## 5. jsPDF API

**Ubicación:** Utilizada en reportes de municipalidad

**Base:** Librería JavaScript para generar documentos PDF en el cliente.

**Dependencias:**
- `jspdf` ^2.5.1 - Generador de PDFs
- `jspdf-autotable` ^3.8.2 - Extensión para tablas en PDFs

**Uso típico:**
```javascript
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

const doc = new jsPDF();
doc.autoTable({ /* configuración */ });
doc.save('reporte.pdf');
```

---

## 6. SheetJS (xlsx) API

**Ubicación:** Utilizada en exportación de datos

**Base:** Librería JavaScript para leer y escribir archivos Excel.

**Dependencia:** `xlsx` ^0.18.5

**Uso:** Exportación de reportes y datos a formato Excel (.xlsx).

---

## 7. Recharts API

**Ubicación:** `frontend/src/pages/municipalidad/Analytics.jsx`

**Base:** Librería de gráficos basada en React y D3.js.

**Dependencia:** `recharts` ^2.12.7

**Componentes utilizados:**
- Gráficos de barras, líneas, pastel
- Dashboard de analytics para la municipalidad

---

## 8. React Router API

**Ubicación:** Navegación entre páginas

**Base:** Librería de enrutamiento para React.

**Dependencia:** `react-router-dom` ^6.26.0

**Uso:** Navegación SPA (Single Page Application) entre:
- `/login` - Login
- `/register` - Registro
- `/ciudadano/*` - Panel de ciudadano
- `/municipalidad/*` - Panel de municipalidad
- `/cuadrilla/*` - Panel de cuadrilla

---

## Resumen de Dependencias

### Frontend
```json
{
  "react": "^18.3.1",
  "react-dom": "^18.3.1",
  "react-router-dom": "^6.26.0",
  "leaflet": "^1.9.4",
  "react-leaflet": "^4.2.1",
  "recharts": "^2.12.7",
  "jspdf": "^2.5.1",
  "jspdf-autotable": "^3.8.2",
  "xlsx": "^0.18.5",
  "date-fns": "^3.6.0",
  "lucide-react": "^0.436.0",
  "clsx": "^2.1.1"
}
```

### Backend
```go
require (
	github.com/go-chi/chi/v5 v5.1.0
	github.com/golang-jwt/jwt/v5 v5.2.1
	go.mongodb.org/mongo-driver v1.16.1
	golang.org/x/crypto v0.26.0
)
```

---

## Notas

- **No se utilizan APIs de terceros con autenticación** (como Google Maps API, AWS, etc.) en la versión actual.
- Los datos se almacenan localmente mediante `localStorage` (modo simulación).
- El backend en Go tiene endpoints mínimos en la versión actual; la lógica principal está en el frontend con datos mock.
- Los mapas utilizan OpenStreetMap que es gratuito y no requiere API key para uso básico.
