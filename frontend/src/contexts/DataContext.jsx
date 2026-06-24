import { createContext, useContext, useState, useEffect } from 'react';
import { mockReports, mockNotifications } from '../data/mockData';

const DataContext = createContext(null);

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData debe usarse dentro de DataProvider');
  }
  return context;
};

// Mapea el reporte del formato del backend Go al formato plano del frontend
const mapBackendReportToFrontend = (savedReport) => {
  return {
    id: savedReport.id,
    userId: savedReport.userID,
    type: savedReport.type,
    typeName: savedReport.typeName,
    category: savedReport.category,
    description: savedReport.description,
    address: savedReport.address,
    location: savedReport.location && savedReport.location.coordinates ? {
      lat: savedReport.location.coordinates[1],
      lng: savedReport.location.coordinates[0]
    } : { lat: 0, lng: 0 },
    photos: savedReport.photos ? savedReport.photos.map(p => p.key) : [],
    status: savedReport.status,
    priority: savedReport.priority,
    assignedTo: savedReport.assignedTo,
    createdAt: savedReport.createdAt,
    updatedAt: savedReport.updatedAt,
    resolvedAt: savedReport.resolvedAt,
    isDuplicate: savedReport.isDuplicate,
    aiAnalysis: savedReport.aiAnalysis
  };
};

export const DataProvider = ({ children }) => {
  const [reports, setReports] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Cargar datos desde la API o usar localStorage como fallback
  useEffect(() => {
    const loadReports = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/reports");
        if (response.ok) {
          const backendReports = await response.json();
          const formatted = backendReports ? backendReports.map(mapBackendReportToFrontend) : [];
          setReports(formatted);
          setLoading(false);
          return;
        }
      } catch (error) {
        console.warn("La API del Backend está inactiva para lectura, usando localStorage:", error);
      }

      // Fallback a localStorage si el backend de Go no responde
      const storedReports = localStorage.getItem('ltc_reports');
      if (storedReports) {
        setReports(JSON.parse(storedReports));
      } else {
        setReports(mockReports);
        localStorage.setItem('ltc_reports', JSON.stringify(mockReports));
      }
      setLoading(false);
    };

    const loadNotifications = () => {
      const storedNotifications = localStorage.getItem('ltc_notifications');
      if (storedNotifications) {
        setNotifications(JSON.parse(storedNotifications));
      } else {
        setNotifications(mockNotifications);
        localStorage.setItem('ltc_notifications', JSON.stringify(mockNotifications));
      }
    };

    loadReports();
    loadNotifications();
  }, []);

  // Guardar reports cuando cambien (solo localmente como backup)
  useEffect(() => {
    if (!loading) {
      localStorage.setItem('ltc_reports', JSON.stringify(reports));
    }
  }, [reports, loading]);

  // Guardar notificaciones cuando cambien
  useEffect(() => {
    if (!loading) {
      localStorage.setItem('ltc_notifications', JSON.stringify(notifications));
    }
  }, [notifications, loading]);

  // Simulación de análisis OWL-ViT en el frontend (para modo offline/localStorage)
  const simulateTreeAIAnalysis = (description) => {
    const descLower = description.toLowerCase();
    
    let treeSize = 'mediano';
    if (descLower.includes('grande') || descLower.includes('gigante') || descLower.includes('enorme') || descLower.includes('tronco')) {
      treeSize = 'grande';
    } else if (descLower.includes('pequeño') || descLower.includes('chico') || descLower.includes('rama') || descLower.includes('ramita') || descLower.includes('gajo')) {
      treeSize = 'pequeño';
    }
    
    let damage = 'ninguno';
    const detectedObjects = [];
    
    if (descLower.includes('cable') || descLower.includes('luz') || descLower.includes('electricidad') || descLower.includes('tensión') || descLower.includes('poste')) {
      damage = 'daño a tendido eléctrico';
      detectedObjects.push({ label: 'cables dañados', confidence: 0.86, box: [45, 10, 80, 50] });
    } else if (descLower.includes('auto') || descLower.includes('vehículo') || descLower.includes('carro') || descLower.includes('camioneta')) {
      damage = 'daño a vehículo';
      detectedObjects.push({ label: 'vehículo dañado', confidence: 0.90, box: [60, 40, 95, 90] });
    } else if (descLower.includes('casa') || descLower.includes('techo') || descLower.includes('propiedad') || descLower.includes('reja')) {
      damage = 'daño a propiedad';
      detectedObjects.push({ label: 'propiedad dañada', confidence: 0.79, box: [30, 50, 75, 95] });
    }
    
    let obstruction = 'ninguno';
    if (descLower.includes('calle') || descLower.includes('avenida') || descLower.includes('calzada') || descLower.includes('tránsito') || descLower.includes('ruta')) {
      obstruction = 'bloqueo de calle';
      detectedObjects.push({ label: 'calle bloqueada', confidence: 0.92, box: [35, 0, 90, 100] });
    } else if (descLower.includes('vereda') || descLower.includes('peatón') || descLower.includes('acera') || descLower.includes('paso')) {
      obstruction = 'bloqueo de vereda';
      detectedObjects.push({ label: 'vereda bloqueada', confidence: 0.85, box: [40, 20, 85, 80] });
    }
    
    let treeBox = [20, 10, 80, 90];
    if (treeSize === 'grande') {
      treeBox = [10, 5, 85, 95];
    } else if (treeSize === 'pequeño') {
      treeBox = [35, 30, 70, 70];
    }
    
    detectedObjects.unshift({
      label: `árbol caído (${treeSize})`,
      confidence: 0.95,
      box: treeBox
    });
    
    let dangerLevel = 'baja';
    if ((obstruction === 'bloqueo de calle' && damage !== 'ninguno') || (treeSize === 'grande' && damage === 'daño a tendido eléctrico')) {
      dangerLevel = 'critica';
    } else if (obstruction === 'bloqueo de calle' || damage === 'daño a tendido eléctrico' || damage === 'daño a vehículo') {
      dangerLevel = 'alta';
    } else if (obstruction === 'bloqueo de vereda' || treeSize === 'grande') {
      dangerLevel = 'media';
    }
    
    const reasons = [];
    reasons.push(`[Simulación OWL-ViT] Se detectó un árbol caído de tamaño ${treeSize}.`);
    if (obstruction === 'bloqueo de calle') {
      reasons.push("Obstruye por completo la calzada vial, interrumpiendo el tránsito vehicular.");
    } else if (obstruction === 'bloqueo de vereda') {
      reasons.push("Bloquea el paso peatonal por la vereda, forzando a transeúntes a bajar a la calle.");
    }
    
    if (damage === 'daño a tendido eléctrico') {
      reasons.push("Se identificaron cables eléctricos cortados/dañados en contacto con las ramas, peligro de descarga.");
    } else if (damage === 'daño a vehículo') {
      reasons.push("El árbol impactó sobre un vehículo estacionado en la vía pública.");
    } else if (damage === 'daño a propiedad') {
      reasons.push("Ramas u horquetas del árbol dañaron estructuras edilicias o linderas.");
    }
    
    const reason = reasons.join(" ");
    
    return {
      performed: true,
      hasFallenTree: true,
      dangerLevel,
      confidence: 0.95,
      reason,
      treeSize,
      obstruction,
      damage,
      objects: detectedObjects
    };
  };

  // Crear nuevo reporte
  const createReport = async (reportData) => {
    // Estructurar el reporte para que sea compatible con el backend de Go y MongoDB
    const backendReport = {
      user_id: reportData.userId, // mapea a user_id en MongoDB
      type: reportData.type,
      typeName: reportData.typeName,
      category: reportData.category,
      description: reportData.description,
      address: reportData.address,
      location: {
        type: "Point",
        coordinates: [reportData.location.lng, reportData.location.lat] // GeoJSON [longitud, latitud]
      },
      photos: reportData.photos ? reportData.photos.map(p => ({ key: p.name || p, url: p.preview || p })) : [],
      status: "pendiente",
      priority: reportData.priority,
      isDuplicate: false
    };

    try {
      // Intentar guardar en la API real de Go
      const response = await fetch("http://localhost:3000/api/reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(backendReport)
      });

      if (response.ok) {
        const savedReport = await response.json();
        const frontendFormattedReport = mapBackendReportToFrontend(savedReport);

        setReports(prev => [frontendFormattedReport, ...prev]);
        return frontendFormattedReport;
      }
    } catch (error) {
      console.warn("La API del Backend está inactiva, usando simulación en localStorage:", error);
    }

    // Fallback: simulación offline usando localStorage si el backend de Go no responde
    let aiAnalysis = null;
    let priority = reportData.priority;
    if (reportData.type === 'arbol' && reportData.photos && reportData.photos.length > 0) {
      aiAnalysis = simulateTreeAIAnalysis(reportData.description);
      // Ajustar prioridad según la IA
      if (aiAnalysis.dangerLevel === 'critica') priority = 'critica';
      else if (aiAnalysis.dangerLevel === 'alta') priority = 'alta';
      else if (aiAnalysis.dangerLevel === 'media') priority = 'media';
      else if (aiAnalysis.dangerLevel === 'baja') priority = 'baja';
    }

    const newReport = {
      id: `rep-${Date.now()}`,
      ...reportData,
      photos: reportData.photos ? reportData.photos.map(p => p.preview || p) : [],
      priority,
      status: 'pendiente',
      assignedTo: null,
      aiAnalysis,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      resolvedAt: null,
      isDuplicate: false
    };

    setReports(prev => [newReport, ...prev]);
    return newReport;
  };


  // Actualizar reporte
  const updateReport = (id, updates) => {
    setReports(prev => prev.map(report =>
      report.id === id
        ? { ...report, ...updates, updatedAt: new Date().toISOString() }
        : report
    ));
  };

  // Asignar reporte a cuadrilla
  const assignReport = (reportId, cuadrillaId) => {
    updateReport(reportId, {
      assignedTo: cuadrillaId,
      status: 'en-proceso'
    });
  };

  // Marcar reporte como resuelto
  const resolveReport = (reportId, resolutionData) => {
    updateReport(reportId, {
      status: 'resuelto',
      resolvedAt: new Date().toISOString(),
      ...resolutionData
    });
  };

  // Marcar reporte como duplicado
  const markAsDuplicate = (reportId) => {
    updateReport(reportId, { isDuplicate: true, status: 'rechazado' });
  };

  // Crear notificación
  const createNotification = (notificationData) => {
    const newNotification = {
      id: `notif-${Date.now()}`,
      ...notificationData,
      createdAt: new Date().toISOString()
    };
    setNotifications(prev => [newNotification, ...prev]);
    return newNotification;
  };

  // Marcar notificación como leída
  const markNotificationAsRead = (notificationId) => {
    setNotifications(prev => prev.map(notif =>
      notif.id === notificationId ? { ...notif, read: true } : notif
    ));
  };

  // Marcar todas las notificaciones como leídas
  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
  };

  // Obtener notificaciones no leídas
  const unreadNotifications = notifications.filter(n => !n.read);

  // Obtener reports por usuario
  const getUserReports = (userId) => {
    return reports.filter(r => r.userId === userId);
  };

  // Obtener reports asignados a cuadrilla
  const getCuadrillaReports = (cuadrillaId) => {
    return reports.filter(r => r.assignedTo === cuadrillaId && r.status !== 'resuelto');
  };

  // Obtener todos los reports (para municipalidad)
  const getAllReports = () => {
    return reports;
  };

  // Obtener report por ID
  const getReportById = (id) => {
    return reports.find(r => r.id === id);
  };

  // Estadísticas para dashboard
  const getStats = () => {
    const total = reports.length;
    const pendientes = reports.filter(r => r.status === 'pendiente').length;
    const enProceso = reports.filter(r => r.status === 'en-proceso').length;
    const resueltos = reports.filter(r => r.status === 'resuelto').length;
    const duplicados = reports.filter(r => r.isDuplicate).length;

    // Tiempo promedio de resolución (en días)
    const resolvedReports = reports.filter(r => r.resolvedAt);
    const avgResolutionTime = resolvedReports.length > 0
      ? resolvedReports.reduce((acc, r) => {
          const created = new Date(r.createdAt);
          const resolved = new Date(r.resolvedAt);
          return acc + (resolved - created) / (1000 * 60 * 60 * 24);
        }, 0) / resolvedReports.length
      : 0;

    // Reportes por categoría
    const byCategory = reports.reduce((acc, r) => {
      acc[r.category] = (acc[r.category] || 0) + 1;
      return acc;
    }, {});

    // Reportes por tipo
    const byType = reports.reduce((acc, r) => {
      acc[r.typeName] = (acc[r.typeName] || 0) + 1;
      return acc;
    }, {});

    return {
      total,
      pendientes,
      enProceso,
      resueltos,
      duplicados,
      avgResolutionTime: avgResolutionTime.toFixed(1),
      byCategory,
      byType
    };
  };

  const value = {
    reports,
    notifications,
    loading,
    createReport,
    updateReport,
    assignReport,
    resolveReport,
    markAsDuplicate,
    createNotification,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    unreadNotifications,
    getUserReports,
    getCuadrillaReports,
    getAllReports,
    getReportById,
    getStats
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};
