import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { useGeolocation } from '../../hooks/useGeolocation';
import { calculateDistance } from '../../data/mockData';
import StatusBadge from '../../components/StatusBadge';
import PriorityBadge from '../../components/PriorityBadge';
import {
  MapPin,
  Navigation,
  Clock,
  Compass,
  ArrowRight,
  TrendingUp,
  RefreshCw,
  Sparkles,
  CheckCircle,
  AlertCircle,
  X,
  ChevronRight,
  Map as MapIcon,
  Play,
  Briefcase
} from 'lucide-react';

// Fix for default Leaflet marker assets in React environment
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Component to dynamically fit map view bounds based on current markers
function ChangeView({ bounds }) {
  const map = useMap();
  useEffect(() => {
    if (bounds && bounds.length > 0) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }
  }, [bounds, map]);
  return null;
}

// Custom pulsing location marker for the user
const userLocationIcon = L.divIcon({
  html: `
    <div class="relative flex items-center justify-center" style="width: 32px; height: 32px;">
      <span class="absolute inline-flex h-8 w-8 animate-ping rounded-full bg-primary-400 opacity-60"></span>
      <div class="relative rounded-full h-6 w-6 bg-primary-600 border-2 border-white shadow-lg flex items-center justify-center">
        <svg class="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
        </svg>
      </div>
    </div>
  `,
  className: 'user-location-marker',
  iconSize: [32, 32],
  iconAnchor: [16, 16]
});

// Helper to generate custom numbered priority-colored pins
const createNumberedIcon = (number, priority, isActive) => {
  let color = '#3b82f6'; // default baja
  if (priority === 'critica') color = '#a855f7'; // Purple
  else if (priority === 'alta') color = '#ef4444'; // Red
  else if (priority === 'media') color = '#f97316'; // Orange

  const activeClass = isActive ? 'scale-125 ring-4 ring-offset-2 ring-primary-500 z-[1000]' : 'hover:scale-110 z-10';
  const transitionClass = 'transition-all duration-300 ease-out';

  return L.divIcon({
    html: `
      <div class="relative flex items-center justify-center ${activeClass} ${transitionClass}" style="width: 36px; height: 36px;">
        <svg class="w-9 h-9 filter drop-shadow-md" viewBox="0 0 24 24" fill="${color}" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
          <circle cx="12" cy="9" r="6" fill="white" />
        </svg>
        <span class="absolute text-xs font-black text-gray-900" style="top: 8px; left: 50%; transform: translateX(-50%);">${number}</span>
        ${isActive ? '<span class="absolute -top-1 -right-1 flex h-3 w-3"><span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span><span class="relative inline-flex rounded-full h-3 w-3 bg-primary-500"></span></span>' : ''}
      </div>
    `,
    className: 'custom-numbered-marker',
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36]
  });
};

const DEFAULT_CENTER = { lat: -34.6037, lng: -58.3816 }; // Buenos Aires centro

const CuadrillaRouteMap = () => {
  const { user } = useAuth();
  const { getCuadrillaReports, reports, assignReport, createReport, createNotification } = useData();
  const geo = useGeolocation();
  
  const [tasks, setTasks] = useState([]);
  const [optimizationMode, setOptimizationMode] = useState('prioridad'); // 'prioridad' or 'distancia'
  const [activeTaskId, setActiveTaskId] = useState(null);
  const [viewMode, setViewMode] = useState('map'); // mobile view: 'map' or 'list'
  const [simulating, setSimulating] = useState(false);
  const [toast, setToast] = useState(null);

  // Get current user location, try to fetch it dynamically
  useEffect(() => {
    geo.getCurrentPosition().catch(() => {
      // Permission denied or error, falls back automatically
    });
  }, [geo.getCurrentPosition]);

  // Determine effective starting location
  const startLocation = useMemo(() => {
    if (geo.location) {
      return { lat: geo.location.lat, lng: geo.location.lng };
    }
    // Fallback: Buenos Aires central region if geolocation is not available
    return DEFAULT_CENTER;
  }, [geo.location]);

  // Load and refresh crew reports
  const loadReports = useCallback(() => {
    const list = getCuadrillaReports(user.id);
    setTasks(list);
  }, [user.id, getCuadrillaReports, reports]); // triggers update when context reports change

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  // Route Optimization Algorithm
  const optimizedRoute = useMemo(() => {
    if (tasks.length === 0) return [];
    
    const unvisited = [...tasks];
    const route = [];
    let currentLoc = startLocation;

    if (optimizationMode === 'distancia') {
      // Nearest Neighbor Route (Pure shortest distance)
      while (unvisited.length > 0) {
        let nearestIdx = 0;
        let minDistance = Infinity;
        
        for (let i = 0; i < unvisited.length; i++) {
          const d = calculateDistance(currentLoc, unvisited[i].location);
          if (d < minDistance) {
            minDistance = d;
            nearestIdx = i;
          }
        }
        
        const nextTask = unvisited.splice(nearestIdx, 1)[0];
        route.push(nextTask);
        currentLoc = nextTask.location;
      }
    } else {
      // Priority + Distance Route (Sort critical and high priorities first, nearest neighbor within each)
      const groups = { critica: [], alta: [], media: [], baja: [] };
      unvisited.forEach(t => {
        const p = t.priority || 'media';
        groups[p] = groups[p] || [];
        groups[p].push(t);
      });

      const priorityKeys = ['critica', 'alta', 'media', 'baja'];
      priorityKeys.forEach(p => {
        const groupTasks = groups[p];
        while (groupTasks.length > 0) {
          let nearestIdx = 0;
          let minDistance = Infinity;
          
          for (let i = 0; i < groupTasks.length; i++) {
            const d = calculateDistance(currentLoc, groupTasks[i].location);
            if (d < minDistance) {
              minDistance = d;
              nearestIdx = i;
            }
          }
          
          const nextTask = groupTasks.splice(nearestIdx, 1)[0];
          route.push(nextTask);
          currentLoc = nextTask.location;
        }
      });
    }

    return route;
  }, [tasks, startLocation, optimizationMode]);

  // Calculate detailed route segments (legs)
  const routeLegs = useMemo(() => {
    if (optimizedRoute.length === 0 || !startLocation) return [];
    
    const legs = [];
    let prevLoc = startLocation;
    
    optimizedRoute.forEach((task, index) => {
      const dist = calculateDistance(prevLoc, task.location);
      // Assuming avg urban speed of 30 km/h
      // Time in minutes = (distance / 30) * 60 = distance * 2.5
      const durationMins = Math.max(1, Math.round(dist * 2.5)); 
      
      legs.push({
        legIndex: index,
        fromName: index === 0 ? 'Mi ubicación' : `Tarea ${index}: ${optimizedRoute[index - 1].typeName}`,
        toName: `Tarea ${index + 1}: ${task.typeName}`,
        distance: dist,
        duration: durationMins,
        taskId: task.id
      });
      prevLoc = task.location;
    });
    
    return legs;
  }, [startLocation, optimizedRoute]);

  // Calculate route totals
  const routeTotals = useMemo(() => {
    const totalDist = routeLegs.reduce((sum, leg) => sum + leg.distance, 0);
    const totalTime = routeLegs.reduce((sum, leg) => sum + leg.duration, 0);
    return {
      distance: totalDist.toFixed(1),
      duration: totalTime
    };
  }, [routeLegs]);

  // Polyline positions array
  const polylinePositions = useMemo(() => {
    const coords = [[startLocation.lat, startLocation.lng]];
    optimizedRoute.forEach(task => {
      coords.push([task.location.lat, task.location.lng]);
    });
    return coords;
  }, [startLocation, optimizedRoute]);

  // Bounding box mapping for Leaflet ChangeView
  const mapBounds = useMemo(() => {
    const points = [[startLocation.lat, startLocation.lng]];
    optimizedRoute.forEach(task => {
      points.push([task.location.lat, task.location.lng]);
    });
    return points;
  }, [startLocation, optimizedRoute]);

  // Simulated Dispatch System
  const handleSimulateNewAssignment = async () => {
    setSimulating(true);
    
    // Simulating delay for dispatch
    await new Promise(resolve => setTimeout(resolve, 1200));

    // Find unassigned pending reports in the data context
    const available = reports.filter(r => r.status === 'pendiente' && !r.assignedTo);
    
    let targetReport = null;

    if (available.length > 0) {
      // Pick one randomly
      const randomIdx = Math.floor(Math.random() * available.length);
      targetReport = available[randomIdx];
      
      // Update report status
      assignReport(targetReport.id, user.id);
      
      // Create notification
      createNotification({
        userId: user.id,
        reportId: targetReport.id,
        type: 'assigned',
        title: '¡Nueva Tarea Asignada!',
        message: `Se te ha asignado el reporte "${targetReport.typeName}" en ${targetReport.address}.`,
        read: false
      });
    } else {
      // Generate a brand new simulation report in the Buenos Aires scope
      const streets = ['Av. de Mayo', 'Calle Defensa', 'Av. Callao', 'Av. Las Heras', 'Calle Balcarce', 'Av. Paseo Colón'];
      const randomStreet = streets[Math.floor(Math.random() * streets.length)];
      const randomNum = Math.floor(Math.random() * 1500) + 100;
      
      const offsetLat = (Math.random() - 0.5) * 0.03;
      const offsetLng = (Math.random() - 0.5) * 0.03;
      
      const types = [
        { id: 'bache', name: 'Bache en calle', category: 'infraestructura' },
        { id: 'luminaria', name: 'Luminaria apagada/dañada', category: 'servicios' },
        { id: 'basura', name: 'Acumulación de basura', category: 'limpieza' },
        { id: 'alcantarilla', name: 'Alcantarilla tapada', category: 'servicios' }
      ];
      const selectedType = types[Math.floor(Math.random() * types.length)];
      const priorities = ['media', 'alta', 'critica'];
      const selectedPriority = priorities[Math.floor(Math.random() * priorities.length)];

      const newReportData = {
        userId: 'user-2',
        type: selectedType.id,
        typeName: selectedType.name,
        category: selectedType.category,
        description: `Simulado: Incidencia de ${selectedType.name.toLowerCase()} reportada recientemente durante la jornada.`,
        address: `${randomStreet} ${randomNum}, Buenos Aires`,
        location: {
          lat: startLocation.lat + offsetLat,
          lng: startLocation.lng + offsetLng
        },
        priority: selectedPriority,
        photos: []
      };

      try {
        const created = await createReport(newReportData);
        targetReport = created;
        assignReport(created.id, user.id);
        
        createNotification({
          userId: user.id,
          reportId: created.id,
          type: 'assigned',
          title: '¡Nueva Tarea Asignada!',
          message: `Se te ha asignado el reporte "${created.typeName}" en ${created.address}.`,
          read: false
        });
      } catch (e) {
        console.error('Failed to create mock report', e);
      }
    }

    if (targetReport) {
      // Trigger Toast notification
      setToast({
        title: 'Nueva Tarea Asignada',
        message: `Se ha añadido "${targetReport.typeName}" a tu jornada.`,
        address: targetReport.address,
        priority: targetReport.priority
      });

      // Clear toast after 5s
      setTimeout(() => setToast(null), 5000);
    }
    
    setSimulating(false);
  };

  const getTypeIcon = (type) => {
    const icons = {
      'bache': '🛣️',
      'luminaria': '💡',
      'basura': '🗑️',
      'arbol': '🌳',
      'alcantarilla': '🕳️',
      'vereda': '🚶',
      'senalizacion': '🚦',
      'plaga': '🐛',
      'agua': '💧',
      'otro': '📋'
    };
    return icons[type] || '📋';
  };

  return (
    <div className="space-y-6 animate-fade-in relative min-h-[calc(100vh-140px)]">
      
      {/* Toast Notification Container */}
      {toast && (
        <div className="fixed bottom-4 right-4 left-4 sm:left-auto sm:w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-[9999] overflow-hidden animate-slide-up">
          <div className="p-4 flex items-start gap-3">
            <div className="p-2 bg-primary-100 text-primary-600 rounded-lg">
              <Sparkles size={20} className="animate-spin" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-gray-900 text-sm">{toast.title}</h4>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold capitalize ${
                  toast.priority === 'critica' ? 'bg-purple-100 text-purple-700' :
                  toast.priority === 'alta' ? 'bg-red-100 text-red-700' :
                  toast.priority === 'media' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-700'
                }`}>
                  {toast.priority}
                </span>
              </div>
              <p className="text-xs text-gray-700 mt-1">{toast.message}</p>
              <div className="flex items-center gap-1 mt-2 text-[10px] text-gray-500">
                <MapPin size={10} />
                <span className="truncate">{toast.address}</span>
              </div>
            </div>
            <button onClick={() => setToast(null)} className="text-gray-400 hover:text-gray-600 transition-colors">
              <X size={16} />
            </button>
          </div>
          <div className="h-1 bg-primary-600 animate-[shrink_5s_linear]" style={{ transformOrigin: 'left' }}></div>
        </div>
      )}

      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <Compass className="text-primary-600" size={26} />
            Optimización de Rutas
          </h1>
          <p className="text-gray-600 text-sm">Visualización e itinerario eficiente de tareas asignadas</p>
        </div>
        
        {/* Mobile View Toggle */}
        <div className="flex md:hidden bg-gray-200 p-1 rounded-lg w-full sm:w-auto font-sans">
          <button
            onClick={() => setViewMode('map')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-md text-xs font-semibold transition-all ${
              viewMode === 'map' ? 'bg-white text-gray-900 shadow' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <MapIcon size={14} />
            Mapa
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-md text-xs font-semibold transition-all ${
              viewMode === 'list' ? 'bg-white text-gray-900 shadow' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Navigation size={14} />
            Itinerario ({tasks.length})
          </button>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left/Middle: Map Canvas */}
        <div className={`lg:col-span-2 rounded-2xl overflow-hidden border border-gray-200 shadow-sm flex flex-col min-h-[450px] lg:h-[650px] bg-white ${
          viewMode === 'map' ? 'block' : 'hidden lg:flex'
        }`}>
          {/* Map Controls Header */}
          <div className="p-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3 bg-gray-50/50">
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs font-semibold text-gray-700">Actualización en tiempo real</span>
            </div>

            {/* Optimization Toggle */}
            <div className="flex bg-white p-1 rounded-lg border border-gray-200 text-xs font-sans">
              <button
                onClick={() => setOptimizationMode('prioridad')}
                className={`px-3 py-1.5 rounded-md font-semibold transition-all flex items-center gap-1.5 ${
                  optimizationMode === 'prioridad'
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                title="Ordena por nivel de prioridad (críticas primero) y cercanía"
              >
                <TrendingUp size={12} />
                Prioridad + Proximidad
              </button>
              <button
                onClick={() => setOptimizationMode('distancia')}
                className={`px-3 py-1.5 rounded-md font-semibold transition-all flex items-center gap-1.5 ${
                  optimizationMode === 'distancia'
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                title="Minimiza la distancia absoluta recorrida"
              >
                <Navigation size={12} />
                Cercanía Simple
              </button>
            </div>
          </div>

          {/* Leaflet Map */}
          <div className="flex-1 relative z-0">
            <MapContainer
              center={startLocation}
              zoom={13}
              style={{ height: '100%', width: '100%' }}
              className="z-0"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {/* User Pulsing Marker */}
              <Marker position={[startLocation.lat, startLocation.lng]} icon={userLocationIcon}>
                <Popup>
                  <div className="text-center font-semibold text-xs text-primary-700">Mi posición actual</div>
                </Popup>
              </Marker>

              {/* Task Markers */}
              {optimizedRoute.map((task, index) => (
                <Marker
                  key={task.id}
                  position={[task.location.lat, task.location.lng]}
                  icon={createNumberedIcon(index + 1, task.priority, activeTaskId === task.id)}
                  eventHandlers={{
                    click: () => setActiveTaskId(task.id),
                    mouseover: () => setActiveTaskId(task.id)
                  }}
                >
                  <Popup className="custom-popup">
                    <div className="p-1 space-y-2 max-w-[200px]">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xl">{getTypeIcon(task.type)}</span>
                        <h4 className="font-bold text-gray-900 text-xs truncate leading-tight">{task.typeName}</h4>
                      </div>
                      <p className="text-[10px] text-gray-600 line-clamp-2 leading-normal">{task.description}</p>
                      <div className="flex items-center gap-1 text-[9px] text-gray-500 font-medium">
                        <MapPin size={10} />
                        <span className="truncate">{task.address.split(',')[0]}</span>
                      </div>
                      <div className="flex flex-wrap gap-1 pt-1">
                        <StatusBadge status={task.status} size="sm" />
                        <PriorityBadge priority={task.priority} size="sm" />
                      </div>
                      <Link
                        to={`/cuadrilla/tarea/${task.id}`}
                        className="block w-full py-1.5 text-center bg-primary-600 hover:bg-primary-700 text-white rounded text-[10px] font-bold transition-all shadow-sm"
                      >
                        Ver Detalles
                      </Link>
                    </div>
                  </Popup>
                </Marker>
              ))}

              {/* Routing Path Polyline */}
              {polylinePositions.length > 1 && (
                <Polyline
                  positions={polylinePositions}
                  color="#2563eb"
                  weight={4}
                  opacity={0.8}
                  dashArray="8, 12"
                />
              )}

              {/* Center Map View component */}
              <ChangeView bounds={mapBounds} />
            </MapContainer>

            {/* Map floating controls */}
            {geo.error && (
              <div className="absolute top-2 right-2 bg-yellow-50 border border-yellow-200 text-yellow-800 text-[10px] px-2 py-1 rounded shadow-sm flex items-center gap-1 z-[1000] max-w-[200px]">
                <AlertCircle size={12} className="flex-shrink-0" />
                <span>Geolocalización: {geo.error}. Usando fallback.</span>
              </div>
            )}
          </div>
        </div>

        {/* Right side: Itinerary details */}
        <div className={`space-y-6 ${viewMode === 'list' ? 'block' : 'hidden lg:block'}`}>
          
          {/* Quick Route Summary Card */}
          <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl p-5 text-white shadow-md">
            <h3 className="font-bold text-sm text-primary-100 flex items-center gap-1.5 mb-3">
              <Compass size={16} /> Resumen de Ruta Diaria
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
                <p className="text-[10px] text-primary-200 font-medium font-sans">Recorrido Total</p>
                <p className="text-xl font-black mt-1">
                  {routeTotals.distance} <span className="text-xs font-normal">km</span>
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
                <p className="text-[10px] text-primary-200 font-medium font-sans">Traslado Estimado</p>
                <p className="text-xl font-black mt-1">
                  ~{routeTotals.duration} <span className="text-xs font-normal">min</span>
                </p>
              </div>
            </div>
            
            <div className="flex items-center justify-between text-xs text-primary-100 mt-4 pt-3 border-t border-white/20">
              <span>Tareas Pendientes</span>
              <span className="px-2 py-0.5 bg-white text-primary-700 rounded-full font-bold">{tasks.length}</span>
            </div>
          </div>

          {/* List of Tasks sorted by optimized route */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm flex flex-col max-h-[500px]">
            <div className="p-4 border-b border-gray-100 bg-gray-50/50 rounded-t-2xl flex items-center justify-between">
              <h3 className="font-black text-gray-900 text-sm flex items-center gap-2">
                <Briefcase size={16} className="text-gray-500" />
                Itinerario de Visitas
              </h3>
              <span className="text-[10px] text-gray-500 font-semibold capitalize bg-gray-100 px-2 py-0.5 rounded-full">
                Modo: {optimizationMode === 'prioridad' ? 'Priorizado' : 'Distancia'}
              </span>
            </div>

            <div className="p-4 overflow-y-auto space-y-4 flex-1">
              {optimizedRoute.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-2 border border-gray-200">
                    <CheckCircle className="text-emerald-500" size={20} />
                  </div>
                  <h4 className="font-bold text-gray-800 text-sm">¡Sin tareas pendientes!</h4>
                  <p className="text-xs text-gray-500 mt-1 font-sans">Todas las tareas asignadas se encuentran resueltas.</p>
                </div>
              ) : (
                optimizedRoute.map((task, index) => {
                  const isActive = activeTaskId === task.id;
                  const leg = routeLegs[index];
                  
                  return (
                    <div key={task.id} className="relative group">
                      
                      {/* Connector Line for route steps */}
                      {index < optimizedRoute.length && leg && (
                        <div className="absolute left-4 top-10 bottom-0 w-0.5 bg-gray-200 -mb-6 z-0 group-last:hidden">
                          <div className="absolute left-2 top-[30%] -translate-y-1/2 bg-blue-50 border border-blue-200 text-blue-700 text-[9px] font-bold px-1.5 py-0.5 rounded-full whitespace-nowrap z-10 flex items-center gap-1 shadow-sm font-sans">
                            <Clock size={8} /> {leg.duration} min ({leg.distance.toFixed(2)} km)
                          </div>
                        </div>
                      )}

                      {/* Itinerary Step Card */}
                      <div
                        onMouseEnter={() => setActiveTaskId(task.id)}
                        className={`relative z-10 bg-white rounded-xl border p-3 transition-all duration-300 ${
                          isActive
                            ? 'border-primary-400 shadow-md ring-2 ring-primary-100'
                            : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          {/* Order Number Indicator */}
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 text-white shadow-sm transition-all ${
                            task.priority === 'critica' ? 'bg-purple-600 ring-2 ring-purple-100' :
                            task.priority === 'alta' ? 'bg-red-500 ring-2 ring-red-100' :
                            task.priority === 'media' ? 'bg-orange-500 ring-2 ring-orange-100' : 'bg-blue-500 ring-2 ring-blue-100'
                          }`}>
                            {index + 1}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <h4 className="font-bold text-gray-900 text-xs truncate">
                                {getTypeIcon(task.type)} {task.typeName}
                              </h4>
                              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase ${
                                task.priority === 'critica' ? 'bg-purple-100 text-purple-700' :
                                task.priority === 'alta' ? 'bg-red-500/10 text-red-700' :
                                task.priority === 'media' ? 'bg-orange-500/10 text-orange-700' : 'bg-blue-500/10 text-blue-700'
                              }`}>
                                {task.priority}
                              </span>
                            </div>

                            <p className="text-[10px] text-gray-600 line-clamp-1 mt-1 font-medium">{task.address.split(',')[0]}</p>
                            <p className="text-[10px] text-gray-500 line-clamp-2 mt-1 leading-normal">{task.description}</p>
                            
                            <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-gray-100">
                              <span className="text-[9px] text-gray-400 font-semibold uppercase">ID: {task.id}</span>
                              <Link
                                to={`/cuadrilla/tarea/${task.id}`}
                                className="flex items-center gap-0.5 text-[10px] font-bold text-primary-600 hover:text-primary-700 transition-colors"
                              >
                                Atender
                                <ChevronRight size={10} />
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Spacer to give room for the transit label */}
                      <div className="h-6"></div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Simulator Panel (Premium styled test panel) */}
          <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 shadow-xl relative overflow-hidden">
            <div className="absolute -right-10 -bottom-10 opacity-10 text-white">
              <Sparkles size={120} />
            </div>
            
            <h3 className="font-bold text-sm flex items-center gap-1.5 mb-2 text-primary-300">
              <Compass className="animate-spin-slow" size={16} />
              Simulador de Despacho
            </h3>
            <p className="text-xs text-slate-300 mb-4 leading-normal font-sans">
              Simula la asignación y recepción en tiempo real de nuevas incidencias reportadas en tu zona de cobertura.
            </p>

            <button
              onClick={handleSimulateNewAssignment}
              disabled={simulating}
              className="w-full py-3 bg-primary-600 hover:bg-primary-700 active:bg-primary-800 disabled:opacity-50 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-primary-900/20 font-sans"
            >
              {simulating ? (
                <>
                  <RefreshCw className="animate-spin" size={14} />
                  <span>Despachando Tarea...</span>
                </>
              ) : (
                <>
                  <Play size={12} fill="currentColor" />
                  <span>Simular Nueva Tarea en Jornada</span>
                </>
              )}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CuadrillaRouteMap;
