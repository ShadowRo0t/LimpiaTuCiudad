// Datos mock para desarrollo y demostración

export const mockUsers = [
  {
    id: 'user-1',
    name: 'Juan Pérez',
    email: 'juan@email.com',
    password: '123456',
    role: 'ciudadano',
    phone: '+54 9 11 1234-5678',
    createdAt: '2024-01-15'
  },
  {
    id: 'user-2',
    name: 'María García',
    email: 'maria@email.com',
    password: '123456',
    role: 'ciudadano',
    phone: '+54 9 11 8765-4321',
    createdAt: '2024-02-20'
  },
  {
    id: 'admin-1',
    name: 'Carlos Municipal',
    email: 'admin@municipalidad.gob',
    password: 'admin123',
    role: 'municipalidad',
    department: 'Gestión Urbana',
    createdAt: '2024-01-01'
  },
  {
    id: 'cuadrilla-1',
    name: 'Cuadrilla Norte',
    email: 'cuadrilla.norte@servicios.gob',
    password: 'cuadrilla123',
    role: 'cuadrilla',
    specialty: 'infraestructura',
    zone: 'Norte',
    members: 4,
    createdAt: '2024-01-05'
  },
  {
    id: 'cuadrilla-2',
    name: 'Cuadrilla Sur',
    email: 'cuadrilla.sur@servicios.gob',
    password: 'cuadrilla123',
    role: 'cuadrilla',
    specialty: 'servicios',
    zone: 'Sur',
    members: 3,
    createdAt: '2024-01-05'
  },
  {
    id: 'cuadrilla-3',
    name: 'Cuadrilla Centro',
    email: 'cuadrilla.centro@servicios.gob',
    password: 'cuadrilla123',
    role: 'cuadrilla',
    specialty: 'limpieza',
    zone: 'Centro',
    members: 5,
    createdAt: '2024-01-05'
  }
];

export const incidentTypes = [
  { id: 'bache', name: 'Bache en calle', category: 'infraestructura', icon: 'road' },
  { id: 'luminaria', name: 'Luminaria apagada/dañada', category: 'servicios', icon: 'lightbulb' },
  { id: 'basura', name: 'Acumulación de basura', category: 'limpieza', icon: 'trash' },
  { id: 'arbol', name: 'Árbol caído/peligroso', category: 'espacios_verdes', icon: 'tree' },
  { id: 'alcantarilla', name: 'Alcantarilla tapada', category: 'servicios', icon: 'droplet' },
  { id: 'vereda', name: 'Vereda dañada', category: 'infraestructura', icon: 'path' },
  { id: 'senalizacion', name: 'Señalización dañada', category: 'infraestructura', icon: 'sign' },
  { id: 'plaga', name: 'Plaga/insectos', category: 'salud', icon: 'bug' },
  { id: 'agua', name: 'Fuga de agua', category: 'servicios', icon: 'droplets' },
  { id: 'otro', name: 'Otro', category: 'otros', icon: 'alert-circle' }
];

export const mockReports = [
  {
    id: 'rep-001',
    userId: 'user-1',
    type: 'bache',
    typeName: 'Bache en calle',
    category: 'infraestructura',
    description: 'Bache grande que está dañando vehículos en la esquina',
    address: 'Av. Corrientes 1500, Buenos Aires',
    location: { lat: -34.6037, lng: -58.3816 },
    photos: ['photo1.jpg'],
    status: 'pendiente',
    priority: 'media',
    assignedTo: null,
    createdAt: '2024-03-15T10:30:00',
    updatedAt: '2024-03-15T10:30:00',
    resolvedAt: null,
    isDuplicate: false
  },
  {
    id: 'rep-002',
    userId: 'user-2',
    type: 'luminaria',
    typeName: 'Luminaria apagada/dañada',
    category: 'servicios',
    description: 'Tres luminarias apagadas desde hace una semana, zona oscura',
    address: 'Calle Florida 800, Buenos Aires',
    location: { lat: -34.5998, lng: -58.3745 },
    photos: ['photo2.jpg'],
    status: 'en-proceso',
    priority: 'alta',
    assignedTo: 'cuadrilla-1',
    createdAt: '2024-03-14T08:15:00',
    updatedAt: '2024-03-16T14:00:00',
    resolvedAt: null,
    isDuplicate: false
  },
  {
    id: 'rep-003',
    userId: 'user-1',
    type: 'basura',
    typeName: 'Acumulación de basura',
    category: 'limpieza',
    description: 'Acumulación de residuos sin recolectar por más de 5 días',
    address: 'Plaza San Martín, Buenos Aires',
    location: { lat: -34.5922, lng: -58.3756 },
    photos: ['photo3.jpg'],
    status: 'resuelto',
    priority: 'media',
    assignedTo: 'cuadrilla-3',
    createdAt: '2024-03-10T16:45:00',
    updatedAt: '2024-03-12T09:00:00',
    resolvedAt: '2024-03-12T09:00:00',
    resolutionPhotos: ['resolved1.jpg'],
    resolutionNotes: 'Se realizó limpieza completa del área',
    isDuplicate: false
  },
  {
    id: 'rep-004',
    userId: 'user-2',
    type: 'alcantarilla',
    typeName: 'Alcantarilla tapada',
    category: 'servicios',
    description: 'Alcantarilla tapada causando inundación en la vereda',
    address: 'Av. 9 de Julio 1200, Buenos Aires',
    location: { lat: -34.6088, lng: -58.3823 },
    photos: ['photo4.jpg'],
    status: 'en-proceso',
    priority: 'critica',
    assignedTo: 'cuadrilla-2',
    createdAt: '2024-03-16T07:00:00',
    updatedAt: '2024-03-16T08:30:00',
    resolvedAt: null,
    isDuplicate: false
  },
  {
    id: 'rep-005',
    userId: 'user-1',
    type: 'arbol',
    typeName: 'Árbol caído/peligroso',
    category: 'espacios_verdes',
    description: 'Rama grande a punto de caer sobre la vereda',
    address: 'Parque Lezama, Buenos Aires',
    location: { lat: -34.6456, lng: -58.3634 },
    photos: ['photo5.jpg'],
    status: 'pendiente',
    priority: 'alta',
    assignedTo: null,
    createdAt: '2024-03-16T11:20:00',
    updatedAt: '2024-03-16T11:20:00',
    resolvedAt: null,
    isDuplicate: false,
    aiAnalysis: {
      performed: true,
      hasFallenTree: true,
      dangerLevel: 'media',
      confidence: 0.88,
      reason: 'Se identificó una rama rota de tamaño mediano con peligro de colapso directo sobre la vereda peatonal. No se aprecian daños materiales ni de tendido eléctrico en la captura analizada.',
      treeSize: 'mediano',
      obstruction: 'bloqueo de vereda',
      damage: 'ninguno',
      objects: [
        { label: 'rama de árbol rota', confidence: 0.91, box: [25, 30, 65, 75] },
        { label: 'vereda bloqueada', confidence: 0.82, box: [40, 20, 85, 80] }
      ]
    }
  },
  {
    id: 'rep-006',
    userId: 'user-2',
    type: 'vereda',
    typeName: 'Vereda dañada',
    category: 'infraestructura',
    description: 'Baldosas rotas que representan peligro para peatones',
    address: 'Calle Lavalle 500, Buenos Aires',
    location: { lat: -34.6015, lng: -58.3762 },
    photos: ['photo6.jpg'],
    status: 'pendiente',
    priority: 'baja',
    assignedTo: null,
    createdAt: '2024-03-13T14:00:00',
    updatedAt: '2024-03-13T14:00:00',
    resolvedAt: null,
    isDuplicate: false
  },
  {
    id: 'rep-007',
    userId: 'user-1',
    type: 'agua',
    typeName: 'Fuga de agua',
    category: 'servicios',
    description: 'Fuga de agua visible en la vía pública',
    address: 'Av. Belgrano 700, Buenos Aires',
    location: { lat: -34.6089, lng: -58.3712 },
    photos: ['photo7.jpg'],
    status: 'resuelto',
    priority: 'alta',
    assignedTo: 'cuadrilla-2',
    createdAt: '2024-03-11T09:30:00',
    updatedAt: '2024-03-11T15:00:00',
    resolvedAt: '2024-03-11T15:00:00',
    resolutionPhotos: ['resolved2.jpg'],
    resolutionNotes: 'Reparada fuga en tubería principal',
    isDuplicate: false
  },
  {
    id: 'rep-008',
    userId: 'user-2',
    type: 'senalizacion',
    typeName: 'Señalización dañada',
    category: 'infraestructura',
    description: 'Semáforo sin funcionar en cruce peligroso',
    address: 'Av. Santa Fe y Callao, Buenos Aires',
    location: { lat: -34.5952, lng: -58.3931 },
    photos: ['photo8.jpg'],
    status: 'pendiente',
    priority: 'critica',
    assignedTo: null,
    createdAt: '2024-03-16T13:00:00',
    updatedAt: '2024-03-16T13:00:00',
    resolvedAt: null,
    isDuplicate: false
  }
];

export const mockNotifications = [
  {
    id: 'notif-001',
    userId: 'user-1',
    reportId: 'rep-001',
    type: 'status_change',
    title: 'Tu reporte ha sido recibido',
    message: 'El reporte "Bache en calle" ha sido registrado exitosamente.',
    read: false,
    createdAt: '2024-03-15T10:30:00'
  },
  {
    id: 'notif-002',
    userId: 'user-2',
    reportId: 'rep-002',
    type: 'assigned',
    title: 'Tu reporte está siendo atendido',
    message: 'Una cuadrilla ha sido asignada a tu reporte de "Luminaria apagada/dañada".',
    read: false,
    createdAt: '2024-03-16T14:00:00'
  },
  {
    id: 'notif-003',
    userId: 'user-1',
    reportId: 'rep-003',
    type: 'resolved',
    title: 'Tu reporte ha sido resuelto',
    message: 'El reporte "Acumulación de basura" ha sido solucionado exitosamente.',
    read: true,
    createdAt: '2024-03-12T09:00:00'
  }
];

// Funciones de utilidad para datos
export const calculatePriority = (type, description) => {
  const criticalTypes = ['agua', 'senalizacion', 'alcantarilla'];
  const highTypes = ['luminaria', 'arbol', 'plaga'];

  if (criticalTypes.includes(type)) return 'critica';
  if (highTypes.includes(type)) return 'alta';
  if (description?.toLowerCase().includes('urgente') || description?.toLowerCase().includes('peligro')) return 'alta';
  return 'media';
};

export const checkDuplicate = (reports, newReport, threshold = 0.001) => {
  // threshold ~ 100 metros
  return reports.some(report => {
    if (report.isDuplicate || report.status === 'resuelto') return false;
    if (report.type !== newReport.type) return false;

    const latDiff = Math.abs(report.location.lat - newReport.location.lat);
    const lngDiff = Math.abs(report.location.lng - newReport.location.lng);

    return latDiff < threshold && lngDiff < threshold;
  });
};

export const getReportsByZone = (reports, zone) => {
  // Simplificado: en producción usaría geocercas reales
  const zoneBounds = {
    'Norte': { latMin: -34.55, latMax: -34.58, lngMin: -58.50, lngMax: -58.40 },
    'Sur': { latMin: -34.65, latMax: -34.70, lngMin: -58.50, lngMax: -58.35 },
    'Centro': { latMin: -34.58, latMax: -34.65, lngMin: -58.40, lngMax: -58.35 }
  };

  const bounds = zoneBounds[zone];
  if (!bounds) return [];

  return reports.filter(r =>
    r.location.lat >= bounds.latMin && r.location.lat <= bounds.latMax &&
    r.location.lng >= bounds.lngMin && r.location.lng <= bounds.lngMax
  );
};

export const calculateDistance = (loc1, loc2) => {
  const R = 6371; // Radio de la Tierra en km
  const dLat = (loc2.lat - loc1.lat) * Math.PI / 180;
  const dLng = (loc2.lng - loc1.lng) * Math.PI / 180;
  const a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(loc1.lat * Math.PI / 180) * Math.cos(loc2.lat * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};
